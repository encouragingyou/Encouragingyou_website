import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  activateAdminInvitation,
  authenticateAdminPassword,
  completeAdminMfaChallenge,
  performAdminAccessAction,
  performAdminWorkflowAction,
  validateAdminSessionRequest
} from "../src/lib/cms/admin-auth.js";
import {
  adminFixtureAccounts,
  resolveAdminCookieNames
} from "../src/lib/cms/admin-config.js";
import {
  createAdminInvitation,
  getAdminAccountByEmail,
  listAdminAccounts
} from "../src/lib/cms/admin-store.js";
import { generateTotpCode, generateTotpSecret } from "../src/lib/cms/admin-totp.js";

function createHeaders() {
  return new Headers({
    host: "127.0.0.1:4173",
    origin: "http://127.0.0.1:4173",
    referer: "http://127.0.0.1:4173/admin/login/",
    "sec-fetch-site": "same-origin",
    "user-agent": "node-test",
    "accept-language": "en-GB"
  });
}

function createCookieJar(cookieMap) {
  return {
    get(name) {
      const value = cookieMap.get(name);

      return value ? { value } : undefined;
    }
  };
}

test("local admin bootstrap provisions invited local accounts with MFA secrets", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-admin-bootstrap-"));
  const accounts = await listAdminAccounts({
    storageDir,
    env: {
      ADMIN_ENABLE_DEV_BOOTSTRAP: "true"
    },
    deploymentChannel: "local"
  });

  assert.equal(accounts.length, 3);
  assert.ok(accounts.every((account) => account.mfa?.required));
  assert.ok(accounts.every((account) => typeof account.password?.hash === "string"));
});

test("password sign-in requires MFA and resolves into an authenticated opaque session", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-admin-auth-"));
  const publisherFixture = adminFixtureAccounts.find(
    (fixture) => fixture.roleId === "publisher"
  );
  const requestUrl = "http://127.0.0.1:4173/admin/login/";
  const headers = createHeaders();

  assert.ok(publisherFixture);

  const passwordResult = await authenticateAdminPassword(
    {
      email: publisherFixture.email,
      password: publisherFixture.password,
      headers
    },
    {
      storageDir,
      env: {
        ADMIN_ENABLE_DEV_BOOTSTRAP: "true"
      },
      deploymentChannel: "local"
    }
  );

  assert.equal(passwordResult.ok, true);
  assert.equal(passwordResult.state, "mfa-required");

  const mfaResult = await completeAdminMfaChallenge(
    {
      pendingToken: passwordResult.pendingToken,
      code: generateTotpCode({
        secret: publisherFixture.totpSecret
      }),
      headers
    },
    {
      storageDir,
      env: {
        ADMIN_ENABLE_DEV_BOOTSTRAP: "true"
      },
      deploymentChannel: "local"
    }
  );

  assert.equal(mfaResult.ok, true);

  const cookieNames = resolveAdminCookieNames({
    requestUrl,
    headers
  });
  const cookieMap = new Map([[cookieNames.session, mfaResult.sessionToken]]);
  const adminSession = await validateAdminSessionRequest({
    requestUrl,
    headers,
    cookies: createCookieJar(cookieMap),
    storageDir,
    env: {
      ADMIN_ENABLE_DEV_BOOTSTRAP: "true"
    },
    deploymentChannel: "local"
  });

  assert.equal(adminSession.authenticated, true);
  assert.equal(adminSession.roleId, "publisher");
  assert.ok(adminSession.csrfToken);
});

test("invitation activation creates an active account with recovery codes", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-admin-activate-"));
  const headers = createHeaders();
  const invitation = await createAdminInvitation(
    {
      email: "new.editor@example.test",
      displayName: "New Editor",
      roleId: "client-editor",
      issuedByAccountId: "bootstrap-technical-maintainer"
    },
    {
      storageDir,
      deploymentChannel: "local"
    }
  );
  const totpSecret = generateTotpSecret();

  const result = await activateAdminInvitation(
    {
      invitationToken: invitation.rawToken,
      displayName: "New Editor",
      password: "StrongPassphrase54",
      totpSecret,
      totpCode: generateTotpCode({
        secret: totpSecret
      }),
      headers
    },
    {
      storageDir,
      deploymentChannel: "local"
    }
  );

  assert.equal(result.ok, true);
  assert.equal(result.recoveryCodes.length, 8);

  const account = await getAdminAccountByEmail("new.editor@example.test", {
    storageDir,
    deploymentChannel: "local"
  });

  assert.ok(account);
  assert.equal(account.roleId, "client-editor");
  assert.equal(account.state, "active");
});

test("maintainer access actions require a fresh MFA step-up code", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-admin-access-"));
  const maintainerFixture = adminFixtureAccounts.find(
    (fixture) => fixture.roleId === "technical-maintainer"
  );
  const headers = createHeaders();

  assert.ok(maintainerFixture);

  const passwordResult = await authenticateAdminPassword(
    {
      email: maintainerFixture.email,
      password: maintainerFixture.password,
      headers
    },
    {
      storageDir,
      env: {
        ADMIN_ENABLE_DEV_BOOTSTRAP: "true"
      },
      deploymentChannel: "local"
    }
  );
  const mfaResult = await completeAdminMfaChallenge(
    {
      pendingToken: passwordResult.pendingToken,
      code: generateTotpCode({
        secret: maintainerFixture.totpSecret
      }),
      headers
    },
    {
      storageDir,
      env: {
        ADMIN_ENABLE_DEV_BOOTSTRAP: "true"
      },
      deploymentChannel: "local"
    }
  );
  const adminSession = await validateAdminSessionRequest({
    requestUrl: "http://127.0.0.1:4173/admin/security/",
    headers,
    cookies: createCookieJar(
      new Map([
        [
          resolveAdminCookieNames({
            requestUrl: "http://127.0.0.1:4173/admin/security/",
            headers
          }).session,
          mfaResult.sessionToken
        ]
      ])
    ),
    storageDir,
    env: {
      ADMIN_ENABLE_DEV_BOOTSTRAP: "true"
    },
    deploymentChannel: "local"
  });

  const blocked = await performAdminAccessAction(
    {
      adminSession,
      action: "issue-invitation",
      payload: {
        email: "blocked@example.test",
        displayName: "Blocked",
        roleId: "client-editor",
        stepUpCode: "000000"
      },
      requestUrl: "http://127.0.0.1:4173/api/admin/access/",
      headers
    },
    {
      storageDir,
      env: {
        ADMIN_ENABLE_DEV_BOOTSTRAP: "true"
      },
      deploymentChannel: "local"
    }
  );

  assert.equal(blocked.status, 403);

  const allowed = await performAdminAccessAction(
    {
      adminSession,
      action: "issue-invitation",
      payload: {
        email: "allowed@example.test",
        displayName: "Allowed",
        roleId: "client-editor",
        stepUpCode: generateTotpCode({
          secret: maintainerFixture.totpSecret
        })
      },
      requestUrl: "http://127.0.0.1:4173/api/admin/access/",
      headers
    },
    {
      storageDir,
      env: {
        ADMIN_ENABLE_DEV_BOOTSTRAP: "true"
      },
      deploymentChannel: "local"
    }
  );

  assert.equal(allowed.ok, true);
  assert.match(allowed.activationPath, /^\/admin\/activate\//u);
});

test("workflow actions stay role-gated on the server", async () => {
  const clientSession = {
    authenticated: true,
    accountId: "client-1",
    roleId: "client-editor",
    capabilities: ["create-draft", "request-review"]
  };

  const requestReview = await performAdminWorkflowAction({
    adminSession: clientSession,
    action: "request-review",
    documentId: "home-page:default",
    documentTitle: "Homepage",
    headers: createHeaders()
  });
  const forbidden = await performAdminWorkflowAction({
    adminSession: clientSession,
    action: "publish",
    documentId: "home-page:default",
    documentTitle: "Homepage",
    headers: createHeaders()
  });

  assert.equal(requestReview.status, 202);
  assert.equal(forbidden.status, 403);
});

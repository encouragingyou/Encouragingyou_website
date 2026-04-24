import type { APIRoute } from "astro";
import { mkdir } from "node:fs/promises";

import { resolveAnalyticsMode } from "../../lib/analytics/contract.js";
import { resolveAnalyticsStorageDir } from "../../lib/analytics/store.js";
import {
  isAdminCryptoReady,
  resolveAdminOriginUrl,
  resolveAdminPortalEnabled,
  resolveAdminStorageDir
} from "../../lib/cms/admin-config.js";
import { resolveDeploymentContext } from "../../lib/deployment/context.js";
import { resolveEnquiryDeliveryMode } from "../../lib/forms/enquiry-contract.js";
import { resolveEnquiryStorageDir } from "../../lib/server/enquiry-service.js";

export const prerender = false;

async function ensureWritableDirectory(directory: string) {
  try {
    await mkdir(directory, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export const GET: APIRoute = async ({ locals, request }) => {
  const deployment = locals.deployment ?? resolveDeploymentContext();
  const publicSurface = deployment.publicRoutesEnabled;
  const adminSurface = deployment.adminRoutesEnabled;
  const analyticsMode = resolveAnalyticsMode();
  const enquiryDeliveryMode = resolveEnquiryDeliveryMode();
  const enquiryReady = publicSurface
    ? enquiryDeliveryMode === "secure"
      ? await ensureWritableDirectory(
          resolveEnquiryStorageDir({
            deploymentChannel: deployment.channel
          })
        )
      : true
    : null;
  const analyticsReady = publicSurface
    ? analyticsMode === "off"
      ? true
      : await ensureWritableDirectory(
          resolveAnalyticsStorageDir({
            deploymentChannel: deployment.channel
          })
        )
    : null;
  const adminReady = adminSurface
    ? await ensureWritableDirectory(
        resolveAdminStorageDir({
          deploymentChannel: deployment.channel
        })
      )
    : null;
  const adminPortalEnabled = resolveAdminPortalEnabled(globalThis.process?.env);
  const adminCryptoReady = adminSurface
    ? isAdminCryptoReady({
        env: globalThis.process?.env,
        deploymentChannel: deployment.channel
      })
    : null;
  const ok =
    deployment.surface === "admin"
      ? adminReady && adminPortalEnabled && adminCryptoReady
      : Boolean(enquiryReady && analyticsReady);

  return new Response(
    JSON.stringify(
      {
        status: ok ? "ok" : "degraded",
        deployment: {
          channel: deployment.channel,
          surface: deployment.surface,
          releaseId: deployment.releaseId,
          releaseSha: deployment.releaseSha,
          releaseCreatedAt: deployment.releaseCreatedAt,
          publicSiteUrl: deployment.publicSiteUrl,
          adminSiteUrl:
            deployment.adminSiteUrl ??
            (deployment.adminRoutesEnabled
              ? resolveAdminOriginUrl({
                  requestUrl: request.url,
                  headers: request.headers
                })
              : null)
        },
        indexing: {
          searchAllowed: deployment.searchIndexingAllowed
        },
        surface: {
          publicRoutesEnabled: deployment.publicRoutesEnabled,
          adminRoutesEnabled: deployment.adminRoutesEnabled
        },
        analytics: {
          mode: analyticsMode
        },
        enquiry: {
          deliveryMode: enquiryDeliveryMode
        },
        admin: {
          portalEnabled: adminPortalEnabled,
          cryptoReady: adminCryptoReady
        },
        storage: {
          enquiryReady,
          analyticsReady,
          adminReady
        }
      },
      null,
      2
    ),
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8"
      }
    }
  );
};

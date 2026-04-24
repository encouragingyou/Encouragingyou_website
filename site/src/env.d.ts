/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly ADMIN_ADDITIONAL_ALLOWED_ORIGINS?: string;
  readonly ADMIN_ENABLE_DEV_BOOTSTRAP?: string;
  readonly ADMIN_PORTAL_ENABLED?: string;
  readonly ADMIN_ORIGIN_URL?: string;
  readonly ADMIN_PENDING_MFA_MINUTES?: string;
  readonly ADMIN_INVITATION_EXPIRY_HOURS?: string;
  readonly ADMIN_LOGIN_LOCKOUT_MINUTES?: string;
  readonly ADMIN_MAX_CONCURRENT_SESSIONS?: string;
  readonly ADMIN_MAX_FAILED_PASSWORDS?: string;
  readonly ADMIN_PASSWORD_MIN_LENGTH?: string;
  readonly ADMIN_RECENT_AUTH_MINUTES?: string;
  readonly ADMIN_SESSION_ABSOLUTE_HOURS?: string;
  readonly ADMIN_SESSION_IDLE_MINUTES?: string;
  readonly ADMIN_STORAGE_DIR?: string;
  readonly ADMIN_TOTP_ENCRYPTION_KEYS?: string;
  readonly ANALYTICS_MODE?: "off" | "statistical" | "consent";
  readonly ANALYTICS_STORAGE_DIR?: string;
  readonly DEPLOYMENT_CHANNEL?: "local" | "ci" | "preview" | "production";
  readonly DEPLOYMENT_SURFACE?: "shared" | "public" | "admin";
  readonly ENQUIRY_DELIVERY_MODE?: "secure" | "email";
  readonly ENQUIRY_STORAGE_DIR?: string;
  readonly RELEASE_CREATED_AT?: string;
  readonly RELEASE_ID?: string;
  readonly RELEASE_SHA?: string;
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    admin?: {
      enabled: boolean;
      authenticated: boolean;
      accountId: string | null;
      email: string | null;
      displayName: string | null;
      roleId: "client-editor" | "publisher" | "technical-maintainer" | string;
      roleTitle: string;
      roleDescription: string;
      capabilities: string[];
      restrictions: string[];
      boundaryMode: string;
      authReadiness: string;
      reason: string;
      csrfToken: string | null;
      mfaRequired: boolean;
      lastAuthenticatedAt: string | null;
      sessionId: string | null;
    };
    deployment?: {
      channel: "local" | "ci" | "preview" | "production";
      surface: "shared" | "public" | "admin";
      adminRoutesEnabled: boolean;
      adminSiteUrl: string | null;
      isAdminSurface: boolean;
      isPreview: boolean;
      isProduction: boolean;
      isPublicSurface: boolean;
      label: string;
      publicRoutesEnabled: boolean;
      publicSiteUrl: string;
      releaseCreatedAt: string | null;
      releaseId: string;
      releaseSha: string | null;
      searchIndexingAllowed: boolean;
      surfaceOriginUrl: string;
      shortSha: string | null;
      showDeploymentBanner: boolean;
    };
    requestHeaders?: Headers;
    requestCookies?: string;
  }
}

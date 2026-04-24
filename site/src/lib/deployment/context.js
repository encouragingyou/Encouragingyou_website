import siteSettings from "../../content/siteSettings/default.json" with { type: "json" };

export const deploymentChannels = ["local", "ci", "preview", "production"];
export const deploymentSurfaces = ["shared", "public", "admin"];

function normalizeAbsoluteUrl(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  try {
    return new URL(normalized).toString();
  } catch {
    return null;
  }
}

function normalizeIsoDate(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeChannel(value) {
  return deploymentChannels.includes(value) ? value : null;
}

function normalizeSurface(value) {
  return deploymentSurfaces.includes(value) ? value : null;
}

export function resolveDeploymentChannel({
  deploymentChannel = globalThis.process?.env?.DEPLOYMENT_CHANNEL,
  isPullRequest = globalThis.process?.env?.IS_PULL_REQUEST,
  isRender = globalThis.process?.env?.RENDER,
  isVercel = globalThis.process?.env?.VERCEL,
  vercelEnv = globalThis.process?.env?.VERCEL_ENV
} = {}) {
  if (isPullRequest === "true" || vercelEnv === "preview") {
    return "preview";
  }

  const explicitChannel = normalizeChannel(deploymentChannel);

  if (explicitChannel) {
    return explicitChannel;
  }

  if (
    isRender === "true" ||
    vercelEnv === "production" ||
    isVercel === "1" ||
    isVercel === "true"
  ) {
    return "production";
  }

  return "local";
}

export function resolveDeploymentSurface({
  deploymentSurface = globalThis.process?.env?.DEPLOYMENT_SURFACE,
  deploymentChannel = resolveDeploymentChannel(),
  isRender = globalThis.process?.env?.RENDER,
  isVercel = globalThis.process?.env?.VERCEL
} = {}) {
  const explicitSurface = normalizeSurface(deploymentSurface);

  if (explicitSurface) {
    return explicitSurface;
  }

  if (deploymentChannel === "local" || deploymentChannel === "ci") {
    return "shared";
  }

  if (isRender === "true" || isVercel === "1" || isVercel === "true") {
    return "public";
  }

  return "shared";
}

export function resolvePublicSiteUrl({
  siteUrl = globalThis.process?.env?.SITE_URL,
  renderExternalUrl = globalThis.process?.env?.RENDER_EXTERNAL_URL,
  vercelProjectProductionUrl = globalThis.process?.env?.VERCEL_PROJECT_PRODUCTION_URL,
  vercelUrl = globalThis.process?.env?.VERCEL_URL
} = {}) {
  return (
    normalizeAbsoluteUrl(siteUrl) ??
    normalizeAbsoluteUrl(renderExternalUrl) ??
    normalizeAbsoluteUrl(
      vercelProjectProductionUrl ? `https://${vercelProjectProductionUrl}` : null
    ) ??
    normalizeAbsoluteUrl(vercelUrl ? `https://${vercelUrl}` : null) ??
    siteSettings.siteUrl
  );
}

export function resolveAdminSiteUrl({
  adminOriginUrl = globalThis.process?.env?.ADMIN_ORIGIN_URL,
  renderExternalUrl = globalThis.process?.env?.RENDER_EXTERNAL_URL,
  deploymentSurface = resolveDeploymentSurface()
} = {}) {
  return (
    normalizeAbsoluteUrl(adminOriginUrl) ??
    (deploymentSurface === "admin" ? normalizeAbsoluteUrl(renderExternalUrl) : null)
  );
}

export function resolveReleaseSha({
  releaseSha = globalThis.process?.env?.RELEASE_SHA,
  renderGitCommit = globalThis.process?.env?.RENDER_GIT_COMMIT,
  githubSha = globalThis.process?.env?.GITHUB_SHA
} = {}) {
  const resolvedValue = releaseSha ?? renderGitCommit ?? githubSha ?? null;

  return typeof resolvedValue === "string" && resolvedValue.trim()
    ? resolvedValue.trim()
    : null;
}

export function resolveReleaseId({
  releaseId = globalThis.process?.env?.RELEASE_ID,
  releaseSha = resolveReleaseSha()
} = {}) {
  if (typeof releaseId === "string" && releaseId.trim()) {
    return releaseId.trim();
  }

  if (releaseSha) {
    return releaseSha.slice(0, 12);
  }

  return "local-dev";
}

export function resolveReleaseCreatedAt({
  releaseCreatedAt = globalThis.process?.env?.RELEASE_CREATED_AT
} = {}) {
  return normalizeIsoDate(releaseCreatedAt);
}

export function shouldAllowSearchIndexing(
  channel = resolveDeploymentChannel(),
  surface = resolveDeploymentSurface()
) {
  if (surface === "admin") {
    return false;
  }

  return channel === "local" || channel === "production";
}

export function shouldExposePublicRoutes(surface = resolveDeploymentSurface()) {
  return surface === "shared" || surface === "public";
}

export function shouldExposeAdminRoutes(surface = resolveDeploymentSurface()) {
  return surface === "shared" || surface === "admin";
}

export function shouldShowDeploymentBanner(
  channel = resolveDeploymentChannel(),
  surface = resolveDeploymentSurface()
) {
  if (surface === "admin") {
    return channel === "preview" || channel === "ci";
  }

  return channel === "preview" || channel === "ci";
}

export function getDeploymentLabel(
  channel = resolveDeploymentChannel(),
  surface = resolveDeploymentSurface()
) {
  const adminPrefix = surface === "admin" ? "Admin " : "";

  switch (channel) {
    case "ci":
      return `${adminPrefix}CI build`;
    case "preview":
      return `${adminPrefix}Preview build`;
    case "production":
      return `${adminPrefix}Production`;
    default:
      return `${adminPrefix}Local build`;
  }
}

export function resolveDeploymentContext(overrides = {}) {
  const channel = resolveDeploymentChannel(overrides);
  const surface = resolveDeploymentSurface({
    ...overrides,
    deploymentChannel: channel
  });
  const releaseSha = resolveReleaseSha(overrides);
  const releaseId = resolveReleaseId({
    releaseId: overrides.releaseId,
    releaseSha
  });
  const releaseCreatedAt = resolveReleaseCreatedAt(overrides);
  const publicSiteUrl = resolvePublicSiteUrl(overrides);
  const adminSiteUrl = resolveAdminSiteUrl({
    ...overrides,
    deploymentSurface: surface
  });

  return {
    channel,
    surface,
    label: getDeploymentLabel(channel, surface),
    releaseId,
    releaseSha,
    shortSha: releaseSha ? releaseSha.slice(0, 7) : null,
    releaseCreatedAt,
    publicSiteUrl,
    adminSiteUrl,
    surfaceOriginUrl:
      surface === "admin" ? (adminSiteUrl ?? publicSiteUrl) : publicSiteUrl,
    searchIndexingAllowed: shouldAllowSearchIndexing(channel, surface),
    showDeploymentBanner: shouldShowDeploymentBanner(channel, surface),
    publicRoutesEnabled: shouldExposePublicRoutes(surface),
    adminRoutesEnabled: shouldExposeAdminRoutes(surface),
    isProduction: channel === "production",
    isPreview: channel === "preview",
    isAdminSurface: surface === "admin",
    isPublicSurface: surface === "public"
  };
}

export function getDeploymentHeaders(context = resolveDeploymentContext()) {
  const headers = {
    "X-Deployment-Channel": context.channel,
    "X-Deployment-Surface": context.surface,
    "X-Release-Id": context.releaseId
  };

  if (context.releaseSha) {
    headers["X-Release-Sha"] = context.releaseSha;
  }

  if (context.releaseCreatedAt) {
    headers["X-Release-Created-At"] = context.releaseCreatedAt;
  }

  return headers;
}

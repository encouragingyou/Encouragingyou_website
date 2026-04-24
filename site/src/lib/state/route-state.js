export function normalizePathname(pathname) {
  if (!pathname) {
    return "/";
  }

  const basePath = pathname.split(/[?#]/u)[0].trim() || "/";
  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/gu, "/");

  return collapsed !== "/" && collapsed.endsWith("/")
    ? collapsed.slice(0, -1)
    : collapsed;
}

export function isActivePath(currentPath, href) {
  const normalizedCurrent = normalizePathname(currentPath);
  const normalizedTarget = normalizePathname(href);

  if (normalizedTarget === "/") {
    return normalizedCurrent === "/";
  }

  return (
    normalizedCurrent === normalizedTarget ||
    normalizedCurrent.startsWith(`${normalizedTarget}/`)
  );
}

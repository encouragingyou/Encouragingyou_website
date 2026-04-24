import cmsScope from "../../content/cmsScope/default.json" with { type: "json" };

const routeFieldRegistryIndex = new Map(
  cmsScope.routeFieldRegistry.map((entry) => [entry.id, entry])
);
const roleIndex = new Map(cmsScope.roles.map((role) => [role.id, role]));
const mutationPrimitiveIndex = new Map(
  cmsScope.mutationPrimitives.map((primitive) => [primitive.id, primitive])
);

export function getCmsScope() {
  return cmsScope;
}

export function listCmsRouteFieldEntries() {
  return cmsScope.routeFieldRegistry;
}

export function getCmsRouteFieldEntry(routeId) {
  return routeFieldRegistryIndex.get(routeId) ?? null;
}

export function listCmsSeedSources() {
  return cmsScope.seedSources;
}

export function getCmsRole(roleId) {
  return roleIndex.get(roleId) ?? null;
}

export function roleCan(roleId, capability) {
  const role = getCmsRole(roleId);

  return Boolean(role?.can.includes(capability));
}

export function getMutationPrimitive(primitiveId) {
  return mutationPrimitiveIndex.get(primitiveId) ?? null;
}

export function listSurfacesByOwnership(ownershipClass) {
  return cmsScope.routeFieldRegistry.flatMap((entry) =>
    entry.surfaces
      .filter((surface) => surface.ownershipClass === ownershipClass)
      .map((surface) => ({
        routeId: entry.id,
        routeLabel: entry.label,
        routePattern: entry.routePattern,
        ...surface
      }))
  );
}

export function getPublicCmsPublicationContract() {
  return {
    publicOriginWriteCapability: cmsScope.adminBoundary.publicOriginWriteCapability,
    publicReadModel: cmsScope.adminBoundary.publicReadModel,
    draftIsolation: cmsScope.adminBoundary.draftIsolation,
    approvalIsolation: cmsScope.adminBoundary.approvalIsolation,
    sessionBoundary: cmsScope.adminBoundary.sessionBoundary,
    deploymentBoundary: cmsScope.adminBoundary.deploymentBoundary,
    rollbackBoundary: cmsScope.adminBoundary.rollbackBoundary
  };
}

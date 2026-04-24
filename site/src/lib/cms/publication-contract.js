import { getCmsScope, getPublicCmsPublicationContract } from "./scope.js";

export function assertPublicSiteIsReadOnly() {
  return getPublicCmsPublicationContract().publicOriginWriteCapability === "forbidden";
}

export function listCmsForbiddenCapabilities() {
  return getCmsScope().forbiddenCapabilities;
}

export function getAdminBoundaryRequirements() {
  return {
    writeOrigin: getCmsScope().adminBoundary.writeOrigin,
    unverifiedOperationalRequirements:
      getCmsScope().adminBoundary.unverifiedOperationalRequirements
  };
}

import resilienceStates from "../../content/resilienceStates/default.json" with { type: "json" };

const taxonomyIndex = new Map(
  resilienceStates.taxonomy.map((state) => [state.id, state])
);
const surfaceIndex = new Map(
  resilienceStates.surfaces.map((surface) => [surface.id, surface])
);

function requireValue(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message);
  }

  return value;
}

export function getResilienceStateContent() {
  return resilienceStates;
}

export function getResilienceTaxonomyState(id) {
  return taxonomyIndex.get(id) ?? null;
}

export function getResilienceSurface(id) {
  return surfaceIndex.get(id) ?? null;
}

export function requireResilienceSurface(id) {
  return requireValue(getResilienceSurface(id), `Unknown resilience surface id: ${id}`);
}

export function getResilienceSurfaceText(id) {
  const surface = requireResilienceSurface(id);

  return surface.summary ?? surface.body ?? surface.title;
}

export function listResilienceSurfaces() {
  return resilienceStates.surfaces;
}

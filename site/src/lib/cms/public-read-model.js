import cmsPublicReadModel from "../../data/generated/cms-public-read-model.json" with { type: "json" };

export function getCmsPublicReadModel() {
  return cmsPublicReadModel;
}

export function getCmsPublishedCollections() {
  return cmsPublicReadModel.collections;
}

export function getPublishedCmsCollection(collectionName) {
  return getCmsPublishedCollections()[collectionName] ?? null;
}

export function getCmsPublicationContract() {
  return cmsPublicReadModel.publicationContract;
}

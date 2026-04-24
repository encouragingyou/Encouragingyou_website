import cmsWorkflow from "../../content/cmsWorkflow/default.json" with { type: "json" };

const stateIndex = new Map(cmsWorkflow.states.map((state) => [state.id, state]));
const transitionIndex = new Map(
  cmsWorkflow.transitions.map((transition) => [transition.id, transition])
);

export function getCmsWorkflow() {
  return cmsWorkflow;
}

export function listCmsStates() {
  return cmsWorkflow.states;
}

export function getCmsState(stateId) {
  return stateIndex.get(stateId) ?? null;
}

export function isCmsPublicState(stateId) {
  return Boolean(getCmsState(stateId)?.publicVisible);
}

export function isCmsTerminalState(stateId) {
  return Boolean(getCmsState(stateId)?.terminal);
}

export function listCmsTransitions() {
  return cmsWorkflow.transitions;
}

export function getCmsTransition(transitionId) {
  return transitionIndex.get(transitionId) ?? null;
}

export function listTransitionsFromState(stateId) {
  return cmsWorkflow.transitions.filter((transition) => transition.from === stateId);
}

export function listTransitionsForRole(roleId) {
  return cmsWorkflow.transitions.filter((transition) =>
    transition.roles.includes(roleId)
  );
}

export function canRoleTransitionState({ roleId, fromState, toState }) {
  return cmsWorkflow.transitions.some(
    (transition) =>
      transition.from === fromState &&
      transition.to === toState &&
      transition.roles.includes(roleId)
  );
}

export function requirePublishAtForState(stateId) {
  return stateId === "scheduled";
}

export function getPublicReadModelState() {
  return cmsWorkflow.publicationRules.publicReadModelState;
}

export function canStateEnterPublicReadModel(stateId) {
  return stateId === getPublicReadModelState();
}

export function buildDocumentId(documentTypeId, recordKey) {
  return `${documentTypeId}:${recordKey}`;
}

export function buildRevisionId(documentId, version) {
  return `${documentId}@v${version}`;
}

export function getRollbackTransition() {
  return cmsWorkflow.transitions.find(
    (transition) => transition.id === "superseded-to-published"
  );
}

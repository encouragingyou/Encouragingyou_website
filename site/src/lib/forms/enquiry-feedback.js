import { getResilienceSurfaceText } from "../content/resilience-state.js";

const enquiryFeedbackSurfaceByCode = {
  "invalid-surface": "form-reload-required",
  "invalid-origin": "form-reload-required",
  "invalid-context": "form-context-expired",
  "invalid-render-time": "form-reload-required",
  "origin-blocked": "form-reload-required",
  "honeypot-blocked": "form-reload-required",
  "timing-blocked": "form-reload-required",
  "validation-error": "form-validation-error",
  "rate-limited": "form-rate-limited",
  "storage-error": "form-submission-error"
};

export function getEnquiryFeedbackMessage(code, successMessage, referenceId) {
  if (code === "sent") {
    return referenceId ? `${successMessage} Reference ${referenceId}.` : successMessage;
  }

  return getResilienceSurfaceText(
    enquiryFeedbackSurfaceByCode[code] ?? "form-submission-error"
  );
}

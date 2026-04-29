import {
  SUPPORT_FORM_FIELD_ORDER,
  normalizeSupportFormPayload,
  validateSupportForm
} from "../state/support-form.js";

const MOBILE_NAV_MEDIA = "(max-width: 63.99rem)";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";
const HEADER_SCROLL_THRESHOLD = 12;
const NAV_CLOSE_DELAY_MS = 240;
const INITIAL_REVEAL_VIEWPORT_RATIO = 0.88;

function createNoopAnalyticsClient() {
  return {
    enabled: false,
    trackFormStart() {},
    trackFormValidationFailure() {}
  };
}

async function hydrateAnalyticsClient(documentRef, analyticsClient) {
  if (documentRef.documentElement.dataset.analyticsCollection !== "true") {
    return analyticsClient;
  }

  try {
    const { createAnalyticsClient } = await import("../analytics/client.js");

    Object.assign(analyticsClient, createAnalyticsClient(documentRef));
  } catch {
    // Analytics must never block the core UI layer.
  }

  return analyticsClient;
}

function setMotionPreference(documentRef, mediaQuery) {
  if (!mediaQuery) {
    return;
  }

  const syncPreference = () => {
    documentRef.documentElement.dataset.motion = mediaQuery.matches ? "reduced" : "full";
  };

  syncPreference();
  mediaQuery.addEventListener?.("change", syncPreference);
}

function setupStickyHeader(documentRef) {
  const header = documentRef.querySelector("[data-nav-shell]");
  const windowRef = documentRef.defaultView;

  if (!(header instanceof HTMLElement) || !windowRef) {
    return;
  }

  let frameId = 0;

  const syncScrollState = () => {
    const isScrolled = windowRef.scrollY > HEADER_SCROLL_THRESHOLD;

    header.dataset.headerScrolled = isScrolled ? "true" : "false";
    documentRef.documentElement.dataset.headerScrolled = header.dataset.headerScrolled;
    frameId = 0;
  };

  const queueSync = () => {
    if (frameId) {
      return;
    }

    frameId = windowRef.requestAnimationFrame(syncScrollState);
  };

  syncScrollState();
  windowRef.addEventListener("scroll", queueSync, { passive: true });
  windowRef.addEventListener("resize", queueSync);
}

function setPanelInteractivity(panel, isInteractive) {
  panel.toggleAttribute("aria-hidden", !isInteractive);

  if ("inert" in panel) {
    panel.inert = !isInteractive;
  }
}

function setupPrimaryNavigation(documentRef) {
  const shell = documentRef.querySelector("[data-nav-shell]");
  const toggle = shell?.querySelector("[data-nav-toggle]");
  const panel = shell?.querySelector("[data-nav-panel]");
  const primaryNavigation = shell?.querySelector("#primary-navigation");
  const windowRef = documentRef.defaultView;

  if (
    !(shell instanceof HTMLElement) ||
    !(toggle instanceof HTMLElement) ||
    !(panel instanceof HTMLElement) ||
    !(primaryNavigation instanceof HTMLElement) ||
    !windowRef?.matchMedia
  ) {
    return;
  }

  const mediaQuery = windowRef.matchMedia(MOBILE_NAV_MEDIA);
  const toggleLabel = toggle.querySelector("[data-nav-toggle-label]");
  let closeTimer = 0;

  const setToggleState = (isExpanded) => {
    toggle.setAttribute("aria-expanded", String(isExpanded));
    toggle.dataset.toggleState = isExpanded && mediaQuery.matches ? "open" : "closed";

    const label = isExpanded && mediaQuery.matches ? "Close" : "Menu";

    if (toggleLabel instanceof HTMLElement) {
      toggleLabel.textContent = label;
      return;
    }

    toggle.textContent = label;
  };

  const setSharedState = (nextState) => {
    shell.dataset.navState = nextState;
    documentRef.documentElement.dataset.navState = nextState;
  };

  const finalizeMobileClosed = () => {
    setSharedState("closed");
    panel.hidden = true;
    setPanelInteractivity(panel, false);
    setToggleState(false);
  };

  const focusSkipTarget = (target, hash) => {
    if (windowRef.location.hash !== hash) {
      windowRef.location.hash = hash.slice(1);
    } else {
      target.scrollIntoView({ block: "start" });
    }

    windowRef.requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
    });
  };

  const focusPrimaryNavigationTarget = () => {
    const firstPrimaryLink = primaryNavigation.querySelector("a[href]");
    const focusTarget =
      firstPrimaryLink instanceof HTMLElement ? firstPrimaryLink : primaryNavigation;
    focusSkipTarget(focusTarget, "#primary-navigation");
  };

  const openMobilePanel = ({ onOpen } = {}) => {
    windowRef.clearTimeout(closeTimer);
    panel.hidden = false;
    setPanelInteractivity(panel, true);
    setSharedState("opening");
    setToggleState(true);
    windowRef.requestAnimationFrame(() => {
      setSharedState("open");
      onOpen?.();
    });
  };

  const closeMobilePanel = ({ restoreFocus = false } = {}) => {
    windowRef.clearTimeout(closeTimer);
    setSharedState("closing");
    setPanelInteractivity(panel, false);
    setToggleState(false);
    closeTimer = windowRef.setTimeout(() => {
      finalizeMobileClosed();

      if (restoreFocus) {
        toggle.focus();
      }
    }, NAV_CLOSE_DELAY_MS);
  };

  const syncViewport = () => {
    windowRef.clearTimeout(closeTimer);
    shell.dataset.navMode = mediaQuery.matches ? "mobile" : "desktop";

    if (mediaQuery.matches) {
      toggle.hidden = false;

      if (shell.dataset.navState === "open" || shell.dataset.navState === "opening") {
        panel.hidden = false;
        setPanelInteractivity(panel, true);
        setSharedState("open");
        setToggleState(true);
        return;
      }

      finalizeMobileClosed();
      return;
    }

    toggle.hidden = true;
    panel.hidden = false;
    setPanelInteractivity(panel, true);
    setSharedState("open");
    setToggleState(true);
  };

  toggle.addEventListener("click", () => {
    if (!mediaQuery.matches) {
      return;
    }

    if (shell.dataset.navState === "open" || shell.dataset.navState === "opening") {
      closeMobilePanel();
      return;
    }

    openMobilePanel();
  });

  documentRef.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const skipLink = event.target.closest('.skip-links a[href^="#"]');

    if (!skipLink) {
      return;
    }

    const hash = skipLink.getAttribute("href");

    if (!hash || hash === "#") {
      return;
    }

    const target = documentRef.querySelector(hash);

    if (!(target instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();

    if (hash !== "#primary-navigation" || !mediaQuery.matches) {
      focusSkipTarget(target, hash);
      return;
    }

    if (shell.dataset.navState === "open" || shell.dataset.navState === "opening") {
      focusPrimaryNavigationTarget();
      return;
    }

    openMobilePanel({ onOpen: focusPrimaryNavigationTarget });
  });

  panel.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => {
      if (mediaQuery.matches) {
        closeMobilePanel();
      }
    });
  });

  documentRef.addEventListener("click", (event) => {
    if (
      !mediaQuery.matches ||
      shell.dataset.navState !== "open" ||
      shell.dataset.navState === "closing" ||
      !(event.target instanceof Node) ||
      (event.target instanceof Element && event.target.closest(".skip-links")) ||
      shell.contains(event.target)
    ) {
      return;
    }

    closeMobilePanel({ restoreFocus: true });
  });

  documentRef.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      (shell.dataset.navState === "open" || shell.dataset.navState === "opening") &&
      mediaQuery.matches
    ) {
      closeMobilePanel({ restoreFocus: true });
    }
  });

  mediaQuery.addEventListener?.("change", syncViewport);
  syncViewport();
}

function resolveFieldState(field) {
  if (!(field instanceof HTMLElement)) {
    return "default";
  }

  if (field.hasAttribute("disabled")) {
    return "disabled";
  }

  if (field.getAttribute("aria-invalid") === "true") {
    return "invalid";
  }

  if (field instanceof HTMLInputElement && field.type === "checkbox") {
    return field.checked ? "filled" : "default";
  }

  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof HTMLSelectElement
  ) {
    return field.value.trim() ? "filled" : "default";
  }

  return "default";
}

function syncFieldState(field) {
  if (!(field instanceof HTMLElement)) {
    return;
  }

  const fieldWrap = field.closest(".form-field");

  fieldWrap?.setAttribute("data-field-state", resolveFieldState(field));
}

function setFieldError(form, fieldName, message) {
  const field = form.elements.namedItem(fieldName);
  const errorNode = form.querySelector(`[data-field-error="${fieldName}"]`);
  const fieldWrap = field instanceof HTMLElement ? field.closest(".form-field") : null;

  if (!(field instanceof HTMLElement) || !errorNode) {
    return;
  }

  const errorId = errorNode.id;
  const describedBy = new Set(
    (field.getAttribute("aria-describedby") ?? "").split(/\s+/u).filter(Boolean)
  );

  if (message) {
    field.setAttribute("aria-invalid", "true");
    fieldWrap?.setAttribute("data-field-state", "invalid");
    describedBy.add(errorId);
    field.setAttribute("aria-describedby", [...describedBy].join(" "));
    errorNode.hidden = false;
    errorNode.textContent = message;
    return;
  }

  field.removeAttribute("aria-invalid");
  describedBy.delete(errorId);

  if (describedBy.size > 0) {
    field.setAttribute("aria-describedby", [...describedBy].join(" "));
  } else {
    field.removeAttribute("aria-describedby");
  }

  errorNode.hidden = true;
  errorNode.textContent = "";
  syncFieldState(field);
}

function setFormStatus(form, status, message, tone = "neutral") {
  const statusNode = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("[data-form-submit]");
  const submitButtonLabel = submitButton?.querySelector(".button__label") ?? submitButton;

  form.dataset.formState = status;
  form.dataset.resilienceState =
    status === "submitting"
      ? "loading"
      : status === "success"
        ? "success"
        : status === "invalid"
          ? "validation-error"
          : status === "error" || status === "spam-blocked" || status === "rate-limited"
            ? "submission-error"
            : "idle";

  if (statusNode instanceof HTMLElement) {
    statusNode.hidden = !message;
    statusNode.dataset.state = status;
    statusNode.dataset.resilienceState = form.dataset.resilienceState ?? "idle";
    statusNode.dataset.tone = tone;
    statusNode.dataset.visible = message ? "true" : "false";
    statusNode.textContent = message;
  }

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = status === "submitting";
    submitButton.toggleAttribute("aria-busy", status === "submitting");
    submitButton.dataset.buttonState = status === "submitting" ? "loading" : "default";
    submitButtonLabel.textContent =
      status === "submitting"
        ? "Sending message..."
        : (submitButton.dataset.idleLabel ?? "Send message");
  }
}

async function submitSupportForm(form, submissionErrorMessage) {
  const response = await fetch(form.action, {
    method: form.method || "post",
    mode: "same-origin",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json"
    },
    body: new FormData(form)
  });
  const result = await response.json().catch(() => ({
    ok: false,
    state: "error",
    code: "storage-error",
    tone: "error",
    message: submissionErrorMessage
  }));

  if (!response.ok || result.ok === false) {
    throw result;
  }

  return result;
}

function resolveValidationErrorCategory(errors) {
  const failingFields = SUPPORT_FORM_FIELD_ORDER.filter((fieldName) => errors[fieldName]);

  if (failingFields.length === 0) {
    return "unknown";
  }

  if (failingFields.length > 1) {
    return "multi-field";
  }

  return failingFields[0];
}

function setupSupportForm(form, analyticsClient) {
  const reasonOptions = JSON.parse(form.dataset.reasonOptions ?? "[]");
  const submitButton = form.querySelector("[data-form-submit]");
  const invalidMessage =
    form.dataset.invalidMessage ??
    "Check the highlighted fields before sending your message.";
  const submittingMessage = form.dataset.submittingMessage ?? "Sending your message...";
  const submissionErrorMessage =
    form.dataset.submissionErrorMessage ??
    "Please try again or use the email link below so you are not left at a dead end.";
  const surfaceId = form.dataset.surfaceId ?? "support-general";

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.dataset.idleLabel = submitButton.textContent ?? "Send message";
  }

  form.noValidate = true;

  const clearFieldError = (fieldName) => {
    setFieldError(form, fieldName, "");

    if (
      form.dataset.formState === "invalid" ||
      form.dataset.formState === "error" ||
      form.dataset.formState === "success"
    ) {
      setFormStatus(form, "idle", "");
    }
  };

  SUPPORT_FORM_FIELD_ORDER.forEach((fieldName) => {
    const field = form.elements.namedItem(fieldName);
    syncFieldState(field);
    field?.addEventListener("focus", () => analyticsClient?.trackFormStart(surfaceId), {
      once: true
    });
    field?.addEventListener("input", () => clearFieldError(fieldName));
    field?.addEventListener("change", () => clearFieldError(fieldName));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = normalizeSupportFormPayload(new FormData(form), reasonOptions);
    const validation = validateSupportForm(payload, reasonOptions);

    SUPPORT_FORM_FIELD_ORDER.forEach((fieldName) => {
      setFieldError(form, fieldName, validation.errors[fieldName] ?? "");
    });

    if (!validation.isValid) {
      const firstInvalidFieldName = SUPPORT_FORM_FIELD_ORDER.find(
        (fieldName) => validation.errors[fieldName]
      );

      const firstInvalidField = firstInvalidFieldName
        ? form.elements.namedItem(firstInvalidFieldName)
        : null;

      setFormStatus(form, "invalid", invalidMessage, "error");
      analyticsClient?.trackFormValidationFailure(
        surfaceId,
        resolveValidationErrorCategory(validation.errors)
      );

      if (firstInvalidField instanceof HTMLElement) {
        firstInvalidField.focus();
      }

      return;
    }

    setFormStatus(form, "submitting", submittingMessage, "neutral");

    try {
      const result = await submitSupportForm(form, submissionErrorMessage);
      form.reset();
      SUPPORT_FORM_FIELD_ORDER.forEach((fieldName) => {
        syncFieldState(form.elements.namedItem(fieldName));
      });
      setFormStatus(form, result.state ?? "success", result.message, result.tone);
    } catch (error) {
      const fieldErrors = error?.fieldErrors ?? {};

      SUPPORT_FORM_FIELD_ORDER.forEach((fieldName) => {
        setFieldError(form, fieldName, fieldErrors[fieldName] ?? "");
      });

      const firstInvalidFieldName = SUPPORT_FORM_FIELD_ORDER.find(
        (fieldName) => fieldErrors[fieldName]
      );
      const firstInvalidField = firstInvalidFieldName
        ? form.elements.namedItem(firstInvalidFieldName)
        : null;
      const status =
        Object.keys(fieldErrors).length > 0 ? "invalid" : (error?.state ?? "error");
      const statusMessage =
        typeof error?.message === "string" &&
        (error?.code || error?.state || Object.keys(fieldErrors).length > 0)
          ? error.message
          : submissionErrorMessage;

      setFormStatus(form, status, statusMessage, error?.tone ?? "error");

      if (firstInvalidField instanceof HTMLElement) {
        firstInvalidField.focus();
      }
    }
  });
}

function setupDisclosureState(documentRef) {
  documentRef.querySelectorAll("[data-disclosure-item]").forEach((item) => {
    if (!(item instanceof HTMLDetailsElement)) {
      return;
    }

    const syncState = () => {
      item.dataset.disclosureState = item.open ? "expanded" : "collapsed";
    };

    syncState();
    item.addEventListener("toggle", syncState);
  });
}

function isWithinInitialViewport(element, windowRef) {
  const bounds = element.getBoundingClientRect();

  return (
    bounds.bottom >= 0 &&
    bounds.top <= windowRef.innerHeight * INITIAL_REVEAL_VIEWPORT_RATIO
  );
}

function setupInViewMotion(documentRef) {
  const windowRef = documentRef.defaultView;
  const root = documentRef.documentElement;
  const revealTargets = [
    ...documentRef.querySelectorAll('[data-motion~="reveal"]')
  ].filter((target) => target instanceof HTMLElement);

  if (!windowRef || revealTargets.length === 0) {
    root.dataset.motionReady = "true";
    return;
  }

  const markVisible = (target) => {
    target.dataset.inView = "true";
  };

  if (root.dataset.motion === "reduced" || !("IntersectionObserver" in windowRef)) {
    revealTargets.forEach(markVisible);
    root.dataset.motionReady = "true";
    return;
  }

  const observer = new windowRef.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealTargets.forEach((target) => {
    target.dataset.inView = isWithinInitialViewport(target, windowRef)
      ? "true"
      : "pending";
    observer.observe(target);
  });

  windowRef.requestAnimationFrame(() => {
    root.dataset.motionReady = "true";
  });
}

function setupEditorialFeedFilters(documentRef) {
  documentRef.querySelectorAll("[data-editorial-feed]").forEach((feed) => {
    const controls = [...feed.querySelectorAll("[data-editorial-filter-control]")];
    const items = [...feed.querySelectorAll("[data-editorial-item]")];
    const emptyState = feed.querySelector("[data-editorial-filter-empty]");
    const statusNode = feed.querySelector("[data-editorial-filter-status]");

    if (controls.length === 0 || items.length === 0) {
      return;
    }

    feed.dataset.editorialEnhanced = "true";

    const applyFilter = (filterId) => {
      let visibleCount = 0;

      controls.forEach((control) => {
        const isCurrent = control.dataset.editorialFilterControl === filterId;

        if (isCurrent) {
          control.classList.add("is-current");
          control.setAttribute("aria-pressed", "true");
        } else {
          control.classList.remove("is-current");
          control.setAttribute("aria-pressed", "false");
        }
      });

      items.forEach((item) => {
        const nextState =
          filterId === "all" || item.dataset.editorialFilterKind === filterId;

        item.toggleAttribute("hidden", !nextState);

        if (nextState) {
          visibleCount += 1;
        }
      });

      if (emptyState instanceof HTMLElement) {
        emptyState.hidden = visibleCount > 0;
      }

      if (statusNode instanceof HTMLElement) {
        statusNode.textContent =
          filterId === "all"
            ? "Showing all public items."
            : visibleCount > 0
              ? `Showing ${visibleCount} ${filterId}${visibleCount === 1 ? "" : "s"}.`
              : `No ${filterId}s are public right now.`;
      }
    };

    controls.forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        applyFilter(control.dataset.editorialFilterControl ?? "all");
      });
    });

    applyFilter("all");
  });
}

export function bootSiteBehavior(documentRef = document) {
  const windowRef = documentRef.defaultView;

  if (!windowRef) {
    return;
  }

  const analyticsClient = createNoopAnalyticsClient();

  setMotionPreference(documentRef, windowRef.matchMedia?.(REDUCED_MOTION_MEDIA));
  setupStickyHeader(documentRef);
  setupPrimaryNavigation(documentRef);
  setupDisclosureState(documentRef);
  setupInViewMotion(documentRef);
  setupEditorialFeedFilters(documentRef);
  documentRef.querySelectorAll("[data-support-form]").forEach((form) => {
    if (form instanceof HTMLFormElement) {
      setupSupportForm(form, analyticsClient);
    }
  });

  void hydrateAnalyticsClient(documentRef, analyticsClient);
}

const STORAGE_PREFIX = "cms-admin:record:";

function getStorageKey(documentId) {
  return `${STORAGE_PREFIX}${documentId}`;
}

function formatTimestamp(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function listStoredRecords() {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .map((key) => {
      try {
        return JSON.parse(localStorage.getItem(key) ?? "null");
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function getAdminCsrfToken() {
  return (
    document.querySelector('meta[name="admin-csrf-token"]')?.getAttribute("content") ?? ""
  );
}

async function postAdminJson(url, payload) {
  const csrfToken = getAdminCsrfToken();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "x-admin-csrf-token": csrfToken
    },
    body: JSON.stringify({
      ...payload,
      _csrf: csrfToken
    })
  });

  if (response.status === 401) {
    window.location.assign("/admin/login/?state=session-expired");

    return null;
  }

  return {
    response,
    payload: await response.json().catch(() => null)
  };
}

function readFields(root) {
  return [...root.querySelectorAll("[data-admin-field]")];
}

function readCurrentValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, field.value]));
}

function validateFields(fields) {
  const invalid = [];

  for (const field of fields) {
    const value = field.value.trim();
    const required = field.dataset.required === "true";
    const maxLength = Number(field.dataset.maxLength ?? 0);
    const errorNode = field
      .closest("[data-admin-field-wrapper]")
      ?.querySelector("[data-field-error]");
    let error = "";

    if (required && value.length === 0) {
      error = "This field cannot be blank in the current template.";
    }

    if (!error && maxLength > 0 && value.length > maxLength) {
      error = `Keep this field within ${maxLength} characters.`;
    }

    if (errorNode) {
      errorNode.textContent = error;
      errorNode.hidden = error.length === 0;
    }

    if (error) {
      invalid.push({
        name: field.name,
        label: field.dataset.fieldLabel ?? field.name,
        error
      });
    }
  }

  return invalid;
}

function updateCounters(fields) {
  for (const field of fields) {
    const countNode = field
      .closest("[data-admin-field-wrapper]")
      ?.querySelector("[data-field-count]");

    if (countNode) {
      countNode.textContent = `${field.value.length}/${field.dataset.maxLength ?? "0"}`;
    }
  }
}

function renderDiff(root, baselineValues, currentValues) {
  const diffList = root.querySelector("[data-diff-list]");

  if (!diffList) {
    return [];
  }

  const changedEntries = Object.entries(currentValues).filter(
    ([path, value]) => (baselineValues[path] ?? "") !== value
  );

  if (changedEntries.length === 0) {
    diffList.innerHTML = `
      <div class="admin-diff-item">
        <strong>No changes yet</strong>
        <p class="admin-muted">The diff fills as soon as draft values move away from the published baseline.</p>
      </div>
    `;
    return [];
  }

  diffList.innerHTML = changedEntries
    .map(([path, value]) => {
      const field = root.querySelector(`[name="${CSS.escape(path)}"]`);
      const label = field?.dataset.fieldLabel ?? path;
      const before = baselineValues[path] ?? "";

      return `
        <div class="admin-diff-item">
          <strong>${escapeHtml(label)}</strong>
          <p class="admin-muted"><span>Before:</span> ${escapeHtml(before || "Empty")}</p>
          <p><span class="admin-muted">After:</span> ${escapeHtml(value || "Empty")}</p>
        </div>
      `;
    })
    .join("");

  return changedEntries;
}

function renderPreview(root, currentValues, changedEntries) {
  const previewList = root.querySelector("[data-preview-list]");

  if (!previewList) {
    return;
  }

  const prioritizedEntries =
    changedEntries.length > 0
      ? changedEntries
      : Object.entries(currentValues).slice(0, 4);

  previewList.innerHTML = prioritizedEntries
    .slice(0, 6)
    .map(([path, value]) => {
      const field = root.querySelector(`[name="${CSS.escape(path)}"]`);
      const label = field?.dataset.fieldLabel ?? path;

      return `
        <div class="admin-preview-item">
          <p class="admin-eyebrow">Template copy</p>
          <strong>${escapeHtml(label)}</strong>
          <p>${escapeHtml(value || "Empty")}</p>
        </div>
      `;
    })
    .join("");
}

function renderHistory(root, sessionState) {
  const historyList = root.querySelector("[data-history-list]");

  if (
    !historyList ||
    !Array.isArray(sessionState.history) ||
    sessionState.history.length === 0
  ) {
    return;
  }

  const historyMarkup = sessionState.history
    .slice()
    .reverse()
    .map(
      (entry) => `
        <div class="admin-history-item">
          <strong>${escapeHtml(entry.label)}</strong>
          <p class="admin-muted">${escapeHtml(formatTimestamp(entry.createdAt))}</p>
          ${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ""}
        </div>
      `
    )
    .join("");

  const baselineMarkup =
    historyList.querySelector(".admin-history-item")?.outerHTML ?? "";
  historyList.innerHTML = baselineMarkup + historyMarkup;
}

function updateWorkflowMessage(root, message) {
  const statusNode = root.querySelector("[data-workflow-status]");

  if (statusNode) {
    statusNode.textContent = message;
  }
}

function updateValidationSummary(root, invalidFields) {
  const summaryNode = root.querySelector("[data-validation-summary]");

  if (!summaryNode) {
    return;
  }

  if (invalidFields.length === 0) {
    summaryNode.textContent =
      "Validation is clear. You can save locally, request review, or publish if your role allows it.";
    return;
  }

  summaryNode.textContent = `${invalidFields.length} field${
    invalidFields.length === 1 ? "" : "s"
  } need attention before review or publish.`;
}

function persistSessionState(sessionState) {
  localStorage.setItem(
    getStorageKey(sessionState.documentId),
    JSON.stringify(sessionState)
  );
}

function isActionAllowed(workflowState, action) {
  switch (action) {
    case "save-draft":
      return true;
    case "request-review":
      return workflowState === "draft";
    case "approve":
      return workflowState === "under-review";
    case "publish":
      return workflowState === "approved" || workflowState === "scheduled";
    case "revert":
      return true;
    default:
      return false;
  }
}

function updateActionAvailability(root, workflowState) {
  const buttons = root.querySelectorAll("[data-workflow-action]");

  for (const button of buttons) {
    const action = button.dataset.workflowAction ?? "";
    button.disabled = !isActionAllowed(workflowState, action);
  }
}

function appendHistory(sessionState, label, note = "") {
  sessionState.history.push({
    label,
    note,
    createdAt: new Date().toISOString()
  });
}

function buildInitialSessionState(root, fields) {
  const documentId = root.dataset.documentId ?? "";
  const documentTitle = root.dataset.documentTitle ?? "Document";
  const editorPath = root.dataset.editorPath ?? "#";
  const previewRoute = root.dataset.previewRoute ?? "";
  const baselineValues = Object.fromEntries(
    fields.map((field) => [field.name, field.dataset.initialValue ?? ""])
  );

  return {
    version: 1,
    documentId,
    documentTitle,
    editorPath,
    previewRoute,
    workflowState: "draft",
    currentValues: baselineValues,
    savedValues: baselineValues,
    publishedValues: baselineValues,
    updatedAt: new Date().toISOString(),
    history: []
  };
}

function applySessionValues(fields, values) {
  for (const field of fields) {
    const nextValue = values[field.name];

    if (nextValue === undefined) {
      continue;
    }

    field.value = nextValue;
  }
}

function syncReviewQueueViews() {
  const reviewLists = document.querySelectorAll("[data-admin-review-queue]");
  const reviewCountNodes = document.querySelectorAll("[data-dashboard-review-count]");
  const reviewEntries = listStoredRecords().filter((record) =>
    ["under-review", "approved", "scheduled"].includes(record.workflowState)
  );

  for (const node of reviewCountNodes) {
    node.textContent =
      reviewEntries.length === 0
        ? "No pending review items in this browser yet."
        : `${reviewEntries.length} item${reviewEntries.length === 1 ? "" : "s"} waiting for review or publish.`;
  }

  for (const reviewList of reviewLists) {
    if (reviewEntries.length === 0) {
      continue;
    }

    reviewList.innerHTML = reviewEntries
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
      .map(
        (record) => `
          <article class="admin-review-card">
            <p class="admin-eyebrow">${escapeHtml(record.workflowState.replaceAll("-", " "))}</p>
            <strong>${escapeHtml(record.documentTitle)}</strong>
            <p class="admin-muted">Updated ${escapeHtml(formatTimestamp(record.updatedAt))}</p>
            <a class="admin-link-button" href="${escapeHtml(record.editorPath)}">Open draft</a>
          </article>
        `
      )
      .join("");
  }
}

function setNodeText(node, value) {
  if (node) {
    node.textContent = value;
  }
}

function setNodeHidden(node, hidden) {
  if (node) {
    node.hidden = hidden;
  }
}

function wireRepeatableGroups(root) {
  root.querySelectorAll("[data-repeatable-group]").forEach((group) => {
    const addButton = group.querySelector("[data-repeatable-add]");

    addButton?.addEventListener("click", () => {
      const items = [...group.querySelectorAll("[data-repeatable-item]")];
      const lastItem = items.at(-1);

      if (!lastItem) {
        return;
      }

      const newIndex = items.length;
      const clone = lastItem.cloneNode(true);
      clone.dataset.itemIndex = String(newIndex);
      const header = clone.querySelector("h4");

      if (header) {
        header.textContent = `Item ${newIndex + 1}`;
      }

      clone.querySelectorAll("[data-admin-field]").forEach((field) => {
        const nextName = field.name.replace(/\.\d+\./, `.${newIndex}.`);
        const nextId = `${nextName.replaceAll(".", "-")}-${newIndex}`;
        const wrapper = field.closest("[data-admin-field-wrapper]");
        const label = wrapper?.querySelector("label");
        const errorNode = wrapper?.querySelector("[data-field-error]");
        const countNode = wrapper?.querySelector("[data-field-count]");

        field.name = nextName;
        field.id = nextId;
        field.dataset.initialValue = "";
        field.value = "";

        if (label) {
          label.htmlFor = nextId;
        }
        if (errorNode) {
          errorNode.textContent = "";
          errorNode.hidden = true;
        }
        if (countNode) {
          countNode.textContent = `0/${field.dataset.maxLength ?? "0"}`;
        }
      });

      group.querySelector(".admin-repeatable-items")?.append(clone);
      root.dispatchEvent(new CustomEvent("admin-editor:changed"));
    });

    group.addEventListener("click", (event) => {
      const target = event.target;

      if (
        !(target instanceof HTMLElement) ||
        !target.matches("[data-repeatable-remove]")
      ) {
        return;
      }

      const item = target.closest("[data-repeatable-item]");
      const items = group.querySelectorAll("[data-repeatable-item]");

      if (!item || items.length === 1) {
        return;
      }

      item.remove();
      root.dispatchEvent(new CustomEvent("admin-editor:changed"));
    });
  });
}

function initEditor(root) {
  const fields = readFields(root);
  const baselineState = buildInitialSessionState(root, fields);
  const storedState = localStorage.getItem(getStorageKey(baselineState.documentId));
  const sessionState = storedState ? JSON.parse(storedState) : baselineState;
  let autosaveTimer = null;

  applySessionValues(fields, sessionState.currentValues);
  updateCounters(fields);
  renderHistory(root, sessionState);

  const render = () => {
    const currentValues = readCurrentValues(readFields(root));
    const invalidFields = validateFields(readFields(root));
    const changedEntries = renderDiff(root, sessionState.publishedValues, currentValues);

    renderPreview(root, currentValues, changedEntries);
    updateValidationSummary(root, invalidFields);
    updateActionAvailability(root, sessionState.workflowState);
  };

  const scheduleAutosave = () => {
    window.clearTimeout(autosaveTimer);
    updateWorkflowMessage(
      root,
      "Unsaved changes. Draft autosave is running inside this browser."
    );
    autosaveTimer = window.setTimeout(() => {
      const nextFields = readFields(root);
      sessionState.currentValues = readCurrentValues(nextFields);
      sessionState.savedValues = sessionState.currentValues;
      sessionState.updatedAt = new Date().toISOString();
      persistSessionState(sessionState);
      const invalidFields = validateFields(nextFields);
      updateWorkflowMessage(
        root,
        invalidFields.length === 0
          ? `Draft saved locally at ${formatTimestamp(sessionState.updatedAt)}.`
          : "Draft saved locally, but validation still blocks review or publish."
      );
      syncReviewQueueViews();
    }, 400);
  };

  root.addEventListener("input", (event) => {
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.matches("[data-admin-field]")
    ) {
      return;
    }

    updateCounters(readFields(root));
    render();
    scheduleAutosave();
  });

  root.addEventListener("change", (event) => {
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.matches("[data-admin-field]")
    ) {
      return;
    }

    render();
    scheduleAutosave();
  });

  root.addEventListener("admin-editor:changed", () => {
    updateCounters(readFields(root));
    render();
    scheduleAutosave();
  });

  wireRepeatableGroups(root);

  root.querySelectorAll("[data-workflow-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.workflowAction ?? "";
      const nextFields = readFields(root);
      const invalidFields = validateFields(nextFields);

      sessionState.currentValues = readCurrentValues(nextFields);

      if (
        (action === "request-review" || action === "approve" || action === "publish") &&
        invalidFields.length > 0
      ) {
        sessionState.workflowState = "draft";
        updateWorkflowMessage(
          root,
          "Validation blocked. Fix the highlighted fields before continuing."
        );
        updateValidationSummary(root, invalidFields);
        persistSessionState(sessionState);
        return;
      }

      if (action === "save-draft") {
        sessionState.workflowState = "draft";
        sessionState.savedValues = sessionState.currentValues;
        sessionState.updatedAt = new Date().toISOString();
        appendHistory(sessionState, "Draft saved");
        updateWorkflowMessage(
          root,
          `Draft saved at ${formatTimestamp(sessionState.updatedAt)}.`
        );
        persistSessionState(sessionState);
        renderHistory(root, sessionState);
        render();
        syncReviewQueueViews();
        return;
      }

      const changedFields = Object.keys(sessionState.currentValues).filter(
        (fieldName) =>
          (sessionState.publishedValues[fieldName] ?? "") !==
          sessionState.currentValues[fieldName]
      );
      const request = await postAdminJson("/api/admin/workflow/", {
        action,
        documentId: root.dataset.documentId ?? "",
        documentTitle: root.dataset.documentTitle ?? "",
        changedFields
      });

      if (!request?.response.ok || !request.payload?.ok) {
        updateWorkflowMessage(
          root,
          "The server rejected that workflow action. Refresh the page and sign in again if needed."
        );
        return;
      }

      if (action === "request-review") {
        sessionState.workflowState = "under-review";
        sessionState.updatedAt = new Date().toISOString();
        appendHistory(sessionState, "Sent for review", "Server-side audit recorded.");
        updateWorkflowMessage(
          root,
          "Ready for review. The action was checked and recorded on the server."
        );
      }

      if (action === "approve") {
        sessionState.workflowState = "approved";
        sessionState.updatedAt = new Date().toISOString();
        appendHistory(
          sessionState,
          "Approved for publish",
          "Server-side audit recorded."
        );
        updateWorkflowMessage(
          root,
          "Approved. The draft can now be published from the admin workflow."
        );
      }

      if (action === "publish") {
        sessionState.workflowState = "published";
        sessionState.updatedAt = new Date().toISOString();
        sessionState.publishedValues = sessionState.currentValues;
        appendHistory(sessionState, "Published snapshot", "Server-side audit recorded.");
        updateWorkflowMessage(
          root,
          "Publish intent recorded. The secure publication boundary accepted the action."
        );
      }

      if (action === "revert") {
        sessionState.workflowState = "draft";
        sessionState.updatedAt = new Date().toISOString();
        sessionState.currentValues = sessionState.publishedValues;
        sessionState.savedValues = sessionState.publishedValues;
        applySessionValues(nextFields, sessionState.publishedValues);
        appendHistory(
          sessionState,
          "Reverted to published",
          "Server-side audit recorded."
        );
        updateWorkflowMessage(root, "Draft reverted to the last published snapshot.");
      }

      persistSessionState(sessionState);
      renderHistory(root, sessionState);
      render();
      syncReviewQueueViews();
    });
  });

  render();
}

function initActivationForm(form) {
  const resultCard = document.querySelector("[data-admin-activation-result]");
  const resultMessage = resultCard?.querySelector("[data-admin-activation-message]");
  const resultCodes = resultCard?.querySelector("[data-admin-recovery-codes]");
  const errorNode = document.querySelector("[data-admin-activation-error]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setNodeHidden(errorNode, true);

    const response = await fetch(form.action, {
      method: "POST",
      headers: {
        accept: "application/json"
      },
      body: new FormData(form)
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.ok) {
      setNodeText(
        errorNode,
        payload?.message ??
          "Activation was not accepted. Check the password fields and authenticator code."
      );
      setNodeHidden(errorNode, false);
      return;
    }

    if (resultCodes) {
      resultCodes.innerHTML = (payload.recoveryCodes ?? [])
        .map((code) => `<li>${escapeHtml(code)}</li>`)
        .join("");
    }

    setNodeText(
      resultMessage,
      "Save these recovery codes now. They are shown once and can be used if the authenticator device is unavailable."
    );
    setNodeHidden(resultCard, false);
    form.querySelectorAll("input, button").forEach((field) => {
      field.disabled = true;
    });
  });
}

function initSecurityPage(root) {
  const resultCard = root.querySelector("[data-admin-access-result]");
  const resultTitle = root.querySelector("[data-admin-access-result-title]");
  const resultMessage = root.querySelector("[data-admin-access-result-message]");
  const resultLink = root.querySelector("[data-admin-access-link]");

  const renderAccessResult = ({ title, message, link = "" }) => {
    setNodeText(resultTitle, title);
    setNodeText(resultMessage, message);
    setNodeText(resultLink, link);
    setNodeHidden(resultCard, false);
  };

  root.querySelectorAll("[data-admin-access-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const request = await postAdminJson("/api/admin/access/", {
        action: formData.get("action"),
        email: formData.get("email"),
        displayName: formData.get("displayName"),
        roleId: formData.get("roleId"),
        stepUpCode: formData.get("stepUpCode")
      });

      if (!request?.response.ok || !request.payload?.ok) {
        renderAccessResult({
          title: "Access action blocked",
          message:
            request?.payload?.state === "step-up-required"
              ? "The fresh authenticator code was not accepted."
              : "The admin server rejected that request."
        });
        return;
      }

      renderAccessResult({
        title: "Invitation created",
        message: "Share this one-time activation path out of band.",
        link: request.payload.activationPath ?? ""
      });
      form.reset();
    });
  });

  root.querySelectorAll("[data-admin-access-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.adminAccessAction ?? "";
      const stepUpCode =
        action === "revoke-session"
          ? ""
          : (window.prompt("Enter a fresh authenticator code to confirm this action.") ??
            "");

      if (action !== "revoke-session" && !stepUpCode.trim()) {
        return;
      }

      const request = await postAdminJson("/api/admin/access/", {
        action,
        sessionId: button.dataset.sessionId ?? "",
        accountId: button.dataset.accountId ?? "",
        stepUpCode
      });

      if (!request?.response.ok || !request.payload?.ok) {
        renderAccessResult({
          title: "Action blocked",
          message:
            request?.payload?.state === "step-up-required"
              ? "The fresh authenticator code was not accepted."
              : "The admin server rejected that action."
        });
        return;
      }

      renderAccessResult({
        title: "Action recorded",
        message:
          request.payload.activationPath ??
          "The action was checked and recorded on the server.",
        link: request.payload.activationPath ?? ""
      });
      window.setTimeout(() => window.location.reload(), 300);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-admin-editor]").forEach((root) => initEditor(root));
  document
    .querySelectorAll("[data-admin-activation-form]")
    .forEach((form) => initActivationForm(form));
  document
    .querySelectorAll("[data-admin-security-root]")
    .forEach((root) => initSecurityPage(root));
  syncReviewQueueViews();
});

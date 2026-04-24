import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import { HtmlValidate } from "html-validate";

import { listRouteRecords } from "../src/lib/content/discovery.js";
import { startBuiltPreviewServer } from "./lib/preview-server.mjs";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const validationPort = Number(process.env.HTML_VALIDATION_PORT ?? "4332");
const routeRecords = listRouteRecords().filter((record) => record.pageId !== "not-found");
const htmlValidate = new HtmlValidate({
  extends: ["html-validate:recommended"],
  rules: {
    "long-title": "off",
    "require-sri": "off"
  }
});

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const preview = await startBuiltPreviewServer({
    cwd: siteRoot,
    port: validationPort
  });
  const failures = [];
  const validationTargets = [
    ...routeRecords.map((record) => ({
      label: record.route,
      path: record.route,
      expectedStatus: 200
    })),
    {
      label: "custom-404",
      path: "/this-route-should-not-exist/",
      expectedStatus: 404
    }
  ];

  try {
    for (const target of validationTargets) {
      const response = await fetch(new URL(target.path, preview.baseUrl));
      const contentType = response.headers.get("content-type") ?? "";
      const html = await response.text();

      if (response.status !== target.expectedStatus) {
        failures.push(
          `${target.label}: expected ${target.expectedStatus}, received ${response.status}.`
        );
        continue;
      }

      if (!contentType.includes("text/html")) {
        failures.push(
          `${target.label}: expected text/html response, received ${contentType}.`
        );
        continue;
      }

      const result = await htmlValidate.validateString(html, target.label);

      if (!result.valid) {
        const details = result.results
          .flatMap((entry) => entry.messages)
          .map((message) => {
            const location = `${message.line ?? 0}:${message.column ?? 0}`;

            return `${target.label}:${location} ${message.ruleId ?? "html"} ${message.message}`;
          });

        failures.push(...details);
      }
    }
  } finally {
    await preview.stop();
  }

  assert(failures.length === 0, `HTML markup validation failed:\n${failures.join("\n")}`);

  console.log(
    `[html-validate] validated ${validationTargets.length} rendered HTML routes`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

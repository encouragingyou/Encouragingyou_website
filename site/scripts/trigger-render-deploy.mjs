const deployHookUrl = process.env.RENDER_DEPLOY_HOOK_URL?.trim();
const releaseSha = process.env.RELEASE_SHA?.trim() || "";

if (!deployHookUrl) {
  throw new Error("RENDER_DEPLOY_HOOK_URL is required to trigger a Render deploy.");
}

const targetUrl = new URL(deployHookUrl);

if (releaseSha) {
  targetUrl.searchParams.set("ref", releaseSha);
}

const response = await fetch(targetUrl, {
  method: "POST"
});

if (!response.ok) {
  throw new Error(
    `Render deploy hook failed with ${response.status} ${response.statusText}.`
  );
}

console.log(
  `[render-deploy] triggered${releaseSha ? ` deploy for ${releaseSha}` : " deploy"}`
);

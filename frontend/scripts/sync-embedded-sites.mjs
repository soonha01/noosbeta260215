import { spawnSync } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendRoot, "..");
const workspaceRoot = path.resolve(repoRoot, "..");

const sites = [
  {
    name: "NOOS main landing",
    sourceDir: path.join(workspaceRoot, "compute-the-platform-to-build-and-ship-ai-agents"),
    targetDir: path.join(frontendRoot, "public", "embedded", "noos-landing"),
    basePath: "/embedded/noos-landing",
  },
  {
    name: "NOOS AI Objet",
    sourceDir: path.join(repoRoot, "ai-objet-next"),
    targetDir: path.join(frontendRoot, "public", "embedded", "ai-objet"),
    basePath: "/embedded/ai-objet",
  },
];

const textFilePattern = /\.(?:css|html|js|json|mjs|svg|txt|webmanifest)$/i;
const rootPublicAssets = [
  "apple-icon.png",
  "icon-dark-32x32.png",
  "icon-light-32x32.png",
  "icon.svg",
  "noos-mark.svg",
  "placeholder-logo.png",
  "placeholder-logo.svg",
  "placeholder-user.jpg",
  "placeholder.jpg",
  "placeholder.svg",
];

const run = (site) => {
  console.log(`\n[embedded] Building ${site.name}`);
  const result = spawnSync("npm", ["run", "build:embedded"], {
    cwd: site.sourceDir,
    env: process.env,
    shell: false,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${site.name} embedded build failed`);
  }
};

const rewriteFile = async (filePath, basePath) => {
  if (!textFilePattern.test(filePath)) {
    return;
  }

  const before = await readFile(filePath, "utf8");
  const encodedBasePath = basePath.replaceAll("/", "%2F");
  let after = before
    .replaceAll('"/images/', `"${basePath}/images/`)
    .replaceAll("'/images/", `'${basePath}/images/`)
    .replaceAll("`/images/", `\`${basePath}/images/`)
    .replaceAll("(/images/", `(${basePath}/images/`)
    .replaceAll("=/images/", `=${basePath}/images/`)
    .replaceAll("%2Fimages%2F", `${encodedBasePath}%2Fimages%2F`)
    .replaceAll("http://localhost:3001", "/ai-objet")
    .replaceAll("http://localhost:3002", "/embedded/noos-landing");

  for (const asset of rootPublicAssets) {
    after = after
      .replaceAll(`href="/${asset}"`, `href="${basePath}/${asset}"`)
      .replaceAll(`src="/${asset}"`, `src="${basePath}/${asset}"`)
      .replaceAll(`\\"/${asset}\\"`, `\\"${basePath}/${asset}\\"`);
  }

  if (after !== before) {
    await writeFile(filePath, after);
  }
};

const rewriteTree = async (dir, basePath) => {
  const entries = await readdir(dir);

  await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(dir, entry);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        await rewriteTree(filePath, basePath);
        return;
      }

      if (fileStat.isFile()) {
        await rewriteFile(filePath, basePath);
      }
    })
  );
};

for (const site of sites) {
  run(site);
  const outDir = path.join(site.sourceDir, "out");

  await rm(site.targetDir, { recursive: true, force: true });
  await mkdir(path.dirname(site.targetDir), { recursive: true });
  await cp(outDir, site.targetDir, { recursive: true });
  await rewriteTree(site.targetDir, site.basePath);
  console.log(`[embedded] Synced ${site.name} -> ${path.relative(frontendRoot, site.targetDir)}`);
}

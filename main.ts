// DealHawk hand-in: copies the static site and its screenshots into the
// output directory and writes the dossier the scorer compares byte for
// byte. Node 22 standard library only; nothing is installed or fetched.
import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

// The caps the bounty's scorer hands buildDossier: the text cap shapes the
// bytes, the rest only refuse an entry past its limits.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
  app_path_max_bytes: 1000,
};

function clearInside(dir: string): void {
  // Remove only what lives inside the output directory. The directory
  // itself stays put: the grader mounts it as a volume, and deleting it
  // fails the run with a busy device error.
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function copyTree(from: string, to: string): void {
  // Copy in sorted order so two runs write identical bytes.
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from).sort()) {
    const src = join(from, name);
    const dst = join(to, name);
    if (statSync(src).isDirectory()) copyTree(src, dst);
    else cpSync(src, dst);
  }
}

function handIn(): void {
  clearInside(OUTPUT_DIR);
  copyTree(join(REPO_ROOT, "app"), join(OUTPUT_DIR, "app"));
  const shots = join(REPO_ROOT, "screenshots");
  if (existsSync(shots)) copyTree(shots, join(OUTPUT_DIR, "screenshots"));
  else mkdirSync(join(OUTPUT_DIR, "screenshots"), { recursive: true });
  writeFileSync(join(OUTPUT_DIR, "dossier.json"), buildDossier(OUTPUT_DIR, DOSSIER_CAPS));
}

handIn();

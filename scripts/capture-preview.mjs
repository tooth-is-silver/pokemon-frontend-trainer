import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../docs/screenshots/learn");
const url = process.env.PREVIEW_URL ?? "http://localhost:5173/preview/quiz";

const sections = [
  { id: "preview-layout", name: "learn-layout" },
  { id: "preview-yesno", name: "question-yesno" },
  { id: "preview-fillblank", name: "question-fillblank" },
  { id: "preview-wrong", name: "wrong-answer-panel" },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 960, height: 1200 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-screenshot]");

  for (const { id, name } of sections) {
    const locator = page.locator(`#${id}`);
    const file = resolve(outDir, `${name}.png`);
    await locator.screenshot({ path: file });
    console.log(`saved ${file}`);
  }
} finally {
  await browser.close();
}

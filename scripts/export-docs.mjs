// Copies the static export (out/) to docs/, which GitHub Pages serves.
// .nojekyll stops Pages from running Jekyll, which would drop the _next/ folder.
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs';

const out = new URL('../out/', import.meta.url);
const docs = new URL('../docs/', import.meta.url);

if (!existsSync(out)) throw new Error('out/ not found: run `next build` (output: "export") first.');
rmSync(docs, { recursive: true, force: true });
cpSync(out, docs, { recursive: true });
writeFileSync(new URL('.nojekyll', docs), '');
console.log('Static site exported to docs/');

import { mkdir, copyFile, readFile, writeFile, cp } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
await mkdir('public/wasm', { recursive: true });
for (const name of ['dwg-worker.js', 'libredwg-web.js', 'libredwg-web.wasm', 'dwfv-render.wasm']) await copyFile(require.resolve('@flyfish-dev/cad-viewer/wasm/' + name), 'public/wasm/' + name);
await copyFile('node_modules/@flyfish-dev/cad-viewer/LICENSE', 'LICENSE');
const packages = ['@flyfish-dev/cad-viewer', '@mlightcad/libredwg-web', '@mlightcad/shx-parser', 'dwf-viewer', 'dxf-parser', 'loglevel', 'pdfjs-dist', 'pdf-lib', '@pdf-lib/fontkit', 'dejavu-fonts-ttf'];
let notices = 'DWG Desk 1.4.0 — third-party notices\n\n';
for (const name of packages) {
  const pkg = JSON.parse(await readFile('node_modules/' + name + '/package.json', 'utf8'));
  notices += `\n${name} ${pkg.version} — ${pkg.license}\n${JSON.stringify(pkg.repository || '')}\n`;
  for (const file of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING', 'NOTICE']) {
    try { notices += await readFile('node_modules/' + name + '/' + file, 'utf8') + '\n'; } catch {}
  }
}
await writeFile('THIRD-PARTY-NOTICES.txt', notices);

await mkdir('public/pdf',{recursive:true});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.mjs','public/pdf/pdf.worker.mjs');
for(const dir of ['cmaps','standard_fonts','wasm','iccs'])await cp('node_modules/pdfjs-dist/'+dir,'public/pdf/'+dir,{recursive:true});
await copyFile('node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf','public/pdf/DejaVuSans.ttf');

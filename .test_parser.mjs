// Smoke test: extract the pickle parser bits from the HTML and run them
// against the real MANO_RIGHT.pkl, then check the resulting MANO struct.
import { readFileSync } from 'node:fs';

const html = readFileSync('mano_hand_viewer.html', 'utf-8');
// Pull out the JS block between <script> and </script>
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) throw new Error('no script block');

// We can't run THREE-dependent code in node, so stub the parts we need to skip
// by evaluating only the parser sections. Easier: regex-extract the parser
// blocks by their marker comments.
function extractBetween(src, startMarker, endMarker) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error('start not found: ' + startMarker);
  const j = src.indexOf(endMarker, i);
  if (j < 0) throw new Error('end not found: ' + endMarker);
  return src.slice(i, j);
}

const parserBlock = extractBetween(
  m[1],
  '// ============================================================\n//  File parsers',
  '// ============================================================\n//  IndexedDB cache'
);

// eval parser block in a sandbox to expose the symbols
const sandbox = {};
const wrap = `${parserBlock}\nreturn { pickleLoadMano, manoStructFromPickleDict, parseManoBin };`;
const factory = new Function(wrap);
const { pickleLoadMano, manoStructFromPickleDict, parseManoBin } = factory();

const pkl = readFileSync('mano_v1_2/models/MANO_RIGHT.pkl');
// readFileSync returns a Buffer; pass its underlying ArrayBuffer slice
const ab = pkl.buffer.slice(pkl.byteOffset, pkl.byteOffset + pkl.byteLength);
console.log('pkl size:', pkl.length, 'bytes');

const dict = pickleLoadMano(ab);
console.log('parsed keys:', Object.keys(dict));

const mano = manoStructFromPickleDict(dict);
console.log('MANO struct:');
console.log('  nV:', mano.nV, 'expected 778');
console.log('  nJ:', mano.nJ, 'expected 16');
console.log('  parents:', mano.parents);
console.log('  faces.len:', mano.faces.length, 'expected', 1538 * 3);
console.log('  vTemplate.len:', mano.vTemplate.length, 'expected', 778 * 3);
console.log('  weights.len:', mano.weights.length, 'expected', 778 * 16);
console.log('  posedirs.len:', mano.posedirs.length, 'expected', 778 * 3 * 135);
console.log('  J.len:', mano.J.length, 'expected', 16 * 3);
console.log('  handsMean.len:', mano.handsMean.length, 'expected 45');

// sanity: first few v_template entries should be small floats near 0
console.log('  vTemplate[0..6]:', Array.from(mano.vTemplate.slice(0, 6)).map(v => v.toFixed(4)));
console.log('  J[0..6]:', Array.from(mano.J.slice(0, 6)).map(v => v.toFixed(4)));
console.log('  weights row 0 (verts 0\'s skinning):', Array.from(mano.weights.slice(0, 16)).map(v => v.toFixed(3)));

// check weights sum to 1 per vertex
let bad = 0, worst = 0;
for (let v = 0; v < mano.nV; v++) {
  let s = 0;
  for (let j = 0; j < mano.nJ; j++) s += mano.weights[v * mano.nJ + j];
  const e = Math.abs(s - 1);
  if (e > worst) worst = e;
  if (e > 1e-3) bad++;
}
console.log(`  weight rows summing to 1: bad=${bad}/${mano.nV}, worst|sum-1|=${worst.toExponential(2)}`);

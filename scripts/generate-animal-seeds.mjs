import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(__dirname, '../src/app/core/data/mock-animals.data.ts');
const outPath = path.join(__dirname, '../src/app/core/data/animal-seeds.json');
const src = fs.readFileSync(srcPath, 'utf8');

const seeds = [];
const blockRe = /createAnimal\(\{([\s\S]*?)\}\),/g;
let blockMatch;

while ((blockMatch = blockRe.exec(src)) !== null) {
  const block = blockMatch[1];
  const get = (key) => {
    const m = block.match(new RegExp(`${key}:\\s*'([^']*)'`));
    return m?.[1];
  };
  const descMatch = block.match(/description:\s*\n\s*"([^"]+)"/);
  const traitsMatch = block.match(/traits:\s*\[([^\]]+)\]/);

  const id = get('id');
  if (!id) continue;

  seeds.push({
    id,
    name: get('name') ?? '',
    emoji: get('emoji') ?? '',
    imageUrl: get('imageUrl') ?? '',
    personality: get('personality') ?? '',
    description: descMatch?.[1] ?? '',
    traits: traitsMatch
      ? traitsMatch[1].split(',').map((t) => t.trim().replace(/^'|'$/g, ''))
      : [],
    accent: get('accent') ?? 'rgba(200, 169, 107, 0.14)',
    active: true,
  });
}

fs.writeFileSync(outPath, `${JSON.stringify(seeds, null, 2)}\n`);
console.log(`Wrote ${seeds.length} animals to ${outPath}`);

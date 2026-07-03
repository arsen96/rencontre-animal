import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resRoot = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const densities = ['ldpi', 'mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];

let copied = 0;

for (const density of densities) {
  const source = path.join(resRoot, `mipmap-${density}`, 'ic_launcher.png');
  if (!fs.existsSync(source)) {
    continue;
  }

  const targetDir = path.join(resRoot, `drawable-${density}`);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(source, path.join(targetDir, 'ic_notification.png'));
  copied += 1;
}

if (!copied) {
  console.error('No ic_launcher.png found. Run npm run assets:icons first.');
  process.exit(1);
}

console.log(`Synced notification icon from ic_launcher (${copied} densities).`);

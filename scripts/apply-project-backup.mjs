import fs from 'node:fs';
import path from 'node:path';

const [, , backupPath] = process.argv;

if (!backupPath) {
  console.error('Uso: npm run sync:project -- ./ruta/al/project-overrides.json');
  process.exit(1);
}

const sourcePath = path.resolve(process.cwd(), backupPath);
const targetPath = path.resolve(process.cwd(), 'public/data/project-overrides.json');

if (!fs.existsSync(sourcePath)) {
  console.error(`No existe el archivo: ${sourcePath}`);
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
} catch (error) {
  console.error(`No se pudo leer el JSON: ${error.message}`);
  process.exit(1);
}

const normalized = {
  exportedAt: parsed.exportedAt ?? new Date().toISOString(),
  waters: Array.isArray(parsed.waters) ? parsed.waters : [],
  catches: Array.isArray(parsed.catches) ? parsed.catches : [],
  editedWaters: Array.isArray(parsed.editedWaters) ? parsed.editedWaters : [],
  editedCatches: Array.isArray(parsed.editedCatches) ? parsed.editedCatches : [],
  deletedWaterIds: Array.isArray(parsed.deletedWaterIds) ? parsed.deletedWaterIds.filter(Boolean) : [],
  deletedCatchIds: Array.isArray(parsed.deletedCatchIds) ? parsed.deletedCatchIds.filter(Boolean) : [],
};

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');

console.log(`[OK] Archivo sincronizado en ${targetPath}`);
console.log('Siguiente paso: git add public/data/project-overrides.json && git commit && git push');

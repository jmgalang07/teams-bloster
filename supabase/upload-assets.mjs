import { createReadStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const BUCKET = 'team-assets';
const ASSETS_DIR = path.resolve('supabase/assets');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const walk = async (directory) => {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const entryStat = await stat(fullPath);

    if (entryStat.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const mimeByExtension = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.svg') return 'image/svg+xml';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
};

const uploadFile = async (filePath) => {
  const storagePath = path.relative(ASSETS_DIR, filePath).split(path.sep).join('/');
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': mimeByExtension(filePath),
      'x-upsert': 'true',
    },
    body: createReadStream(filePath),
    duplex: 'half',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${storagePath}: ${response.status} ${errorText}`);
  }

  return storagePath;
};

const files = await walk(ASSETS_DIR);

for (const file of files) {
  const uploadedPath = await uploadFile(file);
  console.log(`Subido: ${uploadedPath}`);
}

console.log(`Listo. ${files.length} assets subidos al bucket ${BUCKET}.`);

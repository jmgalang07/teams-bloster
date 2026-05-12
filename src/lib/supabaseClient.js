const supabaseUrl = (import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const SUPABASE_ASSET_BUCKET = 'team-assets';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const buildHeaders = (headers = {}) => {
  if (!isSupabaseConfigured) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.');
  }

  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    ...headers,
  };
};

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const rawText = await response.text();
  const data = rawText ? JSON.parse(rawText) : null;

  if (!response.ok) {
    const message = data?.message || data?.error_description || data?.error || response.statusText;
    throw new Error(message || 'Supabase ha devuelto un error inesperado.');
  }

  return data;
};

export const supabaseRest = async (path, options = {}) => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: buildHeaders({
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }),
  });

  return parseResponse(response);
};

export const getStoragePublicUrl = (bucket, path) => {
  if (!bucket || !path) {
    return '';
  }

  if (!supabaseUrl) {
    return path;
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path.replace(/^\/+/, '')}`;
};

export const resolveStoragePath = (value = '') => {
  const rawValue = String(value ?? '');
  const match = rawValue.match(/^storage:\/\/([^/]+)\/(.+)$/i);

  if (!match) {
    return null;
  }

  return {
    bucket: match[1],
    path: match[2],
  };
};

export const toStorageUri = (bucket, path) => `storage://${bucket}/${path.replace(/^\/+/, '')}`;

export const uploadStorageObject = async ({ bucket = SUPABASE_ASSET_BUCKET, path, body, contentType }) => {
  if (!path || !body) {
    throw new Error('No se ha podido preparar el archivo para Supabase Storage.');
  }

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path.replace(/^\/+/, '')}`, {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'false',
    }),
    body,
  });

  const result = await parseResponse(response);

  return {
    ...result,
    bucket,
    path: path.replace(/^\/+/, ''),
    publicUrl: getStoragePublicUrl(bucket, path),
    storageUri: toStorageUri(bucket, path),
  };
};

const supabaseUrl = (import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const SUPABASE_ASSET_BUCKET = 'team-assets';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const ensureSupabaseConfig = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.');
  }
};

const buildHeaders = (headers = {}, authToken = '') => {
  ensureSupabaseConfig();

  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${authToken || supabaseAnonKey}`,
    ...headers,
  };
};

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const rawText = await response.text();
  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (rawText) {
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    } else {
      data = rawText;
    }
  }

  if (!response.ok) {
    const message =
      data?.msg ||
      data?.message ||
      data?.error_description ||
      data?.error ||
      (typeof data === 'string' ? data : '') ||
      response.statusText;

    throw new Error(message || 'Supabase ha devuelto un error inesperado.');
  }

  return data;
};

export const supabaseRest = async (path, options = {}) => {
  const { authToken = '', headers = {}, ...fetchOptions } = options;

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...fetchOptions,
    headers: buildHeaders(
      {
        'Content-Type': 'application/json',
        ...headers,
      },
      authToken,
    ),
  });

  return parseResponse(response);
};

export const supabaseRpc = (functionName, payload = {}, options = {}) =>
  supabaseRest(`rpc/${functionName}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  });

const supabaseAuth = async (path, options = {}) => {
  const { authToken = '', headers = {}, ...fetchOptions } = options;

  const response = await fetch(`${supabaseUrl}/auth/v1/${path.replace(/^\/+/, '')}`, {
    ...fetchOptions,
    headers: buildHeaders(
      {
        'Content-Type': 'application/json',
        ...headers,
      },
      authToken,
    ),
  });

  return parseResponse(response);
};

export const signInWithPassword = ({ email, password }) =>
  supabaseAuth('token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const refreshAuthSession = (refreshToken) =>
  supabaseAuth('token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

export const signOutAuth = (authToken) =>
  supabaseAuth('logout', {
    method: 'POST',
    authToken,
  });

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

export const uploadStorageObject = async ({
  bucket = SUPABASE_ASSET_BUCKET,
  path,
  body,
  contentType,
  authToken = '',
}) => {
  if (!path || !body) {
    throw new Error('No se ha podido preparar el archivo para Supabase Storage.');
  }

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path.replace(/^\/+/, '')}`, {
    method: 'POST',
    headers: buildHeaders(
      {
        'Content-Type': contentType || 'application/octet-stream',
        'x-upsert': 'false',
      },
      authToken,
    ),
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://auto-flow-nu.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, code_verifier } = req.body || {};
  if (!code || !code_verifier) {
    return res.status(400).json({ error: 'Missing code or code_verifier' });
  }

  const secret = process.env.TIKTOK_CLIENT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Server misconfiguration: missing TIKTOK_CLIENT_SECRET' });
  }

  const body = new URLSearchParams({
    client_key:    'awx31e2vn25qdf0x',
    client_secret: secret,
    code,
    grant_type:    'authorization_code',
    redirect_uri:  'https://auto-flow-nu.vercel.app/tiktok-auth.html',
    code_verifier,
  });

  try {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
      body:    body.toString(),
    });

    const data = await response.json();

    if (data.data?.access_token) {
      return res.status(200).json({ access_token: data.data.access_token });
    }

    return res.status(400).json({
      error: data.error?.message || data.message || 'Token exchange failed',
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

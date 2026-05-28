module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminHash = (process.env.ADMIN_PASSWORD_HASH || '').trim().toLowerCase();
  if (!adminEmail || !adminHash) {
    return res.status(500).json({ error: 'Admin credentials are not configured' });
  }

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const hash = String(body.hash || '').trim().toLowerCase();

  const emailOk = email && timingSafeEqualString(email, adminEmail);
  const hashOk = hash && timingSafeEqualString(hash, adminHash);

  return res.status(200).json({ ok: emailOk && hashOk });
};

function timingSafeEqualString(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

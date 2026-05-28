const { supabase } = require('../_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const { data: existing } = await supabase
    .from('prize_wheel_settings')
    .select('admin_password_hash')
    .eq('id', 1)
    .maybeSingle();

  if (existing && existing.admin_password_hash) {
    const currentHash = String(body.currentHash || '');
    if (currentHash !== existing.admin_password_hash) {
      return res.status(403).json({ error: 'Current password is incorrect' });
    }
  }

  const newHash = body.newHash === null ? null : (body.newHash ? String(body.newHash) : null);

  const { error } = await supabase
    .from('prize_wheel_settings')
    .update({ admin_password_hash: newHash, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true, hasPassword: !!newHash });
};

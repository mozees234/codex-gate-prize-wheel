const { supabase } = require('../_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const candidate = String(body.hash || '');

  const { data, error } = await supabase
    .from('prize_wheel_settings')
    .select('admin_password_hash')
    .eq('id', 1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });

  if (!data || !data.admin_password_hash) {
    return res.status(200).json({ ok: true, hasPassword: false });
  }

  const match = candidate === data.admin_password_hash;
  return res.status(200).json({ ok: match, hasPassword: true });
};

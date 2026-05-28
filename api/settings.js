const { supabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { data, error } = await supabase
    .from('prize_wheel_settings')
    .select('admin_password_hash')
    .eq('id', 1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ hasPassword: !!(data && data.admin_password_hash) });
};

const { supabase } = require('../_supabase');

module.exports = async function handler(req, res) {
  const id = Number.parseInt(req.query.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { error } = await supabase
    .from('prize_wheel_queue')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
};

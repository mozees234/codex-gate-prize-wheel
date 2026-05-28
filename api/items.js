const { supabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('prize_wheel_items')
      .select('id, icon, name, weight, stock, won, position')
      .order('position', { ascending: true })
      .order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const { data: posRow } = await supabase
      .from('prize_wheel_items')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPos = (posRow?.position ?? -1) + 1;

    const row = {
      icon: String(body.icon || '').slice(0, 16),
      name: String(body.name || 'New Prize').slice(0, 100),
      weight: Number.isFinite(+body.weight) ? Math.max(0, Math.trunc(+body.weight)) : 1,
      stock: Number.isFinite(+body.stock) ? Math.trunc(+body.stock) : -1,
      won: 0,
      position: nextPos,
    };
    const { data, error } = await supabase
      .from('prize_wheel_items')
      .insert(row)
      .select('id, icon, name, weight, stock, won, position')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ item: data });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};

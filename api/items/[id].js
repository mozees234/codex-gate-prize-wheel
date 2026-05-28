const { supabase } = require('../_supabase');

module.exports = async function handler(req, res) {
  const id = Number.parseInt(req.query.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    const body = req.body || {};
    const patch = { updated_at: new Date().toISOString() };
    if (body.icon !== undefined) patch.icon = String(body.icon || '').slice(0, 16);
    if (body.name !== undefined) patch.name = String(body.name || '').slice(0, 100);
    if (body.weight !== undefined && Number.isFinite(+body.weight)) {
      patch.weight = Math.max(0, Math.trunc(+body.weight));
    }
    if (body.stock !== undefined && Number.isFinite(+body.stock)) {
      patch.stock = Math.trunc(+body.stock);
    }
    if (body.won !== undefined && Number.isFinite(+body.won)) {
      patch.won = Math.max(0, Math.trunc(+body.won));
    }
    if (body.position !== undefined && Number.isFinite(+body.position)) {
      patch.position = Math.trunc(+body.position);
    }

    const { data, error } = await supabase
      .from('prize_wheel_items')
      .update(patch)
      .eq('id', id)
      .select('id, icon, name, weight, stock, won, position')
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ item: data });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('prize_wheel_items')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'PATCH, PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};

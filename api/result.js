const { supabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const queueId = Number.parseInt(body.id, 10);
  const prize = body.prize || null;
  const itemId = Number.isFinite(+body.itemId) ? Math.trunc(+body.itemId) : null;

  const resultRow = { prize };
  if (Number.isFinite(queueId)) resultRow.queue_id = queueId;

  const { error: insertError } = await supabase
    .from('prize_wheel_results')
    .insert(resultRow);
  if (insertError) return res.status(500).json({ error: insertError.message });

  if (Number.isFinite(queueId)) {
    await supabase
      .from('prize_wheel_queue')
      .update({ status: 'completed' })
      .eq('id', queueId);
  }

  if (itemId !== null) {
    const { data: item } = await supabase
      .from('prize_wheel_items')
      .select('stock, won')
      .eq('id', itemId)
      .maybeSingle();
    if (item) {
      const patch = { won: (item.won || 0) + 1 };
      if (typeof item.stock === 'number' && item.stock > 0) {
        patch.stock = item.stock - 1;
      }
      await supabase
        .from('prize_wheel_items')
        .update(patch)
        .eq('id', itemId);
    }
  }

  return res.status(200).json({ ok: true });
};

const { supabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const id = Number.parseInt(body.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const prize = body.prize || null;

  const { error: insertError } = await supabase
    .from('prize_wheel_results')
    .insert({ queue_id: id, prize });
  if (insertError) return res.status(500).json({ error: insertError.message });

  const { error: updateError } = await supabase
    .from('prize_wheel_queue')
    .update({ status: 'completed' })
    .eq('id', id);
  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.status(200).json({ ok: true });
};

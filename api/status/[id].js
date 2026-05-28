const { supabase } = require('../_supabase');

module.exports = async function handler(req, res) {
  const id = Number.parseInt(req.query.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { data: result, error: resultError } = await supabase
    .from('prize_wheel_results')
    .select('id, prize')
    .eq('queue_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (resultError) return res.status(500).json({ error: resultError.message });
  if (result) {
    return res.status(200).json({ status: 'completed', prize: result.prize });
  }

  const { data: entry, error: entryError } = await supabase
    .from('prize_wheel_queue')
    .select('id, status, created_at')
    .eq('id', id)
    .maybeSingle();
  if (entryError) return res.status(500).json({ error: entryError.message });

  if (!entry) {
    return res.status(200).json({ status: 'spinning' });
  }

  if (entry.status === 'pending') {
    const { count } = await supabase
      .from('prize_wheel_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('created_at', entry.created_at);
    return res.status(200).json({ status: 'pending', position: count || 1 });
  }

  return res.status(200).json({ status: 'spinning' });
};

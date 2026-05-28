const { supabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('prize_wheel_results')
      .select('id, queue_id, prize, created_at, prize_wheel_queue(name)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return res.status(500).json({ error: error.message });

    const history = (data || []).map(r => ({
      id: r.id,
      icon: r.prize?.icon || '',
      name: r.prize?.name || '',
      person: r.prize_wheel_queue?.name || null,
      time: r.created_at,
    }));
    return res.status(200).json({ history });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('prize_wheel_results')
      .delete()
      .gt('id', 0);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};

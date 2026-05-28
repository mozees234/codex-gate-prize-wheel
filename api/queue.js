const { supabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('prize_wheel_queue')
      .select('id, name, course, phone, email, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ queue: data, count: data.length });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const entry = {
      name: String(body.name || '').slice(0, 100),
      course: String(body.course || '').slice(0, 100),
      phone: String(body.phone || '').slice(0, 30),
      email: String(body.email || '').slice(0, 100),
    };
    const { data: inserted, error } = await supabase
      .from('prize_wheel_queue')
      .insert(entry)
      .select('id, created_at')
      .single();
    if (error) return res.status(500).json({ error: error.message });

    const { count } = await supabase
      .from('prize_wheel_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('created_at', inserted.created_at);

    return res.status(200).json({ id: inserted.id, position: count || 1 });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};

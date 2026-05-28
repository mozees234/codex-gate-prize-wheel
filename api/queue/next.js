const { supabase } = require('../_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: candidate, error: pickError } = await supabase
    .from('prize_wheel_queue')
    .select('id, name, course, phone, email, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (pickError) return res.status(500).json({ error: pickError.message });
  if (!candidate) return res.status(200).json(null);

  const { data: claimed, error: claimError } = await supabase
    .from('prize_wheel_queue')
    .update({ status: 'spinning' })
    .eq('id', candidate.id)
    .eq('status', 'pending')
    .select('id, name, course, phone, email, created_at')
    .maybeSingle();

  if (claimError) return res.status(500).json({ error: claimError.message });
  if (!claimed) return res.status(200).json(null);

  const ts = Date.parse(claimed.created_at) || Date.now();
  return res.status(200).json({
    id: claimed.id,
    name: claimed.name,
    course: claimed.course,
    phone: claimed.phone,
    email: claimed.email,
    timestamp: ts,
  });
};

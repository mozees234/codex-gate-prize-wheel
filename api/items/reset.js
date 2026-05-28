const { supabase } = require('../_supabase');

const DEFAULTS = [
  { icon: '\u{1F455}', name: 'T-Shirt', weight: 1, stock: 5, position: 0 },
  { icon: '\u{1F392}', name: 'Backpack', weight: 2, stock: 3, position: 1 },
  { icon: '\u{1F58A}\u{FE0F}', name: 'Pen', weight: 18, stock: 100, position: 2 },
  { icon: '\u{1F4D3}', name: 'Notebook', weight: 14, stock: 50, position: 3 },
  { icon: '\u{1FAE0}', name: 'Sticker', weight: 22, stock: -1, position: 4 },
  { icon: '\u{1FAD5}', name: 'Chocolate', weight: 20, stock: 80, position: 5 },
  { icon: '\u{1F964}', name: 'Bottle', weight: 8, stock: 20, position: 6 },
  { icon: '\u{1F381}', name: 'Mystery Prize', weight: 15, stock: 10, position: 7 },
];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { error: delErr } = await supabase
    .from('prize_wheel_items')
    .delete()
    .gt('id', 0);
  if (delErr) return res.status(500).json({ error: delErr.message });

  const rows = DEFAULTS.map(d => ({ ...d, won: 0 }));
  const { data, error } = await supabase
    .from('prize_wheel_items')
    .insert(rows)
    .select('id, icon, name, weight, stock, won, position')
    .order('position', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ items: data });
};

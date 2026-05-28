module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const configured = !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH);
  return res.status(200).json({ requiresAuth: configured });
};

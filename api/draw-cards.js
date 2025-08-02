const { drawCards } = require('./utils');

module.exports = async (req, res) => {
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允許 POST 請求' });
  }

  try {
    const { count = 1 } = req.body;
    const cards = drawCards(count);
    res.json({ cards });
  } catch (error) {
    console.error('抽牌錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
}; 
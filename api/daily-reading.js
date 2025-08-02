const { getDailyReading } = require('./utils');

module.exports = async (req, res) => {
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允許 GET 請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只允許 GET 請求' });
  }

  try {
    const result = await getDailyReading();
    res.json(result);
  } catch (error) {
    console.error('每日運勢錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
}; 
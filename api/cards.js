const { allCards } = require('./utils');
const { log, generateRequestId } = require('./logger');

module.exports = async (req, res) => {
  // 設置 CORS 標頭
  const rid = generateRequestId();

  log.info('cards: request started', { rid });

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
    log.info('cards: returning all cards', { rid, count: allCards.length });
    res.json(allCards);
  } catch (error) {
    log.error('cards: unhandled error', { rid, error: error.message });
    res.status(500).json({ error: '服務器錯誤' });
  }
}; 
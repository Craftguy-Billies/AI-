const { drawCards, log, generateRequestId } = require('./utils');

module.exports = async (req, res) => {
  // 設置 CORS 標頭
  const rid = generateRequestId();

  log.info('draw-cards: request started', { rid });

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
    let { count = 1 } = req.body;
    count = parseInt(count, 10);
    if (isNaN(count) || count < 1) {
      log.warn('draw-cards: invalid count, defaulting to 1', { rid, originalCount: req.body.count });
      count = 1;
    }

    const cards = drawCards(count, rid);
    res.json({ cards });
  } catch (error) {
    log.error('draw-cards: unhandled error', { rid, error: error.message });
    res.status(500).json({ error: '服務器錯誤' });
  }
}; 
const { getDailyReading, log, generateRequestId } = require('./utils');

module.exports = async (req, res) => {
  // 設置 CORS 標頭
  const rid = generateRequestId();
  const start = Date.now();

  log.info('daily-reading: request started', { rid });

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
    log.info('daily-reading: processing', { rid });

    const result = await getDailyReading(rid);

    if (!result.card) {
      log.error('daily-reading: failed to draw card', { rid });
      return res.status(500).json({ error: '抽牌失敗' });
    }

    const elapsed = Date.now() - start;
    log.info('daily-reading: completed', { rid, elapsed });

    res.json(result);
  } catch (error) {
    const elapsed = Date.now() - start;
    log.error('daily-reading: unhandled error', { rid, elapsed, error: error.message });
    res.status(500).json({ error: '服務器錯誤，請稍後再試' });
  }
}; 
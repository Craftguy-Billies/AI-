const { getYesNoReading } = require('./utils');
const { log, generateRequestId } = require('./logger');

module.exports = async (req, res) => {
  // 設置 CORS 標頭
  const rid = generateRequestId();
  const start = Date.now();

  log.info('yes-no-reading: request started', { rid });

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
    const { question } = req.body;
    
    if (!question || typeof question !== 'string' || !question.trim()) {
      log.warn('yes-no-reading: missing question', { rid });
      return res.status(400).json({ error: '請提供有效的問題' });
    }

    log.info('yes-no-reading: processing', { rid, questionLen: question.trim().length });

    const result = await getYesNoReading(question.trim(), rid);

    if (!result.card) {
      log.error('yes-no-reading: failed to get card', { rid });
      return res.status(500).json({ error: '抽牌失敗' });
    }

    const elapsed = Date.now() - start;
    log.info('yes-no-reading: completed', { rid, elapsed });

    res.json(result);
  } catch (error) {
    const elapsed = Date.now() - start;
    log.error('yes-no-reading: unhandled error', { rid, elapsed, error: error.message });
    res.status(500).json({ error: '服務器錯誤，請稍後再試' });
  }
}; 
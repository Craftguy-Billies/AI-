const { getTarotReading, drawCards, log, generateRequestId } = require('./utils');

module.exports = async (req, res) => {
  // 設置 CORS 標頭
  const rid = generateRequestId();
  const start = Date.now();

  log.info('tarot-reading: request started', { rid });

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
    const { question, cardCount = 3, readingType = 'general' } = req.body;
    
    if (!question || typeof question !== 'string' || !question.trim()) {
      log.warn('tarot-reading: missing question', { rid });
      return res.status(400).json({ error: '請提供有效的問題' });
    }

    const count = parseInt(cardCount, 10);
    if (isNaN(count) || count < 1 || count > 10) {
      log.warn('tarot-reading: invalid cardCount', { rid, cardCount });
      return res.status(400).json({ error: '抽牌數量必須在1-10之間' });
    }

    const validTypes = ['general', 'love', 'career', 'health', 'spiritual'];
    const type = validTypes.includes(readingType) ? readingType : 'general';

    log.info('tarot-reading: processing', { rid, cardCount: count, readingType: type, questionLen: question.trim().length });

    const cards = drawCards(count, rid);
    const reading = await getTarotReading(cards, question.trim(), type, rid);

    const elapsed = Date.now() - start;
    log.info('tarot-reading: completed', { rid, elapsed });

    res.json({ cards, reading, question: question.trim() });
  } catch (error) {
    const elapsed = Date.now() - start;
    log.error('tarot-reading: unhandled error', { rid, elapsed, error: error.message, stack: error.stack?.split('\n').slice(0, 3).join(' | ') });
    res.status(500).json({ error: '服務器錯誤，請稍後再試' });
  }
}; 
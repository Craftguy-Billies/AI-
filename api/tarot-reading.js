const { getTarotReading, drawCards } = require('./utils');

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
    const { question, cardCount = 3, readingType = 'general' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: '請提供問題' });
    }

    const cards = drawCards(cardCount);
    const reading = await getTarotReading(cards, question, readingType);

    res.json({
      cards: cards,
      reading: reading,
      question: question
    });
  } catch (error) {
    console.error('塔羅占卜錯誤:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
}; 
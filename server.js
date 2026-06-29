const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { log, generateRequestId } = require('./api/logger');

// ──────────────────────────────────────────────
//  App setup
// ──────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10kb' }));
app.use(express.static('public'));

// ──────────────────────────────────────────────
//  Request logging middleware (all routes)
// ──────────────────────────────────────────────
app.use((req, res, next) => {
  const rid = generateRequestId();
  req.rid = rid;
  const start = Date.now();
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const elapsed = Date.now() - start;
    log.info('request completed', {
      rid,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      elapsed,
      bodySize: JSON.stringify(body).length,
    });
    return originalJson(body);
  };
  log.info('request started', { rid, method: req.method, url: req.originalUrl, ip: req.ip });
  next();
});

// ──────────────────────────────────────────────
//  Shared modules (import logic from api/utils)
// ──────────────────────────────────────────────
const {
  allCards,
  drawCards,
  getTarotReading,
  getYesNoReading,
  getDailyReading,
} = require('./api/utils');

// ──────────────────────────────────────────────
//  API Routes
// ──────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// AI塔羅占卜
app.post('/api/tarot-reading', async (req, res) => {
  const rid = req.rid || generateRequestId();
  try {
    const { question, cardCount = 3, readingType = 'general' } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      log.warn('tarot-reading: missing question', { rid });
      return res.status(400).json({ error: '請提供有效的問題' });
    }
    if (question.trim().length < 2) {
      log.warn('tarot-reading: question too short', { rid, len: question.trim().length });
      return res.status(400).json({ error: '問題至少需要2個字元' });
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

    res.json({ cards, reading, question: question.trim() });
  } catch (error) {
    log.error('tarot-reading: unhandled error', { rid, error: error.message, stack: error.stack?.split('\n').slice(0, 3).join(' | ') });
    res.status(500).json({ error: '服務器錯誤，請稍後再試' });
  }
});

// 是否塔羅占卜
app.post('/api/yes-no-reading', async (req, res) => {
  const rid = req.rid || generateRequestId();
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      log.warn('yes-no-reading: missing question', { rid });
      return res.status(400).json({ error: '請提供有效的問題' });
    }

    log.info('yes-no-reading: processing', { rid, questionLen: question.trim().length });

    const result = await getYesNoReading(question.trim(), rid);

    if (!result.card) {
      log.error('yes-no-reading: no card drawn', { rid });
      return res.status(500).json({ error: '抽牌失敗' });
    }

    res.json(result);
  } catch (error) {
    log.error('yes-no-reading: unhandled error', { rid, error: error.message });
    res.status(500).json({ error: '服務器錯誤，請稍後再試' });
  }
});

// 每日塔羅運勢
app.get('/api/daily-reading', async (req, res) => {
  const rid = req.rid || generateRequestId();
  try {
    log.info('daily-reading: processing', { rid });

    const result = await getDailyReading(rid);

    if (!result.card) {
      log.error('daily-reading: no card drawn', { rid });
      return res.status(500).json({ error: '抽牌失敗' });
    }

    res.json(result);
  } catch (error) {
    log.error('daily-reading: unhandled error', { rid, error: error.message });
    res.status(500).json({ error: '服務器錯誤，請稍後再試' });
  }
});

// 獲取所有塔羅牌
app.get('/api/cards', (req, res) => {
  const rid = req.rid || generateRequestId();
  log.info('cards: returning all cards', { rid, count: allCards.length });
  res.json(allCards);
});

// 隨機抽取指定數量的牌
app.post('/api/draw-cards', (req, res) => {
  const rid = req.rid || generateRequestId();
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
});

// Health check / test endpoint
app.get('/api/test', (req, res) => {
  const rid = req.rid || generateRequestId();
  log.info('test: health check', { rid });
  res.json({
    status: 'success',
    message: 'API 服務正常運行',
    timestamp: new Date().toISOString(),
    environment: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: !!process.env.OPENAI_BASE_URL,
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
    version: '1.0.0',
    requestId: rid,
  });
});

// Favicon (silent 204 to avoid 404 noise)
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// 404 handler
app.use((req, res) => {
  log.warn('route not found', { method: req.method, url: req.originalUrl });
  res.status(404).json({ error: '路由不存在' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  log.error('unhandled exception', {
    rid: req.rid,
    error: err.message,
    stack: err.stack?.split('\n').slice(0, 5).join(' | '),
  });
  res.status(500).json({ error: '伺服器內部錯誤' });
});

// ──────────────────────────────────────────────
//  Graceful shutdown
// ──────────────────────────────────────────────
let server;
function shutdown(signal) {
  log.info('shutdown signal received', { signal });
  if (server) {
    server.close(() => {
      log.info('server closed');
      process.exit(0);
    });
    setTimeout(() => {
      log.error('forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

server = app.listen(PORT, () => {
  log.info('server started', { port: PORT, nodeEnv: process.env.NODE_ENV || 'development' });
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
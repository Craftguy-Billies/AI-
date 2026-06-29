const crypto = require('crypto');

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.DEBUG;

function formatLog(level, message, meta = {}) {
  const entry = { timestamp: new Date().toISOString(), level, message, ...meta };
  if (LOG_LEVELS[level] >= CURRENT_LOG_LEVEL) {
    if (level === 'ERROR') console.error(JSON.stringify(entry));
    else if (level === 'WARN') console.warn(JSON.stringify(entry));
    else console.log(JSON.stringify(entry));
  }
}

const log = {
  debug: (m, meta) => formatLog('DEBUG', m, meta),
  info: (m, meta) => formatLog('INFO', m, meta),
  warn: (m, meta) => formatLog('WARN', m, meta),
  error: (m, meta) => formatLog('ERROR', m, meta),
};

function generateRequestId() {
  return crypto.randomUUID().slice(0, 8);
}

function safeString(val, maxLen = 200) {
  if (typeof val !== 'string') return String(val || '');
  return val.length > maxLen ? val.slice(0, maxLen) + '…' : val;
}

module.exports = { log, generateRequestId, safeString, LOG_LEVELS };

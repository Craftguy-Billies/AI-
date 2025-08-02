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
    // 檢查環境變數
    const envCheck = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: !!process.env.OPENAI_BASE_URL,
      NODE_ENV: process.env.NODE_ENV || 'development'
    };

    res.json({
      status: 'success',
      message: 'API 服務正常運行',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      version: '1.0.0'
    });
  } catch (error) {
    console.error('測試 API 錯誤:', error);
    res.status(500).json({ 
      error: '測試 API 錯誤',
      message: error.message
    });
  }
}; 
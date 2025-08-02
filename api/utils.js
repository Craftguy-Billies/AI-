const OpenAI = require('openai');

// OpenAI配置
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
  baseURL: process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1',
});

// 塔羅牌數據
const tarotCards = [
  { id: 0, name: "愚者", meaning: "新的開始、冒險、純真", reversed: "魯莽、不負責任" },
  { id: 1, name: "魔術師", meaning: "創造力、技能、意志力", reversed: "技能不足、機會錯失" },
  { id: 2, name: "女祭司", meaning: "直覺、神秘、內在知識", reversed: "隱藏的秘密、表面化" },
  { id: 3, name: "女皇", meaning: "豐收、母性、創造力", reversed: "依賴、過度保護" },
  { id: 4, name: "皇帝", meaning: "權威、領導、穩定", reversed: "專制、缺乏控制" },
  { id: 5, name: "教皇", meaning: "傳統、教育、精神指引", reversed: "教條、限制" },
  { id: 6, name: "戀人", meaning: "愛情、和諧、選擇", reversed: "不和諧、價值觀衝突" },
  { id: 7, name: "戰車", meaning: "勝利、意志力、控制", reversed: "失控、缺乏方向" },
  { id: 8, name: "力量", meaning: "勇氣、說服力、影響力", reversed: "自我懷疑、軟弱" },
  { id: 9, name: "隱者", meaning: "智慧、內省、孤獨", reversed: "孤獨、拒絕幫助" },
  { id: 10, name: "命運之輪", meaning: "變化、命運、轉折點", reversed: "壞運氣、阻力" },
  { id: 11, name: "正義", meaning: "公平、真理、誠實", reversed: "不公、偏見" },
  { id: 12, name: "倒吊人", meaning: "犧牲、新視角、暫停", reversed: "停滯、無效的犧牲" },
  { id: 13, name: "死神", meaning: "結束、轉變、重生", reversed: "抗拒改變、停滯" },
  { id: 14, name: "節制", meaning: "平衡、調和、耐心", reversed: "不平衡、過度" },
  { id: 15, name: "惡魔", meaning: "束縛、物質主義、慾望", reversed: "釋放、擺脫束縛" },
  { id: 16, name: "塔", meaning: "突然的改變、混亂、啟示", reversed: "避免災難、延遲" },
  { id: 17, name: "星星", meaning: "希望、信心、靈感", reversed: "失去信心、悲觀" },
  { id: 18, name: "月亮", meaning: "直覺、幻覺、潛意識", reversed: "釋放恐懼、真相" },
  { id: 19, name: "太陽", meaning: "成功、快樂、活力", reversed: "暫時的沮喪、缺乏信心" },
  { id: 20, name: "審判", meaning: "重生、內在召喚、釋放", reversed: "自我懷疑、拒絕改變" },
  { id: 21, name: "世界", meaning: "完成、成就、旅行", reversed: "未完成、缺乏閉合" }
];

// 小阿爾卡納牌
const minorArcana = [
  // 權杖系列
  { id: 22, name: "權杖王牌", meaning: "新的開始、靈感、潛力", reversed: "延遲、缺乏方向" },
  { id: 23, name: "權杖二", meaning: "選擇、平衡、合作", reversed: "優柔寡斷、缺乏計劃" },
  { id: 24, name: "權杖三", meaning: "擴展、團隊合作、成長", reversed: "延遲、缺乏團隊合作" },
  { id: 25, name: "權杖四", meaning: "慶祝、和諧、穩定", reversed: "缺乏慶祝、不和諧" },
  { id: 26, name: "權杖五", meaning: "衝突、競爭、挑戰", reversed: "避免衝突、內部鬥爭" },
  { id: 27, name: "權杖六", meaning: "勝利、好消息、成功", reversed: "延遲的成功、驕傲" },
  { id: 28, name: "權杖七", meaning: "防禦、堅持、挑戰", reversed: "防禦過度、放棄" },
  { id: 29, name: "權杖八", meaning: "快速行動、變化、能量", reversed: "延遲、缺乏行動" },
  { id: 30, name: "權杖九", meaning: "準備、防禦、經驗", reversed: "準備不足、脆弱" },
  { id: 31, name: "權杖十", meaning: "負擔、責任、壓力", reversed: "釋放負擔、委託" },
  { id: 32, name: "權杖侍從", meaning: "探索、熱情、冒險", reversed: "缺乏方向、延遲" },
  { id: 33, name: "權杖騎士", meaning: "行動、冒險、衝動", reversed: "延遲、缺乏方向" },
  { id: 34, name: "權杖皇后", meaning: "獨立、熱情、自信", reversed: "依賴、缺乏自信" },
  { id: 35, name: "權杖國王", meaning: "領導、熱情、誠實", reversed: "專制、缺乏誠實" },
  
  // 聖杯系列
  { id: 36, name: "聖杯王牌", meaning: "新的情感、愛、直覺", reversed: "情感封閉、缺乏愛" },
  { id: 37, name: "聖杯二", meaning: "夥伴關係、和諧、選擇", reversed: "不和諧、分離" },
  { id: 38, name: "聖杯三", meaning: "慶祝、友誼、創造力", reversed: "過度慶祝、缺乏慶祝" },
  { id: 39, name: "聖杯四", meaning: "冥想、重新評估、休息", reversed: "行動、新的機會" },
  { id: 40, name: "聖杯五", meaning: "失望、悲傷、自憐", reversed: "接受、新的希望" },
  { id: 41, name: "聖杯六", meaning: "懷舊、回憶、重聚", reversed: "活在過去、拒絕改變" },
  { id: 42, name: "聖杯七", meaning: "選擇、幻想、機會", reversed: "明確選擇、現實" },
  { id: 43, name: "聖杯八", meaning: "離開、尋找、改變", reversed: "害怕改變、停滯" },
  { id: 44, name: "聖杯九", meaning: "滿足、願望實現、成功", reversed: "物質主義、缺乏滿足" },
  { id: 45, name: "聖杯十", meaning: "家庭和諧、幸福、圓滿", reversed: "家庭不和諧、缺乏圓滿" },
  { id: 46, name: "聖杯侍從", meaning: "創意、學習、好奇心", reversed: "缺乏創意、學習困難" },
  { id: 47, name: "聖杯騎士", meaning: "浪漫、提議、魅力", reversed: "不誠實、操縱" },
  { id: 48, name: "聖杯皇后", meaning: "關懷、直覺、同情", reversed: "情感依賴、缺乏關懷" },
  { id: 49, name: "聖杯國王", meaning: "情感智慧、同理心、支持", reversed: "情感冷漠、缺乏支持" },
  
  // 寶劍系列
  { id: 50, name: "寶劍王牌", meaning: "清晰、突破、真理", reversed: "混亂、缺乏清晰" },
  { id: 51, name: "寶劍二", meaning: "平衡、決策、和平", reversed: "優柔寡斷、不和諧" },
  { id: 52, name: "寶劍三", meaning: "心痛、悲傷、背叛", reversed: "治癒、寬恕" },
  { id: 53, name: "寶劍四", meaning: "休息、恢復、冥想", reversed: "過度休息、缺乏行動" },
  { id: 54, name: "寶劍五", meaning: "失敗、損失、衝突", reversed: "接受失敗、和解" },
  { id: 55, name: "寶劍六", meaning: "過渡、改善、旅程", reversed: "困難的過渡、延遲" },
  { id: 56, name: "寶劍七", meaning: "策略、秘密、逃避", reversed: "誠實、面對問題" },
  { id: 57, name: "寶劍八", meaning: "限制、恐懼、陷阱", reversed: "釋放、面對恐懼" },
  { id: 58, name: "寶劍九", meaning: "焦慮、恐懼、噩夢", reversed: "釋放恐懼、希望" },
  { id: 59, name: "寶劍十", meaning: "痛苦、結束、背叛", reversed: "恢復、新的開始" },
  { id: 60, name: "寶劍侍從", meaning: "新想法、學習、好奇心", reversed: "缺乏想法、學習困難" },
  { id: 61, name: "寶劍騎士", meaning: "行動、衝突、決心", reversed: "延遲、缺乏決心" },
  { id: 62, name: "寶劍皇后", meaning: "獨立、智慧、直接", reversed: "依賴、缺乏智慧" },
  { id: 63, name: "寶劍國王", meaning: "權威、真理、清晰", reversed: "專制、缺乏清晰" },
  
  // 錢幣系列
  { id: 64, name: "錢幣王牌", meaning: "新的機會、繁榮、潛力", reversed: "錯失機會、缺乏繁榮" },
  { id: 65, name: "錢幣二", meaning: "平衡、適應、優先級", reversed: "不平衡、缺乏適應" },
  { id: 66, name: "錢幣三", meaning: "團隊合作、技能、成長", reversed: "缺乏合作、技能不足" },
  { id: 67, name: "錢幣四", meaning: "安全、保守、物質主義", reversed: "貪婪、缺乏安全" },
  { id: 68, name: "錢幣五", meaning: "困難、貧困、健康問題", reversed: "改善、恢復" },
  { id: 69, name: "錢幣六", meaning: "慷慨、禮物、支持", reversed: "自私、缺乏支持" },
  { id: 70, name: "錢幣七", meaning: "耐心、長期規劃、投資", reversed: "缺乏耐心、短期思維" },
  { id: 71, name: "錢幣八", meaning: "技能發展、專注、進步", reversed: "缺乏進步、技能停滯" },
  { id: 72, name: "錢幣九", meaning: "獨立、成功、自給自足", reversed: "依賴、缺乏成功" },
  { id: 73, name: "錢幣十", meaning: "家庭財富、傳承、穩定", reversed: "家庭不和諧、缺乏穩定" },
  { id: 74, name: "錢幣侍從", meaning: "學習、機會、新技能", reversed: "缺乏學習、錯失機會" },
  { id: 75, name: "錢幣騎士", meaning: "勤奮、責任、進步", reversed: "懶惰、缺乏責任" },
  { id: 76, name: "錢幣皇后", meaning: "繁榮、實用、關懷", reversed: "缺乏繁榮、實用主義" },
  { id: 77, name: "錢幣國王", meaning: "成功、財富、領導", reversed: "缺乏成功、貪婪" }
];

const allCards = [...tarotCards, ...minorArcana];

// 隨機抽取塔羅牌
function drawCards(count) {
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(card => ({
    ...card,
    isReversed: Math.random() > 0.5
  }));
}

// AI塔羅解讀
async function getTarotReading(cards, question, readingType = 'general') {
  const cardDescriptions = cards.map(card => 
    `${card.name}${card.isReversed ? ' (逆位)' : ''}: ${card.isReversed ? card.reversed : card.meaning}`
  ).join('\n');

  const systemPrompt = `你是一位專業的塔羅牌占卜師，具有豐富的塔羅牌解讀經驗。請根據以下塔羅牌為用戶提供深入、準確且富有啟發性的解讀。

解讀要求：
1. 結合用戶的問題和抽到的牌面進行綜合分析
2. 解釋每張牌的含義及其在整體解讀中的作用
3. 提供具體的建議和指引
4. 使用溫暖、支持性的語言
5. 保持神秘而專業的語調
6. 回應使用繁體中文

塔羅牌信息：
${cardDescriptions}

用戶問題：${question}
占卜類型：${readingType}

請提供詳細的塔羅牌解讀，包括：
- 整體能量分析
- 每張牌的具體含義
- 牌陣的整體訊息
- 實用的建議和指引
- 未來發展的提示`;

  try {
    const completion = await openai.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `請為我解讀這些塔羅牌：${cardDescriptions}\n\n我的問題是：${question}` }
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2048,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI API錯誤:', error);
    return '抱歉，解讀服務暫時無法使用，請稍後再試。';
  }
}

// 是否塔羅占卜
async function getYesNoReading(question) {
  const card = drawCards(1)[0];
  
  const systemPrompt = `你是一位專業的塔羅牌占卜師，專門進行是否問題的占卜。請根據抽到的塔羅牌為用戶提供明確的是否答案和詳細解釋。

解讀要求：
1. 首先給出明確的是/否/可能答案
2. 解釋為什麼這張牌指向這個答案
3. 提供具體的建議和指引
4. 使用溫暖、支持性的語言
5. 回應使用繁體中文

抽到的牌：${card.name}${card.isReversed ? ' (逆位)' : ''}
牌面含義：${card.isReversed ? card.reversed : card.meaning}

用戶問題：${question}

請提供：
- 明確的是否答案
- 詳細的解釋
- 相關建議`;

  try {
    const completion = await openai.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `我的問題是：${question}\n\n抽到的牌是：${card.name}${card.isReversed ? ' (逆位)' : ''}` }
      ],
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 1024,
    });

    return {
      card: card,
      reading: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('AI API錯誤:', error);
    return {
      card: card,
      reading: '抱歉，解讀服務暫時無法使用，請稍後再試。'
    };
  }
}

// 每日塔羅運勢
async function getDailyReading() {
  const card = drawCards(1)[0];
  
  const systemPrompt = `你是一位專業的塔羅牌占卜師，專門提供每日塔羅運勢解讀。請根據抽到的塔羅牌為用戶提供今日運勢指引。

解讀要求：
1. 解釋這張牌對今日的意義
2. 提供具體的運勢指引
3. 給出今日的建議和提醒
4. 使用溫暖、激勵性的語言
5. 回應使用繁體中文

今日牌面：${card.name}${card.isReversed ? ' (逆位)' : ''}
牌面含義：${card.isReversed ? card.reversed : card.meaning}

請提供：
- 今日運勢概述
- 具體指引
- 幸運提示`;

  try {
    const completion = await openai.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `請為我解讀今日的塔羅運勢，抽到的牌是：${card.name}${card.isReversed ? ' (逆位)' : ''}` }
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 1024,
    });

    return {
      card: card,
      reading: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('AI API錯誤:', error);
    return {
      card: card,
      reading: '抱歉，運勢解讀服務暫時無法使用，請稍後再試。'
    };
  }
}

module.exports = {
  openai,
  allCards,
  drawCards,
  getTarotReading,
  getYesNoReading,
  getDailyReading
}; 
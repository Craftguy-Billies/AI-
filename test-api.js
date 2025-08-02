// 測試API端點
async function testAPI() {
    const baseURL = 'http://localhost:3000';
    
    console.log('🧪 開始測試AI塔羅牌系統API...\n');
    
    try {
        // 測試1: 獲取所有塔羅牌
        console.log('📋 測試1: 獲取所有塔羅牌');
        const cardsResponse = await fetch(`${baseURL}/api/cards`);
        const cards = await cardsResponse.json();
        console.log(`✅ 成功獲取 ${cards.length} 張塔羅牌\n`);
        
        // 測試2: 隨機抽取3張牌
        console.log('🎴 測試2: 隨機抽取3張牌');
        const drawResponse = await fetch(`${baseURL}/api/draw-cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: 3 })
        });
        const drawResult = await drawResponse.json();
        console.log('✅ 成功抽取牌:', drawResult.cards.map(c => `${c.name}${c.isReversed ? ' (逆位)' : ''}`).join(', '), '\n');
        
        // 測試3: AI塔羅占卜
        console.log('🔮 測試3: AI塔羅占卜');
        const tarotResponse = await fetch(`${baseURL}/api/tarot-reading`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: '我的事業發展如何？',
                cardCount: 3,
                readingType: 'career'
            })
        });
        const tarotResult = await tarotResponse.json();
        console.log('✅ AI塔羅占卜成功');
        console.log('問題:', tarotResult.question);
        console.log('抽到的牌:', tarotResult.cards.map(c => `${c.name}${c.isReversed ? ' (逆位)' : ''}`).join(', '));
        console.log('解讀長度:', tarotResult.reading.length, '字符\n');
        
        // 測試4: 是否塔羅占卜
        console.log('❓ 測試4: 是否塔羅占卜');
        const yesNoResponse = await fetch(`${baseURL}/api/yes-no-reading`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: '我應該接受這份工作嗎？'
            })
        });
        const yesNoResult = await yesNoResponse.json();
        console.log('✅ 是否塔羅占卜成功');
        console.log('問題:', yesNoResult.card.name + (yesNoResult.card.isReversed ? ' (逆位)' : ''));
        console.log('解讀長度:', yesNoResult.reading.length, '字符\n');
        
        // 測試5: 每日塔羅運勢
        console.log('📅 測試5: 每日塔羅運勢');
        const dailyResponse = await fetch(`${baseURL}/api/daily-reading`);
        const dailyResult = await dailyResponse.json();
        console.log('✅ 每日塔羅運勢成功');
        console.log('今日牌面:', dailyResult.card.name + (dailyResult.card.isReversed ? ' (逆位)' : ''));
        console.log('運勢長度:', dailyResult.reading.length, '字符\n');
        
        console.log('🎉 所有API測試通過！系統運行正常。');
        
    } catch (error) {
        console.error('❌ API測試失敗:', error.message);
    }
}

// 運行測試
testAPI(); 
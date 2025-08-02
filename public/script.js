// 全局變量
let currentCards = [];

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// 初始化事件監聽器
function initializeEventListeners() {
    // AI塔羅占卜表單
    const aiTarotForm = document.getElementById('aiTarotForm');
    if (aiTarotForm) {
        aiTarotForm.addEventListener('submit', handleAiTarotSubmit);
    }

    // 是否塔羅占卜表單
    const yesNoForm = document.getElementById('yesNoForm');
    if (yesNoForm) {
        yesNoForm.addEventListener('submit', handleYesNoSubmit);
    }
}

// 滾動到指定區域
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// 顯示指定標籤頁
function showTab(tabId) {
    const tab = new bootstrap.Tab(document.querySelector(`#${tabId}-tab`));
    tab.show();
    scrollToSection('services');
}

// 顯示載入動畫
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
        loading.scrollIntoView({ behavior: 'smooth' });
    }
}

// 隱藏載入動畫
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// 處理AI塔羅占卜提交
async function handleAiTarotSubmit(event) {
    event.preventDefault();
    
    const question = document.getElementById('question').value.trim();
    const cardCount = parseInt(document.getElementById('cardCount').value);
    const readingType = document.getElementById('readingType').value;
    
    if (!question) {
        alert('請輸入您的問題');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/tarot-reading.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question,
                cardCount: cardCount,
                readingType: readingType
            })
        });
        
        if (!response.ok) {
            throw new Error('網絡錯誤');
        }
        
        const data = await response.json();
        displayAiTarotResult(data);
        
    } catch (error) {
        console.error('AI塔羅占卜錯誤:', error);
        alert('占卜過程中發生錯誤，請稍後再試');
    } finally {
        hideLoading();
    }
}

// 處理是否塔羅占卜提交
async function handleYesNoSubmit(event) {
    event.preventDefault();
    
    const question = document.getElementById('yesNoQuestion').value.trim();
    
    if (!question) {
        alert('請輸入您的問題');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/yes-no-reading.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question
            })
        });
        
        if (!response.ok) {
            throw new Error('網絡錯誤');
        }
        
        const data = await response.json();
        displayYesNoResult(data);
        
    } catch (error) {
        console.error('是否塔羅占卜錯誤:', error);
        alert('占卜過程中發生錯誤，請稍後再試');
    } finally {
        hideLoading();
    }
}

// 獲取每日塔羅運勢
async function getDailyReading() {
    showLoading();
    
    try {
        const response = await fetch('/api/daily-reading.js');
        
        if (!response.ok) {
            throw new Error('網絡錯誤');
        }
        
        const data = await response.json();
        displayDailyResult(data);
        
    } catch (error) {
        console.error('每日運勢錯誤:', error);
        alert('獲取每日運勢時發生錯誤，請稍後再試');
    } finally {
        hideLoading();
    }
}

// 顯示AI塔羅占卜結果
function displayAiTarotResult(data) {
    const resultDiv = document.getElementById('aiTarotResult');
    
    if (!resultDiv) return;
    
    const cardsHtml = data.cards.map(card => 
        `<div class="tarot-card ${card.isReversed ? 'reversed' : ''}" title="${card.name}">
            ${card.name}
        </div>`
    ).join('');
    
    const readingHtml = `
        <div class="reading-result">
            <h5><i class="fas fa-crystal-ball"></i> 塔羅牌解讀結果</h5>
            
            <div class="mb-3">
                <h6>抽到的牌：</h6>
                <div class="d-flex flex-wrap justify-content-center">
                    ${cardsHtml}
                </div>
            </div>
            
            <div class="mb-3">
                <h6>您的問題：</h6>
                <p class="text-muted">${data.question}</p>
            </div>
            
            <div>
                <h6>AI解讀：</h6>
                <div class="reading-text">
                    ${data.reading.replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = readingHtml;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 顯示是否塔羅占卜結果
function displayYesNoResult(data) {
    const resultDiv = document.getElementById('yesNoResult');
    
    if (!resultDiv) return;
    
    const cardHtml = `
        <div class="tarot-card ${data.card.isReversed ? 'reversed' : ''}" title="${data.card.name}">
            ${data.card.name}
        </div>
    `;
    
    const readingHtml = `
        <div class="reading-result">
            <h5><i class="fas fa-question-circle"></i> 是否塔羅占卜結果</h5>
            
            <div class="mb-3">
                <h6>抽到的牌：</h6>
                <div class="d-flex justify-content-center">
                    ${cardHtml}
                </div>
            </div>
            
            <div>
                <h6>AI解讀：</h6>
                <div class="reading-text">
                    ${data.reading.replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = readingHtml;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 顯示每日塔羅運勢結果
function displayDailyResult(data) {
    const resultDiv = document.getElementById('dailyResult');
    
    if (!resultDiv) return;
    
    const cardHtml = `
        <div class="tarot-card ${data.card.isReversed ? 'reversed' : ''}" title="${data.card.name}">
            ${data.card.name}
        </div>
    `;
    
    const readingHtml = `
        <div class="daily-card">
            <h5><i class="fas fa-calendar-day"></i> 今日塔羅運勢</h5>
            
            <div class="mb-3">
                <h6>今日牌面：</h6>
                <div class="d-flex justify-content-center">
                    ${cardHtml}
                </div>
            </div>
            
            <div>
                <h6>今日運勢：</h6>
                <div class="reading-text">
                    ${data.reading.replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = readingHtml;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 隨機抽取塔羅牌（用於演示）
function drawRandomCards(count) {
    const cards = [];
    const allCards = [
        "愚者", "魔術師", "女祭司", "女皇", "皇帝", "教皇", "戀人", "戰車", "力量", "隱者",
        "命運之輪", "正義", "倒吊人", "死神", "節制", "惡魔", "塔", "星星", "月亮", "太陽", "審判", "世界"
    ];
    
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * allCards.length);
        const isReversed = Math.random() > 0.5;
        cards.push({
            name: allCards[randomIndex],
            isReversed: isReversed
        });
    }
    
    return cards;
}

// 格式化日期
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('zh-TW', options);
}

// 添加動畫效果
function addCardAnimation(cardElement) {
    cardElement.style.opacity = '0';
    cardElement.style.transform = 'scale(0.5)';
    
    setTimeout(() => {
        cardElement.style.transition = 'all 0.5s ease';
        cardElement.style.opacity = '1';
        cardElement.style.transform = 'scale(1)';
    }, 100);
}

// 錯誤處理函數
function handleError(error, context) {
    console.error(`${context}錯誤:`, error);
    alert(`在${context}過程中發生錯誤，請稍後再試`);
}

// 成功提示函數
function showSuccess(message) {
    // 可以實現一個漂亮的成功提示
    console.log('成功:', message);
}

// 驗證表單
function validateForm(formData) {
    const errors = [];
    
    if (!formData.question || formData.question.trim().length < 5) {
        errors.push('問題描述至少需要5個字符');
    }
    
    if (formData.cardCount && (formData.cardCount < 1 || formData.cardCount > 10)) {
        errors.push('抽牌數量必須在1-10之間');
    }
    
    return errors;
}

// 顯示驗證錯誤
function showValidationErrors(errors) {
    const errorMessage = errors.join('\n');
    alert('請修正以下錯誤：\n' + errorMessage);
}

// 防抖函數
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 節流函數
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 本地存儲功能
const storage = {
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('保存到本地存儲失敗:', error);
        }
    },
    
    load: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('從本地存儲讀取失敗:', error);
            return null;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('從本地存儲刪除失敗:', error);
        }
    }
};

// 保存占卜歷史
function saveReadingHistory(reading) {
    const history = storage.load('readingHistory') || [];
    history.unshift({
        ...reading,
        timestamp: new Date().toISOString()
    });
    
    // 只保留最近20條記錄
    if (history.length > 20) {
        history.splice(20);
    }
    
    storage.save('readingHistory', history);
}

// 獲取占卜歷史
function getReadingHistory() {
    return storage.load('readingHistory') || [];
}

// 清除占卜歷史
function clearReadingHistory() {
    storage.remove('readingHistory');
}

// 導出功能
window.tarotApp = {
    scrollToSection,
    showTab,
    getDailyReading,
    saveReadingHistory,
    getReadingHistory,
    clearReadingHistory
}; 
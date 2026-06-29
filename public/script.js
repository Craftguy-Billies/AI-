// ──────────────────────────────────────────────
//  Frontend Logger
// ──────────────────────────────────────────────
const frontendLog = {
    debug: (msg, meta) => console.debug('[FE-DEBUG] ' + msg, meta || ''),
    info: (msg, meta) => console.info('[FE-INFO] ' + msg, meta || ''),
    warn: (msg, meta) => console.warn('[FE-WARN] ' + msg, meta || ''),
    error: (msg, meta) => console.error('[FE-ERROR] ' + msg, meta || ''),
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function () {
    frontendLog.info('DOM loaded, initializing event listeners');
    initializeEventListeners();
    // Inject toast container for inline notifications
    injectToastContainer();
});

// ──────────────────────────────────────────────
//  Toast notification system (replaces alert())
// ──────────────────────────────────────────────
function injectToastContainer() {
    if (document.getElementById('toastContainer')) return;
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
}

function showToast(message, type) {
    if (type === undefined) type = 'error';
    const container = document.getElementById('toastContainer') || (injectToastContainer(), document.getElementById('toastContainer'));
    const toast = document.createElement('div');
    const bgColor = type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#2ecc71';
    toast.style.cssText = 'background:' + bgColor + ';color:white;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:14px;max-width:350px;word-wrap:break-word;animation:fadeIn 0.3s ease;';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(function () { toast.remove(); }, 300); }, 4000);
}

// ──────────────────────────────────────────────
//  HTML escaping utility (prevents XSS)
// ──────────────────────────────────────────────
function escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// 初始化事件監聽器
function initializeEventListeners() {
    const aiTarotForm = document.getElementById('aiTarotForm');
    if (aiTarotForm) {
        aiTarotForm.addEventListener('submit', handleAiTarotSubmit);
        frontendLog.debug('aiTarotForm listener attached');
    } else {
        frontendLog.warn('aiTarotForm element not found');
    }

    const yesNoForm = document.getElementById('yesNoForm');
    if (yesNoForm) {
        yesNoForm.addEventListener('submit', handleYesNoSubmit);
        frontendLog.debug('yesNoForm listener attached');
    } else {
        frontendLog.warn('yesNoForm element not found');
    }

    const dailyBtn = document.querySelector('[onclick="getDailyReading()"]');
    if (!dailyBtn) {
        frontendLog.warn('daily reading button (onclick) not found');
    }
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        frontendLog.debug('scrolled to section', { sectionId });
    } else {
        frontendLog.warn('scroll target not found', { sectionId });
    }
}

function showTab(tabId) {
    const tabEl = document.querySelector('#' + tabId + '-tab');
    if (!tabEl) {
        frontendLog.warn('showTab: tab element not found', { tabId });
        return;
    }
    const tab = new bootstrap.Tab(tabEl);
    tab.show();
    frontendLog.debug('tab shown', { tabId });
    scrollToSection('services');
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
        loading.scrollIntoView({ behavior: 'smooth' });
        frontendLog.debug('loading shown');
    } else {
        frontendLog.warn('loading element not found');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
        frontendLog.debug('loading hidden');
    }
}

// ──────────────────────────────────────────────
//  Unified fetch wrapper with timeout & logging
// ──────────────────────────────────────────────
async function apiFetch(url, options, timeoutMs) {
    if (options === undefined) options = {};
    if (timeoutMs === undefined) timeoutMs = 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);

    frontendLog.debug('apiFetch: starting', { url: url, method: options.method || 'GET' });

    try {
        const response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
        clearTimeout(timeoutId);

        frontendLog.debug('apiFetch: response received', { url: url, status: response.status, ok: response.ok });

        if (!response.ok) {
            let errBody = '';
            try { errBody = await response.text(); } catch (e) { /* ignore */ }
            throw new Error('HTTP ' + response.status + ': ' + (errBody || response.statusText));
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('請求超時，請檢查網絡連接後重試');
        }
        throw error;
    }
}

// ──────────────────────────────────────────────
//  Handler: AI塔羅占卜
// ──────────────────────────────────────────────
async function handleAiTarotSubmit(event) {
    event.preventDefault();

    const question = document.getElementById('question').value.trim();
    const cardCount = parseInt(document.getElementById('cardCount').value);
    const readingType = document.getElementById('readingType').value;

    const formErrors = validateForm({ question: question, cardCount: cardCount });
    if (formErrors.length > 0) {
        showValidationErrors(formErrors);
        frontendLog.warn('aiTarot form validation failed', { errors: formErrors });
        return;
    }

    frontendLog.info('aiTarot: submitting', { cardCount: cardCount, readingType: readingType, questionLen: question.length });
    showLoading();

    try {
        const data = await apiFetch('/api/tarot-reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question, cardCount: cardCount, readingType: readingType })
        });

        frontendLog.info('aiTarot: success', { cardCount: data.cards ? data.cards.length : 0, readingLen: data.reading ? data.reading.length : 0 });
        displayAiTarotResult(data);
        saveReadingHistory({ type: 'ai-tarot', question: question, cardCount: cardCount, readingType: readingType });
    } catch (error) {
        frontendLog.error('aiTarot: fetch failed', { error: error.message });
        handleError(error, 'AI塔羅占卜');
    } finally {
        hideLoading();
    }
}

// ──────────────────────────────────────────────
//  Handler: 是否塔羅占卜
// ──────────────────────────────────────────────
async function handleYesNoSubmit(event) {
    event.preventDefault();

    const question = document.getElementById('yesNoQuestion').value.trim();

    if (!question) {
        showToast('請輸入您的問題', 'warning');
        frontendLog.warn('yesNo: empty question');
        return;
    }

    frontendLog.info('yesNo: submitting', { questionLen: question.length });
    showLoading();

    try {
        const data = await apiFetch('/api/yes-no-reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question })
        });

        frontendLog.info('yesNo: success', { card: data.card ? data.card.name : 'N/A', readingLen: data.reading ? data.reading.length : 0 });
        displayYesNoResult(data);
        saveReadingHistory({ type: 'yes-no', question: question });
    } catch (error) {
        frontendLog.error('yesNo: fetch failed', { error: error.message });
        handleError(error, '是否塔羅占卜');
    } finally {
        hideLoading();
    }
}

// ──────────────────────────────────────────────
//  Handler: 每日塔羅運勢
// ──────────────────────────────────────────────
async function getDailyReading() {
    frontendLog.info('dailyReading: fetching');
    showLoading();

    try {
        const data = await apiFetch('/api/daily-reading');

        frontendLog.info('dailyReading: success', { card: data.card ? data.card.name : 'N/A', readingLen: data.reading ? data.reading.length : 0 });
        displayDailyResult(data);
        saveReadingHistory({ type: 'daily' });
    } catch (error) {
        frontendLog.error('dailyReading: fetch failed', { error: error.message });
        handleError(error, '獲取每日運勢');
    } finally {
        hideLoading();
    }
}
// ──────────────────────────────────────────────
//  Display helpers (XSS-safe)
// ──────────────────────────────────────────────
function safeReadingHtml(reading) {
    if (!reading) return '';
    return escapeHtml(reading).replace(/\n/g, '<br>');
}

function cardHtml(card) {
    if (!card) return '<div class="tarot-card">未知牌</div>';
    const reversedClass = card.isReversed ? 'reversed' : '';
    const name = escapeHtml(card.name);
    return '<div class="tarot-card ' + reversedClass + '" title="' + name + '">' + name + '</div>';
}

// 顯示AI塔羅占卜結果
function displayAiTarotResult(data) {
    const resultDiv = document.getElementById('aiTarotResult');
    if (!resultDiv) return;

    const cards = data.cards || [];
    const cardsHtml = cards.map(function (c) { return cardHtml(c); }).join('');
    const question = escapeHtml(data.question || '');
    const reading = safeReadingHtml(data.reading);

    resultDiv.innerHTML = ''
        + '<div class="reading-result">'
        + '<h5><i class="fas fa-crystal-ball"></i> 塔羅牌解讀結果</h5>'
        + '<div class="mb-3"><h6>抽到的牌：</h6><div class="d-flex flex-wrap justify-content-center">' + cardsHtml + '</div></div>'
        + '<div class="mb-3"><h6>您的問題：</h6><p class="text-muted">' + question + '</p></div>'
        + '<div><h6>AI解讀：</h6><div class="reading-text">' + reading + '</div></div>'
        + '</div>';

    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 顯示是否塔羅占卜結果
function displayYesNoResult(data) {
    const resultDiv = document.getElementById('yesNoResult');
    if (!resultDiv) return;

    const reading = safeReadingHtml(data.reading);

    resultDiv.innerHTML = ''
        + '<div class="reading-result">'
        + '<h5><i class="fas fa-question-circle"></i> 是否塔羅占卜結果</h5>'
        + '<div class="mb-3"><h6>抽到的牌：</h6><div class="d-flex justify-content-center">' + cardHtml(data.card) + '</div></div>'
        + '<div><h6>AI解讀：</h6><div class="reading-text">' + reading + '</div></div>'
        + '</div>';

    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 顯示每日塔羅運勢結果
function displayDailyResult(data) {
    const resultDiv = document.getElementById('dailyResult');
    if (!resultDiv) return;

    const reading = safeReadingHtml(data.reading);

    resultDiv.innerHTML = ''
        + '<div class="daily-card">'
        + '<h5><i class="fas fa-calendar-day"></i> 今日塔羅運勢</h5>'
        + '<div class="mb-3"><h6>今日牌面：</h6><div class="d-flex justify-content-center">' + cardHtml(data.card) + '</div></div>'
        + '<div><h6>今日運勢：</h6><div class="reading-text">' + reading + '</div></div>'
        + '</div>';

    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 錯誤處理函數 (uses toast instead of alert)
function handleError(error, context) {
    frontendLog.error(context + '錯誤:', error);
    showToast('在' + context + '過程中發生錯誤，請稍後再試', 'error');
}

// 成功提示函數
function showSuccess(message) {
    showToast(message, 'success');
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
    errors.forEach(function (msg) { showToast(msg, 'warning'); });
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
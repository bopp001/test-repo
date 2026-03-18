/**
 * 涓存椂璁垮鑱婂ぉ瀹?- 涓诲簲鐢ㄩ€昏緫
 * 鍔熻兘锛氭樉绀鸿瀹P鍜屽湴鍖恒€侀殢鏈鸿亰澶┿€?00绉掓棤杈撳叆鑷姩閫€鍑? */

(function() {
    'use strict';

    // ==================== 閰嶇疆 ====================
    const CONFIG = {
        TIMEOUT: 300,           // 瓒呮椂鏃堕棿锛堢锛?        WARNING_TIME: 60,       // 璀﹀憡鏃堕棿锛堢锛?        STORAGE_KEY: 'chat_session',
        WS_URL: 'wss://echo.websocket.org/'  // 婕旂ず鐢?WebSocket锛堝疄闄呴儴缃查渶鏇挎崲锛?    };

    // ==================== 鐘舵€佺鐞?====================
    const state = {
        userId: generateUserId(),
        userIp: '鏈煡',
        userLocation: '鏈煡',
        timeLeft: CONFIG.TIMEOUT,
        lastActivity: Date.now(),
        messages: [],
        ws: null,
        timerInterval: null
    };

    // ==================== 宸ュ叿鍑芥暟 ====================
    
    // 鐢熸垚闅忔満鐢ㄦ埛ID
    function generateUserId() {
        return '璁垮' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    // 鏍煎紡鍖栨椂闂?    function formatTime(date) {
        return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // 鐢熸垚闅忔満棰滆壊锛堢敤浜庡尯鍒嗕笉鍚岀敤鎴凤級
    function getRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // ==================== IP 鍜屼綅缃幏鍙?====================
    
    async function getUserInfo() {
        try {
            // 浣跨敤 ipapi.co 鑾峰彇 IP 鍜屽湴鐞嗕綅缃?            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            state.userIp = data.ip || '鏈煡';
            state.userLocation = data.city && data.country_name 
                ? `${data.city}, ${data.country_name}` 
                : '鏈煡鍦板尯';
            
            updateUserInfo();
        } catch (error) {
            console.error('鑾峰彇浣嶇疆澶辫触:', error);
            state.userIp = '鏈湴';
            state.userLocation = '鏈湴缃戠粶';
            updateUserInfo();
        }
    }

    function updateUserInfo() {
        document.getElementById('user-ip').textContent = `IP: ${maskIp(state.userIp)}`;
        document.getElementById('user-location').textContent = state.userLocation ? ` | ${state.userLocation}` : '';
    }

    // 闅愯棌 IP 閮ㄥ垎淇℃伅锛堥殣绉佷繚鎶わ級
    function maskIp(ip) {
        if (ip === '鏈湴' || ip === '鏈煡') return ip;
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.*.*`;
        }
        return ip;
    }

    // ==================== 鍊掕鏃跺姛鑳?====================
    
    function startTimer() {
        updateTimerDisplay();
        
        state.timerInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - state.lastActivity) / 1000);
            state.timeLeft = Math.max(0, CONFIG.TIMEOUT - elapsed);
            
            updateTimerDisplay();
            
            if (state.timeLeft <= 0) {
                timeoutExit();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerEl = document.getElementById('time-left');
        const timerContainer = document.getElementById('timer');
        
        timerEl.textContent = state.timeLeft;
        
        if (state.timeLeft <= CONFIG.WARNING_TIME) {
            timerContainer.classList.add('warning');
        } else {
            timerContainer.classList.remove('warning');
        }
    }

    function resetTimer() {
        state.lastActivity = Date.now();
        state.timeLeft = CONFIG.TIMEOUT;
        updateTimerDisplay();
    }

    function timeoutExit() {
        clearInterval(state.timerInterval);
        
        addSystemMessage('鈴?300绉掓棤鎿嶄綔锛屼細璇濆凡缁撴潫');
        
        setTimeout(() => {
            alert('浼氳瘽宸茬粨鏉燂紝鎰熻阿浣跨敤锛?);
            window.location.reload();
        }, 1500);
    }

    // ==================== 鑱婂ぉ鍔熻兘 ====================
    
    function initChat() {
        const chatArea = document.getElementById('chat-area');
        chatArea.innerHTML = ''; // 娓呯┖绌虹姸鎬?        
        addSystemMessage('馃帀 娆㈣繋杩涘叆涓存椂璁垮鑱婂ぉ瀹わ紒');
        addSystemMessage(`馃搷 浣犵殑浣嶇疆: ${state.userLocation || '鑾峰彇涓?..'}`);
        addSystemMessage('馃挕 300绉掓棤杈撳叆灏嗚嚜鍔ㄩ€€鍑?);
        
        // 妯℃嫙鍏朵粬鐢ㄦ埛鍔犲叆
        setTimeout(() => {
            simulateRandomUser();
        }, 3000);
        
        // 瀹氭湡妯℃嫙闅忔満娑堟伅
        setInterval(() => {
            if (Math.random() > 0.7) {
                simulateRandomMessage();
            }
        }, 15000);
    }

    function sendMessage() {
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        
        if (!content) return;
        
        resetTimer();
        
        const message = {
            id: Date.now(),
            userId: state.userId,
            ip: state.userIp,
            location: state.userLocation,
            content: content,
            time: new Date(),
            isOwn: true
        };
        
        addMessageToUI(message);
        state.messages.push(message);
        
        input.value = '';
        input.focus();
        
        // 妯℃嫙鍥炲锛堟紨绀虹敤锛?        if (Math.random() > 0.5) {
            setTimeout(() => {
                simulateReply();
            }, 2000 + Math.random() * 3000);
        }
    }

    function addMessageToUI(message) {
        const chatArea = document.getElementById('chat-area');
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.isOwn ? 'own' : ''}`;
        
        const time = formatTime(message.time);
        const maskedIp = maskIp(message.ip);
        
        messageEl.innerHTML = `
            <div class="message-header">
                <span class="ip">${maskedIp}</span>
                <span class="location">${message.location || '鏈煡'}</span>
                <span class="time">${time}</span>
            </div>
            <div class="message-content">${escapeHtml(message.content)}</div>
        `;
        
        chatArea.appendChild(messageEl);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function addSystemMessage(content) {
        const chatArea = document.getElementById('chat-area');
        const messageEl = document.createElement('div');
        messageEl.className = 'system-message';
        messageEl.textContent = content;
        chatArea.appendChild(messageEl);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // HTML 杞箟闃叉 XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== 妯℃嫙鍏朵粬鐢ㄦ埛锛堟紨绀虹敤锛?====================
    
    const randomNames = ['璁垮A3F2', '璁垮B8K1', '璁垮C5M9', '璁垮D2P4', '璁垮E7Q6'];
    const randomLocations = ['鍖椾含, 涓浗', '涓婃捣, 涓浗', '骞垮窞, 涓浗', '娣卞湷, 涓浗', '鏉窞, 涓浗'];
    const randomMessages = [
        '澶у濂斤紒',
        '杩欎釜鑱婂ぉ瀹ゆ尯鏈夋剰鎬濈殑',
        '鏈変汉鍦ㄧ嚎鍚楋紵',
        '娴嬭瘯涓€涓嬪姛鑳?,
        '鍝堝搱锛岄殢鏈鸿亰澶?,
        '300绉掑鑱婂悧锛?,
        'IP鏄剧ず鍔熻兘涓嶉敊',
        '鐣岄潰璁捐鎸哄ソ鐪嬬殑'
    ];

    function simulateRandomUser() {
        const name = randomNames[Math.floor(Math.random() * randomNames.length)];
        addSystemMessage(`馃懁 ${name} 鍔犲叆浜嗚亰澶╁`);
    }

    function simulateRandomMessage() {
        const name = randomNames[Math.floor(Math.random() * randomNames.length)];
        const location = randomLocations[Math.floor(Math.random() * randomLocations.length)];
        const content = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        
        const message = {
            id: Date.now(),
            userId: name,
            ip: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
            location: location,
            content: content,
            time: new Date(),
            isOwn: false
        };
        
        addMessageToUI(message);
    }

    function simulateReply() {
        const replies = ['鏀跺埌锛?, '鏈夋剰鎬?, '+1', '浜嗚В浜?, '鍝堝搱'];
        const content = replies[Math.floor(Math.random() * replies.length)];
        
        const message = {
            id: Date.now(),
            userId: '璁垮B8K1',
            ip: '192.168.1.100',
            location: '涓婃捣, 涓浗',
            content: content,
            time: new Date(),
            isOwn: false
        };
        
        addMessageToUI(message);
    }

    // ==================== 浜嬩欢鐩戝惉 ====================
    
    function initEventListeners() {
        // 鍙戦€佹寜閽?        document.getElementById('send-btn').addEventListener('click', sendMessage);
        
        // 鍥炶溅鍙戦€?        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
            resetTimer();
        });
        
        // 浠讳綍閿洏/榧犳爣娲诲姩閲嶇疆璁℃椂鍣?        document.addEventListener('keydown', resetTimer);
        document.addEventListener('click', resetTimer);
        document.addEventListener('mousemove', resetTimer);
        
        // 椤甸潰鍙鎬у彉鍖?        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                resetTimer();
            }
        });
    }

    // ==================== 鍒濆鍖?====================
    
    function init() {
        getUserInfo();
        initChat();
        startTimer();
        initEventListeners();
        
        console.log('馃幉 涓存椂璁垮鑱婂ぉ瀹ゅ凡鍚姩');
        console.log('鐢ㄦ埛ID:', state.userId);
    }

    // DOM 鍔犺浇瀹屾垚鍚庡惎鍔?    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

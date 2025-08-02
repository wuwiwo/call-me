document.addEventListener('DOMContentLoaded', function() {
    const notifyBtns = document.querySelectorAll('.bubble-btn');
    const countdownEl = document.getElementById('countdown');
    const secondsEl = document.getElementById('seconds');
    const notificationEl = document.getElementById('notification');
    const langZhBtn = document.getElementById('langZh');
    const langEnBtn = document.getElementById('langEn');
    const titleEl = document.getElementById('title');
    const subtitleEl = document.getElementById('subtitle');

    const webhookUrl = 'https://trigger.macrodroid.com/16c8a69d-d6b2-40f4-9b93-5d76880f3527/webhook';

    // 多语言文本
    const translations = {
        zh: {
            title: "CALL ME",
            subtitle: "点击下方按钮，我会立即收到通知",
            bubble1: "快上线",
            bubble2: "补护盾",
            bubble3: "紧急情况",
            bubble4: "我来领堡垒奖品",
            countdownText: "请等待 {seconds} 秒后再试",
            successMsg: "发送成功!",
            errorMsg: "发送失败: {error}",
            cooldownMsg: "请等待 {seconds} 秒后再试"
        },
        en: {
            title: "CALL ME",
            subtitle: "Click the button below to notify me immediately",
            bubble1: "Get online now",
            bubble2: "Shield up",
            bubble3: "Emergency",
            bubble4: "I'll claim the fort rewards",
            countdownText: "Please wait {seconds} seconds to try again",
            successMsg: "Sent successfully!",
            errorMsg: "Failed to send: {error}",
            cooldownMsg: "Please wait {seconds} seconds to try again"
        }
    };

    let currentLang = 'zh';
    let canClick = true;
    let countdownInterval;
    let isRequestPending = false;

    // 冷却
    const lastClickTime = localStorage.getItem('lastClickTime');
    if (lastClickTime) {
        const remainingTime = Math.max(0, 60 - Math.floor((Date.now() - lastClickTime) / 1000));
        if (remainingTime > 0) {
            startCountdown(remainingTime);
        }
    }


    function updateLanguage(lang) {
        currentLang = lang;
        const t = translations[lang];

        titleEl.textContent = t.title;
        subtitleEl.textContent = t.subtitle;

        const bubbles = document.querySelectorAll('.bubble-btn');
        bubbles[0].textContent = t.bubble1;
        bubbles[1].textContent = t.bubble2;
        bubbles[2].textContent = t.bubble3;
        bubbles[3].textContent = t.bubble4;

        // 更新按钮
        langZhBtn.classList.toggle('active', lang === 'zh');
        langEnBtn.classList.toggle('active', lang === 'en');
    }

    function showNotification(message, isSuccess = true) {
        notificationEl.textContent = message;
        notificationEl.className = 'notification ' + (isSuccess ? 'success' : 'error');
        notificationEl.classList.add('show');

        setTimeout(() => {
            notificationEl.classList.remove('show');
        }, 3000);
    }

    function startCountdown(initialSeconds = 60) {
        let seconds = initialSeconds;
        canClick = false;
        notifyBtns.forEach(btn => btn.disabled = true);
        countdownEl.classList.add('show');

        const t = translations[currentLang];
        secondsEl.textContent = seconds;
        countdownEl.innerHTML = t.countdownText.replace('{seconds}', `<span id="seconds">${seconds}</span>`);

        countdownInterval = setInterval(() => {
            seconds--;
            document.getElementById('seconds').textContent = seconds;

            if (seconds <= 0) {
                clearInterval(countdownInterval);
                notifyBtns.forEach(btn => btn.disabled = false);
                countdownEl.classList.remove('show');
                canClick = true;
                localStorage.removeItem('lastClickTime');
            }
        }, 1000);
    }

    // 语言切换
    langZhBtn.addEventListener('click', () => updateLanguage('zh'));
    langEnBtn.addEventListener('click', () => updateLanguage('en'));

    // 气泡按钮点击事件
    notifyBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!canClick || isRequestPending) return;

            const message = this.dataset.message;
            canClick = false;
            isRequestPending = true;
            localStorage.setItem('lastClickTime', Date.now());
            startCountdown();

            try {
                const response = await fetch(
                    `${webhookUrl}?message=${encodeURIComponent(message)}`, {
                        method: 'GET'
                    }
                );

                if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);

                const t = translations[currentLang];
                showNotification(t.successMsg);
            } catch (error) {
                const t = translations[currentLang];
                showNotification(t.errorMsg.replace('{error}', error.message), false);
            } finally {
                isRequestPending = false;
            }
        });
    });
});
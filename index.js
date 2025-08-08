document.addEventListener('DOMContentLoaded', function() {
    const notifyBtns = document.querySelectorAll('.bubble-btn');
    const countdownEl = document.getElementById('countdown');
    const notificationEl = document.getElementById('notification');
    const langZhBtn = document.getElementById('langZh');
    const langEnBtn = document.getElementById('langEn');
    const titleEl = document.getElementById('title');
    const subtitleEl = document.getElementById('subtitle');
    const userInfoEl = document.getElementById('userInfo');
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    const countdownNameEl = document.getElementById('countdownName');
    const countdownTextEl = document.getElementById('countdownText');
    const countdownAvatarEl = document.getElementById('countdownAvatar');
    const editProfileBtn = document.getElementById('editProfile');
    const profileModal = document.getElementById('profileModal');
    const closeModalBtn = document.querySelector('.close-btn');
    const saveProfileBtn = document.getElementById('saveProfile');
    const nicknameInput = document.getElementById('nickname');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const modalTitle = document.getElementById('modalTitle');

    const webhookUrl = 'https://trigger.macrodroid.com/16c8a69d-d6b2-40f4-9b93-5d76880f3527/webhook';

    // 多语言文本
    const translations = {
        zh: {
            title: "CALL ME",
            subtitle: "点击下方按钮，我会立即收到通知",
            bubble1: "快上线",
            bubble2: "补护盾",
            bubble3: "紧急情况",
            bubble4: "领奖品",
            countdownText: "请等待 {seconds} 秒后再试",
            successMsg: "发送成功!",
            errorMsg: "发送失败: {error}",
            cooldownMsg: "冷却中，{seconds}秒后可再次发送",
            bindTitle: "绑定账号",
            editTitle: "编辑资料",
            nicknamePlaceholder: "输入你的昵称",
            saveBtn: "保存信息",
            unregistered: "未绑定用户",
            defaultName: "玩家"
        },
        en: {
            title: "CALL ME",
            subtitle: "Click the button below to notify me immediately",
            bubble1: "Get online",
            bubble2: "Shield up",
            bubble3: "Emergency",
            bubble4: "Claim rewards",
            countdownText: "Please wait {seconds} seconds",
            successMsg: "Sent successfully!",
            errorMsg: "Failed to send: {error}",
            cooldownMsg: "Cooldown, try again in {seconds}s",
            bindTitle: "Bind Account",
            editTitle: "Edit Profile",
            nicknamePlaceholder: "Enter your nickname",
            saveBtn: "Save Profile",
            unregistered: "Unregistered",
            defaultName: "Player"
        }
    };

    let currentLang = 'zh';
    let canClick = true;
    let countdownInterval;
    let isRequestPending = false;
    let selectedAvatar = '1';

    // 初始化用户资料
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || null;

    // 加载用户资料
    function loadProfile() {
        if (!userProfile) {
            showProfileModal(true);
            userNameEl.textContent = translations[currentLang].unregistered;
            userAvatarEl.src = getAvatarUrl('1');
            return;
        }
        
        userNameEl.textContent = userProfile.nickname || translations[currentLang].defaultName;
        userAvatarEl.src = getAvatarUrl(userProfile.avatar);
    }

    // 获取头像URL（使用内联SVG）
    function getAvatarUrl(avatarId) {
        const avatars = {
            '1': "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2UzZTNlMCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjQiIGZpbGw9IiM1NTUiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjE1IiByPSI0IiBmaWxsPSIjNTU1Ii8+PHBhdGggZD0iTTE1IDI4IEE4IDQgMCAwIDEgMjUgMjgiIHN0cm9rZT0iIzU1NSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+",
            '2': "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2ZmY2NiZCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjQiIGZpbGw9IiM1NTUiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjE1IiByPSI0IiBmaWxsPSIjNTU1Ii8+PHBhdGggZD0iTTE1IDI3IEE2IDMgMCAwIDEgMjUgMjciIHN0cm9rZT0iIzU1NSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+",
            '3': "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2IzZGZmZSIvPjxyZWN0IHg9IjEyIiB5PSIxNSIgd2lkdGg9IjMiIGhlaWdodD0iNiIgZmlsbD0iIzU1NSIvPjxyZWN0IHg9IjI1IiB5PSIxNSIgd2lkdGg9IjMiIGhlaWdodD0iNiIgZmlsbD0iIzU1NSIvPjxwYXRoIGQ9Ik0xNSAyOCBBOCA0IDAgMCAxIDI1IDI4IiBzdHJva2U9IiM1NTUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==",
            '4': "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2ZmZGQ5OSIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTciIHI9IjMiIGZpbGw9IiM1NTUiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjE3IiByPSIzIiBmaWxsPSIjNTU1Ii8+PHBhdGggZD0iTTE0IDI2IEE4IDUgMCAwIDAgMjYgMjYiIHN0cm9rZT0iIzU1NSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+",
            '5': "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2RkZjBmMyIvPjxwYXRoIGQ9Ik0xNSwxNSBBMiAyIDAgMSwxIDE5LDE1IEEyIDIgMCAwLDEgMTUsMTUiIGZpbGw9IiM1NTUiLz48cGF0aCBkPSJNMjUsMTUgQTIsMiAwIDEsMSAyOSwxNSBBMiwyIDAgMCwxIDI1LDE1IiBmaWxsPSIjNTU1Ii8+PGVsbGlwc2UgY3g9IjIwIiBjeT0iMjUiIHJ4PSI1IiByeT0iMyIgZmlsbD0iIzU1NSIvPjwvc3ZnPg==",
            '6': "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2NjZmZjYyIvPjxwYXRoIGQ9Ik0xNSwxOCBBMiAyIDAgMSwxIDE5LDE4IEEyIDIgMCAwLDEgMTUsMTgiIGZpbGw9IiM1NTUiLz48cGF0aCBkPSJNMjUsMTggQTIsMiAwIDEsMSAyOSwxOCBBMiwyIDAgMCwxIDI1LDE4IiBmaWxsPSIjNTU1Ii8+PHBhdGggZD0iTTE1LDI1IEE2LDQgMCAwLDAgMjUsMjUiIHN0cm9rZT0iIzU1NSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+"
        };
        return avatars[avatarId] || avatars['1'];
    }

    // 显示/隐藏模态框
    function showProfileModal(isNewUser = false) {
        modalTitle.textContent = isNewUser 
            ? translations[currentLang].bindTitle 
            : translations[currentLang].editTitle;
            
        nicknameInput.value = userProfile?.nickname || '';
        nicknameInput.placeholder = translations[currentLang].nicknamePlaceholder;
        
        // 重置头像选择
        avatarOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.avatar === (userProfile?.avatar || '1')) {
                option.classList.add('active');
                selectedAvatar = option.dataset.avatar;
            }
        });
        
        profileModal.classList.add('show');
    }

    // 保存用户资料
    function saveProfile() {
        const nickname = nicknameInput.value.trim();
        
        if (!nickname) {
            alert(translations[currentLang].nicknamePlaceholder);
            return;
        }
        
        userProfile = {
            nickname,
            avatar: selectedAvatar
        };
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        profileModal.classList.remove('show');
        
        // 更新UI
        userNameEl.textContent = userProfile.nickname;
        userAvatarEl.src = getAvatarUrl(userProfile.avatar);
    }

    // 更新语言
    function updateLanguage(lang) {
        currentLang = lang;
        const t = translations[lang];

        titleEl.textContent = t.title;
        subtitleEl.textContent = t.subtitle;

        const bubbles = document.querySelectorAll('.bubble-btn');
        bubbles[0].innerHTML = `<i class="fas fa-bolt"></i> ${t.bubble1}`;
        bubbles[1].innerHTML = `<i class="fas fa-shield-alt"></i> ${t.bubble2}`;
        bubbles[2].innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${t.bubble3}`;
        bubbles[3].innerHTML = `<i class="fas fa-gift"></i> ${t.bubble4}`;

        // 更新按钮
        langZhBtn.classList.toggle('active', lang === 'zh');
        langEnBtn.classList.toggle('active', lang === 'en');
        
        // 更新用户信息
        if (userProfile) {
            userNameEl.textContent = userProfile.nickname;
        } else {
            userNameEl.textContent = t.unregistered;
        }
    }

    function showNotification(message, isSuccess = true) {
        notificationEl.innerHTML = isSuccess 
            ? `<i class="fas fa-check-circle"></i> ${message}`
            : `<i class="fas fa-exclamation-circle"></i> ${message}`;
            
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
        
        // 更新倒计时显示
        countdownNameEl.textContent = userProfile ? userProfile.nickname : t.defaultName;
        countdownTextEl.textContent = t.cooldownMsg.replace('{seconds}', seconds);
        countdownAvatarEl.src = userProfile 
            ? getAvatarUrl(userProfile.avatar) 
            : getAvatarUrl('1');

        countdownInterval = setInterval(() => {
            seconds--;
            countdownTextEl.textContent = t.cooldownMsg.replace('{seconds}', seconds);

            if (seconds <= 0) {
                clearInterval(countdownInterval);
                notifyBtns.forEach(btn => btn.disabled = false);
                countdownEl.classList.remove('show');
                canClick = true;
                localStorage.removeItem('lastClickTime');
            }
        }, 1000);
    }

    // 初始化用户资料
    loadProfile();

    // 语言切换
    langZhBtn.addEventListener('click', () => updateLanguage('zh'));
    langEnBtn.addEventListener('click', () => updateLanguage('en'));

    // 编辑资料按钮
    editProfileBtn.addEventListener('click', () => showProfileModal(false));

    // 关闭模态框
    closeModalBtn.addEventListener('click', () => profileModal.classList.remove('show'));
    
    // 点击模态框外部关闭
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove('show');
        }
    });

    // 头像选择
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            avatarOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedAvatar = option.dataset.avatar;
        });
    });

    // 保存资料
    saveProfileBtn.addEventListener('click', saveProfile);

    // 气泡按钮点击事件
    notifyBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!canClick || isRequestPending) return;
            
            // 检查是否已绑定账号
            if (!userProfile) {
                showNotification(translations[currentLang].bindTitle, false);
                showProfileModal(true);
                return;
            }

            const message = this.dataset.message;
            canClick = false;
            isRequestPending = true;
            localStorage.setItem('lastClickTime', Date.now());
            startCountdown();

            try {
                // 发送用户信息
                const params = new URLSearchParams({
                    message: message,
                    nickname: userProfile.nickname,
                    avatar: userProfile.avatar
                });
                
                const response = await fetch(
                    `${webhookUrl}?${params}`, {
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

    // 处理冷却状态
    const lastClickTime = localStorage.getItem('lastClickTime');
    if (lastClickTime) {
        const remainingTime = Math.max(0, 60 - Math.floor((Date.now() - lastClickTime) / 1000));
        if (remainingTime > 0) {
            startCountdown(remainingTime);
        }
    }
});
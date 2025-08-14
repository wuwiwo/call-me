// index.js
import { CONFIG } from "./config.js";
import { TRANSLATIONS } from "./translations.js";
import { soundManager } from "./sounds.js";

document.addEventListener("DOMContentLoaded", function () {
    // DOM元素引用
    const elements = {
        notifyBtns: document.querySelectorAll(".bubble-btn"),
        countdownEl: document.getElementById("countdown"),
        notificationEl: document.getElementById("notification"),
        langZhBtn: document.getElementById("langZh"),
        langEnBtn: document.getElementById("langEn"),
        titleEl: document.getElementById("title"),
        subtitleEl: document.getElementById("subtitle"),
        userInfoEl: document.getElementById("userInfo"),
        userNameEl: document.getElementById("userName"),
        userAvatarEl: document.getElementById("userAvatar"),
        countdownNameEl: document.getElementById("countdownName"),
        countdownTextEl: document.getElementById("countdownText"),
        countdownAvatarEl: document.getElementById("countdownAvatar"),
        editProfileBtn: document.getElementById("editProfile"),
        profileModal: document.getElementById("profileModal"),
        closeModalBtn: document.querySelector(".close-btn"),
        saveProfileBtn: document.getElementById("saveProfile"),
        nicknameInput: document.getElementById("nickname"),
        emojiOptions: document.querySelectorAll(".emoji-option"),
        modalTitle: document.getElementById("modalTitle")
    };

    // 应用状态
    const state = {
        currentLang: "zh",
        canClick: true,
        isRequestPending: false,
        selectedEmoji: CONFIG.emojiOptions[0],
        userProfile: JSON.parse(localStorage.getItem("userProfile")) || null,
        customButtons: JSON.parse(localStorage.getItem("customButtons")) || null
    };

    // 工具函数
    const utils = {
        getTranslation(keyPath) {
            const keys = keyPath.split(".");
            return keys.reduce(
                (obj, key) => (obj && obj[key]) || keyPath,
                TRANSLATIONS[state.currentLang]
            );
        },

        formatString(str, params) {
            return str.replace(/{(\w+)}/g, (_, key) => params[key] || "");
        },

        showElement(el, show = true) {
            el.classList.toggle("hidden", !show);
        }
    };

    // 用户资料相关
    const profile = {
        load() {
            if (!state.userProfile) {
                this.showModal(true);
                elements.userNameEl.textContent = utils.getTranslation(
                    "common.unregistered"
                );
                elements.userAvatarEl.textContent = CONFIG.defaultAvatar;
                return;
            }

            elements.userNameEl.textContent =
                state.userProfile.nickname ||
                utils.getTranslation(`common.defaultName.${state.currentLang}`);
            elements.userAvatarEl.textContent =
                state.userProfile.emoji || CONFIG.defaultAvatar;
        },

        showModal(isNewUser = false) {
            elements.modalTitle.textContent = utils.getTranslation(
                `profile.${isNewUser ? "bindTitle" : "editTitle"}`
            );

            elements.nicknameInput.value = state.userProfile?.nickname || "";
            elements.nicknameInput.placeholder = utils.getTranslation(
                "profile.nicknamePlaceholder"
            );

            elements.emojiOptions.forEach((option, index) => {
                option.classList.remove("active");
                if (
                    option.dataset.emoji ===
                    (state.userProfile?.emoji || CONFIG.emojiOptions[0])
                ) {
                    option.classList.add("active");
                    state.selectedEmoji = option.dataset.emoji;
                }
            });

            elements.profileModal.classList.add("show");
        },

        save() {
            const nickname = elements.nicknameInput.value.trim();

            if (!nickname) {
                alert(utils.getTranslation("profile.nicknamePlaceholder"));
                return;
            }

            state.userProfile = {
                nickname,
                emoji: state.selectedEmoji
            };

            localStorage.setItem(
                "userProfile",
                JSON.stringify(state.userProfile)
            );
            elements.profileModal.classList.remove("show");
            this.load();
        }
    };

    // 语言切换
    const language = {
        update(lang) {
            state.currentLang = lang;

            // 更新文本内容
            elements.titleEl.textContent = utils.getTranslation("common.title");
            elements.subtitleEl.textContent =
                utils.getTranslation("mainPage.subtitle");

            document.querySelectorAll(".bubble-btn").forEach((btn, index) => {
                btn.innerHTML = `<i class="fas fa-${this.getBubbleIcon(
                    index
                )}"></i> ${utils.getTranslation(
                    `mainPage.bubble${index + 1}`
                )}`;
            });

            // 更新按钮状态
            elements.langZhBtn.classList.toggle("active", lang === "zh");
            elements.langEnBtn.classList.toggle("active", lang === "en");

            // 更新用户信息
            if (state.userProfile) {
                elements.userNameEl.textContent = state.userProfile.nickname;
            } else {
                elements.userNameEl.textContent = utils.getTranslation(
                    "common.unregistered"
                );
            }
        },

        getBubbleIcon(index) {
            const icons = [
                "bolt",
                "shield-alt",
                "exclamation-triangle",
                "gift"
            ];
            return icons[index] || "circle";
        }
    };

    // 通知系统
    // 修改 notification 对象
    const notification = {
        show(message, isSuccess = true) {
            soundManager.playNotificationSound(isSuccess); // 播放通知音效
            const icon = isSuccess ? "paper-plane" : "times-circle";
            const statusClass = isSuccess ? "sent" : "error";

            elements.notificationEl.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
            elements.notificationEl.className = `notification ${statusClass}`;
            elements.notificationEl.classList.add("show");

            setTimeout(
                () => elements.notificationEl.classList.remove("show"),
                CONFIG.notificationDuration
            );
        },

        addHistoryRecord(message, isSuccess) {
            // 保留参数但不显示在历史记录
            const history =
                JSON.parse(localStorage.getItem("notificationHistory")) || [];
            history.unshift({
                timestamp: new Date().toISOString(),
                message,
                nickname:
                    state.userProfile?.nickname ||
                    utils.getTranslation("common.unregistered"),
                emoji: state.userProfile?.emoji || CONFIG.defaultAvatar,
                // 保留状态但不显示
                _status: isSuccess ? "success" : "error"
            });
            localStorage.setItem(
                "notificationHistory",
                JSON.stringify(history.slice(0, CONFIG.maxHistoryRecords))
            );
        }
    };

    // 倒计时系统
    const countdown = {
        interval: null,

        start(initialSeconds = CONFIG.cooldownTime) {
            let seconds = initialSeconds;
            state.canClick = false;
            elements.notifyBtns.forEach(btn => (btn.disabled = true));
            elements.countdownEl.classList.add("show");

            this.updateDisplay(seconds);

            this.interval = setInterval(() => {
                seconds--;
                this.updateDisplay(seconds);

                if (seconds <= 0) {
                    this.stop();
                }
            }, 1000);
        },

        stop() {
            clearInterval(this.interval);
            elements.notifyBtns.forEach(btn => (btn.disabled = false));
            elements.countdownEl.classList.remove("show");
            state.canClick = true;
            localStorage.removeItem("lastClickTime");
        },

        updateDisplay(seconds) {
            elements.countdownNameEl.textContent =
                state.userProfile?.nickname ||
                utils.getTranslation(`common.defaultName.${state.currentLang}`);
            elements.countdownTextEl.textContent = utils.formatString(
                utils.getTranslation("mainPage.cooldownMsg"),
                { seconds }
            );
            elements.countdownAvatarEl.textContent =
                state.userProfile?.emoji || CONFIG.defaultAvatar;
        }
    };

    // 新增按钮管理模块
const buttonManager = {
  customButtonCount: 0,
  
  init() {
    this.initIconSelectors();
    this.loadButtons();
    this.addEditButton();
    this.setupAddButton();
    this.setupSaveResetHandlers();
    this.loadExistingCustomButtons();
  },
  
  initIconSelectors() {
    const options = CONFIG.buttons.availableIcons.map(icon => 
      `<option value="${icon}"><i class="fas fa-${icon}"></i> ${icon}</option>`
    ).join('');
    
    document.querySelectorAll('.icon-selector').forEach(select => {
      select.innerHTML = `<option value="random">随机图标</option>${options}`;
    });
  },
  
  addEditButton() {
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.title = '编辑按钮';
    editBtn.innerHTML = '<i class="fas fa-sliders-h"></i>';
    editBtn.addEventListener('click', () => this.showEditModal());
    document.querySelector('.top-controls').prepend(editBtn);
  },
  
  setupAddButton() {
    document.getElementById('addCustomButton').addEventListener('click', () => {
      if (this.customButtonCount >= CONFIG.buttons.maxCustomButtons) {
        notification.show(`最多只能添加${CONFIG.buttons.maxCustomButtons}个自定义按钮`, false);
        return;
      }
      this.addCustomButtonForm();
    });
  },
  
  addCustomButtonForm() {
    const area = document.getElementById('customButtonsArea');
    const formId = `custom-form-${Date.now()}`;
    const buttonNumber = this.customButtonCount + 1;
    
    const form = document.createElement('div');
    form.className = 'custom-button-form';
    form.id = formId;
    
    form.innerHTML = `
      <div class="form-group custom-btn-group">
        <div class="custom-btn-header">
          <label>${utils.getTranslation("profile.customButton")} ${buttonNumber}</label>
          <button class="remove-custom-btn" data-form="${formId}">
            <i class="fas fa-times"></i> ${utils.getTranslation("common.delete")}
          </button>
        </div>
        <input type="text" class="custom-btn-text" 
               maxlength="${CONFIG.buttons.maxLength}" 
               placeholder="${utils.formatString(
                 utils.getTranslation("profile.buttonTextPlaceholder"),
                 { maxLength: CONFIG.buttons.maxLength }
               )}">
        <select class="icon-selector custom-btn-icon">
          <option value="random">${utils.getTranslation("profile.randomIcon")}</option>
          ${this.generateIconOptions()}
        </select>
      </div>
    `;
    
    area.appendChild(form);
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    form.querySelector('.remove-custom-btn').addEventListener('click', (e) => {
      document.getElementById(e.target.dataset.form).remove();
      this.customButtonCount--;
    });
    
    this.customButtonCount++;
  },
  
  generateIconOptions() {
    return CONFIG.buttons.availableIcons.map(icon => 
      `<option value="${icon}">${icon}</option>`
    ).join('');
  },
  
  setupSaveResetHandlers() {
    document.getElementById('saveButtons').addEventListener('click', () => this.saveButtons());
    document.getElementById('resetButtons').addEventListener('click', () => this.resetToDefault());
    document.getElementById('closeButtonEdit').addEventListener('click', () => {
      document.getElementById('buttonEditModal').classList.remove('show');
    });
  },
  
  loadExistingCustomButtons() {
    if (state.customButtons && state.customButtons.length > CONFIG.buttons.defaultButtons.length) {
      const existingCustomCount = state.customButtons.length - CONFIG.buttons.defaultButtons.length;
      this.customButtonCount = existingCustomCount; // 初始化计数
      
      for (let i = 0; i < existingCustomCount; i++) {
        this.addCustomButtonForm();
      }
    }
  },
  
  showEditModal() {
    const modal = document.getElementById('buttonEditModal');
    const buttons = state.customButtons || CONFIG.buttons.defaultButtons;
    
    // 填充默认按钮
    CONFIG.buttons.defaultButtons.forEach((_, index) => {
      document.getElementById(`button${index+1}Text`).value = buttons[index].message;
      document.getElementById(`button${index+1}Icon`).value = buttons[index].icon;
    });
    
    // 填充自定义按钮
    const customForms = document.querySelectorAll('.custom-button-form');
    customForms.forEach((form, index) => {
      const btnIndex = index + CONFIG.buttons.defaultButtons.length;
      if (buttons[btnIndex]) {
        form.querySelector('.custom-btn-text').value = buttons[btnIndex].message;
        form.querySelector('.custom-btn-icon').value = buttons[btnIndex].icon;
      }
    });
    
    modal.classList.add('show');
  },
  
  saveButtons() {
    // 保存默认按钮
    const defaultButtons = CONFIG.buttons.defaultButtons.map((defaultBtn, index) => ({
      ...defaultBtn,
      message: document.getElementById(`button${index+1}Text`).value.trim() || defaultBtn.message,
      icon: document.getElementById(`button${index+1}Icon`).value
    }));
    
    // 收集自定义按钮
    const customButtons = [];
    document.querySelectorAll('.custom-button-form').forEach((form, index) => {
      const text = form.querySelector('.custom-btn-text').value.trim();
      const icon = form.querySelector('.custom-btn-icon').value;
      
      if (text) {
        customButtons.push({
          id: `custom_${index + 1}`,
          message: text,
          icon: icon
        });
      }
    });
    
    // 验证长度
    const allButtons = [...defaultButtons, ...customButtons];
    if (allButtons.some(btn => btn.message.length > CONFIG.buttons.maxLength)) {
      notification.show(
        utils.formatString(
          utils.getTranslation("notification.buttonTextTooLong"),
          { maxLength: CONFIG.buttons.maxLength }
        ), 
        false
      );
      return;
    }
    
    // 保存到状态
    state.customButtons = allButtons;
    localStorage.setItem('customButtons', JSON.stringify(allButtons));
    this.loadButtons();
    document.getElementById('buttonEditModal').classList.remove('show');
  },
  
  resetToDefault() {
    if (confirm(utils.getTranslation("profile.confirmReset"))) {
      state.customButtons = null;
      localStorage.removeItem('customButtons');
      this.customButtonCount = 0;
      document.getElementById('customButtonsArea').innerHTML = '';
      this.loadButtons();
      document.getElementById('buttonEditModal').classList.remove('show');
    }
  },
  
  loadButtons() {
    const buttons = state.customButtons || CONFIG.buttons.defaultButtons;
    const container = document.querySelector('.bubble-container');
    container.innerHTML = '';
    
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = 'btn bubble-btn';
      button.dataset.message = btn.message;
      button.dataset.id = btn.id;
      
      const icon = btn.icon === 'random' ? this.getRandomIcon() : btn.icon;
      button.innerHTML = `<i class="fas fa-${icon}"></i> ${btn.message}`;
      
      button.addEventListener('click', async function() {
        if (!state.canClick || state.isRequestPending) return;
        if (!state.userProfile) {
          notification.show(utils.getTranslation("profile.bindTitle"), false);
          profile.showModal(true);
          return;
        }

        state.canClick = false;
        state.isRequestPending = true;
        localStorage.setItem("lastClickTime", Date.now());
        countdown.start();

        try {
          const params = new URLSearchParams({
            message: btn.message,
            nickname: state.userProfile.nickname,
            emoji: state.userProfile.emoji
          });

          const response = await fetch(`${CONFIG.webhookUrl}?${params}`, {
            method: "GET"
          });

          if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
          notification.show(utils.getTranslation("notification.successMsg"));
          notification.addHistoryRecord(btn.message, true);
        } catch (error) {
          notification.show(
            utils.formatString(utils.getTranslation("notification.errorMsg"), 
            { error: error.message }
          ), false);
          notification.addHistoryRecord(btn.message, false);
        } finally {
          state.isRequestPending = false;
        }
      });
      
      container.appendChild(button);
    });
  },
  
  getRandomIcon() {
    return CONFIG.buttons.availableIcons[
      Math.floor(Math.random() * CONFIG.buttons.availableIcons.length)
    ];
  }
};

    // 初始化
    const init = async () => {
        await soundManager.preload();
        profile.load();
        buttonManager.init();

        // 加载已有的自定义按钮
        if (state.customButtons && state.customButtons.length > 2) {
            const customCount = state.customButtons.length - 2;
            for (let i = 0; i < customCount; i++) {
                buttonManager.addCustomButtonForm();
            }
        }
        // 添加按钮编辑相关事件
        document
            .getElementById("saveButtons")
            .addEventListener("click", () => buttonManager.saveButtons());
        document
            .getElementById("resetButtons")
            .addEventListener("click", () => buttonManager.resetToDefault());
        document
            .getElementById("closeButtonEdit")
            .addEventListener("click", () => {
                document
                    .getElementById("buttonEditModal")
                    .classList.remove("show");
            });

        //点击音效
        elements.userAvatarEl.addEventListener("click", () => {
            try {
                soundManager.playAvatarSound(
                    state.userProfile?.emoji || CONFIG.defaultAvatar
                );
            } catch (e) {
                console.warn("音效播放失败:", e);
            }
        });
        //切换翻译
        elements.langZhBtn.addEventListener("click", () =>
            language.update("zh")
        );
        elements.langEnBtn.addEventListener("click", () =>
            language.update("en")
        );
        elements.editProfileBtn.addEventListener("click", () =>
            profile.showModal(false)
        );
        elements.closeModalBtn.addEventListener("click", () =>
            elements.profileModal.classList.remove("show")
        );
        elements.profileModal.addEventListener("click", e => {
            if (e.target === elements.profileModal) {
                elements.profileModal.classList.remove("show");
            }
        });

        elements.emojiOptions.forEach(option => {
            option.addEventListener("click", () => {
                elements.emojiOptions.forEach(opt =>
                    opt.classList.remove("active")
                );
                option.classList.add("active");
                state.selectedEmoji = option.dataset.emoji;
            });
        });

        elements.saveProfileBtn.addEventListener("click", () => profile.save());

        elements.notifyBtns.forEach(btn => {
            btn.addEventListener("click", async function () {
                if (!state.canClick || state.isRequestPending) return;

                if (!state.userProfile) {
                    notification.show(
                        utils.getTranslation("profile.bindTitle"),
                        false
                    );
                    profile.showModal(true);
                    return;
                }

                const message = this.dataset.message;
                state.canClick = false;
                state.isRequestPending = true;
                localStorage.setItem("lastClickTime", Date.now());
                countdown.start();

                try {
                    const params = new URLSearchParams({
                        message,
                        nickname: state.userProfile.nickname,
                        emoji: state.userProfile.emoji
                    });

                    const response = await fetch(
                        `${CONFIG.webhookUrl}?${params}`,
                        {
                            method: "GET"
                        }
                    );

                    if (!response.ok)
                        throw new Error(`HTTP错误: ${response.status}`);

                    notification.show(
                        utils.getTranslation("notification.successMsg")
                    );
                    notification.addHistoryRecord(message, true);
                } catch (error) {
                    notification.show(
                        utils.formatString(
                            utils.getTranslation("notification.errorMsg"),
                            { error: error.message }
                        ),
                        false
                    );
                    notification.addHistoryRecord(message, false);
                } finally {
                    state.isRequestPending = false;
                }
            });
        });

        // 处理冷却状态
        const lastClickTime = localStorage.getItem("lastClickTime");
        if (lastClickTime) {
            const remainingTime = Math.max(
                0,
                CONFIG.cooldownTime -
                    Math.floor((Date.now() - lastClickTime) / 1000)
            );
            if (remainingTime > 0) {
                countdown.start(remainingTime);
            }
        }

        // 添加历史记录按钮
        const historyBtn = document.createElement("button");
        historyBtn.className = "icon-btn";
        historyBtn.title = utils.getTranslation("history.title");
        historyBtn.innerHTML = '<i class="fas fa-history"></i>';
        historyBtn.addEventListener(
            "click",
            () => (window.location.href = "history.html")
        );
        document.querySelector(".top-controls").prepend(historyBtn);
    };

    init();
});

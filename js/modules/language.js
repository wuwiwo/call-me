// /src/modules/language.js
import { TRANSLATIONS } from './translations.js';
import { utils } from './utils.js';
import { state } from './state.js';
import { buttonManager } from './buttonManager.js';

// 多语言管理
export const language = {
    // DOM元素缓存
    elements: null,
    
    // 初始化
    init(domElements) {
        this.elements = domElements;
        this.bindEvents();
    },
    
    // 绑定语言切换事件
    bindEvents() {
        this.elements.langZhBtn.addEventListener("click", () => this.update("zh"));
        this.elements.langEnBtn.addEventListener("click", () => this.update("en"));
    },
    
    // 更新界面语言
    update(lang) {
        state.currentLang = lang;
        
        // 更新文本内容
        this.elements.titleEl.textContent = utils.getTranslation("common.title");
        this.elements.subtitleEl.textContent = utils.getTranslation("mainPage.subtitle");
        
        // 更新按钮状态
        this.elements.langZhBtn.classList.toggle("active", lang === "zh");
        this.elements.langEnBtn.classList.toggle("active", lang === "en");
        
        // 更新用户信息
        if (state.userProfile) {
            this.elements.userNameEl.textContent = state.userProfile.nickname;
        } else {
            this.elements.userNameEl.textContent = utils.getTranslation("common.unregistered");
        }
        
        // 刷新按钮文本
        buttonManager.refreshButtonTexts();
    },
    
    // 获取气泡按钮图标
    getBubbleIcon(index) {
        const icons = ["bolt", "shield-alt", "exclamation-triangle", "gift"];
        return icons[index] || "circle";
    }
};
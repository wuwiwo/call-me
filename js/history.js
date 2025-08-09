document.addEventListener('DOMContentLoaded', function() {
    const historyList = document.getElementById('historyList');
    const backBtn = document.getElementById('historyBack');
    const historyData = JSON.parse(localStorage.getItem('notificationHistory')) || [];

    backBtn.addEventListener('click', () => window.history.back());

    function renderHistory() {
        if (historyData.length === 0) {
            historyList.innerHTML = '<div class="empty-state">暂无历史记录</div>';
            return;
        }

        
    historyList.innerHTML = historyData.map(item => `
        <div class="history-item">
            <div class="history-emoji">${item.emoji}</div>
            <div class="history-content">
                <div class="history-header">
                    <span class="history-name">${item.nickname}</span>
                    <span class="history-time">${formatTime(item.timestamp)}</span>
                </div>
                <div class="history-message">${item.message}</div>
            </div>
        </div>
    `).join('');
    }

    function formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString();
    }

    renderHistory();
});
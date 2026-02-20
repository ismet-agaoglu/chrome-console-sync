let syncBtn = null;

// Başlangıçta durumu kontrol et
chrome.storage.local.get(['syncActive'], (result) => {
    if (result.syncActive) {
        createFloatingButton();
    }
});

// Popup'tan gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleChanged') {
        if (request.status) {
            createFloatingButton();
        } else {
            removeFloatingButton();
        }
    }
});

function createFloatingButton() {
    if (document.getElementById('console-sync-floating-btn')) return;

    syncBtn = document.createElement('button');
    syncBtn.id = 'console-sync-floating-btn';
    syncBtn.innerText = '🚀 Sync';
    
    // Stil tanımlamaları
    Object.assign(syncBtn.style, {
        position: 'fixed',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: '999999',
        padding: '10px 15px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        fontWeight: 'bold'
    });

    syncBtn.onclick = () => {
        console.log('[ConsoleSync] Butona basıldı, script çalıştırılıyor...');
        runTargetScript();
    };

    document.body.appendChild(syncBtn);
}

function removeFloatingButton() {
    const btn = document.getElementById('console-sync-floating-btn');
    if (btn) btn.remove();
}

function runTargetScript() {
    // Birazdan verilecek olan özel JS kodu buraya entegre edilecek veya buradan tetiklenecek
    alert('Buton çalışıyor! Şimdi konsol loglarını yakalama kodunu entegre edebiliriz.');
}

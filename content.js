let syncBtn = null;

// Durumu kontrol et
chrome.storage.local.get(['syncActive'], (result) => {
    if (result.syncActive) {
        createFloatingButton();
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleChanged') {
        request.status ? createFloatingButton() : removeFloatingButton();
    }
});

function createFloatingButton() {
    if (document.getElementById('console-sync-floating-btn')) return;

    syncBtn = document.createElement('button');
    syncBtn.id = 'console-sync-floating-btn';
    syncBtn.innerText = '🚀 Veri Çek';
    
    Object.assign(syncBtn.style, {
        position: 'fixed',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: '2147483647',
        padding: '12px',
        backgroundColor: '#e91e63',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center'
    });

    syncBtn.onclick = runTargetScript;
    document.body.appendChild(syncBtn);
}

function removeFloatingButton() {
    const btn = document.getElementById('console-sync-floating-btn');
    if (btn) btn.remove();
}

// Ana scripti sayfa context'ine enjekte eden fonksiyon
function runTargetScript() {
    console.log('[ConsoleSync] İşlem başlatılıyor...');

    // Sayfa içinde çalışacak olan "bridge" (köprü) script
    const scriptContent = `
        (function() {
            // 1. Console.log'u yakala
            const originalLog = console.log;
            console.log = function(...args) {
                originalLog.apply(console, args);
                const msg = args[0];
                // Eğer mesaj bizim formatımızdaysa (tarih + isim + pNo vs)
                if (typeof msg === 'string' && msg.includes(' + ')) {
                    window.dispatchEvent(new CustomEvent('SyncConsoleData', { detail: msg }));
                }
            };

            try {
                // 2. Senin verdiğin orijinal kod
                var selection = App.PoliklinikHastaListesi.getSelectionModel().getSelection();
                if (selection.length > 0) {
                    var record = selection[0].data;
                    Ext.getBody().mask('Veriler birleştiriliyor...');
                    Ext.Ajax.request({
                        url: '/Common/LaboratuarIslemleri/LaboratuarTab',
                        method: 'POST',
                        params: {
                            SiraNo: record.Sira,
                            ServisNo: record.ServisNo,
                            ProtokolNo: record.ProtokolNo,
                            ServisGrupNo: '19',
                            HastaTipi: 1,
                            GecmisiGoster: true,
                            DoktorNo: record.PoligrupDoktorNo > 0 ? record.PoligrupDoktorNo : record.DoktorNo,
                            AdSoyad: Ext.String.htmlDecode(record.AdiSoyadi),
                            MuayeneBaslangicSaati: record.MuayeneBaslangicSaati,
                            MaliYil: new Date(record.MuayeneTarihi).getFullYear(),
                            PoliklinikMenuMu: true
                        },
                        success: function (response) {
                            var rawResponse = response.responseText.trim();
                            try {
                                var cleanJS = rawResponse;
                                if (rawResponse.startsWith('<script')) {
                                    cleanJS = rawResponse.replace(/<script[^>]*>|<\\/script>/gi, "");
                                }
                                if (window.App && App.LaboratuarTab_Grid) { App.LaboratuarTab_Grid.destroy(); }
                                eval(cleanJS);
                                var maxAttempt = 25;
                                var attempt = 0;
                                var checkData = function() {
                                    var grid = App.LaboratuarTab_Grid;
                                    if (grid && grid.getStore()) {
                                        var store = grid.getStore();
                                        if (store.getCount() > 0) {
                                            store.each(function(item) {
                                                var mTarihi = Ext.Date.format(new Date(record.MuayeneTarihi), 'd.m.Y');
                                                var adSoyad = Ext.String.htmlDecode(record.AdiSoyadi);
                                                var pNo = record.ProtokolNo;
                                                var tetkikAdi = item.get('TetkikAdi') || (item.raw ? item.raw.TetkikAdi : "Bilinmiyor");
                                                var sonuc = item.get('Sonuc') || (item.raw ? item.raw.Sonuc : "-");
                                                var satir = mTarihi + " + " + adSoyad + " + " + pNo + " + " + tetkikAdi + " + " + sonuc;
                                                console.log(satir);
                                            });
                                            Ext.getBody().unmask();
                                            if (grid.up('window')) { grid.up('window').destroy(); } else { grid.destroy(); }
                                        } else if (attempt < maxAttempt) {
                                            attempt++; setTimeout(checkData, 150);
                                        } else { Ext.getBody().unmask(); }
                                    } else if (attempt < maxAttempt) {
                                        attempt++; setTimeout(checkData, 150);
                                    } else { Ext.getBody().unmask(); }
                                };
                                checkData();
                            } catch(e) { Ext.getBody().unmask(); console.error(e); }
                        },
                        failure: function() { Ext.getBody().unmask(); }
                    });
                } else {
                    alert('Lütfen bir kayıt seçin!');
                }
            } catch (err) {
                console.error('Script Hatası:', err);
                if(Ext && Ext.getBody) Ext.getBody().unmask();
            }
        })();
    `;

    const script = document.createElement('script');
    script.textContent = scriptContent;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
}

// Sayfa içinden gelen verileri dinle ve Backend'e gönder
window.addEventListener('SyncConsoleData', (e) => {
    const logData = e.detail;
    console.log('[ConsoleSync] Yakalanan Veri:', logData);
    
    // BACKEND GÖNDERİMİ
    fetch('http://localhost:3000/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: logData })
    })
    .then(r => r.json())
    .then(res => console.log('[ConsoleSync] Sunucu Yanıtı:', res))
    .catch(err => console.error('[ConsoleSync] Gönderim Hatası:', err));
});

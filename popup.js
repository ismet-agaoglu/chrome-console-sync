document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleSync');
  const statusLabel = document.getElementById('statusLabel');

  // Mevcut durumu yükle
  chrome.storage.local.get(['syncActive'], (result) => {
    toggle.checked = result.syncActive || false;
    updateLabel(toggle.checked);
  });

  toggle.addEventListener('change', () => {
    const isActive = toggle.checked;
    chrome.storage.local.set({ syncActive: isActive }, () => {
      updateLabel(isActive);
      // Content script'e haber ver
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleChanged', status: isActive });
        }
      });
    });
  });

  function updateLabel(isActive) {
    statusLabel.textContent = isActive ? 'Aktif' : 'Kapalı';
    statusLabel.style.color = isActive ? '#2196F3' : '#666';
  }
});
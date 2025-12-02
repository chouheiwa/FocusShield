import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

type FeatureType = 'focus' | 'fullscreen';

const PopupPage: React.FC = () => {
  const [hostname, setHostname] = useState<string>('');
  const [focusEnabled, setFocusEnabled] = useState<boolean>(false);
  const [fullscreenEnabled, setFullscreenEnabled] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // 获取当前标签页的URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const url = new URL(tabs[0].url);
        setHostname(url.hostname);

        // 检查当前网站是否已启用
        chrome.storage.sync.get(['focusBlockerSites', 'fullscreenBlockerSites'], (result) => {
          const focusSites: string[] = result.focusBlockerSites || [];
          const fullscreenSites: string[] = result.fullscreenBlockerSites || [];

          setFocusEnabled(focusSites.some(site => site.includes(url.hostname)));
          setFullscreenEnabled(fullscreenSites.some(site => site.includes(url.hostname)));
        });
      }
    });
  }, []);

  const toggleFeature = (feature: FeatureType): void => {
    chrome.storage.sync.get(['focusBlockerSites', 'fullscreenBlockerSites'], (result) => {
      const focusSites: string[] = result.focusBlockerSites || [];
      const fullscreenSites: string[] = result.fullscreenBlockerSites || [];
      const pattern = `*://*.${hostname}/*`;

      if (feature === 'focus') {
        const isEnabled = focusSites.some(site => site.includes(hostname));
        let updated: string[];

        if (isEnabled) {
          updated = focusSites.filter(site => !site.includes(hostname));
          setFocusEnabled(false);
          showMessage('已从焦点检测拦截器中移除');
        } else {
          updated = [...focusSites, pattern];
          setFocusEnabled(true);
          showMessage('已添加到焦点检测拦截器');
        }

        chrome.storage.sync.set({ focusBlockerSites: updated });
      } else {
        const isEnabled = fullscreenSites.some(site => site.includes(hostname));
        let updated: string[];

        if (isEnabled) {
          updated = fullscreenSites.filter(site => !site.includes(hostname));
          setFullscreenEnabled(false);
          showMessage('已从全屏检测拦截器中移除');
        } else {
          updated = [...fullscreenSites, pattern];
          setFullscreenEnabled(true);
          showMessage('已添加到全屏检测拦截器');
        }

        chrome.storage.sync.set({ fullscreenBlockerSites: updated });
      }

      // 重新加载当前标签页以应用更改
      chrome.tabs.reload();
    });
  };

  const showMessage = (msg: string): void => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const openOptions = (): void => {
    chrome.runtime.openOptionsPage();
  };

  const copyPageText = (): void => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            return document.body.innerText;
          }
        }, (results) => {
          if (results && results[0] && results[0].result) {
            navigator.clipboard.writeText(results[0].result).then(() => {
              showMessage('Page text copied to clipboard!');
            }).catch(err => {
              console.error('Failed to copy text: ', err);
              showMessage('Failed to copy text');
            });
          } else {
            showMessage('No text found on page');
          }
        });
      }
    });
  };

  return (
    <div className="popup-container">
      <div className="glass-background"></div>
      <div className="content-wrapper">
        <header className="popup-header">
          <div className="logo-area">
            <span className="logo-icon">🛡️</span>
            <h1>FocusShield</h1>
          </div>
          <button className="btn-icon-options" onClick={openOptions} title="设置">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.4 15C19.4 15 21.4 16 21.4 18C21.4 20 19.4 22 17.4 22C15.4 22 14.4 20 14.4 20M4.6 15C4.6 15 2.6 16 2.6 18C2.6 20 4.6 22 6.6 22C8.6 22 9.6 20 9.6 20M12 5V2M12 22V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12H5M19 12H22M17.4 2C17.4 2 19.4 4 19.4 6C19.4 8 17.4 10 15.4 10C13.4 10 12.4 8 12.4 8M6.6 2C6.6 2 4.6 4 4.6 6C4.6 8 6.6 10 8.6 10C10.6 10 11.6 8 11.6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </header>

        <main className="popup-main">
          <div className="current-site-card">
            <div className="site-info">
              <span className="status-dot"></span>
              <span className="site-label">Current Site</span>
            </div>
            <p className="site-hostname">{hostname || 'Loading...'}</p>
          </div>

          <div className="controls-section">
            <div className="control-card">
              <div className="control-header">
                <div className="control-icon focus-icon">
                  👁️
                </div>
                <div className="control-text">
                  <h3>Focus Guard</h3>
                  <p>Prevent window blur detection</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={focusEnabled}
                  onChange={() => toggleFeature('focus')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="control-card">
              <div className="control-header">
                <div className="control-icon fullscreen-icon">
                  ⛶
                </div>
                <div className="control-text">
                  <h3>Fullscreen Guard</h3>
                  <p>Block fullscreen detection</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={fullscreenEnabled}
                  onChange={() => toggleFeature('fullscreen')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="control-card" onClick={copyPageText} style={{ cursor: 'pointer' }}>
              <div className="control-header">
                <div className="control-icon copy-icon">
                  📋
                </div>
                <div className="control-text">
                  <h3>Copy Page Text</h3>
                  <p>Extract all visible text</p>
                </div>
              </div>
              <div className="action-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {message && (
            <div className="toast-message">
              {message}
            </div>
          )}
        </main>

        <footer className="popup-footer">
          <p>Refresh page to apply changes</p>
        </footer>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<PopupPage />);
}

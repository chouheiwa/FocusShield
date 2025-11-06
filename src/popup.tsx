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

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h2>🛡️ FocusShield</h2>
      </div>

      <div className="popup-content">
        <div className="current-site">
          <p className="label">当前网站：</p>
          <p className="site-name">{hostname}</p>
        </div>

        <div className="controls">
          <div className="control-item">
            <div className="control-info">
              <h3>焦点检测拦截器</h3>
              <p>阻止网页检测窗口失焦</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={focusEnabled}
                onChange={() => toggleFeature('focus')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="control-item">
            <div className="control-info">
              <h3>全屏检测拦截器</h3>
              <p>屏蔽全屏模式状态检测</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={fullscreenEnabled}
                onChange={() => toggleFeature('fullscreen')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        <button className="btn-options" onClick={openOptions}>
          打开配置中心
        </button>

        <div className="footer">
          <p>切换后需要刷新页面生效</p>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<PopupPage />);
}

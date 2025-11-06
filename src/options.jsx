import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './options.css';

const OptionsPage = () => {
  const [focusBlockerSites, setFocusBlockerSites] = useState([]);
  const [fullscreenBlockerSites, setFullscreenBlockerSites] = useState([]);
  const [newSite, setNewSite] = useState('');
  const [activeTab, setActiveTab] = useState('focus');

  useEffect(() => {
    // 加载已保存的配置
    chrome.storage.sync.get(['focusBlockerSites', 'fullscreenBlockerSites'], (result) => {
      setFocusBlockerSites(result.focusBlockerSites || []);
      setFullscreenBlockerSites(result.fullscreenBlockerSites || []);
    });
  }, []);

  const saveSites = (focus, fullscreen) => {
    chrome.storage.sync.set({
      focusBlockerSites: focus,
      fullscreenBlockerSites: fullscreen
    }, () => {
      console.log('配置已保存');
    });
  };

  const addSite = () => {
    if (!newSite.trim()) return;

    // 简单的URL格式化
    let site = newSite.trim();
    if (!site.startsWith('http://') && !site.startsWith('https://') && !site.startsWith('*://')) {
      site = '*://*.' + site + '/*';
    }

    if (activeTab === 'focus') {
      const updated = [...focusBlockerSites, site];
      setFocusBlockerSites(updated);
      saveSites(updated, fullscreenBlockerSites);
    } else {
      const updated = [...fullscreenBlockerSites, site];
      setFullscreenBlockerSites(updated);
      saveSites(focusBlockerSites, updated);
    }

    setNewSite('');
  };

  const removeSite = (index, type) => {
    if (type === 'focus') {
      const updated = focusBlockerSites.filter((_, i) => i !== index);
      setFocusBlockerSites(updated);
      saveSites(updated, fullscreenBlockerSites);
    } else {
      const updated = fullscreenBlockerSites.filter((_, i) => i !== index);
      setFullscreenBlockerSites(updated);
      saveSites(focusBlockerSites, updated);
    }
  };

  const currentSites = activeTab === 'focus' ? focusBlockerSites : fullscreenBlockerSites;

  return (
    <div className="container">
      <header className="header">
        <h1>🛡️ FocusShield 配置中心</h1>
        <p className="subtitle">管理焦点和全屏检测拦截器的启用网站</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'focus' ? 'active' : ''}`}
          onClick={() => setActiveTab('focus')}
        >
          焦点检测拦截器
        </button>
        <button
          className={`tab ${activeTab === 'fullscreen' ? 'active' : ''}`}
          onClick={() => setActiveTab('fullscreen')}
        >
          全屏检测拦截器
        </button>
      </div>

      <div className="content">
        <div className="add-section">
          <input
            type="text"
            className="input"
            placeholder="输入网址（例如: example.com 或 https://example.com/*）"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSite()}
          />
          <button className="btn btn-primary" onClick={addSite}>
            添加网站
          </button>
        </div>

        <div className="sites-list">
          <h3>已启用的网站 ({currentSites.length})</h3>
          {currentSites.length === 0 ? (
            <div className="empty-state">
              <p>暂无网站</p>
              <p className="hint">添加网站以在特定网址启用{activeTab === 'focus' ? '焦点检测拦截器' : '全屏检测拦截器'}</p>
            </div>
          ) : (
            <ul className="sites">
              {currentSites.map((site, index) => (
                <li key={index} className="site-item">
                  <span className="site-url">{site}</span>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => removeSite(index, activeTab)}
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="info-section">
          <h3>ℹ️ 说明</h3>
          <div className="info-content">
            <p><strong>焦点检测拦截器：</strong>阻止网页检测窗口失焦、鼠标离开等事件</p>
            <p><strong>全屏检测拦截器：</strong>屏蔽网页对全屏模式状态的检测</p>
            <p><strong>URL格式：</strong></p>
            <ul>
              <li>简单格式：<code>example.com</code> (自动转换为 *://*.example.com/*)</li>
              <li>精确格式：<code>https://example.com/*</code></li>
              <li>通配符：<code>*://example.com/*</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<OptionsPage />);

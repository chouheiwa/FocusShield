import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './options.css';

type TabType = 'focus' | 'fullscreen';

const OptionsPage: React.FC = () => {
  const [focusBlockerSites, setFocusBlockerSites] = useState<string[]>([]);
  const [fullscreenBlockerSites, setFullscreenBlockerSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('focus');

  useEffect(() => {
    // 加载已保存的配置
    chrome.storage.sync.get(['focusBlockerSites', 'fullscreenBlockerSites'], (result) => {
      setFocusBlockerSites(result.focusBlockerSites || []);
      setFullscreenBlockerSites(result.fullscreenBlockerSites || []);
    });
  }, []);

  const saveSites = (focus: string[], fullscreen: string[]): void => {
    chrome.storage.sync.set({
      focusBlockerSites: focus,
      fullscreenBlockerSites: fullscreen
    }, () => {
      console.log('配置已保存');
    });
  };

  const addSite = (): void => {
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

  const removeSite = (index: number, type: TabType): void => {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      addSite();
    }
  };

  const currentSites = activeTab === 'focus' ? focusBlockerSites : fullscreenBlockerSites;

  return (
    <div className="options-container">
      <div className="glass-background"></div>
      <div className="content-wrapper">
        <header className="options-header">
          <div className="logo-area">
            <span className="logo-icon">🛡️</span>
            <h1>FocusShield Configuration</h1>
          </div>
          <p className="subtitle">Manage blocked sites for Focus and Fullscreen detection</p>
        </header>

        <main className="options-main">
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'focus' ? 'active' : ''}`}
              onClick={() => setActiveTab('focus')}
            >
              <span className="tab-icon">👁️</span>
              Focus Guard
            </button>
            <button
              className={`tab-btn ${activeTab === 'fullscreen' ? 'active' : ''}`}
              onClick={() => setActiveTab('fullscreen')}
            >
              <span className="tab-icon">⛶</span>
              Fullscreen Guard
            </button>
          </div>

          <div className="panel-content">
            <div className="add-site-section">
              <div className="input-group">
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Enter domain (e.g. example.com)"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button className="btn-add" onClick={addSite}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Add Site
                </button>
              </div>
            </div>

            <div className="sites-list-section">
              <div className="list-header">
                <h3>Active Sites <span className="count-badge">{currentSites.length}</span></h3>
              </div>

              {currentSites.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <p>No sites configured</p>
                  <p className="hint">Add sites to enable {activeTab === 'focus' ? 'Focus Guard' : 'Fullscreen Guard'}</p>
                </div>
              ) : (
                <div className="sites-grid">
                  {currentSites.map((site, index) => (
                    <div key={index} className="site-card">
                      <div className="site-info">
                        <div className="site-icon">🌐</div>
                        <span className="site-url">{site}</span>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => removeSite(index, activeTab)}
                        title="Remove site"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <span className="info-icon">ℹ️</span>
              <h3>How it works</h3>
            </div>
            <div className="info-content">
              <div className="info-item">
                <strong>Focus Guard:</strong> Prevents websites from detecting when you switch tabs or minimize the window.
              </div>
              <div className="info-item">
                <strong>Fullscreen Guard:</strong> Blocks websites from detecting if you are in fullscreen mode.
              </div>
              <div className="info-item">
                <strong>URL Format:</strong>
                <div className="code-examples">
                  <code>example.com</code> → <code>*://*.example.com/*</code>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<OptionsPage />);
}

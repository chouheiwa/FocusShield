// background.js - Chrome Extension Service Worker (Manifest V3)

// 配置管理工具
const ConfigManager = {
  async getConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['focusBlockerSites', 'fullscreenBlockerSites'], (result) => {
        resolve({
          focusBlockerSites: result.focusBlockerSites || [],
          fullscreenBlockerSites: result.fullscreenBlockerSites || []
        });
      });
    });
  },

  matchesPattern(url, patterns) {
    if (patterns.length === 0) return false;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      return patterns.some(pattern => {
        if (pattern.includes('*')) {
          let regexStr = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');

          // Fix for *://*.domain.com/* matching domain.com
          // Replaces ://.*\. with ://(?:.*\.)? to make subdomain optional
          regexStr = regexStr.replace('://.*\\.', '://(?:.*\\.)?');

          return new RegExp(regexStr).test(url);
        }
        return url.includes(pattern) || hostname.includes(pattern);
      });
    } catch (e) {
      return false;
    }
  },

  async shouldEnableFocusBlocker(url) {
    const config = await this.getConfig();
    return this.matchesPattern(url, config.focusBlockerSites);
  },

  async shouldEnableFullscreenBlocker(url) {
    const config = await this.getConfig();
    return this.matchesPattern(url, config.fullscreenBlockerSites);
  }
};

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
  console.log('FocusShield 已安装/更新', details);

  // 初始化默认配置
  chrome.storage.sync.get(['focusBlockerSites', 'fullscreenBlockerSites'], (result) => {
    if (!result.focusBlockerSites) {
      chrome.storage.sync.set({ focusBlockerSites: [] });
    }
    if (!result.fullscreenBlockerSites) {
      chrome.storage.sync.set({ fullscreenBlockerSites: [] });
    }
  });
});

// 插件启动时的处理
chrome.runtime.onStartup.addListener(() => {
  console.log('Chrome启动，FocusShield 服务工作者已启动');
});

// 监听标签页更新，动态注入脚本
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // 只在页面加载完成时检查
  if (changeInfo.status === 'loading' && tab.url) {
    const url = tab.url;

    // 跳过chrome://和其他特殊URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return;
    }

    try {
      const shouldEnableFocus = await ConfigManager.shouldEnableFocusBlocker(url);
      const shouldEnableFullscreen = await ConfigManager.shouldEnableFullscreenBlocker(url);

      console.log(`检查 ${url}:`, {
        焦点拦截器: shouldEnableFocus,
        全屏拦截器: shouldEnableFullscreen
      });

      // 注入焦点检测拦截器
      if (shouldEnableFocus) {
        chrome.scripting.executeScript({
          target: { tabId: tabId, allFrames: true },
          files: ['common/focus-detection-blocker.js'],
          world: 'MAIN',
          injectImmediately: true
        }).catch(err => console.error('注入焦点拦截器失败:', err));
      }

      // 注入全屏检测拦截器
      if (shouldEnableFullscreen) {
        chrome.scripting.executeScript({
          target: { tabId: tabId, allFrames: true },
          files: ['common/forbid-fullscreen-dection.js'],
          world: 'MAIN',
          injectImmediately: true
        }).catch(err => console.error('注入全屏拦截器失败:', err));
      }
    } catch (error) {
      console.error('处理标签页更新失败:', error);
    }
  }
});
// 配置管理工具类
import type { Config, IConfigManager } from './types';

export const ConfigManager: IConfigManager = {
  // 获取所有配置
  async getConfig(): Promise<Config> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['focusBlockerSites', 'fullscreenBlockerSites'], (result) => {
        resolve({
          focusBlockerSites: result.focusBlockerSites || [],
          fullscreenBlockerSites: result.fullscreenBlockerSites || []
        });
      });
    });
  },

  // 保存配置
  async saveConfig(config: Config): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(config, () => {
        resolve();
      });
    });
  },

  // 检查URL是否匹配配置的模式
  matchesPattern(url: string, patterns: string[]): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      return patterns.some(pattern => {
        // 简单的通配符匹配
        if (pattern.includes('*')) {
          const regex = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
          return new RegExp(regex).test(url);
        }
        return url.includes(pattern) || hostname.includes(pattern);
      });
    } catch (e) {
      return false;
    }
  },

  // 检查是否应该在当前URL启用焦点拦截器
  async shouldEnableFocusBlocker(url: string): Promise<boolean> {
    const config = await this.getConfig();
    return this.matchesPattern(url, config.focusBlockerSites);
  },

  // 检查是否应该在当前URL启用全屏拦截器
  async shouldEnableFullscreenBlocker(url: string): Promise<boolean> {
    const config = await this.getConfig();
    return this.matchesPattern(url, config.fullscreenBlockerSites);
  }
};

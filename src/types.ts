// 配置类型定义
export interface Config {
  focusBlockerSites: string[];
  fullscreenBlockerSites: string[];
}

// 配置管理器接口
export interface IConfigManager {
  getConfig(): Promise<Config>;
  saveConfig(config: Config): Promise<void>;
  matchesPattern(url: string, patterns: string[]): boolean;
  shouldEnableFocusBlocker(url: string): Promise<boolean>;
  shouldEnableFullscreenBlocker(url: string): Promise<boolean>;
}

// background.js - Chrome Extension Service Worker (Manifest V3)

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
    console.log('FocusShield 已安装/更新', details);
});

// 插件启动时的处理
chrome.runtime.onStartup.addListener(() => {
    console.log('Chrome启动，FocusShield 服务工作者已启动');
});
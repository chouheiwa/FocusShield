// Fullscreen Detection Blocker
// 屏蔽网页对全屏模式状态的检测

(function() {
    'use strict';

    console.log('🛡️ 全屏检测拦截器正在初始化...');

    // 拦截 document.fullscreenElement 始终返回 null
    try {
        Object.defineProperty(Document.prototype, 'fullscreenElement', {
            get: function() {
                console.log('🔍 检测到读取 document.fullscreenElement');
                return null;
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ document.fullscreenElement 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 document.fullscreenElement 拦截失败:', e);
    }

    // 拦截 document.fullscreenEnabled 始终返回 true（不阻止全屏功能）
    try {
        Object.defineProperty(Document.prototype, 'fullscreenEnabled', {
            get: function() {
                console.log('🔍 检测到读取 document.fullscreenEnabled');
                return true;
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ document.fullscreenEnabled 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 document.fullscreenEnabled 拦截失败:', e);
    }

    // 拦截 Firefox 的 mozFullScreenElement
    try {
        Object.defineProperty(Document.prototype, 'mozFullScreenElement', {
            get: function() {
                console.log('🔍 检测到读取 document.mozFullScreenElement');
                return null;
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ document.mozFullScreenElement 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 document.mozFullScreenElement 拦截失败:', e);
    }

    // 拦截 WebKit 的 webkitFullscreenElement
    try {
        Object.defineProperty(Document.prototype, 'webkitFullscreenElement', {
            get: function() {
                console.log('🔍 检测到读取 document.webkitFullscreenElement');
                return null;
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ document.webkitFullscreenElement 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 document.webkitFullscreenElement 拦截失败:', e);
    }

    // 拦截 WebKit 的 webkitIsFullScreen
    try {
        Object.defineProperty(Document.prototype, 'webkitIsFullScreen', {
            get: function() {
                console.log('🔍 检测到读取 document.webkitIsFullScreen');
                return false;
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ document.webkitIsFullScreen 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 document.webkitIsFullScreen 拦截失败:', e);
    }

    // 拦截 fullscreenchange 事件监听
    const originalAddEventListener = Document.prototype.addEventListener;
    Document.prototype.addEventListener = function(type, listener, options) {
        if (type === 'fullscreenchange') {
            console.log('❌ 拦截 fullscreenchange 事件监听');
            return; // 不添加监听器
        }
        if (type === 'webkitfullscreenchange') {
            console.log('❌ 拦截 webkitfullscreenchange 事件监听');
            return; // 不添加监听器
        }
        if (type === 'mozfullscreenchange') {
            console.log('❌ 拦截 mozfullscreenchange 事件监听');
            return; // 不添加监听器
        }
        if (type === 'MSFullscreenChange') {
            console.log('❌ 拦截 MSFullscreenChange 事件监听');
            return; // 不添加监听器
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    console.log('✅ 全屏事件监听拦截已设置');

    // 拦截 onfullscreenchange 属性赋值
    try {
        Object.defineProperty(Document.prototype, 'onfullscreenchange', {
            get: function() {
                return null;
            },
            set: function(value) {
                console.log('❌ 拦截 onfullscreenchange 赋值:', value);
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ document.onfullscreenchange 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 document.onfullscreenchange 拦截失败:', e);
    }

    // 拦截其他浏览器前缀的 onfullscreenchange
    const fullscreenChangeProps = ['onwebkitfullscreenchange', 'onmozfullscreenchange', 'onMSFullscreenChange'];
    fullscreenChangeProps.forEach(prop => {
        try {
            Object.defineProperty(Document.prototype, prop, {
                get: function() {
                    return null;
                },
                set: function(value) {
                    console.log('❌ 拦截 ' + prop + ' 赋值:', value);
                },
                configurable: true,
                enumerable: true
            });
            console.log('✅ ' + prop + ' 拦截已设置');
        } catch(e) {
            console.error('⚠️ 设置 ' + prop + ' 拦截失败:', e);
        }
    });

    // 拦截 Element.prototype.requestFullscreen 方法（可选，如果想完全屏蔽全屏功能）
    // 注释掉这部分，因为用户只是想屏蔽检测，而不是完全禁用全屏
    /*
    const originalRequestFullscreen = Element.prototype.requestFullscreen;
    Element.prototype.requestFullscreen = function() {
        console.log('❌ 拦截 requestFullscreen 调用');
        // 可以选择不执行或抛出错误
        // throw new Error('Fullscreen is disabled');
    };
    console.log('✅ Element.requestFullscreen 拦截已设置');
    */

    console.log('🎉 全屏检测拦截器已完全激活！');
})();

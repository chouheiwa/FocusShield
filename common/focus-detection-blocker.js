// Focus Detection Blocker
// 阻止网页通过 onblur 事件检测窗口失焦

(function() {
    'use strict';
    
    console.log('🛡️ 焦点检测拦截器正在初始化...');
    
    // 重新定义 window.onblur 属性
    try {
        Object.defineProperty(window, 'onblur', {
            get: function() {
                console.log('🔍 检测到读取 window.onblur');
                return null;
            },
            set: function(value) {
                console.log('❌ 拦截 window.onblur 赋值:', value);
                // 不执行任何操作，直接忽略赋值
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ window.onblur 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 window.onblur 拦截失败:', e);
    }
    
    // 重新定义 window.onfocus 属性（可选，但可以一起拦截）
    try {
        Object.defineProperty(window, 'onfocus', {
            get: function() {
                console.log('🔍 检测到读取 window.onfocus');
                return null;
            },
            set: function(value) {
                console.log('❌ 拦截 window.onfocus 赋值:', value);
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ window.onfocus 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 window.onfocus 拦截失败:', e);
    }
    
    // 拦截通过 addEventListener 添加的 blur 事件
    const originalAddEventListener = Window.prototype.addEventListener;
    Window.prototype.addEventListener = function(type, listener, options) {
        if (type === 'blur' && this === window) {
            return; // 不添加监听器
        }
        if (type === 'focus' && this === window) {
            return; // 不添加监听器
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    console.log('✅ addEventListener 拦截已设置');
    
    // 拦截 document.addEventListener('visibilitychange' 和 'mouseleave')
    const originalDocAddEventListener = Document.prototype.addEventListener;
    Document.prototype.addEventListener = function(type, listener, options) {
        if (type === 'visibilitychange') {
            return; // 不添加监听器
        }
        if (type === 'mouseleave') {
            return; // 不添加监听器
        }
        return originalDocAddEventListener.call(this, type, listener, options);
    };
    console.log('✅ document.addEventListener 拦截已设置');
    
    // 拦截所有 HTML 元素上的 mouseleave 和 mouseout 事件
    const originalHTMLAddEventListener = HTMLElement.prototype.addEventListener;
    HTMLElement.prototype.addEventListener = function(type, listener, options) {
        if (type === 'mouseleave') {
            return; // 不添加监听器
        }
        if (type === 'mouseout') {
            return; // 不添加监听器
        }
        return originalHTMLAddEventListener.call(this, type, listener, options);
    };
    console.log('✅ HTMLElement.addEventListener 拦截已设置');
    
    // 拦截 document.onmouseleave 属性赋值
    try {
        Object.defineProperty(Document.prototype, 'onmouseleave', {
            get: function() {  
                return null;
            },
            set: function(value) {
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ document.onmouseleave 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 document.onmouseleave 拦截失败:', e);
    }
    
    // 拦截 body.onmouseleave 属性赋值（通过 HTMLElement）
    const originalOnmouseleaveDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onmouseleave');
    if (originalOnmouseleaveDescriptor) {
        Object.defineProperty(HTMLElement.prototype, 'onmouseleave', {
            get: function() {
                return null;
            },
            set: function(value) {
            },
            configurable: true,
            enumerable: true
        });
        console.log('✅ HTMLElement.onmouseleave 拦截已设置');
    }
    
    // 拦截 document.hasFocus() 始终返回 true
    const originalHasFocus = Document.prototype.hasFocus;
    Document.prototype.hasFocus = function() {
        return true;
    };
    console.log('✅ document.hasFocus() 拦截已设置');
    
    // 拦截 document.hidden 始终返回 false
    try {
        Object.defineProperty(Document.prototype, 'hidden', {
            get: function() {
                return false;
            },
            configurable: true
        });
        console.log('✅ document.hidden 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 document.hidden 拦截失败:', e);
    }
    
    // 拦截 document.visibilityState 始终返回 'visible'
    try {
        Object.defineProperty(Document.prototype, 'visibilityState', {
            get: function() {
                return 'visible';
            },
            configurable: true
        });
        console.log('✅ document.visibilityState 拦截已设置');
    } catch(e) {
        console.error('⚠️ 设置 document.visibilityState 拦截失败:', e);
    }
    
    console.log('🎉 焦点检测拦截器已完全激活！');
})();


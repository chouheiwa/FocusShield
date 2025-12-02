// Focus Detection Blocker
// 阻止网页通过 onblur, visibilitychange, mouseleave 等事件检测窗口失焦

(function () {
    'use strict';

    console.log('🛡️ 焦点检测拦截器正在初始化 (Enhanced)...');

    // 1. 拦截属性事件处理器 (onblur, onfocus, etc.)
    const eventProps = [
        { obj: window, props: ['onblur', 'onfocus'] },
        { obj: document, props: ['onvisibilitychange', 'onmouseleave', 'onmouseout'] },
        { obj: HTMLElement.prototype, props: ['onmouseleave', 'onmouseout'] }
    ];

    eventProps.forEach(({ obj, props }) => {
        props.forEach(prop => {
            try {
                Object.defineProperty(obj, prop, {
                    get: function () {
                        return null;
                    },
                    set: function (value) {
                        console.log(`❌ 拦截 ${prop} 赋值`);
                    },
                    configurable: true,
                    enumerable: true
                });
            } catch (e) {
                console.error(`⚠️ 设置 ${prop} 拦截失败:`, e);
            }
        });
    });

    // 2. 拦截 addEventListener (核心)
    // 使用 EventTarget.prototype 可以覆盖 Window, Document, Element 等所有目标
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (type, listener, options) {
        // 拦截 window 上的 blur/focus
        if (this === window && (type === 'blur' || type === 'focus')) {
            console.log(`🚫 拦截 window.${type} 监听器`);
            return;
        }

        // 拦截 document 上的 visibilitychange
        if (this === document && type === 'visibilitychange') {
            console.log('🚫 拦截 document.visibilitychange 监听器');
            return;
        }

        // 拦截 document/body 上的鼠标离开事件 (用于检测切屏)
        // 注意：拦截所有元素的 mouseout/mouseleave 可能会破坏 UI (如 tooltip)
        // 所以我们主要针对 window, document, 和 body
        if ((this === window || this === document || this === document.body || this === document.documentElement) &&
            (type === 'mouseleave' || type === 'mouseout')) {
            console.log(`🚫 拦截 ${this.constructor.name}.${type} 监听器`);
            return;
        }

        return originalAddEventListener.call(this, type, listener, options);
    };

    // 3. 伪造 document 状态
    try {
        Object.defineProperty(Document.prototype, 'hidden', {
            get: () => false,
            configurable: true
        });

        Object.defineProperty(Document.prototype, 'visibilityState', {
            get: () => 'visible',
            configurable: true
        });

        // 覆盖 hasFocus
        Document.prototype.hasFocus = () => true;

    } catch (e) {
        console.error('⚠️ 设置 document 状态拦截失败:', e);
    }

    console.log('🎉 增强版焦点检测拦截器已激活！');
})();

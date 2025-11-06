/**
 * DoSelect 题目提取器 UI 组件
 * 提供可拖动按钮和悬浮窗口功能
 */

class QuestionUI {
    constructor() {
        this.isVisible = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.questions = [];
        this.floatingButton = null;
        this.modal = null;
        
        this.init();
    }

    init() {
        this.createFloatingButton();
        this.createModal();
        this.bindEvents();
    }

    // 创建可拖动的悬浮按钮
    createFloatingButton() {
        this.floatingButton = document.createElement('div');
        this.floatingButton.id = 'doselect-question-btn';
        this.floatingButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" fill="currentColor"/>
            </svg>
            <span>题目</span>
        `;
        
        // 设置按钮样式
        Object.assign(this.floatingButton.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '80px',
            height: '80px',
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'move',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '10000',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            userSelect: 'none',
            opacity: '0.9'
        });

        // 添加悬停效果
        this.floatingButton.addEventListener('mouseenter', () => {
            this.floatingButton.style.opacity = '1';
            this.floatingButton.style.transform = 'scale(1.1)';
        });

        this.floatingButton.addEventListener('mouseleave', () => {
            this.floatingButton.style.opacity = '0.9';
            this.floatingButton.style.transform = 'scale(1)';
        });

        document.body.appendChild(this.floatingButton);
    }

    // 创建悬浮窗口
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'doselect-question-modal';
        this.modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>检测到的题目</h3>
                        <div class="modal-controls">
                            <button class="copy-all-btn" title="复制全部">📋</button>
                            <button class="close-btn" title="关闭">✕</button>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div class="questions-container">
                            <!-- 题目内容将在这里动态生成 -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 设置模态框样式
        const style = document.createElement('style');
        style.textContent = `
            #doselect-question-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: none;
            }

            #doselect-question-modal .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            #doselect-question-modal .modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                max-width: 800px;
                max-height: 80vh;
                width: 90%;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            #doselect-question-modal .modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8f9fa;
            }

            #doselect-question-modal .modal-header h3 {
                margin: 0;
                color: #333;
                font-size: 18px;
            }

            #doselect-question-modal .modal-controls {
                display: flex;
                gap: 10px;
            }

            #doselect-question-modal .modal-controls button {
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
                padding: 8px;
                border-radius: 6px;
                transition: background-color 0.2s;
            }

            #doselect-question-modal .modal-controls button:hover {
                background: rgba(0, 0, 0, 0.1);
            }

            #doselect-question-modal .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }

            #doselect-question-modal .question-item {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background: #fafafa;
            }

            #doselect-question-modal .question-title {
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            #doselect-question-modal .question-content {
                margin-bottom: 10px;
                line-height: 1.6;
                color: #555;
            }

            #doselect-question-modal .question-options {
                margin-left: 15px;
            }

            #doselect-question-modal .question-option {
                margin: 5px 0;
                color: #666;
            }

            #doselect-question-modal .copy-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.2s;
            }

            #doselect-question-modal .copy-btn:hover {
                background: #45a049;
            }

            #doselect-question-modal .copy-all-btn {
                background: #2196F3;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            }

            #doselect-question-modal .copy-all-btn:hover {
                background: #1976D2;
            }

            #doselect-question-modal .close-btn {
                color: #666;
                font-size: 20px;
                font-weight: bold;
            }

            #doselect-question-modal .close-btn:hover {
                color: #333;
            }

            .no-questions {
                text-align: center;
                color: #999;
                font-style: italic;
                padding: 40px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(this.modal);
    }

    // 绑定事件
    bindEvents() {
        // 按钮点击事件
        this.floatingButton.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.toggleModal();
            }
        });

        // 按钮拖动事件
        this.floatingButton.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));

        // 模态框关闭事件
        this.modal.querySelector('.close-btn').addEventListener('click', () => {
            this.hideModal();
        });

        this.modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });

        // 复制全部按钮事件
        this.modal.querySelector('.copy-all-btn').addEventListener('click', () => {
            this.copyAllQuestions();
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideModal();
            }
        });
    }

    // 开始拖动
    startDrag(e) {
        this.isDragging = true;
        const rect = this.floatingButton.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        this.floatingButton.style.transition = 'none';
        e.preventDefault();
    }

    // 拖动中
    drag(e) {
        if (!this.isDragging) return;

        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;

        // 限制在视窗范围内
        const maxX = window.innerWidth - this.floatingButton.offsetWidth;
        const maxY = window.innerHeight - this.floatingButton.offsetHeight;

        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));

        this.floatingButton.style.left = constrainedX + 'px';
        this.floatingButton.style.top = constrainedY + 'px';
        this.floatingButton.style.right = 'auto';
    }

    // 结束拖动
    endDrag() {
        if (this.isDragging) {
            this.floatingButton.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                this.isDragging = false;
            }, 100);
        }
    }

    // 显示/隐藏模态框
    toggleModal() {
        if (this.isVisible) {
            this.hideModal();
        } else {
            this.showModal();
        }
    }

    // 显示模态框
    showModal() {
        this.updateModalContent();
        this.modal.style.display = 'block';
        this.isVisible = true;
        
        // 添加显示动画
        requestAnimationFrame(() => {
            this.modal.style.opacity = '0';
            this.modal.style.transform = 'scale(0.9)';
            this.modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            requestAnimationFrame(() => {
                this.modal.style.opacity = '1';
                this.modal.style.transform = 'scale(1)';
            });
        });
    }

    // 隐藏模态框
    hideModal() {
        this.modal.style.opacity = '0';
        this.modal.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.isVisible = false;
        }, 300);
    }

    // 更新模态框内容
    updateModalContent() {
        const container = this.modal.querySelector('.questions-container');
        
        if (this.questions.length === 0) {
            container.innerHTML = '<div class="no-questions">暂未检测到题目</div>';
            return;
        }

        container.innerHTML = this.questions.map((question, index) => {
            // 处理选项：支持对象格式（{text, index, value...}）和字符串格式
            const formatOption = (option) => {
                if (typeof option === 'string') {
                    return option;
                } else if (option && typeof option === 'object') {
                    // 如果是对象，优先使用 text 属性，其次使用 index，最后尝试 toString
                    return option.text || (option.index ? `${option.index}. ${option.value || ''}` : String(option.value || option));
                }
                return String(option || '');
            };

            const optionsHtml = question.options && question.options.length > 0 ? `
                <div class="question-options">
                    ${question.options.map(option => {
                        const optionText = formatOption(option);
                        return `<div class="question-option">${this.escapeHtml(optionText)}</div>`;
                    }).join('')}
                </div>
            ` : '';

            return `
                <div class="question-item">
                    <div class="question-title">
                        <span>题目 ${index + 1}</span>
                        <button class="copy-btn" onclick="questionUI.copyQuestion(${index})">复制</button>
                    </div>
                    <div class="question-content">${this.escapeHtml(question.question)}</div>
                    ${optionsHtml}
                </div>
            `;
        }).join('');
    }

    // 更新题目数据
    updateQuestions(questions) {
        this.questions = questions;
        
        // 更新按钮显示状态
        if (questions.length > 0) {
            this.floatingButton.style.backgroundColor = '#4CAF50';
            this.floatingButton.querySelector('span').textContent = `题目(${questions.length})`;
        } else {
            this.floatingButton.style.backgroundColor = '#999';
            this.floatingButton.querySelector('span').textContent = '题目';
        }

        // 如果模态框正在显示，更新内容
        if (this.isVisible) {
            this.updateModalContent();
        }
    }

    // 复制单个题目
    copyQuestion(index) {
        if (index >= 0 && index < this.questions.length) {
            const question = this.questions[index];
            let text = `题目: ${question.question}\n`;
            
            if (question.options && question.options.length > 0) {
                text += '\n选项:\n';
                question.options.forEach(option => {
                    // 处理选项：支持对象格式和字符串格式
                    if (typeof option === 'string') {
                        text += `${option}\n`;
                    } else if (option && typeof option === 'object') {
                        // 如果是对象，使用 text 属性或格式化显示
                        const optionText = option.text || (option.index ? `${option.index}. ${option.value || ''}` : String(option.value || ''));
                        text += `${optionText}\n`;
                    } else {
                        text += `${String(option)}\n`;
                    }
                });
            }

            this.copyToClipboard(text);
            this.showToast('题目已复制到剪贴板');
        }
    }

    // 复制所有题目
    copyAllQuestions() {
        if (this.questions.length === 0) {
            this.showToast('没有题目可复制');
            return;
        }

        let text = '';
        this.questions.forEach((question, index) => {
            text += `题目 ${index + 1}: ${question.question}\n`;
            
            if (question.options && question.options.length > 0) {
                text += '\n选项:\n';
                question.options.forEach(option => {
                    // 处理选项：支持对象格式和字符串格式
                    if (typeof option === 'string') {
                        text += `${option}\n`;
                    } else if (option && typeof option === 'object') {
                        // 如果是对象，使用 text 属性或格式化显示
                        const optionText = option.text || (option.index ? `${option.index}. ${option.value || ''}` : String(option.value || ''));
                        text += `${optionText}\n`;
                    } else {
                        text += `${String(option)}\n`;
                    }
                });
            }
            text += '\n' + '='.repeat(50) + '\n\n';
        });

        this.copyToClipboard(text);
        this.showToast(`已复制 ${this.questions.length} 道题目到剪贴板`);
    }

    // 复制到剪贴板
    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('复制失败:', err);
            }
            
            document.body.removeChild(textArea);
        }
    }

    // HTML转义函数，防止XSS攻击
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示提示消息
    showToast(message) {
        // 移除已存在的toast
        const existingToast = document.querySelector('.doselect-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'doselect-toast';
        toast.textContent = message;
        
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#333',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            zIndex: '10002',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        document.body.appendChild(toast);

        // 显示动画
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // 3秒后自动消失
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 显示按钮
    show() {
        this.floatingButton.style.display = 'flex';
    }

    // 隐藏按钮
    hide() {
        this.floatingButton.style.display = 'none';
        if (this.isVisible) {
            this.hideModal();
        }
    }

    // 销毁组件
    destroy() {
        if (this.floatingButton && this.floatingButton.parentNode) {
            this.floatingButton.parentNode.removeChild(this.floatingButton);
        }
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}

// 全局实例
let questionUI = null;

// 初始化UI组件
function initQuestionUI() {
    if (!questionUI) {
        questionUI = new QuestionUI();
    }
    return questionUI;
}

// 导出给其他脚本使用
if (typeof window !== 'undefined') {
    window.QuestionUI = QuestionUI;
    window.initQuestionUI = initQuestionUI;
    window.questionUI = questionUI;
}
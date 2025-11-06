/**
 * DoSelect 题目提取器
 * 用于从DoSelect网页中提取题目、选项和检测题目变化
 */

class QuestionExtractor {
    constructor() {
        this.firstQuestionText = null; // 存储第一道题的题目文本，用于检测变化
        this.lastExtractedData = null; // 存储上次提取的数据
    }

    /**
     * 提取页面中的所有题目和选项
     * @returns {Object} 包含题目数据和变化检测结果的对象
     */
    extractQuestions() {
        const problemContainer = document.getElementById('problem-container');
        if (!problemContainer) {
        console.log('[FocusShield] 未找到题目容器');
            return { questions: [], hasChanged: false, error: '未找到题目容器' };
        }

        const problems = problemContainer.querySelectorAll('.problem');
        if (problems.length === 0) {
        console.log('[FocusShield] 未找到任何题目');
            return { questions: [], hasChanged: false, error: '未找到任何题目' };
        }

        const questions = [];
        let currentFirstQuestionText = null;

        problems.forEach((problem, index) => {
            const questionData = this.extractSingleQuestion(problem, index);
            if (questionData) {
                questions.push(questionData);
                
                // 记录第一道题的题目文本
                if (index === 0) {
                    currentFirstQuestionText = questionData.questionText;
                }
            }
        });

        // 检测题目是否发生变化
        const hasChanged = this.detectChange(currentFirstQuestionText);

        const result = {
            questions: questions,
            hasChanged: hasChanged,
            totalQuestions: questions.length,
            extractedAt: new Date().toISOString(),
            firstQuestionText: currentFirstQuestionText
        };

        this.lastExtractedData = result;
        console.log(`[FocusShield] 成功提取 ${questions.length} 道题目`, result);

        return result;
    }

    /**
     * 提取单个题目的信息
     * @param {Element} problemElement 题目DOM元素
     * @param {number} index 题目索引
     * @returns {Object|null} 题目数据对象
     */
    extractSingleQuestion(problemElement, index) {
        try {
            // 获取题目ID
            const questionId = problemElement.id;
            
            // 提取题目文本 - 使用稳定的ID选择器和结构查找
            // 题目文本在 #do-test-mcq-problem 内，包含 <!--block--> 注释的div中
            const problemContainer = problemElement.querySelector('#do-test-mcq-problem');
            if (!problemContainer) {
                console.warn(`[FocusShield] 题目 ${index + 1} 未找到题目容器`);
                return null;
            }

            const questionText = this.extractQuestionText(problemContainer);
            if (!questionText) {
                console.warn(`[FocusShield] 题目 ${index + 1} 题目文本为空`);
                return null;
            }

            // 提取选项 - 使用稳定的ID选择器
            const optionsContainer = problemElement.querySelector('#do-test-mcq-options');
            if (!optionsContainer) {
                console.warn(`[FocusShield] 题目 ${index + 1} 未找到选项容器`);
                return null;
            }

            const options = this.extractOptions(optionsContainer);
            if (options.length === 0) {
                console.warn(`[FocusShield] 题目 ${index + 1} 未找到任何选项`);
                return null;
            }

            // 检测题目类型（单选/多选）
            const questionType = this.detectQuestionType(optionsContainer);

            // 获取题目状态
            const status = this.getQuestionStatus(problemElement);

            return {
                id: questionId,
                index: index + 1,
                questionText: questionText,
                options: options,
                type: questionType,
                status: status,
                totalOptions: options.length
            };

        } catch (error) {
                console.error(`[FocusShield] 提取题目 ${index + 1} 时发生错误:`, error);
            return null;
        }
    }

    /**
     * 提取题目文本（使用结构查找，不依赖易变的class）
     * @param {Element} problemContainer 题目容器元素 (#do-test-mcq-problem)
     * @returns {string} 题目文本
     */
    extractQuestionText(problemContainer) {
        // 方法1: 查找包含 <!--block--> 注释的div
        const allDivs = problemContainer.querySelectorAll('div');
        for (const div of allDivs) {
            // 检查是否有 <!--block--> 注释节点
            for (const node of div.childNodes) {
                if (node.nodeType === Node.COMMENT_NODE && node.textContent.trim() === 'block') {
                    // 找到注释后的文本节点
                    const textNode = node.nextSibling;
                    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                        const text = textNode.textContent.trim();
                        if (text) return text;
                    }
                    // 或者注释后的下一个元素节点包含文本
                    let nextElement = node.nextSibling;
                    while (nextElement) {
                        if (nextElement.nodeType === Node.ELEMENT_NODE) {
                            const text = nextElement.textContent.trim();
                            if (text) return text;
                        }
                        nextElement = nextElement.nextSibling;
                    }
                }
            }
        }

        // 方法2: 查找包含文本内容且不在选项区域的div
        // 排除选项相关的元素（选项在 #do-test-mcq-options 中）
        const optionsContainer = problemContainer.closest('.problem')?.querySelector('#do-test-mcq-options');
        const excludedElements = new Set();
        if (optionsContainer) {
            optionsContainer.querySelectorAll('*').forEach(el => excludedElements.add(el));
        }

        for (const div of allDivs) {
            if (excludedElements.has(div)) continue;
            
            const text = div.textContent.trim();
            // 题目文本通常比较长，且不包含"Answer"、"CLEAR"等按钮文本
            if (text && 
                text.length > 10 && 
                !text.includes('Answer') && 
                !text.includes('CLEAR') &&
                !text.includes('MCQ') &&
                !text.includes('Unsolved') &&
                !text.includes('Bookmark') &&
                !text.includes('Having an issue')) {
                return text;
            }
        }

        // 方法3: 如果都找不到，返回整个容器的文本（去除常见干扰文本）
        let fullText = problemContainer.textContent.trim();
        // 移除常见的UI元素文本
        fullText = fullText.replace(/MCQ.*?Unsolved/gs, '').trim();
        fullText = fullText.replace(/Answer.*?CLEAR/gs, '').trim();
        fullText = fullText.replace(/Having an issue.*?Report/gs, '').trim();
        return fullText || null;
    }

    /**
     * 从元素中提取文本内容（处理<!--block-->注释）
     * @param {Element} element DOM元素
     * @returns {string} 提取的文本
     */
    extractTextFromElement(element) {
        // 确保element是有效的DOM元素
        if (!element || typeof element !== 'object' || !element.nodeType) {
            return '';
        }
        
        // 方法1: 查找包含<!--block-->注释的div
        const allDivs = element.querySelectorAll('div');
        for (const div of allDivs) {
            for (const node of div.childNodes) {
                if (node.nodeType === Node.COMMENT_NODE && node.textContent.trim() === 'block') {
                    // 找到注释后的文本节点或元素节点
                    let nextNode = node.nextSibling;
                    while (nextNode) {
                        if (nextNode.nodeType === Node.TEXT_NODE) {
                            const text = nextNode.textContent.trim();
                            if (text) return text;
                        } else if (nextNode.nodeType === Node.ELEMENT_NODE) {
                            const text = nextNode.textContent.trim();
                            if (text) return text;
                        }
                        nextNode = nextNode.nextSibling;
                    }
                }
            }
        }
        
        // 方法2: 如果没找到注释格式，直接获取元素的文本内容
        let text = '';
        if (element.textContent) {
            text = element.textContent.trim();
        } else if (element.innerText) {
            text = element.innerText.trim();
        }
        
        // 移除注释标记（如果存在）
        text = text.replace(/<!--block-->/g, '').trim();
        
        // 清理多余的空白字符
        text = text.replace(/\s+/g, ' ').trim();
        
        return text || '';
    }

    /**
     * 提取选项信息（使用结构查找，不依赖易变的class）
     * @param {Element} optionsContainer 选项容器元素 (#do-test-mcq-options)
     * @returns {Array} 选项数组
     */
    extractOptions(optionsContainer) {
        const options = [];
        
        // 方法1: 尝试使用稳定的class选择器 .problem-option
        const problemOptionLabels = optionsContainer.querySelectorAll('.problem-option');
        if (problemOptionLabels.length > 0) {
            problemOptionLabels.forEach((problemOptionSpan, index) => {
                try {
                    // 查找对应的input
                    let input = null;
                    // 通过problemOptionSpan的父元素查找input
                    if (problemOptionSpan.closest) {
                        const parent = problemOptionSpan.closest('.custom-control') || problemOptionSpan.closest('div');
                        if (parent) {
                            input = parent.querySelector('input[type="radio"], input[type="checkbox"]');
                        }
                    }
                    
                    if (input && problemOptionSpan) {
                        const optionText = this.extractTextFromElement(problemOptionSpan);
                        
                        // 确保提取到的是字符串
                        const text = typeof optionText === 'string' ? optionText : String(optionText || '').trim();
                        
                        if (text) {
                            options.push({
                                index: index + 1,
                                value: input.value,
                                text: text,
                                id: input.id,
                                name: input.name,
                                type: input.type
                            });
                        }
                    }
                } catch (error) {
                    console.error(`[FocusShield] 提取选项 ${index + 1} 时发生错误:`, error);
                }
            });
            
            if (options.length > 0) {
                return options;
            }
        }

        // 方法2: 通过input元素查找对应的label（最通用的方法）
        const allInputs = optionsContainer.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        allInputs.forEach((input, index) => {
            try {
                // 查找包含选项文本的元素
                let textElement = null;
                
                // 方法1: 查找包含.problem-option的元素
                if (input.closest) {
                    const parent = input.closest('div');
                    if (parent) {
                        textElement = parent.querySelector('.problem-option');
                    }
                }
                
                // 方法2: 通过for属性查找label
                if (!textElement && input.id) {
                    const label = optionsContainer.querySelector(`label[for="${input.id}"]`);
                    if (label) {
                        textElement = label.querySelector('.problem-option') || label;
                    }
                }
                
                // 方法3: 在同一个父元素中查找label
                if (!textElement && input.closest) {
                    const parent = input.closest('.custom-control') || input.closest('div');
                    if (parent) {
                        const label = parent.querySelector('label');
                        if (label) {
                            textElement = label.querySelector('.problem-option') || label;
                        }
                    }
                }
                
                // 方法4: 在input的兄弟节点中查找label
                if (!textElement) {
                    let sibling = input.nextSibling;
                    while (sibling && !textElement) {
                        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === 'LABEL') {
                            textElement = sibling.querySelector('.problem-option') || sibling;
                        }
                        sibling = sibling.nextSibling;
                    }
                }

                if (textElement) {
                    const optionText = this.extractTextFromElement(textElement);
                    
                    // 确保提取到的是字符串，而不是对象
                    let text = '';
                    if (typeof optionText === 'string') {
                        text = optionText;
                    } else if (optionText && typeof optionText === 'object') {
                        // 如果是对象，尝试获取其textContent
                        text = textElement.textContent ? textElement.textContent.trim() : '';
                    } else {
                        text = String(optionText || '').trim();
                    }
                    
                    // 清理文本：移除多余的空白和换行
                    text = text.replace(/\s+/g, ' ').trim();
                    
                    if (text) {
                        options.push({
                            index: index + 1,
                            value: input.value,
                            text: text,
                            id: input.id,
                            name: input.name,
                            type: input.type
                        });
                    }
                }
            } catch (error) {
                console.error(`[FocusShield] 提取选项 ${index + 1} 时发生错误:`, error);
            }
        });

        return options;
    }

    /**
     * 检测题目类型（单选/多选）
     * @param {Element} optionsContainer 选项容器元素
     * @returns {string} 'single' 或 'multiple'
     */
    detectQuestionType(optionsContainer) {
        // 查找所有radio和checkbox类型的input
        const radioInputs = optionsContainer.querySelectorAll('input[type="radio"]');
        const checkboxInputs = optionsContainer.querySelectorAll('input[type="checkbox"]');
        
        // 如果找到radio，就是单选
        if (radioInputs.length > 0) {
            return 'single';
        }
        
        // 如果找到checkbox，就是多选
        if (checkboxInputs.length > 0) {
            return 'multiple';
        }

        // 备用方法：查找所有input
        const allInputs = optionsContainer.querySelectorAll('input');
        if (allInputs.length > 0) {
            const firstInput = allInputs[0];
            if (firstInput.type === 'radio') {
                return 'single';
            } else if (firstInput.type === 'checkbox') {
                return 'multiple';
            }
        }

        return 'unknown';
    }

    /**
     * 获取题目状态
     * @param {Element} problemElement 题目元素
     * @returns {string} 题目状态
     */
    getQuestionStatus(problemElement) {
        // 使用稳定的ID选择器
        const statusContainer = problemElement.querySelector('#do-solution-status');
        if (statusContainer) {
            // 查找包含状态文本的span
            const statusSpans = statusContainer.querySelectorAll('span');
            for (const span of statusSpans) {
                const text = span.textContent.trim();
                // 常见状态：Unsolved, Solved, Correct, Incorrect等
                if (text && text.length > 0 && text !== 'status-label-container') {
                    return text;
                }
            }
            // 如果没找到，返回整个容器的文本
            const fullText = statusContainer.textContent.trim();
            if (fullText) return fullText;
        }
        return 'Unknown';
    }

    /**
     * 检测题目是否发生变化（基于第一道题）
     * @param {string} currentFirstQuestionText 当前第一道题的文本
     * @returns {boolean} 是否发生变化
     */
    detectChange(currentFirstQuestionText) {
        if (this.firstQuestionText === null) {
            // 第一次提取，记录基准
            this.firstQuestionText = currentFirstQuestionText;
        console.log('[FocusShield] 设置题目变化检测基准:', currentFirstQuestionText);
            return false;
        }

        const hasChanged = this.firstQuestionText !== currentFirstQuestionText;
        if (hasChanged) {
        console.log('[FocusShield] 检测到题目发生变化!');
            console.log('原题目:', this.firstQuestionText);
            console.log('新题目:', currentFirstQuestionText);
            
            // 更新基准
            this.firstQuestionText = currentFirstQuestionText;
        }

        return hasChanged;
    }

    /**
     * 获取上次提取的数据
     * @returns {Object|null} 上次提取的数据
     */
    getLastExtractedData() {
        return this.lastExtractedData;
    }

    /**
     * 重置变化检测基准
     */
    resetChangeDetection() {
        this.firstQuestionText = null;
        console.log('[FocusShield] 已重置题目变化检测基准');
    }

    /**
     * 格式化输出提取的数据
     * @param {Object} data 提取的数据
     * @returns {string} 格式化的字符串
     */
    formatExtractedData(data) {
        if (!data || !data.questions) return '无数据';

        let output = `=== DoSelect 题目提取结果 ===\n`;
        output += `提取时间: ${data.extractedAt}\n`;
        output += `题目总数: ${data.totalQuestions}\n`;
        output += `题目变化: ${data.hasChanged ? '是' : '否'}\n\n`;

        data.questions.forEach((question, index) => {
            output += `题目 ${question.index}: [${question.type === 'single' ? '单选' : question.type === 'multiple' ? '多选' : '未知'}] ${question.questionText}\n`;
            question.options.forEach(option => {
                output += `  ${option.index}. ${option.text}\n`;
            });
            output += `  状态: ${question.status}\n\n`;
        });

        return output;
    }
}

// 创建全局实例
window.questionExtractor = new QuestionExtractor();

// 初始化UI组件并集成题目提取功能
function initializeQuestionExtractorWithUI() {
    // 等待UI组件加载完成
    if (typeof window.initQuestionUI === 'function') {
        const ui = window.initQuestionUI();
        
        // 定期检测题目变化并更新UI
        let lastCheckTime = 0;
        const checkInterval = 2000; // 2秒检查一次
        
        function checkAndUpdateQuestions() {
            const now = Date.now();
            if (now - lastCheckTime < checkInterval) {
                return;
            }
            lastCheckTime = now;
            
            try {
                const result = window.questionExtractor.extractQuestions();
                if (result.questions && result.questions.length > 0) {
                    // 转换数据格式以适配UI组件
                    const formattedQuestions = result.questions.map(q => ({
                        question: q.questionText,
                        options: q.options || []
                    }));
                    
                    // 更新UI显示
                    ui.updateQuestions(formattedQuestions);
                    
                    if (result.hasChanged) {
        console.log('[FocusShield] 检测到题目变化，UI已更新');
                    }
                } else {
                    // 没有题目时清空UI
                    ui.updateQuestions([]);
                }
            } catch (error) {
        console.error('[FocusShield] 题目检测出错:', error);
                ui.updateQuestions([]);
            }
        }
        
        // 使用MutationObserver监听DOM变化
        const observer = new MutationObserver(() => {
            checkAndUpdateQuestions();
        });
        
        // 开始监听
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'id']
        });
        
        // 初始检查
        setTimeout(checkAndUpdateQuestions, 1000);
        
        // 定期检查（作为备用机制）
        setInterval(checkAndUpdateQuestions, checkInterval);
        
        console.log('[FocusShield] 题目提取器UI集成完成');
    } else {
        // UI组件还未加载，延迟重试
        setTimeout(initializeQuestionExtractorWithUI, 500);
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeQuestionExtractorWithUI);
} else {
    initializeQuestionExtractorWithUI();
}

        console.log('[FocusShield] 题目提取器已加载');
(function () {
    const CONTENT_LIBRARY = [
        {
            id: 'featured-dating-playbook',
            title: '第一次约会不冷场的节奏表',
            summary: '把一场容易尴尬的见面，拆成三个自然推进的对话阶段。',
            category: 'dating',
            categoryLabel: '约会技巧',
            typeLabel: '精选',
            author: '恋语编辑部',
            publishTime: '今天更新',
            views: 12500,
            readTime: '4 分钟读完',
            accent: 'rose',
            featured: true,
            excerpt: '如果你总担心第一次约会聊不下去，这篇内容会给你一个可以直接照着走的结构。',
            body: `
                <p>第一次约会真正让人紧张的，不是没有话题，而是不知道什么时候该轻松、什么时候该深入。</p>
                <h3>1. 先从环境和体验开场</h3>
                <p>先聊到场后的感受，比如路线、店里的氛围、最近的小见闻，这种内容风险低，也能快速建立共同语境。</p>
                <h3>2. 再切到生活节奏</h3>
                <p>等气氛稳定后，聊工作节奏、最近在忙什么、周末通常怎么放松，这比直接问理想型更自然。</p>
                <h3>3. 最后再抛轻一点的自我表达</h3>
                <p>比如“你最近最想做的一件事是什么”，既能看到对方状态，也不会显得像审问。</p>
            `,
            prompts: [
                '如果今天这场约会只能保留一个瞬间，你会选哪一刻？',
                '你最近有哪件小事，虽然不大但会让你心情变好？',
                '你周末更喜欢“计划好再出门”还是“想到哪就去哪里”？'
            ]
        },
        {
            id: 'featured-high-eq-chat',
            title: '高情商聊天，不是会说话而是会接话',
            summary: '学会复述、接住情绪和轻推话题，比堆金句更有效。',
            category: 'communication',
            categoryLabel: '沟通艺术',
            typeLabel: '精选',
            author: '沟通实验室',
            publishTime: '8 小时前',
            views: 8700,
            readTime: '3 分钟读完',
            accent: 'violet',
            featured: true,
            excerpt: '聊天质量差的根源，通常不是你没内容，而是你没让对方感觉“被接住”。',
            body: `
                <p>很多人一紧张就开始拼命输出，其实真正让对方舒服的，是你能不能接住上一句。</p>
                <h3>1. 先复述重点</h3>
                <p>例如对方说“最近工作有点烦”，不要直接给建议，先接一句“听起来你这阵子压力挺大的”。</p>
                <h3>2. 再问一个向前的问题</h3>
                <p>复述之后再推进，比如“是节奏太满，还是事情本身让你烦？”这样对方更愿意继续说。</p>
                <h3>3. 控制建议欲</h3>
                <p>不是每句话都需要你解决，很多时候理解感比解决方案更重要。</p>
            `,
            prompts: [
                '你刚刚那句话我挺有感觉的，可以多讲一点吗？',
                '听起来你不是累，是那种被事情一直顶着走的感觉。',
                '如果把这件事分成“最烦”和“还好”的两部分，你觉得哪块最卡？'
            ]
        },
        {
            id: 'article-openers',
            title: '开场白不是越特别越好，而是越好接越好',
            summary: '一个容易被接住的开场，比一个很“炸”的开场更适合长期聊天。',
            category: 'communication',
            categoryLabel: '沟通艺术',
            typeLabel: '文章',
            author: '恋语编辑部',
            publishTime: '2 小时前',
            views: 23000,
            readTime: '3 分钟读完',
            accent: 'amber',
            featured: false,
            excerpt: '开场白的任务不是惊艳，而是让对方愿意顺手回一句。',
            body: `
                <p>真正好用的开场白通常具备两个特点：轻、可接。</p>
                <ul>
                    <li>轻：不会让对方一上来就要认真思考。</li>
                    <li>可接：对方能顺手接一句，不会被卡住。</li>
                </ul>
                <p>与其说“我觉得你很特别”，不如从具体的小观察切入，例如共同兴趣、头像细节、最近热门事件。</p>
            `,
            prompts: [
                '你头像这张照片的氛围很好，是在哪拍的？',
                '我刚看到你也喜欢展览，这类地方你更喜欢一个人逛还是和朋友一起？',
                '如果今天下班之后突然多出两个小时，你最想怎么用？'
            ]
        },
        {
            id: 'video-date-conversation',
            title: '约会时怎么让对话更有来回感',
            summary: '不是不断找新话题，而是把一个好话题聊深一点。',
            category: 'dating',
            categoryLabel: '约会技巧',
            typeLabel: '清单',
            author: '恋语教练',
            publishTime: '5 小时前',
            views: 18000,
            readTime: '5 分钟练习',
            accent: 'coral',
            featured: false,
            excerpt: '你不需要准备十个话题，只要准备三个能延展的话题就够了。',
            body: `
                <p>约会中最常见的问题，是每个话题都只停留在表面，导致对话像在换频道。</p>
                <h3>建议你准备三类话题：</h3>
                <ul>
                    <li>轻体验：最近吃到、看到、路上遇到的小事。</li>
                    <li>生活偏好：作息、旅行习惯、社交方式。</li>
                    <li>价值倾向：做决定时更看重稳定还是新鲜感。</li>
                </ul>
                <p>每聊到一个点，别急着跳走，先追问一次“为什么”。</p>
            `,
            prompts: [
                '你会更喜欢计划好的约会，还是当天边走边看？',
                '你最近有没有一个“本来没期待，结果意外不错”的体验？',
                '如果旅行只能选城市和自然景色其中一个，你会怎么选？'
            ]
        },
        {
            id: 'quiz-love-style',
            title: '你的恋爱沟通类型，更偏热烈还是稳定？',
            summary: '不是心理测试页，而是一个帮你校准聊天风格的自查清单。',
            category: 'psychology',
            categoryLabel: '心理测试',
            typeLabel: '自查',
            author: 'LoveAI 心理组',
            publishTime: '昨天',
            views: 15000,
            readTime: '2 分钟自查',
            accent: 'mint',
            featured: false,
            excerpt: '知道自己在关系里怎么表达，比盲目学技巧更重要。',
            body: `
                <p>很多聊天问题其实不是“不会聊”，而是你在用不适合自己的表达方式。</p>
                <h3>你可以问自己三个问题：</h3>
                <ol>
                    <li>我更容易主动表达，还是更习惯等对方给信号？</li>
                    <li>我想要的是高频互动，还是稳定但不打扰？</li>
                    <li>我紧张时会话变多，还是会突然变少？</li>
                </ol>
                <p>把答案想清楚之后，再决定你应该练“开场”还是练“回应”。</p>
            `,
            prompts: [
                '我有时候不是没兴趣，只是回复节奏慢一点。',
                '比起一直热聊，我更在意聊天是不是舒服自然。',
                '我想先了解你平时的聊天节奏，这样我比较好找到舒服的方式。'
            ]
        },
        {
            id: 'article-long-distance',
            title: '异地关系最怕的不是距离，是对日常感失去参与',
            summary: '让对方参与到你的普通一天，远比定时打卡式聊天更有连接感。',
            category: 'relationship',
            categoryLabel: '情感关系',
            typeLabel: '文章',
            author: 'LoveAI 编辑部',
            publishTime: '2 天前',
            views: 9800,
            readTime: '4 分钟读完',
            accent: 'sky',
            featured: false,
            excerpt: '异地时别只聊“在干嘛”，要让对方感受到“和你一起经历了今天”。',
            body: `
                <p>很多异地聊天看起来频率不低，但实际都停留在信息交换，没有共同生活感。</p>
                <h3>可以这样做：</h3>
                <ul>
                    <li>分享一个今天真实发生的小瞬间，而不是只报备结果。</li>
                    <li>把“你在干嘛”换成“你今天有没有哪个瞬间特别想发给我”。</li>
                    <li>建立固定但不僵硬的小仪式，比如每周一次长语音。</li>
                </ul>
            `,
            prompts: [
                '我今天路上看到一个画面，第一反应就是想发给你。',
                '你今天有没有哪一刻会觉得“如果你在就好了”？',
                '这周找个晚上，我们认真聊 20 分钟，不赶进度，只更新近况。'
            ]
        }
    ];

    class DiscoverApp {
        constructor() {
            this.searchQuery = '';
            this.currentCategory = 'all';
            this.activeContentId = null;
            this.featuredItems = CONTENT_LIBRARY.filter(item => item.featured);
            this.contentItems = CONTENT_LIBRARY.filter(item => !item.featured);
        }

        init() {
            if (!document.getElementById('discover-page')) {
                return;
            }

            this.bindEvents();
            this.renderFeatured();
            this.renderContentList();
        }

        bindEvents() {
            const searchInput = document.getElementById('discover-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (event) => {
                    this.searchQuery = event.target.value.trim().toLowerCase();
                    this.renderContentList();
                });
            }

            document.querySelectorAll('.category-tab').forEach((button) => {
                button.addEventListener('click', () => {
                    this.currentCategory = button.dataset.category || 'all';
                    document.querySelectorAll('.category-tab').forEach((tab) => {
                        tab.classList.toggle('active', tab === button);
                    });
                    this.renderContentList();
                });
            });

            document.addEventListener('click', (event) => {
                const itemTrigger = event.target.closest('[data-discover-id]');
                if (itemTrigger) {
                    this.openDetail(itemTrigger.dataset.discoverId);
                    return;
                }

                const actionTrigger = event.target.closest('[data-discover-action]');
                if (!actionTrigger) {
                    return;
                }

                const action = actionTrigger.dataset.discoverAction;
                if (action === 'back') {
                    this.closeDetail();
                    return;
                }

                if (action === 'open-chat') {
                    this.openChatWithPrompt();
                    return;
                }

                if (action === 'open-assistant') {
                    this.openAssistant();
                }
            });
        }

        getFilteredItems() {
            return this.contentItems.filter((item) => {
                const categoryMatch = this.currentCategory === 'all' || item.category === this.currentCategory;
                const searchMatch = !this.searchQuery
                    || item.title.toLowerCase().includes(this.searchQuery)
                    || item.summary.toLowerCase().includes(this.searchQuery)
                    || item.categoryLabel.toLowerCase().includes(this.searchQuery);

                return categoryMatch && searchMatch;
            });
        }

        renderFeatured() {
            const container = document.getElementById('discover-featured-list');
            if (!container) {
                return;
            }

            container.innerHTML = this.featuredItems.map((item) => `
                <button type="button" class="discover-featured-card accent-${item.accent}" data-discover-id="${item.id}">
                    <div class="discover-featured-topline">
                        <span class="discover-card-pill">${item.typeLabel}</span>
                        <span class="discover-featured-time">${item.publishTime}</span>
                    </div>
                    <div class="discover-featured-body">
                        <div class="discover-thumb accent-${item.accent}">
                            <span>${item.categoryLabel.slice(0, 1)}</span>
                        </div>
                        <div class="discover-featured-copy">
                            <h4>${item.title}</h4>
                            <p>${item.summary}</p>
                            <div class="discover-copy-meta">
                                <span>${item.author}</span>
                                <span>${item.readTime}</span>
                            </div>
                        </div>
                    </div>
                    <div class="discover-card-meta">
                        <span>${item.categoryLabel}</span>
                        <span><i class="fas fa-eye"></i> ${this.formatNumber(item.views)}</span>
                    </div>
                </button>
            `).join('');
        }

        renderContentList() {
            const listEl = document.getElementById('discover-content-list');
            const countEl = document.getElementById('discover-results-count');
            const emptyEl = document.getElementById('discover-empty-state');
            if (!listEl || !countEl || !emptyEl) {
                return;
            }

            const items = this.getFilteredItems();
            countEl.textContent = `${items.length} 条可练习内容`;
            emptyEl.hidden = items.length > 0;

            listEl.innerHTML = items.map((item) => `
                <button type="button" class="discover-list-card" data-discover-id="${item.id}">
                    <div class="discover-thumb accent-${item.accent}">
                        <span>${item.typeLabel.slice(0, 1)}</span>
                    </div>
                    <div class="discover-list-copy">
                        <div class="discover-list-topline">
                            <span class="discover-card-pill muted">${item.categoryLabel}</span>
                            <span class="discover-list-time">${item.publishTime}</span>
                        </div>
                        <h4>${item.title}</h4>
                        <p>${item.excerpt}</p>
                        <div class="discover-copy-meta">
                            <span>${item.author}</span>
                            <span>${item.typeLabel}</span>
                        </div>
                        <div class="discover-card-meta">
                            <span>${item.readTime}</span>
                            <span><i class="fas fa-eye"></i> ${this.formatNumber(item.views)}</span>
                        </div>
                    </div>
                </button>
            `).join('');
        }

        openDetail(contentId) {
            const item = CONTENT_LIBRARY.find((entry) => entry.id === contentId);
            if (!item) {
                return;
            }

            this.activeContentId = item.id;
            this.renderDetail(item);

            if (typeof window.showPage === 'function') {
                window.showPage('content-detail');
            }

            if (typeof window.updateNavigation === 'function') {
                window.updateNavigation('discover');
            }

            const detailPage = document.getElementById('content-detail-page');
            const detailShell = detailPage ? detailPage.querySelector('.discover-detail-page') : null;
            if (detailPage) {
                detailPage.scrollTop = 0;
            }
            if (detailShell) {
                detailShell.scrollTop = 0;
            }
        }

        closeDetail() {
            if (typeof window.showPage === 'function') {
                window.showPage('discover');
            }

            if (typeof window.updateNavigation === 'function') {
                window.updateNavigation('discover');
            }
        }

        renderDetail(item) {
            const hero = document.getElementById('discover-detail-hero');
            const title = document.getElementById('discover-detail-title');
            const summary = document.getElementById('discover-detail-summary');
            const type = document.getElementById('discover-detail-type');
            const category = document.getElementById('discover-detail-category');
            const author = document.getElementById('discover-detail-author-name');
            const publishTime = document.getElementById('discover-detail-publish-time');
            const views = document.getElementById('discover-detail-views');
            const readTime = document.getElementById('discover-detail-read-time');
            const avatar = document.querySelector('.discover-detail-avatar');
            const article = document.getElementById('discover-detail-content');
            const prompts = document.getElementById('discover-detail-prompts');
            const assistantButton = document.querySelector('[data-discover-action="open-assistant"]');

            if (!hero || !title || !summary || !type || !category || !author || !publishTime || !views || !readTime || !article || !prompts) {
                return;
            }

            hero.className = `discover-detail-hero accent-${item.accent}`;
            title.textContent = item.title;
            summary.textContent = item.summary;
            type.textContent = item.typeLabel;
            category.textContent = item.categoryLabel;
            author.textContent = item.author;
            publishTime.textContent = item.publishTime;
            views.textContent = this.formatNumber(item.views);
            readTime.textContent = item.readTime;
            if (avatar) {
                avatar.textContent = item.author.slice(0, 1);
            }
            article.innerHTML = item.body;
            prompts.innerHTML = item.prompts.map((prompt) => `
                <button type="button" class="discover-prompt-card" data-prompt="${this.escapeAttribute(prompt)}">
                    <i class="fas fa-comment-dots"></i>
                    <span>${prompt}</span>
                </button>
            `).join('');

            prompts.querySelectorAll('[data-prompt]').forEach((button) => {
                button.addEventListener('click', () => {
                    this.openChatWithPrompt(button.dataset.prompt);
                });
            });

            if (assistantButton) {
                assistantButton.textContent = this.getAssistantLaunchConfig(item).label;
            }
        }

        openChatWithPrompt(promptText = '') {
            const item = CONTENT_LIBRARY.find((entry) => entry.id === this.activeContentId);
            const nextPrompt = promptText || item?.prompts?.[0] || '';

            if (typeof window.showPage === 'function') {
                window.showPage('chat');
            }

            if (typeof window.updateNavigation === 'function') {
                window.updateNavigation('chat');
            }

            window.setTimeout(() => {
                const chatInput = document.querySelector('.chat-input-field');
                if (!chatInput || !nextPrompt) {
                    return;
                }

                chatInput.value = nextPrompt;
                chatInput.focus();
            }, 80);
        }

        openAssistant() {
            const item = CONTENT_LIBRARY.find((entry) => entry.id === this.activeContentId);
            if (!item || typeof window.openAIAssistantTool !== 'function') {
                return;
            }

            const launchConfig = this.getAssistantLaunchConfig(item);

            if (typeof window.showPage === 'function') {
                window.showPage('chat');
            }

            if (typeof window.updateNavigation === 'function') {
                window.updateNavigation('chat');
            }

            window.setTimeout(() => {
                window.openAIAssistantTool(launchConfig.toolId, {
                    prefill: launchConfig.prefill,
                    autoSubmit: launchConfig.autoSubmit
                });
            }, 120);
        }

        getAssistantLaunchConfig(item) {
            const titleSummary = `${item.title} ${item.summary}`;
            const sharedContext = `${item.title}：${item.summary}`;

            if (/开场/.test(titleSummary)) {
                return {
                    toolId: 'opener',
                    autoSubmit: false,
                    prefill: {
                        context: item.title,
                        interests: item.categoryLabel,
                        personality: item.excerpt || ''
                    },
                    label: '获取 AI 开场白'
                };
            }

            if (item.category === 'dating') {
                return {
                    toolId: 'date-plan',
                    autoSubmit: false,
                    prefill: {
                        dateType: item.title,
                        interests: item.categoryLabel,
                        budget: '',
                        duration: '2-3小时',
                        weather: '晴天'
                    },
                    label: '生成约会安排'
                };
            }

            return {
                toolId: 'topics',
                autoSubmit: true,
                prefill: {
                    relationship: item.category === 'relationship' ? '恋爱关系' : '暧昧对象',
                    mood: item.category === 'psychology' ? '想更自然地表达自己' : '轻松但想聊得更顺',
                    recentEvents: sharedContext,
                    commonInterests: item.categoryLabel
                },
                label: item.category === 'relationship' ? '获取关系沟通建议' : '获取 AI 话题建议'
            };
        }

        formatNumber(value) {
            if (value >= 10000) {
                return `${Math.round((value / 1000)) / 10}K`;
            }

            return String(value);
        }

        escapeAttribute(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const app = new DiscoverApp();
        app.init();
        window.discoverApp = app;
    });
})();

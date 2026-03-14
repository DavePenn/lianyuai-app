// Discover Page H5 News Style JavaScript
(function () {
    class DiscoverApp {
        constructor() {
            this.currentCategory = 'all';
            this.currentRating = 0;
            this.ratingCount = 0;
            this.ratingTotal = 0;
            this.isLiked = false;
            this.isBookmarked = false;
            this.currentCarouselIndex = 0;
            this.carouselTimer = null;
            this.contentData = this.buildMockData();
            this.init();
        }

        init() {
            this.normalizeCategories();
            this.bindEvents();
            this.initCarousel();
            this.loadContent();
        }

        // 为每个内容项补充 data-category，便于过滤
        normalizeCategories() {
            const map = new Map([
                ['约会技巧', 'dating'],
                ['沟通技巧', 'communication'],
                ['沟通艺术', 'communication'],
                ['心理测试', 'psychology'],
                ['情感关系', 'relationship'],
            ]);
            document.querySelectorAll('.content-item').forEach(item => {
                if (!item.dataset.category) {
                    const tag = item.querySelector('.content-category');
                    const text = tag ? tag.textContent.trim() : '';
                    const cat = map.get(text) || 'all';
                    item.dataset.category = cat;
                }
            });
        }

        bindEvents() {
            const searchInput = document.getElementById('discover-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.handleSearch(e.target.value);
                });
            }

            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const cat = tab.dataset.category || 'all';
                    this.switchCategory(cat);
                });
            });

            // Featured点击打开详情
            document.querySelectorAll('.featured-item').forEach(el => {
                el.addEventListener('click', () => {
                    const cid = el.getAttribute('data-content-id');
                    if (cid) this.showContentDetail(cid);
                });
            });

            // 列表项事件委托（兼容未使用内联onclick的情况）
            document.addEventListener('click', (e) => {
                const item = e.target.closest('.content-item');
                if (item) {
                    const contentId = item.getAttribute('data-content-id');
                    if (contentId) this.showContentDetail(contentId);
                }
            });

            // 评分系统
            const starWrap = document.querySelector('.star-rating');
            if (starWrap) {
                const stars = starWrap.querySelectorAll('i');
                stars.forEach((star, index) => {
                    star.addEventListener('click', () => this.setRating(index + 1));
                    star.addEventListener('mouseenter', () => this.highlightStars(index + 1));
                });
                starWrap.addEventListener('mouseleave', () => this.highlightStars(this.currentRating));
            }

            // 轮播指示器
            document.querySelectorAll('.indicator').forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    this.goToSlide(index);
                });
            });
        }

        initCarousel() {
            const carouselItems = document.querySelectorAll('.featured-item');
            if (carouselItems.length > 0) {
                this.startCarousel();
            }
        }

        startCarousel() {
            this.stopCarousel();
            this.carouselTimer = setInterval(() => {
                this.nextSlide();
            }, 5000);
        }

        stopCarousel() {
            if (this.carouselTimer) {
                clearInterval(this.carouselTimer);
                this.carouselTimer = null;
            }
        }

        nextSlide() {
            const items = document.querySelectorAll('.featured-item');
            const indicators = document.querySelectorAll('.indicator');
            if (items.length === 0) return;
            items[this.currentCarouselIndex]?.classList.remove('active');
            indicators[this.currentCarouselIndex]?.classList.remove('active');
            this.currentCarouselIndex = (this.currentCarouselIndex + 1) % items.length;
            items[this.currentCarouselIndex]?.classList.add('active');
            indicators[this.currentCarouselIndex]?.classList.add('active');
        }

        goToSlide(index) {
            const items = document.querySelectorAll('.featured-item');
            const indicators = document.querySelectorAll('.indicator');
            if (items.length === 0) return;
            items[this.currentCarouselIndex]?.classList.remove('active');
            indicators[this.currentCarouselIndex]?.classList.remove('active');
            this.currentCarouselIndex = index;
            items[this.currentCarouselIndex]?.classList.add('active');
            indicators[this.currentCarouselIndex]?.classList.add('active');
            this.startCarousel();
        }

        handleSearch(query) {
            const contentItems = document.querySelectorAll('.content-item');
            const q = (query || '').toLowerCase();
            contentItems.forEach(item => {
                const title = (item.querySelector('h4')?.textContent || '').toLowerCase();
                const description = (item.querySelector('p')?.textContent || '').toLowerCase();
                item.style.display = (title.includes(q) || description.includes(q)) ? 'flex' : 'none';
            });
        }

        switchCategory(category) {
            this.currentCategory = category;
            document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
            const active = document.querySelector(`[data-category="${category}"]`);
            if (active) active.classList.add('active');
            this.filterContent(category);
        }

        filterContent(category) {
            const contentItems = document.querySelectorAll('.content-item');
            contentItems.forEach(item => {
                const itemCategory = item.dataset.category || 'all';
                item.style.display = (category === 'all' || itemCategory === category) ? 'flex' : 'none';
            });
        }

        showContentDetail(contentId) {
            document.getElementById('discover-page')?.classList.remove('active');
            document.getElementById('discover-page').style.display = 'none';
            document.getElementById('content-detail-page').style.display = 'block';
            document.getElementById('content-detail-page')?.classList.add('active');
            this.currentRating = 0;
            this.ratingCount = 0;
            this.ratingTotal = 0;
            this.isLiked = false;
            this.isBookmarked = false;
            this.loadContentDetail(contentId);
            this.updateRatingDisplay();
            this.updateActionButtons();
        }

        hideContentDetail() {
            document.getElementById('content-detail-page').style.display = 'none';
            document.getElementById('discover-page').style.display = 'block';
            document.getElementById('discover-page')?.classList.add('active');
        }

        buildMockData() {
            return {
                'article-1': {
                    title: '如何开始一段对话？',
                    author: '恋语专家',
                    publishTime: '2小时前',
                    views: 23000,
                    likes: 1200,
                    comments: 89,
                    content: `
                        <p>在现代社交中，开始一段对话往往是建立关系的第一步。</p>
                        <h3>1. 观察环境</h3>
                        <p>先观察周围的环境和对方的状态，找到合适的话题切入点。</p>
                        <h3>2. 真诚的赞美</h3>
                        <p>具体而真诚的赞美更容易被接纳。</p>
                        <h3>3. 开放式问题</h3>
                        <p>使用开放式问题来引导对话，鼓励对方表达。</p>
                    `
                },
                'video-1': {
                    title: '约会对话技巧实战',
                    author: '恋语教练',
                    publishTime: '5小时前',
                    views: 18000,
                    likes: 956,
                    comments: 67,
                    content: `
                        <p>视频要点回顾：</p>
                        <ul>
                            <li>控制节奏，避免自说自话</li>
                            <li>善用追问，展示真实兴趣</li>
                            <li>幽默点缀，缓解紧张氛围</li>
                        </ul>
                        <p>结合实际场景进行演练会更有效。</p>
                    `
                },
                'test-1': {
                    title: '你的恋爱类型测试',
                    author: 'LoveAI 心理组',
                    publishTime: '1天前',
                    views: 15000,
                    likes: 743,
                    comments: 124,
                    content: `
                        <p>通过10道心理问题，了解你的恋爱模式。</p>
                        <p>完成测试后将获得个性化建议。</p>
                    `
                },
                'article-2': {
                    title: '长距离恋爱维持秘诀',
                    author: 'LoveAI 编辑部',
                    publishTime: '2天前',
                    views: 9800,
                    likes: 567,
                    comments: 45,
                    content: `
                        <p>异地恋的关键在于稳定沟通与仪式感。</p>
                        <p>尝试每周一次视频约会与主题分享。</p>
                    `
                },
                'featured-1': {
                    title: '约会技巧完全指南',
                    author: 'LoveAI 编辑部',
                    publishTime: '3小时前',
                    views: 12500,
                    likes: 2300,
                    comments: 312,
                    content: `
                        <p>从初次见面到深入交往的全方位指导。</p>
                        <p>包含穿搭建议、聊天策略与行为细节。</p>
                    `
                },
                'featured-2': {
                    title: '高情商沟通秘籍',
                    author: 'LoveAI 沟通课',
                    publishTime: '12小时前',
                    views: 8700,
                    likes: 1900,
                    comments: 210,
                    content: `
                        <p>掌握让人心动的聊天技巧，建立高质量连接。</p>
                        <p>用同理心与复述技巧提升对话质量。</p>
                    `
                }
            };
        }

        loadContentDetail(contentId) {
            const data = this.contentData[contentId] || this.contentData['article-1'];
            const titleEl = document.getElementById('content-title');
            const authorEl = document.querySelector('.author-name');
            const timeEl = document.querySelector('.publish-time');
            const viewCountEl = document.getElementById('view-count');
            const likeCountEl = document.getElementById('like-count');
            const commentCountEl = document.getElementById('comment-count');
            const bodyEl = document.getElementById('content-body');
            if (titleEl) titleEl.textContent = data.title;
            if (authorEl) authorEl.textContent = data.author;
            if (timeEl) timeEl.textContent = data.publishTime;
            if (viewCountEl) viewCountEl.textContent = this.formatNumber(data.views);
            if (likeCountEl) likeCountEl.textContent = this.formatNumber(data.likes);
            if (commentCountEl) commentCountEl.textContent = this.formatNumber(data.comments);
            if (bodyEl) bodyEl.innerHTML = data.content;
            // 重置评论区
            const list = document.getElementById('comments-list');
            if (list) list.innerHTML = '';
            const count = document.getElementById('comments-count');
            if (count) count.textContent = '0';
        }

        setRating(rating) {
            this.currentRating = rating;
            this.ratingCount += 1;
            this.ratingTotal += rating;
            this.highlightStars(rating);
            const scoreEl = document.getElementById('rating-score');
            const countEl = document.getElementById('rating-count');
            if (scoreEl) scoreEl.textContent = (this.ratingTotal / this.ratingCount).toFixed(1);
            if (countEl) countEl.textContent = String(this.ratingCount);
            console.log('用户评分:', rating);
        }

        highlightStars(count) {
            document.querySelectorAll('.star-rating i').forEach((star, index) => {
                if (index < count) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        }

        updateRatingDisplay() {
            this.highlightStars(this.currentRating);
            const scoreEl = document.getElementById('rating-score');
            const countEl = document.getElementById('rating-count');
            if (scoreEl) scoreEl.textContent = this.ratingCount ? (this.ratingTotal / this.ratingCount).toFixed(1) : '0.0';
            if (countEl) countEl.textContent = String(this.ratingCount || 0);
        }

        toggleLike() {
            this.isLiked = !this.isLiked;
            this.updateActionButtons();
            console.log('点赞状态:', this.isLiked);
        }

        toggleBookmark() {
            this.isBookmarked = !this.isBookmarked;
            this.updateActionButtons();
            console.log('收藏状态:', this.isBookmarked);
        }

        updateActionButtons() {
            const likeBtn = document.getElementById('like-btn') || document.querySelector('.like-btn');
            const bookmarkBtn = document.querySelector('.bookmark-btn');
            if (likeBtn) {
                if (this.isLiked) {
                    likeBtn.classList.add('liked');
                } else {
                    likeBtn.classList.remove('liked');
                }
            }
            if (bookmarkBtn) {
                if (this.isBookmarked) {
                    bookmarkBtn.classList.add('liked');
                } else {
                    bookmarkBtn.classList.remove('liked');
                }
            }
        }

        showCommentInput() {
            const sec = document.getElementById('comment-input-section');
            if (sec) sec.style.display = 'block';
        }

        hideCommentInput() {
            const sec = document.getElementById('comment-input-section');
            if (sec) sec.style.display = 'none';
        }

        submitComment() {
            const textarea = document.getElementById('comment-input');
            const text = textarea ? textarea.value.trim() : '';
            if (!text) {
                alert('请输入评论内容');
                return;
            }
            const newComment = {
                id: Date.now(),
                author: '当前用户',
                text,
                time: '刚刚',
                likes: 0
            };
            this.addCommentToList(newComment);
            if (textarea) textarea.value = '';
            console.log('新评论:', newComment);
        }

        addCommentToList(comment) {
            const commentsList = document.getElementById('comments-list') || document.querySelector('.comments-list');
            if (!commentsList) return;
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = `
                <img src="images/default-avatar.svg" alt="用户头像" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-author">${comment.author}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-meta">
                        <span class="comment-time">${comment.time}</span>
                        <span class="comment-like" data-id="${comment.id}">
                            <i class="far fa-heart"></i> ${comment.likes}
                        </span>
                    </div>
                </div>
            `;
            commentsList.insertBefore(commentElement, commentsList.firstChild);
            const likeBtn = commentElement.querySelector('.comment-like');
            likeBtn.addEventListener('click', () => {
                this.toggleCommentLike(comment.id, likeBtn);
            });
            const count = document.getElementById('comments-count');
            if (count) count.textContent = String(parseInt(count.textContent || '0', 10) + 1);
        }

        toggleCommentLike(commentId, element) {
            const icon = element.querySelector('i');
            const isLiked = icon.classList.contains('fas');
            if (isLiked) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            } else {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
            console.log('评论点赞:', commentId, !isLiked);
        }

        loadContent() {
            // 可在此处接入后端接口获取内容列表
            // 当前实现为静态数据与基本交互
        }

        formatNumber(n) {
            if (n >= 10000) return (n / 1000 | 0) / 10 + 'K';
            return String(n);
        }
    }

    // 初始化并暴露全局API，兼容内联事件
    document.addEventListener('DOMContentLoaded', () => {
        const app = new DiscoverApp();
        window.discoverApp = app;
        window.openContentDetail = (id) => app.showContentDetail(id);
        window.closeContentDetail = () => app.hideContentDetail();
        window.toggleLike = () => app.toggleLike();
        window.showCommentInput = () => app.showCommentInput();
        window.hideCommentInput = () => app.hideCommentInput();
        window.submitComment = () => app.submitComment();
    });
})();

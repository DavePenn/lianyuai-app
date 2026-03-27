// home-ui.js
// 首页 UI：轮播卡片、场景滑块、底部导航、Toast 提示
// 依赖：showPage, navigateToMainPage (from app.js)

// 初始化首页大卡片轮播功能
function initHeroCarousel() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    const paginationDots = document.querySelectorAll('.carousel-pagination .pagination-dot');
    const paginationContainer = document.querySelector('.carousel-pagination');
    
    if (!heroSlides.length) return;
    
    console.log("初始化轮播，找到 " + heroSlides.length + " 个幻灯片");
    
    let currentIndex = 0;
    const slideCount = heroSlides.length;
    let autoSlideInterval;
    let lastScrollPosition = 0;
    let scrollDirection = 'none';
    
    // 强制显示第一个幻灯片
    if (heroSlides[0]) {
        heroSlides[0].classList.add('active');
        console.log("初始激活第一个幻灯片");
    }
    
    // 设置激活状态
    function setActiveSlide(index) {
        // 确保索引在有效范围内
        if (index < 0) index = slideCount - 1;
        if (index >= slideCount) index = 0;
        
        currentIndex = index;
        console.log("切换到幻灯片: " + currentIndex);
        
        // 更新幻灯片状态
        heroSlides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === currentIndex) {
                slide.classList.add('active');
            }
        });
        
        // 更新分页点状态
        paginationDots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === currentIndex) {
                dot.classList.add('active');
            }
        });
    }
    
    // 下一张幻灯片
    function nextSlide() {
        setActiveSlide(currentIndex + 1);
    }
    
    // 上一张幻灯片
    function prevSlide() {
        setActiveSlide(currentIndex - 1);
    }
    
    // 设置自动播放
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000); // 每5秒切换一次
    }
    
    // 停止自动播放
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }
    
    // 分页点点击事件
    paginationDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setActiveSlide(index);
            // 点击后重置自动播放计时器
            startAutoSlide();
        });
    });
    
    // 添加触摸滑动支持
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            // 暂停自动播放
            stopAutoSlide();
        }, { passive: true });
        
        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            handleSwipe();
            // 恢复自动播放
            startAutoSlide();
        }, { passive: true });
        
        function handleSwipe() {
            const SWIPE_THRESHOLD = 50;
            const xDiff = touchStartX - touchEndX;
            const yDiff = touchStartY - touchEndY;
            
            // 只处理水平方向的滑动，忽略垂直方向
            if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > SWIPE_THRESHOLD) {
                if (xDiff > 0) {
                    // 向左滑动，下一张
                    nextSlide();
                } else {
                    // 向右滑动，上一张
                    prevSlide();
                }
            }
        }
    }
    
    // 添加页面滚动监听，隐藏/显示分页指示器
    if (paginationContainer) {
        // 获取首页内容区域，用于监听滚动
        const homePage = document.getElementById('home-page');
        
        if (homePage) {
            homePage.addEventListener('scroll', () => {
                const currentScrollPosition = homePage.scrollTop;
                
                // 判断滚动方向
                if (currentScrollPosition > lastScrollPosition) {
                    scrollDirection = 'down';
                } else if (currentScrollPosition < lastScrollPosition) {
                    scrollDirection = 'up';
                }
                
                // 根据滚动方向隐藏或显示分页指示器
                if (scrollDirection === 'down') {
                    paginationContainer.classList.add('hidden');
                } else if (scrollDirection === 'up') {
                    paginationContainer.classList.remove('hidden');
                }
                
                // 更新上次滚动位置
                lastScrollPosition = currentScrollPosition;
            });
        }
    }
    
    // 开始自动播放
    startAutoSlide();
    
    // 当用户离开页面时暂停自动播放，返回时恢复
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });
}

// 初始化场景卡片滑动功能
function initScenarioSlider() {
    const scenariosContainer = document.querySelector('.scenarios-container');
    const scenarioCards = document.querySelectorAll('.scenario-card');
    const indicatorDots = document.querySelectorAll('.indicator-dot');
    const prevBtn = document.querySelector('.scenario-nav-btn.prev-btn');
    const nextBtn = document.querySelector('.scenario-nav-btn.next-btn');
    const indicatorsContainer = document.querySelector('.scenario-indicators');
    
    if (!scenariosContainer || scenarioCards.length === 0) return;
    
    let currentIndex = 0;
    const cardCount = scenarioCards.length;
    let lastScrollPosition = 0;
    let scrollDirection = 'none';
    
    // 设置活动状态
    function setActiveCard(index) {
        // 确保索引在范围内
        if (index < 0) index = 0;
        if (index >= cardCount) index = cardCount - 1;
        
        currentIndex = index;
        
        // 使用requestAnimationFrame确保DOM更新的流畅性
        requestAnimationFrame(() => {
            // 更新卡片状态
            scenarioCards.forEach((card, i) => {
                if (i === currentIndex) {
                    card.classList.add('active-scenario');
                } else {
                    card.classList.remove('active-scenario');
                }
            });
            
            // 更新指示器状态
            indicatorDots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });
        
        // 使用smooth scrolling，但避免在已经滚动时重复触发
        if (!isScrolling) {
            scenarioCards[currentIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    // 滚动监听 - 使用防抖优化性能
    let isScrolling = false;
    let scrollTimeout;
    let rafId = null;
    
    function handleScroll() {
        // 取消之前的requestAnimationFrame和timeout
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        clearTimeout(scrollTimeout);
        
        // 立即更新状态，不等待
        rafId = requestAnimationFrame(() => {
            // 使用getBoundingClientRect获取实时位置
            const containerRect = scenariosContainer.getBoundingClientRect();
            const containerCenter = containerRect.left + containerRect.width / 2;
            
            let closestCardIndex = 0;
            let minDistance = Infinity;
            
            scenarioCards.forEach((card, index) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(cardCenter - containerCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCardIndex = index;
                }
            });
            
            // 立即更新活动卡片，不等待防抖
            if (closestCardIndex !== currentIndex) {
                currentIndex = closestCardIndex;
                
                // 直接更新类名，不使用setActiveCard避免嵌套的requestAnimationFrame
                scenarioCards.forEach((card, i) => {
                    if (i === currentIndex) {
                        card.classList.add('active-scenario');
                    } else {
                        card.classList.remove('active-scenario');
                    }
                });
                
                // 更新指示器
                indicatorDots.forEach((dot, i) => {
                    if (i === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
        
        // 设置滚动结束标志
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 100);
    }
    
    // 使用passive: true优化滚动性能
    scenariosContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // 按钮点击事件
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            setActiveCard(currentIndex - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            setActiveCard(currentIndex + 1);
        });
    }
    
    // 指示器点击事件
    indicatorDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setActiveCard(index);
        });
    });
    
    // 卡片点击事件
    scenarioCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            setActiveCard(index);
        });
    });
    
    // 场景卡片按钮点击事件
    const scenarioBtns = document.querySelectorAll('.scenario-btn');
    scenarioBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            
            // 获取所属场景
            const scenarioCard = btn.closest('.scenario-card');
            const scenarioType = scenarioCard.getAttribute('data-scenario');
            
            // 直接切换到聊天页面，不显示任何toast
            setTimeout(() => {
                document.querySelector('.tab-item[data-page="chat"]').click();
            }, 100);
        });
    });
    
    // 初始设置活动卡片
    setActiveCard(0);
    
    // 添加触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;
    
    scenariosContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    scenariosContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const SWIPE_THRESHOLD = 50;
        
        if (touchStartX - touchEndX > SWIPE_THRESHOLD) {
            // 向左滑动
            setActiveCard(currentIndex + 1);
        } else if (touchEndX - touchStartX > SWIPE_THRESHOLD) {
            // 向右滑动
            setActiveCard(currentIndex - 1);
        }
    }
    
    // 添加页面滚动监听，隐藏/显示指示器
    if (indicatorsContainer) {
        // 获取首页内容区域，用于监听滚动
        const homePage = document.getElementById('home-page');
        
        if (homePage) {
            homePage.addEventListener('scroll', () => {
                const currentScrollPosition = homePage.scrollTop;
                
                // 判断滚动方向
                if (currentScrollPosition > lastScrollPosition) {
                    scrollDirection = 'down';
                } else if (currentScrollPosition < lastScrollPosition) {
                    scrollDirection = 'up';
                }
                
                // 根据滚动方向隐藏或显示指示器
                if (scrollDirection === 'down') {
                    indicatorsContainer.classList.add('hidden');
                } else if (scrollDirection === 'up') {
                    indicatorsContainer.classList.remove('hidden');
                }
                
                // 更新上次滚动位置
                lastScrollPosition = currentScrollPosition;
            });
        }
    }
}
// 底部导航栏和页面切换
function initAppNavigation() {
    const tabItems = document.querySelectorAll('.tab-item');
    const appPages = document.querySelectorAll('.app-page');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            // 获取目标页面
            const targetPageId = tab.getAttribute('data-page') + '-page';
            const targetPage = document.getElementById(targetPageId);
            
            // 更新底部导航状态
            tabItems.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            
            // 更新页面显示状态
            appPages.forEach(page => page.classList.remove('active'));
            targetPage.classList.add('active');
            
            // 更新页面标题
            updatePageTitle(tab.getAttribute('data-page'));
            
            // 如果是聊天页面，自动聚焦输入框
            if (targetPageId === 'chat-page') {
                const chatInput = document.querySelector('.chat-input-field');
                if (chatInput) {
                    setTimeout(() => chatInput.focus(), 300);
                }
            }
        });
    });
    
}

// 显示Toast消息
function showToast(message, type = 'info') {
    // 立即关闭已有toast - 修复二级页面点击产生多个toast问题
    const existingToasts = document.querySelectorAll('.app-toast');
    existingToasts.forEach(toast => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    });
    
    const toast = document.createElement('div');
    toast.className = `app-toast ${type}-toast`;
    toast.textContent = message;
    
    // 添加样式
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: type === 'success' ? '#ff3e79' : // 使用主色调代替绿色
                         type === 'error' ? '#f44336' : 
                         type === 'warning' ? '#ff9800' : '#6c5ce7',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '1000',
        fontSize: '14px',
        fontWeight: '500',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2000); // 缩短显示时间，避免toast堆积
}


// --- Chat feature module moved to js/chat-feature.js ---

// --- Chat sessions module moved to js/chat-sessions.js ---

// 更新页面标题

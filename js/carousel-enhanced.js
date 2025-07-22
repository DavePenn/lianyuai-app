/**
 * 增强的轮播组件 - 解决移动端交互问题
 */

class EnhancedCarousel {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.warn('轮播容器不存在:', containerSelector);
            return;
        }

        this.slides = this.container.querySelectorAll('.hero-slide');
        this.dots = document.querySelectorAll('.carousel-pagination .pagination-dot');
        
        if (!this.slides.length) {
            console.warn('没有找到轮播幻灯片');
            return;
        }

        // 配置选项
        this.options = {
            autoPlay: true,
            autoPlayInterval: 5000,
            swipeThreshold: 50,
            touchSensitivity: 0.3,
            enableKeyboard: true,
            ...options
        };

        this.currentIndex = 0;
        this.slideCount = this.slides.length;
        this.autoPlayTimer = null;
        this.isTransitioning = false;
        
        // 触摸状态
        this.touch = {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            deltaX: 0,
            deltaY: 0,
            isDown: false,
            hasMoved: false
        };

        this.init();
    }

    init() {
        console.log('初始化增强轮播组件...');
        
        // 设置初始状态
        this.setupInitialState();
        
        // 绑定事件
        this.bindEvents();
        
        // 开始自动播放
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }

        console.log('轮播组件初始化完成');
    }

    setupInitialState() {
        // 确保第一个幻灯片是激活状态
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === 0) {
                slide.classList.add('active');
            }
        });

        // 设置分页点状态
        this.updatePagination();
    }

    bindEvents() {
        // 绑定分页点点击事件
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(index);
            });
        });

        // 绑定触摸事件（被动监听以提高性能）
        this.bindTouchEvents();

        // 绑定键盘事件
        if (this.options.enableKeyboard) {
            this.bindKeyboardEvents();
        }

        // 页面可见性变化事件
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                if (this.options.autoPlay) {
                    this.startAutoPlay();
                }
            }
        });

        // 窗口失焦/获焦事件
        window.addEventListener('blur', () => this.stopAutoPlay());
        window.addEventListener('focus', () => {
            if (this.options.autoPlay) {
                this.startAutoPlay();
            }
        });
    }

    bindTouchEvents() {
        // 使用被动监听器提高性能
        const passiveOptions = { passive: true };

        // 触摸开始
        this.container.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, passiveOptions);

        // 触摸移动
        this.container.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, passiveOptions);

        // 触摸结束
        this.container.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, passiveOptions);

        // 触摸取消
        this.container.addEventListener('touchcancel', (e) => {
            this.handleTouchEnd(e);
        }, passiveOptions);

        // 鼠标事件（用于桌面端调试）
        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // 只处理左键
                this.handleMouseStart(e);
            }
        });

        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        document.addEventListener('mouseup', (e) => {
            this.handleMouseEnd(e);
        });
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.isCarouselInView()) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.prevSlide();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextSlide();
                        break;
                }
            }
        });
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.touch.startX = touch.clientX;
        this.touch.startY = touch.clientY;
        this.touch.isDown = true;
        this.touch.hasMoved = false;
        
        // 暂停自动播放
        this.stopAutoPlay();
    }

    handleTouchMove(e) {
        if (!this.touch.isDown) return;

        const touch = e.touches[0];
        this.touch.deltaX = touch.clientX - this.touch.startX;
        this.touch.deltaY = touch.clientY - this.touch.startY;
        
        // 判断是否是有效的水平滑动
        const absX = Math.abs(this.touch.deltaX);
        const absY = Math.abs(this.touch.deltaY);
        
        if (absX > absY && absX > 10) {
            this.touch.hasMoved = true;
            // 可以在这里添加实时的视觉反馈
        }
    }

    handleTouchEnd(e) {
        if (!this.touch.isDown) return;

        this.touch.isDown = false;
        
        // 计算最终的滑动距离
        if (this.touch.hasMoved) {
            this.handleSwipe();
        }

        // 重新开始自动播放
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }

    handleMouseStart(e) {
        this.touch.startX = e.clientX;
        this.touch.startY = e.clientY;
        this.touch.isDown = true;
        this.touch.hasMoved = false;
        this.stopAutoPlay();
        
        // 阻止默认的拖拽行为
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.touch.isDown) return;
        
        this.touch.deltaX = e.clientX - this.touch.startX;
        this.touch.deltaY = e.clientY - this.touch.startY;
        
        const absX = Math.abs(this.touch.deltaX);
        const absY = Math.abs(this.touch.deltaY);
        
        if (absX > absY && absX > 10) {
            this.touch.hasMoved = true;
        }
    }

    handleMouseEnd(e) {
        if (!this.touch.isDown) return;
        
        this.touch.isDown = false;
        
        if (this.touch.hasMoved) {
            this.handleSwipe();
        }

        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }

    handleSwipe() {
        const absX = Math.abs(this.touch.deltaX);
        const absY = Math.abs(this.touch.deltaY);
        
        // 确保是水平滑动且超过阈值
        if (absX > absY && absX > this.options.swipeThreshold) {
            if (this.touch.deltaX > 0) {
                // 向右滑动，显示上一张
                this.prevSlide();
            } else {
                // 向左滑动，显示下一张
                this.nextSlide();
            }
        }
    }

    goToSlide(index, userTriggered = true) {
        if (this.isTransitioning || index === this.currentIndex) {
            return;
        }

        if (index < 0) index = this.slideCount - 1;
        if (index >= this.slideCount) index = 0;

        this.isTransitioning = true;
        const previousIndex = this.currentIndex;
        this.currentIndex = index;

        // 更新幻灯片状态
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === this.currentIndex) {
                slide.classList.add('active');
            }
        });

        // 更新分页指示器
        this.updatePagination();

        // 重置过渡状态
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500); // 与CSS过渡时间一致

        // 如果是用户触发的操作，重新开始自动播放
        if (userTriggered && this.options.autoPlay) {
            this.startAutoPlay();
        }

        console.log(`轮播切换: ${previousIndex} -> ${this.currentIndex}`);
    }

    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }

    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }

    updatePagination() {
        this.dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === this.currentIndex) {
                dot.classList.add('active');
            }
        });
    }

    startAutoPlay() {
        this.stopAutoPlay();
        if (this.options.autoPlay && this.slideCount > 1) {
            this.autoPlayTimer = setInterval(() => {
                this.nextSlide();
            }, this.options.autoPlayInterval);
        }
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    isCarouselInView() {
        const rect = this.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    // 公共API方法
    pause() {
        this.stopAutoPlay();
    }

    resume() {
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }

    destroy() {
        this.stopAutoPlay();
        // 移除事件监听器
        // 注意：在实际应用中应该保存事件处理器的引用以便正确移除
    }

    // 设置选项
    setOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        // 重新应用自动播放设置
        if (this.options.autoPlay) {
            this.startAutoPlay();
        } else {
            this.stopAutoPlay();
        }
    }
}

// 全局初始化函数
window.initEnhancedCarousel = function() {
    // 替换原有的轮播初始化
    if (window.heroCarousel) {
        window.heroCarousel.destroy();
    }
    
    window.heroCarousel = new EnhancedCarousel('.carousel-container', {
        autoPlay: true,
        autoPlayInterval: 5000,
        swipeThreshold: 30,
        enableKeyboard: true
    });
};

// 确保在DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initEnhancedCarousel);
} else {
    window.initEnhancedCarousel();
}

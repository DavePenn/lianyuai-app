// profile-data.js
// 用户资料数据：地区选择、保存/加载/预加载用户资料、增强多模态、粘贴上传
// 依赖：window.backendService, showToast (from app.js)

// 初始化多模态交互增强功能
function initEnhancedMultiModal() {
    // 初始化拖拽上传管理器
    window.dragUploadManager = new DragUploadManager();
    
    
    // 添加全局事件监听
    document.addEventListener('paste', handlePasteEvent);
    
    console.log('🎉 多模态交互增强功能初始化完成！');
}

// 处理粘贴事件
function handlePasteEvent(e) {
    const chatPage = document.getElementById('chat-page');
    if (!chatPage || !chatPage.classList.contains('active')) return;
    
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = item.getAsFile();
            if (file && window.dragUploadManager) {
                window.dragUploadManager.processFile(file);
            }
            break;
        }
    }
}



// 粘贴事件增强处理
function showPasteIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'paste-upload-indicator';
    indicator.textContent = '📸 图片已粘贴并上传';
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        if (document.body.contains(indicator)) {
            document.body.removeChild(indicator);
        }
    }, 3000);
}

// 增强的粘贴事件处理
function handlePasteEvent(e) {
    const chatPage = document.getElementById('chat-page');
    if (!chatPage || !chatPage.classList.contains('active')) return;
    
    const items = e.clipboardData.items;
    let hasImage = false;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            hasImage = true;
            const file = item.getAsFile();
            if (file && window.dragUploadManager) {
                showPasteIndicator();
                window.dragUploadManager.processFile(file);
            }
            break;
        }
    }
    
    return hasImage;
}



// 确保在DOM加载完成后初始化
function ensureEnhancedMultiModalInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancedMultiModal);
    } else {
        initEnhancedMultiModal();
    }
}

// 立即尝试初始化
ensureEnhancedMultiModalInit();

/**
 * 初始化地区选择联动功能
 */
function initLocationSelector() {
    const countrySelect = document.getElementById('user-country');
    const citySelect = document.getElementById('user-city');
    
    if (!countrySelect || !citySelect) return;
    
    // 定义国家对应的城市数据
    const countryCities = {
        'us': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
        'uk': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff'],
        'ca': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
        'au': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
        'de': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
        'fr': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
        'jp': ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'],
        'kr': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang'],
        'sg': ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'],
        'hk': ['Central and Western', 'Eastern', 'Southern', 'Wan Chai', 'Kowloon City', 'Kwun Tong', 'Sham Shui Po', 'Wong Tai Sin', 'Yau Tsim Mong'],
        'tw': ['Taipei', 'New Taipei', 'Taoyuan', 'Taichung', 'Tainan', 'Kaohsiung', 'Keelung', 'Hsinchu', 'Chiayi', 'Changhua'],
        'other': ['Other City']
    };
    
    // 监听国家选择变化
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        
        // 清空城市选项
        citySelect.innerHTML = '<option value="" data-i18n="edit_profile.select_city">请选择城市</option>';
        
        // 如果选择了国家，添加对应的城市选项
        if (selectedCountry && countryCities[selectedCountry]) {
            const cities = countryCities[selectedCountry];
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.toLowerCase().replace(/\s+/g, '-');
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
        
        // 更新国际化文本
        if (window.I18nManager) {
            window.I18nManager.updatePageTexts();
        }
    });
}

// 在页面加载完成后初始化地区选择器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocationSelector);
} else {
    initLocationSelector();
}

/**
 * 处理用户资料保存
 */
async function handleSaveProfile() {
    try {
        // 显示保存中提示
        showToast((window.i18n && window.i18n.t) ? window.i18n.t('common.saving') : 'Saving...', 'info');
        
        // 获取表单数据
        const nickname = document.getElementById('user-nickname') ? document.getElementById('user-nickname').value : '';
        const bio = document.getElementById('user-bio') ? document.getElementById('user-bio').value : '';
        const contact = document.getElementById('user-contact') ? document.getElementById('user-contact').value : '';
        
        // 获取性别选择
        const genderRadio = document.querySelector('input[name="user-gender"]:checked');
        const gender = genderRadio ? genderRadio.value : '';
        
        // 获取出生日期
        const birthDate = document.getElementById('user-birth') ? document.getElementById('user-birth').value : '';
        
        // 获取地区选择
        const province = document.getElementById('user-province') ? document.getElementById('user-province').value : '';
        const city = document.getElementById('user-city') ? document.getElementById('user-city').value : '';
        
        // 获取恋爱状态
        const relationshipRadio = document.querySelector('input[name="user-relationship"]:checked');
        const relationshipStatus = relationshipRadio ? relationshipRadio.value : '';
        
        // 获取兴趣爱好
        const interestTags = document.querySelectorAll('.interest-tag.active:not(.add-tag)');
        const interests = Array.from(interestTags).map(tag => tag.querySelector('span').textContent);
        
        // 构建更新数据
        const updateData = {};
        
        // 只添加有值的字段，避免传递空字符串或undefined
        if (nickname) updateData.username = nickname;
        if (bio) updateData.bio = bio;
        if (gender) updateData.gender = gender;
        if (birthDate) updateData.birth_date = birthDate;
        if (province) updateData.province = province;
        if (city) updateData.city = city;
        if (relationshipStatus) updateData.relationship_status = relationshipStatus;
        if (interests.length > 0) updateData.interests = interests.join(',');
        if (contact) updateData.contact = contact;
        
        // 调用后端API保存数据
        const backendService = window.backendService;
        if (!backendService) {
            throw new Error('后端服务未初始化');
        }
        
        const response = await backendService.updateUserProfile(updateData);
        
        if (response.success) {
            showToast((window.i18n && window.i18n.t) ? window.i18n.t('common.save_success') : 'Saved successfully', 'success');
            
            // 更新本地存储的用户信息
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            Object.assign(currentUser, updateData);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // 更新预加载缓存数据
            if (window.cachedUserProfile) {
                Object.assign(window.cachedUserProfile, updateData);
                localStorage.setItem('cachedUserProfile', JSON.stringify(window.cachedUserProfile));
            }
            
            // 更新authManager中的用户信息
            if (window.authManager && window.authManager.currentUser) {
                Object.assign(window.authManager.currentUser, updateData);
            }

            syncProfileIdentityCard({
                ...(window.authManager && window.authManager.currentUser ? window.authManager.currentUser : {}),
                ...currentUser,
                ...updateData
            });
            
            console.log('用户资料更新成功:', response.data);
            
            // 保存成功后立即返回上一页
            // 隐藏编辑资料页面
            const editProfilePage = document.getElementById('edit-profile-page');
            if (editProfilePage) {
                editProfilePage.classList.remove('active');
            }
            
            // 显示个人中心主页面
            const profilePage = document.getElementById('profile-page');
            if (profilePage) {
                profilePage.classList.add('active');
            }
            
            // 显示底部导航栏
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav) {
                bottomNav.style.display = 'flex';
                bottomNav.style.backgroundColor = '';
                bottomNav.style.borderTop = '';
            }
        } else {
            throw new Error(response.message || ((window.i18n && window.i18n.t) ? window.i18n.t('common.save_failed') : 'Save failed'));
        }
        
    } catch (error) {
        console.error('保存用户资料失败:', error);
        showToast(((window.i18n && window.i18n.t) ? window.i18n.t('common.save_failed') : 'Save failed') + ': ' + error.message, 'error');
    }
}

/**
 * 填充用户资料表单
 * @param {Object} userData - 用户数据
 */
function fillUserProfileForm(userData) {
    if (!userData) return;
    
    // 填充表单数据
    const nicknameInput = document.getElementById('user-nickname');
    if (nicknameInput && userData.username) {
        nicknameInput.value = userData.username;
    }
    
    const bioTextarea = document.getElementById('user-bio');
    if (bioTextarea && userData.bio) {
        bioTextarea.value = userData.bio;
    }
    
    const contactInput = document.getElementById('user-contact');
    if (contactInput && userData.contact) {
        contactInput.value = userData.contact;
    }
    
    // 设置性别选择
    if (userData.gender) {
        const genderRadio = document.querySelector(`input[name="user-gender"][value="${userData.gender}"]`);
        if (genderRadio) {
            genderRadio.checked = true;
        }
    }
    
    // 设置出生日期
    const birthInput = document.getElementById('user-birth');
    if (birthInput && userData.birth_date) {
        birthInput.value = userData.birth_date;
    }
    
    // 设置地区
    const provinceSelect = document.getElementById('user-province');
    if (provinceSelect && userData.province) {
        provinceSelect.value = userData.province;
    }
    
    const citySelect = document.getElementById('user-city');
    if (citySelect && userData.city) {
        citySelect.value = userData.city;
    }
    
    // 设置恋爱状态
    if (userData.relationship_status) {
        const relationshipRadio = document.querySelector(`input[name="user-relationship"][value="${userData.relationship_status}"]`);
        if (relationshipRadio) {
            relationshipRadio.checked = true;
        }
    }
    
    // 设置兴趣爱好
    if (userData.interests) {
        const interests = userData.interests.split(',').filter(interest => interest.trim());
        const interestContainer = document.querySelector('.interest-tags');
        if (interestContainer && interests.length > 0) {
            // 清除现有的兴趣标签（除了添加按钮）
            const existingTags = interestContainer.querySelectorAll('.interest-tag:not(.add-tag)');
            existingTags.forEach(tag => tag.remove());
            
            // 添加用户的兴趣标签
            const addButton = interestContainer.querySelector('.add-tag');
            interests.forEach(interest => {
                const tag = document.createElement('div');
                tag.className = 'interest-tag active';
                tag.innerHTML = `
                    <span>${interest.trim()}</span>
                    <i class="fas fa-times"></i>
                `;
                interestContainer.insertBefore(tag, addButton);
            });
        }
    }
}

/**
 * 预加载用户资料数据（应用启动时调用）
 */
async function preloadUserProfileData() {
    try {
        const backendService = window.backendService;
        if (!backendService) {
            console.log('后端服务未初始化，跳过预加载用户资料');
            return;
        }
        
        // 设置较短的超时时间，避免影响应用启动速度
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('预加载超时')), 3000);
        });
        
        // 获取用户资料并缓存
        const response = await Promise.race([
            backendService.getUserProfile(),
            timeoutPromise
        ]);
        
        if (response && response.success && response.data) {
            // 将用户资料数据缓存到全局变量和本地存储
            window.cachedUserProfile = response.data;
            localStorage.setItem('cachedUserProfile', JSON.stringify(response.data));
            syncProfileIdentityCard(response.data);
            console.log('用户资料数据预加载成功');
        } else {
            console.log('预加载用户资料失败或数据为空');
        }
        
    } catch (error) {
        console.log('预加载用户资料数据失败:', error.message);
    }
}

/**
 * 加载用户资料数据到编辑表单
 */
async function loadUserProfileData() {
    try {
        // 首先尝试使用预加载的缓存数据
        let userData = window.cachedUserProfile;
        if (!userData) {
            // 尝试从本地存储获取缓存数据
            const cachedData = localStorage.getItem('cachedUserProfile');
            if (cachedData) {
                try {
                    userData = JSON.parse(cachedData);
                    console.log('使用本地缓存的用户资料数据');
                } catch (e) {
                    console.error('解析缓存数据失败:', e);
                }
            }
        }
        
        // 如果有缓存数据，直接使用
        if (userData) {
            fillUserProfileForm(userData);
            syncProfileIdentityCard(userData);
            console.log('用户资料数据已从缓存加载到表单');
            return;
        }
        
        // 如果没有缓存数据，则实时获取
        const backendService = window.backendService;
        if (!backendService) {
            console.error('后端服务未初始化');
            // 尝试从本地存储获取用户数据作为备用
            const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (localUser.username) {
                fillUserProfileForm(localUser);
                syncProfileIdentityCard(localUser);
            }
            return;
        }
        
        // 设置超时时间，避免长时间等待
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('请求超时')), 5000);
        });
        
        // 获取用户资料
        const response = await Promise.race([
            backendService.getUserProfile(),
            timeoutPromise
        ]);
        
        if (response && response.success && response.data) {
            // 更新缓存
            window.cachedUserProfile = response.data;
            localStorage.setItem('cachedUserProfile', JSON.stringify(response.data));
            
            fillUserProfileForm(response.data);
            syncProfileIdentityCard(response.data);
            console.log('用户资料数据已加载到表单');
        } else {
            console.log('获取用户资料失败或数据为空');
            // 尝试从本地存储获取数据作为备用
            const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (localUser.username) {
                fillUserProfileForm(localUser);
                syncProfileIdentityCard(localUser);
                console.log('使用本地缓存的用户数据');
            }
        }
        
    } catch (error) {
        console.error('加载用户资料数据失败:', error);
    }
}

/* 🎉 恋语 AI 多模态交互功能完整实现完成！ 🎉 */

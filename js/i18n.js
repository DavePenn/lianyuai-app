const translations = {
    'zh-CN': {
        'nav.home': '首页',
        'nav.chat': '聊天',
        'nav.discover': '发现',
        'nav.message': '消息',
        'nav.profile': '我的',
        'settings.title': '个性化设置',
        'profile.editTitle': '编辑资料',
        'statistics.title': '数据统计',
        'vip.title': '升级会员',
        'help.title': '帮助中心',
        'about.title': '关于我们',
        'settings.language': '语言',
        'settings.languageDesc': '切换应用语言'
    },
    'en-US': {
        'nav.home': 'Home',
        'nav.chat': 'Chat',
        'nav.discover': 'Discover',
        'nav.message': 'Messages',
        'nav.profile': 'Profile',
        'settings.title': 'Preferences',
        'profile.editTitle': 'Edit Profile',
        'statistics.title': 'Statistics',
        'vip.title': 'Upgrade VIP',
        'help.title': 'Help Center',
        'about.title': 'About Us',
        'settings.language': 'Language',
        'settings.languageDesc': 'Switch app language'
    }
};

let currentLang = localStorage.getItem('lianyuai_language') || 'zh-CN';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lianyuai_language', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = translations[lang][key];
        if (text) {
            el.textContent = text;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);
});

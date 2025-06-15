# 贡献指南

感谢您对恋语AI项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、设计、测试和反馈。

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- Git
- 现代浏览器（Chrome, Firefox, Safari, Edge）

### 本地开发设置
```bash
# 1. Fork并克隆仓库
git clone https://github.com/your-username/lianyu_ai-git.git
cd lianyu_ai-git

# 2. 安装依赖（如果有package.json）
npm install

# 3. 启动开发服务器
python3 -m http.server 8000
# 或者使用其他静态服务器

# 4. 在浏览器中打开 http://localhost:8000
```

## 📋 贡献类型

### 🐛 Bug修复
1. 在Issues中搜索是否已有相关报告
2. 如果没有，请创建新的Bug报告
3. Fork仓库并创建修复分支
4. 修复问题并添加测试
5. 提交Pull Request

### ✨ 新功能
1. 先创建Feature Request Issue讨论
2. 等待维护者确认后再开始开发
3. Fork仓库并创建功能分支
4. 实现功能并添加文档
5. 提交Pull Request

### 📝 文档改进
1. 直接Fork仓库
2. 改进文档内容
3. 提交Pull Request

### 🎨 设计优化
1. 创建Issue描述设计问题
2. 提供设计稿或原型
3. 实现设计并提交PR

## 🔄 工作流程

### 分支命名规范
- `feature/功能名称` - 新功能开发
- `fix/问题描述` - Bug修复
- `docs/文档类型` - 文档更新
- `style/样式描述` - 样式调整
- `refactor/重构描述` - 代码重构
- `test/测试描述` - 测试相关

### 提交信息规范
使用[约定式提交](https://www.conventionalcommits.org/zh-hans/)格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

#### 类型说明
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

#### 示例
```
feat(chat): 添加多语言支持功能

- 实现中英文切换
- 添加语言检测
- 更新UI文本国际化

Closes #123
```

## 📏 代码规范

### JavaScript规范
- 使用ES6+语法
- 优先使用const，其次let，避免var
- 使用分号结尾
- 使用2空格缩进
- 函数和变量使用驼峰命名
- 常量使用大写下划线命名

```javascript
// ✅ 好的示例
const API_BASE_URL = 'https://api.example.com';
const userName = 'john_doe';

function getUserInfo(userId) {
  return fetch(`${API_BASE_URL}/users/${userId}`);
}

// ❌ 避免的写法
var api_url = 'https://api.example.com'
function get_user_info(user_id) {
    return fetch(api_url + '/users/' + user_id)
}
```

### HTML规范
- 使用语义化标签
- 属性值使用双引号
- 自闭合标签添加斜杠
- 合理使用data-*属性

```html
<!-- ✅ 好的示例 -->
<article class="card" data-i18n="hero.title">
  <header>
    <h2>标题</h2>
  </header>
  <main>
    <p>内容</p>
  </main>
</article>
```

### CSS规范
- 使用类选择器，避免ID选择器
- 使用BEM命名方法论
- 移动端优先的响应式设计
- 使用CSS变量定义主题色彩

```css
/* ✅ 好的示例 */
.card {
  --card-bg: #ffffff;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}

.card__title {
  font-size: 1.2rem;
  font-weight: 600;
}

.card__content {
  padding: 1rem;
}
```

## 🧪 测试要求

### 测试类型
1. **功能测试**: 确保新功能正常工作
2. **回归测试**: 确保修改不影响现有功能
3. **兼容性测试**: 在不同浏览器和设备上测试
4. **性能测试**: 确保性能不受影响

### 测试清单
- [ ] 功能在主流浏览器中正常工作
- [ ] 移动端适配良好
- [ ] 国际化功能正常
- [ ] 无控制台错误
- [ ] 性能指标符合要求

## 📝 Pull Request指南

### PR标题格式
```
<类型>: <简短描述>
```

### PR描述要求
使用提供的PR模板，包含：
- 变更内容描述
- 测试情况说明
- 相关Issue链接
- 截图或演示（如适用）

### 审查流程
1. 自动化检查通过
2. 代码审查（至少1人）
3. 功能测试验证
4. 维护者最终审批
5. 合并到主分支

## 🎯 Issue指南

### Bug报告
- 使用Bug报告模板
- 提供详细的复现步骤
- 包含环境信息
- 添加相关截图

### 功能请求
- 使用功能请求模板
- 说明使用场景和价值
- 提供设计建议
- 考虑实现复杂度

## 🏷️ 标签说明

### 优先级
- `priority/high` - 高优先级
- `priority/medium` - 中优先级
- `priority/low` - 低优先级

### 类型
- `bug` - Bug报告
- `enhancement` - 功能增强
- `documentation` - 文档相关
- `question` - 问题咨询

### 状态
- `good first issue` - 适合新手
- `help wanted` - 需要帮助
- `wontfix` - 不会修复
- `duplicate` - 重复问题

## 🤝 社区准则

### 行为准则
- 尊重所有贡献者
- 保持友善和专业
- 欢迎不同观点和建议
- 避免人身攻击和歧视

### 沟通方式
- Issue讨论技术问题
- PR评论代码相关问题
- 邮件联系敏感问题

## 📞 获取帮助

如果您在贡献过程中遇到问题：

1. 查看现有的Issues和文档
2. 创建新的Issue寻求帮助
3. 联系维护者

## 🎉 致谢

感谢所有为项目做出贡献的开发者！您的贡献让恋语AI变得更好。

---

再次感谢您的贡献！🚀
# Skill: 调试 AI Prompt

## Description
优化或调试 AI 扩展能力的 Prompt，使输出更稳定、更符合产品要求。

## Steps

### 1. 定位 Prompt
- AI 扩展能力的 Prompt 在 `backend/src/controllers/aiExtensionController.js`
- AI 基础配置在 `backend/src/config/aiConfig.js`
- 模型调用在 `backend/src/services/aiService.js`

### 2. Prompt 结构检查
确认 Prompt 包含四部分：
1. **系统角色定义** — 模型是谁、目标、边界
2. **判断框架** — 阶段定义、信号类型、推进窗口等级
3. **用户输入上下文** — 聊天内容、背景、问题
4. **输出格式要求** — 固定 JSON 字段

### 3. 常见问题排查
- 输出不稳定 → 检查是否明确要求了 JSON 格式
- 输出太空泛 → 检查是否提供了具体判断框架
- 输出像陪聊 → 检查角色定义是否明确"判断助手"而非"聊天机器人"
- 字段缺失 → 检查是否列出了所有必需字段

### 4. 测试
- 用 2-3 个不同阶段的典型场景测试
- 验证输出 JSON 可被前端正常解析
- 验证 fallback 逻辑

## 文风要求
- 冷静、不空泛、不鸡汤、不夸张
- 具体、像军师，不像安慰型陪聊
- 不做绝对预测，不伪装读心

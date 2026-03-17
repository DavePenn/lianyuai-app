# 恋语AI：MVP V1 接口与数据结构草案

## 文档目的

这份文档用于把 `MVP V1` 的产品思路转换成前后端可以直接实现的接口与数据结构草案。

当前目标不是设计一个最终版协议，而是定义一套足够稳定、能支撑首版落地的最小接口。

这份草案默认遵循当前工程的现有风格：

- 前端通过 `BackendService` 发请求
- 前端通过 `AIService` 包装业务能力
- 后端在 `/api/ai/*` 下扩展 AI 能力接口
- 后端响应继续使用当前项目常见的 `{ status, data }` 风格

---

## 一、MVP V1 需要新增的核心能力

当前 MVP V1 只新增一个主能力：

**关系分析**

它负责接收用户输入的聊天上下文与关系背景，输出一份结构化的关系雷达结果。

### 新能力建议名称

建议统一叫：

- `relationship-analysis`

### 建议新增接口

`POST /api/ai/relationship-analysis`

这个接口是 MVP V1 的核心接口。

---

## 二、为什么只先定义一个接口

因为当前 MVP V1 的核心闭环就是：

1. 输入上下文
2. 分析关系局势
3. 展示结果
4. 再进入聊天页细化

所以首版不需要额外拆很多接口。

### 当前不建议新增的接口

先不做：

- 独立的阶段判断接口
- 独立的推进判断接口
- 独立的信号提取接口
- 独立的长期关系档案接口

首版统一在一个分析接口里完成即可。

---

## 三、关系分析接口：请求结构

### 接口

`POST /api/ai/relationship-analysis`

### 请求体结构

建议请求体分成四块：

1. `chatContext`
2. `concern`
3. `background`
4. `options`

---

### 1. chatContext

作用：

- 提供分析所依据的聊天上下文

建议字段：

```json
{
  "sourceType": "pasted_text",
  "rawText": "完整聊天文本",
  "extractedSegments": [
    {
      "speaker": "user",
      "text": "消息内容"
    },
    {
      "speaker": "target",
      "text": "消息内容"
    }
  ]
}
```

### 字段说明

- `sourceType`
  可选值建议：
  - `pasted_text`
  - `screenshot_ocr`
  - `mixed`

- `rawText`
  原始聊天文本，首版建议作为必填核心字段。

- `extractedSegments`
  可选字段。
  如果前端后续支持把聊天记录整理成消息段落，可以附带发给后端。

### 当前决定

首版分析接口不直接接收图片文件。

图片上传和 OCR 属于输入页前置处理，不进入这条主接口的协议核心。

也就是说：

- 关系分析接口接收的是“可分析文本”
- 不是原始截图文件

---

### 2. concern

作用：

- 告诉系统用户当前最想知道什么

建议结构：

```json
{
  "type": "should_i_push",
  "customNote": "我想知道现在约她会不会太快"
}
```

### concern.type 建议枚举

首版建议控制在以下几类：

- `interest_level`
- `should_i_push`
- `why_cold_down`
- `am_i_too_fast`
- `what_next`
- `how_to_reply`

### 字段说明

- `type`
  当前主困惑类型，建议必填。

- `customNote`
  用户补充说明，可选。

---

### 3. background

作用：

- 补充聊天内容无法直接看出的背景信息

建议结构：

```json
{
  "knownDuration": "few_weeks",
  "seenOffline": "once",
  "subjectiveStage": "getting_closer",
  "initiativeSide": "user",
  "currentGoal": "light_invite",
  "temperatureChange": "slightly_cooler",
  "hasInviteHistory": true,
  "hasConflict": false
}
```

### 字段建议

- `knownDuration`
  可选值建议：
  - `just_met`
  - `within_week`
  - `few_weeks`
  - `over_month`
  - `longer`

- `seenOffline`
  可选值建议：
  - `never`
  - `once`
  - `several_times`

- `subjectiveStage`
  可选值建议：
  - `just_met`
  - `chatting_for_a_while`
  - `getting_closer`
  - `slightly_flirty`
  - `stuck_recently`

- `initiativeSide`
  可选值建议：
  - `user`
  - `balanced`
  - `target`
  - `unclear`

- `currentGoal`
  可选值建议：
  - `keep_chatting`
  - `test_interest`
  - `light_invite`
  - `build_flirt`
  - `repair_rhythm`

- `temperatureChange`
  可选值建议：
  - `stable`
  - `warmer`
  - `slightly_cooler`
  - `much_cooler`
  - `unclear`

- `hasInviteHistory`
  布尔值，可选。

- `hasConflict`
  布尔值，可选。

### 当前决定

这些字段全部属于“增强判断质量”的结构化背景。

首版可允许部分缺失，但：

- `initiativeSide`
- `currentGoal`

建议作为前端强引导字段。

---

### 4. options

作用：

- 提供当前分析时的非业务选项

建议结构：

```json
{
  "responseLanguage": "zh-CN",
  "includeReplies": true
}
```

### 字段说明

- `responseLanguage`
  用于控制返回文案语言。

- `includeReplies`
  是否同时返回推荐话术。
  首版默认建议为 `true`。

---

## 四、关系分析接口：响应结构

### 响应格式

建议延续当前项目风格：

```json
{
  "status": "success",
  "data": {
    "...": "..."
  }
}
```

### data 建议结构

建议固定返回以下字段：

```json
{
  "stage": {
    "label": "稳定互动",
    "reason": "最近互动比较稳，但还没有强到适合做太重推进动作"
  },
  "summary": "一段2到4句的局势总结",
  "positiveSignals": [
    "正向信号1",
    "正向信号2"
  ],
  "riskSignals": [
    "风险信号1",
    "风险信号2"
  ],
  "initiativeBalance": {
    "label": "你更主动",
    "reason": "当前互动节奏更多靠你推动"
  },
  "pushWindow": {
    "label": "可以轻试探",
    "reason": "已有一定舒适度，但还不适合太重推进"
  },
  "nextBestAction": {
    "label": "轻邀约",
    "reason": "当前更适合测试她是否愿意把互动带到线下",
    "tip": "邀请语气要轻，不带关系施压感"
  },
  "avoidActions": [
    "不要直接表态",
    "不要连续追发消息"
  ],
  "suggestedReplies": [
    {
      "style": "自然型",
      "content": "这是一条可直接发送的话术",
      "reason": "适合当前阶段，语气轻"
    }
  ]
}
```

---

## 五、字段级设计说明

### 1. stage

这是关系雷达最核心的结论。

建议固定为对象，不要只返回字符串。

原因：

- 前端需要阶段标签
- 前端需要一句解释

### 2. summary

这是结果页的“一句话总判断”所在字段。

要求：

- 2 到 4 句
- 不是长报告
- 必须同时覆盖局势、风险和方向

### 3. positiveSignals / riskSignals

建议均为字符串数组。

要求：

- 每边固定返回 2 到 3 条
- 尽量具体
- 不做抽象术语堆砌

### 4. initiativeBalance

建议固定为：

- `label`
- `reason`

标签建议只允许：

- `你更主动`
- `基本均衡`
- `对方更主动`

### 5. pushWindow

标签建议只允许：

- `暂不建议推进`
- `可以轻试探`
- `适合推进`

必须带 `reason`。

### 6. nextBestAction

标签建议只允许：

- `继续自然聊天`
- `深化话题`
- `轻度暧昧测试`
- `轻邀约`
- `放缓观察`
- `修复节奏`

建议带：

- `reason`
- `tip`

### 7. avoidActions

字符串数组即可。

首版建议返回 1 到 3 条。

### 8. suggestedReplies

固定返回 3 条，结构建议保持一致：

- `style`
- `content`
- `reason`

---

## 六、前端服务层建议接口

### BackendService

建议新增：

```js
async analyzeRelationship(payload)
```

职责：

- 调用 `/api/ai/relationship-analysis`
- 返回后端响应

### AIService

建议新增：

```js
async analyzeRelationship(payload)
```

职责：

- 调用 `BackendService.analyzeRelationship`
- 统一处理响应解包
- 在失败时给出稳定 fallback 结构

---

## 七、后端建议接口位置

### 路由层

建议新增到：

`backend/src/routes/aiRoutes.js`

新增路由：

`POST /relationship-analysis`

### 控制器层

建议新增到：

`backend/src/controllers/aiExtensionController.js`

建议新增控制器方法：

- `analyzeRelationship`

原因：

当前情感分析、开场白、约会规划、话题建议都在这个控制器里，关系分析在职责上也属于同一类扩展 AI 能力。

### 服务层

首版可以继续复用：

- `backend/src/services/aiService.js`

无需单独新建模型服务层，只需要新增一套专用 prompt 组织逻辑。

---

## 八、错误与降级策略

为了保证前端结果页稳定，建议首版定义 fallback 结构。

### 当前策略建议

即使 AI 分析失败，也尽量返回可渲染结构，而不是只返回报错文本。

前端 fallback 最少应包含：

- `stage`
- `summary`
- `positiveSignals`
- `riskSignals`
- `initiativeBalance`
- `pushWindow`
- `nextBestAction`
- `avoidActions`
- `suggestedReplies`

### fallback 风格

fallback 不应假装很懂。

应该明确表达：

- 当前上下文不足
- 结论仅供参考
- 建议补充更多聊天内容

---

## 九、截图上传与 OCR 的当前边界

为了避免实现范围失控，首版明确约束如下：

### 关系分析主接口不接收图片文件

它只接收：

- 文本化后的聊天上下文

### 截图相关能力的处理方式

如果前端要支持截图分析，应采用以下路径：

1. 用户上传截图
2. 前端或独立 OCR 处理把图片变成文本
3. 把提取后的文本传给关系分析接口

### 当前决定的意义

这样可以把：

- 关系判断

和

- 文件处理 / OCR

解耦，避免首版把主接口做得过重。

---

## 十、首版不做的接口能力

为了保证 MVP V1 聚焦，以下接口先不设计：

- 关系分析结果持久化接口
- 历史分析列表接口
- 关系雷达趋势接口
- 关系复盘接口
- 专属策略检索接口
- 长期记忆接口

这些都放到后续版本。

---

## 十一、MVP V1 接口草案的核心结论

首版接口只需要新增一个主能力：

`POST /api/ai/relationship-analysis`

它接收：

- 文本化聊天上下文
- 当前困惑
- 结构化关系背景

并返回：

- 当前阶段
- 局势摘要
- 兴趣信号
- 风险信号
- 主动度对比
- 推进窗口
- 下一步建议
- 不建议动作
- 推荐话术

只要这条接口成立，MVP V1 的输入页、结果页和聊天页衔接就都能跑起来。

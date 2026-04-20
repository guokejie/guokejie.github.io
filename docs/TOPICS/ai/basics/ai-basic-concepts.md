# AI 基础概念

## Agent Skill

> 参考视频：[马克的技术工作坊](https://www.bilibili.com/video/BV1cGigBQE6n/?spm_id_from=333.1387.upload.video_card.click&vd_source=83dfa6febba24813a17050f0f508641d)

### 什么是 Agent Skill

简单来说，**Agent Skill 就是一个可供大模型按需翻阅的说明文档**。

它的作用，是把某类任务的处理规则、输出格式、执行方式提前写好，让模型在遇到对应任务时，能够按照预设要求完成工作，而不需要用户每次都重复粘贴一大段提示词。

举个例子：  
假设你经常需要做会议总结，那么就可以在一个 Skill 中明确规定：

- 必须总结参会人员
- 必须提炼会议议题
- 必须整理会议决定
- 必须按照固定格式输出

这样一来，当模型处理会议内容时，就会自动遵循这些要求。  
在入门阶段，可以先把 Agent Skill 理解为“给模型看的任务说明书”。不过实际上，它的能力并不止于此，后面还可以结合 `reference` 和 `script` 扩展成更强的自动化体系。

---

### Agent Skill 的基本用法

以 Claude Code 为例，Agent Skill 的使用方式通常如下：

1. 在用户目录下的 `~/.claude/skills` 文件夹中创建一个新的 Skill 文件夹
2. 文件夹名称就是 Skill 名称，例如：`会议总结助手`
3. 在该文件夹中创建一个 `SKILL.md` 文件
4. 在 `SKILL.md` 中写入这个 Skill 的元数据和具体指令

每个 Agent Skill 都必须有一个 `SKILL.md` 文件，它主要包含两部分内容：

#### 1. 元数据（Metadata）

元数据通常放在文件头部，用于告诉模型：

- 这个 Skill 叫什么名字
- 这个 Skill 是干什么的

最常见的字段有：

- `name`：Skill 名称，通常需要与文件夹名称一致
- `description`：Skill 描述，用于说明该 Skill 的用途

#### 2. 指令（Instructions）

在元数据下面，才是 Skill 的核心内容，也就是模型真正需要遵循的规则。  
例如：

- 总结时必须包含参会人员、议题、决定
- 输出格式要固定
- 可以给出输入输出示例，帮助模型理解预期结果

---

### 一个基本示例

假设我们创建了一个“会议总结助手”，它的目标是把会议录音文本整理成结构化总结。

当用户在 Claude Code 中输入：

> 总结以下会议内容

并附上一段会议文本后，Claude Code 会先判断这项任务是否与某个 Skill 匹配。  
如果匹配到“会议总结助手”，它就会请求使用这个 Skill。

在用户确认后，Claude Code 会读取该 Skill 的 `SKILL.md`，再将用户请求和完整的 Skill 指令一起交给模型。  
最终，模型会按照 Skill 中规定的格式输出会议总结。

例如输出可能包含：

- **参会人员**
- **会议议题**
- **会议决定**

这就是 Agent Skill 最基础的用法。

---

### Agent Skill 的工作流程

整个过程中，一般可以理解为有三个角色：

- **用户**
- **Claude Code**
- **Claude Code 背后的大模型**

工作流程如下：

1. 用户输入请求
2. Claude Code 把用户请求，以及所有 Skill 的 **名称和描述** 一起发给模型
3. 模型根据名称和描述判断：当前请求适合使用哪个 Skill
4. Claude Code 读取被选中的那个 Skill 的完整 `SKILL.md`
5. Claude Code 将用户请求和完整 Skill 内容再次发送给模型
6. 模型按照 Skill 的要求生成结果
7. Claude Code 将结果返回给用户

这里有一个非常重要的机制：

### 按需加载

虽然所有 Skill 的 **名称和描述** 会始终对模型可见，但 **具体的指令内容** 只有在该 Skill 被选中后才会加载。  
这样做的好处是：

- 节省上下文
- 节省 token
- 提高系统效率

这也是 Agent Skill 的第一个核心思想。

---

## 高级用法（Reference）

前面提到，Claude Code 一开始只会把所有 Skill 的名称和描述交给模型，而不会直接把所有 Skill 的完整内容都塞进去。  
这已经很省 token 了，但还不够极致。

设想一下：  
一个会议总结助手，除了做普通总结，还希望进一步提供辅助判断。例如：

- 会议涉及报销、预算、采购时，自动检查是否符合财务规范
- 会议涉及合同条款时，自动提示法务风险

这样当然很有价值，但前提是模型得知道相关制度内容。  
如果把所有财务制度、法律条文全都写进 `SKILL.md`，那么这个文件会变得非常臃肿。即使只是一次普通晨会，也会被迫加载大量根本用不到的内容。

为了解决这个问题，Agent Skill 引入了 **Reference** 机制。

### Reference 是什么

Reference 可以理解为：  
**只有在满足特定条件时，才会被读取的补充资料文件。**

比如，可以新增一个文件：

- `集团财务手册.md`

里面写明报销标准、住宿补贴、餐饮额度、审批流程等规则。

然后在 `SKILL.md` 中补充一条规则：

- 当会议内容提到预算、费用、报销、采购等关键词时
- 触发财务提醒逻辑
- 此时读取 `集团财务手册.md`
- 根据手册内容判断会议中的金额是否超标，并提示审批要求

---

### Reference 的工作方式

假设会议中提到：

> 老陈让小李预订 1210 元一晚的酒店

这显然和费用有关。  
此时 Claude Code 在读取 `SKILL.md` 后，会判断需要进一步获取财务规则，于是请求读取 `集团财务手册.md`。

在用户确认后，Claude Code 会把该 Reference 文件内容提供给模型。  
最后模型生成的会议总结中，除了基本信息外，还会额外加入：

- 财务提醒
- 是否超预算
- 需要谁审批

而如果这只是一次和经费无关的技术复盘会，那么这个财务文件就不会被读取，也不会占用任何上下文 token。

---

### Reference 的核心特点

- **条件触发**
- **按需读取**
- **会占用上下文**
- **适合放补充规则、制度说明、背景知识**

也就是说，Reference 本质上是“按需中的按需加载”。

---

## 高级用法（Script）

除了读取资料，Agent Skill 还可以执行脚本，实现真正的自动化操作。

例如，在 Skill 文件夹中再创建一个 Python 脚本：

- `upload.py`

这个脚本专门负责把会议总结上传到服务器。

然后在 `SKILL.md` 中增加一条规则：

- 当用户提到“上传”“同步”“发送到服务器”等要求时
- 必须执行 `upload.py`
- 将总结内容上传到指定位置

---

### Script 的执行流程

假设用户输入：

> 总结以下会议内容，并把结果上传到服务器

此时 Claude Code 会：

1. 判断任务与“会议总结助手”匹配
2. 读取 Skill 内容
3. 生成会议总结
4. 根据 Skill 规则判断：需要执行上传操作
5. 请求运行 `upload.py`
6. 在用户同意后执行脚本
7. 返回上传结果

最终输出中除了会议总结外，还可能包含：

- 上传是否成功
- 上传目标地址
- 返回状态信息

---

### Script 与 Reference 的区别

虽然 Reference 和 Script 都属于 Skill 的高级能力，但它们对模型上下文的影响完全不同。

#### Reference：读

Reference 会被读取，其内容会进入模型上下文，因此会消耗 token。

#### Script：跑

Script 通常是被执行，而不是被读取。  
Claude Code 更关心的是：

- 如何运行这个脚本
- 运行结果是什么

而不是脚本内部具体写了什么。  
因此，即使脚本本身有很长的业务逻辑，也几乎不会占用模型上下文。

当然，这也有一个前提：  
你需要在 Skill 中把脚本的用途和调用方式描述清楚。否则，当系统不知道怎么运行它时，仍可能去查看脚本内容，从而增加上下文消耗。

---

## 渐进式披露机制

Agent Skill 的设计，本质上是一种 **渐进式披露（Progressive Disclosure）** 结构。

它通常可以分成三层：

### 第一层：元数据层

包含所有 Skill 的：

- 名称
- 描述

这一层始终对模型可见，相当于一个目录。  
模型会先看这一层，判断当前问题适合使用哪个 Skill。

### 第二层：指令层

对应 `SKILL.md` 中除元数据外的正文内容。  
只有当某个 Skill 被选中后，这一层才会被加载。

因此这一层的特点是：

- **按需加载**

### 第三层：资源层

这一层包括：

- `reference`
- `script`

它们只有在指令层进一步判断“需要用到”时，才会被触发，因此属于更深一层的按需加载。

可以把这种机制理解为：

- 元数据层：始终加载
- 指令层：匹配后加载
- 资源层：满足条件后再加载

所以资源层其实是：

- **按需中的按需**

其中：

- `reference` 是读取型资源
- `script` 是执行型资源

---

## Agent Skill vs MCP

很多人第一次接触 Agent Skill 时，会觉得它和 MCP 很像，因为两者都可以帮助模型连接和操作外部世界。

但它们的定位并不相同。

Anthropic 对两者关系有一句很经典的概括：

> **MCP connects Claude to data; skills teach Claude what to do with that data.**

可以理解为：

- **MCP**：负责把外部数据、系统能力接进来
- **Skill**：负责告诉模型应该如何处理这些数据

---

skill示例
```markdown
---
name: meeting-summary
description: Summarize meeting transcripts into structured meeting minutes in Chinese, including attendees, agenda, decisions, action items, and risks. When budget, reimbursement, hotel, meal, procurement, or cost is mentioned, consult references/finance-policy.md. When the user asks to export, save, or generate a markdown file, create a markdown file and run scripts/save_summary.py.
---

# Meeting Summary Skill

你是一个专业的会议纪要助手。  
你的任务是把用户提供的会议文本、录音转写文本或零散讨论内容，整理成结构化会议纪要。

## 输出目标

默认输出必须包含以下部分：

1. **会议主题**
2. **参会人员**
3. **核心议题**
4. **讨论要点**
5. **最终决定**
6. **待办事项**
7. **风险与提醒**

如果原文信息不足，不要编造，用“未明确提及”表示。

## 输出格式

请严格使用以下 Markdown 结构：

# 会议纪要

## 1. 会议主题
- 

## 2. 参会人员
- 

## 3. 核心议题
- 

## 4. 讨论要点
- 

## 5. 最终决定
- 

## 6. 待办事项
- 负责人：
- 事项：
- 截止时间：

## 7. 风险与提醒
- 

## 处理规则

### A. 总结规则
- 优先提炼结论，不要只是复述原文。
- 同类信息要合并，避免重复表述。
- 对口语化内容进行书面化整理。
- 若存在时间、金额、负责人、截止时间，要优先保留。

### B. 财务提醒规则
当会议内容中出现以下任一内容时，你应主动读取 `references/finance-policy.md`：
- 预算
- 报销
- 酒店
- 餐饮
- 采购
- 费用
- 金额
- 审批

读取后，在“风险与提醒”部分补充：
- 是否超标
- 需要哪一级审批
- 是否存在合规风险

### C. 导出规则
当用户明确提出以下任一需求时：
- 导出
- 保存
- 生成 md 文件
- 输出到文件
- 落盘

你必须执行以下步骤：

1. 先按本 Skill 的格式生成会议纪要内容
2. 将会议纪要写入当前工作目录下的 `tmp_meeting_summary.md`
3. 运行以下命令：

```bash
python3 scripts/save_summary.py tmp_meeting_summary.md
```
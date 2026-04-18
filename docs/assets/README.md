# 图片资源规范

这个目录用于统一管理站点内的本地图片资源。

## 目录约定

- `common/`：跨页面复用的公共资源
- `thoughts/`：思考栏目图片
- `topics/`：专题栏目图片

## 当前目录骨架

```text
docs/assets/
  common/
    site-logo/
    default-cover/
  thoughts/
    reading/
      rich-dad-poor-dad/
      china-government-and-economic-development/
    essays/
  topics/
    backend-development/
      design-patterns/
        iterator-pattern/
        chain-of-responsibility-pattern/
        strategy-pattern/
      devops/
        docker/
    bilibili-creators/
      lei-yu/
      wang-defa/
      xiao-lin-shuo/
    ai/
    economics/
    efficiency/
```

## 命名规则

- 文件名统一使用小写英文和短横线
- 不使用中文文件名、空格或无语义编号
- 一篇文章的图片放在对应 slug 目录下
- 复用图片才放到 `common/`

推荐文件名：

- `cover.webp`
- `diagram-01.webp`
- `diagram-02.webp`
- `mind-map.webp`
- `screenshot-01.png`
- `avatar.webp`

## 引用示例

在 `docs/THOUGHTS/reading/rich-dad-poor-dad.md` 中：

```md
![封面](../../assets/thoughts/reading/rich-dad-poor-dad/cover.webp)
```

在 `docs/TOPICS/backend-development/design-patterns/strategy-pattern.md` 中：

```md
![策略模式示意图](../../../assets/topics/backend-development/design-patterns/strategy-pattern/diagram-01.webp)
```

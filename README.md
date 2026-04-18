# 郭科杰的个人网站

这个项目使用 [MkDocs](https://www.mkdocs.org) 和 [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) 搭建。
- 首页
- 专题
- 思考
- 归档
- 关于

## 本地预览

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

## 部署到 GitHub Pages

推送到 `main` 分支后，GitHub Actions 会自动执行 `mkdocs gh-deploy --force`。

## 图片资源

站内图片统一本地保存到 `docs/assets/`，并按栏目与文章 slug 分目录管理。

- 规范说明：`docs/assets/README.md`
- 公共资源：`docs/assets/common/`
- 文章图片：放到对应栏目与文章 slug 目录下

命名统一使用小写英文和短横线，例如 `cover.webp`、`diagram-01.webp`、`screenshot-01.png`。

## 当前站点信息

- 站点地址：`https://guokejie.github.io`
- 仓库地址：`https://github.com/guokejie/guokejie.github.io`
- 作者：郭科杰
- 社交链接：GitHub `@guokejie`

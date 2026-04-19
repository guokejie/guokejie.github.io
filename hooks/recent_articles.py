from __future__ import annotations

import html
import subprocess
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import yaml


PLACEHOLDER = "<!-- recent-articles -->"
MAX_ARTICLES = 5
ARTICLE_ROOTS = {"TOPICS", "THOUGHTS"}
DATE_KEYS = ("updated", "date", "publish_date", "created")
MIN_ARTICLE_BODY_CHARS = 120


@dataclass(frozen=True)
class Article:
    src_path: str
    title: str
    section: str
    updated_at: datetime

    @property
    def sort_key(self) -> tuple[float, str]:
        return (self.updated_at.timestamp(), self.src_path)


def on_page_markdown(markdown: str, *, page: Any, config: Any, files: Any) -> str:
    if page.file.src_path != "index.md" or PLACEHOLDER not in markdown:
        return markdown

    articles = _collect_articles(
        Path(config["docs_dir"]),
        _collect_nav_paths(config.get("nav") or []),
    )
    rendered = _render_recent_articles(articles[:MAX_ARTICLES])
    return markdown.replace(PLACEHOLDER, rendered)


def _collect_articles(docs_dir: Path, nav_paths: set[str] | None = None) -> list[Article]:
    articles = []
    nav_paths = nav_paths or set()

    for path in docs_dir.rglob("*.md"):
        src_path = path.relative_to(docs_dir).as_posix()

        if not _is_article(src_path, nav_paths):
            continue

        content = path.read_text(encoding="utf-8")
        if not _has_article_body(content):
            continue

        article = Article(
            src_path=src_path,
            title=_read_title(content, path),
            section=src_path.split("/", 1)[0],
            updated_at=_read_article_time(content, path),
        )
        articles.append(article)

    return sorted(articles, key=lambda item: item.sort_key, reverse=True)


def _collect_nav_paths(nav_items: list[Any]) -> set[str]:
    paths = set()

    for item in nav_items:
        if isinstance(item, str):
            paths.add(item)
        elif isinstance(item, dict):
            for value in item.values():
                if isinstance(value, str):
                    paths.add(value)
                elif isinstance(value, list):
                    paths.update(_collect_nav_paths(value))

    return paths


def _is_article(src_path: str, nav_paths: set[str]) -> bool:
    parts = src_path.split("/")

    if parts[0] not in ARTICLE_ROOTS:
        return False

    if nav_paths and src_path not in nav_paths:
        return False

    if parts[-1] in {"index.md", "README.md"}:
        return False

    return True


def _has_article_body(content: str) -> bool:
    content = _strip_front_matter(content)
    body_lines = []
    skipped_title = False

    for line in content.splitlines():
        stripped = line.strip()

        if not skipped_title and stripped.startswith("# "):
            skipped_title = True
            continue

        if stripped.startswith("#"):
            continue

        body_lines.append(stripped)

    return len("".join(body_lines)) >= MIN_ARTICLE_BODY_CHARS


def _strip_front_matter(content: str) -> str:
    if not content.startswith("---\n"):
        return content

    parts = content.split("---", 2)
    if len(parts) != 3:
        return content

    return parts[2]


def _read_title(content: str, path: Path) -> str:
    for line in content.splitlines():
        if line.startswith("# "):
            return line[2:].strip()

    return path.stem.replace("-", " ").title()


def _read_article_time(content: str, path: Path) -> datetime:
    metadata_time = _read_metadata_time(content)
    if metadata_time is not None:
        return metadata_time

    git_time = _read_git_time(path)
    if git_time is not None:
        return git_time

    return datetime.fromtimestamp(path.stat().st_mtime)


def _read_metadata_time(content: str) -> datetime | None:
    if not content.startswith("---\n"):
        return None

    try:
        _, metadata_text, _ = content.split("---", 2)
    except ValueError:
        return None

    metadata = yaml.safe_load(metadata_text) or {}
    if not isinstance(metadata, dict):
        return None

    for key in DATE_KEYS:
        value = metadata.get(key)
        parsed = _parse_datetime(value)
        if parsed is not None:
            return parsed

    return None


def _parse_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value

    if value is None:
        return None

    text = str(value).strip().strip("'\"")
    if not text:
        return None

    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None


def _read_git_time(path: Path) -> datetime | None:
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cI", "--", str(path)],
            check=False,
            capture_output=True,
            text=True,
        )
    except OSError:
        return None

    text = result.stdout.strip()
    if result.returncode != 0 or not text:
        return None

    return _parse_datetime(text)


def _render_recent_articles(articles: list[Article]) -> str:
    if not articles:
        return '<p class="home-timeline__empty">暂无文章。</p>'

    items = "\n\n".join(_render_article(article) for article in articles)
    return f'<div class="home-timeline">\n{items}\n</div>'


def _render_article(article: Article) -> str:
    updated_at = article.updated_at
    title = html.escape(article.title)
    section = html.escape(article.section)
    link = html.escape(_page_url(article.src_path), quote=True)
    day = html.escape(updated_at.strftime("%m-%d"))
    year = html.escape(updated_at.strftime("%Y"))
    time = html.escape(updated_at.strftime("%H:%M"))

    return f'''  <article class="home-timeline__item">
    <div class="home-timeline__date">
      <span class="home-timeline__day">{day}</span>
      <span class="home-timeline__year">{year}</span>
    </div>
    <div class="home-timeline__content">
      <div class="home-timeline__meta">{section} / 更新于 {time}</div>
      <h3><a href="{link}">{title}</a></h3>
    </div>
  </article>'''


def _page_url(src_path: str) -> str:
    if src_path.endswith(".md"):
        src_path = src_path[:-3]

    return f"./{src_path}/"

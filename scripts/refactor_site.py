from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(r"c:\Users\Zoulo\OneDrive\Documents\GitHub\COP3530\eaz-drone-site")
PAGES = [ROOT / "index.html"]
PAGES += sorted((ROOT / "pages").glob("*.html"))
PAGES += sorted((ROOT / "cities").glob("*.html"))

SITE_URL = "https://www.eazdrones.com"


def canonical_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return f"{SITE_URL}/"
    return f"{SITE_URL}/{rel}"


def title_and_description(text: str) -> tuple[str | None, str | None]:
    title_match = re.search(r"<title>(.*?)</title>", text, re.S | re.I)
    description_match = re.search(r'<meta name="description" content="([^"]*)"\s*/?>', text, re.I)
    title = title_match.group(1).strip() if title_match else None
    description = description_match.group(1).strip() if description_match else None
    return title, description


def build_social_block(url: str, title: str | None, description: str | None) -> str:
    title = title or "EAZ Drones"
    description = description or "Professional drone services across Northwest Florida's Emerald Coast."
    return (
        f'\t\t<meta property="og:type" content="website" />\n'
        f'\t\t<meta property="og:url" content="{url}" />\n'
        f'\t\t<meta property="og:title" content="{title}" />\n'
        f'\t\t<meta property="og:description" content="{description}" />\n'
        f'\t\t<meta name="twitter:card" content="summary_large_image" />\n'
        f'\t\t<meta name="twitter:url" content="{url}" />\n'
        f'\t\t<meta name="twitter:title" content="{title}" />\n'
        f'\t\t<meta name="twitter:description" content="{description}" />\n'
    )


def ensure_meta(text: str, path: Path) -> str:
    url = canonical_for(path)
    title, description = title_and_description(text)

    if '<link rel="canonical"' not in text:
        text = text.replace(
            '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />',
            '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />\n\t\t<link rel="canonical" href="' + url + '" />',
            1,
        )

    if path.parent.name == 'cities' and 'property="og:type"' not in text:
        description_line = re.search(r'(<meta name="description" content="[^"]*"\s*/?>)', text, re.I)
        if description_line:
            social_block = build_social_block(url, title, description)
            text = text.replace(description_line.group(1), description_line.group(1) + "\n" + social_block, 1)

    return text


def replace_shell(text: str, variant: str) -> str:
    text = re.sub(
        r'\n\s*<!-- Header -->\n\s*<header id="header".*?</header>',
        '\n\t\t\t\t<!-- Header -->\n\t\t\t\t<div data-site-header data-variant="' + variant + '"></div>',
        text,
        flags=re.S,
        count=1,
    )
    text = re.sub(
        r'\n\s*<!-- Footer -->\n\s*<footer id="footer".*?</footer>',
        '\n\t\t\t\t<!-- Footer -->\n\t\t\t\t<div data-site-footer></div>',
        text,
        flags=re.S,
        count=1,
    )
    if '/assets/js/site-fragments.js' not in text:
        text = text.replace(
            '\t\t<!-- Scripts -->\n',
            '\t\t<script src="/assets/js/site-fragments.js"></script>\n\n\t\t<!-- Scripts -->\n',
            1,
        )
    return text


def main() -> None:
    for path in PAGES:
        text = path.read_text(encoding='utf-8')
        variant = 'alt' if 'class="alt"' in text and path.name != 'services.html' else 'default'
        if path.name == 'index.html':
            variant = 'alt'
        text = replace_shell(text, variant)
        text = ensure_meta(text, path)
        path.write_text(text, encoding='utf-8')


if __name__ == '__main__':
    main()

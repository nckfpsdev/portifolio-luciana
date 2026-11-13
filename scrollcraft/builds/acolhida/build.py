"""Build index.html from index.src.html. Run: python3 build.py

- Inlines the vectorised logo paths (assets/flor-paths.svg) into the <template>.
- Rewrites local asset references to absolute paths, because the site is served
  without trailing slashes (vercel.json: trailingSlash false), where relative
  paths would resolve one folder too high. Test locally through a server rooted
  at the repository, e.g. `python3 -m http.server` from the repo root.
"""
import re, pathlib

PREFIX = "/scrollcraft/builds/acolhida/"
here = pathlib.Path(__file__).parent
paths = re.findall(r'<path d="[^"]+"/>', (here / "assets/flor-paths.svg").read_text())
html = (here / "index.src.html").read_text().replace("__FLOR__", "".join(paths))
html = re.sub(r'(?<=["\s,])(assets|vendor)/', PREFIX + r"\1/", html)
html = html.replace('"acolhida.css"', f'"{PREFIX}acolhida.css"').replace('"acolhida.js"', f'"{PREFIX}acolhida.js"')
(here / "index.html").write_text(html)
# The site root is this same page (absolute asset paths make it location independent)
(here.parent.parent.parent / "index.html").write_text(html)
print(f"{len(paths)} paths inlined, assets prefixed with {PREFIX}")

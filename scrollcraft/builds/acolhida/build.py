"""Inline the vectorised logo paths into index.html. Run: python3 build.py"""
import re, pathlib
here = pathlib.Path(__file__).parent
paths = re.findall(r'<path d="[^"]+"/>', (here / "assets/flor-paths.svg").read_text())
src = (here / "index.src.html").read_text()
(here / "index.html").write_text(src.replace("__FLOR__", "".join(paths)))
print(f"{len(paths)} paths inlined")

# selkies.io

[![Pages](https://github.com/selkies-project/selkies-web/actions/workflows/main.yaml/badge.svg)](https://github.com/selkies-project/selkies-web/actions/workflows/main.yaml) [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0) [![Discord](https://img.shields.io/badge/dynamic/json?logo=discord&label=Discord%20Members&query=approximate_member_count&url=https%3A%2F%2Fdiscordapp.com%2Fapi%2Finvites%2FwDNGDeSW5F%3Fwith_counts%3Dtrue)](https://discord.gg/wDNGDeSW5F) [![Ask DeepWiki](https://img.shields.io/badge/Ask-DeepWiki-blue)](https://deepwiki.com/selkies-project/selkies-web)

The landing page for [Selkies](https://github.com/selkies-project/selkies), the open-source,
GPU-accelerated platform that streams Linux desktops and applications to any web browser.

It is a static site: no framework, no build step. Documentation lives separately at
[docs.selkies.io](https://docs.selkies.io/).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The page. Every section is plain HTML with links out to docs, repos, and the community. |
| `index.css` | Styling and every CSS-driven animation (aurora, stripe demos, pipeline flow, and the tilt and spotlight hooks). |
| `index.js` | Scroll reveals, counters, tilt and magnetic pointer effects, tabs, copy buttons, the app marquee, and the hero stream simulation drawn on a canvas. |
| `theme.js` | The light, dark, or system theme the header's switch picks, applied before the first paint. |
| `apps.js` | The list of LinuxServer.io application containers shown in the marquee. |
| `img/` | Logos and the demo video. |

## Preview locally

```bash
npm start
# or
python3 -m http.server 8000
```

Then open http://localhost:8000. Any static file server works.

## Deploy

Pushes to `main` run the [GitHub Pages workflow](.github/workflows/main.yaml), which copies the
site files into `public/` and publishes them. The custom domain is a repository setting.

`npm run build` produces the same `public/` directory locally.

The page's fonts (Sora, Inter, and JetBrains Mono) are served from `fonts/`, with the files and
subsets Google Fonts serves and each family's SIL Open Font License beside them, so a visit
reaches no third party for them.

## Reference clones

The directories listed in `.gitignore` (`selkies/`, `pixelflux/`, `pcmflux/`, `sealskin/`,
`sealskin-apps/`, `sealskin-web/`, `docker-baseimage-selkies/`) are sibling repositories cloned
for reference while writing copy. They are not part of the site and are not committed.

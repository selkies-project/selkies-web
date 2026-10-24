<h1 align="center">selkies.io</h1>

<p align="center">Part of <a href="https://www.linuxserver.io"><img src="https://raw.githubusercontent.com/selkies-project/selkies-web/main/img/linuxserver.svg" alt="LinuxServer.io" title="LinuxServer.io" width="182" align="middle"></a></p>

[![Pages](https://github.com/selkies-project/selkies-web/actions/workflows/main.yaml/badge.svg)](https://github.com/selkies-project/selkies-web/actions/workflows/main.yaml) [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0) [![Discord](https://img.shields.io/badge/dynamic/json?logo=discord&label=Discord%20Members&query=approximate_member_count&url=https%3A%2F%2Fdiscordapp.com%2Fapi%2Finvites%2FwDNGDeSW5F%3Fwith_counts%3Dtrue)](https://discord.gg/wDNGDeSW5F) [![Ask DeepWiki](https://img.shields.io/badge/Ask-DeepWiki-blue)](https://deepwiki.com/selkies-project/selkies-web)

The landing page for [Selkies](https://github.com/selkies-project/selkies), the open-source,
GPU-accelerated platform that streams Linux desktops and applications to any web browser.

It is a static site: no framework, no build step. Documentation lives separately at
[docs.selkies.io](https://docs.selkies.io/).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The page. Every section is plain HTML with links out to docs, repos, and the community. |
| `index.css` | Styling, the CSS animations (aurora, stripe demos, pipeline flow, tilt and spotlight hooks), and the frames the screenshots and clips sit in. |
| `index.js` | Scroll reveals, counters, tilt and magnetic pointer effects, tabs, copy buttons, the app marquee, and the lazy loading of the clips. |
| `theme.js` | The light, dark, or system theme the header's switch picks, applied before the first paint. |
| `apps.js` | The list of LinuxServer.io application containers shown in the marquee. |
| `img/` | Logos, the social card, and the screenshots and clips captured from a live session: a LinuxServer.io KDE Webtop on an Intel Arc A750, viewed in Chromium with hardware decoding. |

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

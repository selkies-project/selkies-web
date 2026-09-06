# selkies.io

The landing page for [Selkies](https://github.com/selkies-project/selkies), the open-source,
GPU-accelerated platform that streams Linux desktops and applications to any web browser.

It is a static site: no framework, no build step. Documentation lives separately at
[docs.selkies.io](https://docs.selkies.io/).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The page. Every section is plain HTML with links out to docs, repos and the community. |
| `index.css` | Styling and every CSS-driven animation (aurora, stripe demos, pipeline flow, tilt and spotlight hooks). |
| `index.js` | Scroll reveals, counters, tilt and magnetic pointer effects, tabs, copy buttons, the app marquee, and the hero stream simulation drawn on a canvas. |
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

## Reference clones

The directories listed in `.gitignore` (`selkies/`, `pixelflux/`, `pcmflux/`, `sealskin/`,
`sealskin-apps/`, `sealskin-web/`, `docker-baseimage-selkies/`) are sibling repositories cloned
for reference while writing copy. They are not part of the site and are not committed.

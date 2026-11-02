# Secret Santa
Secret Santa Web App In Angular 22
> This app is part of my portfolio. If you liked it and are interested in working with me, here is my website where you can have a look at what I'm currently doing, see my other projects and get my resume. 
> Please feel free to contact me at arturcmjr@gmail.com

This web page is a simple solution made to help my family with the traditional secret santa on holidays.

[live demo](https://amiko.arju.dev/).

## Features
- Secret santa on 3 steps
- Send link to participants so they can reveal who they got
- Available in Portuguese and English based on browser language
- Responsive
- Easy to use

## Libraries and Frameworks
- [Angular 22](https://angular.io/) base
- [Angular Material](https://material.angular.io/) Theme and style
- [Flex Layout](https://github.com/angular/flex-layout/wiki/fxLayout-API) Responsiveness utilities
- [NGX Translate](https://github.com/ngx-translate/core) Translation

## Technical
- Angular SSR: `/`, `/start` and `/create` are prerendered at build time; `/participant/:id` and `/share/:id` are rendered on demand by the `ssr` Cloud Function (Blaze plan) so link previews (Open Graph / Twitter cards) carry the participant name and event info. Those pages are `noindex` and never expose who was drawn
- SEO: per-page title, description, canonical, Open Graph and Twitter tags (`SeoService`), JSON-LD in `index.html`, `robots.txt` and `sitemap.xml` in `src`
- Deploy: `npm run build:firebase` (build + copy the server bundle to `functions/server`), then `firebase deploy --only hosting,functions`. The workflow does this on merge; the PR preview workflow only previews hosting, so dynamic routes there are served by the live function
- Local SSR: `npm run build && npm run serve:ssr`
- Firebase's firestore as BaaS
- Google's reCAPTCHA on creation to avoid spam as login is not required
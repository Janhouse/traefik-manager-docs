import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Traefik Proxy Admin',
  description:
    'Manage Traefik dynamic (and optionally static) configuration from a web panel — services, domains, certificates, auth, and more.',
  base: '/traefik-manager-docs/',
  lastUpdated: true,
  cleanUrls: true,
  appearance: true,
  srcExclude: ['README.md'],
  // Don't fail the build on localhost example URLs that get auto-linked.
  ignoreDeadLinks: [/^https?:\/\/localhost/],
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/traefik-manager-docs/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#12a87f' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    search: { provider: 'local' },
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Reference', link: '/reference/api' },
      { text: 'FAQ', link: '/faq' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Deployment modes', link: '/guide/deployment-modes' },
          ],
        },
        {
          text: 'Deployment',
          items: [
            { text: 'Externally-managed Traefik', link: '/guide/externally-managed' },
            { text: 'Fully-managed bundle', link: '/guide/managed-bundle' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Services & routing', link: '/guide/services' },
            { text: 'Domains & certificates', link: '/guide/domains-and-certificates' },
            { text: 'DNS provider credentials', link: '/guide/dns-credentials' },
            { text: 'Authentication', link: '/guide/authentication' },
            { text: 'Global configuration', link: '/guide/global-config' },
            { text: 'Runtime & metrics', link: '/guide/runtime-and-metrics' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'API endpoints', link: '/reference/api' },
            { text: 'Configuration & env vars', link: '/reference/configuration' },
            { text: 'Architecture', link: '/reference/architecture' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Janhouse/traefik-proxy-admin' },
    ],
    editLink: {
      pattern: 'https://github.com/janhouse/traefik-manager-docs/edit/main/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Released under the AGPL-3.0 License.',
      copyright: 'Documentation for Traefik Proxy Admin.',
    },
  },
})

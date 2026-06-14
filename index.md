---
layout: home

hero:
  name: Traefik Proxy Admin
  text: A web panel for Traefik configuration
  tagline: Manage services, domains, certificates, and authentication from a clean UI — and optionally let the panel run Traefik end to end.
  image:
    src: /logo.svg
    alt: Traefik Proxy Admin
  actions:
    - theme: brand
      text: Quick start
      link: /guide/getting-started
    - theme: alt
      text: Introduction
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/Janhouse/traefik-proxy-admin

features:
  - icon: 🧭
    title: Dynamic config, generated for you
    details: Define services, routing rules, domains and middlewares in the UI. The panel serves Traefik's dynamic configuration over the HTTP provider — no YAML to hand-edit.
  - icon: 🧱
    title: Two deployment modes
    details: Point the panel at a Traefik you already run, or use the one-command bundle where the panel owns Traefik's static config too and restarts it on change.
  - icon: 🔒
    title: Built-in authentication
    details: Protect services with nothing, time-limited shared links, SSO (OIDC), or HTTP basic auth — enforced through Traefik forward-auth.
  - icon: 📜
    title: Domains & certificates
    details: Per-domain certificate resolvers, wildcard certificates, and a guided DNS-challenge credential editor that stores secrets write-only and encrypted at rest.
  - icon: 🧩
    title: Route builder & middlewares
    details: Compose Host / Path / Header / method rules with nested AND/OR groups, and attach global or per-service middlewares discovered from the Traefik API.
  - icon: 📊
    title: Runtime & metrics
    details: Browse the live Traefik runtime, watch per-service traffic, and catch route conflicts before they bite.
---

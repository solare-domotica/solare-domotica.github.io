# Visibilité : Google, Bing, Facebook, Instagram, TikTok, LinkedIn

Ce document distingue deux types d'actions :
- **Déjà fait dans le code** (rien à faire, c'est en ligne dès que tu publies) ;
- **À faire toi-même** (nécessite tes propres comptes — je ne peux pas créer de
  compte Google, Meta ou TikTok à ta place, ni prouver que tu es propriétaire
  du site sans accès à tes identifiants).

## ✅ Déjà fait dans le code

- **Balises Open Graph** (Facebook, Instagram, WhatsApp, LinkedIn, Messenger)
  sur les 6 pages principales : titre, description, image dédiée 1200×630,
  URL, nom du site. C'est ce qui génère l'aperçu avec image quand le lien est
  collé/partagé.
- **Twitter/X Card** (`summary_large_image`) sur les mêmes pages.
- **Deux visuels de partage** créés à partir de ton logo :
  `assets/img/og-image.jpg` (pages générales) et
  `assets/img/og-image-connect.jpg` (page SOLARIS Connect, message dédié).
- **Données structurées `schema.org`** (JSON-LD) sur `index.html` : fiche
  d'établissement pour la France (Beausoleil) et l'Italie (Sanremo), avec
  adresses et zones desservies — c'est ce que Google peut utiliser pour un
  encart "entreprise locale" dans les résultats de recherche.
- **`sitemap.xml`** et **`robots.txt`** à jour avec toutes les pages,
  accessibles à n'importe quel moteur de recherche.
- **Favicons et icônes** pour onglets de navigateur, écran d'accueil mobile
  (`manifest.json`), et partage.

## 🔧 À faire toi-même — moteurs de recherche

### Google Search Console (le plus important)
1. Va sur [search.google.com/search-console](https://search.google.com/search-console)
   et ajoute une propriété avec l'URL exacte de ton site
   (`https://maxmcneil.github.io/solaris/`).
2. Méthode de vérification la plus simple pour GitHub Pages : **fichier HTML**.
   Google te donne un fichier du type `google1234567890abcdef.html` à
   télécharger — dépose-le simplement à la racine du dépôt (à côté de
   `index.html`), commit, puis clique "Vérifier" dans Search Console.
3. Une fois vérifié : **Sitemaps** (menu de gauche) → colle `sitemap.xml` →
   Envoyer. Google sait alors exactement quelles pages explorer.
4. Sous "Résultats de recherche", tu pourras suivre les premières impressions
   au fil des semaines (l'indexation initiale prend généralement quelques
   jours à quelques semaines pour un nouveau site).

### Bing Webmaster Tools
1. Va sur [www.bing.com/webmasters](https://www.bing.com/webmasters).
2. Le plus rapide : **"Importer depuis Google Search Console"** — connecte
   ton compte Google, et Bing récupère automatiquement la propriété vérifiée
   et le sitemap. Sinon, même principe de fichier HTML qu'avec Google.
3. Bing alimente aussi les résultats de recherche de **Yahoo** et l'assistant
   **Copilot/Bing Chat** — un seul réglage pour les deux.

## 🔧 À faire toi-même — réseaux sociaux

Les réseaux sociaux n'indexent pas un site comme un moteur de recherche : ce
qui compte, c'est (1) avoir une vraie page/compte professionnel, (2) y mettre
le lien du site, (3) partager du contenu qui pointe vers le site de temps en
temps. Les balises déjà en place garantissent que chaque partage affichera un
bel aperçu avec image.

### Facebook + Instagram (compte Meta Business unique)
1. Crée une **Page Facebook professionnelle** (pas un profil personnel) sur
   [facebook.com/pages/create](https://www.facebook.com/pages/create).
2. Dans les infos de la page, renseigne le site : `https://maxmcneil.github.io/solaris/`.
3. Passe ton compte Instagram en **compte professionnel** (Paramètres →
   Compte → Passer à un compte professionnel), relie-le à la Page Facebook via
   **Meta Business Suite** ([business.facebook.com](https://business.facebook.com)),
   et ajoute le lien du site dans la bio Instagram.
4. Avant le tout premier partage, passe l'URL dans le
   [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   et clique "Scrape Again" — Facebook met en cache les aperçus, cet outil
   force la lecture des nouvelles balises.

### TikTok
1. Crée un **compte Professionnel/Business** (Paramètres → Compte → Passer à
   un compte professionnel).
2. Ajoute le lien du site dans la bio (TikTok n'affiche un lien cliquable en
   bio qu'à partir d'un certain nombre d'abonnés sur un compte personnel — un
   compte Business lève cette limite).
3. TikTok ne "crawl" pas le site pour le référencement, mais chaque vidéo
   peut renvoyer vers le lien en bio — c'est le principal levier de trafic
   depuis cette plateforme.

### LinkedIn (recommandé, souvent oublié)
Crée une **Page Entreprise** sur
[linkedin.com/company/setup/new](https://www.linkedin.com/company/setup/new/) —
utile pour la crédibilité B2B (le service "Bureaux/Local professionnel" du
site cible justement cette audience) et reprend aussi les balises Open Graph
déjà en place.

## Une fois les comptes créés

Donne-moi les URLs de tes pages Facebook/Instagram/TikTok/LinkedIn une fois
créées : je les ajouterai au tableau `sameAs` des données structurées
`schema.org` sur `index.html`, et je peux ajouter des icônes de réseaux
sociaux cliquables dans le footer du site. Ces deux ajouts renforcent le lien
que Google fait entre ton site et tes comptes sociaux (utile pour un futur
encart "Google Knowledge Panel").

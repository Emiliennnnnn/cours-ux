# Mettre le site en ligne sur Netlify

Ce dossier contient tout le nécessaire :
- `index.html` + `support.js` : le site
- `netlify/functions/claude.mjs` : un petit serveur qui appelle Claude avec **votre** clé, sans jamais l'exposer aux étudiants
- `netlify.toml` : la configuration Netlify

## 1. Créer la clé API Anthropic (5 min)
1. Allez sur https://console.anthropic.com et créez un compte.
2. **Billing** : ajoutez un moyen de paiement et quelques crédits (10 € suffisent pour commencer).
3. **Limits** : fixez une limite de dépense mensuelle (par ex. 20 €). Vous ne paierez jamais plus.
4. **API Keys** → *Create Key* → copiez la clé (`sk-ant-...`). Ne la partagez jamais.

Coût indicatif avec le modèle Haiku : quelques centimes pour 100 questions d'étudiants.

## 2. Mettre le code sur GitHub (5 min)
1. Créez un compte sur https://github.com puis un nouveau dépôt (ex. `cours-ux`), privé si vous voulez.
2. *Add file* → *Upload files* → glissez **le contenu** de ce dossier (pas le dossier lui-même), y compris le dossier `netlify`.
3. *Commit changes*.

## 3. Déployer sur Netlify (5 min)
1. https://app.netlify.com → *Add new site* → *Import an existing project* → GitHub → choisissez le dépôt.
2. Laissez les réglages par défaut → *Deploy*.
3. **Site configuration → Environment variables** → *Add a variable* :
   - Key : `ANTHROPIC_API_KEY`
   - Value : votre clé `sk-ant-...`
4. **Deploys** → *Trigger deploy* → *Deploy site* (pour que la clé soit prise en compte).
5. Ouvrez l'adresse `xxx.netlify.app` et posez une question à l'assistant pour tester.

## 4. Votre nom de domaine
1. **Domain management** → *Add a domain* → tapez votre domaine (ex. `cours.emiliennizon.com`).
2. Netlify vous indique un enregistrement DNS à créer chez votre registrar (OVH, Gandi, GoDaddy…) :
   - sous-domaine : un **CNAME** vers `xxx.netlify.app`
   - domaine principal : suivez l'option *Netlify DNS* proposée.
3. Le HTTPS s'active tout seul en quelques minutes. Votre domaine reste affiché dans la barre d'adresse.

## Mettre à jour le site plus tard
Remplacez `index.html` sur GitHub par la nouvelle version : Netlify redéploie automatiquement.

## Options
- `CLAUDE_MODEL` (variable d'environnement) : pour changer de modèle, ex. `claude-sonnet-4-5` (meilleur, plus cher).
- `ALLOWED_ORIGIN` : si vous utilisez votre domaine, mettez `https://cours.emiliennizon.com` pour n'autoriser que lui.

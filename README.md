# Eurêka site

Site vitrine statique officiel de l'application mobile Eurêka.

## Ouvrir le site localement

Le site est statique. Utiliser un serveur HTTP local : le fil Découvertes charge un catalogue JSON local et ne fonctionne pas en `file://`.

Pour un test plus proche de GitHub Pages, lancer un serveur HTTP local depuis ce dossier :

```powershell
cd C:\Dev\eureka-site
python -m http.server 3000
```

Puis ouvrir :

```text
http://localhost:3000
```

## Structure

```text
index.html
confidentialite.html
cgu.html
mentions-legales.html
support.html
404.html
styles.css
script.js
robots.txt
sitemap.xml
CNAME
.nojekyll
assets/images/
assets/branding/
assets/icons/
```

La page d’accueil utilise l’icône actuelle `assets/app/icon.png`, les vrais écrans
mobiles et `home.css` (marine, prune, crème, jaune, menthe, lilas). Les anciennes
déclinaisons restent disponibles pour compatibilité. `styles.css` harmonise aussi
les pages de support et les mentions légales.

Le fil `discoveries.js` présente cinq extraits du catalogue mobile, avec photos,
sources et licences dans `assets/discoveries/preview.json`. Les cœurs restent en
mémoire dans cette page : aucun compte, cookie, appel analytique ou synchronisation.
Le site est une vitrine avec démonstration, pas une nouvelle application web Premium.
Les prix sont consultés dans l’app pour éviter une offre Store périmée.

Validation : `node --test test/*.cjs test/*.mjs`, puis contrôle navigateur des
ancres, du menu, du scroll, des cœurs, des sources et des liens Store.

## Publier avec GitHub Pages

Initialiser Git :

```bash
git init
git add .
git commit -m "Initial Eureka website"
```

Créer un dépôt GitHub, puis ajouter le remote :

```bash
git remote add origin https://github.com/<utilisateur>/<repo>.git
git branch -M main
git push -u origin main
```

Dans GitHub :

1. Aller dans `Settings` > `Pages`.
2. Choisir `Deploy from a branch`.
3. Sélectionner la branche `main`.
4. Sélectionner le dossier `/root`.
5. Enregistrer.
6. Dans `Custom domain`, saisir `eureka-apps.fr`.
7. Vérifier que le fichier `CNAME` contient uniquement `eureka-apps.fr`.
8. Activer `Enforce HTTPS` quand GitHub le permet.

## DNS OVH pour GitHub Pages

Ajouter les enregistrements recommandés par GitHub Pages pour le domaine apex `eureka-apps.fr`.

Ne pas supprimer les enregistrements déjà nécessaires à Resend, notamment :

- TXT de vérification ;
- DKIM ;
- MX ;
- SPF éventuel ;
- DMARC éventuel.

Un domaine ne doit normalement avoir qu'un seul SPF principal. Si un SPF existe déjà, fusionner proprement les mécanismes requis au lieu d'ajouter un deuxième SPF concurrent.

Contrôler la propagation DNS avec :

```bash
nslookup eureka-apps.fr
nslookup -type=TXT eureka-apps.fr
```

## Informations à compléter avant le lancement public

Rechercher le marqueur suivant dans le projet :

```text
[À COMPLÉTER AVANT LANCEMENT]
```

À compléter :

- nom et prénom de l'éditeur ;
- SIREN ;
- adresse professionnelle ;
- directeur de publication ;
- conditions commerciales définitives ;
- tarif Premium ;
- durée de l'abonnement ;
- période d'essai éventuelle ;
- détails précis de conservation des données ;
- fonctionnalités techniques réellement activées.

## Remplacements prévus

La maquette smartphone de la page d'accueil est une représentation abstraite. Elle pourra être remplacée plus tard par de vraies captures d'écran de l'application.

## Vérifications avant publication

- Tester toutes les pages.
- Tester le menu mobile.
- Tester les accordéons FAQ au clavier.
- Vérifier les liens `mailto:`.
- Vérifier `robots.txt`, `sitemap.xml` et `CNAME`.
- Vérifier les pages juridiques.
- Vérifier que les informations administratives incomplètes sont visibles et faciles à retrouver.
- Vérifier que les DNS GitHub Pages n'écrasent pas les DNS Resend.

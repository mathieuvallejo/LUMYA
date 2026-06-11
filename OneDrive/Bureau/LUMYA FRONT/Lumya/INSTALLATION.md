# Installation — Lumya

Application Angular 21 pour la plateforme Lumya.

---

## Prérequis

| Outil | Version minimale | Vérification |
|-------|-----------------|-------------|
| Node.js | 18+ (recommandé : 22) | `node --version` |
| npm | 10+ (recommandé : 11) | `npm --version` |
| Angular CLI | 21 | `ng version` |

---

## 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd Lumya
```

---

## 2. Installer les dépendances

```bash
npm install
```

---

## 3. Installer Angular CLI (si absent)

```bash
npm install -g @angular/cli@21
```

---

## 4. Lancer le serveur de développement

```bash
npm start
# ou
ng serve
```

L'application est disponible sur [http://localhost:4200](http://localhost:4200).  
Le rechargement automatique est activé à chaque modification de fichier.

---

## 5. Build de production

```bash
npm run build
```

Les fichiers compilés sont générés dans le dossier `dist/`.

---

## 6. Lancer les tests

```bash
npm test
```

Les tests sont exécutés avec [Vitest](https://vitest.dev/).

---

## Structure du projet

```
src/
├── app/
│   ├── features/
│   │   ├── auth/           # Authentification (login, register)
│   │   ├── feed/           # Fil d'actualité
│   │   ├── home/           # Page d'accueil
│   │   ├── messages/       # Messagerie
│   │   ├── profile/        # Profil utilisateur
│   │   ├── theme-selection/ # Sélection du thème
│   │   └── upload/         # Upload de contenu
│   ├── core/               # Services et guards globaux
│   └── shared/             # Composants et pipes réutilisables
└── public/                 # Assets statiques
```

---

## Dépendances principales

| Package | Rôle |
|---------|------|
| `@angular/material` | Composants UI Material Design |
| `@angular/cdk` | Primitives pour composants personnalisés |
| `chart.js` | Graphiques et visualisations |
| `rxjs` | Programmation réactive |

---

## Problèmes courants

**`ng: command not found`**  
Installer Angular CLI globalement : `npm install -g @angular/cli@21`

**Port 4200 déjà utilisé**  
Changer de port : `ng serve --port 4300`

**Erreurs de versions Node**  
Utiliser [nvm](https://github.com/nvm-sh/nvm) pour gérer les versions de Node : `nvm use 22`

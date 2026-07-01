# VWAB — The Classics Cup · Timetable viewer

Visualiseur de la timetable du festival **VWAB — The Classics Cup** sous forme de fresque
temporelle horizontale : axe X = temps, une ligne par scène, un bloc par set (largeur = durée,
position = horaire de passage).

## Fonctionnalités

- **Fresque horizontale** des 6 scènes (CLASSICS ARENA, VWAB FANZONE, VICTORY VILLAGE,
  THE MAGIC SHOW, THE ACADEMY, VWAB — THE AFTER), de 13:00 à 01:00.
- **Sélection d'artistes** : clic sur un set pour l'ajouter à « ma programmation » (★).
- **Toggle « Ma programmation »** : n'affiche plus que les sets sélectionnés.
- **Recherche** d'un artiste (met en avant les correspondances).
- **Détection de conflits** : surligne en rouge et liste les chevauchements de la sélection
  (impossible d'être sur deux scènes en même temps).
- **Sauvegarde locale** : la sélection est mémorisée dans le navigateur (localStorage).
- **Partage / export** :
  - lien partageable (`?sel=…`) qui restaure la sélection ;
  - export image PNG de la fresque ;
  - export `.ics` de ta programmation (ajout au calendrier du téléphone).

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans dist/
npm run preview  # sert le build
```

## Modifier les données

Toute la programmation est dans [`src/data/timetable.json`](src/data/timetable.json).
Chaque set : `artist`, `start`, `end` (`"HH:MM"`), `tags` (`["LIVE"]`), `setName`, `type`
(`"dj"` ou `"ceremony"` pour les intermèdes non sélectionnables).

> ⚠️ Les horaires ont été transcrits depuis les visuels Instagram officiels — à revérifier.
> La date `festivalDate` (utilisée uniquement pour l'export `.ics`) est un placeholder à ajuster.

## Palette

Couleurs extraites du site officiel `vwabfestival.nl` : charbon `#353535`, magenta `#ed30c9`,
violet `#915ff9`, pourpre `#5537b0`, fond clair `#eff4f7`.

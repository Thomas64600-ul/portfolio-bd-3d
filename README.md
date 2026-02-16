🎮 Portfolio 3D – Bibliothèque Interactive

Portfolio personnel immersif développé avec React Three Fiber, proposant une navigation interactive dans une bibliothèque virtuelle en 3D.

L’utilisateur explore l’espace comme dans un jeu vidéo et découvre :

📚 Mes projets web

💼 Mon parcours & expériences

🎓 Mes diplômes & certifications

🗺️ Mes voyages (carte interactive avec pins)

🎬 Mes inspirations cinéma

📄 Mon CV

Ce projet met l’accent sur une expérience immersive, fluide et professionnelle, adaptée desktop et mobile.

🚀 Démo

👉 En ligne : https://portfolio-bd-3d.vercel.app/
👉 Lancer en local : npm run dev

✨ Fonctionnalités
🎮 Navigation immersive

Mode FPS (Pointer Lock API)

Déplacement clavier :

⬆️⬇️⬅️➡️ Flèches directionnelles

ZQSD (AZERTY)

WASD (QWERTY)

Souris : rotation caméra

Échap : libérer la souris

📱 Expérience mobile optimisée

Joystick virtuel

Glisser pour orienter la caméra

Tap pour interagir

Mode paysage recommandé

Ajustement automatique FOV & distance caméra

Carte optimisée pour le portrait

🗺️ Carte du monde interactive

Pins cliquables

Focus dynamique caméra

Ajustement automatique selon orientation mobile

🎓 Mur des diplômes

Cadres interactifs

Affichage détaillé avec zoom adapté mobile

📚 Bibliothèques dynamiques

Sections organisées par rangées

Panneaux muraux stylisés

Indications UX au sol

🎬 Environnement immersif

HDRI

PBR textures (floor, stone)

Tone mapping ACES

Optimisation mobile (normal maps désactivées)

🛠️ Stack technique
Frontend

React

Vite

React Three Fiber

Drei

Three.js

3D & Rendering

PBR Materials

HDR Environment

Raycasting

Camera easing (maath)

Pointer Lock API

UI / UX

Overlay dynamique

Loader adaptatif (desktop / mobile)

Détection orientation mobile

Safe-area iOS

Optimisations portrait / paysage

Outils

Git / GitHub

Vercel (déploiement)

VS Code

Linux (Pop!_OS)

📁 Architecture du projet

src/
├─ three/        → Scène 3D & composants Three.js
├─ ui/           → Interface utilisateur (Overlay, Loader, Joystick)
├─ data/         → Données centralisées des sections
├─ App.jsx       → Logique principale
public/
├─ textures/     → Textures PBR & HDRI
├─ travels/      → Images voyages
├─ fonts/        → Polices 3D

⚙️ Installation
Prérequis

Node.js ≥ 18

npm

Installation
git clone https://github.com/Thomas64600-ul/portfolio-bd-3d.git
cd portfolio-bd-3d
npm install
npm run dev

📐 Conception & UX

Ce portfolio a été conçu comme une expérience immersive hybride entre site web et jeu vidéo.

Objectifs :

Créer une présentation différenciante

Offrir une navigation intuitive

Maintenir de bonnes performances mobile

Adapter dynamiquement la caméra selon contexte

Faciliter la compréhension utilisateur grâce à :

Panneaux muraux

Indications au sol

Loader pédagogique

📈 Optimisations réalisées

Désactivation des normal maps sur mobile

DPR adaptatif

HDRI optimisé

Safe area iOS

Hitbox agrandies pour les interactions tactiles

Ajustement dynamique distance caméra / FOV

📄 Licence

Projet personnel – utilisation non commerciale.
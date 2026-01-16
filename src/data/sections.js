export const SECTIONS = {
  projects: {
    title: "Projets",
    description:
      "Une sélection de projets full-stack. Clique sur les cartes pour ouvrir les liens (GitHub / démo).",
    tags: ["Full-stack", "React", "Node", "DB", "Cloud"],
    items: [
      {
        name: "REVEREN",
        desc: "Plateforme musique (player, contenus, etc.).",
        href: "#",
      },
      {
        name: "La Cave à Whisky",
        desc: "Catalogue + dégustations + espace perso.",
        href: "#",
      },
    ],
  },

  about: {
    title: "À propos de moi",
    description:
      "Développeur web full stack junior, je construis des projets web structurés et orientés utilisateur.\n\nAprès 12 années d’expérience en logistique, j’ai choisi de mettre mon sens du terrain et de l’organisation au service du développement.\n\nCurieux et créatif, j’aime concevoir des expériences claires, utiles et humaines.",
    tags: ["Développement web", "Expérience terrain", "Créativité"],
    items: [],
  },

  diplomas: {
    title: "Diplômes & certifications",
    description:
      "Mes diplômes et certifications obtenus au fil de mon parcours.",
    tags: ["RNCP", "Certifications", "Formation"],
    items: [
      {
        name: "Titre Développeur Web & Web Mobile (RNCP)",
        desc: "Niveau 5 – Full stack",
        year: "2025",
      },
      {
        name: "Certification IA – Création de contenus",
        desc: "Usages responsables de l’IA générative",
        year: "2024",
      },
      {
        name: "BTS Logistique",
        desc: "Gestion des flux & organisation terrain",
        year: "2012",
      },
      {
        name: "Baccalauréat",
        desc: "Enseignement général",
        year: "2005",
      },
    ],
  },

  cv: {
    title: "CV",
    description:
      "Télécharge mon CV et retrouve mon stack + expériences clés.",
    tags: ["Téléchargement", "Profil hybride"],
    items: [
      { name: "Télécharger le CV", desc: "PDF", href: "#" },
      { name: "LinkedIn", desc: "Profil", href: "#" },
    ],
  },

  contact: {
    title: "Contact",
    description:
      "Un projet ? Une mission ? Tu peux me contacter ici.",
    tags: ["Email", "Réseaux"],
    items: [
      { name: "Email", desc: "thomas@…", href: "mailto:thomas@example.com" },
      { name: "GitHub", desc: "Repos", href: "#" },
    ],
  },
};

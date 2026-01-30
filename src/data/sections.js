export const BOOK_LAYOUT = {
  rowCounts: [24, 22, 20],
  total: [24, 22, 20].reduce((sum, n) => sum + n, 0),
};

export const SECTIONS = {
  projects: {
    title: "Projets",
    description:
      "Une sélection de projets web concrets et déployés.\n\nClique sur une rangée pour explorer, ou directement sur un livre pour ouvrir le projet.",
    tags: ["Full-stack", "React", "Node", "DB", "Cloud"],
    rows: [
      {
        title: "Rangée 1 — Projets principaux",
        items: [
          {
            name: "REVEREN",
            desc: "Plateforme musique : player audio, contenus, concerts et donations.",
            href: "https://reveren.contactfastasturtlerecords.fr/",
            github: "https://github.com/Thomas64600-ul/music-band-project",
          },
          {
            name: "La Cave à Whisky",
            desc: "Catalogue de whiskies, cave personnelle et dégustations.",
            href: "https://la-cave-a-whisky.vercel.app/",
            github: "https://github.com/Thomas64600-ul/la-cave-a-whisky",
          },
        ],
      },
      {
        title: "Rangée 2 — Projets front-end",
        items: [
          {
            name: "Portfolio React",
            desc: "Portfolio personnel développé avec React.",
            href: "https://thomas64600-ul.github.io/Portfolio-React/",
            github: "https://github.com/Thomas64600-ul/Portfolio-React",
          },
          {
            name: "Le site de ma princesse",
            desc: "Site vitrine personnel (HTML / CSS / JS).",
            href: "https://thomas64600-ul.github.io/Marie/",
            github: "https://github.com/Thomas64600-ul/Marie",
          },
        ],
      },
      {
        title: "Rangée 3 — Expérimentations & évolutions",
        items: [
          {
            name: "Portfolio 3D",
            desc: "Expérience immersive en 3D (React Three Fiber, navigation FPS).",
            github: "https://github.com/Thomas64600-ul",
          },
        ],
      },
    ],
  },

  about: {
    title: "À propos de moi",
    description:
      "Développeur web full stack junior, je conçois des interfaces claires, structurées et orientées utilisateur.\n\nIssu de plus de douze années d’expérience en logistique et supply chain, j’ai évolué dans des environnements exigeants où l’organisation, la méthode et le sens du terrain sont essentiels.\n\nMon parcours m’a permis de comprendre les réalités opérationnelles : flux, contraintes, délais, coordination des équipes et prise de décision.\n\nAujourd’hui, je mets ces compétences au service du développement web, avec l’objectif de créer des outils utiles, concrets et adaptés aux métiers.\n\nGrâce à mon titre de développeur et à ma certification en intelligence artificielle, je suis capable de concevoir des interfaces intelligentes, des tableaux de bord et des solutions numériques pouvant accompagner la logistique, l’optimisation des processus et la méthodologie terrain.\n\nCurieux, rigoureux et créatif, je souhaite évoluer vers des projets hybrides mêlant technologie, organisation et intelligence artificielle, au service de l’humain et de l’efficacité.",
    tags: ["Développement web", "Expérience terrain", "Créativité"],
    items: [],
  },

  diplomas: {
    title: "Diplômes & certifications",
    description: "Mes diplômes et certifications obtenus au fil de mon parcours.",
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
    ],
  },

  travels: {
    title: "Mes voyages",
    description:
      "Clique sur un pin pour ouvrir le détail : carte zoom, petit descriptif et photos.",
    tags: ["Voyages", "Randonnées", "Découverte"],
    items: [
      {
        title: "Inde",
        description: `Pendant deux mois et demi, j’ai parcouru le sud de l’Inde dans le cadre d’un projet de réalisation de documentaires audiovisuels, mêlant exploration culturelle, rencontres humaines et travail de terrain.

Ce voyage m’a conduit à travers des lieux emblématiques tels que les plantations de thé du Kerala, Cochin, Hampi, Bangalore, Chennai, Mumbai et Pondichéry. J’ai également vécu une expérience unique lors d’une traversée en bateau sur les backwaters, au cœur de paysages naturels paisibles et authentiques.

Au-delà des paysages, ce projet m’a permis d’aller à la rencontre des habitants et de leurs modes de vie. J’ai notamment découvert la communauté utopiste d’Auroville, un lieu dédié à l’expérimentation sociale, culturelle et spirituelle.

Dans ce cadre, j’ai réalisé le portrait audiovisuel de Bagha, une habitante d’Auroville, mettant en lumière son parcours, sa vision du monde et son engagement au sein de la communauté.

Ce voyage a été une expérience fondatrice, mêlant création artistique, adaptation, autonomie et ouverture culturelle, et a profondément enrichi ma manière d’aborder les projets humains et créatifs.`,
        mapZoom: "/travels/inde/map.png",
        photos: [],
      },
      {
        title: "Vietnam",
        description: `Je suis parti au Vietnam sans préparation, avec l’envie de vivre un voyage en mode aventurier, guidé par l’improvisation, la curiosité et la découverte.

À mon arrivée à Hanoï, grande capitale du nord du pays, j’ai rapidement pris une décision déterminante : acheter un scooter pour parcourir le Vietnam par la route. Pour environ 350 $, je me suis équipé et j’ai pris la direction de Sapa, à travers des routes de montagne parfois dangereuses, offrant des paysages spectaculaires et une première immersion intense.

À Sapa, j’ai rencontré un voyageur allemand qui a décidé de me suivre dans cette aventure. Ensemble, nous avons poursuivi ce périple à moto à travers le pays, partageant expériences, entraide et défis quotidiens.

Au total, j’ai parcouru près de 3 500 kilomètres à travers le Vietnam, en passant par des lieux emblématiques tels que la baie d’Halong, Hué, Hoi An, Da Lat, Nha Trang, Phan Thiết et Ho Chi Minh-Ville.

Ce voyage, d’une durée d’un mois et demi, a été une véritable école de l’autonomie, de la gestion des imprévus et de l’adaptation. Il m’a permis de renforcer ma confiance, mon sens de l’organisation et ma capacité à mener un projet personnel sur la durée.

À la fin du parcours, j’ai revendu mon scooter à Ho Chi Minh-Ville pour 300 $, bouclant ainsi une aventure humaine et logistique aussi enrichissante qu’inoubliable.`,
        mapZoom: "/travels/vietnam/map.png",
        photos: [],
      },
      {
        title: "Cambodge",
        description: `Ce voyage d’un mois au Cambodge a été réalisé en solo, principalement en transports en commun, notamment en bus, après mon arrivée depuis Ho Chi Minh-Ville.

J’ai débuté mon parcours par Phnom Penh, la capitale, où j’ai visité les principaux sites culturels et historiques. Cette étape m’a permis de mieux comprendre l’histoire tragique du pays, marquée par la période des Khmers rouges, et d’en mesurer les conséquences encore visibles aujourd’hui.

Je me suis ensuite rendu à Siem Reap pour découvrir les temples d’Angkor, un site exceptionnel classé au patrimoine mondial, témoignant de la richesse culturelle et spirituelle du Cambodge.

Le voyage s’est poursuivi à Kampot, un petit village paisible et agréable, offrant une atmosphère plus calme, propice à la contemplation et aux rencontres locales.

Au fil de ce parcours, j’ai également découvert l’héritage du protectorat français, encore visible à travers certains bâtiments, inscriptions et influences architecturales. Cette dimension historique apporte une singularité particulière au pays.

Ce séjour m’a surtout marqué par la bienveillance, la gentillesse et la sérénité des Cambodgiens, toujours accueillants et souriants, malgré un passé difficile. Une expérience humaine forte, mêlant mémoire, respect et ouverture culturelle.`,
        mapZoom: "/travels/cambodge/map.png",
        photos: [],
      },
      {
        title: "Nouvelle-Calédonie",
        description: `Ce voyage en Nouvelle-Calédonie devait initialement être de courte durée, mais il s’est finalement transformé en une expérience de dix mois, riche en rencontres, en apprentissages et en découvertes.

À mon arrivée, j’ai commencé par faire du woofing dans une ferme à Dumbéa. Cette première étape m’a permis de m’intégrer rapidement, de rencontrer de nombreuses personnes et de construire un véritable réseau local.

J’ai ensuite découvert les bars à kava, tenus par des Kanaks, qui sont des lieux de partage et d’échange importants dans la culture locale. Ces rencontres m’ont permis de créer des liens avec les communautés kanak et wallisienne, et de mieux comprendre leurs traditions et leur mode de vie.

Progressivement, j’ai trouvé plusieurs emplois qui m’ont permis de m’installer durablement à Nouméa. J’ai ainsi pu découvrir la ville en profondeur, explorer ses quartiers, son littoral et son environnement exceptionnel, ainsi que visiter l’île des Pins, réputée pour ses paysages paradisiaques.

Durant ce séjour, j’ai également réalisé de nombreux campings sur la Grande Terre et sur différents îlots, profitant pleinement de la nature préservée du territoire. Je me suis intéressé aux traditions kanak, à leur rapport à la terre et à la communauté, et j’ai découvert la gastronomie locale, notamment les brochettes de cerf, une spécialité que je n’avais jamais goûtée auparavant.

La Nouvelle-Calédonie a été pour moi une expérience particulièrement marquante, à la fois humaine, culturelle et professionnelle. J’y ai découvert des lieux exceptionnels, rencontré des personnes formidables et vécu une période très enrichissante, qui a contribué à mon développement personnel et à ma maturité professionnelle.`,
        mapZoom: "/travels/nouvelle-caledonie/map.png",
        photos: [],
      },
      {
        title: "Portugal (Algarve)",
        description: `Ce séjour d’une semaine en Algarve a été vécu comme une parenthèse de détente et de découverte, partagée en couple avec ma compagne.

Nous avons parcouru les plus beaux sentiers de randonnée de la région, longeant les falaises et les côtes sauvages, offrant des panoramas spectaculaires sur l’océan Atlantique.

Entre deux balades, nous avons profité des magnifiques plages et criques de l’Algarve, réputées pour leurs eaux claires, leurs formations rocheuses et leur atmosphère paisible.

Ce voyage a également été l’occasion de découvrir la gastronomie locale à travers de nombreux restaurants, ainsi que de visiter des villages typiques, riches en charme et en authenticité.

Cette escapade a été un moment privilégié, mêlant nature, partage et douceur de vivre, renforçant encore davantage le plaisir de voyager à deux.`,
        mapZoom: "/travels/portugal/map.png",
        photos: [],
      },
      {
        title: "Tenerife",
        description: `Ce séjour d’une semaine à Tenerife a été vécu comme une escapade hivernale sous le soleil, partagée en couple entre Noël et le Nouvel An, loin du froid et du quotidien.

Nous avons exploré les montagnes de l’île lors de randonnées autour du volcan Teide, offrant des paysages spectaculaires entre terres volcaniques, nuages et panoramas sur l’océan.

Entre ces moments de découverte, nous avons profité de nombreuses baignades sur des plages magnifiques, aux eaux claires et aux ambiances variées, entre sable volcanique et criques naturelles.

Ce voyage a également été marqué par la découverte de la gastronomie locale, à travers des restaurants typiques et des spécialités régionales, notamment les vins de Tenerife, réputés pour leur caractère unique.

Cette semaine ensoleillée a été une parenthèse idéale mêlant nature, détente et partage, parfaite pour terminer l’année et commencer la suivante dans une atmosphère positive.`,
        mapZoom: "/travels/tenerife/map.png",
        photos: [],
      },
      {
        title: "Minorque",
        description: `Ce séjour d’une semaine à Minorque, partagé en couple entre Noël et le Nouvel An, a été une véritable parenthèse de calme et de sérénité, loin de l’agitation touristique.

Malgré des températures plus fraîches, le soleil était bien présent, offrant des conditions idéales pour explorer l’île à pied. Cette période peu fréquentée nous a permis de profiter pleinement de superbes randonnées à travers des paysages naturels préservés, entre falaises, sentiers côtiers et criques sauvages.

Nous avons également découvert Ciutadella, une ville au charme authentique, riche en patrimoine et en atmosphère méditerranéenne.

Les nombreuses criques de l’île nous ont offert des moments de baignade paisibles, dans un cadre exceptionnel, même si l’eau restait parfois un peu fraîche. Ces instants, vécus dans le calme et la simplicité, ont renforcé le sentiment d’évasion.

Ce voyage a aussi été l’occasion de savourer la gastronomie locale dans des restaurants typiques, et de partager une semaine en amoureux, placée sous le signe de la détente, de la nature et de la complicité.`,
        mapZoom: "/travels/minorque/map.png",
        photos: [],
      },
      {
        title: "Pays de Galles",
        description: `Ce séjour de huit mois au Pays de Galles s’est déroulé dans le cadre d’un emploi en restauration au sein du Tower Hotel, près de Swansea.

J’y travaillais principalement à la plonge, à un rythme soutenu d’environ cinquante heures par semaine. Cette expérience a été physiquement exigeante et parfois difficile, demandant une grande endurance et une forte capacité d’adaptation.

Je logeais directement dans l’hôtel, aux côtés de nombreux employés venus de différents pays, notamment d’Afrique du Sud, d’Australie et d’Italie. Cette vie en communauté internationale a favorisé de riches échanges culturels et de belles rencontres humaines.

Malgré cette immersion à l’étranger, le rythme intense du travail m’a laissé peu de temps pour pratiquer pleinement l’anglais au quotidien. Cela m’a parfois laissé un sentiment mitigé, avec l’impression de ne pas avoir autant progressé linguistiquement que je l’aurais souhaité.

Cependant, cette expérience m’a profondément marqué sur le plan humain. Elle m’a appris la rigueur, la persévérance, le respect du travail et la capacité à tenir dans la durée face à des conditions exigeantes. Elle a renforcé mon sens de l’effort, mon humilité et ma solidité personnelle.

Ce séjour constitue aujourd’hui une étape importante de mon parcours, illustrant ma capacité à m’engager pleinement dans un environnement difficile et à en tirer des enseignements durables.`,
        mapZoom: "/travels/pays-de-galles/map.png",
        photos: [],
      },
    ],
  },

  stack: {
    title: "Compétences & stack",
    description:
      "Technologies et outils utilisés au quotidien. Clique un livre pour ouvrir le détail (logo sur la tranche).",
    tags: ["Front", "Back", "DB", "Outils"],
    rows: [
      {
        title: "Rangée 1 — Front",
        items: [
          { name: "React", desc: "Hooks, components, routing.", logo: "/logos/react.png", href: "https://react.dev/" },
          { name: "Vite", desc: "Build tool rapide.", logo: "/logos/vite.png", href: "https://vitejs.dev/" },
          {
            name: "JavaScript",
            desc: "ES6+, async/await.",
            logo: "/logos/javascript.png",
            href: "https://developer.mozilla.org/fr/docs/Web/JavaScript",
          },
          { name: "HTML", desc: "Structure & sémantique.", logo: "/logos/html.png", href: "https://developer.mozilla.org/fr/docs/Web/HTML" },
          { name: "CSS", desc: "Responsive, layout.", logo: "/logos/css.png", href: "https://developer.mozilla.org/fr/docs/Web/CSS" },
          { name: "Tailwind", desc: "Utility-first.", logo: "/logos/tailwind.png", href: "https://tailwindcss.com/" },
        ],
      },
      {
        title: "Rangée 2 — Back",
        items: [
          { name: "Node.js", desc: "API, tooling.", logo: "/logos/node.png", href: "https://nodejs.org/" },
          { name: "Express", desc: "API REST.", logo: "/logos/express.png", href: "https://expressjs.com/" },
          { name: "JWT", desc: "Auth tokens.", logo: "/logos/jwt.png", href: "https://jwt.io/" },
          { name: "Postman", desc: "Tests API.", logo: "/logos/postman.png", href: "https://www.postman.com/" },
        ],
      },
      {
        title: "Rangée 3 — DB & Deploy",
        items: [
          { name: "MongoDB", desc: "NoSQL.", logo: "/logos/mongodb.png", href: "https://www.mongodb.com/" },
          { name: "PostgreSQL", desc: "SQL.", logo: "/logos/postgresql.png", href: "https://www.postgresql.org/" },
          { name: "Git", desc: "Versioning.", logo: "/logos/git.png", href: "https://git-scm.com/" },
          { name: "GitHub", desc: "Repos & CI.", logo: "/logos/github.png", href: "https://github.com/" },
          { name: "Vercel", desc: "Deploy front.", logo: "/logos/vercel.png", href: "https://vercel.com/" },
          { name: "Render", desc: "Deploy back.", logo: "/logos/render.png", href: "https://render.com/" },
          { name: "Cloudinary", desc: "Médias.", logo: "/logos/cloudinary.png", href: "https://cloudinary.com/" },
          { name: "Stripe", desc: "Paiements.", logo: "/logos/stripe.png", href: "https://stripe.com/" },
        ],
      },
    ],
  },

  career: {
    title: "Parcours logistique",
    description:
      "12 ans d’expérience en logistique & supply chain, sur des environnements exigeants (aéronautique, industriel, terrain). Clique un tome pour voir le détail.",
    tags: ["Supply Chain", "Aéronautique", "Terrain", "Organisation"],
    items: [
      {
        name: "Gestionnaire Supply Chain",
        company: "Safran Helicopter Engines",
        location: "Tarnos",
        period: "Sep 2022 – Oct 2024",
        desc: "Gestion des Classic Engines / Makila / Arrius 1",
        bullets: ["Analyse quotidienne des plans de travail", "Suivi carnet de commandes et kitting tool"],
      },
      {
        name: "Approvisionneur Industriel",
        company: "Thales",
        location: "Mérignac",
        period: "Nov 2021 – Avr 2022",
        desc: "Approvisionnement et relation fournisseurs",
        bullets: ["Création de DA et passage de commandes", "Interface avec différents fournisseurs"],
      },
      {
        name: "Pilote de flux",
        company: "Safran Helicopter Engines",
        location: "Tarnos",
        period: "Jan 2020 – Août 2021",
        desc: "Pilotage prestataire & supervision de flux",
        bullets: ["Interface prestataire / clients internes", "Suivi anomalies + amélioration continue", "Gestion des urgences (AOG)"],
      },
      {
        name: "Gestionnaire ordonnancement",
        company: "Groupe Lauak",
        location: "Hasparren",
        period: "Juil 2019 – Déc 2019",
        desc: "Priorisation atelier & réduction des retards",
        bullets: ["Suivi urgences, soldes et OF", "Planning des priorités avec les managers"],
      },
      {
        name: "Logisticien d’atelier (ordonnancement)",
        company: "Dassault Aviation",
        location: "Biarritz",
        period: "Juin 2018 – Oct 2018",
        desc: "Suivi des OF en atelier",
        bullets: ["Suivi et coordination des OF"],
      },
      {
        name: "Responsable Logistique",
        company: "Medi Services",
        location: "Nouméa",
        period: "Fév 2018 – Mai 2018",
        desc: "Stock médical + coordination opérationnelle",
        bullets: ["Gestion de stock + équipe opérationnelle", "Amélioration tracking via codes-barres"],
      },
      {
        name: "Responsable de dock",
        company: "Bolloré Logistics",
        location: "Nouméa",
        period: "Jan 2018",
        desc: "Dépotage / inventaires / management",
        bullets: ["Gestion stock + dépotage conteneurs", "Contact parties prenantes + management"],
      },
      {
        name: "Assistant logistique",
        company: "Alcore Brigantine",
        location: "Anglet",
        period: "Oct 2016 – Août 2017",
        desc: "Chargements & relation transporteurs",
        bullets: ["Plans de chargement, BL", "Relation transporteurs"],
      },
      {
        name: "Logisticien",
        company: "Dassault Aviation",
        location: "Biarritz",
        period: "Déc 2013 – Juil 2016",
        desc: "Montage & amélioration continue",
        bullets: ["Contribution Lean Manufacturing (Falcon 900/2000)", "Création de base de données / Kanbans"],
      },
    ],
  },
};

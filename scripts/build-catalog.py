"""Build the shipped catalogue from the existing pack and original editorial sets.
Run from anywhere: python3 scripts/build-catalog.py. No network or dependencies.
"""
import json, html, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
base=json.loads((ROOT/'quizcast-more-quiz-pack.json').read_text())
# Fields: prompt | correct answer | distractor | distractor | distractor.
SETS={
'capitales':('Le tour du monde en 20 capitales','Géographie','GÉOGRAPHIE','Cap sur le monde','20', '''
Quelle est la capitale du Canada ?|Ottawa|Toronto|Montréal|Vancouver
Quelle est la capitale de l’Australie ?|Canberra|Sydney|Melbourne|Perth
Quelle est la capitale du Brésil ?|Brasília|Rio de Janeiro|São Paulo|Salvador
Quelle est la capitale du Maroc ?|Rabat|Casablanca|Marrakech|Fès
Quelle est la capitale de la Turquie ?|Ankara|Istanbul|Izmir|Bursa
Quelle ville est le siège des autorités fédérales suisses ?|Berne|Genève|Zurich|Lausanne
Quelle est la capitale de la Nouvelle-Zélande ?|Wellington|Auckland|Christchurch|Hamilton
Quelle est la capitale de l’Égypte ?|Le Caire|Alexandrie|Louxor|Assouan
Quelle est la capitale du Sénégal ?|Dakar|Saint-Louis|Thiès|Kaolack
Quelle est la capitale de la Corée du Sud ?|Séoul|Busan|Incheon|Daegu
Quelle est la capitale de l’Argentine ?|Buenos Aires|Córdoba|Rosario|Mendoza
Quelle est la capitale de l’Islande ?|Reykjavík|Akureyri|Keflavík|Húsavík
Quelle est la capitale du Kenya ?|Nairobi|Mombasa|Kisumu|Nakuru
Quelle est la capitale du Vietnam ?|Hanoï|Hô Chi Minh-Ville|Hué|Da Nang
Quelle est la capitale de la Croatie ?|Zagreb|Split|Dubrovnik|Zadar
Quelle est la capitale de la Slovénie ?|Ljubljana|Maribor|Koper|Celje
Quelle est la capitale du Pérou ?|Lima|Cusco|Arequipa|Trujillo
Quelle est la capitale de la Mongolie ?|Oulan-Bator|Erdenet|Darkhan|Ölgii
Quelle est la capitale du Portugal ?|Lisbonne|Porto|Braga|Faro
Quelle est la capitale du Népal ?|Katmandou|Pokhara|Lalitpur|Biratnagar
'''),
'cuisine':('20 saveurs : retrouve leur pays d’origine','Cuisine','CUISINE DU MONDE','Un voyage à déguster','20','''
À quel pays associe-t-on traditionnellement le kimchi ?|Corée du Sud|Japon|Thaïlande|Vietnam
De quel pays vient la paella valencienne ?|Espagne|Portugal|Italie|Grèce
Dans quel pays est née la pizza napolitaine ?|Italie|France|Croatie|Turquie
Quel pays est le berceau des tacos ?|Mexique|Pérou|Chili|Argentine
Quel pays est associé au pho ?|Vietnam|Chine|Laos|Cambodge
Dans quel pays le pad thaï est-il emblématique ?|Thaïlande|Indonésie|Malaisie|Japon
Quel pays associe-t-on aux sushis ?|Japon|Corée du Sud|Philippines|Chine
Le feijoada à base de haricots noirs est emblématique de quel pays ?|Brésil|Colombie|Équateur|Uruguay
Quel pays est célèbre pour son goulash ?|Hongrie|Autriche|Roumanie|Pologne
De quel pays vient la poutine ?|Canada|Belgique|France|États-Unis
Dans quel pays trouve-t-on traditionnellement le haggis ?|Écosse|Irlande|Pays de Galles|Islande
Le ceviche est notamment un plat national de quel pays ?|Pérou|Espagne|Mexique|Portugal
Quel pays est particulièrement associé aux pierogi ?|Pologne|Suède|Italie|Grèce
Quel pays est associé aux pasteis de nata ?|Portugal|Espagne|Italie|France
De quel pays vient la moussaka à la béchamel la plus connue ?|Grèce|France|Danemark|Maroc
Le nasi goreng est un plat emblématique de quel pays ?|Indonésie|Japon|Népal|Corée du Sud
Dans quel pays trouve-t-on les khachapuri ?|Géorgie|Arménie|Hongrie|Bulgarie
Quel pays est célèbre pour la raclette et la fondue au fromage ?|Suisse|Pays-Bas|Danemark|Suède
Quel pays est associé aux arepas avec la Colombie ?|Venezuela|Cuba|Chili|Argentine
De quel pays est originaire le bobotie ?|Afrique du Sud|Kenya|Sénégal|Égypte
'''),
'emoji-cinema':('Devine ces 20 films avec des emojis','Cinéma','CINÉMA EN EMOJIS','Lis entre les emojis','?!','''
🦁 👑 — Quel film se cache ici ?|Le Roi Lion|Madagascar|Bambi|Tarzan
🚢 🧊 💔 — Quel film se cache ici ?|Titanic|L’Odyssée de Pi|Waterworld|Le Grand Bleu
👽 🚲 🌕 — Quel film se cache ici ?|E.T.|Alien|Avatar|Interstellar
🦖 🏝️ 🚙 — Quel film se cache ici ?|Jurassic Park|King Kong|Godzilla|Jumanji
🐠 🔎 🌊 — Quel film se cache ici ?|Le Monde de Nemo|Gang de requins|Ponyo|Luca
👻 🚫 🚗 — Quel film se cache ici ?|SOS Fantômes|Casper|Beetlejuice|Ghost
🐼 🥋 — Quel film se cache ici ?|Kung Fu Panda|Mulan|Ratatouille|Zootopie
🏠 🎈 👴 — Quel film se cache ici ?|Là-haut|Encanto|Vice-versa|Soul
🤖 🗑️ 🌱 — Quel film se cache ici ?|WALL-E|Robots|Big Hero 6|Le Géant de fer
🐀 👨‍🍳 🥣 — Quel film se cache ici ?|Ratatouille|Souris City|Les Aristochats|Bee Movie
🏴‍☠️ 🧭 ⚓ — Quel film se cache ici ?|Pirates des Caraïbes|Hook|Peter Pan|Vaiana
🧙 💍 🌋 — Quel film se cache ici ?|Le Seigneur des anneaux|Harry Potter|Le Monde de Narnia|Eragon
🕷️ 🧑 🏙️ — Quel film se cache ici ?|Spider-Man|Ant-Man|Batman|Iron Man
👸 ❄️ ⛄ — Quel film se cache ici ?|La Reine des neiges|Raiponce|Rebelle|Cendrillon
🧑‍🚀 🪐 ⏳ — Quel film se cache ici ?|Interstellar|Seul sur Mars|Gravity|Apollo 13
🐒 🗽 🏙️ — Quel film se cache ici ?|King Kong|La Planète des singes|Godzilla|Jumanji
🎩 🍫 🏭 — Quel film se cache ici ?|Charlie et la Chocolaterie|Hugo Cabret|Paddington|Le Pôle express
👦 🏠 🎄 🪤 — Quel film se cache ici ?|Maman, j’ai raté l’avion !|Le Grinch|Love Actually|Klaus
👩‍🚀 🌍 🛰️ — Quel film se cache ici ?|Gravity|Premier Contact|Dune|Tenet
🏎️ ⚡ 🏁 — Quel film se cache ici ?|Cars|Turbo|Speed Racer|Rush
'''),
'inventions':('Qui a inventé ça ? 20 découvertes à retrouver','Histoire','LES GRANDES IDÉES','Les idées qui ont changé nos vies','+','''
À qui associe-t-on la pénicilline découverte en 1928 ?|Alexander Fleming|Louis Pasteur|Robert Koch|Edward Jenner
Qui a conçu le World Wide Web au CERN ?|Tim Berners-Lee|Bill Gates|Steve Jobs|Alan Turing
Qui a mis au point la première vaccination contre la variole en 1796 ?|Edward Jenner|Louis Pasteur|Marie Curie|Alexander Fleming
Quel savant a proposé la théorie de la relativité générale ?|Albert Einstein|Isaac Newton|Galilée|Niels Bohr
Qui est connu pour la presse à caractères métalliques mobiles en Europe ?|Johannes Gutenberg|Léonard de Vinci|Blaise Pascal|James Watt
Qui a découvert le radium avec Pierre Curie ?|Marie Curie|Rosalind Franklin|Lise Meitner|Ada Lovelace
Qui a créé le langage Python ?|Guido van Rossum|James Gosling|Dennis Ritchie|Bjarne Stroustrup
Qui a créé le langage C ?|Dennis Ritchie|Linus Torvalds|John McCarthy|Grace Hopper
Qui a découvert les rayons X en 1895 ?|Wilhelm Röntgen|Henri Becquerel|Max Planck|Ernest Rutherford
Quel mathématicien est associé à la machine arithmétique appelée Pascaline ?|Blaise Pascal|René Descartes|Pierre de Fermat|Gottfried Leibniz
Qui a amélioré la machine à vapeur avec un condenseur séparé ?|James Watt|Thomas Edison|Nikola Tesla|Michael Faraday
Qui a découvert la radioactivité naturelle en 1896 ?|Henri Becquerel|Marie Curie|Antoine Lavoisier|Enrico Fermi
Qui a créé Linux en 1991 ?|Linus Torvalds|Richard Stallman|Steve Wozniak|Ken Thompson
Qui a publié une classification périodique des éléments en 1869 ?|Dmitri Mendeleïev|Alfred Nobel|John Dalton|Robert Boyle
Qui a imaginé le Velcro en s’inspirant de la bardane ?|George de Mestral|Samuel Morse|Louis Braille|Émile Berliner
Qui a inventé l’écriture tactile qui porte son nom ?|Louis Braille|Samuel Morse|Alexander Bell|Charles Babbage
Qui a donné son nom à la pasteurisation ?|Louis Pasteur|Robert Koch|Antoine Lavoisier|Edward Jenner
Qui a créé la dynamite ?|Alfred Nobel|James Watt|Thomas Edison|Michael Faraday
Qui a conçu la première souris informatique avec son équipe au SRI ?|Douglas Engelbart|Steve Jobs|Bill Gates|Vint Cerf
Quel duo a présenté le cinématographe à Paris en 1895 ?|Les frères Lumière|Les frères Wright|Les frères Grimm|Les frères Montgolfier
'''),
'football':('Football : 20 questions pour les vrais supporters','Sports','FOOTBALL','Le match de tes connaissances','90','''
Combien de joueurs une équipe aligne-t-elle au début d’un match de football ?|11|9|10|12
Quelle est la durée réglementaire d’un match senior, hors arrêts de jeu ?|90 minutes|80 minutes|100 minutes|120 minutes
À quelle distance le point de penalty se situe-t-il de la ligne de but ?|11 mètres|9 mètres|10 mètres|12 mètres
Quel carton entraîne une expulsion immédiate ?|Le carton rouge|Le carton jaune|Le carton blanc|Le carton bleu
Quel pays a remporté la Coupe du monde masculine 2018 ?|La France|La Croatie|L’Allemagne|Le Brésil
Quel pays a remporté la Coupe du monde masculine 2022 ?|L’Argentine|La France|Le Maroc|Le Portugal
Quel pays a gagné cinq Coupes du monde masculines jusqu’en 2022 inclus ?|Le Brésil|L’Allemagne|L’Italie|L’Argentine
Quel pays a remporté la première Coupe du monde masculine en 1930 ?|L’Uruguay|L’Argentine|Le Brésil|L’Italie
Quelle sélection est surnommée la Roja ?|L’Espagne|L’Italie|L’Allemagne|Les Pays-Bas
Quel club joue ses matchs à domicile à Anfield ?|Liverpool|Arsenal|Chelsea|Everton
Quel club joue au stade Santiago-Bernabéu ?|Le Real Madrid|Le FC Barcelone|L’Atlético de Madrid|Le Séville FC
Quel gardien français était titulaire en finale du Mondial 1998 ?|Fabien Barthez|Hugo Lloris|Bernard Lama|Steve Mandanda
Quelle équipe a remporté l’Euro masculin 2004 ?|La Grèce|Le Portugal|La France|La République tchèque
Quel pays a remporté la Coupe du monde féminine 2019 ?|Les États-Unis|Les Pays-Bas|La Suède|L’Allemagne
Quel pays a remporté la Coupe du monde féminine 2023 ?|L’Espagne|L’Angleterre|L’Australie|La Suède
Comment appelle-t-on trois buts marqués par le même joueur dans un match ?|Un triplé|Un doublé|Un quadruplé|Un corner
Quelle partie du corps un joueur de champ ne peut-il pas utiliser délibérément pour jouer le ballon ?|La main|La tête|Le genou|La poitrine
Quelle compétition de clubs est organisée par l’UEFA ?|La Ligue des champions|La Copa Libertadores|La Gold Cup|La CAN
Combien de poteaux verticaux composent un but ?|2|1|3|4
Quel pays a accueilli la Coupe du monde masculine 2010 ?|L’Afrique du Sud|Le Brésil|La Russie|Le Japon
'''),
'vocabulaire':('20 mots français : sauras-tu trouver le bon sens ?','Culture générale','LE DÉFI DES MOTS','Joue avec les mots','Aa','''
Que signifie « éphémère » ?|Qui dure peu de temps|Qui dure toujours|Qui revient chaque année|Qui se déplace vite
Quel est le contraire de « prolixe » ?|Laconique|Bavard|Loquace|Verbeux
Que signifie « ubiquité » ?|Présence en plusieurs lieux à la fois|Peur des lieux clos|Goût des voyages|Perte de mémoire
Que désigne un « oxymore » ?|Deux termes contradictoires réunis|Une phrase sans verbe|Une répétition de voyelles|Un mot inventé
Que signifie « taciturne » ?|Qui parle peu|Qui rit souvent|Qui dort beaucoup|Qui marche vite
Que signifie « altruiste » ?|Qui se soucie des autres|Qui ne pense qu’à soi|Qui aime les hauteurs|Qui refuse de choisir
Qu’est-ce qu’un « anachronisme » ?|Un élément placé à la mauvaise époque|Une faute de calcul|Une répétition de sons|Une mesure du temps
Que signifie « tangible » ?|Que l’on peut toucher|Que l’on peut entendre|Que l’on peut goûter|Que l’on peut deviner
Quel mot signifie « très soigneux dans les détails » ?|Méticuleux|Désinvolte|Impulsif|Distrait
Que signifie « impassible » ?|Qui ne laisse paraître aucune émotion|Qui ne peut pas passer|Qui change vite d’avis|Qui ne sait pas lire
Qu’est-ce qu’une « hyperbole » en littérature ?|Une exagération|Une comparaison avec comme|Une répétition en début de phrase|Une rupture de construction
Que signifie « pragmatique » ?|Qui privilégie les réalités pratiques|Qui s’intéresse aux étoiles|Qui refuse toute action|Qui suit uniquement ses rêves
Quel est le synonyme de « perspicace » ?|Clairvoyant|Naïf|Distrait|Indécis
Que signifie « inéluctable » ?|Que l’on ne peut éviter|Que l’on ne peut voir|Que l’on ne peut croire|Que l’on ne peut compter
Qu’est-ce qu’un « palindrome » ?|Un mot qui se lit dans les deux sens|Un mot sans voyelle|Un mot issu du grec|Un mot très long
Que signifie « pléthorique » ?|Très abondant|Très petit|Très ancien|Très fragile
Que signifie « ambivalent » ?|Qui présente deux aspects opposés|Qui reste toujours identique|Qui manque de valeur|Qui se déplace seul
Que signifie « novice » ?|Débutant|Expert|Arbitre|Inventeur
Quel mot désigne une parole volontairement énigmatique ou obscure ?|Sibylline|Limpide|Explicite|Banale
Que signifie « corroborer » ?|Confirmer par un élément supplémentaire|Contredire sans preuve|Effacer un souvenir|Faire une comparaison
'''),
}
TF={
'espace':('Espace : 20 idées reçues, vraies ou fausses ?','Astronomie','VRAI OU FAUX','La vérité est ailleurs','✦','''
Le Soleil est une étoile.|1|Le Soleil est l’étoile au centre du Système solaire.
Vénus est la planète la plus chaude du Système solaire.|1|Son atmosphère dense produit un puissant effet de serre.
Mercure est la planète la plus proche du Soleil.|1|Vénus vient ensuite, puis la Terre.
La Lune produit sa propre lumière visible comme une étoile.|0|Elle réfléchit principalement la lumière du Soleil.
Une année-lumière est une unité de temps.|0|C’est une distance : celle parcourue par la lumière en un an.
Mars possède deux petites lunes.|1|Elles s’appellent Phobos et Déimos.
Jupiter est la plus grande planète du Système solaire.|1|Son diamètre est environ onze fois celui de la Terre.
Saturne est la seule planète qui possède des anneaux.|0|Jupiter, Uranus et Neptune en ont aussi.
On peut entendre une explosion à travers le vide spatial.|0|Le son a besoin d’un milieu matériel pour se propager.
Pluton est classée comme planète naine depuis 2006.|1|L’Union astronomique internationale a adopté cette catégorie en 2006.
La Terre est plus proche du Soleil que Vénus.|0|Vénus orbite entre Mercure et la Terre.
L’étoile Polaire est l’étoile la plus brillante du ciel nocturne.|0|Sirius est l’étoile la plus brillante du ciel nocturne vue de la Terre.
Une éclipse de Soleil se produit lorsque la Lune passe entre la Terre et le Soleil.|1|L’ombre de la Lune atteint alors une partie de la Terre.
Les comètes sont principalement constituées de métal massif.|0|Leurs noyaux contiennent notamment des glaces, des poussières et des roches.
La gravité est absente dans la Station spatiale internationale.|0|La station et ses occupants sont en chute libre autour de la Terre.
Neptune est plus éloignée du Soleil qu’Uranus.|1|Neptune est la huitième planète à partir du Soleil.
Le Soleil tourne sur lui-même.|1|Sa rotation est différentielle : elle dépend de la latitude.
Les phases de la Lune sont causées par l’ombre de la Terre.|0|Elles dépendent de la portion éclairée par le Soleil que nous voyons.
Notre galaxie s’appelle la Voie lactée.|1|Le Système solaire appartient à la Voie lactée.
Le télescope James Webb est posé sur la Lune.|0|Il orbite autour du point de Lagrange L2 du système Soleil-Terre.
'''),
'animaux':('Animaux : 20 faits surprenants à démêler','Animaux','VRAI OU FAUX','Vraiment… ou pas ?','?!','''
La pieuvre possède trois cœurs.|1|Deux cœurs alimentent les branchies et un troisième le reste du corps.
Les chauves-souris sont des oiseaux.|0|Ce sont des mammifères capables de vol actif.
Tous les serpents sont venimeux.|0|De nombreuses espèces, dont les pythons, ne le sont pas.
L’autruche peut voler.|0|Elle ne vole pas, mais peut courir très vite.
Les dauphins respirent avec des poumons.|1|Ils doivent remonter à la surface pour respirer.
Le koala est un ours.|0|C’est un marsupial, comme les kangourous.
Les requins possèdent un squelette principalement cartilagineux.|1|Le cartilage remplace l’essentiel des os de leur squelette.
Les manchots vivent naturellement dans l’Arctique.|0|Ils vivent dans l’hémisphère Sud et, pour le manchot des Galápagos, près de l’équateur.
Le caméléon change de couleur uniquement pour se camoufler.|0|Il change aussi de couleur pour communiquer ou réguler sa température.
L’ornithorynque pond des œufs.|1|Ce mammifère appartient au groupe des monotrèmes.
Les araignées sont des insectes.|0|Ce sont des arachnides ; elles possèdent huit pattes.
Une coccinelle adulte a six pattes.|1|Comme tous les insectes adultes typiques.
Les dents des castors poussent continuellement.|1|Leurs incisives s’usent en rongeant.
Les méduses ont un cerveau central comme le nôtre.|0|Elles possèdent un réseau nerveux sans cerveau central.
La girafe possède sept vertèbres cervicales.|1|Comme la plupart des mammifères, malgré la longueur de son cou.
Les coraux sont des animaux.|1|Les récifs sont bâtis par des colonies de petits polypes.
Le gecko peut perdre sa queue pour échapper à un prédateur.|1|Ce mécanisme de défense s’appelle l’autotomie.
La baleine bleue est un poisson.|0|C’est un mammifère marin qui allaite ses petits.
Le bernard-l’ermite fabrique lui-même sa coquille de gastéropode.|0|Il occupe une coquille abandonnée pour protéger son abdomen.
Les flamants roses doivent leur couleur à des pigments de leur alimentation.|1|Les caroténoïdes contenus dans leur nourriture colorent leur plumage.
'''),
'corps':('Ton corps : 20 affirmations à vérifier','Sciences','VRAI OU FAUX','Connais-tu vraiment ton corps ?','+','''
Le cœur humain possède quatre cavités.|1|Deux oreillettes et deux ventricules.
Les globules rouges transportent une grande partie de l’oxygène du sang.|1|L’oxygène se lie à l’hémoglobine qu’ils contiennent.
Les adultes ont normalement plus d’os que les nouveau-nés.|0|Plusieurs os fusionnent pendant la croissance.
La peau est un organe.|1|C’est notamment une barrière de protection.
Les reins filtrent le sang.|1|Ils régulent aussi l’équilibre en eau et en sels minéraux.
Les poumons sont les organes principaux de la digestion.|0|Ils assurent les échanges gazeux entre l’air et le sang.
Le fémur est situé dans la cuisse.|1|C’est le plus long os du corps humain.
La rétine se trouve dans l’oreille.|0|Elle tapisse le fond de l’œil et contient des photorécepteurs.
Le diaphragme joue un rôle dans la respiration.|1|Sa contraction contribue à l’inspiration.
Les tendons relient généralement les muscles aux os.|1|Les ligaments relient généralement les os entre eux.
Le sang humain est bleu avant d’être exposé à l’air.|0|Il est rouge, avec des nuances liées à son oxygénation.
Le foie produit la bile.|1|La bile participe à la digestion des graisses.
Nous n’utilisons que 10 % de notre cerveau.|0|Les différentes régions cérébrales sont actives selon les tâches et les moments.
La cornée est normalement dépourvue de vaisseaux sanguins.|1|Cette propriété contribue à sa transparence.
Le cerveau et la moelle épinière composent le système nerveux central.|1|Les nerfs périphériques forment un autre ensemble.
L’émail dentaire recouvre la couronne de la dent.|1|C’est la couche externe très minéralisée.
Le pancréas produit de l’insuline.|1|Cette hormone participe à la régulation de la glycémie.
Le poumon droit comporte normalement deux lobes.|0|Il en comporte trois ; le poumon gauche en comporte deux.
Les ongles sont principalement constitués de kératine.|1|Cette protéine entre aussi dans la composition des cheveux.
La pupille est un muscle.|0|C’est une ouverture ; les muscles de l’iris règlent son diamètre.
''')}
FREE=('20 devinettes : trouve la réponse avant la révélation','Culture générale','DEVINETTES','Prends le temps de réfléchir','?','''
Plus on m’enlève de matière, plus je deviens grand. Qui suis-je ?|Un trou|trou
Je possède des touches, mais aucune serrure. Je peux jouer de la musique. Qui suis-je ?|Un piano|piano;clavier
Je peux remplir une pièce sans prendre de place matérielle. J’éclaire. Qui suis-je ?|La lumière|lumière;la lumiere
Je suis toujours devant toi, mais tu ne peux pas encore me voir. Qui suis-je ?|L’avenir|avenir;le futur;futur
Je voyage autour du monde en restant collé dans un coin d’enveloppe. Qui suis-je ?|Un timbre|timbre
Je possède un cou, mais pas de tête. Je contiens une boisson. Qui suis-je ?|Une bouteille|bouteille
Je possède des aiguilles, mais je ne sais pas coudre. Je donne l’heure. Qui suis-je ?|Une horloge|horloge;une montre;montre;un réveil;réveil
Je grandis quand je mange du bois, mais l’eau m’éteint. Qui suis-je ?|Le feu|feu;un feu
Je possède des villes, des routes et des rivières, mais aucun habitant. Qui suis-je ?|Une carte|carte;une carte géographique
Je diminue à mesure que je fais de la lumière avec ma flamme. Qui suis-je ?|Une bougie|bougie
Je suis plein de trous, mais je retiens l’eau. Qui suis-je ?|Une éponge|éponge;eponge
Je peux être cassé sans être touché. On m’a promis quelque chose. Qui suis-je ?|Une promesse|promesse
Je t’appartiens, mais les autres l’utilisent plus que toi pour t’appeler. Qui suis-je ?|Ton prénom|prénom;un prénom;mon prénom;le prénom;nom;ton nom
Je possède des dents, mais je ne mords pas. Je démêle les cheveux. Qui suis-je ?|Un peigne|peigne
On me pose sans me déplacer et on me répond. Qui suis-je ?|Une question|question
Je monte et je descends sans bouger : mes marches restent en place. Qui suis-je ?|Un escalier|escalier
Je suis une lettre présente une fois dans « minute » et deux fois dans « moment ». Qui suis-je ?|M|la lettre m
Je suis blanc quand je suis sale de craie et sombre quand je suis propre. Qui suis-je ?|Un tableau noir|tableau;tableau noir;un tableau
Je cours dans mon lit sans jamais dormir, de la source à la mer. Qui suis-je ?|Un fleuve|fleuve;une rivière;rivière
Je te suis au soleil et disparais dans l’obscurité complète. Qui suis-je ?|Ton ombre|ombre;une ombre;mon ombre;l’ombre
''')
NUM=('Le juste nombre : 20 réponses à estimer','Culture générale','LE JUSTE NOMBRE','Plus proche que tu ne le penses','42','''
Combien de cases compte un échiquier ?|64|0|100|cases|8 rangées de 8 cases : 8 × 8 = 64.
Combien de côtés possède un hexagone ?|6|0|20|côtés|Le préfixe hexa- signifie six.
Combien de minutes y a-t-il dans une journée de 24 heures ?|1440|0|2000|minutes|24 × 60 = 1 440 minutes.
Combien de touches compte un piano standard moderne ?|88|0|120|touches|Il comprend 52 touches blanches et 36 touches noires.
Combien de joueurs sont sur le terrain dans une équipe de basket ?|5|0|15|joueurs|Cinq joueurs par équipe jouent simultanément.
Combien de couleurs distingue-t-on traditionnellement dans l’arc-en-ciel ?|7|0|12|couleurs|Le découpage traditionnel en compte sept ; le spectre est en réalité continu.
Combien de faces possède un dé cubique ordinaire ?|6|0|20|faces|Le cube possède six faces carrées.
Combien de cordes possède une guitare classique standard ?|6|0|12|cordes|Les modèles standards en ont six.
Combien de degrés mesure un angle droit ?|90|0|180|degrés|Un angle droit correspond au quart d’un tour.
Combien de secondes y a-t-il dans une heure ?|3600|0|5000|secondes|60 minutes × 60 secondes = 3 600 secondes.
Combien de cartes contient un jeu standard sans jokers ?|52|0|100|cartes|Quatre couleurs de treize cartes.
Combien de joueurs par équipe sont sur le terrain au volley en salle ?|6|0|12|joueurs|Le volley en salle se joue à six contre six.
Combien de mètres mesure un kilomètre ?|1000|0|2000|mètres|Le préfixe kilo- correspond à mille.
Combien de côtés possède un dodécagone ?|12|0|20|côtés|Dodéca- signifie douze.
Combien de points vaut un essai au rugby à XV ?|5|0|10|points|La transformation réussie ajoute ensuite deux points.
Combien de dents compte normalement une dentition adulte complète avec dents de sagesse ?|32|0|40|dents|Elle comprend quatre dents de sagesse, parfois absentes ou retirées.
Combien de symboles distincts utilise le système binaire ?|2|0|10|symboles|Il utilise 0 et 1.
Combien de jours compte une année bissextile ?|366|350|370|jours|Le mois de février compte alors 29 jours.
Combien de zéros comporte un million en écriture décimale ?|6|0|12|zéros|Un million s’écrit 1 000 000.
Combien de cases comporte une grille de sudoku classique 9 × 9 ?|81|0|100|cases|9 lignes de 9 cases donnent 81 cases.
''')
RANK=('Dans le bon ordre : 20 classements à relever','Culture générale','DANS LE BON ORDRE','Tout est une question d’ordre','↕','''
Classe ces planètes depuis le Soleil.|De la plus proche à la plus éloignée|Mercure;Vénus;Terre;Mars
Classe ces unités de longueur.|De la plus petite à la plus grande|Millimètre;Centimètre;Mètre;Kilomètre
Classe ces périodes de l’histoire européenne.|De la plus ancienne à la plus récente|Antiquité;Moyen Âge;Époque moderne;Époque contemporaine
Classe ces nombres.|Du plus petit au plus grand|3;12;45;108
Classe ces animaux par nombre de pattes à l’âge adulte.|Du moins au plus de pattes|Serpent;Chat;Fourmi;Araignée
Classe ces fractions.|De la plus petite à la plus grande|1/8;1/4;1/2;3/4
Classe ces étapes du cycle du papillon.|De la première à la dernière|Œuf;Chenille;Chrysalide;Papillon adulte
Classe ces films dans leur ordre de sortie.|Du plus ancien au plus récent|Toy Story;Shrek;Le Monde de Nemo;La Reine des neiges
Classe ces consoles Nintendo par première sortie.|De la plus ancienne à la plus récente|Game Boy;Nintendo 64;Wii;Switch
Classe ces inventions par apparition historique.|De la plus ancienne à la plus récente|Imprimerie de Gutenberg;Téléphone;World Wide Web;Smartphone iPhone
Classe ces éléments selon leur numéro atomique.|Du plus petit au plus grand|Hydrogène;Hélium;Carbone;Oxygène
Classe ces unités de durée.|De la plus courte à la plus longue|Seconde;Minute;Heure;Jour
Classe ces villes du nord au sud.|De la plus au nord à la plus au sud|Lille;Paris;Lyon;Marseille
Classe ces nombres romains.|Du plus petit au plus grand|V;X;L;C
Classe ces sommets par altitude.|Du plus bas au plus haut|Mont Fuji;Mont Blanc;Kilimandjaro;Everest
Classe ces océans par superficie.|Du plus petit au plus grand|Arctique;Indien;Atlantique;Pacifique
Classe ces saisons en commençant au printemps.|Dans l’ordre de l’année|Printemps;Été;Automne;Hiver
Classe ces étapes d’une recette de pain.|De la première à la dernière|Pétrir la pâte;Laisser lever;Enfourner;Laisser refroidir
Classe ces nombres au carré.|Du plus petit au plus grand|2²;3²;5²;10²
Classe ces événements de l’exploration spatiale.|Du plus ancien au plus récent|Spoutnik 1;Premier vol de Youri Gagarine;Premiers pas sur la Lune;Atterrissage de Curiosity sur Mars
''')
# One more original theme makes thirteen new series in addition to the 20 existing packs.
SETS['mythologie']=('Mythologie : 20 dieux, monstres et légendes','Culture générale','MYTHOLOGIE','Entre dieux et légendes','Ω','''
Qui est le dieu grec de la mer ?|Poséidon|Zeus|Hadès|Arès
Quel héros grec a combattu le Minotaure ?|Thésée|Achille|Persée|Ulysse
Quel dieu grec est le messager des dieux ?|Hermès|Apollon|Dionysos|Héphaïstos
Quel héros a vaincu Méduse ?|Persée|Héraclès|Jason|Œdipe
Quel être mythologique renaît de ses cendres ?|Le phénix|Le griffon|Le centaure|La sirène
Dans la mythologie nordique, qui manie Mjöllnir ?|Thor|Loki|Odin|Tyr
Quel dieu égyptien est souvent représenté avec une tête de chacal ?|Anubis|Horus|Thot|Sobek
Qui est la déesse grecque de la sagesse ?|Athéna|Aphrodite|Héra|Artémis
Combien de têtes possède traditionnellement Cerbère ?|Trois|Une|Deux|Sept
Quel héros grec accomplit les douze travaux ?|Héraclès|Achille|Thésée|Orphée
Qui est le dieu romain de la guerre ?|Mars|Mercure|Jupiter|Neptune
Qui est la déesse grecque de la chasse ?|Artémis|Déméter|Hestia|Héra
Quel dieu nordique possède les corbeaux Huginn et Muninn ?|Odin|Thor|Loki|Baldr
Quel monstre possède un corps de lion et une tête humaine dans la tradition grecque ?|Le Sphinx|Le Minotaure|L’Hydre|Le Kraken
Qui descend aux Enfers pour retrouver Eurydice ?|Orphée|Jason|Persée|Achille
Quel héros est réputé vulnérable au talon ?|Achille|Ulysse|Thésée|Hector
Quelle créature est mi-homme, mi-cheval ?|Un centaure|Un satyre|Une harpie|Un cyclope
Qui est le dieu grec des Enfers ?|Hadès|Zeus|Poséidon|Hermès
Quel dieu égyptien est souvent représenté avec une tête de faucon ?|Horus|Anubis|Sobek|Thot
Qui dirige les Argonautes à la recherche de la Toison d’or ?|Jason|Ulysse|Thésée|Persée
''')
colors=['#6951cc','#176d75','#bd5737','#304d8c','#97509d','#3e7660']
cat_by_name={c['name']:c for c in base['categories']}
quizzes=[]
for i,q in enumerate(base['quizzes']):
 q['catalogKey']='legacy-'+str(i+1);q['id']='catalog-legacy-'+str(i+1);q['isDemo']=False
 q['videoHook']='Une bonne réponse, un point. Quel sera ton score ?'
 q['editorialOrigin']='Pack déjà présent : quizcast-more-quiz-pack.json'
 # Normalize only the shipped copy, preserving old files and imported versions.
 for j,x in enumerate(q['questions']):
  ids={a['id']:f'{q["id"]}-q{j}-a{k}' for k,a in enumerate(x['answers'])}
  x['correctAnswerId']=ids[x['correctAnswerId']]
  for a in x['answers']:a['id']=ids[a['id']]
  x['id']=f'{q["id"]}-q{j}'
 quizzes.append(q)

def rows(text):return [r.split('|') for r in text.strip().splitlines() if r.strip()]
def add(key,meta,kind):
 title,cat,cover,tag,mark,text=meta
 if cat not in cat_by_name:
  cat_by_name[cat]={'id':'category-'+key,'name':cat,'color':colors[len(cat_by_name)%len(colors)],'parentId':None}
 qid='catalog-'+key
 qs=[]
 for n,row in enumerate(rows(text)):
  p,*values=row;x={'id':f'{qid}-q{n+1}','type':kind,'text':p,'duration':12,'difficulty':'facile' if n<6 else 'moyen' if n<15 else 'difficile','tags':[key],'answers':[],'image':None,'chapter':'Échauffement' if n<6 else 'On monte le niveau' if n<15 else 'La finale','source':''}
  if kind=='qcm':
   correct=values[0];ordered=values[n%4:]+values[:n%4];x['answers']=[{'id':f'{x["id"]}-a{k}','text':v}for k,v in enumerate(ordered)];x['correctAnswerId']=next(a['id'] for a in x['answers'] if a['text']==correct)
   x['explanation']=('Interprétation proposée : '+correct+'. Les emojis peuvent admettre d’autres lectures.' if key=='emoji-cinema' else 'Réponse : '+correct+'.')
  elif kind=='true_false':
   x['answers']=[{'id':x['id']+'-t','text':'Vrai'},{'id':x['id']+'-f','text':'Faux'}];x['correctAnswerId']=x['answers'][0 if values[0]=='1' else 1]['id'];x['explanation']=values[1]
  elif kind=='open_answer':x.update(answerText=values[0],acceptedAnswers=values[1].split(';'),explanation='Réponse proposée : '+values[0]+'.')
  elif kind=='number':x.update(value=int(values[0]),min=int(values[1]),max=int(values[2]),unit=values[3],explanation=values[4],step=1)
  elif kind=='ranking':
   x['criterion']=values[0];x['answers']=[{'id':f'{x["id"]}-a{k}','text':v} for k,v in enumerate(values[1].split(';'))];x['explanation']='Ordre attendu : '+' → '.join(a['text'] for a in x['answers'])+'.';x['duration']=15
  qs.append(x)
 assert len(qs)==20,(key,len(qs))
 quizzes.append({'id':qid,'catalogKey':key,'name':title,'description':tag+'. 20 défis, de l’échauffement à la finale. Joue seul ou compare ton score avec tes proches.','language':'fr','difficulty':'moyen','categoryIds':[cat_by_name[cat]['id']],'questions':qs,'createdAt':'2026-11-09T12:00:00Z','updatedAt':'2026-11-09T12:00:00Z','videoHook':tag+' : atteindras-tu les 20 points ?','editorialOrigin':'Collection originale QuizCast 2026-11','coverLabel':cover,'coverMark':mark})
for k,m in SETS.items():add(k,m,'qcm')
for k,m in TF.items():add(k,m,'true_false')
add('devinettes',FREE,'open_answer');add('nombres',NUM,'number');add('classements',RANK,'ranking')
# Keep the existing English Nintendo version available for a separate language experiment.
en=json.loads((ROOT/'Nintendo_quiz_English_US.json').read_text())['quizzes'][0]
en['id']='catalog-nintendo-en';en['catalogKey']='nintendo-en';en['editorialOrigin']='Pack anglais déjà présent';en['categoryIds']=[cat_by_name['Nintendo']['id']];quizzes.append(en)
for i,q in enumerate(quizzes):
 slug=q['catalogKey'];color=colors[i%len(colors)];label=q.get('coverLabel') or cat_by_name[next(c['name'] for c in cat_by_name.values() if c['id'] in q['categoryIds'])]['name'].upper()
 mark=q.get('coverMark',str(len(q['questions'])))
 # All visual assets are original geometry + system text, no external fonts or film stills.
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><rect width="800" height="450" fill="{color}"/><circle cx="750" cy="20" r="230" fill="none" stroke="#ffffff" stroke-opacity=".14" stroke-width="65"/><circle cx="30" cy="480" r="200" fill="#ffffff" opacity=".06"/><path d="M630 295l14 30 33 4-25 23 6 33-28-16-30 16 7-33-25-23 34-4z" fill="#dcfa90"/><text x="55" y="75" fill="#ffffff" opacity=".8" font-family="sans-serif" font-size="18" font-weight="700" letter-spacing="5">QUIZCAST / {html.escape(q['language'].upper())}</text><text x="50" y="270" font-family="sans-serif" font-size="155" font-weight="850" fill="#ffffff">{html.escape(mark)}</text><rect x="50" y="330" width="700" height="1" fill="#ffffff" opacity=".2"/><text x="55" y="385" font-family="sans-serif" font-size="27" font-weight="750" fill="#ffffff" letter-spacing="2">{html.escape(label[:30])}</text></svg>'''
 (ROOT/'assets/covers'/f'{slug}.svg').write_text(svg)
 q['thumbnail']='COVER_ROOT/assets/covers/'+slug+'.svg'
 # Editorial duration default yields ~5:40 for a 20-question episode.
 if len(q['questions'])==20:q['videoSettings']={'responseTime':12,'revealDuration':4,'nextDelay':.8,'preset':'pop'}
used={cid for q in quizzes for cid in q['categoryIds']}
result={'version':2,'editorialNote':'13 nouvelles séries originales (260 questions), 20 séries préexistantes (260 questions) et un test Nintendo anglais préexistant (20 questions). Relecture éditoriale avant diffusion recommandée.','categories':[c for c in cat_by_name.values() if c['id'] in used],'quizzes':quizzes}
(ROOT/'data/catalog.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(len(quizzes),'quiz,',sum(len(q['questions']) for q in quizzes),'questions')

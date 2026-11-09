"""Visual editions. Character files are copied unchanged from the repository's archive.
Film/game storyboards deliberately contain no third-party screenshots: the creator imports them.
"""
import copy
import html
import re
import zipfile

CHARACTERS = [
 ('link','Link','link.png'),('zelda','Zelda','zelda.png'),('samus','Samus','samus.webp'),
 ('yoshi','Yoshi','yoshi.webp'),('bowser','Bowser','bowser.png'),('pichu','Pichu','pichu.png'),
 ('donkey-kong','Donkey Kong','Donkey Kong.webp'),('diddy-kong','Diddy Kong','Diddy Kong.webp'),
 ('waluigi','Waluigi','waluigi.webp'),('meta-knight','Meta Knight','Meta Knight.webp'),
 ('cappy','Cappy','cappy.png'),('falco','Falco','falco.webp'),('captain-falcon','Captain Falcon','captain falcon.webp'),
 ('marth','Marth','marth.webp'),('olimar','Olimar','olimar.webp'),('shulk','Shulk','shulk.webp'),
 ('tom-nook','Tom Nook','Tom Nook.webp'),('king-boo','Roi Boo','king boo.webp'),('cynthia','Cynthia','Cynthia.webp'),
 ('toadette','Toadette','toadette.webp'),('luigi','Luigi','luigi.jpg'),('ganondorf','Ganondorf','ganondorf.jpg'),
 ('eevee','Évoli','eevee.jpg'),('togepi','Togepi','togepi.jpg'),('charizard','Méga-Dracaufeu X','mega dracaufeu x.png'),
 ('funky-kong','Funky Kong','funky kong.jpg'),('kirby','Kirby','kirby.jpg'),
]
FILMS = [
 ('Titanic','Un plan du paquebot;Un iceberg;Le pont avant du navire','La traversée du Titanic est au cœur du film.'),
 ('Harry Potter à l’école des sorciers','Le Poudlard Express;Le Choixpeau;La pierre philosophale','Ces indices visent le premier film de la saga.'),
 ('Le Seigneur des anneaux : La Communauté de l’anneau','La Comté;La porte de la Moria;Le Conseil d’Elrond','Ces trois lieux apparaissent dans La Communauté de l’anneau.'),
 ('Retour vers le futur','La DeLorean;L’horloge de Hill Valley;Le bal de 1955','La machine à voyager dans le temps est une DeLorean.'),
 ('Jurassic Park','La porte du parc;Le moustique dans l’ambre;Le verre d’eau qui tremble','Le moustique dans l’ambre fournit un indice central.'),
 ('Le Roi Lion','Le rocher des Lions;La savane;Un phacochère et un suricate','Choisis des captures de la même adaptation du film.'),
 ('Le Monde de Nemo','Une anémone;Un aquarium;Le masque de plongée','Le masque de plongée fournit une piste vers Sydney.'),
 ('Ratatouille','Les cuisines du restaurant;Une toque;Le plat final de légumes','Le plat de ratatouille joue un rôle clé dans le dénouement.'),
 ('WALL-E','Une Terre couverte de déchets;Une petite plante;Le vaisseau Axiom','La plante est un symbole du retour possible sur Terre.'),
 ('Là-haut','La maison et ses ballons;Un badge d’explorateur;Les chutes du Paradis','La maison est transportée par des ballons.'),
 ('Les Dents de la mer','La plage d’Amity;Le bateau Orca;Un aileron','L’action se déroule autour de la station balnéaire d’Amity.'),
 ('Inception','La toupie;La ville qui se replie;Le couloir rotatif','La toupie est le totem utilisé par Cobb.'),
 ('Matrix','Les pilules rouge et bleue;Le code vert;Le téléphone à cadran','Les objets renvoient aux choix et aux sorties de la Matrice.'),
 ('E.T.','Le vélo;Le doigt lumineux;Une silhouette devant la Lune','La scène du vélo est un des moments emblématiques du film.'),
 ('Ghostbusters','Le piège à fantôme;La voiture Ecto-1;Le bonhomme Stay Puft','La voiture Ecto-1 appartient à l’équipe des chasseurs de fantômes.'),
 ('Pirates des Caraïbes : La Malédiction du Black Pearl','Le Black Pearl;La pièce d’or aztèque;La grotte du trésor','Ces indices ciblent le premier film Pirates des Caraïbes.'),
 ('Maman, j’ai raté l’avion !','La maison des McCallister;Les pièges près de l’escalier;Le visage de Kevin après le rasage','Les pièges servent à défendre la maison.'),
 ('La Reine des neiges','Le palais de glace;Olaf;La porte de la chambre d’Elsa','Elsa construit un palais de glace.'),
 ('Interstellar','Le champ de maïs;Le vaisseau Endurance;La montre de Murph','La montre de Murph a un rôle crucial dans le récit.'),
 ('Le Voyage de Chihiro','Les bains;Le train sur l’eau;Sans-Visage','Ces trois scènes appartiennent au film de Hayao Miyazaki.'),
]
GAMES = [
 ('Minecraft','Un bloc d’herbe;Un portail du Nether;Une table de fabrication'),
 ('The Legend of Zelda: Breath of the Wild','La tablette Sheikah;La tour du Prélude;Un gardien'),
 ('Super Mario Odyssey','L’Odyssée;Cappy;New Donk City'),
 ('Animal Crossing: New Horizons','Le bureau des résidents;Un billet Nook Miles;L’aéroport de l’île'),
 ('Pokémon Rouge et Bleu','Le laboratoire du Professeur Chen;Une Poké Ball;Le choix des trois Pokémon de départ'),
 ('Mario Kart 8 Deluxe','La Route Arc-en-ciel;Une carapace bleue;L’écran de sélection des karts'),
 ('Portal','Un portail bleu;Un portail orange;Le cube de compagnie'),
 ('Stardew Valley','La ferme;Le centre communautaire;La mine'),
 ('Hollow Knight','Le Chevalier;Le puits de Dirtmouth;Un banc de sauvegarde'),
 ('Among Us','La cafétéria du Skeld;Un conduit;L’écran de réunion d’urgence'),
 ('Pac-Man','Le labyrinthe;Les quatre fantômes;Une cerise'),
 ('Tetris','Une ligne presque complète;Un bloc en T;Un bloc long'),
 ('Splatoon 3','La place de Cité-Clabousse;Une arme à encre;Le salmonoïde Cohozuna'),
 ('Donkey Kong Country','Les tonneaux DK;Une mine avec ses wagonnets;Les bananes'),
 ('Luigi’s Mansion 3','L’hôtel du Repos éternel;Le Spectroflash;Le Gluigi'),
 ('Metroid Dread','Un E.M.M.I.;Samus;Un ascenseur de ZDR'),
 ('Super Smash Bros. Ultimate','Le plateau Champ de Bataille;La Balle Smash;Le grand écran de sélection des combattants'),
 ('Sonic the Hedgehog','Green Hill Zone;Un anneau doré;Un moniteur à casser'),
 ('Wii Sports','La salle de bowling;Un Mii au tennis;Le ring de boxe'),
 ('Fall Guys','La couronne;Les portes de Ruée vers les portes;Les personnages haricots'),
]

def extend_visual_catalog(root, result):
 assets=root/'assets/characters';assets.mkdir(exist_ok=True)
 archive=zipfile.ZipFile(root/'Characters Silhouette.zip')
 images={}
 for slug,name,file in CHARACTERS:
  suffix='.'+file.rsplit('.',1)[1].lower();dest=assets/(slug+suffix)
  dest.write_bytes(archive.read('Characters Silhouette/'+file))
  images[slug]={'image':'COVER_ROOT/assets/characters/'+dest.name,'name':name}
 categories={c['name']:c['id'] for c in result['categories']}
 gaming=categories['Jeux vidéo'];cinema=categories['Cinéma']
 def base(kind,text):
  return {'type':kind,'text':text,'answers':[],'duration':14,'difficulty':'moyen','tags':['visuel'],'chapter':'La chasse aux indices','explanation':''}
 def visual(slug,mode):
  a=images[slug]
  if(mode=='silhouette' and slug=='bowser'):mode='hidden'
  return dict(base('visual_guess','Quel personnage se cache ici ?'),image=a['image'],imageHasAlpha=slug!='bowser',answerText=a['name'],acceptedAnswers=[slug.replace('-',' ')],visualMode=mode,zoomStart=4,explanation=a['name']+' était le personnage à retrouver.')
 def clues(keys,answer,text='Quelle série de jeux relie ces trois personnages ?'):
  return dict(base('image_clues',text),clues=[{'image':images[k]['image']} for k in keys],answerText=answer,acceptedAnswers=[answer.replace('The Legend of ','')],progressiveClues=True,explanation='Les trois personnages appartiennent à '+answer+'.',duration=16)
 def odd(keys,correct,text):
  answers=[{'id':'a'+str(i),'text':images[k]['name'],'image':images[k]['image']}for i,k in enumerate(keys)]
  return dict(base('odd_one_out',text),answers=answers,correctAnswerId='a'+str(keys.index(correct)),explanation=images[correct]['name']+' est l’intrus dans cette sélection.')
 def tf(text,good,explanation):
  return dict(base('true_false',text),answers=[{'id':'a0','text':'Vrai'},{'id':'a1','text':'Faux'}],correctAnswerId='a0' if good else 'a1',explanation=explanation,duration=10)
 def number(text,value,maxi,explanation):return dict(base('number',text),value=value,min=0,max=maxi,step=1,unit='',explanation=explanation)
 def ranking(text,items):return dict(base('ranking',text),criterion='Du plus ancien au plus récent',answers=[{'id':'a'+str(i),'text':t}for i,t in enumerate(items)],explanation='Ordre attendu : '+' → '.join(items)+'.',duration=18)
 series=[
  clues(['yoshi','cappy','toadette'],'Super Mario'),
  clues(['link','zelda','ganondorf'],'The Legend of Zelda'),
  clues(['pichu','togepi','charizard'],'Pokémon'),
  clues(['donkey-kong','diddy-kong','funky-kong'],'Donkey Kong'),
 ]
 intruders=[odd(['yoshi','cappy','link','toadette'],'link','Quel personnage n’appartient pas à l’univers Mario ?'),odd(['pichu','eevee','kirby','togepi'],'kirby','Quelle image ne représente pas un Pokémon ?'),odd(['link','zelda','samus','ganondorf'],'samus','Quel personnage n’appartient pas à l’univers Zelda ?')]
 first=[visual('link','silhouette'),series[0],tf('Samus est le personnage principal de Metroid.',True,'Samus Aran est l’héroïne de la série Metroid.'),visual('yoshi','zoom'),intruders[0],number('Combien de triangles composent la Triforce ?',3,10,'La Triforce est formée de trois triangles.'),visual('pichu','hidden'),series[1],visual('samus','blurred'),ranking('Classe ces consoles selon leur première sortie.', ['Nintendo 64','GameCube','Wii','Switch']),visual('king-boo','silhouette'),series[2],intruders[1],visual('zelda','zoom'),tf('Link et Zelda sont toujours le même personnage.',False,'Link et Zelda sont deux personnages distincts.'),visual('donkey-kong','hidden'),series[3],number('Combien de pierres ancestrales Link doit-il obtenir enfant dans Ocarina of Time ?',3,10,'Il obtient trois pierres ancestrales : la Kokiri, la Goron et la Zora.'),visual('waluigi','silhouette'),intruders[2]]
 transparent=[item for item in CHARACTERS if not item[2].lower().endswith('.jpg') and item[0]!='bowser']
 second=[visual(slug,['silhouette','zoom','hidden','blurred'][i%4])for i,(slug,_,_)in enumerate(transparent[:20])]
 third=[]
 base_by_key={q['catalogKey']:q for q in result['quizzes']}
 selections=[('espace',0),('nombres',0),('devinettes',0),('classements',1),('animaux',1),('nombres',3),('devinettes',5),('classements',5),('corps',0),('capitales',2),('mythologie',4),('emoji-cinema',2)]
 special=[visual('meta-knight','silhouette'),series[0],intruders[1],visual('cappy','hidden'),visual('tom-nook','zoom'),series[2],visual('falco','blurred'),intruders[0]]
 for i in range(20):
  if i%5 in [0,3]:third.append(copy.deepcopy(special.pop(0)))
  else:
   key,j=selections.pop(0);third.append(copy.deepcopy(base_by_key[key]['questions'][j]))
 new=[]
 def quiz(key,title,questions,cat,status='ready',desc=''):
  qid='catalog-'+key
  questions=copy.deepcopy(questions)
  for i,q in enumerate(questions):
   q['id']=f'{qid}-q{i+1}';old=q.get('correctAnswerId');mapping={a['id']:f'{q["id"]}-a{n}' for n,a in enumerate(q.get('answers',[]))}
   for a in q.get('answers',[]):a['id']=mapping[a['id']]
   if old:q['correctAnswerId']=mapping[old]
  q={'id':qid,'catalogKey':key,'visualCollection':True,'status':status,'name':title,'language':'fr','categoryIds':[cat],'difficulty':'moyen','description':desc,'questions':questions,'createdAt':'2026-11-09T18:00:00Z','updatedAt':'2026-11-09T18:00:00Z','editorialOrigin':'Manches visuelles QuizCast · personnages issus de l’archive du dépôt','videoSettings':{'sceneVersion':2,'preset':'show','textStyle':'clean','timingMode':'question','revealDuration':4,'checkpointEvery':5},'videoHook':'Des images, des indices, des surprises. Quel sera ton score ?'}
  color='#15365b' if status=='ready' else '#4d5276'
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><rect width="800" height="450" fill="{color}"/><path d="M600 0L800 180V0" fill="#ffffff0a"/><rect x="55" y="105" width="200" height="215" rx="20" fill="#fff"/><rect x="280" y="105" width="200" height="215" rx="20" fill="#fff"/><rect x="505" y="105" width="200" height="215" rx="20" fill="#fff"/><g fill="#314b72" font-family="sans-serif" font-size="110" font-weight="700"><text x="120" y="255">?</text><text x="345" y="255">?</text><text x="570" y="255">?</text></g><text x="55" y="65" fill="#a4f2d3" font-family="sans-serif" font-size="20" font-weight="700" letter-spacing="3">QUIZCAST / DÉFIS VISUELS</text><text x="55" y="390" fill="#fff" font-family="sans-serif" font-size="24" font-weight="700">{html.escape("À ILLUSTRER · TES CAPTURES" if status=="draft" else "20 MANCHES · FORMATS VARIÉS")}</text></svg>'
  (root/'assets/covers'/f'{key}.svg').write_text(svg);q['thumbnail']='COVER_ROOT/assets/covers/'+key+'.svg';new.append(q)
 quiz('nintendo-remix','Nintendo Remix · 20 manches, formats variés',first,gaming,desc='Silhouettes, trois images, zoom, intrus, vrai/faux, nombres et classement : le format change à chaque manche.')
 quiz('personnages-mysteres','20 personnages · ombre, zoom, cases et flou',second,gaming,desc='Quatre effets visuels alternés. Aucune proposition de réponse : à toi de reconnaître le personnage.')
 quiz('grand-mix-visuel','Le grand mix visuel · 20 défis sans routine',third,gaming,desc='Une compilation qui alterne personnages, indices, intrus, devinettes, culture générale et chiffres.')
 for key,title,entries,cat,subject in [('films-3-captures','20 films · 3 captures pour trouver',FILMS,cinema,'film'),('jeux-3-captures','20 jeux vidéo · 3 captures pour trouver',GAMES,gaming,'jeu vidéo')]:
  questions=[]
  for row in entries:
   answer,briefs,*explanation=row
   q=dict(base('image_clues','Quel '+subject+' relie ces trois images ?'),clues=[{'image':'','brief':brief}for brief in briefs.split(';')],answerText=answer,acceptedAnswers=[],progressiveClues=True,duration=16,explanation=explanation[0] if explanation else 'Les trois captures doivent provenir de '+answer+'.')
   questions.append(q)
  quiz(key,title,questions,cat,status='draft',desc='Storyboard de 20 manches à illustrer avec tes propres captures ou affiches. Les réponses et les plans suggérés sont déjà préparés ; importe les trois images dans chaque question.')
 result['quizzes']=new+result['quizzes']
 result['mediaProvenance']={'characters':'Fichiers extraits sans modification de Characters Silhouette.zip, déjà fourni dans le dépôt. Les droits de diffusion restent à vérifier par le créateur.','storyboards':'Aucune capture de film ou de jeu téléchargée. Les champs d’image des deux storyboards sont volontairement vides.'}
 result['editorialNote']='39 quiz / storyboards : 37 jouables (600 questions) et 2 storyboards à illustrer (40 questions). Les trois collections visuelles jouables ajoutent 60 manches ; certaines réutilisent des questions du catalogue.'
 return result

# Twbz
TEST:
- Caricamento articolo dlib
  - http://www.dlib.org/dlib/november14/beel/11beel.html
  - http://www.dlib.org/dlib/november14/brook/11brook.html
  - http://www.dlib.org/dlib/november14/fedoryszak/11fedoryszak.html
  - http://www.dlib.org/dlib/november14/giannakopoulos/11giannakopoulos.html
  - http://www.dlib.org/dlib/november14/holub/11holub.html
  - http://www.dlib.org/dlib/november14/jahja/11jahja.html
  - http://www.dlib.org/dlib/november14/klampfl/11klampfl.html
  - http://www.dlib.org/dlib/november14/knoth/11knoth.html
  - http://www.dlib.org/dlib/november14/kristianto/11kristianto.html
  - http://www.dlib.org/dlib/november14/kroell/11kroell.html
  - http://www.dlib.org/dlib/november14/smith-unna/11smith-unna.html
  - http://www.dlib.org/dlib/november14/tkaczyk/11tkaczyk.html
  - http://www.dlib.org/dlib/november14/voelske/11voelske.html
- Caricamento articolo statistica
  - http://rivista-statistica.unibo.it/article/view/4594
  - http://rivista-statistica.unibo.it/article/view/4595
  - http://rivista-statistica.unibo.it/article/view/4597
  - http://rivista-statistica.unibo.it/article/view/4598
  - http://rivista-statistica.unibo.it/article/view/4599
  - http://rivista-statistica.unibo.it/article/view/4600
  - http://rivista-statistica.unibo.it/article/view/4601
- Scegliere due ISSUE di due RIVISTE diverse da 
  - http://journals.unibo.it/riviste/
- Scegliere una ISSUE a scelta
  - http://www.dlib.org
- Parser
- Switch Tab
- Creazione annotazione (Selezione e non)
- Titolo, DOI, URL, Autori, Comment, DenotaRethorica, Cites, Publication Year
- Mobile & Browser
- Salvataggio
- Elimina (singolo e tutte)
- ShowAnnotation
- Modifica
- Document Data

TODO:

- [x] Controllo su documento già aperto (magari rendere più graziose le tab)
- [x] Funzione Javascript che prende inizio e fine degli span creati dal parser per associare l'annotazione (Node, Anchor, Focus)
- [x] Fixare SearchBar Mobile, Gruppi (checkbox) e grandezza table (max-width non funge) nel main (python manage.py runserver ip:8000 per potersi collegare dal cellulare)
- [x] Richiedere grafo
- [x] Button per forzare lo scraping

- [x] Annotazioni (Client-Side) (Read annotazioni dal 3Store)
- [x] Annotazioni (Server-Side) (Add/Modify annotazioni dal 3Store)
- [x] Sostituire gli URL con i Titoli nella lista-doc
- [ ] Parser Funzioni Retoriche
- [x] Gestire modale relativa allo span (Nostre(utente/parser))
- [x] Gestire modale relativa allo span (Query)
- [x] Gestire Document-Data quando apri un documento già annotato e quindi fa solo la query
- [x] Quando inserisco un URL controllo se è già presente nella lista, se si fa la query, sennò parte il parser
- [ ] Fixare sidebar in Mobile
- [x] Il parser non funge con diversi link dlib 2016



OPZIONALE:
- [x] Fixare area metaDati (in PublicationYear ci vuole solo l'anno) (togliamo tutto?)
- [x] Parser Generale
- [x] Modificare creazione tab in modo da poterne aprire diversi durante il parsing

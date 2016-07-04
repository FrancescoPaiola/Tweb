/*  
  author: Daniele Ferrari
  description:
    funzione che apre la modale per la creazione delle annotazioni
*/
function createAnnotation() {
  var selObj = document.getSelection();
  range = document.createRange();
  prefixString = annotation[$('.card-panel:visible').attr('id').substr(-1)].prefixString
  console.log(prefixString)
  // se non vi è alcuna selezione viene aperta la modale di creazione annotazione su documento
  if (selObj.isCollapsed) {
    openDocumentModal();
  } else {
    $('#createAnnotation').openModal({dismissible: false}); // apre la modale per creare l'annotazione 

    range = selObj.getRangeAt(0);
    nodeSelection = range.commonAncestorContainer;
    
    $(selectedText).html(selObj.toString()); // riempie la modale con il testo selezionato

    nodeSelection = nodeSelectionValid(nodeSelection);
    id = createPathString(nodeSelection, prefixString);
    
    nTab = $("#main-tabs > li > a.active").attr("href").charAt(5); // trovo l'indice del documento in cui faccio la selezione rispetto alla lista di documenti aperti
  }
  return true;
}


/* 
  author: Daniele Ferrari
  description:
    Questa funzione crea il JSON relativo all'annotazione appena confermata dall'utente
    e la salva in un array globale
  parameters:
    subject: è il soggetto dell'annotazione 
          (document || fragment)
    type: è il tipo di annotazione 
          (hasAuthor || hasPubblicationYear || hasTitle || hasDOI || hasURL
            || hasComment || denotesRhetorical || cites)
    selected: 
      true, se è stato selezionato un frammento di testo
      false, altrimenti
    input:
      contenuto della selezione o dato/i inserito da utente
      type="hasAuthor" ||
      type="hasPubblicationYear" ||
      type="hasTitle" ||
      type="hasDOI" ||
      type="hasURL"
      -> input = testo selezionato || input utente
      type="hasComment" -> input = input utente
      type="denotsRethorical" -> input = scelta retorica
    citedData: dizionario contenente i dati del documento citato
              solo se type="cites"
*/
function saveAnnotation(subject, type, selected, input, citedData) {
  var startEnd; // inizio e fine della selezione, se presente
  var data = {};
  var source =  annotation[$('.card-panel:visible').attr('id').substr(-1)].url // indirizzo del documento 
  console.log("source")
  console.log(source)
  var title = $("#document-info span.label-data-value.data-title").text();  // titolo del documento

  // se esiste una selezione, prendo il suo inizio e la sua fine
  if (selected) startEnd = createStartEnd(nodeSelection, range);

  data.list = [];                                               // il vettore di annotazioni sul frammento selezionato
  data.list[0] = {};                                            // dati su tipo e soggetto dell'annotazione
  
  data.list[0].type = type;                                     // tipo dell'annotazione
  data.list[0].label = getAnnotationLabel(type).toLowerCase();  // tipo dell'annotazione in formato "leggibile"
  data.list[0].body = {};

  if (type == "cites")
    input = citedData.URL;

  data.list[0].body.label = getResourceLabel(type, input);             // breve descrizione dell'annotazione 
  data.list[0].body.predicate = getPredicate(type);             // predicato della tripla rdf

  switch (type) {

    case "hasAuthor": {
      data.list[0].body.subject = source;  // indirizzo sorgente documento
      data.list[0].body.resource = {};
      data.list[0].body.resource.id = rdfPerson(input);  // nome e cognome autore standardizzato
      data.list[0].body.resource.label = input;           // nome e cognome esteso dell'autore (testo selezionato o input utente) 
      break;
    }

    case "hasPublicationYear": {
      data.list[0].body.subject = source;
      data.list[0].body.literal = input;
      break;
    }

    case "hasTitle": {
      data.list[0].body.subject = source;
      data.list[0].body.literal = input;
      break;
    }

    case "hasDOI": {
      data.list[0].body.subject = source + "_ver1";  // copia del documento
      data.list[0].body.literal = input;
      break;
    }

    case "hasURL": {
      data.list[0].body.subject = source + "_ver1";  // copia del documento
      data.list[0].body.literal = input;
      break;
    }

    case "hasComment": {
      data.list[0].body.subject = source + "_ver1#" + id + "-" + startEnd[0] + "-" + startEnd[1]; // copia del documento + id, inizio e fine dela selezione
      data.list[0].body.literal = input;
      break;
    }

    case "denotesRhetoric": {
      data.list[0].body.subject = source + "_ver1#" + id + "-" + startEnd[0] + "-" + startEnd[1]; // copia del documento + id, inizio e fine dela selezione
      data.list[0].body.resource = getRhetType(input);
      break;
    }

    case "cites": {
      data.list[0].body.subject = source + "_ver1#" + id + "-" + startEnd[0] + "-" + startEnd[1]; // copia del documento + id, inizio e fine dela selezione
      
      // citations sarà un dizionario con chiavi gli URL dei documenti aperti
      // e valore dei dizionari con chiave l'URL del documento citato
      // e valore il numero di volte che viene citato nel documento relativo
      
      if (citations[source] == undefined) 
        citations[source] = {} 

      if (citations[source][citedData.URL] != undefined)
        citations[source][citedData.URL]++;
      else
        citations[source][citedData.URL] = 1

      data.list[0].body.object = citedData.URL + "_ver1" + "_citated" + citations[source][citedData.URL]; // work dell'articolo citato

      var i = 1;
     
      data.list[i] = {};
      data.list[i].type = "hasURL";
      data.list[i].label = "url";
      data.list[i].body = {};
      data.list[i].body.subject = citedData.URL + "_ver1";
      data.list[i].body.predicate = getPredicate("hasURL");
      data.list[i].body.literal = citedData.URL;
      data.list[i].body.label = getResourceLabel("hasURL", citedData.URL)

      if (citedData.author != "") {
        i++;
        data.list[i] = {};
        
        data.list[i].type = "hasAuthor";
        data.list[i].label = "author";
        data.list[i].body = {};
        data.list[i].body.subject = citedData.URL;
        data.list[i].body.resource = {};
        data.list[i].body.predicate = getPredicate("hasAuthor");
        data.list[i].body.resource.id = rdfPerson(citedData.author);
        data.list[i].body.resource.label = citedData.author;  
        data.list[i].body.label = getResourceLabel("hasAuthor", citedData.author);
      }
      if (citedData.year != "") {
        i++;
        data.list[i] = {};

        data.list[i].type = "hasPublicationYear";
        data.list[i].label = "publication year";
        data.list[i].body = {};
        data.list[i].body.subject = citedData.URL;
        data.list[i].body.predicate = getPredicate("hasPublicationYear");
        data.list[i].body.literal = citedData.year;
        data.list[i].body.label = getResourceLabel("hasPublicationYear", citedData.year);
      }

      if (citedData.DOI != "") {
        i++;
        data.list[i] = {};

        data.list[i].type = "hasDOI";
        data.list[i].label = "doi";
        data.list[i].body = {};
        data.list[i].body.subject = citedData.URL + "_ver1";  // copia del documento
        data.list[i].body.predicate = getPredicate("hasDOI");
        data.list[i].body.literal = citedData.DOI;
        data.list[i].body.label = getResourceLabel("hasDOI", citedData.DOI);
      }

      if (citedData.title != "") {
        i++;
        data.list[i] = {};

        data.list[i].type = "hasTitle";
        data.list[i].label = "title";
        data.list[i].body = {};
        data.list[i].body.subject = citedData.URL;
        data.list[i].body.predicate = getPredicate("hasTitle");
        data.list[i].body.literal = citedData.title;
        data.list[i].body.label = getResourceLabel("hasTitle", citedData.title);
      }

      for (j = 0; j <= i; j++) {
        data.list[j].target = {};

        data.list[j].target.source = citedData.URL;
        data.list[j].target.id = null;
        data.list[j].target.start = null;
        data.list[j].target.end = null;

        data.list[j].provenance = {};
        data.list[j].provenance.author = {};
        data.list[j].provenance.author.name = provenance[0];
        data.list[j].provenance.author.email = provenance[1];
        data.list[j].provenance.time = timeStamp();
      }

      break;
    }
    default: {
        console.log("Something goes wrong with saveAnnotation()");
        return error;
    }

  }
  
  data.list[0].target = {};

  data.list[0].target.source = source;
  
  if (selected) {
    data.list[0].target.id = id;
    data.list[0].target.start = startEnd[0];
    data.list[0].target.end = startEnd[1];
  } else {
    data.list[0].target.id = null;
    data.list[0].target.start = null;
    data.list[0].target.end = null;
  }

  data.list[0].provenance = {};
  data.list[0].provenance.author = {};
  data.list[0].provenance.author.name = provenance[0];
  data.list[0].provenance.author.email = provenance[1];
  data.list[0].provenance.time = timeStamp();

  modalReset(type)
  spanColor(type);
  index = annotation[$('.card-panel:visible').attr('id').substr(-1)]['annotations'].length;

  annotation[$('.card-panel:visible').attr('id').substr(-1)]['annotations'][index] = data; // inserisco la nuova annotazione nell'array delle annotazioni utente
}


/*
  author: Federico Govoni
  Restituisce il timeStamp al momento della creazione dell'annotazione, secondo le specifiche:
  "YYYY-MM-DDTHH:MM": per chi non avesse ben chiaro il formato:
  - YYYY: 4 cifre corrispondenti all'anno
  - MM: 2 cifre corrispondenti al mese
  - DD: 2 cifre corrispondenti al giorno
  - T: separatore tra data e ora
  - HH: 2 cifre corrispondenti alle ore
  - MM: 2 cifre corrispondenti ai minuti
*/
function timeStamp() {
  var time = new Date();

  year = time.getFullYear();
  month = time.getMonth() + 1;   //getMonth() -> Jan = 0, Dec = 11
  day = time.getDate();
  hour = time.getHours();
  minutes = time.getMinutes();

  if (minutes < 10)
    minutes = "0" + minutes;
  if (month < 10)
    month = "0" + month;
  if (day < 10)
    day = "0" + day;
  if(minutes < 10)
    minutes = "0" + minutes
  if(hour < 10)
    hour = "0" + hour
  
  time = year + "-" + month + "-" + day + "T" + hour + ":" + minutes;
  return(time);
}


/*
  author: Federico Govoni
  Converte il timeStamp da specifiche in una versione human-readable
  2016-01-20T13:50:10  -->  20 January 2016 at 13:50:10
*/
function timeStampToHuman(timestamp) {
  var year = timestamp.substr(0,4)
  var month = timestamp.substr(5,2)
  var day = timestamp.substr(8,2)
  var time = timestamp.substr(11,8)
  var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

  string = day + " " + monthNames[month - 1] + " " + year + " at " + time
  return string
}

/*
  author: Daniele Ferrari
  description:
    prende una strina di testo e la formatta utilizzando
    solo caratteri ASCII
*/
function convertToASCII (string) {
  string.toLowerCase();

  string.replace("à", "a");
  string.replace("á", "a");
  string.replace("â", "a");
  string.replace("ã", "a");
  string.replace("ä", "a");
  string.replace("å", "a");
  string.replace("ă", "a");
  string.replace("ā", "a");

  string.replace("æ", "e");
  string.replace("è", "e");
  string.replace("é", "e");
  string.replace("ê", "e");
  string.replace("ë", "e");

  string.replace("ì", "i");
  string.replace("í", "i");
  string.replace("î", "i");
  string.replace("ï", "i");

  string.replace("ò", "o");
  string.replace("ó", "o");
  string.replace("ö", "o");

  string.replace("ù", "u");
  string.replace("ú", "u");
  string.replace("û", "u");
  string.replace("ü", "u");

  string.replace("ÿ", "y");
  string.replace("ý", "y");

  string.replace(".", "");
  string.replace(",", "");
  string.replace(";", "");
  
  return (string);
}


/*
  author: Daniele Ferrari
  description:
    prende il nome completo di una autore e lo formatta
    secondo lo standard delle specifiche
    Esempio:
      "John Brown Junior" diventa j-brownjunior
      "Mario Bianchi Rossi Verdi" diventa m-rossiverdi
*/
function rdfPerson(fullname) {
  var nameInit = fullname.charAt(0); // prendo l'iniziale del nome
  var surname = fullname.substr(fullname.indexOf(" "));

  var firstSurname = "";
  var secondSurname = "";

  // primo, secondo e terzo spazio nel cognome
  var first = 0, second = 0, third = 0;

  // ciclo per individuare gli ultimi due spazi nel cognome
  do {
    second = surname.indexOf(" ", first + 1);
    if (second == -1) {
      firstSurname = surname.substr(first + 1);
    } else {
      third = surname.indexOf(" ", second + 1);
      if (third == -1) {
        secondSurname = surname.substr(second + 1);
        firstSurname = surname.substr(first + 1, second - first - 1);
      } else {
        first = second;
      }
    }
  } while (firstSurname == "");
  
  return ((nameInit + "-" + firstSurname + secondSurname)).toLowerCase();
}


/*
  author: Daniele Ferrari
  description:
    funzione che restituisce il campo "label" da inserire nel JSON
*/
function getAnnotationLabel(type) {
  switch (type) {
    case "hasAuthor": return ("Author");
    case "hasPublicationYear": return ("Publication Year");
    case "hasTitle": return ("Title");
    case "hasDOI": return ("DOI");
    case "hasURL": return ("URL");
    case "hasComment": return ("Comment");
     case "denotesRethoric":
    case "denotesRhetoric": return ("Rhetorica");
    case "cites": return ("Citation");
    default: {
        console.log("Something goes wrong with getAnnotationLabel()");
        return error;
      }
  }
}


/*
  author: Daniele Ferrari
  description:
    funzione che restituisce il campo "predicate" da inserire nel JSON
    le variabili dcterms, fabio, prism, schema e cito sono le stringhe dei prefissi
*/
function getPredicate(type) {
  switch (type) {
    case "hasAuthor": return (dcterms + "creator");
    case "hasPublicationYear": return (fabio + type);
    case "hasTitle": return (dcterms + "title");
    case "hasDOI": return (prism + "doi");
    case "hasURL": return (fabio + type);
    case "hasComment": return (schema + "comment");
    case "denotesRethoric": // errore grammaticale di altri gruppigi 
    case "denotesRhetoric": return (sem + "denotes");
    case "cites": return (cito + type);
    default: {
        console.log("Something goes wrong with getPredicate()");
        return error;
      }
  }
}


/*
  author: Daniele Ferrari
  description:
    funzione che restituisce il campo "label" del body delle annotazioni su risorsa
*/
function getResourceLabel(type, input) {
  switch (type) {
    case "hasAuthor": return (input + " is an author of the document");
    case "hasPublicationYear": return ("The document was published in " + input);
    case "hasTitle": return ("The document's title is " + input);
    case "hasDOI": return ("The document's DOI is " + input);
    case "hasURL": return ("The document's URL is " + input);
    case "hasComment": return ("This is the fragment comment: " + input);
    case "denotesRhetoric": return ("This fragment has got a rhetorical function"); // da sistemare
    case "cites": return ("This document cites " + input + ".")
    default: {
        console.log("Something goes wrong with getResourceLabel()");
        return error;
      }
  }
}


/*
  author: Daniele Ferrari
  description:
    funzione che restituisce il tipo di funzione retorica selezionato in formato rdf
*/
function getRhetType(type) {
    switch (type) {
      case "abstract": return (sro + "Abstract");
      case "introduction": return (deo + "Introduction");
      case "materials": return (deo + "Materials");
      case "methods": return (deo + "Methods");
      case "results": return (deo + "Results");
      case "discussion": return (sro + "Discussion");
      case "conclusion": return (sro + "Conclusion");
      default: {
        console.log("Something goes wrong with getRhetType()");
        return error;
      }
    }
}

/*
  author: Federico Govoni
  description:
    a seconda del predicato mi restituisce un type
*/
function getLabelRhetType(type){
  switch(type){
    case "sro:Abstract": 
    case "http://salt.semanticauthoring.org/ontologies/sro#Abstract": 
      return ("Abstract");
    case "deo:Materials": 
      return ("Materials");
    case "deo:Introduction":
    case "http://purl.org/spar/deo/Introduction":
      return ("Introduction");
    case "deo:Results": 
      return ("Results");
    case "deo:Methods": 
      return ("Methods");
    case "sro:Discussion": 
      return ("Discussion");
    case "sro:Conclusion": 
    case "http://salt.semanticauthoring.org/ontologies/sro#Conclusion":
      return ("Conclusion");
    default: {
      return type
    }
  }
}


/*
  author: Daniele Ferrari
  description:
    in base a chi chiama questa funzione, viene fatto
    un controllo sui dati inseriti o selezionati.
    Se il controllo passa senza errori, viene 
    chiamata saveAnnotation().

*/
function checkInput(subject, type) {
  var correct = true;
  var selected;
  var input;
  var citedData = {};
    
  if (subject == "document") {

    if ($('#selectedTextArea').attr('class') == 'hide') {
      // nessuna selezione di testo
      input = $('#docInput').val();
      selected = false;

      if (input == "") {
        Materialize.toast("insert something", 2000);
        return false;
      }
    } else {
      // testo selezionato
      input = $('#selectedText').html();
      selected = true;
    }

    switch (type) {
      case "hasAuthor":
        correct = checkAuthor(input)
        break
      case "hasPublicationYear":
        correct = checkYear(input);
        break;
      case "hasTitle":
        correct = true;
        break;
      case "hasURL":
        correct = checkURL(input);
        break;
      case "hasDOI":
        correct = checkDOI(input);
        break;

    }
  } else if (subject == "fragment") {
    if ($('#selectedTextArea').attr('class') == 'hide')
      return false;
    else
      selected = true;

    switch (type) {
      case "hasComment": {
        input = $('#inputComment').val();
        correct = checkComment(input);
        break;
      }
      case "denotesRhetoric": {
        input = $('input[name="rhetoricalChoice"]:checked').val()
        correct = checkRhetorical(input);
        break;
      }
      case "cites": {
        citedData.author = parseInput($("#inputCitedAuthor").val());
        citedData.year = $("#inputCitedYear").val();
        citedData.title = parseInput($("#inputCitedTitle").val());  
        citedData.DOI = $("#inputCitedDOI").val();
       
        input = citedData.URL = parseInput($("#inputCitedURL").val());

        
        correct = checkCitation(citedData);

        break;
      }
    }
  }
  if (correct == true)
    saveAnnotation(subject, type, selected, parseInput(input), citedData);
}


/* 
  author: Daniele Ferrari
  description:
    toglie tutti gli a capo e gli spazi multipli in string
*/
function parseInput(string) {
  if ((string != undefined) && (string != "")) {
    string = string.replace(/\n/g, " ");
    string = string.replace(/(\s)+/g, " ");
  }
  return string;
}
/*
  author: Daniele Ferrari
  description:
    controlla se il testo passato come parametro
    è ammissibile come autore
*/
function checkAuthor(fullname) {
  var i = 0;

  do {
    c = fullname.charAt(i);
    if (c != c.toUpperCase()) {
      Materialize.toast("select a valid author", 2000);
      return false;
    }
    else {
      i = fullname.indexOf(" ", i+1) + 1;
    }
  } while (i != 0) // (i=indexOf(" ")+1)=0 quando non trova più spazio

  return true;
}


/*
  author: Daniele Ferrari
  description:
    controlla se il testo passato come parametro
    è un anno ammissibile
    1950 < year < currentYear
*/
function checkYear(year) {
  // var minYear = 1950;
  // var maxYear = new Date().getFullYear(); // anno corrente

  // if ( isNaN(year) || (year < minYear) || (year > maxYear) ) {
  //   Materialize.toast('select a valid year', 2000);
  //   return false;
  // } else
    return true;
}


/*
  author: Daniele Ferrari
  description:
    controlla se il testo passato come parametro 
    è un URL valido
*/
function checkURL(inputURL) {
  // var pattern = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
    
  // if ( !(pattern.test(inputURL)) ) {
  //   Materialize.toast('select a valid URL', 2000);
  //   return false;
  // } else
    return true;
}


/*
  author: Daniele Ferrari
  description:
    controlla se il testo selezionato è un DOI
*/
function checkDOI(inputDOI) {
  // var pattern = new RegExp('\b(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?!["&\'<>])\S)+)\b');

  // if ( !(pattern.test(inputDOI)) ) {
  //   Materialize.toast('select a valid DOI', 2000);
  //   return false;
  // } else
    return true;
}


/*
  author: Daniele Ferrari
  description:
    controlla se il commento inserito è vuoto o no
*/
function checkComment(inputComment) {
  if (inputComment == "") {
    Materialize.toast("insert a comment", 2000);
    return false;
  } else
    return true;
}


/*
  author: Daniele Ferrari
  description:
    controlla se è stata seleziona una funzione retorica
*/
function checkRhetorical(choice) {
  if (choice == undefined) {
    Materialize.toast("select a choice", 2000);
    return false;
  } else
    return true;
}


/*
  author: Daniele Ferrari
  description:
    controlla se è i dati inseriti nella citazione
    sono validi oppure no
*/
function checkCitation(citedData) {
  var correct = true;
  
  if (citedData.URL == ""){
    Materialize.toast("insert the cited document URL", 2000);
    return false;
  } else {
    correct = checkURL(citedData.URL)
  }

  if (citedData.author != "")
    correct = correct && checkAuthor(citedData.author);
 
  if (citedData.year != "")
    correct = correct && checkYear(citedData.year);
  
  if (citedData.DOI != "")
    correct = correct && checkDOI(citedData.DOI);
  return(correct);
}
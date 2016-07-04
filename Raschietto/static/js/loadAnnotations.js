var endpointURL = "http://tweb2015.cs.unibo.it:8080/data/";
var prefix = "PREFIX :  <http://vitali.web.cs.unibo.it/raschietto/graph/>\
		PREFIX dcterms:     <http://purl.org/dc/terms/>\
		PREFIX fabio:       <http://purl.org/spar/fabio/>\
		PREFIX frbr:        <http://purl.org/vocab/frbr/core#>\
		PREFIX foaf:        <http://xmlns.com/foaf/0.1/>\
		PREFIX oa:          <http://www.w3.org/ns/oa#>\
		PREFIX xml:         <http://www.w3.org/XML/1998/namespace>\
		PREFIX skos:        <http://www.w3.org/2004/02/skos/core#>\
		PREFIX application: <http://purl.org/NET/mediatypes/application/>\
		PREFIX sem:         <http://www.ontologydesignpatterns.org/cp/owl/semiotics.owl#>\
		PREFIX rdf:         <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
		PREFIX rdfs:        <http://www.w3.org/2000/01/rdf-schema#>\
		PREFIX xsd:         <http://www.w3.org/2001/XMLSchema#string>\
		PREFIX text:        <http://purl.org/NET/mediatypes/text/>\
		PREFIX prism:       <http://prismstandard.org/namespaces/basic/2.0/>\
		PREFIX raschp:      <http://vitali.web.cs.unibo.it/raschietto/person>\
		PREFIX au:          <http://description.org/schema/>\
		PREFIX schema:      <http://schema.org/>\
		PREFIX rasch:       <http://vitali.web.cs.unibo.it/raschietto/>";
var indexDictAnnotation = 0;  // mi serve per indicizzare le annotazioni

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
queryAnnotation prende come parametro l'url del documento su cui fare la query e un array che contiene la lista
dei grafi che hanno fatto annotazioni sul documento..
Fa una richiesta AJAX all'endpoint e in caso di successo gestisce il json chiamando handleQueryAnnotation.
-------------------------------------------------------------------------------------------------------------- */
function queryAnnotation(url, arrayGroup) {
	$(".nGroups").html(arrayGroup.length) //modifica il badge contenente il numero di grafi attivi

	for (var i=0; i < arrayGroup.length; i++){
		var query = prefix + "SELECT ?typeAnnotation ?label ?dateAnnotation ?nameAnnotation ?userAnnotation ?labelO ?labelA ?idAnnotation ?targetAnnotation ?startAnnotation ?endAnnotation ?objectAnnotation ?predicate ?subject\
	                WHERE {\
	                		GRAPH <http://vitali.web.cs.unibo.it/raschietto/graph/"+ arrayGroup[i] +">{\
								        ?annotation \
									        a oa:Annotation ;\
									        oa:hasTarget ?target ;\
									        oa:hasBody ?body .\
									      \
									      OPTIONAL { ?annotation \
									        oa:annotatedBy ?userAnnotation .\
									      }\
									      OPTIONAL { ?annotation \
									      	oa:annotatedAt ?dateAnnotation .\
									      }\
									       OPTIONAL { ?annotation \
									        rasch:type ?typeAnnotation. \
									      }\
									      \
									      ?annotation rdfs:label ?label .\
								        \
								        ?target\
									        a oa:SpecificResource ;\
									        oa:hasSource <" + url + "> ;\
									        oa:hasSelector ?fragment.\
									      \
								        ?fragment\
									        a oa:FragmentSelector ;\
									        rdf:value ?targetAnnotation ;\
									        oa:start ?startAnnotation ;\
									        oa:end ?endAnnotation .\
									      \
								        ?body\
									        a rdf:Statement ;\
									        rdf:subject ?subject ;\
									        rdf:predicate ?predicate ;\
									        rdf:object ?objectAnnotation .\
									      \
									      OPTIONAL {?userAnnotation \
									      	foaf:name ?nameAnnotation. }\
									      \
									      OPTIONAL { \
									      	?objectAnnotation\
									        	a skos:Concept;\
									        	rdf:subject ?subjectO ;\
									        	rdfs:label ?labelO.\
									      }\
									      OPTIONAL { \
									      	?objectAnnotation\
									        	a foaf:Person;\
									        	rdf:subject ?subjectA ;\
									        	rdfs:label ?labelA.\
									      }\
								      }\
						      }";					
		var graph = arrayGroup[i]

		var queryURL = endpointURL + "?query=" + encodeURIComponent(query) + "&format=" + "json";

		$.ajax({
			      url: queryURL,
			      dataType: 'jsonp',
			      grafo: graph,
			      success: function(data){
			      	handleQueryAnnotation(data.results.bindings, url, this.grafo);
			      },
			      error: function(){
			      	Materialize.toast('Error during annotations loading', 4000)
			      	console.log("Errore in queryAnnotation")
			      }
			 	});
	}
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
groupsActived viene invocata quando apro un documento,prende come parametro l'url del documento.
La query mi restituisce i grafi che hanno fatto annotazioni su quel documento. In caso di successo chiamo queryAnnotation
e abilito le checkbox dei gruppi relativi ai grafi. 
-------------------------------------------------------------------------------------------------------------- */
function groupsActived(url){
	indexDictAnnotation = 0;
	var arrayGroup = [];
	var query = prefix + "SELECT DISTINCT ?group \
    						WHERE  {\
             			GRAPH ?group { \
             				?annotation a oa:Annotation;\
      								oa:hasTarget ?target.\
    								?target a oa:SpecificResource;\
      								oa:hasSource <"+ url +">. }\
								}"; 

	var queryURL = endpointURL + "?query=" + encodeURIComponent(query) + "&format=" + "json";

	$.ajax({
		      url: queryURL,
		      dataType: 'jsonp',
		      success: function(data){
						var groups = data.results.bindings;
						for (var i = 0; i < groups.length; i++) {
							string = groups[i].group.value      //l'url del grafo
							numberGroup = string.slice(-7);			//ltw15xx
							$("." + numberGroup).removeAttr('disabled').prop('checked', true);
							arrayGroup.push(numberGroup);
						}
						queryAnnotation(url, arrayGroup)
					}	,
					error: function(){
						Materialize.toast('Error during groups loading', 4000)
		      			console.log("Errore in groupsActived")
					}
		 	});
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
handleQueryAnnotation riceve come parametro un json contenente le annotazioni. Itero il json e inserisco i
valori in un dizionario. Ad ogni iterazione chiamo createSpanOtherAnnotation.
-------------------------------------------------------------------------------------------------------------- */
function handleQueryAnnotation(data, url, grafo){
	Materialize.toast(data.length + " annotations by " + idToNameGroup(grafo), 4000)

	for(var i = 0; i < data.length; i++){ //itero tutte le annotazioni
		var dictAnnotation = {
													index: '',
													date: '',
													user: '',
													name_user: '',
													type: '',
													target: '',
													start: '',
													end: '',
													object: '',
													graph: '',
													subject: '',
													labelO: '',
													labelA: '',
													predicate: ''
												}
		dictAnnotation.index   = indexDictAnnotation++;
				
			dictAnnotation.graph = grafo;

			if (data[i].dateAnnotation) {
				dictAnnotation.date    = (data[i].dateAnnotation.value);
			}

			if (data[i].userAnnotation) {
				dictAnnotation.user    = (data[i].userAnnotation.value);
			}

			if (data[i].nameAnnotation) {
				dictAnnotation.name_user    = (data[i].nameAnnotation.value);
			}

			if (data[i].predicate) {
				dictAnnotation.predicate    = (data[i].predicate.value); 
			}

			if (data[i].objectAnnotation){
				dictAnnotation.object  = (data[i].objectAnnotation.value);
			}

			if (data[i].subject){
				dictAnnotation.subject  = (data[i].subject.value);
			}
			
			if (data[i].targetAnnotation){
	    	dictAnnotation.target  = data[i].targetAnnotation.value;
	 		}

	 		if (data[i].labelO){
	    	dictAnnotation.labelO  = data[i].labelO.value;
	 		}

	 		if (data[i].labelA){
	    	dictAnnotation.labelA  = data[i].labelA.value;
	 		}
	    
			if ((data[i].startAnnotation) && (data[i].endAnnotation)){
				dictAnnotation.start = (data[i].startAnnotation.value);
				dictAnnotation.end   = (data[i].endAnnotation.value);
			}		

			dictAnnotation.type = predicateToType(dictAnnotation.predicate)
			
			createSpanOtherAnnotation(dictAnnotation, url);
			documentData(dictAnnotation)		
	}
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
documentData() controllo se il subject dell'annotazione è di tipo frammento o documento, se è documento
e a seconda del tipo di annotazione riempe la tabella della modal
-------------------------------------------------------------------------------------------------------------- */
function documentData(dictAnnotation){
	//faccio il controllo sul subject, se è del tipo url#target-start-end si riferisce al frammento
	if((dictAnnotation.subject).indexOf("#") == -1){
		var tr = "\
				<tr> \
					<td>" + dictAnnotation.object + "</td> \
					<td><a href='" + dictAnnotation.user + "'>" + dictAnnotation.name_user + "</a></td> \
					<td>" + timeStampToHuman(dictAnnotation.date) + "</td> \
				</tr>"
		var trAuthor = "\
				<tr> \
					<td>" + dictAnnotation.labelA + "</td> \
					<td><a href='" + dictAnnotation.user + "'>" + dictAnnotation.name_user + "</a></td> \
					<td>" + timeStampToHuman(dictAnnotation.date) + "</td> \
				</tr>"


		if(dictAnnotation.type == "hasTitle"){
			$("#annotationDocument-Title").append(tr)
			$("#main-tabs a.active").html(dictAnnotation.object)
		}

		if(dictAnnotation.type == "hasDOI"){
			$("#annotationDocument-DOI").append(tr)
		}
		
		if(dictAnnotation.type == "hasURL"){
			$("#annotationDocument-URL").append(tr)
		}
		
		if(dictAnnotation.type == "hasPublicationYear"){
			$("#annotationDocument-Year").append(tr)
		}
		
		// In teoria dentro labelA ho il nome "umano" dell'autore, non tutti l'hanno inserito, se non è presente mostro il contenuto dello span
		if(dictAnnotation.type == "hasAuthor"){
			if(dictAnnotation.labelA)
				$("#annotationDocument-Author").append(trAuthor)
			else
				$("#annotationDocument-Author").append(tr)

		}	
	}
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
clearDocumentDataModal() pulisce la modale dei DocumentData
-------------------------------------------------------------------------------------------------------------- */
function clearDocumentDataModal(){
	$("#annotationDocument-DOI").children().remove()
	$("#annotationDocument-URL").children().remove()
	$("#annotationDocument-Author").children().remove()
	$("#annotationDocument-Title").children().remove()
	$("#annotationDocument-Year").children().remove()
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
createSpanOtherAnnotation riceve come parametro un dizionario contenente le informazioni relative ad un annotazione.
Richiamo fixTarget in modo da avere un target corretto da specifiche. Successivamente passo ad xPathToElement
il dizionario e il target corretto.
-------------------------------------------------------------------------------------------------------------- */
function createSpanOtherAnnotation(annotation, url){
	var target = fixTarget(annotation.target, url)
	xPathToElement(annotation, target)	
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
fixTarget riceve un target "grezzo" e in base a come è fatto lo fixa. Se contiene un '_' presumo sia da specifiche
e lo converto in XPath tramite targetToXPath. Fuori dall'if ho un XPath e faccio diversi replace in modo da ottenere
un percorso relativo al documento perchè molti gruppi hanno inserito percorsi assoluti dall'html/body. Bravi loro. 
-------------------------------------------------------------------------------------------------------------- */
function fixTarget(target, url){
	if(target.indexOf('_') > -1){
		target = target.toLowerCase();
		if (tagWithNumber(target)){ 
			target = targetToXPath(target);
		}
	} 
	if(url.indexOf('dlib') > -1){
		target = target.replace('table/tbody/tr/td[2]', '');
	  target = target.replace('form/table3/tr/td/table5/tr/td/table/tr/td2', '');
	  target = target.replace('form/table3/tr/td/table5/tr/td/table1/tr/td2', ''); 
	  target = target.replace('form/table[3]/tr/td/table[5]/tr/td/tr[1]/td[2]', '');
	  target = target.replace('form/table3/tr/td/table5/tr1/td1/table1/tr1/td2', '');
	  target = target.replace('form/table[3]/tr/td/table[5]/tr/td/table/tr/td[2]', '');
	  target = target.replace('form1/table3/tr1/td1/table5/tr1/td1/table1/tr1/td2', '');
	  target = target.replace('form/table[3]/tr/td/table[5]/tr/td/table[1]/tr/td[2]', '');
	  target = target.replace('form/table3/tr/td/table5/tr/td/table1/tr/td2/table2/tr/td2', '');
	  target = target.replace('form/table[3]/tbody/tr/td/table[5]/tbody/tr/td/table[1]/tbody/tr/td[2]', '');
	  target = target.replace('form1/table3/tbody1/tr1/td1/table5/tbody1/tr1/td1/table1/tbody1/tr1/td2', '');
	  target = target.replace('form1/table3/tbody1/tr1/td1/table5/tbody1/tr1/td1/table1/tbody1/tr1/td2/table2/tbody1/tr1/td2', '');
	  target = target.replace('form/table[3]/tbody/tr/td/table[5]/tbody/tr/td/table[1]/tbody/tr/td[2]/table[4]/tbody/tr/td[2]', '');
	  target = target.replace('/table[3]/tr/td[2]', '');
	  target = target.replace('/table[2]/tr/td[2]', ''); 
	  target = target.replace('/table2/tr/td2', ''); 
	  target = target.replace('/html/body','')
	}
	if(url.indexOf('.unibo.it') > -1){
    target = target.replace('div/div[2]/div[2]/div[3]', '');
	  target = target.replace('div[1]/div[2]/div[2]/div[3]', '');
	  target = target.replace('div1/div2/div2/div3/', '');
	  target = target.replace('div/div2/div2/div3/', ''); 
	  target = target.replace('/div/div[3]/div[2]', '');
	  target = target.replace('/div/div/div/div', '');
	  target = target.replace('div[3]/div[2]', '');
	  target = target.replace('/div[3]','')
	  target = target.replace('/div/div[2]','/')
	}
	//dopo tutti i replace capita che alcuni target finiscano con / e quindi che non siano Xpath Validi, tolgo l'ultimo char
	if(target.substr(target.length - 1) == '/')
		target = target.slice(0, target.length - 1)

	return target
}	

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
tagWithNumber mi restituisce true se ogni tag apparte html e body ha anche il numero che identifica l'occorrenza. 
False altrimenti
-------------------------------------------------------------------------------------------------------------- */
function tagWithNumber(target) {
	var bool = false;           //diventa true quando incontra un numero
	str = target.split("_");
	for(var i = 0 ; i < str.length; i++){ //itero per ogni substring
		if((str[i].indexOf("html") != 0) && (str[i].indexOf("body") != 0) ) { //se la substring è html o body non faccio niente
			bool = false
			for(var w = 0; w < str[i].length; w++){
				if(isNumber(str[i][w]))
					bool = true
			}
			if(!bool)         
					return false;
		return true;
		}	
	}
}

/* --------------------------------------------------------------------------------------------------------------
Author: Daniele Ferrari
targetToXPath prende come parametro un target come da specifiche e lo converte in una XPath String.
nTab è l'id della tab attiva, prefix è l'xpath che indica la tab attiva.
-------------------------------------------------------------------------------------------------------------- */
function targetToXPath(target) {
	var nTab = $("#main-tabs > li > a.active").attr("href").charAt(5);
	var prefix = "//div[@id='div_" + nTab + "']/";
	var i = 0;
	var res = "";

	// elimino tutti i possibili "_" in fondo
	while (target[target.length-1] == "_") {
		len = target.length-1;
		target = target.substr(0, len)
	}

	while (i < target.length) { 
		
		do {
			res = res + target[i];
	   		i++;

	   		if (i == target.length)
	   			break;

	   		if (target[i] == 'h') {
		    	res = res + target[i] + target[i+1];
		    	i += 2;
	   		}
	  	} while (!isNumber(target[i]));

	  if (isNumber(target[i])) {
		  res = res + '[';
		  do {
		  	res = res + target[i];
		  	i++;

		  } while (isNumber(target[i]));

			res = res + ']';
	   }

	}

	res = res.replace( /_/g, '/');
	res = res.replace(/\/+/g, "/")
	res = res.split('[1]').join('');    //toglie tutti i [1]
	res = prefix + res;
	return res; 
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
Checka se il carattere è un numero o meno.
-------------------------------------------------------------------------------------------------------------- */
function isNumber(x){
	if(!isNaN(parseInt(x, 10)))
		return true;
	else 
		return false
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
xPathToElement prende come parametro il dizionario e l'xpath. Controllo se il target non è vuoto (alcune annotazioni
non hanno target, bravi loro). Con document.evaluate mi faccio restituire un XPathResult e userò il .singloNodeValue
per creare lo span.
-------------------------------------------------------------------------------------------------------------- */
function xPathToElement(annotation, target){
	if (target != ''){
		var node = document.evaluate(target, document , null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); // restituisce un xpath

		if(node.singleNodeValue != null){
			checkNodeQuery(node.singleNodeValue, annotation.start, annotation.end, annotation);
		}
	}	
}

/* --------------------------------------------------------------------------------------------------------------
CheckNodeQuery, ScanNodeQuery e MakeSpanQuery creano lo span.
-------------------------------------------------------------------------------------------------------------- */
function checkNodeQuery(nodeSelection, start, end, annotation){
  var structNode;                           
  if(nodeSelection.nodeType !== 3){                  //controllo se il nodeSelection è diverso da un Node Text
    var child = nodeSelection.childNodes;            //child è un NodeList contenente tutti i figli dell'ancestor  
    for (var index = 0; index < child.length; index++) {
    }

    var j = 0;
    if(typeof child !== "undefined"){                //controllo se l'ancestor ha almeno dei figli
      while(j < child.length){                       //itero questa NodeList, se la sel avviene nello stesso nodo, non entra in questo while
        out = checkNodeQuery(child[j], start, end, annotation);   //per ogni Node di questa lista applico ricorsivamente la funzione. Out è una structNode
        if (out.exit) {
          return out;                                //se è il nodo finale
        }
        else { 
          if (out.other){                             //se è un altro nodo
            j++;    
          }
          start = out.first;                         
          end = out.last;
        }
        j++;
    }
    structNode = {first: start, last: end};
    }
  }
  else{
    structNode = scanNodeQuery(nodeSelection, start, end, annotation); 
  } 
  return structNode;
}

function scanNodeQuery(nodeSelection, start, end, annotation){
  var structNode;
  var length = nodeSelection.length;
  if(start >= length) {
    structNode = {first: start - length, last: end - length};
  }
  else if(end < length){
    makeSpanQuery(nodeSelection, start, end, annotation);
    structNode = {exit : true};
  }
  else {
    makeSpanQuery(nodeSelection, start, length, annotation);
    structNode = {first: 0, last: end - length, other: true};
  }
  return structNode;
}

function makeSpanQuery(nodeSelection, start, end, annotation){
  var rangeSpan= document.createRange();
  var span = document.createElement('span');
  var color;

  rangeSpan.setStart(nodeSelection, start);
  rangeSpan.setEnd(nodeSelection, end);

  span.setAttribute('date', annotation.date);
  span.setAttribute('user', annotation.user);
  span.setAttribute('user_name', annotation.name_user);
  span.setAttribute('type', annotation.type);
  span.setAttribute('graph', annotation.graph);
  span.setAttribute('object', annotation.object);
  span.setAttribute('labelA', annotation.labelA);
  span.setAttribute('labelO', annotation.labelO);
  color = spanColorQuery(annotation)
  span.setAttribute('class', 'annotation otherGroup ' + color + ' ' + annotation.index);

  rangeSpan.surroundContents(span);
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
spanColorQuery in base al tipo di annotazione mi restituisce il colore corrispondente per creare lo span.
Se il type di annotazione è sbagliato mi restituisce un colore "azzurrino" di errore.
-------------------------------------------------------------------------------------------------------------- */
function spanColorQuery (annotation) {
	type = annotation.type
	var color;

	if(type == 'hasAuthor') color = 'author';
	else if(type == 'hasPublicationYear') color = 'year';
	else if(type == 'hasTitle') color = 'title';
	else if(type == 'hasDOI') color = 'doi';
	else if(type == 'hasURL') color = 'uri';
	else if(type == 'hasComment') color = 'comment';
	else if((type == 'denotesRhetoric') || (type == 'denotesRethoric')) color = 'rhetoric';
	else if((type == 'cites') || (type == 'references')) color = 'cites'; 
	else {
		//console.log("spanColor: something goes wrong");
		color = 'blue lighten-5'    //se c'è qualche errore mi setta questo azzurrino
	}
	return color;
}


/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
predicateToType converte ogni predicato in un type. Se il predicato è sbagliato mi ritorna un valore che poi 
in spanColorQuery risulterà azzurrino.
-------------------------------------------------------------------------------------------------------------- */
function predicateToType(predicate){
	if((predicate == 'cito:cites') || (predicate == 'http://purl.org/spar/cito/cites') || (predicate == 'http://purl.org/net/cito/cites'))
		return 'cites'
	else if(( predicate == 'dcterms:creator' ) || (predicate == 'http://purl.org/dc/terms/creator') || (predicate == 'http://schema.org/creator'))
		return 'hasAuthor'
	else if(( predicate == 'dcterms:title') || (predicate == 'http://purl.org/dc/terms/title') || (predicate == 'http://purl.org/dc/terms/hasTitle'))
		return 'hasTitle'
	else if(( predicate == 'prism:doi') || (predicate == 'http://purl.org/spar/fabio/doi') || (predicate == 'http://prismstandard.org/namespaces/basic/2.0/doi') || (predicate == 'http://prismstandard.org/namespaces/basic/2.0/hasDOI'))
		return 'hasDOI'
	else if(( predicate == 'fabio:hasPublicationYear' ) || (predicate == "http://purl.org/spar/fabio/hasPublicationYear") || (predicate == 'http://purl.org/spar/fabiohasPublicationYear'))
		return 'hasPublicationYear'
	else if(( predicate == 'fabio:hasURL') || (predicate == "http://purl.org/spar/fabio/hasURL") || (predicate == "http://purl.org/spar/fabiohasURL"))
		return 'hasURL'
	else if(( predicate == 'sem:denotes') || (predicate == 'http://www.ontologydesignpatterns.org/cp/owl/semiotics.owl#denotes') || (predicate == 'http://semanticweb.cs.vu.nl/2009/11/sem/denotes'))
		return 'denotesRhetoric'
	else if(( predicate == 'schema:comment' ) || (predicate == 'http://schema.org/comment'))
		return 'hasComment'
	else {
		console.log("Predicate to add: " + predicate)
		return predicate	
	}
}

/* --------------------------------------------------------------------------------------------------------------
Author: Federico Govoni
idToNameGroup converte un id nel nome del gruppo. Lo utilizzo nel toast di caricamento delle annotazioni.
-------------------------------------------------------------------------------------------------------------- */
function idToNameGroup(id){
	if(id == 'ltw1529')
		return 'Gli Sgremagi'
	else if(id == 'ltw1511')
		return 'I Portapizze'
	else if(id == 'ltw1512')
		return 'Enjoy Freedom'
	else if(id == 'ltw1519')
		return 'DaVinci'
	else if(id == 'ltw1508')
		return 'Let it code'
	else if(id == 'ltw1513')
		return 'iMura Tour'
	else if(id == 'ltw1509')
		return 'Dragons'
	else if(id == 'ltw1524')
		return 'The Javangers'
	else if(id == 'ltw1522')
		return 'Musa Sapientum'
	else if(id == 'ltw1520')
		return 'The Scrapporn'
	else if(id == 'ltw1525')
		return 'The Scrapers'
	else if(id == 'ltw1518')
		return 'HangRAA'
	else if(id == 'ltw1517')
		return 'iTeck'
	else if(id == 'ltw1514')
		return 'L.E.L.A.'
	else if(id == 'ltw1515')
		return 'Script and Furious'
	else if(id == 'ltw1531')
		return 'Amico Friz'
	else if(id == 'ltw1521')
		return 'Sparkle Parlke'
	else if(id == 'ltw1510')
		return 'Segmentation Fault'
	else if(id == 'ltw1526')
		return 'Cazzuola'
	else if(id == 'ltw1530')
		return 'Bushelelezi'
	else if(id == 'ltw1516')
		return 'L.E.U.M.'
	else if(id == 'ltw1540')
		return 'Nerd Herd'
	else if(id == 'ltw1537')
		return 'Los Raspadores'
	else if(id == 'ltw1539')
		return 'ToRaGaMa'
	else if(id == 'ltw1538')
		return 'IronWeb'
	else if(id == 'ltw1544')
		return 'A$AP'
	else if(id == 'ltw1517')
		return 'Gamma'
	else if(id == 'ltw1542')
		return 'Brullo'
	else if(id == 'ltw1545')
		return 'Heisenberg'
	else if(id == 'ltw1543')
		return 'Error 418'
	else if(id == 'ltw1546')
		return 'MaDiTo'
	else if(id == 'ltw1548')
		return 'Cuatro Amigos'
	else if(id == 'ltw1549')
		return 'fnatic'
	else if(id == 'ltw1547')
		return 'walterWhite.exe'
	else if(id == 'ltw1554')
		return 'The Reacters'
	else if(id == 'ltw1555')
		return 'Quei Quattro'
	else if(id == 'ltw1551')
		return 'Twbz'
	else if(id == 'ltw1552')
		return 'Los Pollos'
	else if(id == 'ltw1535')
		return 'Ciappinators'
	else if(id == 'ltw1550')
		return 'Qwerty'
	else if(id == 'ltw1536')
		return 'Paletta & Co.'
	else return id
}
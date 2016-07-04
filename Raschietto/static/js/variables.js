var prefixString = "";    
var typeAnnotationRadioButton; // indica il tipo di radioButton cliccato all'interno del form

/* Variabili globali per creare il file JSON */

var id; // path dell'annotazione
var range;

/* Prefissi RDF */
var foaf = "foaf:";
var dcterms = "dcterms:";
var fabio = "fabio:";
var xsd = "xsd:";
var prism = "prism:";
var sem = "sem:";
var schema = "schema:";
var sro = "sro:";
var deo = "deo:";
var cito = "cito:";
var skos = "skos:";
var rsch = "rsch:";

var annotation = []; // array contente tutte le annotazioni fatte dall'utente e dallo scraper
var provenance = []; // array contente le informazioni riguardanti l'annotatore. 
						// provenance[0] = username
						// provenance[1] = email

var error = -1; // valore restituito in caso di errore
var citations = {} // dizionario contente il numero di citazioni di ogni documento
					// citato nella tab corrente
var checkList;
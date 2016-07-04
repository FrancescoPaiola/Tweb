from SPARQLWrapper import SPARQLWrapper
import json

sparqlQuery = SPARQLWrapper('http://tweb2015.cs.unibo.it:8080/data', returnFormat="json")

PREFIX = '''PREFIX : <http://vitali.web.cs.unibo.it/raschietto/graph/>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX fabio: <http://purl.org/spar/fabio/>
		PREFIX frbr: <http://purl.org/vocab/frbr/core#>
		PREFIX foaf:  <http://xmlns.com/foaf/0.1/>
		PREFIX oa:    <http://www.w3.org/ns/oa#>
		PREFIX xml:   <http://www.w3.org/XML/1998/namespace>
		PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>
		PREFIX application: <http://purl.org/NET/mediatypes/application/>
		PREFIX sem:   <http://www.ontologydesignpatterns.org/cp/owl/semiotics.owl#>
		PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
		PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
		PREFIX text: <http://purl.org/NET/mediatypes/text/>
		PREFIX prism: <http://prismstandard.org/namespaces/basic/2.0/>
		PREFIX raschp:   <http://vitali.web.cs.unibo.it/raschietto/person>
		PREFIX au:    <http://description.org/schema/>
		PREFIX schema: <http://schema.org/>
		PREFIX rsch: <http://vitali.web.cs.unibo.it/raschietto/>
		PREFIX rasch: <http://vitali.web.cs.unibo.it/raschietto/>
		PREFIX dlib: <http://www.dlib.org/dlib/march15/moulaison/>
		PREFIX cito: <http://purl.org/spar/cito/>'''

# ---------------------------------------------------------------------------
# ListDoc() returna un dizionario contenente la lista dei documenti
# ---------------------------------------------------------------------------
def ListDoc():
	sparqlQuery.setQuery(PREFIX+ """
		SELECT DISTINCT ?doc (sample(?label) as ?lab)
		WHERE {
    ?annotation 
			a oa:Annotation ;
   			 oa:hasTarget ?target ;
		    oa:hasBody ?body .
    
  			?target
				 a oa:SpecificResource ;
				 oa:hasSource ?doc .
  
    		?body a rdf:Statement;
    		 rdf:subject ?s ;
    		 rdf:object ?label.
  
  {?body  rdf:predicate dcterms:hasTitle.} UNION
  {?body  rdf:predicate dcterms:title.} UNION
  {?body  rdf:predicate <http://purl.org/dc/terms/title>.} UNION
  {?body  rdf:predicate <http://purl.org/dc/terms/hasTitle>.}  
  
}
GROUP BY ?doc
ORDER BY ?doc
		""")
	dicty =  sparqlQuery.query().convert()
	dicty = {'docs' : dicty['results']['bindings']}
	return dicty

# ---------------------------------------------------------------------------
# authors: Federico Govoni
# submitRDFTriples(annotations) prende in input una lista di annotazioni, 
# la scorre e per ogni annotazione a seconda del tipo genera la query.
# ---------------------------------------------------------------------------
def submitRDFTriples(annotations):
	#sparqlUpdate = SPARQLWrapper('http://localhost:3030/data1/update')                              #localhost
	sparqlUpdate = SPARQLWrapper('http://tweb2015.cs.unibo.it:8080/data/update?user=ltw1551&pass=KHnB-3!x')                        #endpoint
	
	annotations = json.loads(annotations)

	for annotation in annotations:
		if annotation is None:
			print 'null'
	 	else:
	 		for i in range(0,len(annotation['list'])):
		 		prefix = annotation['list'][i]
				
				annoType = prefix['type'] 
				
				query = makeQuery(prefix)
				sparqlUpdate.setQuery(query) 
		 	 	sparqlUpdate.method = 'POST'
		 	 	print query
		 	 	sparqlUpdate.query()

# ---------------------------------------------------------------------------
# MakeQuery: 
# ---------------------------------------------------------------------------
def makeQuery(prefix):
	graph = 'http://vitali.web.cs.unibo.it/raschietto/graph/ltw1551'

	annoType = unicode(prefix['type'])                                     # hasTitle
	annoLabel = unicode(prefix['label']  )                                    # title
	# literal = prefix['body']['literal']
	subject = unicode(prefix['body']['subject'] )                          		# entita' documento / url
	typeLabel = unicode(prefix['body']['label'] )
	typeLabel = unicode(typeLabel.replace("\"", "'").replace("\n", " "))   
	predicate = unicode(prefix['body']['predicate']) 															# dcterms:creator
	target = unicode(prefix['target']['id'])    															# Target
	start = unicode(prefix['target']['start'])                         					# Start
	end = unicode(prefix['target']['end'])   
	if target == 'None':
		start = unicode(0)
		end = unicode(0)                        					# End
	source = unicode(prefix['target']['source']) 														# URL.html
	name = unicode(prefix['provenance']['author']['name'])                  				# Name dell'autore dell'annotazione
	email = unicode(prefix['provenance']['author']['email'])                				# Email dell'autore dell'annotazione
	time = unicode(prefix['provenance']['time'])                                 # Timestamp
	source = unicode(prefix['target']['source']) 
	source_ver1 = source.replace('.html', '_ver1')
	url_nohtml = source.replace('.html','')

	query = PREFIX + '''
	 	INSERT DATA { GRAPH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1551> {
	 	
    '''+getEmail(prefix)+'''
    
    '''+getAnnotation(prefix)+'''
      '''+getProvenance(prefix)+ '''
     '''+getObject(prefix)+'''
     '''+getTarget(prefix)+'''
    ] .

				 <''' + source + '''> a fabio:Item;
				 rdfs:label "''' + typeLabel + '''"^^xsd:string .
				 <''' + url_nohtml +'''> a fabio:Work ;
				 	fabio:hasPortrayal <''' + source + '''>;
				 	frbr:realization <''' + source_ver1 +'''>.
				 <''' + source_ver1 + '''> a fabio:Expression ;
				 fabio:hasRepresentation <''' + source + '''>.

}}

	 	'''
	query = unicode(query)

	return query



def getEmail(prefix):
	name = unicode(prefix['provenance']['author']['name'])                  				# Name dell'autore dell'annotazione
	email = unicode(prefix['provenance']['author']['email']) 
	return '''<mailto:'''+email+'''>
            <http://schema.org/email>  "'''+email+'''" ;
            foaf:name                  "'''+name+'''" .'''

def getTarget(prefix):
	target = unicode(prefix['target']['id'])    															# Target
	start = unicode(prefix['target']['start'])                         					# Start
	end = unicode(prefix['target']['end'])   
	if target == 'None':
		start = unicode(0)
		end = unicode(0)                        					# End
	source = unicode(prefix['target']['source']) 		
	return  '''  oa:hasTarget    [ a               oa:SpecificResource ;
                        oa:hasSelector  [ a          oa:FragmentSelector ;
                                          rdf:value "''' + target + '''"^^xsd:string ;
                                          oa:end "''' + end +'''"^^xsd:nonNegativeInteger;
            							oa:start "''' + start + '''"^^xsd:nonNegativeInteger;
                                        ] ;
                        oa:hasSource <''' + source + '''>
                      ] '''

def getProvenance(prefix):
	email = unicode(prefix['provenance']['author']['email'])                				# Email dell'autore dell'annotazione
	time = unicode(prefix['provenance']['time'])  
	return '''oa:annotatedAt  "'''+time+'''"^^<http://www.w3.org/2001/XMLSchema#date> ;
      oa:annotatedBy  <mailto:'''+email+'''> ;'''


def getAnnotation(prefix):
	return '''
    [ a               oa:Annotation ;
      rdfs:label      "'''+unicode(prefix['label'])+'''"^^<http://www.w3.org/2001/XMLSchema#string> ;
      <http://vitali.web.cs.unibo.it/raschietto/type>
              "'''+unicode(prefix['type'])+'''"^^<http://www.w3.org/2001/XMLSchema#normalizedString> ;'''

def getBody(prefix):
	literal = prefix['body']['literal']
	typeLabel = unicode(prefix['body']['label'] )
	typeLabel = unicode(typeLabel.replace("\"", "'").replace("\n", " "))                                  # ... is one of document's authors
	predicate = unicode(prefix['body']['predicate']) 
	return ''' oa:hasBody      [ a              rdf:Statement ;

          				rdfs:label "''' + typeLabel.replace("\"", "'") + '''"^^xsd:string ;
                        rdf:object "''' + literal + '''"^^xsd:string;
                        rdf:predicate  '''+ predicate +''' ;'''

def getObject(prefix):

	annoType = unicode(prefix['type'])                                     # hasTitle
	annoLabel = unicode(prefix['label']  )                                    # title
	
	subject = unicode(prefix['body']['subject'] )                          		# entita' documento / url
	typeLabel = unicode(prefix['body']['label'] ) 
	typeLabel = unicode(typeLabel.replace("\"", "'").replace("\n", " "))                                 # ... is one of document's authors
	predicate = unicode(prefix['body']['predicate']) 															# dcterms:creator
	target = unicode(prefix['target']['id'])    															# Target
	start = unicode(prefix['target']['start'])                         					# Start
	end = unicode(prefix['target']['end'])   
	if target == 'None':
		start = unicode(0)
		end = unicode(0)                        					# End
	source = unicode(prefix['target']['source']) 														# URL.html
	name = unicode(prefix['provenance']['author']['name'])                  				# Name dell'autore dell'annotazione
	email = unicode(prefix['provenance']['author']['email'])                				# Email dell'autore dell'annotazione
	time = unicode(prefix['provenance']['time'])                                 # Timestamp
	source = unicode(prefix['target']['source']) 
	source_ver1 = source.replace('.html', '_ver1')
	url_nohtml = source.replace('.html','')
	annoType = unicode(prefix['type'])


	if annoType == "hasTitle" or annoType == 'hasDOI' or annoType =='hasURL' or annoType == 'hasComment' :
		literal = prefix['body']['literal']
		return ''' oa:hasBody      [ a              rdf:Statement ;

          				rdfs:label "''' + typeLabel + '''"^^xsd:string ;
                        rdf:object "''' + literal + '''"^^xsd:string;
                        rdf:predicate ''' + predicate + ''' ;
                        rdf:subject <''' + source_ver1 + '''> 
                      ] ; '''

	elif annoType == 'hasPublicationYear':
		literal = prefix['body']['literal']
		return ''' oa:hasBody      [ a              rdf:Statement ;

          				rdfs:label "''' + typeLabel + '''"^^xsd:string ;
                        rdf:object "''' + literal + '''"^^xsd:date;
                        rdf:predicate ''' + predicate + ''' ;
                        rdf:subject <''' + source_ver1 + '''> 
                      ] ; '''

	elif annoType == 'hasAuthor':
		author =  unicode(prefix['body']['resource']['id']) 
		authorLabel = unicode(prefix['body']['resource']['label']) 

		return ''' oa:hasBody      [ a              rdf:Statement ;

          				rdfs:label "''' + typeLabel + '''"^^xsd:string ;
                        rdf:object [ a            foaf:Person ;
                                         rdf:subject   <http://vitali.web.cs.unibo.it/raschietto/person/'''+ author +'''> ;
                                         rdfs:label   "'''+ authorLabel +'''"^^<http://www.w3.org/2001/XMLSchema#string>
                                       ] ;

                        rdf:predicate ''' + predicate + ''' ;
                        rdf:subject <''' + url_nohtml + '''> 
                      ] ; '''
	elif annoType == 'cites':
		citated = unicode(prefix['body']['object'])
  		return ''' oa:hasBody      [ a              rdf:Statement ;

         				rdfs:label "''' + typeLabel + '''"^^xsd:string ;
                      rdf:object <''' + citated + '''>;
                      rdf:predicate ''' + predicate + ''' ;
                      rdf:subject <''' + source_ver1 + '''> 
                      ] ; '''
	elif annoType == 'denotesRhetoric':
		rethoricaType = unicode(prefix['body']['resource'])
		
  		return ''' oa:hasBody      [ a              rdf:Statement ;

          				rdfs:label "''' + typeLabel + '''"^^xsd:string ;
                        rdf:object <''' + rethoricaType + '''>;
                        rdf:predicate ''' + predicate + ''' ;
                        rdf:subject <''' + subject + '''> 
                      ] ; '''
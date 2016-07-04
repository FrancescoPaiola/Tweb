from bs4 import BeautifulSoup
import re
import lxml.html as lh
from lxml import etree
from annotatingMethods import *
import datetime

# annotation{
# 	annotations{
# 	'type': '',
# 	'label':''
# 	'body': {
# 						'subject'
# 						'predicate'
# 						'literal'
# 					}
# 		}
# 		'target':{
# 							'source'
# 							'id'
# 							'start'
# 							'end'
# 		}
# 		'provenance':{
# 						'author':{'name': 'Parser_ltw1551',
# 											'email': 'parserltw1551@studio.unibo.it'},
# 						'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
# 		}


# }
"""
	author: Daniele Ferrari
	description: 
		prende il nome completo di una autore e lo formatta
    	secondo lo standard delle specifiche
    	Esempio:
      	"John Brown Junior" diventa j-brownjunior
      	"Mario Bianchi Rossi Verdi" diventa m-rossiverdi
"""
def rdfPerson(fullname):
	if (fullname == ""):
		return fullname
		
	nameInit = fullname[0]
	names = fullname.split(" ")

	if (len(names) < 2):
  		return (nameInit + "-author").lower()
	
  	firstSurname = names[-2]
  	secondSurname = names[-1]
	
	if (len(names) > 2):
 		return (nameInit + '-' + firstSurname + secondSurname).lower()
 	else:
 		return (nameInit + '-' + secondSurname).lower() 


def DlibTitle(soup, data, url):
	title = soup.find_all('h3')
	data['title'] = title[1].contents[0].replace("\t", "").replace("\r", "").replace("\n", "").encode('utf-8')
	
	dicty = {
		'type': 'hasTitle',
		'label': 'title',
		'body': {	
			'label':"The document's title is "+title[1].contents[0].replace("\t", "").replace("\r", "").replace("\n", "").encode('utf-8'),
			'subject': url,
			'predicate' : 'dcterms:title',
			'literal' : title[1].contents[0].replace("\t", "").replace("\r", "").replace("\n", "").encode('utf-8')
		},

		'target': {
			'source': url, 
			'id': None, 
			'start': None,
			'end': None
		},

		'provenance': {
			'author': {
				'name': 'Parser_ltw1551',
				'email':'parserltw1551@studio.unibo.it'
			},
			'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
		}
	}
	newAnn = {}
	newAnn['list'] = []
	newAnn['list'].append(dicty)
	data['annotations'].append(newAnn)
	
	soup = wrapElement(soup, 'h3', 'title', data, 1) 


def DlibDOI(soup, data, url):
	paragraph = soup.find_all('p')
	data['doi'] = paragraph[1].contents[-1].replace("\t", "").replace("\r", "").replace("\n", "").encode('utf-8')
	
	dicty = {
		'type': 'hasDOI',
		'label': 'doi',
		'body': {
			'label': "The document's DOI is "+paragraph[1].contents[-1].replace("\t", "").replace("\r", "").replace("\n", "").encode('utf-8'),
			'subject': url+'_ver1',
			'predicate' : 'prism:doi',
			'literal' : paragraph[1].contents[-1].replace("\t", "").replace("\r", "").replace("\n", "").encode('utf-8')
		},

		'target': {
			'source': url, 
			'id': None, 
			'start': None,
			'end': None
		},
		
		'provenance': {
			'author': {
			'name': 'Parser_ltw1551',
			'email':'parserltw1551@studio.unibo.it'
			},
			'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
		}
	}
	newAnn = {}
	newAnn['list'] = []
	newAnn['list'].append(dicty)
	data['annotations'].append(newAnn)

	soup = wrapElement(soup, 'p', 'doi', data, 1, -1) 


def DlibYear(soup, data, url):
	paragraph = soup.find_all('p')
	year = re.findall('[0-9][0-9][0-9][0-9]', str(paragraph[0].contents[0].string))
	data['data'] = year[0]
	
	dicty = {
		'type': 'hasPublicationYear',
		'label': 'publication year',
		'body': {
			'label':"The document was published in " + year[0],
			'subject': url,
			'predicate' : 'fabio:hasPublicationYear',
			'literal' : year[0]
		},
		
		'target': {
			'source': url, 
			'id': None, 
			'start': None,
			'end': None
		},

		'provenance': {
			'author': {
				'name': 'Parser_ltw1551',
				'email':'parserltw1551@studio.unibo.it'
			},
		'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
		}
	}
	newAnn = {}
	newAnn['list'] = []
	newAnn['list'].append(dicty)
	data['annotations'].append(newAnn)

	spanclass = 'year annotation span-' + str(data['class']) 
	spanYear = createElement ('span', spanclass, year[0])
	string = paragraph[0].contents[0].replace(year[0], str(spanYear))
	paragraph[0].contents[0].replace_with(string)
	data['class']=data['class']+1

def DlibAuthors(soup, data, url):
	data['authors'] = []
	data['authors'] = getAuthors(soup, data)
	for name in data['authors']:
		dicty = {
			'type': 'hasAuthor',
			'label': 'author',
			'body': {
				'label':name+" is an author of the document",
				'subject': url,
				'predicate': 'dcterms:creator',
				'resource': {
					'id': rdfPerson(name),
					'label': name,
				}
			},

			'target': {
				'source': url, 
				'id': None, 
				'start': None,
				'end': None
			},
			
			'provenance': {
				'author': {
					'name': 'Parser_ltw1551',
					'email':'parserltw1551@studio.unibo.it'
				},
			'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
			}
		}
		
		newAnn = {}
		newAnn['list'] = []
		newAnn['list'].append(dicty)
		data['annotations'].append(newAnn)
		
	return soup

def DlibAnnotation(soup, data, url):
	title = soup.find('h3', string='References')
	stringList = []
	string = ''
	link = ''
	for sibling in title.next_siblings:
	    if sibling.name == 'div':
	    	break
	    if sibling.name == 'p':	
	    	a = sibling.find_all('a')
	    	cited = 0
	    	for elem in a:
	    		if elem.has_attr('href'):
	    			# print sibling.name
	    			link = elem['href']+'ver1_citated1'
	    			cited = cited+1
	    	for elem in sibling.contents[1:]:
	    		# print elem
	    		
	    		string = string + str(elem.encode('utf-8'))
	    	
	    	dicty = {
			'type': 'cites',
			'label': 'citation',
			'body': {
				'label':"This document cites " + string,
				'subject': url+'_ver1',
				'predicate' : 'cito:cites',
				'object' : link
			},
			
			'target': {
				'source': url, 
				'id': None, 
				'start': None,
				'end': None
			},

			'provenance': {
				'author': {
					'name': 'Parser_ltw1551',
					'email':'parserltw1551@studio.unibo.it'
				},
				'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
				}
				}
		newAnn = {}
		newAnn['list'] = []
		newAnn['list'].append(dicty)
		data['annotations'].append(newAnn)
		classe = 'cites annotation span-' + str(data['class'])
		stringList.append(string)
		string = ''
	soup = searchReplace(soup, stringList, 'cites', data, 'span')
	return soup

def DlibParse(soup, data, url):
	
	try:
		DlibTitle(soup, data, url)
	except:
		pass
	try:
		soup = DlibAuthors(soup, data, url)
	except:
		pass
	try:
		DlibYear(soup, data, url)
	except:
		pass
	try:
		DlibDOI(soup, data, url)
	except:
		pass
	try:
		soup = DlibAnnotation(soup, data, url)
	except:
		pass
	createXpath(soup)
	return soup
	

def statisticaTitle(soup, data, url):
 	data['title']=soup.find(id='articleTitle').string
	
	dicty = {
		'type': 'hasTitle',
		'label': 'title',
		'body': {
			'label':"The document's title is "+soup.find(id='articleTitle').string,
			'subject': url,
			'predicate' : 'dcterms:hasTitle',
			'literal' : soup.find(id='articleTitle').string
		},
		
		'target': {
			'source': url, 
			'id': None, 
			'start': None,
			'end': None
		},

		'provenance': {
			'author': {
				'name': 'Parser_ltw1551',
				'email':'parserltw1551@studio.unibo.it'
			},
			'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
		}
	}
	
	newAnn = {}
	newAnn['list'] = []
	newAnn['list'].append(dicty)
	data['annotations'].append(newAnn)
	
	title = soup.find(id='articleTitle').string.wrap(soup.new_tag('span'))
	span = soup.find('span', attrs={'class': None})
	span['class']='title' + ' annotation span-' + str(data['class'])
	data['class'] = data['class']+1


def statisticaDOI(soup, data, url):
	data['doi'] = soup.find(id='pub-id::doi').string
	a = soup.find(id='pub-id::doi').string.wrap(soup.new_tag('span'))
	span = soup.find('span', attrs={'class': None})
	span['class']='doi' + ' annotation span-' + str(data['class'])
	data['class'] = data['class']+1
	
	dicty = {
		'type': 'hasDOI',
		'label': 'doi',
		'body': {
			'label':"The document's DOI is "+soup.find(id='pub-id::doi').string,
			'subject': url+'_ver1',
			'predicate' : 'prism:hasDOI',
			'literal' : soup.find(id='pub-id::doi').string
		},
		
		'target': {
			'source': url, 
			'id': None, 
			'start': None,
			'end': None
		},
	
		'provenance': {
			'author': {
				'name': 'Parser_ltw1551',
				'email':'parserltw1551@studio.unibo.it'
			},
			'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
		}
	}

	newAnn = {}
	newAnn['list'] = []
	newAnn['list'].append(dicty)
	data['annotations'].append(newAnn)
	
def statisticaYear(soup, data, url):
	issue = soup.find(id='breadcrumb')
	issue = issue.find_all('a')
	year = re.findall('[0-9][0-9][0-9][0-9]', str(issue[1].string))
	data['data'] = year[0]
	
	dicty = {
		'type': 'hasPublicationYear',
		'label': 'publication year',
		'body': {
			'label':"The document was published in " + year[0],
			'subject': url,
			'predicate' : 'fabio:hasPublicationYear',
			'literal' : year[0]
		},
		
		'target': {
			'source': url, 
			'id': None, 
			'start': None,
			'end': None
		},

		'provenance': {
			'author': {
				'name': 'Parser_ltw1551',
				'email':'parserltw1551@studio.unibo.it'
			},
			'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
		}
	}

	newAnn = {}
	newAnn['list'] = []
	newAnn['list'].append(dicty)
	data['annotations'].append(newAnn)
	
	spanYear = createElement ('span', 'year annotation span-2', year[0])
	# print issue[1].string.replace(year[0], str(spanYear))
	# print type (issue[1].string)
	# print type (str(spanYear))
	issue[1].string = issue[1].string.replace(year[0], str(spanYear))
	data['class']=data['class']+1
	

def statisticaAuthors(soup, data, url):
	data['authors'] = []
	author = soup.find(id='authorString').string
	author = re.split(', | and ', author)
	
	for name in author:				
		if re.match('[A-Z][^\s]* [A-Z][^\s]*$|[A-Z][^\s]* [A-Z][^\s]* [A-Z][^\s]*$', name):
			dicty = {
				'type': 'hasAuthor',
				'label': 'author',
				'body': {
					'label': name + " is an author of the document",
					'subject': url,
					'predicate': 'dcterms:creator',
					'resource': {
						'id': rdfPerson(name),
						'label': name,
					}
				},
				
				'target': {
					'source': url, 
					'id': None, 
					'start': None,
					'end': None
				},

				'provenance': {
					'author': {
						'name': 'Parser_ltw1551',
						'email':'parserltw1551@studio.unibo.it'
					},
				'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
				}
			}
			
			newAnn = {}
			newAnn['list'] = []
			newAnn['list'].append(dicty)
			data['annotations'].append(newAnn)
			data['authors'].append(name)

			spanclass = 'author annotation span-' + str(data['class']) 
			spanAuthor = createElement ('span', spanclass, name)
			data['class'] = data['class']+1
			author = soup.find(id='authorString').string
			author.string = author.string.replace(name, str(spanAuthor))
	
	# print spanAuthor
	# string = 	searchReplace(author, data['authors'], 'author', data, 'span')
	# string = string.find('body').contents[0]
	complete = author.string
	# print complete
	soup.find(id='authorString').string = complete
	return soup

def statisticaCitations(soup, data, url):
	reference = soup.find(id='articleCitations')
	reference = reference.find_all('p')
	print reference
	for elem in reference:
		if elem.string:
			dicty = {
			'type': 'cites',
			'label': 'citation',
			'body': {
				'label':"This document cites " + elem.string,
				'subject': url+'_ver1',
				'predicate' : 'cito:cites',
				'object' : ''
			},
			
			'target': {
				'source': url, 
				'id': None, 
				'start': None,
				'end': None
			},

			'provenance': {
				'author': {
					'name': 'Parser_ltw1551',
					'email':'parserltw1551@studio.unibo.it'
				},
				'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
				}
			}
			# print elem
			newAnn = {}
			newAnn['list'] = []
			newAnn['list'].append(dicty)
			data['annotations'].append(newAnn)
			elem.string.wrap(soup.new_tag('span'))
			span = soup.find('span', attrs={'class': None})
			span['class']='cites' + ' annotation span-' + str(data['class'])
			data['class']=data['class']+1



def statisticaParse(soup, data, url):
	try:
		statisticaTitle(soup, data, url)
	except:
		pass
	try:
		soup = statisticaAuthors(soup, data, url)
	except:
		pass
	try:
		statisticaYear(soup, data, url)
	except:
		pass
	try:
		statisticaDOI(soup, data, url)
	except:
		pass
	try:
		statisticaCitations(soup, data, url)
	except:
		pass
	createXpath(soup)
	div = soup.find(id="breadcrumb")
	div['name'] = 2
	div = soup.find(id="content")
	div['name'] = 3
	return soup
	


def parsing(soup, data):
	# todo
	return soup

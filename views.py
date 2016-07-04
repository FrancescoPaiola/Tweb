from django.shortcuts import render
from django.template import  loader, RequestContext
import json
import requests
from bs4 import BeautifulSoup
import lxml.html as lh
import urllib2
import json
import re
from lxml import etree
from django.http import JsonResponse
import time



from .models import Documents
from parsingMethods import *
from parseGroups import *
from RdfMethods import *
import createAnnotationMethods
from django.views.decorators.csrf import csrf_exempt


# call the function parseGroups, wich return a dictionary of parsed groups that will be rendered in the index.html template
def index(request):
	groups = parseGroups()
	docs = ListDoc()
	context = groups.copy()
	context.update(docs)
	return render(request, 'index.html', context)

@csrf_exempt	
def save(request):
	if request.is_ajax():
		data = request.body
		submitRDFTriples(data)
		jsondata = json.dumps(data).encode('utf-8')
		response = JsonResponse(jsondata, safe=False)
		return response
		
  
# given an url, show the main content in our doc area
def load(request, url): #url is the argument
	data = {}	


	# fix eventually http:// missing
	if not re.search('^http://',url): 
		url = 'http://' + url
	data['url'] = url
	# parse document
	doc=lh.parse(urllib2.urlopen(url))
	#split the url at last occurance of '/' dlib case
	prefix = url.rsplit('/', 1)

	# dlib case  
	if re.search('dlib', url):
		try:
			r=dlib(doc)
			data['prefixString'] = "form1_table3_tr1_td1_table5_tr1_td1_table1_tr1_td2"	
		except:
			r=generalCase(doc)
		soup = BeautifulSoup(r, 'lxml') #get r wich is a lxml object, and return a beautifulSoup object
		
		soup = fixAll(soup, prefix[0])
		createXpath(soup)	
	# unibo general case
	elif re.search('unibo.it/article', url):
		try:
			r=statistica(doc)
			data['prefixString'] = 'div1_div2_div2'		
			soup = BeautifulSoup(r, 'lxml') #get r wich is a lxml object, and return a beautifulSoup object	
			soup = fixAll(soup, prefix[0])	
			createXpath(soup)
			div = soup.find(id="breadcrumb")
			div['name'] = 2
			div = soup.find(id="content")
			div['name'] = 3
		except:
			r=generalCase(doc)	
		
	# general case
	else:		
		r=generalCase(doc)		
		soup = BeautifulSoup(r, 'lxml') #get r wich is a lxml object, and return a beautifulSoup object
		soup = fixAll(soup, prefix[0])
		createXpath(soup)	
		
		

	# send json response
		
	r = str(soup) #cast soup object in string
	data['html'] = r
	jsondata = json.dumps(data).encode('utf-8')
	response = JsonResponse(jsondata, safe=False)
	return response

def parse(request, url):
	data = {}
	data['annotations'] = []

	if not re.search('^http://',url): 
		url = 'http://' + url
	
	dicty = {
		'type': 'hasURL',
		'label': 'url',
		'body': {
			'label':"The document's URL is " + url,
			'subject': url + '_ver1',
			'predicate' : 'fabio:hasURL',
			'literal' : url
		},
		'provenance': {
			'author': {
				'name': 'Parser_ltw1551',
				'email': 'parserltw1551@studio.unibo.it'
			},
			'time': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
		},
		'target' : {
			'source': url,
			'id': None,
			'start': None,
			'end': None
		}
	}
	newAnn = {}
	newAnn['list'] = []
	newAnn['list'].append(dicty)
	data['annotations'].append(newAnn)
	data['hasurl'] = url
	data['class'] = 1
	doc=lh.parse(urllib2.urlopen(url))
	prefix = url.rsplit('/', 1) #split the url at last occurance of '/'

	# dlib case
	if re.search('dlib', url):
		r = dlib(doc)
		soup = BeautifulSoup(r, 'lxml') #get r wich is a lxml object, and return a beautifulSoup object
		soup = fixAll(soup, prefix[0])
		soup = DlibParse(soup, data, url)
		
	#unibo general  case	
	elif re.search('unibo.it/article', url):
		r = statistica(doc)		
		soup = BeautifulSoup(r, 'lxml') #get r wich is a lxml object, and return a beautifulSoup object
		soup = fixAll(soup, prefix[0])		
		soup = statisticaParse(soup, data, url)

	else:
		r = generalCase(doc)
		soup = BeautifulSoup(r, 'lxml')
		soup = fixAll(soup, prefix[0])
		soup = statisticaParse(soup, data)

	r = str(soup).replace("&lt;", "<").replace("&gt;", ">")
	data['html'] = r
	jsondata = json.dumps(data).encode('utf-8')
	response = JsonResponse(jsondata, safe=False)
	return response

def forceParse(request, url):
	data = {}
	if not re.search('^http://',url): 
		url = 'http://' + url	
	data['url'] = url
	doc=lh.parse(urllib2.urlopen(url))
	prefix = url.rsplit('/', 1)
	r = generalCase(doc)
	soup = BeautifulSoup(r, 'lxml') #get r wich is a lxml object, and return a beautifulSoup object
	soup = fixAll(soup, prefix[0])
	data['class'] = 1

	soup = force(soup, data)
	r = str(soup).replace("&lt;", "<").replace("&gt;", ">")
	data['html'] = r
	jsondata = json.dumps(data).encode('utf-8')
	response = JsonResponse(jsondata, safe=False)
	return response


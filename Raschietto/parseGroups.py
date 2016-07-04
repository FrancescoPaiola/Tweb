import requests
from bs4 import BeautifulSoup
import lxml.html as lh
import urllib2
import json
import re
from lxml import etree
from parsingMethods import *
# /////////////////////////////////////////////////

def parseGroups():
	url="http://vitali.web.cs.unibo.it/TechWeb15/ProgettoDelCorso"
	groups = {}
	list_groups = []

	table_groups = BeautifulSoup(urllib2.urlopen(url),'lxml')
	for elem in table_groups.findAll('table')[1].findAll('tr'):
		name = elem.findAll('th')[1].text.strip()   #name column
		id_groups = elem.findAll('th')[0].text.strip()   #id column
		dictionary = {'groupId' : id_groups, 'name': name}  #creo un dict con id:name
		list_groups.append(dictionary)

	list_groups.pop(0)
	groups["Groups"] = list_groups
	
	return groups
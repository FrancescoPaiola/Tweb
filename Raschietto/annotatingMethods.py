# coding=utf-8
from bs4 import BeautifulSoup
import re
import lxml.html as lh
from lxml import etree
from loadingMethods import *

# get a soup tree, a tag to find (in ex. div), a color and two index, the second is optional. wrap the string of the choosen tag of indexOne with a span having class color and an id. if the optional indexTwo is given, only the content of indexTwo will be wrapped. return a soup tree
def wrapElement(soup, element, color, data, indexOne, indexTwo=1000):
	element = soup.find_all(element)
	element = element[indexOne]
	if indexTwo == 1000:
		element.string.wrap(soup.new_tag('span'))	
	else:
		contents = element.contents[indexTwo]
		contents.string.wrap(soup.new_tag('span'))
	span = element.find('span', attrs={'class': None})
	span['class']=color + ' annotation span-' + str(data['class'])
	data['class']=data['class']+1
	return soup

# get a soup trees. The authors will always be in the first line of a block of string, so if is not a <br> tag, it will split the string at every comma or 'and'. than, it will choose only string wich have two or three Upcase Name, avoiding any possible university. It will than jump a line, again avoiding an eventual string of University. It will end in a <br> string or an email string that will not re.match the string. It will cycle until a doi string is found.It return a list
def getAuthors (soup, data):
	t=1
	i=0
	authorsList = []
	paragraph = soup.find_all('p')
	while t:
	 	if re.match('doi', str(paragraph[1].contents[i].encode('utf-8')), re.IGNORECASE):
	 		return authorsList	
		raw = paragraph[1].contents[i]
		if not re.match('<br/>', str(raw.encode('utf-8'))):
			raw=paragraph[1].contents[i].replace("\t", "").replace("\r", "").replace("\n", "").encode('utf-8')			
			names = re.split(', | and ', raw)			
			for author in names:				
				if re.match('[A-Z][^\s]* [A-Z][^\s]*$|[A-Z][^\s]* [A-Z][^\s]* [A-Z][^\s]*$', author):
					authorsList.append(author)
					spanclass = 'author annotation span-' + str(data['class']) 
					spanAuthor = createElement ('span', spanclass, author)
					string = paragraph[1].contents[i].replace("\t", "").replace("\r", "").replace("\n", "").encode('utf-8').replace(author, str(spanAuthor))
					paragraph[1].contents[i].replace_with(string)
					data['class']=data['class']+1
			i=i+3	
		else:
		 i=i+1 



# get 3 strings: element, classID and string. return <element class=classID>string</element>
def createElement (element, classID, string):
	new_tag = BeautifulSoup('<'+element+'></'+element+'>', 'lxml')
	new_tag = new_tag.find(element)
	new_tag['class'] = classID
	new_tag.string = string
	return new_tag

# get a string, a text and a soup tag. replace 'text' in that string with the new element. return string
def insertElement (string, textReplace, tag, limit=0):
	if limit == 0:
		return string.replace(str(textReplace), str(tag))
	else:
		return string.replace(str(textReplace), str(tag), limit)

# get a soupTree, a list, a classID, a typeElem and an index. wrap every occurance of every element of the list with an element tag, then for every created element class, append the incremented index 
def searchReplace(soup, lista, color, data, typeElem):
	for thing in lista:
		classID = color + 'Replace'
		tag = createElement (typeElem, classID, str(thing))
		soup = BeautifulSoup(insertElement(str(soup), thing, tag), 'lxml')
	toReplace = soup.find_all(typeElem, attrs={'class': classID})
	# print span
	for item in toReplace:
		
		item['class']=str(color)+ ' annotation span-' +str(data['class'])
		
		data['class']=data['class']+1
	return soup

def spanCites (soup):
	title = soup.find('h3', string='References')
	for sibling in title.next_siblings:
	  if sibling.name == 'div':
	  	break
	  if sibling.name == 'p':
	  	sibling.wrap(soup.new_tag('span'))
	  # print sibling
	  # print 'end sibling'



def NameParagraph(soup, tag):
	element = soup.find_all(tag, attrs = {'name' : None})
	if element:
		element[0]['name']=1
		i=2
		for sibling in element[0].next_siblings:
			if sibling.name == tag:
				sibling['name'] = str(i)
				i=i+1
		return NameParagraph(soup, tag)
	else:
		return

def createXpath(soup):
	NameParagraph(soup, 'h1')
	NameParagraph(soup, 'h2')
	NameParagraph(soup, 'h3')
	NameParagraph(soup, 'h4')
	NameParagraph(soup, 'a')
	NameParagraph(soup, 'p')
	NameParagraph(soup, 'div')
	NameParagraph(soup, 'table')
	NameParagraph(soup, 'tbody')
	NameParagraph(soup, 'td')
	NameParagraph(soup, 'tr')
	NameParagraph(soup, 'ol')
	NameParagraph(soup, 'ul')
	NameParagraph(soup, 'li')

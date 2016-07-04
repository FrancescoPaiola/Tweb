from bs4 import BeautifulSoup
import re
import lxml.html as lh
from lxml import etree

i=0
# return a list of all tags with style attr 
def hasStyle(tag):
	return tag.has_attr('style') 

# given an input soup, return a soup without scripts 
def extractScript(soup):
	script = soup.find_all('script');
	for elem in script:
		elem.extract()
	return soup

# given an input soup and a prefix, append the prefix for every image src
def fixImage(soup, prefix):
	image = soup.find_all('img')
	for elem in image:
		if not re.match('http', elem['src']):
			elem['src'] = prefix + '/' + elem['src'] 
	return soup

# given an input soup, search all tag with a style attr and set it blank (style=''). return a soup
def removeStyle(soup):
	style = soup.find_all(hasStyle)
	for elem in style:
		elem['style'] = ''
	return soup

# given an input soup and a prefix, append the prefix for every relative link, no anchors. return a soup
def fixLink(soup, prefix):
	link = soup.find_all('a')
	for elem in link:
		if elem.has_attr('href'):
			if not re.match('#|http', elem['href']):
				elem['href'] = prefix+'/' + elem['href']
	return soup

# remove cookie alert from document
def removeCookie (soup):
	div = soup.find(id='cookiesAlert')
	if div:
		div.extract()
	return soup

def fixAll(soup, prefix):
	soup = extractScript(soup)
	soup = fixImage(soup,prefix)
	soup = removeStyle(soup)
	soup = fixLink(soup,prefix)
	soup = removeCookie(soup)
	return soup

def dlib(doc):
	for elem in doc.xpath('//table[3]/tr/td/table[5]/tr/td/table[1]/tr/td[2]'):
		r = etree.tostring(elem, pretty_print=True)
	return r

def statistica(doc):
	for elem in doc.xpath('//*[@id="breadcrumb"]'):
		s = etree.tostring(elem, pretty_print=True)
	for elem in doc.xpath('//*[@id="content"]'):
		r = etree.tostring(elem, pretty_print=True)
	return s+r

def generalCase(doc):
	for elem in doc.xpath('//body'):
		r = etree.tostring(elem, pretty_print=True)
	return r

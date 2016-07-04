#!/usr/bin/python
# -*- coding: utf-8 -*-

#NON LA USIAMO (?)

from bs4 import BeautifulSoup
import re
import lxml.html as lh
from lxml import etree

def getTarget(string, tag):
	path = tag.name + tag['name']
	for parent in tag.parents:
		if parent.name=='body':
			break
		else:
			path = parent.name + parent['name'] + '_' + path
	return string+path
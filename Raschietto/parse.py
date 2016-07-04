import requests
from bs4 import BeautifulSoup
import lxml.html as lh
import urllib2
import json
import re
from lxml import etree
from parsingMethods import *

url="http://vitali.web.cs.unibo.it/TechWeb15/ProgettoDelCorso"
doc=lh.parse(urllib2.urlopen(url))
print doc
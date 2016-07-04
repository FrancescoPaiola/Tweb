from django.db import models

class Documents(models.Model):
	link =models.CharField(max_length=200)
	title =models.CharField(max_length=200)
	author =models.CharField(max_length=200)
	doi =models.CharField(max_length=200)
	year =models.DateTimeField('date published')
	



     	




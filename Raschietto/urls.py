from django.conf.urls import url

from . import views

urlpatterns = [
url(r'^$', views.index, name='index'),
url(r'load(.*)', views.load, name='load'),
url(r'parse(.*)', views.parse, name='parse'),
url(r'save', views.save, name='save'),
# url(r'forceParse(.*)', views.forceParse, name='forceParse'),
]
import os
import sys
import site

# Add the site-packages of the chosen virtualenv to work with
site.addsitedir('/home/web/ltw1551/data/env/local/lib/python2.7/site-packages')

# Add the app's directory to the PYTHONPATH

sys.path.append('/home/web/ltw1551/data/')
sys.path.append('/home/web/ltw1551/data/Raschietto')
os.environ['DJANGO_SETTINGS_MODULE'] = 'Raschietto.settings'

# Activate your virtual env
activate_env=os.path.expanduser("/home/web/ltw1551/data/env/bin/activate_this.py")
execfile(activate_env, dict(__file__=activate_env))

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

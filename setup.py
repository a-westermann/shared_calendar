import os
from setuptools import find_packages, setup

# Optional: Read the README for long description
with open(os.path.join(os.path.dirname(__file__), 'README.md')) as readme:
    README = readme.read()

# Allow setup.py to be run from any path
os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
    name='django-shared-calendar',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    license='MIT License',
    description='A simple Django app for a shared calendar.',
    long_description=README,
    long_description_content_type='text/markdown',
    url='https://github.com/a-westermann/shared_calendar',
    author='Andrew Westermann',
    author_email='a.westermann.19@gmail.com',
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 5.1',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
    ],
    install_requires=[
        'django>=5.1.1',
    ],
) 
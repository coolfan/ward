from setuptools import setup

setup(
    name='rooms',
    packages=['rooms'],
    include_package_data=True,
    install_requires=[
        'flask', 'pony'
    ],
)

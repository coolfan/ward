# Instructions for Clean Install on Server

## Cloning Repository

The first steps may be unnecessary depending on whether you have already configured git on the server in question.

### Adding a new SSH Key

First we generate a new key, being sure to use the email associated with your github account.
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```
Follow the prompts to save the key, being sure not to overwrite an existing key.
Copy the key to your clipboard
```bash
pbcopy < ~/.ssh/example_key.pub
```
Follow the steps at the link [here](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) to add the key to your account.

Edit your `~/.ssh/config` to include the following host:
```bash
Host github.com
     Hostname github.com
     IdentityFile ~/.ssh/github_rsa
     User git
```

### Clone

The repo is SSH configured so use
```bash
cd /n/fs/rooms
git clone git@github.com:EZlatin98/COS333.git
```

## Setting up environment

To use this application, we will need Python 3.6.1.  You can install this in any number of ways, 
but the following way will work even without root privileges (e.g. on the cycles server).

Download the tarball `Python-3.6.1.tar` and unpack it:
```bash
tar -xvf Python-3.6.1
```
We configure it to install in the project directory:
```bash
cd Python-3.6.1
./configure --prefix=/n/fs/rooms/python3.6/ --enable-optimizations
make altinstall
```

## Moving the Apache/Passenger files

Some files in the git repo need to be moved to the website root in order to work.  
*Note that Apache/Passenger must be configured to look at `webdirectory` first.*
```bash
cd /n/fs/rooms
cp COS333/htaccess webdirectory/.htaccess
cp COS333/index.cgi webdirectory/
```
The `.htaccess` file configures Passenger to use the `COS333` directory as the project root.  To tell passenger to 
restart the app (if files are changed or to initially start the flask app) we need to 
```bash
touch COS333/tmp/restart.txt
```



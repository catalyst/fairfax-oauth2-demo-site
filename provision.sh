#!/bin/bash

LOG=/tmp/provision.log

date | tee -a $LOG

locale-gen en_NZ.UTF-8 | tee -a $LOG

grep -q chris-lea/node.js /etc/apt/sources.list.d/*         || add-apt-repository ppa:chris-lea/node.js | tee -a $LOG

apt-get update | tee -a $LOG
apt-get upgrade -y | tee -a $LOG

apt-get install -y \
    build-essential 'g++' \
    nodejs \
    screen git \
    firefox \
    | tee -a $LOG

su - vagrant -c "ln -sf /vagrant /home/vagrant/oauth2"
su - vagrant -c "cd /home/vagrant/oauth2/; screen -d -m ./run_client_site.sh"


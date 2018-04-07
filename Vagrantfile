# This is partially taken from COS461's Vagrant file

Vagrant.configure("2") do |config|
    # 64 bit Ubuntu Vagrant Box
    config.vm.box = "ubuntu/trusty64"

    # Configure hostname and port forwarding
    config.vm.hostname = "rooms-vm"
    config.vm.network "forwarded_port", guest: 5000, host: 5000

    # Finds the project root
    vagrant_root = File.dirname(__FILE__)

    # Provisioning to do once when creating machine
    config.vm.provision "shell", inline: <<-SHELL
        sudo apt-get update
        sudo add-apt-repository ppa:deadsnakes/ppa
        sudo apt-get update
        sudo apt-get install -y python3.6
        curl https://bootstrap.pypa.io/ez_setup.py -o - | sudo python3.6 && sudo python3.6 -m easy_install pip

        sudo pip3 install flask pony

        # Start in /vagrant instead of /home/vagrant
        if ! grep -Fxq "cd /vagrant" /home/vagrant/.bashrc
        then
            echo "cd /vagrant" >> /home/vagrant/.bashrc
        fi
    SHELL

    # Provisioning to do on each "vagrant up"
    config.vm.provision "shell", run: "always", inline: <<-SHELL
        cd /vagrant
        export FLASK_APP="rooms"
        export FLASK_DEBUG=True
        python3.6 -m flask run --host=0.0.0.0
    SHELL

    # Configure CPU and RAM usage
    config.vm.provider "virtualbox" do |vb|
        vb.customize ["modifyvm", :id, "--cpuexecutioncap", "100"]
        vb.memory = 2048
        vb.cpus = 1
    end
end
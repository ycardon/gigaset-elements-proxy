# autoboot / make it a service

To create and autostart a ``gigaset-elements-proxy`` service under Raspian and any systemd enabled OS:

- create a service definition file ``/etc/systemd/system/gigaset-server@pi.service`` with the following content. The @pi is used in the service definition to tell it has to be run with this user rights.

    ```
    [Unit]
    Description=GigasetElements Server (local proxy to gigaset APIs)
    After=network.target

    [Service]
    Type=simple
    User=%i
    WorkingDirectory=/home/pi/gigaset-elements-proxy
    ExecStart=/usr/bin/node app.js
    Restart=always
    RestartSec=10

    [Install]
    WantedBy=multi-user.target
    ```

- start the service ``sudo systemctl start gigaset-server@pi.service``
- enable it so that it starts on next reboot ``sudo systemctl enable gigaset-server@pi.service``
- status of the service ``systemctl status gigaset-server@pi``
- logs of the service ``journalctl -fu gigaset-server@pi``

More deltails about systemd services on [Archlinux wiki](https://wiki.archlinux.org/index.php/Systemd#Writing_unit_files) (one of the most accurate information of linux systems)
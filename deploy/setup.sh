#!/bin/bash
set -euo pipefail
echo ">>> Updating system..."
apt-get update && apt-get upgrade -y
echo ">>> Installing Docker..."
apt-get install -y ca-certificates curl gnupg git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
echo ">>> Creating deploy user..."
useradd -m -s /bin/bash -G docker deploy
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
: "${DEPLOY_SSH_PUBLIC_KEY:?DEPLOY_SSH_PUBLIC_KEY is required}"
printf '%s\n' "$DEPLOY_SSH_PUBLIC_KEY" > /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
echo ">>> Setting up project directory..."
mkdir -p /opt/lorescryver
chown deploy:deploy /opt/lorescryver
echo ">>> Configuring firewall..."
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo ">>> Hardening SSH..."
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd
echo ">>> Setup complete! Server ready for deployment."

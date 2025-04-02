////////////////////////////
Docker Kurulumu:

sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

sudo apt install docker-ce

Kontrol:
sudo systemctl status docker
docker compose version

Kullanıcını docker grubuna ekle:
sudo usermod -aG docker $USER

Bugs:
katman silme çalışmıyor. fixed
katman stil değiştirme çalışmıyor
çizgi çiz aracı açıkken nokta çiz de açılabiliyor birbirine giriyor. fixed
çizilen featurelar duplicate oluyor. edit geomtery yapınca farkedildi.



tODO:
Bunlar tamamen opsiyonel fikirler:

🎨 Önizleme: Modal içinde canlı stil örneği gösterebilirsin

💾 Stil Şablonlarını Kaydet / Uygula: Aynı stilleri diğer objelere kolayca uygula

⏪ Geri Al (Undo): Önceki stil yedeğini saklayıp geri döndür

🎯 Stil Tabanlı Arama: “Tüm kırmızı poligonları bul” gibi
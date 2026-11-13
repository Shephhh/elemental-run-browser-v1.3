# Troll Obby — Seviye 2: Kar Parkuru

Bu belge mevcut parkuru tarif eder; oyun verisini değiştirmez. Troll 2'nin **sürüm 11** yerleşimi Troll paket sürümü 12'de değişmedi. Kar biyomu (faz 5), toplam ilerleme **381 m**. Altı aşama ve sıralı yedi kontrol noktası vardır. Aşağıdaki rota ve tuzak ayrıntıları spoiler içerir.

## Koordinatlar ve kontrol noktaları

X yana, Y yukarı, ilerleme **−Z** yönündedir. Platform verisindeki `y` üst yüzeydir; `h` aşağı doğru kalınlıktır. Oda içindeki pozitif mesafeler `dünya Z = oda başlangıcı − yerel mesafe` ile çevrilir. Kontrol noktalarının tamamı X=0, 12×7 m'dir; aşağıdaki Y değerleri yeniden doğuş yüksekliğidir.

| Nokta | Z (m) | Y (m) | Platform ID |
|---|---:|---:|---:|
| Başlangıç / CP0 | 0 | 8,004 | 0 |
| CP1 | −40 | 8,004 | 16 |
| CP2 | −136 | 8,004 | 67 |
| CP3 | −184 | 26,244 | 168 |
| CP4 | −268 | 34,244 | 211 |
| CP5 | −308 | 34,244 | 216 |
| CP6 / Bitiş | −381 | 34,244 | 283 |

Oyuncu kamera yönüne göre WASD ile hareket eder; Space zıplar, R mevcut kontrol noktasına döndürür. Çarpışma 120 Hz sabit adımla çalışır; v1.89.1 itibarıyla Troll temel hızı 7,0 m/s, zıplama hızı 9,5 m/s, yerçekimi 24 m/s², avatar AABB yüksekliği 1,8 m ve yatay yarıçapı 0,43 m'dir. Aynı yüksekliğe teorik temel atlayış yaklaşık 5,54 m yatay mesafe sağlar (bhop/dive hariç). Bu değer platform merkezleri arasındaki mesafe değildir: kalkış ve iniş kenarları hesaba katılır. Mevcut altı aşamalı güvenli rota yeni hızla fizik testinden geçti; geometri değişmedi. Y=1 altı düşüş sınırıdır.

## Altı aşama

### 1. Ölümcül parlak duvarlar · Z 0 → −40

Beş adanın merkezleri (X, Z): (0, −7,9), (1,25, −15,5), (−1,35, −23,1), (1, −30,7), (0, −34,7). Her ada 4,8×3,6 m. Neon kırmızı `gift` panelleri adanın iki kenarına kadar uzanır; dışlarından yürüyecek alan yoktur. **1.88.13:** kırmızı paneller 1,70 m yerine 0,45 m yüksekliğindedir (üst Y=8,45, alt Y=8); 1,3×3,6 m tabanları ve ölümcül temas davranışı korunur. Güvenli yöntem açık orta banda inmek ve her kalkışta sıradaki adanın X kaymasına göre yönü ayarlamaktır.

### 2. Çıkışı olmayan şeffaf labirent · Z −40 → −136

- Labirentin iç hacmi X genişliği 38,8 m, dünya Z aralığı −50…−126; 7×13 hücre sabit tohumla üretilir. Dış cephe opaktır; iç duvar, çatı ve iç zemin opaklığı sırasıyla %13, %10 ve %24'tür. Bu değerler yalnız görseldir; yüzeylerin çarpışması vardır.
- Ortadaki arka açıklık gerçek çıkış değildir: `mazeExitBlock` çizilmez ama 4,5 m genişlikte katı çarpışma içerir. İçeride son 9 m'ye girip merkeze yaklaşıldığında **WRONG WAY** görünür. Mobilde uyarı ayrı bir arayüz etiketi olarak da gösterilir.
- Dışarıdaki iki 1,65 m genişliğindeki kenar kullanılabilir. Kaynak güvenli rota soldaki yaklaşık X=−20,34 hattını kullanıp arka açık platform üzerinden merkeze ve CP2'ye döner.

### 3. Çöken sarmal ve ters sıçratıcı · Z −136 → −184

Sarmalın merkezi X=−5,8, Z=−144'tür. İç ve dış yarıçap 3,8 / 7,8 m. Üç tam turda **96 basamak**, her birinde **0,19 m** yükselme vardır; tırmanmak için zıplamak gerekmez. Basamak ilk temastan 2,45 s sonra desteğini kaybeder ve görsel olarak yumuşak biçimde kaybolur. Aynı denemede geri gelmez. Karakter ve kamera için görsel yükseklik yumuşatılır; fiziksel basamak yüksekliği değişmez.

Üst yol Y=26,24 m'de devam eder. CP3'ten hemen önce, Z=−175,75'te 3,6×1,5 m'lik normal taş görünümlü, 19 cm yükseltilmiş bir `reversePad` bulunur. Temas VX=−8,5, VY=+7, VZ=+19 m/s verir; +Z geriye doğrudur. Şeridi atlayıp arkadaki düz bölüme inmek gerekir.

### 4. Yuvarlanan kaya ve sahte kabinler · Z −184 → −268

77×7,8 m rampa koşu yönünde 8 m yükselir. Kaya yarıçapı 3,85 m'dir: merkezi X=0 üzerinde Z=−259,7 ile −188,8 arasında hareket eder. Aşağı 22 m/s, yukarı 17 m/s; her uçta 1,85 s durur. Kaya ölümcüldür ve kapalı bir kabinin görünmez giriş duvarına yaslanmak oyuncuyu korumaz.

| Kabin çifti Z | Açık sığınak | X |
|---:|---|---:|
| −202 | Sol | −6,5 |
| −222 | Sağ | +6,5 |
| −243 | Sol | −6,5 |

Kabinler 5,2×7,4 m; üç yan duvarı ve çatısı vardır. Açık olanın içine tamamen çekilip kaya geçince tekrar rampaya dönülür. Diğer kabinin açıklığı görünmez bir katı duvarla kapanır.

### 5. Kaçan bloklar · Z −268 → −308

Y=34,24 m'de dört adet 3,7×4,4 m blok vardır. Başlangıç merkezleri (X, Z): (0, −276), (0,4, −283,9), (−0,45, −292), (0,35, −300). Havadayken −Z yönünde Z=−280,65 ve −296 eşiklerine yaklaşmak, uygun X ve Y aralığında iki hareketi tetikler. Dört blok birlikte önce −1,90 Z uzağa, son tetikte +3,45 Z geriye kayar; her hareket 0,15 s sürer. CP4'e yeniden doğmak bu odanın kayma durumunu sıfırlar.

### 6. Matematiksel diken tahtası · Z −308 → −381

Tahtanın ön kenarı Z=−312,25; 4 sütun × 16 sıra, her kare 4×4 m. Soldan sağa merkezler X=−6, −2, +2, +6. Kareler bitişiktir. 32 görünür kırmızı diken plakası, 16 yem ve 16 güvenli kare bulunur.

- Kırmızı plakalar sabit satranç paritesindedir. Yanlış boş kareye doğru inerken oyun, düşey hız ve yerçekimiyle kalan uçuş süresini hesaplar; 0,29 s veya daha az kaldığında tahmini iniş karesi tuzağı tetikleyebilir. Havada yön değiştirmek iniş karesini değiştirebilir.
- Plaka yan komşusuna 0,16 s'de kayar, 0,54 s bekler, 0,24 s'de geri döner. Ölüm gerçek temasla olur. Geç inişte yem karesinde zıplama tamponu temizlenir; tutulmuş Space tuzağı otomatik atlatmaz.
- Soldan sağa **1–4** sütun numarasıyla ana rota, girişten itibaren şu sırayı kullanır: **2, atla, 2, 3, 4, 3, atla, 3, 4, 3, 2, atla, 2, 3, atla, 3**. “Atla” o sıraya hiç basmamak anlamına gelir. Alternatif güvenli kareler sıra/sütun olarak **1/4, 4/1, 9/2, 14/1**. Son sıra arkasındaki düz şerit CP6'ya bağlanır.

## Geliştirme ve doğrulama

- [obby-course.js](obby-course.js): `trollCourse(2)` platform, kontrol noktası, güvenli yol, hareket ve tuzak verilerinin kaynağıdır. Bu sürüm **284 platform kaydı, 91 tuzak etiketli platform ve bir kaya** üretir; diken plakaları tahta alanlarıyla tanımlanır, ayrıca `trap` kaydı değildir.
- [troll-obby.js](troll-obby.js): `TrollRace`, tahmini diken inişi, yeniden doğuş, sarmalın görsel kaybolması, kamera ve WRONG WAY davranışını yürütür. Çatı ve kabin içinde takip kamerası kısalır.
- Yeniden ölçmek için proje dizininde `node -e "const d=require('./obby-course.js').trollCourse(2);console.log(d.checkpoints,d.modules)"` çalıştırılabilir. Oda uzunluğu değişirse sonraki kontrol noktaları, hareket tetikleri ve diken koordinatları yeniden kontrol edilmelidir.

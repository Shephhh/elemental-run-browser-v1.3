# Troll Obby — Seviye 3: Siber Denetim

**Oyun v1.88.12 · Troll CourseVersion 15 · Cyber (faz 0) · 711 m.** Çözüm ayrıntıları içerir. Oynanabilir geometri değişmedi; ses sistemi üç seviyede de çalışır.

X yana, Y yukarı, ilerleme −Z yönündedir. v1.89.1 itibarıyla Troll temel hızı 7,0 m/s, zıplama hızı 9,5 m/s, yerçekimi 24 m/s²; swept-AABB 120 Hz. Özel buz ivmesi ve 23,5 m/s sınırı korunur. Altı kontrol noktasının tamamı X=0, Y=8,004 ve 12×7 m. Ölüm veya R son kontrol noktasına döndürür. Mevcut 711 m rota yeni hızla baştan sona fizik testinden geçti; geometri değişmedi.

| Oda | Dünya Z | Yeni düzen |
|---|---|---|
| 3-1 · Trafik | 0 → −145 | 138×8,8 m tek koridor; dört tam genişlikte kırmızı bar, ortalı sütun ve iki yan sütun. |
| 3-2 · Neon şeritler | −145 → −289 | Altı adet 137×2,57 m uzun şerit. Mavi ve pembe üçlüler renk olarak birlikte faz değiştirir. |
| 3-3 · Rüzgâr | −289 → −434 | 138 m dar köprü, dokuz engel; oyuncuyu izleyen ve köprü altından taraf değiştiren yan vantilatör. |
| 3-4 · Hız buzu | −434 → −607 | 150,5 m buz ve 15,5 m son boşluk; tarayıcı, kırmızı bloklar ve üç kırmızı bar. |
| 3-5 · Kuşbakışı | −607 → −711 | Dört sol–sağ kutu çifti; çizgili ölüm tuzakları, hareketli iniş ve son travers. |

## Kurallar ve güvenli rota

- **3-1:** Barlar yerel 17 / 25,2 / 33,4 / 41,6 m'de; kenardan dolaşılamaz. 66 m'deki orta sütunun yanından geç, 70,25 m'deki yan sütunlar gelmeden merkeze dön. GO büyük fosfor yeşil, STOP büyük kırmızı. 116 m sonrası ilk STOP, 1,14 s kırmızı → 0,23 s GO → 1,52 s kırmızı şaşırtmacasını bir kez tetikler. Soldan gelen yumruk yine sağa fırlatır.
- **3-2:** Şerit uçları Z=−148,5 ve −285,5; komşu şeritler arasındaki boşluk 1,05 m. Renkler her 4,4 s'de değişir; geçişte 0,26 s çarpışma toleransı vardır. Normal kaybolma öncesi 0,48 s başlayan sarı uyarı işaretleri tolerans boyunca da kalır; şerit 0,64 s'lik görsel parçalara ayrılarak düşer. Son 20 m'de tuzak, bastığın şeridi **önce 0,62 s boyunca işaretler ve katı/görünür tutar**. Ardından **oyuncunun bastığı şerit tam opak ve eski görünümünde kalır**; kenarlarından küçük parçalar koparak sahte kırılma efekti verir. Ana şerit efekt bittikten sonra da görünür ve basılabilirdir. Bu sahte kırılma başlangıcından sonraki 0,10–0,27 s aralığında karşı renk kısa görünür; çarpışması yoktur ve o da parçalanır. Kontrol noktası platformu/halkası her zaman görünürdür, halka kırmızıyken platform kilitlidir. Mevcut şeritte dur; sahte kırılma başladıktan en az 0,97 s sonra şeritler dönüp halka altın olunca ilerle. Durmadan koşmak veya atlamak kontrol noktasını açmaz. Parçalar basılabilir yeni platformlar değildir.
- **3-3:** Vantilatörün Z konumu oyuncuyu takip eder. Gövde daima köprüye yandan üfler; yön değişince X boyunca köprünün altından dolaşır. Rüzgâr çizgileri masaüstünde dokuz, mobilde beş ile sınırlıdır. Dokuz bariyeri aşarken rüzgârı A/D ile dengele.
- **3-4:** W hızlandırır, S frenler, A/D kaygan zeminde yön verir. Üst sınır 23,5 m/s; havada ileri hız korunur. Uzatılan bölümde 113 ve 140 m'de ek yan bloklar ve 126 m'de üçüncü kırmızı bar var. Son kenar Z=−588, inişin ön kenarı Z=−603,5. Son işaretten yeterli hızla sıçra. Kuru iniş zemini temasta fazla momentumu keser.
- **3-5:** Dört çift yerel 15,5 / 33,5 / 51,5 / 69,5 m'de. Kuşbakışı öncesinde iki kutunun görünen üstü Y=8; kamera yükselince gerçek Y=9,30 / 7,35'e yerleşir. Yüksek kutular sol–sağ–sol–sağ sırayla gelir. Fizik baştan itibaren gerçek yüksekliği kullanır. Dört uzun kırmızı şerit ve finaldeki kırmızı blok öldürür. Hareketli levhayı ve son traversi geçerek CP5'e ulaş.

## Ses ve kayıtlar

- `audio-system.js`: mevcut SFX ses yolunu kullanan kısa sentezlenmiş adım, zıplama, iniş, tuzak, kontrol noktası, ışık ve bitiş sesleri. Bir çevre sesi kanalı rüzgâr, buz ve kayan kaya arasında geçer. Duraklatma ve moddan çıkış sesleri keser.
- Gerçek ölümlerde alfa kanallı, paylaşılan tek WebP'den 16 (mobilde 10) daha büyük kedi çıkar ve söner. Ekranın tamamına dağılır; orta görüş alanı daha açık tutulur. Azaltılmış hareket tercihinde 6 kullanılır. Yarısı aynalıdır. Ses mevcut SFX düzeyini izler ve ilk iki saniye sonunda kısılır. Elle yeniden başlatma efekti tetiklemez.
- `obby-course.js`: fizik ve oda verisi; `troll-obby.js`: fazlar, görsel yükseklik, fan, olay sesleri ve HUD.
- v14'ün Troll 3 süresi `legacyTroll3V14Best` alanına taşınır. Eski arşivler, Troll 1/2 rekorları ve bölüm erişimleri korunur.
- `node output/troll-1883-course-test.cjs` tam rotayı, iki rengin tuzağını, koşma/zıplama kısayollarını ve uzun buz sıçramasını sınar. `node output/troll-1891-sequence-test.cjs` yeni uyarı → gizleme/parçalanma sırasını, görünmez desteği ve respawn sıfırlamasını doğrular. `output/verify-lane-breakup-1891.mjs` tarayıcıda uyarı işaretleri, sabit havuzlar, parçalanma, geri dönüş ve azaltılmış hareket tercihini test eder.

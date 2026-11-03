# Early game revision — v1.71.1

1.71.1 lobi rehberi: İlk gerçek mod oynanışı Games oklarını kalıcı kapatır.
Sonraki ilk uygun ana-plaza ziyaretinde, alınabilir normal stat upgrade varsa
bir kez upgrades daveti çıkar. Panel açma/satın alma/alandan ayrılma/para
yetmezliği daveti bitirir; tekrar giriş ve reload tekrar başlatmaz. Modal ve
prewarm görünmeyen daveti tüketmez. Yalnız eldiven/rebirth alınabilmesi bu
normal stat standını tetiklemez. Satın alma dayatılmaz. Tutorial->Level1 aynı.

## Dayanak

31Ekim panel analizi:500oynanış,2:07ortalama,%11.2üçdakika+,%72.2ikidakikaaltı.
Bu bir SDK metriğini büyütme çalışması değil; oyuncunun ilk gerçek deneyimindeki
bekleme, kontrol/karar yükü ve ani güçlüğü azaltma çalışmasıdır.

### Araştırma

- [Poki: Easy access & onboarding](https://developers.poki.com/guide/easy-access):
  yalnız gerekli başlangıç içeriğini yüklemek, görsel öğretmek, güvenli başlamak
  ve özellikleri aşamalı göstermek. Projede bu yüzden öğretim sahnesi korunur,
  lobi/normal trafik ilk tutorial'ın ön koşulu olmaktan çıkarılır.
- [Poki: Engagement](https://developers.poki.com/guide/engagement): ilk oturum,
  net hedefler, kademeli zorluk ve sürekli eylem. Bu yüzden Games'e kısa yol,
  Level3'ün yumuşatılması ve erken doğrudan Retry öncelikli.
- [CrazyGames: First frame](https://docs.crazygames.com/resources/getting-to-the-first-frame/)
  ve [kalite rehberi](https://docs.crazygames.com/requirements/quality/): ilk
  oynanabilir içeriğe hızlı erişim; tutorial içinde temel hareketler; uzun metin
  yerine görsel kontrol ipucu. Yeni mod/meta-sistem eklenmedi.
- [web.dev: Optimize long tasks](https://web.dev/articles/optimize-long-tasks):
  sadece fonksiyonlara bölmek ana thread'i boşaltmaz; ayrı task/yield gerekir.
  Projenin mevcut covered/yield/GPU iş sahipliği korunur. Ağ/CPU hazırlığı ile
  GPU upload'ı aynı şey değildir; bütün işleri oyun sırasında başlatmak çözüm
  olarak kullanılmadı.

## Uygulanan akış

Loading→tek PLAY→3-2-1→güvenli jump/slide/lane/bhop→finish→opak Level1 hazırlığı→
Level1→mevcut sürekli kampanya. Oyuncu lobiye dönünce şapka AL + Games erişimi.

1.71.0, önceki Games doğuşunu güncel istekle değiştirir. İlk gerçek koşu öncesi
oda/mod seçimi ve kozmetik hazırlığı yok. Şapka hakkı kayıtta korunur, ilk lobi
ziyaretinde alınır. Kontroller hemen tekrar gösterilmez. Hata sonrası aynı
hazırlık sınırlı otomatik tekrar + in-session Retry ile kurtarılabilir. Görünür
Retry ekranı pointer lock'u bırakır; olaylar artık boş Error {} yerine okunabilir
aşama/mesaj/stack/kaynak içerir. SDK iç ağının düzelttiği veya retansiyonun
kesin arttığı iddia edilmez. Yeni yükleme ve canlı test gereklidir.

İlk üç seviyede uzun trenler ile mixed-row düşen duvar/trenler ertelendi;
L2–3 trafik biraz yavaş, satırlar arası boşluk daha geniş. L4+ ve ödüller aynı.
İlk lobi ziyareti de hazırlanmış sahneye açılır. Opsiyonel şapka modelinin
indirme hatası lobiye erişimi engellemez; kazanımı/claim'i silmez.

Geçmiş 1.70.1 (1.71 ile değişti): Tutorial sonrasında ana plaza başlangıcına doğma kaldırıldı. Gerçek
Games sahnesi görünmeden hazırlanır, karakter güvenli orta noktaya yerleşir ve
dönüş konumu burada kaydedilir. Şapka ödülü korunur; ana lobiye dönüş portalı
ve diğer başlangıç akışları değişmez.

Tek ilk kullanıcı hareketi ve doğru pointer lock korunur. Tutorial yeniden
gösterme/save versiyonu yükseltilmedi: eski oyuncuya zorla eğitim tekrarı yok.
Şapka ödülü/AL kuralı, müzikler, 2D, Surf/Party fiziği, cüzdan/ödüller değişmedi.

### Teknik değişiklikler (1.70 temeli; 1.71 farkları yukarıda)

- `game-runtime.js`: ilk eğitimde büyük araç GLB istekleri ve plaza prewarm
  zorunluluğu yok; ilk gerçek tutorial render/shadow varyantları kapalı ekranda.
  Tutorial arabaları zaten forceProcedural öğretim modeli olduğundan görsel
  değişiklik yok. Normal moda girerken gerçek GLB prepare hâlâ beklenir.
- Koridor90/210/330/450m; iki bhop sırası42m aralıklı; finish115m ileride.
  Önceki105/245/385/525m,üçsıra,175mfinish. Prompt mesafesi ve güvenli geri
  sarma aynı; amaç yeni bir hareket değil tekrarı azaltmaktır.
- `tutorial-director.js`: ekstra .65snbaşlık beklemesi yok;3sncountdown.
- `mode-concourse.js`: oda hazır olmadan açılmaz ama seçilmemiş NatureLevel1'i
  yüklemez. Ağır modlar kendi geçiş örtüsünde, hazır cache tekrar kullanılır;
  interaktif Games içinde otomatik GPU kuyruğu yok.
- `lobby-hub.js/css`: rehber yazısı tek dokunma/Enter/Space Games kısayolu;
  modal veya başka mod yönlendirmesi yok. Nativebuffer/MSAA aynıdır. Render
  sonrası fence drain ortak250msbest-effort; program compile hâlâ beklenir.
- `level-system.js/runtime`: ilk3seviye iki açık şerit; yaklaşan trafik biraz
  daha yavaş ve satırlar daha seyrek,compound formations ertelenir. Açık
  şeritler deterministik desteyle bütün yol boyunca değişir. L4–5 kademeli;
  L6+üretimi değişmez. Hedef puan/süre/ödül formülleri aynı.
- Erken ölümde reklamla dirilme ara penceresi açılmaz; sonuç/retry doğrudan.
  Space/Enter Retry odağı. Eldivenin revive hakkı önce değerlendirilir; daha
  sonraki isteğe bağlı reklam akışı ve ayrı mod UI'ları korunur.
  Retry tam genişlikte ve 48px dokunma hedefli; ikincil eylemler 44px.
  Henüz bölüm bitirmemiş oyuncuya genel sonuç metni yerine tek kısa,
  çevrilmiş kontrol ipucu gösterilir.
- Vendor addonları aynı `three.module.min.js` core'una göreli import kullanır.
  Import-map gerektirmeyen graph; herhangi bir harici polyfill/CDN eklenmedi.

## Yeni ölçümler

- `early-flow / boot-ready / first|return`: yüklemenin hangi akışla bittiği.
- `portal-intent / games|plaza|level|endless|surf|obby|runner2d / enter`.
- `portal-ready / aynı-mod / Ns`: hazırlık tamamlanma süresi;120snkovası üst sınır.
- `hub-area / games|plaza / enter`: oda değişimi.

Bunlar backend oturum ID'si veya son çıkış garantisi değildir. Mevcut SDK
start/stop, session-v2, pause/ad/hidden hariç tutma değişmedi.4695s anomalisi bu
early-game revizyonunda sessizce kırpılmadı; ayrı ölçüm teşhisi olarak açık.

## QA ve sınırlar

1.71: Temiz masaüstü doğrudan tutorial→Level1, ölüm→Retry, lobi→şapka AL geçti.
İki zorlanmış compile hatasından sonra gerçek DOM Retry ile, reload olmadan
Level1'e geçiş test edildi. Aynı testte şapka GLB istekleri sürekli kesilse de
lobi/ödül akışı çalışıyor. Tek hata sonrası otomatik retry, mobil-UA640×360
akışında da geçti. Bu test pointer-lock yüzünden çalışmayan kurtarma tıklamasını
buldu; giderilip tekrar test edildi. Bütün modların giriş/pause/resume/return
testi geçti; beklenmeyen page/shader error yok. SDK saat farkı .0001sn.
QA completion hook yalnız tutorial süresini atlar, geçiş hazırlığını atlamaz.
CPU recovery171 sınırlı retry/context-loss/readable-error/SDK rejection testleri
geçti. Gerçek .34 production hatasının kök nedeni boş logdan kanıtlanamadı;
aynı hata sınıfına karşı bağımlılık azaltma ve kurtarma düzeltmeleri uygulandı.

CPUtest `output/early-170-test.cjs`:69.000L6+blueprint eskiZIP ile aynı,
3.000erkenrow deterministik/şerit kapsaması;5runtime fizik/render fonksiyonu
ve curvedpath eskiZIP ile aynı. Mevcut queue,cancel,render-surface,
localization,session169veParty162regresyonları korunur.

Önceki 1.70 testleri: Resmî web-game istemcisiyle localhost mockedSDK: gerçek PLAY/countdown,
tutorial→hat→lobi→Games, bütün modlar pause/resume/return; Space ile erken
ölüm→Retry ve import-map kaldırılmış HTML yüklemesi test edilir. Clock testinde
yanmodlar QA'da0dtile tutulur; productionfizik değiştirilmez. Doğal tutorial
klavye girdisi ve 640×360 touch-capable mobil düzen ayrıca kontrol edildi.
Masaüstü ve mobil boyutta tüm modların giriş/duraklat/devam/lobi dönüşü geçti;
yeni sayfa/shader hatası yok. Mock SDK saat farkı sırasıyla .0001/.0004sn.
Eski kayıtla PLAY→lobi (tutorial/şapka tekrarı yok) ve Enter ile Retry de geçti.
640×360 ekranda Retry 422×48px; yeni sonuç kartı görsel olarak kontrol edildi.
Sonuçlar ve testin kontrollü simülasyon sınırları progress.md'de.

Testler Chromium/softwareWebGL'dir. Gerçek düşük güçlü telefon/Safari,
canlı reklam veya sıfır FPSdrop garantisi değildir. Rapor edilen PlayerFit
iyileşmesi bu değişikliklerin sonucu sayılamaz: baseline önceki upload'lardır;
1.71 henüz yüklenmemiştir. Harita ticari yeniden dağıtım izinleri hâlâ doğrulanmalıdır.

## Sonraki canlı doğrulama

Aynı kategori/cihazla yeni testte ilk2dakika kovası,3m+oranı,portal-intent→
portal-ready→mode-v2 girişleri ve ilk15snframe-time karşılaştırılmalı. Hedef,
oyunda gerçekten geçirilen süreyi arttırmaktır; menü/loading'i oynama saymak değil.

# Poki teknik paket kontrolü — 1.74.1 / 3 Kasım 2026

- 1.74.1: Shared Troll/Party finish horizon +400m ground/+240m decor; playable
  finish unchanged. Actual levels reference included. CPU/browser horizon checks.

- 1.74.0: Troll exact hub clone / independent orbit, no confetti, bounded decor,
  analytic camera probe, stronger deterministic traps; shared Party unchanged.
  CPU safe-route and desktop/mobile lifecycle tests; no real-phone FPS certification.

- 1.73.1: Troll Obby oda tasarımı ve gerçek Party Nature/Snow/Cyber çevreleri;
  mat gerçek-ölçülü geometri, dinamik crumble +retry.62fiziksel rota bağlantısı,
  Party/surface regresyonu ve masaüstü/mobil akış testleri. Troll courseVersion2.

- 1.73.0: Ayrı Troll Obby portalı, üç parkur/dört deterministik tuzak ve üçüncü
  şahıs kamera. Ortak fizik/skin ve Party Run korunur; bağımsız kayıt, ortak
  lokalize UI, tek aktif sahne/renderer ve instanced konfeti.75erişilebilirlik
  bağlantısı, trap/CP/finish/camera/input/Party regresyonları yerel test edildi.
  Yükleme/countdown SDK oynanışı sayılmaz; gerçek Inspector ayrıca test edilmelidir.

Bu klasör ve aynı isimli ZIP güncellenmiştir. Poki'ye veya web sitesine yükleme
yapılmamıştır. `index.html` ZIP kökündedir, `output/` test/araç/yedekleri ZIP'e girmez.

## Yapılan teknik kontroller

- 1.72.2: İstek üzerine görsel yükleme tahmini, yumuşak bar ve tek ondalık.
  Gerçek ilerleme ayrı; hazır olmadan100/PLAY yok. Gerçek bitişte anında100,
  animasyon temizlenir. Hata/context beklemesinde tahmin ilerlemez. Oynanış,
  shader hazırlığı, SDK zamanlaması ve yükleme bitiş koşulu değişmedi.

- 1.72.1: Tutorial+Level1 gerçek araç/Nature/ghost hazırlığı PLAY'den önce
  tamamlanır. Uzak tutorial mesh/coin buffer'ları da önceden çizilerek ısıtılır.
  Park etmiş araç, mavi overhead beam ve eski bariyerlerle beş farklı pratik
  silueti. Tutorial'a özel sis-altı render culling; collider/rewind korunur.
  Genel preset/çözünürlük, normal beam üretimi ve gerçek trafik GLB'leri aynı.
  İlk loading biraz uzayabilir; tutorial->Level1 ek loading ekranı kullanmaz.

- 1.72.0: 10 alıştırmalı tutorial; altın izli iki yön rotası, tekrar jump/slide,
  üç sıralı bhop, küçük ilerleme noktaları. Nature+gerçek araçlar+ghost hazırlığı
  tutorial içinde detached/dilimli; finish hazır olana kadar güvenli koşu sürer.
  Tutorial->Level1 siyah/loading kartı veya reset kullanmaz, koordinat/kamera/
  pointer/ses korunur. Puan/süre ve bankalı altın yeni denemeden ayrılır.
  Eski tamamlayan kayda zorunlu tutorial tekrarı yok. Normal mod/retry hazırlığı
  aynen durur. Canlı Poki iç gameframe fullscreen izni ayrı host kısıtıdır.
  Son masaüstü doğal tuş akışı ve mobil-emüle dokunmatik testleri geçti:
  10 ders, kesintisiz geçiş, ghost devralma, ölüm/Retry, sıfır loading/black
  katmanı ve tutorial->Level1 boyunca tek SDK gameplayStart. Konsol hatası yok.
  Gerçek telefon FPS'i veya canlı Poki onayı anlamına gelmez.

- 1.71.2: Poki iframe izni varsa lobi fullscreen simgesi ve ortak grafik
  ayarlarında gerçek kullanıcı-tıklaması toggle. Otomatik talep veya sahte
  borderless seçeneği yok. İzin yoksa kontrol gizli; reddedilen Promise yakalanır;
  native çıkışta aria-pressed/düğme vurgusu senkron. Dış Poki fullscreen
  düğmesi Poki ekibine aittir; onun etkinleştirildiği iddia edilmez.

- 1.71.1: Bir gerçek mod oynanınca Games rehberi kalıcı kapanır. İlk uygun
  ana-plaza ziyaretinde yalnız alınabilir stat upgrade için tek davet gösterilir;
  panel/purchase/ayrılma sonrası tekrar etmez. Modal/prewarm'da tüketilmez.
  Rehber v2 mevcut storage key ile migrate olur; çeviri anahtarları korunur.

- 1.71.0: Tutorial doğrudan Level1'e geçer; şapka ilk lobi ziyaretine ertelenir.
  Bounded hazırlık retry, in-session recovery, pointer release/paused preparation,
  optional hat model indirmesi ve okunabilir hata kayıtları. İlk3level tren/mixed
  ileri engel tuzakları ertelendi; L2–3 daha geniş aralıklı. SDK returned-Promise
  hataları gözlenir; aktif saat/gerçek lifecycle tanımı değişmez. Önceki Games
  doğuşu artık geçerli değildir. Sonuçlar progress.md'dedir; live upload yapılmadı.

- 1.70.1: Tutorial finish doğrudan Games odasına geçer; hall prewarm opak
  geçiş altında beklenir. Şapka ödülü ve moddan Games'e dönüş konumu korunur.
  Ana plaza portalı ve diğer lobi girişleri değişmez.

-1.70: İlk tutorial öncesi plaza/araçGLB hazırlığı kaldırıldı; doğru tutorial
 display+shadow path loading altında ısıtılır. Tutorial→lobi gerçek hazırlık
 opak geçiştedir; oynanırken GPU hazırlığı yok. Games girişi seçilmemiş Level1'i
 zorla hazırlamaz. Kısa3sncountdown, daha kısa eğitim koridoru/two bhop rows,
 iki kaçışlı L1–3 ve erken doğrudan Retry; eldiven/ekonomi/normalfizik korunur.
 Three addonları import-map gerektirmeden aynı core URL'sini kullanır.
 EARLY_GAME_REVISION.md araştırma/uygulama/test notudur. Canlı sonuç için yeni
 upload/test gerekir; bu güncelleme eski PlayerFit sonuçlarını değiştirmez.

-1.69: Özel aktif süre tüm modlarda/lobide gerçek performans saatine taşındı;
  clamped physics dt artık analitik saat değildir. Tek gerçek-control resolver,
  dedupSDK,250msheartbeat, focus/hidden/ad/countdown/preparation hariç tutulması,
  geçSDK ve idempotent loading eventleri. Her modda tanı: aktif/SDK çağrı saati,
  fark, son96state. Yeni olay sözlüğü POKI_SESSION_MEASUREMENT.md içindedir.
  Shader helper dispose/context kaybında nativeisReady timer hatasını önler ve
  beklemeyi8sn sınırlar. CPU300s/çeşitliFPS; mockedSDK desktop tüm modlar ve touch
  Surf/lobi giriş-pause-resume testleri. Canlı Player Fit süresini değiştirdiği
  iddia edilmez: yeniZIP yükleme ve yeni test gerekir; eski sonuçlar aynı kalır.

-1.68:23snsonrası videodaki küçük sol-alt çizim doğrulandı. Nature warm-up
  görünürcanvas'a çizmez, renderer durumu compile promise'inden önce geri kurulur.
  Her görünür3Dkare tam viewport/scissor ile başlar; lobi native buffer/MSAA aynı.
 800×450/640×360 masaüstü,640×360touch veDPR2 kontrolleri; yapay geciktirilmiş
 shaderlar sırasında ve mod dönüşlerinde bozuk viewport sayısı0. Tutorial sayacı
 gerçek dünyada blur/scrim; Surf ESC çıkış UI'sı kaldırıldı. Küçükpencere HUD,
 ayarlar/pause/result ve ödül yerleşimi aynı tema ile kompakt. Gerçek telefon FPS
 veya canlı reklam testi iddia edilmez; lisans/Inspector yayın kontrolleri sürer.

-1.67: İlk PLAY→hazır eğitim→animasyonlu başlık/3–2–1→lobi/şapka;
  tamamlanmış oyuncu→lobi. SDK gerçek etkileşimden önce başlamaz. Yalnız Games
  yönlendirmesi, oynanmayan portal/sütun nabzı, ortak3D müzik/korunan2D müzik,
  Surf2toplama=1altın ve Party süre bazlı max60altın. Eski idle Nature GPU
  scheduler yalnız kapalı hazırlıkta; mobil direkt eğitim viewport'u geri kurulur.

-1.66: Dönüş portalı/düğmesi ortak kamera animasyonundan sonra alan değiştirir,
  koşu başlatmaz.30 dil/247UI anahtarı ve placeholder kontrolü, fare kontrolü
  eksikleri ve seviye arayüzünün İngilizceye düşmesi düzeltildi. Native çözünürlük,
  önceki yükleme ve iptal düzeltmeleri korunur. Dil uzmanı onayı iddia edilmez.

-1.65.1: Kullanıcı talebiyle yalnız lobi çizim kalitesi eski ayara alındı:
  tam drawing-buffer çözünürlüğü, masaüstü max2MSAA/mobilFXAA.1.65 piksel alanı
  sınırı geçerli değildir. Yükleme, iptal ve kuyruk düzeltmeleri korunur.

-1.65:1.64'ün etkileşimli Games alanında otomatik bütün modları hazırlaması
  kaldırıldı. Açılış için gereken işler opak yükleme katmanı içinde tamamlanır;
  Surf/Party seçilmedikçe GPU hazırlığı başlamaz. Lobi FPS seyreltmesi kaldırıldı,
  HDR tek örnek+FXAA ve piksel alanı bütçesi var. İptal gerçek işi durdurur;
  hazırlık hatası karakteri güvenli yere geri alır.1400ms yarım-kalan-iş kuralı
  artık geçerli değildir; ilk soğuk mod hazırlığı gerekebilir.

-1.64: Games odasında kısa yükleme + arka plan tek-sahipli mod hazırlığı. Masaüstü
  ve mobil resmi testte hazır Party/Surf sahneleri korunarak dört giriş yapıldı;
  sayaç/paralar sıfırlandı, native pause/menü ve lobiye dönüş çalıştı. Normal portal
  gerçek tutorial'a ulaştı. Yükleme sırasında gameplay/ödül saati başlatılmadı.
  İlk GPU hazırlığı cihaz/ağa bağlıdır; bütün modların1400ms'de yüklenmesi veya
  sabit60FPS garantisi verilmez. Eski görüntü gelirse cache sürümü1.64.0'dır.

- Poki modunda SDK dışında harici ağ isteği yok. Ülke sorgusu Poki'de kapalıdır;
  tarayıcı dili ve kullanıcının dil seçimi korunur. Yazı tipleri/kütüphaneler yereldir.
- `gameLoadingFinished` sonrası ilk kullanıcı girdisinden önce `gameplayStart` yok.
  Başla/dur olayları ardışık kopyalanmaz; reklam yaşam döngüsünün mevcut kapıları
  korunur. Oynama süresini yapay artıran değişiklik yapılmadı.
- Poki'de gizli DEBUG para/harita/noclip tuşları devre dışıdır. Yerel/web geliştirme
  davranışı korunur. Dış mağaza bağlantıları mevcut Poki filtresiyle gizlenir.
- localStorage/sessionStorage erişiminin tamamen engellendiği açılış ve normal
  portal→tutorial testi geçti. Çark yükleyicisindeki korumasız storage okuması
  try/catch ve güvenli başlangıç durumu ile düzeltildi. Depolama kapalıysa ilerleme
  yalnız mevcut oturumda kalır; tarayıcı kapatılınca kalıcılık garanti edilmez.
- Resmi Playwright istemcisiyle masaüstü ve mobil: lobi/7portal, 2D karşılıklı
  yerleşim, son konuma dönüş,9Party sahnesi, çevre aralıkları,12GLB yükleme/parse,
  iki MP3 decode/süre kontrolü. Sayfa/shader hatası ve izinsiz dış istek yok.
- Paket güncelleyici/verify scriptleri tüm ZIP girdilerini kaynağın SHA256 değeriyle
  karşılaştırır; test çıktıları yayımlanmaz.

## Sıkıştırma

-12GLB toplam36,064,412 →20,788,164byte. Meshopt geometri payload'ı, mesh/node/
  accessor/material/skin/animation yapısı aynı. Sadece color/emissive görselleri
  aynı çözünürlükte WebP94 veya98; PSNR≥38dB ve alpha aynılığı kontrol edildi.
  Normal/roughness/occlusion haritaları değiştirilmedi. Bir dosyada kazanç yoksa
  orijinal bitmap korunur. Bu işlem kayıplı renk sıkıştırmasıdır, pixel-exact değildir.
- İki müzik toplam7,344,815 →4,785,777byte. Stereo/duration ve oyun ses seviyeleri
  aynı; MP3 VBRq4. Kaynakların yedekleri yalnız `output/asset-size-163` içindedir.
- Bellek/VRAM kazancı iddia edilmez; resim çözünürlükleri aynı olduğundan asıl
  kazanç dosya/indirme boyutundadır. Gerçek telefon FPS testi yerine geçmez.

## Yayın öncesi hâlâ yapılması gerekenler

1. ZIP'i Poki Inspector'da gerçek hesabınla ve en az bir gerçek telefon/tablette
   dene; gerçek reklam callbacks/ağ koşulları/arka plan dönüşü için manuel QA yap.
2. `assets/courses/README.md` hazır Surf/Bhop haritalarının ticari dağıtım
   izninin **doğrulanmadığını** açıkça kaydeder. Teknik paket hazırlığı bu izni
   sağlamaz. Harita haklarını doğrulamadan bunu onaylanmış ticari yayın sayma.
3. Kullanıcı tarafından sağlanan müzik ve modellerin dağıtım haklarını doğrula.

Resmi kaynaklar:
- [Poki gereksinimleri](https://developers.poki.com/guide/requirements-quality)
- [SDK olayları](https://developers.poki.com/guide/sdk-overview)
- [Poki Inspector](https://developers.poki.com/guide/inspector)
- [Build yükleme](https://developers.poki.com/guide/adding-your-game)

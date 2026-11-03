# ELEMENTAL RUN — geliştirme bağlamı ve devir notu

> Son standart web/Poki kaynak paketi: `BUILD.json` sürüm **1.74.1** (3 Kasım 2026). Klasör adı değişmedi. Geçmiş konuşmadaki tüm isteklerin aynen geçerli olduğunu varsaymayın; aşağıdaki güncel bölüm ve kaynak kod esas alınır.

## 1.74.1 — Bitişten sonra devam eden çevre

Troll/Party ortak zemini finish'ten400m öteye uzanır; eski merkezleme zemini45m
sonra kesiyordu. Dekor planı/backdrop240m öteye hazırlanır, kaynak model bütçesi
korunur. Oynanabilir platform/CP/finish kuralları aynı. LEVELS_TROLL_PARTY.md güncel
Troll koordinat envanteri ve Party9playlist özetidir. GitHub Pages yayını ayrı
output/site-publish checkout'unda aynı mevcut depoya gönderilir; durum progress.md.

## 1.74.0 — Troll lobi avatarı/kamera ve performans düzeni

Gerçek lobi modeli klonlanır (gövde/yüz/sahip olunan şapka, uzuv yok); orbitten
bağımsız hareket yönü. Aynı60FOV/10.5m kamera/.48pitch. Konfeti yok; dekor
üçgenleri kamera çarpışmasında taranmaz, analitik course-AABB sorgusu kullanılır.
Biyom model bütçeleri/fog-safe culling, contact shadow/rim light ve malzeme ayarı.
Yaklaşınca kaybolan zemin, aşağı iten duvar ve görünmez ölüm hacmi; courseVersion3.
Ölçüm tüm kasmanın giderildiğini kanıtlamaz; gerçek telefon FPS testi ayrıca gerekir.
Ayrıntılar TROLL_OBBY_AI_HANDOFF.md.

## 1.73.1 — Troll Obby parkur/çevre revizyonu

İki sıralı taş tekrarı yerine altı farklı oda ailesi: kırık köprü, gizli duvarlı
balkon, geri pad/yan rota, zikzak hediye galerisi, çöken merdiven ve karma final.
Nature/Snow/Cyber çevresi Party Run'ın gerçek sky/zemin/dekor/backdrop koduyla aynı.
Mat biyom kapakları, gerçek ölçülü yuvarlatılmış gövdeler, kenar şeritleri ve destekli
checkpoint zeminleri. CourseVersion2; eski Troll süreleri arşivlenir, Party kaydı
ve oynanışı değişmez.62gerçek güvenli bağlantı + çökme/retry ve browser akış testleri.

## 1.73.0 — Ayrı üçüncü şahıs Troll Obby

Oyunlar salonunun arka duvarında yeni magenta portal; Party Run FPS değişmedi.
Üç özgün parkur (160/200/240m), sahte taş/görünmez duvar/geri fırlatan pad/hediye
ölüm bloğu; kısa checkpoint dönüşleri. Ortak120Hz swept-AABB hesabı ve2mm skin
korundu, yalnız troll verisine bağlı temas kancaları eklendi. Üçüncü şahıs raycast
kamera, düşüşte yukarıdan izleme; instanced dekor/konfeti, ortak UI ve ses.
Ayrı elemental-run-troll-v1 kaydı; Obby-family sahneleri arasında geçerken pasif
kaynaklar dispose edilir. Bitiş ödülü mevcut sınırlı aktif-süre ekonomisini kullanır.
Ayrıntılar/araştırma/kod blokları: TROLL_OBBY_AI_HANDOFF.md.75gerçek atlayış,
dört tuzak, checkpoint/finish, kamera çarpışması, native UI, Party izolasyonu ve
masaüstü/dokunmatik testleri. Canlı Poki yayını veya gerçek telefon60FPS onayı değildir.

## 1.72.2 — Akıcı yükleme yüzdesi

Kullanıcının isteğiyle başlangıç yüzdesi artık görsel bir tahmindir, gerçek
indirilen byte oranı değildir. updateLoading gerçek ilerlemeyi ayrı tutar;
tek RAF en fazla10Hz DOM günceller, aradaki bar CSS ile yumuşar. Uzun adımda
son gerçek/gösterilen değerden99.4'e asimptotik yaklaşım, bir ondalıklı yüzde,
geri gitmeme ve bootstrap/retry yazarıyla monoton uyum. Kritik hata/context
bekleme sırasında tahmin durur. Yalnız loadingFinished=true ve gerçek finish
çağrısı100 gösterebilir; anında100 ve RAF temizliği, yapay ek bekleme yok.
Watchdog görsel sayıyı gerçek ilerlemeye geri beslemez. PLAY, hazırlık, shader
ön yükleme, SDK ve oyun süreleri bu tahminden bağımsızdır.


## 1.72.1 — İlk oynanış yükünü ayırma / tutorial engel çeşitleri

1.72.0'daki normal arka plan Level1 hazırlığı artık ilk yükleme kapanmadan
tamamlanır: araç indirmeleri erken başlar, parse/GPU hazırlığı, detached Nature
ve ghost'lar PLAY'den önce beklenir. İlk zıplama normalde yeni hazırlık başlatmaz;
eski çağrı yalnız context/recovery yedeğidir. İlk yükleme biraz uzayabilir,
tutorial->Level1 arasında ek loading/siyah ekran yoktur. Son hazır tutorial
koridorunun uzak modelleri ve coin buffer'ları da gerçek mesh başına gizli
render ile yüklenir; yalnız compileAsync yeterli sayılmaz.

Pratik dizisi: sağa park etmiş araçlardan kaçış, mavi overhead beam altında
kayma, park etmiş araç üstünden zıplama, sola duvar kaçışı, alçak hurdle,
sarı slide barrier. Hareketler/mesafeler ve güvenli rewind korunur. Mavi beam'in
normal rastgele span/yüksekliği değişmez; yalnız tutorial'da tam istenen şeritte
6.8m genişlik, 6.9m yükseklik, merkezY5.5 ile kayılabilir açıklık kullanılır.
Teaching car factory artık forceProcedural seçimini gerçekten uygular; gerçek
GLB'nin erken indirilmesi tutorial'a ağır modeli yanlışlıkla sokmaz. Diğer
oyunların araçları aynı GLB'lerdir.

Tutorial'da sis yoğunluğu en az .004. İleri koridor modelleri/coinler yalnız
neredeyse opak sisin (1/4096) 100m ötesinde render dışıdır; collider/state
silinmez, şeffaflık materyali değiştirilmez. Rewind mesafesine göre tekrar
görünür; grafik preset/çözünürlük ve diğer modların atmosferi değişmez.
Yerel software-WebGL tek örneğinde çizim çağrıları 732->468, en uzun ilk18s
frame2.05s->.4s, p95 .267s->.2s; p50 iyileşmedi. Bunlar rastgele sahne/driver
örnekleridir, cihaz FPS garantisi değildir. Ana kanıt PLAY'de gerçek hazırlığın
hazır olması ve ilk atlamada parse/upload işinin başlamamasıdır.


## 1.72.0 — Uzatılmış tutorial / kesintisiz Level 1

Tutorial 10 alıştırmadır: ilk jump/slide/lane/bunny dersleri + altın izli sağ
koridor, ikinci slide/jump, altın izli sol koridor, final jump/slide. Bunny üç
sıra ve 60m aralıklı. Son alıştırma 2070m'de; hatasız akış yaklaşık bir dakika,
tekrarlar ve cihaz hızına bağlıdır. On noktalı küçük ilerleme göstergesi eski
harita barının yerini sadece tutorial sırasında alır. Yeni duvar çiftleri iki
açık şerit bırakır; tam genişlikte yön değiştirme uyarısı 120m önce çıkar.
Pratikler de fiziksel erken jump/slide kabul eder; yanlış harekette güvenli
rewind mevcut alıştırmaya döner, ilerleme göstergesi sıfıra dönmez. Mobil yatay
lane talimatı joystick simgesi, dikeyde kaydırma; mevcut dil etiketleri kullanılır.

İlk zıplama sonrası `prepareTutorialLevelOne` ortak gerçek araçları, detached
Nature bölümünü ve gerçek üç ghost'u mevcut dilimli GPU hazırlama yolunda ısıtır.
Renderer/scene/aktif biyom await boyunca değiştirilmez. Tutorial+Nature iki
biyom bütçesi korunur; diğer 119 bölüm yüklenmez. Normal finish yalnız bölüm
hazırsa oluşturulur. Yavaş cihazda güvenli tutorial yolunda koşu devam eder;
siyah ekran veya loading kartı yok. Kalıcı hazırlık hatası mevcut retry UI'sını
kullanır; sınırsız retry döngüsü veya sahte progress yok.

`finishTutorialToLevelOne` artık `startPreparedRun`/resetGame çağırmaz. Hazır Nature
bölümünü bağlar ve sürekli kampanyanın 1.1s atmosfer karışımını kullanır. Dünya
konumu, kamera, jump/slide, ses ve pointer lock korunur. Tutorial altını bir kez
bankalanır; level puanı/altını/süresi ayrı sıfırlanır. `LevelGhostSystem.adoptPrepared`
ısınmış gerçek ghost nesnelerini oluşturmak yerine devralır. Şapka hâlâ ilk
gönüllü lobi dönüşünde alınır. Tutorial save version9 değişmedi: eski tamamlayan
oyuncuya zorunlu tekrar yok. Diğer modlar ve normal retry hazırlığı değişmedi.

Poki fullscreen ayrı açık konudur: canlı 1.5.35 testinde dış iframe izin verirken
iç `gameframe` izin vermiyordu; bkz. output/POKI_FULLSCREEN_LIVE_2026-11-01.md.
1.72.0 bunu host DOM iznini değiştirerek aşmaya çalışmaz.

## 1.71.2 — Poki oyun içi tam ekran

Poki önizlemesinde dış fullscreen düğmesi yok ancak gerçek game-element iframe'i
`allow="... fullscreen ..."` ve `allowfullscreen="true"` izni veriyor (1 Kasım).
Lobide ayarlar çarkının yanına fullscreen simgesi; tüm modların ortak grafik
ayarlarına tek bir Fullscreen toggle eklendi. Yalnız Poki + gerçek
document.fullscreenEnabled + standart API varsa görünür. Sadece kullanıcı
tıklaması içinde senkron API çağrısı; yüklemede/PLAY'de otomatik fullscreen yok.
Native fullscreenchange durumları iki kontrolü senkronlar, Promise reddi arayüzü
kilitlemez. Kaydedilen pencere modu/browser-desktop/CrazyGames akışı değişmedi.
Mevcut fullscreen/resize ve 30 dildeki fullscreen etiketi kullanılıyor.
Poki sitesinin kendi dış düğmesini etkinleştirmek hâlâ Poki ekibinin kararıdır:
https://developers.poki.com/guide/your-game-page . Bu kod onu değiştirmez veya
iframe izinlerini aşmaz. Paket kullanıcı tarafından yüklenmeden canlı değişmez.

## 1.71.1 — Bir kez gösterilen lobi yönlendirmesi

Games okları artık sabit değildir. İlk gerçek oynanabilir mod karesi (levels,
endless, Surf, Party,2D veya canlı Flappy) guide kaydında playedAnyMode işaretler;
tutorial, countdown, hazırlık, pause ve yalnız odaya giriş sayılmaz. Portal niyeti
ve SDK ölçümü rehberin kaynağı değildir; mevcut gerçek-control resolver kullanılır.
Bir kez mod oynandıktan sonra Games okları, kısa yol etiketi ve hedef halkası
bir daha çıkmaz. Tutorial->Level1 otomatik devam akışı değişmedi.

İlk oynanıştan sonra, yalnız ana plazada, kontrol serbestken ve satın alınabilir
bir normal stat upgrade varken tek-ziyaretlik upgrades okları çıkar. Para yetmez,
yalnız eldiven/rebirth alınabilir veya tüm statlar max ise yanlış standı göstermez.
Paneli açmak/upgrade almak, paranın yetmez hale gelmesi veya alanı terk etmek
yönlendirmeyi bitirir. Seen bayrağı görünür ilk davette kaydedilir, tekrar giriş
ve reload'da nag yapmaz. Settings/ödül modalı arkasında veya prewarm'da tüketilmez.
Yükseltme zorunlu satın aldırılmaz. Rehber düğmesi aynı hedefi açar, çeviriler
mevcut hubGames/upgrades anahtarlarıdır. Eski guide/ziyaret/level ve satın alma
kayıtları bir kez migrate edilir. Yeni kayıt anahtarı, ekonomi veya fizik yok.

## 1.71.0 — Tutorial sonrası doğrudan Level 1 ve kurtarılabilir yükleme

1.70.1'in Games doğuşu güncel kullanıcı isteğiyle kaldırıldı. Tutorial finish,
gerçek Level1/araç/display/gölge hazırlığını kapalı geçişte bekleyip doğrudan
kampanyayı başlatır. Lobby/Games/cosmetic GLB ön koşul değildir. Kazanılmış
şapka kayıtta korunur; zorunlu AL ekranı ilk gönüllü lobi ziyaretinde çıkar.
Yeni oynanışa tekrar kontrol tablosu bindirilmez. Ardışık level sistemi aynıdır.

preparation-recovery.js en fazla2 ardışık deneme, context-loss durumunda tekrar
etmeme ve okunabilir phase/name/message/stack/resource/status logları sağlar.
Başarısız run entry aynı sahne hazırlığını in-session Retry ile yeniden başlatır;
zorunlu sayfa reload'u yok. Hata UI'ı pointer lock'u bırakır; hazırlık sırasında
geri alınan pointer simülasyonu erken başlatamaz. İlk lobi dönüşü de kapalı
prepare bekler. Opsiyonel hat GLB iki kez indirilemezse yalnız o görsel atlanır;
kazanım/AL kaydı ve lobi kullanılabilir, sonraki giriş yeniden deneyebilir.

L1–3 uzun trenleri ve mixed dizilimindeki düşen duvar/trenleri ileri seviyeye
erteler. L2–3 boşluk/başlangıç/trafik kademesi yumuşatıldı; L4+ üretimi, hedef
puanlar, ödüller, normal fizik/el animasyonu aynıdır. SDK geri dönen Promise
hataları yakalanır; lifecycle yeniden gönderilmez, süre tanımları değişmez.
SDK'nın kendi fire-and-forget ağ isteklerinin düzelttiği iddia edilmez.

EARLY_GAME_REVISION.md ve progress.md uygulama/test sınırlarını içerir.

## 1.70.1 — Tutorial sonrası doğrudan Oyunlar

Tutorial finish, ana plaza başlangıcı yerine doğrudan Games odasına doğurur.
Mevcut opak geçiş altında önce lobby kaynakları, ardından gerçek Games sahnesi
prepare edilir; perde açılmadan `setArea(true)` ve `rememberPosition()` uygulanır.
Şapka AL ödülü burada açılır. Bir moda girip geri dönünce aynı Games alanı
korunur; ana plaza portalı normal çalışır. Diğer lobi girişleri/oyuncu kayıtları,
normal koşu, ekonomi veya mod seçimi değişmez. `EARLY_GAME_REVISION.md` günceldir.

## 1.70.0 — İlk dakika / onboarding revizyonu

EARLY_GAME_REVISION.md araştırma, kararlar ve test sınırlarını içerir. İlk tutorial
PLAY öncesinde plaza veya car/motor/train GLB kataloğu hazırlamaz: eğitim kendi
hafif öğretim arabalarını kullanır. Gerçek tutorial kamera/gölge/display yolu
loading altında iki kare hazırlanır. Plaza, eğitim bitince opak geçiş altında
bir kez hazırlanır; GPU işi oynanan tutorial/lobiye arka planda yığılmaz.
Plaza fence beklemesi Games ile aynı best-effort250ms; çözünürlük/AA/model kalitesi
değişmedi. Eğitim3sn sayar, aralar kısa, bhop iki sıra ve finish115m öndedir.
Güvenli tekrar, prompt/rewind, ilk şapka zorunlu AL ve bütün hareketler korunur.

Games oda girişi artık Level1Nature hazırlığını zorlamaz; gerçek seçilen portal
kendi kapalı yüklemesini yapar. Lobi rehber etiketi klavye/dokunma ile Games'e
götüren tek kısayoldur; belirli oyun modu seçmez. İlk3levelde2kaçış şeridi,
trafik/mesafe kademeli; birleşik gate/beam/signal/falling ilk3'te ertelenir.
L6+69.000satır eskiZIP ile aynı; normal player/collision/el animasyonu ve
curvedpath kodu değişmedi. İlk180aktif saniye veya L1–3 ölümlerinde reklamla
dirilme ara penceresi yok: doğrudan sonuç→Retry, Space/Enter destekli. Eldiven
revive önceliği ve sonraki isteğe bağlı rewarded akışı korunur. Para/ödül
formüllerinde değişiklik yok. Retry tam genişlikte, 48px; ikincil düğmeler 44px.

Three addonları bare'three' yerine aynı core'un göreli URL'sini kullanır;
import-map olmadan test edildi. Bu Safari16.3 import-map hatasına yöneliktir,
her eski tarayıcı veya gerçekSafari sertifikası değildir. portal-intent,
portal-ready,hub-area ve early-flow/boot-ready ölçümleri yeni akışı ayırır.
SDK ve session-v2 tanımları değişmedi; loading/menü/ads oynama diye sayılmaz.


## 1.69.0 — Gerçek zamanlı oturum ölçümü ve güvenli SDK/shader yaşam döngüsü

`POKI_SESSION_MEASUREMENT.md` ayrıntılı devir ve yeni olay sözlüğüdür. Eski özel
aktif sayaç clamped dt kullanıyor, lobi/Surf/Party/2D erken return'lerinde hiç
ilerlemiyordu. Bu doğrulanmış yerel hata düzeltildi; bunun Player Fit backend
süresini doğrudan belirlediği veya belirli5–7dkoturumun1dkya indiği kanıtlanmadı.
Yeni ZIP eski test sonuçlarını geriye dönük değiştiremez; canlı sonuç için yeni
sürüm yüklenip test edilmelidir. Metrikleri yapay büyüten SDK çağrıları yoktur.

play-session.js performans saatinden toplam aktif, görünür-hazır tanı, mod ve
normal-level deneme sürelerini ayrı tutar. Kare hızı/yavaş zaman/rewind simülasyonu
saati değiştirmez. Tek runtime resolver gerçek kontrole göre karar verir: tüm
modlar/lobi/Games/Flappy dahil; pause/result/overlay/portal/preparation/countdown/
ads/hidden/focus/context-loss hariç. Bridge eski start/stop çağrılarını bu duruma
göre uzlaştırır, aynı olayı tekrar göndermez.250msheartbeat ve sayfa olayları
render loop'tan bağımsızdır. Gerçek ilk PLAY etkileşim şartı korunur. İdempotent
loading eventleri; geç SDK init sonrası doğru state. Menüye terk edilen normal
deneme kapanır, diğer modların süresi o denemeye eklenmez.

Yeni session-v2/mode-time/mode-v2/lifecycle-v2/sdk-clock/runtime-health olayları
eski bozuk özel sayaçla karıştırılmaz. SDK'ya çağrılan aktif aralığın yerel saati
ayrıca ölçülür: sessionSnapshot içindeki sdkGapSeconds sorunun hangi katmanda
olduğunu ayırır; bu backend teslim onayı değildir. Her modun render_game_to_text
çıktısında tanı bulunur. Son96state değişimi bellekte, kullanıcı ID/kayıt/ek
backend yok; pagehide çıkış olayı best effort.

Canlı hata panelindeki r185isReady hatasının kaynağı nativecompileAsync'in
timer'ında dispose edilmiş materyalin currentProgram alanına yeniden erişmesidir.
graphics-engine.compileAsyncSafe program referansını senkron yakalar; polling
try/catch, context kontrolü ve8sn sınırı vardır. Tüm proje içi derleme yolları
(normal/lobi/Games/Surf/Party) bunu kullanır. Grafik kalitesi, fizik, haritalar ve
ekonomi korunur. WebGL'yi tarayıcı/donanım engelliyorsa bunu zorla açmaz.

CPU169:60/10/2/0.2FPS-eşdeğeri örneklemede300gerçek saniye doğru; pause/ads/hidden/
sayfa geri dönüşü/geç SDK/tekilleştirme/yanmodownership/disposepoll geçer. Gerçek
hazır sahnelerde mockedSDK ile resmi istemci: desktop tümmodlar pause/resume/
return, touch tutorial/lobi/Games/Surf; active/SDKclock farkı<.001s. Snapshot için
QA'da simülasyon0dtile tutulur, production fiziğine taşınmaz. Görseller incelendi;
Poki canlıtesti, gerçek cihazFPS veya reklam teslimi iddiası değildir.

## 1.68.0 — Paylaşılan canvas düzeltmesi ve küçük Poki penceresi

Kullanıcının30Ekim20:04 videosu23.sn sonrası kare kare incelendi: tutorial→lobi/
şapka sırasında DOM sabit kalırken3D görüntü birkaç kare sol altta küçülüyor.
Nature warm-up canvas'a192×108 viewport/scissor ile gerçek çizim yapıyor ve
compileAsync await'inde renderer durumunu bırakıyordu.1.67idle guard tüm prime
çağrılarını kapsamıyordu. Bu gerçek kaynak düzeltildi, çözünürlük düşürülmedi.

ElementalGraphicsEngine.withSurface senkron işlem sonunda, dönen derleme promise'i
beklenmeden target/face/mip, viewport/scissor, autoClear, shadow flag'lerini geri
kurar. EskiRT varsa mantıksal canvas dikdörtgenleri default framebuffer'da geri
kurulur, sonraRT yeniden bağlanır; DPR iki kez uygulanmaz. Nature critical/live
derlemesi bunu kullanır. Display/ACES varyantı default framebuffer'da yalnız
compile edilir, ASLA küçük canvas çizimi yapılmaz. Gerçek GPU upload/çizimleri
linear ve sRGB offscreenRT'lerdedir; ikisi finally dispose edilir. Başka bir
kare/resize sonrası eski snapshot'u geri yazan asenkron finally yoktur.

prepareDisplay her görünür lobi/normal/Surf/Party karesinde tam CSS viewport ve
scissor reset yapar; DPR/drawing-buffer/MSAA değiştirmez. Vector önbellekli, ek
render pass/ışık yok. Tutorial dönüşündeki gereksiz ilkNature prime kaldırıldı;
Games'in await edilen hazırlığı sahibi olmaya devam eder.1.65demand-only politika
ve iptal generation guard'ları korunur.

Tutorial kartı artık opak değil: gerçek dünya üstünde hafif koyu scrim +3px
backdrop blur, canvas2px/brightness.9 fallback; bitiş/cancel'da sınıf temizlenir.
Zero-delta updatePlayer doğru0frameScale ile yalnız görsel kamera/yol pozunu
günceller; eskifallback1adımına dönmez. Geri sayımda oyuncu/skor donuk, yol hazır;
fizik pozitif dt davranışı değişmez. Surf hazırlığında görünen ESC/dönüş düğmeleri
kaldırıldı, güvenli klavyeEscape iptali korunur.

browser-platform.css küçük viewport katmanı960×620 vealtında mouse/touch bağımsız
çalışır: lobi header/ödül rozetleri, ilk eldiven kartı, normal/Surf/Party HUD,
ayarlar2×2kart, pause/result scroll/ölçüleri. 2D Canvas/müzik/fizik değişmedi.
Poki iframe boyutu gerçek viewport olduğundan fullscreen'e zorlamaz; oyun
çözünürlüğünü/grafik presetini küçültmez.620pxaltında lobi konum kutusu gizlenir,
önemli ikonlar kalır. Pause açıkken levelHUD menünün üstüne binmez.

## 1.67.0 — Eğitimden başlayan giriş, serbest mod seçimi ve ekonomi

İlk/bitmemiş eğitim kaydında yükleme PLAY doğrudan önceden hazırlanmış eğitime
girer. Yerelleştirilmiş Eğitim başlığı animasyonla, ardından3–2–1 görünür. Geri
sayım sade, opak koyu başlık kartıdır;240ms fade ile oyun açılır. Bu sırada
dünya/skor/zıplama/kayma bekler; sunum sayacı fizik dt sınırından bağımsız
aktif kare süresi kullanır. Tamamlamış oyuncu tekrar eğitime zorlanmaz, lobiye girer.
Eğitim bitişindeki siyah geçiş/şapka ödülü/lobi korunur. SDK başlangıcı yalnız gerçek
PLAY etkileşiminden sonradır.2D müzik ve fiziğine dokunulmadı.

Lobi okları yalnız Games'e gider; Games içinde hiçbir mod/mağaza yönlendirmesi
yoktur. Eski onboarding save kilometre taşları silinmez ancak zorunlu mod/mağaza
hedefi üretmez. Oynanmayan gerçek modların portalı ve sütunları yumuşak emissive
nabızla vurgulanır; gerçek giriş kaydı vurguyu kapatır. Coming Soon/dönüş portalı
yanıp sönmez; azaltılmış harekette sütun/halka vurgusu sabittir. Yeni ışık/FX mesh yok.
Tam lobi drawing-buffer/MSAA ve talebe bağlı kapalı hazırlık korunur.

Menü/lobi/Flappy dahil3D tarafı aynı normal koşu MP3'ünü kullanır; lobi kısık miks
seviyesini korur. Surf ayrı ses sahibi ama aynı URL/ses seviyesi;2D kendi eski
runner2d-theme.mp3 dosyasında kalır. Mute/reklam/sekme/duraklama sahipliği aynı.

Surf/Bhop2toplama=1cüzdan altını; HUD/ölüm/pause aynı gerçek altını gösterir.
Toplam üzerinden floor farkı alınır, tek kalan toplama sonraki banka korunur;
tekrar aynı bank çağrısı ödeme yapmaz. Rewind'de eski banked+count şişmesi yerine
snapshot coin toplamı kullanılır (ödenmiş altın geri alınmaz). Fizik/history formatı
değişmedi. Party yalnız başarılı bitişte floor(aktifSaniye*.35)+ilk10veyaPB5,
en fazla60altın verir. Seviye numarası sabit daha fazla ödeme üretmez; mevcut
attempt receipt çift-ödeme koruması sürer. Örnek60sn: ilk31, tekrar21, yeniPB26.

Doğrudan eğitime girişte mobilde açığa çıkan eski boşta Nature GPU hazırlığı
paylaşılan canvas viewport'unu192×108'e bırakabiliyordu. Eski idle scheduler artık
yalnız kapalı runPreparationPromise sırasında çalışabilir; Nature için Games/
levelin açıkça await ettiği hazırlık asıl sahip olmaya devam eder. İlk eğitim
runner viewport/DPR/scissor'u yükleme altında geri kurar. Lobi çözünürlüğü düşmez.

## 1.66.0 — Dönüş portalı ve dil tamamlama

Games'teki fiziksel Lobiye dön portalı ve dönüş düğmesi artık ortak .8s kamera
yaklaşma geçişini kullanır. Alan değişimi animasyon sonunda olur; hiçbir koşu
başlatılmaz/oyun modu yüklenmez. İki alan geçişinde de .8s tekrar tetikleme koruması
var. Tam çözünürlük/MSAA ve1.65 yükleme/iptal düzeltmeleri korunur.

30 dilde UI anahtarları denetlendi.28 dilde eksik üç fare kontrolü metni
tamamlandı. Portal giriş/hata mesajları, Coming Soon tabelası ve portal istemleri
seçili dilde; hata bildirimi artık yalnız “Yeniden dene”ye indirgenmez. Seviye
copy() artık TR/EN ikilisi yerine ortak yerelleştirmeden beslenir; menü, süre,
madalya, ödül, bitiş, Slalom, seviye adları ve ipuçları dil değişince güncellenir. Dil
başına önbellek korunur. Tüm30 dilde247UI anahtarı boş değil; placeholder uyumu
denetlendi. Uzun kart metinleri kesilmek yerine satır/öğe kaydırır; RTL başlangıç
hizası korunur. Marka/özgün harita adları bilerek korunur; insan dil uzmanı incelemesi
yapılmış gibi değerlendirilmemelidir. Harita/fizik/ekonomi değişmedi.

## 1.65.1 — Yalnız lobi çizim kalitesi geri alındı

Kullanıcı talebiyle1.65'in HDR piksel alanı sınırı kaldırıldı; composer yeniden
renderer'ın tam drawing-buffer çözünürlüğündedir. Önceki masaüstü max2MSAA,
mobil0MSAA+FXAA davranışı geri geldi. Renderer'ın mevcut DPR politikası aynı.
Yükleme/kuyruk/iptal, opak katman, güvenli hata dönüşü ve kamera probu cache'i
korunur. Koşu modları, modeller, fizik ve diğer optimizasyonlar değiştirilmedi.
Alt1.65 bölümündeki piksel bütçesi/single-sample açıklaması artık tarihçedir.

## 1.65.0 — Etkileşimli Games alanında ağır yükleme yok

1.64'ün otomatik tüm-mod hazırlığı ve yakınlıkla GPU warming davranışı kaldırıldı.
Games girişinde yalnız açılış koşusu ve ucuz2D kontrolcüsü beklenir;1400ms yarım
bırakma yarışı yok. Ekran kapanınca kuyruk boş/devre dışıdır. Surf/Party yalnız
seçilince kapalı geçişte hazırlanır, tam hazır cache tekrar kullanılır. İlk soğuk
mod girişinde kısa hazırlık gerekebilir; hepsi baştan yüklenmez.

Hazırlık sırasında aynı WebGL canvas'ına yazılan geçici sahneler artık opak DOM
katmanın arkasındadır. `renderSuspended` sayacı yalnız bu katman varken lobi
çizimini durdurur; etkileşimli alanda kasıtlı FPS seyreltme kaldırıldı. Games'in
gerçek kamera/HDR/composer ilk karesi de ekran kapanmadan ısıtılır. GPU fence
yalnız250ms best-effort bekler; yavaş sürücü/frame pacing tekrar girişi8sn kilitlemez.
Bu, tüm GPU işinin250ms'de bittiği veya sabit60FPS iddiası değildir.
Katman ilk kareden opaktır; ayrı yüksek-z Ember ilerleme düğmesi/para FX'i
hazırlıkta gizlenir, yüklemenin üstünden yanlışlıkla panel açılamaz.

Surf iptali artık gerçek işi generation guard ile durdurur, katman/iş tamamlanana
kadar `cancelling` halinde bekler, sonra karakteri portal pedinden güvenli dışarı
alır. ESC geçiş sırasında ayar menüsü açamaz. Hazırlık hatasında karakter/kamera
geçiş başlangıcına geri alınır; duvar içinde veya karanlık kamerada bırakılmaz.

Lobi HDR hedefleri tek örnek+FXAA kullanır; pahalı multisample resolve kaldırıldı.
Ekran DPR'sinden bağımsız alan bütçesi masaüstü1280×720, mobil960×540 piksel;
oran korunur, portre de alan hesabını kullanır. DOM UI native çözünürlüktedir.
Koşu grafik ayarı/model/texture/fizik değişmedi. Sabit Games kamera çarpışma probu
önbelleğe alınır; hareket edince yalnız oda kökü güncellenip tekrar raycast yapılır,
gizli meydandaki tüm objeler zorla güncellenmez.

## 1.64.0 — Kısa Games kapısı ve mod hazırlık kuyruğu

Games girişindeki yerelleştirilmiş hafif yükleme katmanı korunur. Odanın kendi
GPU hazırlığından sonra mod hazırlığına en fazla1400ms ek yumuşak bütçe ayrılır;
bu bütün modlar hazır demek değildir ve ağır tek bir sürücü çağrısı bu bütçeyi
aşabilir. Kalan hazırlık odada arka planda devam eder. Kamera geçişi artık fizik
dt sınırı yerine gerçek zaman kullanır; düşük FPS .8s sinematiği uzatmaz.

`mode-concourse.js` içindeki PreparationQueue tek ağır hazırlık sahibi, aynı işin
promise paylaşımı, portal/mesafe önceliği, seçilen level anahtarı ve hata sonrası
yeniden deneme içerir. Gerçek hazır olma kontrolü kullanılır; sahte hazır/ilerleme
yok. Portal aynı işi tekrar başlatmaz. Başka ağır mod hazırlanıyorsa seçilen mod
öne alınır; normal ortak araç işi güvenli tamamlanma noktasında beklenebilir.
Lobinin snapshot'ında `modePreparation` tanı verisi bulunur.

Party seçili tek sahnesini çıkışta tutar; tekrar girişte aynı geometriyle fizik,
sayaç, yarış, toplananlar ve ödül denemesi sıfırlanır. Surf yalnız tamamlanmış,
bekleyen streaming/retry işi olmayan sahneyi tutar; mevcut iki-chunk sınırı
değişmedi. Yeni seçim/uygun olmayan cache mevcut dispose yolunu kullanır.
Arka plan Party hazırlığı başka modun pause panelini kapatamaz ve hiçbir hazırlık
bir modu oynanıyor durumuna geçirmez.

Surf shader reflection artık renderer'ın tüm geçmiş programlarını değil yalnız
derlenen sahnenin o anki materyal programlarını işler. Offscreen upload her
nesnede bütün gizli kardeşleri tekrar taramaz; kısa bütçeli GPU dilimleri kullanır.
Araçların palet hazırlığı küçük ayrık sahne/16px hedefte yapılır; download callback
ve portal aynı `warmJob` promise'ini paylaşır. Bekleyen GPU işinde durağan lobi
çizimleri maliyete göre seyreltilir; hareket/girdi ve simülasyon güncellenmeye
devam eder. Harita, fizik, ekonomi, ses ve portal yerleşimi değiştirilmedi.

İlk hazırlık cihaz/şebekeye göre hâlâ zaman alabilir. Tüm modların1400ms içinde
yüklenmesi, gerçek telefonda sabit60FPS veya sıfır GPU hitch garantisi yoktur.


## 1.63.0 — Hızlı Games girişi, son konum ve daha küçük Poki paketi

Games odası artık normal koşunun Nature/araç/gameplay GPU hazırlığını beklemez;
yalnız kendi mimarisini bir kez compileAsync ve32px offscreen upload ile hazırlar.
Normal koşu portalı gerekli koşu hazırlığını hâlâ await eder. Lobi içinde otomatik
tam harita warming kaldırıldı; ilk açılış lobinin kendi hazırlığını korur.2D portalı
Coming Soon karşısında sağa X14/Z−22 taşındı.7portal ve dönüş portalı korunur.

Lobi küpü aynı ölçü/AABB ile yuvarlatılmış geometriye geçti; hızla ölçeklenen
adım ritmi, hafif dönüş bank'ı, nefes ve zıplama/iniş squash-stretch var. İstatistik
standı X24/Z−13'ten merkeze döner; render/click/trigger yerleri aynı transformla
eşleşir. Oynanmayan modların portal yüzeyi ve çerçevesi belirgin parlak; gerçek
oyuna giriş kaydı parlamayı kapatır. Coming Soon parlamaz/başlatmaz.

Mode girişinden önce alan, konum, kamera yaw/pitch ve küp yönü tutulur. ESC/Ana
Menü döndüğünde aynı Games/plaza alanına ve son konuma dönülür; portalın dibinden
başlamışsa merkeze doğru3.3m güvenli uzaklık bırakılır,0.8s tekrar giriş koruması
vardır. Lobi içindeki menü dönüşü o anki konumu hatırlar. Reload sonrası konum
kalıcılığı eklenmedi; save ilerlemesi/ekonomi değişmedi.

Party çevresine çakışma testli küçük/orta ölçekli18–66ek detay/harita eklenir;
mevcut büyük modeller itilip sıkıştırılmaz. Tek ek instanced batch,1draw call.
Zemin shader/fizik/harita geometrisi ve bölüm kayıtları aynı.

12GLB36,064,412→20,788,164byte: geometri/Meshopt blokları ve materials/nodes/
animation/accessors birebir, renk/emissive görselleri aynı çözünürlükte WebP94/98.
En düşük değiştirilen texture PSNR39.31dB, alpha birebir. Normal/roughness korunur;
pixel-exact renk iddiası yok. Müzikler7,344,815→4,785,777byte, MP3VBRq4/stereo/süre
aynı, ses seviyeleri değişmedi. Stand LOD dosyaları aynı. Kaynak/yedek araçları
output/asset-size-163 içinde, ZIP'e alınmaz.

Poki'de harici ülke sorgusu ve gizli DEBUG para/harita/noclip tuşları kapatıldı.
Çarkın storage okuması da korumaya alındı; localStorage/sessionStorage tamamen
engellenen bağlamda açılış ve tutorial'a giriş hatasız çalışır, oturum içi durum
korunur ancak bu koşulda reload sonrası kayıt kalıcılığı yoktur.
SDK/CDN dışında dış istek yok; SDK olay/süre metriği mantığı değiştirilmedi.
Masaüstü/mobil resmi Playwright163:9Party sahnesi,7portal,son konum,12GLB decode,
2MP3 süre/decode; normal portal→tutorial smoke testi geçti. Cihaz FPS garantisi
ve gerçek reklam sunucusu QA'sı değildir. `POKI_RELEASE_CHECKLIST.md` yayın öncesi
manuel Inspector ve lisans kontrollerini içerir: hazır Surf/Bhop haritalarının
ticari dağıtım izni assets/courses/README.md'ye göre hâlâ doğrulanmamıştır. Bu bir
teknik hazırlık ve yerel ZIP güncellemesidir; Poki/web yüklemesi yapılmadı.

## 1.62.0 — Okunabilir ufuk, kilitli karışık sıralama ve Games salonu

Party yakın çevresindeki güvenli model aralıkları korunur; Cyber ufkunda tek instanced şehir silüeti, su ufkunda iki instanced kaya/çimen katmanı eklenir. Yeni uzak parçalar kaynak model alanlarından dışarı ötelenir. Kaynak adalar sabit fakat farklı X/Y/Z oranları alır; compound parçalar aynı transformu paylaşır. Su zemininin shader/dokusu değişmez, sis rengi su/gökyüzünden ayrılır. Ağaçlara tek instanced hacimli yaprak kümesi katmanı eklenir; ek GLB indirilmez.

Aktif Party sıralaması `roundOrder=[1,6,2,3,9,4,8,5,7]`: Dönence Korusu, Gelgit Yayları, Buz Fabrikası, Bulut Geçidi, Ruh Avı, Devre Parkuru, Çöken Havza, Lav bölümü, Dönence arenası. Ham `course(id)` aynı geometriyi üretir; oyun `round(level)` kullanır. Save `sequenceVersion:1`, eski PB'leri kaynak kimliğinden yeni sıraya taşır; ilk tamamlanmamış bölümden sonrasına atlanamaz. ESC/HUD bölüm seçimi kaldırıldı, portal sütun okları yalnız açılmış bölümleri seçer. Bitirilen seçili bölüm üzerinde gerçek 3D altın yıldız görünür. Surf/Bhop'ta da eski serbest seçimin yerine ilk eksik temiz bitirme kaydına göre kilit uygulanır; `unlockedLevel()` ve portal `completed` alanı gerçek `saved.levels` kayıtlarını kullanır. Surf hareket/fizik/harita kodu değişmez.

Games girişinde seviyeli koşu sol ve sonsuz koşu karşısında sağ; Surf/Party ortada karşılıklı; 2D en son duvarda. Gri COMING SOON fiziksel portalı etkisizdir. Mod ilk kez gerçekten başlayana kadar portal parlayarak davet eder; hazırlık işi ziyaret sayılmaz (`elemental-mode-visits-v1`). Lobiye Dön portalı korunur. İstatistik standı yükseltmelerin yanına X24/Z−13'e taşınır. Salon temalı zemin, kiriş, duvar kanatları ve ışıklı ince detaylarla zenginleşir; statik mimari birleştirilir.

İlk açılıştan Nature/campaign/gameplay GPU hazırlıkları Games'e ilk girişteki küçük hazırlık katmanına taşındı. Ana lobinin kendi modelleri/shader'ları hâlâ PLAY öncesi hazırlanır; texture upload başına16ms bekleme yerine4'lük paketler. Salon bir defa derlenir ve64px offscreen upload yapılır; sonraki girişte tekrar yüklenmez. Normal3D/Surf/2D fizik ve cüzdan değişmez; host değişiklikleri sadece yeni portal API'leri ve hazırlık zamanlamasıdır. Testler output/party-162-test.cjs ve output/run-party-hub-162-official.mjs. Gerçek telefon FPS veya her bölüm için insan oynanışı garantisi değildir; site yayını yapılmaz.

## 1.61.0 — Büyük model yerleşimi, kolay Gelgit ve birleşik lobi portalları

Party çevre modelleri büyük kalır fakat tam kaynak bounds merkezine göre hizalanır; 2m boşluklu dairesel ayırma, boyuta göre satır aralığı ve katmanlı yan yerleşim uygulanır. Uzak dağlar önce ayrılır, ağır varyantlar minimum zorlamayla6adet çoğaltılmaz. Kaynak compound parçaları aynı transformu paylaşır. Snow Party zemininde gradientli bitmap dikişleri yerine periyodik frost DataTexture; çakışan normal/roughness tekrarları ve kar platformlarındaki kare panel deseni kaldırılır. Lava ana oyunun eski map/color/emissive/roughness değerlerine döndü; sadece vertex derinliği/normal korunur. Su görünümü değiştirilmedi.

Buz Fabrikası başlangıcında7ayrı top şeridi; yaylı iticinin ön alt katmanları1.20/1.28/1.315m olarak ayrıldı, aynı düzlem titremesi giderildi. Hız geçidi2s boost sırasında kenar akış çizgileri +yumuşak3/5° FOV tepkisi, pause/retry temizliği. Gelgit6 tek49trambolinli rota, yan sapma≤3.1m, yarıçap≤4.3m, hareket≤.45m, CPlerden boşluk ve dalga6.6m/s;7üst üste alternatif parça kaldırıldı, id/route/CP referansları yeniden eşlendi. Course14 PB arşivi; arena8 ve yalnız13'ten7 korunur.

Ana lobideki4eski duvar halkası kaldırıldı. Games odasının5mod portalı ana Games'in aynı tünel/portal geometrisini kullanır; yüzeyleri öne çeken özel override kaldırıldı. Lobiye Dön artık6.portal ve fiziksel trigger; tek başına ped/bekleme değil. Dönüş başlığı yerelleştirilir. Games doğuşZ8, başlıklar önden okunur, oda içi kamera boom'u raycast ile mimariden kısalır. Normal3D/Surf/2D fizik/harita/host/ses/cüzdan değişmez. DetayPARTY_RUN_AI_HANDOFF.md; testleroutput/party-161-test.cjs, output/run-party-161-official.mjs, output/run-hub-161-official.mjs. Aynı kaynak/ZIP, site yayını yok.

## 1.60.0 — Biyom derinliği, farklı tsunamiler ve kalıcı Dönence

Party çevre modelleri yaklaşık1.6kat: ana doğa modelleri36–40m, şehir46–72m, su22–62m; geniş model sınırı66m. Aynı instanced adet ve geometri bütçesi, parkur dışına bounds ile konumlanma korunur. Yeni party-environment.js yalnız Party için biyom zemini/takip cephesi üretir: opak dalgalı yüzey, gerçek vertex rölyefi+analitik normal, su köpüğü/akıntısı, lav kabuğu/emissive yarıklar, dipte7m kalın gövde.900m geniş zemin, kenarlar sis dışında. Takip biyoma göre renk/şekil/shader alır; hız/ölüm/ilerleme mantığı değişmez.

Dönence7 tüm73parça permanent:true; bir kere çöken tur bitene kadar geri dönmez, yalnız yeniden deneme sıfırlar. Süre45s ve iki kol kalır. Sweeper/radial kollar kalınlaştırıldı, gövde yarıçapı ile çarpışma yatay/dikey sınırı eşleşir. Course13 değişen7/race/hunt PBlerini arşivler;8 korunur.

Kenar şeritleri artık kutu başına kablo/torus değil, birleşik daire/dikdörtgen yüzeyin yalnız dış sınırından tek ribbon üretir; diğer kapak altında kalan aralıklar çıkarılır, eş sınırların sahipliği sabittir. Eski shellRails ve statik padRings kapalı, iç birleşimlerde çift sarı çizgi yok. AyrıntılarPARTY_RUN_AI_HANDOFF.md, testleroutput/party-160-test.cjs veoutput/run-party-160-official.mjs. Diğer oyun modları/lobi/ses/ortakUI değiştirilmedi; aynıZIP.

## 1.59.0 — Party model/zemin revizyonu ve hareket alanı ayrımı

Beyaz slalom duvarları görsel+çarpışma+üretimden kaldırıldı. Course12; hareketli makinelerin tam döngü zarfı ayrılır, uygun aynı-yükseklikli yüzeye deterministik yer değiştirir; sığmayan kopya makineler çıkarılır. Yarış engel sayıları41/38/9/37/37/7, Ruh Avı15; arena7/8 fiziği korunur. Sarkaç/kiriş çerçeve ayakları parkur dışına taşındı, zeminle kesişen kaideler kısaltıldı, tampon squash kaldırıldı. Dönen fan kapakları sabit kapaktan3.8cm aşağıda; fizik toleransı korunur.

Daire/dikdörtgen statik zeminler konveks polygon farkıyla tek görünür üst yüzeye dönüştürülür, pad gömülü ise ince inlay olarak çizilir. Yeni sabit genişlikli bevel geometri, kahraman parçalarda ek kenar halkaları, saten/kapitone world-space doku+normal, düşük maliyetli temas gölgeleri, dengelenmiş ışık/dolgu, daha kalın dolgu kenarları. Çevredeki gerçek kaynak modeller parkur yüksekliğinden görülecek boyutta; biyom/rol bazlı sıklık ve landmark bütçesi. Uzak deniz fenerleri/ağır dağlar gereksiz çoğaltılmaz. Zemin doku tekrarı gerçek dünya ölçülerine ve anisotropy sınırına göre ayarlanır. AyrıntılarPARTY_RUN_AI_HANDOFF.md; testleroutput/party-159-test.cjs, output/run-party-159-official.mjs. Diğer modların kaynakları/ses/UI değiştirilmedi; aynı kaynak veZIP.

## 1.58.0 — Zamanlama parkurları, geniş Ruh Avı, yumuşak modeller ve Surf müziği

Party finish kontrolü yere basmayı gerektirmez: sıralı kontrol noktaları ve geniş yaklaşım düzleminden swept geçiş, normal zıplama/pad uçuşunda da sayılır. Pad teması normal Space zıplamasından önce çözülür. Korkuluklar sadece başlangıçtaki −12..5m aralığında. Geniş düz alanlara fiziksel 2.6m yüksek dönüşümlü açıklıklı slalom duvarları; tam genişlik kapıları, daraltılmış/şaşırtılmış Gelgit padleri. Conveyor akışı doğrudan konuma eklenmez, swept çarpışmadan geçer. Hareketli yüzeye bağlı engeller aynı pozla taşınır; sarkaç/silindir/itici taban açıklıkları kalibre edildi.

Ruh Avı: altı adalı, dar/boşluklu bağlantılı, üst ödül rotalı 112m alan; 36 ruhtan28 hedef, 120s, düşüşte6s ceza,15 hareketli engel. Başlangıç merkezi korunur. Platformlarda daha mat/yumuşak köpük kaplama ve sürekli dolgulu kenarlar; ana oyunun gerçek dekor modelleri yoğunlaştırılmış instanced hücrelerde, ağır varyantlar üçgen bütçeli ve tam sis ötesinde hücre görünürlük kontrolüyle çizilir.

Surf/Bhop'a kullanıcı MP3'ü eklendi: assets/audio/surf-coastal-theme.mp3, tembel tek HTMLAudio, varsayılan yaklaşık%9.3 ses, pause/exit/mute/ad/hidden uyumlu. Sert jump pad sesi .26s sinüs zarfıyla değişti. Normal koşu fizik/harita, Surf fizik/harita,2D fizik,lobi ve mevcut UI korunur. Course11 eski yarış/hunt PBlerini arşivler;8 ve yalnız course10'dan7 korunur. Teknik ayrıntı, araştırma ve test sınırları PARTY_RUN_AI_HANDOFF.md içindedir. Aynı kaynak klasör ve ZIP, kamuya yükleme yok.

## 1.57.0 — Korkuluklar, uzun etaplar ve çöken Dönence

Party sabit düz/conveyor ve hareketli lift/mover platformlarının dışyanlarına fiziksel1.12m korkuluklar; birleşim içlerinde kesilir, ön/arka atlama çıkışları açık. Üç düşükgeometrili instancedbatch, owner aktifliği/hareketine bağlı collider ve görsel; korkuluküstüduruş/taşıma desteği var. Fan/davul/çöken zemine korkuluk konmaz. Yeni üçüncü etaplarla yarışlar648/694/614/714/718/746m,36–48% uzun. Sarkaç kiriş, dikey açılır kapı ve hidrolik itici disk; değişmeyen UI/giriş sistemi. Dönence73ayrıparçadan oluşur;1.15s temassonrası düşer,8.5s sonrayenidenkurulur,son.8s sadecegörselonarım/colliderkapalı.45sveiki dönen kolkorunur, altında görünmeztaban yoktur. Arena8kalıcıçökme değişmez. Course10;8/9PB korunur, değişen1–7PB arşivlenir. DetaylarPARTY_RUN_AI_HANDOFF.md, CPUoutput/party-157-test.cjs, browseroutput/run-party-157-official.mjs. Diğer modlar/lobi/cüzdan/ses/SDK kaynakları korunur, paket aynıZIP.

## 1.56.0 — Yüksek parkur, çalışan fanlar ve yakın takip

Party yarışları10m yükseltildi; dar bağlantılar korunur,18m kontrol noktaları,9m düşme sınırı. Tsunami90–120m geriden gelir; gösterim/321 sırasında da hareket eder, ölçeği mesafeye bağlı şişmez. Darbe13.5m/s,çekiç16m/s,.9s kilit ve daha düşük sönüm; testte.8s içinde8.4m geri savurma. Fanın kanatlarını örten kapak kaldırıldı, rüzgâr hızı swept hareketten ayrı dış kuvvet olarak taşınır, tuşlar hemen silemez. Beş yeni aktif aile: döner çekiç, hareketli tampon, atlama silindiri, zamanlı fırlatıcı, açılır kapı; kar bölümünde aralara yeni top şeritleri. Course9, yarış PB arşivi ve arenaPB korunması. Detaylar/araştırma/test sınırları PARTY_RUN_AI_HANDOFF.md; output/party-156-test.cjs ve resmi Playwright istemcisini çalıştıran output/run-party-156-official.mjs. Normal koşu/Surf/2D/lobi değiştirilmedi. Paket aynı dosya.

## 1.55.0 — Darbe cezası, birleşik platformlar ve model seti

Kararma SVG'sinin bütünü kaydırılmaz; çocuk siluetler dış kenara sabit büyür,2px kenar mührü boşluk açtırmaz. Darbeler yönselgeriitme5.8m/s,.78s kontrolkilidi,2s toparlanmayavaşlığı,.9s kamera/el tökezlemesi ve kombo/boost kaybı getirir; çarpışma artık ileri hız avantajı vermez. Tsunami7.9–10.3m/s,8s ramp,.75s grace; sabit başlangıç mesafeleri daha hızlı dalganın parkur bütçesine göre ayarlıdır, rubberband yok. Statik platformların tüm gövdeleri taban/çerçeve/kapak3Dprizma birleşimiyle görünür dışyüzey olarak çizilir, yalnızkapakdeğil. Fan kanatları dairesel içprofilde, ayrımerkezlerle/hareket çaplarıyla çakışmaz; örnekler ve testler PARTY_RUN_AI_HANDOFF.md.8aktifengelailesine ayrı mekanikdetaylar, platformray/panel/ızgara, davulhalkaları/hidrolikcontalar; rigidmerge+instancing. Diğermodlar/cüzdan/lobi korunur, arenaPBdeğişmez. GüncelQAoutput/party-155*, paketaynıZIP.

## 1.54.0 — Uzun yarışlar, tsunami açılışı ve kalp atışı

Altı Party yarışı446/476/418/486/498/550m oldu; test rotaları72–86s. Yeni ikinci etaplar, zorlanan ritim/atlayış/engel kombinasyonları. Tsunami6.3–8.2m/s (eski3.2),16s hız rampası, sabit parkur bütçesine göre başlangıç mesafesi; oyuncuya bağlanan lastik hız yok.2.8s arkaya bak/dalga yaklaşmasını göster/yumuşak öne dön; ardından321veGO. O zamana kadar karakter ve süre başlamaz.400m geniş38m yüksek opak/şekillendirilmiş köpüklü dalga, arka zemine oturur. Kenarlar mesafeye göre hareketli,92–200BPM çift vuruş kalp sesi mevcutSFXbus/sesayarlarına bağlı; pause/retry/exit/mute/hidden/adtemizlenir. Uzak dinamik engeller yalnıztam sisin arkasında çizimdençıkarılır.7–9arenaoynanışı/PB korunur; yarışPB arşivlenir. GünceldevirPARTY_RUN_AI_HANDOFF.md, testleroutput/party-154*. Diğeroyunmodlarıvelobi değiştirilmez.

## 1.53.0 — Engeller, geniş alanlar, farklı turlar ve takip baskısı

Party Run kataloğu9tur:6genişletilmiş yarış+45s dönen kol hayatta kalma+50s üç kat çöken zemin+75s/12hedef ruh toplama. Turlar HUD/gerçek ESC menüsündeki aynı seçiciden açılır. Otomatik koşu yok; WASD bırakınca yer freni korunur. Yarışta6sbekleyen3.2m/s karanlık takip cephesi gerideki zemin/modeli world-space shader kesmesiyle yutar, tamamen geride kalan çarpışmalar kapanır. Mesafe24m->2m kararma/SVG organik kenarları arttırır; uzakta0. Yakalanma başarısızlık/ödülsüz retry, yutulmuş CPye respawn yok. Retry tüm sahneyi doğru sıfırlar. İşaretli top rotası, rotor OBB temas,9m engel filtresi,wind yüksekliği ve vurulunca bhop sıfırlama hataları düzeltildi. Diğer modlar/lobi korunur. Güncel teknik devir PARTY_RUN_AI_HANDOFF.md.

## 1.52.0 — Ayrışan parkurlar, model seti ve bhop

Party Run FPS/tek oyunculu devam. Altı parkur, Whirlygig/Tundra Run/Big Fans/Track Attack/Knight Fever/Lily Leapers bölüm akışlarından araştırılarak yeniden kuruldu; orijinal harita dosyası veya birebir koordinat aktarımı değildir. Dönen kanatlarda gerçek dönen temas, dairesel padlerde görünmez kare köşeleri olmayan çarpışma, yükselen davullar, üst/alt yollar, hız kemerleri, farklı bölüm sayıları/yükseklikleri. Platformlarda dar bevel, opak katmanlı gövde, world-space tutuş deseni, halkalar ve donanım ayrıntıları; rigid merge + instanced yaylar. Normal UI/el animasyonu korunur. Space basılı/mobileJump/ScrollDown bhop; iniş140ms,+.65m/s,max+5m/s; taban7.5m/s,yer ivmesi20m/s²; koşmaya devam ederken bonus söner. 6 gerçek fizik parkur tamamlama, taşıma/temas/tekrar testi; diğer modlar ve lobi aynı. Güncel teknik kaynak PARTY_RUN_AI_HANDOFF.md;1.51altı artık tarihseldir.

## 1.51.0 — Party Run yeniden FPS, tek oyunculu ve altı özgün parkur

Güncel istek: birinci şahıs devam, diğer oyuncuları kaldır, parkurları internetten araştırıp kur. Kamera ayak+1.58m/FOV82/near.06, normal gerçek eldiven animasyonuyla FPS; avatar/7bot/sıralama/ilk5eleme/kalabalık simülasyonu ve süre dolması kaldırıldı. party-avatar.js kaynak/HTML/ZIP'ten çıkarıldı. Yerine tek oyunculu finish/checkpoint akışı. Altı32mplaylist yerine220–256m,çatallanan/ada/geçişli farklı planlar: Dönence Korusu, Buz Fabrikası, Bulut Geçidi, Devre Parkuru, Döküm Vadisi, Gelgit Yayları. Resmî Fall Guys/Epic parkur ve görsel düzen araştırması, dosya/model kopyası yok. Tüm ana yollar gerçek120Hzengeller açık/no gloves36–47sCPUtestinde tamamlandı; finish/checkpoint artık değişken sayıda, progress checkpoint güzergâhına bağlı/geri gitmez. Toplar sürekli ping-pong yapar, anlık reset yok. Normal UI, aktif saat, cüzdan/tek ödeme, retry resource reuse, mobil look/jump ayrımı korunur. Ayrıntı PARTY_RUN_AI_HANDOFF.md. Lobi klasik küp ve Flappy aynı; normal koşu/Surf/2D kaynakları değişmedi. Aşağıdaki1.50AIyarışı bölümü tarihseldir.

## 1.50.0 — Obby iptal, Party Run yarışı ve klasik lobi küpü

Güncel kullanıcı kararı FPS/precision Obby yerine Fall Guys esintili üçüncü şahıs engel yarışı. Aynı portalda PARTY RUN; 7 yerel AI+oyuncu,3/2/1/GO,ilk5tur atlar,canlı sıralama,checkpoint dönüşü,yer/hava atılma,savrulma ve hafif kalabalık teması. Altı biyomda192mgeniş14–18m yarış şeridi; süpürücü/sarkaç/itici/kapı/fan/bant/asansör/yaylı pad ve gelen köpük toplar. Yeni özgün kapsül karakter,7instancedrig batch; lobi karakteri keskin köşeli eski yeşil küpe döndü, yeni uzuvlar yok. Şapka/yüz/Flappy aynı. Normal UI/pause/results korunur. Host ID/dosya adları uyumluluk için obby kalır; yeni kayıt elemental-run-party-v1,eskiObbyverisi korunur. Kaynak/QA/lifecycle ayrıntısı PARTY_RUN_AI_HANDOFF.md. Aşağıdaki FPS Obby bölümleri tarihsel; güncel tasarıma geri uygulanmamalı. Normal koşu/Surf/2D kaynak parkurları ve fizik değişmedi.

## 1.49.0 — FPS Obby ve zorlaştırılmış14tip parkur

Obby artık gözY=ayak+1.58,360yaw/±1.35pitch, roll0,82°(portrait76) FPS; orbit/raycast/cube render kaldırıldı. Normal gerçek eldiven/viewmodel animasyonu izole pose ile ödünç alınır; idle faz dondurma ve portrait rig ofsetleri opt-in/restore edilir. Lobi üçüncü şahıs, Flappy aynı eski lobi makinesinde. Native UI korunur. Beş yeni aile: sarkaç, çapraz fan rüzgârı, uyarılı öldürücü enerji perdesi, Y-taşımalı asansör, zıplanan alçak bariyer; altı yeni playlist/toplam14tip. Dar basamaklar/köprüler, hızlı döner kol/piston, güçlü bant, kısa crumble/tile pencereleri; kontrol toleransları/jump/G/120Hz swept-skin korunur. Lift relative-top catcher, kozmetik iniş tahmini, .3s hızlı checkpoint dönüşü. CourseVersion2 eski best'i previousCourseBest'e arşivler; wallet/ilerleme korunur. Kaynak/matematik/araştırma/QA OBBY_MODE_AI_HANDOFF.md U;65gerçekkomşu atlama bağlantısı/1339deneme ve olay/clock/reward regresyonları. Diğer modların fizik/haritaları değişmedi; aynı kaynak/ZIP, public upload yok.

## 1.48.0 — Obby revizyonu ve Flappy'nin lobiye dönüşü

Flappy ana lobide eski arcade makinesine döndü; mod salonunda5portal var, yüklemede oyun yok. Obby gerçek normal pause/sonuç DOM'unu ve normal HUD stilini kullanır; özel Obby modalı kaldırıldı. Native button kimlik/dinleyicileri korunur. cube-avatar.js hem lobby hem Obby için yuvarlatılmış küp/el-ayak ve iniş/yürüyüş/hava animasyonları sağlar. obby-art.js instanced detaylı platform, perçin/kenar/yön işareti; sabit tabanlı teleskopik piston, kapı/lamba, köpük döner kol, yaylı pad kitidir. Altı farklı playlist, yeni bant/kapı/1.05sçöken platform ve ayrı balistik doğrulanmış yan yol. E/Shift tek-hava atılması, mobil ayrı düğme;30dil. Cyber multipart modeller tek union-bounds ile ölçeklenir; devleşen neon parçalar düzeltildi. Dört normal çevre varyantı/48desktop-32mobil instance, mobil Cyber mevcut lite tarifleri, yataycap; Sky bulut zemini, ortak postprocess/aktif kamera AO. 120Hz sweptAABB/skin-probe ve diğer modların fiziği korunur. Ayrıntı OBBY_MODE_AI_HANDOFF.md T. Aynı kaynak/mevcutZIP; public upload yok.

## 1.47.0 — Obby kamera/zorluk/saat/ödül/mobil

Raycast kamera(playerY+.8, .25epsilon, lerp+son güvenlik clamp), level1–6platform kenar boşluğu ve mover genliği,120→100ms coyote. Swept-AABB ve destek probu temas hesabı korunur. HUD/PB/ödül performance.now aktif saate ayrıldı; fizikworldTime/elapsed120Hzkalır. Eski simülasyonPB legacySimulationBest'e korunarak yeni clockVersion2tabanı. Finish15–75altın, first20/PB10bonus, won+runId+hostreceipt ile teködeme; ana cüzdan/görev/saveentegrasyonu. Mobil yalnız sağ lookpad, Jump/d-pad üstünde, pointer-id ayrımı. Ayrıntı OBBY_MODE_AI_HANDOFF.md S ve OBBY_V1_47_CHANGED_BLOCKS.md. Normal mod fiziklerine dokunulmadı; aynı kaynak/ZIP, public upload yok.

## 1.46.0 — tek Oyunlar portalı, mod salonu ve Obby

Ana lobide tek OYUNLAR portalı; arkasında sol/sağ Level, Endless, 2D, Surf/Bhop, Obby, Flappy girişleri. Dükkan/yükseltme/çark/görevler ana lobide kalır. İstatistik anıtı ana giriş yolundan sağa taşındı. Salon yerel portal yönü/collider/picking listeleriyle ana lobiden ayrılır; mevcut mod fiziklerini birleştirmez.

Yeni Obby: altı biyom, altı etap/parkur, checkpoint ve süre rekoru; dönen kollar, pistonlar, hareketli/kaybolan platformlar, basamak ve sıçratıcılar. 120Hz bağımsız saf fizik, üçüncü şahıs WASD/ok/Space, mobil d-pad/jump/drag-look. Bir Obby sahnesi, instancing, compileAsync ve ekran dışı warmup; çıkışta kaynak disposal. Kayıt elemental-run-obby-v1; normal oyun kayıtları ayrı. 30 dilde yeni metinler. Ayrıntılar OBBY_MODE_AI_HANDOFF.md. Aynı kaynak/ZIP, public upload yok.

1.45.1: Bhop/Surf checkpoint/portal/bitiş sırası alias-aware doğrulanır. Eclipse10erken alt oda/platform atlaması son geçerli checkpoint/spawn'a döner. Doğru portal sonraki odayı açar. Kaynak geometri/fizik/diğer modlar aynı; test ayrıntısı progress.md.

## 1.45 — karma açık/kapalı Bhop-Surf ve doğal çıkış hızı

Kaynak parkurları değiştirmeden, açık alanlar arasına biyom uyumlu, uçları açık/ışıklıklı/pencereli kapalı geçişler eklendi. surf-shelters.js kaynak yüzey/oyuncu/portal clearance ile statik geometri ve eş convex hull üretir; en fazla6alan ve3instanced draw/harita,12haritada55alan. Gerçek zemine oturan ayaklar; yeni saydam zemin yok. Yapılar ayrı spatial-index katısı ve playBounds kullanır, source vertices/JSON aynı. Hazırlama dilimli, current+next ömrü korunur.

Doğal surf kenar çıkışında sahte yürünebilir SAT kenar teması sonraki karede sürtünme uyguluyordu: gerçek destek yüzeyi doğrulaması düzeltildi. Çok-düzlem temas özgün gelen hızdan çözülür; portal retain modu da reset sonrası XYZ hızını gerçekten korur. Surf HUD3D sürat gösterir. Manuel surf jump .84, hız/yerçekimi/jump sabitleri,120Hz ve36alanlıhistory değişmez. Normal Level/Endless/2D/lobi kaynakları değişmedi. Ayrıntı SURF_MODE_AI_HANDOFF.md/progress.md. Atlanan1.44tam kapalı deneme geri getirilmedi; aynı kaynak veZIP, public yayın yok.

## 1.43.1 — Eclipse/seviye10 görünmez ölüm ve açık çevre

Kapalı alan denemesi geri alındı; dış çevre korunur. Eclipse'in3tam uçuş odası için environmentRooms terrain clearance eklendi: kaynak platformlar arasındaki boşluğa yükselen arazi artık karakteri inişten önce öldürmez. Eclipse contactOnlyFalls4s spekülatif ölümü kapatır ve fiziksel destek bulunmayan return trigger.bottom sanal tabanını kullanmaz. Gerçek destekli dönüş zeminleri, arazi ve dünya sınırı ölümü korunur. Teleport/retry düşüş probunu sıfırlar. Kıyı ada/dağ/fenerleri3yükseklik bandında, terrain'e bağlanan kapalı kaya tabanlarıyla ve kaynak/portal clearance ile yerleşir. Desktop28/mobil16landmark mevcut104/48toplam bütçesi içinde; destekler tek instanced draw. Kaynak platform/kontrol/fizik/PB/12harita/diğer modlar değişmez. Güncel ayrıntı SURF_MODE_AI_HANDOFF.md ve progress.md.

## 1.43 — Bhop/Surf arazi/çevre tutarlılığı ve12harita

- Kamerayı izleyen zeminsiz bina/ada skyline halkası tamamen kaldırıldı. Yakın normal-oyun modelleri sabit dünya koordinatında gerçek heightfield'e oturur; bina/kulübe/fenerlerde tek instanced destek tabanı. Şeffaf zemin ya da depth-test kapalı çevre yok.
- En alt odanın yüksekliğini bütün haritaya yayan lower-only smoothing yerine rota yakınındaki gerçek iniş/rampalardan yerel heightfield, bounded smoothing ve son konservatif kaynak/oda clearance damgası. Yatay biyom zemini/dik kaya shader karışımı, Cyber dünya-grid kontrastı. Mobil128/desktop192grid ve48/104çevre instance sınırı.
- Görünen araziye düşüş anında ölüm. Desteksiz9m düşüş sonrası10Hz muhafazakâr4s recovery testi; gerçek catch rampasına erişim varsa devam, iki yoklamada yoksa hızlı ölüm. Cache prepare sırasında dilimli; teleport/reset/rewind grace sıfırlanır. Hareket/SAT/history biçimi aynı.
- Paralar chunk başına tek InstancedMesh; toplama/rewind/retry matrix görünürlüğü geriye uyumlu handle üzerinden. En çok39ayrı coin draw call kaldırılabilir; bu gerçek donanımda sabit60FPS iddiası değildir.
-11Blueshade(Bhop/Doğa/T1),12Paradigm(Surf/Lav/T4), önceki10ID/sıra/PB korunur. Kaynak/geometri SHA ve koşullar assets/courses/README.md. Yerel kaynak+aynıZIP; public upload yok. Normal Level/Endless/2D bu turda değiştirilmedi.

## 1.42 — Kamera zemini/yüzey çarpışması, kontroller ve10harita

- 1.41tehlike levhası kaldırması tek başına yeterli değildi: bütün biyomlarda kameraya bağlı skyline zemin dairesi, Sky'da ayrıca5saydam sis-döşemesi kaldığı saptandı. İkisi de yalnız Bhop/Surf adaptöründen kaldırıldı. Tek dünya arazisi/kaynak zemin; Sky mat, opak, loş bulut dokulu. Yeni ikinci zemin eklenmez.
- Görünen solidity=never yapısal platformlar doğrulanmış tam convex biçimiyle collision/spatial setine alınır(62Utopia/46Terra); kaynak köşeleri değişmez. Bitki/cam/su/ground ve ince şeritler hariç. Aztec su dekorları/yanlış reset portalı kaldırıldı; yalnız bitiş portalı var.
- Checkpoint swept3D geçişte havada da sayılır(Y-4..+14m, uzak üst üste odalar hariç). İlerleme aynı denemede gerilemez; full retry/yeni bölüm sıfırlar. Glide uçuş başına4s; toggling yenilemez, destek/teleport sıfırlar; History36alan(glideTime),120Hz çekirdek aynı.
- Paylaşılan ayarlarda tek Skill atama satırı; glide/double jump Space. Pause/lobide wheel engellenmez. Mobil pause paneli kartın overflow/blur sınırından çıkarıldı; lobi ayarlarında ayrı grid-scroll root gerçek kaydırma sağlar. Geç pointer-lock tamamlanması açık dialogda imleci yakalayamaz. Pause sırasında3Dyeniden çizilmez. Gerçek normal dekor fabrikalarının4varyantı tüm biyomlarda kullanılır, sınırlı instancing.
- 9Nila(Bhop/Kar,Pcpie),10Eclipse(Surf/Su,Paper-Cut) hazır kaynaklardan/hash doğrulanarak eklendi; önceki8sıra/rekor korunur. Eclipse named-stage/_nomove alias'ları destekli. İzin/yayın belirsizliği assets/courses/README.md'de korunur; kamuya yükleme yok. Normal Level/Endless/2D oynanışı birleştirilmez.
- En güncel QA/paket ayrıntısı progress.md ve SURF_MODE_AI_HANDOFF.md. Aşağıdaki1.41veöncesi kayıtlar tarihseldir.

## 1.41 — İç içe görünen zeminlerin gerçek nedeni ve normal biyom döşemesi

- Treehouse3'te trigger.bottom'a çizilen ek tehlike levhası gerçek kaynak zeminden3.23m yukarıdaydı. Katman aç/kapat görsel testi bunu doğruladı. Bu geometri tamamen kaldırıldı; yalnız opaklık ayarıyla örtülmedi. Fizik/return/ölüm/checkpoint kaynakları aynı.
- Kırmızı tehlike desenleri artık kullanılmaz. Gerçek geniş kaynak zeminleri ve ek arazi, bölümün normal koşudan klonlanmış biyom zemin materyalini ve aynı dünya-ankorlu UV ölçeğini paylaşır. Model/platform koordinatları değişmez. Yatay UV, dikey temel yüzlerine uygulanmaz.
- Ek arazi her kaynak brush/dekor AABB'si altında TAM hücreyi.5m, oda hacmi altında2m açık bırakır. Tüm hücre köşeleri sınırlanır; sonradan yalnız alçaltan smoothing güvenliği korur. Model yerleşimleri son floorAt'a göre yapılır; hazırlık yield/cancel kontrollüdür. İlk odada arazi zaten derindeydi; ekran görüntüsünün tek sebebi arazi/alpha değildi.
- Sekiz haritada324100hücre-köşe+UV/materyal/kaynak hull testleri; sekiz masaüstü ve altı mobil gerçek tarayıcı haritası/portal/checkpoint/retry/geçiş/stats testleri geçti. Treehouse3 ilk/üst/alt odalar görsel kontrol edildi. Detaylar progress.md ve SURF_MODE_AI_HANDOFF.md. Normal Level/Endless/2D değişmedi. Aşağıdaki1.40veöncesi kayıtlar tarihseldir.

## 1.40 — Tek Bhop/Surf sırası, gerçek teleport portalları ve zemin/kenar onarımı

- Tek workshop kampanyası:1Nux(City/Bhop),2Beginner(Water/Surf),3Leaf(Snow/Bhop),4Kitsune(City/Surf),5Aztec(Lava/Bhop),6Utopia(Sky/Surf),7Treehouse3(Nature/Bhop),8Terra(Water/Surf). Portal önündeki disiplin seçimi kaldırıldı; bölüm okları ve tek stats sekmesindeki8kart kalır. Normal Level/Endless/2D birleşmez/değişmez.
- elemental-run-workshop-maps-v1, eski iki maps-v1 kaydındaki rekorları mapId ile bir defa içeri alır; eski anahtarları silmez. Kaldırılmış harita/kısa etap arşivleri korunur. Slide politikası her bölümün kind alanından gelir ve sınırda UI/physics birlikte değişir.
- Yalnız gerçek forward teleport trigger'ları ve bölüm çıkışında portal: statik frame+tek animasyonlu swirl batch, harita başına2drawcall. Time player.time ile pause/rewind uyumludur; yeni hasar/çarpışma/ışınlanma eklenmez.
- Destekli surf rampaları arasındaki coplanar uç-kapak takılması yeniden üretildi ve düzeltildi. Normal dot>.985, <=8cm birleşim ve gövde açıklığı kontrolü; gerçek duvarlar/9cm+ yükselme engellenir.120Hz ve35alan History aynı.
- Arazi/zemin opak DoubleSide; shader alpha1. Üst üste odalarda arazi en alttaki zemin altına iner. Birebir kopya ortak/iç brush yüzleri sadece çizimden elenir; kaynak hull'lar korunur. Tehlike paint'i tekilleştirilir, dünya depth hassasiyeti artırıldı. Yanma zeminleri her biyomda baskın kırmızı ama o temanın desenindedir.
- Güncel teknik ayrıntı ve sınırlar SURF_MODE_AI_HANDOFF.md; QA/package durumları progress.md. Aşağıdaki1.39veöncesi bölümler tarihsel davranıştır.

## 1.39 — Hazır haritalara geçiş / oklar ve ESC seçicisi kaldırıldı / surf eli

- Kullanıcı kendi ürettiğimiz4haritayı reddetti: Frostline/Cinder/Verdant/Aqueduct kaldırıldı, surf-custom-maps.js artık kaynak/index/ZIP'te yok. Bhop:Nux→Leaf→Aztec→Treehouse3. Surf:Beginner→Kitsune→Utopia→Terra. Sekizi de hazır Strafes SMF kaynağından aynı uniform ölçek/convex çeviriyle alınır; kaynak,yazar,SHA256 ve izin belirsizliği assets/courses/README.md içinde. Yerel entegrasyon, yeni kamuya yayın yok.
- Leaf/Aztec/Kitsune/Terra ham hull294/337/2362/573. Orijinal boşluklar/şekiller değişmedi; mevcut12x10checkpoint alanları/gerçek zemin ölümü/2GPU+2CPU bütçesi aynı. Eski reddedilen harita PB'leri legacyLevels içinde saklı, yeni haritaya taşınmaz. Madalya hedefleri tasarım başlangıç değeridir.
- Bhop/Surf yönlendirme oklarının zemin/ekran/pusula çizimleri ve rota grafı planlama/güncelleme kaldırıldı; gerçek pad konturu, checkpoint ✓ ve duvar fixture'ları kaldı. ESC'de bölüm seçme yok, normal pause UI kullanılır. Lobide portal okları ve istatistik kartlarıyla seçim sürer. Normal Level/Endless/2D değişmedi.
- Surf eli sabit dünya+X yerine kamera yönünün gerçek rampa düzlemindeki teğetini kullanır; yumuşak normal değişimlerinde kol tarafı latched. Dünya/kamera360°dönüş invariance,30–144FPS, palm/fingers/camera restore gerçekThree testlerinden geçti. Fizik/History/Layer1 değişmedi. Detaylar progress.md.

## 1.38 — Görünmez havada ölüm düzeltmesi / geniş checkpoint alanları

- Eski2.82m-yüksek return hacmi, gövde değince oyuncuyu gerçek zeminden2.7m yukarıda öldürüyordu. Ayrıca kısa boylu gerçek forward portalında düşüş ölüm sanılıyordu. Artık gerçek portal kimliği ayrı; return tehlikesi ayakların gerçek destek zeminine değmesinde çalışır, gövdenin boş hacme girmesinde değil. Portal momentum/phase/lava/void korunur.
- Checkpoint kapı/sütun modelleri kaldırıldı; genellikle12x10m, dar odalarda duvarlara göre küçülen mint zemin alanları. Eksik destek varsa sadece checkpointte gerçek.4m deck; mevcut.08m iniş toleransına uygun~.028m yükseliş. Havadan yakın geçmek kayıt yapmaz; eski checkpoint son respawn'ı ezmez. Kazanılan zemin alanı altın renge döner. İki ortak drawcall.
- Aynı tam4Bhop+4Surf harita. Kaynak hull/fizik/history ve diğer modlar değişmedi. Yeni checkpoint deck'leri kaynak geometriye ek olarak açıkça sayılır. Hazırlık küçük parçalara bölünmüş/local headroom sorgulu; aktif/next2GPU sınırı aynı. QA ayrıntısı progress.md ve COURSE_DESIGN_NOTES.md.

## 1.37 — Tam haritalar geri geldi / dört yeni özgün parkur

- Kullanıcı kısa etap ayrımından vazgeçti. Nux, Treehouse3 ve Beginner tekrar bütün harita; Utopia da bütün kalır. Oda crop/kısa katalog/bölüm gibi biten checkpoint kaldırıldı. Full hull/opacity/iniş kenarı/serbest seçim düzeltmeleri korunur.
- Bhop4: Nux → Frostline(Kar) → Treehouse3 → Cinder Circuit(Lav). Surf4: Beginner → Verdant Flow(Doğa) → Utopia → Neon Aqueduct(Şehir). Yeni parkurlar surf-custom-maps.js içinde hazırlıkta bir defa üretilir; normal çevre/material sistemini kullanır, asset indirme büyümez.
- Bhop yeni parkurlar ~495m,6checkpoint; Surf ~735/802m,4checkpoint. Farklı dönüş/ritim dizileri, açık atlama boşlukları, banklı kesintisiz eğriler ve mevcut model çevreleri. Hedef madalya süreleri ilk tasarım değerleridir; insan temiz koşu ölçümü değildir.
- surf-stages.js yalnız harita-geneli navigation/progress; bölüm ayırmaz. Yeni açık rota verisinden ok/para/ilerleme; hesaplar hazırlıkta cache edilir. Kaynak2CPU/GPU2chunk bütçesi aynı. Eski tam PB arşivden geri taşınır, kısa PB chapterLevels altında korunur. Normal Level/Endless/2D değişmedi.
- QA ve ayrıntılar: COURSE_DESIGN_NOTES.md ve progress.md. Aşağıdaki1.36bölümü tarihsel, kısa etap davranışı artık geçerli değildir.

## 1.36 — Kısa etaplar / serbest seçim / görünür çarpışma / canlı ilerleme (tarihsel; ayrım geri alındı)

- `surf-stages.js`: Nux 6, Treehouse3 7 ve Beginner 7 authored etap. Bhop 13, Surf 8 seçilebilir bölüm; Utopia kaynakta ara başlangıcı olmayan kesintisiz parkur olarak korundu. Sahte/kanıtlanmamış ara spawn eklenmedi.
- Tüm Bhop/Surf etapları lobiden ve ESC menüsündeki bölüm seçicisinden kilitsiz seçilir; istatistik kartları da seçim yapar. Normal Level/Endless/2D ilerlemesi değişmez.
- Her etap gerçek checkpoint/portal/end_zone ile biter. Fiziksel olarak bitişik Nux etaplarında XYZ/yön/hız kesilmez; kaynak redirect portallarında yatay hız korunur. Gerçek reset alanları sessiz teleport/hız sıfırlama yerine mevcut başarısızlık ekranını açar; Phase Shift bu reset tehlikesinden korunur.
- Sadece aktif etabın hacmine temas eden TAM kaynak hull'lar render ve collision setine alınır. Yüz/köşe kesme yok; uzak teleport odaları, dekorları ve colliderları yüklenmiş etabın içinde bırakılmaz. Collision/render üyeliği eşleşir. Yüzeyler opak, depthWrite açık, çift taraflı; tools/playerclip yüzleri de görünür proxy alır.
- 8cm'ye kadar alçalırken sıyırılan iniş kenarı hız kesmez; gerçek duvar/yüksek kenar/yukarı uçuş/tavan sıkışması hâlâ çarpışır. Eşzamanlı temasta önce zemin çözülür. 120Hz ve 35 alanlı 60Hz History biçimi değişmez.
- Canlı çubuk kontrol noktası sayısı yerine etap rotasına konumsal projeksiyon kullanır; yalnız yürüyüp daire çizmek ilerletmez. Doğrulanmış hop rotası varsa o kullanılır. Rota pusulasında yükseklik oku; gerçek kaynak launch/push yüzeylerinde mint kontur işaretleri var.
- Kaynak JSON+convex verileri en fazla 2 kaynaklık CPU LRU cache içinde; etaplar metadata kopyaları kullanır, GPU kaynakları paylaşılmış sahipliksiz bırakılmaz. Aktif/sonraki en fazla 2 GPU chunk akışı korunur. Eski tam-harita PB'leri `legacyLevels` altında saklanır; kısa etap PB'si diye yanlış atanmaz; yeni kayıtlar sabit `mapId` ile tutulur.
- QA: 21 başlangıcın çarpışma/reset/ilerleme kontrolleri; masaüstü+portrait gerçek UI seçim, retry, opak yüzey ve shader testleri; sınırdaki momentum/redirect, 8cm lip/gerçek duvar/tavan ve history regresyonları. Her parkurun tamamı insan tarafından bitirilmiş değildir; ok grafı tam navmesh değildir. Ayrıntı: COURSE_DESIGN_NOTES.md.

## 1.35 — Yumuşak hızlanma / doğrulanmış sıralama / rota ve duvar detayları

- Strafes.io public API/config araştırması: NuxT1→Treehouse3T3; BeginnerT1→uzun kesintisizUtopiaT1. Ayrı mod sıraları zaten doğruydu; progressionRank/tiermetadata ile açıklandı, yapay yer değişimi yapılmadı. HUD Tseviyesi; kayıtlar mapOrder/mapName/selectedMap ile isme bağlı ve eski numeric save migration'lı.
- workshop-progressive-drive-v4: autoRunResponse1.8, mouseAccelerate1.4, accelerate1.6; .25s hız5.979yerine2.768m/s. Momentum/hız sınırıInfinity, jump/gravity, 120Hzcollision ve35alanHistory aynı; ground excess-friction daha yumuşak auto-drive'ı baltalamaz.
- Yeni surf-course-polish.js: destek yüzeyine/yaw'a oturan etap giriş okları, gerçek platformlar arasında10segment swept/parabolik açıklık kontrolüyle konservatif hop grafı; Nux2veTreehouse1etapta dönüş izleri ve segment HUDhedefi. Diğerlerinde sahte duvar-içi rota yok. Surf gerçek normaline oturan yakın rampa ipucu. Tam navmesh/tüm-oda tamamlama garantisi değildir.
- Bir InstancedMesh/4mobil-8desktop yakın aktif ok,8Hzgüncelleme; CPU-only plan cache. Gerçek duvar yüzeyine bağlı8mobil/24desktop frame/ızgara/ışık fixture,2InstancedMesh; kozmetik/yeni collider yok. Cityhemi.66ambient.38ile daha okunaklı. Detaylar COURSE_DESIGN_NOTES.md.
- Normal Level/Endless/2D/host, ham mapJSON ve temel SAT/History değişmedi. Kullanıcı için mevcut tek kaynak klasörü ve mevcut ZIP üzerinden devam.

## 1.34 — Tam mimari hacim / triplanar PBR

- Bhop/Surf'te top-.55collision kapakları kaldırıldı; tüm kaynak hull vertex/plane/SAT axes'leri birebir korunur. Kameraya göre fizik crop yapılmaz. Geçmiş1.33geometri MD snapshot olarak işaretlidir; güncel mimari API ve farklar SURF_ARCHITECTURE.md'de.
- Yeni surf-architecture.js: statik örtülme+derin/erişilemez hacim kanıtıyla izin verilen salt görsel cap API (mevcut haritalarda0cap); bölgesel merged/frustum batch; ufak eğimli köşe gusset'leri.
- Duvar/tavanlar world-space triplanar map, City .5metalness/.6roughness, diğerleri.4/.7; City alt/üst kenarlarda#55c9d2/güç2emissive, world-XZ hafif deterministik value-noise. Ortak materyal/shader, per-vertex Ybounds; yeni model/doku indirmesi yok.
- Normal Level/Endless/2D/host, hareket fiziği ve History formatı değişmedi. Full-source duvar collision'ları eski kapakların yerine geri geldiğinden odalar artık kaynak tasarımdaki gibi çevrilidir.

## 1.33 — Bhop/Surf görsel hiyerarşi ve rota okunabilirliği

- Kullanıcı isteğiyle oyun içi Emeği Geçenler etiketi/dialog/HUD/input/CSS kaldırıldı. Kaynak README ve yazar/source metadata korunur; ticari izin doğrulaması hâlâ ayrı yayın gereksinimi.
- Dev onay/uyarı desenleri kaldırıldı; biyoma uyumlu ince kaymaz platform panelleri, fırçalanmış mavi surf, koyu çatlak/çevre işaretli tehlike yüzeyi. Mimari üst kapaklar nötr; ana iniş hedefiyle karışmaz.
- Ortak materyal türü başına tek vertex-color mesh; 64mobil/128desktop platformda tek merged 3B altıgen bağlantı parçaları. Ek collider yok.
- Gerçek etap ilerleme geçidi veya güvenli sonraki checkpoint için metal hedef çerçevesi + küçük yön/metre göstergesi. Geniş ölüm/dönüş alanları çıkış diye işaretlenmez. Utopia'da en çok160gerçek rampadan yerel ileri ipucu; garantili navmesh/jump çözümü değildir.
- Çevre model oranları uniform; 180m'ye uzayan ağaç/tekne yok. Modelle çıkış görüşü kapatılmaz, yakınlar yanda gruplanır, skyline daha geride/düşük kontrastta. Üst model bütçesi mobil64/desktop136; düşük yoğunluklu yerlerde daha az.
- Fizik dosyası, bütün History, authored collider partition, kaynak JSON koordinatları ve normal Level/Endless/2D/host aynı. Güncel detay SURF_MODE_AI_HANDOFF.md; QA133art +129/130/131/132regression.

## 1.32 — Authored-map borcu / revive / açık madalya hedefleri / VFX / portal kredileri

- Eski physics course/separatedCourse/BHOP_SOURCE ve addChunk fallback kaldırıldı; authored prepare -> addWorkshop -> JSON/convex -> merged surfaces/prewarm akışı tek sağlayıcı. 120Hz hareket/sweep + bütün60Hz History kodu byte-equivalent korundu.
- Revive artık kazanılmış chunk.respawn veya gerçek data.spawn XYZ/yaw ile placeWorkshop; X sıralama/z0/y+1 hatası yok. Fatal-ground bypass eski davranış olarak korunur.
- 4 registry kaydı açık gold/silver/bronze saniyeleri: Nux60/90/135, Treehouse150/210/300, Beginner75/110/165, Utopia180/255/360. Başlangıç tasarım hedefleri; insan timing kalibrasyonu sonraki yayın kontrolü. Mevcut best time/ilerleme korunur, madalya sınıfları medalVersion1'e taşınır.
- Sıcak yüzey salt-okuma AABB/convex SAT sorgusu; üst/yan/eğimli temas24fixedtick=.2s. Dört JSON'da hot sayısı0; rastgele Lav platformu hasarlı yapılmadı.
- Var olan VHS composite korundu; pooled cyan/purple + CSS speed/void feedback, dt emisyonu, pause/death/reset/dispose temizliği. Mobil64 particle/1Points draw; biyom72–80model bütçesi aynı. Portre A/D.65 ve drag/burst/orientation korumaları.
- Surf portalı etiket ve yakın HUD düğmesinden native Credits dialog:4harita/özgün yazar/kaynaklinki,30dil, ESC/odak/movement/pointerlock lifecycle. Ticari map izinleri doğrulanmış DEĞİLDİR; credits yayın lisansı yerine geçmez. Normal Level/Endless/2D/host ve çevre/platform yerleşimi değişmedi.

## 1.31 — Kamera spike koruması / DEBUG F1 noclip / güncel devir belgesi

- Bhop/Surf mouse yolu normal koşunun pointer-lock guard'ını atlıyordu: tek1750pixel olayı179.5° dönüş üretti. Kendi canvas lock kontrolü, relock ilk-spike koruması,±110pixel olay ve.45rad input-batch limiti eklendi. World-up sabit; normal360° bakış ve fare air-strafe sürer.
- DEBUG dizisinden sonra F1 noclip aç/kapat. WASD uçuş, Space/Ctrl dikey, Shift hız. Normal fizik/hasar/coin/timer/trigger/rewind capture bypass; model içinde kapatmada güvenli anchor. Assisted attempt kayıt/ödül yazmaz; R yeni normal attempt. Shift+F1–F6 tema, eskiF2–F6 alias'ları korunur.
- SURF_MODE_AI_HANDOFF.md baştan güncel tek referans olarak yazıldı: modlar/haritalar/fizik/input/debug/skills/streaming/kayıt/görseller/testler ve bilinen sınırlamalar. Eski kronoloji progress.md'de; eski120generator ve kayıt anahtarları artık güncel sanılmamalı.
- Normal Level/Endless/2D/lobi, çevre ve platform modelleri değişmedi. Ana fizik çekirdeği ve35alan history şeması aynı.

## 1.30 — Platform modelleri ve okunabilir tehlike işaretleri

- Yalnız Bhop/Surf platform görselleştirmesi yenilendi: oluklu gövde, açık metal bevel, yeşil onaylı güvenli ped; mavi şeritli gerçek surf yüzeyi. Gerçek130ölüm-return hacmi turuncu/siyah uyarı deseniyle gösterilir. Renk+simge birlikte kullanılır; Lav teması otomatik tehlike sayılmaz.
- Çevre modelleri/yerleşim kodu, fizik, girdiler, hasar kuralları, kaynak haritalar ve normal/2D/lobi modları aynı. Yeni collider, yeni ölüm bölgesi veya hareket değişikliği yok. Ayrıntılar SURF_MODE_AI_HANDOFF.md1.30.

## 1.29 — Fare air-strafe / açık model çevre / platform kaplamaları

- Bhop havada yumuşak kamera dönüşüyle Source projected-wish prensibinden uyarlanmış hız kazanır; A/D şart değil. Yerde/düz bakışta bonus yok. Sürekli koşu,360°bakış ve limitsiz biriken hız korunur. Render örneği açısal hızı bütün120Hz alt adımlarda paylaşır; FPS kaynaklı avantaj önlenir.
- Kapatıcı cam/cephe duvarları kaldırıldı; yalnız mimari yan duvar alt gövdeleri fizik+görselden açılır, üst iniş yüzeyleri ve platform koordinatları korunur. Gerçek bina/ağaç/dağ modelleri ara etaplara da dağıtılır; parkuru kaplamayan tam-model AABB/instancing uygulanır.
- Platform üst/yan malzemeleri ve batched bevel trim yenilendi. Age0 rewind discrete okuma düzeltildi,35alan60Hz kayıt şeması aynı. Normal Level/Endless/2D değişmedi. Ayrıntılar SURF_MODE_AI_HANDOFF.md1.29.

## 1.28 — Güncel Bhop/Surf davranışı

- Ölümde full restart/checkpoint ayrı; R mevcut leveli baştan başlatır. Starter platformdan çıkınca süre başlar; checkpoint süre/coin korur. Başlangıç7.6375m/s'ye sıfırdan hızlanır; kazanılan hızın tavanı yok. Bhop slide kapalı, Surf açık. Kamera roll yalnız yan girişten; gövde ve iniş ataleti var.
-1.27'nin kaynak parkur silen çevre filtresi kaldırıldı: tüm kaynak5891hull+4starterdeck korunur, kaynak dekor/proxy kapakları çizilir. Görsel ortam etiketleri collider kaldırmaz. Platformlar opak, uygun dikey shell yüzeyleri cam/gerçek Cyber cepheleri. Çevre katmanı tüm temalara genişledi.
- Detay ve testler SURF_MODE_AI_HANDOFF.md1.28 bölümündedir. Normal Level/Endless/2D fizik/runtime kodu değişmedi.

## 1.27 — Güncel Bhop/Surf çevresi ve hız düzeltmesi

- Havada yön düzeltirken eski strafe hızının yanlış dünya ekseninde çıkarılması düzeltildi; kamera dönüşünde ani hız kaybı giderildi.
- `surf-biomes.js` normal oyunun gerçek model/zemin/atmosfer fabrikalarıyla Cyber/Doğa/Su/Gökyüzü çevrelerini kurar; Lav/Kar da desteklenir. Kaynak platform vertices ve boşlukları korunur; uygun eski oda duvarları/örtüleri çevre modelleriyle değiştirilir.
- Model instancing, mobil72/desktop140 compound model bütçesi, opak yükseklik arazisi, iki harita sınırı, prewarm/dispose. Detaylar `SURF_MODE_AI_HANDOFF.md`1.27 bölümünde. Normal Level/Endless/2D koduna dokunulmadı.

## 1.26 — Strafes editör şablonlarından parkurlar (temel mimari)

- Kullanıcı 360° kamera yönünde sürekli koşuya açıkça izin verdi; yalnız Bhop/Surf kontrolleri değişti.
- BHOP: Nux / Treehouse3. SURF: Beginner / Utopia. Gerçek kaynak brush geometrileri tek ölçekle dönüştürüldü; rastgele düz parkur kullanılmıyor. Her modda iki harita; end-zone, oda teleportları ve geri dönüş noktaları var.
- `surf-maps.js` + `assets/courses/` yeni yükleyici/veri. Collider arbitrary convex SAT ve 16m broadphase; render6–7mapdraw. Aynı anda aktif ve sıradaki harita hazırlanır. Normal Level/Endless/2D değişmedi.
- Yeni kayıtlar `elemental-run-bhop-maps-v1` / `elemental-run-surf-maps-v1`; eskiler korunur. Portal harita adını ve seçim oklarını gösterir.
- Kaynak dosyalar aynı klasörde; aynıZIP güncellenir. Canlı siteye veya Poki'ye yükleme yapılmadı. Kaynak kredileri ve ticari dağıtım izinlerinin ayrıca kontrol edilmesi notu `assets/courses/README.md` içinde.
- Ayrıntılı mevcut davranış/testler: `SURF_MODE_AI_HANDOFF.md` başındaki1.26 bölümü. Aşağıdaki1.25 parkur açıklamaları artık tarihçedir.

## 1.25 — Bhop / Surf ayrımı (tarihçe)

- Mevcut portalda BHOP / SURF seçimi var. Varsayılan Bhop; tek kaynak parkur, pcpie'nin izinli bhop_strafepads VMF'inden34blok+başlangıç/bitiş.
- Yatay ölçüler ve boşluklar tek0.0115ölçekle korunur; kendi materyal/kalınlık/fiziği kullanılır. Tüm CS haritasının birebir görsel kopyası değildir.
- Surf yalnız uzun bankedrampalar; karmaBhopşablonları kaldırıldı. Normal Level/Endless/2D değişmedi.
- Kayıtlar elemental-run-bhop-v1 ve elemental-run-surf-only-v1; eski elemental-run-surf-v1 silinmedi. İstatistiklerde ayrısekmeler.
- Ayrıntılar ve attribution:SURF_MODE_AI_HANDOFF.md bölüm6–8. Yerel kaynak+mevcutZIP; canlısite/Steam değişmedi.

## 1. Hangi proje, hangi sürüm?

- **Aktif standart web/Poki kaynağı:** `C:\Users\Pc\Desktop\ELEMENTAL RUN Browser v1.3 relaeses 2\ELEMENTAL RUN Poki v1.5.0\`. Klasörün adında v1.5.0 kalsa da içindeki `BUILD.json`, HTML cache anahtarları ve menü etiketi v1.28.0'dır. Yeni sürüm için sürekli yeni klasör açılmıyor.
- **Dağıtım ZIP'i:** aynı üst klasördeki `ELEMENTAL RUN Poki v1.5.0.zip`; kaynak klasör güncellendiğinde ZIP ayrıca yeniden paketlenmelidir. Yalnızca kaynak dosyayı değiştirmek ZIP'i değiştirmez.
- **Canlı genel site:** <https://shephhh.github.io/elemental-run-browser-v1.3/>. GitHub Pages deposu `Shephhh/elemental-run-browser-v1.3`, `master` dalından `.github/workflows/pages.yml` ile yayınlanıyor. Yerel paket/ZIP değişikliği **siteyi otomatik güncellemez**.
- **Ayrı varyantlar:** `ELEMENTAL RUN Poki Pixel Art v1.5.2` ve `ELEMENTAL RUN Steam v1.4` ayrı ürün kopyalarıdır; standart web/Poki isteği bunları değiştirme yetkisi anlamına gelmez. `C:\Users\Pc\Desktop\elemental run\ELEMENTAL RUN-win32-x64 v1.2` mevcut çalışma dizini eski Electron yapısıdır, kanonik web/Poki kaynak değildir.
- `progress.md` kronolojik değişiklik günlüğüdür; bu belge ise sistem haritasıdır. `assets/hands/README.md` GLB ihracat sözleşmesidir.

### 1.24.0 — Canyon Drop & Wallride ve kıvrımlarda kesintisiz surf eli (önceki)

- Her Surf levelinde ilk Deadly Dive yuvası sabit Canyon olur:80m/-.55/.35 drop,6m geniş/+.30 flick,tam3alçalan blok,sağ banklı wallride ve56m geniş U-bowl. Önce gerçek yükseliş yaklaşımı;çıkış mevcutY10datum'una bağlıdır. Fizik/update/hız/zıplama ve diğer modlar değişmedi.
- Fizik uyarlamaları açıkça belgelidir:4m alçalan tamhop0.4s değil1.1074s;sz.85yürünebilir olduğundanwallride1.20;worldY0ölümzeminine inmez. Yeni zorunlu wall-jump kuvveti eklenmedi;mevcut bhop yardımcısı korunur. MAX30m/s ve temel16m/s iniş zarfı;9gerçek120Hzeldivensiz Canyon geçişi3blok+duvar temaslarıyla doğrulandı.
- El artık kısa son/komşu segment+100ms sayacı yerine bağlı yüzey kimliğini izler. Geometrik yakınlık ve gerçek çıkış kontrolleri korunur;aynı kıvrımda kamera tarafı değişince kol değiştirmez. İleri bakan parmak/avuç hizası korunur.
-720geometri/360tam parkur,20–144FPS temas/ayrılma testleri ve desktop/mobile lifecycle testleri geçti. Max1363solids,2chunk/48coin bütçesi aynı. LayoutVersion14;eski unlock/seçim korunur. Aynı kaynak ve ZIP;normalLevel/Endless/2D/host/lobby/assets değişmedi.

### 1.23.0 — Araştırmaya dayalı parkur varyasyonları ve ileri bakan surf eli (önceki)

- Utopia, Kitsune, Arcane ve Zen haritalarının gerçek görselleri; Momentum ramp/review rehberleri incelendi. Kaynaklar ve uygulama planı SURF_MODE_AI_HANDOFF.md Bölüm 2a içinde.
- Beş ana şablonun her birine sweep/crescent/S-bend varyantları, farklı uzunluk ve kısa–uzun bhop ritimleri eklendi. Aynı aile tekrarında varyant tekrar etmez. Küçük yükseklik yayları, geniş son iniş adası; tüm boşluklar mevcut parabolik catch hesabından geçer. 120 level/3 fizik sınıfında360tam geçiş,720geometri testi geçti. Max1179solids;max2chunk bütçesi aynı. LayoutVersion13;unlock/seçim korunur.
- Avuç -localZ rampaya bakar;parmak +localY ileri yüzey teğetine hizalanır. Quaternion slerp Euler sarmalanmasını önler. Son/komşu yüzeye10cm yakınlıkta en fazla100ms cosmetic grace;zıplama/floor/dash/rewind/gerçek ayrılma hemen bırakır. Fizik,35-field rewind,normal modlar değişmez.

### 1.22.0 — Beş workshop akışı, oval rampalar ve avuç teması (önceki)

- course() artık5şablonlu seeded shuffle-bag:Deadly Dive & Zigzag,C-Curve & Abyss,Slanted Precision,Spine Transfer,Skill Skip. Her level tüm5şablonu içerir;10–14modül/~4.88–6.47km. İlk leveller daha geniş/kısa aralıklı;zorluk24level ölçeğinde yumuşak artar. Physics/update/hız/jump/kontroller değişmez. LayoutVersion12;unlock/selected korunur.
- <=4.5m ortak kenarlı yay parçaları,ortak yumuşak top normals,internal cap temizliği ve gridsiz ince beton dokusu. Spine'ın iki gerçek collision yüzü;skillSkip5güvenli alt blok+tek yüksek Neon Pulse kestirmesi. Yüksek blok alt yol hull'undan tamamen ayrı,iki atlayış parabolik doğrulanır. Source model/assets/scenery/2chunk sahipliği değişmez.
- Surf eli canonical palm=-local Z yönünü gerçek rampanın içine hizalar;fingers+Y duvar üzerinde yukarı. Cached parent-space frame,farklı eğim/yaw/pitch'e uyum,30–144FPS damping,pause/release/Layer1 korunur. Host değişikliği yalnız renderSurfHands;normalmodlar değişmez. Detay/testler SURF_MODE_AI_HANDOFF.md içinde.

### 1.21.0 — Surf sıçrama maliyeti ve duvara dayanan el (önceki)

- Gerçek Surf temasından sıçrama yatay VX/VZ'yi bir kez .84 ile çarpar (%16 kayıp); normal bhop/hava input spam'i etkilenmez. Rampadaki ilk doubleJump girişi doğru jump pipeline'ına gider. Shared seam auto-hop düzeltilir; held exit solver post-cost hızla hesaplar, yalnız Surf exit gap bütçesi5.376m/s olur. LayoutVersion11; açık level/seçim korunur.
- Kamera-sağ eksenine göre rampanın tarafı seçilir:sol rampada sol el,sağ rampada sağ el mesh-local ileri/yukarı/dışarı uzanır. Diğer el eski animasyonu sürdürür. dt-damped geçiş,jump/exit/dash/rewind bırakma,pause freeze. Tamamen cosmetic;Layer1/depth-clear/phase opacity korunur. Host runtime değişikliği yalnız renderSurfHands adaptöründe;normal Level/Endless/2D/lobby kodu değişmez.

### 1.20.0 — Surf fizik çekirdeği yeniden kuruldu (önceki)

- Valve AirAccelerate/AirMove/ClipVelocity ve Momentum TryPlayerMove/ramp rehberleri doğrudan araştırıldı. Steep Surf artık walking ground değil:grounded=false,surfing=true;3Dmomentum,half-gravity ve negative-normal clipping. Kamera pitch*5 bias,forced velocity rotation ve ramp pozisyon kilidi kaldırıldı.
- A/D horizontal camera-right wish acceleration,Surf cap.9;gerçek yaw carve hız/irtifa dönüşümü yapar. Surf exit inertial flight velocity'yi gerçek adaya inene kadar korur. Normal ada/bhop free-air eski responsive runner kontrolü shipped1.19.1 ile numerical regression-match.
- 35-field rewind(surfing/surfFlight),shared-X seam removal,preallocated multi-plane SAT,passive energy safety. Mobil canvas drag/gamepad right stick look eklendi;yalnız Surf aktifken. Hands cosmetic COPY alır,logical player'a geri yazmaz.
- Bank1.08–1.28,Surf exit8m/s gap envelope ve30m/s+Sky catch length;normal bhop gaps ve13family/6style korunur. LayoutVersion10;unlock/selected korunur.720actualroute traversal ve geometry/history/energy/seam/controls/native rewind+retry PASS. Normal Level/Endless/2D/lobby/host/assets değişmedi. Detaylı kaynak/matematik/test/ownership SURF_MODE_AI_HANDOFF.md içinde.

### 1.19.1 — Küçük dikey bakışla Surf kontrolü (önceki)

- Kamera pitch artık Surf fizik girdisine iletilir. Yaw heading'e sign(bank)*clamp(pitch*5,-.75,.75) eklenir:~4.6°yukarı/aşağı bakış tırmanma/iniş sağlar. Doğrudan dikey impulse veya magnet yoktur;A/D pressure-only kalır. Pitch0 önceki sürümle sayısal eşit,havada/normal adada etkisiz. Profilev9;generator/layoutVersion9 değişmez. Pure±bank/rewind/FPS ve gerçek generated ramp/readInput native testleri PASS. Detaylar güncel SURF_MODE_AI_HANDOFF.md içinde.

### 1.19.0 — Hava kontrolü, Surf basıncı, air slam ve farklı level kimlikleri (önceki)

- Havada1.18'in gecikmeli dönüşü kaldırıldı; kamera heading'ine anında ilerleme ve bounded A/D geri geldi. Surf'te A/D wish vector'den çıkarıldı: yalnız gerçek yüzey normaline basınç,konuma yapıştırma/tangent-up itkisi yok. Bakışla yukarı/aşağı carve ve gravity korunur.
- Air slide normal runner slam/jump oranıyla iniş başlatır;glide/dash/Sky-Water lift inişi bastıramaz. Jumpcancel/finite slide/swept SAT/33-field rewind değişmedi.
-13aile/6level kimliği,main-accent grammar,120benzersiz sıra;geniş yay,long surf/karşı transfer/irtifa düşüşü/crescent/stepped bhop. 720generated+720actualphysics traversals PASS. LayoutVersion9;unlocks/selected silinmez. İlk720m+spatial scenery/max2biome mimarisi korunur.
- Araştırılan gerçek kaynaklar ve tüm matematik/test/dosya detayları SURF_MODE_AI_HANDOFF.md içinde. Normal Level/Endless/2D/lobby/host/assets bu sürümde değişmez. QA software GPU/mobile emulation;native donanım FPS garantisi yoktur.

### 1.18.0 — Uphill carve, ayrık workshop rotaları ve spatial scenery (önceki)

- Valve AirAccelerate/ClipVelocity ve Momentum mapping birincil kaynakları temel alındı. Surf additive wish acceleration ve momentum büyüklüğünü koruyan heading dönüşü, gravity/normal projeksiyonu ile yukarı carve sağlar. Auto-forward/240°/23.5gravity/9.4jump/16–30speed ve33-field rewind korunur; birebir CS2 simülasyonu değildir.
- Course baştan yazıldı:16–20 modül/8 aile, uzun .95–1.2 banklı ribbon, opposing/flick ve dar zigzag/precision/rhythm/descending/long-gap adaları. Yalnız aynı surf rampasının parçaları birleşir; geniş recovery ve düşük bridge branch yoktur. Boşluk oranı~%28.4;132,798 catch/50,106 surf seam ve720 gerçek fizik rotası geçti. LayoutVersion8; unlock/selected silinmez.
- Giriş yalnız ilk720m normal-map çevresini hazırlar; sonraki bantlar vision+420m önceden progressive compile/upload. Surf13m proximity warmup lobi görünürken başlar; loading screen eklenmez. Start band Retry için cache,diğer bandlar160m geriden dispose; Retry eksik bandı yeniden bulur. Max2 Surf level/biome. Normal Level/Endless/2D/host runtime/assets1.17 ile byte-identical.
- Güncel detay/test/lifecycle/ownership/research kaynakları SURF_MODE_AI_HANDOFF.md içinde. Desktop/mobile native controls/carve/retry/band-retire/restore/Snow boundary ve officialHigh geçti. Headless software GPU sonucu gerçek cihaz60FPS garantisi değildir.

### 1.17.0 — Surf zorluk, yerçekimi ve tekerlek kontrolleri (önceki)

- Yalnız Surf fizik/generation/runtime değişti. Jump9.4, gravity23.5, hız16/30 ve240° bakış korunur. Surf yüzeyinde projekte hız artık her tick kamera yönüne sıfırlanmaz;2.4/s dt-damped steering bank yerçekimini korur, yüzeyden kayıp düşülebilir. Dik surf normal.y>.2 destek; normal zemin>.7. Magnetic konum/merkez kilidi yoktur.
- Boşluklar1.4x, uçuş zarfı.76 (eski.56); matematiksel catch/hull/seam kontrolü korunur. Daha kısa bhop landing ve38–48m serpentine/bowl,50–68m cut-ramp;4.82–7.23km/14–17modül. Yüksek hızda kısa pad'leri aşmamak için held-jump yardımı iniş süresine göre impulse kısaltır; manuel jump aynı. Zaman kayıtları layoutVersion7; unlock/selected level korunur.
- WheelDown jump/WheelUp slide, Ctrl/C/S/Down kayma; custom binding öncelikli, zero wheel yok sayılır. Mevcut30dil jump/slide çevirileri UI'da kullanılır. SAT scratch reuse, boundary collision list cache, cached active-only atmosphere animation; max2chunk ve portal güvenli hazırlık akışı korunur. Normal Level/Endless/2D/host runtime byte-identical.

### 1.16.1 — Surf portal siyah hazırlık ekranı düzeltmesi (önceki)

- VS Code Live Server'da portala yürüyerek girişte kamera yükleme tamamlanmadan siyah arka duvara ulaşıyordu. Surf kamera hareketi hazırlık boyunca dışarıda tutulur; mevcut prompt gerçek aşama ilerlemesi ve lobiye dön/ESC gösterir. Hazır olunca kamera tween'i devam eder. İptal/başarısız hazırlık/eski async callback sahneyi siyah durumda bırakamaz.
- İlk giriş yalnız seçili mevcut chunk/effects hazırlar. Sonraki chunk mevcut background scheduler ile giriş düzlüğünde60m sonrasında kuyruğa alınır,max2resident. Physics/course/input/hızlar1.16.0 ile aynı. Hazırlıkta lobi çizimi10Hz ile sınırlanır; worker/GL upload'a zaman kalır. Aynı klasör/ZIP/cache1.16.1.

### 1.16.0 — Surf yörünge / çevre boşluğu / kayıtlı bölüm / ortak menüler (önceki)

- Fizik, hızlar, `step`/`move`/history aynı `workshop-runner-v5`; yalnız generation matematiği yenilendi.14–17 modül,14 aile,4.41–6.37km. Uçuş parabolü gerçek banked catch düzlemiyle çözülür; iniş alanı/hull payına göre platform uzatılır/genişletilir. C-curve,drop-down,stepping-stone ve strafe-gap dizileri; drop-in/flick eğimleri değişken.720 rota ve40,188 catch/82,548 merkez seam QA geçti.
- Surf çevre modelleri gerçek main+branch AABB koridorunun dışına taşınır; compound kökler ve city bina parçaları birlikte kalır. Normal model fabrikaları/texture/instancing/chunk-local koordinatlar korunur.
- Ctrl ve varsayılan WheelDown slide; açık kullanıcı binding'leri öncelikli. Surf ESC gerçek normal `#pause-screen` ve settings panelini kullanır, devam/lobi yönlendirmeleri Surf'e izole capture ile yapılır. Ortak istatistik ekranında Levels/Surf & Bhop sekmeleri vardır; normal kayıtlar değişmez.
- `elemental-run-surf-v1.selected` kalıcıdır; yoksa best+1. Finish sonraki bölümü seçer, ölüm aynı bölümden Retry. Surf portal kolonlarında önceki/sonraki okları yalnız açılmış bölümler arasında gezer. Yeni giriş seçili/current bölümden başlar. Süre kayıtları layoutVersion6.
- Ayrıntılar SURF_MODE_AI_HANDOFF.md/progress.md; aynı kaynak/ZIP. Steam,Pixel,canlısite ve normal3D/2D gameplay/fizik değişmez.

### 1.15.0 — Surf uzun workshop parkurları / current-level Retry / süre (önceki)

- Yalnız Surf: 11–15 aşama, ~4.15–5.95km. 10 shuffled aile, gerçek diagonal/ribbon collision ve winding/banked geometri,42–52m drop,rapid/slanted pad ritimleri,duvarlı chokepoint,ring vehigh/low/momentum shortcuts. Ana rota glove gerektirmez;720level/biyom testi geçti. Normal Level/Endless/2D generation/fizik/UI değiştirilmedi.
- Ölümde Retry aynı levelin başlangıcına gider; mevcut GPU group yeniden kullanılır. Önceki level kayıtları/banked coin korunur. Eski Level1 warmRestart/CPUstartcache kaldırıldı. Hata/debug reload da aynı level numarasını korur.
- Puan HUD'u kaldırıldı, current-level dakika:saniye.onda-bir timer kondu (30dil). Normal magenta xN bhop görünümü. Surf portal mesafe/puan satırı kaldırıldı, bestlevel kaldı. Eski kısa-route süreleri layoutVersion5 ile ayrılır.
- Havada slide desteklenir. Surface merkezleri10m/zemin0; gerçek floor dokuları. Snow .38/Lava .22 parçacıklar180desktop/80mobile sabitpool ile akış/wrap, büyük lava haze Surf'te yok. Source normal particle buffer'ları değişmez.
- D-E-B-U-G + tek seferlik host debug gold grant; F1–F6 Surf biyomunu aynı levelde reload eder. Normal level map-switch/generation'a Surf override yazılmaz.
-64m collision bins+32m lookahead; fixed loop'te allocation yok. Render geometry/scenery X chunk-local, CPUphysicsglobaldouble: uzunmesafedeprecisionkorunur. History33 alan. Two-chunk asynccompile/upload/disposal veLayer1 eller korunur.
- output/test-surf-115-physics/routes/browser veofficial/highQA; güncel ayrıntı SURF_MODE_AI_HANDOFF.md. Aynı kanonik kaynak/ZIP1.15.0; Steam/Pixel/canlısite değişmez. Gerçek düşük güçlü cihaz FPS/livePoki kabul testi ayrıdır.

### 1.14.0 — Yalnız Surf görünüm/animasyon/kayma/bhop revizyonu (önceki)

- Kullanıcı açıkça oyunların birleştirilmemesini ve normal level sürümüne dokunulmamasını istedi. Normal level/Endless/2D fizik, generation ve UI kodları değiştirilmedi. game-runtime.js dışında Surf-specific adapter bölgesi önceki ZIP ile byte-identical doğrulandı; level-system/campaign-run/runner-2d/lobby/map-environments/graphics-engine hashleri aynı.
- Surf slide .72s, collider HY .46, kamera .84m; S/Down/kayıtlı C binding/gamepad B/mobil slide. Jump anında cancel. Hız12→16m/s, artış max2.4m/s², üst sınır30m/s.
- Coyote/perfect140ms, jumpbuffer180ms; basılı jump bağlı destek yüzeyinin kenarını okuyarak güvenli auto-bhop zamanlar.720baseline rota ve120basılı-jump rota testi;30/60/120/144FPS history eşit.
- Normal viewmodel hareket gövdesi Surf'e izole state ile kopyalandı; normal fonksiyon değişmedi. FOV85,near.05,far4200 normal projection; Layer1 overlay korunur.
- Surf sahnesinde normal model fabrikaları, material groups, floor dokuları, FogExp2/PMREM/bloom profilleri ve Snow/Lava/Sky atmosferleri. Normal compositor yalnız Surf çiziminde ödünç alınır; scene/camera/AO/bloom finally geri yüklenir. Opak segmentli terrain + world-aligned 48m texture crossfade; alpha zemin katmanı yok.
- Surf HUD normal HUD stil/yerelleştirme değerlerini kendi DOM'una kopyalar. History32 alan; retry, wallet ve2chunk GPU lifecycle sürer. Surf-only PMREM ownership/late-retry regeneration eklendi.
- Aynı kanonik klasör/ZIP/cache1.14.0. Steam/Pixel/canlısite güncellenmedi. Gerçek telefon FPS ve live Poki testleri ayrıca gereklidir. Ayrıntılar SURF_MODE_AI_HANDOFF.md/progress.md.

### 1.13.0 — Surf normal koşu kontrolü / hızlı Retry / kare bütçesi (önceki)

- Kullanıcının normal koşuyu referans alma onayıyla bakış yönünde otomatik ilerleme, A/D için3.84m/s sınırlı ve bırakınca sönen yan düzeltme. Tek tuş tutarak sonsuz yan hız/hız pompalama yok; momentum kazanımı eş yönlü mouse+air-strafe ister. Taban16m/s (~58km/sa),jump9.4m/s (~1.88m),gravity23.5,maxyatay45m/s.240°bakış/geri koşmama/fatalfloor korunur.
-4..6 kısa aşamalı flow/bhop/terrace/wave/islands/speedway; yeni fizik zarfına göre gap/rise/run-up. Momentum Surf/Bhop rehberleri ve resmî surf_kitsune staged yapı referansı;asset/geometri kopyası alınmadı.720ana rotaPASS;near-flat SAT axis dedupe ve skin-level step seam düzeltildi.
- Başlangıç1/2 için boundedCPUrestartcache;ilk bölüm Retry aynıGPUmeshlerde reset yapar,ileri bölümden Retry CPUcacheyi yeniden kullanır. Model fabrikaları yeniden çağrılmaz;yalnız görünür başlangıç GPUwarm. İptal/serial/jobdedupe ve kullanıcıclick pointerlock Promise korunur.
- Biome staging hibrit geometry instancing/materialspatialmerge,typed-array kopya ve mesh/instance başına1msactive/2msinitialCPUyield. Upload1ms/max3draw;boundary bulkmodelgeneration yapmaz. Önceki GPUset.7mscleanupqueue ile boşaltıldıktan sonra nextallocation. Görünmeyen lobiDOM refresh Surfbank sırasında atlanır.
- El adaptörü normal koşunun pivot-local axes/ellipse/jump pose/look inertia/cadence integralini kullanır;izole dampingstate,Layer1/depthclear/explicitmatrices.28alan60Hzrewind,strafeVelocity/steerYaw dahil.
- develop-web-game test döngüsü ve ölçüm kapsamı progress.md/SURF_MODE_AI_HANDOFF.md'de. Aynıcanonicalkaynak/ZIP/cache1.13.0;Steam/Pixel/canlısite değişmez. Gerçek düşük güçlü cihaz FPS garantisi yoktur.

### 1.12.0 — Surf workshop momentum / varyasyon / lifecycle (önceki; hız ve kontrol profili değişti)

- Kullanıcının açıklaması üzerine CS1.6 sayıları kaldırıldı; bağımsız workshop-auto-v2 profil:24m/s taban,14.8m/s jump (~4.66m),gravity23.5,airAccel150/projectedcap6.5. Yüzey projeksiyonu,air-strafe ve friction-free bhop korunur; tamCS2simülatörü değildir. Kaynaklar:SurfTimer/bhoptimer;detay SURF_MODE_AI_HANDOFF.md.
- Sürekli+X,A/Dyanal,Space/W/Up/wheel-down jump;240°yatay/±1.05raddikeybakış. Collision sonrası negatifVX ve geriyeX engellenir;TimeRewind bilinçli history istisnasıdır. Gerçekterrainfloor teması anında fatal;Phase/Prime düşüşü kurtarmaz.
-6-layoutseededgrammar:flow/bhop/terrace/wave/islands/speedway;boy/en/eğim/yükseklik/bonusroute değişir.5..8modül,analitikgapzarfı,coin<=48.720rota ve120uniquelevelPASS;normalrunnerbiomemodelleri ve2ownedchunk altyapısı korunur.
- Surf handloop player.time'a bağlı okunur karşıfazswing/sway/recoil/dash;explicitupdateMatrix/updateMatrixWorld import edilen sabitmatrisleri yeniler. Layer1/depthclear/normal3Dpose izolasyonu değişmez.
- prepare/restart tekPromise sahibi,eski generation iptal+allSettleddrain→dispose→prepare→enter. HızlıRetrydedupe,geçasyncjobs yeni koşuya karışmaz;exit serialcancel;pointerlock yoksaResume kapısı.
- develop-web-game becerisi fizik/browser/mobile/screenshot test döngüsünü belirledi. Güncel QA sonuçları progress.md'de;testoutput releaseZIP dışında. Aynıcanonicalkaynak/ZIP/cache1.12.0;Steam/Pixel/canlısite değişmez.

### 1.11.0 — Surf otomatik koşu / CS profili / gerçek haritalar (önceki; sayısal profil artık geçersiz)

- Serbest WASD/360 kaldırıldı. Karakter tuşsuz ileri koşar;A/D/sol-sağ yanal,Space/W/yukarı jump;bakış eski yaw±.85,pitch−.45..+.5. Mobil sol/sağ+jump,gamepad axis0;S/axis1 geri yürütmez.
- CS sürümü belirtilmediği için izlenebilir CS1.6/GoldSrc-derived profil seçildi:gravity800,jumpHeight45,knifeSpeed250,groundAccel5,friction4,stopSpeed100,airCap30,step18,maxVelocity2000. 72unit hull→1.7m dönüşümü. AirAccel150 bir community SURF presetidir,stock10 değildir. Kaynaklar SURF_MODE_AI_HANDOFF.md içinde. Otomatik minimum,glove güçleri,bhop assist ve custom120Hz collision nedeniyle birebirCSsimülatörü iddiası yok.
- Jump impulse6.335526m/s,baseline5.902778m/s;CS projected acceleration/linear friction/half-gravity/no arbitrary hop multiplier. Ana gap3/2.2m,hotstrip1.8m;medal hedefleri yeni hıza göre.720rota+120lethal lava+determinismPASS.
- Eski4prototiptekrarı yok. Normal spawnNatureSceneryRow/spawnSkyDecorAt/spawnLavaDecorAt/createCyberBuildingLayout kullanılır;gerçekmodelağırlıkları,scale/separation/yerleşim,asılfloor textures/sky/stars/sun/ışıkprofilleri. Surfparkuru yine rampa/platform;normalroadcollisionkopyalanmadı. Materyal+120mspatialbatch,2msCPUslice,flatprogressiveGPUwarm,max2ownedchunks. Normal/Steam kaynaklarına dokunulmaz.
- develop-web-game becerisi fixed-step/browser/mobile/screenshot test döngüsünü belirledi. Güncel QA ve paket doğrulaması progress.md'de;canlısiteotomatikyayınlanmaz.

### 1.10.0 — Surf & Bhop serbest hareket / hardcore / polish (önceki)

- Kamera-relative tam WASD, 360° mouse, stop/backwards; auto-forward kaldırıldı. Momentum/bhop korunur; bank→launch eğimi ve yüksek hız yanal kontrolü düzeltildi. Gap requiredSpeed analitik, uzun run-up ve düşük hız uyarısı vardır.
- Lav0.2s temasla lethal;12m hot strip ardından safe run-up. Ana oyunun düşen duvar modeli instanced hazard olarak taşındı; warning/cyclic motion player.time'a bağlı, collision relative swept-AABB, phase immunity/Prime recovery.
- Portal best-level/distance hologramı,128/64slot pooledcyan/purpletrails, boundedVHS composite, opaque64mbiomecrossfade. Layer1eller aynı target'a ayrı depth-clear ile çizilir;2chunk lifecycle korunur.
- History151×26;coin maskeleri/timer/cooldown/bakış restore. Walletwatermark tek gelir sağlar;committedfinish ve ayrı12srewindCharge maliyeti geri alınmaz.30dilin tümSurfHUD/modal metinleri ana çeviri sisteminde.
- QA:720ana rota,120lethal lava rota,free controls,bit31/40coin masks,real desktop/mobile,VFX/locale,24forced boundary max2/texture101sabit;Endless/2D dönüşleriPASS. GerçekcihazFPS/canlıPoki testi değildir. SURF_MODE_AI_HANDOFF.md güncel sözleşmedir.

### 1.9.0 — Surf & Bhop (önceki temel)

- Dördüncü lobi portalı; `surf-physics.js`, `surf-run.js`, `surf-run.css`. Normal 3D/2D fiziği ayrı kalır; merkezi renderer/input/SDK/ses/cüzdan adaptörü eklenmiştir.
- Mevcut altı biyomun gerçek model fabrikaları ve 120 bölümün ana biyom sırası kullanılır. Yeni parkur geometrisi rampa/platformdur; yeni biyom asset kopyası yoktur. 120 Hz swept wedge fiziği, bhop/air-strafe, 60 Hz rewind ve mevcut sekiz eldiven etkileşimi.
- En fazla iki Surf parkuru, async shader compile + kademeli GPU upload, instancing/batching ve açık kaynak sahipliği. Standart ilk-iki-bölüm hazırlığı portalın arkasında; ardışık bölümde ekran kesilmez. Aşırı yavaş hazırlık için güvenli bekleme/recovery vardır.
- Ayrı `elemental-run-surf-v1` kayıtları, süre madalyaları, bölüm banner'ı, pause/ölüm/retry/lobi; mobil yatay kontroller. İlk 120 ana rota saf fizik testi ve 24 gerçek kaynak yaşam döngüsü geçişi denendi; detaylı sözleşme ve sınırlar `SURF_MODE_AI_HANDOFF.md` dosyasında.
- Aynı canonical klasör ve ZIP güncellenir. Steam, Pixel Art ve canlı site değişmedi.

### 1.8.11 — 2D parkur / coin / manzara düzeltmesi (önceki)

- 22-phrase torba, son iki hareket ailesinden farklı seçim tercih edilir; yeni jumpSlide/hopPair. Incoming araçların gerçek spawn koridoru ve geri hareket sınırı, pad/lav fiziksel boşluğu; engellerin iç içe girme nedenleri giderildi.
- Coinler normal jump/pad balistiğine, beam açıklığına ve üst platformlara bağlandı; incoming coinleri araçla birlikte hareket eder. Swept toplama, collider alanı eleme ve rewind'da tekrar para vermeme korunur. Pad-chain platformları hıza göre hesaplanır; gravity-run testereleri kayma+toparlanma bütçesini korur.
- Bölgesel yoğunluk, farklı ağaç/tepe siluetleri ve seyrek büyük manzara detayları; eski bounded tile cache aynıdır. Müzik beat senkronizasyonu eklenmedi. Kaynak araştırması ve ayrıntılı güncel sözleşme `2D_MODE_AI_HANDOFF.md` bölüm 0'dadır.
- QA: 3.584 çekirdek geçilebilirlik senaryosu; 1.584 coin rotasında 4.356/4.356 coin; 14.400 görünür collider örneğinde çakışma yok. 30/60/120 FPS simülasyonu, rewind, platform/gravity, input, mobil/native ve altı biyom/cache kontrolleri. Donanım FPS garantisi değildir.
- Aynı kaynak/ZIP/cache 1.8.11; 3D runtime SHA256 değişmez. Steam/Pixel/canlı siteye dokunulmadı.

### 1.8.10 — 2D prosedürel engel çeşitliliği (önceki altyapı)

- Yalnız2D mantığı: sabit engel dizisi yerine20-phrase seeded shuffle bag, sınırda tekrar yok.10 çekirdek türün en/boy/açıklık/hız/uyarı/faz/dönüş/bounce/pad enerjisi üretimde belirlenip instance'ta saklanır. Incoming car/motor katsayısı.35–.65, fall warning.5–.9s, çift fall stagger.14–.30s. `beamJump`, `fallPair`, `padMotor`, `wideLava` karma grupları; eski üst/pad-chain/gravity/saw yolları aynen korunur.
- Jump715/gravity1850/slide.8+recovery.18 değişmez. Balistik clearance kökleriyle genişlik cap, pad hazard ortak güvenli aralığı,8s hız artışı+maxbhop+ice bütçesi ve phrase sonrası recovery rezervi vardır. Geniş lav normal eldivene pad sağlar; zorunlu yetenek kapısı yoktur. Araç/pad/ice/spinner çizimi collider varyantıyla eşleşir.
- Math.random yalnız spawnAhead'de ilk seed için bir kez; update/render'da yok. Fall/spinner/car immutable parametrelerden worldTime ile hesaplanır; rewind aynı pozları, pause aynı saati korur. Snapshot generation seed/phrase/clamp ve görünür obstacle varyant alanlarını bildirir. Ufukmax(2800,width+1000), havuz48/history241×12/cache2; yeni RAF/medya/loader/fizik bağımlılığı yok.
- QA1810:2.240 katalog+20bag;2.016 eldivensiz,672 bonuslu uç hız ve392 tüm çekirdek phrase-çifti olmak üzere3.080 rota;30/60/120FPS, rewind/pause/no runtime RNG PASS.185physics/regression/native,186UI/audio,188bhop/glide,189scenery ve official istemci son kaynakta tekrar PASS; son screenshot/state incelendi, yeni error yok. Ayrıntı2D handoff bölüm0. Gerçek cihaz FPS benchmark'ı değildir.
- Aynı kaynak/ZIP/cache1.8.10;3D runtime SHA2564CBDF64F971410DB1640A575CF56C11EE689097843521D1E521CD53F5CB42A1D aynı. Steam/Pixel/site değişmez.

### 1.8.9 — 2D dünya-konumlu manzara ve yüksek kamera (önceki altyapı)

- Tek2048px modulo arka plan yerine, global hücre/seed'den deterministik1024×512 far/near Canvas parçaları üretilir. Aynı kısa manzara döngüsü yok; motiflerin konum/boy/yoğunluk/dekor seçimleri değişir. Görünür+bir önceki/bir sonraki parça, en fazla2biome; eviction/exit backing store küçültüp bırakır, rewind aynı parçayı üretir.
- Near kameraY ile, far.18×kameraY ile aşağı taşınır; ufuk altı opak dolgu uzanır. Portrait letterbox alanı da gerçek manzara/zemin çizimiyle doldurulur; yüksek jump'ta sabit alt dolgu/atlas sınırı açılmaz.120Hz fizik/60Hz history/collider/jump yüksekliği/üretim ritmi/input/audio/3D runtime değişmez.
- QA189:6biome×3yükseklik, tile seam/biome fade, tekrar etmeme/determinism,60bölüm bounded cache+dispose (max2tema/16parça/~32MiB), gerçek30/60/120FPS pad/updraft, mobil yatay/dikey.185/186/188 ve native lobi→2D→Endless regresyonları PASS; official istemci/screenshot/JSON incelendi. Aynı kaynak/ZIP/cache1.8.9; Steam/Pixel/site değişmez. Gerçek cihaz FPS ölçümü değildir. Ayrıntı `2D_MODE_AI_HANDOFF.md` bölüm0.

### 1.8.8 — 2D bunnyhop / hold-to-glide (önceki altyapı)

- 2D inişten60ms içinde tekrar jump, mevcut120ms pre-landing buffer ile combo. İlk jump/air doubleJump artırmaz, basılı tutmak otomatik bhop yapmaz. Hız+%2/hop(cap%10), yeni peak puanı+%1.8/hop(cap%18); coin/jump yüksekliği değişmez. Yerde pencere kaçırılırsa, pad zorunlu fırlatmasında veya hit/reset'te combo kesilir. Compact combo chip.
- Forest Guard yalnız Jump basılıyken düşüşte süzülür; release hemen normal gravity. E/touch skill toggle kaldırıldı, Forest skill button gizli. Kaynak-bazlı keyboard/touch/gamepad aggregation; pointercancel/lostcapture/disconnect/blur/pause/death/exit cleanup.12-alan60Hzhistory combo ve pencereyi sarar;120Hz tek loop/3D izolasyonu aynı.
- Test188bunnyhop/glide/input/rewind/slow/alt-üst zemin/bonus cap/mobilbounds;18530 stairs+72 saw+24 incoming+54 hazard+6pad-chain+6×600s lifecycle;186MP3/SFX/UI;native gerçek keyboard/lobi→2D→Endless. Aynı klasör/ZIP1.8.8,3D runtime/Steam/Pixel/site değişmez. Ayrıntı2D handoff bölüm0.

### 1.8.7 — 2D UI / dar basamak / müzik ve efektler (önceki altyapı)

- 2D HUD3 kolon, ortak responsive square controls, skill merkezde/cooldown çizgisi; pause hizasını bozan global button margin'i scope içinde sıfırlandı. Start/lobi aynı boy. Yatay/dikey/dar ekran/safe-area ve RTL desteklenir.
- Basamak düzeltmesi1.8.7: ince asılı platformlar geri alındı. Zeminden başlayan dolu blokların yükseklikleri eski56 artışla korunur; yalnız yatay genişlik pace*.5→pace*.35 ile%30 daraltıldı. Merkez aralığı/coin/swept landing/jump reset/yan lethal aynı.30 rota (5seed×3FPS×2hız),3/4/5 basamak çıkışı geçti. Hareket/hız/ekonomi/gravity/rewind/death ve1.8.6 UI/audio değişmez.
- Kullanıcının MP3'ü `assets/audio/runner2d-theme.mp3`: orijinal3.62MB/90.52s, yalnız2D enter metadata, playing streaming loop. Merkezi `ElementalAudio.setRunner2DState` sahibi;3D/lobi track'leri çakışmaz, menu/pause/death/hidden/ad/mute/exit doğru kapanır. Master/music slider'ları ve kısa başlangıç fade'i aynı loop'ta; yeni RAF/timer yok.
- 2D jump/slide/coin/land/pad/hit/pickup/crumble/break/gravity/revive ve yetenek-specific kısa SFX; ortak sfx/master bus,12voice limit/rate limit/cached noise/disconnect cleanup. Runner.sound doğrudan audio API, standalonefallback eskiadapter. `game-runtime.js` ve3D sound yöntemleri değişmez.
- QA:6 ekran boyutu/TR-EN-DE-AR bounds/overlap/size/center; gerçek browserMP3 currentTime/volume/pause/resume/mute/ad/retry/exit; analyserSFX+boundedvoices; ince stairs. 1.8.5 physics/routes/nativeintegrationregression tekrarPASS. Official web-game client/nativeglobalCSS ve gerçek audio owner uyumu kontrol edilir. Testler canlıSDK/gerçek cihazFPS ve duyumsal ses kalitesi benchmark'ı değildir. Aynı standart klasör/ZIP1.8.6,Steam/Pixel/site değişmez; ayrıntı2D handoff bölüm0.

### 1.8.5 — 2D basamak / yerçekimi / testere / voxel (önceki altyapı)

- `runner-2d.js`:3–5 katı basamak (56 yükseklik artışı, pace*.72 aralık/pace*.5 genişlik), üstten swept iniş/jump reset, yan lethal; her üst blokta1 coin. Eski tek-can,450→800 hız ve az coin düzeni korunur.
- Çift gravityPortal (2100 birim aralık+1000 iniş alanı), gravityDir±1/ayak ankrajı/380 yüksekliğinde tavan; jump/glide/fast-fall/slide çizimi ters yönü destekler. WorldTime sinüslü64 çaplı saw; yeni spawn kuralları mevcut generator'a eklenir.
- History241×10/60 Hz, fizik120 Hz, aynı RAF; gravityDir kaydı ve geçmiş örneklerden merkez tabanlı rewind. Portal tekrar tetikleme ve testere konumu geri sarma ile uyumlu. Objeler3000 birim geriye kadar tutulur, tavan ceilingEnd erken recycle edilmez.
- Ölümde ana cube gizlenir;18 pooled voxel,150 ms hit-stop→650 ms scatter (ilk240 ms shake)→fade-in sonuç. Dünya/history/puan donuk; Prime revive bunu başlatmaz. Ek RAF/timer/asset/physics yok.
- `lobby-hub.js`: 2D portalı üstünde yerel highScore + kayıtlı metre hologramı. Safe JSON0m fallback, değişmedikçe parse/texture upload yok, tracked kaynaklar, hafif bob/opacity. Aynı-tab sonuç lobiye dönüşte güncellenir.
- QA:6 basamak+72 saw rotası/3 FPS/2 hız/ters ve normal; portal/tavan/cancel/rewind/slow;24 incoming+54 eski hazard+6 chain;6×600 s invulnerable lifecycle probe (6 biome,40–42 flip, max aktif14/parçacık52/cache2); native loading/PLAY/proximity/8 glove/cüzdan/ölüm/retry/3D Endless ve mobile touch/RTL/layout. Hologram kayıt/bozuk JSON/resource reuse ve screenshot incelendi. Official client final1.8.5 PASS;22 rootJS syntax/94 görev dışı dosya SHA256 eşliği PASS. Canlı SDK/gerçek düşük güçlü cihaz FPS testi değildir.
- `game-runtime.js` SHA256 değişmez; Steam/Pixel/siteye dokunulmaz. Build/index/cache ve aynı dağıtım ZIP'i1.8.5 olur. Tam güncel sözleşme `2D_MODE_AI_HANDOFF.md` bölüm0.

### 1.8.4 — 2D Hardcore ritim / ekonomi (önceki altyapı)

- Yalnız `runner-2d.js` oyun mantığı değişti. Sağlık/max1, heal ve shield pickup/absorption/UI kaldırıldı. Gerçek hasarı yalnız Elemental Prime bir kez1 can+3 s bağışıklıkla kurtarır; mevcut Phase/Dash/Rewind hasar önleme yetenekleri aynı kalır. HUD tek kalp.
- Hız450→800 (`450+350*(1-exp(-elapsed/85))`), yaklaşan araçlar−speed*.40. Normal slot480/528/576, pad-train/glass1248, stairs1536, chain2304. Coin normal2–3, her üçüncü slot boş; pad/wall4, stairs5, chain6. Magnet yalnız her12 slotta; ortak çarpanlar/cüzdan/tekil ödeme korunur.
- .12 s coyote hareket saati, Ember'ın ikinci hakkını tüketmez; jump aynı input'ta slidePose dahil kaymayı tamamen iptal eder. Hızlı düşüş ve sonlu kayma devam eder. History241×9 artık coyoteTime da saklar;120 Hz fizik/60 Hz kayıt/tek RAF aynı. Son pad-chain iniş platformu yeni hızlarda aştırılmaması için+1570/w720 oldu.
- `playing→dying→dead`:150 ms simülasyon hit-stop,240 ms Canvas shake, sonuç UI/settle. Dünya/puan/history sabit; input death efekti bitmeden retry yapamaz; hidden tab sunum saatini de dondurur. Reduced-motion shake çizmez. Mevcut stateChanged SDK/ses yaşam döngüsünü kullanır, runtime'a ek timer yok.
- QA: `test-2d-184.cjs` sağlık/revive/death/bank/coyote/instant cancel/rewind,144 slot ekonomi,24 incoming+54 hazard rota,6 chain,6×600 s normal-skill parkur (30/60/120Hz × başlangıç/tavan hız; fast-fall kullanır, ilave invulnerability/shield yok),6 biome/cache≤2/bounded pools. `test-2d-184-integration.cjs` native PLAY/portal/keyboard/8 glove/ölüm/cüzdan/retry/exit→3D Endless ve mobile touch/RTL/layout. Official skill istemcisi ve son screenshot/JSON incelenir. Bunlar gerçek cihaz FPS ölçümü veya canlı SDK reklam testi değildir.
- Aynı kaynak/ZIP kullanılır; Steam/Pixel/canlı site değişmez. `game-runtime.js` SHA2561.8.3 ile aynı. Tam güncel2D sözleşmesi `2D_MODE_AI_HANDOFF.md` bölüm0'da; aşağıdaki sürüm notları tarihsel altyapıdır.

### 1.8.3 — 2D dikey platformlar ve biyom/eldiven mekanikleri (önceki altyapı)

- Yalnız `runner-2d.js` oyun mantığı değişir; `game-runtime.js` SHA256 aynı kalır. 120 Hz fizik/60 Hz history/tek RAF/Canvas2D ayrımı korunur. `grounded/support` ile solid-top yüzeyde iniş, jump reset, platform üstünde koşu/kayma/kenardan düşüş; asılı platformlar tek yönlü, normal block yanları hasarlı.
- Opsiyonel y100/y200 stairs ve coinli upper rotalar;1 s sonra çöken bloklar; yükseklik göreli üçlü pad zincirleri. Neon airDash cam duvarı kırar; diğer eldivenler sağlanan pad'le geçer. Forest glide updraft980 hız; Water bubble .3× gravity; Snow platform .8 s1.22× speed; Lava geyser1.5 s uyarı+.85 s patlama, görselle aynı collider yüksekliği.
- World-time olayları pause/rewind'e bağlı. History241×8: eski4 alan+jumps/support/iceUntil/bubbleUntil; çıkış vy ve platform desteği de yüklenir, geri alınan kırılma/pad/alan tetikleri tekrar kullanılabilir. Kamera y225 üstünü kozmetik takip; hasar/sert iniş/dash shake reduced-motion'a saygılı; glove accent trail aynı112 particle havuzunda.
- Engel havuzu48, diğer havuzlar ve cache2 aynı; normal car/motor/fall/spinner/beam/pad-tren korunur. Yeni ağır asset/metin/GLB/shader/fizik motoru yok. Tam sözleşme `2D_MODE_AI_HANDOFF.md` bölüm0'dadır.
- QA PASS: `test-2d-183.cjs` yeni collider/fields/crumble/rewind/30 güvenli rota/6 stairs+6 chain/600 s bounded probe; mobile/RTL/save tekrar; `test-2d-183-integration.cjs` gerçek portal, input/cüzdan/8 skill/155 s altı biyom can3 ve exit→3D Endless. Official skill istemcisi ve yeni görseller incelenir. Bunlar gerçek düşük güçlü cihaz FPS veya canlı SDK reklam testi değildir.

### 1.8.2 — karşıdan gelen 2D engeller, animasyonlu kayma ve sade arayüz (altyapı)

- Yalnız 2D modu değiştirilir. Mevcut araç/engel/harita çizimleri korunur. Pattern içinde `carIn` ve `motorIn`, aynı çizime sahip hareketli varyantlardır. Oyuncuya yaklaşırken `vx = -speed * .24`; uzaktan okunabilir, güvenli tepki aralığı vardır. Sabit araçlar da kalır. Normal slotlar 672/768/864; ped-tren slotu 1344. Bu, ritmik bir parkur akışıdır; müzik beat senkronizasyonu iddiası değildir.
- Hareket, `worldTime` / başlangıç konumu / hızdan deterministik hesaplanır. Pause dondurur; Frost aynı zamanı yavaşlatır; Time Rewind geçmiş dünya saatini de geri sarar. Havuz reset'i hareket alanlarını temizler. Geçmişteki hareketli engeller rewind penceresine yetecek kadar saklanır.
- .8 s fiziksel kayma süresi ve .18 s toparlanma korunur. `slidePose` delta-time damping ile girip çıkar. Gövde geriye yaslanır, ayaklar öne uzanır, arka el yere destek olur; skid çizgileri/toz devam eder; sonra yumuşak ayağa kalkış. Görsel animasyon collider'dan ayrıdır; basılı tutma sonsuz kayma yapmaz.
- HUD artık kalp, altın, ince yüzde çubuğu/küçük mesafe ve ikon düğmeleridir. Oyun içi büyük logo/puan/biome metni ve uzun kontrol açıklamaları gizlendi. Sonuçta mesafe + altın/süre/rekor ikonları; play/retry/lobi kısa ikonları. Yerelleştirilmiş aria-label/title ve tuş ipuçları korunur. Canvas dokunma/tıklama zıplatır; HUD/button tıklamaları buna sızmaz. Mobil controls ve güvenli ekran kenarları desteklenir.
- QA: `test-2d-182.cjs` 24 hareketli engel hız/FPS/Frost rotası; pause/rewind konumu; dört slide pose; canvas tap/ikon etiketleri; 600 s altı biome default-skill koşusu, sağlık3/cache≤2/errors=[]. Önceki statik/ped/pickup, mobil/RTL ve tam portal→2D→Endless testleri tekrar geçti. Official Playwright istemcisi de gerçek boot PLAY/portal/input akışını çalıştırır. Görseller açılıp incelenir; bu testler gerçek düşük güçlü telefon FPS ölçümü değildir.

### 1.8.1 — 2D kayma, engeller ve güçlendirmeler (altyapı; 1.8.2 yukarıda)

- 1.8.0 altyapısı korunur; bu bölüm aşağıdaki ilk 2D sürümünün eski kayma/üç engel notlarının yerini alır. 3D modellerin tanınır siluetleri Canvas2D olarak uyarlanır; GLB'lerin kendileri yeni 2D modunda tekrar yüklenmez.
- Sürekli `slideHeld`→crouch yok. Tek basış .8 s kayma + .18 s toparlanma. Tekrar kaymak için bırakıp yeniden basılır. Havada aşağı basış hızlı düşüş yapar, .28 s iniş tamponu vardır; pause tuşları bırakır, sayaçlar durur. Frost etkisinde X hareketi, düşüş ve kayma aynı yavaşlatılmış zamana bağlıdır.
- Authored 12 parçalık parkur: sarı-siyah alçak bariyer, araba, motor, asılı kayma kirişi, işaretli kırmızı düşen engel, dönen alçak engel, lav şeridi veya kar biyomunda buz sivrileri. Trenler yalnız 170 birim önce jump pad ile eşlenir. Pad, normal jump ile girilse de çalışır; fırlatma enerjisi mevcut yüksekliği hesaba katar, mutlak tepe≈315 ve karakter ekran içinde kalır. Rewind ile geri dönülen ped yeniden kullanılabilir. Tam yükseklik duvar/kaçışı olmayan sıra yok; normal aralık≥670, ped sonrası≥1280 iniş/reaction alanı.
- Yeni 24-slot pickup pool: 10 s/tek darbe kalkan, 8 s mıknatıs, +1 can (max3). Buff'lar eldiven cooldown/etkisinden bağımsızdır; pause/reset/death ve HUD sayaçları entegre. Gold/magnet toplanması geri sarılıp çoğaltılamaz. API sound köprüsü eski 3D pad/pickup/shield-break seslerini kullanır.
- Atlas arka planları 6 tema için detaylıdır: doğa kulübeleri, mantarlar, kayalar; kar kulübeleri ve kardan adamlar; şehir neon camları, üstgeçit ve lambalar; volkan/akış; sky yüzen ada/tapınak; sualtı harabe/mercan/balık. Kırmızı yol bariyeri oynanabilir siluetlerin arkasındadır. Tema cache≤2, 32 obstacle/144 coin/24 pickup/112 particle; yeni ağır medya yok.
- QA: `test-2d-181.cjs` tek basış/held/rearm/pause, 24 normal engel rotası, 12 düşük-yüksek hız/Frost/pre-jump ped-tren rotası, kalkan kırılma, heal, magnet expiry, rewind pad ve 600 s altı biyom default-skill koşusu: minimum sağlık3, bütün9 hazard türü, cache≤2, hata yok. Uzun test fizik alt-adımlarını hızlı simüle eder; gerçek cihaz FPS iddiası değildir. Başlangıçta her simülasyon adımını çizmek QA komut kuyruğunu gereksiz uzatıyordu; yalnız QA hızlı simülasyonunda render seyrekleştirildi, üretim frame loop'u değiştirilmedi.
- `test-2d.cjs`: gerçek 3D lobi portalı→2D, input, ölüm/retry/banking, 8 yetenek, 30/60/120 Hz, altı biyom ve çıkış→orijinal Endless geçti. Mobil dokunma/held slide/cancel/RTL/layout testi ayrı; bütün tema ekranları açılarak incelenir. Düşük güçlü gerçek telefon testi hâlâ cihaz üzerinde gerekir. Korunan dört 3D fonksiyon, curved shader ve 103500 blueprint satırı eski ZIP ile aynı.

### 1.8.0 — ayrı portal üzerinden 2D RUN (ilk sürüm; 1.8.1 değişiklikleri yukarıda)

- Kullanıcının yeni isteği: ayrıntılı 2D oyun sürümü, yukarıdan düşen ve yukarıda sabit duran engeller, yeni lobi portalı. Eski 3D oyunun yerine geçmeyen üçüncü `runner2d` modu eklendi. Yeni release klasörü açılmadı, Steam/Pixel ve canlı site değişmedi.
- `lobby-hub.js`: mevcut Endless/Level girişlerinin sağında X=25, Z=-29.8 pad; mercan renkli **2D RUN** portalı. Mevcut proximity/camera handoff kullanılır, bu mod için 3D seviye hazırlığı veya fare kilidi istenmez. 2D girişinde mevcut lock serbest bırakılır; lobi dönüşü mevcut kilit politikasını kullanır.
- `runner-2d.js` ve `runner-2d.css`: ayrı Canvas2D görünüm/kinematik modülü. Tek mevcut runtime RAF `stepGame` tarafından güncellenir. Aktifken 3D simulation/render branch'i çalışmaz; CPU koordinatları +X ileri / +Y yerden yükseklik. 1/120 s sabit alt-adımlar; 30/60/120 Hz aynı fizik. DOM HUD 10 Hz. Bu özellik curved-world, GLB/viewmodel katmanları veya 3D CPU çarpışmasına dokunmaz.
- Yerden blok, iki zincirle sabit yüksek kiriş (43 birim alt boşluk; 29 yüksekliğinde kayarak geçilir), 0.68 s işaretli ve ardından düşen blok. Uyarı oyuncunun tahmini varışından 1.55 s önce başlar. Hız 360→540 kademeli; engeller en az 600 birim aralıklı ve en az 1600 birim ileride hazırlanır. Üç kalp, hasar sonrası 1.65 s dokunulmazlık; ilk engel 1400 birimde. Jump=715, gravity=1850; zıplama tamponu .12 s.
- Doğa, kar, şehir, lav, gökyüzü, su illüstrasyonları; 9000 dünya biriminde bir biyom, arka plan/zemin 1.5 s çapraz geçiş. Parallax, bulut, kar/mote, taş kemerler, çevre detayları, karakter yüzü/koşu/kayma animasyonu, şapka ve seçili eldiven renkleri. Yeni ağır GLB/PNG indirmesi yok; desenler Canvas'ta üretilir. Arka plan önbelleği en fazla iki tema, engel/coin/parçacık havuzu 32/144/112, DPR mobil≤1.5/masaüstü≤2. Çıkışta tema canvas referansları bırakılır. Donanım FPS garantisi değildir.
- Seçili sekiz eldivenin 2D karşılığı: Ember ikinci tam zıplayış; Frost kısa zaman yavaşlatma; Forest havada süzülme; Neon kısa dash; Tide geçmişe geri sarma; Solar mıknatıs; Void 3 s faz; Elemental koşu başına bir can kurtarma. 2D cooldown/state tamamen ayrıdır, 3D cooldown'larını etkilemez. Rewind peak score'u/harcanan coin'leri geri getirmez.
- Space/W/↑ zıpla, S/↓ ve mevcut slide binding kay, E/mevcut skill binding yetenek, Esc/P duraklat. Mobil dokunmatik düğmeler; controller A/↑, B/↓, X, Start. Kaydedilmiş jump/slide/skill keybind'leri korunur. Blur/hidden tab pause yapar; geri dönünce açık devam düğmesi vardır. Müzik/SFX mevcut mixer üzerinden ayarlara uyar.
- Kazanılan altın ortak `menuState.walletCoins` ve coin/günlük koşu görevlerine aktarılır; artımlı/idempotent settlement, retry/exit/pagehide double-bank yapmaz. 2D rekoru `elemental-run-2d-v1` localStorage anahtarında, 3D leaderboard/medal/progress'e gönderilmez. Aktif 2D oynanışı süre ödüllerine sayılır; ready/pause/dead sayılmaz. Poki gerçek `playing` halinde start, pause/death/ready halinde stop alır.
- QA: `output/test-2d.cjs` gerçek lobby pad→portal girişini, keyboard/jump/slide, üç hazard survival + beam damage, death/retry/wallet, sekiz eldiven, 30/60/120 Hz eşliği, 155 s altı biyom koşusu (sağlık=3, cache≤2), lobiye çıkış→orijinal Endless regresyonunu kapsar. `output/test-2d-mobile.cjs` dokunma/double jump/pointercancel/pause, 844×390 ve 390×844, Arapça RTL ve bütün diller, bank/save kontrolüdür. Official skill client `output/run-2d-official.mjs` ile çalıştırılır. Test görüntüleri açılarak incelenir; QA dosyaları ZIP'e girmez. Gerçek düşük güçlü telefonun termal/uzun oturum profili hâlâ cihaz üzerinde doğrulanmalıdır.

### 1.7.46 bölüm ilerlemesi, sabit fiziksel finiş ve sis (korundu)

- Kullanıcının son isteği, puan/bölüm çubuğunun aniden dolmaması ve çok uzak görüşün sisle kısıtlanmasıdır. Eski "finiş yaklaşınca %100 yap" isteği geçersizdir. `armFinish` artık yalnız finişi hazırlar, puan/ilerleme eklemez. Gerçek `crossFinish` %100 yapar.
- Kök nedenler: toplam skorun upgrade/rebirth/bhop çarpanlarıyla büyümesi; buna bağlı hareketli finiş tahmini; HUD'un finishArmed halinde zorla doldurulması; mesafe tahmininin 60 bazını kullanırken hareketin `RUNNER_FRAME_BASELINE=120` kullanması.
- Kampanya bölümünün fiziksel uzunluğu artık ilk satırdan önce, `targetScore / (SCORE_RATE_PER_SPEED / RUNNER_FRAME_BASELINE) + finishLead` ile sabitlenir. `prediction.start/x` mutlak sanal X'tir; world rebase sırasında değiştirilmez. Toplam kazanılan puan/çarpanlar korunur, **bölüm puanı** ise gidilen mesafenin hedef puana oranlanmış karşılığıdır. LevelSystem'in `spatialProgress` alanı HUD, snapshot ve ara harita tetiklerini tek kaynaktan besler. Non-spatial/fallback seviyeler raw score yolunu korur. Yeni bölüm yeni başlangıçtan sıfırlanır.
- Bölüm sınırı artık provisional score forecast değildir: ilk satırdan önce bilinen sabit fiziksel plandır. Mevcut ve hazır next-course satırları footprint kontrolüyle kendi sınırlarında kalır; görünür modeller silinmez. Next opening pencere uzunluğu puan çarpanına bölünmez. Kısa seviyelerde look-ahead sınıra yaklaşınca next biome hazırlığı %70'ten önce başlayabilir; iki biome GPU bütçesi ve dilimli warm korunur. Gold/Silver/Bronze ghost sisteminin mevcut 120/46 mesafesiyle gerçek finiş eşleşir.
- Mega jump yaklaşımı/sinematiği bölüm ilerlemesini sabit tutar; bu sıradaki sanal X yolculuğu origin ve endpoint'e birlikte eklenir. Çarpan değişimi sınırı taşımaz. Rebase ve geri sarma fiziksel ilerleme oranını doğru korur.
- L120 sonrası mevcut Endless devamı korunur; artık sabit finiş planı ve finite footprint sınırı temizlenir. Sonraki tunnel/lava üretimini geçmiş checkpoint durdurmaz. QA mega .51→.51 hold ve L120 save/Endless/plan cleanup doğrulamasını da kapsar.
- Kampanya Exp2 sis yoğunluğu en az .0038 olur; daha yoğun cyber/lava/snow temaları korunur. Renk ve biyom geçiş interpolasyonu mevcut sistemdedir; yeni post-process veya transparan zemin eklenmez. Endless görünümü değişmez.
- QA: `output/test-progress-1746.cjs` 1×→12× toplam bonusu, %50/%75/%90/%99 HUD eşliği, armed ≠ full, gerçek L1→L2 crossing, rebase/geri konum, 30/60/120 FPS ve altı biome sis kontrolünü kapsar. 2 saniye sabit hız testinde her FPS'te 228 birim; ilerleme farkı floating-point hassasiyetindedir. `test-video-1745.cjs --boosted` yakın doğum=0, erken ölüm geri sarma tamamlanır, errors=[]. Collision/viewmodel/curved shader denklemleri değişmez; 103500 blueprint row eşliği doğrulanır. QA dosyaları ZIP'e eklenmez. Gerçek düşük güçlü mobil FPS testi ayrı doğrulama konusudur.

### 1.7.45 video ile yeniden üretilen yakın spawn düzeltmesi (tarihçe; finiş planı 1.7.46'da değişti)

- `2026-10-08 21-40-26.mp4` 5. saniyeden itibaren kareler incelendi. Sorun yalnız render mesafesi değildir: yüksek puan çarpanı geçici finiş tahminini açılış satırından bile kısa yapıyordu. Kilitlenmemiş tahmine karşı spawn clamp'i bütün açılışı engelliyor, skor/auto-rewind değişince cursor geride kalıp altın ve bariyerleri oyuncunun yanında üretiyordu. QA'da aynı durum 12× puan/.7 başlangıç hızıyla yeniden üretildi.
- Artık yalnız **kilitlenmiş** `campaignSectionBoundary` authored üretimi sınırlar; geçici skor tahmini üretimi durdurmaz. Bounded ön yükleme ve deterministik satır planı korunur. Checkpoint zaten mevcut giden engellerin sonrasına sabitlenir; görünür nesneler silinmez.
- Biome GPU hazır olması course'un hazır olduğu anlamına gelmez. Finiş modeli, sıradaki course'un dilimli shader/texture hazırlığı da tamamlanınca açılır. Kilitli sınır bu sırada hareket etmez; crossing hazır course'u koruyarak aktive eder, geç fallback prime ile yakın satır üretmez. Next course penceresi de provisional puan tahminiyle kısılmaz; yüksek çarpanda ilk satırından kısa, boş bir opening'i hazır saymaz.
- Viewmodel, collision loop, curve denklemleri, zemin depth/seam düzeltmeleri ve Endless dizilimi değişmez. QA scripti `output/test-video-1745.cjs` A/B: baseline 10 yakın doğum (min -28.8), fixed 0; erken collision recovery count=1 ve tamamlanır, errors=[]. Course testi L2/L3/L4/L8/L21 toplam 54 uzak row, boosted L1→L2 opening 7 row/12 root/1426 ahead; bütün prepared UUID'ler crossing sonrası korunur. Official native PLAY/portal/sol/jump `output/official-1745` screenshot/state açıldı, pointer lock=true. Statik protected 4 fonksiyon+curved dosyası ve 103500 blueprint row eşliği PASS. QA override'ları üretim JS'ine eklenmez.

### 1.7.44 engel hazırlık penceresi (tarihçe; tahmin clamp'i 1.7.45'te düzeltildi)

- Authored level stream artık regular spawn timer'a bağlı değildir. Her canlı karede en fazla bir mevcut-bölüm satırı hazırlanır; seeded row/cursor/gap/lane planı değişmez. Sabit 520–610 spawn window yerine render mesafesi ve hıza bağlı 1100–1800 birimlik bounded hazırlık penceresi vardır. Bu pencere yeni biome bankası ayırmaz; iki biome bütçesi korunur.
- Açılış yüklemesi aynı pencereyi `yieldLoadingSlice` ile karelere bölerek hazırlar. Senkron prime hâlâ en çok altı satırdır; girişte yirmi satırlık tek burst yoktur. Sıradaki course hazırlığı altı satır/800 birimde kesilmez; kendi hedef penceresine kadar tek satır + asenkron GPU warm ile ilerler. Kısa/boosted bölümlerde sıradaki tahmini finişin ötesine gereksiz satır hazırlanmaz.
- Finiş tahmini ilk satırlardan önce kurulur; bütün satır footprint kontrolü kilitlenmemiş tahmine de uygulanır. Skor hızlanınca görünür eski engelleri silmek yerine henüz görünmeyen checkpoint mevcut satırların sonundan sonraya sabitlenir. Böylece yeni look-ahead eski engellerin bir sonraki haritaya sarkmasını artırmaz.
- Trafik ışığının opak direği artık ışın alpha'sı 0.02'yi geçene kadar saklanmaz. Direk uzakta hazır kalır, yalnızca glow/beam/particles eski yakınlık fade'ini kullanır. Tutorial talimatları, fizik, viewmodel, GPU viraj denklemleri, zemin düzeltmesi ve Endless rastgele spawn dizilimi korunur.
- QA: `output/test-spawn-ahead-1744.cjs` L2/L3/L4/L8/L21 canlı 12s koşuları: 52 satır, minimum oluşum merkezi ~1072–1419, banka≤2, signal direği 600 birimde alpha=0 iken görünür; L1→L2 course 1426 birime kadar önceden hazır. errors=[]; görüntüler açıldı. Bu test simülasyon burst'üdür, gerçek cihaz FPS benchmark'ı değildir. Statik 4 protected fonksiyon/curved dosyası ve 103500 blueprint row eşliği geçer. Official native PLAY/portal/sol/jump kontrolü `output/official-1744-final`.

### 1.7.43 uzak zeminin gökyüzü tarafından örtülmesi (tarihçe; düzeltme korunur)

- Kullanıcının `2026-10-08 20-10-57.mp4` videosu 9–16s arası karelerle incelendi. Nature'da finiş/prewarm öncesinde de uzaktaki ağaçların altında açık mavi bölgeler vardı; 1.7.42 geometri eşliği bu hatayı tek başına çözmemişti.
- Kök neden: `installCampaignFloorSeam` katı zeminlerde `depthTest=false` yapıyordu. WebGL'de depth test kapalıyken `depthWrite=true` yeterli değildir: depth buffer yazılmaz, sonradan çizilen arka plan/dekor uzak zemini örter. Aynı sahnede bu tek flag'i açıp kapatarak hata tekrar üretildi ve giderildi.
- Katı zemin `depthTest=true`, `LessEqualDepth`, `depthWrite=true`, alpha=1 kullanır. `AlwaysDepth` kullanılmaz; kendi içinde üst üste projekte olan uzak/virajlı terrain üçgenleri yakın yüzeyleri ezebilir.
- Gelen biyom yüksekliğinin mevcut zemini erkenden örtmemesi için sınır dither'ı iki tarafta tamamlayıcıdır. İlk kalan section'ın `clipStart=0` değeri tam zemin sağlar; sonraki section `clipStart=1` ile sadece sınır sonrası kapsar. Eski section emekli olunca kalan section'ın başlangıç kesimi kalkar. Sky'ın gerçek bulut alpha mantığı korunur. Kaynak Endless geometri/materyalleri, CPU çarpışma ve viewmodel değişmedi; ek mesh/texture/frame allocation yok.
- QA: `output/test-floor-depth-1743.cjs verified` aynı sahnede önce/sonra, düz/viraj, kamera 3.2/10/20 yüksekliği; `output/test-floors-1742.cjs fixed` L1/L2/L3/L4/L8/L21 sınırları, iki yön viraj, overhead, finiş önü ve gerçek L1→L2 crossing. Son ekran görüntüleri açıldı; console errors/local404=[]; kaynak geometri eşliği/banka≤2 kontrolleri geçti. `output/official-1743-final` native PLAY/portal/sol/jump testidir. Bunlar görsel/regresyon testidir, düşük güçlü mobil benchmark değildir.

### 1.7.42 bölüm zeminlerinin Endless ile eşlenmesi (tarihçe; derinlik/dither 1.7.43 ile düzeltildi)

- Kullanıcının bölüm Nature/Snow ekranlarında gördüğü kırık zemin için, Endless ile karşılaştırma yapıldı. Campaign bütün katı zeminleri düz `PlaneGeometry(1,1800,64,12)` ve `sheet` bükülmesine çeviriyordu; Snow kabartması kayboluyor, Nature/Snow/Cyber farklı koordinat tabanında bükülüyor ve kesilmiş geometri kenarları komşu zemini açığa çıkarıyordu.
- Katı zemin artık ilgili Endless kaynağının geometrisinin sahiplikli kopyasını, özgün boyut/segment/kabartmasını ve kaynak materyalin curve mode'unu kullanır. Nature/Snow/Cyber `smooth`, Lava/Water özgün `sheet` kalır. Her katı yüzey oyuncu merkezli doğal boyutta devam eder; biyom sınırını geometriyi daraltarak değil mevcut opak fragment dither ile belirler. Texture tekrarları gerçek geometri boyutundan hesaplanır.
- Sky'ın beş bulut katmanı, iki biyom sınırı, kademeli GPU warm/disposal, çarpışmalar ve viewmodel değişmedi. Yeni geometri kopyası stage/banka ömrüyle boşaltılır; her kare geometri üretimi yoktur. Endless kaynakları değiştirilmez.
- QA: `output/test-floors-1742.cjs` gerçek tarayıcıda straight/left/right, overhead ve finiş çevresi çekimleri; GPU/CPU kaynak geometri eşliği, opaklık, kaynakla aynı curve mode ve en çok iki banka kontrolü. `compare` senaryosu aynı kamera/virajda dekorları gizleyerek campaign ile gerçek Endless kaynak floor'unu ayrı ayrı çizer. `output/official-1742` official istemci PLAY/portal/sol/jump görüntü ve state çıktılarıdır. QA dosyaları dağıtıma alınmaz.

### 1.7.41 opak zemin / bütçeli GPU hazırlığı (tarihçe; katı zemin geometrisi 1.7.42 ile değişti)

- Katı terrain artık transparent kuyruğunda değildir; alpha=1 ve depthWrite=true kullanır. Incoming sheet tam opak altlık kalır, outgoing sheet 180 birimlik bantta screen-space dither ile çözülür. Eski banka silindiğinde altı görünmez. Sky'ın gerçek bulut katmanları bilinçli olarak saydam kalır. Rebase/world-X dikiş ankrajı korunur.
- Kritik CPU takılması: r185 Camera.clone(false) recursive argümanı iletmiyor ve kameranın Layer-1 el GLB ağacını her hazırlıkta kopyalıyordu. İki warm-camera kurulumu PerspectiveCamera.copy(camera,false) oldu; canlı viewmodel/overlay değişmedi.
- Gerçek mesh'ler tek tek 16×16 gizli hedefte upload edilir; bir tünel/ağaç bütünü tek çağrıda çizilmez. Shader hem ekran SRGB hem gizli RT linear permütasyonunda compileAsync ile hazırlanır. Banka başına geometry/material, shader ailesi ve texture warm cache tekrar işi engeller. Canlı koşuda farklı shader üreten dummy-küp galerisi atlanır; gerçek stage GPU-ready kontrolü korunur.
- Katı dekor uzaklık fade'i alpha blending yerine dither kullanır; gerçek yarı saydam kaynaklar korunur. forceSinglePass, çift taraflı transparent ön/arka shader çeşitlerinin ilk çizimde senkron derlenmesini engeller. Dekor yoğunluğu azaltılmaz, Endless dağılımı korunur.
- Disposal crossing karesinde toplu değildir: eski sahne hemen ayrılır; kaynaklar kare başına en çok 12 adet / yaklaşık 1.25ms CPU bütçesiyle boşaltılır. Yeni biyom GPU upload'ı bu kuyruk boşalmadan başlamaz. Snapshot pendingDisposals alanını içerir. Paylaşılan trafik/viewmodel/yol kaynakları korunur.
- Oynanışta hazırlık işlerindeki yield paint sonrasında ve kareler arasında boşluk bırakarak döner; düşük FPS'de aralık artar. Cyber bucket/dekor yapımı da bölünmüştür. Boot/pause/background mevcut yükleme scheduler'ını kullanır.
- Yerel gerçek RTX4060/High profilinde prepared-course en ağır senkron adım 378ms→1.1ms; warm kurulum 415ms→0.6ms; gizli GPU render en ağır gözlem yaklaşık277ms→3.4ms. Bu ayrı aşama ölçümleridir, bütün oyunun sabit60FPS olduğu anlamına gelmez: son16s örneğinde p95 frame20.9ms, en ağır frame201ms ve kalan post-process/driver long task'ları vardır. Gerçek düşük güçlü mobil/Poki Inspector ölçümü ayrıca gerekir. QA output/streaming-1741 altındadır; dağıtılmaz.

### 1.7.40 akıllı biyom akışı / Sky ve Cyber eşliği (tarihçe; fade/disposal ayrıntıları 1.7.41 ile değişti)

- İlk 10/ilk 2 bölüm GPU preload politikası yoktur. Kritik `campaign-entry-biome` yalnız giriş bölümünü hazırlar; boot sırasında Tutorial/City ve giriş Nature bulunabilir. Koşuda `campaignBiomeBanks` en çok iki ortam bankası tutar: mevcut biyom ve doğrudan sıradaki biyom. Ortak asfalt, trafik, karakter/viewmodel ve canlı collider kaynakları bu ortam bütçesinden ayrıdır; CPU model katalogları tekrar kullanım için kalabilir.
- Ham score/target ilerlemesi %70 olduğunda sonraki bölüm asenkron hazırlanır. HUD'un finişe yaklaşınca %100 göstermesi erken preload tetiklemez. Bölüm içi authored geçişlerde %70 eşiği o geçişin oranına uygulanır; önce mid-biome, sonrasında sonraki bölüm hazırlanır. Tek staging işi ve epoch/banka/context-generation geçerlilik kontrolü vardır.
- Modeller satır satır, materyal/bounds işlemleri küçük gruplar halinde; texture upload bir texture/slice, `compileAsync` hedef biyomun ışık/gölge permütasyonu ile yapılır. Gerçek mesh/instance buffer'ları küçük gizli render hedefinde upload edilir. Gelecek collider satırları ayrı koleksiyonda birer birer hazırlanır; görünür önizleme normal fizik listelerine ancak crossing'de katılır. Curved shader, Swept-X ve viewmodel overlay denklemleri korunur.
- Shader warm-up anahtarı UUID/renk değil yapısal özelliklerdir (material türü/cache key/defines, texture kanal ve mapping'leri, vertex color/tangent/morph/instance/skin, alpha/physical/clipping özellikleri). Aynı program ailesi staging içinde bir kez derlenir; yeni geometriler ve instance buffer'ları yine ayrı upload edilir. Bu, yavaş driver'larda aynı program için yüzlerce compileAsync beklemesini önler.
- Crossing'de hazır dünya bağlanır; yükleme ekranı, geçiş koridoru veya karartma eklenmez. Önceki GPU bankası resource sahipliği kontrolüyle `.dispose()` edilir; diğer banka/ortak kaynaklar korunur. PMREM cache ve eski scene/cache referansları temizlenir. Idle job artık bütün biyomların PMREM ortamlarını üretmez. Mid-level promotion aynı karede başlamış doğru next-bank işini yanlışlıkla boşaltmaz.
- Çok yavaş bir driver hazırlığı kaçırırsa boş dünyaya geçmek yerine mevcut biyom akmaya devam eder. Hazır olmayan next section için finiş çizgisi açılmaz; hazırlık tamamlanınca çizgi ve komşu dünya yeterli görüş mesafesinde kurulur. Bu emniyet yolu `latePreparations` sayacında görünür; sabit 60 FPS veya her cihazda sıfır hitch garantisi değildir.
- Campaign Sky, Endless'ın aynı beş cloud-floor katmanını (-30/-45/-60/-80/-100) ve kalın asfalt slab'ını kullanır; slab bariyerlerin içinde kalır. Cyber `createCyberBuildingLayout` ile Endless'ın kalite/mobil profiline ve üç yakın/orta/uzak bina bandına bağlıdır. Instance matrix upload yalnız değişiklikte yapılır.
- Zemin section'ları sınırın iki yanında 90 birim örtüşür, alpha smoothstep ile 180 birimlik yumuşak dikiş bandı oluşturur; world-X ankrajlıdır, texture kayması eklenmez. Floating-origin rebase sırasında fade sınır uniform'ları floor kökleriyle aynı karede yeniden hesaplanır; bir kare geriden gelen keskin dikiş önlenir. Mega Jump Pad yerleşimi mevcut engellerin arasındaki uygun boşluğu arar; engel/araç/coin silen koridor temizliği kaldırılmıştır.
- Tanılama: `campaign.spatial.streaming` limit/trigger/resident/banks, prewarms/evictions/disposed/peakBiomes/latePreparations gösterir. `entryReady` yalnız giriş cache hazır demektir; bütün seviyeler hazır anlamına gelmez. QA araçları `output/streaming-1740` altında ve ZIP dışındadır. Canlı site/Poki upload, Steam ve Pixel değişikliği yapılmaz.

### 1.7.39 birleşik modeller / Nature dağları / kayan hazırlık penceresi (tarihçe; preload politikası 1.7.40 ile değişti)

- Gerçek ayrışma nedeni: campaign tüneli ham factory materyallerine spline shader takıyordu. Aynı `snowCap`, kaya vb. materyallerini kullanan dekor çocukları GPU'da bükülürken kökleri CPU'da ikinci kez bükülüyordu. Tünel materyalleri artık shader kurulmadan ayrılır; CPU dekor kopyasında yabancı curve hook/marker temizlenir. Tüm parça/instance'lar aynı root dönüşümünü izler. GPU tunnel/floor/City mimarisi ve `curved-path-system.js` denklemleri değişmedi.
- `buildNatureMountainGeo`: UV dikişi ve taban kenarında yinelenen koordinatlar aynı displacement/renk örneğini paylaşır, taban kapalıdır. Topoloji testinde eski 21 açık kenar yerine 0 açık kenar. Yakınlaşınca model onarma/yeniden konumlama kullanılmaz.
- Nature campaign ve Endless ortak `spawnNatureSceneryRow` kullanır: yol kenarı, ağaç hattı, orta bant, tepeler, çitler ve uzak dağlar; aynı gerçek factory/taç ayrıştırma. Lava/Water/Snow campaign de sıralı özel dizi yerine normal `spawnLavaDecorAt` ağırlıklarını, yanal clearance ve komşu ayrışmasını kullanır. Nature küçük dekor ufku 1000 masaüstü/850 mobil, büyük dağ 1800; boy değiştiren reveal yoktur.
- CPU-bükülen düz shader'lı dekor çocuklarında frustum culling yeniden güvenlidir; GPU-deforme nesneler konservatif görünürlüğü korur. Geometri/program warm-up ortak kaynak üzerinden tekrar kullanılır; InstancedMesh matrix buffer'ları ayrıca upload edilir, texture upload aynı hazırlıkta yinelenmez.
- İlk-10 politikası kaldırıldı: kritik `campaign-entry-pair` görevi yalnız L1+L2'yi GPU'ya hazırlar. `campaign.spatial.entryReady` bunu bildirir; `firstTenReady` artık yoktur. Sonraki bölüm ve authored mid-level hedefi koşu sırasında sıralı staging ile hazırlanır. Farklı phase istekleri birbirini iptal etmez. L1/L2 Retry cache kalır; diğer sahneler kamera gerisine geçince kademeli emekliye ayrılır. Max3 bağlı spatial bölüm korunur.
- Sabit finişe 300 birim veya 3 saniyelik koşu mesafesi kalınca `armFinish` HUD ve snapshot progress'i anında %100 yapar; gerçek score/reward/time değiştirilmez. Finiş kutlaması ve fiziksel geçiş ayrı kalır.
- Regresyon yönteminde yalnız root XYZ/opacity veya child.visible yeterli değildir: shader-hook denetimi ve gerçek near/far, sol/sağ viraj PNG'leri gerekir. Eski Snow bölümünde 338 yabancı spline material kullanımı yakalandı; yeni kurulumda sıfır. `output/scenery-1739` testleri/PNG'leri dağıtım dışındadır. Mobil emülasyon/SwiftShader sonucu gerçek telefon FPS garantisi değildir; canlı site/Poki upload bu tur yapılmaz.

### 1.7.38 Endless / ölüm / sabit harita sınırı onarımı (tarihçe)

- Endless portalı artık `{endless:true}` ile eski rastgele hazard/dekor akışını başlatır; seri Level 1 akışına yönlenmez. Endless ölümündeki Retry da Endless'tır. Level portalı ve Level Retry seri olarak 1'den başlar. Önceki iki-portal-seri kararı artık geçerli değildir.
- İlk üç seviyedeki tek otomatik geri sarma yardımının `isGamePaused` guard'ına takılıp donması düzeltildi. Geri sarma, pause optimizasyonundan muaf zamanlayıcısıyla tamamlanır; Swept-X algoritması değişmez.
- Sonraki harita görünür olduğunda finişin sanal X konumu sabitlenir. Bhop/puan boost değişimi görünür dekorları taşımaz. Çizgi ve sonraki bölümün ilk deterministik engelleri uzaktayken hazırlanır; gelecekteki collider'lar canlı listelere ancak çizgi geçilince katılır. `level-system.armFinish` sabit fiziksel çizgiye yaklaşırken bölüm geçişini hazırlar, gerçek toplam puana ekleme yapmaz. Mid-level/Mega Jump hedefi tamamlanmadan komşu bölüm sabitlenmez.
- Finişte modelleri bounds tabanlı solduran/engelleri küçülterek silen akış yerine, eski nesneler kamera gerisinde temizlenir. Cyber instance Y-sinking kaldırıldı. Dağlar ve kar dekorları dinamik su bob'u yapmaz; yalnız Water'ın buoy/sailboat/birds türleri hareket eder. Nature ağaç hattı ve geç-biome koridoru eski gerçek fabrikalarla zenginleştirildi; geometri/texture paylaşımı ve max3 bağlı bölüm korunur.
- Snow ice artık asfalt genişliği eksi 1.6 birimdir; crack/frost/shimmer parçaları içte tutulur ve şerit genişleme animasyonunu izler. Lane lava/water materyallerinde `clone()` ile kopyalanan sahte GPU-bend marker temizlenip mevcut spline shader yeniden bağlanır. Tek şerit lava/water hazard genişlemez, baseY/center uniform'ları izler. Curved shader kaynağı ve CPU collision boyutlarıyla GPU koordinat ayrımı korunur.
- Doğrulama: masaüstü natural L1→10 ve yatay mobil; üç gerçek duvar çarpışması sonrası auto-rewind, Endless/Endless Retry ayrımı, sabit görünür XYZ/alpha, gelecekteki collider/pickup UUID'lerinin crossing'de aynen kalması, buzun tüm görsel parçalarının bariyer içinde kalması ve animasyonlu şerit merkezleri. Lava spline shader iki yönde -0.00062/+0.00062 katsayısıyla doğrulandı. L5 Mega Jump, L11/L18/L26 hybrid, WebGL context restore ve L120 terminal de geçti. Normal browser error/local404 yok. Mobil headless screenshot compositor timeout'u ayrıca headed test ile ayrıştırıldı; gerçek telefon FPS ölçümü değildir.
- Aynı kaynak/ZIP, build/cache `1.7.38-poki-endless-continuity-repair`. QA video kareleri, tarayıcı testleri ve baseline'lar `output/` altında, dağıtım dışında. Steam/Pixel/canlı yayın değiştirilmedi. Aşağıdaki eski kayıtlar tarihçedir; özellikle 1.7.37 Y-sinking, section fade ve +7 buz payı bu sürümde kullanılmaz. Sonraki doğrulama canlı Poki Inspector ve düşük donanımlı fiziksel Android frame-time ölçümüdür; otomatik site/Poki upload yapılmaz.

### 1.7.37 öngörülü finiş / model sürekliliği (tarihçe; yukarıdaki onarımlar geçerli)

- `updateCampaignFinishPrediction` mevcut skor oranı, bhop/puan çarpanı ve dünya zaman ölçeğinden kalan mesafeyi hesaplar. İlk 10 hazır bölüm kullanılır; sonraki >10 sahne tek in-flight hazırlama işiyle erken istenir. Hazır komşu harita, finiş armlanmadan önce görüş ufkunun ötesine bağlanır. Öngörü zamanla süzülür, finiş armlanınca gerçek sınır sabitlenir. `campaign.spatial.finishForecast` ve `sections[].preview/fading` tanılama içindir; ödül/madalya hesabı değildir.
- Bölüm dekorlarının tüm parçaları aynı root opacity ile geniş mesafe/sınır bantlarında fade olur. Kar pines'ının gövde/yaprak/kar InstancedMesh'leri birlikte warm-up edilir ve shader-curved geometriye uygun culling kullanır. Per-root materyaller ayrıdır; geometry/texture görüntüleri ortaktır. Bütün nesneyi finişte binary gizleyen yol kaldırılır. City instance siluetleri uzak bantta toprağa süzülür; gameplay sınırını aşan eski nesneler normal retire/recycle öncesinde 0.32s kozmetik küçülmeyle temizlenir; CPU boyut/çarpışma koordinatları değiştirilmez.
- Sınırlı reusable dekor koridoru sıklaştırıldı ve mevcut gerçek model türleri genişletildi (ağaç/kayalık/dağ, Cyber sokak dekoru, Snow cabin/igloo/frozen tree, Water gemi/lighthouse/platform, Lava vent/geyser/obsidian). Sadece görüş ufku çizilir ve en çok üç bölüm bağlıdır. Cached CPU-curved araziye eski zemin-contact embed metadata'sı hazırlık sırasında bir kez uygulanır; gizli legacy City instance buffer'ları her frame tekrar yazılmaz.
- `registerRoadAttachedModel` / `syncRoadAttachedModels`: tünel ve Snow buz yüzeyi baseline yol genişliğinden animasyonlu yeni yol genişliğine/merkezine retune edilir. Color/depth/distance spline uniform'ları aynı baseY/centerZ'yi kullanır; shader chunk kaynağı değişmez. Buzdaki mevcut yol dışı 7 birim pay ve tünelin güvenli duvar payı korunur.
- Bölüm tamamlandı toast'ı giriş, bekleme ve 0.38s çıkış animasyonuna sahiptir. Pause'ta timer ve CSS animasyonu birlikte durur; ölüm/reset eski toast'ı temizler. Reduced-motion tercihi korunur.
- İlk yüklemede WebGL context loss kritik task'ı başarısız bırakıp PLAY'i sonsuza kadar kilitlemez: bir kez restore sonrası kesilen aşamadan devam eder, daha önce geçersiz kalan GPU warm-up işleri tekrar tamamlanır. Tekrarlayan hata normal RETRY ekranına gider; hatalar başarı gibi sayılmaz. Aktif koşunun mevcut context-recovery UI'sı korunur.
- Cache/build: `1.7.37-poki-predictive-world-stream`. Aynı kaynak/ZIP; canlı upload yapılmaz. `output/test-continuity-1737.cjs`, `output/test-hybrids-1737.cjs` ve official skill client tanılama içindir ve pakete alınmaz. Yerel SwiftShader/SDK mock doğrulaması gerçek düşük donanımlı telefon FPS ölçümü veya her cihazda sıfır hitch garantisi değildir.
- Doğrulama: L1→10 doğal skor/movement akışı (test-only hazard immunity ile 441s/60Hz CPU step), dokuz sınır, next dekorun erken görünmesi ve max3 section; altı biome, Snow cap/trunk/needle birlikteliği ve animasyon ortası yol/buz/tünel/spline center eşitliği. L5 Mega Jump, L11/L18/L26 hybrid, loading ve aktif-run context recovery, terminal120, toast/pause/death/native Retry/input; normal console/page/local404 sıfır. 21 JS syntax, protected4 + curved kaynak ve 103500 blueprint row sözleşmesi temiz. Initial first-ten hazırlığı ve dekor artışı loading süresini uzatabilir; yazılım GPU'sunda yerel süreler cihaz benchmark'ı olarak yorumlanmamalıdır.

### 1.7.36 fiziksel harita sınırları / ilk 10 bölüm hazırlığı (temel mimari)

- Ölüm kartında harita-seviye üst başlığı, ölüm sebebi ve kontrol ipuçları gizlenir; OYUN BİTTİ, toplam altın/süre ve üç düğme korunur. Retry artık ortalanmış bir SVG'dir. Tamamlanan bölümler tablo yerine ayrı küçük **seviye / madalya / süre** kartlarıdır; uzun seride kart alanı kaydırılabilir. Başarısız aktif bölüme sahte madalya verilmez. Endless portalın rekor tabelası kaldırılır; Level portalı ve Stats rekoru korunur.
- `campaignLevelScenes` ilk 10 giriş haritasının gerçek dekor köklerini, PBR zemini ve ilgili tünelini saklar. `campaignLevelTransitionScenes` bu aralıktaki authored Level 5 Sky hedefini ayrıca saklar; mid-level hedef hiçbir zaman Level 5 Nature başlangıç önbelleğinin üzerine yazılmaz. Modeller/geometriler/texture görüntüleri mevcut ortak fabrikalarla paylaşılır; mutable opacity/uniform/zemin offset materyalleri bölüm bazında ayrılır.
- Boot'un kritik `campaign-first-ten` aşaması giriş ortamlarını **ve özel geçiş hedefini**, texture upload, `compileAsync` ve küçük hidden render ile gerçekten hazırlar. Gameplay kataloğu da tüm haritalardaki engel modellerini derler. PLAY açılmadan bu aşama tamamlanır; süre artırılmış olabilir. Bütün parkur engelleri başlangıçta yüz binlerce mesh olarak oluşturulmaz: authored deterministic satırlar mevcut spawn horizonunda üretilir; kaynakları hazırdır.
- Finiş armlandığında `campaignSectionBoundary` virtual X (`localX + worldScrollX`) olur. `campaignSpatialSegments` outgoing bölümün sonunu bu sınıra koyar ve hazır next bölümün başlangıcını aynı X'e bağlar. İki gerçek ortam finiş öncesinden birlikte görünür. Zemin sheet'leri bu sınırlara kesilir, doku offset'i dünya koordinatına sabitlenir; koskoca iki sonsuz plane üst üste çizilmez.
- CPU-curved dekor scene-root olarak dünya koordinatında tutulur; owner Group yalnız GPU-curved floor/instance batch'lerini taşır. Böylece CPU ve GPU bükme üst üste uygulanmaz. Shader kaynağı değiştirilmez. Sky'da 300 Y logical origin korunur: handoff player/camera/gameplay köklerini aynı delta ile taşır, active floor ve road/rail Y eşleşir; önceden görülen map şekli kameraya göre kesintisiz kalır. Spline tünel/depth/distance materyallerinin mevcut `uElementalCurveBaseY` uniform'u sahibi bölüm tarafından güncellenir.
- Obstacle/pickup/tünel ownership ve bitiş X'i mevcut çarpışma döngüsünü **dışarıdan** sarar. Finiş sınırının ötesine uzanan outgoing nesne normal retire/recycle yoluyla kaldırılır; sınırın gerisindeki yakın araç/engeller kaybolmadan canlı kalır. Yeni bölüm spawn cursor'u yeni authored satırdan başlar; eski ilerideki duvar/tüneller next dünyaya taşınmaz. Finiste hiçbir sis/black veil çizilmez; yalnız 1.1s gökyüzü/fog/light paleti yumuşar. Tutorial finish→siyah→lobi aynı kalır.
- Görünür sahnede mevcut, yaklaşan ve en çok bir gerideki bölüm vardır (üst sınır 3). İlk 10/Level 5 hedefi detached cache olarak Retry için kalır; sonraki bölümler bir önceki level sırasında hazırlanır, kullanılmayan >10 ve transient hedefler dilimli dispose edilir. Terminal Level 120 son aktif spatial dünyasında mevcut Endless spawn akışına devam eder. Authored Mega Jump normal fizik yolunu korur; sadece tekrar Sky dünya üretimi yerine hazır ortamı kullanır.
- Context loss GPU-ready bayraklarını geçersiz yapar. Restore sırasında kurtarma UI'sı açık kalır; cached bölümler GPU'ya yeniden hazırlanır, aktif bölüm/armed finish komşusu tekrar bağlanır, sonra kullanıcı Resume ile döner. İnaktif pause karesini sürekli yeniden çizmek yerine bir kez çizen guard mobil/compositor yükünü azaltır.
- `campaign.spatial` snapshot: active/firstTenReady/preparedLevels, boundary ve bölüm phase/start/end/visible/decor/floorY; eski global exterior sayaçları spatial koşuda sıfır olabilir, gerçek dekor `sections` üzerinden okunmalıdır. Swept-X, viewmodel update/overlay/split, curved-path kaynağı ve L6–120 blueprint'leri değişmez. Native ekonomi/save/SDK/pointer-lock akışı korunur.
- Build/cache: `1.7.36-poki-spatial-level-sections`. Aynı kaynak ve ZIP güncellenir; canlı site/Poki upload veya Steam/Pixel değişikliği yapılmaz. `output/test-spatial-1736.cjs` ve official client QA çıktıları pakete alınmaz. Yerel software-GPU/mock testleri fiziksel telefon FPS veya sıfır hitch garantisi değildir.
- Doğrulama: desktop ve 740×360 Android-UA L1→10 dokuz sınır + altı gerçek map; ground/rail, bounded floor join, eski wall/tunnel taşmaması, death/Retry1/Lobi. Level5 fiziksel Mega Jump, L11/L18/L26 hybrid, aktif context loss/restore ve terminal120→Endless; latest official native PLAY/portal/death/Retry ve hareket/jump, cached L5 Sky ve coin pool ownership. Normal console/page/local404 sıfır; kaynak protected4/curved ve 103500 blueprint eşit, 21 root JS syntax temiz. İlk loading SwiftShader desktop30.863s/mobile32.396s yerel tekli örneklerdir, kontrollü cihaz benchmark'ı değildir.
- Aşağıdaki 1.7.35/1.7.34 sisli handoff ve shared horizon açıklamaları normal spatial kampanyada tarihçedir; yeni finite section ownership esas alınır.

### 1.7.35 portal seri koşusu / kalıcı rekor / canlı finish (tarihçe)

- **İki koşu portalı da her girişte Level 1'den başlar. Yeniden Dene de Level 1'den yeni seri başlatır** (kullanıcı tarafından ayrıca onaylandı). İlk eğitim tek seferlik ve finish→lobi/şapka akışını korur. Level 120 sonrası mevcut Endless devamı hâlâ vardır. Portalın eski Endless adı artık girişte klasik random-Cyber moduna değil aynı seri kampanyaya yönlendirir.
- Portal level-seçim okları kaldırıldı; geçmiş zaman/madalya tabloları Stats'ta korunur. İki portalın üstündeki 🏆 Level N tabelası ortak en yüksek **ulaşılan** seviyeyi gösterir. `bestReachedLevel` mevcut schema2 level save içine eklenir, yeni aktif bölümde yalnız rekor artınca kaydedilir. Önceki tamamlanan kayıtlar Level N+1'e kadar uyumlu migration verir (120 cap); yeni hesapta 0'dır. Lobby/prewarm tema ve warmKey artık ilk Nature bölümünü hedefler, seçilmiş yüksek seviyeyi değil.
- Normal campaign finish çizgisi ortaya çıktığında `clearLevelFinishCorridor` çağrılmaz; mevcut araç/duvar/pad'ler katı ve canlı kalır. Tutorial güvenli çıkış dissolve'u korunur. Finish sonrası map hazır olana kadar eski authored stream devam eder; pending'de Endless random spawn'a düşmez. Sky'ın global-score spawn hold'u campaign'e uygulanmaz.
- Sonraki bölüm ghost/scoreBase/coin başlangıcını yeniler, fakat obstacle/coin/powerup/jumpPad/tunnel listelerini sıfırlamaz. Yeni pattern, önceki hazırlanmış satırların horizonundan sonra bağlanır; modellerin normal off-screen recycle yolu aynen korunur. Harita farklıysa mevcut 2.4s elemental geçişte eski çevre dekoru emekliye ayrılır, gameplay kökleri saklanır. `preserveGameplay` normal map startup/debug/Endless temizliklerini değiştirmeden yalnız bu geçişte kullanılır.
- Finish ile sonraki bölümün commit'i arasında toplanan altınlar sonraki checkpoint'e dahil edilir (`coinsAtStart=runBankedCoins`). Böylece cüzdanın aldığı altın ile koşu ledger/toast'unda raporlanan altın arasında kayıp bağlayıcı-koridor farkı oluşmaz; mükerrer bankalama guard'ı değişmez.
- Sky'ın logical floor origin'i değişirse gameplay root Y ve absolute targetY/baseY/floorY/bladeHeight aynı delta kadar taşınır; local child fallStartY/normal vertex/collision dimensions değişmez. Crush baseY ve coin bob baseY korunur, -1000 recycle sentinel taşınmaz. Oyuncu jump/slide ve momentumunu korur. Pending world bekleme boyunca blanket invulnerability kaldırılmıştır; yalnız kısa görünmez sis handoff koruması kalır.
- Normal Sky→ground handoff'ta eski `megaJumpSpawned` altitude latch'i hedef phase'e göre sıfırlanır; yoksa taşınmış bir düşüş/boost, Nature'da `onSkyLayer` bayrağını yeniden açabiliyordu. Authored Nature→Sky Mega Jump özel akışı değişmez.
- Build/cache `1.7.35-poki-portal-series`, aynı kaynak ve aynı ZIP. Collision/viewmodel dört fonksiyon, curved-path-system bütünü ve L6–120 obstacle blueprint'leri değişmez. `output/test-series-1735.cjs` önceki tam browser QA'yı genişletir; QA hook'ları localhost response substitution'dır ve pakete girmez.
- Doğrulama: masaüstü tam tur; yatay mobil L1–10/altı harita + root UUID/solid/floor taşıması, death/Upgrade/Retry1 ve sınırlar; hedefli mobil L26 Sky→Snow pause/resume, iki portal/Retry1/rekor-reload/RTL. Official skill client pending-koridor 5 coin ledger'i + rekor3 + native ölüm/Retry1 ve hareket/jump burst'larını geçti. PNG/state incelendi; normal console/pageerror/local asset404 yok. 21 JS syntax ve 103500 blueprint/protected kaynak karşılaştırması temiz. Software GPU/SDK mock ölçümleri fiziksel telefon FPS veya canlı Poki sonucu değildir; upload ayrıca gerekir.
- Aşağıdaki 1.7.34/1.7.33 kayıtları tarihçedir: eski Retry current-level / temiz finish corridor / her levele nesne temizliği / ayrı Endless portal başlangıcı açıklamaları bu bölüm tarafından geçersiz kılınır.

### 1.7.34 ölüm kartı / hazır çevre modelleri / yumuşak harita geçişi (tarihçe)

- Ölümde eski `#game-over` gizlenir; gerçek `#level-complete-overlay` kartı `showFailure()` ile kullanılır. Ana düğme yerelleştirilmiş **YENİDEN DENE**, diğer düğmeler Yükseltmeler ve Ana Menü/lobidir. Başarısız bölüme madalya/confetti verilmez; koşunun kazanılmış kayıtları, altını ve süresi gösterilir. Cüzdan finish/ölümde zaten bankalandığı için kart tekrar altın eklemez. Upgrade kapatılınca aynı ölüm kartı ve güncel cüzdan gelir. Native retry mevcut merkezi reklam/başlatma/pointer-lock yolunu kullanır; gamepad modal odak sırası da uyarlanmıştır.
- Level 3 boş Cyber sorunu: saklanan city instance kayıtlarının `initialX` değeri yeni oyuncu konumuna göre yeniden bazlanır ve görünürlük sıkıştırması girişte yapılır. Kampanyada Cyber dekoru/binaları görünmezken silinmez; geri gelişte tekrar üretilmez. Endless'in mevcut yaşam döngüsü korunur.
- `prepareContinuousScenery(phase)` bir sonraki gerçek çevrenin kopuk `THREE.Group` içindeki göreli-X köklerini hazırlar. Nature/Sky/late-map fabrikaları ortak geometri ve materyal önbelleklerini kullanır; bir nesne/yield bütçesi, texture dilimleme, gerçek sahne ışık/fog hedefli compileAsync ve 16×16 hedefe kademeli geometry upload uygulanır. Hiçbir canlı `gamePhase`, player koordinatı, shadow flag veya render target await boyunca değiştirilmez. Aynı anda yalnız bir sonraki sahne tutulur; iptal edilen ve eski köklerin disposal'i kare başına en fazla 2 nesne/1ms bütçesindedir.
- Finişten sonraki connecting corridor hazırlık bitene kadar açık/korumalıdır. Harita değişimi 2.4s elemental sis geçişiyle olur; Endless'in gerçek hedef palette/fog/light profilleri çıkıştaki gerçek haritadan interpolate edilir. Ortada hazır çevre bağlanır; farklı Sky ground origin'i sisle maskelenir. Aynı haritada dekor korunur ve gereksiz sis yoktur. Fizik/Swept-X, el animasyonları ve curved shader değiştirilmez. Bölüm içi tema değişimleri de bu yolu kullanır; özel Mega Jump uçuşu korunur ve hazır Sky modelleri onun normal kurulumundan sonra bağlanır.
- Ölüm/lobi/yeni koşu/WebGL context loss epoch ile hazırlığı iptal eder; sis gizlenir. Context restore bekleyen next-map işini yeniden hazırlar. Görsel süre ham delta ile 0.25s clamp kullanır, fizik 0.05s clamp'i aynıdır: düşük FPS'de kozmetik geçiş gereksiz uzamaz. Snapshot `campaign.scenery`, `mapTransition`, `exterior` actual-visible sayaçlarını verir; test artık yalnız floor görünürlüğüne bakmaz.
- Build/meta/query/SW sınırı `1.7.34-poki-continuous-world-fix`. Aynı kaynak klasörü ve aynı mevcut ZIP güncellenir; canlı Poki/site/Steam/Pixel yayını bu işlem değildir. Yerel mock/SwiftShader QA gerçek cihazda sıfır FPS drop veya Player Fit sonucu garantisi sayılmaz.
- QA: masaüstü ve 844×390 Android-UA L1→10 / altı map, 20→21/25→26/120→Endless, actual-visible exterior, native Retry/Upgrade satın al-kapat/Lobi ve ekonomi guard'ları geçti. Son desktop tekrarında L11/L18/L26 bölüm içi geçiş + pause ve WebGL loss/restore + kritik task Retry geçti; normal console/pageerror/asset404=0. Official client L3/Şehir/running ve dolu çevreyle iki input burst tamamladı; PNG'ler incelendi. 21 root JS syntax temiz, dört protected fonksiyon/curved kaynak + 103500 L6+ row mevcut release baseline ile eşit. QA dosyaları `output/continuous-1734` altında, paket dışıdır.

### 1.7.33 kesintisiz level koşusu / hızlı ve güvenli açılış (korunan akış)

- Kullanıcının yeni akışı: eğitim bitiş çizgisi → siyah geçiş → lobi ve mevcut zorunlu şapka ödülü. **Normal level bitişinde sonuç menüsü açılmaz.** Koşu devam eder; ✓ Level N, o bölümün altını (toplanan + tamamlanma ödülü), süre, madalya ve sonraki bölüm 3.4 saniyelik, etkileşimsiz animasyonlu kartta gösterilir. Eğitim ve Endless mantıkları bundan ayrıdır. Loading tamamlandıktan sonraki tek büyük PLAY, gerçek kullanıcı etkileşimi ve fare kilidi için korunur.
- `campaign-run.js` IIFE `window.ElementalCampaignRun.create(api)` sunar. Yalnız bir koşu defteri ve DOM sunumu tutar: `begin`, `complete`, `tick`, `showDeath`, `clear`, `snapshot`. Ayrı RAF/Three renderer/asset/ödül verme mantığı yoktur. `campaign-run.css` mevcut Orbitron/Rajdhani temasını, reduced-motion, yatay mobil ve hata kurtarma katmanını kullanır. Script `level-system.js` sonrasında, `game-runtime.js` öncesindedir.
- `level-system.js` API `continuousCampaign:true`: en iyi süre, Bronze/Silver/Gold, açılan level ve kayıt güncellenir; eski completion modalı/120 kartı her bitişte yeniden oluşturulmaz. Normal bir finish'te `finalizeSuccessfulLevel()` kayıt defterini ve ekonomiyi güncelleyip `campaignNextPending` oluşturur. `stepGame()` yeni map cache'i hazır olduğunda `advanceContinuousCampaign()` çağırır. Ölüm/manuel lobi dönüşü pending işi bir epoch ile iptal eder.
- Sonraki map 1.2 saniye sonra tek ortak prewarm promise'i ile erkenden hazırlanır. CPU model üretimi mevcut model-type slice'larında yield eder, materyaller `compileAsync` yoluyla hazırlanır. Finish sırasında hazır değilse oyuncu açık bağlantı koridorunda ilerler; spawn bekler. Eksik/başarısız hazırlık asla tamamlanmış map gibi sunulmaz; kayıtlar korunup yerelleştirilmiş Retry ekranı gösterilir.
- Geçişte oyuncunun ileri X konumu, lane, hız, jump/slide hareketi, aktif dash/phase ve cooldown korunur. Ground Y değişirse yere göre yüksekliği/vertical velocity taşınır. Çarpışma ve GPU curve sözleşmesi değişmez. Eski-map rewind snapshot'ları temizlenir; devam eden rewind bitmeden level değişmez. Engel/coin/powerup/jump pad ve eski dekor temizlenir; görünmez eski mesh'ler en çok 2 node / yaklaşık 1ms frame bütçeli disposal kuyruğundan çıkarılır. Aynı map'te dekor tekrar oluşturulmaz. Yeni ghost yarışı ve finish çizgisi yeni bölüm için yeniden kurulur.
- Sonraki level koşusu yeni `scoreBase`/`coinsAtStart` kullanır; üst HUD bölüm ilerlemesini, ana puan tüm koşunun puanını gösterir. 120. bölüm sonrası aynı koşu Endless'a döner; sonuç defteri ölüm ekranında korunur.
- Ekonomi: her finish'te o ana kadar bankalanmamış coin + o bölüm ödülü wallet'a eklenip kaydedilir. `runBankedCoins` iki kez ödeme yapılmasını, `runStatsRecorded` ölüm/lobi/retry yollarında tekrar kayıt yapılmasını önler. Ölümde yalnız son finish'ten sonraki coin bankalanır. Death ekranı bütün koşunun altınını, tamamlanan bölüm sayısını, aktif koşu süresini ve scrollable bölüm/madalya/süre/altın listesini gösterir. Retry son açılan/current levele gider; geçmiş bölümleri tekrar oynatmaz. Lobi Stats kayıtları aynı save formatındadır.
- Açılış maliyeti: tüm sekiz stand GLB'sini kritik loading'e bağlamak kaldırıldı. İlk stand modeli boot'ta, kalan yedi küçük LOD sırayla lobide yüklenir; ~4 MB download/parse kritik yoldan çıkar. Mevcut seçili viewmodel, canonical car/motor/train ve City/Nature hazırlığı korunur. `prewarmGameplayAssets({fullCatalog:false})` ve görünür-mesh compile gizli bütün map kataloglarını gereksiz yere tekrar derlemez. Bu, gerçek donanım/ağ koşullarında sıfır FPS drop garantisi değildir.
- Hatalar: pointer-lock sırasında pointer capture yapılmaz; touch capture InvalidStateError korunur. Kritik loading task hatasının stack/metni raporlanır, bootstrap watchdog eksik dünyayı başlatamaz, Retry görünür. WebGL context loss → gerçek SDK Stop + pause + beceri/movement temizliği + okunabilir kurtarma ekranı; restore → lobide tercihli lock veya koşuda native Resume. Driver'ın WebGL'i tümden bloke etmesi/uzak network kesilmesi yalnız oyun koduyla garanti edilemez.
- 30 dil için `campaignRun`, `campaignFinished`, `campaignKeepGoing`, `loadingRecovery`, `graphicsRecovery` eklendi. SDK yükleme/PLAY beklemesini oynanış saymaz; level finish'te gereksiz Stop/Start/ad yoktur. Pause, ölüm, panel, reklam lifecycle'ı dürüst kalır. Bu build Player Fit üç dakika eşiğini geçtiği iddiası içermez.
- Doğrulama: desktop ve 844×390 touch/mobile koşusunda gerçek tutorial→lobi, native PLAY/Retry/Lobi, L1→10 kesintisiz finish, altı map, 20→21/25→26/120→Endless, wallet duplicate guard, aktif beceri, pause süresi ve SDK finish continuity test edildi. 21 root JS syntax kontrolü; dört korunmuş fonksiyon (`updateObstacles`, `updateViewmodelHands`, `renderViewmodelOverlay`, `vmSplitGeometryByX`) ve curved shader mevcut release ile aynı; L6–120 için 103500 pattern row eşit. QA/mock/output dosyaları dağıtım paketine alınmaz. Yerel paket/ZIP değişir; canlı Poki veya web site otomatik yayınlanmaz.

### 1.7.32 kalıcı lobi fare kilidi tercihi (korunur)

- Desktop hub `pointerLockWanted=true` ile başlar. Yalnız Ctrl bu oturum tercihini değiştirir; açık panel geçici cursor gerektirir, tercihi silmez. Upgrade/Hands/Stats/Settings/Missions/Rebirth, ödül, çark ve Flappy kapandıktan sonra kilit geri istenir. Ctrl ile serbest seçim panel ve level dönüşlerinde korunur; tekrar Ctrl kilitler.
- Trusted click/keyup/keydown, focus/visibility dönüşü, beklenmeyen pointer-lock kaybı ve blocked→unblocked kenarı tek bir microtask restore kuyruğunu kullanır. Her render karesinde kilit istenmez; panelden başka panele geçişte son blocked durumu okunur. Mobilde kilit istenmez. Snapshot `lobby.pointerCapture` istenen/gerçek/askıda durumu gösterir.
- Portal `forRun:true` ile koşu mouse capture'ını ister; lobi Ctrl tercihini değiştirmez. Lobby request reddedilirse UI üstünde gameplay hata sesi/pause mesajı üretilmez, in-flight watchdog temizlenir. Tarayıcı Escape/Alt-Tab/iframe izinleri nedeniyle yeni kullanıcı etkileşimi gerektirirse sonraki normal tuş/tıklama restore'u dener; güvenlik sınırı zorla aşılamaz.
- QA: 18 masaüstü senaryosu ve 11 Android-UA yatay senaryosu; native panel close, Ctrl tercih koruması, gerçek level→Ana Menü dönüşü, unexpected release recovery. Console/page error yok. Resmi web-game client iki input burst'u ve açılıp incelenen PNG'ler: lobby/locked=true. Yerel SDK mock/SwiftShader kullanıldı; gerçek Inspector upload yapılmadı. Collision/shader/viewmodel/map sözleşmeleri korunur.

### 1.7.31 Ana Menü dönüşünde lobi fare kilidi (önceki)

- Level finish, gameover ve pause ekranlarındaki Ana Menü düğmesi `returnToLobby(false, {lockPointer:true})` kullanır. Önce eski run/menu reset ve hub enter tamamlanır; aynı senkron tıklama içinde central pointer lock istenir. Pause Ana Menü artık eski 2D PLAY katmanında kalmaz. Legacy PLAY de hub enter sonrasında kilit ister; mouse-steering=false bunu engellemez.
- Mobil lock istemez. Hat/ödül/ayar/ad/flappy veya gizli doküman nedeniyle hub blocked ise cursor serbest kalır. Otomatik tutorial/failed preparation dönüşlerine zorla kilit eklenmez; Ctrl manuel toggle aynı kalır. Input/SDK/renderer/viewmodel/map kodu değiştirilmedi.
- QA: native click ile boot/finish/pause/death/legacy PLAY, dönüşten 350ms sonra capture, hareket, ayar panelinin serbest cursor'u; masaüstü ve Android-UA yatay testleri hatasız. Resmi client iki kısa input burst'u + gerçek PNG incelemesi: lobby/locked=true. Testler local SDK mock ve SwiftShader; embedding izinleri ayrıca gerçek Inspector'a bağlıdır.

### 1.7.30 harita giriş regresyonları / kontrollü hazırlık (korunan temel düzeltmeler)

- 1.7.29 kritik hata: paused hazırlıkta `runStartedFromMenu=false`; Snow/Lava/Water/Sky aktivasyonu debug helper'ın run guard'ına takılıp phase=0/zeminler gizli kalıyordu. `activateAdvancedMapPhase` artık gameplay hazırlığına ait ortak yardımcı; debug klavye girişinin guard'ı ayrı. Environment çağrısı doğru `(blend, phase)` sırasını kullanır. Hazırlık hedef phase + görünür floor postcondition'ını doğrular; yanlış haritayla run commit edilmez.
- `prepareActiveMapScenery` hareket/timer başlamadan Nature görünür koridorunu, Sky intro+ufuk kuyruklarını ve hedef late-map dekorlarını mevcut dilimli üreticilerle tamamlar. İlk engel satırları gerçek spawn ufkuna kadar hazırlanır; seri/seed/koordinatlar değiştirilmez. Water/Snow intro sonrası spawn cursor yeniden intro arkasına düşmez; çift dekor backfill'i yok.
- GPU hazırlığı yalnız aktif haritayı gerçek scene ışık/fog/environment ile derler (`renderer.compileAsync` + targetScene). Gizli altı haritayı aynı anda compile etmez. Üç sıcak render `renderRunningWorld` kullanır; `stepGame(0)` çalıştırılmaz: input/spawn/audio/lifecycle yan etkileri yok. Shadow policy compile'dan önce senkronize edilir. Mevcut ortak engel kataloğu ve gerçek ilk GLB araçların uzaktaki/cull edilen shadow-depth varyantları opak UI altında bir kez çizilir; görünür/cast/frustum bayrakları finally'de geri yüklenir. Aynı evrede seçili Layer 1 el ve opacity=0 impact ring pası da ısınır. Kamera/ilk road deformasyonu mevcut görsel API ile kurulur, player physics çağrılmaz.
- Campaign material warm-up canlı renderer hedefi, env ve shadow bayraklarını await boyunca değiştirmez. Warm ready sadece başarılı compile'a yazılır; biten/başarısız promise cache'den çıkar ve tekrar denenebilir. Deferred model katalogları aktif koşu/lobi/giriş sırasında toplu build edilmez.
- Doğa→Su/Gök→Kar gibi ardışık olmayan kampanya geçişleri aradaki Lav/Su dekorlarını kurmaz; kaynakla ilgisiz floor fade'leri gösterilmez. Normal ardışık endless fade akışı aynı kalır. Water/Snow canlı dekor cursor'u başlangıçtaki son hazır kaydın sonrasında devam eder: ölçülen geçişte Su 93→37, Kar 103→30 dekor; bunlar FPS yüzdesi değil, gereksiz nesne sayısı karşılaştırmasıdır. Aynı genişlikte asfalt geometry'si tekrar yüklenmez; Sky asfalt map'i gereksiz needsUpdate almaz. Silinen InstancedMesh GPU tamponları dispose edilir; ortak asset kaynakları korunur. Nature canlı spawn'a row sınırı yanında 2ms bütçe uygulanır.
- QA: altı haritanın masaüstü/Android yatay girişleri, native Next Level pointer lock, native Retry, beş gerçek theme-transition callback'i ve Endless giriş; ayrıca tam tutorial/hat/claim/reload/RTL/music/save/lifecycle testi. Map ve resmi client PNG'leri açılıp incelendi; console/page/asset hatası yok. 103,500 L6–120 blueprint ve dört korunan viewmodel/collision fonksiyonu + curved-path kaynakları eski paketle eşit. SW/headless testleri fiziksel düşük cihazda sabit FPS garantisi değildir; gerçek Poki Inspector/cihaz ölçümü ayrıca gerekir. Paket yerel, canlı upload yapılmadı.
- Bilinen ölçüm sınırı: masaüstü software GPU ilk canlı saniyede altı phase'in program sayıları sabit; Android-UA + High shadow City testinde dört sonraki depth/PBR varyantı ilk saniyede eklenebilir. Diğer beş Android map girişinde bu artış görülmedi. Tüm sonraki rastgele engel/efekt kombinasyonlarının, uzun oyun seansının veya gerçek telefonların sıfır takılma garantisi verilmez.

### 1.7.29 giriş hazırlığı ve Player Fit düzeltmeleri (önceki; harita regresyonları 1.7.30 ile onarıldı)

- Ortak `startPreparedRun`: Portal/Next Level/Retry opak siyah hazırlık ekranını önce gösterir. Gerçek scene/ghost/engel/shadow varyantları, iki texture/task upload, `compileAsync`, üç sıfır-delta gerçek render ve GPU fence (15s bounded) bitince koşu commit edilir. Hazırlıkta timer, hareket, aktif ödüller ve attempt/SDK start ilerlemez. Driver compile timeout fallback'i yalnız opak UI altında; başarısızlıkta lobiye dönülür.
- Lobi GLB disposal birer task; Nature koridoru cache veya retry'da dilimli rebuild, başlangıçta hazır görünür. Tam shader/çarpışma/viewmodel overlay mimarisi değişmedi. Durum: `status.loading.campaignPrewarm.runEntryPending/runEntryLastMs`.
- L1–5 eski tüm engel türleri/four-lane seeded deck korunur; tek engel satırları daha fazla, araç hızı biraz düşük. L6–120 hedefleri ve 103500 blueprint karşılaştırması aynı. Ücretsiz 50 altın ikonu daha görünür; zorunlu şapka ve Level 1 rehberi korunur.
- Pointer-lock açıkken `setPointerCapture` yapılmaz. Poki `measure` max iki numeric event değeri; stall count `long-frames-N`. Değişmeyen ad/SDK lifecycle, trusted interaction kuralı. Sürüm sadece yerel paket; canlı site/test otomatik yayınlanmaz.

### 1.7.28 gerçek GLB şapka / zorunlu claim / ilk beş level

- Kullanıcının `hat.zip` PBR modelinden siyah silindir/kırmızı kurdeleli gerçek şapka. `assets/cosmetics/tutorial-hat.glb` 613KB /18,581 triangle; üç baked PBR map 768px WebP, meshopt. Orijinal15.9MB/120k triangle ve shaded export dağıtıma dahil değil. Model bbox ile küpün tepesine oturur; fiyonk forward -Z yönünde. İlk loading/lobby preparation'da parse/upload/compile tamamlanır; sadece mevcut scene/renderer kullanılır, claim'de ağ/GPU hazırlığı yok. Static şeffaf preview aynı modelden alınmıştır.
- Popup X içermez. Escape, dış tıklama, panel/start-run/portal yolları pending reward'ı atlayamaz. Tab tek Al butonuna döner; Enter/Space claim yapabilir. PLAY'den gecikmiş pointer-lock isteği modal üstünde kilitlenirse pointerlockchange ile serbest bırakılır. Dilde değişiklik açık modal metnini de günceller. Eski `{earned,claimed}` sealed save uyumludur; claim fiyatı yok, wallet değişmez, reload bekleyen ödülü geri getirir, claimed tekrar gösterilmez.
- İlk beş bölümde **1.7.27 lesson override kaldırıldı**: eski shared map obstacle vocabulary geri geldi (Nature/Snow/Lava özel engelleri, train/signal/falling vb.). Sadece formation sayısı düşürülür: sıra başına bir/iki entry; ortalama1.4–1.7. Sabit altı-row iki-şerit koridor yok. Her dört-row shuffled deck bütün lane'leri kullanır; relative formation spacing/retry seed aynı kalır. Motor ilk5'te hâlâ yok, sparse spawn/traffic hızları korunur. Reaction-gap sıfır; hedef skor, ekonomi/medaller değişmez. L6+ tüm6phase/150row karşılaştırması eşit.
- `output/test-hat-patterns-1728.cjs` desktop/mobil interaction QA; `output/verify-patterns-1728.cjs` bütün map/level lane coverage ve protected function/source karşılaştırması. Output/tooling shipping dışıdır. Skin models/viewmodel overlay/animation/Swept-X/curved-path değişmedi.

### 1.7.27 erken oyuncu kaybı / eğitim şapkası / lobi sesi (önceki; şapka ve ilk5 düzeni 1.7.28 ile değiştirildi)

- Kullanıcının onayladığı PlayerFit odaklı revizyon. İlk iki level temel duvar, alçak duvar ve slide hareketlerine odaklanır. L3 araba, L4 tren, L5 düşen duvar ekler; L6+ mevcut tam map sözlüğünü korur. İlk beş bölümde iki kaçış şeridi, altı farklı açık-şerit çifti, motor yasağı, deterministik retry ve mevcut ekonomi/hedef süreler korunur. `reactionSeconds` baseline hızdan hesaplanan minimum sıra aralığı sağlar; bhop hızına göre rastgele kurs değişmez.
- `finishTutorialToLobby()` eğitim ödülünü sealed `menuState.tutorialHat={earned,claimed}` alanına yazar. Siyah geçiş bitince tek seferlik animasyonlu şapka + konfeti + Al modalı açılır. Al, altın harcamadan lobi küpüne düşük poligonlu şapkayı takar; 24 elemanlı mevcut kutlama havuzu karakter etrafında oynar. Modal sırasında hareket/SDK gameplay durur, cursor serbest ve focus/Tab/Escape/Enter/Space işlemleri güvenlidir. Kapatılan ama alınmayan ödül sonraki lobi girişinde tekrar sunulur. Alınan şapka reload ile korunur; level/viewmodel elinde şapka render edilmez. 30 dil + RTL + reduced motion + yatay mobil düzeni vardır.
- `audio-system.js` artık `lobbyActive` durumunu da menü müziği için kabul eder. Mevcut menu-theme.mp3 loop kullanılır; lobi nominal .12, normal menü .18, master/music ayarları uygulanır. Varsayılan .55 music ayarıyla lobi efektif .066'dır. PLAY gesture sonrası açılır, mute/ad/hidden/blur durumunda durur; koşu müziğine geçerken üst üste çalmaz. Aynı hedefe her frame yeniden fade/play yapılmaz.
- Gerçek stand modelleri için `assets/hands/lobby/hand_{id}.glb`: ilk şahıs GLB'leri değişmez. Sekiz çiftin kaynak toplamı 25.21 MB/960.000 üçgen → lobi toplamı 4.59 MB/258.327 üçgen (~%82 byte, %73 geometri azalması). Her stand halen tek gerçek 3D eldir; texture en fazla 768px, meshopt decoder aynıdır, parmak/bağlı bileşen seçimi korunur. İlk loading pipeline'da upload/compile yapılır; canlı lobi girişinde ağır model parse yoktur. Dağıtım ZIP'i LOD kopyaları nedeniyle yaklaşık 4.6 MB büyür, ilk stand yükleme maliyeti ise ~20.6 MB azalır. Oyun içi orijinal eller satın alınıp seçildiğinde mevcut lazy cache ile yüklenir.
- Ücretsiz ilk +50 ödülü gift ikonunda görünür, Ember progress'te double-jump simgesi/tooltip vardır. Ödül tutarları, 0/3/7/12/20 aktif dakika, shop maliyetleri ve optional lobi rehberleri değişmez. Önceden kaldırılan İlk Adımlar ve sonraki harita önizlemesi geri eklenmez.
- Güvenli auto-rewind: tarihçede yerde/slide dışında ve önünde boşluk olan anı seçer; gerekirse açık CPU şeridine döner. Tüm şeritler kapalıysa yanlış güvenli dönüş yapmak yerine mevcut ölüm/revive akışına bırakır. Boyut için `widthZ` ve length kullanılır; tek kullanım/1.15s mevcut dokunulmazlık korunur. Swept-X, GPU curved-world shader, viewmodel hareketi ve input binding'leri değiştirilmez. L1–5 death ekranı engelle ilgili tek kısa hareket/binding ipucu gösterir; mobilde klavye tuşu yazılmaz. Mevcut hızlı retry/reklam politikasını kullanır.
- Poki telemetry: `onboarding/first-input/play`, 120s'ye kadar boot süresi, dil bağımsız loading task ID süreleri, campaign prewarm süreleri, pause/revive dışı aktif attempt süresi, gerçek ölüm→retry gecikmesi, safe-recovery, cap visible/claimed, reward panel visible. Her map için oturumda bir kez 10 görünür aktif saniyede ortalama FPS'nin 5'lik kovası ve >50ms frame sayısı gönderilir. Bu **median FPS değildir**; iki farklı PlayerFit veri grubunu karıştırmayın. Yeni ölçümler davranışı değiştirmez, render frame'de asset/DOM veya yeni dizi oluşturmaz.
- QA: `output/test-retention-1727.cjs` gerçek browser desktop/Poki + Android yatay; hat earn/claim/dismiss/reload/sealed save, guide→Level1→score, 30 dil, RTL, mute/ad sesi, 8 LOD, altı lane çiftinin deterministik üretilmesi, ilk5 motor/tür filtresi, boş şeride rewind/tam-kapalı reddi, death hint/retry/pointer lock ve lifecycle dedupe. Headless test gerçek kötü telefon FPS garantisi veya retention sonucu değildir. Canlı site ve Inspector paketi ayrıca kullanıcı tarafından yayınlanıp ölçülmelidir.

### 1.7.26 tutorial sonrası Level 1 rehberi / okunabilir lobi okları (önceki sürüm)

- `finishTutorialToLobby()` siyah katman altında Level 1'i seçer ve `lobby-onboarding.js` içindeki `tutorialCompleted()` olayını çağırır. `firstLevelPending` mevcut rehber save'ine eklenir; eski milestone ve level ilerlemesini silmez. Tutorial'a girişte set edilen `entered` artık bu yönlendirmeyi tüketemez. Wallet 200+ olsa bile Level portalı önceliklidir. Sayfa yenilemesi sonrası devam eder; portalın hazırlanması başarıyla tamamlanıp gerçek giriş başladığında temizlenir (prepare hatası rehberi bitirmez).
- `lobby-hub.js`: gövdesi olan dolu altın ok + koyu kenarlık, hedef pedi çevresinde hafif ışık halkası. Rota düz çizgidir ve ayrı straight-world lobby scene'inde kalır. 24 ok sınırı, iki InstancedMesh + tek RingGeometry (önceki sisteme iki draw call ekler); frame'de yeni geometry/material/texture yok. Normal mesafede sabit hedef-ankorlu aralık, çok uzun rotada pool bütün hattı kaplayacak şekilde açılır. Zıplama/scroll/modulo reset animasyonu yok; sadece hedefe ilerleyen brightness dalgası vardır. Reduced-motion dalga/halkayı sabitler. Yeni varyantlar mevcut loading warm-up listesine dahildir; modal/transition sırasında üç görsel de gizlenir. Dünya shader, collision, viewmodel, ekonomi ve SDK değişmez.
- QA `output/test-guide-arrows-1726.cjs`: gerçek tutorial jump/slide/lane/finish → lobi, 250 gold ile Level 1 önceliği, reload kalıcılığı, ok matrislerinin doğrusal ve doğru yöne bakması, idle'da konum sabit/renk canlı, reduced motion, ayarlar gizleme/geri dönüş, Level 1 sonrasında eski score rehberinin devamı. Masaüstü/Poki ve Android yatay ekranlar kontrol edilir; output paketlenmez. Canlı site, Steam ve Pixel kopyaları bu değişiklikte güncellenmez.
- Masaüstü ve Android 844×390 akışı pageerror=[] ile geçti; uzun 24-ok ve yakın 0-ok/hedef-halkası sınırları doğrulandı. PNG'ler gerçekten açıldı. Testte dar ekranda Ember widget'ın settings close'a taşması bulundu: `hub-panel-open` sınıfında widget artık gizlenir; finish/death görünürlüğü korunur. Resmî client final PLAY kapısı/cache 1.7.26; dış SDK DNS/HTTP COOP çevre uyarıları dışında yeni hata görülmedi. Bu headless doğrulama gerçek cihaz FPS ölçümü yerine geçmez.

### 1.7.25 Ember wallet progress / tur altını akışı / canlı ikon ödülleri (korunuyor)

- `lobby-rewards.js` Ember kartını tek DOM node olarak body'de tutar. Lobide ve finish/death sonuç ekranında görünür; aktif koşuda ve owned glove sonrası gizlenir. Kart gerçek wallet'ın 200'e kadarki kısmını `N / 200`, kalan gold ve erişilebilir `role=progressbar` ile gösterir. CSS transform çubuğu kazançta artar, harcamada azalır. Para halen mevcut canonical wallet fonksiyonlarında hesaplanır; animasyon yeni para eklemez veya toplamı değiştirmez.
- `recordMainMenuRunStats(options)` yeni yalnız görsel hook ile deposit coin ve varsa level reward toplamını bildirir; normal level reward mevcut finalizeSuccessfulLevel yolunda yalnız bir kez bankalanır. Finish reward pill/death gold konumundan Ember'a sekiz önceden oluşturulmuş DOM coin uçar. 650ms ilk varıştan sonra gösterilen bar gerçek toplamına geçer; 1600ms feedback temizlenir, sonuç ekranındaki kart kalır. Tutorial bankası siyah geçişten sonra lobiye ertelenir; pending görsel balance önceki değerde kalır. Yeni koşu, visibilitychange, arada wallet değişimi efektleri temizler. Reduced motion uçuşu devre dışı bırakır. Bu işlem kalıcı save, CPU collision veya GL kaynaklarını değiştirmez.
- Ödül paneli beş yatay karttır: gold coin, score medal, speed bolt inline SVG; Solar mevcut transparan WebP. Büyük ikon ve miktar/2×, boost süresi ve tek claim/countdown butonu dışında tekrarlı açıklamalar kaldırıldı. Tooltip/aria label bütün ödül anlamını lokalize biçimde korur. Yatay mobilde beşi bir sıraya sığar; dar dikey ekranlarda aynı sıra yatay kaydırılabilir. Arapçada sıra RTL olur.
- **Canlı süre sözleşmesi 1.7.24'ü günceller:** Görünür/odaklı normal lobby idle ve açık ödül paneli artık süreye dahildir. Diğer shop/settings/daily panelleri, pause, reklam, loading, play gate, sonuç ekranı ve hidden/unfocused tab sayılmaz. Böylece paneli açınca unlock geri sayımı donmaz. 0/3/7/12/20 eşikleri ve ödül/once-only save aynı kalır. Claimed score/speed kartlarının küçük süre alanı gerçek wall-clock boost expiry'yi gösterir. Modal açıkken bir 1s interval vardır; kapanınca temizlenir. Normal HUD/update loop dışında sürekli ek RAF yoktur; aynı beş card node korunur, sayaç yenilenince markup yeniden kurulmaz.
- QA: `output/test-reward-progress-1725.cjs` desktop/Poki + Android yatay native PLAY, tek sıra/five fit, açık-panel canlı countdown, 50 gold/duplicate, gerçek level 66 reward+30 coin=96 deposit, finish bar 146/200, gerçek 50 gold score upgrade sonrası 96/200, shop süre pause, boost 5:00→4:58, Arabic RTL, endless death coin deposit ve yeni run cleanup. Pageerror yok. `output/test-gold-flight-unit-1725.cjs` aynı production modül/CSS ile uçuşun gerçek transform/opacity değerleri, sekiz node ve reduced-motion temizliğini ayrıca test eder. Gerçek oyun ve izole coin-animasyon PNG'leri açılıp incelendi; izole fixture bir 3D FPS benchmark'ı değildir. Resmî skill client hazır PLAY kapısını gösterir; dış CDN DNS/HTTP COOP uyarıları yerel çevredendir. Test/output dosyaları ZIP'e girmez.

### 1.7.24 lobi ödülleri / açık PLAY kapısı / tutorial'dan otomatik dönüş (önceki; UI ve lobby süre kapsamı 1.7.25'te güncellendi)

Kullanıcının son isteği eski İlk Adımlar sisteminin ve sonraki harita önizlemesinin kaldırılmasıdır. Aşağıdaki 1.7.23 bölümü yalnız tarihsel kayıttır; oradaki hedefler ve sonuç ekranındaki eldiven/harita kartları artık çalışmaz. Hızlı Retry ve mevcut lobi yönlendirme tutorial'ları korunur.

- **Başlangıç:** Hazırlık tamamen bitince hem standart web hem Poki'de büyük lokalize PLAY gösterilir. Otomatik lobi girişi yoktur. Gerçek click/tap/Enter lobiyi açar; masaüstünde aynı kullanıcı etkileşimi içinde mouse lock istenir. Sentetik click Poki başlangıcı sayılmaz. Poki gameplayStart, ilk gerçek click event'i Inspector'a ulaştıktan sonra gönderilir. Mobilde pointer lock istenmez; tarayıcının iframe izinleri ve mevcut lock recovery akışı korunur.
- **Tutorial çıkışı:** Finish çizgisi geçilince tutorial director complete hook'u `finishTutorialToLobby()` çağırır. Kazanılan run altını bir kez bankaya aktarılır, aktif skill/audio/input durumu temizlenir, SDK stop gönderilir. Opaque siyah DOM katmanı iki RAF boyunca ekrana çizilir, sonra hazır lobi açılır ve siyah katman kısa fade-out ile kalkar. Tutorial-complete/Next Level paneli gösterilmez. Birinci level için mevcut preload başlatılır. Global fizik, Swept-X, curved shader ve Layer 1 değiştirilmez.
- **Lobi sağ üst:** İlk eldiven Ember Grip/Double Jump kartı ve gerçek wallet/200 ilerlemesi burada görünür; finish/death ekranında yoktur. Herhangi bir eldiven edinilince gizlenir. Kart Hands paneline götürür, otomatik satın almaz. Missions ikonu mevcut daily missions panelini açar ve tamamlanmış/alınmamış görev varsa kırmızı nokta gösterir. Gift/ödül ikonu süre ödülü panelini açar ve alınabilir ödül varsa kırmızı nokta gösterir. Paneller açılırken hareket temizlenir ve mouse serbest bırakılır.

| Toplam aktif süre | Bir kez alınabilen ödül |
|---|---|
| 0 dakika | 50 gold |
| 3 dakika | 2× score, 5 dakika |
| 7 dakika | 500 gold |
| 12 dakika | 2× speed, 10 dakika |
| 20 dakika | Solar Forge eldiveni, ücretsiz |

**Süre/kayıt sözleşmesi:** Kullanıcı 0/3/7/12/20 dakika eşiklerini açıkça onayladı. Süre farklı oturumlarda birikir; günlük reset yoktur. Tutorial/normal koşu ve lobide gerçek hareket/jump sayılır. Loading, PLAY bekleme, lobi idle, pause, reklam, açık panel, finish/death, gizli/odaksız sekme sayılmaz. Delta .25s ile sınırlandırılır; donma süresi ödül üretmez. `menuState.playRewards={version:1,seconds,claimed:[5 boolean]}` aynı integrity-sealed save içindedir. Süre beş aktif saniyede bir, pagehide/hidden/finish/death'te flush olur. Claim marker, wallet/boost/ownedHandSkins birlikte kaydedilir; yeniden yükleme ikinci claim üretmez. Eski firstSteps kaydı normalize edilmeyerek bırakılır; önceden kazanılmış wallet geri alınmaz.

**Boost sözleşmesi:** Score boost mevcut `rewardBoosts.scoreUntil` ile, speed yeni `rewardBoosts.speedUntil` ile saklanır. Süre claim anında başlar ve gerçek duvar saatiyle biter; pause/oyundan çıkış boost süresini dondurmaz. Aynı süre ödülü mevcut kendi boost'unu uzatabilir; fortune wheel ile 4× oluşturacak çarpma yoktur, en yüksek aktif speed çarpanı kullanılır. Solar yalnız ownership verir, otomatik equip yapmaz. Önceden Solar'a sahip oyuncuya ikinci model veya başka telafi ödülü verilmez.

**Mimari/performans:** Yeni klasik IIFE `lobby-rewards.js`, eski `onboarding-goals.js` yerine runtime'dan önce yüklenir. Ek RAF, audio loop, GLB, shader veya texture üretmez; Ember'ın mevcut küçük WebP'si ve inline SVG ikonlar kullanılır. HUD signature değişince; açık ödül paneli saniye değişince güncellenir. Aktif koşuda gizli HUD'ye markup/layout işi yapılmaz. Beş satırlı panel yatay telefon ekranına sığar; Escape/backdrop/× kapanışı ve canvas focus dönüşü vardır. Gecikmiş how-to RAF çağrısı finish/menu üzerine yeniden açılmaz.

**Doğrulama:** `output/test-lobby-rewards-1724.cjs` gerçek PLAY/tap, pointer lock, tutorial'ın canonical jump/slide/finish akışı, siyah compositor karesi, otomatik lobi, mevcut missions yönlendirmesi/red-dot cleanup, tam eşik/erken claim/duplicate/reload/integrity, 2× speed ve Solar ownership, normal Next Level lock ve 30 dil anahtarı kontrollerini yapar. QA-only state hook'ları route üzerinden enjekte edilir, production kaynakta bulunmaz; test/output ZIP'e girmez. Headless yazılımsal WebGL gerçek düşük donanım FPS/Inspector veya retention sonucunu kanıtlamaz. Canlı siteye yayın ayrı işlemdir.

### 1.7.23 ilk oturumda anlaşılır hedefler ve devam etme motivasyonu (tarihsel; İlk Adımlar/önizlemeler 1.7.24'te kaldırıldı)

Amaç oyuncuyu yükleme/menüde bekleterek süreyi şişirmek değil, kısa bölümleri art arda keyifle oynatmak. Tutorial ve level süreleri yeniden uzatılmadı. Ek reklam, zorunlu satın alma veya popup görevi yok. Bu tasarım üç dakikanın üzerinde oyun garantisi değildir; gerçek PlayerFit verisiyle doğrulanmalıdır.

1. **İlk Adımlar:** Bir level bitir, 5 tehlikeyi geride bırak, 30 gold topla. Her biri otomatik **10 gold**, toplam **30 gold**, sadece bir defa. Yeni/eski başlangıç kaydı için `highestUnlocked <= 5` ve satın alınmış eldiven yoksa başlar. Önceden başlamış ilerleme eldiven alınsa da devam eder. İleri seviye eski kayda geriye dönük altın verilmez. Tamamlanmış kart Level 5 sonrasında gizlenir; normal daily missions ve bölüm ödülü aynıdır.
2. **Eldiven ilerlemesi:** Finish/death ekranında mevcut Ember Grip WebP, lokalize Double Jump ismi, 200 gold fiyat ve gerçek wallet'tan kalan miktar. Para upgrade'e harcanırsa sayaç doğru geri iner. Para yetince mağaza kısayolu lobiye döndürür ve Hands panelini açar; satın alma yine oyuncunun kendi eylemidir. Herhangi bir eldiven satın alınınca önizleme kalkar. Ödül/wallet hesabı finish sonrasındaki gerçek banka değerinden yapılır.
3. **Sonraki harita:** Gerçek `getLevelDefinition(completed+1)` tema/concept/numarası, altı temaya uygun küçük inline SVG kartıyla gösterilir. Bu kart 3D dünya önizlemesi değildir; yeni GLB/shader/texture/preload işi oluşturmaz. Son levelde sonraki harita yoktur. Tutorial-complete ekranının sade iki butonlu tasarımı korunur.
4. **Hızlı tekrar:** Retry daha belirgin altın renkli. İlk 180 aktif saniyede veya Level 1–3'te commercial-await yapılmaz; masaüstü native click pointer lock'u aynı gesture'da geri alır, mobil lock istemez. Normal ileri seviye reklam/cooldown yaşam döngüsü değişmez. `source: retry` ölçümü ayrılır. Hedef ilerlemesi ölümde sıfırlanmaz.

**Kod sınırları:** `onboarding-goals.js` klasik IIFE modülü, `lobby-onboarding.js` sonrasında ve runtime öncesinde yüklenir. `ElementalFirstSteps.create(api)`/`normalize` dışında global yoktur; ekonomi, dil, tema, lobi ve ölçüm için callback köprüsü kullanır. `game-runtime.js` canonical coin pickup, level-finalize, passive obstacle observer, wallet/stat güncellemesi, sealed menu save ve panel routing entegrasyonunu sağlar. `level-system.js` finish host ve rehber için normal layout'a yer açar. `browser-platform.css` responsive stil, `game-localization.js` 30 dilde sekiz yeni anahtar içerir.

**Kayıt ve performans:** `menuState.firstSteps={version:1,enabled,progress,rewarded}` mevcut MAIN_MENU_STORAGE_KEY payload ve browserSaveSeal içinde saklanır. Wallet artışı + reward marker aynı save'dedir. Progress yazımı 300ms birleştirilir; gizli sekme/pagehide/finish/death flush olur. Üç hedef dolduktan sonra note ucuz no-op'tur. Engeller 180 birim önünde görülüp arka kenarı 8 birim geriye geçince bir defa sayılır; görseli kapalı/yok edilmiş/crushed/dissolve nesneler sayılmaz. Pooled acquire/recycle flags temizlenir. Swept-X ve curved shader değişmez. Tür filtresi tek sabit Set'tir; aktif koşuda hidden DOM yenilemesi veya layout sorgusu yapılmaz. Yeni RAF/audio loop/büyük asset yok; görseller SVG ve var olan küçük WebP'dir. Hosts üç mevcut UI yüzeyinde tutulur, tek delegated click listener, hedef tamamlamada bir küçük feedback.

**UI/temizlik:** Aynı İlk Adımlar kartı finish/death ekranında ve Missions standının daily panelinde bulunur. Finish-lobby yönlendirmesi eskisi gibi Ana Menü'yü vurgular fakat metin artık ayrılmış satırdadır; başka butonun üstünü örtmez ve her hide/abort'ta temizlenir. Görev toast'ı finish/death'te kapanır. Dil değişimi açık kartları yeniler; Arapça RTL korunur. Dar yatay ekranlarda sonuç/önizleme iki sütuna ayrılır ve Next/Upgrades/Menu tek satırda kalır, yetersiz yükseklikte card kendi içinde scroll eder.

**Ölçüm/QA:** PlayerFit'e `first-steps/<goal>/complete`, `first-steps-ui/<surface>/visible`, `first-glove/shop/opened` olayları gider; mevcut 60/120/180/300 aktif gameplay kilometre taşları değişmez. A/B için 180s üstü oyuncu oranı, tutorial complete, L1→L2, ölüm→retry ve mağaza→satın alma→sonraki koşu oranı karşılaştırılmalı. `output/test-first-steps-1723.cjs` gerçek collection/passage, dupe/cap, death/retry, real Hands routing/purchase, spend→CTA, replay reward, sealed save + partial/full reload, 30 dil, Arabic RTL ve viewport testlerini kapsar. Test dosyaları ZIP dışında. Headless yazılımsal WebGL gerçek düşük donanım FPS/Inspector/retention kanıtı değildir.

### 1.7.22 daha kısa tutorial / erken hareketin tanınması (önceki sürüm)

- Tutorial corridor: jumpLead 210→105, slideX 430→245, laneX 680→385, bunnyX 930→525; fallback yaklaşmalar 140. Üç bunnyhop satırının 42 birim aralığı, dört dersin sırası, güvenli collision rewind ve bitiş/Next Level ekranı korunur. Önceki oyunculara tutorial zorla yeniden açılmaması için kayıt TUTORIAL_VERSION=9 değişmez; görsel/snapshot UI version 8 olur.
- Kilidin nedeni: canonical jump/slide işlemi uyarıdan önce gerçekleşirse director onAction bunu APPROACH'ta kabul etmiyordu; sonradan PROMPT'a girip ikinci bir fiziksel hareket bekliyordu. Havada ikinci ground jump mümkün değildir; ayrıca .24 dünya ölçeği inişi/timer'ı uzatıyordu.
- Director yeni isActionActive hook'u ile gerçek isJumping/isSliding durumunu okur. requestLessonAction, devam eden doğru hareketi CLEAR'a geçirir; bekleyen prompt sonradan başlayan hareketi de update'te tanır. timeScale aynı fiziksel hareket aktifken hemen 1; normal yardım .32. Yeni double jump, teleport veya global gravity/collision değişikliği yok. Başarısız timing halen güvenli rewind ile tekrar edilebilir.
- `output/test-tutorial-1722.cjs`: gerçek lobi/portal başlangıcı, prompt öncesi canonical jump/slide, ikinci hareket olmadan CLEAR/timeScale=1; normal prompt .32, prompt sonrası fiziksel durum değişimi, lane/bunny/finish/complete, stale rewind recovery. Masaüstü ve Android yatay akışı, screenshot ve JS hata kontrolü. QA helper'ları gerçek fiziksel işlemleri çağırır; bu test bütün mobil swipe varyantlarının ayrı test edildiği anlamına gelmez.

#### Üç dakikanın üzerindeki aktif oyun süresi için tasarım gerekçesi (1–4, 1.7.23'te uygulandı)

1.7.22'de bunlar yalnız öneriydi. Kullanıcı 1.7.23 için uygulamayı onayladı; somut davranış ve ödüller yukarıda anlatılır. Aşağıdaki A/B ölçümü ve ek ücretsiz kurtarma fikri için canlı test sonucu hâlâ gereklidir. Oyuncuyu bekleterek veya seviyeleri gereksiz uzatarak üç dakika garanti edilemez.

1. **İlk eldivene görünür ilerleme (öncelik 1):** Bitiş ekranında küçük Ember Grip/Double Jump önizlemesi + `200 altına N kaldı`. Parası yetince mevcut lobi rehberine bağla. Yeni fiyat veya zorunlu satın alma yok; upgrade'e para harcaması hiçbir yerde kilit yaratmasın.
2. **İlk koşu için üç küçük hedef (öncelik 2):** `Bir bölüm bitir / 5 engel aş / 30 altın topla` gibi aktif oyun görevleri; tamamlanan hedef anında küçük görsel/ses tepkisi. Kalıcı save ve mevcut mission altyapısıyla tekrar ödül sömürüsü önlenmeli. Kesin ödül tutarı playtest ile seçilmeli; üç dakika zamanlayıcısı bekletme kapısı olmamalı.
3. **Bir sonraki bölümün küçük sürpriz önizlemesi (öncelik 3):** Mevcut Nature→Snow→City→Lava ilk dört haritasını bitiş ekranında tek görsel ve kısa isimle göster. Yeni mekanikler birer birer tanıtılsın. UI'yı popup/tutor dersleriyle doldurma; oyuncu tek tuşla Next Level'a gidebilsin.
4. **Başarısızlık sonrası hızlı, anlaşılır tekrar (öncelik 4):** İlk bölümlerde `Tekrar oyna` en belirgin eylem olsun; mevcut first-run rewind/checkpoint koruması yeterli mi ölç. Ek ücretsiz kurtarma ancak test verisi gösteriyorsa tasarlansın; reklam zorunluluğu veya mevcut Poki lifecycle mantığı rastgele değiştirilmesin.
5. **Ölçüm/A-B doğrulama:** Mevcut PLAYER_FIT_MILESTONES=60/120/180/300 aktif gameplay ölçümü kullanılır; yükleme/lobide bekleme başarı sayılmaz. Tutorial start→complete, Level 1 start→complete→Level 2, ilk ölüm→retry ve ilk eldiven→sonraki koşu funnel'ı incelensin. Sadece ortalama session length yerine 180 saniyeyi aşan oyuncu oranı, erken ölüm/çıkış oranı ve mobil/masaüstü farkı karşılaştırılsın.

Kaynaklar: [Poki engagement](https://developers.poki.com/guide/engagement) kısa, tatmin edici yaklaşık üç dakikalık döngüleri; açık hedef, kademeli zorluk ve kesintisiz etkileşimi öneriyor. [Poki onboarding](https://developers.poki.com/guide/easy-access) güvenli başlangıç ve mekanikleri kademeli tanıtmayı vurguluyor. Buradaki spesifik eldiven/hedef önerileri bu oyuna ilişkin tasarım çıkarımlarıdır, garanti edilmiş sonuçlar değildir.

### 1.7.21 başlangıç lobisi ön hazırlığı ve çocuk dostu hareketli dekor (önceki sürüm)

- Son loading pipeline görevi `lobby-entry-prewarm`: `showMainMenu` ayar hazırlığı, inaktif lobi mimarisi/tema/canvas çizimleri, sekiz gerçek el standının sırayla GLB parse/tek el dönüşümü, seçilen bölümün warmTheme hazırlığı. Giriş öncesi initTexture + compileAsync, görünmeyen mesh buffer upload ve EffectComposer'ın iki ping-pong hedefinin gizli render'ı tamamlanır. WebGL2 GPU fence asenkron beklenir; gl.finish kullanılmaz. Yükleme biraz uzar ama bu maliyet PLAY sonrası ilk yürüyüşe taşınmaz.
- Hub DPR/composer boyutu yükleme sırasında kesinleşir. Finalizer ve ilk enter bunları yeniden boyutlandırmaz; aynı tema için canvas texture/material yeniden kurulmaz. Rehber oklarının instanceColor özelliği önceden oluşturulur, gizli rehber/celebration/progress shader varyantları da derlenir. Distant runner cache warm-up, aktif lobby ve play_gate boyunca ertelenir. Lobi çıkışındaki eski display/composer bellek boşaltma davranışı korunur; bu ön hazırlık ilk açılışa yöneliktir.
- PLAY callback, hazır lobiyi senkron açar ve gerçek click içinde pointer lock ister. İlk SDK start sonraki task'ta, click Inspector/window dinleyicilerine ulaştıktan sonra gönderilir. Native Enter ve mobile tap korunur; Android'de pointer lock istenmez. Lobi Ctrl/RMB/panel kontrol akışı değiştirilmez.
- 12 masaüstü / 8 mobil kanatlı elemental maskot: yavaş süzülme, kanat çırpma, göz kırpma. Ön duvar boyunca renkli bayraklar. Paylaşılan geometriler + dört InstancedMesh draw call, frame başına yeni nesne/doku yok; geçiş pedleri/merkez yol boş kalır. Curved shader, Swept-X ve Layer 1 etkilenmez.
- QA `output/test-lobby-entry-1721.cjs`: sandbox iframe, gerçek mouse PLAY/native Enter/Android yatay touch, sentetik click engeli, sekiz modelin PLAY öncesi resident olması, sonraki GLB request sayısı sıfır, ilk yürüyüşte shader program sayısının sabit kalması, pointer lock/Control toggles/settings/Escape, hareket/key-up/jump ve gerçek Level portal geçişi. JS hata yok; görüntüler `output/lobby-entry-1721`. Headless yazılımsal WebGL frame süreleri gerçek cihaz FPS garantisi değildir. Gerçek Poki Inspector/düşük donanım testi dağıtım sonrası yapılmalı.

### 1.7.20 Poki açık PLAY kapısı (önceki sürüm)

- Gerçek Inspector'da 1.7.19 sonrasında giriş/etkileşim uyarısı sürdü; yerel mock başarısı Inspector doğrulaması değildir. Poki açılışı artık `loading finished → play_gate → gerçek PLAY click → lobi` olur. Standalone web otomatik lobi davranışını korur; Steam/Pixel/canlı site değiştirilmez.
- Yükleme kartında lokalize büyük PLAY/OYNA butonu. Hazırlık tamamlanır ama lobi ve animation loop bu butona kadar başlamaz. Pending/accepted bayrakları render_game_to_text.status.loading içinde; gate mode `play_gate`. Normal keyboard/mousedown kontrol işleyicileri kapıda devreye girmez; native Enter/Space buton aktivasyonu korunur.
- Poki bridge `confirmPlayInteraction(event)` yalnız gerçek (isTrusted) boot-play-btn click ve tamamlanmış yüklemede ilk gameplay iznini verir. Önceki herhangi bir pointerdown/keydown ile açılma kaldırıldı. Click preventDefault/stopPropagation yapılmaz; setTimeout(0) ile Inspector dinleyicileri click'i aldıktan sonra returnToLobby/ilk start. Canvas focus aktarılır. Synthetic .click() ve programmatic gameplayStart boot'ta etkisizdir.
- QA output/test-play-gate-1720.cjs: sandbox iframe; mouse click, native Enter, mobile landscape touch. SDK taklidi ilk start'ta bubbled PLAY click + userActivation kaydını zorunlu tutar; gate öncesi start yok; 8 hareket tuşu/key-up, jump, settings-close focus, blur-stop, Flappy Space/Escape focus geçti. JS hata yok. output/play-gate-1720/; resmî istemci output/official-1720-gate ve official-1720-final. Gerçek Inspector sonucu yine yeni ZIP yüklenerek kontrol edilmeli.

### 1.7.19 Poki iframe klavye odağı (geçmiş)

- Otomatik lobi girişinde canvas tabIndex=0 ve preventScroll focus; gerçek pointerdown önce canvas odağını verir, sonra preventDefault/pointer capture uygular. Pointer lock olmadan WASD/oklar çalışır. Panel kapanınca canvas odağı geri verilir; input/select/textarea/contenteditable yazı girişi lobi hareketinden ayrılır.
- İlk gameplayStart yalnız gerçek (isTrusted) tuş/tıklama veya odaklı, kullanıcı etkinleştirilmiş gamepad girişi sonrası. Polled/synthetic tuşlar start tetiklemez; Poki bridge de ilk trusted gesture öncesi start raporlamayı engeller. Otomatik lobi/render focus oyuncu etkileşimi sayılmaz.
- QA: output/test-input-1719.cjs + iframe-input-1719.html. Odak düzeltmesi kapatılan baseline'da tüm 8 tuş başarısız; düzeltmeyle tüm tuşlar ve keyup, jump, ayar panelinden odak dönüşü, iframe blur-stop geçti. SDK start userActivation true; JS hata yok. output/input-1719/; resmî istemci output/official-1719/. Gerçek Inspector yeni ZIP yüklenince tekrar kontrol edilmeli.

### 1.7.18 doğrudan lobi ve Flappy arcade

- Gerçek boot tamamlanınca `finalizeLoadingTransition → returnToLobby`; 2D PLAY adımı yoktur. Eğitim Level portalından başlar. Yükleme kartında Flappy, sahte progress veya kullanıcı etkileşimi kapısı yoktur; campaign hazırlık overlay'i de mini oyun açmaz.
- Sağ tarafta FLAPPY standı (X26/Z12), 1.5 saniyelik ped ve uzaktan tıklanabilir ekran/tabela. `ElementalFlappyArcade.begin/end/getState/runPreparation` API'si `loading-minigame.js` içinde, DOM ve Worker ilk stand kullanımında oluşur. `ElementalLoadingMinigame` aynı API'nin eski scheduler alias'ıdır; artık begin çağıran yükleme kodu yoktur.
- Space/W/↑ veya dokunma ile uçuş, ölümden 2 saniye sonra sınırsız retry, yerel rekor, X/Escape ile aynı konumda lobiye dönüş. Arcade açıkken lobi hareket/render bekler; worker timer/heartbeat/retry kapanırken temizlenir. Canvas oranı mobilde korunur; OffscreenCanvas yoksa 2D fallback kullanılır.
- Otomatik lobi girişi Poki `gameplayStart` tetiklemez. İlk gerçek kullanıcı girdisi başlatır; panel/portal/arcade beklemesi veya ölüm stop, devam start verir. QA: `output/test-flappy-1718.cjs`, `output/flappy-1718/`, resmî istemci `output/official-1718-final/`.

### 1.7.17 Poki SDK gameplayStart düzeltmesi (geçmiş)

- 3B lobi artık ilk PLAY'den sonra kontrol edilebilir oyun alanı olduğu için Poki `gameplayStart` gönderir; panel, reklam, görünmeyen sekme ve portal sinematiği `gameplayStop`, dönüşler yeniden start verir. Portal→koşu kare yarışında lobi inactive olduktan sonra SDK state geri alınmaz.
- Poki SDK script'i/`init()` 6 saniyeyi aşsa da oyunu bekletmeyen mevcut `ready` kapısı korunur; arka plandaki bootstrap geç gelince pending `gameLoadingFinished`/gameplay durumunu raporlar. Gerçek Inspector doğrulaması yeni ZIP yüklenince yapılmalıdır. QA: `output/test-poki-lifecycle-1717.cjs` ve `output/poki-lifecycle-1717/`.

### 1.7.16 ses istikrarı

- `audio-system.js` oyun müziğini yalnız koşu aktifken veya Level Finish kutlaması boyunca başlatır. `canplay`, play-promise sonucu ve miks döngüsü aynı koşulu kullanır; hazırlık/portal aralığında eski tekrarlı pause/play yarışması yoktur. Bitişte düşük seviye müzik korunur; fade kare başına yeniden başlatılmaz.
- Ses grafiği otomasyonu 80 ms'ye bölünür ve değişmeyen HTMLAudio volume tekrar uygulanmaz. `game-runtime.js` coin sesine 5 eşzamanlı ses/35 ms sınırlaması, kısa fade ve `onended` cleanup; magnet kilit sesine 55 ms sınırlaması; jump/land/slide/crash için kısa attack ekler. Bunlar ses katmanı değişiklikleridir, puan/coin/çarpışma davranışını değiştirmez.
- Gerçek tarayıcı ölçümü/testi: `output/audio-1716/diagnostic.json`, `test-results.json`, `audio-game.png`; resmî web-game istemcisi `output/official-1716/`. 1.7.15 lossless asset optimizasyonu korunur.

### 1.7.15 Poki kayıpsız asset boyut optimizasyonu

- Paket büyüklüğünün ana kaynağı 12 GLB içindeki PNG dokularıydı. Default el, sekiz eldiven, car/motor/train dokuları lossless WebP olarak yeniden paketlendi. Toplam GLB 55.456.080 byte → 36.064.412 byte (%34,97 azalma). Dosya adları ve lazy-load akışı aynı; yalnız içerik/GLB buffer offset'leri ve `EXT_texture_webp` bağlantıları değişir.
- glTF JSON'da `textures[].extensions.EXT_texture_webp.source` ve required/used extension listesi vardır. PNG kopyası/fallback eklenmez; vendor r185.1 GLTFLoader yerel WebP eklentisini zaten içerir. Decoder/bundler/dependency yüklenmez.
- Her doku raw decode ile piksel piksel aynı, aynı çözünürlük/kanal sayısındadır. Meshopt encoded geometry byte hash'leri, tüm accessor/mesh/node/material tanımları ve geometry tail aynen korunur. Weld/simplify/resize/quantization uygulanmadı. Normal/roughness/metalness haritaları da kayıpsızdır; müzik ve diğer görseller değiştirilmedi. Transfer küçülür, decoded GPU texture belleği aynı kalır; FPS artışı garantisi değildir.
- Offline script `output/optimize-poki-assets-1715.cjs`; kaynak yedekleri `output/asset-size-1715/originals/`, ölçüm `report.json`. Bunların hiçbiri ZIP'e girmez. Script yeni GLB'leri önce staged/optimized içine yazar; pixel/geometry doğrulamasından sonra kaynakta aynı dosyalara kopyalanır. Aktif optimize kaynakta tekrar çalıştırılmamalıdır.
- `output/decode-lossless-assets-1715.cjs` 12 orijinal/yeni GLB'yi gerçek Three GLTFLoader ile açıp decoded geometri, texture boyutu/colorSpace ve materyal slotlarını karşılaştırır. `output/test-poki-asset-runtime-1715.cjs` gerçek oyun akışında default el, 8 stand, sekiz equipped viewmodel ve üç araç için kontrol yapar. Resmî skill istemcisi `output/official-1715/`. Ayrı ham-GLB GPU karşılaştırma harness'i headless context loss yaşadığı için görsel eşitlik kanıtı olarak kullanılmaz; oyun render hattının testleri esas alınır.
- Aynı kaynak/cache/ZIP 1.7.15. Site/Steam/Pixel kopyaları değiştirilmez. Daha büyük kayıp istemedikçe doku düşürme veya lossy encode yapılmamalıdır.

### 1.7.14 sakin ok animasyonu ve siyah portal arka duvarı (önceki sürüm)

- Kullanıcının görselindeki pikselli yol, handoff ekran fotoğrafı değil, portalın arkasındaki 256x384 CanvasTexture idi. Her iki portalın bu kaplaması ve canvas çizim kodu kaldırıldı; yerini iki taraflı, tone mapping almayan düz siyah MeshBasicMaterial aldı. Portalın girdap shader'ı/temaya göre rengi, çerçevesi ve önceki .38s siyah handoff fade korunur. `updatePortalTheme()` artık yalnız portal renk uniformunu değiştirir; arka duvara doku yüklemez.
- Rehber oklarının modulo zamanla ileri gidip aniden başa sıçrayan konum animasyonu kaldırıldı. Konum/boyut yalnız avatar-hedef mesafesinden gelir; sabit doğrultuda tüm yol görünür. Her instance'a continuous sinusoidal (.76–1.0) renk yoğunluğu dalgası uygulanır; düşük genlikli ışık hedef yönüne akar. Ortak Color/dummy ve tek instanced draw korunur; kare başına yeni mesh/doku üretilmez.
- QA `output/test-hub-1714.cjs` eski reset eşiğinin iki tarafında aynı transform ve sürekli renk değişimini ölçer. Gerçek Level 4/Lava ve Endless portal yaklaşımı hazırlık beklerken screenshot alınır; arka yüzey siyah/mapsizdir, ardından gerçek koşu ve pointer-lock doğrulanır. `output/official-1714/` resmî web-game istemcisi state/screenshot kaydıdır. QA çıktıları pakete girmez.
- Aynı kaynak/ZIP/cache 1.7.14; site/Steam/Pixel değiştirilmez.

### 1.7.13 düz rehber okları, eldiven becerileri ve geçiş düzeltmeleri (önceki sürüm)

- Rehber artık ara noktalara uğramaz: avatar ile hedef ped arasında tek düz doğrultudadır. 24 kapasiteli tek InstancedMesh tüm mesafeye yayılır; görünür adet mesafeye göre değişir, uzak oklar hafif büyür. Depth test açık kalır, polygon offset zemin çakışmasını önler; oklar küpün üstüne çizilmez. Kare başına geometri veya malzeme üretimi yoktur.
- İlk Score eğitimini gerçekten tamamlamak `returnToLevel` dönüm noktasını kayda ekler. Lobi okları tekrar Level portalını gösterir; portala girince bayrak temizlenir. Level 2 tamamlanınca Wheel önceliği normal devam eder. Eski kayıtta Score zaten alınmışsa bu dönüş eğitimi geriye dönük zorlanmaz.
- Sekiz eldiven kaidesinin üzerinde mevcut `handSkill_*` çevirileriyle beceri adı bulunur. Beceri/ad/fiyat etiketleri kameraya dönük, aynı kaide işlemine tıklanabilir ve yalnız değer değişince doku günceller.
- Portal sonunda eski düşük çözünürlüklü lobi fotoğrafı/render target yerine siyah fullscreen quad kullanılır; mevcut .38 saniyelik fade ile koşu açılır. Handoff için artık render target veya ekran fotoğrafı oluşturulmaz; koşu ve Layer 1 çizim sırası korunur.
- Double jump ikinci zıplayışta tam normal zıplama kuvvetini ve Jump yükseltme çarpanını kullanır; düşüş hızı yeni yukarı impulsa dönüşür, daha güçlü mevcut yükseliş kısılmaz. Kuyruk tüketilir; havada tek kullanım, cooldown, HUD ve merkezi klavye/dokunma bağları korunur. Ana menü/ölüm sırasında kullanılamaz. Swept-X, gravity ve curved-world değişmez.
- Yükleme sırasında sekme gizlenirse yalnız Flappy denemesi sonlandırılır; duraklamış worker'ın `alive` kilidi hazırlığı engellemez. Gizli sekmede yeni uçuş başlamaz; asset pipeline ve el modeli beklemeleri timer fallback ile RAF'a bağımlı kalmaz. Tarayıcının kendi arka plan timer/GPU kısıtlamaları yine geçerlidir; arka sekmede eşit hız garantisi verilmez.
- Uygun fiyatlı işlem kırmızı noktası Ana Menü düğmesinin içine 5px inset ile yerleşir; Pause overflow tarafından kesilmez.
- QA: `output/test-hub-1713.cjs` / `output/hub-1713/` düz doğrultu/tüm yol, gerçek Score satın alma sonrası dönüş, sekiz çevrili etiket, gerçek portal siyah handoff, 30/60/120 Hz double jump ve yükseltilmiş kuvvet, üçüncü zıplama reddi/iniş/cooldown, Pause bildirim noktası ve görünürlük eventiyle minigame gate testi. Son ekran görüntüleri görsel olarak incelendi; JS/WebGL shader hatası yok. `output/official-1713-final/` resmî web-game istemcisinin screenshot/state kaydıdır. Hidden-tab testi görünürlük simülasyonudur, gerçek arka sekme performans ölçümü değildir.
- Aynı kaynak ve ZIP/cache 1.7.13; QA output dağıtıma dahil değildir. Site yayınlanmadı; Steam/Pixel kopyaları değiştirilmedi.
- Önceki `test-hub-1712.cjs` yeni kaynakla yeniden geçti: çark/satın alma/eğitim zinciri, Missions, portal, Snow tabanı, Next Level ve ESC fare kilidi, ghost ve çeviri kontrolleri. Beş değişen JS dosyası `node --check` ile doğrulandı.

### 1.7.12 lobi eğitimleri, anında portal girişi ve geri sayım (önceki sürüm)

- `lobby-onboarding.js` ayrı IIFE modülüdür; iş mantığı runtime API'sinden gelir. `elemental-run-lobby-guide-v1` kaydı yalnız `entered`, `score`, `wheel`, `hands`, `reached200` dönüm noktalarını saklar. DOM hedefleri, timer ve animasyon state'i kaydedilmez.
- İlk lobi girişi Level portalına zemin oklarıyla yönlendirir. Level 1 sonrası bitiş ekranında Ana Menü/Lobi dönüşü vurgulanır; lobide Score monitörüne oklar, açılan panelde satın alma düğmesine pointer gelir. Level 2 sonrası aynı dönüş çarka yönlendirir. Cüzdan ilk 200 altına ulaştığında Ember Grip standına yönlendirme bekler; parası harcanmışsa yeniden yeterli bakiye olana kadar oklar gösterilmez. Önceden yükseltme/ilk spin/el satın alan kayıtlar tekrar eğitime zorlanmaz. Öncelik: Level → Score → Wheel → Hands.
- Eski bitişte doğrudan Score/el satın alma pop-up akışı ve otomatik çark açılışı kaldırıldı. Level 2 sadece ilk spin'i açar; ilk ödülün sabit Speed kuralı korunur. İsteyen oyuncu sonraki seviyeyi seçebilir; kalıcı rehber lobiye döndüğünde devam eder. Uygun fiyatlı bir yükseltme/el/Rebirth varsa bitiş, ölüm ve pause Ana Menü düğmelerine kırmızı bildirim noktası eklenir.
- Rehber okları 18 instanced mesh; satın alma kutlaması 24 instanced parçacık ve cüzdan ölçek animasyonudur. Level kolon okları ve monitör başlığı kısa pulse animasyonu oynatır. Rehber metni ancak aşama/dil değiştiğinde güncellenir; kayıt/uygunluk/UI kontrolü 4 Hz'dir. Her karede yeni geometri veya doku yaratılmaz.
- Cyber zemini koyu metal üzerinde cyan/magenta **grid** olarak yeniden çizildi; önbellekli color/emissive map, yeni render pass yok. Rebirth yanında (-16,22) Görevler standı mevcut Günlük Görevler panelini açar.
- Çark `update()` artık aktif ve görünür lobi karelerinde de çağrılır; arka sekme/reklam sırasında süre ilerlemez. Ön tabelada gerçek geri sayım görünür.
- Portala adım atıldığı veya tabelasına uzaktan tıklandığı an `.8s` kamera yaklaşımı başlar; 1.5s pad bekleme şartı yok. Asset hazırlığı bitmemişse son yaklaşım noktasında bekler; hazır olunca koşuya geçer. Diğer satın alma pedlerinde kazara alımları önleyen dwell korunur. Raycast düğmelerinde eski 15m mesafe sınırı kaldırıldı; monitör, ped/tabela, wheel ve el modeli uzaktan tıklanabilir.
- Masaüstü Level/Next Level/Endless girişinde mouse-look kapalı olsa da pointer capture istenir. ESC ve reklam sonrası kurtarma aynı kuralı uygular; lobi serbest imleç/RMB/Ctrl davranışı ve mobil dokunma değişmez. SDK gerçek reklam testleri yerel testten ayrıdır.
- Snow tünel yan duvarlarının altı yerel y=-3.5'e uzatıldı (kar zemin y=-2.64); tavan, yol açıklığı, collision ve curved-world değiştirilmedi.
- Üç ghost 65m'yi aşmayan görünür bir başlangıç gridinden aynı anda başlar. Madalya bitiş süreleri ve gerçek finish konumu değişmez; Bronze opacity .32. 4 Hz HUD mesafe göstergesi `↑` önde / `↓` arkada rakip mesafesini verir, böylece yavaş Bronze arkada kaldığında da takip edilir. Ghost'lar hâlâ yalnız kozmetiktir.
- 7 yeni rehber/görev metni 30 desteklenen dile eklendi. QA: `output/test-hub-1712.cjs`, `output/hub-1712/`, `output/official-1712-final/`; gerçek raycast satın alma ve level ok pulse'ı, rehber dönüm noktaları, Missions paneli, portal beklemesiz girişi, Next Level ve ESC sonrası pointer capture, Snow mesh sınırı ve üç ghost/arkada Bronze HUD göstergesi doğrulandı. Output dosyaları dağıtım paketine girmez. Swept-X, viewmodel Layer 1 ve curved-path shader değiştirilmedi; site/Steam/Pixel bu işlemde güncellenmedi.

### 1.7.11 ön kolon okları, Cyber kimliği ve koşuya giriş kilidi (önceki sürüm)

- Level seçim okları artık kapının iç duvarında değil, girişteki iki kolonun **ön yüzündedir**: x=portalX±3.2, z=-26.86. Raycast ile seçilir.
- Cyber teması camgöbeği/magenta pencere duvarı ve koyu metal üzerindeki neon devre izlerini kullanır. Renk/emissive dokuları bir kez üretilip cache edilir; ek postprocessing pass yoktur. Diğer temalara geçerken emissive map sıfırlanır.
- 2x hız standı 2x puan standının yanına (16,22) eklendi; mevcut rewarded-ad ve 5 dakikalık hız ödülü API'sine bağlıdır. Rebirth standı korunur. Çark sayacı modelin önündeki ayrı alt tabelada y=1,z=.62 konumundadır.
- Lobi avatar collider yarıçapı 1.28; dönen 1.7 birim küpün köşeleri ve görsel eğimi hesaba katılır. Enclosure sınırları yarıçap kadar içeriden sınırlandırılır; runner collision mantığına dokunulmaz.
- Portal pedi 1.5 saniye dolunca asenkron hazırlıktan **önce** pointer-lock istenir. Level/Endless başlangıcındaki eski `deferPointerLock:true` kaldırıldı. Lobi kaynaklı koşu mouse-camera ayarı kapalıyken de capture ister; reddedilirse mevcut click-to-resume kurtarması vardır. Lobi dolaşırken imleç serbest, sağ basılı orbit ve Ctrl toggle korunur.
- `game-localization.js` 30 dilin her birine 25 lobi metni ekler. Tabelalar, kontrol ipuçları, wheel kilit bilgisi, map adları ve Stats madalyaları ortak sözlüğü kullanır; eldiven marka isimleri değişmez.
- QA: `output/test-hub-1711.cjs` gerçek portal yürüyüşleri, iki modda pointer lock, kolon okları, 3:45 sayaç görünümü, 3 stand, dört duvara döndürülmüş küple yürüme, Fransızca UI; `output/official-1711/` standart Playwright istemcisi. Yerel tarayıcı kontrolleridir; Poki canlı reklam gösterimi bu testte yapılmadı.

### 1.7.10 lobi kontrolü, istatistikler ve sadeleştirilmiş yerleşim

- Lobi serbest yuvarlak imleçle açılır. Sağ tuş basılıyken kamera döner; Ctrl fare kilidini açar/kapatır. Normal koşunun pointer-lock davranışı korunur. Panel kapatma fareyi zorla kilitlemez; mobil sürükleme/gamepad kontrolleri korunur.
- Level kapısının iki iç yan duvarında büyük tıklanabilir ok levhaları vardır. BÖLÜM SEÇ yazısı kaldırıldı. Bitiş ve ölüm ekranındaki Ana Menü düğmeleri `returnToLobby()` ile doğrudan lobiye döner; ilk açılış 2D menüsü değişmez.
- Ortadaki sarı zemin halkası ve yön okları kaldırıldı. Arka sırada çark (0,22), Rebirth (-9,22) ve 2x puan (9,22) simetriktir. Hız reklam standı yerine Rebirth standı mevcut ekonominin onaylı yeniden doğuş kartını açar; reset işlemi otomatik yapılmaz.
- Portallar arasındaki altın heykelin önündeki pad salt-okunur `openSelector({statsOnly:true})` ekranını açar. Eski bölüm kartları korunur; 120 bölüm için en iyi süre ve Altın/Gümüş/Bronz gösterilir, karta tıklamak koşu başlatmaz.
- Zeminler tema başına önbellekli 512px renk/normal/roughness haritaları kullanır; tekrarlı doku, taş/kar/mermer/bazalt yüzeyleri ve şehir duvarında panel/havalandırma/perçin ayrıntıları vardır. Her karede doku oluşturulmaz. Dört opak duvar dışındaki görünmeyen map kopyaları ve büyük dış zemin kaldırıldı; gerçek koşu haritası `warmTheme` hazırlığı korunur.
- QA: `output/test-hub-1710.cjs`, `output/hub-1710/`, `output/official-1710/`. 6 tema, fare akışı, gerçek raycast ile iki ok, stats, Rebirth paneli, ölüm/bitiş dönüşleri doğrulandı. Masaüstü ve 640x360 ekran görüntüleri incelendi; testte JS/WebGL shader hatası yok. Gerçek mobil cihaz FPS ölçümü yapılmadı.
- Aynı kaynak klasör ve ZIP kullanılır; canlı site bu işlemde yayınlanmaz. Steam/Pixel kopyaları değiştirilmez.

### 1.7.9 yüzler, hareketli portallar, temalı zemin ve sahiplik

`lobby-hub.js`: `updateFace` delta-time ile göz kırpma, kaş/gülümseme ve havada şaşkın yüzü yönetir. İki portal kendi hafif ShaderMaterial girdabını çizer; hazırlık sonrası küp ve kamera portal yüzeyinden ileri taşınır, mevcut handoff koşuyu açar. `courtyardTexture` altı harita için önbellekli durağan organik zemin üretir; kare çizgi geometrileri ve karo sınırları kaldırıldı. `buildCarpet` merkezde dokuma, kenar ve madalyon deseni oluşturur. Reklam standları aynı hizada. `game-runtime.js` lobi API'sine `handState(id)` ekler: malzeme shader uniformları satın alınmamış elleri gri, sahip olunanları renkli, seçili eli daha aydınlık yapar. Seçim değişiminde shader tekrar derlenmez; runner el malzemeleri etkilenmez. Seçili ped de aydınlanır. QA: `output/test-hub-179.cjs`, `output/hub-179/`, `output/official-179/`; 6 tema, gerçek satın alma/seçim, yüz/jump, iki merdiven, Level ve Endless portal başlangıçları geçti; yeni JS/WebGL shader hatası yok. Canlı site bu işlemde yayınlanmadı.

### 1.7.8 lobi galeri düzeni ve render

`lobby-hub.js` içinde pahlı mimari, LatheGeometry el kaideleri, temas gölgeleri, bank/saksı modelleri, portal tema illüstrasyonları, okunaklı levhalar, yenilenmiş yükseltme monitörü ve çark bulunur. `batchStaticArchitecture()` sabit opak meshleri malzemeye göre birleştirir (193 çağrı azalması); hareketli, etkileşimli, şeffaf ve tema görünürlüğü değişen nesneleri birleştirmez. Lobi render'ı ayrı composer kullanır: RenderPass → OutputPass; masaüstü 2x MSAA, mobil/desteksiz GPU FXAA. `releaseLobbyRenderer()` çıkışta tamponları kapatır. Runner compositor'una dokunulmaz. Pointer lock sırasında monitor raycast'i merkezden yapılır. `lobby-hub.css` dar ekran HUD düzenini belirler. QA: `output/test-hub-178.cjs`, `output/hub-178-release/`, `output/official-178-release/`.

### 1.7.7 temalı kapalı lobi

`lobby-hub.js` artık avluyu dört adet 13.4 birim opak duvarla çevreler. Altı harita için cache edilen 512px CanvasTexture ve ortak malzemeler/instanced süsler kullanılır. Seçilen bölüm değiştiğinde duvar motifleri, renkleri ve armalar otomatik değişir. Kamera duvar içinde sınırlandırılmıştır. Yön okları, alan tabelaları, animasyonlu portal halkaları ve okunaklı sade avlu zemini eklenmiştir. Eldiven merdivenleri, ped işlemleri ve koşu render hattı değişmez. QA: `output/hub-177/`, resmî istemci `output/official-177-final/`; QA dosyaları ZIP'e girmez.

### 1.7.6 dev koyu dörtgen — doğrulanmış kök neden

26 Eylül videosundaki hata Level 13 City'de yeniden üretildi. Tren tavanını düzleştiren `flattenRoofGeometry()` normalized Int8 normal buffer'ını normal hesabı için tekrar kullanınca 57.678 vertex normalini sıfırlıyordu. HDR NaN değerleri bloom ile büyüyor, alfa kanalını da bozup CSS body gradient'ini görünür yapıyordu. Artık hesap Float32 normal buffer'ında yapılıyor; hazırlık sonrası `repairVehicleGeometryNormals()` dejenere/kusurlu vertex'leri bir kez onarıyor. Bloom girişinde sonlu değer filtresi ve yalnız RGB toplama koruması var. High, bloom, MSAA ve PBR korunur. GLB binary'leri, Swept-X ve curved-world shader mantığı değiştirilmedi. Level 13 testinde 10 kare: NaN/Inf/şeffaf çıktı pikseli/JS hata sayısı sıfır. QA kayıtları `output/verified-176/` altında; output ZIP'e dahil edilmez.

### 1.7.5 ayrı yağ kaplaması düzeltmesi (geçmiş)

Water yağ sütunları yanlış `gamePhase >= 4` filtresiyle Snow'da da üretiliyordu. Artık yalnız faz 4'te çalışır ve çıkışta temizlenir. Kamerayı içine alan opak sütunun yalnız görseli yakın mesafede gizlenir; CPU temas kontrolü değişmez. Yağ sıçraması kenarlara dağılan en fazla 5 masaüstü/3 mobil küçük leke, 2.4 saniye animasyon ve yığılma kilidi kullanır. Snow Level 12 çevre testi tamamlandı, yağ kaplaması tekrarlanmadı. Bu ayrı hata düzeltmesidir; videodaki dörtgenin gerçek nedeni 1.7.6'da bulunmuştur.

## 2. Oyun ve çalışma modeli

Birinci şahıs, otomatik ileri koşulan, dört şeritli 3D endless runner. Oyuncu X yönünde ilerler; zıplama, kayma ve şerit değiştirerek araç/tren/duvar/harita tehlikelerinden kaçınır, altın toplar, yükseltmeler ve eldivenler alır. İki akış vardır: skor eşikleriyle altı biyomdan geçen **Endless** ve sabit seed/harita/hedefe sahip **120 bölümlük Campaign**. İlk açılışta otomatik lobiye giriş, Level portalından ilk Cyber/City eğitim koşusu; eğitimin sonunda ayrı bitiş/sonraki seviye ekranı vardır. Level 1 Nature, Level 2 Snow, Level 3 City/Cyber başlar. Level 5'te Nature→Sky Mega Jump; başka belirli bölümlerde `LEVEL_TRANSITION_PLANS` ile farklı biyom geçişleri vardır.

Fizik motoru, bundler veya React yoktur. Three.js **0.185.1** ve eşleşen `vendor/` addon'ları kullanılır. Oyun mantığı büyük ölçüde `game-runtime.js` içindeki IIFE durumunda kalır; `level-system.js`, `tutorial-director.js`, `curved-path-system.js` ve diğer dosyalar `window.Elemental*` arayüzleri üzerinden konuşur. ES module yalnızca Three bridge/boot için kullanılır; rastgele `import` ekleyerek klasik script sırasını bozmayın.

## 3. Klasör ve dosya haritası

```text
ELEMENTAL RUN Poki v1.5.0/
├─ index.html                    DOM, menü/HUD/overlay, script sırası, Three r185.1 boot
├─ browser-platform.css          Menü, HUD, bitiş, el mağazası, mobil/yatay responsive
├─ game-runtime.js               Ana oyun state'i, scene/render, spawn/collision, biyomlar, el ve input
├─ game-config.js                Sabit skor eşikleri, havuz/particle kurucuları
├─ game-localization.js          30 dil sözlüğü, UI/yükleme metinleri
├─ map-environments.js           Faz descriptor'ları ve geçiş/update koordinatörü
├─ graphics-engine.js           Kalite preset uygulama ve mobil dinamik çözünürlük
├─ curved-path-system.js        GPU görsel viraj ve gölge shader yamaları
├─ level-system.js               120 bölüm, sabit harita/seed, madalya, save ve level UI
├─ level-ghost-system.js         Gold/Silver/Bronze kozmetik yarışçılar
├─ tutorial-director.js         FTUE durum makinesi, istemler ve geri sarma
├─ loading-minigame.js/.css     Lobideki lazy-loaded Flappy arcade ve hazırlık scheduler alias'ı
├─ lobby-hub.js/.css            Ayrı düz 3D lobi, küp kontrolü, stand/ped/portal
├─ fortune-wheel.js             Şans çarkı, ödül ve cooldown
├─ audio-system.js              Web Audio/HTML audio yaşam döngüsü ve miks
├─ poki-config.js               Sadece Poki origin/QA'da portal modunu açar
├─ poki-bridge.js/.platform.js   Poki SDK yaşam döngüsü, reklam/feedback uyarlaması
├─ platform-adapter.js          Browser/Poki/CrazyGames/Steam façade
├─ service-worker.js            Eski cache'i temizler; aynı-origin GET'i no-store çeker
├─ BUILD.json                   Gerçek sürüm bilgisi
├─ progress.md                  Kronolojik değişiklik kaydı
├─ assets/                      GLB araç/eller, doku, ses, ikon, hand preview'ları
│  └─ hands/                    hand_<skin>.glb, manifest.json, previews/, README.md
├─ elemental run icons/          Menü arka planı ve görseller
└─ vendor/                      Three 0.185.1, GLTFLoader, postprocess/shader addon'ları
```

`output/` yerel test ekran görüntüsü/QA çıktısıdır, oynanış asset'i değildir. Web sitesinin GitHub Pages workflow'u kök `assets/` klasörünü kopyaladığı için yayın deposunda klasik JS dosyaları `assets/runtime/` altına taşınır ve `index.html` referansları buna göre çevrilir. Orijinal ZIP'te JS dosyaları köktedir. Yayın kopyasında `loading-minigame.css` içindeki arka plan URL'si `../../elemental run icons/...` olmalıdır.

## 4. Boot, yükleme ve platform

1. `index.html` önce Poki config/bridge, platform adapter, config, localization, map/graphics/audio/level/ghost/fortune/tutorial/loading klasik scriptlerini **sırayla** yükler. HTML sonundaki module script `vendor/three-r185-bridge.js` dosyasını import eder; ardından `curved-path-system.js` ve en son `game-runtime.js` klasik scriptlerini `loadOrderedClassicScript()` ile sıralı yükler.
2. Poki SDK `poki-config.js` tarafından gerçek Poki origin/referrer/ancestor saptanırsa yüklenir. Genel GitHub Pages sitesi portal SDK/reklamını varsayılan olarak açmaz. `?platform=poki` yerel QA için zorlayabilir; canlı site analizi için bu parametreyi normal kullanıcı davranışı sanmayın.
3. `game-runtime.js#runLoadingPipeline()` görevleri sırayla işletir; `waitForCriticalAssetsThenFinish()` seçili el GLB'sini bekler (ilk eğitimde en çok 5 sn, diğerlerinde 10 sn). Menü müziği/araç GLB'leri ve bazı harita ön-hazırlıkları ayrıca kademeli kuyruklarla sürer. Level geçişleri için `scheduleLevelOneNaturePrewarm()` ve `ensureCampaignPhaseWarm(phase)` akışını kontrol edin; bütün GLB'lerin baştan indirildiğini varsaymayın.
4. Boot yalnız gerçek yükleme kartını gösterir; Flappy canvas/Worker açmaz ve asset pipeline kullanıcı oyununu beklemez. `finishLoading()` doğrudan `finalizeLoadingTransition()` çağırır. Flappy sonradan lobi standından açılır; OffscreenCanvas Worker varsa orada, yoksa ana thread 2D fallback'te çalışır.
5. Yükleme tamamlanınca doğrudan 3D lobiye girilir. Fare lobide serbesttir, sağ tuşa basılı tutunca orbit, Ctrl ile pointer lock açılıp kapanır. Portal geçişi koşu için pointer lock ister. İlk eğitim sağdaki EĞİTİM portalından başlar; tamamlandıktan sonra aynı portal seçili LEVEL'i gösterir. Koşucunun mouse kamera tercihi ayrı ve varsayılan kapalı kalır. Cache değişikliğinde `index.html` query `?v=...`, `service-worker.js`, `BUILD.json` birlikte güncellenmelidir.

## 5. Koordinat, eğri dünya ve render sözleşmesi

- CPU mantığında **X ileri**, **Y yükseklik**, **Z şerit/yana kaçış**. Dört merkez şerit `[-10.5, -3.5, 3.5, 10.5]` (`level-ghost-system.js` ve runtime). `render_game_to_text()` bu eksen sistemini açıkça raporlar.
- `curved-path-system.js` görsel virajı `onBeforeCompile` ile GPU vertex shader'ına uygular. CPU çarpışma/spawn koordinatları düz kalır. `smooth` uzun yol/bariyer yüzeylerinde vertex bazlı; `rigid` model bütünlüğünü koruyan objelerde; `spline` yerel teğet/normal/binormal tabanı gereken geometride; `sheet` geniş zeminlerde kullanılır. Modları keyfi değiştirmek model bükülmesini veya yolu terk etmesini doğurur.
- `installGpuCurvedObject()` görünür materyalleri ve gölge için `customDepthMaterial`/`customDistanceMaterial` parçalarını eşdeğer bükmeyle yamalar. Büyük GPU-bükümlü nesnelerde `frustumCulled=false`; aksi halde CPU bounds yüzünden binalar/bulutlar yok olup gelir. `customProgramCacheKey` r185.1 shader varyantını ayırır.
- Three r185.1 modern renk yönetimi kullanır. `graphics-engine.js` kaliteleri uygular; `game-runtime.js` sahne, kamera, renderer, ışık, materyal, Shadow/Composer ve biyom sahne içeriğini yönetir. `mats.road`/harita tabanları PBR ve özel doku davranışlarına sahiptir. Lava ve Water'da dünya zeminleri ile yoldaki engel yüzeyleri farklı nesnelerdir; değişiklik yaparken ikisini karıştırmayın. Asfalt üzerindeki işaretler/overlay'ler aynı düzleme bindirilmemelidir.
- Birinci şahıs eller `VIEWMODEL_LAYER = 1` üzerinde `renderViewmodelOverlay()` ile dünya üstüne ayrı çizilir. El pozisyonu/animasyonunu değiştirirken Layer 1, derinlik temizleme ve multi-GLB loader korunmalıdır.

## 6. Oynanış, collision, spawn

- Oyuncu otomatik ileri gider; hareket klavye, dokunmatik yatay mobil kontrol ve gamepad üzerinden işlenir. Space/W/↑ zıplama; C/S/↓ kayma; A/D/←/→ şerit yönü; M veya Esc menü/duraklatma davranışını tetikler. Aktif el skilleri merkezi `tryActivate...` hattındadır. Kesin tuşlar kayıtlı `settings.controlBindings` üzerinden değişebilir.
- Harici rigidbody/physics engine yoktur. Oyuncunun önceki/şimdiki X aralığı `playerSweptMinX`/`playerSweptMaxX` ve `sweptXOverlaps()` ile taranır; Y/Z overlap ayrıca kontrol edilir. Hızlı araç ve pad için swept aralığı önemlidir; yalnız anlık pozisyon testine dönmeyin. `game-runtime.js#updateObstacles()` animasyon ve çarpışma, `spawnManager()` üretim, `createObstacle()` görsel/collision kayıtlarını kurar.
- `loadVehicleAsset(type)` car/motor/train GLB'lerini tek jenerik yükleme kanalından alır; başarısızlık/fallback ve cache var. Araçların aynı şeritte duvar, döner/yer engeli veya başka araçla iç içe doğmaması için `trafficZRangesOverlap`, `trafficObjectOverlapsLane` ve X-clearance denetimleri vardır. GPU virajı collision kutularına uygulanmaz.
- Endless biyoma özel havuzlara sahiptir: ortak trafik ışığı, düşen kırmızı duvar, otomobil/motor/tren/bariyer yanında Sky sweeper, Lava lane, Snow ice road vb. Campaign `spawnLevelPatternBlueprint()`/`levelPatternSpawnContext` hattı bu türleri kullanır. `level-system.js` seed ve bölüm parametresi sahipliğindedir; `game-runtime.js` gerçek nesneyi üretir.
- Level 1–5 çocuk dostu onboarding: `motorcyclesAllowed=false`, `minimumOpenLanes=2`, daha yavaş trafik, seyrek satırlar ve güvenli başlangıç. İki açık şerit hep aynı yan yana çift değildir; tüm çift kombinasyonları deterministik dolaşır. Level 6 sonrası motosiklet tekrar açılır. Spawn değişikliğinde aynı level tekrarında aynı diziliş ve ilk beş levelde iki kaçış koridoru korunmalıdır.
- `falling_wall` yüksekten başlar/düşer; inişte üstüne denk gelen trafik yok edilme akışına alınır. Mega Jump Pad, respawn ve level geçişi sırasında ayrı state'tir. Bunların sadece görsel değil collision/snapshot akışını da test edin.

## 7. Eğitim, Campaign, ghost ve ilerleme

- `tutorial-director.js#STATES` `GATE → JUMP → SLIDE → LANE → BUNNY → FINISH → COMPLETE` akışını alt durumlarla yönetir; **LOOK_AROUND yoktur**. `game-runtime.js` içinde `spawnTutorialCars`, `createTutorialSlideBarriersAt`, `createTutorialLaneWallsAt` gerçek engelleri oluşturur ve `tutorialLesson`/`tutorialSequence` ile deterministik sırayı korur. Tutorial Cyber/City fazında başlar ve level gibi bitiş kapısı/son ekranı vardır. İlk 3 level için otomatik geri sarma sınırını rastgele genişletmeyin.
- `level-system.js` sabit `LEVEL_MAP_SEQUENCE` (120 giriş), `LEVEL_TRANSITION_PLANS`, `hashLevel(index)`, `calculateTargetScore(index)`, `createLevel(number)` ve `ElementalLevelSystem`i tutar. Mevcut hedefler **L1 650, L2 1050, L3 1400**; eski istekteki L1=300 artık güncel değildir. Sonraki hedefler formülle artar. Skor bitiş eşiğidir; harita Campaign'de yalnız skorla seçilmez.
- Belirli level içi geçişler: L5 Nature→Sky Mega Jump; L11 City→Lava, L18 Nature→Water, L26 Sky→Snow vb. `LEVEL_TRANSITION_PLANS` tek kaynaktır. L5 dışındaki kayıtlar normal faz geçiş yolunu kullanır.
- Eski yıldız sistemi kaldırıldı. `createLevel()` hedef/tempo ile `ghostTimes={gold,silver,bronze}` üretir; bitiş süresi `medalForTime()` ile madalyaya dönüşür. `level-ghost-system.js` eşzamanlı başlayan üç **kozmetik, çarpışmasız** şeffaf rakibi çizer; Gold bhop tarzı, Silver orta, Bronze yavaştır. Ghost sadece level modunda vardır, tutorial/endless'te açılmaz.
- Level save anahtarı `elemental-run-levels-v2`; eski `elemental-run-poki-levels-v1` okunup dönüştürülebilir. Level sonu UI'da gold, upgrade yolu, next level/ana menü ve ilk tamamlamaya ilişkin işaretçi tutorial'ları bulunur. İlk 200 gold ile Hands yönlendirmesi oyuncunun parası/ekran seçimiyle iptal edilebilir; yalnız görsele bakıp satın alma state'i varsaymayın.

## 8. Eldivenler, skiller, ekonomi

Ücretsiz `default` el `assets/hand.glb` kullanır. Sekiz satın alınabilir el `assets/hands/hand_<id>.glb` yolundadır. `HAND_SKINS` gerçek fiyat/skill tablosudur:

| El (`id`) | Altın | Bağlı skill |
|---|---:|---|
| `ember` / Ember Grip | 200 | `doubleJump` |
| `frost` / Frost Weave | 500 | `timeSlow` |
| `forest` / Forest Guard | 1.000 | `glide` |
| `neon` / Neon Pulse | 2.000 | `airDash` |
| `tide` / Tidebreaker | 3.500 | `timeRewind` |
| `solar` / Solar Forge | 6.000 | `magnet` |
| `void` / Void Walker | 10.000 | `phaseShift` |
| `elemental` / Elemental Prime | 15.000 | `revive` |

`game-runtime.js#getHandModelAssetPath`, `ensureViewmodelHandModel`, `viewmodelGlbCache`, `extractAndOptimizeGLBMaterials`, `vmSplitGeometryByX`, `buildCachedViewmodelGlb`, `updateViewmodelHands` ana fonksiyonlardır. Yalnız seçili el GLB'si yüklenir; bütün mağaza modelleri startup'ta preload edilmez. Preview WebP'leri Hands sekmesi açılınca atanır. `manifest.json#available` eklenmeden model isteği yapılmamalı. Materyaller baked PBR; texture renklendirme veya primitive aksesuar üretimiyle aynı elden sekiz varyasyon üretme mimarisine geri dönmeyin. Orijinal modellerin `x=0` etrafında sol/sağ ayrılabilmesi ve UV/normal/tangent kontratı için `assets/hands/README.md` okuyun.

Yeni aktif skiller: `airDash` yaklaşık 0,35 sn ileri atılım/7 sn cooldown, `timeRewind` 2,5 sn/60 Hz halka tamponunu 0,6 sn geri oynatır/14 sn cooldown, `phaseShift` 3 sn collision bağışıklığı/12 sn cooldown. UI/FX, ses ve cooldown state'i aynı runtime içindedir. `timeRewindX/Y/Z/Vy/Flags/Lane` typed array'leri ve `isHandSkillCollisionImmune()` mantığını bozmayın. Skill seçimi mağazadaki aktif ele bağlıdır; Upgrades ekranını yeniden bağımsız skill satış noktası gibi düzenlemeyin. `MAIN_MENU_STORAGE_KEY = elemental-run-steam-menu-state-v1` adındaki “steam” eskiye ait isimdir, web/Poki de aynı anahtarı kullanır; aceleyle yeniden adlandırmak save kaybı yaratabilir.

`fortune-wheel.js` ayrı save (`elemental-run-fortune-v1`) kullanır: Level 2 sonrası ilk çevirmede sabit 5 dakikalık “2× Speed” verir ama gerçek çarpan `1.2`; 5 dakika **aktif oyun süresi** sonrası tekrar hazır olur, sonraki ödül rastgeledir. Altın/puan/hız ödülleri ve sağ alt HUD zamanlayıcıları buradan gelir.

## 9. Grafik, ses ve mobil davranışı

- Varsayılan görünür mobil kalite **High**. `MOBILE_GRAPHICS_QUALITY_PRESETS.high` başlangıç pixel ratio'yu düşük cihazda 0,78, diğer mobilde 0,9 yapar; bloom/AO kapalı, gölge haritası ve render mesafesi azaltılmıştır. `graphics-engine.js#updateDynamicResolution()` FPS düşerse kalite etiketini değiştirmeden render scale/performance level'ı indirir; Level 2 geçişi kazanılmış mobil bütçeyi sıfırlamaz. Masaüstü otomatik preset yolu ayrı. Ayarlar UI'sında seçilen kaliteyi donanım koruması yanlış “High” gösterecek şekilde ezmeyin.
- Mobil CSS, yatay telefon `pointer: coarse` ve kısa yükseklik breakpoint'lerinde menü, HUD ve how-to-play panelini küçültür. `index.html` içinde bazı inline responsive kurallar da vardır; sadece `browser-platform.css` değiştirip bütün cascade'i gördüğünüzü sanmayın. Özellikle 640×360 ve 844×390 test edin.
- `audio-system.js` miks, menü ambient ve gameplay müziği için façade sağlar; `game-runtime.js#initAudio` oyun SFX tetiklerini kurar. Araçlar için sürekli motor/korna sesi istenmemiştir; yakın geçiş rüzgârı ve duvar/skill/coin/jump gibi olay sesleri ayrı tasarlanır. Tarayıcı ses açma için kullanıcı etkileşimi gerekir.
- Geçiş takılmaları nedeniyle Nature ve ileri harita kaynaklarının shader/texture/mesh warmup sırası önemlidir. `runLoadingPipeline()` ile `campaignPrewarm`, kademeli `deferredModelCaches`, `scheduleVehicleModelLoads()` farklı aşamalardır. Bir şeyi tamamen “compileAsync”e geçirmek, minigame worker'ını GPU yükünden otomatik korumaz. Yükleme tamamlanmadan sahneye geçmeme ve geçiş anında tek karede devasa üretim yapmama ilkeleri korunmalı.

## 10. Doğrulama, yayın ve güvenlik kontrolü

1. Değişiklik öncesi `BUILD.json`, `progress.md`, `git status` (varsa) ve ilgili dosyanın gerçek kodunu okuyun. Bu kaynak klasör Git repo olmayabilir; yayın reposu ayrıdır.
2. JS sözdizimi (`node --check` klasik scriptler), yerel HTTP üzerinden boot/oyun testi, `render_game_to_text()` state, ekran görüntüsü ve konsol/pageerror kontrolü yapın. `level-system.js#installQa()` yalnız localhost'ta `window.__ELEMENTAL_LEVEL_QA__` sağlar; level seçme, hedef/ghost eşiği ve tutorial completion testi için kullanın. Runtime'daki ek QA hook'larını kullanmadan önce gerçek adlarını kaynakta doğrulayın.
3. En azından ilk eğitim → bitiş → L1 Nature, L2 Snow, Level 5 Nature→Sky, Endless biyom geçişleri, mobil 640×360/844×390, Hands satın alma/ekip, Level 2 çarkı, collision ve yeniden giriş save testleri yapın. Gerçek düşük güçlü telefonda FPS sonucu, headless Chromium yazılım GPU'sundan çıkarılamaz.
4. Yeni dağıtımda HTML'deki tüm `?v=...`, `service-worker.js` build değeri, `BUILD.json`, menü sürümü ve `progress.md` uyumlu olmalı. Aynı ZIP'i güncelleyin. GitHub Pages'e ayrıca commit/push yapıp Actions sonucu `success` ve canlı HTML/JS sürümünü HTTP üzerinden doğrulayın. Site workflow'u kök klasördeki bütün klasik JS dosyalarını değil `assets/`yi yayınlar; bu nedenle staging `assets/runtime/` ve HTML yollarını eşleyin.
5. `service-worker.js` no-store ağ yolunu kullanır ve activate sırasında cache temizler. Portal SDK'sını sırf canlı sitenin eksik olduğu düşüncesiyle genel sitede zorla açmayın. Poki `gameplayStart`/`gameplayStop`, reklam sırasında pause ve pointer-lock recovery korunmalıdır.

## 11. Özellikle eski/yanlış kabuller

- Bu sürüm Three **r128** değil **r185.1**; eski `outputEncoding`/legacy chunk yamalarını geri taşımayın.
- Eğitimde `LOOK_AROUND` yok. L1 300 puan değil 650. Yıldız değil süreye bağlı Gold/Silver/Bronze madalya var.
- Level haritası her zaman skor eşiklerinden türemez; Campaign'in kendi 120 elemanlı harita dizisi vardır. Düz CPU collision yolunu shader virajına taşımayın.
- “2× Speed” etiketi bilinçli olarak gerçek 1,2× çarpanı saklar. Eldivenler yalnız renk değiştiren aynı mesh değildir; sekiz ayrı GLB'dir.
- “ZIP oluşturuldu” veya “kaynak güncellendi” demek “canlı internet sitesi güncellendi” demek değildir. Her çıktıyı ayrı doğrulayın.

## 12. 1.7.1 etkileşimli 3D lobi

1.7.2 düzeltmesi: temsilî koni/kutu biyom dekorları kaldırıldı. Lobi çevresi Cyber, Nature, Sky, Lava, Water ve Snow koşu sahnelerinin gerçek model cache/factory'lerinden sınırlı sayıda parça alır. Her haritanın gerçek zemin materyali bağımsız, hareketsiz UV kopyasıyla oda zemininde gösterilir; curved-world shader callback'i lobi kopyalarına taşınmaz. GLB el konum/normal/tangent attribute'ları `applyMatrix4` öncesinde float'a açılır; yoksa normalize edilmiş tamsayı koordinatları ±1'e kırpılıp el geometrisini bozuyordu. Stantların tek el ayırımı artık bağlı geometri parçasına göre çalışır ve oyunla aynı PBR iyileştirmesini kullanır. Altı biyom ve sekiz el Playwright ile doğrulandı; canlı site bu kaynak/ZIP güncellemesinden otomatik güncellenmez.

1.7.5 düzeni: lobi 70×64; sekiz el solda duvara paralel iki sütunda (alt X=-16, üst X=-29; Z=10,2,-6,-14), her sütun giriş yönünden arkaya artan fiyat sırasıyla. Üst platform 10×30 ve 3,1 yüksekliğinde; altışar basamaklı iki merdiven yalnız iki kısa uçta, uzun ön yüzde merdiven yok. Geometri ve kinematik `floorHeightAt` aynı `handTier` ölçülerini kullanır; 0,56 üzerindeki yükseltiye yandan snap engellenir, pedler dikey yakınlığı da kontrol eder. Küp 1,7×2×1,7 ölçüsünde ve (0,1.08,5) merkezinde doğar; controller `avatarHalfHeight` kullanır. El modelleri 3,2 birim yüksekliğe, yükseltme monitörü 1,3×, çark 1,35×, reklam standları 1,2× ölçeğe çıkarıldı. Portallar arkada; yükseltme monitörü sağ duvarda; çark ön sağda; iki reklam standı (mevcut 5 dk hız ve 15 dk skor ödülleri) ön solda merkeze dönüktür. Lobi gerçek koşu zeminleri, güneş/yıldız geometrisi ve fog/gök renklerini paylaşır. Gerçek çevre fabrikalarından 24 masaüstü/16 mobil dekor dört kenara dönüşümlü yerleştirilir; dış peyzaj zemini boşluğu kapatır. Platform/merdiven kapakları tabanla aynı düzlemde değildir. Küp gölgesi depthWrite kapalı, yumuşak radyal dokulu ve en yüksek yol yüzeyinin üstündedir. İki dönen kristal ve 32 küçük parçacık eklenmiştir. Koşu shader/çarpışma davranışı bu yerleşim değişiminden etkilenmez.

- `window.ElementalLobbyHub` kendi `Scene` ve kamerasını kurar, mevcut renderer'ı paylaşır. Lobi X sağ, Y yukarı, -Z ileri eksenlerini kullanır. Koşucu +X ekseninde kalır. Lobi hiçbir curved-world materyal yamasına veya Swept-X çarpışmasına dahil edilmez.
- Durumlar: `menu → exploring → transition → inactive`; boot doğrudan exploring'e girer. `stepGame` lobi açıkken koşucu simülasyonunu durdurur; lobi update/render ve ses miksini çalıştırır. Flappy açıksa lobi çizimi de bekler. Poki gameplay olayları gerçek etkileşim/engellenme durumuna bağlıdır.
- WASD/oklar kamera yönüne göre hareket eder; keyup hızı sıfırlar, Space ile kinematik zıplama yapılır. Serbest fare ve sağ tuşla orbit, Ctrl ile pointer lock; portal→oyun geçişinde lock istenir. ESC ayarları, Flappy açıkken ise arcade'i kapatır. Mobilde sol joystick ve sağ alanda sürükleme, kamera merkezleme düğmesi vardır. Gamepad sol çubuk hareket, sağ çubuk orbit, Start ayarlar. Oda sınırları ve standlar için basit XZ AABB, merdivenli platform için kademeli zemin Y kullanılır.
- Sekiz eldiven standında yalnız birer gerçek 3D el GLB'si dik ve hafifçe salınarak gösterilir; yaklaşınca model değişimi/morph yoktur. GLB kuyruğu yürürken de sürer; eşzamanlı istek sınırı masaüstünde 2, mobilde 1, başlatma aralığı 120 ms'dir. Bekleyen skin tekrar seçilmez. Lobi açıkken görünür kalır; çıkışta serbest bırakılır. KHR_mesh_quantization attribute'ları float geometriye açılır ve baked emissive albedo lit map olarak kullanılır. Loader epoch kontrolü geç gelen eski isteğin sahneye dönmesini engeller. Koşucunun el önbelleği ayrıdır.
- Pedde 1,5 saniye kesintisiz bekleme işlem başlatır. Pedden çıkmadan yeniden satın alma/reklam/çark tetiklenmez. Diyalog veya reklam açıkken hareket/ped sayacı donar. Yetersiz bakiye para eksiltmez. Ekonomi işlemleri eski `buyOrEquipHandSkin` ve upgrade fonksiyonlarına gider; yeni ayrı save formatı yoktur.
- Upgrade monitoründe raycast UV'si dört satın alma satırına eşlenir; en alttaki satır ortak upgrades/hands penceresini açar. Koşu sırasında ESC menüsündeki Upgrades aynı pencereyi açar; kapatınca koşu duraklatılmış kalır.
- Dünya çarkı mevcut çark panelini açıp döndürür; Level 2 kilidi/cooldown korunur. Reklam standı yalnız `status === completed` için 300 saniye speed bonusu verir. Genel sitede sağlayıcı yoksa ödül verilmez. “2x Speed” mevcut gerçek 1,2x çarpanı kullanır. Canlı reklam envanteri değil, yerel SDK mock'unda iptal/başarı/lifecycle test edilmiştir.
- Portal önce gerekli campaign hazırlığını bekler, sonra 1,15 saniyede kamerayı küpe yaklaştırır. En fazla 1280px genişlikte tek kare render target ile 0,38 saniyelik runner crossfade yapılır ve target dispose edilir. Lobi GLB gösterimleri çıkışta boşaltılır; hafif oda geometrisi yeniden giriş için saklanır ve koşuda çizilmez.
- `render_game_to_text().lobby` ve localhost `__elementalBrowserTest.inspectLobby/showLobby/placeLobbyPlayer/projectLobbyPoint` kontrolleri QA içindir. `output/test-hub*.cjs` uçtan uca masaüstü/mobil/ped/ödül testlerini, `output/run-hub-official.mjs` resmi web-game istemcisine yükleme bekleme adaptörünü içerir. `output/` pakete eklenmez.
- Yeni lobiye özel kısa açıklamalar Türkçe/İngilizce fallback'tir; mevcut mağaza/yükseltme metinleri 30 dilli `tr` sistemini kullanır. Düşük güçlü gerçek cihazda performans ve gerçek Poki reklamı ayrıca cihaz/platform testi gerektirir.
- OYNA öncesi 2D ana menü korunur; ortak mağaza/ayarlar DOM'u ekonomi ve erişilebilirlik için korunur. Lobi biyomu seçili levelin Nature/Snow/City/Lava/Water/Sky fazına uyar ve uygun campaign hazırlığını boşta kademeli başlatır. Portal bitmemiş hazırlığı bekler; tüm cihazlarda sıfır takılma garantisi yoktur. Yayın staging'inde `lobby-hub.css` de `assets/runtime/` altına gider; arka plan yolu `../../elemental run icons/...` yapılmalıdır.

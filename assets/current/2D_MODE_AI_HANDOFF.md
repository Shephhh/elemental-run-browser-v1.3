# Elemental Run — 2D mod: eksiksiz geliştirme ve AI devir belgesi

Belge tarihi: 12 Ekim 2026  
İncelenen kaynak sürümü: 1.8.11  
Kapsam: 2D RUN modu için 1.8.0–1.8.11 arasında yapılan çalışmalar ve mevcut kaynak davranışı.

Bu belgeyi başka bir yapay zekâya doğrudan gönderebilirsin. Buradaki açıklamalar mevcut kodun teknik haritasıdır; kaynak kodun tamamının kopyası değildir. Uygulama yapacak AI'a aşağıdaki kaynak dosyaları da vermek gerekir. Geçmiş talepler ile güncel davranış çelişirse bu belgedeki son durum ve mevcut kaynak kod esas alınmalıdır.

## 0. 1.8.11 — Okunabilir parkur, toplanabilir coin rotaları ve manzara çeşitliliği (güncel)

### İnceleme ve uygulama

- **Çakışmaların nedeni:** yaklaşan aracın gerçek doğum alanı `spawnX`, yalnız `homeX` üzerinden ayrılan phrase alanının dışına taşıyordu. Artık her grubun gerçek sağ sınırı ve aracın yaklaşma koridoru ayrılır. Analitik araç yolu, karşılaşmanın arkasında `motionMinX = homeX - minSpeed*.28` ile durur; önceki yapıya girmez. Pad/lav arasında en az 18 birim fiziksel boşluk da balistik yerleştirme sınırına eklendi.
- **Engel çeşitliliği:** 22-phrase seeded shuffle bag. `jumpSlide` ve `hopPair` eklendi. Son iki grubun hareket ailesi (launch/traffic/slide/fall/jump) hatırlanır ve torbada alternatif varsa farklı aile seçilir. Bu bir müzik beat-sync sistemi değildir; birbirini izleyen okunabilir hareket dizileri oluşturur. Torba sonunda elde yalnız aynı aile kaldığında tekrar mümkündür.
- **Coin sorununun nedeni:** değişken engellere rağmen eski sabit sinüs yayları kullanılıyordu. `jumpCoins` 715/1850 balistiğini, `padCoins` gerçek pad enerjisini ve karşılaşma anındaki tahmini hızı kullanır. Beam coinleri kayma açıklığına, basamak coinleri üst rotaya yerleştirilir. `validateCoins` düşen/bloklanan/bounce yapan engelin alanındaki coinleri eler. Coin sayısı/çarpanı arttırılmadı.
- **Hareketli araç coinleri:** araç instance'ına offset ile bağlanır, aynı dünya saatini takip eder. Magnet çekince bu bağ kopar. Toplama önceki/yeni relatif X ve oyuncu Y'si arasında swept kontrol kullanır; hızlı hareket küçük coin aralığını atlamaz. Rewind sırasında yeni coin alınmaz, alınmış coin ikinci kez para vermez.
- **Üst rotalar:** pad-chain artık sabit X koordinatları yerine üç ardışık balistik inişten üretilir. Platform üstü 200, genişliği tahmini hız×.65, orta platform kırılgandır; altı coin üç uçuşun üzerinde bulunur. Gravity-run testerelerinin arası `max(470, maxSpeed*(slideDuration+slideRecovery+.16))`; çıkış portalı son testereden sonra gelir. Böylece yüksek hızda ikinci testerede kayma hâlâ kilitli kalmaz. Basamak coin yüksekliği üst kot+BODY_H×.85 ile hem iniş hem koşu aralığında kalır.
- **Manzara:** mevcut dünya-konumlu tile cache korunur; 1150 birimlik seyrek/ormanlık/açık manzara bölgeleri, farklı ağaç ve tepe siluetleri, seyrek göl/şelale/viyadük/kule/büyük dağ/bulut kompozisyonları eklenir. Kemerler ve evler daha seyrek gelir. Aynı kısa motifin her birkaç metrede bir tekrarı azalır. Rastgelelik render içinde değil, dünya hücrelerinden deterministik hash ile üretilen cache içindedir.
- **Performans ve sözleşmeler:** 120 Hz fizik, 60 Hz 241×12 rewind, 48 engel/144 coin/112 parçacık havuzu, en fazla iki manzara teması korunur. Ek medya, 3D yükü, RAF, fizik kütüphanesi yok. Üretim zamanı küçük Set/array işlemleri vardır; her frame solver çalıştırılmaz. `game-runtime.js`, mevcut MP3, Steam/Pixel ve canlı site değiştirilmedi.

### Araştırma dayanakları

- [RobTop'un Geometry Dash açıklaması](https://store.steampowered.com/app/322170/): ritim temelli aksiyon/platform odağı. Burada örnek alınan şey okunabilir sıçra/kay dizileri ve net tepki pencereleri; görsel varlık veya bölüm kopyalanmadı.
- [Cloudberry Kingdom geliştiricisinin prosedürel bölüm yazısı](https://www.gamedeveloper.com/design/how-to-make-insane-procedural-platformer-levels): rastgelelikten önce geçilebilir yol ve kısıtlarla üretim yaklaşımı. Bu projede hız/ballistik/toparlanma alanı sınırlarına uyarlandı.
- [Sarkar ve arkadaşları, Desire Path-Inspired Procedural Placement of Coins in a Platformer Game (2018)](https://riffsircar.github.io/assets/pdfs/sarkar2018desire.pdf): coinleri oyuncu hareket rotalarına bağlama yaklaşımı. Burada kullanıcı telemetrisi toplanmadı; fiziksel olarak mümkün simülasyon rotaları kullanıldı. Makaleden oyuncu tutma artışı garantisi çıkarılmamalı.

### 1.8.11 doğrulaması

- `output/test-2d-1810.cjs`: 2.560 varyant kataloğu, 22'li torbalar; 2.304 normal eldiven rotası + 768 ice/bhop uç hız + 512 çekirdek phrase çifti = 3.584 geçilebilirlik senaryosu; 30/60/120 FPS, analitik rewind/pause, update/render içinde Math.random yasağı PASS.
- `output/test-2d-1811.cjs`: 1.440 çekirdek coin rotasında 3.690/3.690 coin; 144 üst/platform/gravity rotasında 666/666 coin, ölüm yok. Toplam 1.584 rota ve 4.356 coin. İlk üst rota denemesi sabit pad-chain coinlerinin hızlı koşuda kaçırıldığını ve gravity-run toparlanma sıkışmasını buldu; üretim geometrisi düzeltildi, test toleransı gevşetilmedi.
- 8 seed×180 saniye invulnerable lifecycle/occupancy probe, 14.400 görünür alan örneğinde 0 collider çakışması, en çok 16 aktif engel. Bu sağ kalma veya cihaz FPS testi değildir.
- 185 fizik/regresyon, 188 bhop/glide ve 189 manzara/cache/mobil testleri; native PLAY→lobi→2D→orijinal 3D Endless, sekiz eldiven, touch/RTL/wallet akışları PASS. Altı biyom/yüksek kamera/dört doğa konumu görselleri incelendi. Cache 60 bölüm probe'da en çok 2 tema/16 parça (~32 MiB RGBA); sabit sahnede yeni tile yok, çıkışta release.
- Aynı kaynak/ZIP/cache 1.8.11. QA dosyaları dağıtılmaz. Gerçek düşük güçlü telefonda FPS ve canlı Poki SDK testi yapılmadı; bütün olası insan girdilerinin başarı garantisi değildir.

## Önceki altyapı — 1.8.10 Prosedürel engel çeşitliliği ve güvenli kombinasyonlar

- Sabit12-slot sıra kaldırıldı.20-phrase shuffle bag; her torbada tüm phrase'ler bir kez, sınırda art arda aynı phrase yok. `spawnAhead()` içinde koşu başına yalnız bir `Math.random()` seed çağrısı vardır. `spawnSample(index,salt)` seeded hash ile bütün hız/geometri/faz/gecikmeleri üretim anında instance'a yazar. Update/render RNG kullanmaz; gelecekte üretilecek alan rewind boyunca aynı seed/index'i korur.
- On çekirdek türün tamamı varyantlıdır: block boy/en; car/motor boy/en/`.35–.65` yaklaşma katsayısı; beam açıklık/en; fall boy/en/başlangıç yüksekliği/`.5–.9s` uyarı; spinner boy/en/`±2–7rad/s` dönüş/faz/opsiyonel`8–20` sıçrama; lava/ice boy/en; train boy/en; pad en/`1060–1120` fırlatma enerjisi. Araç/pad/buz/spinner çizimleri gerçek collider ölçülerine uyar. Dönüş, düşüş ve lav dalgası `worldTime` kullanır.
- Karma phrase'ler: `beamJump` (kay→zıpla), `fallPair` (`.14–.30s` kademeli iki blok; gövdenin sığdığı cep ve ikisini aşan normal jump), `padMotor` (pad uçuşu sonrası yaklaşan motor), `wideLava` (360–620 aday en, balistik cap; herkes için pad). Eski üst platform/pad-chain/gravity/saw/eldiven mekanikleri korunur, sadece sıradaki yerleri değişir.
- Geçilebilirlik: sabit gravity1850/jump715/collider42/slide.8/recovery.18 korunur. Jump clearance süresi `2*sqrt(715²-2*1850*(hazardHeight+8))/1850`; normal genişlikler `minSpeed*clearTime-42-32` üst sınırına kırpılır. Spinner için en yüksek bounce kullanılır. Beam eni sonlu kayma ve24 birim toleransla sınırlandırılır. Pad'in yükseliş/iniş kökleri, minimum hız ve8s hız eğrisi büyümesi+max bhop+ice katsayılı maksimum hız ortak güvenli yatay aralığı belirler. Phrase sonları uçuş/iniş/toparlanma alanı ayırır; sıradaki incoming araç önceki fall grubunun içine rastgele konmaz. Uygulanan genişlik kırpmaları snapshot `generation.safetyClamps` sayacında görülebilir; bu hata değil güvenlik sınırı uygulamasıdır.
- Mevcut jump sabit715 impulse'tur; tuşu basılı tutarak yeni bir variable-height sistemi eklenmedi. Bu yüzden geniş lav zorunlu doubleJump/glide kapısı değildir: sağlanan pad ile normal eldiven de geçer. Sağlık1/coin ekonomisi/60Hz241×12 history/120Hz fizik/tek ana loop ve3D izolasyonu aynı kalır.
- Fall geçmişte frame-accumulated hareket ediyordu: artık `fallStart+stagger` olayı saklanır, `y=max(0,homeY-950*max(0,worldTime-fallStart-warningDuration)²)`. Araç `motionStart/vx`, spinner sinüs parametreleri de saklanır. Rewind aynı dünya saatindeki aynı pozları verir; pause dondurur, Frost aynı saati yavaşlatır. Spawn ufku `max(2800,width+1000)`,48-engel havuzu/3000-arkada tutulma/cache2 sınırları aynı.
- QA `output/test-2d-1810.cjs`:2.240 katalog,20 farklı shuffle bag,2.016 eldivensiz rota (14phrase×16seed×3hız×30/60/120FPS),672 ice+bhop uç hız rotası ve392 tüm çekirdek phrase-çifti =3.080 rota PASS. Analitik rewind/pause ve generation kapalıyken Math.random throw testi PASS.185physics/regression/native,186UI/MP3/SFX,188bhop/glide/input,189scenery testleri son kaynakta tekrar PASS. Official istemci `output/official-2d-1810-final`; screenshot/state/errors incelendi; yeni error artifact yok. QA botu uzaktaki beam yüzünden daha önceki zıplamayı yanlış baskılıyordu; yalnız test seçim mantığı düzeltildi, üretim güvenlik sınırları gevşetilmedi.
- Aynı standart web/Poki klasörü/ZIP/cache1.8.10; yeni medya/loader/fizik bağımlılığı/RAF yok. `game-runtime.js` SHA256 `4CBDF64F971410DB1640A575CF56C11EE689097843521D1E521CD53F5CB42A1D` korunur. Steam/Pixel/canlı site değişmez. Testler gerçek cihaz FPS garantisi veya bütün olası insan girdilerinin başarı garantisi değildir.

## Önceki altyapı — 1.8.9 Tekrarlamayan manzara ve yüksek zıplama kamerası

- Önceki2048px atlasın modulo sarılması kaldırıldı. Far/near katmanlar dünya konumundan deterministik1024×512 Canvas parçaları üretir. Global hücrelerde konum, boşluk, boy ve dekor seçimi değişir; aynı düzen kısa aralıklarla yeniden başlamaz. Biome motifleri korunur. Kenardaki nesneler iki parçaya aynı global koordinatlardan çizildiği için kesilmez;1px overlap altpiksel dikişini kapatır.
- Tema başına iki bounded Map (`far`,`near`); yalnız görünür parçalar, bir önceki ve bir sonraki tutulur. Sonraki parça önceden üretilir. Tema sayısı en fazla2; eski parçalarda canvas backing store1×1'e küçültülüp referans bırakılır. Rewind aynı konuma dönünce aynı parçayı yeniden üretir; sabit konumda çizim yeni canvas yaratmaz.
- Near katman kameraY'yi tam, far katman.18× izler; ufkun altındaki opak taban ekrana kadar uzanır. Portrait letterbox alanı da aynı çizime katılır; sabit zemin dolgusu yoktur. Kamera yüksekliği, jump/gravity, collider, üretim ritmi,120Hz simülasyon ve12-alan60Hz rewind değişmez. Yeni medya/loader/timer/RAF eklenmedi.
- QA `output/test-2d-189.cjs`:6 biome×normal/pad/çok yüksek kamera, eski2048px periyodunda farklı manzara, deterministik yeniden yapım, parça sınırı opaklık/biome fade,60 bölüm cache/disposal,30/60/120FPS gerçek pad/updraft ve mobil yatay/dikey görüntüler. Probe max2tema/16parça/8,388,608pixel (~32MiB RGBA backing store),120 sabit çizimde0 yeni parça; exit tümünü bırakır. Gerçek cihaz FPS garantisi değildir.
- Önceki185physics/regression/native,186UI/MP3/SFX,188bhop/glide/input testleri tekrarPASS. Official skill istemcisi `output/official-2d-189-final`, screenshot/JSON incelendi, yeni console/page error yok. Aynı kaynak/ZIP/cache1.8.9;3D runtime/Steam/Pixel/site değişmez. QA output dağıtılmaz.

## Önceki altyapı — 1.8.8 Bunnyhop ve yalnız Jump ile süzülme

- Bunnyhop bütün eldivenlerde: gerçek zemin/platform/tavan inişinden sonraki60ms içinde yeniden Jump → combo+1. 3D'nin60ms penceresi ve%1.8 puan/hop (cap%18) referanstır. Mevcut120ms jump buffer ile inişten hemen önce basmak da geçerlidir. İlk jump combo vermez, hava double-jump combo arttırmaz, yalnız basılı tutmak otomatik zıplatmaz.
- Hız `baseCurve * (1 + min(.10,combo*.02))`; normal450→800 eğrisi değişmez, en yüksek bonuslu hız880'dir. Puan bonusu yalnız yeni peak mesafesine uygulanır; coin spawn/değeri ve jump715 değişmez. Yerde60ms pencere kaçırılırsa combo sıfırlanır. Pad zorunlu fırlatması combo'yu keser: mevcut pad-chain rotalarının balistiği korunur. Ölüm/Prime hit ve reset combo'yu sıfırlar.
- Forest Guard: yalnız düşerken **Jump basılı tut → glide**, Jump bırak → anında normal gravity. `useSkill()` artık glide için hiçbir durum değiştirmez; Forest'ın E/touch skill düğmesi gizlidir. Jump ikonu aktif süzülmede yeşildir. Ayrı Glide binding/skill toggle yoktur.
- Klavye, çoklu touch ve gamepad girdileri source-bazlı `heldInputs` ile birleştirilir; bir tuşu/finger'ı bırakmak hâlâ basılı diğer Jump'ı kesmez ve yeni jump üretmez. Pointer cancel/lostcapture, gamepad disconnect, blur/pause/death/exit/reset input'u güvenle temizler. Fizik120Hz ve tek mevcut RAF aynıdır.
- Ring buffer artık `Float64Array(241*12)`: eski10 alan korunur, son iki alan `bhopCombo,bhopWindow`.60Hz kaydı; rewind örneklerinde combo/pencere ve çıkışta tam hedef durum geri yüklenir. Yeni zamanlayıcı, loader, asset veya fizik kütüphanesi yok. Compact `↗ ×N` HUD chip mevcut buff satırındadır.
- QA: `output/test-2d-188.cjs`:30/60/120FPS, alt/üst zemin bunnyhop, pre-landing buffer, pencere bitimi, bonus caps, Ember extra, pad normal balistiği, Forest hold/release/E no-op, keyboard alias/multi-touch/mixed-source/gamepad disconnect, pause/blur/death/exit,12-alan rewind/slow/slide cancel ve mobil UI sınırları. Güncel185 platform/saw/hazard/6×600s lifecycle,186MP3/SFX/UI ve native lobi→2D→3D regresyonları tekrar çalıştırılır. Basamak test botu bonuslu hızla üst merkezlere iniş için.5s yaklaşır; basamak üretimi değişmez.
- Aynı standart klasör/ZIP/cache1.8.8 güncellenir. Steam/Pixel/site/3D runtime değişmez. Official web-game istemcisi `output/official-2d-188-final`; QA dosyaları dağıtılmaz. Testler gerçek cihaz FPS veya canlı Poki SDK ölçümü değildir.

## Önceki altyapı — 1.8.7 orantılı UI, dar basamak ve 2D ses

- HUD: sol can, merkez ilerleme/mesafe, sağ altın/pause; aynı hizada grid. Üç kontrol eş boy kare, kayma solda/zıplama sağda/yetenek tam merkezde. Ortak responsive ölçek, safe-area, kısa/yatay/dar ekran kuralları; RTL dil desteği korunur, fiziksel kontrollerin yerleri değişmez. Global menü button margin-top etkisi 2D scope'unda sıfırlandı. Start/lobi butonları72×64, skill cooldown alt dolum çizgisi. Metin yığını eklenmedi.
- Basamak düzeltmesi (1.8.7): kullanıcının "incelt" isteği yatay genişliği azaltmaktır, kalınlığı azaltmak değildir. İnce asılı platform geri alındı: katı `stepBlock` yeniden y0'dan üst kota kadar dolu bloktur. Üst kotlar56/112/168/224/280, genişlik `pace*.35` (eski `pace*.5` değerinden%30 kısa), merkez aralığı yine `pace*.72`. Coin ve üstten landing/jump reset/yan lethal/ters gravity/rewind aynı. Varsayılan tek stepBlock140×56,y0. UI/müzik/SFX aynen1.8.6'daki gibidir.
- Kullanıcının MP3'ü birebir `assets/audio/runner2d-theme.mp3` olarak eklendi (90.52s, stereo44.1kHz/320kbps,3,623,750bytes). SHA256 `C68FB66C6C0686622E83C8FC3A3298DC70D247A46B10D25DB5ABD82B7A90BF57`. Yalnız2D girişinde metadata yüklenen tek tekrar kullanılan HTMLAudioElement; streaming/loop, başlangıç/retry0 saniye, pause/resume kaldığı yerden. 3D boot yüküne eklenmez ve büyük PCM buffer decode edilmez.
- `ElementalAudio.setRunner2DState(state,{restart})` müzik sahipliğini merkezi audio katmanında yönetir. Runner stateChanged önce bu API'yi çağırır; runtime'ın mevcut SDK/audio adapter'ı aynen kalır. 2D aktifken3D/lobi müziği ve procedural world ambience susturulur; playing'de yeni müzik, paused/dying/dead/exit/hidden/ad/mute durumlarında pause. Mevcut master/music ayarları uygulanır; mevcut updateMix ile kısa başlangıç fade'i, yeni render RAF/timer yok. Autoplay reddinde1s retry backoff, yeni kullanıcı etkileşiminde hemen yeniden deneme.
- `Runner2D.sound(kind)` → `ElementalAudio.playRunner2DSound(kind,skill)`: jump/slide/coin/pad/land/hit/pickup/crumble/break/gravity/revive ve ayrı Dash/Slow/Rewind/Void profilleri. Mevcut sfx/master gain üzerinden kısa WebAudio envelope+pitch/noise; önbellekte.25s noise,≤12 aktif voice, event rate limit, onended disconnect. Pause/dead/exit/hidden/ad/mute cleanup; dying sırasında kısa hit tail korunur. Audio modülü olmayan standalone testte eski api.sound fallback. 3D SFX ve save/SDK mantığı değişmez.

### 1.8.6–1.8.7 doğrulaması

- `output/test-2d-186.cjs`:1366×768/1920×1080,844×390/667×375,390×844/320×568; TR/EN/DE/AR; tüm HUD/control bounds, overlap yok, eş boy kontrol ve merkez skill, eş boy menu tuşları/scroll yok. MP3 gerçek browser playback/currentTime/volume/pause/resume/mute/ad/retry/exit; SFX analyser sinyali/12voice cap/onended cleanup;Dolu dar basamaklar+eski üst kotlar. Screenshotlar ayrıca açılıp incelendi.
- Önceki `test-2d-185.cjs`, `test-2d-185-regression.cjs`, `test-2d-185-integration.cjs` güncel kaynakla tekrar çalıştırılır. Son test native globalCSS pause hizasını ve2D müziğinin eski track'lerle çakışmamasını da denetler. Hareket/ölüm/ödül/8glove/lobi→orijinal3D Endless/mobile akışları korunur. Bu otomasyon gerçek telefonda ses kalitesi/FPS veya canlı Poki reklam testi değildir.
- 1.8.7: `test-2d-185.cjs` basamak testi5 authored seed×3 FPS×2 hız=30 rota,3/4/5 basamak çeşitleri; y0/dolu yükseklik/%30 dar genişlik/başarılı tüm inişler doğrulanır. Test botu dar basamağa göre .37s yaklaşma ve mevcut coyote hakkını kullanır; üretim fiziği değiştirilmez. `test-2d-186.cjs` güncel dolu blok beklentisiyle UI/audio lifecycle regresyonu; narrow-stairs screenshot ayrıca açılır.
- Kanonik standart kaynak/aynı ZIP/cache1.8.7; Steam/Pixel/site değişmez. `game-runtime.js` SHA256 aynı. Official develop-web-game istemcisi final artifact `output/official-2d-187-final`; QA output pakete girmez.

## Önceki altyapı — 1.8.5 ritmik basamaklar, yerçekimi, testere ve voxel

Bu sürüm `runner-2d.js` ve 2D portalının hologramı için `lobby-hub.js` üzerinde çalışır. `game-runtime.js`, 3D koşu fiziği, asset ve SDK kaynakları değişmez. Aşağıdaki kurallar tarihsel 1.8.3/1.8.4 platform, history ve ölüm sunumu notlarını günceller; hardcore tek-can/hız/ekonomi esası korunur.

- `stepBlock`: gerçek katı AABB; üstüne düşerken swept-feet ile snap, vy/jumps sıfırlama; yan yüzey temasında lethal hit. Üretim3–5 blok, artış56 yükseklik; tahmini hız `pace=min(800,speed+8)`, merkez aralığı `pace*.72`, genişlik `pace*.5`. Coin yalnız her basamağın üstünde1 adet (height+30); bu münhasırlık basamak dizisine aittir, diğer normal coin desenleri kaldırılmaz. Sonraki slot son bloğun kenarından `pace*1.15` uzakta.
- `gravityDir=+1` normal, `-1` ters. Y hâlâ **ayak ankrajıdır**: gövde y ile `y+gravityDir*h` arasındadır. İvme `-1850*gravityDir`, jump `715*gravityDir`; glide ve fast-fall da işarete duyarlıdır. Tavanda `support=-3`, yükseklik380. Normal/ters destek taraması aynı swept AABB algoritmasıdır.
- `gravityPortal` tam yükseklikte zararsız geçiş alanı; X çizgisini geçince hedef yön uygulanır. Gövde merkezi korunur, vy ters çevrilir; eski kayma/buffer/coyote temizlenir, havada bedava jump verilmez. İlk portal ters,2100 birim sonraki portal normal yapar; sonra1000 birim iniş alanı. Görünen tavan ilk portalın ceilingEnd alanından çizilir; ped zincirleri için global yükseklik sınırı eklenmez. Ters bölümde karşı zemin gövdenin yer altına geçmesini engeller ama jump resetlemez.
- Generator: her24 slotta i%24==11 bir çift-portal bölümü ve3 saw; i%12==9 tek saw. Diğer platform/crumble/pad/biome mekanikleri korunur. `saw.y=homeY+sin(worldTime*frequency+phase)*amplitude`; dönüş de worldTime kullanır. Varsayılan64×64,y108, amplitude80, frequency2.2–2.8; ters bölümde homeY205/amplitude70. Drawing ve AABB aynı64 çaplı alana oturur (köşelerde güvenli muhafazakâr AABB).
- History `Float64Array(241×10)`;60 Hz/120 Hz aynı. Son alan gravityDir. Rewind yalnız iki uç arasında düz çizgi çizmez: gerçek geçmiş örnekleri arasında distance/worldTime ve **gövde merkezini** interpolate eder, örneğin gravityDir yönünü uygular. Çıkışta vy/jumps/support/ice/bubble/coyote/gravity ve feet geri yüklenir. Portal event'i öncesine sarılınca usedAt resetlenir, tekrar ileri geçiş çalışır; saw aynı dünya saatinde aynı Y'ye döner. Obstacle recycle `max(x,homeX,ceilingEnd)<distance-3000`; en hızlı normal yeteneklerle2.5 s geçmiş objelerini tutar. Coin/peak/ödül geri verilmez.
- Fatal hit: ana cube hemen gizlenir,18 önceden ayrılmış mini-cube etkinleşir.150 ms hit-stop korunur; sonrasında650 ms analitik voxel balistiği (ilk240 ms shake) ve ardından .22 s mevcut UI giriş fade'i. Toplam dying=.8 s; fizik/worldTime/history/puan donuktur, yalnız deathClock ilerler. Prime kurtarmasında cube gizlenmez/voxel başlamaz. Voxel renkleri gövde ve glove accent; ayrı RAF/timer/GLB yok.
- Lobi 2D portalında eski yön rozeti yerine kayıtlı `elemental-run-2d-v1.distance` metre rekoru. Mevcut yerel `highScore` metni kullanılır. CanvasTexture/mesh/material mevcut resource set'te takip edilir; .25 s refresh ham JSON değişmediyse parse etmez, aynı label tekrar GPU upload yapmaz. Kayıt bozuk/engelli ise0m; bob/opacity ucuz transform/material değişimidir. Çıkış/yeniden girişte aynı-tab rekor güncellenir.

### 1.8.5 doğrulaması

- `output/test-2d-185.cjs`:30/60/120 Hz solid-top/yan lethal/ters underside/jump,6 başlangıç-tavan basamak rotası, çift portal/tavanda kayma-jump-cancel/karşı zemin sınırı,72 testere rotası (6 faz×3 FPS×2 hız×normal/ters), worldTime slow/pause/rewind/portal tekrar geçişi,10-alan history, voxel18/death frozen clocks/tek ödeme/retry/Prime.
- `output/test-2d-185-regression.cjs`: coyote/Ember/Frost/cancel, hız/dt/ekonomi,24 incoming+54 eski hazard rotası,6 pad chain, biome yetenekleri.6×600 s **invulnerable lifecycle/bellek probe**:6 biyom,40–42 gravity flip, aktif engel en çok14, parçacık en çok52, cache2. Bu probe sağ kalma veya gerçek cihaz FPS ölçümü değildir.
- `output/test-2d-185-integration.cjs`: native loading/PLAY→gerçek proximity2D, keyboard/pause/ölüm/cüzdan/retry/8 gerçek glove→exit→orijinal3D Endless; mobil touch/double-jump/cancel/death/retry/yatay/dikey/ArapçaRTL. Hologram1234m, bozuk save0m, texture/resource reuse ve görünürlük screenshot ile kontrol edilir. Console/page errors=[]. SDK mock'tur, canlı Inspector/gerçek düşük güç cihaz testi değildir.
- Resmî develop-web-game istemcisi `output/official-2d-185-final`: native PLAY→portal→2D jump/slide; son screenshot/JSON ayrıca açılıp incelenir. Yeni resim/GLB indirmesi, physics kütüphanesi veya ikinci render döngüsü yok.

## 0.1. 1.8.4 — Hardcore ritim ve ekonomi (önceki altyapı)

Bu güncelleme yalnız `runner-2d.js` oyun mantığına uygulanır; 3D runtime/asset/level/SDK kaynakları değişmez. Aşağıdaki güncel kurallar eski üç-can/kalkan/yoğun-coin notlarının yerini alır. Mevcut kanonik klasör ve dağıtım ZIP'i kullanılır; Steam/Pixel/canlı site değiştirilmez.

- Başlangıç ve maksimum can tam1. Hasarlı temas doğrudan `dying` durumuna geçer. Heal ve shield pickup üretimi/etkisi/UI kaldırıldı; gerçek hasarı tek kez kurtarabilen tek mekanizma Elemental Prime revive (1 can +3 s güvenli ayrılma süresi). Phase/Dash/Rewind'in mevcut hasar önleyici yetenekleri korunur.
- Hız `450 + 350*(1-exp(-elapsed/85))`:450 başlangıç,800 asimptotik tavan. Normal slotlar480/528/576; stairs1536, padChain2304, pad-train ve breakWall1248. Yaklaşan car/motor başlangıç hızı `-speed*.40`; konum yine worldTime'dan hesaplanır.
- Coin: normal slotların üçte biri boş, kalanlarda2–3 coin (90 birim aralık); pad-train ve wall yayı4 (120/130 aralık), stairs toplam5, üçlü pad chain toplam6 (280 aralık). Önceki normal7/pad10/stairs19/chain24 yerine bu değerler geçerlidir. Mevcut cüzdan/coin çarpanı ve duplicate-bank koruması değişmedi. Yalnız8 s magnet pickup kalır; i%12==6, X=slot-260,Y90.
- `coyoteTime=.12`: platformdan ayrıldıktan sonra120 ms dünya/hareket zamanı içinde normal jump kabul edilir. Zıplama/pad/updraft bu hakkı tüketir; yeniden iniş sıfırlar. Edge jump ilk hak sayılır, Ember'ın ikinci hakkını tüketmez. Frost süreyi hareketle aynı .32 ölçekte ilerletir.
- Jump input'u aynı olayda `slide/slidePose/slideRecovery/slideBuffer=0` yapar ve vy715 verir. Sonlu .8 s kayma, tuşu bırakıp yeniden basma ve havada hızlı düşüş korunur. Hardcore ardışık jump sıralarında fast-fall + landing skid → jump-cancel kullanılabilir.
- Ölüm:150 ms hit-stop, ardından240 ms13 birimden sönen Canvas shake, sonra `dead` sonuç UI ve settlement. `dying` boyunca fizik/distance/elapsed/worldTime/score/history donuktur; yalnız sunum saati ilerler. Jump/retry/pause bu pencereyi atlatamaz. Hidden tab sunum saatini de durdurur; reduced-motion sarsıntı ofsetini çizmez. SDK oynanış sayacı `dying` girişinde mevcut stateChanged köprüsüyle durur.
- History `Float64Array(241×9)`: eski8 alana coyoteTime eklendi;60 Hz kayıt/120 Hz fizik/tek RAF aynı. Rewind çıkışında coyote hakkı da kayıttan döner. Snapshot worldTime/maxHealth/coyoteTime/death.phase/death.remaining/reviveUsed bildirir.
- Artan hız son pad-chain inişini aştırıyordu: son platform X=slot+1570,w720 (eski+1510,w420) olarak yeni450–800 balistik aralığına göre düzeltildi. Diğer görseller ve glove/model çizimleri korunur. Yeni medya, fizik kütüphanesi, timer veya RAF eklenmedi.

### 1.8.4 doğrulaması

- `output/test-2d-184.cjs`: tek vuruş/revive/ikinci ölüm,150 ms donma→240 ms shake→UI, frozen history/world/score/hidden tab/input engeli/tekil banka/retry;30/60/120 Hz kaymadan anında jump; coyote geçerli/expired/Ember/Frost ve9-alan rewind;144 slot ekonomi taraması;24 incoming+54 hazard rotası;6 pad chain; biome/glove etkileşimleri.
- Aynı test:30/60/120 Hz × başlangıç/tavan hız profili ile6 adet600 s normal-skill koşusu. Bot jump/slide/fast-fall kullanır; invulnerability veya shield verilmez. Her biri health1,6 biome, cache≤2, obstacle<48, particle≤112. Bu hızlandırılmış mantık simülasyonudur, gerçek cihazda10 dakika FPS ölçümü değildir.
- `output/test-2d-184-integration.cjs`: gerçek boot PLAY/lobi proximity portal, merkezi keyboard/pause/slide-jump, gerçek collision/ölüm/cüzdan/retry,8 kayıtlı glove, exit→orijinal3D Endless. Mobil tarayıcı emülasyonu:touch/double jump/pointercancel/pause/death/retry/bank/yatay/dikey/Arapça RTL.
- Resmî develop-web-game istemcisi native PLAY→portal→2D input akışını çalıştırır; ekran görüntüleri ve JSON state açılıp incelenir. SDK QA'da mock'tur. Gerçek düşük güçlü cihaz ve canlı Inspector testi yapılmadı.

## 0.2. 1.8.3 — dikey rotalar, platformlar ve yeni etkileşimler (önceki altyapı)

11 Ekim 2026'da yalnız `runner-2d.js` oyun mantığı geliştirildi; `game-runtime.js` hiçbir şekilde değiştirilmedi. HTML/build/service-worker sürüm sınırı 1.8.3 oldu. Yeni asset/GLB/harici fizik motoru/RAF eklenmedi. Aşağıdaki eklemeler, eski 1.8.2 davranışını açıkça günceller:

### Solid-top ve destek durumu

- `solidTop`: block, platform, crumblingBlock, icePlatform. `topOnly`: son üçü. Asılı platformların altından/yukarı içinden geçilebilir; normal ground block yan çarpışması hâlâ hasar verir.
- `resolveSupport(previousX, previousY, wasGrounded)` düşen ayağın üst yüzeyi geçtiği zamanı süpürme/interpolasyonla hesaplar, o anda ve güncel X'te yatay overlap arar; en yüksek geçerli desteği seçer. Ayak üst yüzeye snap olur; vy/jumps sıfırlanır.
- `grounded` ve `support`: -1 ana zemin, -2 havada, >=0 engel havuz indeksi. Jump, kayma, fast-fall, iniş tamponları ve görsel koşu platform üstünde de çalışır. Kenardan çıkınca jump sayısı en az1 olur: normal eldiven bedava hava zıplaması kazanmaz, Ember ikinci zıplamasını yapabilir.
- Temel fizik hâlâ 120 Hz; history kayıt aralığı hâlâ 60 Hz. Ağır iniş vy<-760 ise kısa kamera sarsıntısı tetiklenir. Kamera kozmetik exponential damping ile `max(0,y-225)` yüksekliğini izler.

### Yeni türler ve üretim

| Tür | Varsayılan w/h/y | İşlev |
|---|---|---|
| platform | 250/24/76 | Tek yönlü, üst yüzeyi100 yüksekliğinde ledge |
| crumblingBlock | 230/28/172 | Üst yüzeyi200; ilk inişten1 dünya saniyesi sonra kırılır |
| icePlatform | 280/26/74 | Üst yüzeyi100; inişte .8 dünya saniyesi boyunca1.22× ileri hız |
| breakWall | 42/180/0 | Normal temas hasar; Neon airDash sırasında cam duvar parçalanır |
| updraft | 150/300/0 | Forest glide aktifken (jumpHeld) temas en az980 yukarı hız verir |
| geyser | 82/116/0 | Lav biyomuna özgü1.5 s uyarı; ardından .85 s yükselen/alçalan lav sütunu |
| waterBubble | 190/210/70 | Su biyomunda temas yerçekimini .3× yapar; çıkıştan .25 s sonra biter |

- Her12 slotta bir üst rota: dönüşümlü `stairs` ve `padChain`. Stair x/x+350/x+700: y100/y200/y200 üst yüzeyleri, geniş platformlar ve üstte coin. Alt yol açık, bir küçük block riski vardır.
- Pad chain: ground pad(x-120), platform(x+260), elevated pad(x+375,y200), crumble(x+850), pad(x+995,y200), platform(x+1510). Pad fırlatma enerjisi bulunduğu yüzey yüksekliğine göre hesaplanır; bütün eldivenlerle zincir çalışır. Zincir platformları otomatik olarak pad'e götürür.
- Biyoma özel alanlar slot i%12==7'de: Snow icePlatform / Lava geyser / Water waterBubble / diğerlerinde updraft. i%24==20'de breakWall vardır; 250 birim önünde herkesin kullanabileceği ground pad sunulur. Normal eldiven için geçilemez zorunlu bir ability kapısı yoktur.
- Araba, motor, düşen engel, spinner, asılı kiriş, lav/buz zemin ve eski pad-tren üretimi korunur. Yeni pattern'ler bütün motor/düşen engel slotlarını yanlışlıkla değiştirmez.
- Geyser yaklaşık2 s varış mesafesinde silahlanır. Görsel lav yüksekliği ile collider yüksekliği aynıdır. Normal jump rotası başlangıç ve son hızda 30/60/120 Hz test edilmiştir.
- Engel havuzu48 (önceden32); coin144/pickup24/particle112/cache2 sınırları aynı. Upper slot aralıkları stair1824 / chain2496 / glass-wall1440; normal672/768/864 ve pad-tren1344 korunur.

### Geri sarma, saatler ve görsel tepki

- History `Float64Array(241×8)` oldu: distance, y, vy, worldTime, jumps, support, iceUntil, bubbleUntil. Aktivasyon/150 örnek hedef/.6 s yürütme/14 s cooldown aynı.
- Geri sarmanın çıkışında kayıttaki vy, jump sayısı, platform desteği ve iki çevresel buff süresi geri yüklenir. Oynatılırken çarpışma/alan/pad tetikleri çalışmaz. Pause bütün dünya saatlerini dondurur.
- `crumbleAt`, `breakAt`, `usedAt`, `boostAt`, `triggerAt` worldTime olay zamanlarıdır. Rewind olayın öncesine geçince gelecek olay iptal edilir; duvar kendiliğinden tekrar kırılmaz, pad yeniden kullanılabilir. Önceden kırılmış platforma geçmişte destek olarak tekrar basılabilir.
- `screenShake(duration,intensity)` hasar/sert iniş/dash/kırılan cam için bounded rastlantısal çizim ofseti verir; mantıksal koordinatları değiştirmez. Azaltılmış hareket tercihinde sarsıntı çizilmez.
- Hız>455, hızlı düşüş, aktif skill, buz boost veya aktif Forest glide sırasında eldiven accent rengiyle küçük fading trail oluşur. Trail aynı112 parçacık havuzunu kullanır; yeni timer/obje dizisi/filter yoktur.
- Crumble yüzeyinde çatlaklar ve küçülen ince süre çizgisi, ice üstünde ileri chevron, geyser için yazısız uyarı halkası, cam duvarda kırık çizgileri, bubble/updraft için transparan alan ipuçları vardır. HUD'a yeni metin kalabalığı eklenmedi.

### 1.8.3 doğrulaması

- `output/test-2d-183.cjs`: solid-top, alttan yukarı geçiş/yan hasar,6 stairs+6 pad-chain rotası, crumble pause/kırılma, duvar/glide/bubble/ice etkileşimleri,30 normal eldiven engel rotası,1.5 s geyser, platforma grounded rewind,600 s sınırlı havuz/cache koşusu. 600 s probe invulnerability kullanır ve sağ kalma/FPS benchmark'ı değildir; maksimum aktif engel10, parçacık≤112, cache2, finite durumlar.
- `output/test-2d-183-integration.cjs`: gerçek proximity portalı, keyboard/pause/death/retry/cüzdan8 skill,30/60/120Hz,155 s altı biyom sağ kalma koşusu (can3), çıkış→orijinal3D Endless. Runtime test interception sadece tarayıcı fixture'ıdır; kaynak dosyaya yazılmaz.
- `output/test-2d-mobile.cjs`: dokunma, finite slide, double jump, pointercancel, pause, portrait/landscape, Arapça ve bütün yereller, rewind/phase/boost/save tekrar PASS.
- `output/test-2d-183-legacy.cjs`: önceki1.8.2 testinin yeni üst/alan rotalarını tanıyan bot fixture'ı;24 incoming car/motor FPS/hız/Frost rotası, pause/rewind araç konumu,4 slide pose, canvas tap/etiketler ve600 s altı biyom normal-skill koşusu PASS (can3,51 hareketli araç,cache2). Bu sağ kalma testinde invulnerability veya shield kullanılmaz. Kaynak gameplay yalnız test geçsin diye değiştirilmedi.
- Resmî develop-web-game Playwright istemcisi native PLAY→lobi portalı→2D input akışını tekrar çalıştırdı; yeni upper/snow/lava/water ve mobile görselleri açılarak incelendi. Mock SDK kullanılır; gerçek düşük güçlü telefon veya canlı Inspector FPS garantisi değildir.

## 1. Proje ve doğru çalışma klasörü

- Kanonik standart web/Poki kaynağı: `C:/Users/Pc/Desktop/ELEMENTAL RUN Browser v1.3 relaeses 2/ELEMENTAL RUN Poki v1.5.0/`
- Klasör adı eski v1.5.0 etiketini taşır; gerçek sürüm `BUILD.json` içinde 1.8.9'dur.
- Aynı klasör üzerinden geliştirme yapılır. Her düzenlemede yeni oyun klasörü oluşturulmaz.
- Mevcut dağıtım: üst klasörde `ELEMENTAL RUN Poki v1.5.0.zip`.
- Eski Electron çalışma dizini `ELEMENTAL RUN-win32-x64 v1.2` bu modun güncel kaynağı değildir.
- Steam ve Pixel Art ayrı varyantlardır. 2D çalışmaları standart web/Poki kaynağında yapılmıştır.
- Yerel kaynak ve ZIP güncellemesi internet sitesini otomatik güncellemez. 1.8.2/1.8.3 çalışmaları sırasında canlı site yayını yapılmadı.

## 2. Kullanıcı isteği ve tasarım kararları

Kullanıcı önce oyunun ayrıntılı bir 2D versiyonunu, yukarıdan gelen ve yukarıda sabit duran engelleri ve bunun için ayrı bir lobi portalını istedi. Sonrasında sonlu kayma, uygun mevcut engellerin çeşitlendirilmesi, ayrıntılı arka planlar, kalkanlar ve jump padler istendi. Son talepte oyuncuya doğru gelen engeller, gerçek kayma animasyonu, daha az yazılı UI ve Geometry Dash benzeri ritmik bir akış istendi.

Uygulanan tasarım:

- Yandan görülen, otomatik ileri koşan ayrı bir 2D mod.
- Zıplama, kayma, yetenek, tek can, altın, puan, rekor.
- Altı biyom arasında devam eden koşu; 3D kampanyanın seviye/medal sistemi bu moda aktarılmadı.
- Tanınır araç ve engel siluetleri, 2D Canvas çizimleriyle uyarlanır.
- 3D GLB dosyaları 2D sahnede çizilmez. “Mevcut engelleri kullanma” uygulaması, onların görsel dilini ve işlevini 2D karşılıklarına taşımaktır.
- Geçilemez tam yükseklikte düz duvar bulunmaz.
- Son sürüm sade, ikon ağırlıklı, tepkisel ve ritmik bir parkurdur. Müziğe beat senkronizasyonu veya Geometry Dash'in birebir kopyası uygulanmadı.

## 3. Dosya ve sorumluluk haritası

| Dosya | 2D moddaki görevi |
|---|---|
| `runner-2d.js` | Canvas çizimi, fizik, state, engeller, biyomlar, oyuncu animasyonu, yetenekler, kayıt, input, HUD verileri |
| `runner-2d.css` | HUD, hazır/pause/sonuç kartı, ikon düğmeler, responsive ve mobil düzen |
| `game-runtime.js` | Oluşturma/giriş, ana loop, input yönlendirme, cüzdan/görev/ses/SDK köprüleri, lobiye dönüş |
| `lobby-hub.js` | 2D RUN portalı, proximity/click, kamera geçişi, portal rengi |
| `game-localization.js` | Ortak yereller, eldiven yetenekleri, 2D metinleri |
| `index.html` | 2D JS ve CSS yükleme, sürüm query parametreleri |
| `audio-system.js` | Paylaşılan mixer,2D owner state,streamed MP3 ve bounded2D SFX; runtime adapter korunur |
| `poki-bridge.js`, `poki-platform.js`, `platform-adapter.js` | Platform SDK yaşam döngüsü; mevcut ortak katman kullanılır |
| `lobby-rewards.js`, `fortune-wheel.js` | Aktif süre/çark sayaçlarına runtime bağlantısı |
| `BUILD.json`, `service-worker.js` | Sürüm ve cache sınırı |
| `PROJECT_CONTEXT.md`, `progress.md` | Genel mimari ve kronolojik kayıt |

Satır numaraları değişebileceği için kodu şu sembollerle bul:

- `window.ElementalRunner2D`, `class Runner2D`
- `ensureRunner2D()`, `startRunner2D()`, `stepGame(delta)`
- `runner2D?.active`, `runner2D.snapshot()`
- `buildPortal('runner2d', ...)`, `transition(mode)`

## 4. Mimari ve izolasyon

- `runner-2d.js` IIFE içinde sınıfı `window.ElementalRunner2D` olarak yayınlar.
- Tek instance runtime tarafından ihtiyaç olduğunda oluşturulur ve sonraki girişlerde yeniden kullanılır.
- Render Canvas2D'dir; yeni WebGL scene, fizik motoru veya ikinci requestAnimationFrame oluşturulmaz.
- Mevcut ana loop, 2D aktifken `runner2D.update(delta)` çağırır ve 3D simülasyon/render kısmına girmeden döner.
- Canvas context `alpha:false` ile açılır.
- Mantıksal koordinatlar: +X ileri, +Y zeminden yukarı. Oyuncunun dünya X'i `distance` olur; ekrandaki oyuncu X'i sabittir.
- Ekran konumu: `screenX = px + object.x - distance`.
- 3D curved-world shader, CPU çarpışması, viewmodel el bölme/geometri veya Layer 1 rendering 2D mekaniğinde kullanılmaz.
- 3D eller ve hayalet yarışmacılar 2D girişinde gizlenir/durdurulur.
- 2D CSS body'ye eklenen `runner-2d-active` sınıfıyla 3D canvas, lobi HUD ve 3D mobil kontrollerini gizler.

## 5. Lobi portalı ve giriş/çıkış akışı

- Üçüncü portal kimliği: `runner2d`; başlık: `2D RUN`.
- Renk: mercan `#e99e85`.
- Ped merkezi: X=25, Z=-29.8. Portal yüzeyi yaklaşık Z=-31.25.
- Başlık ve yüksek skor hologramı da click hedefidir; mevcut proximity sistemiyle yürüyerek de girilir.
- Ortak lobi kamera geçişi yaklaşık .8 saniye sürer.
- Bu modun prepare kolu `ensureRunner2D()` çağırır; 3D seviye asset hazırlığına girmez.
- Start kolu `startRunner2D()` çağırır; açık menüleri kapatır, 3D skill/input state'ini temizler, handoff'u temizler ve `enter()` yapar.
- 2D mod pointer lock istemez; mevcut kilit girişte serbest bırakılır.
- İlk 2D ekran `ready` durumudur. Oynat ikonuyla veya ilgili klavye/gamepad girdisiyle koşu başlar.
- Lobi ikonunda `exit()`: kazanımları settle eder, 2D fullscreen açıksa çıkar, canvas'ı gizler, cache referanslarını bırakır ve ortak lobi dönüşünü çağırır.
- Lobiye dönüş mevcut mouse kilidi politikasını kullanır.

## 6. State ve yaşam döngüsü

`inactive → ready → playing ↔ paused; playing → dying (.15 s stop + .65 s voxel burst, ilk .24 s shake) → dead → playing veya inactive`

| Metot | Davranış |
|---|---|
| `enter()` | Seçili eldiven/yerel/mobil durumunu alır, reset/resize yapar, ready gösterir |
| `reset()` | Koşu, fizik, history, buff, cooldown, input ve pool state'lerini temizler |
| `begin()` | Yalnız ready/dead'den yeni koşu; dying penceresini atlatamaz |
| `pause()` | Tuş/pointer basılı durumlarını ve accumulator'ı temizler, overlay açar |
| `resume()` | Aynı koşuya döner; canvas'a focus verir |
| `settle()` | Rekor ve artımlı altın aktarımı; tekrar çağrı duplicate ödeme yaratmaz |
| `exit()` | Settle, inactive, gizleme, cache bırakma ve lobiye dönüş |

- Tab gizlenince veya pencere focus kaybedince koşu pause olur.
- Geri dönüşte pause ekranından açık devam girdisi gerekir.
- Runtime gamepad-disconnect ve pointer-lock olaylarında 2D için özel yönlendirme içerir.
- `pagehide` pause ve settle çağırır.
- Instance/DOM/listener'lar uygulama ömrü boyunca tutulur; her girişte yeni listener biriktirilmez. Ayrı bir destroy API'si yoktur.

## 7. Simülasyon, fizik ve çarpışma değerleri

| Parametre | Güncel değer |
|---|---|
| Sabit fizik adımı | 1/120 s |
| Frame delta üst sınırı | .1 s |
| Bir update'teki alt-adım sınırı | 12 |
| Yerçekimi ivmesi | -1850 × gravityDir |
| Normal zıplama başlangıç hızı | 715 × gravityDir |
| Oyuncu mantıksal genişliği/yüksekliği | 42 / 62 |
| Kayma collider yüksekliği | 29 |
| Kayma süresi / toparlanma | .8 s / .18 s |
| Jump buffer | .12 s |
| Havadan kayma tamponu | .28 s |
| Havada aşağı girdisinin hızlı düşüşü | vy × gravityDir en fazla -650 |
| Başlangıç / yaklaşılmış maksimum hız | 450 / 800 |
| Hız formülü | 450 + 350 × (1 - exp(-elapsed/85)) |
| Başlangıç canı / maksimum can | 1 / 1 |
| Coyote time | .12 dünya saniyesi |
| Ölüm hit-stop / voxel burst / ilk shake | .15 s / .65 s / .24 s |
| Biyom uzunluğu | 9000 dünya birimi = 900 gösterilen metre |

- Gösterilen mesafe `floor(peak / 10)` olur.
- Çarpışma hafif eksen hizalı overlap kontrolüdür, fizik motoru yoktur.
- X eşiği `abs(dx) < (obstacleWidth + BODY_W)/2 - 5`.
- Y kontrolü collider üst/altına küçük toleranslar uygular.
- Kayma collider'ı yalnız aktif kayma ve geçerli zemin/platform desteğinde küçülür.
- Vurulmuş engel aynı koşuda yeniden can düşürmez.
- Zıplama kaymayı ve görsel slidePose'u aynı input olayında sıfırlar; toparlanma beklemez.

## 8. Sonlu kayma ve gerçek kayma animasyonu

- Basılı tutma sonsuz crouch yaratmaz. Yeni kayma için bırakıp yeniden basmak gerekir.
- Yerde basış .8 s kayma başlatır; ardından .18 s toparlanma gelir.
- Havada basış hızlı düşüş ve kısa iniş tamponu verir.
- Fiziksel kayma ile kozmetik `slidePose` ayrıdır.
- Pose giriş/çıkışı exponential delta-time damping kullanır: giriş hızı32, çıkış22.
- Gövde yüksekliği52→30, genişliği44→36 görsel birim; aniden ince düz kutuya dönüşmez.
- Gövde yaklaşık -.25 rad geriye yaslanır, ayaklar öne uzanır.
- Arka el yere destek olur, ön el öndeki dize yaklaşır.
- Kayışta hız çizgileri ve daha sık toz çıkar; kalkış yumuşaktır.
- Kayma düğmesinin alt çizgisi kalan kayma süresini gösterir.
- Görsel interpolasyon fizik süresini uzatmaz.

## 9. Engel çeşitleri ve parkur üretimi

Boyutlar mantıksal dünya birimleridir; Y engelin zeminden alt kenar yüksekliğidir.

| Tür | Genişlik | Yükseklik | Y | Geçiş |
|---|---:|---:|---:|---|
| block | 78 | 48 | 0 | Normal zıpla; sarı-siyah bariyer |
| car | 120 | 58 | 0 | Zıpla; sabit ve yaklaşan varyant |
| motor | 80 | 48 | 0 | Zıpla; yaklaşan varyant |
| beam | 154 | 90 | 43 | Altından kay; zincirli sabit üst kiriş |
| fall | 70 | 54 | Başlangıç470 | Uyarıyla düşen kırmızı engel |
| spinner | 68 | 60 | 0 | Zıpla; dönen alçak engel |
| lava | 150 | 14 | 0 | Zıpla |
| ice | 116 | 40 | 0 | Zıpla |
| train | 180 | 108 | 0 | Önündeki jump pad ile geç |
| pad | 92 | 12 | 0 | Otomatik fırlatır; zarar vermez |
| stepBlock | pace×.35 | j×56 | 0 | Üstüne iniş güvenli, yan yüzü lethal |
| gravityPortal | 46 | 380 | 0 | Çift portal; gravityDir ters/normal |
| saw | 64 | 64 | homeY + sin(worldTime×frequency+phase)×amplitude | Havada hareketli; jump/slide zamanla |

Tablodaki çekirdek ölçüler `addObstacle()` varsayılanlarıdır; üretim bölüm0'daki aralıklarda varyant oluşturur. Güncel 22-phrase bag:

`block, beam, carIn, fall, pad, motorIn, lava, ice, spinner, car, beamJump, jumpSlide, hopPair, fallPair, padMotor, wideLava, stairs, padChain, gravityRun, breakWall, field, saw`

- `carIn/motorIn` üretimde car/motor + incoming bayrağına çevrilir. Torba seeded karışır; modülo-sabit sıra yoktur.
- `field`: kar biyomunda icePlatform, lavda geyser, suda waterBubble, diğerlerinde updraft.
- İlk engel X=1400. Ufuk `distance + max(2800,logicalWidth+1000)`; encounter görünür olmadan oluşur.
- Slot aralığı artık gerçek phrase sonu +100+`maxSpeed*(.22–.40)`; phrase içinde uçuş/toparlanma bütçesi ayrılır. Sabit480/528/576 yoktur.
- Tren her zaman pad ile eşlenir; konumu ve maksimum eni normal eldivenin güvenli balistik aralığından hesaplanır. Pad-chain 1080 enerjisi korunur; platform konumları artık karşılaşma hızına göre balistik hesaplanır.
- Tekil slotların yaklaşık üçte biri coin içermez, kalanları 2–3; beamJump2/jumpSlide3/hopPair2/fallPair2/pad4/stairs3–5/chain6. Alan doğrulaması tehlikeli coinleri kaldırabilir. Pickup yaklaşık %8.5 phrase olasılıklı magnet; X=slot-260,Y90. Heal/shield yoktur.
- Pool doluysa güvenli şekilde üretim durur; sınırsız yeni nesne oluşturulmaz.
- Engeller rewind penceresine yetecek kadar tutulur; `max(x,homeX,ceilingEnd) < distance-3000` olunca recycle edilir. Tavan bölümünün kaynağı erken bırakılmaz.
- Coin/pickup arka recycle mesafesi1350.

### Yaklaşan engeller

- Katsayı üretim anında `.35–.65`; `vx=-spawnSpeed*speedMod` instance üzerinde sabittir, her frame yeniden atanmaz.
- `activationDistance=max(900,maxSpeed*1.35)`; `spawnX=homeX+speedMod*activationDistance`. Karşılaşma slotunu önceki phrase'den ayrı tutan yaklaşma payı.
- Home konumu activationDistance içine girdiğinde `motionStart` bir kez kaydedilir; rewind bu timestamp'i korur.
- Konum `max(motionMinX, spawnX + vx × max(0, worldTime-motionStart))` ile hesaplanır. Üretilen aracın alt sınırı karşılaşmanın arkasındadır; manuel test instance'ında varsayılan -Infinity.
- Birikimli mesh offset'i yerine dünya saati kullanıldığı için pause/Frost/rewind tutarlıdır.
- Pause dünya saatini durdurur; Frost .32 hızla ilerletir.
- Araç arkasındaki küçük çizgiler hareketi anlatır; aynı araç çizimi korunur.

### Düşen engeller ve ped

- Fall warning `.5–.9s`, başlangıç Y420–510. Trigger lead=warning+ballisticDropTime+.65; ikilide ikinci bloğun`.14–.30s` stagger'ı da ayrılır.
- `fallStart` timestamp'i korunur; warning/drop analitik worldTime fonksiyonudur.1900 düşüş ivmesi, zemin çarpmasında bir kez parçacık/ses.
- Ped yakalama alanı normal zıplayan oyuncuyu da Y<155 iken yakalar.
- Fırlatma hızı `sqrt(max(0,launchVelocity²-2×1850*max(0,currentY-padY)))`; yeni ground pad1060–1120, authored elevated chain1080. Hazard yerleşimi bu per-instance enerjiyle hesaplanır.
- Böylece ped öncesi zıplama oyuncuyu ekran dışına fırlatmaz.
- Rewind ile yeterince geri dönülen kullanılmış ped yeniden kullanılabilir.

## 10. Pickup, hasar ve can kurtarma

- Hasarlı temas1 canı sıfırlar; normal hit kurtarma süresi yoktur. Shield pickup/absorption kaldırıldı.
- Magnet pickup:8 s,230 birim yarıçaptan altın çeker.
- Heal pickup kaldırıldı. Başlangıç/maksimum can1.
- Eldiven magnet etkisi ile pickup magnet ayrı sayaçlardır.
- Rewind sırasında pickup tekrar toplama yapılmaz.
- Toplanan altın/pickup state'i geri sarılıp çoğaltılmaz.
- Phase Shift, Air Dash ve aktif rewind hasarı engeller.
- Elemental Prime ölümcül darbeyi koşu başına bir kez1 can ve3 s bağışıklıkla kurtarır.

## 11. Eldivenlerin 2D karşılıkları

Seçili eldiven lobi/ortak kayıt üzerinden girişte alınır. 2D kendi cooldown/effect state'ini tutar.

| Eldiven | Skill kimliği | 2D davranış |
|---|---|---|
| Stone Hands | yok | Normal jump/slide |
| Ember Grip | doubleJump | Havada ikinci tam715 hızında zıplama; normal inişte hak yenilenir |
| Frost Weave | timeSlow | 2.2 s dünya yavaşlatma, ölçek.32; cooldown12 s |
| Forest Guard | glide | Yalnız düşerken Jump basılıysa yerçekimi×.15, göreli düşüş en fazla-100; bırakınca normal gravity. E/skill toggle yok |
| Neon Pulse | airDash | .35 s ileri hız×1.7, vy=0, hasar bağışıklığı; cooldown7 s |
| Tidebreaker | timeRewind | Yaklaşık2.5 s önceki konuma .6 s geri sarma; cooldown14 s |
| Solar Forge | magnet | 6 s altın çekme; cooldown12 s |
| Void Walker | phaseShift | 3 s geçilmezlik/hasar bağışıklığı; opacity yaklaşık.48; cooldown12 s |
| Elemental Prime | revive | Otomatik, koşu başına bir kurtarma; manuel skill çağrısı gerekmez |

Frost'un 2D karşılığı tam durdurma değil yavaşlatmadır. 3D skill spesifikasyonlarını otomatik olarak 2D'ye aynı fizik değerleriyle uygulama.

### Rewind ayrıntısı

- `Float64Array(241×12)` ring buffer (1.8.8).
- 60 Hz kayıt: distance, y, vy, worldTime, jumps, support, iceUntil, bubbleUntil, coyoteTime, gravityDir, bhopCombo, bhopWindow.
- En fazla240 geçerli örnek tutulur; aktivasyon için en az60 gerekir.
- Hedef en fazla150 örnek, yani yaklaşık2.5 s geridir.
- Yürütmede gerçek geçmiş örnekleri arasında X/worldTime/gövde merkezi interpolate edilir; örnek yönünden feet hesaplanır, vy sıfırlanır.
- Çıkış hızı, jump sayısı, zemin/tavan/platform desteği, ice/bubble, coyote, gravityDir ve bunnyhop combo/pencere geçmişi geri yüklenir. Fiziksel Jump basılı durumu geçmişten restore edilmez; mevcut gerçek girdi belirler.
- Bittiğinde history örnek sayacı temizlenir; kayıtlı hareket durumu kullanılır.
- Peak mesafe, kazanılmış puan, altın ve tüketilmiş pickup geri alınmaz.
- Hareketli araçlar aynı dünya saatiyle geriye gider. Düşen engel ve bütün oyun state'i için tam olay geçmişi playback'i uygulanmış değildir.

## 12. Kontroller

| Girdi | İşlev |
|---|---|
| Space / W / ↑ | Zıpla; Forest Guard ile düşerken basılı tutarak süzül, bırakınca iptal; ready/dead ekranında başlat/yeniden dene |
| S / ↓ | Sonlu kayma; havada fast-fall |
| E | Skill (Forest Guard süzülmesi bu tuşa bağlı değildir) |
| Esc / P | Pause / resume |
| Enter | Ready/dead ekranında başlat |
| F | Fullscreen toggle; iframe izin vermiyorsa hata yakalanır |
| Canvas'a tıklama/dokunma | Oynarken zıpla |
| Mobil ikon düğmeleri | Kayma / skill / zıplama |
| Gamepad A veya D-pad yukarı | Zıplama |
| Gamepad B veya D-pad aşağı | Kayma |
| Gamepad X | Skill |
| Gamepad Start | Pause / resume |

- Kullanıcının kayıtlı jump/slide/skill binding'leri ortak runtime API üzerinden önceliklidir.
- Skill binding mevcut sistemde `getControlBinding('timeSlow')` kanalından alınır.
- Key repeat atlanır.
- Pointer capture, pointerup, pointercancel ve lostpointercapture işlenir.
- HUD/pause/menu tıklaması Canvas zıplaması olarak değerlendirilmez.
- Pointer işlemleri eski 3D input listener'larına bubble etmez.
- Touch düğmeleri klavyeyle erişilebilir click aktivasyonunu da destekler.

## 13. UI, yerelleştirme ve mobil

Son1.8.2 tasarımı:

- Sol üst kalpler, sağ üst altın ve pause.
- Üst ortada ince biyom içi ilerleme çizgisi + yüzde; altında küçük mesafe.
- Büyük oyun içi logo, puan etiketi, biyom adı ve uzun kontrol yazıları gizlidir.
- Puan hesaplanmaya devam eder; DOM/snapshot state'inde bulunur.
- Shield/magnet için küçük ikonlu kalan süreler.
- Altta ikon kontrolleri; masaüstünde küçük tuş ipuçları.
- Ready kartında2D RUN, iki kontrol simgesi, play ve lobi ikonları.
- Pause kartında pause simgesi, devam ve lobi.
- Ölüm kartında mesafe, altın/süre/rekor küçük kutuları, retry ve lobi.
- Kart girişi .22 s; reduced-motion tercihi animasyonu kapatır.
- Ortak çevirilerden jump/slide/skill/pause/retry/play/lobi etiketleri kullanılır.
- Yeni çeviri anahtarları: runner2DIntro, runner2DFalling, runner2DLobby; bütün desteklenen dillere eklenmiştir.
- Bazı ilk sürüm açıklama anahtarları tabloda kalır fakat sadeleşen UI'da gösterilmez.
- Arapça için root dir=rtl, diğer dillerde ltr.
- İkonların yerelleştirilmiş aria-label/title değerleri korunur.
- Masaüstü kontrol boyutu58×56, mobil68×62.
- Safe-area inset'leri, yatay/dikey ekran ve kısa ekran media query'leri vardır.
- Dikey telefonda ilerleme çubuğu ikinci satıra taşınır.
- Overlay açıkken alt gameplay düğmeleri gizlenir.

## 14. Biyomlar, görsel malzemeler ve karakter

Sıra: forest → snow → city → lava → sky → water → tekrar forest.

- Her9000 dünya biriminde biyom değişir.
- Arka plan ve zemin1.5 s crossfade yapar.
- Son1600 birimde sonraki tema cache'i hazırlanır.
- Tema başına far/near1024×512 dünya-konumlu Canvas parça cache'leri; gökyüzü gradient'i de cache'lenir. Global hücreler/seed, modulo atlas tekrarının yerini alır.
- Yatay far parallax=.12, near=.32. Dikey far=.18×kameraY, near=kameraY. Bağlı ayrıntılar aynı parçaya birlikte çizilir; dünya altı opak uzatılır, portrait kenarları da aynı çizimi kullanır.
- Doğa: ağaçlar, dağlar, kulübeler, kayalar, mantarlar.
- Kar: karlı ağaçlar/dağlar, kulübeler, kardan adamlar.
- Şehir: cyan-magenta pencereler, binalar, üstgeçit/lambalar.
- Lav: volkanlar, lav akışları/kayalar.
- Sky: bulutlar, yüzen adalar/tapınaklar.
- Su: sualtı harabeleri, mercanlar/balıklar.
- Kırmızı yol bariyerleri engellerin arkasındaki dekoratif katmandadır.
- Temaya göre zemin rengi, kenarı ve küçük desenler değişir.
- Mevcut2D araç/engel renkleri ve çizimleri1.8.2'de yeniden tasarlanmadı.
- Oyuncu yüzlü, bevel görünümlü küp; ayak koşusu, el salınımı, atkı, göz kırpma, landing squash, jump eğimi ve slide pozları vardır.
- Eldiven renkleri ortak skin base/accent/edge değerlerinden gelir.
- Tutorial şapkası alınmışsa Canvas'ta küçük şapka çizilir; gerçek şapka GLB'si2D'ye yüklenmez.
- Atmosfer detayları sabit sayılıdır; yeni bitmap/GLB/audio dosyası eklenmedi.

## 15. Puan, ortak ekonomi, görevler ve kayıt

- Rekor anahtarı: `elemental-run-2d-v1`.
- Kaydedilen yapı: `{distance, score}`; distance gösterilen metre cinsindedir.
- Bozuk JSON/storage hatası güvenli varsayılana döner.
- Mesafe kaydı0..1e9, puan0..1e12 aralığına sıkıştırılır.
- Puan: yalnız yeni peak mesafesi, o anda aktif ortak scoreMultiplier ile kredi edilir; sonra gold×10 eklenir.
- Boost bitince eski puan düşmez. Rewind geçilen mesafeden tekrar puan kazandırmaz.
- Altın toplama ortak coinMultiplier'ı kullanır; yuvarlanmış minimum1.
- `settle()` yalnız henüz bank edilmemiş gold farkını aktarır.
- Death, exit ve pagehide tekrar çağrıları duplicate coin veya run kaydı yaratmaz.
- Ortak walletCoins artar, kayıt/HUD/lobi ödül sistemi refresh olur.
- Günlük görev event'leri: collectCoins, koşu için bir defa playRuns, manuel aktif skill için useAbility.
- DoubleJump/glide/revive kısa/passive yolları mevcut useSkill içinde useAbility çağrısına ulaşmaz; bunu değiştirecek AI mevcut davranışı bilmelidir.
- 2D score/mesafe,3D leaderboard ve kampanya madalyalarına yazılmaz.
- Runtime yalnız gerçek playing, görünür sekme ve reklamsız durumda aktif-süre ödüllerini ilerletir.

## 16. Ses ve SDK

- Yeni bağımsız ses sistemi kurulmadı; mevcut ses/müzik ayarları ve mixer kullanılır.
- `Runner2D.sound()` merkezi audio modülünün2D SFX API'sini kullanır; jump/coin/slide/hit/land/pad/pickup/crumble/break/gravity/revive/start/skill profilleri vardır. Modül yoksa eski runtime sound adapter'ına fallback yapar.
- 2D müziği kullanıcı MP3'ü;3D/lobi müziklerinden ayrı streaming HTMLElement. State/mute/ad/hidden/pause/exit ve aynı ses slider'larıyla yönetilir. Ayrıntılar bölüm0.
- playing durumunda kullanıcı etkileşiminden audio unlock + ortak platform gameplayStart.
- ready/paused/dead/inactive durumları ortak platform gameplayStop.
- `crazyGamesPlatform()` adı mevcut platform soyutlamasıdır; adı yüzünden Poki'nin bypass edildiği varsayılmamalıdır. Poki bridge/adaptör bağlantısını birlikte incele.
- Audio getState,2D aktifken pause/gameover/runStarted durumlarını2D state'inden verir.
- Sekme gizliyken veya focus yokken ses bloklanır.
- 2D için ayrı reklam yerleşimi veya reklam UI'ı eklenmedi.
- Otomatik tarayıcı QA'sı SDK mock'u kullanır; canlı Poki Inspector testi yerine geçmez.

## 17. Performans ve bellek

| Kaynak | Sınır |
|---|---:|
| Engel havuzu | 48 |
| Altın havuzu | 144 |
| Pickup havuzu | 24 |
| Parçacık havuzu | 112 |
| Ölüm voxel havuzu | 18 |
| Tema cache'i | En fazla2 tema |
| HUD yenileme | 10 Hz |
| DPR | Mobil≤1.5, masaüstü≤2 |

- Simülasyonda obje havuzları tekrar kullanılır; her engel/parçacık için yeni allocation yapılmaz.
- Tema çizimi ilk ihtiyaçta cache'lenir; her frame bütün arka plan yeniden inşa edilmez.
- Tema evict, Map referansını bırakır; Canvas2D için Three.js dispose çağrısı gerekmez.
- Görünmeyen eski parçalar ve çıkışta tüm tema cache'i backing store küçültülerek temizlenir. Pool/listener/DOM tek instance içinde yaşamaya devam eder.
- Dekoratif atmosfer sabit22 detay; ağır Canvas filter kullanılmaz. Menü overlay'inde küçük CSS blur vardır.
- Sanal yükseklik600, minimum mantıksal genişlik800, ground465; aspect ratio ile ölçeklenir.
- Oyuncunun ekrandaki X'i `min(260,width×.23)`.
- Portrait letterbox alanları tema renkleriyle doldurulur.
- Normal üretim2D render loop'unda çalışır; testlerin hızlı simülasyonunda draw atlanması üretimde yapılmış bir render değişikliği değildir.
- 30/60/120 Hz mantık eşliği ve10 dakikalık simülasyon gerçek cihazda sabit FPS garantisi değildir.

## 18. Testler, kanıtlar ve çalıştırma

Son kapsamlı kontroller12 Ekim2026'da1.8.10 içindir. Güncel testler bölüm0'da;1.8.5 fixture'ları12-alan history, bonuslu basamak ve prosedürel üretim beklentileriyle günceldir. Önceki1.8.0–1.8.4 fixture'ları tarihsel kanıttır ve eski history/platform/death kabullerinden dolayı yeni build için doğrudan kullanılmamalıdır.

| Test dosyası | Kapsam |
|---|---|
| output/test-2d-1810.cjs |2.240 katalog/3.080 eldivensiz+hız bonuslu+phrase çifti rota/seed bag/analytic fall-car-spinner rewind/pause/no update-render RNG |
| output/test-2d-185.cjs | Solid-top/6 staircase/72 saw/portal/rewind/voxel |
| output/test-2d-185-regression.cjs | Hardcore/coyote/ekonomi/24+54 rota/6 chain/6×600 s invulnerable bellek probe |
| output/test-2d-185-integration.cjs | Güncel portal/keyboard/cüzdan/8 glove/Endless/hologram + mobile touch/RTL |
| output/test-2d.cjs | Tarihsel gerçek lobi proximity portalı, keyboard/pause/death/retry/cüzdan,8 skill,30/60/120Hz,6 biyom, çıkış→Endless |
| output/test-2d-mobile.cjs | Touch/double jump/finite held slide/cancel/pause, yatay/dikey, Arapça ve yereller, rewind/phase/score buffs/storage |
| output/test-2d-181.cjs |24 statik engel rotası,12 pad-train rotası, shield/magnet/heal, rewind-pad,600 s koşu |
| output/test-2d-182.cjs |24 hareketli araç hız/FPS/Frost rotası, pause/rewind,4 slide pose, canvas tap, ikon etiketleri,600 s moving run |
| output/run-2d-official.mjs | Skill'in resmi Playwright client'ını native PLAY→portal→2D akışına bağlayan wrapper |

Güncel lifecycle testleri:6×600 s invulnerable probe,6 biyom, cache≤2, errors=[]. Sağ kalma/FPS garantisi değildir. Eski sürümlerin sağlık3 raporları güncel sağlık sözleşmesi değildir.

Görsel kanıtlar:

- `output/qa-2d-184/`: run/slide/jump-cancel/death-stop/death-shake/result, results.json ve long-run-probe.json.
- `output/qa-2d-184-integration/`: gerçek UI/klavye/ölüm ve mobile yatay/dikey/RTL ekranları, desktop/mobile JSON.
- `output/qa-2d-182/`: tarihsel incoming-before/after, slide-enter/skid/exit/upright, result ve results.json.
- `output/qa-2d-mobile/`: landscape-ready/running, portrait, arabic-ready.
- `output/official-2d-182-final/`: shot-0.png, state-0.json.
- Official istemci screenshot'u Canvas'a odaklıdır; tam HUD için ayrı QA ekran görüntülerine bak.

Yerel test komutları, proje kökünde PowerShell:

```powershell
& 'C:/Program Files/nodejs/node.exe' output/qa-server-1740.cjs
# Ayrı terminalde, aynı kök klasörden:
& 'C:/Program Files/nodejs/node.exe' output/test-2d-1810.cjs
& 'C:/Program Files/nodejs/node.exe' output/test-2d-185-integration.cjs
& 'C:/Program Files/nodejs/node.exe' output/run-2d-official.mjs --url 'http://127.0.0.1:4238/?platform=poki' --headless false --click-selector '#runner-2d [data-action="play"]' --actions-file output/actions-2d.json --iterations 1 --pause-ms 200 --screenshot-dir output/official-2d-review
```

- QA sunucusu4238 kullanır; son iş bitiminde kapatıldı. Gerekirse yeniden başlat.
- Playwright bağımlılığı mevcut bilgisayarda `C:/Users/Pc/.codex/skills/develop-web-game/node_modules/playwright`.
- Başka bilgisayarda test araçlarının sabit bağımlılık yolları uyarlanmalıdır.
- Headed testleri sırayla çalıştır; aynı anda açık test tarayıcıları focus/pause sonucunu etkileyebilir.
- `window.render_game_to_text()`,2D aktifken snapshot JSON döndürür.
- Mevcut `advanceTime(ms)` deterministic test hook'u ana loop'a bağlanır.
- Snapshot: mode/state, distance/meters/speed/elapsed/worldTime/score/coins/health/maxHealth/best, biome/cache, player collider/slidePose/coyoteTime, death.phase/remaining, buffs/skill/cooldown/reviveUsed, görünür engeller/pickuplar/coinler ve pool boyutları.
- QA enjeksiyonları __qaHub/__r2 gibi geçici tarayıcı test araçlarıdır; production API olarak kabul edilmemelidir.

## 19. Sürüm geçmişi ve çözülen sorunlar

### 1.8.0

- Ayrı2D Canvas sistemi, altı biyom, üçüncü lobi portalı.
- Input/pause/sonuç/retry/lobi,8 eldiven, ortak ekonomi/ses/SDK.
- Havuzlar, tema cache'i, mobil/RTL, rekor.
- Boost bitince puanın düşmesi ve rewind'in yeniden puan vermesi önlendi.
- Portrait HUD/kontrast/letterbox düzenlendi.

### 1.8.1

- Sonsuz eğilme yerine sonlu kayma/rearm/recovery/fast-fall.
- Araç, spinner, lava/ice, pad-train ve pickup çeşitleri.
- Altı tema dekorasyonları.
- Normal zıplamayla pedden geçerken gereksiz yüksek fırlama önlendi; mutlak pad apex sınırlandı.
- Tren/ped konumu ve parkur iniş mesafesi ayarlandı.
- Kayarken yüzün gövde dışına taşması düzeltildi.

### 1.8.2

- Gerçek yaklaşan car/motor, rewind uyumlu worldTime.
- Görsel kayma giriş–skid–doğrulma modeli.
- Daha ritmik quantized aralıklar.
- Sade ikon HUD/menüler, canvas tap-to-jump, erişilebilir etiketler.
- Mevcut2D artwork korundu; ağır medya eklenmedi.

## 20. Paketleme ve korunacak sözleşmeler

- 1.8.2 cache anahtarı: `1.8.2-poki-2d-flow`; HTML JS/CSS query değerleri1.8.2.
- Önceki son ZIP:101 dosya,104 entry,47,327,263 byte; tüm kaynak SHA256 eşliği geçti.
- `output/` QA dosyaları dağıtıma girmez.
- `output/update-release-package.ps1` whitelist'inde runner-2d.js/css vardır.
- `output/verify-release-1740.ps1` paket/kaynak hash ve build kontrolü yapar.
- Bu devir belgesi11 Ekim'de1.8.2 için ayrı dosya olarak oluşturulurken ZIP yeniden paketlenmedi.1.8.3 güncellemesinde belge packaging whitelist'e de eklendi ve aynı oyun ZIP'i güncellendi.
- Son gameplay regresyonunda4 korunan3D fonksiyon birebir aynı: updateObstacles, updateViewmodelHands, renderViewmodelOverlay, vmSplitGeometryByX.
- curved-path-system.js aynı kaldı;103500 kampanya blueprint satırı karşılaştırması geçti.

AI'ın geliştirmeye devam ederken koruması gerekenler:

1. 2D input/state/renderer ile3D fizik/viewmodel'i birbirine karıştırma.
2. Yeni ayrı RAF açma; mevcut stepGame erken branch'ini kullan.
3. Coin/score/rewind/settle çoğaltma açıklarını tekrar oluşturma.
4. Hareketli engel konumunu deterministik worldTime formülünden koparma.
5. Normal jump ve slide ile geçilemeyen engel koyacaksan gerekli pad/rota eşlemesini garanti et.
6. Minimum aralıkları hız, zıplama süresi ve kayma toparlanmasıyla test et.
7. Görsel slide'ı collider/süre ile karıştırma; sınırsız held crouch'u geri getirme.
8. Pool/cache sınırlarını ve mobil DPR'ı koru; gerçek cihaz performansını ayrıca ölç.
9. Ortak cüzdan/skill/ses/SDK API'lerini mevcut runtime köprüsünden kullan.
10. Metinleri sade tut; ikon erişilebilirliğini ve yerelleştirmeyi koru.

## 21. Bilinen sınırlar ve sonraki doğrulama

- Gerçek düşük güçlü telefonlarda uzun oturum termal/FPS profili henüz ölçülmedi.
- Canlı Poki Inspector ve gerçek reklam yaşam döngüsü, mock SDK testinden ayrıca doğrulanmalıdır.
- 2D görseller procedural Canvas çizimleridir; gerçek3D modellerin raster/sprite export'u değildir.
- Rewind bütün düşen engel/pickup olaylarının tam zaman yolculuğu motoru değildir; yukarıdaki kayıt sözleşmesi geçerlidir.
- Her biyom için ayrı authored bölüm/seviye sonu yok;2D sürekli koşu olarak döner.
- Biyom çubuğu bölüm medal ilerlemesi değil9000 birimlik mevcut section ilerlemesidir; sınırda yeniden başlar.
- Frame-rate bağımsız testler mantık tutarlılığını doğrular; her donanımda sıfır takılma kanıtı değildir.
- Son testlerde bilinen engelleyici2D bug kaydı yoktur; yeni değişiklikte ilgili kontrol/çarpışma/ekonomi akışları yeniden test edilmelidir.

## 22. Başka AI'a gönderilecek kaynaklar

Önce bu belgeyi, sonra en az şu dosyaları paylaş:

1. runner-2d.js ve runner-2d.css.
2. game-runtime.js ve lobby-hub.js.
3. game-localization.js, index.html ve BUILD.json.
4. Entegrasyon değişecekse audio-system.js ve platform/SDK dosyaları.
5. Test değişecekse output/test-2d*.cjs, run-2d-official.mjs, actions-2d.json ve ilgili results.json/görüntüler.

Dosya boyutu elveriyorsa güncel kaynak klasörünün tamamını vermek, bütün bağımlılıkları görmesini sağlar. Bu MD mevcut2D sisteminin kararlarını ve sayısal sözleşmelerini açıklar; uygulama yapacak AI kaynakları okumadan eski konuşmaya göre varsayım üretmemelidir.

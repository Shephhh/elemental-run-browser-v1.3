# TARİHSEL: Elemental Run — Obby ve Mod Salonu / 1.49.0

> **1.57.0 güncel karar:** Aynı portal **PARTY RUN FPS Solo**; korkuluklu uzun etaplar, yeni engel biçimleri ve çöken Dönence zemini.
> Birinci şahıs, AI yok; altı takipli yarış + hayatta kalma/çöken zemin/toplama. Güncel referans
> `PARTY_RUN_AI_HANDOFF.md`. Aşağıdaki Obby açıklamaları arşivdir, güncel
> davranış veya yeniden uygulanacak talep değildir.

Belge güncellemesi: **25 Ekim 2026 — 1.49.0**. Güncel FPS mimarisi U bölümündedir. A–R1.46, S1.47, T1.48 tarihsel katmanlardır. Çelişkide U ve güncel kaynak üstündür. OBBY_V1_47_CHANGED_BLOCKS.md eski üçüncü şahıs kamera kod örneğidir; FPS sürümüne geri yapıştırılmamalıdır.

## Güncel istek ve kapsam

Lobide tek OYUNLAR portalı bulunur. Seçim salonunda Level, Endless, 2D, Surf/Bhop ve Obby için beş giriş vardır. Flappy eski oyun makinesiyle ana lobidedir; salon portalı değildir ve yükleme ekranında oynanmaz. Normal koşu/Surf/2D fizik veya kaynak parkurları yeniden yazılmadı.

Bu sürüm tek oyunculudur. Fall Guys veya Roblox sunucularına bağlanmaz; çok oyunculu yarış, bot rakipler veya kopyalanmış marka karakterleri içermez.

Güncel Obby birinci şahıstır: serbest kamera-bağıl WASD, normal oyunun eldiven modelleri, altı zorlaştırılmış parkur/14etap türü ve beş yeni engel ailesi. HUD/pause/sonuç normal oyunla aynı tasarımı kullanır. Lobi üçüncü şahıs ve Flappy ana lobide kalır.

## Araştırmadan alınan tasarım ilkeleri

- [Roblox Classic Obby](https://create.roblox.com/docs/tutorials/curriculums/building/get-started): okunaklı atlama rotası, birbirini izleyen platform etapları, güvenli ara istasyonlar.
- [Fall Guys engel tasarımı](https://dev.epicgames.com/documentation/fortnite/fall-guys-designing-an-obstacle-course-in-fortnite-creative): hareketli engellerin zamanlamasını okuyarak geçme, dönen kollar ve sıçratıcılar.
- [Fall Forever](https://www.fallguys.com/news/fall-forever-update?lang=en-US): kontrol noktaları ve dinamik platformlarla kısa tekrar döngüleri.

Kod ve parkur yerleşimleri özgündür. Çevre modelleri mevcut Elemental Run fabrikalarından alınır; harici model/texture indirilmedi.

## Dosyalar

| Dosya | Sorumluluk |
| --- | --- |
| mode-concourse.js | Ayrı mod salonu, altı yan portal, geri dönüş pedi/butonu, ana meydan/salon görünürlük ve collider listesi değişimi |
| lobby-hub.js | Ana OYUNLAR portalı, yerel portal yönlü kamera geçişi, salon desteği, ortak statik batching |
| obby-course.js | Saf parkur verisi, 120 Hz kinematik hareket, swept-AABB, hareketli platform/hazard pozları |
| obby-run.js | Three.js sahnesi, UI, kamera/input, yaşam döngüsü, checkpoint, bitiş ve kayıt |
| obby-run.css | Masaüstü/mobil HUD, pause/sonuç ekranı, diğer HUD'ların izolasyonu |
| game-runtime.js | Mevcut oyun döngüsü, giriş/çıkış, input, odak/pointer-lock, audio/Poki ve aktif süre bağdaştırıcısı |
| game-localization.js | 30 dilde yeni salon/Obby ifadeleri; mevcut pause/checkpoint/bitiş çevirilerinin yeniden kullanımı |

## Salon

Ana meydandaki eski dört koşu portalı kaldırıldı; Flappy makinesi de ikinci bir mod girişi olarak bırakılmadı. Dükkan, yükseltme, çark, görevler ve ödüller ana meydanda kalır. Ortadaki istatistik anıtı ana portala yürüyüşü engellemesin diye sağ tarafa taşındı.

Salonda sol sıra Level, 2D ve Obby; sağ sıra Endless, Surf/Bhop ve Flappy. Her portal merkeze dönük, kendine özgü renkli çerçeveye sahiptir. Surf bölüm okları ve rekor etiketleri çalışmaya devam eder. Yeni salonun duvarları collider listesine dahil edilir. Kamera yaklaşımı portalın yerel ileri yönüne göre hesaplanır; yalnız dünya -Z yönüne sabitlenmez.

Ana meydanın geometri/etkileşim listeleri saklanır, salon açılınca gizlenir. Salon ilk kullanımda oluşturulur ve tekrar kullanılır; sabit opak mimari materyal bazında birleştirilir. Geç yüklenen el GLB'leri salon içinde görünmez, ana meydanın picking listesine kaydedilir. El modeli atılırken her iki alanın picking kayıtları temizlenir.

## Obby parkurları

Altı parkur: Doğa, Gökyüzü, Kar, Cyber, Lav, Su. Her biri yaklaşık 240 dünya birimi uzunluğunda ve altı etaplıdır. Başlangıç dahil yedi güvenli istasyon vardır.

Her parkurda altı modül farklı sırada kullanılır:

1. Aralıklı, yana kaydırılmış ve farklı yükseklikte basamaklar.
2. Zıplayarak geçilen, zıt yönlerde dönen iki kol.
3. Oyuncuyu taşıyan üç yatay hareketli platform.
4. Zamanlamalı üç yan piston; güvenli yan kaçış alanı vardır.
5. Kaybolmadan önce turuncu uyarı veren geçici basamaklar.
6. Sıçratıcı, yükseltilmiş iniş platformu ve aşağı iniş.

Dönen kol/piston çarpması doğrudan Game Over yapmaz; kısa knockback ve 0.65s ikinci vuruş koruması uygular. Platformdan düşüşte yaklaşık 0.45s sonra son kazanılan kontrol noktasına dönülür. Önceki checkpoint atlanamaz; bitiş için altı etabın istasyonları sırayla alınır.

## Fizik ve kontroller

- Sabit simülasyon: 120Hz, mevcut ana RAF'tan çağrılır; ek RAF yok.
- Yerçekimi: 24; zıplama: 9.5; yürüyüş: 7.5 dünya birimi/s.
- Sıçratıcı: 14 dikey hız.
- Oyuncu collider: yarıçap .43, boy 1.8; feet koordinatı kullanılır.
- Kamera yönüne göre WASD/oklar; Space zıplama; R checkpoint; Esc duraklatma.
- Masaüstü pointer lock ve üçüncü şahıs takip kamerası.
- Mobil yön düğmeleri ve ayrı zıplama, yalnız sağ yarıdaki bağımsız pad üzerinden kamera. Pointer cancel/release input temizler.
- Bölüme göre 120→100ms coyote time, 140ms jump buffer.
- Swept-AABB ile yan/üst/alt çarpışma. 2mm collision skin için 6mm destek probu var: alt kare yerçekimi skin'den kısa olsa da hareketli platform teması kaybolmaz.
- Sıçrarken destek probu çalışmaz; pad tekrar tetiklemesini sınırlayan kısa cooldown vardır.
- Hareketli engeller tek worldTime kullanır. Rastgele her-kare poz değişimi yok.

## Akış ve kayıt

prepare -> course/build -> compileAsync -> 64px ekran dışı warmup -> enter -> playing -> paused/won -> exit.

Yeni bölüm hazırlanırken simülasyon ve render eski disposed sahneye erişmez. Hazırlama hatası sonuç/pause kartında yeniden deneme sunar. Lobby girişindeki hazırlama hatası mevcut lobi hata akışına döner.

localStorage anahtarı: elemental-run-obby-v1. Veri: best[level] saniye, level sonraki önerilen parkur. Diğer modların skor/medalya/checkpoint anahtarlarına yazmaz. Obby bitişi en iyi aktif süreyle kıyaslanarak15–75altın verir; mevcut aktif oynama süresi ödülleri gerçek playing süresinde ilerler. Pause/blur/hidden süreleri playing sayılmaz.

Bitince en iyi süre saklanır; sonraki parkur, yeniden başla veya lobiye dön seçenekleri gelir. Son parkurda sonraki butonu yoktur. Düşüşler süreyi sıfırlamaz; yeniden başla sıfırlar.

## Performans ve sahiplik

- 23 platform iki InstancedMesh olarak çizilir; renk/matrisler yeniden kullanılır.
- Üç gerçek çevre varyantı x12 yerleşim =36 dekor instance; bileşik modeller parçalarına ayrılarak bağımsız hareket ettirilmez.
- Tek opak biyom tabanı; saydam ikinci zemin yok.
- Tepe işaretleri, küçük hazard grupları ve32instanced kutlama parçacığı.
- Shadow map veya ek bloom/postprocessing zinciri yok.
- Bir Obby sahnesi tutulur. Bölüm değişiminde/çıkışta kendisine ait geometri, materyal, texture, instance buffer ve warmup hedefi dispose edilir. Paylaşılan normal oyunun kaynakları klonlanır, orijinalleri dispose edilmez.
- Kamera/render çözünürlüğü mevcut grafik ayarına uyar. Mobil için ayrı d-pad boyutu ve yatay HUD.
- Evrensel60FPS garantisi yok; gerçek düşük donanımlı telefon testi ayrıca gereklidir.

## QA

- output/test-obby-146.cjs: altı parkurda modül çeşitleri, balistik erişilebilirlik payı, zıplama/apex/iniş, hareketli platform taşıması, sweeper çarpması.
- output/run-obby-146-official.mjs: resmi develop-web-game Playwright istemcisini çalıştıran wrapper. Test kancaları yalnız response interception ile enjekte edilir, üretim dosyasına yazılmaz.
- Masaüstü ve844x390 mobil görünüm, altı tema, pause/resume, giriş/çıkış/yeniden giriş, checkpoint respawn, bitiş, klavye bırakma ve mobil yön/jump testleri.
- Flappy Canvas'ı worker'a devredildiği için QA sonunda gizli canvas DOM'dan çıkarılır; resmi istemcinin en büyük canvas seçimi yanlışlıkla gizli Flappy ekranını seçmesin. Üretim davranışı değiştirilmez.
- Tam insan oynanışı, tüm atlayış zamanlamalarının exhaustive aranması veya gerçek cihaz60FPS ölçümü iddia edilmez. Yeni parkur/engel eklenirse hareketli platformun en ters fazında da erişilebilirlik testi tekrarlanmalıdır.

## Dağıtım

Mevcut kaynak klasörü ve aynı adlı ZIP kullanılır; yeni proje/release kopyası oluşturulmaz. Cache/build1.46.0. QA output klasörü pakete girmez. Bu işlem internet sitesine/Poki paneline otomatik yayın yapmaz.

---

# Ayrıntılı kaynak ve geliştirme rehberi

Belge tarihi: **25 Ekim 2026**. Aşağıdaki bilgiler 1.46.0 kaynak kodu okunarak hazırlanmıştır. Bu belge turunda oyun mekaniği değiştirilmedi. Daha önceki test sonuçları ile bu turdaki kaynak incelemesi birbirinden ayrılmalıdır.

## A. Projeyi doğru yerde açma

Aktif kaynak klasörü:

```text
C:/Users/Pc/Desktop/ELEMENTAL RUN Browser v1.3 relaeses 2/ELEMENTAL RUN Poki v1.5.0
```

Mevcut arşiv:

```text
C:/Users/Pc/Desktop/ELEMENTAL RUN Browser v1.3 relaeses 2/ELEMENTAL RUN Poki v1.5.0.zip
```

Klasör isminde v1.5.0 yazması güncel sürümün bu olduğu anlamına gelmez. Sürüm için BUILD.json esas alınır: **1.46.0**, Three.js **0.185.1**. Steam/eski proje kopyaları bu modun aktif kaynağı değildir.

Yükleme sırası önemlidir:

1. mode-concourse.js, lobby-hub.js tarafından kullanılmadan yüklenir.
2. obby-course.js, obby-run.js dosyasından önce yüklenir.
3. game-runtime.js, sınıflar hazır olduktan sonra controller'ı oluşturur.
4. obby-run.css, Obby HUD'u ve diğer HUD izolasyonu için yüklenir.

Global giriş noktaları:

```js
window.ElementalModeConcourse
window.ElementalObbyCourse
window.ElementalObbyRun
```

ElementalObbyCourse ayrıca Node CPU testleri için CommonJS export sunar. Tarayıcıdaki Obby sınıfı, Three.js ve host API'sini constructor üzerinden alır.

## B. Oyuncu akışı ve modların ayrılması

```text
Loading → PLAY → Ana meydan → OYUNLAR → Mod salonu
                                         ├─ Level / Tutorial
                                         ├─ Endless
                                         ├─ 2D Run
                                         ├─ Surf & Bhop
                                         ├─ Obby
                                         └─ Flappy

Obby: prepare → enter → playing → checkpoint → finish → sonuç kartı
                         ├─ pause/resume
                         └─ düşüş → son checkpoint

Sonuç: sonraki parkur / yeniden başla / ana lobi
```

Level portalı yeni profilde mevcut eğitimi başlatabilir. Flappy portalı yeni bir Three.js parkuruna değil, mevcut arcade katmanına bağlanır.

Dükkan, çark, yükseltme ve ödüller ana meydanda kalır. Ana Games portalına yürüyüşü engellememesi için istatistik anıtı sağa taşınmıştır. Obby; normal koşunun, 2D'nin veya Surf'ün fizik sistemi değildir.

## C. Mod salonunun kesin yerleşimi

Grup merkezleri:

| Kimlik | Taraf | X | Z | Başlangıç vurgu rengi |
| --- | --- | ---: | ---: | --- |
| level | Sol | -14 | -22 | #e6bc6e |
| endless | Sağ | 14 | -22 | #65d9bd |
| runner2d | Sol | -14 | -7 | #e99e85 |
| surf | Sağ | 14 | -7 | #78d6ff |
| obby | Sol | -14 | 8 | #b2e6a1 |
| flappy | Sağ | 14 | 8 | #d8adf1 |

Bu değerler portal grubunun merkezidir; etkileşim pedi ve yüzeyler grup içinde ayrıca offset taşır.

- Sol portallar Y ekseninde +π/2, sağ portallar -π/2 döner.
- Girişler orta koridora bakar.
- Portal collider merkezleri de döndürülür; X/Z yarı genişlikleri değiştirilir.
- Kamera entryTarget ve entryForward kullanır; her giriş dünya -Z yönüne zorlanmaz.
- Salon ana zemini yaklaşık37×61.
- Yan duvarlar X=±18; ön/arka duvarlar Z=-32 ve Z=28.
- Geri dönüş pedi: X=0, Z=23, radius=2.
- Salon spawn'ı: (0, avatarHalfHeight,20).
- Ana meydana geri dönüş: (0, avatarHalfHeight,-22).
- Alan geçişinde yaw=0, pitch=.48.
- Ekrandaki geri düğmesi: #hub-mode-back.

Salon ayrı renderer açmaz; mevcut lobi sahnesindeki bir Group'tur. İlk kullanımda oluşturulup tekrar kullanılır.

Ana meydan/salon için ayrı tutulan listeler:

```js
zones
solids
clickable
portalPreviews
```

setArea görünürlükleri saklar, aktif listeleri değiştirir, hareket/hold/input durumunu temizler. Avatar, gölge ve ışıklar korunur. Canvas üzerinde350ms opaklık geçişi vardır.

Geç gelen el GLB'leri salonun içinde görünmez; ana meydanın picking listesine eklenir. El modeli temizlenirken iki alanın da eski picking kaydı kaldırılmalıdır. Yalnız node'u gizlemek collider ve clickable kaydını otomatik temizlemez.

## D. Altı parkurun tam sırası

Parkurlar tamamen rastgele veya sonsuz değildir. Aynı level numarası aynı modüler yerleşimi üretir. Bölüm numarası1–6arasında sınırlandırılır.

| Bölüm | Tema | phase | Platform rengi | Gökyüzü | Modül sırası |
| --- | --- | ---: | --- | --- | --- |
| 1 | Doğa | 1 | #68cbaa | #a8dce6 | stones, sweeper, movers, pistons, tiles, bounce |
| 2 | Gökyüzü | 2 | #83b9ee | #c3e4f6 | sweeper, movers, pistons, tiles, bounce, stones |
| 3 | Kar | 5 | #a9cdda | #7f9fbc | movers, pistons, tiles, bounce, stones, sweeper |
| 4 | Cyber | 0 | #73adc3 | #152b46 | pistons, tiles, bounce, stones, sweeper, movers |
| 5 | Lav | 3 | #f5a05f | #4b2940 | tiles, bounce, stones, sweeper, movers, pistons |
| 6 | Su | 4 | #68cece | #8dccdc | bounce, stones, sweeper, movers, pistons, tiles |

Her parkur altı modülün bir kez kullanıldığı, sırası döndürülmüş bir düzenlemedir. Altı tamamen farklı büyük authored harita olarak anlatılmamalıdır. Tema, yan offset'ler ve bazı hareket hızları da değişir.

Her bölümde:

- 6×40=240birim rota uzunluğu.
- Başlangıç dahil7güvenli istasyon.
- 23platform.
- 2dönen kol +3piston =5hazard.

İstasyon indeksi i=0..6:

```js
cx(i) = Math.sin(i * 0.8 + level * 0.3) * 4
x = cx(i)
z = -i * 40
platformTopY = 3
checkpointFeetY = 3.004
width = 12
depth = 10
```

Etap içi ana X, başlangıç ve bitiş istasyonlarının X ortalamasıdır.

## E. Bütün engellerin ölçü ve davranışları

Aşağıdaki Z değerleri ilgili etabın başlangıcına göredir.

### E.1 stones

Dört basamak:

- Z=-8,-16,-24,-32.
- Boyut5.5×5.5, kalınlık1.
- Üst Y sırasıyla3.6,3,3.6,3.
- X=etap merkezi + sin(j×1.7+level)×2.

Yalnız ileri atlamayı değil, küçük yatay ve yükseklik düzeltmelerini de gerektirir.

### E.2 sweeper

- Güvenli deck:12×30, merkez Z=-20, üst Y=3.
- Kol merkezleri Z=-12 ve -27, Y=3.65.
- Kol uzunluğu11.
- Açısal hız büyüklüğü .8+level×.06rad/s.
- İkinci kol ters döner; başlangıç fazı2radyan.
- Görsel kol kesiti .6×.6; fizik kalınlık terimi .38.
- Silindir pivotlar görseldir; ayrı platform collider'ı değildir.

Oyuncu kol üzerinden zıplayabilir. Çarpışma, kolun dönen yerel koordinatında uzunluk/kalınlık testiyle hesaplanır.

### E.3 movers

- Üç platform, Z=-10,-20,-30.
- Boyut6×7, üst Y=3.
- Genlik2.1, rate=.8+level×.025, phase=j×1.8.

```js
x = baseX + Math.sin(worldTime * rate + phase) * amplitude
dx = newX - oldX
```

Önce pose(), sonra oyuncu fiziği çalışır. Oyuncu üstündeyse dx/dz hareketi ona aktarılır. Her kare rastgele yön değiştirilmez.

### E.4 pistons

- Deck12×30, üst Y=3.
- Üç piston Z=-9,-19,-29.
- X, etap merkezinin ±5.4yanında; taraflar dönüşümlü.
- Merkez Y=4.
- Görsel gövde2.4×2×2.

```js
push = Math.max(0, Math.sin(worldTime * 1.15 + phase)) ** 3 * 4.2
currentX = baseX - side * push
```

Ray görseldir. Piston yaklaşırken kenara kaçma/zamanlama gerekir; bütün deck sürekli kapalı değildir.

### E.5 tiles

- Dört platform, boyut6×6, üst Y=3.
- Z=-8,-16,-24,-32.
- X'e dönüşümlü±.7offset.
- Periyot5.8s; phase=j×.7.

Döngü durumu:

| Aralık | Sonuç |
| --- | --- |
| 0–3.8s | Aktif, normal görünüm |
| 3.8–4.6s | Aktif, turuncu uyarı |
| 4.6–5.8s | İnaktif/görünmez/çarpışmasız |

Kodun warning bayrağı4.6s'den sonra da açık olabilir; görünmez platform sıfır ölçekle çizildiği için görünen uyarı3.8–4.6aralığıdır.

### E.6 bounce

| Platform | Z | Üst Y | Boyut | Özellik |
| --- | ---: | ---: | --- | --- |
| Sıçratıcı | -9 | 3 | 8×8 | Üst temasında vy=14 |
| Yüksek iniş | -19 | 6 | 7×7 | Normal |
| Aşağı iniş | -29 | 4.5 | 7×7 | Normal |

Pad otomatik tetiklenir; skill tuşu istemez. Yeniden tetikleme kilidi .3s.

### E.7 Ortak hazard vuruşu

Sweeper/piston vurunca:

```js
vx = nx * 9
vz = nz * 9
vy = 5
grounded = false
support = -1
invulnerable = 0.65
hit = true
```

Bu süre yalnız ikinci hazard vuruşunu engeller; fiziksel platformları hayalet yapmaz. Knockback oyuncuyu platform dışına atabilir. Doğrudan Game Over yerine checkpoint'ten devam döngüsü vardır.

## F. Veri şeması ve koordinatlar

+Y yukarı, rota-Z, X sağ/sol. Oyuncunun y'si ayak konumudur. Platform y'si üst çarpışma düzlemi; altı y-h'dir.

course() çıktısı:

```js
{
  level,
  theme: { phase, color, sky },
  platforms,
  hazards,
  checkpoints,
  order,
  finish: checkpoints[6]
}
```

Platform:

```js
{
  id, x, y, z, w, d, h,
  baseX, baseY, baseZ,
  active, dx, dz,
  stage, checkpoint, type,
  amplitude, rate, phase, period
}
```

Bütün alanlar her tipte bulunmaz. type; mover/tile/bounce veya normal platformda tanımsızdır. stage etap indeksidir; checkpoint güvenli istasyon indeksidir. İkisini karıştırmayın.

**id dizi indeksiyle eşleşmelidir:** destek platformu platforms[player.support] ile bulunur. Diziyi yeniden sıralayıp id'leri eski bırakmak taşıma sistemini bozar.

Oyuncu:

```js
{
  x, y, z, vx, vy, vz,
  grounded: false,
  support: -1,
  coyote: 0,
  buffer: 0,
  invulnerable: 0,
  bounceLock: 0
}
```

Fizik ayrıca jumped/bounced/hit bayrakları üretir. Controller bunları ses olayına çevirip temizler.

## G. Hareket, zıplama ve çarpışmanın matematiği

| Sabit | Değer |
| --- | ---: |
| DT | 1/120s |
| G | 24 |
| JUMP | 9.5 |
| SPEED | 7.5 |
| R | .43 |
| H | 1.8 |
| Coyote | .12s |
| Jump buffer | .14s |
| Collision skin | .002 |
| Destek probu | .006 |
| Pad kilidi | .3s |
| Hazard koruması | .65s |

R, AABB genişletme yarı ölçüsüdür; motor kapsül fiziği kullanmaz. Yatay oyuncu kutusu yaklaşık .86×.86, boyu1.8dir.

Kamera-relative hedef hız:

```js
len = Math.max(1, Math.hypot(forward, strafe))
tx = (strafe * Math.cos(yaw) - forward * Math.sin(yaw)) / len * SPEED
tz = (-forward * Math.cos(yaw) - strafe * Math.sin(yaw)) / len * SPEED
```

Çapraz yürüyüş hız avantajı vermez. Hız hedefe üstel yumuşatmayla gider:

```js
k = 1 - Math.exp(-(grounded ? 22 : 8) * dt)
```

Hazard korumasında normal yön ivmesi uygulanmaz; mevcut yatay hız exp(-2dt) ile söner.

İdeal sürekli-zaman hesabı:

| Zıplama | Tepe yüksekliği | Aynı Y'ye uçuş | Tam hız menzili |
| --- | ---: | ---: | ---: |
| Normal9.5 | 1.88 | .792s | 5.94 |
| Pad14 | 4.08 | 1.167s | 8.75 |

Bunlar tasarım referansıdır; ayrık fizik, ivmelenme ve iniş yüksekliği gerçek sonucu etkiler.

sweep(), ayak noktasını X/Z'de R, altta H ile genişletilmiş platform kutusuna karşı süpürür. Slab giriş/çıkış zamanı ve normal ekseni bulunur. En erken temas çözülür, ilgili hız sıfırlanır, oyuncu .002dışarı alınır. Kalan süreyle en fazla4çarpışma geçişi yapılır.

### Skin destek probunu koruyun

120Hz yerçekimi adımı .002skin mesafesinden küçük olabilir. Yalnız sweep'e dayanılırsa yerdeki oyuncu iki kareden birinde desteği kaybeder ve mover geride bırakır.

Mevcut ek prob:

- Yükselirken çalışmaz; vy≤0gerekir.
- Aktif, pad olmayan platform ister.
- X/Z örtüşmesi gerekir.
- Ayak platform üstü ile üst+.006arasında olmalıdır.
- Oyuncu üst+.002ye alınır; vy=0, grounded/support/coyote geri kurulur.

Bu probun gelişigüzel kaldırılması taşıma bug'ını geri getirir. Yukarı giderken çalıştırılması ise zıplamayı zemine yapıştırabilir.

## H. Checkpoint, süre, yeniden başlama ve bitişin kesin kuralları

### Checkpoint

Yalnız bir sonraki checkpoint aranır:

- grounded=true.
- |x-cp.x|<5.6.
- |z-cp.z|<4.6.

Üzerinden havada geçmek yetmez. İlerideki istasyona atlamak bütün ara istasyonları açmaz. Mevcut testte ayrı bir Y bandı yoktur; yeni üst üste rotalarda bunu yeniden değerlendirin.

### Düşüş eşikleri

```js
y < 0.1 || Math.abs(x) > 65 || z > 20 || z < -265
```

Görsel alt taban, collider zemin değildir. Düşüş bu mantıksal eşiklerle yakalanır.

Düşüşte deaths artırılır, hit sesi çalar, .45s beklenir; avatar gizlenir. Sonrasında oyuncu son checkpoint koordinatına sıfır hızla kurulur. Input temizlenir, yaw0olur.

R de respawn çağırır ama deaths artırmaz. Checkpoint ve birikmiş parkur zamanı korunur. Restart ise checkpoint/süre/worldTime/deaths'i sıfırlar.

### Süre

Süre platformun dışına çıkmayı beklemez. Başlangıç merkezinden yatay düzlemde **2birimden fazla uzaklaşınca** başlar. Bir kez başladıktan sonra normal playing adımlarında artar.

- Pause: artmaz.
- Respawn beklemesi: artmaz.
- Hazırlama/bitiş kartı: artmaz.
- Düşüş: önceki birikimi silmez.
- Yeniden başla: sıfırlar.

Sayaç sabit simülasyon adımlarına bağlıdır, saf duvar-saati değildir. update dt'yi .05s ile sınırlar; çok düşük FPS'de gerçek zamandan geri kalabilir.

### Bitiş

Checkpoint6alınınca finish çalışır. won bayrağı tekrar bitişi engeller. En iyi süre saklanır, önerilen sonraki bölüm belirlenir, pointer bırakılır,32küplük kutlama ve sonuç kartı açılır.

Bölüm1–5: sonraki parkur + yeniden başla + lobi. Bölüm6: yeniden başla + lobi. Pause kartında ayrıca devam/checkpoint'ten devam vardır.

## I. Durum makinesi, asenkron hazırlama ve API

```text
idle → prepare/build → prepared → enter → playing
                                      ├─ pause → paused → resume
                                      ├─ düşüş → respawnTimer → devam
                                      ├─ finish → won → next → preparing → playing
                                      └─ exit → idle + dispose
```

prepared string state değil boolean bayraktır. preparing Promise'i ile state='preparing' aynı şey değildir.

Hazırlama:

1. Eski owned kaynakları temizle.
2. course(level) verisini üret.
3. Sahne, instance'lar, hazard/dekor, avatar/kemer kur.
4. restart ile oyuncuyu yerleştir.
5. Çizim verilerini ekrana basmadan hazırla.
6. Destekleniyorsa compileAsync.
7. 64×64RenderTarget'a warmup render.
8. prepared=true; giriş için hazır.

Next, loadingNext ile tekrar tıklamaya karşı korunur. Yeni sahne kurulurken eski dispose edilmiş sahne güncellenmez. Pointer lock isteği kullanıcı tıklamasında başlatılır.

Hata halinde surfError yazan pause kartı yeniden deneme/lobi sunar. next(true), mevcut başarısız bölüm numarasını yeniden artırmadan hazırlar.

### Fonksiyon haritası

| Fonksiyon | Sorumluluk |
| --- | --- |
| C.course | Parkur verisi |
| C.pose | Dinamik platform/hazard pozu |
| C.player | Sıfır hızlı oyuncu |
| C.sweep | Sürekli AABB teması |
| C.step | Tek fizik adımı |
| Run.prepare/build | Hazırlama Promise'i ve sahne |
| Run.enter/exit | Aktif moda giriş/çıkış |
| Run.restart/respawn | Tam deneme sıfırlama / checkpoint'e dönüş |
| Run.next | Sonraki parkur veya hata sonrası yeniden hazırlama |
| Run.tick/update | WorldTime, fizik ve accumulator |
| Run.render | Görsel instance/karakter/kamera |
| Run.refresh/showModal/toast | UI |
| Run.key/mouse/jump | Kontroller |
| Run.finish/save | Bitiş ve persistence |
| Run.own/clearScene | Kaynak sahipliği |
| Run.snapshot | render_game_to_text verisi |
| Concourse.build/setArea | Salon oluşturma ve alan değişimi |

## J. Kontrol ve kamera ayrıntıları

### Desktop

- WASD/oklar: kameraya göre serbest hareket.
- Space: zıplama isteği; .14s buffer.
- R: son checkpoint.
- Esc: pause/resume.
- Kilitli fare: bakış.
- Playing sırasında canvas tıklaması: pointer-lock isteği.

Sürekli ileri koşu ve otomatik bhop yoktur. Key repeat Space'i her kare yeniden tetiklemez. Obby tuşları şu anda ana key-binding ayarına bağlı değildir.

Kamera:

- FOV62, near .1, far320.
- Yaw serbest, pitch .1–.85radyan.
- Desktop duyarlılık X=.0025, Y=.002.
- Tek mouse event X delta ±120ile sınırlı.
- Mobil delta X ±40, katsayı .004; Y=.003.
- Takip mesafesi8.8; takip yumuşatması1-exp(-10dt).
- Kamera duvar collision/raycast sistemi yoktur.

Avatar gövdesi1.25×1.5×1.25, ayak referansından merkezY=.8. Göz/ağız mesh'leri, hareket yönüne dönüş, yerde squash/bob, havada1.04Y ölçeği, vuruşta Z sallanması vardır.

### Mobil

Sol d-pad54×50düğmeler; dar≤540pxekranda44×44. Sağda78×78jump düğmesi. Sahne sürüklemesi kamerayı döndürür.

pointerup/cancel/lostcapture tuşları temizler. Pause/exit aktif sürüklemeyi de bırakır. Safe-area boşlukları ve≤500pxyükseklik için yatay düzen bulunur.

## K. Görsel sistem, UI ve yerelleştirme

### Platformlar ve materyaller

- Gövde: #31485c, roughness .65.
- Üst: beyaz baz, roughness .55, metalness .12.
- Üst beyaz baz önemlidir; instanceColor ikinci kez koyu bir baz renkle çarpılmaz.

Renk önceliği: pad#ffd47f → warning#f7ad7a → mover#b6c5ff → checkpoint#a6edcc → biyom rengi.

Inactive platformun instance ölçeği0olur; fizikte de active=false kullanılır.

### Çevre ve ışık

- Tek opak taban180×1×350, merkez(0,-2.5,-120).
- Biyom background +65–210LinearFog.
- HemisphereLight2.1.
- DirectionalLight2.5, konum(-15,30,15).
- Ek bloom/AO/composer veya shadow-map zinciri kurulmaz.

Üç orijinal oyun dekor varyantı ×12mantıksal yerleşim kullanılır. Çok parçalı Cyber modelinde her parçanın ayrı InstancedMesh'i olabilir;36yerleşim,36draw-call garantisi değildir.

X bantları±22/±33/±44, Z boyunca yaklaşık44birim aralık. Boyut bounding box'tan çıkarılır. Modelin altı her instance'ın kendi ölçeğiyle Y=-2ye oturtulur; parçalar ayrı ayrı yaklaşma animasyonuna sokulmaz.

### HUD ve sonuç kartı

Kök #obby-hud, body.obby-active.

HUD: OBBY, bölüm n/6, istasyon n/7, checkpoint progress, süre, pause, kısa toast ve kontroller. Bar mesafe bazlı değil, checkpoint geldikçe artan6adımlı göstergedir.

Obby'nin pause/bitiş kartı kendisine aittir; normal3Dpause DOM'unun aynısı değildir. Navy/gold tema kullanır. Pause sırasında sahne yeniden çizilmez.

Yeni anahtarlar: hubGames, obbyJump, obbyNext, obbyBest. Ortak anahtarlar: surfCompleted, surfPaused, surfResume, surfCheckpoint, surfRestart, surfLobby, surfError, level.

Yeni ifadeler30dilde bulunur. Arapçada RTL uygulanır. Bazı aria/tuş etiketleri sabit sembol/İngilizce kalabilir; bütün erişilebilirlik metinleri eksiksiz çevrilmiş kabul edilmemelidir.

Eski koşu/progress/skill/mobile HUD'ları Obby aktifken CSS ile gizlenir. Salon açıkken ilk eldiven kartı gizlenir.

## L. Kayıt, ekonomi, ses ve host entegrasyonu

### Storage

Anahtar: elemental-run-obby-v1.

```json
{
  "best": { "1": 48.35, "2": 51.2 },
  "level": 3
}
```

- best[level]: saniye cinsinden en iyi süre.
- level: sonraki önerilen giriş bölümü; unlocked listesi değildir.
- Constructor1–6arasında kullanır.
- Yarım checkpoint diske kaydedilmez.
- Serbest Obby bölüm seçici yoktur.
- best değerlerinin bütün sayısal kenar durumları için detaylı schema validasyonu yoktur; bozuk kayıt testine açıktır.
- JSON/storage erişim hataları try/catch ile ele alınır.

Obby'ye coin pickup, medal veya kendi altın ödülü eklenmedi. Coin sesinin çalması altın yatırılması değildir. Normal modların cüzdan/PB kayıtlarına doğrudan yazılmaz.

Aktif süre ödülleri host'ta playing ve görünür durumla ilerler. Respawn beklerken state playing olduğundan bu ödül sayacıyla parkur kronometresi birebir aynı değildir.

### Host API

| API | Görev |
| --- | --- |
| tr | Ortak çeviri |
| renderer | Paylaşılan WebGLRenderer |
| mobile/language | Cihaz/dil |
| decor/floorMaterial | Orijinal fabrikalardan owned çıktı/klon |
| interaction | Kullanıcı jestiyle ses açma |
| lock | Desktop pointer lock |
| sound | jump/coin/hit/pad sesleri |
| stateChanged | Gameplay start/stop + audio sync |
| exit | Müzik durdurma ve lobiye dönüş |

ensureObbyRun tek controller oluşturur. startObbyRun normal menü/dialog/input/skill durumunu temizler, viewmodel/ghost'u kapatır. Host isGamePaused=true olabilir; Obby kendi state'iyle çalıştığından bunu Obby durmuş diye yorumlamayın.

Ana stepGame, aktif Obby'yi erken yakalar; Obby update, süre ödülleri, çark ve audio çağrıları sonrası normal koşu fiziğine girmeden return eder.

Blur/visibility/kilit kaybı/context lost pause akışına yönlenir. Platform SDK'sı için mevcut gameplayStart/Stop köprüsü kullanılır; ikinci SDK yüklenmez. Host audio snapshot'ında Obby state'i önceliklidir.

Önceki browser QA'sı SDK stub kullandı. Bu durum canlı Poki Inspector testinin yapıldığı anlamına gelmez.

## M. Performans ve kaynak yaşam döngüsü

- Tek ana RAF;120Hz accumulator.
- update dt clamp .05s.
- İki platform batch'i, instanced dekor ve32kutlama küpü.
- Tekrar kullanılan Color/Object3D/matris yardımcıları.
- Swept collision'da geçici eksen dizileri kaldırıldı.
- Kaba X/Z elemesi ve en fazla4temas çözümlemesi.
- Dekor varyantları arasında setTimeout(0) ile yield; tüm parsing Worker'a taşınmış değildir.
- compileAsync destekleniyorsa kullanılır; GPU upload'ın tamamı asenkron varsayılamaz.
- Pause/preparing durumunda gereksiz eski sahne render'ı yok.
- Bir Obby sahnesi; sonraki bölüm öncekini temizler.

own(resource) bir Set'e ekler. clearScene dispose çağırır, Set'i boşaltır, scene=null, prepared=false yapar. Geometri, materyal, texture, instance kaynakları, label texture ve warmup target owned'dır. Shared renderer dispose edilmez.

Orijinal normal oyun materyalleri clone edilir; paylaşılan kaynağı dispose etmeyin. Render sonunda önceki renderTarget ve autoClear geri yüklenir.

Bu mod normal koşunun iki-biyom streaming sistemini kullanmaz; küçük tek parkur kurar. Eski10level preload düzenini buraya taşımayın.

## N. Bilinen kapsam sınırları ve geliştirme noktaları

Bunlar yapılmış özellik değildir; kaynak incelemesinden çıkarılan dikkat noktalarıdır.

1. Altı tema aynı altı modülü döndürür; derin authored harita çeşitliliği henüz yoktur.
2. Kolay→zor sırası insan oynanış verisiyle kalibre edilmedi.
3. Kamera geometry collision yok; bazı açılarda geometri içinden bakma riski bulunur.
4. Ana key remap/gamepad özel entegrasyonu Obby'de yoktur.
5. Eldiven skill'leri, normal el viewmodel'i ve şapka sistemi Obby'ye taşınmadı.
6. Kronometre duvar-saati değildir; respawn beklemesini saymaz ve çok düşük FPS'de clamp etkilenir.
7. Serbest bölüm seçimi veya yarım checkpoint persistence yoktur.
8. Hızlı mover eklenirse göreli yandan temas yeniden test edilmelidir; tam dinamik-body fiziği yoktur.
9. Yeni üst üste rotalarda mevcut grounded+X/Zcheckpoint testi yeterli olmayabilir.
10. Bozuk storage değerleri için kapsamlı validasyon geliştirmeye açıktır.
11. Yeni iptal/çıkış yollarında prepare/dispose yarışları ayrıca denenmelidir.
12. snapshot yakın platformları/oyuncuyu verir; tam replay veya bütün hazard fazları formatı değildir.
13. Surf/2DtimeRewind ring buffer'ı Obby'de yoktur. Deterministik worldTime otomatik rewind desteği değildir.
14. Özel Obby soundtrack veya rekabetçi leaderboard eklenmedi.
15. Gerçek düşük donanımlı telefon ölçümü ve evrensel60FPS garantisi yoktur.

Bu belge isteği kapsamında bu noktalar oyun kodunda değiştirilmedi.

## O. Testleri tekrar çalıştırma ve kanıt sınırları

CPU:

```powershell
node output/test-obby-146.cjs
```

Kontroller: bütün6modül, ideal balistik yükseklik/boşluk, mover'ın ters fazı dahil geometrik pay, jump/apex/landing, mover taşıması ve sweeper koruması.

Test iniş süresi için diskriminant J²-2G×rise kullanır. Yatay menzilin .88'i ile emniyet payı bırakır. Bu, bütün hazard fazlarında exhaustive solvability ispatı değildir.

Tarayıcı; önce ayrı terminalde sunucu:

```powershell
node output/qa-server-1740.cjs
```

Sonra:

```powershell
node output/run-obby-146-official.mjs --url http://127.0.0.1:4238 --actions-file output/surf-143-actions.json --iterations 1 --pause-ms 250 --screenshot-dir output/qa-obby-check
```

OBBY_MOBILE=1mobil emülasyonu, OBBY_REGRESSION=1diğer modların gerçek girişlerini açar. Bu ortam değişkenlerini ilgili test terminaliyle sınırlayın.

Wrapper gerçek develop-web-game Playwright istemcisini import eder. QA kancaları yalnız response interception ile eklenir; üretim JS'ine yazılmaz.

Gizli Flappy/2Dcanvas'ı en büyük canvas seçimini yanıltabildiği için testte kapatıldıktan sonra DOM'dan çıkarılır. Bunu üretim modlarını silme gerekçesi yapmayın.

Önceki doğrulama klasörleri:

- output/qa-obby-146-release
- output/qa-obby-146-complete
- output/qa-obby-146-mobile-verified

Bu kayıtlar1100×680desktop/844×390mobil görünüm,6tema, CP/respawn/pause/resume/restart, klavye bırakma, mobil yön/jump, finish/exit/re-enter/Flappy ve gerçek Next1→2akışını kapsar. Ayrı regresyonda2D=runner2d, Surf=surf, Endless=running, yeni profildeLevel=tutorial doğrulandı.

Bu belge güncellemesinde önceki testler yeniden yapılmış gibi raporlanmaz. Tam insan playthrough'u, her kombinasyonun exhaustive kontrolü ve gerçek telefon60FPS testi iddia edilmez.

## P. Yeni özellik eklerken birlikte değiştirilmesi gereken yerler

### Yeni modül

1. course içinde veriyi üret.
2. pose ile worldTime tabanlı davranış ver.
3. step içinde gerekiyorsa collision/hazard ekle.
4. build/render ile aynı boyut ve pozda çiz.
5. Görünürlük ve active/collider durumunu eşleştir.
6. own/dispose sahipliğini kaydet.
7. Balistik ve gerçek input testlerini genişlet.

Yalnız mesh eklemek collider eklemek değildir.

### Bölüm sayısı

themes'e satır eklemek tek başına yeterli olmaz. course/constructor clamp, HUD toplamı, finish/save/next üst sınırı, son bölüm next gizleme ve test döngüleri6sayısına bağlıdır.

Etap sayısı da6/7/240/index6değerlerine bağlıdır. Modül adedi değişirse checkpoint, progress, finish ve dünya sınırları birlikte güncellenmelidir.

### Fizik değişikliği

SPEED/JUMP/G değişirse bütün boşlukların dengesi değişir. Yalnız render hızını değiştirmeyin. Destek probunu ve id/index eşleşmesini koruyun.

### Yayın ve dokümantasyon

Aynı kaynak ve aynı ZIP. QA output dışarıda. Gameplay değişirse build/cache güncellenir; yalnız MD güncellemesi oyun sürümünü artırmak zorunda değildir. Local ZIP güncellemesini canlı yayın diye sunmayın.

## Q. Başka bir yapay zekâya verilecek kısa çalışma talimatı

> Elemental Run1.46.0içindeki Obby modu ve mod salonuyla çalışıyorsun. Bu belgeyi ve gerçek kaynakları önce oku. Normal Level/Endless/2D/Surf fiziğini değiştirme. Obby120Hz ayrı saf kinematik controller ve paylaşılan renderer kullanır. Veri, görünürlük ve collider tutarlı olmalı. Mover destek probunu, checkpoint sırasını, kayıt izolasyonunu ve prepare/dispose sahipliğini koru. Belgedeki geliştirme noktalarını yapılmış özellik sanma. Aynı proje klasöründe ilerle, kopya release oluşturma. Değişiklik sonrası CPU ve gerçek tarayıcı/input testleri yap; screenshot ve konsol hatalarını incele. Test kapsamını dürüstçe yaz; doğrulanmamış kusursuzluk/60FPS iddiası verme.

## R. Devralma kontrol listesi

- [ ] BUILD.json ve aktif klasörü doğrula.
- [ ] Dosya yükleme sırasını kontrol et.
- [ ] Modların fizik/kayıt izolasyonunu koru.
- [ ] Altı parkurun veri/fizik testini çalıştır.
- [ ] CP/next/return/mobil input akışlarını dene.
- [ ] Yerelleştirme ve UI taşmalarını kontrol et.
- [ ] Tekrarlanan giriş/çıkışta GPU kaynaklarını izle.
- [ ] Belgeyi gerçek kod değişikliğiyle eşleştir.
- [ ] ZIP'e QA dosyalarını koyma.
- [ ] Canlıya yayınlamadıysan bunu açıkça belirt.

## S. 1.47.0 — kamera, zorluk, aktif süre, ekonomi ve mobil girdi

Bu bölüm 1.46 tabanındaki ilgili eski açıklamaları günceller. Kaynak kodu ve yalnız değişen bloklar: [OBBY_V1_47_CHANGED_BLOCKS.md](OBBY_V1_47_CHANGED_BLOCKS.md).

### S.1 Kamera

ObbyCameraCollider, oyuncunun ayak Y+.8 merkezinden camGoal'a THREE.Raycaster gönderir. solids listesi fizik veri dizisi değil, kamera için Three.js mesh listesidir: platform gövdeleri, opak dekor instance'ları, taban ve hazard parçaları. Avatar/label/konfeti listeye girmez. Matrisler raycast öncesi güncellenir.

İlk kesişmeden .25birim önce güvenli hedef kurulur; üstel lerp uygulanır. Lerp bir köşeyi keserse diye ikinci bir güvenlik rayı aday pozisyonu tekrar sınırlar. İçeri engellenme gerektiğinde güvenlik clamp'i geciktirilmez; dışarı çıkış yumuşaktır. Ray/vector/hit dizisi yeniden kullanılır. Bu merkez-ray yaklaşımıdır, hacimsel kamera fiziği değildir.

### S.2 Zorluk

difficulty(level) normalize smoothstep t üretir.1→6arasında:

| Ayar | Bölüm1 | Bölüm6 |
| --- | ---: | ---: |
| Stone W/D | 6.2/6.4 | 4.6/4 |
| Tile W/D | 6.4/6.6 | 5.2/4.1 |
| Mover W/D | 6.8/8.2 | 5.2/6.7 |
| Mover genliği | 1.25 | 3.25 |
| Coyote | .12s | .10s |
| Tile periyot | 6.1s | 5.8s |
| Tile aktif süre | 5.15s | 4.6s |
| Tile uyarı | .85s | .75s |

Z merkezleri/40birim etaplar korunur; platform derinliğini azaltmak gerçek kenardan-kenara Z boşluğunu artırır. Modül sırası,23platform/5hazard sayısı, G/JUMP/SPEED/DT, swept-AABB ve skin destek testi değişmez. Yalnız iki grounded/coyote ataması bölümün toleransını okur.

### S.3 İki ayrı saat

worldTime ve elapsed hâlâ120Hz simülasyon içindir. HUD/PB/ödül ActivePlayClock üzerinden performance.now kullanır; dt clamp'i bu saati etkilemez.

Eski başlangıç kuralı korunur: başlangıç merkezinden2birim uzaklaşınca saat açılır. Playing sırasında devam eder; respawn beklemesi de sayılır. Pause, blur/hidden üzerinden pause, won, exit ve sonraki hazırlama saati durdurur. Restart sıfırlar. Format60s sınırında0:60.0üretmez.

Snapshot time=aktif gerçek süre; simulationTime=eski fizik sayacı. PB de HUD ile aynı saatten kaydedilir.

### S.4 Kayıt geçişi

Storage anahtarı elemental-run-obby-v1 değişmez. clockVersion=2 eklenir. Önceki sürümün simülasyon best kayıtları legacySimulationBest'e kopyalanır; silinmez. Yeni best tablosu gerçek aktif sürelerle başlar; level ilerlemesi korunur. Yeni best değerleri sonlu/pozitif sayı değilse temizlenir.

Farklı zorluk ve zaman temelleri aynı PB tablosunda kıyaslanmasın diye arşiv ayrımı bilinçlidir.

### S.5 Altın

finishReward şu politikayı kullanır:

- base=25+5×level.
- quality=min(eskiBest,yeniSüre)/yeniSüre; ilk bitirişte1.
- coins=floor(base×(.5+.5×quality)).
- İlk bitiriş bonusu20; yeni PB bonusu10.
- Üst sınır75; genel alt sınır15. Sıfır/geçersiz süre ödemez.

İlk tamamlamalar50–75, aynı rekoru tekrar bitiriş30–55. Daha yavaş denemeler daha az verir. Coin pickup eklenmedi; bu bir bitiş ödülüdür.

won koruması ve runId/idempotent host bank beraber kullanılır. Host id/level/süre ve1–75coin doğrular;128son receipt tutar; cüzdan, collectCoins/playRuns görevleri ve ana menü kaydı güncellenir. Bu istemci taraflı yerel duplicate korumasıdır; sunucu anti-cheat'i değildir.

Sonuç kartında +N◇ görünür. Yarım çıkış veya pause ödemez.

### S.6 Mobil

Görünmez .obby-look-pad sağ yarıyı kaplar. Jump/d-pad kardeş düğmelerdir ve z-index ile üsttedir; HUD header ve modal daha üst katmandadır. Mobil canvas'tan global look dinlenmez. Left canvas dokunuşu kamera çevirmez; yönlendirme d-pad üzerinden sürer.

Look tek pointerId tutar, capture kullanır, up/cancel/lostcapture ile bırakır. Jump'ta başlayan sürükleme look'a devredilmez. Kamera parmağı basılıyken ikinci Jump parmağı kamerayı çalamaz.

### S.7 QA

- output/test-obby-147.cjs: monoton zorluk, coyote, aktif saat pause/resume, reward politikası, dakika formatı.
- output/test-obby-146.cjs: bütün6yeniölçülü parkurun balistik payı, jump/landing/mover/sweeper.
- output/test-surf-1451-order.cjs: eski12Surf haritanın sıra/oda regresyonu.
- output/obby-147-checks.mjs: gerçekThree duvarı/hareketli engel/outward lerp; .5sdt→.05sphysicsclamp sırasında5sHUD; pause sonrası8s; +50cüzdan/duplicate0; legacy migration.
- Aynı resmi client wrapper'ında OBBY_FEATURE_TESTS=1 yeni testleri açar. OBBY_MOBILE=1ile gerçek CDP çoklu touch: Jump drag yaw değiştirmez, lookpad veikinciJump birlikte çalışır.
- output/qa-obby-147-desktop ve output/qa-obby-147-mobile screenshot/state/console kayıtlarıdır. Browser SDK stub kullanır; gerçekcihaz60FPS ve canlıPoki onayı iddia edilmez.

Normal Level/Endless/2D/Surf fiziği değiştirilmedi. Aynı kaynak ve mevcutZIP güncellenir; public yayın ayrıca yapılmalıdır.

## T. 1.48.0 — Obby sanat, oynanış ve ortak arayüz revizyonu

### T.1 Araştırma ve kapsam

Kullanıcı Flappy'nin ana lobiye dönmesini, Obby'nin normal oyunun UI dilini kullanmasını, tüm engel modellerinin ve iki küp karakterin iyileştirilmesini, bölüm hatalarının araştırılmasını istedi.

- [Epic engel parkuru tasarımı](https://dev.epicgames.com/documentation/en-us/fortnite/fall-guys-designing-an-obstacle-course-in-fortnite-creative): okunabilir hareket döngüleri, güvenli bekleme noktaları, sıçratıcı/hareketli engel eşleşmeleri ve karakterin gerçek erişim sınırlarıyla test.
- [Roblox Classic Obby](https://create.roblox.com/docs/tutorials/curriculums/building/get-started): kolaydan zora atlama rotaları ve oynayarak doğrulama.
- [Epic checkpoint akışı](https://dev.epicgames.com/documentation/unreal-engine/parkour-05-course-progress-with-checkpoints): aşama sonlarında güvenli dönüş noktaları.

İlkeler özgün parkurlara uyarlandı; harici oyunların modelleri/haritaları indirilmedi veya kopyalanmadı. Yeni meta-progression/çok oyunculu sistem eklenmedi.

### T.2 Dosyalar ve yükleme sırası

- cube-avatar.js: ortak yuvarlatılmış BufferGeometry, el/ayak rig'i ve yürüyüş/iniş/hava/atılma animasyonu. LobbyHub ve Obby aynı yardımcıyı kullanır; her sahne kaynaklarının sahibidir.
- obby-art.js: platform gövde/kenar/üst yüzey/perçin/yol işaretlerini beş instanced batch ile çizer. Köpük başlıklı piston, kademeli açılan kapı/çerçeve/lamba, kapaklı döner kol ve yaylı sıçratıcı kitleri. Tekrarlanan yuvarlak geometriler sahne-yerel cache kullanır.
- obby-interface.js: yeni pause/sonuç modalı üretmez. Gerçek #pause-screen ve #level-complete-overlay üzerinde Obby adaptörü. Değiştirilen yaprak metin/stil/hidden/disabled değerleri çıkışta geri alınır; ana buton DOM kimlikleri ve normal oyun dinleyicileri korunur.
- obby-run.js/CSS: normal HUD ile eşleştirilen metrikler/ilerleme çubuğu, renderer/camera, mobil pad, checkpoint ve giriş/çıkış.
- obby-course.js: veri ve 120Hz simülasyon; yeni modül verileri ve olaylar.

cube-avatar, lobby-hub'dan önce; obby-art ve obby-interface, obby-run'dan önce yüklenmelidir. Eski .obby-modal/.obby-card kullanılmaz.

### T.3 Altı parkurun akışı

| Level / biyom | Etaplar (sırasıyla) |
| --- | --- |
| 1 / Doğa | basamak, hareketli, döner kol, sıçratıcı, bant, zamanlı karo |
| 2 / Gökyüzü | hareketli, basamak, kapı, sıçratıcı, zamanlı karo, piston |
| 3 / Kar | zamanlı karo, bant, hareketli, çöken, basamak, döner kol |
| 4 / Cyber | kapı, piston, bant, basamak, hareketli, sıçratıcı |
| 5 / Lav | çöken, basamak, piston, kapı, döner kol, sıçratıcı |
| 6 / Su | bant, hareketli, kapı, çöken, basamak, sıçratıcı |

Her parkur hâlâ 240m, altı etap/yedi güvenli checkpoint'tir. 120Hz DT, gravity24, jump9.5, speed7.5 ve swept-AABB/2mm skin temas hesabı korunur. Önceki difficulty eğrisi geçerlidir. Ana yolun erişimi eldiven veya yeni atılma gerektirmez.

Bant flowX/flowZ ile desteklenen oyuncuyu taşır. Kapı çiftleri worldTime sinüsüyle açılır, ışık durum gösterir. Çöken platform ilk gerçek inişten 1.05s sonra çarpışmasını kaybeder, görseli aşağı düşüp küçülür; 3.6s sonra döner. Restart hepsinin, checkpoint dönüşü ilgili etabın touchAt durumunu temizler.

Level3+ basamaklarda altın renkli isteğe bağlı yan rota bulunur. Normal yolun üstünde alçak tavan oluşturmaz: X+8.2, Y4.1, üç adet3.6×6.4m yüzey. Giriş/çıkış ve araları normal atlayışla erişilebilirlik payıyla doğrulanır.

### T.4 Kontroller ve karakter

WASD/oklar kamera-bağıl hareket, Space zıplama, E veya Shift havada kısa atılma, R son checkpoint, Esc gerçek normal pause. Atılma .3s sürer, hedef yatay hızı1.4kat yapar, yukarı hızı en çok1.4'e indirir; aynı hava sürecinde bir kere. Yere inme/respawn sıfırlar. Mobilde Jump'tan ayrı ok simgeli düğme; look pointer'ını devralmaz. Dive etiketi30dilde.

Yuvarlak gövde köşeleri geometriyle oluşturulur; analitik normal kullanılır. Karşı fazlı el/ayaklar, hızla artan adım, yere inişte sıkışma, havada esneme ve atılmada öne eğilme. Lobby'nin mevcut yüz ifadeleri/şapkası korunur. Obby'de göz kırpma, yüz ve yere temas gölgesi vardır. Fizik AABB'si kozmetik animasyonla değişmez.

### T.5 Görsel ve yaşam döngüsü hataları

Cyber bina parçaları eskiden kendi ince AABB yüksekliğine ayrı ölçeklenebiliyordu; neon levhalar tüm ekranı kapatabiliyordu. Her kaynak modelin tüm parçaları ortak union bounds, scale ve instance transform kullanır. Dört çevre varyantı, masaüstünde48/mobilde32instance; yatay boyut cap'i34m (Sky28m). Mobil Cyber mevcut normal oyunun lite bina tariflerini kullanır; detaylı parkur engelleri değişmez. Mobilde çevre satır aralıkları66m, masaüstünde44m; tüm240m parkuru kapsar. Yeni geometri/texture indirmesi yoktur. Gökyüzü zemini mevcut Surf bulut malzemesini kullanır. Şeffaf ikinci zemin eklenmez.

Normal renderer/postprocess yeniden kullanılır; Obby fazı açıkça geçirilir. Ortak AO, aktif render kamerasının near/far değerini okur. Diğer modların normal renderer'ında değerler değişmez. Piston tabanı sabittir; başlık ve teleskopik şaft fizik push değeriyle eşleşir.

Resume gerçek pause ekranını kapatır; son Level6 Next'i gizler. Sonuç adaptörü kapsayıcının innerHTML'ini değiştirmez; native button referansları/dinleyiciler korunur. Fixed-step akümülatörü respawn içinde sıfırlanınca negatif kalmaz. Glide/Surf/normal seviye fiziği bu revizyonun kapsamında değildir.

### T.6 Test kapsamı ve sınırlar

- output/test-obby-148.cjs: tüm ana/yan yol atlayış zarfları, yan rotada alçak tavan olmaması, destek/iniş, mover taşıma, crumble kaybolma/dönüş, tek hava-atılması.
- Eski146/147testleri yeni değişken modül sayılarıyla güncellendi; coyote, saat/ödül ve eski12Surf haritasının sıra testi de çalıştırılır.
- Resmi develop-web-game istemcisi output/run-obby-146-official.mjs üzerinden çalışır. OBBY_FEATURE_TESTS=1 ek148nativeUI/settings/gerçek E input/model testini, OBBY_REGRESSION=1 dört eski mod giriş/dönüşünü, OBBY_MOBILE=1 mobil/CDP çoklu dokunmayı açar.
- Artefaktlar output/qa-obby-148-* ve output/obby-148-stage-* içindedir; QA dosyaları dağıtım ZIP'ine girmez.
- Son doğrulama: output/qa-obby-148-release masaüstü/eski-mod regresyonu ve output/qa-obby-148-mobile-release çoklu dokunma/yatay-dikey UI geçti. Görseller açılarak incelendi, pageerror kaydı oluşmadı. r.info.reset sonrası örnek sahneler54–104draw çağrısı; mobil Cyber lite16,287üçgen. Su çevresi mobilde yaklaşık526binüçgen kalır; gerçek düşük güçlü telefonda GPU/termal profil hâlâ gereklidir.
- Otomatik sınır/akış testleri tüm olası insan hareketlerinin veya gerçek düşük güçlü telefonda sabit60FPS'in garantisi değildir. Browser testleri yerel Poki SDK stub ve yazılımsal GPU kullanır; canlı Poki yayını ayrıca yapılmalıdır.

## U. 1.49.0 — Birinci şahıs Obby ve zor zamanlama parkurları

### U.1 Araştırma: kaynak → uygulama kararı

1. [Neon White / oyun yönetmeni Ben Esposito](https://blog.playstation.com/?p=372564): tekrar denemeyi hızlı tutmak, hareket becerisiyle süreyi iyileştirmek. Obby'de ölümden checkpoint'e dönüş.45→.30s; E/Shift havada atılma korunur. Silah/kart veya yeni metaprogression kopyalanmadı.
2. [Ghostrunner / One More Level geliştirici röportajı](https://www.unrealengine.com/developer-interviews/ghostrunner-is-one-of-the-best-looking-coolest-cyberpunk-games-on-the-market): anlaşılır rota, tutarlı tehlike davranışı ve farklı hareket sınavlarını sıraya koymak. Yeni playlist'ler ve mutlak worldTime tehlike döngüleri; rastgele kaçınılmaz tuzak yok.
3. [Epic Fall Guys parkur tasarımı](https://dev.epicgames.com/documentation/en-us/fortnite/fall-guys-designing-an-obstacle-course-in-fortnite-creative): fanlarla itme, farklı zamanlamalı engeller ve temel hareket sınırlarıyla graybox testi. Çapraz rüzgâr, ayrı fazlı sarkaçlar, güvenli checkpoint aralıkları.
4. [Roblox hareketli dünya](https://create.roblox.com/docs/resources/the-mystery-of-duvall-drive/develop-a-moving-world) ve [hareketli nesneler](https://create.roblox.com/docs/tutorials/use-case-tutorials/physics/create-moving-objects): oyuncuyu hareket eden yüzeyle taşımak ve basit çarpışma şekillerini ayırmak. Bizde Roblox motoru/constraint import edilmedi; mevcut saf AABB içinde dy taşıması ve lift-top zaman hesabı yazıldı. İlk sayfanın doğrudan fetch'i zaman aşımına uğradı; arama indeksindeki yayıncı metni kullanıldı.
5. [Three.js PointerLockControls](https://threejs.org/docs/pages/PointerLockControls.html) ve [Roblox kamera](https://create.roblox.com/docs/workspace/camera): kilit/serbest bırakma, pitch sınırları ve FPS'de kendi gövdesini gizleme. Mevcut özel input adaptörü korundu; OrbitControls/harici fizik eklenmedi.

Görsel araştırma Fall Guys fan/döner kol ve Roblox birinci şahıs platform düzenlerini kapsadı; hiçbir resim/harita/asset indirilmedi. GDC Mirror's Edge kaydı bakım sayfasına yönlendi; içeriği okunmuş gibi kaynak gösterilmedi. Aşağıdaki tüm sayısal değerler kendi motorumuz için ayarlanmış tercihlerdir, başka oyunun birebir fiziği değildir.

### U.2 FPS kamera ve eller

ObbyCameraCollider ve orbit boom kaldırıldı. Kamera X/Z oyuncu merkezinde, Y=ayak+1.58m'dir; fizik AABB'sinin içinde kalır. Euler YXZ, yaw serbest360°, pitch±1.35rad, roll0. Dikey FOV82°; dar portrait76°; atılmada yalnız+3°. Near.06m. Yürüyüş bob'u en çok.012m, iniş dip'i en çok.045m; kamera yönüne otomatik yatış uygulanmaz. Kamera bağımsız yatay hareket yönünü değiştirmez.

Obby kendi küp/yüz/el-ayak/gölge modelini artık oluşturmaz/çizmez; lobi küpü aynı kalır. Host API renderHands ve handScale ile gerçek seçili normal viewmodel'i ödünç verir. İzole handMotion koşu/jump/dash/landing/gaze durumunu tutar. allowIdle=true, yatay hız sıfıra yaklaşınca adım fazını durdurur. Diğer modlarda bu opt-in bayrak yoktur, eski davranış aynıdır.

Portrait'de viewmodel rig'i geçici camera-local Z/Y ofsetiyle çerçeveye sığdırılır; projeksiyon/mesh en-boy oranı değiştirilmez. Shared helper finally içinde rigY/Z, görünürlük, normal kamera konumu/quaternion/FOV/aspect ve opaklık değerlerini geri alır. Aynı renderer + depth-clear + viewmodel layer geçişidir. Eller düşük mobil performans ayarıyla kapatılmışsa mevcut oyuncu tercihi korunur.

UI yeni tema almaz: aynı HUD, pause/settings ve level-result DOM. Ortada küçük nişan noktası, yalnız düşüşte gösterilen küçük altın iniş halkası ve kısa hasar kenar efekti eklendi; yeni açıklama panelleri yoktur. predictLanding yalnız mevcut hızı/aktif yüzeyi okuyan kozmetik tahmindir, otomatik atlama/yönlendirme yapmaz; hareketli platformların geleceğini garanti etmez.

### U.3 Yeni parkur listeleri

| Level | Biyom | Etap sırası |
| --- | --- | --- |
| 1 | Doğa | basamak, alçak bariyer, hareketli, sarkaç, sıçratıcı, enerji perdesi |
| 2 | Sky | rüzgâr, zamanlı karo, asansör, kapı, sarkaç, sıçratıcı |
| 3 | Kar | çöken, hareketli, alçak bariyer, rüzgâr, enerji perdesi, asansör |
| 4 | Cyber | kapı, sarkaç, bant, asansör, enerji perdesi, basamak |
| 5 | Lav | rüzgâr, çöken, piston, alçak bariyer, döner kol, enerji perdesi |
| 6 | Su | bant, hareketli, sarkaç, enerji perdesi, asansör, sıçratıcı |

Her level240m/yedi checkpoint olarak kalır.14farklı etap ailesi vardır;5yeni aile eski9'u tamamlar. Başlangıç/ara checkpoint'ler güvenli bekleme alanlarıdır. Ana yollar eldiven becerisi/dive zorunluluğu olmadan geçilebilirlik zarfında tutulur.

### U.4 Beş yeni engel ailesi

- pendulum: iki küresel köpük başlık, pivotY8.4, L4.5, radius.85; angle=.9sin(worldTime×rate+phase), rate1.1+.07level. Başlığın dünya merkezi sin/cos ile hesaplanır; küre-AABB en yakın nokta testi ile vurur. Vuruş itme ve.65s tekrar-vuruş koruması verir. Görsel mafsal/head merkezi çarpışmayla eşlenir.
- wind: iki yandan fan. gust=max(0,sin(time×1.35+phase))²; X kuvveti−side×(22+2level)×gust. Zeminde ve havada dar köprüde itme; yarım döngü sakin aralık. Input strafe kontrolü kuvveti yenebilir. Altı küçük instanced akım çizgisi/görünen pervane; yeni parçacık tahsisi yoktur.
- pulse:9m geniş/2.8m yüksek, iki enerji perdesi. period=3.8−.08level; active=1.15+.04level; son.65s amber ön uyarı öldürmez. Aktif turuncu çekirdekler öldürür (p.dead),.30s sonra aynı checkpoint. Off süresi en zor seviyede1.93s; tam AABB'yle geçiş mesafesi1.96m, düz hızda yaklaşık.262s. Oyuncu reaksiyonu için pay vardır. Bir ölüm bir kere sayılır/seslenir.
- lift: üç dikey platform, tabanY3.1, genlik.55–.70, rate1+.04level, D7m/W5.2–4.6m. Oyuncu desteklenirken dy taşınır. Yükselen tepe oyuncunun altından geçtiğinde göreli topStart/topEnd yakalaması yapılır; kenar/alt yüzey ve diğer platformlar eski slab sweep'i kullanır. Gövde merkezi teleskopik sütun ve tabanla görünür zemine oturur.
- hurdle: üç alçak yastıklı bariyer, z9/19/29m; üstY3.8, genişlik8.1. Zıplayarak geçilir; yürürken vuruş/itme verir. Renkli kapaklar ve koyu halkalar silüeti ayırır. Aralarında normal iniş ve tekrar atlama mesafesi bırakılır.

### U.5 Zorluk ve fizik sınırları

Gravity24, jump9.5, speed7.5,120Hz, H1.8/R.43,2mm skin,100–120ms coyote ve140ms jump buffer korunur. Düz normal atlayış yaklaşık.79s/5.94m; yeni boşluklar bundan türetilmiştir. Zorluk input gecikmesi veya kontrol toleransını kaldırmakla artırılmadı.

| Parametre | Level1 | Level6 |
| --- | --- | --- |
| Basamak W×D |5.2×5.4|3.6×3.8|
| Mover W×D / genlik |5.4×6.6/1.8|4.2×5.6/2.8|
| Zamanlı karo W×D |5.1×5.2|3.9×3.6|
| Karo dönem/aktif |4.8/3.55s|4.2/3.00s|
| Çöken blok bekleme |.90s|.70s|

Normal tehlike köprüleri12→8.4m; rüzgâr köprüsü6.8m. Bant7.5m geniş, X itmesi1.7+.2level, Z−1.1. Piston hareketi1.35rad/s/4.8m; döner kollar daha hızlı ve yeni köprüye uygun8.3m boyda. Zamanlı karolar−j×.65fazı ve pozitif modulo ile rotaya doğru sırayla açılır. Yan altın rota korunur; alçak tavan oluşturmaz.

### U.6 Kayıt, entegrasyon, bakım

COURSE_VERSION=2. Aynı elemental-run-obby-v1 anahtarı; eski best tablosu previousCourseBest'e taşınır, yeni parkurların süre tablosu temiz başlar. Önceki legacySimulationBest ve level seçimi/unlock korunur; cüzdan silinmez. Eski ve yeni zorluktaki süreler adaletsiz karşılaştırılmaz. Ödül politikası/tek ödeme aynı kalır.

Normal Level/Endless/Surf/2D fizik ve haritaları değişmez. game-runtime değişiklikleri Obby renderHands/ölçek, opt-in viewmodel portrait/idle parametreleri ve Obby pointer-lock-error yönlendirmesidir. Pause/blur/context-loss mevcut akışta korunur. Flappy ana lobide, lobi kamerası üçüncü şahıstır. Yeni download/dependency/harici model yoktur.

### U.7 Doğrulama ve sınırlar

- output/test-obby-149.cjs:14tip, finite/deterministic pose, lift1200tick taşıma + farklı fazda iniş, fan yönü, sarkaç/küre temas, hurdle zıplama, aktif/uyarı pulse, dead step güvenliği, iniş tahmini ve eskiPB arşivi.
- output/test-obby-149-flight.cjs: gerçek120Hz swept fizik içinde65komşu platform bağlantısı/1339farklı başlangıç denemesi. Her bağlantıda en az11başarılı zaman penceresi bulundu. Tüm insan rotalarının kanıtı değildir; tehlike zamanlaması ayrıca test edilir.
- Eski146/147/148 testleri ve12Surf sıra testi korunur; route/reflex olayları yeni modül sayılarıyla test edilir.
- Resmi develop-web-game wrapper: OBBY_FEATURE_TESTS=1 ve OBBY_149_TESTS=1 FPS/gerçekeller/idle/look/model-head eşleşmesi/uyarı-ölüm/tek ölüm sayımı/.3scheckpoint/inişişaretini test eder. OBBY_MOBILE=1 CDP çoklu touch ve portrait; OBBY_REGRESSION=1 diğer modların gerçek giriş/dönüşü.
- Kaynak shader/geometry görselleri testte açılıp incelenir; sahne/raycastrender yerine göz-AABB kamera doğrulanır. Gerçek telefon FPS/termal ve canlı Poki Inspector yine ayrıca test edilmelidir. Otomatik test sonucu evrensel60FPS veya hatasız bütün insan oynanışları anlamına gelmez.
- Nihai artefaktlar: output/qa-obby-149-release(masaüstü+diğer4mod), output/qa-obby-149-mobile-final(çoklu touch+yatay/dikey) PASS. Göz/15açı/no-roll, idle/koşu el fazı, ödünç kamera/FOV/aspect/layers/rig geri alma,5görsel engel, sarkaç collider hizası, öldürücü/uyarı ayrımı, tek ölüm, hızlıCP, iniş halkası, Next/restart/nativeDOM/Flappy kontrol edildi. ÖncekiZIP'e göre8korunan diğer mod/lobi kaynağının SHA256'sı aynıdır. Gerçek cihaz ve gerçek Inspector onayı bu yerel SDK-stub testinin kapsamı değildir.


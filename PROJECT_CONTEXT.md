# ELEMENTAL RUN — geliştirme bağlamı ve devir notu

> Son doğrulanan standart web/Poki kaynak paketi: `BUILD.json` sürüm **1.7.1** (24 Eylül 2026). Bu dosya yeni bir AI agent'a veya geliştiriciye verilecek teknik başlangıç noktasıdır. Geçmiş konuşmadaki tüm isteklerin aynen geçerli olduğunu varsaymayın: aşağıda mevcut kodun gerçekten yaptığı işler anlatılır. Davranış ile bu belge çelişirse kaynak kod ve `render_game_to_text()` çıktısı esas alınır.

## 1. Hangi proje, hangi sürüm?

- **Aktif standart web/Poki kaynağı:** `C:\Users\Pc\Desktop\ELEMENTAL RUN Browser v1.3 relaeses 2\ELEMENTAL RUN Poki v1.5.0\`. Klasörün adında v1.5.0 kalsa da içindeki `BUILD.json`, HTML cache anahtarları ve menü etiketi v1.7.1'dir. Yeni sürüm için sürekli yeni klasör açılmıyor.
- **Dağıtım ZIP'i:** aynı üst klasördeki `ELEMENTAL RUN Poki v1.5.0.zip`; kaynak klasör güncellendiğinde ZIP ayrıca yeniden paketlenmelidir. Yalnızca kaynak dosyayı değiştirmek ZIP'i değiştirmez.
- **Canlı genel site:** <https://shephhh.github.io/elemental-run-browser-v1.3/>. GitHub Pages deposu `Shephhh/elemental-run-browser-v1.3`, `master` dalından `.github/workflows/pages.yml` ile yayınlanıyor. Yerel paket/ZIP değişikliği **siteyi otomatik güncellemez**.
- **Ayrı varyantlar:** `ELEMENTAL RUN Poki Pixel Art v1.5.2` ve `ELEMENTAL RUN Steam v1.4` ayrı ürün kopyalarıdır; standart web/Poki isteği bunları değiştirme yetkisi anlamına gelmez. `C:\Users\Pc\Desktop\elemental run\ELEMENTAL RUN-win32-x64 v1.2` mevcut çalışma dizini eski Electron yapısıdır, kanonik web/Poki kaynak değildir.
- `progress.md` kronolojik değişiklik günlüğüdür; bu belge ise sistem haritasıdır. `assets/hands/README.md` GLB ihracat sözleşmesidir.

## 2. Oyun ve çalışma modeli

Birinci şahıs, otomatik ileri koşulan, dört şeritli 3D endless runner. Oyuncu X yönünde ilerler; zıplama, kayma ve şerit değiştirerek araç/tren/duvar/harita tehlikelerinden kaçınır, altın toplar, yükseltmeler ve eldivenler alır. İki akış vardır: skor eşikleriyle altı biyomdan geçen **Endless** ve sabit seed/harita/hedefe sahip **120 bölümlük Campaign**. İlk açılışta Cyber/City eğitim koşusu; eğitimin sonunda ayrı bitiş/sonraki seviye ekranı vardır. Level 1 Nature, Level 2 Snow, Level 3 City/Cyber başlar. Level 5'te Nature→Sky Mega Jump; başka belirli bölümlerde `LEVEL_TRANSITION_PLANS` ile farklı biyom geçişleri vardır.

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
├─ loading-minigame.js/.css     Yükleme ekranındaki uçuş mini oyunu
├─ lobby-hub.js/.css            Ayrı düz 3D lobi, küp kontrolü, stand/ped/portal ve PLAY
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
4. `loading-minigame.js` başlangıçta eski Elemental Run stilinde kompakt kart/ruh/`PRESS TO PLAY` sunar; etkileşimle geniş uçuş paneli açılır. `OffscreenCanvas` Worker varsa mini oyun orada, yoksa main-thread fallback'te çalışır. Gerçek yükleme sürerken görsel ilerleme yavaşça artar. Yükleme bittiğinde uçuş hiç başlamadıysa geçilir; ruh hâlâ yaşıyorsa oyun kesilmez, ölümünden sonra geçilir. Ölünce yükleme bitmemişse 2 saniye sonra tekrar denenebilir. `markLoadingComplete()` bir Promise kapısıdır; `finishLoading()` sonucu `finalizeLoadingTransition()`e bağlar. Ağır hazırlık sırasında mini oyunu tamamen takılmasız garanti eden gerçek paralel WebGL context yoktur.
5. Yükleme sonrasında 2D ana menüde mod seçimi için tek `OYNA/PLAY` düğmesi bulunur; `level-system.js` artık ayrı Levels düğmesi eklemez. OYNA 3D lobiyi açar ve desktop'ta pointer lock alır; lock lobi→koşu portal geçişinde korunur. İlk eğitim sağdaki EĞİTİM portalından başlar; tamamlandıktan sonra aynı portal seçili LEVEL'i gösterir. Lobide fare hareketi kamerayı döndürür. Koşucunun mouse kamera tercihi ayrı ve varsayılan kapalı kalır. Cache değişikliğinde `index.html` query `?v=...`, `service-worker.js`, `BUILD.json` birlikte güncellenmelidir.

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

- `window.ElementalLobbyHub` kendi `Scene` ve kamerasını kurar, mevcut renderer'ı paylaşır. Lobi X sağ, Y yukarı, -Z ileri eksenlerini kullanır. Koşucu +X ekseninde kalır. Lobi hiçbir curved-world materyal yamasına veya Swept-X çarpışmasına dahil edilmez.
- Durumlar: `menu → exploring → preparing → transition → inactive`. İlk yükleme sonrasında eski temalı 2D menü gösterilir; orada mod seçen ayrı Levels/Endless düğmeleri yoktur. Tek OYNA/PLAY lobiyi açar. `stepGame` lobi açıkken sadece lobi update/render ve ses miksini çalıştırır. Koşucu simülasyonu durur, SDK gameplayStop çağrılır.
- WASD/oklar kamera yönüne göre hareket eder; keyup hızı sıfırlar, Space ile kinematik zıplama yapılır. Masaüstünde PLAY tıklaması canvas'a pointer lock alır; fare hareketi orbit yapar ve lock portal→oyun geçişinde korunur. ESC ayarları açar. Mobilde sol joystick ve sağ alanda sürükleme, kamera merkezleme düğmesi vardır. Gamepad sol çubuk hareket, sağ çubuk orbit, Start ayarlar. Oda sınırları ve standlar için basit XZ AABB, sabit zemin Y kullanılır.
- Sekiz eldiven standında yalnız birer gerçek 3D el GLB'si dönerek gösterilir; yaklaşınca model değişimi/morph yoktur. GLB'ler avatar dururken tek tek, 600 ms aralıkla yüklenir ve lobi açıkken görünür kalır; çıkışta serbest bırakılır. KHR_mesh_quantization attribute'ları float geometriye açılır ve baked emissive albedo lit map olarak kullanılır. Loader epoch kontrolü geç gelen eski isteğin sahneye dönmesini engeller. Koşucunun el önbelleği ayrıdır.
- Pedde 1,5 saniye kesintisiz bekleme işlem başlatır. Pedden çıkmadan yeniden satın alma/reklam/çark tetiklenmez. Diyalog veya reklam açıkken hareket/ped sayacı donar. Yetersiz bakiye para eksiltmez. Ekonomi işlemleri eski `buyOrEquipHandSkin` ve upgrade fonksiyonlarına gider; yeni ayrı save formatı yoktur.
- Upgrade monitoründe raycast UV'si dört satın alma satırına eşlenir; en alttaki satır ortak upgrades/hands penceresini açar. Koşu sırasında ESC menüsündeki Upgrades aynı pencereyi açar; kapatınca koşu duraklatılmış kalır.
- Dünya çarkı mevcut çark panelini açıp döndürür; Level 2 kilidi/cooldown korunur. Reklam standı yalnız `status === completed` için 300 saniye speed bonusu verir. Genel sitede sağlayıcı yoksa ödül verilmez. “2x Speed” mevcut gerçek 1,2x çarpanı kullanır. Canlı reklam envanteri değil, yerel SDK mock'unda iptal/başarı/lifecycle test edilmiştir.
- Portal önce gerekli campaign hazırlığını bekler, sonra 1,15 saniyede kamerayı küpe yaklaştırır. En fazla 1280px genişlikte tek kare render target ile 0,38 saniyelik runner crossfade yapılır ve target dispose edilir. Lobi GLB gösterimleri çıkışta boşaltılır; hafif oda geometrisi yeniden giriş için saklanır ve koşuda çizilmez.
- `render_game_to_text().lobby` ve localhost `__elementalBrowserTest.inspectLobby/showLobby/placeLobbyPlayer/projectLobbyPoint` kontrolleri QA içindir. `output/test-hub*.cjs` uçtan uca masaüstü/mobil/ped/ödül testlerini, `output/run-hub-official.mjs` resmi web-game istemcisine yükleme bekleme adaptörünü içerir. `output/` pakete eklenmez.
- Yeni lobiye özel kısa açıklamalar Türkçe/İngilizce fallback'tir; mevcut mağaza/yükseltme metinleri 30 dilli `tr` sistemini kullanır. Düşük güçlü gerçek cihazda performans ve gerçek Poki reklamı ayrıca cihaz/platform testi gerektirir.
- OYNA öncesi 2D ana menü korunur; ortak mağaza/ayarlar DOM'u ekonomi ve erişilebilirlik için korunur. Lobi biyomu seçili levelin Nature/Snow/City/Lava/Water/Sky fazına uyar ve uygun campaign hazırlığını boşta kademeli başlatır. Portal bitmemiş hazırlığı bekler; tüm cihazlarda sıfır takılma garantisi yoktur. Yayın staging'inde `lobby-hub.css` de `assets/runtime/` altına gider; arka plan yolu `../../elemental run icons/...` yapılmalıdır.

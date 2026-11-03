# Elemental Run — BHOP / SURF güncel teknik devir belgesi

## 30 Ekim 2026 / 1.67.0 — ortak müzik ve altın dengesi

Surf/Bhop artık normal3D koşunun gameplay-music.mp3 müziğini ve aynı .42 temel
müzik katsayısını kullanır;2D müziği değişmez. Ekonomi2toplama=1altın: bank()
toplam floor farkını hesaplar, tek kalan toplama sonraki bankaya taşınır. HUD,
pause, sonuç ve snapshot.coins gerçek altını; snapshot.collectedTokens ham
toplamayı gösterir. Rewind ham p.coins'u geri kurar, eski banked+count şişmesi
kaldırıldı; ödenmiş altın geri alınmaz. History formatı/fizik/harita değişmedi.
Lobi yalnız Games'e yönlendirir, Surf'e zorlamaz. Oynanmamış portal+sütunlar
parlar, gerçek giriş visits kaydıyla söner. Yayın hakları README uyarısı geçerli.

## 29 Ekim 2026 / 1.65.0 — etkileşimli alanda GPU işi yok

1.64'ün otomatik/mesafeye bağlı Surf prewarm'ı kaldırıldı. Surf yalnız portal
seçilince opak geçiş arkasında hazırlanır; tamamlanmış sahne cache'i korunur.
ESC/geri düğmesi gerçek hazırlık işini generation guard ile durdurur, kaplama
kapanıp kuyruk boşalmadan etkileşime dönmez; oyuncu pedin dışına güvenli alınır.
Lobi çizimi yalnız yükleme katmanı varken durur, keşif FPS'si seyreltilmez.
Surf dosyaları/harita/fizik/history ve mevcut max2chunk yaşam döngüsü değişmedi.

## 29 Ekim 2026 / 1.64.0 — portal hazırlığı

Games hazırlık kuyruğu seçili tek Surf levelini arka planda hazırlar; ana lobby
GPU çizim maliyetiyle bütçe paylaşır. Portal aynı promise'i kullanır. Tam hazır,
pending/prepare/restart işi bulunmayan sahne çıkışta tutulur; tekrar giriş mevcut
reset/resetAttempt ile saat, history, oyuncu, el hareketi, skill ve paraları
sıfırlar. Mevcut en fazla iki-chunk streaming sınırı değişmedi; partial sahne
cache edilmez ve seçim değişince dispose yolu çalışır.

`warmProgramReflection(token, root)` renderer'ın küresel geçmiş program listesini
değil root materyallerinin currentProgram kayıtlarını hazırlar. `addWorkshop`
upload'ı yalnız o anki çocuk nesneyi ayrı grupta çizer; her turda tüm gizli
kardeşleri taramaz. GPU işi kısa dilimlerde, tek mod sahibiyle yürür. Fizik120Hz,
history60Hz formatı, haritalar, tetikleyiciler ve ilerleme kuralları aynı.

## 28 Ekim 2026 / 1.62.0 portal ilerleme kuralı

Son kullanıcı isteği, önceki serbest bölüm seçiminin yerini alır. `unlockedLevel()`
`saved.levels[1..n]` içinde sırayla geçerli (>0 saniye) bitirme kaydı arar; ilk
eksik bölüm son erişilebilir bölümdür. `selectedLevel`, `selectLevel`, `changeLevel`
bu sınırı uygular. Eski seçili yüksek bölüm numarası tek başına bölüm açmaz.
Kayıtlar ve rekor süreler silinmez. ESC'de bölüm seçimi yoktur; lobi portalının
sütun okları kullanılır. Host `surfSelection()` gerçek `unlocked` ve `completed`
verir; yeni kayıtta yanlış yıldız gösteren eski `unlocked=maxLevels` kaldırıldı.
Tamamlanan seçili bölüm portal üzerinde tek altın 3D yıldızla işaretlenir.
Hareket, fizik, harita, ses ve rewind kodları değişmedi. CPU162 ve resmi
Playwright162 masaüstü/mobil testleri yeni/eksik/tamamlanmış kayıt geçişlerini sınar.

## 27 Ekim 2026 / 1.58.0 ses eki

Surf/Bhop müziği kullanıcı tarafından sağlanan `Coastal Chiptune.mp3` dosyasıdır;
pakette `assets/audio/surf-coastal-theme.mp3` (3,721,065 byte), yeniden kodlanmadı.
`ElementalAudio.setSurfState` ve `Run.audioState` durum geçişlerini bağlar.
İlk Surf girişinde oluşturulan tek HTMLAudio döngüyle çalar; normal/2D/lobi
müzikleriyle üst üste binmez. Taban ses .17 × master × music; varsayılan
ayarda yaklaşık .0934. Pause/hidden/ad/exit/mute takip edilir. Surf fiziği,
haritaları, el animasyonları ve kontrolleri bu ekte değiştirilmedi.
Dağıtım için müziğin gerekli kullanım hakları kullanıcı tarafından doğrulanmalıdır.

Sürüm: **1.45.1** · Güncelleme: **23 Ekim 2026**.
Bu belge çalışan kaynak kodu anlatır; eski isteklerin tamamının uygulanmış olduğunu varsaymaz.
Eski sürüm kronolojisi progress.md içindedir. Güncel davranış için bu belge ve kod esas alınmalıdır.

Tam harita geometri/renk eki (tarihsel1.33snapshot): [BHOP_SURF_LEVEL_GEOMETRY_REFERENCE.md](BHOP_SURF_LEVEL_GEOMETRY_REFERENCE.md).
Nux, Treehouse3, Beginner ve Utopia içindeki tüm kaynak/runtime katıları, dekorları ve triggerları; dünya koordinatları, çokyüzlü köşeleri/yüzleri, duvar-tavan sınıfları ve yüz bazlı materyal/renk reçeteleriyle listeler. Bu ek normal koşudaki 120 bölümü kapsamaz.
1.34mimari güncellemesi: [SURF_ARCHITECTURE.md](SURF_ARCHITECTURE.md). Eski kapak `v` değerleri değil, tam kaynak vertex'leri artık collision/render temelidir.
1.35hızlanma/zorluk/rota/görsel detay notları: [COURSE_DESIGN_NOTES.md](COURSE_DESIGN_NOTES.md).

## 1. Kaynak, çalıştırma ve kapsam

Aktif kaynak klasörü:
C:/Users/Pc/Desktop/ELEMENTAL RUN Browser v1.3 relaeses 2/ELEMENTAL RUN Poki v1.5.0

Mevcut dağıtım ZIP'i aynı klasörün yanındaki ELEMENTAL RUN Poki v1.5.0.zip dosyasıdır.
Klasör/ZIP adındaki v1.5.0 tarihsel addır; gerçek sürüm BUILD.json içindeki 1.45.1'dir.

### 1.45.1 — oda sırası koruması

Checkpoint/ileri portal/bitiş, navigation alias'larını dikkate alarak sıra doğrular. Erken son platform/bitiş teması veya birden çok aşama atlayan geçiş son kazanılmış checkpoint/spawn'a döner; ölüm/ödül üretmez. Eclipse'in üç üst üste oda hacminde, portalı kullanmadan ilerideki odaya düşme de aynı şekilde geri döner. Doğru portal checkpoint'i güncellediği için sonraki odayı açar. Fizik ve kaynak platformlar değişmez. Testler progress.md.

### 1.45 — yarı açık mimari ve doğal surf çıkışında momentum

- Kapsam yalnız Bhop/Surf. Tam kapalı 1.44 denemesi geri getirilmez. Yeni `surf-shelters.js`, kaynak iniş/rampa kümelerinin bir kısmına biyom uyumlu, uçları açık, gerçek ışıklık ve yan pencere boşluklu geçişler yerleştirir. Açık parkurlar aralarda korunur; harita başına kesin yüzde50 alan iddiası yoktur. 12 haritada toplam55 yeni geçiş; en fazla6/harita,3 instanced draw call. Desktop/mobil geometri aynıdır.
- İniş/spawn/CP yakınında tavan20m, gerçek Surf rampa kümesinde46m. Kaynak katı/portal/iniş ve yüzey üstündeki oyuncu/jump hacimleriyle çakışan adaylar atlanır. Ayaklar kaynak zemine veya gerçek araziye oturur;220m'den uzun temeller reddedilir. Aynı transform render ve convex collider üretir. Yapılar ayrı structureSolids ve genişletilmiş playBounds üzerinden mevcut spatial index'e girer; özgün source vertices/bounds/JSON değiştirilmez. Planlama dilimli ve iptal kontrollü; kaynaklar existing own/dispose ömrüne bağlıdır.
- Doğal rampadan çıkışta SAT kenarının yukarı ayırma ekseni yanlışlıkla yürünebilir yüzey sayılıyordu. Artık gerçek yukarı kaynak yüzeyi doğrulanır; hayali bir karelik ground/sürtünme yoktur. Çoklu temas, önceki temastan kırpılmış vektörü tekrar tekrar kaybettirmek yerine aynı gelen hızdan aday düzlem/iki-düzlem crease çözümü kullanır (Source SDK referansı). Swept SAT testi, fizik sabitleri/120Hz ve36alanlı60Hz History biçimi korunur.
- `velocityMode: retain` kaynak teleportları artık XYZ hızını gerçekten korur; `placeWorkshop` resetinden sonra sıfırda kalmaz. Redirect/normal retry davranışı değişmez. Surf HUD fiziksel3D sürati, Bhop yatay sürati gösterir. Manuel Space/held-jump surf cezası .84 aynıdır; kullanıcı doğal çıkış cezasını istemedi.
- Profil workshop-progressive-drive-v5. Kaynak Level/Endless/2D/lobi modülleri ve12course JSON aynı. Güncel CPU/gerçek tarayıcı kanıtları progress.md; output QA dosyaları dağıtılmaz. Lisans belirsizliği assets/courses/README.md'de korunur.

### 1.43.1 — yalnız Eclipse/seviye10 uçuş ve çevre düzeltmesi

- Tam kapalı alan denemesi kullanıcının isteğiyle tamamen geri alındı; açık çevre korunur. Kaynak platform/trigger geometrisi,12harita sırası/PB'ler,120Hz fizik ve36alanlı60Hz history aynı.
-10Eclipse'in3üst üste parkurunda kaynak brush'lar arasındaki uçuş boşlukları terrain clearance dışında kalmıştı. Görünen catch'e ulaşmadan ek arazi ölüm yaratıyordu. environmentRooms meta verisi3tam uçuş hacmini constrainGround'a ekler; navigation/gerçek collider rotası değiştirilmez. Terrain, bütün bu hacimlerin altında kalır; ayrı şeffaf/tehlike döşemesi eklenmez.
- Eclipse contactOnlyFalls:4s recovery tahminiyle öldürme yok; gerçek arazi/harita sınırı/gerçek destekli return floor teması kullanılır. floorSupports içinde o XZ'de gerçek convex destek yoksa returnFloorY artık trigger.bottom sanal tabanını kullanmaz. Böylece ortada görünen yüzey yokken return trigger'ı öldürmez; diğer haritaların fallback davranışı değişmez. Portal/yeniden deneme düşüş probunu açıkça sıfırlar.
- Gerçek surf kümelerinin üç yükseklik bandına normal oyunun ada/dağ/fener modelleri eklenir. Yükseltilmiş kıyı oluşumları kapalı, konik kaya tabanıyla dünya terrain'ine bağlıdır; tam gövde+destek AABB'si kaynak katıları/portal görüşüyle çakışamaz. Desktop28/mobil16landmark mevcut104/48toplam çevre model bütçesinin içindedir, ek model bütçesi değildir. Destekler tek instanced drawcall. Yerleşim statik, hazırlıkta dilimli/iptal kontrollü. Skyline/kapalı salon geri getirilmez.
- Diğer modlar/kaynak harita dosyaları aynı; test ayrıntıları progress.md. İnsan tam-parkur tamamlaması veya her cihazda60FPS garantisi verilmez.

### 1.43 — dünya zemini, yere oturan çevre ve hızlı boşluk ölümü

- Önceki skyline'da zemin kaldırılmış ama modeller kameranınXYZ konumunu takip etmeye devam etmişti. Bu yüzden yüksek odalarda havada bir bina/ada halkası görünüyordu. Kamera-relative skyline tamamen kaldırıldı. Çevre modelleri artık dünya koordinatında, gerçek arazi yüksekliğinde, ortak depth buffer ile çizilir; kameraya göre x-ray katmanı yoktur.
- Global en alttaki döşemeden başlatılan lower-only smoothing, yüzlerce metre üstteki odaları da bu bodrum seviyesine indiriyordu. Tek heightfield artık gerçek spawn/checkpoint/rota yakınındaki iniş ve rampalardan başlar. Çok yüksek duvar/çatı üstleri iniş sanılmaz; çok odalı haritalarda3D rota mesafesi kontrol edilir. İki bounded stencil pass uzak bodrumu bütün haritaya yaymaz. Ardından HER kaynak katı/dekor AABB'si ve elle tanımlı oda hacmi altında tam hücre-köşe clearance damgası uygulanır. Görünür arazi asla oynanabilir gerçek bir platformun üstüne çıkamaz.
- Kaynak zeminler değişmedi. Arazi tek opak, depth-write mesh; dünyaya bağlıUV. Yatay yüzeyler biyom zeminini kullanır; dik yüzeyler tek shader'da biyom kayasına karışır(şelale gibi dik su/lav dokusu yok). Cyber'da okunur, ince dünya-grid kontrastı var. MeshBasic/Standard uyumlu normal attribute kullanılır; objectNormal'ın Basic'te tanımsız olduğu hata gerçek WebGL testiyle bulundu ve giderildi.
- Yakın çevre instancing üst sınırı mobil48/masaüstü104. Eski ayrı32/48skyline modeli yoktur; toplam üst sınır artmadı. Mobil arazi grid üst sınırı128, masaüstü192. Bina/kulübe/fener temelleri tek instanced draw call'da eğimli taban boşluğunu kapatır;9m'den fazla destek gerektiren aday atlanır. Oynanabilir kaynağa/portal görüşüne müdahale eden adaylar elenir. Sky balon/zeplin doğal olarak uçan modellerdir, sabit dünya koordinatındadır.
- Fail sınırı görünen arazinin O(1) üçgen enterpolasyon örneklemesidir; global minimum-Y'ye kadar beklenmez. Ek olarak, desteksiz9m inişten sonra10Hz'de muhafazakâr4s balistik erişim zarfı sorgulanır. İki ardışık sorguda güvenli catch yüzeyi yoksa ölüm; erişilebilen derin surf inişi engellenmez. Recovery face cache prepare sırasında2ms dilimlerle kurulur, düşüş anında parse/allocation yapılmaz. Teleport/reset/rewind probu sıfırlar;120Hz hareket/SAT veya36alanlı60Hz history değiştirilmedi. Hızlı derin düşüşte erişim derinliği anlık hıza göre genişler; hazır doubleJump/airDash hesaba katılır, aktif glide erken öldürülmez. Ölüm pozu arazi altına geçmez. Noclip normaldeki gibi ayrı yoldur.
- Paralar40ayrıMesh yerine tek InstancedMesh'tir. Eski coinMeshes[i].visible arayüzü küçük handle'larla korunur: toplama/rewind/checkpoint retry/full retry aynı matrix'i açıp kapatır; tekrarlanan görünürlük ataması upload yaratmaz. Paylaşılan torus/material, chunk instance-buffer yaşamından ayrı tutulur.
-12tam harita:11Blueshade(Bhop/Doğa/T1),12Paradigm(Surf/Lav/T4). Eski10sıra/kimlik/PB'ler aynı; yeni kaynaklar aynı official SMF pipeline ve SHA256 doğrulamasıyla. Bu iki kaynakta bütün teleportlar reset dönüşüdür, yanlış ileri portal yoktur. Dağıtım lisansları doğrulanmış sayılmaz; assets/courses/README.md korunmalı.
- GPUcurrent+next2, sourceCPU LRU2; toplu12harita boot yüklemesi yok. Normal Level/Endless/2D kontrol/fizik/haritaları bu sürümde değiştirilmedi. Medaller başlangıç hedefidir; bütün parkurlarda insan tamamlama/donanım60FPS garantisi verilmez. Test raporları progress.md/output içindedir; output dağıtılmaz.

### 1.42 önceki düzeltmeler (tarihçe;1.43üstteki kurallar geçerli)

- Kampanya10tam harita: eski8sıra korunur;9Nila(Bhop/Kar,Pcpie),10Eclipse(Surf/Su,Paper-Cut) eklendi. Kaynak SHA256/yayın koşulları assets/courses/README.md. Yeni hedef süreler ölçülmüş rekor değil, başlangıç tasarım hedefidir. Eski rekorlar kaynak kimliğiyle korunur.
- Kamerayı takip eden skyline zemin dairesi TÜM biyomlardan kaldırıldı. Sky atmosferindeki kameraya yakın5saydam sis-döşemesi de yalnız bu modda kaldırıldı. Tek dünya-ankorlu arazi/kaynak döşeme kalır; Sky opak, mat, düşük parlaklıkta bulut dokusu kullanır. Normal koşunun gökyüzü değişmez.
- solidity=never olarak gelen opak yapısal platformların doğrulanmış gerçek convex hull'ları collision/spatial index'e alındı:62Utopia,46Terra. Yaprak/cam/su/grass ve ince dekor şeritleri hariç; kaynak köşeleri/gap'ler değiştirilmez. Eski su dekor hacimleri, başka biyom zeminiyle çakışmaması için çizilmez(Aztec10,Beginner8). Aztec'te gerçek ileri teleport yoktur; yalnız bitiş portalı kalır.
- Checkpoint kazanımı ayak teması değil,3D swept geçiştir: XZ alanı ve checkpointY-4..+14m hacmi; havada/yüksek hızda geçiş sayılır, uzak üst üste odalar sayılmaz. Eski checkpoint daha yenisini ezmez. Eclipse stageN_nomove teleportları stageN checkpoint kimliğini kullanır.
- İlerleme göstergesi aynı denemenin en yüksek konumsal değerini tutar; geri yürüme/portal/rewind yüzdeyi düşürmez. Full retry/yeni bölümde sıfırlanır; checkpoint retry'da korunur. Süre/çarpışma hesabına karışmaz.
- Glide havada toplam4s ile sınırlı. Bırak/yeniden bas refillemez; yere/surf desteğine iniş veya gerçek teleport sıfırlar. Su uplift'i de aynı sınıra bağlıdır. glideTime36. History alanıdır;120Hz çarpışma çekirdeği aynı,60Hz rewind süreyi geri yükler.
- Kontrollerde tek ayarlanabilir Skill satırı(timeSlow kayıt anahtarı geriye uyumlu); glide/doubleJump ayrı atama satırı yoktur ve Space'e bağlıdır. Pause/ayarlar açıkken Surf wheel handler preventDefault yapmaz; native scroll çalışır. Jump aşağı-wheel/Slide yukarı-wheel oyun sırasında korunur.
- Her biyomun4normal dekor varyantı uzak siluete katılır; varyant başına8mobil/12masaüstü instance. Zemin uydurarak atmosfer doldurulmaz. Hazırlama/current+nextGPU2/sourceCPU2 yaşam döngüsü aynı.
Bu çalışma yerel web/Poki paketidir. Steam/Electron, Pixel veya canlı siteye otomatik yayın yapılmaz.

index.html bir HTTP sunucusuyla açılır; VS Code Live Server uygundur.
file:// üzerinden fetch/GLB yüklemeleri güvenilir değildir.
İlk yükleme -> PLAY -> 3D lobi -> tek SURF & BHOP portalındaki harita seçimi -> dönüşümlü parkur.
Normal Level, Endless ve Canvas 2D ayrı modlardır; bu kontrol/fizik değişiklikleri onlara taşınmaz.

## 2. Modun bugün gerçekten sundukları

- BHOP/SURF mod seçimi yoktur; tek12haritalık workshop kampanyası vardır. Sıra Nux→Beginner→Leaf→Kitsune→Aztec→Utopia→Treehouse3→Terra→Nila→Eclipse→Blueshade→Paradigm; disiplinler Bhop/Surf dönüşümlüdür. Kaynak haritalar TAM kalır. Kullanıcının reddettiği4üretilmiş harita ve surf-custom-maps.js kaldırıldı. Kontrol noktaları bölüm bitirmez; yalnız gerçek end_zone bitirir.
- Tüm haritalar lobide portal okları/istatistik kartlarıyla seçilir; ESC seçicisi kaldırıldı. Eski üretilmiş layout22PB'leri legacyLevels, kısa layout21PB'leri chapterLevels altında korunur; yeni haritaya taşınmaz. Tamamlanmamış haritayı seçmek madalya veya para vermez.
- Tüm kaynak hull'lar hem render hem collision setine geri alındı; oda kesme yoktur. Materyaller opak/çift taraflıdır; araç/playerclip tools yüzleri görünürdür. Yerel source gaps hâlâ tehlikelidir.
- surf-stages.js artık yalnız ElementalSurfNavigation/rota ipuçları ve harita-geneli konumsal progress sağlar; katalog genişletmez veya bitiş kararı vermez. Kaynak forward portalları kimliğe göre ayrıdır, redirect hızı korunur. Diğer return hacimleri yalnız ayak gerçek destek zeminine değince failure UI'ına gider (Phase Shift hariç); gövdenin görünmez hacme girmesi ölüm değildir.
- Checkpoint kapı/sütun modelleri kaldırıldı. Genellikle12x10m mint zemin alanları, duvar/headroom varsa daralır. Yalnız yerel checkpoint desteği yoksa.4m gerçek deck eklenir; alan işareti ve ✓ zemindedir. Yerde ve alandan geçince kazanılır, havada yakınlaşmayla değil; eski checkpoint son respawn'ı ezmez.2ortak drawcall, alınan fill altın.
- 8cm alçalan iniş kenarı/tavan açıklığı, eşzamanlı floor önceliği ve120Hz çekirdek aynı; History36alan(glideTime dahil). Kaynak launch/push konturu kalır ama yön okları/pusula/HUD yönlendirmesi/graf planlama kaldırıldı. Checkpoint ✓ ve duvar detayları kalır.
- Kaynak parse cache2 CPU LRU; GPU active/next üst sınırı2. Yeni4harita aynıSMF→JSON/convex→merged/material/çevre akışı; yeniGLB/bitmap yok. Parmak teğeti artık sabit dünya+X değil kamera yönü/rampa düzlemi; yumuşak normal değişimlerinde kol tarafı korunur. GerçekThree360°/30–144FPS testi var.
- Otomatik ileri koşu korunur. Yön kameraya bağlıdır; 360° yatay bakış açıktır.
- BHOP'ta slide kapalıdır. SURF'te finite slide ve havada aşağı slam vardır.
- Sıfır hızdan giriş platformunda hızlanılır; yarış saati platformdan çıkınca başlar.
- R mevcut haritayı baştan başlatır. Ölümde full restart ve kazanılmış checkpoint ayrı aksiyondur.
- Hız birikiminin tavanı yoktur; sayısal finite koruması hız sınırı değildir.
- Gerçek normal oyun çevre modelleri kullanılır, fakat parkur geometrisi ayrı authored haritalardır.
- Gövde çarpışması custom swept-AABB/convex SAT'tır; harici fizik motoru yoktur.
- Noclip yalnız DEBUG erişiminden sonra F1 ile kullanılabilir.

Eski 120 prosedürel bölüm, Canyon/5 Flow Module ve sürekli +X koridor üreticisi aktif harita sağlayıcısı değildir.
1.32'de course/separatedCourse/BHOP_SOURCE ve addChunk'ın prosedürel fallback'i kaldırıldı.
addChunk yalnız addWorkshop'a delegedir. Fizik dosyası renderer bağımsız hareket/geometri/çarpışma
sorguları ve History motorudur. 120Hz sabit adım + History biçimi korunur; 1.36'da iniş kenarı/tavan açıklığı ve eşzamanlı temas önceliği düzeltildi.

## 3. Dosya sahipliği ve entegrasyon

| Dosya | Sorumluluk |
| --- | --- |
| surf-run.js | State machine, input, harita yaşam döngüsü, HUD, timer, checkpoint/retry, gloves, kamera, debug/noclip |
| surf-physics.js | Renderer bağımsız 120Hz fizik, SAT, friction, air-strafe, gravity, jump ve 60Hz History |
| surf-maps.js | Harita kataloğu/JSON yükleme, convex hull, spatial index, kaynak triggerlar, platform görselleri |
| surf-stages.js | Tam harita checkpoint bacakları, rota ipuçları ve konumsal progress; bölüm ayırma/oda crop yok |
| surf-biomes.js | Tam kaynak çevre sınıflaması, gerçek model fabrikaları, arazi ve instancing |
| surf-architecture.js | Tam mimari/triplanar PBR, kanıt gerektiren görsel kapak API'si, bölgesel batch ve küçük gusset |
| surf-course-polish.js | Yüzeye bağlı sınırlı instanced duvar detayları; rota grafı ve yön okları 1.39'da kaldırıldı |
| surf-effects.js | Sabit particle pool, dash/phase izleri, rewind post-process ve sahip olunan render target |
| surf-run.css | Bu moda ait HUD/modal/mobile stilleri ve stats kartı düzeni |
| assets/courses/*.json | Ölçeklenmiş kaynak convex geometri, spawn, destinations ve triggers |
| assets/courses/README.md | Harita kredileri, kaynaklar ve ticari yeniden dağıtım uyarısı |
| game-runtime.js | ensureSurfRun API, renderer/audio/SDK/wallet, gerçek model fabrikaları, el overlay'i |
| lobby-hub.js | Portal/mod/harita seçimi, geçiş ve istatistik sunumu |
| game-localization.js | Ortak çeviri anahtarları |
| index.html / service-worker.js / BUILD.json | Script sırası, cache sınırı ve sürüm |
| progress.md | Çalışma ve QA kronolojisi |
| output/ | Yalnız geliştirici test araçları; yayın ZIP'ine girmez |

Host, window.ElementalSurfRun(THREE, api) örneğini tembel oluşturur.
api; renderer, bindings, hands, decor, environment, atmosphere, floorMaterial, renderWorld,
wallet bank, skillUsed, pauseUI, lock, stateChanged ve exit gibi bağlantıları sağlar.
Host giriş dinleyicileri aktif mod varsa surfRun.key/mouse/wheel yoluna yönlenir.
Ayrı bir genel keydown/mousemove sistemi ekleyip aynı girdiyi iki kez işletmeyin.

## 4. Haritalar ve geometri

| Tek sıra / disiplin | Kaynak harita | Kredi | Varsayılan biome | Ham solid | Start+CP deck'leri ile |
| --- | --- | --- | --- | ---: | ---: |
| 1 / BHOP | Nux | pcpie | Cyber / City | 1215 | 1219 |
| 2 / SURF | Beginner | STRAFES template listing | Su | 491 | 496 |
| 3 / BHOP | Leaf | Leaf | Kar uyarlaması | 294 | 295 |
| 4 / SURF | Kitsune | Kaynakta belirtilmemiş | Şehir uyarlaması | 2362 | 2363 |
| 5 / BHOP | Aztec | Kaynakta belirtilmemiş | Lav uyarlaması | 337 | 340 |
| 6 / SURF | Utopia | Panzerhandschuh | Gökyüzü | 3351 | 3414 |
| 7 / BHOP | Treehouse3 | ArcticPanda | Doğa | 834 | 835 |
| 8 / SURF | Terra | Rvrb | Su uyarlaması | 573 | 620 |
| 9 / BHOP | Nila | Pcpie | Kar uyarlaması | 1256 | 1260 |
| 10 / SURF | Eclipse | Paper-Cut | Su uyarlaması | 1274 | 1276 |
| 11 / BHOP | Blueshade | Kaynakta belirtilmemiş | Doğa uyarlaması | 2336 | 2346 |
| 12 / SURF | Paradigm | Pyllytonttu | Lav uyarlaması | 1488 | 1536 |

On iki haritanın tamamı Strafes editörünün yayımladığı hazır SMF template'lerinden çevrilmiştir. Yeni kaynak SHA256'ları resmi katalogla doğrulandı. Son sütun start/CP deck'leri ve gerektiğinde gerçek görünür yapısal dekor hull'larını içerir(Paradigm47dahil). Yazar/yayın izni notları assets/courses/README.md içinde korunur; ticari izin doğrulanmış değildir.
Tek ölçek 0.029375'tir; kaynak Z-up -> oyun Y-up dönüşümü uygulanır.
Boşluklara ayrı oran uygulanmaz, görünmez köprüler eklenmez.
Oyun materyalleri/görselleri Elemental Run uyarlamasıdır; Source motoru birebir kopyalanmamıştır.

Her kaynak solid; vertices, faces, planes, SAT axes, X/Z bounds, bottom/top, kind ve id taşır.
Spawn/checkpoint feet konumu en fazla12m aşağıda uygun desteğe ve headroom'a oturtulur.
Her haritada5×4.8m, .42m kalınlığında ayrı başlangıç platformu eklenir.
Start gate yönü spawn yaw'dan hesaplanır; yalnız +X mesafesi değildir.

### Tam kaynak mimarisi ve güvenli render culling (1.34)

Önceki877duvar kapağı kaldırıldı. Sınıflandırma kaynak vertex/plane/SAT axes'i değiştirmez;
1.377duvar ve6tavan etiketi tam yüksekliğiyle korunur. Orijinal oda sınırları geri gelir.
Kameraya bağlı collider crop yoktur. Ortak triplanar/PBR materyali kullanan bölgesel merged
mesh'ler standart frustum culling ile çizilmez/görünür; geometri silinmez.
`surf-architecture.js` içinde statik örtülme+erişilemez derin hacim kanıtı isteyen görsel kapak API'si
vardır; mevcut4haritada kanıt yoktur ve visualCaps=0. Ufak köşe gusset'leri kozmetiktir.

## 5. Koordinatlar, sabit adım ve çarpışma

Dünya birimi metre/saniyedir. +Y yukarıdır; X/Z yatay düzlemdir.
Authored parkurlarda -X ve 180° dönüş geçerlidir; global +X clamp yoktur.
Görsel Curved World offset'leri CPU çarpışma koordinatlarına karıştırılmaz.

- Simülasyon: DT=1/120.
- Frame delta en fazla .1s; update başına en fazla12sabit adım.
- Oyuncu yarı genişliği/derinliği .38m, ayakta yarı yüksekliği .85m.
- Slide yarı yüksekliği .46m; collision skin .002m; stepSize .42m.
- Spatial index16m X/Z hücreleri ve ayrıca large-hull listesi kullanır.
- Broadphase yalnız anlık konumu değil bütün vx/vy/vz * dt süpürme mesafesini kapsar.
- SAT; face normals ve edge×AABB axes ile convex wedge/prism yüzeylerini tarar.
- Temas halinde hız yüzey düzlemine projekte edilir. Yürünebilir normal Y>=.7;
  steep surf bunun altında, Y>.05 olan uygun rampadır.
- Birleşen ribbon'ların iç mikro-kenarları duvar sayılmaz.
- 1.40: destekli surf hareketinde aynı eğime yakın sonraki convex rampanın uç kapağı hızı sıfırlamamalıdır. Normal dot>.985, yükseklik farkı<=.08m ve tam gövde headroom/overlap kontrolü koşuluyla küçük birleşim geçilir. Gerçek yüksek basamak/duvar/ani ters eğim engellenir. Kaynak colliderlar veya History alanları kesilmez.
- Kamera/eller yalnız kozmetiktir; collider/jump height'lardan geri besleme almaz.

3000m/s hızla ince duvar süpürme ve150m/s limit olmaması regresyon testleri vardır.
Bu testler sınırsız her matematiksel koşul veya donanım FPS garantisi değildir.

## 6. Hareket ve bhop

Profil: workshop-progressive-drive-v5.

| Değer | Güncel ayar |
| --- | --- |
| gravity | 23.5m/s² |
| normal jump impulse | sqrt(2 × 23.5 × 57 × .029375), yaklaşık8.87m/s |
| başlangıç koşu hedefi | 260 × .029375 =7.6375m/s |
| üst hız sınırı | Infinity |
| friction | 4 |
| stopSpeed | 75 × .029375 |
| yaw | 360°, atan2 ile wrap |
| pitch sınırı | ±1.05rad, yaklaşık±60° |
| Surf'ten zıplarken yatay hız katsayısı | .84 |
| jump buffer / coyote | .18s / .14s |

Yerde sürtünme hedef hız ÜZERİNDEKİ fazla momentumu sönümler. Auto-drive altında taban hıza yaklaşma `1-exp(-1.8*dt)` ile olur; .25/.5/1/2s hızları2.768/4.532/6.375/7.429m/s. ÖncekiRUN_SPEED*5itişi kaldırıldı. Strafe genliği başlangıç momentumuyla ölçeklenir; yüksek hız sınırı eklenmez.
Normal gövde heading'i kameraya exp damping ile yaklaşır: havada8, yerde13.
A/D kameranın sağı/soluna göre düzeltir, bırakıldığında yan bileşen söner.
Space basılı tutularak authored yüzeylerden auto-bhop yapılabilir.
Kusursuz hop combo'yu artırır, fakat artık ücretsiz1.012 hız çarpanı yoktur.

### Fare ile hız kazanma

Sürekli koşu kontrolüne uyarlanmış keyboardless air-strafe vardır:
havada yumuşak sağ/sol kamera dönüşü örtük A/D isteği sayılır.
Aynı yönde A/D de çalışır; ters A/D yardımcının kazanımını bastırır.
Hız keyfi mouse pixel bonusundan değil projected wish-speed bütçesinden türetilir:

~~~text
add = min(acceleration * dt, max(0, wishCap - dot(velocity, wishDirection)))
newVelocity = velocity + add * wishDirection
~~~

Yardımcı optimumya yakın wish yönünü bulur, sürekli koşunun kamera heading'i korunur.
Düz bakış/zeminde mouse sallama/tek büyük flick bonus üretmez.
Açısal hız render giriş örneğinde ölçülür ve bütün120Hz alt adımlarda paylaşılır.
Mouse air-strafe katsayısı5yerine1.4. 30/60/120FPS karşılaştırması yaklaşık11.2096/11.2100/11.2101m/s verir.
Bu uyarlama stock CS1.6/CS2 motoruyla birebir eşdeğer değildir.

## 7. Kontroller

| Girdi | Normal BHOP/SURF |
| --- | --- |
| Fare | Kamera, 360° yaw |
| A/D veya sol/sağ | Yanal düzeltme |
| Space, W veya yukarı | Jump / basılı auto-bhop; geçerli glove ile glide |
| Mouse wheel down | Jump (yeniden bağlanmadıysa) |
| S, aşağı, Ctrl, wheel up | Yalnız SURF slide/slam |
| E / bağlı skill tuşu | Aktif eldiven yeteneği |
| R | Mevcut haritayı girişinden/sıfır zamandan başlat |
| ESC | Normal oyunun tasarımıyla ortak pause/settings |
| DEBUG dizisi | D,E,B,U,G fiziksel keycode sırası; debug açılır |

Kullanıcının jump/slide/skill binding'leri api.binding üzerinden okunur.
Mobilde A/D düğmeleri ve touch look vardır; Bhop slide düğmesi gizlidir.
Gamepad sol stick strafe, sağ stick look;0jump/1slide/2skill/9pause ile bağlanır.

### 1.31 kamera bug'ı ve korumalar

Normal koşuda mevcut olan mouse-lock guard, Surf host yönlendirmesinde atlanıyordu.
1750movementX tek olayı yaklaşık179.5° ters dönüş üretiyordu; testte yeniden üretildi.
Artık:
- Yalnız kendi renderer canvas'ı pointer-locked ise mouse işlenir.
- Lock/relock, enter/resume/spawn ve teleport giriş durumu sıfırlanır.
- İlk aşırı kilit olayı atılır; diğer olaylar eksen başına±110pixel ile sınırlanır.
- Bir input batch toplamı .45rad'ı aşmaz; queued OS olayları tek frame'de180° yapamaz.
- Budget her readInput örneğinde yenilenir; çok frame boyunca normal360° dönüş korunur.
- NaN/Infinity girdi reddedilir; pause'da bakış işlemez.
- Kamera world-up her render'da(0,1,0) kurulur; ±π wrap yönü süreklidir.

Kaynak oda teleportunun yeni odaya doğru spawn yaw vermesi tasarlanmış davranıştır.
Bunu fare spike'ı ile karıştırıp bütün teleport yaw'larını kaldırmayın.

Mobil portrede A/D genliği .65; yatay drag katsayısı 1.65/genişlik, landscape 2.4/genişlik.
Touch bütçesi portrede .18rad, landscape .35rad/input örneği; ekranın %45'inden büyük tek olay atılır.
Dikey olay .12rad ile sınırlıdır. Orientation değişimi eski drag koordinatlarını sıfırlar.
Desktop/gamepad davranışı korunur; yeni core fizik parametresi yoktur.

## 8. DEBUG / F1 noclip

DEBUG açıldıktan sonra yalnız oynanış sırasında F1 aç/kapatır.
Key repeat yeniden toggle etmez. Debug kapalıyken F1 noclip açamaz.

| Noclip girdisi | İşlev |
| --- | --- |
| W/S, yukarı/aşağı | Bakış yönünde ileri/geri uçuş |
| A/D, sol/sağ | Yana uçuş |
| Space / Ctrl | Yukarı / aşağı |
| Shift | Hızlı uçuş:35m/s; normal12m/s |
| F1 | Noclip'ten çıkış |

Noclip'te otomatik koşu, gravity, çarpışma, damage/return/end triggers, coin collection,
checkpoint/progress, race timer ve rewind capture işletilmez. Wheel/skill/jump/slide normal aksiyonları durur.
Pause çalışır, resume sonrasında açık durumu devam eder. R/reset/exit modu kapatır.
Noclip çıkışında hız sıfırlanır ve history temizlenir.
Gövde bir solidin içindeyse veya harita dışındaysa girişteki güvenli xyz'ye dönülür;
boş alandaysa seçilen noktada normal gravity/çarpışmaya geri geçilir.
Güvenli çıkış kontrolü AABB/convex axes ile yapılır, yalnız merkez noktası testi değildir.

İlk noclip öncesi normal kazanım bank edilir. Ardından attempt debugAssisted işaretlenir:
bu deneme para/rekor/medal/progress save bank etmez. Debug kapatmak işareti silmez;
normal yeni attempt (R/Retry) gerekir. Lokal test amaçlı level geçişi yine mümkündür.
Shift+F1–F6 tema override'ını korur; eski F2–F6 düz tuşları da uyumluluk alias'ıdır.
F1 artık tek başına tema değiştirmez.

## 9. Timer, checkpoint, ölüm ve bölüm sonu

Başlangıç platformunda timerRunning=false. Oyuncu yönlü start gate'i bırakınca süre başlar.
Checkpoint adları doğal sayısal sıraya göre sıralanır(stage1,stage2,stage3 dahil); görünür alanın3D geçiş hacminde swept temas veya geçerli ileri oda teleportunda kazanılır. Havada geçiş kabul edilir; uzak üst üste odalar ve eski checkpoint'ler son respawn kaydını değiştirmez.
Bir dönüş/fall ölüm hacmine düşmek yeni checkpoint kazandırmaz.
Kaynak oda teleportu saati sıfırlamaz. Sonraki harita yeni start gate/saat ile açılır.

Ölüm ekranı:
- Yeniden başla: mevcut haritanın başlangıcı, timer0, checkpoint temiz, coin-taken bayrakları sıfır.
- Checkpoint'ten devam et: yalnız kazanılmışsa etkin; konum, geçen süre ve alınmış coin bayrakları korunur.
- R aynı full restart işlem hattını kullanır; ayrı reset yolu yoktur.

Retry hazır geometri/GPU kaynaklarını yeniden kullanır.
Kaynaklar yeniden kurulmak zorundaysa güncel harita hazırlanır; next map yüzünden giriş bekletilmez.
Double-click job/serial koruması vardır; eski async sonuç yeni retry'ı değiştiremez.
Bölüm, kaynak end_zone temasında biter; +X mesafesiyle tahmin edilmez.
Son haritadan sonra completed modal; diğerinde sonraki authored map spawn'ına geçiş olur.

Madalya surf-maps.js catalog[].targets içindeki açık saniye hedeflerini kullanır; bounds formülü yoktur.
medalFor eşik eşitliğinde üst madalyayı verir (<=); hedeflerin pozitif sırası doğrulanır.

| Harita | Altın | Gümüş | Bronz |
| --- | ---: | ---: | ---: |
| Nux | 60 | 90 | 135 |
| Leaf | 45 | 70 | 105 |
| Treehouse3 | 150 | 210 | 300 |
| Aztec | 60 | 90 | 135 |
| Beginner | 75 | 110 | 165 |
| Kitsune | 150 | 220 | 330 |
| Utopia | 180 | 255 | 360 |
| Terra | 90 | 140 | 210 |
| Nila | 100 | 150 | 225 |
| Eclipse | 150 | 210 | 300 |
| Blueshade | 150 | 225 | 340 |
| Paradigm | 180 | 270 | 405 |

Bunlar elle belirlenmiş başlangıç tasarım hedefleridir, insanla ölçülmüş rekorlar değildir.
Oyuncu testleriyle ayrıca kalibre edilmelidir. Ghost/meta-progression eklenmedi.

## 10. Eldiven yetenekleri — gerçek uygulama

| Eldiven | Skill | Bu moddaki davranış |
| --- | --- | --- |
| Ember Grip | doubleJump | Havada ikinci impulse; toplam iki jump |
| Frost Weave | timeSlow | p.slow=3 world-time, fizik .60ölçek; cooldown12 |
| Forest Guard | glide | Jump basılı/uygun havada gravity .23, düşüş hızı sınırı; uçuş başına4s aktif süre |
| Neon Pulse | airDash | İleri28m/s katkı, momentum+8, .35s dash; cooldown7 |
| Tidebreaker | timeRewind | Son2.5s geçmişe .6s geri oynatma; charge/cooldown12 |
| Solar Forge | magnet |6s mıknatıs; cooldown12; coin toplama erişimi9m |
| Void Walker | phaseShift |3s hazard/hot koruması; cooldown12 |
| Elemental Prime | revive | Uygun ölümde bir kerelik geri döndürme; fatal ground bunu bypass eder |

Phase Shift bu implementasyonda gerçek debug noclip değildir; katı platform collider'ları kaldırılmaz.
Authored ölüm-return hacimleri fatalGround dalından geçtiğinden dokunulmazlık onları güvenli yapmaz.
Glide yalnız jump held ile uygulanır. Bhop'ta slide fizik/giriş/UI seviyesinde engellidir.
Sky glide/air descent ve Water updraft bonusları phase'e bağlı mevcut fixed-loop davranışlarıdır.
Authored maplerde legacy hazards dizisi boş; gerçek tehlikeler kaynak return hacimleri ve boşluğa düşüştür.
kind:hot için P.touchingKind salt-okuma SAT sorgusu kullanılır: gerçek AABB, slide yüksekliği ve
.004m temas toleransı ile üst/yan/eğimli yüzey teması sayılır. 24 ardışık 120Hz adımda (.2s,
floating epsilon ile) ölüm; temastan çıkış/Phase sıfırlar. p.contact'a bağlı değildir.
Raw kind:hot yüklemede korunur. Dört JSON'da hot solid sayısı 0'dır; Lav teması tek başına hasar değildir.

Revive artık chunk.respawn (kazanılmış checkpoint), yoksa data.spawn ile placeWorkshop çağırır.
XYZ/yaw tam korunur; X sıralaması/z=0/y+1 varsayımı yoktur. Hız/hareket buffer'ları, hotTime,
history, wall-brace ve recoil temizlenir; 2s Phase güvenliği. Para/saat/cooldown korunur.
Aynı attempt'te bir kullanım; mevcut fatalGround bypass davranışı değiştirilmedi.

## 11. Rewind determinismi

History151örnekli Float64Array ring buffer'dır;60Hz,2.5s,36alan(1.42glideTime eklendi).
İlk7alan(x,y,z,vx,vy,vz,time) interpolate edilir; ayrık state en yakın örnekten alınır.
age0 artık güncel örneği alır; önceki örneğe istemsiz kayma1.29'da düzeltildi.
Yaw/pitch, movement state, cooldown, effect timers, coin bitmask'leri de kayıttadır.
Coin bayrakları restoreState ile mesh görünürlüğüne geri uygulanır; tekrar toplanabilir.
Coin slotları40ile sınırlandırılmıştır; iki bitmask alanı kullanılır.
Rewind çıkışında contact yeniden bulunur, trigger inside durumları senkronize edilir.

Yeni rastgele davranış eklenecekse spawn sırasında seedlenip saklanmalıdır.
update/render içinde yeni randomness, render-time'a bağlı collision veya dinamik parametreler eklemeyin.
Noclip history'e yazmaz ve geçişte temizler.

## 12. Görseller, platform dili ve gerçek çevre

- Güvenli platform: metal kenar, biyoma uygun kaymaz/mikro dokulu panel, ayrıntılı gövde; dev onay simgesi kaldırıldı.
- Surf face: gerçek steep normalden seçilen mavi fırçalanmış paneller/ince akış çizgileri; dev chevron yoktur.
- 1.41: kırmızı tehlike kaplamaları kaldırıldı. Tehlikeli gerçek kaynak zemin yüzleri, aktif biyomun normal koşudan klonlanan zemin materyalini kullanır. Hasar/return hacimleri değişmedi; görsel kaplama güvenlik/çarpışma kararı vermez.
- Trigger.bottom bir zemin yüksekliği değildir: Treehouse3'te gerçek döşemeden3.23m yukarıda duran sahte levha üretiyordu. Artık tetikleme hacimlerine veya gerçek yüzeylerin üstüne ek paint üçgeni çizilmez; hazardOverlayFaces=0. Yalnız gerçek kaynak yüzey yeniden materyallenir.
- Yeni damage/collider eklenmedi. Marker depth-tested opaktır; yukarıdaki güvenli platformu örtemez.
- Genel biomeFloor/büyük zemin dokuları korunur; simgeler koca zemine gerilmez.
- Uzun deck/ramp UV'leri yaklaşık5.1m'lik tam karo sayısıyla tekrar eder.
- Rol dokuları mobil256px/desktop512px, mipmap+anisotropy4. Materyaller ortak; mimari bölgesel batch'ler ayrı frustum sınırları taşır.
- Gerçek 3B altıgen bağlantı başları: mobil en çok64/desktop128 uygun platformda, tek merged hardware mesh.
- Duvar/tavanlar dünya koordinatlı triplanar panellerdir; güvenli iniş rolü gibi işaretlenmez.
- City mimarisi metalness.5/roughness.6; diğer biyomlar.4/.7. City alt/üst kenarlarda#55c9d2/güç2neon; yumuşak world-XZ value noise. Tek ortak mimari shader programı; uniform phase farkları.
- Kaynak platform/rampa ölçüleri ve parkur mesafeleri değişmedi; eski kesilmiş duvar collider'ları tam kaynak yüksekliğine geri döndü.
- Eldiven/viewmodel Layer1'dir; world/effects Layer0. Eller collider veya camera movement üretmez.
- Surf temasında uygun elin palm/forward-finger kozmetik duvar dayama pozu vardır.
- Gerçek ileri teleport trigger'ları ve end_zone üstünde görünür portal vardır. Tüm girişler harita başına2ortak drawcall(frame+swirl) kullanır; shader zamanı player.time'dır, pause/rewind ile aynı zaman çizgisindedir. Portal görseli çarpışma veya yeni teleport oluşturmaz, ölüm/return zeminine portal koymaz.
- Aynı köşeli polygonların birebir kopyaları ve kapalı brush'ların ortak iç yüzleri yalnız render'dan elenir; convex/SAT kaynağı değişmez. Ek tehlike paint geometrisi tamamen kaldırıldı. World kamera near.16/far2600, el kamerası ayrı restore edilir.
- Kaynak materyaller ve arazi opak/DoubleSide/depthWrite açık; Surf floor klonu shader alpha'yı1'e sabitler. 1.41 groundMaterial/groundUV gerçek döşeme ve ek arazide aynı biyom dokusu ve dünya-ankorlu karo ölçeğini kullanır; dikey temel yüzleri yatay UV'ye sıkıştırılmaz.
- constrainGround her brush/dekor AABB'sinin kapladığı TAM grid hücresinin dört köşesini alt sınırdan en az.5m aşağıya indirir; yalnız vertex-içeride testi değildir. Authored oda hacimlerinde oda altından2m aşağıda kalır. Ardından yalnız alçaltan yumuşatma açıklığı korur; modeller son floorAt yüksekliğine yerleşir. Hazırlık küçük bütçelerde yield/cancel yapar; kare başına yeni arazi hesaplaması yoktur. Skybox yan/tavan yüzleri atmosfer için açık kalabilir, collidable yukarı yüz gizlenmez.

Çevre; normal oyunun decor/floor/environment/atmosphere/sky fabrikalarını kullanır.
City, Nature, Sky, Lava, Water, Snow debug phase override ile desteklenir.
Compound snow/lava model parçaları tek transform ve bütün AABB ile yerleştirilir.
Stage çevresi3D landing kümelerinden örneklenir; max2harita ve instancing bütçeleri korunur.
Yakın çevre en çok mobil32/desktop88 model; 360skyline4varyant×8mobil/12desktop ile
tüm biyomlarda toplam mobil64/desktop136 üst bütçesi. Yerleşim reddi yüzünden daha düşük olabilir.
Model oranları uniform kalır; ağaç/tekne yüksekliği yapay olarak180m'ye uzatılmaz.
Çıkış görüş koridoru, gerçek parkur AABB'leri ve hedef hacimleri boş bırakılır; yakın prop'lar yandan gruplanır.
Uzak skyline daha geride/düşük kontrasttadır; model sayısını artırmak yerine ana rotanın okunması önceliklidir.
Bina-route clearance8m, diğer decor4m'dir. Bir shader/GLB başına obje çoğaltıp draw call patlatmayın.
Uzak gerçek-model skyline katmanı kamerayla taşınır; erken çizilir, depth yazmaz; course yüzeyleri üstünde kalır.

## 13. Streaming, render ve cleanup

prepare -> addWorkshop -> JSON/convex -> merged surfaces -> instanced biome -> environment/atmosphere ->
compileAsync -> küçük render target'a parça parça warmup -> ready -> enter akışı vardır.
CompileAsync tek başına upload maliyetlerini yok saymak için yeterli görülmez; progressive render de yapılır.
Yüksek hacimli işler setTimeout ile küçük zaman dilimlerine bırakılır.

Aktif + sıradaki en fazla2harita tutulur;10level veya bütün biyomlar aynı anda hazırlanmaz.
Generation token iptal edilen async işin sahneye yanlış model eklemesini engeller.
Eski chunk kaynakları retirements kuyruğundan bütçeli drain edilir.
Geometry/material/texture/render-target sahipliği owned set'leriyle izlenir; ortak host kaynakları dispose edilmez.
Pause/death'te particle/loop girişleri temizlenir. Exit scene ve effect kaynaklarını bırakır.
Host composer geçici scene/camera kullanıp sonunda eski değerleri restore eder.
El depth-clear overlay ve CPU/GPU curved-world ayrımı bozulmaz.

VFX: rewind tek bounded VHS/chromatic-split composite kullanır; ikinci renderer yoktur.
Air Dash cyan, Phase mor particle havuzu + compositor-only kenar çizgileri/vignette.
Mobil64/desktop128 sabit parçacık; tek Layer0 Points draw; dt accumulator ile 60/100 parçacık/s.
Boş havuz çizilmez. DOM sadece skill türü değişince güncellenir; reduced-motion animasyonu durdurur.
Pause/death/reset/dispose havuzu, emission accumulator ve DOM modunu temizler.

1.33 isteğiyle oyun içi Credits etiketi/HUD düğmesi/dialog/CSS/girdi kancaları kaldırıldı.
Kaynak README ve catalog yazar/source bilgileri korunur. Ticari kullanım izni hâlâ doğrulanmış değildir.

### Rota göstergeleri — 1.39

Kullanıcı isteğiyle HUD pusulası, zemin yön okları, booster chevron'ları ve rota grafiği kaldırıldı.
Kapı/çerçeve hedef mesh'leri de yoktur. Checkpoint alanlarının sınır işaretleri ve booster pad sınırları kalır;
bunlar yön oku değildir. Checkpoint işaretleri iki ortak draw call kullanır.
İç ilerleme/portal metadata'sı ve gerçek checkpoint kaydı çalışmaya devam eder; yeni History alanı yoktur.
surf-course-polish yalnız sınırlı instanced duvar donanımını üretir; planı boş arrow/route listeleri döndürür.
snapshot.navigation rota oku sayısını sıfır raporlar.

## 14. Kayıt ve ekonomi

Güncel anahtar: elemental-run-workshop-maps-v1.
İlk geçişte elemental-run-bhop-maps-v1 / elemental-run-surf-maps-v1 ve eski son mod tercihi yalnız okunur;
bu anahtarlar silinmez/değiştirilmez. combineProgress rekorları mapId/mapOrder ile tek sıraya taşır.
Güncel unified kayıt varsa esas alınır; eski anahtarlardan her açılışta rekor kopyalanmaz.

Kayıt best, selected, distance ve levels[level]={level,time,medal,layoutVersion,medalVersion}.
Aktif on hazır kaynak haritanın tam-harita geometri layoutVersion19; madalya sınıflaması medalVersion1.
readSave uygun layout19/20 temiz sürelerini targets ile yeniden sınıflar. Kaldırılan dört üretilmiş
layout22 haritanın PB'leri legacyLevels altında korunur; yeni haritalara atanmaz. Eski bütün-harita
PB'leri kaynak kimliğiyle geri alınır; kısa layout21 kayıtları chapterLevels arşivinde tutulur.
Sabit mapId/mapOrder kimlikleri numeric sıra değişiminde süre sahipliğini korur; tüm haritalar serbesttir.
Eski surf-v1/bhop-v1/surf-only-v1 anahtarları yeni kaynak geometri rekorlarıyla körlemesine birleştirilmez.
Disiplin seçicisi kaldırıldı; normal120level ve2D kayıtları bu migrasyona katılmaz.
Wallet ana oyuna api.bank ile delta aktarır; banked watermark tekrar para vermeyi engeller.
DEBUG grant mevcut host debugUnlock davranışıdır; normal oyuncu ödülü sanılmamalıdır.
Noclip-assisted attempt persistent bank/save/record yolundan çıkarılır.
SDK stateChanged yalnız gerçek playing/pause/dead/idle akışını izler; yapay oyun süresi eklenmez.

## 15. QA ve geliştirme döngüsü

Her değişimde küçük input burst -> state -> screenshot -> console kontrolü yapılmalıdır.
render_game_to_text aktif modun snapshot'ını sağlar; noclip/debugAssisted alanları da vardır.
window.advanceTime(ms) deterministik QA için host tarafından sunulur.
__qaSurf/__qaHub gibi erişimler yalnız Playwright route injection'ıdır, ürün API'si değildir.

Önemli testler:
- output/test-surf-140.cjs: tek8sıra/6biyom, iki eski kaydın kimlikle birleşmesi, kaynak hull eşitliği, tüm portallar, kopya render yüz eleme, surf uç-kapak takılma reproducer ve gerçek duvar negatifleri.
- output/test-surf-142.cjs: on başlangıç,16489yukarı yüz sweep, orijinal+promoted hull eşitliği, havadan/swept checkpoint ve uzak üst oda negatifleri, monoton progress,30–144FPS4s glide/rewind, Aztec reset portalı yokluğu, Eclipse named-stage alias'ları.
- output/test-surf-142-ground.mjs: on harita/oda/promoted hull ile367656hücre-köşe açıklığı, oda hacmi negatifleri, dünyaUV/materyal/kaynak vertex değişmezliği/cancel. SkyCanvas materyali gerçek tarayıcıda kontrol edilir.
- output/test-surf-142-lobby-settings.cjs [--mobile]: gerçek lobi ayarlarını aç, cursor kilitsizliğini bekle, gerçek click/wheel ile controls sayfası ve scrollTop'u doğrula; desktop+mobilPASS. İçerik root'u grid minmax(0,1fr) içinde kayar, başlık/X görünür kalır.
- output/test-surf-142-browser.cjs [--mobile]: gerçek PLAY/lobi,10masaüstü/6mobil harita, opacity/UV/kamera zemini yokluğu/Sky bulut/gerçek destek, portal/CP/retry/geçiş/10stats kartı, gerçek wheel ile pause ayarları ve tekSkill satırı.
- output/test-surf-142-motion.cjs:129hareket testlerinin bilinçli36alanHistory beklentisine güncellenmiş sürümü; mekanik/FPS/rewind testleri aynı. output/run-surf-142-official.mjs gerçek resmi action client'ı kullanır, yalnız screenshot sırasında test RAF'ını durdurur(softwareGPU capture backlog önlemi).
- output/test-surf-141-ground.mjs:1.41sekiz harita/oda ve324100hücre-köşe açıklık testinin tarihsel sürümü; Sky materyali artık browser Canvas cloud texture ürettiğinden güncelCPUfixture buna göre ele alınmalıdır.
- output/test-surf-141-browser.cjs [--mobile]: gerçek PLAY/lobi, sekiz masaüstü ve altı mobil harita; ek tehlike mesh'i yokluğu, ortak biyom materyali/dünya UV, opaklık/gerçek destek raycast, portal shader/hedefleri, bölüm sınırı/slide, checkpoint/retry ve8kart stats.
- output/inspect-surf-141-after.cjs ve inspect-surf-141-rooms.cjs: Treehouse3 farklı açılar/üst-alt odalar görsel fixture'ı. output/test-surf-140-browser.cjs kırmızı kaplama isteyen tarihsel testtir; güncel görsel beklenti olarak çalıştırmayın.
- 139browser ve eski seçicili testler tarihsel iki-listeli UI'a aittir; güncel kampanya için140browser kullanın.
- output/test-surf-139.cjs: sekiz hazır haritada kaynak hull/spawn/checkpoint/gerçek zemin teması, kayıt kimliği migrasyonu ve surf el latch'i.
- output/test-surf-139-hands.cjs: gerçek Three matrisiyle 360 derece kamera/dünya birlikte dönüş invariansı, palm/forward tangent, 30/60/120/144 FPS ve kamera restore.
- output/test-surf-139-browser.cjs [--landscape --new]: sekiz harita masaüstü veya dört yeni harita gerçek mobil giriş yolu, render/zemin/checkpoint/retry, ESC seçicisi ve ok yokluğu. Enjekte rampa el pozu görsel fixture'ıdır, insan parkur tamamlama testi değildir.
- output/run-surf-official-high.mjs: resmî develop-web-game client'ı ile gerçek PLAY/lobi/Bhop, compositor restore, screenshot/state/errors.
- Eski 130/133 rota ve ince marker testleri tarihsel davranışı doğrular; kaldırılmış ok/graf/marker sayılarını güncel beklenti olarak kullanmayın.
- output/test-surf-129.cjs:4spawn/üst rota, air-strafe, FPS partition, rewind replay, unlimited sweep.
- output/test-surf-130.cjs:gerçek130death marker, faceRole, yanlış trigger negatifleri.
- output/test-surf-131.cjs:kamera warp/batch, pointer owner, DEBUG/F1, uçuş ve güvenli çıkış, ekonomi koruması.
- output/test-surf-131-browser.cjs [--mobile]:gerçek PLAY/portal, kamera ±π yön sürekliliği, native F1,
  noclip freeze/exit, R/retry/checkpoint,4map ve slide ayrımı.
- output/run-separated-official.mjs:develop-web-game resmi client wrapper'ı; screenshot/state/errors.
- output/test-surf-132.cjs: 360 revive, medal eşikleri/save migration, 24-tick hot temas/phase, portre input,35-alan history.
- output/test-surf-132-browser.cjs:1.32 tarihsel Credits testi; Credits kaldırıldığı için güncel UI testi olarak çalıştırmayın.
- output/test-surf-133-browser.cjs [--mobile]:4haritada spawn/etap/songeçit görsel testleri, Credits yokluğu, sınırlı aktif hedef.
- output/test-surf-133.cjs: gerçek hedefler, dönüş-zemini eleme, güvenli checkpoint fallback, Utopia ileri-rampa ipuçları.
- output/audit-workshop-scope.ps1: paket önceki sürümken çalıştırılır; fizik+History byte-equivalent, normal/2D/host kapsamı.
- output/audit-workshop-scope.ps1:normal host/history şeması ve paket kapsamı.
- output/update-release-package.ps1 + verify-release-1740.ps1:aynı ZIP'i güncelle, her dosyanın SHA256'sını doğrula.

~~~powershell
Set-Location 'C:/Users/Pc/Desktop/ELEMENTAL RUN Browser v1.3 relaeses 2/ELEMENTAL RUN Poki v1.5.0'
& 'C:/Program Files/nodejs/node.exe' output/test-surf-131.cjs
& 'C:/Program Files/nodejs/node.exe' output/test-surf-131-browser.cjs
& 'C:/Program Files/nodejs/node.exe' output/test-surf-131-browser.cjs --mobile
~~~

QAserver4238yalnız görev için açılır/kapatılır; kullanıcının Live Server5500'una dokunulmaz.
output/, ham SMF araştırma dosyaları ve test injection'ları release ZIP'e girmez.
Headless test gerçek cihaz FPS'si veya bütün rotaların insanla tamamlandığı iddiası değildir.

## 16. Sınırlar ve sonraki geliştiriciye notlar

1. Tek kampanyada8tam hazır harita vardır; eski4+4ayrı seçim UI'ını veya120Surf level listesini geri getirmeyin.
2. Source ölçüleri korunmuştur fakat yürütücü arcade/auto-run uyarlamasıdır; stock CS fiziği değildir.
3. Oda trigger yaw geçişleri beklenebilir; pointer-lock warp ile ayrı teşhis edilmelidir.
4. Sekiz haritada kesin koordinat revive testleri geçti; madalya hedefleri insanla kalibre edilmelidir.
5. Phase Shift ile debug noclip birbirine karıştırılmamalıdır.
6. Çevre değişikliği istenmiyorsa surf-biomes/normal model fabrikalarını ellemeyin.
7. Collider görünür yüzeyden bağımsız rastgele crop edilmemelidir; eski eksik platform hatasına dönmeyin.
8. Harita kaynaklarının ticari yeniden dağıtım izni, template'in açık olmasından çıkarılamaz.
   Yayımdan önce assets/courses/README.md kredileri ve ilgili yazar koşulları kontrol edilmelidir.
9. Bu yerel sürüm canlı site/Poki/Steam'e otomatik yüklenmemiştir.

## 17. Referanslar ve tarihçe

- https://strafes.io/ ve resmi editor template'leri; geometri kaynakları assets/courses/README.md.
- https://docs.momentum-mod.org/guide/gamemodes/bhop/
- https://docs.momentum-mod.org/guide/gamemodes/climb/
- https://docs.momentum-mod.org/guide/gamemodes/surf/
- Tarihsel kararlar, eski prosedürel şablonlar, testler ve düzeltmeler: progress.md.
- Güncel kaynak özeti: PROJECT_CONTEXT.md.

Yeni bir agent önce BUILD.json, PROJECT_CONTEXT.md, bu belge ve progress.md'nin güncel bölümünü okumalı;
ardından ilgili kod yolunu takip etmelidir. Eski prompt'taki hedefleri çalışan davranışla karıştırmayın.

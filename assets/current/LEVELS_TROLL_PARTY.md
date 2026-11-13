# Troll Obby ve Party Run — Seviye Referansı

Sürüm: **1.88.3**, 10 Kasım 2026. Troll **CourseVersion 15**, Party **CourseVersion 14**.
Bu belge çalışan obby-course.js dizilerinden hazırlanmıştır. Troll v4 envanterinin
yerine geçer. Party oynanabilir koordinatları, normal Level/Endless/2D/Surf değişmez.

## Ortak koordinatlar ve fizik

+X sağ, +Y yukarı; ilerleme -Z. Platform Y **üst yüzey**, altı Y-H; W X genişliği,
D Z uzunluğudur. 120Hz swept-AABB / G=24 / JUMP=9.5 / temel hız Party=7.5, Troll=7.0 (v1.89.1);
oyuncu R=.43,H=1.8, destek skin2mm. Zıplama tepe farkı 1.88m.
Eldiven/dash gerektiren atlama yok. Uzuvsuz lobi avatarı ve bağımsız orbit kamera
korunur; Troll 3 finali bölgeye bağlı kuşbakışıdır.

## Troll — veri sözleşmesi ve mekanikler

Troll 1 odaları 32 m, Troll 2 ve 3 odaları değişken uzunluktadır. Checkpoint'ler sırayla kazanılır, son checkpoint'e atlamak kazanma
sayılmaz. Ölümden sonra son CP'ye dönüş ve o odadaki tüketilmiş tuzakların reseti.
v11–14 → v15 geçişinde yalnız eski Troll 3 süresi arşivlenir; Troll 1/2 süreleri korunur.
Kazanılmış level erişimleri/satın almalar silinmez.

- fake: inişte collision kaybı.
- approachFake: X/W ve Z/D yakınlığında .16s titreşim, sonra collision kaybı.
- wall: görünmez katı duvar; Troll 1 duvarları temas sonrası da görünmez.
- slideFake: yakınlıkta X yönünde kayan, katı kalan, retry'da yerine dönen taş.
- shoveWall: duvar çözülür, -12Y/+6Z ile aşağı/geriye darbe.
- reversePad: +19Z/+7Y, .7s tekrar kilidi.
- gift: her yüz ölümcül, anında CP.
- hiddenKill: görünmez ölüm hacmi; temas sonrası görünmesi sonraki denemeye ipucu.
- crumble: ilk temastan .8 s sonra kaybolur (Troll 2 yürünebilir sarmal: 2.45 s); checkpoint retry'a kadar geri gelmez.

Troll 1/3 tuzakları `platforms[].trap` üzerinden okunur. Troll 2'nin kayası tek
bir hareketli hazard; dama taşları ve diken tetikleri ayrı spike-board tablosudur.
Normal Party yerleşimleri değiştirilmedi.
Aşağıdaki diziler doğrudan
gerçek veridir, önizleme veya rastgele üretim değildir.

Array sütunları: **[ID, X, Y üst, Z, W, D, H, rol, güvenli rota parçası]**.
Son true değeri bütün platformun tehlikesiz olduğu anlamına gelmez: üzerinde
ayrı bir hediye/hacim bulunabilir. Asıl güvenli geçiş safePath koordinatlarıdır.

### Troll 1 — Doğa / 160 m — Çizime dayalı beş aşama

1. **Sürpriz Kayma** (0 → -32 Z): Aynı 3,6 × 3,6 m boyut ve malzemeye sahip son taş, oyuncu yaklaşınca 0,16 saniyede sağa 4,2 m kayar. Katı yüzeyi ve çizilen model birlikte hareket eder.
2. **Görünmez Köprü** (-32 → -64 Z): İki normal görünümlü yan yol temasla kaybolur. Ortadaki %1 opak sarı köprü sağlamdır.
3. **Ters Psikoloji** (-64 → -96 Z): Önceki aşamayla aynı düzen tersine döner: saydam orta yol sahte, iki yan yol sağlamdır.
4. **Ölümcül Renk Körlüğü** (-96 → -128 Z): 3 × 4 bitişik dama tahtası: parlayan kırmızı kareler sağlam, sıradan görünen kareler anında öldürür. Son karelerden doğrudan kontrol noktasına atlanır.
5. **Görünmez Duvar Labirenti** (-128 → -160 Z): Ortadaki yeşil yüzeyler normal ve sağlamdır. İlk görünmez duvarın yanındaki sarı taşlar %99 şeffaf ama sağlamdır. Turuncu çizginin olduğu ikinci geçişte engel yoktur; kahverengi yan taşlar %99 şeffaftır ve temasla düşürür.

Kontrol noktaları: 0, -32, -64, -96, -128, -160 Z. Hepsinde ayak yüksekliği 8,004 m.
Kaynak `TROLL_ONE_LAYOUT` dizisindeki Z değerleri oda başlangıcına göredir;
aşağıdaki değerler dünya koordinatlarıdır. `slideFake` satırı başlangıç
konumunu gösterir; güvenli rota kayma sonundaki X = 4,2 konumuna gider.

```json
{
  "platforms": [
    [0,0,8,0,12,7,1.25,"CP 0",true],
    [1,0,8,-6.8,3.6,3.6,1.25,"platform",true],
    [2,0,8,-12.6,3.6,3.6,1.25,"platform",true],
    [3,0,8,-18.4,3.6,3.6,1.25,"platform",true],
    [4,0,8,-24,3.6,3.6,1.25,"slideFake",true],
    [5,0,8,-32,12,7,1.25,"CP 1",true],
    [6,0,8,-45,3,14,1.25,"platform/ghost",true],
    [7,-3.45,8,-45,3,14,1.25,"fake",false],
    [8,3.45,8,-45,3,14,1.25,"fake",false],
    [9,0,8,-57,8,4.6,1.25,"platform",true],
    [10,0,8,-64,12,7,1.25,"CP 2",true],
    [11,0,8,-77,3,14,1.25,"fake/ghost",false],
    [12,-3.45,8,-77,3,14,1.25,"platform",true],
    [13,3.45,8,-77,3,14,1.25,"platform",false],
    [14,0,8,-89,8,4.6,1.25,"platform",true],
    [15,0,8,-96,12,7,1.25,"CP 3",true],
    [16,-4.2,8,-105.9,4.2,4.2,1.25,"gift/plain",false],
    [17,0,8,-105.9,4.2,4.2,1.25,"platform/danger",true],
    [18,4.2,8,-105.9,4.2,4.2,1.25,"gift/plain",false],
    [19,-4.2,8,-110.1,4.2,4.2,1.25,"platform/danger",true],
    [20,0,8,-110.1,4.2,4.2,1.25,"gift/plain",false],
    [21,4.2,8,-110.1,4.2,4.2,1.25,"platform/danger",false],
    [22,-4.2,8,-114.3,4.2,4.2,1.25,"gift/plain",false],
    [23,0,8,-114.3,4.2,4.2,1.25,"platform/danger",true],
    [24,4.2,8,-114.3,4.2,4.2,1.25,"gift/plain",false],
    [25,-4.2,8,-118.5,4.2,4.2,1.25,"platform/danger",true],
    [26,0,8,-118.5,4.2,4.2,1.25,"gift/plain",false],
    [27,4.2,8,-118.5,4.2,4.2,1.25,"platform/danger",false],
    [28,0,8,-128,12,7,1.25,"CP 4",true],
    [29,0,8,-136,4.2,4,1.25,"platform",true],
    [30,0,14.5,-141,4.4,0.45,11,"wall",false],
    [31,4,8,-141,2.8,4,1.25,"platform/ghost",true],
    [32,-4,8,-141,2.8,4,1.25,"platform/ghost",false],
    [33,0,8,-145.5,4.2,4.8,1.25,"platform",true],
    [34,-4,8,-150,2.8,4,1.25,"fake/ghostBrown",false],
    [35,4,8,-150,2.8,4,1.25,"fake/ghostBrown",false],
    [36,0,8,-154,4.4,4,1.25,"platform",true],
    [37,0,8,-160,12,7,1.25,"CP 5",true]
  ],
  "hazards": []
}
```

Güvenli yol `[platformID,X,Y,Z]`:

```json
[
  [0,0,8.002,0],
  [1,0,8.002,-6.8],
  [2,0,8.002,-12.6],
  [3,0,8.002,-18.4],
  [4,4.2,8.002,-24],
  [5,0,8.002,-32],
  [6,0,8.002,-45],
  [9,0,8.002,-57],
  [10,0,8.002,-64],
  [12,-3.45,8.002,-77],
  [14,0,8.002,-89],
  [15,0,8.002,-96],
  [17,0,8.002,-105.9],
  [19,-4.2,8.002,-110.1],
  [23,0,8.002,-114.3],
  [25,-4.2,8.002,-118.5],
  [28,0,8.002,-128],
  [29,0,8.002,-136],
  [31,4,8.002,-141],
  [33,0,8.002,-145.5],
  [36,0,8.002,-154],
  [37,0,8.002,-160]
]
```

### Troll 2 — Kar / 381 m — Altı aşamalı parkur

[Ayrıntılı Troll 2 parkur belgesi](TROLL_OBBY_LEVEL_2.md).

Başlangıç ve CP1–CP6 X=0; Z=0/-40/-136/-184/-268/-308/-381. CP3 Y=26.244, CP4–CP6 Y=34.244, önceki noktalar Y=8.004. CP6 bitiştir.

| Aşama | Dünya Z aralığı | Düzen ve tuzak |
|---|---|---|
| Ölümcül Parlak Duvarlar | 0 → −40 | Neon duvarlar 4.8×3.6 m adaların dış kenarına kadar uzanır; arkasında yan geçiş kalmaz. |
| Çıkışı Olmayan Şeffaf Labirent | −40 → −136 | 38.8×76 m iç hacim; 7×13 bağlantılı hücre, kapalı taban/çatı, aydınlatma. Görünmez çıkış duvarına yaklaşınca WRONG WAY tabelası görünür. İki 1.65 m dış kenar açık. |
| Sarmal Çöken Zemin ve Tuzak Pad | −136 → −184 | Üç tam tur, 96 adet 19 cm yürünebilir basamak. Çöken basamak yerinde saydamlaşır; fiziksel destek aynı anda kesilir. Karakter ve kamera yüksekliği yumuşatılır. CP3 Y=26.24. |
| Yuvarlanan Taş ve Sahte Kabinler | −184 → −268 | Tek parça 77×7.8 m rampa oyuncu yönünde 8 m yükselir. Üç çift çatılı kabin. Kaya 3.85 m yarıçaplı; aşağı 22, yukarı 17 m/sn. Kapalı kabin eşiği koruma sağlamaz. |
| Kaçan Bloklar | −268 → −308 | Ölçü, göreli boşluk ve zamanlama aynı. Rampa sonunda Y=34.24'e taşındı. Dört blok birlikte −1.90Z, sonra +3.45Z kayar. |
| Matematiksel Diken Tahtası | −308 → −381 | 16×4 bitişik kare. Satranç düzeninde 32 görünür kırmızı plaka, 16 yem ve 16 güvenli kare. Güvenli rota düz tam-kare atlamaları ve çaprazları karıştırır. Yanlış boş kareye komşu plaka 0.16 s'de kayar. |

Kaynak: `obby-course.js#trollCourse` içindeki Level 2 dizileri; `troll-obby.js` tetik, kontrol noktası ve görüntü güncellemesini yürütür. Hareketli taşların izi yüzey konumunu ele vermez. Aşama geçişleri ve ödüller mevcut sistemle aynıdır.

### Troll 3 — Cyber / 711 m — Siber Denetim

| Aşama | Dünya Z aralığı | Mekanik |
|---|---|---|
| 1 | 0 → −145 | Dört parlak bar, üç sütun, büyük GO/STOP ve sahte yeşil |
| 2 | −145 → −289 | Mavi/pembe üçlüler; görünmez şeritte durmadan açılmayan kontrol noktası |
| 3 | −289 → −434 | Yana üfleyen takipçi vantilatör ve dokuz engel |
| 4 | −434 → −607 | 150,5 m buz ve 15,5 m final atlayışı |
| 5 | −607 → −711 | Dört yükseklik çifti, çizgili ölüm yüzeyleri ve kuşbakışı |

CP0–CP5 X=0, Y=8,004 ve 12×7 m. [Troll 3 ayrıntılı parkur belgesi](TROLL_OBBY_LEVEL_3.md).

## Cyber çevre düzeni / test

Troll Cyber'de gerçek oyunun dokulu bina modelleri korunur; boyları25–46m, en
büyük yatay ölçü38m olacak şekilde dengelenir. Görünmez uzaklara konan115m
landmark ofseti bu sahnede yoktur. Kaynak modeller çember rezervasyonuyla
paketlenir; katmanlar üst üste gelmez. Skyline72m'den başlar,80–260m sisle
bağlanır. İnfill adıyla yerde duran küçük rastgele Cyber küpleri kaldırıldı
(ortak Cyber dekorunda da yok). Parkurun kendisi ve sahte gerçek tuzaklar silinmez.
Tüm binalar mevcut materyal/texture/instancing yolunu kullanır; yeni GLB yok.

`output/troll-1883-course-test.cjs` gerçek 120 Hz adımlarla beş odayı, tuzakları
ve tam güvenli rotayı sınar. `output/run-troll-1883-official.mjs` masaüstü/mobil
Playwright ile lobi girişini, sahne görünümünü, checkpoint dönüşünü, HUD'u ve sonucu kontrol eder.

## Party Run — gerçek oynanış sırası

Birinci şahıs; 9solo round. Kaynak sırası roundOrder=[1,6,2,3,9,4,8,5,7]; portalda görünen numara kaynak kimliğiyle karıştırılmamalı. elemental-run-party-v1 / courseVersion14 korunur. Oynanmış level yıldızı ve açılma kilitleri geçerlidir.

| Level | Kaynak | Ad | Tema | Tür | Uzunluk/alan derinliği | Platform | Tehlike | CP |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| 1 | 1 | Rotor Grove | Doğa | race | 648m | 71 | 41 | 11 |
| 2 | 6 | Tidal Springs | Su | race | 746m | 68 | 7 | 13 |
| 3 | 2 | Frostworks | Kar | race | 694m | 78 | 42 | 13 |
| 4 | 3 | Cloud Cross | Gökyüzü | race | 614m | 172 | 9 | 11 |
| 5 | 9 | Spirit Hunt | Su | hunt | 112m | 106 | 15 | 1 |
| 6 | 4 | Circuit Break | Cyber | race | 714m | 79 | 37 | 12 |
| 7 | 8 | Crumble Basin | Lav | collapse | 65m | 207 | 0 | 1 |
| 8 | 5 | Forge Falls | Lav | race | 718m | 75 | 37 | 12 |
| 9 | 7 | Orbit Survival | Doğa | survival | 65m | 73 | 2 | 1 |

### Party 1: Rotor Grove

Etap dizisi: sweeper-field → triple-propellers → central-shortcut-or-side-discs → final-windmill → pressure-chicane → precision-crossing → tsunami-finale → log-weave → timing-machines → offset-baffle-slalom → extended-finale.

Tsunami takipli yarış; finish kapısı havada da süpürülerek kontrol edilir. Checkpoint Z koordinatları: 0, -48, -95, -154, -202, -296, -378, -446, -502, -582, -648.

### Party 2: Tidal Springs

Etap dizisi: three-drum-steps → water-drum-crossing → moving-drum-stacks → giant-lilies → high-low-finale → pressure-chicane → precision-crossing → tsunami-finale → log-weave → timing-machines → offset-baffle-slalom → extended-finale.

Tsunami takipli yarış; finish kapısı havada da süpürülerek kontrol edilir. Checkpoint Z koordinatları: 0, -45, -99, -156, -212, -267, -346, -414, -482, -550, -618, -688, -746.

### Party 3: Frostworks

Etap dizisi: snowball-slalom → boxing-gauntlet → wind-and-bounce → punch-stairs → flipper-finish → pressure-chicane → precision-crossing → tsunami-finale → log-weave → timing-machines → offset-baffle-slalom → extended-finale.

Tsunami takipli yarış; finish kapısı havada da süpürülerek kontrol edilir. Checkpoint Z koordinatları: 0, -50, -98, -149, -202, -244, -312, -378, -442, -476, -552, -628, -694.

### Party 4: Cloud Cross

Etap dizisi: twin-fans → large-and-side-fans → three-to-two-fans → sweeper-fans → pressure-chicane → precision-crossing → tsunami-finale → log-weave → timing-machines → offset-baffle-slalom → extended-finale.

Tsunami takipli yarış; finish kapısı havada da süpürülerek kontrol edilir. Checkpoint Z koordinatları: 0, -58, -118, -177, -222, -284, -354, -418, -480, -550, -614.

### Party 5: Spirit Hunt

Etap dizisi: hub-and-six-islands → narrow-bridges → elevated-spirit-pads → timed-shutters.

Süre sınırı 120s. Toplama hedefi 28. Checkpoint Z koordinatları: -20.

### Party 6: Circuit Break

Etap dizisi: speed-start → high-beam-low-bumpers → boost-belt → jump-rope-sprint → spring-finish → pressure-chicane → precision-crossing → tsunami-finale → log-weave → timing-machines → offset-baffle-slalom → extended-finale.

Tsunami takipli yarış; finish kapısı havada da süpürülerek kontrol edilir. Checkpoint Z koordinatları: 0, -37, -110, -160, -215, -253, -328, -408, -486, -568, -640, -714.

### Party 7: Crumble Basin

Etap dizisi: collapse → arena.

Süre sınırı 50s. Toplama hedefi 12. Checkpoint Z koordinatları: -10.

### Party 8: Forge Falls

Etap dizisi: axe-bridge → roller-crossing → pendulum-causeway → timed-drawbridges → pressure-chicane → precision-crossing → tsunami-finale → log-weave → timing-machines → offset-baffle-slalom → extended-finale.

Tsunami takipli yarış; finish kapısı havada da süpürülerek kontrol edilir. Checkpoint Z koordinatları: 0, -45, -97, -149, -211, -278, -364, -433, -498, -560, -648, -718.

### Party 9: Orbit Survival

Etap dizisi: survival → permanent-crumbling-floor.

Süre sınırı 45s. Toplama hedefi 12. Checkpoint Z koordinatları: -10.

## Çevre / bitiş ufku düzeltmesi

party-environment.js her iki modun ortak görsel altyapısıdır. Önceki zemin merkezi ileriye yanlış kaydığı için taban finish'ten45m sonra bitiyordu. Artık uzunluk=parkur derinliği+800, merkezZ=-derinlik/2; önünde ve arkasında400m tampon var. Ana model planı ve hafif arka plan240m finish ötesine uzanır; yapı bütçeleri sabittir. Modeller oynarken yaratılmaz, hazırlamada instanced olarak kurulur. Fog uyumlu sonlanma vardır, şeffaf ikinci zemin eklenmez.

Oynanabilir platformlar uzatılmaz; çevre ileride görünse bile finish aynı noktada işler. Party tsunami arkasını silme kuralı ve arena mekanikleri değişmez. Cyber uzaktaki skyline artık sis uygular; parlak, sonsuza kadar görünen kesik dekor sırası yoktur.

## Kod haritası ve bakım

- obby-course.js: veri, platform/trap koordinatları,120Hz fizik.
- party-race.js: Party oyun türleri, takip/CP/finish.
- troll-obby.js: Troll tetikleri, model/kamera, kaynak sahipliği.
- obby-run.js: Party render/input/UI.
- party-environment.js: iki modun gerçek biyomları, dekor planı, taban/arka plan.
- obby-interface.js: ortak native pause/sonuç ekranları.
- game-runtime.js: mod kaydı/portal/preparation, cüzdan ve SDK.

QA: output/horizon-176-test.cjs, output/troll-176-test.cjs, output/party-162-test.cjs ve resmi develop-web-game wrapper. Son9yarışta finish sonrası model konumu, taban400m tamponu, üst üste gelmeme, gerçek fizik bağlantıları ve tarayıcı finish görüntüleri kontrol edilir. Gerçek telefon60FPS veya canlıPoki onayı değildir.


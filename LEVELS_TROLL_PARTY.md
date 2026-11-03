# Troll Obby ve Party Run — Seviye Referansı

Sürüm: **1.74.1**, 3 Kasım 2026. Bu belge çalışan obby-course.js verilerinden hazırlanmıştır; eski Obby belgelerinin yerine güncel parkur başvurusudur. Normal Level/Endless/2D/Surf haritaları kapsam dışıdır.

## Ortak koordinatlar ve fizik

+X sağ, +Y yukarı, ilerleme -Z. Platform y üst yüzeydir; altı y-h. w X genişliği, d Z uzunluğu.120Hz swept-AABB, yerçekimi24, zıplama9.5, temel hız7.5; oyuncu R=.43/H=1.8. Kamera/model değişimi fizik AABB'sini değiştirmez. Destek skin'i2mm.

## Troll Obby

Lobideki gerçek uzuvsuz model ve60°/10.5m üçüncü şahıs kamera. Kamera orbit yaparken avatar dönmez; hareket girdisi yön verir. WASD/oklar, Space, R checkpoint, Esc. Üç kayıtlı level; tamamlanmadan ilerisi açılmaz. CourseVersion3; bağımsız elemental-run-troll-v1 kaydı.

### Mekanikler

- fake: üst temasta anında collision kaybı.
- approachFake: yakınlıkta tetiklenir, .16s titreşim sonrası kaybolur.
- wall: görünmez gerçek duvar, çarpınca2s belirir.
- shoveWall: temasla duvar devreden çıkar, -12Y ve +6Z recoil uygular.
- reversePad: +19Z/+7Y geriye atış, .7s tekrar kilidi.
- gift: her yüzü ölümcül, anında checkpoint.
- hiddenKill: görünmez ölüm hacmi; temas sonrası görünerek sonraki denemeye ipucu verir.
- crumble: inişten .8s sonra destek kaybı; yerel retry sıfırlar.

Her odanın gerçek geçiş rotası vardır. Yanıltıcı hacimler güvenli bağlantıları kapatmaz. Checkpoint'ler sırayla kazanılır; son bölüme uçmak tamamlanma sayılmaz. Düşüş .65s izlendikten sonra checkpoint dönüşü; süre devam eder. Finish bir defa süre/ödül kaydeder.

### Troll 1 — Doğa, 160m

| Oda | Başlangıç Z | Düzen |
| --- | ---: | --- |
| 1 | 0 | fake_stones |
| 2 | -40 | invisible_wall |
| 3 | -80 | troll_bounce |
| 4 | -120 | gift_bricks |

Checkpoint'ler: 0: (0, 8.004, 0); 1: (0, 8.004, -40); 2: (0, 8.004, -80); 3: (0, 8.004, -120); 4: (0, 8.004, -160).

#### Platform ve tuzak envanteri

| ID | X | Y üst | Z | W × D × H | Rol | Güvenli rota |
| --- | ---: | ---: | ---: | --- | --- | --- |
| 0 | 0.00 | 8 | 0 | 16 × 8 × 1.25 | CP 0 | evet |
| 1 | 5.00 | 8 | -11 | 5 × 12 × 1.25 | platform | evet |
| 2 | 5.00 | 8 | -27 | 5 × 14 × 1.25 | platform | evet |
| 3 | -2.00 | 8 | -9 | 5 × 5 × 1.25 | fake | — |
| 4 | -2.00 | 8 | -16 | 5 × 5 × 1.25 | fake | — |
| 5 | -2.00 | 8 | -23 | 5 × 5 × 1.25 | approachFake | — |
| 6 | -2.00 | 8 | -30 | 5 × 5 × 1.25 | fake | — |
| 7 | 0.00 | 8 | -40 | 16 × 8 × 1.25 | CP 1 | evet |
| 8 | 0.00 | 8 | -50 | 14 × 9 × 1.25 | platform | evet |
| 9 | -6.00 | 8 | -61 | 4 × 10 × 1.25 | platform | evet |
| 10 | 0.00 | 8 | -71 | 14 × 9 × 1.25 | platform | evet |
| 11 | 0.00 | 13 | -56 | 8 × 0.45 × 5 | wall | — |
| 12 | 5.50 | 12 | -63 | 3 × 0.45 × 4 | shoveWall | — |
| 13 | 0.00 | 8 | -80 | 16 × 8 × 1.25 | CP 2 | evet |
| 14 | 0.00 | 8 | -89 | 13 × 10 × 1.25 | platform | evet |
| 15 | 5.50 | 8 | -100 | 4.5 × 12 × 1.25 | platform | evet |
| 16 | 0.00 | 8 | -111 | 13 × 10 × 1.25 | platform | evet |
| 17 | -2.00 | 8 | -100 | 5 × 7 × 1.25 | reversePad | — |
| 18 | 0.00 | 8 | -120 | 16 × 8 × 1.25 | CP 3 | evet |
| 19 | 2.00 | 8 | -130 | 6 × 5 × 1.25 | platform | evet |
| 20 | -0.10 | 9.6 | -130 | 1.3 × 1.6 × 1.6 | gift | — |
| 21 | -2.00 | 8 | -137 | 6 × 5 × 1.25 | platform | evet |
| 22 | -4.10 | 9.6 | -137 | 1.3 × 1.6 × 1.6 | gift | — |
| 23 | 2.00 | 8 | -144 | 6 × 5 × 1.25 | platform | evet |
| 24 | -0.10 | 9.6 | -144 | 1.3 × 1.6 × 1.6 | gift | — |
| 25 | 0.00 | 8 | -151 | 6 × 5 × 1.25 | platform | evet |
| 26 | -2.10 | 9.6 | -151 | 1.3 × 1.6 × 1.6 | gift | — |
| 27 | 0.00 | 8 | -160 | 16 × 8 × 1.25 | CP 4 | evet |

### Troll 2 — Kar, 200m

| Oda | Başlangıç Z | Düzen |
| --- | ---: | --- |
| 1 | 0 | gift_bricks |
| 2 | -40 | crumble_steps |
| 3 | -80 | fake_stones |
| 4 | -120 | troll_bounce |
| 5 | -160 | invisible_wall |

Checkpoint'ler: 0: (0, 8.004, 0); 1: (0, 8.004, -40); 2: (0, 8.004, -80); 3: (0, 8.004, -120); 4: (0, 8.004, -160); 5: (0, 8.004, -200).

#### Platform ve tuzak envanteri

| ID | X | Y üst | Z | W × D × H | Rol | Güvenli rota |
| --- | ---: | ---: | ---: | --- | --- | --- |
| 0 | 0.00 | 8 | 0 | 16 × 8 × 1.25 | CP 0 | evet |
| 1 | 2.00 | 8 | -10 | 6 × 5 × 1.25 | platform | evet |
| 2 | -0.10 | 9.6 | -10 | 1.3 × 1.6 × 1.6 | gift | — |
| 3 | -2.00 | 8 | -17 | 6 × 5 × 1.25 | platform | evet |
| 4 | -4.10 | 9.6 | -17 | 1.3 × 1.6 × 1.6 | gift | — |
| 5 | 2.00 | 8 | -24 | 6 × 5 × 1.25 | platform | evet |
| 6 | -0.10 | 9.6 | -24 | 1.3 × 1.6 × 1.6 | gift | — |
| 7 | 0.00 | 8 | -31 | 6 × 5 × 1.25 | platform | evet |
| 8 | -2.10 | 9.6 | -31 | 1.3 × 1.6 × 1.6 | gift | — |
| 9 | 0.00 | 8 | -40 | 16 × 8 × 1.25 | CP 1 | evet |
| 10 | 0.00 | 8 | -50 | 5.5 × 5 × 1.25 | crumble | evet |
| 11 | 1.86 | 8 | -57 | 5.5 × 5 × 1.25 | crumble | evet |
| 12 | 1.35 | 8 | -64 | 5.5 × 5 × 1.25 | crumble | evet |
| 13 | -0.89 | 8 | -71 | 5.5 × 5 × 1.25 | crumble | evet |
| 14 | -5.00 | 8 | -59 | 4.5 × 8 × 1.25 | fake | — |
| 15 | 0.00 | 8 | -80 | 16 × 8 × 1.25 | CP 2 | evet |
| 16 | -5.00 | 8 | -91 | 5 × 12 × 1.25 | platform | evet |
| 17 | -5.00 | 8 | -107 | 5 × 14 × 1.25 | platform | evet |
| 18 | 2.00 | 8 | -89 | 5 × 5 × 1.25 | fake | — |
| 19 | 2.00 | 8 | -96 | 5 × 5 × 1.25 | fake | — |
| 20 | 2.00 | 8 | -103 | 5 × 5 × 1.25 | approachFake | — |
| 21 | 2.00 | 8 | -110 | 5 × 5 × 1.25 | fake | — |
| 22 | 0.00 | 8 | -120 | 16 × 8 × 1.25 | CP 3 | evet |
| 23 | 0.00 | 8 | -129 | 13 × 10 × 1.25 | platform | evet |
| 24 | 5.50 | 8 | -140 | 4.5 × 12 × 1.25 | platform | evet |
| 25 | 0.00 | 8 | -151 | 13 × 10 × 1.25 | platform | evet |
| 26 | -2.00 | 8 | -140 | 5 × 7 × 1.25 | reversePad | — |
| 27 | 0.00 | 8 | -160 | 16 × 8 × 1.25 | CP 4 | evet |
| 28 | 0.00 | 8 | -170 | 14 × 9 × 1.25 | platform | evet |
| 29 | -6.00 | 8 | -181 | 4 × 10 × 1.25 | platform | evet |
| 30 | 0.00 | 8 | -191 | 14 × 9 × 1.25 | platform | evet |
| 31 | 0.00 | 13 | -176 | 8 × 0.45 × 5 | wall | — |
| 32 | 5.50 | 12 | -183 | 3 × 0.45 × 4 | shoveWall | — |
| 33 | 0.00 | 8 | -200 | 16 × 8 × 1.25 | CP 5 | evet |

### Troll 3 — Cyber, 240m

| Oda | Başlangıç Z | Düzen |
| --- | ---: | --- |
| 1 | 0 | invisible_wall |
| 2 | -40 | troll_bounce |
| 3 | -80 | crumble_steps |
| 4 | -120 | gift_bricks |
| 5 | -160 | fake_stones |
| 6 | -200 | finale |

Checkpoint'ler: 0: (0, 8.004, 0); 1: (0, 8.004, -40); 2: (0, 8.004, -80); 3: (0, 8.004, -120); 4: (0, 8.004, -160); 5: (0, 8.004, -200); 6: (0, 8.004, -240).

#### Platform ve tuzak envanteri

| ID | X | Y üst | Z | W × D × H | Rol | Güvenli rota |
| --- | ---: | ---: | ---: | --- | --- | --- |
| 0 | 0.00 | 8 | 0 | 16 × 8 × 1.25 | CP 0 | evet |
| 1 | 0.00 | 8 | -10 | 14 × 9 × 1.25 | platform | evet |
| 2 | 6.00 | 8 | -21 | 4 × 10 × 1.25 | platform | evet |
| 3 | 0.00 | 8 | -31 | 14 × 9 × 1.25 | platform | evet |
| 4 | 0.00 | 13 | -16 | 8 × 0.45 × 5 | wall | — |
| 5 | -5.50 | 12 | -23 | 3 × 0.45 × 4 | shoveWall | — |
| 6 | 0.00 | 8 | -40 | 16 × 8 × 1.25 | CP 1 | evet |
| 7 | 0.00 | 8 | -49 | 13 × 10 × 1.25 | platform | evet |
| 8 | -5.50 | 8 | -60 | 4.5 × 12 × 1.25 | platform | evet |
| 9 | 0.00 | 8 | -71 | 13 × 10 × 1.25 | platform | evet |
| 10 | 2.00 | 8 | -60 | 5 × 7 × 1.25 | reversePad | — |
| 11 | 0.00 | 8 | -80 | 16 × 8 × 1.25 | CP 2 | evet |
| 12 | 0.00 | 8 | -90 | 5.5 × 5 × 1.25 | crumble | evet |
| 13 | 1.86 | 8 | -97 | 5.5 × 5 × 1.25 | crumble | evet |
| 14 | 1.35 | 8 | -104 | 5.5 × 5 × 1.25 | crumble | evet |
| 15 | -0.89 | 8 | -111 | 5.5 × 5 × 1.25 | crumble | evet |
| 16 | -5.00 | 8 | -99 | 4.5 × 8 × 1.25 | fake | — |
| 17 | 0.00 | 8 | -120 | 16 × 8 × 1.25 | CP 3 | evet |
| 18 | 2.00 | 8 | -130 | 6 × 5 × 1.25 | platform | evet |
| 19 | -0.10 | 9.6 | -130 | 1.3 × 1.6 × 1.6 | gift | — |
| 20 | -2.00 | 8 | -137 | 6 × 5 × 1.25 | platform | evet |
| 21 | -4.10 | 9.6 | -137 | 1.3 × 1.6 × 1.6 | gift | — |
| 22 | 2.00 | 8 | -144 | 6 × 5 × 1.25 | platform | evet |
| 23 | -0.10 | 9.6 | -144 | 1.3 × 1.6 × 1.6 | gift | — |
| 24 | 0.00 | 8 | -151 | 6 × 5 × 1.25 | platform | evet |
| 25 | -2.10 | 9.6 | -151 | 1.3 × 1.6 × 1.6 | gift | — |
| 26 | 0.00 | 8 | -160 | 16 × 8 × 1.25 | CP 4 | evet |
| 27 | 5.00 | 8 | -171 | 5 × 12 × 1.25 | platform | evet |
| 28 | 5.00 | 8 | -187 | 5 × 14 × 1.25 | platform | evet |
| 29 | -2.00 | 8 | -169 | 5 × 5 × 1.25 | fake | — |
| 30 | -2.00 | 8 | -176 | 5 × 5 × 1.25 | fake | — |
| 31 | -2.00 | 8 | -183 | 5 × 5 × 1.25 | approachFake | — |
| 32 | -2.00 | 8 | -190 | 5 × 5 × 1.25 | fake | — |
| 33 | 0.00 | 8 | -200 | 16 × 8 × 1.25 | CP 5 | evet |
| 34 | -4.00 | 8 | -210 | 6 × 10 × 1.25 | platform | evet |
| 35 | 0.00 | 8 | -222 | 8 × 8 × 1.25 | platform | evet |
| 36 | 4.00 | 8 | -232 | 6 × 6 × 1.25 | platform | evet |
| 37 | 4.00 | 8 | -210 | 5 × 10 × 1.25 | approachFake | — |
| 38 | -6.00 | 10 | -231 | 1 × 1 × 2 | hiddenKill | — |
| 39 | -3.00 | 9.6 | -222 | 1.4 × 1.4 × 1.6 | gift | — |
| 40 | 0.00 | 8 | -240 | 16 × 8 × 1.25 | CP 6 | evet |

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

QA: output/horizon-176-test.cjs, output/troll-175-test.cjs, output/party-162-test.cjs ve resmi develop-web-game wrapper. Son9yarışta finish sonrası model konumu, taban400m tamponu, üst üste gelmeme, gerçek fizik bağlantıları ve tarayıcı finish görüntüleri kontrol edilir. Gerçek telefon60FPS veya canlıPoki onayı değildir.


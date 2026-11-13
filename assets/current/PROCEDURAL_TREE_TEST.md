# Klasik Ağaçlar / Bütünlüklü Taç Revizyonu — 1.76.1

Party/Troll ortak dekor materyalinde fasetlerin yumuşamaması için, yalnız Doğa
kaynaklı flatShading parçaların yüz normalleri cache dönüşümünde bake edilir.
Üçgen sayısı değişmez, kaynak paylaşımlı geometriye dokunulmaz; diğer biyomlar aynı.

Kullanıcı1.75.0 prosedürel denemesini reddetti. Eski meşe/çam/huş/sonbahar/elma
aileleri varsayılan geri geldi; geniş yapraklı ağaçların eski üst üste küreleri
yerine **tek, kapalı ve bütünlüklü taç** kullanılır. Canlı siteye gönderilmedi.

## Görsel yapı

cohesive-tree-canopy.js: 12 açısal segment, 7 yükseklik halkası, 168 üçgen.
Altı ayrı profil vardır: köşeli geniş meşe, sivri genç meşe, uzun-dar huş,
asimetrik ikiz huş, yana gelişmiş sonbahar ve basık-köşeli elma. Üst üste küre
kullanılmaz; büyük düz yüzeyler, değişken omuz yüksekliği ve üç renk tonu vardır. Halka dikişleri aynı konumu kullanır; seed
aynıysa geometri aynıdır. Birbirine sokulmuş yaprak küreleri yoktur.

Eski eğimli iki parçalı meşe gövdesi, kök payandaları ve dallar korunur; dallar
taç içine uzanır. Huşun beyaz kabuğu/koyu bantları/ikiz gövdesi; elmanın kısa
gövdesi/kökleri/meyveleri korunur. Daralan taçlara göre yan dal boyları ayarlanır.
Çamın yedi katlı biçimi korunur, ancak üst üç katmanda merkez kayması ve eğim
sıfırdır; ayrı tepe konisi son katmana bağlı ve aynı dik eksendedir.

| Varyant | Yapı | Model üçgeni |
| --- | --- | ---: |
| Meşe | Yeşil, yayvan tek taç |552|
| Genç meşe | Kısa gövde, sivri taç |552|
| Uzun çam | Eski katmanlı çam |286|
| Kısa çam | Eski katmanlı çam |286|
| İkiz huş | İki bantlı gövde, ortak uzun taç |584|
| Huş | İnce gövde, uzun-dar taç |416|
| Sonbahar | Bakır/turuncu tek taç |552|
| Elma | Kısa/geniş taç, meyveler |1232|

## Kısa araştırma / tasarım kararı

[Kenney Nature Kit](https://kenney.nl/assets/nature-kit),
[Kay Lousberg Forest Nature Pack](https://kaylousberg.com/game-assets/forest-nature-pack)
ve [LMHPOLY ağaç çalışması](https://www.lmhpoly.com/tutorials/blender-beginner-tutorial-create-stylized-tree)
incelendi. Tasarım yorumu: tür farkı yalnız renkte değil, silüet/uzunluk/omuz ve
büyük düz yüzeylerde de okunmalı. Harici model veya doku indirilmedi; geometri
oyunun kendi önbellekli üreticisidir.

## Entegrasyon / performans

Yeni script game-runtime'dan önce yüklenir. Modeller bir kez mevcut Nature
cache'ine bake edilir; spawn/animasyon sırasında rekürsiyon veya yeni materyal
yoktur. Wood/foliage batching ve mevcut vertex-color materyalleri kullanılır;
elmanın özel kırmızı meyve materyali korunur. Geçici geometri dispose edilir,
paylaşılan sonuç natureModelGeoms sahipliğinde kalır.

cbMergeByMaterial, vertexColors materyalinin renkli geometrilerini artık mevcut
mergeColoredGeos ile birleştirir; aksi halde taç gradient'i kaybolup beyaz oluyordu.
Renksiz eski materyallerin eski birleştirme yolu değişmez.

Party/Troll ortak çevresinde Nature ağacına eklenen bağımsız yaprak topları kapalı.
Snow/Lava özel ağaçları, çalılar, fizik, kayıtlar ve finish çevre uzatması değişmez.
Yeni renderer, büyüme animasyonu, ışık veya4096shadow map yoktur.

## Deneme / doğrulama

Varsayılan: klasik aileler +yeni tek taç. Reddedilen test yalnız `?trees=study`
ile açıkça seçilebilir. `?trees=classic` veya parametresiz açılış yeni varsayılandır.

output/classic-canopy-test.mjs gerçek Three ve gerçek builder fonksiyonlarıyla
8varyantı, altı farklı profil, dik/bağlı çam tepesi, üçgen bütçesi, sonlu vertex/normal,
tek taç sayısı, determinism, halka dikişi ve
**cache sonrası renk korunmasını** doğrular. output/classic-tree-gallery.html
resmi develop-web-game istemcisiyle açılır; screenshot görsel olarak incelenir.
Gerçek oyun wrapper testi lobi/portal/üç biyom/kontrol/CP/finish/yeniden giriş ve
Party izolasyonunu kontrol eder. QA dosyaları output'tadır, ZIP'e girmez.
Gerçek düşük güçlü telefon FPS testi yapılmış sayılmaz.

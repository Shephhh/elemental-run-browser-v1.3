# Mode Gallery — bağımsız poster katmanları (v1.88.7)

## v1.88.10 — Galeri yükleme sırası; eski yükleme ekranı

Gerçek yükleme ekranını galeri gibi giydiren bütün CSS kaldırıldı. Orijinal görünüm korunur; font/imleç yeniliği sadece `boot-play-ready` durumundadır. Mevcut yükleme hattı `gallery-art-requests` ile ilk görünümün 2/4 düz posterini + kanyonu iki worker ile hazırlamaya başlar. `gallery-art-ready` hazır görsellere en fazla 1200 ms katılır; resim veya font hatası oyunu kilitlemez. Üç boyutlu dünya hazırlığına dokunulmadı.

Mount sırasında yakın posterler istenir; uzaktakiler `data-src` ile bekler ve 180px lookahead gözlemcisiyle açılır. Alfa katmanlar görünür kart kuyruğunda, imleç/odak önceliğiyle, birer resim decode edilerek hazırlanır. Her resim arasında event loop'a dönülür. İlk düz resim daima yedektir; katman hatası 15 saniyelik retry cooldown uygular. Bellek sınırı masaüstü 4 / mobil 3 katmanlı kart; pause/visibility/exit sıraları ve gözlemcileri temizler.

Yükleme görünümü QA'da galeri stil dosyası kapalıyken hesaplanan orijinal değerlerle birebir karşılaştırıldı. Yedi kartta tek decode sınırı, uzaktaki görsellerin ertelenmesi ve eksik alfa görselde düz poster yedeği test edildi. `render_game_to_text` içindeki `menuArt` alanı bu hazırlığın küçük durum özetidir.

## v1.88.9 — Giriş kenarından parlama

v1.88.8'in pointer-follow parlaması kaldırıldı. Bir kartın içine girerken pointer segmentinin kesiştiği kenar bulunur (segment yoksa en yakın kenar). `data-shine-from` sol/sağ/üst/alt değerini tutar; .85 saniyelik eski şerit parlaması karşı kenara tek kez gider. Kart içinde imleci hareket ettirmek bu değeri veya animasyonun başlangıç zamanını değiştirmez. Çıkıp yeniden girince yeni kenar seçilir. Fotoğraf ve sticker paralaksı bağımsız kalır.

## v1.88.8 arayüz güncellemesi

Katman varlıkları değişmedi. Başlık grubu artık `boot-mode-caption` içinde başlık + yalnız SVG play ikonudur; katman sahnesi bu doğrudan çocuk grubunun önüne eklenir. `boot-mode-gallery.js` imlecin konumunu ve hareket yönünü `--shine-x/y/angle` değişkenlerine aktarır. Gezinme görsel olarak eğilmiş kartların bounding rect ölçüleri yerine sabit layout ofsetlerinden durak hesaplar; pending hedef hızlı ardışık tıklamada korunur.

Başlık/yükleme fontu [Fredoka](https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/METADATA.pb) yerel dağıtılır. Orijinal [SIL OFL lisansı](https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/OFL.txt) `vendor/fonts/FREDOKA-OFL.txt` içinde paketlenir. Başka sahnelerin yazı tipleri, imleçleri, fizik veya kayıtları değiştirilmez.

Açılış galerisindeki yedi illüstrasyon, düz resmin üzerine ikinci bir karakter bindirilmeden dört plakaya ayrıldı. Her modda bir temiz arka plan, bir karakter ve iki nesne grubu bulunur. Her WebP 640×960; karakter ve nesnelerde gerçek alfa kanalı korunur. Tam takım 914.748 bayt (~893 KiB).

## Çalışma şekli

- `boot-poster-layers.js`: görünür kartları IntersectionObserver ile hazırlar; dört resim de decode edilince düz posterden katmanlara geçer. Hata olursa eski poster görünür kalır.
- Yalnız üzerinde imleç olan veya klavyeyle odaklanılan kartın üç katmanı bağımsız, birkaç piksellik nefes/denge hareketi yapar. Küçük ışık lekeleri ve yıldız parıltıları ayrı CSS katmanlarıdır.
- `boot-poster-layers.css`: transform/opacity tabanlı animasyonlar. Kartın genel eğimi ve arka plan paralaksı galeri kodunda kalır. Her kare JavaScript veya yeni Three.js sahnesi çalıştırılmaz.
- Bellekte en fazla masaüstü 4 / coarse-pointer mobil 3 katmanlı kart. Uzak kartların katmanları bırakılır; düz poster yedeği kalır. Sekme gizlenmesi, hazırlık ve azaltılmış hareket tercihi animasyonu durdurur. Mod açıldığında tüm katman DOM'u ve gözlemciler temizlenir.
- Dokunmatik cihazda gezinme/tıklama korunur; uzun süreli hover zorunlu değildir. Klavye odağı hover ile aynı canlandırmayı açar.
- Oynanış, fizik, sahne yerleşimleri, kayıtlar ve CourseVersion değiştirilmedi. Canlıya yükleme yapılmadı.

## Katman envanteri

| Mod | hero | a | b |
|---|---|---|---|
| troll | the mint jelly cube and its curved mint trailing streak and tiny green droplets in the central foreground | the large red glowing arrow-marked sliding trap cube on the left, but NOT its purple architectural frame | the broken purple floating stepping platform and its loose fragments immediately below the jelly cube in the lower-middle |
| level | the large mint jelly cube and its green trailing streak and droplets in the lower central foreground | the entire chain of floating golden coins over the central path, including the closest big gold coin on the right | the floating grassy island with the waterfall near the upper right corner (not the distant volcano or mountains) |
| endless | the mint jelly cube and its green trailing streaks and small green diamonds in the lower central foreground | the floating golden coins along the road, including the huge closest coin on the lower right | the cyan crystal cluster on the left foreground ledge (not the ledge or building) |
| surf | the central mint jelly cube and its pale green trailing streak and tiny green particles | the largest detached green-topped stone stepping platform immediately underneath the jelly cube | the smaller detached green-topped stone stepping platform immediately to the right and slightly below the jelly cube |
| obby | the large central mint jelly cube, its mint droplets and short mint streak | the orange spring-loaded padded bumper drum on the right foreground including its coil spring | the pink spring-loaded padded bumper drum on the left foreground including its coil spring |
| runner2d | the small jumping mint jelly cube and its curved green streak and droplets in the central-left foreground | the spinning circular toothed saw and orange glow on the lower right, excluding the stone ground | the entire airborne arc of four golden coins and their small golden sparkle glints |
| flappy | the flying bright orange fire spirit with its blue eye, flame tail and tiny orange ember trail in the center | the complete upper green pipe hanging down from the top, including its vines and gold rim | the complete lower green pipe rising from below, including its vines and gold rim |

Varlıklar: `assets/mode-cards/layers/{mode}-{base,hero,a,b}.webp`. Asıl `{mode}-art.webp` resimleri yüklenme/hata yedeğidir. Kesimleri tekrar kırpmayın: tam tuval koordinatları ortak hizayı korur.

## Üretim yöntemi ve kullanılan yönergeler

### Doğrulama

Playwright: masaüstü 1152×700 Troll, mobil 640×360 2D ve yeni profille 390×680 Flappy girişleri. Her ortamda yedi katmanın çözülmesi, üç nesne grubunun birbirinden farklı hareketi, bir aktif kart sınırı, 4/3 bellek sınırı, klavye/touch gezinme, azaltılmış hareket, sekme gizlemede durma ve sahne girişinde tüm efekt DOM'unun silinmesi test edildi. Sayfa/WebGL hatası yok. Görseller ve oyun içi durum çıktıları incelendi. Raporlar geliştirme için output/qa-1887-* altında; release ZIP'ine output eklenmez.

Görseller built-in ImageGen ile orijinal mod posterleri referans alınarak düzenlendi; alfa elle silinmedi. Temiz plakada hareket edecek üç grup çıkarılıp arkası tamamlandı, diğer kompozisyon korundu. Şeffaf kesimler orijinal konum ve boyutta istendi. Kayıpsız kaynak PNG'ler Codex generated_images dizininde saklıdır; oyun yalnız WebP'leri kullanır.

### troll-base

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-99fc5ea4-8714-4247-917b-d1174756afb1.png`

```text
Use case: precise-object-edit. Input Image 1 is the edit target, not a style suggestion. Produce exactly the same full portrait canvas aspect ratio 2:3 and framing. Preserve the original painted style, palette and perspective. No text, watermark, grid, new UI or borders. Create the clean background plate for a layered parallax poster. Remove ONLY these foreground objects completely: the mint jelly cube and its curved mint trailing streak and tiny green droplets in the central foreground; the large red glowing arrow-marked sliding trap cube on the left, but NOT its purple architectural frame; the broken purple floating stepping platform and its loose fragments immediately below the jelly cube in the lower-middle. Seamlessly reconstruct the scenery/void/architecture that was behind them. No ghost silhouettes, no shadows belonging to removed objects, no mint trail left over. Keep ALL other original content and composition in exactly the same place. Opaque output.
```

### troll-hero

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-7625a3ee-9cae-47a9-be3f-255b66b52c47.png`

```text
Use case: precise-object-edit. Input Image 1 is the edit target, not a style suggestion. Produce exactly the same full portrait canvas aspect ratio 2:3 and framing. Preserve the original painted style, palette and perspective. No text, watermark, grid, new UI or borders. Create a transparent animation cutout layer. Keep ONLY the mint jelly cube and its curved mint trailing streak and tiny green droplets in the central foreground, with original colors and contours, in EXACTLY its original position and size on the full original 2:3 canvas. Remove all other pixels to genuine transparent alpha, not colored/checkerboard backdrop. Do NOT center, enlarge, crop, reposition or redraw the retained object. Leave the rest of the full canvas transparent. Preserve soft glow within a small margin around the object, without retaining any surrounding scenery.
```

### troll-a

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-e15231cd-401b-43ed-8101-e8522e8674c7.png`

```text
Use case: precise-object-edit. Input Image 1 is the edit target, not a style suggestion. Produce exactly the same full portrait canvas aspect ratio 2:3 and framing. Preserve the original painted style, palette and perspective. No text, watermark, grid, new UI or borders. Create a transparent animation cutout layer. Keep ONLY the large red glowing arrow-marked sliding trap cube on the left, but NOT its purple architectural frame, with original colors and contours, in EXACTLY its original position and size on the full original 2:3 canvas. Remove all other pixels to genuine transparent alpha, not colored/checkerboard backdrop. Do NOT center, enlarge, crop, reposition or redraw the retained object. Leave the rest of the full canvas transparent. Preserve soft glow within a small margin around the object, without retaining any surrounding scenery.
```

### troll-b

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-b69d02e6-18e7-481f-b411-2463d069c785.png`

```text
Use case: precise-object-edit. Input Image 1 is the edit target, not a style suggestion. Produce exactly the same full portrait canvas aspect ratio 2:3 and framing. Preserve the original painted style, palette and perspective. No text, watermark, grid, new UI or borders. Create a transparent animation cutout layer. Keep ONLY the broken purple floating stepping platform and its loose fragments immediately below the jelly cube in the lower-middle, with original colors and contours, in EXACTLY its original position and size on the full original 2:3 canvas. Remove all other pixels to genuine transparent alpha, not colored/checkerboard backdrop. Do NOT center, enlarge, crop, reposition or redraw the retained object. Leave the rest of the full canvas transparent. Preserve soft glow within a small margin around the object, without retaining any surrounding scenery.
```

### level-base

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-97ee51a8-bd60-4aaf-b00d-ae8a876c44d1.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Clean background plate for a layered animated poster: remove ONLY the large mint jelly cube and its green trailing streak and droplets in the lower central foreground; the entire chain of floating golden coins over the central path, including the closest big gold coin on the right; and the floating grassy island with the waterfall near the upper right corner (not the distant volcano or mountains). Reconstruct the scene behind them seamlessly. Keep all other objects exactly where they were. Remove any shadows/glows that belong to removed objects. No traces, doubled objects or leftover character trails. Opaque output.
```

### level-hero

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-ef86f707-a257-43fb-bc86-73c7d73905ed.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the large mint jelly cube and its green trailing streak and droplets in the lower central foreground in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### level-a

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-7b16bb12-a729-48be-95a5-39ebabf6df2a.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the entire chain of floating golden coins over the central path, including the closest big gold coin on the right in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### level-b

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-5150c086-8c05-401c-a4fa-4593c5a36f89.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the floating grassy island with the waterfall near the upper right corner (not the distant volcano or mountains) in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### endless-base

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-fd276671-d53a-43cf-8fe3-f317db201d83.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Clean background plate for a layered animated poster: remove ONLY the mint jelly cube and its green trailing streaks and small green diamonds in the lower central foreground; the floating golden coins along the road, including the huge closest coin on the lower right; and the cyan crystal cluster on the left foreground ledge (not the ledge or building). Reconstruct the scene behind them seamlessly. Keep all other objects exactly where they were. Remove any shadows/glows that belong to removed objects. No traces, doubled objects or leftover character trails. Opaque output.
```

### endless-hero

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-808ed2d3-0fc4-4ab8-b12f-5ff87d77016f.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the mint jelly cube and its green trailing streaks and small green diamonds in the lower central foreground in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### endless-a

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-fff91351-1788-47cb-b467-be43b8f20de2.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the floating golden coins along the road, including the huge closest coin on the lower right in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### endless-b

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-2e3da9fd-7b2f-480f-a3d2-e8fae02e2860.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the cyan crystal cluster on the left foreground ledge (not the ledge or building) in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### surf-base

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-bcc6e050-f9a9-4d33-bba5-520801026b82.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Clean background plate for a layered animated poster: remove ONLY the central mint jelly cube and its pale green trailing streak and tiny green particles; the largest detached green-topped stone stepping platform immediately underneath the jelly cube; and the smaller detached green-topped stone stepping platform immediately to the right and slightly below the jelly cube. Reconstruct the scene behind them seamlessly. Keep all other objects exactly where they were. Remove any shadows/glows that belong to removed objects. No traces, doubled objects or leftover character trails. Opaque output.
```

### surf-hero

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-f2313a98-b55d-46c5-b2cb-4c3721bc15e1.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the central mint jelly cube and its pale green trailing streak and tiny green particles in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### surf-a

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-62d6cc7d-204b-4455-83e5-e5cbfb1535d5.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the largest detached green-topped stone stepping platform immediately underneath the jelly cube in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### surf-b

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-0044eccc-deed-4d53-a0a6-8261599a1235.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the smaller detached green-topped stone stepping platform immediately to the right and slightly below the jelly cube in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### obby-base

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-8afddf9c-b6b1-4de5-bb6e-d2cba91c730f.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Clean background plate for a layered animated poster: remove ONLY the large central mint jelly cube, its mint droplets and short mint streak; the orange spring-loaded padded bumper drum on the right foreground including its coil spring; and the pink spring-loaded padded bumper drum on the left foreground including its coil spring. Reconstruct the scene behind them seamlessly. Keep all other objects exactly where they were. Remove any shadows/glows that belong to removed objects. No traces, doubled objects or leftover character trails. Opaque output.
```

### obby-hero

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-91af06a3-01c7-4cdc-9129-9a3665924063.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the large central mint jelly cube, its mint droplets and short mint streak in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### obby-a

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-6c6ec17e-0435-4442-988b-586ee891e196.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the orange spring-loaded padded bumper drum on the right foreground including its coil spring in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### obby-b

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-86d325d2-15ae-441c-b825-ab2bb4b234a5.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the pink spring-loaded padded bumper drum on the left foreground including its coil spring in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### runner2d-base

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-1d8fbd64-8bd5-49f6-886a-efbfefe0324f.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Clean background plate for a layered animated poster: remove ONLY the small jumping mint jelly cube and its curved green streak and droplets in the central-left foreground; the spinning circular toothed saw and orange glow on the lower right, excluding the stone ground; and the entire airborne arc of four golden coins and their small golden sparkle glints. Reconstruct the scene behind them seamlessly. Keep all other objects exactly where they were. Remove any shadows/glows that belong to removed objects. No traces, doubled objects or leftover character trails. Opaque output.
```

### runner2d-hero

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-51fa5bfe-3fac-4f13-82e1-a7491bfb0e03.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the small jumping mint jelly cube and its curved green streak and droplets in the central-left foreground in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### runner2d-a

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-be2593eb-28ac-471a-94e6-d891431e95eb.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the spinning circular toothed saw and orange glow on the lower right, excluding the stone ground in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### runner2d-b

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-d6b6ccce-8523-493e-be73-a380c323394f.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the entire airborne arc of four golden coins and their small golden sparkle glints in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### flappy-base

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-7e16a1d8-3a32-4c7d-8483-033643426d7f.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Clean background plate for a layered animated poster: remove ONLY the flying bright orange fire spirit with its blue eye, flame tail and tiny orange ember trail in the center; the complete upper green pipe hanging down from the top, including its vines and gold rim; and the complete lower green pipe rising from below, including its vines and gold rim. Reconstruct the scene behind them seamlessly. Keep all other objects exactly where they were. Remove any shadows/glows that belong to removed objects. No traces, doubled objects or leftover character trails. Opaque output.
```

### flappy-hero

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-7c414bd1-b4e3-4ae1-a4f6-78c6a05353c0.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the flying bright orange fire spirit with its blue eye, flame tail and tiny orange ember trail in the center in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### flappy-a

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-2c91b404-5c78-4069-bbd8-47c61eeff894.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the complete upper green pipe hanging down from the top, including its vines and gold rim in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```

### flappy-b

Kaynak: `C:\Users\Pc\.codex\generated_images\019f6699-ce92-7d51-b494-d42b51487107\exec-a8a607ca-16a3-47bd-a67d-d94d06783a1f.png`

```text
Use case: precise-object-edit. Image 1 is the edit target. EXACT same full portrait 2:3 canvas and framing, do not crop or reposition. Preserve the original illustration, lighting and perspective. No new subjects, text, watermark, borders or UI. Transparent cutout layer: keep ONLY the complete lower green pipe rising from below, including its vines and gold rim in exactly its original size and original location on the full canvas. All other pixels must become genuine transparent alpha. Do not center the object, zoom it, change its pose or retain background scenery. Retain a small soft colored glow margin if originally present. No checkerboard or solid background. Full portrait canvas remains 2:3 with empty transparent space around the original-location object.
```



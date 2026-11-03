# Bhop / Surf — modüler mimari katmanı (1.34.0)

Bu değişiklik yalnız authored Bhop/Surf haritalarının duvar ve tavanlarını kapsar. Normal Level, Endless, 2D, input ve 120Hz fizik algoritması değiştirilmez. Mimari collision hull'ları artık kaynak JSON ile birebir aynıdır; önceki sürümdeki alttan kesilmiş collision kapakları kullanılmaz. Bu, özgün oda sınırlarını geri getirir.

## 1. Geometri ve güvenli culling

Uygulama: `surf-architecture.js`; sınıflandırma: `surf-biomes.js`; birleştirme: `surf-maps.js`.

- `partition()` sadece `biomeWall` / `biomeRoof` / `biomeFloor` metadata'sını üretir. Vertex, plane, SAT axis, bottom veya top değişmez. Dört haritada **1.377 duvar ve 6 tavan sınıfı** korunur; sınıflar örtüşebilir.
- Kameranın o an frustum dışında bırakması, bir gövdenin altını kalıcı olarak kesmek için yeterli değildir. Oyuncu 360° dönebilir. Bu nedenle fizik ve kaynak geometri frustum'a göre değiştirilmez.
- `batchCellSize(data,mobile)` ve `batchKey(h,size)` mimariyi XZ bölgesel batch'lere ayırır. Varsayılan128m hücre gerektiğinde büyür; mevcut haritalarda mobil en fazla16, masaüstü28 bölge hedeflenir. Çok uzun bir nesne bölünmeden korunur; bbox/sphere bütün vertex'leri içerir. Ortak materyal tüm bölgeler arasında paylaşılır.
- `Mesh.frustumCulled` açık kalır. Three.js görünmeyen batch'i çizmez; geri bakınca tam gövde tekrar görünür. Her frame vertex üretimi, kamera raycast'i, GPU occlusion readback veya collision rebuild yoktur.

İleriye dönük, **yalnız görsel** kapak API'si:

```js
const proof = {
  staticOccluded: true,          // dış sistemin doğruladığı statik örtülme
  outsidePlayableVolume: true,   // oynanabilir hacimden erişilemez
  opaqueFloorY: floorY,
  lowestPlayableY: lowestRouteY
};
const visual = ElementalSurfArchitecture.selectVisualHull(hull, proof);
```

`canUseHiddenCap()` ayrıca `top < opaqueFloorY-6` ve `lowestPlayableY > opaqueFloorY+2` ister. Bu bir gerçek-zamanlı occlusion dedektörü değildir; kanıtsız durumu reddeden güvenlik kontratıdır. Mevcut haritalar bu kanıtı sağlamaz: **visualCaps=0**, tam kaynak hacimleri kullanılır. İleride kapak seçilse bile sadece render kopyası değişir; collider değişmez.

`appendCornerSupports(batch,hull)` eksen hizalı duvar/tavan alt köşelerine eğimli küçük gusset'ler ekler. Eğik/çapraz hull'larda AABB köşesi gövde dışında kalabileceğinden bu ekler atlanır; kopuk parçalar oluşturulmaz. Var olan mimari batch'e yazılır, yeni mesh/collider üretmez. Yükseklik `min(1.1, h*.42)`; ayak genişliği `min(.6,w*.22,d*.22)`; dışta sadece2cm kozmetik skin. Odanın içinden aşağı sütun indirilmez, iniş yolu/headroom kapatılmaz. En fazla ilk64mobil/128masaüstü mimari gövdeye uygulanır; her uygun gövde12üçgen. Tam hacim zaten korunduğundan büyük tavanları aşağıya uzayan sahte collision'larla temellendirmeye gerek yoktur.

## 2. Dünya koordinatlı triplanar PBR

```js
const A = ElementalSurfArchitecture;
const mat = A.createMaterial(THREE, repeatingTexture, own, {
  phase: data.phase,
  mobile: api.mobile
});
A.attachAttributes(THREE, geometry, batch);
```

`createMaterial()` standart Three.js aydınlatmasını, env map, fog, tonemapping ve renk yönetimini korur. `onBeforeCompile` sadece map örneklemesini ve ilave emissive'i değiştirir. Shader parçaları bulunmazsa sessiz fallback yerine açıklayıcı hata verir. `customProgramCacheKey()` sabit sürüm anahtarıdır; phase/güç/noise uniform'dur, her duvar ayrı shader programı derlemez. Kaynak: [Three.js Material API](https://threejs.org/docs/pages/Material.html), [MeshStandardMaterial API](https://threejs.org/docs/pages/MeshStandardMaterial.html).

World-space algoritması:

```glsl
vec3 w = pow(abs(normalize(worldNormal)), vec3(4.0));
w /= max(dot(w, vec3(1.0)), .0001);
vec3 p = worldPosition * .25; // 4m dünya ölçeği, object AABB'ye bağlı değil
vec4 t = texture2D(map,p.zy)*w.x
       + texture2D(map,p.xz)*w.y
       + texture2D(map,p.xy)*w.z;
```

Böylece bitişik küsuratlı boyutlardaki gövdeler aynı world phase'i paylaşır. Doku her nesnenin min köşesinde yeniden başlamaz. Her fragment3doku okuması kullanır; ayrı normal/roughness map triplanar örneklemesi eklenmez. Texture RepeatWrapping/sRGB/mipmap ve mevcut resource ownership korunur. Shader instancing dönüşümünü de ele alır; aktif parkurlar ise zaten dünya vertex'leri içeren merged mesh kullanır. Mimari dünya Y sınırları `aArchBounds` vec2 attribute'unda her vertex'e taşınır; per-object uniform/drawcall gerekmez. Eğimli, döndürülmüş instancing eklenecekse yerel Y bounds yerine gerçek dünya Y extrema üretilmelidir.

Mimari vertex tint beyazdır. Eski koyu vertex tint ile yeni koyu gövde renginin yanlışlıkla iki kez çarpılması engellenmiştir. Güvenli/surf/death panel renkleri ve fizik semantiği bu shader'a taşınmaz.

## 3. PBR, neon ve renk varyasyonu

| Biyom | Gövde rengi (sRGB) | Metalness | Roughness | Kenar emissive gücü |
| --- | --- | ---: | ---: | ---: |
| City | `#34404c` | .50 | .60 | 2.0 |
| Nature | `#575b4e` | .40 | .70 | 0 |
| Sky | `#616e78` | .40 | .70 | 0 |
| Lava | `#454249` | .40 | .70 | 0 |
| Water | `#3c585b` | .40 | .70 | 0 |
| Snow | `#536175` | .40 | .70 | 0 |

City kenar rengi `#55c9d2`. Alt/üst dünya Y sınırından2.5–8.5cm bandında yumuşak emissive üretilir; yatay yüzlerde normal ağırlığıyla bastırılır. Böylece bütün tavan yüzeyi neon levhaya dönüşmez. Ekleme gerçek ışık kaynağı değildir; mevcut bloom kalitesine göre halo görülebilir. Varsayılan statik güç kullanılır, frame timer/material animasyon döngüsü eklenmez.

World XZ'de yumuşak value noise: frekans `.055`, en fazla±%6.5masaüstü/±%4.5mobil. Noise shader'da deterministiktir; frame RNG, yeni vertex rengi, texture allocation veya GC üretmez. Perlin yerine hafif value noise aynı ton varyasyonu amacını daha düşük maliyetle sağlar.

## 4. Yaşam döngüsü ve sınırlar

- Materyal, doku ve geometry mevcut `own()` setine kayıtlıdır; bölüm retirement/dispose akışı bunları serbest bırakır. Shared mimari materyali her bölge için yeniden oluşturulmaz.
- Hazırlık sırasında mevcut `compileAsync` / reflection / kademeli render warmup akışı yeni shader'ı da derler. Gameplay sırasında ilk kez shader oluşturulmaz.
- Harita JSON'ları, platform/rampa vertex'leri, medal kayıtları, history formatı ve input değişmez. Duvarların kaynak collision yüksekliği geri geldiği için eski açılmış gövdelerin içinden geçmek artık mümkün değildir.
- Eski `BHOP_SURF_LEVEL_GEOMETRY_REFERENCE.md` **1.33.0 snapshot'ıdır**. Oradaki `vKaynak` bu sürümün tam kaynak geometrisidir; eski `v` kapak verisini1.34collision olarak kullanmayın.
- Bu çalışma yeni model indirmez; mevcut mimari hacimlerin okunaklılığını iyileştirir. Gerçek cihazda FPS ölçümü ve bütün authored odaların insan playtest'i yine gereklidir; sıfır-drop veya bütün haritaların elle tamamlandığı iddia edilmez.

## 5. Test girişleri

```text
node output/test-surf-134.cjs
node output/test-surf-133.cjs
node output/test-surf-132.cjs
node output/test-surf-134-browser.cjs
node output/test-surf-134-browser.cjs --mobile
```

Browser testleri4238portundaki yerel QA sunucusunu kullanır. Source vertex/plane/SAT eşitliği, spawn/checkpoint headroom, static-cap kanıtı, attribute sayıları, paylaşılan materyal/PBR ve gerçek WebGL shader derleme hataları kontrol edilir. Bütün4harita için gameplay screenshot'ları üretilir.

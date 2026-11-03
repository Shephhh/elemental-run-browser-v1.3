# Authored workshop geometry — credits / publishing status (1.43.0)

## 1.43 — two additional ready sources (22 October 2026)

The unified campaign now has twelve whole maps. Existing ten IDs/order/records
are retained; the additions are11Blueshade(Bhop/Nature/Tier1) and12Paradigm
(Surf/Lava/Tier4). Source game metadata, not the template description, determines
the discipline: Paradigm's listing mentions bhop but its SMF declares Surf/Tier4.

- Blueshade: original author not specified in official catalog; source
  bO2zA7Bwzw/N4iU90l4az; SHA256
  58049977a8b4eaf6af069e0210b20256d6d29253e96a1223520ccfe54ac22b46.
  Converted2336source solids/20triggers/16destinations; only action0.
- Paradigm: Pyllytonttu; sourceAloLlIwKyR/dJ5LkIHbtu; SHA256
  9f77261c694e7da1cbe1b0f6f5b8cf86a8da3910955ee6a5a94f1621ddc0f0f1.
  Converted1488source solids/52decor/74triggers/one destination; only action0.

Downloaded from https://assets.strafes.io/ using current source paths/hashes from
https://api.strafes.io/maps/templates. The existing mechanical SMF exporter
preserves convex coordinates and source gaps. All teleport actions in these two
maps are reset returns, not forward stage portals; portalIds=[] is explicit.
Target medal times are provisional, not measured records. Only converted geometry
and entity metadata are included. Original image textures/audio/code are not.
Commercial redistribution permission remains **unverified**; public template
access is not a license grant. This is a local build/ZIP update, not a Poki upload.

The sections below describe the previous ten sources and their import history.

## 22 October 2026 additions

The campaign now appends Nila (Bhop, Pcpie) and Eclipse (Surf, Paper-Cut), giving ten whole maps without renumbering the first eight. Imported through the same public official template/export pipeline; original convex coordinates/gaps remain unchanged. Sources were downloaded from the official asset URLs below and SHA256 verified against the live template catalog before conversion:

- Nila: LyXdQ1FpP7 / 1X4M1OIzS2; SHA256 aa1e1dc205f5be302ff8f7e4b6bba8b357ad3e66354cc0b2982df01b0367c4ed.
- Eclipse: sKJT5iEbXh / S9Y6uSSL6b; SHA256 2601501ad7537e587c807e2f910f0aa3963356e85df47ff332d287bd71744d03.

Only supported action types0/3(Nila) and0/4(Eclipse) were found. Eclipse's stageN_nomove destinations stay true teleport targets but share a checkpoint identity with stageN; only actual forward gates -24/-23 are visual portals. New medal times are provisional design targets, not measured records. The licensing/publication caveats below apply to both new sources too: public template access does not establish commercial redistribution permission. This is a local update, not a new public upload.

Runtime1.42 additionally makes opaque structural non-solid brushes physically match their exact visible convex geometry where they were misleadingly rendered as landing platforms (62Utopia/46Terra). This is runtime metadata, not a source-coordinate rewrite. Liquids/glass/foliage/ground decorations are excluded; legacy non-solid water brush visuals are omitted rather than layered over a different Elemental biome's true ground.

The eight-map table below records the previous source set; together with the two additions above it is the full ten-map manifest.

The current game presents one alternating ten-map Bhop/Surf campaign, not two
discipline selectors. Mode labels in the source table below describe original
map classification. Geometry/source credits remain unchanged by the UI merge.

These eight locally packaged map layouts were converted from the official map
templates exposed by https://strafes.io/editor (original four2026-10-18, new four2026-10-21). The editor explicitly
offers opening current official sources, inspecting them, and saving a copy.

| Mode | Map | Credit | Source build |
| --- | --- | --- | --- |
| Bhop | nux | pcpie | 9JOUbhHXwL / 8Ffj1N84Mt |
| Bhop | treehouse3 | ArcticPanda | x1RxlUzaPZ / T5hNetvINI |
| Surf | beginner | STRAFES template listing | Cy1SIYVV6M / B52BwlB0hZ |
| Surf | utopia | Panzerhandschuh | hEnbFH3Rnj / QVzY9HmQw2 |
| Bhop | leaf | Leaf | OOdsJaDVE3 / ZOPBzemg6x |
| Bhop | aztec | Not specified by source catalog | w72PPmnYd5 / OAsvCvR7Dh |
| Surf | kitsune | Not specified by source catalog | vAfYlM7UVH / wLBtg27xI7 |
| Surf | terra | Rvrb | S8nDAYeKb2 / KIZMErYbM9 |

New source identity/integrity was checked against https://api.strafes.io/maps/templates and map mode/tier against https://api.strafes.io/maps. Unspecified author names are intentionally not guessed. SHA256 of downloaded original SMF:

- leaf:63139d3370a9c45c09206909a847014a167199d4a423b62f70f37ad130438f18
- aztec:2dd2b9c07162d35673474ba35f93592f8736e63776ad0089a259e09ffc976c70
- kitsune:4bba778be447b11a6207a50db53446b73270d4527c9a8a7caede39d56afd807b
- terra:8fd296e2b87108242ea2a1143f08d3af02e6d655825dd76e82fd4abe21b2ffe2

The rejected original Frostline/Cinder/Verdant/Aqueduct generator was removed in1.39. Classic Rainbow Aux was inspected but NOT packaged: its gravity-changing timed actions are not supported by this mode's current deterministic physics/history contract. Aztec uses supported actions instead. No missing gravity behavior is silently ignored in a shipped new course.

Source URLs follow the observed public template links:
https://assets.strafes.io/maps/strafes/<map-id>/builds/<build-id>/source.smf

Conversion preserves the convex brush geometry and relative gaps. Source units
are uniformly scaled by 0.029375 (Elemental gravity 23.5 / source gravity 800) and axes rotate from Z-up to Y-up. No per-gap
shortening, random remapping, or insertion of invisible bridges is used.
Spawn feet are fitted to nearby supported surfaces because editor spawn entities
use inconsistent height origins between imported maps. Teleport destinations,
return volumes, start/end regions, booster and push actions are retained.

The materials/textures, lighting, player controller, hands and HUD are Elemental
Run adaptations. Original image textures, audio and game code are NOT bundled.
This is not a claim that the physics or all visual materials exactly match
Strafes/Source. Credits must remain with the geometry; commercial redistribution
rights for each third-party map have not been independently established by the
presence of a public editor template. Review the relevant authors' terms before
a public commercial upload. This turn updates local files only.

## In-game attribution and release checklist

The in-game Credits dialog/button was removed at the user's request in 1.33.0.
The original author/source records above and the catalog metadata are retained.
Do not strip these source notices or treat UI removal as a license grant.

- Attribution UI: removed; source attribution is retained in this README.
- Original author/commercial redistribution permission: **not verified**.
- Before Web/Poki publishing, obtain/verify the applicable permissions for every
  layout and retain their license text or written approvals with the release.
- Public template access and a credits screen do not substitute for permission.
- No third-party license grant or new public deployment is claimed by this update.

The raw SMF research files and conversion/verification tools remain in output/
and are excluded from release archives. JSON files are loaded on demand, never during the normal game's boot; current+next GPU2and sourceCPU2LRU limits remain. Only converted geometry/entities are packaged, not source images/audio/code.

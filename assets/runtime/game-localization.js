'use strict';

(function initElementalLocalization(global) {
  const SUPPORTED_LANGUAGES = [
          { code: 'en', label: 'İngilizce', nativeName: 'English' },
          { code: 'it', label: 'İtalyanca', nativeName: 'Italiano' },
          { code: 'es-ES', label: 'Kastilya İspanyolcası', nativeName: 'Español (España)' },
          { code: 'fr', label: 'Fransızca', nativeName: 'Français' },
          { code: 'de', label: 'Almanca', nativeName: 'Deutsch' },
          { code: 'ar', label: 'Arapça', nativeName: 'العربية' },
          { code: 'pt-BR', label: 'Brezilya Portekizcesi', nativeName: 'Português (Brasil)' },
          { code: 'da', label: 'Danca', nativeName: 'Dansk' },
          { code: 'nl', label: 'Felemenkçe', nativeName: 'Nederlands' },
          { code: 'zh-Hant', label: 'Geleneksel Çince', nativeName: '繁體中文' },
          { code: 'ko', label: 'Korece', nativeName: '한국어' },
          { code: 'pl', label: 'Lehçe', nativeName: 'Polski' },
          { code: 'no', label: 'Norveççe', nativeName: 'Norsk' },
          { code: 'ro', label: 'Rumence', nativeName: 'Română' },
          { code: 'th', label: 'Tayca', nativeName: 'ไทย' },
          { code: 'uk', label: 'Ukraynaca', nativeName: 'Українська' },
          { code: 'el', label: 'Yunanca', nativeName: 'Ελληνικά' },
          { code: 'sv', label: 'İsveççe', nativeName: 'Svenska' },
          { code: 'zh-Hans', label: 'Basitleştirilmiş Çince', nativeName: '简体中文' },
          { code: 'bg', label: 'Bulgarca', nativeName: 'Български' },
          { code: 'id', label: 'Endonezce', nativeName: 'Indonesia' },
          { code: 'fi', label: 'Fince', nativeName: 'Suomi' },
          { code: 'ja', label: 'Japonca', nativeName: '日本語' },
          { code: 'es-419', label: 'Latin Amerika İspanyolcası', nativeName: 'Español (LatAm)' },
          { code: 'hu', label: 'Macarca', nativeName: 'Magyar' },
          { code: 'pt-PT', label: 'Portekizce - Portekiz', nativeName: 'Português (Portugal)' },
          { code: 'ru', label: 'Rusça', nativeName: 'Русский' },
          { code: 'tr', label: 'Türkçe', nativeName: 'Türkçe' },
          { code: 'vi', label: 'Vietnamca', nativeName: 'Tiếng Việt' },
          { code: 'cs', label: 'Çekçe', nativeName: 'Čeština' }
      ];

  const LATIN_AMERICAN_SPANISH_COUNTRIES = new Set(['AR','BO','CL','CO','CR','CU','DO','EC','SV','GT','HN','MX','NI','PA','PY','PE','PR','UY','VE']);

  const COUNTRY_LANGUAGE_MAP = Object.freeze({
          TR:'tr', IT:'it', SM:'it', VA:'it', ES:'es-ES', FR:'fr', MC:'fr', DE:'de', AT:'de',
          BR:'pt-BR', PT:'pt-PT', DK:'da', NL:'nl', TW:'zh-Hant', HK:'zh-Hant', MO:'zh-Hant',
          CN:'zh-Hans', SG:'zh-Hans', KR:'ko', PL:'pl', NO:'no', RO:'ro', MD:'ro', TH:'th',
          UA:'uk', GR:'el', CY:'el', SE:'sv', BG:'bg', ID:'id', FI:'fi', JP:'ja', HU:'hu',
          RU:'ru', VN:'vi', CZ:'cs', SA:'ar', AE:'ar', QA:'ar', KW:'ar', BH:'ar', OM:'ar',
          YE:'ar', JO:'ar', LB:'ar', SY:'ar', IQ:'ar', EG:'ar', LY:'ar', TN:'ar', DZ:'ar',
          MA:'ar', SD:'ar', SO:'ar', DJ:'ar', MR:'ar', PS:'ar'
      });

  const TIME_SLOW_NAMES = {
          en: 'TIME SLOW', tr: 'ZAMAN YAVAŞLATMA', it: 'RALLENTA TEMPO', 'es-ES': 'RALENTIZAR TIEMPO',
          fr: 'RALENTI TEMPOREL', de: 'ZEITLUPE', ar: 'إبطاء الزمن', 'pt-BR': 'TEMPO LENTO',
          da: 'LANGSOM TID', nl: 'TIJD VERTRAGEN', 'zh-Hant': '時間減速', ko: '시간 감속',
          pl: 'SPOWOLNIENIE CZASU', no: 'SAKTE TID', ro: 'ÎNCETINIRE TIMP', th: 'ชะลอเวลา',
          uk: 'УПОВІЛЬНЕННЯ ЧАСУ', el: 'ΕΠΙΒΡΑΔΥΝΣΗ ΧΡΟΝΟΥ', sv: 'SAKTA TID', 'zh-Hans': '时间减速',
          bg: 'ЗАБАВЯНЕ НА ВРЕМЕТО', id: 'PERLAMBAT WAKTU', fi: 'AJAN HIDASTUS', ja: '時間スロー',
          'es-419': 'TIEMPO LENTO', hu: 'IDŐLASSÍTÁS', 'pt-PT': 'TEMPO LENTO', ru: 'ЗАМЕДЛЕНИЕ ВРЕМЕНИ',
          vi: 'LÀM CHẬM THỜI GIAN', cs: 'ZPOMALENÍ ČASU'
      };

  const MAGNET_NAMES = {
          en: 'MAGNET', tr: 'MIKNATIS', it: 'MAGNETE', 'es-ES': 'IMÁN',
          fr: 'AIMANT', de: 'MAGNET', ar: 'مغناطيس', 'pt-BR': 'ÍMÃ',
          da: 'MAGNET', nl: 'MAGNEET', 'zh-Hant': '磁鐵', ko: '자석',
          pl: 'MAGNES', no: 'MAGNET', ro: 'MAGNET', th: 'แม่เหล็ก',
          uk: 'МАГНІТ', el: 'ΜΑΓΝΗΤΗΣ', sv: 'MAGNET', 'zh-Hans': '磁铁',
          bg: 'МАГНИТ', id: 'MAGNET', fi: 'MAGNEETTI', ja: 'マグネット',
          'es-419': 'IMÁN', hu: 'MÁGNES', 'pt-PT': 'ÍMAN', ru: 'МАГНИТ',
          vi: 'NAM CHÂM', cs: 'MAGNET'
      };

  const DAILY_MISSION_TITLES = {
          en: 'DAILY MISSIONS', tr: 'GÜNLÜK GÖREVLER', it: 'MISSIONI GIORNALIERE', 'es-ES': 'MISIONES DIARIAS',
          fr: 'MISSIONS QUOTIDIENNES', de: 'TAGESAUFGABEN', ar: 'المهام اليومية', 'pt-BR': 'MISSÕES DIÁRIAS',
          da: 'DAGLIGE OPGAVER', nl: 'DAGELIJKSE MISSIES', 'zh-Hant': '每日任務', ko: '일일 미션',
          pl: 'MISJE DZIENNE', no: 'DAGLIGE OPPDRAG', ro: 'MISIUNI ZILNICE', th: 'ภารกิจประจำวัน',
          uk: 'ЩОДЕННІ ЗАВДАННЯ', el: 'ΗΜΕΡΗΣΙΕΣ ΑΠΟΣΤΟΛΕΣ', sv: 'DAGLIGA UPPDRAG', 'zh-Hans': '每日任务',
          bg: 'ДНЕВНИ МИСИИ', id: 'MISI HARIAN', fi: 'PÄIVITTÄISET TEHTÄVÄT', ja: 'デイリーミッション',
          'es-419': 'MISIONES DIARIAS', hu: 'NAPI KÜLDETÉSEK', 'pt-PT': 'MISSÕES DIÁRIAS', ru: 'ЕЖЕДНЕВНЫЕ ЗАДАНИЯ',
          vi: 'NHIỆM VỤ HÀNG NGÀY', cs: 'DENNÍ ÚKOLY'
      };

  const DAILY_SHORT_LABELS = {
          en: 'DAILY', tr: 'GÖREVLER', it: 'MISSIONI', 'es-ES': 'MISIONES',
          fr: 'QUOTIDIEN', de: 'AUFGABEN', ar: 'المهام', 'pt-BR': 'MISSÕES',
          da: 'OPGAVER', nl: 'MISSIES', 'zh-Hant': '每日任務', ko: '일일 미션',
          pl: 'MISJE', no: 'OPPDRAG', ro: 'MISIUNI', th: 'ภารกิจ',
          uk: 'ЗАВДАННЯ', el: 'ΑΠΟΣΤΟΛΕΣ', sv: 'UPPDRAG', 'zh-Hans': '每日任务',
          bg: 'МИСИИ', id: 'MISI', fi: 'TEHTÄVÄT', ja: 'デイリー',
          'es-419': 'MISIONES', hu: 'KÜLDETÉSEK', 'pt-PT': 'MISSÕES', ru: 'ЗАДАНИЯ',
          vi: 'NHIỆM VỤ', cs: 'ÚKOLY'
      };

  const DAILY_MISSION_TYPES = [
          { type: 'collectCoins', mode: 'sum', targets: [60, 100, 150] },
          { type: 'reachScore',   mode: 'max', targets: [8000, 15000, 25000] },
          { type: 'useAbility',   mode: 'sum', targets: [5, 10, 15] },
          { type: 'reachPhase',   mode: 'max', targets: [2, 3, 4] },
          { type: 'playRuns',     mode: 'sum', targets: [3, 5, 8] },
          { type: 'speedKmh',     mode: 'max', targets: [120, 150, 165] }
      ];

  const DAILY_LOCALIZATION = Object.freeze({
          en:{ missions:['Collect {n} coins','Reach {n} score in one run','Use abilities {n} times','Reach world {n}','Finish {n} runs','Hit {n} km/h'], claim:'CLAIM', done:'DONE', streak:'{n} day streak', reset:'Resets in: {time}' },
          tr:{ missions:['{n} altın topla','Tek koşuda {n} skora ulaş','{n} kez yetenek kullan','{n}. dünyaya ulaş','{n} koşu tamamla','{n} km/h hıza ulaş'], claim:'AL', done:'TAMAM', streak:'{n} günlük seri', reset:'Yenilenmesine: {time}' },
          it:{ missions:['Raccogli {n} monete','Raggiungi {n} punti in una corsa','Usa le abilità {n} volte','Raggiungi il mondo {n}','Completa {n} corse','Raggiungi {n} km/h'], claim:'RITIRA', done:'FATTO', streak:'Serie di {n} giorni', reset:'Si rinnova tra: {time}' },
          'es-ES':{ missions:['Recoge {n} monedas','Alcanza {n} puntos en una partida','Usa habilidades {n} veces','Llega al mundo {n}','Completa {n} partidas','Alcanza {n} km/h'], claim:'RECLAMAR', done:'HECHO', streak:'Racha de {n} días', reset:'Se reinicia en: {time}' },
          fr:{ missions:['Collectez {n} pièces','Atteignez {n} points en une partie','Utilisez des capacités {n} fois','Atteignez le monde {n}','Terminez {n} parties','Atteignez {n} km/h'], claim:'RÉCUPÉRER', done:'TERMINÉ', streak:'Série de {n} jours', reset:'Réinitialisation dans : {time}' },
          de:{ missions:['Sammle {n} Münzen','Erreiche {n} Punkte in einem Lauf','Nutze Fähigkeiten {n}-mal','Erreiche Welt {n}','Beende {n} Läufe','Erreiche {n} km/h'], claim:'ABHOLEN', done:'FERTIG', streak:'{n} Tage Serie', reset:'Zurücksetzung in: {time}' },
          ar:{ missions:['اجمع {n} عملة','احصل على {n} نقطة في جولة واحدة','استخدم القدرات {n} مرات','صل إلى العالم {n}','أكمل {n} جولات','بلغ {n} كم/س'], claim:'استلام', done:'تم', streak:'سلسلة {n} أيام', reset:'إعادة الضبط خلال: {time}' },
          'pt-BR':{ missions:['Colete {n} moedas','Alcance {n} pontos em uma corrida','Use habilidades {n} vezes','Chegue ao mundo {n}','Conclua {n} corridas','Atinja {n} km/h'], claim:'RESGATAR', done:'CONCLUÍDO', streak:'Sequência de {n} dias', reset:'Reinicia em: {time}' },
          da:{ missions:['Saml {n} mønter','Nå {n} point i ét løb','Brug evner {n} gange','Nå verden {n}','Gennemfør {n} løb','Nå {n} km/t'], claim:'HENT', done:'FÆRDIG', streak:'{n} dages serie', reset:'Nulstilles om: {time}' },
          nl:{ missions:['Verzamel {n} munten','Behaal {n} punten in één run','Gebruik vaardigheden {n} keer','Bereik wereld {n}','Voltooi {n} runs','Bereik {n} km/u'], claim:'CLAIM', done:'KLAAR', streak:'Reeks van {n} dagen', reset:'Reset over: {time}' },
          'zh-Hant':{ missions:['收集 {n} 枚金幣','單次跑酷達到 {n} 分','使用能力 {n} 次','到達世界 {n}','完成 {n} 次跑酷','達到 {n} 公里/小時'], claim:'領取', done:'完成', streak:'連續 {n} 天', reset:'重置時間：{time}' },
          ko:{ missions:['코인 {n}개 수집','한 번의 달리기에서 {n}점 달성','능력 {n}회 사용','월드 {n} 도달','달리기 {n}회 완료','{n}km/h 달성'], claim:'받기', done:'완료', streak:'{n}일 연속', reset:'초기화까지: {time}' },
          pl:{ missions:['Zbierz {n} monet','Zdobądź {n} punktów w jednym biegu','Użyj zdolności {n} razy','Dotrzyj do świata {n}','Ukończ {n} biegów','Osiągnij {n} km/h'], claim:'ODBIERZ', done:'GOTOWE', streak:'Seria {n} dni', reset:'Reset za: {time}' },
          no:{ missions:['Samle {n} mynter','Nå {n} poeng i ett løp','Bruk evner {n} ganger','Nå verden {n}','Fullfør {n} løp','Nå {n} km/t'], claim:'HENT', done:'FERDIG', streak:'{n} dagers serie', reset:'Nullstilles om: {time}' },
          ro:{ missions:['Colectează {n} monede','Atinge {n} puncte într-o cursă','Folosește abilități de {n} ori','Ajungi în lumea {n}','Termină {n} curse','Atinge {n} km/h'], claim:'REVENDICĂ', done:'GATA', streak:'Serie de {n} zile', reset:'Se resetează în: {time}' },
          th:{ missions:['เก็บเหรียญ {n} เหรียญ','ทำคะแนน {n} ในการวิ่งครั้งเดียว','ใช้ความสามารถ {n} ครั้ง','ไปถึงโลก {n}','จบการวิ่ง {n} ครั้ง','ทำความเร็ว {n} กม./ชม.'], claim:'รับ', done:'สำเร็จ', streak:'ต่อเนื่อง {n} วัน', reset:'รีเซ็ตใน: {time}' },
          uk:{ missions:['Збери {n} монет','Набери {n} очок за один забіг','Використай здібності {n} разів','Досягни світу {n}','Заверши {n} забігів','Досягни {n} км/год'], claim:'ЗАБРАТИ', done:'ГОТОВО', streak:'Серія {n} днів', reset:'Оновлення через: {time}' },
          el:{ missions:['Συλλέξτε {n} νομίσματα','Φτάστε {n} πόντους σε μία διαδρομή','Χρησιμοποιήστε ικανότητες {n} φορές','Φτάστε στον κόσμο {n}','Ολοκληρώστε {n} διαδρομές','Φτάστε {n} χλμ/ώρα'], claim:'ΛΗΨΗ', done:'ΕΤΟΙΜΟ', streak:'Σερί {n} ημερών', reset:'Επαναφορά σε: {time}' },
          sv:{ missions:['Samla {n} mynt','Nå {n} poäng i en runda','Använd förmågor {n} gånger','Nå värld {n}','Slutför {n} rundor','Nå {n} km/h'], claim:'HÄMTA', done:'KLAR', streak:'{n} dagars svit', reset:'Återställs om: {time}' },
          'zh-Hans':{ missions:['收集 {n} 枚金币','单次跑酷达到 {n} 分','使用能力 {n} 次','到达世界 {n}','完成 {n} 次跑酷','达到 {n} 公里/小时'], claim:'领取', done:'完成', streak:'连续 {n} 天', reset:'重置时间：{time}' },
          bg:{ missions:['Събери {n} монети','Достигни {n} точки в едно бягане','Използвай умения {n} пъти','Достигни свят {n}','Завърши {n} бягания','Достигни {n} км/ч'], claim:'ВЗЕМИ', done:'ГОТОВО', streak:'Серия от {n} дни', reset:'Нулиране след: {time}' },
          id:{ missions:['Kumpulkan {n} koin','Raih {n} skor dalam satu lari','Gunakan kemampuan {n} kali','Capai dunia {n}','Selesaikan {n} lari','Capai {n} km/j'], claim:'AMBIL', done:'SELESAI', streak:'Rangkaian {n} hari', reset:'Reset dalam: {time}' },
          fi:{ missions:['Kerää {n} kolikkoa','Saavuta {n} pistettä yhdellä juoksulla','Käytä kykyjä {n} kertaa','Saavuta maailma {n}','Suorita {n} juoksua','Saavuta {n} km/h'], claim:'LUNASTA', done:'VALMIS', streak:'{n} päivän putki', reset:'Nollaus: {time}' },
          ja:{ missions:['コインを{n}枚集める','1回のランで{n}点に到達','能力を{n}回使う','ワールド{n}に到達','ランを{n}回完了','時速{n}kmに到達'], claim:'受け取る', done:'完了', streak:'{n}日連続', reset:'リセットまで：{time}' },
          'es-419':{ missions:['Recolecta {n} monedas','Alcanza {n} puntos en una carrera','Usa habilidades {n} veces','Llega al mundo {n}','Completa {n} carreras','Alcanza {n} km/h'], claim:'RECLAMAR', done:'LISTO', streak:'Racha de {n} días', reset:'Se reinicia en: {time}' },
          hu:{ missions:['Gyűjts {n} érmét','Érj el {n} pontot egy futamban','Használj képességet {n} alkalommal','Érd el a(z) {n}. világot','Teljesíts {n} futamot','Érd el a {n} km/h sebességet'], claim:'ÁTVÉTEL', done:'KÉSZ', streak:'{n} napos sorozat', reset:'Visszaállítás: {time}' },
          'pt-PT':{ missions:['Recolhe {n} moedas','Alcança {n} pontos numa corrida','Usa habilidades {n} vezes','Chega ao mundo {n}','Conclui {n} corridas','Atinge {n} km/h'], claim:'RECOLHER', done:'CONCLUÍDO', streak:'Série de {n} dias', reset:'Reinicia em: {time}' },
          ru:{ missions:['Собери {n} монет','Набери {n} очков за один забег','Используй способности {n} раз','Достигни мира {n}','Заверши {n} забегов','Достигни {n} км/ч'], claim:'ЗАБРАТЬ', done:'ГОТОВО', streak:'Серия {n} дней', reset:'Сброс через: {time}' },
          vi:{ missions:['Thu thập {n} xu','Đạt {n} điểm trong một lượt','Dùng kỹ năng {n} lần','Đến thế giới {n}','Hoàn thành {n} lượt chạy','Đạt {n} km/h'], claim:'NHẬN', done:'XONG', streak:'Chuỗi {n} ngày', reset:'Đặt lại sau: {time}' },
          cs:{ missions:['Sesbírej {n} mincí','Získej {n} bodů v jednom běhu','Použij schopnosti {n}krát','Dosáhni světa {n}','Dokonči {n} běhů','Dosáhni {n} km/h'], claim:'VYZVEDNOUT', done:'HOTOVO', streak:'Série {n} dní', reset:'Obnovení za: {time}' }
      });

  const NEW_RECORD_NAMES = {
          en: 'NEW RECORD!', tr: 'YENİ REKOR!', it: 'NUOVO RECORD!', 'es-ES': '¡NUEVO RÉCORD!',
          fr: 'NOUVEAU RECORD !', de: 'NEUER REKORD!', ar: 'رقم قياسي جديد!', 'pt-BR': 'NOVO RECORDE!',
          da: 'NY REKORD!', nl: 'NIEUW RECORD!', 'zh-Hant': '新紀錄！', ko: '신기록!',
          pl: 'NOWY REKORD!', no: 'NY REKORD!', ro: 'RECORD NOU!', th: 'สถิติใหม่!',
          uk: 'НОВИЙ РЕКОРД!', el: 'ΝΕΟ ΡΕΚΟΡ!', sv: 'NYTT REKORD!', 'zh-Hans': '新纪录！',
          bg: 'НОВ РЕКОРД!', id: 'REKOR BARU!', fi: 'UUSI ENNÄTYS!', ja: '新記録！',
          'es-419': '¡NUEVO RÉCORD!', hu: 'ÚJ REKORD!', 'pt-PT': 'NOVO RECORDE!', ru: 'НОВЫЙ РЕКОРД!',
          vi: 'KỶ LỤC MỚI!', cs: 'NOVÝ REKORD!'
      };

  const UI_TRANSLATIONS = {  
          tr: {  
              play: 'OYNA', newRun: 'YENİ KOŞU', upgrades: 'YÜKSELTMELER', settings: 'AYARLAR', leaderboard: 'LİDERLİK', quit: 'ÇIKIŞ',  
              highScore: 'EN YÜKSEK SKOR', score: 'Puan', gold: 'Altın', bestGold: 'En iyi altın', runs: 'Koşu sayısı', speed: 'Hız',  
              shop: 'Market', comingSoon: 'YAKINDA', close: 'Kapat', back: 'Geri', continue: 'DEVAM', mainMenu: 'ANA MENÜ',  
              pauseTitle: 'OYUN DURDURULDU', pauseHint: 'Devam etmek, ayarları açmak veya ana menüye dönmek için seçim yap.',  
              controlsHint: 'Fare: Bakış • A/D: Yan • Boşluk: Zıpla • C: Kay', gameOver: 'OYUN BİTTİ', retry: 'TEKRAR DENE',  
              graphics: 'Grafik', audio: 'Ses', controls: 'Kontroller', language: 'Dil',  
              graphicsDesc: 'Kalite, gölge ve çizim mesafesi.', audioDesc: 'Müzik, efekt ve menü sesleri.', controlsDesc: 'Bakış, HUD ve tuş düzeni.', languageDesc: 'Arayüz dilini seç.',  
              quality: 'Grafik Kalitesi', displayMode: 'Ekran Modu', windowed: 'Pencereli', borderless: 'Tam Ekran Pencereli', fullscreen: 'Tam Ekran', performance: 'Performans', balanced: 'Dengeli', high: 'Yüksek', ultra: 'Ultra',  
              masterVolume: 'Genel Ses', musicVolume: 'Müzik', sfxVolume: 'Efektler', uiVolume: 'Menü Sesleri',  
              audioOn: 'Ses Açık', audioOff: 'Ses Kapalı', hudStyle: 'HUD Stili', compactHud: 'Kompakt', normalHud: 'Normal',  
              mouseSensitivity: 'Mouse Hassasiyeti', invertY: 'Y Ekseni Ters', controlMap: 'Kontrol Haritası',  
              hands: 'Eller (Görsel)', handsOn: 'ELLER AÇIK', handsOff: 'ELLER KAPALI',  
              move: 'Yan hareket', moveLeft: 'Sola git', moveRight: 'Sağa git', jump: 'Zıpla / skill', slide: 'Kay', glide: 'Glide', doubleJump: 'Double Jump',  
              rebind: 'Değiştir', pressAnyKey: 'Tuşa bas', resetControls: 'Varsayılana dön', keyboardMouse: 'Klavye / mouse', controllerLayout: 'Kontrolcü: Sol stick bakış, sağ stick sağ/sol, A zıpla, B kay, Y double jump, LB/LT glide.',  
              chooseLanguage: 'Dil seçimi', subtitles: 'Altyazılar', fullVoice: 'Tam Seslendirme', interface: 'Arayüz',  
              scoreMultiplier: 'PUAN X', goldMultiplier: 'ALTIN X', jumpMultiplier: 'ZIPLAMA X', speedUpgrade: 'HIZ',  
              level: 'SEVİYE', cost: 'MALİYET', status: 'DURUM', locked: 'KİLİTLİ', owned: 'ALINDI', selected: 'SEÇİLİ',  
              ready: 'HAZIR', notEnoughGold: 'ALTIN YETERSİZ', maxLevel: 'MAX SEVİYE', active: 'AKTİF', buy: 'SATIN AL', select: 'SEÇ',  
              ability: 'YETENEK', loading: 'YÜKLENİYOR...', preparing: 'Hazırlanıyor...', loadingHint: 'Shaderlar, ses katmanları ve dünya parçaları hazırlanıyor.',  
              rebirth: 'YENİDEN DOĞUŞ', rebirthTag: 'Her şeyi sıfırlar', rebirthConfirm: 'EMİN MİSİN?', rebirthMax: 'MAX DOĞUŞ', rebirthDone: 'DOĞUŞ x',  
              readyToPlay: 'HAZIR', tapToStart: 'Başlamak için dokun', shieldActive: 'KALKAN AKTİF', bhopCombo: 'BHOP KOMBO',  
              speedBonus: 'Hız Bonusu', speedIncreasing: 'Hız artıyor!', hudControls: 'Fare: Bakış | A/D: Yan | Boşluk: Zıpla | Scroll Basılı: Glide | Çift Scroll: Double Jump | C: Kay',  
              infoText: '1000 puandan sonra her 10000 puanda yol genişler.', quitHint: 'Tarayıcı oyunlarında pencere kapatma izni sınırlı.', menu: 'MENÜ',  
              city: 'ŞEHİR', sky: 'GÖK', loadingBase: 'Malzemeler yükleniyor', loadingCoins: 'Altın varlıkları hazırlanıyor', loadingParticles: 'Parçacıklar hazırlanıyor',  
              loadingNature: 'Doğa kaynakları hazırlanıyor', loadingWorld: 'Dünya kuruluyor', loadingShaders: 'Shaderlar hazırlanıyor'  
          },  
          en: {  
              play: 'PLAY', newRun: 'NEW RUN', upgrades: 'UPGRADES', settings: 'SETTINGS', leaderboard: 'LEADERBOARD', quit: 'QUIT',  
              highScore: 'HIGHEST SCORE', score: 'Score', gold: 'Gold', bestGold: 'Best gold', runs: 'Runs', speed: 'Speed',  
              shop: 'Shop', comingSoon: 'SOON', close: 'Close', back: 'Back', continue: 'CONTINUE', mainMenu: 'MAIN MENU',  
              pauseTitle: 'PAUSED', pauseHint: 'Continue, open settings, or return to the main menu.',  
              controlsHint: 'Mouse: Look • A/D: Strafe • Space: Jump • C: Slide', gameOver: 'GAME OVER', retry: 'RETRY',  
              graphics: 'Graphics', audio: 'Audio', controls: 'Controls', language: 'Language',  
              graphicsDesc: 'Quality, shadows, and view distance.', audioDesc: 'Music, effects, and menu sounds.', controlsDesc: 'Look, HUD, and key layout.', languageDesc: 'Choose the interface language.',  
              quality: 'Graphics Quality', displayMode: 'Display Mode', windowed: 'Windowed', borderless: 'Borderless Fullscreen', fullscreen: 'Fullscreen', performance: 'Performance', balanced: 'Balanced', high: 'High', ultra: 'Ultra',  
              masterVolume: 'Master Volume', musicVolume: 'Music', sfxVolume: 'Effects', uiVolume: 'Menu Sounds',  
              audioOn: 'Audio On', audioOff: 'Audio Off', hudStyle: 'HUD Style', compactHud: 'Compact', normalHud: 'Normal',  
              mouseSensitivity: 'Mouse Sensitivity', invertY: 'Invert Y Axis', controlMap: 'Control Map',  
              hands: 'Hands (Visual)', handsOn: 'HANDS ON', handsOff: 'HANDS OFF',  
              move: 'Strafe', moveLeft: 'Move left', moveRight: 'Move right', jump: 'Jump / skill', slide: 'Slide', glide: 'Glide', doubleJump: 'Double Jump',  
              rebind: 'Change', pressAnyKey: 'Press a key', resetControls: 'Reset defaults', keyboardMouse: 'Keyboard / mouse', controllerLayout: 'Controller: left stick looks, right stick moves left/right, A jumps, B slides, Y double jumps, LB/LT glides.',  
              chooseLanguage: 'Language selection', subtitles: 'Subtitles', fullVoice: 'Full Voice', interface: 'Interface',  
              scoreMultiplier: 'SCORE X', goldMultiplier: 'GOLD X', jumpMultiplier: 'JUMP X', speedUpgrade: 'SPEED',  
              level: 'LEVEL', cost: 'COST', status: 'STATUS', locked: 'LOCKED', owned: 'OWNED', selected: 'SELECTED',  
              ready: 'READY', notEnoughGold: 'NOT ENOUGH GOLD', maxLevel: 'MAX LEVEL', active: 'ACTIVE', buy: 'BUY', select: 'SELECT',  
              ability: 'ABILITY', loading: 'LOADING...', preparing: 'Preparing...', loadingHint: 'Preparing shaders, audio layers, and world pieces.',  
              rebirth: 'REBIRTH', rebirthTag: 'Resets everything', rebirthConfirm: 'ARE YOU SURE?', rebirthMax: 'MAX REBIRTH', rebirthDone: 'REBIRTH x',  
              readyToPlay: 'READY', tapToStart: 'Tap to start', shieldActive: 'SHIELD ACTIVE', bhopCombo: 'BHOP COMBO',  
              speedBonus: 'Speed Bonus', speedIncreasing: 'Speed increasing!', hudControls: 'Mouse: Look | A/D: Strafe | Space: Jump | Hold Scroll: Glide | Double Scroll: Double Jump | C: Slide',  
              infoText: 'After 1000 score, the road widens every 10000 score.', quitHint: 'Browser games have limited permission to close the window.', menu: 'MENU',  
              city: 'CITY', sky: 'SKY', loadingBase: 'Loading base materials', loadingCoins: 'Preparing gold assets', loadingParticles: 'Preparing particles',  
              loadingNature: 'Preparing nature resources', loadingWorld: 'Building the world', loadingShaders: 'Preparing shaders'  
          },  
          ar: {  
              play: 'العب', newRun: 'جولة جديدة', upgrades: 'الترقيات', settings: 'الإعدادات', leaderboard: 'لوحة الصدارة', quit: 'خروج',  
              highScore: 'أعلى نتيجة', score: 'النقاط', gold: 'ذهب', bestGold: 'أفضل ذهب', runs: 'عدد الجولات', speed: 'السرعة',  
              shop: 'المتجر', comingSoon: 'قريبا', close: 'إغلاق', back: 'رجوع', continue: 'متابعة', mainMenu: 'القائمة الرئيسية',  
              pauseTitle: 'إيقاف مؤقت', pauseHint: 'تابع أو افتح الإعدادات أو ارجع إلى القائمة الرئيسية.',  
              controlsHint: 'الفأرة: نظر • A/D: جانبي • Space: قفز • C: انزلاق', gameOver: 'انتهت اللعبة', retry: 'حاول مجددا',  
              graphics: 'الرسوم', audio: 'الصوت', controls: 'التحكم', language: 'اللغة',  
              graphicsDesc: 'الجودة والظلال ومسافة الرسم.', audioDesc: 'الموسيقى والمؤثرات وأصوات القوائم.', controlsDesc: 'النظر وواجهة اللعب والأزرار.', languageDesc: 'اختر لغة الواجهة.',  
              quality: 'جودة الرسوم', displayMode: 'وضع الشاشة', windowed: 'نافذة', borderless: 'ملء الشاشة بلا حدود', fullscreen: 'ملء الشاشة', performance: 'أداء', balanced: 'متوازن', high: 'عال', ultra: 'فائق',  
              masterVolume: 'الصوت العام', musicVolume: 'الموسيقى', sfxVolume: 'المؤثرات', uiVolume: 'أصوات القائمة',  
              audioOn: 'الصوت يعمل', audioOff: 'الصوت مغلق', hudStyle: 'نمط الواجهة', compactHud: 'مصغر', normalHud: 'عادي',  
              mouseSensitivity: 'حساسية الفأرة', invertY: 'عكس محور Y', controlMap: 'خريطة التحكم',  
              move: 'حركة جانبية', moveLeft: 'تحرك يسارا', moveRight: 'تحرك يمينا', jump: 'قفز / مهارة', slide: 'انزلاق', glide: 'تحليق', doubleJump: 'قفزة مزدوجة',  
              rebind: 'تغيير', pressAnyKey: 'اضغط زرا', resetControls: 'إعادة الافتراضي', keyboardMouse: 'لوحة المفاتيح / الفأرة', controllerLayout: 'يد التحكم: العصا اليسرى للنظر، واليمنى للحركة، A للقفز، B للانزلاق، Y للقفزة المزدوجة، LB/LT للتحليق.',  
              chooseLanguage: 'اختيار اللغة', subtitles: 'ترجمة', fullVoice: 'دبلجة كاملة', interface: 'الواجهة',  
              scoreMultiplier: 'النقاط X', goldMultiplier: 'الذهب X', jumpMultiplier: 'القفز X', speedUpgrade: 'السرعة',  
              level: 'المستوى', cost: 'التكلفة', status: 'الحالة', locked: 'مقفل', owned: 'مملوك', selected: 'محدد',  
              ready: 'جاهز', notEnoughGold: 'ذهب غير كاف', maxLevel: 'أقصى مستوى', active: 'نشط', buy: 'شراء', select: 'اختر',  
              ability: 'مهارة', loading: 'جار التحميل...', preparing: 'جار التحضير...', loadingHint: 'جار تحضير الظلال وطبقات الصوت وأجزاء العالم.',  
              rebirth: 'ولادة جديدة', rebirthTag: 'يعيد ضبط كل شيء', rebirthConfirm: 'هل أنت متأكد؟', rebirthMax: 'أقصى ولادة', rebirthDone: 'ولادة x',  
              readyToPlay: 'جاهز', tapToStart: 'المس للبدء', shieldActive: 'الدرع نشط', bhopCombo: 'كومبو القفز',  
              speedBonus: 'مكافأة السرعة', speedIncreasing: 'السرعة تزداد!', hudControls: 'الفأرة: نظر | A/D: جانبي | Space: قفز | ضغط العجلة: تحليق | عجلة مرتين: قفزة مزدوجة | C: انزلاق',  
              infoText: 'بعد 1000 نقطة يتسع الطريق كل 10000 نقطة.', quitHint: 'ألعاب المتصفح لديها صلاحية محدودة لإغلاق النافذة.', menu: 'القائمة',  
              city: 'المدينة', sky: 'السماء', loadingBase: 'تحميل المواد الأساسية', loadingCoins: 'تحضير الذهب', loadingParticles: 'تحضير الجسيمات',  
              loadingNature: 'تحضير موارد الطبيعة', loadingWorld: 'بناء العالم', loadingShaders: 'تحضير الظلال'  
          }  
      };  
      Object.assign(UI_TRANSLATIONS, {  
          it: { play: 'GIOCA', newRun: 'NUOVA CORSA', upgrades: 'POTENZIAMENTI', settings: 'IMPOSTAZIONI', leaderboard: 'CLASSIFICA', quit: 'ESCI', highScore: 'PUNTEGGIO MASSIMO', score: 'Punteggio', gold: 'Oro', speed: 'Velocità', continue: 'CONTINUA', mainMenu: 'MENU PRINCIPALE', gameOver: 'FINE PARTITA', retry: 'RIPROVA', graphics: 'Grafica', audio: 'Audio', controls: 'Comandi', language: 'Lingua', mouseSensitivity: 'Sensibilità mouse', quality: 'Qualità grafica', performance: 'Prestazioni', balanced: 'Bilanciata', high: 'Alta', ultra: 'Ultra' },  
          'es-ES': { play: 'JUGAR', newRun: 'NUEVA CARRERA', upgrades: 'MEJORAS', settings: 'AJUSTES', leaderboard: 'CLASIFICACIÓN', quit: 'SALIR', highScore: 'PUNTUACIÓN MÁXIMA', score: 'Puntuación', gold: 'Oro', speed: 'Velocidad', continue: 'CONTINUAR', mainMenu: 'MENÚ PRINCIPAL', gameOver: 'FIN DEL JUEGO', retry: 'REINTENTAR', graphics: 'Gráficos', audio: 'Sonido', controls: 'Controles', language: 'Idioma', mouseSensitivity: 'Sensibilidad del ratón', quality: 'Calidad gráfica', performance: 'Rendimiento', balanced: 'Equilibrado', high: 'Alta', ultra: 'Ultra' },  
          fr: { play: 'JOUER', newRun: 'NOUVELLE COURSE', upgrades: 'AMÉLIORATIONS', settings: 'PARAMÈTRES', leaderboard: 'CLASSEMENT', quit: 'QUITTER', highScore: 'MEILLEUR SCORE', score: 'Score', gold: 'Or', speed: 'Vitesse', continue: 'CONTINUER', mainMenu: 'MENU PRINCIPAL', gameOver: 'PARTIE TERMINÉE', retry: 'RÉESSAYER', graphics: 'Graphismes', audio: 'Audio', controls: 'Contrôles', language: 'Langue', mouseSensitivity: 'Sensibilité souris', quality: 'Qualité graphique', performance: 'Performance', balanced: 'Équilibré', high: 'Élevée', ultra: 'Ultra' },  
          de: { play: 'SPIELEN', newRun: 'NEUER LAUF', upgrades: 'UPGRADES', settings: 'EINSTELLUNGEN', leaderboard: 'BESTENLISTE', quit: 'BEENDEN', highScore: 'HÖCHSTPUNKTZAHL', score: 'Punkte', gold: 'Gold', speed: 'Tempo', continue: 'WEITER', mainMenu: 'HAUPTMENÜ', gameOver: 'SPIEL VORBEI', retry: 'NOCHMAL', graphics: 'Grafik', audio: 'Audio', controls: 'Steuerung', language: 'Sprache', mouseSensitivity: 'Mausempfindlichkeit', quality: 'Grafikqualität', performance: 'Leistung', balanced: 'Ausgewogen', high: 'Hoch', ultra: 'Ultra' },  
          'pt-BR': { play: 'JOGAR', newRun: 'NOVA CORRIDA', upgrades: 'MELHORIAS', settings: 'CONFIGURAÇÕES', leaderboard: 'RANKING', quit: 'SAIR', highScore: 'RECORDE', score: 'Pontos', gold: 'Ouro', speed: 'Velocidade', continue: 'CONTINUAR', mainMenu: 'MENU PRINCIPAL', gameOver: 'FIM DE JOGO', retry: 'TENTAR DE NOVO', graphics: 'Gráficos', audio: 'Áudio', controls: 'Controles', language: 'Idioma', mouseSensitivity: 'Sensibilidade do mouse', quality: 'Qualidade gráfica', performance: 'Desempenho', balanced: 'Equilibrado', high: 'Alta', ultra: 'Ultra' },  
          da: { play: 'SPIL', newRun: 'NYT LØB', upgrades: 'OPGRADERINGER', settings: 'INDSTILLINGER', leaderboard: 'RANGLISTE', quit: 'AFSLUT', highScore: 'HØJESTE SCORE', score: 'Score', gold: 'Guld', speed: 'Hastighed', continue: 'FORTSÆT', mainMenu: 'HOVEDMENU', gameOver: 'SPIL SLUT', retry: 'PRØV IGEN', graphics: 'Grafik', audio: 'Lyd', controls: 'Styring', language: 'Sprog', mouseSensitivity: 'Musefølsomhed', quality: 'Grafikkvalitet', performance: 'Ydelse', balanced: 'Balanceret', high: 'Høj', ultra: 'Ultra' },  
          nl: { play: 'SPELEN', newRun: 'NIEUWE RUN', upgrades: 'UPGRADES', settings: 'INSTELLINGEN', leaderboard: 'RANGLIJST', quit: 'STOPPEN', highScore: 'HOOGSTE SCORE', score: 'Score', gold: 'Goud', speed: 'Snelheid', continue: 'DOORGAAN', mainMenu: 'HOOFDMENU', gameOver: 'SPEL VOORBIJ', retry: 'OPNIEUW', graphics: 'Grafisch', audio: 'Audio', controls: 'Besturing', language: 'Taal', mouseSensitivity: 'Muisgevoeligheid', quality: 'Grafische kwaliteit', performance: 'Prestaties', balanced: 'Gebalanceerd', high: 'Hoog', ultra: 'Ultra' },  
          'zh-Hant': { play: '開始', newRun: '新跑局', upgrades: '升級', settings: '設定', leaderboard: '排行榜', quit: '離開', highScore: '最高分', score: '分數', gold: '金幣', speed: '速度', continue: '繼續', mainMenu: '主選單', gameOver: '遊戲結束', retry: '重試', graphics: '圖形', audio: '音效', controls: '控制', language: '語言', mouseSensitivity: '滑鼠靈敏度', quality: '圖形品質', performance: '效能', balanced: '平衡', high: '高', ultra: '極致' },  
          ko: { play: '플레이', newRun: '새 달리기', upgrades: '업그레이드', settings: '설정', leaderboard: '순위표', quit: '나가기', highScore: '최고 점수', score: '점수', gold: '골드', speed: '속도', continue: '계속', mainMenu: '메인 메뉴', gameOver: '게임 오버', retry: '다시 시도', graphics: '그래픽', audio: '오디오', controls: '조작', language: '언어', mouseSensitivity: '마우스 감도', quality: '그래픽 품질', performance: '성능', balanced: '균형', high: '높음', ultra: '울트라' },  
          pl: { play: 'GRAJ', newRun: 'NOWY BIEG', upgrades: 'ULEPSZENIA', settings: 'USTAWIENIA', leaderboard: 'RANKING', quit: 'WYJDŹ', highScore: 'NAJLEPSZY WYNIK', score: 'Wynik', gold: 'Złoto', speed: 'Prędkość', continue: 'KONTYNUUJ', mainMenu: 'MENU GŁÓWNE', gameOver: 'KONIEC GRY', retry: 'SPRÓBUJ PONOWNIE', graphics: 'Grafika', audio: 'Dźwięk', controls: 'Sterowanie', language: 'Język', mouseSensitivity: 'Czułość myszy', quality: 'Jakość grafiki', performance: 'Wydajność', balanced: 'Zrównoważone', high: 'Wysoka', ultra: 'Ultra' },  
          no: { play: 'SPILL', newRun: 'NY RUNDE', upgrades: 'OPPGRADERINGER', settings: 'INNSTILLINGER', leaderboard: 'LEDERLISTE', quit: 'AVSLUTT', highScore: 'HØYESTE POENG', score: 'Poeng', gold: 'Gull', speed: 'Fart', continue: 'FORTSETT', mainMenu: 'HOVEDMENY', gameOver: 'SPILLET ER OVER', retry: 'PRØV IGJEN', graphics: 'Grafikk', audio: 'Lyd', controls: 'Kontroller', language: 'Språk', mouseSensitivity: 'Musefølsomhet', quality: 'Grafikkvalitet', performance: 'Ytelse', balanced: 'Balansert', high: 'Høy', ultra: 'Ultra' },  
          ro: { play: 'JOACĂ', newRun: 'CURSĂ NOUĂ', upgrades: 'ÎMBUNĂTĂȚIRI', settings: 'SETĂRI', leaderboard: 'CLASAMENT', quit: 'IEȘIRE', highScore: 'SCOR MAXIM', score: 'Scor', gold: 'Aur', speed: 'Viteză', continue: 'CONTINUĂ', mainMenu: 'MENIU PRINCIPAL', gameOver: 'JOC TERMINAT', retry: 'REÎNCEARCĂ', graphics: 'Grafică', audio: 'Sunet', controls: 'Controale', language: 'Limbă', mouseSensitivity: 'Sensibilitate mouse', quality: 'Calitate grafică', performance: 'Performanță', balanced: 'Echilibrat', high: 'Ridicată', ultra: 'Ultra' },  
          th: { play: 'เล่น', newRun: 'เริ่มใหม่', upgrades: 'อัปเกรด', settings: 'ตั้งค่า', leaderboard: 'อันดับ', quit: 'ออก', highScore: 'คะแนนสูงสุด', score: 'คะแนน', gold: 'ทอง', speed: 'ความเร็ว', continue: 'เล่นต่อ', mainMenu: 'เมนูหลัก', gameOver: 'จบเกม', retry: 'ลองอีกครั้ง', graphics: 'กราฟิก', audio: 'เสียง', controls: 'ควบคุม', language: 'ภาษา', mouseSensitivity: 'ความไวเมาส์', quality: 'คุณภาพกราฟิก', performance: 'ประสิทธิภาพ', balanced: 'สมดุล', high: 'สูง', ultra: 'อัลตรา' },  
          uk: { play: 'ГРАТИ', newRun: 'НОВИЙ ЗАБІГ', upgrades: 'ПОКРАЩЕННЯ', settings: 'НАЛАШТУВАННЯ', leaderboard: 'ТАБЛИЦЯ ЛІДЕРІВ', quit: 'ВИЙТИ', highScore: 'НАЙКРАЩИЙ РАХУНОК', score: 'Рахунок', gold: 'Золото', speed: 'Швидкість', continue: 'ПРОДОВЖИТИ', mainMenu: 'ГОЛОВНЕ МЕНЮ', gameOver: 'ГРУ ЗАВЕРШЕНО', retry: 'СПРОБУВАТИ ЗНОВУ', graphics: 'Графіка', audio: 'Звук', controls: 'Керування', language: 'Мова', mouseSensitivity: 'Чутливість миші', quality: 'Якість графіки', performance: 'Продуктивність', balanced: 'Збалансовано', high: 'Висока', ultra: 'Ультра' },  
          el: { play: 'ΠΑΙΞΕ', newRun: 'ΝΕΑ ΔΙΑΔΡΟΜΗ', upgrades: 'ΑΝΑΒΑΘΜΙΣΕΙΣ', settings: 'ΡΥΘΜΙΣΕΙΣ', leaderboard: 'ΚΑΤΑΤΑΞΗ', quit: 'ΕΞΟΔΟΣ', highScore: 'ΚΑΛΥΤΕΡΟ ΣΚΟΡ', score: 'Σκορ', gold: 'Χρυσός', speed: 'Ταχύτητα', continue: 'ΣΥΝΕΧΕΙΑ', mainMenu: 'ΚΥΡΙΟ ΜΕΝΟΥ', gameOver: 'ΤΕΛΟΣ ΠΑΙΧΝΙΔΙΟΥ', retry: 'ΞΑΝΑ', graphics: 'Γραφικά', audio: 'Ήχος', controls: 'Χειρισμός', language: 'Γλώσσα', mouseSensitivity: 'Ευαισθησία ποντικιού', quality: 'Ποιότητα γραφικών', performance: 'Απόδοση', balanced: 'Ισορροπημένο', high: 'Υψηλή', ultra: 'Ultra' },  
          sv: { play: 'SPELA', newRun: 'NY RUNDA', upgrades: 'UPPGRADERINGAR', settings: 'INSTÄLLNINGAR', leaderboard: 'TOPPLISTA', quit: 'AVSLUTA', highScore: 'HÖGSTA POÄNG', score: 'Poäng', gold: 'Guld', speed: 'Hastighet', continue: 'FORTSÄTT', mainMenu: 'HUVUDMENY', gameOver: 'SPELET ÄR SLUT', retry: 'FÖRSÖK IGEN', graphics: 'Grafik', audio: 'Ljud', controls: 'Kontroller', language: 'Språk', mouseSensitivity: 'Muskänslighet', quality: 'Grafikkvalitet', performance: 'Prestanda', balanced: 'Balanserad', high: 'Hög', ultra: 'Ultra' },  
          'zh-Hans': { play: '开始', newRun: '新跑局', upgrades: '升级', settings: '设置', leaderboard: '排行榜', quit: '退出', highScore: '最高分', score: '分数', gold: '金币', speed: '速度', continue: '继续', mainMenu: '主菜单', gameOver: '游戏结束', retry: '重试', graphics: '图形', audio: '音频', controls: '控制', language: '语言', mouseSensitivity: '鼠标灵敏度', quality: '图形质量', performance: '性能', balanced: '平衡', high: '高', ultra: '极致' },  
          bg: { play: 'ИГРАЙ', newRun: 'НОВО БЯГАНЕ', upgrades: 'ПОДОБРЕНИЯ', settings: 'НАСТРОЙКИ', leaderboard: 'КЛАСАЦИЯ', quit: 'ИЗХОД', highScore: 'НАЙ-ВИСОК РЕЗУЛТАТ', score: 'Резултат', gold: 'Злато', speed: 'Скорост', continue: 'ПРОДЪЛЖИ', mainMenu: 'ГЛАВНО МЕНЮ', gameOver: 'КРАЙ НА ИГРАТА', retry: 'ОПИТАЙ ПАК', graphics: 'Графика', audio: 'Звук', controls: 'Контроли', language: 'Език', mouseSensitivity: 'Чувствителност на мишката', quality: 'Качество на графиката', performance: 'Производителност', balanced: 'Балансирано', high: 'Високо', ultra: 'Ултра' },  
          id: { play: 'MAIN', newRun: 'LARI BARU', upgrades: 'UPGRADE', settings: 'PENGATURAN', leaderboard: 'PAPAN PERINGKAT', quit: 'KELUAR', highScore: 'SKOR TERTINGGI', score: 'Skor', gold: 'Emas', speed: 'Kecepatan', continue: 'LANJUT', mainMenu: 'MENU UTAMA', gameOver: 'GAME OVER', retry: 'COBA LAGI', graphics: 'Grafik', audio: 'Audio', controls: 'Kontrol', language: 'Bahasa', mouseSensitivity: 'Sensitivitas mouse', quality: 'Kualitas grafis', performance: 'Performa', balanced: 'Seimbang', high: 'Tinggi', ultra: 'Ultra' },  
          fi: { play: 'PELAA', newRun: 'UUSI JUOKSU', upgrades: 'PÄIVITYKSET', settings: 'ASETUKSET', leaderboard: 'TULOSTAULU', quit: 'LOPETA', highScore: 'PARAS TULOS', score: 'Pisteet', gold: 'Kulta', speed: 'Nopeus', continue: 'JATKA', mainMenu: 'PÄÄVALIKKO', gameOver: 'PELI OHI', retry: 'YRITÄ UUDELLEEN', graphics: 'Grafiikka', audio: 'Ääni', controls: 'Ohjaus', language: 'Kieli', mouseSensitivity: 'Hiiren herkkyys', quality: 'Grafiikan laatu', performance: 'Suorituskyky', balanced: 'Tasapainoinen', high: 'Korkea', ultra: 'Ultra' },  
          ja: { play: 'プレイ', newRun: '新しいラン', upgrades: 'アップグレード', settings: '設定', leaderboard: 'ランキング', quit: '終了', highScore: 'ハイスコア', score: 'スコア', gold: 'ゴールド', speed: '速度', continue: '続ける', mainMenu: 'メインメニュー', gameOver: 'ゲームオーバー', retry: 'リトライ', graphics: 'グラフィック', audio: 'オーディオ', controls: '操作', language: '言語', mouseSensitivity: 'マウス感度', quality: 'グラフィック品質', performance: 'パフォーマンス', balanced: 'バランス', high: '高', ultra: 'ウルトラ' },  
          'es-419': { play: 'JUGAR', newRun: 'NUEVA CARRERA', upgrades: 'MEJORAS', settings: 'AJUSTES', leaderboard: 'CLASIFICACIÓN', quit: 'SALIR', highScore: 'PUNTAJE MÁXIMO', score: 'Puntaje', gold: 'Oro', speed: 'Velocidad', continue: 'CONTINUAR', mainMenu: 'MENÚ PRINCIPAL', gameOver: 'FIN DEL JUEGO', retry: 'REINTENTAR', graphics: 'Gráficos', audio: 'Audio', controls: 'Controles', language: 'Idioma', mouseSensitivity: 'Sensibilidad del mouse', quality: 'Calidad gráfica', performance: 'Rendimiento', balanced: 'Equilibrado', high: 'Alta', ultra: 'Ultra' },  
          hu: { play: 'JÁTÉK', newRun: 'ÚJ FUTÁS', upgrades: 'FEJLESZTÉSEK', settings: 'BEÁLLÍTÁSOK', leaderboard: 'RANGLISTA', quit: 'KILÉPÉS', highScore: 'LEGJOBB PONTSZÁM', score: 'Pontszám', gold: 'Arany', speed: 'Sebesség', continue: 'FOLYTATÁS', mainMenu: 'FŐMENÜ', gameOver: 'JÁTÉK VÉGE', retry: 'ÚJRA', graphics: 'Grafika', audio: 'Hang', controls: 'Irányítás', language: 'Nyelv', mouseSensitivity: 'Egérérzékenység', quality: 'Grafikai minőség', performance: 'Teljesítmény', balanced: 'Kiegyensúlyozott', high: 'Magas', ultra: 'Ultra' },  
          'pt-PT': { play: 'JOGAR', newRun: 'NOVA CORRIDA', upgrades: 'MELHORIAS', settings: 'DEFINIÇÕES', leaderboard: 'CLASSIFICAÇÃO', quit: 'SAIR', highScore: 'PONTUAÇÃO MÁXIMA', score: 'Pontuação', gold: 'Ouro', speed: 'Velocidade', continue: 'CONTINUAR', mainMenu: 'MENU PRINCIPAL', gameOver: 'FIM DO JOGO', retry: 'TENTAR DE NOVO', graphics: 'Gráficos', audio: 'Áudio', controls: 'Controlos', language: 'Idioma', mouseSensitivity: 'Sensibilidade do rato', quality: 'Qualidade gráfica', performance: 'Desempenho', balanced: 'Equilibrado', high: 'Alta', ultra: 'Ultra' },  
          ru: { play: 'ИГРАТЬ', newRun: 'НОВЫЙ ЗАБЕГ', upgrades: 'УЛУЧШЕНИЯ', settings: 'НАСТРОЙКИ', leaderboard: 'ТАБЛИЦА ЛИДЕРОВ', quit: 'ВЫХОД', highScore: 'ЛУЧШИЙ СЧЁТ', score: 'Счёт', gold: 'Золото', speed: 'Скорость', continue: 'ПРОДОЛЖИТЬ', mainMenu: 'ГЛАВНОЕ МЕНЮ', gameOver: 'ИГРА ОКОНЧЕНА', retry: 'ПОВТОРИТЬ', graphics: 'Графика', audio: 'Звук', controls: 'Управление', language: 'Язык', mouseSensitivity: 'Чувствительность мыши', quality: 'Качество графики', performance: 'Производительность', balanced: 'Сбалансировано', high: 'Высокое', ultra: 'Ультра' },  
          vi: { play: 'CHƠI', newRun: 'LƯỢT MỚI', upgrades: 'NÂNG CẤP', settings: 'CÀI ĐẶT', leaderboard: 'BẢNG XẾP HẠNG', quit: 'THOÁT', highScore: 'ĐIỂM CAO NHẤT', score: 'Điểm', gold: 'Vàng', speed: 'Tốc độ', continue: 'TIẾP TỤC', mainMenu: 'MENU CHÍNH', gameOver: 'KẾT THÚC', retry: 'THỬ LẠI', graphics: 'Đồ họa', audio: 'Âm thanh', controls: 'Điều khiển', language: 'Ngôn ngữ', mouseSensitivity: 'Độ nhạy chuột', quality: 'Chất lượng đồ họa', performance: 'Hiệu năng', balanced: 'Cân bằng', high: 'Cao', ultra: 'Ultra' },  
          cs: { play: 'HRÁT', newRun: 'NOVÝ BĚH', upgrades: 'VYLEPŠENÍ', settings: 'NASTAVENÍ', leaderboard: 'ŽEBŘÍČEK', quit: 'KONEC', highScore: 'NEJVYŠŠÍ SKÓRE', score: 'Skóre', gold: 'Zlato', speed: 'Rychlost', continue: 'POKRAČOVAT', mainMenu: 'HLAVNÍ MENU', gameOver: 'KONEC HRY', retry: 'ZNOVU', graphics: 'Grafika', audio: 'Zvuk', controls: 'Ovládání', language: 'Jazyk', mouseSensitivity: 'Citlivost myši', quality: 'Kvalita grafiky', performance: 'Výkon', balanced: 'Vyvážené', high: 'Vysoká', ultra: 'Ultra' }  
      });  
      const UI_TRANSLATION_COMPLETION = {  
          it: { bestGold:'Miglior oro', runs:'Corse', shop:'Negozio', comingSoon:'PRESTO', close:'Chiudi', back:'Indietro', pauseHint:'Continua, apri le impostazioni o torna al menu principale.', controlsHint:'Mouse: visuale | A/D: laterale | Spazio: salta | Rotella premuta: Glide | Doppia rotella: Double Jump | C: scivola', masterVolume:'Volume generale', musicVolume:'Musica', sfxVolume:'Effetti', uiVolume:'Suoni menu', audioOn:'Audio attivo', audioOff:'Audio disattivato', hudStyle:'Stile HUD', compactHud:'Compatto', normalHud:'Normale', invertY:'Inverti asse Y', controlMap:'Mappa comandi', move:'Movimento laterale', jump:'Salto / abilità', slide:'Scivola', glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'PUNTEGGIO X', goldMultiplier:'ORO X', jumpMultiplier:'SALTO X', level:'LIVELLO', cost:'COSTO', status:'STATO', locked:'BLOCCATO', owned:'PRESO', selected:'SELEZIONATO', ready:'PRONTO', notEnoughGold:'ORO INSUFFICIENTE', maxLevel:'LIVELLO MAX', active:'ATTIVO', buy:'COMPRA', select:'SELEZIONA', ability:'ABILITÀ', loading:'CARICAMENTO...', preparing:'Preparazione...', loadingHint:'Preparazione shader, audio e mondo.', readyToPlay:'PRONTO', tapToStart:'Tocca per iniziare', shieldActive:'SCUDO ATTIVO', bhopCombo:'COMBO BHOP', speedBonus:'Bonus velocità', speedIncreasing:'Velocità in aumento!', infoText:'Dopo 1000 punti, la strada si allarga ogni 10000 punti.', quitHint:'Nei giochi browser la chiusura della finestra è limitata.', menu:'MENU', city:'CITTÀ', sky:'CIELO' },  
          'es-ES': { bestGold:'Mejor oro', runs:'Carreras', shop:'Tienda', comingSoon:'PRONTO', close:'Cerrar', back:'Atrás', pauseHint:'Continúa, abre ajustes o vuelve al menú principal.', controlsHint:'Ratón: mirar | A/D: lateral | Espacio: saltar | Rueda pulsada: Glide | Doble rueda: Double Jump | C: deslizar', masterVolume:'Volumen general', musicVolume:'Música', sfxVolume:'Efectos', uiVolume:'Sonidos del menú', audioOn:'Audio activado', audioOff:'Audio desactivado', hudStyle:'Estilo HUD', compactHud:'Compacto', normalHud:'Normal', invertY:'Invertir eje Y', controlMap:'Mapa de controles', move:'Movimiento lateral', jump:'Saltar / habilidad', slide:'Deslizar', glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'PUNTOS X', goldMultiplier:'ORO X', jumpMultiplier:'SALTO X', level:'NIVEL', cost:'COSTE', status:'ESTADO', locked:'BLOQUEADO', owned:'OBTENIDO', selected:'SELECCIONADO', ready:'LISTO', notEnoughGold:'ORO INSUFICIENTE', maxLevel:'NIVEL MÁX', active:'ACTIVO', buy:'COMPRAR', select:'SELECCIONAR', ability:'HABILIDAD', loading:'CARGANDO...', preparing:'Preparando...', loadingHint:'Preparando shaders, audio y mundo.', readyToPlay:'LISTO', tapToStart:'Toca para empezar', shieldActive:'ESCUDO ACTIVO', bhopCombo:'COMBO BHOP', speedBonus:'Bonificación de velocidad', speedIncreasing:'¡La velocidad aumenta!', infoText:'Después de 1000 puntos, la carretera se ensancha cada 10000 puntos.', quitHint:'Los juegos de navegador tienen permiso limitado para cerrar la ventana.', menu:'MENÚ', city:'CIUDAD', sky:'CIELO' },  
          fr: { bestGold:'Meilleur or', runs:'Courses', shop:'Boutique', comingSoon:'BIENTÔT', close:'Fermer', back:'Retour', pauseHint:'Continue, ouvre les paramètres ou retourne au menu principal.', controlsHint:'Souris: regarder | A/D: côté | Espace: sauter | Molette maintenue: Glide | Double molette: Double Jump | C: glisser', masterVolume:'Volume général', musicVolume:'Musique', sfxVolume:'Effets', uiVolume:'Sons du menu', audioOn:'Audio activé', audioOff:'Audio désactivé', hudStyle:'Style HUD', compactHud:'Compact', normalHud:'Normal', invertY:'Inverser Y', controlMap:'Commandes', move:'Déplacement latéral', jump:'Saut / compétence', slide:'Glissade', glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'SCORE X', goldMultiplier:'OR X', jumpMultiplier:'SAUT X', level:'NIVEAU', cost:'COÛT', status:'ÉTAT', locked:'VERROUILLÉ', owned:'OBTENU', selected:'SÉLECTIONNÉ', ready:'PRÊT', notEnoughGold:'OR INSUFFISANT', maxLevel:'NIVEAU MAX', active:'ACTIF', buy:'ACHETER', select:'CHOISIR', ability:'COMPÉTENCE', loading:'CHARGEMENT...', preparing:'Préparation...', loadingHint:'Préparation des shaders, sons et éléments du monde.', readyToPlay:'PRÊT', tapToStart:'Touchez pour commencer', shieldActive:'BOUCLIER ACTIF', bhopCombo:'COMBO BHOP', speedBonus:'Bonus de vitesse', speedIncreasing:'Vitesse en hausse!', infoText:'Après 1000 points, la route s’élargit tous les 10000 points.', quitHint:'Les jeux navigateur ont une permission limitée pour fermer la fenêtre.', menu:'MENU', city:'VILLE', sky:'CIEL' },  
          de: { bestGold:'Bestes Gold', runs:'Läufe', shop:'Shop', comingSoon:'BALD', close:'Schließen', back:'Zurück', pauseHint:'Weiter, Einstellungen öffnen oder zum Hauptmenü zurückkehren.', controlsHint:'Maus: Blick | A/D: seitlich | Leertaste: Springen | Rad halten: Glide | Doppelrad: Double Jump | C: Rutschen', masterVolume:'Gesamtlautstärke', musicVolume:'Musik', sfxVolume:'Effekte', uiVolume:'Menü-Sounds', audioOn:'Audio an', audioOff:'Audio aus', hudStyle:'HUD-Stil', compactHud:'Kompakt', normalHud:'Normal', invertY:'Y-Achse invertieren', controlMap:'Steuerungsplan', move:'Seitwärts', jump:'Sprung / Fähigkeit', slide:'Rutschen', glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'PUNKTE X', goldMultiplier:'GOLD X', jumpMultiplier:'SPRUNG X', level:'STUFE', cost:'KOSTEN', status:'STATUS', locked:'GESPERRT', owned:'ERHALTEN', selected:'AUSGEWÄHLT', ready:'BEREIT', notEnoughGold:'NICHT GENUG GOLD', maxLevel:'MAX STUFE', active:'AKTIV', buy:'KAUFEN', select:'WÄHLEN', ability:'FÄHIGKEIT', loading:'LÄDT...', preparing:'Vorbereitung...', loadingHint:'Shader, Audio und Weltteile werden vorbereitet.', readyToPlay:'BEREIT', tapToStart:'Tippen zum Starten', shieldActive:'SCHILD AKTIV', bhopCombo:'BHOP-KOMBO', speedBonus:'Tempo-Bonus', speedIncreasing:'Tempo steigt!', infoText:'Nach 1000 Punkten wird die Straße alle 10000 Punkte breiter.', quitHint:'Browser-Spiele dürfen das Fenster nur eingeschränkt schließen.', menu:'MENÜ', city:'STADT', sky:'HIMMEL' },  
          'pt-BR': { bestGold:'Melhor ouro', runs:'Corridas', shop:'Loja', comingSoon:'EM BREVE', close:'Fechar', back:'Voltar', pauseHint:'Continue, abra as configurações ou volte ao menu principal.', controlsHint:'Mouse: olhar | A/D: lateral | Espaço: pular | Scroll pressionado: Glide | Scroll duplo: Double Jump | C: deslizar', masterVolume:'Volume geral', musicVolume:'Música', sfxVolume:'Efeitos', uiVolume:'Sons do menu', audioOn:'Áudio ligado', audioOff:'Áudio desligado', hudStyle:'Estilo HUD', compactHud:'Compacto', normalHud:'Normal', invertY:'Inverter eixo Y', controlMap:'Mapa de controles', move:'Movimento lateral', jump:'Pulo / habilidade', slide:'Deslizar', glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'PONTOS X', goldMultiplier:'OURO X', jumpMultiplier:'PULO X', level:'NÍVEL', cost:'CUSTO', status:'STATUS', locked:'BLOQUEADO', owned:'OBTIDO', selected:'SELECIONADO', ready:'PRONTO', notEnoughGold:'OURO INSUFICIENTE', maxLevel:'NÍVEL MÁX', active:'ATIVO', buy:'COMPRAR', select:'SELECIONAR', ability:'HABILIDADE', loading:'CARREGANDO...', preparing:'Preparando...', loadingHint:'Preparando shaders, áudio e partes do mundo.', readyToPlay:'PRONTO', tapToStart:'Toque para começar', shieldActive:'ESCUDO ATIVO', bhopCombo:'COMBO BHOP', speedBonus:'Bônus de velocidade', speedIncreasing:'Velocidade aumentando!', infoText:'Depois de 1000 pontos, a estrada alarga a cada 10000 pontos.', quitHint:'Jogos de navegador têm permissão limitada para fechar a janela.', menu:'MENU', city:'CIDADE', sky:'CÉU' },  
          da: { bestGold:'Bedste guld', runs:'Løb', shop:'Butik', comingSoon:'SNART', close:'Luk', back:'Tilbage', pauseHint:'Fortsæt, åbn indstillinger eller gå til hovedmenuen.', controlsHint:'Mus: kig | A/D: sidelæns | Mellemrum: hop | Hold scroll: Glide | Dobbelt scroll: Double Jump | C: glid', masterVolume:'Samlet lyd', musicVolume:'Musik', sfxVolume:'Effekter', uiVolume:'Menulyd', audioOn:'Lyd til', audioOff:'Lyd fra', hudStyle:'HUD-stil', compactHud:'Kompakt', normalHud:'Normal', invertY:'Vend Y-akse', controlMap:'Kontrolkort', move:'Sidelæns', jump:'Hop / evne', slide:'Glid', glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'SCORE X', goldMultiplier:'GULD X', jumpMultiplier:'HOP X', level:'NIVEAU', cost:'PRIS', status:'STATUS', locked:'LÅST', owned:'EJET', selected:'VALGT', ready:'KLAR', notEnoughGold:'IKKE NOK GULD', maxLevel:'MAKS NIVEAU', active:'AKTIV', buy:'KØB', select:'VÆLG', ability:'EVNE', loading:'INDLÆSER...', preparing:'Forbereder...', loadingHint:'Forbereder shaders, lyd og verden.', readyToPlay:'KLAR', tapToStart:'Tryk for at starte', shieldActive:'SKJOLD AKTIVT', bhopCombo:'BHOP-KOMBO', speedBonus:'Hastighedsbonus', speedIncreasing:'Hastigheden stiger!', infoText:'Efter 1000 point bliver vejen bredere for hver 10000 point.', quitHint:'Browser-spil har begrænset tilladelse til at lukke vinduet.', menu:'MENU', city:'BY', sky:'HIMMEL' },  
          nl: { bestGold:'Beste goud', runs:'Runs', shop:'Winkel', comingSoon:'BINNENKORT', close:'Sluiten', back:'Terug', pauseHint:'Ga door, open instellingen of keer terug naar het hoofdmenu.', controlsHint:'Muis: kijken | A/D: zijwaarts | Spatie: springen | Scroll ingedrukt: Glide | Dubbel scroll: Double Jump | C: glijden', masterVolume:'Algemeen volume', musicVolume:'Muziek', sfxVolume:'Effecten', uiVolume:'Menu-geluiden', audioOn:'Audio aan', audioOff:'Audio uit', hudStyle:'HUD-stijl', compactHud:'Compact', normalHud:'Normaal', invertY:'Y-as omkeren', controlMap:'Besturing', move:'Zijwaarts', jump:'Springen / vaardigheid', slide:'Glijden', glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'SCORE X', goldMultiplier:'GOUD X', jumpMultiplier:'SPRONG X', level:'NIVEAU', cost:'KOSTEN', status:'STATUS', locked:'VERGRENDELD', owned:'GEKOCHT', selected:'GESELECTEERD', ready:'KLAAR', notEnoughGold:'NIET GENOEG GOUD', maxLevel:'MAX NIVEAU', active:'ACTIEF', buy:'KOPEN', select:'KIEZEN', ability:'VAARDIGHEID', loading:'LADEN...', preparing:'Voorbereiden...', loadingHint:'Shaders, audio en werelddelen voorbereiden.', readyToPlay:'KLAAR', tapToStart:'Tik om te starten', shieldActive:'SCHILD ACTIEF', bhopCombo:'BHOP-COMBO', speedBonus:'Snelheidsbonus', speedIncreasing:'Snelheid neemt toe!', infoText:'Na 1000 score wordt de weg elke 10000 score breder.', quitHint:'Browsergames mogen het venster beperkt sluiten.', menu:'MENU', city:'STAD', sky:'LUCHT' },  
          pl: { bestGold:'Najlepsze złoto', runs:'Biegi', shop:'Sklep', comingSoon:'WKRÓTCE', close:'Zamknij', back:'Wstecz', pauseHint:'Kontynuuj, otwórz ustawienia albo wróć do menu głównego.', controlsHint:'Mysz: kamera | A/D: bok | Spacja: skok | Przytrzymaj rolkę: Glide | Podwójna rolka: Double Jump | C: ślizg', masterVolume:'Głośność główna', musicVolume:'Muzyka', sfxVolume:'Efekty', uiVolume:'Dźwięki menu', audioOn:'Dźwięk włączony', audioOff:'Dźwięk wyłączony', hudStyle:'Styl HUD', compactHud:'Kompaktowy', normalHud:'Normalny', invertY:'Odwróć oś Y', controlMap:'Mapa sterowania', move:'Ruch boczny', jump:'Skok / umiejętność', slide:'Ślizg', glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'PUNKTY X', goldMultiplier:'ZŁOTO X', jumpMultiplier:'SKOK X', level:'POZIOM', cost:'KOSZT', status:'STATUS', locked:'ZABLOKOWANE', owned:'POSIADANE', selected:'WYBRANE', ready:'GOTOWE', notEnoughGold:'ZA MAŁO ZŁOTA', maxLevel:'MAKS POZIOM', active:'AKTYWNE', buy:'KUP', select:'WYBIERZ', ability:'UMIEJĘTNOŚĆ', loading:'ŁADOWANIE...', preparing:'Przygotowanie...', loadingHint:'Przygotowywanie shaderów, audio i świata.', readyToPlay:'GOTOWE', tapToStart:'Dotknij, aby zacząć', shieldActive:'TARCZA AKTYWNA', bhopCombo:'KOMBO BHOP', speedBonus:'Bonus prędkości', speedIncreasing:'Prędkość rośnie!', infoText:'Po 1000 punktów droga poszerza się co 10000 punktów.', quitHint:'Gry w przeglądarce mają ograniczone prawo zamykania okna.', menu:'MENU', city:'MIASTO', sky:'NIEBO' },  
          ru: { bestGold:'Лучшее золото', runs:'Забеги', shop:'Магазин', comingSoon:'СКОРО', close:'Закрыть', back:'Назад', pauseHint:'Продолжить, открыть настройки или вернуться в главное меню.', controlsHint:'Мышь: обзор | A/D: вбок | Пробел: прыжок | удерж. колесо: Glide | двойное колесо: Double Jump | C: скольжение', masterVolume:'Общая громкость', musicVolume:'Музыка', sfxVolume:'Эффекты', uiVolume:'Звуки меню', audioOn:'Звук вкл.', audioOff:'Звук выкл.', hudStyle:'Стиль HUD', compactHud:'Компактный', normalHud:'Обычный', invertY:'Инвертировать Y', controlMap:'Схема управления', move:'Движение вбок', jump:'Прыжок / навык', slide:'Скольжение', glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'СЧЁТ X', goldMultiplier:'ЗОЛОТО X', jumpMultiplier:'ПРЫЖОК X', level:'УРОВЕНЬ', cost:'ЦЕНА', status:'СТАТУС', locked:'ЗАКРЫТО', owned:'КУПЛЕНО', selected:'ВЫБРАНО', ready:'ГОТОВО', notEnoughGold:'НЕ ХВАТАЕТ ЗОЛОТА', maxLevel:'МАКС УРОВЕНЬ', active:'АКТИВНО', buy:'КУПИТЬ', select:'ВЫБРАТЬ', ability:'НАВЫК', loading:'ЗАГРУЗКА...', preparing:'Подготовка...', loadingHint:'Подготовка шейдеров, звука и мира.', readyToPlay:'ГОТОВО', tapToStart:'Нажмите, чтобы начать', shieldActive:'ЩИТ АКТИВЕН', bhopCombo:'BHOP-КОМБО', speedBonus:'Бонус скорости', speedIncreasing:'Скорость растёт!', infoText:'После 1000 очков дорога расширяется каждые 10000 очков.', quitHint:'Браузерные игры ограничены в закрытии окна.', menu:'МЕНЮ', city:'ГОРОД', sky:'НЕБО' }  
      };  
      ['es-419'].forEach((code) => { UI_TRANSLATION_COMPLETION[code] = { ...UI_TRANSLATION_COMPLETION['es-ES'], highScore: 'PUNTAJE MÁXIMO', score: 'Puntaje' }; });  
      ['pt-PT'].forEach((code) => { UI_TRANSLATION_COMPLETION[code] = { ...UI_TRANSLATION_COMPLETION['pt-BR'], controlsHint:'Rato: olhar | A/D: lateral | Espaço: saltar | Scroll premido: Glide | Scroll duplo: Double Jump | C: deslizar', mouseSensitivity:'Sensibilidade do rato' }; });  
      const extraFallbackCodes = ['zh-Hant','zh-Hans','ko','no','ro','th','uk','el','sv','bg','id','fi','ja','hu','vi','cs'];  
      const conciseCompletion = {  
          bestGold:'Best gold', runs:'Runs', shop:'Shop', comingSoon:'SOON', close:'Close', back:'Back', pauseHint:'Continue, open settings, or return to the main menu.',  
          controlsHint:'Mouse: Look | A/D: Strafe | Space: Jump | Hold Scroll: Glide | Double Scroll: Double Jump | C: Slide',  
          masterVolume:'Master', musicVolume:'Music', sfxVolume:'Effects', uiVolume:'Menu sounds', audioOn:'Audio on', audioOff:'Audio off',  
          hudStyle:'HUD', compactHud:'Compact', normalHud:'Normal', invertY:'Invert Y', controlMap:'Controls', move:'Move', jump:'Jump / skill', slide:'Slide',  
          glide:'Glide', doubleJump:'Double Jump', scoreMultiplier:'SCORE X', goldMultiplier:'GOLD X', jumpMultiplier:'JUMP X', level:'LEVEL', cost:'COST',  
          status:'STATUS', locked:'LOCKED', owned:'OWNED', selected:'SELECTED', ready:'READY', notEnoughGold:'NOT ENOUGH GOLD', maxLevel:'MAX LEVEL',  
          active:'ACTIVE', buy:'BUY', select:'SELECT', ability:'ABILITY', loading:'LOADING...', preparing:'Preparing...', loadingHint:'Preparing game assets.',  
          readyToPlay:'READY', tapToStart:'Tap to start', shieldActive:'SHIELD ACTIVE', bhopCombo:'BHOP COMBO', speedBonus:'Speed Bonus',  
          speedIncreasing:'Speed increasing!', infoText:'After 1000 score, the road widens every 10000 score.', quitHint:'Browser games have limited permission to close the window.',  
          menu:'MENU', city:'CITY', sky:'SKY'  
      };  
      extraFallbackCodes.forEach((code) => { UI_TRANSLATION_COMPLETION[code] = { ...conciseCompletion, ...(UI_TRANSLATION_COMPLETION[code] || {}) }; });  
      Object.assign(UI_TRANSLATION_COMPLETION, {  
          'zh-Hant': { ...UI_TRANSLATION_COMPLETION['zh-Hant'], bestGold:'最佳金幣', runs:'跑局', shop:'商店', comingSoon:'即將推出', close:'關閉', back:'返回', pauseHint:'繼續、開啟設定或回到主選單。', masterVolume:'總音量', musicVolume:'音樂', sfxVolume:'音效', uiVolume:'選單音效', audioOn:'音效開啟', audioOff:'音效關閉', hudStyle:'HUD 樣式', compactHud:'精簡', normalHud:'一般', invertY:'反轉 Y 軸', controlMap:'控制表', move:'橫向移動', jump:'跳躍 / 技能', slide:'滑行', scoreMultiplier:'分數 X', goldMultiplier:'金幣 X', jumpMultiplier:'跳躍 X', level:'等級', cost:'費用', status:'狀態', locked:'鎖定', owned:'已擁有', selected:'已選擇', ready:'就緒', notEnoughGold:'金幣不足', maxLevel:'最高等級', active:'啟用', buy:'購買', select:'選擇', ability:'技能', loading:'載入中...', preparing:'準備中...', loadingHint:'正在準備著色器、音效和世界。', readyToPlay:'就緒', tapToStart:'點擊開始', shieldActive:'護盾啟用', bhopCombo:'BHOP 連段', speedBonus:'速度加成', speedIncreasing:'速度提升中!', infoText:'1000 分後，每 10000 分道路會加寬。', quitHint:'瀏覽器遊戲關閉視窗的權限有限。', menu:'選單', city:'城市', sky:'天空' },  
          'zh-Hans': { ...UI_TRANSLATION_COMPLETION['zh-Hans'], bestGold:'最佳金币', runs:'跑局', shop:'商店', comingSoon:'即将推出', close:'关闭', back:'返回', pauseHint:'继续、打开设置或返回主菜单。', masterVolume:'总音量', musicVolume:'音乐', sfxVolume:'音效', uiVolume:'菜单音效', audioOn:'音频开启', audioOff:'音频关闭', hudStyle:'HUD 样式', compactHud:'精简', normalHud:'普通', invertY:'反转 Y 轴', controlMap:'控制表', move:'横向移动', jump:'跳跃 / 技能', slide:'滑行', scoreMultiplier:'分数 X', goldMultiplier:'金币 X', jumpMultiplier:'跳跃 X', level:'等级', cost:'费用', status:'状态', locked:'锁定', owned:'已拥有', selected:'已选择', ready:'就绪', notEnoughGold:'金币不足', maxLevel:'最高等级', active:'启用', buy:'购买', select:'选择', ability:'技能', loading:'加载中...', preparing:'准备中...', loadingHint:'正在准备着色器、音频和世界。', readyToPlay:'就绪', tapToStart:'点击开始', shieldActive:'护盾启用', bhopCombo:'BHOP 连段', speedBonus:'速度加成', speedIncreasing:'速度提升中!', infoText:'1000 分后，每 10000 分道路会变宽。', quitHint:'浏览器游戏关闭窗口的权限有限。', menu:'菜单', city:'城市', sky:'天空' },  
          ko: { ...UI_TRANSLATION_COMPLETION.ko, bestGold:'최고 골드', runs:'달리기 수', shop:'상점', comingSoon:'곧 공개', close:'닫기', back:'뒤로', pauseHint:'계속하거나 설정을 열거나 메인 메뉴로 돌아갑니다.', masterVolume:'전체 음량', musicVolume:'음악', sfxVolume:'효과음', uiVolume:'메뉴 소리', audioOn:'소리 켜짐', audioOff:'소리 꺼짐', hudStyle:'HUD 스타일', compactHud:'간단히', normalHud:'일반', invertY:'Y축 반전', controlMap:'조작표', move:'좌우 이동', jump:'점프 / 스킬', slide:'슬라이드', scoreMultiplier:'점수 X', goldMultiplier:'골드 X', jumpMultiplier:'점프 X', level:'레벨', cost:'비용', status:'상태', locked:'잠김', owned:'보유', selected:'선택됨', ready:'준비됨', notEnoughGold:'골드 부족', maxLevel:'최대 레벨', active:'활성', buy:'구매', select:'선택', ability:'스킬', loading:'불러오는 중...', preparing:'준비 중...', loadingHint:'셰이더, 오디오, 월드를 준비 중입니다.', readyToPlay:'준비됨', tapToStart:'터치하여 시작', shieldActive:'방패 활성', bhopCombo:'BHOP 콤보', speedBonus:'속도 보너스', speedIncreasing:'속도 상승 중!', infoText:'1000점 이후 10000점마다 도로가 넓어집니다.', quitHint:'브라우저 게임은 창 닫기 권한이 제한됩니다.', menu:'메뉴', city:'도시', sky:'하늘' },  
          no: { ...UI_TRANSLATION_COMPLETION.no, bestGold:'Beste gull', runs:'Runder', shop:'Butikk', comingSoon:'SNART', close:'Lukk', back:'Tilbake', pauseHint:'Fortsett, åpne innstillinger eller gå til hovedmenyen.', masterVolume:'Hovedvolum', musicVolume:'Musikk', sfxVolume:'Effekter', uiVolume:'Menylyder', audioOn:'Lyd på', audioOff:'Lyd av', hudStyle:'HUD-stil', compactHud:'Kompakt', normalHud:'Normal', invertY:'Inverter Y-akse', controlMap:'Kontroller', move:'Sidelengs', jump:'Hopp / evne', slide:'Skli', scoreMultiplier:'POENG X', goldMultiplier:'GULL X', jumpMultiplier:'HOPP X', level:'NIVÅ', cost:'KOSTNAD', status:'STATUS', locked:'LÅST', owned:'EID', selected:'VALGT', ready:'KLAR', notEnoughGold:'IKKE NOK GULL', maxLevel:'MAKS NIVÅ', active:'AKTIV', buy:'KJØP', select:'VELG', ability:'EVNE', loading:'LASTER...', preparing:'Forbereder...', loadingHint:'Forbereder shaders, lyd og verden.', readyToPlay:'KLAR', tapToStart:'Trykk for å starte', shieldActive:'SKJOLD AKTIVT', bhopCombo:'BHOP-KOMBO', speedBonus:'Fartsbonus', speedIncreasing:'Farten øker!', infoText:'Etter 1000 poeng utvides veien for hver 10000 poeng.', quitHint:'Nettleserspill har begrenset tillatelse til å lukke vinduet.', menu:'MENY', city:'BY', sky:'HIMMEL' },  
          ro: { ...UI_TRANSLATION_COMPLETION.ro, bestGold:'Cel mai bun aur', runs:'Curse', shop:'Magazin', comingSoon:'ÎN CURÂND', close:'Închide', back:'Înapoi', pauseHint:'Continuă, deschide setările sau revino la meniul principal.', masterVolume:'Volum principal', musicVolume:'Muzică', sfxVolume:'Efecte', uiVolume:'Sunete meniu', audioOn:'Sunet activ', audioOff:'Sunet oprit', hudStyle:'Stil HUD', compactHud:'Compact', normalHud:'Normal', invertY:'Inversează axa Y', controlMap:'Hartă controale', move:'Mișcare laterală', jump:'Salt / abilitate', slide:'Alunecare', scoreMultiplier:'SCOR X', goldMultiplier:'AUR X', jumpMultiplier:'SALT X', level:'NIVEL', cost:'COST', status:'STARE', locked:'BLOCAT', owned:'DEȚINUT', selected:'SELECTAT', ready:'GATA', notEnoughGold:'AUR INSUFICIENT', maxLevel:'NIVEL MAX', active:'ACTIV', buy:'CUMPĂRĂ', select:'SELECTEAZĂ', ability:'ABILITATE', loading:'SE ÎNCARCĂ...', preparing:'Se pregătește...', loadingHint:'Se pregătesc shaderele, sunetul și lumea.', readyToPlay:'GATA', tapToStart:'Atinge pentru start', shieldActive:'SCUT ACTIV', bhopCombo:'COMBO BHOP', speedBonus:'Bonus viteză', speedIncreasing:'Viteza crește!', infoText:'După 1000 scor, drumul se lărgește la fiecare 10000 scor.', quitHint:'Jocurile browser au permisiuni limitate pentru închiderea ferestrei.', menu:'MENIU', city:'ORAȘ', sky:'CER' },  
          sv: { ...UI_TRANSLATION_COMPLETION.sv, bestGold:'Bästa guld', runs:'Rundor', shop:'Butik', comingSoon:'SNART', close:'Stäng', back:'Tillbaka', pauseHint:'Fortsätt, öppna inställningar eller gå till huvudmenyn.', masterVolume:'Huvudvolym', musicVolume:'Musik', sfxVolume:'Effekter', uiVolume:'Menyljud', audioOn:'Ljud på', audioOff:'Ljud av', hudStyle:'HUD-stil', compactHud:'Kompakt', normalHud:'Normal', invertY:'Invertera Y-axel', controlMap:'Kontroller', move:'Sidled', jump:'Hopp / förmåga', slide:'Glid', scoreMultiplier:'POÄNG X', goldMultiplier:'GULD X', jumpMultiplier:'HOPP X', level:'NIVÅ', cost:'KOSTNAD', status:'STATUS', locked:'LÅST', owned:'ÄGD', selected:'VALD', ready:'REDO', notEnoughGold:'INTE NOG GULD', maxLevel:'MAX NIVÅ', active:'AKTIV', buy:'KÖP', select:'VÄLJ', ability:'FÖRMÅGA', loading:'LADDAR...', preparing:'Förbereder...', loadingHint:'Förbereder shaders, ljud och värld.', readyToPlay:'REDO', tapToStart:'Tryck för att starta', shieldActive:'SKÖLD AKTIV', bhopCombo:'BHOP-KOMBO', speedBonus:'Hastighetsbonus', speedIncreasing:'Hastigheten ökar!', infoText:'Efter 1000 poäng blir vägen bredare var 10000:e poäng.', quitHint:'Webbläsarspel har begränsad rätt att stänga fönstret.', menu:'MENY', city:'STAD', sky:'HIMMEL' },  
          ja: { ...UI_TRANSLATION_COMPLETION.ja, bestGold:'最高ゴールド', runs:'ラン数', shop:'ショップ', comingSoon:'近日公開', close:'閉じる', back:'戻る', pauseHint:'続行、設定を開く、またはメインメニューへ戻る。', masterVolume:'全体音量', musicVolume:'音楽', sfxVolume:'効果音', uiVolume:'メニュー音', audioOn:'音声オン', audioOff:'音声オフ', hudStyle:'HUDスタイル', compactHud:'コンパクト', normalHud:'通常', invertY:'Y軸反転', controlMap:'操作一覧', move:'横移動', jump:'ジャンプ / スキル', slide:'スライド', scoreMultiplier:'スコア X', goldMultiplier:'ゴールド X', jumpMultiplier:'ジャンプ X', level:'レベル', cost:'コスト', status:'状態', locked:'ロック中', owned:'所持', selected:'選択中', ready:'準備完了', notEnoughGold:'ゴールド不足', maxLevel:'最大レベル', active:'有効', buy:'購入', select:'選択', ability:'スキル', loading:'読み込み中...', preparing:'準備中...', loadingHint:'シェーダー、音声、ワールドを準備中。', readyToPlay:'準備完了', tapToStart:'タップして開始', shieldActive:'シールド有効', bhopCombo:'BHOPコンボ', speedBonus:'速度ボーナス', speedIncreasing:'速度上昇中!', infoText:'1000点以降、10000点ごとに道が広がります。', quitHint:'ブラウザゲームはウィンドウを閉じる権限が制限されています。', menu:'メニュー', city:'都市', sky:'空' },  
          th: { ...UI_TRANSLATION_COMPLETION.th, bestGold:'ทองสูงสุด', runs:'จำนวนรอบ', shop:'ร้านค้า', comingSoon:'เร็วๆ นี้', close:'ปิด', back:'กลับ', pauseHint:'เล่นต่อ เปิดตั้งค่า หรือกลับไปเมนูหลัก', masterVolume:'เสียงหลัก', musicVolume:'เพลง', sfxVolume:'เอฟเฟกต์', uiVolume:'เสียงเมนู', audioOn:'เปิดเสียง', audioOff:'ปิดเสียง', hudStyle:'รูปแบบ HUD', compactHud:'ย่อ', normalHud:'ปกติ', invertY:'กลับแกน Y', controlMap:'ผังควบคุม', move:'เคลื่อนที่ด้านข้าง', jump:'กระโดด / สกิล', slide:'สไลด์', scoreMultiplier:'คะแนน X', goldMultiplier:'ทอง X', jumpMultiplier:'กระโดด X', level:'เลเวล', cost:'ราคา', status:'สถานะ', locked:'ล็อก', owned:'มีแล้ว', selected:'เลือกแล้ว', ready:'พร้อม', notEnoughGold:'ทองไม่พอ', maxLevel:'เลเวลสูงสุด', active:'ใช้งาน', buy:'ซื้อ', select:'เลือก', ability:'สกิล', loading:'กำลังโหลด...', preparing:'กำลังเตรียม...', loadingHint:'กำลังเตรียมเชดเดอร์ เสียง และโลก', readyToPlay:'พร้อม', tapToStart:'แตะเพื่อเริ่ม', shieldActive:'โล่ทำงาน', bhopCombo:'คอมโบ BHOP', speedBonus:'โบนัสความเร็ว', speedIncreasing:'ความเร็วเพิ่มขึ้น!', infoText:'หลัง 1000 คะแนน ถนนจะกว้างขึ้นทุก 10000 คะแนน', quitHint:'เกมบนเบราว์เซอร์มีสิทธิ์ปิดหน้าต่างจำกัด', menu:'เมนู', city:'เมือง', sky:'ท้องฟ้า' },  
          uk: { ...UI_TRANSLATION_COMPLETION.uk, bestGold:'Найкраще золото', runs:'Забіги', shop:'Крамниця', comingSoon:'СКОРО', close:'Закрити', back:'Назад', pauseHint:'Продовжити, відкрити налаштування або повернутися до головного меню.', masterVolume:'Загальна гучність', musicVolume:'Музика', sfxVolume:'Ефекти', uiVolume:'Звуки меню', audioOn:'Звук увімк.', audioOff:'Звук вимк.', hudStyle:'Стиль HUD', compactHud:'Компактний', normalHud:'Звичайний', invertY:'Інвертувати Y', controlMap:'Схема керування', move:'Рух убік', jump:'Стрибок / навичка', slide:'Ковзання', scoreMultiplier:'РАХУНОК X', goldMultiplier:'ЗОЛОТО X', jumpMultiplier:'СТРИБОК X', level:'РІВЕНЬ', cost:'ЦІНА', status:'СТАН', locked:'ЗАБЛОКОВАНО', owned:'ПРИДБАНО', selected:'ВИБРАНО', ready:'ГОТОВО', notEnoughGold:'БРАКУЄ ЗОЛОТА', maxLevel:'МАКС РІВЕНЬ', active:'АКТИВНО', buy:'КУПИТИ', select:'ВИБРАТИ', ability:'НАВИЧКА', loading:'ЗАВАНТАЖЕННЯ...', preparing:'Підготовка...', loadingHint:'Підготовка шейдерів, звуку та світу.', readyToPlay:'ГОТОВО', tapToStart:'Торкніться, щоб почати', shieldActive:'ЩИТ АКТИВНИЙ', bhopCombo:'BHOP-КОМБО', speedBonus:'Бонус швидкості', speedIncreasing:'Швидкість зростає!', infoText:'Після 1000 очок дорога розширюється кожні 10000 очок.', quitHint:'Браузерні ігри мають обмежений дозвіл закривати вікно.', menu:'МЕНЮ', city:'МІСТО', sky:'НЕБО' },  
          el: { ...UI_TRANSLATION_COMPLETION.el, bestGold:'Καλύτερος χρυσός', runs:'Διαδρομές', shop:'Κατάστημα', comingSoon:'ΣΥΝΤΟΜΑ', close:'Κλείσιμο', back:'Πίσω', pauseHint:'Συνέχισε, άνοιξε ρυθμίσεις ή γύρισε στο κύριο μενού.', masterVolume:'Γενική ένταση', musicVolume:'Μουσική', sfxVolume:'Εφέ', uiVolume:'Ήχοι μενού', audioOn:'Ήχος ενεργός', audioOff:'Ήχος κλειστός', hudStyle:'Στυλ HUD', compactHud:'Συμπαγές', normalHud:'Κανονικό', invertY:'Αντιστροφή Y', controlMap:'Χειρισμός', move:'Πλάγια κίνηση', jump:'Άλμα / ικανότητα', slide:'Ολίσθηση', scoreMultiplier:'ΣΚΟΡ X', goldMultiplier:'ΧΡΥΣΟΣ X', jumpMultiplier:'ΑΛΜΑ X', level:'ΕΠΙΠΕΔΟ', cost:'ΚΟΣΤΟΣ', status:'ΚΑΤΑΣΤΑΣΗ', locked:'ΚΛΕΙΔΩΜΕΝΟ', owned:'ΑΠΟΚΤΗΘΗΚΕ', selected:'ΕΠΙΛΕΓΜΕΝΟ', ready:'ΕΤΟΙΜΟ', notEnoughGold:'ΛΙΓΟΣ ΧΡΥΣΟΣ', maxLevel:'ΜΕΓΙΣΤΟ ΕΠΙΠΕΔΟ', active:'ΕΝΕΡΓΟ', buy:'ΑΓΟΡΑ', select:'ΕΠΙΛΟΓΗ', ability:'ΙΚΑΝΟΤΗΤΑ', loading:'ΦΟΡΤΩΣΗ...', preparing:'Προετοιμασία...', loadingHint:'Προετοιμασία shaders, ήχου και κόσμου.', readyToPlay:'ΕΤΟΙΜΟ', tapToStart:'Άγγιξε για έναρξη', shieldActive:'ΑΣΠΙΔΑ ΕΝΕΡΓΗ', bhopCombo:'BHOP COMBO', speedBonus:'Μπόνους ταχύτητας', speedIncreasing:'Η ταχύτητα αυξάνεται!', infoText:'Μετά τους 1000 πόντους ο δρόμος φαρδαίνει κάθε 10000 πόντους.', quitHint:'Τα παιχνίδια browser έχουν περιορισμένη άδεια κλεισίματος παραθύρου.', menu:'ΜΕΝΟΥ', city:'ΠΟΛΗ', sky:'ΟΥΡΑΝΟΣ' },  
          bg: { ...UI_TRANSLATION_COMPLETION.bg, bestGold:'Най-добро злато', runs:'Бягания', shop:'Магазин', comingSoon:'СКОРО', close:'Затвори', back:'Назад', pauseHint:'Продължи, отвори настройките или се върни в главното меню.', masterVolume:'Основна сила', musicVolume:'Музика', sfxVolume:'Ефекти', uiVolume:'Звуци на менюто', audioOn:'Звук включен', audioOff:'Звук изключен', hudStyle:'HUD стил', compactHud:'Компактен', normalHud:'Нормален', invertY:'Обърни Y ос', controlMap:'Контроли', move:'Странично движение', jump:'Скок / умение', slide:'Плъзгане', scoreMultiplier:'РЕЗУЛТАТ X', goldMultiplier:'ЗЛАТО X', jumpMultiplier:'СКОК X', level:'НИВО', cost:'ЦЕНА', status:'СТАТУС', locked:'ЗАКЛЮЧЕНО', owned:'ПРИТЕЖАВАНО', selected:'ИЗБРАНО', ready:'ГОТОВО', notEnoughGold:'НЯМА ДОСТАТЪЧНО ЗЛАТО', maxLevel:'МАКС НИВО', active:'АКТИВНО', buy:'КУПИ', select:'ИЗБЕРИ', ability:'УМЕНИЕ', loading:'ЗАРЕЖДАНЕ...', preparing:'Подготовка...', loadingHint:'Подготовка на шейдъри, звук и свят.', readyToPlay:'ГОТОВО', tapToStart:'Докосни за старт', shieldActive:'ЩИТ АКТИВЕН', bhopCombo:'BHOP КОМБО', speedBonus:'Бонус скорост', speedIncreasing:'Скоростта се увеличава!', infoText:'След 1000 точки пътят се разширява на всеки 10000 точки.', quitHint:'Браузърните игри имат ограничено разрешение да затварят прозорец.', menu:'МЕНЮ', city:'ГРАД', sky:'НЕБЕ' },  
          id: { ...UI_TRANSLATION_COMPLETION.id, bestGold:'Emas terbaik', runs:'Jumlah lari', shop:'Toko', comingSoon:'SEGERA', close:'Tutup', back:'Kembali', pauseHint:'Lanjutkan, buka pengaturan, atau kembali ke menu utama.', masterVolume:'Volume utama', musicVolume:'Musik', sfxVolume:'Efek', uiVolume:'Suara menu', audioOn:'Audio aktif', audioOff:'Audio mati', hudStyle:'Gaya HUD', compactHud:'Ringkas', normalHud:'Normal', invertY:'Balik sumbu Y', controlMap:'Peta kontrol', move:'Gerak samping', jump:'Lompat / skill', slide:'Meluncur', scoreMultiplier:'SKOR X', goldMultiplier:'EMAS X', jumpMultiplier:'LOMPAT X', level:'LEVEL', cost:'BIAYA', status:'STATUS', locked:'TERKUNCI', owned:'DIMILIKI', selected:'DIPILIH', ready:'SIAP', notEnoughGold:'EMAS KURANG', maxLevel:'LEVEL MAKS', active:'AKTIF', buy:'BELI', select:'PILIH', ability:'SKILL', loading:'MEMUAT...', preparing:'Menyiapkan...', loadingHint:'Menyiapkan shader, audio, dan dunia.', readyToPlay:'SIAP', tapToStart:'Ketuk untuk mulai', shieldActive:'PERISAI AKTIF', bhopCombo:'KOMBO BHOP', speedBonus:'Bonus kecepatan', speedIncreasing:'Kecepatan meningkat!', infoText:'Setelah skor 1000, jalan melebar setiap 10000 skor.', quitHint:'Game browser memiliki izin terbatas untuk menutup jendela.', menu:'MENU', city:'KOTA', sky:'LANGIT' },  
          fi: { ...UI_TRANSLATION_COMPLETION.fi, bestGold:'Paras kulta', runs:'Juoksut', shop:'Kauppa', comingSoon:'PIAN', close:'Sulje', back:'Takaisin', pauseHint:'Jatka, avaa asetukset tai palaa päävalikkoon.', masterVolume:'Pää-ääni', musicVolume:'Musiikki', sfxVolume:'Efektit', uiVolume:'Valikkoäänet', audioOn:'Ääni päällä', audioOff:'Ääni pois', hudStyle:'HUD-tyyli', compactHud:'Tiivis', normalHud:'Normaali', invertY:'Käännä Y-akseli', controlMap:'Ohjauskartta', move:'Sivuttaisliike', jump:'Hyppy / taito', slide:'Liuku', scoreMultiplier:'PISTEET X', goldMultiplier:'KULTA X', jumpMultiplier:'HYPPY X', level:'TASO', cost:'HINTA', status:'TILA', locked:'LUKITTU', owned:'OMISTETTU', selected:'VALITTU', ready:'VALMIS', notEnoughGold:'EI TARPEEKSI KULTAA', maxLevel:'MAKSIMITASO', active:'AKTIIVINEN', buy:'OSTA', select:'VALITSE', ability:'TAITO', loading:'LADATAAN...', preparing:'Valmistellaan...', loadingHint:'Valmistellaan shadereita, ääntä ja maailmaa.', readyToPlay:'VALMIS', tapToStart:'Aloita napauttamalla', shieldActive:'KILPI AKTIIVINEN', bhopCombo:'BHOP-KOMBO', speedBonus:'Nopeusbonus', speedIncreasing:'Nopeus kasvaa!', infoText:'1000 pisteen jälkeen tie levenee joka 10000 pisteen välein.', quitHint:'Selainpeleillä on rajattu lupa sulkea ikkuna.', menu:'VALIKKO', city:'KAUPUNKI', sky:'TAIVAS' },  
          hu: { ...UI_TRANSLATION_COMPLETION.hu, bestGold:'Legjobb arany', runs:'Futások', shop:'Bolt', comingSoon:'HAMAROSAN', close:'Bezárás', back:'Vissza', pauseHint:'Folytatás, beállítások megnyitása vagy vissza a főmenübe.', masterVolume:'Fő hangerő', musicVolume:'Zene', sfxVolume:'Effektek', uiVolume:'Menühangok', audioOn:'Hang be', audioOff:'Hang ki', hudStyle:'HUD stílus', compactHud:'Kompakt', normalHud:'Normál', invertY:'Y tengely fordítása', controlMap:'Irányítás', move:'Oldalmozgás', jump:'Ugrás / képesség', slide:'Csúszás', scoreMultiplier:'PONT X', goldMultiplier:'ARANY X', jumpMultiplier:'UGRÁS X', level:'SZINT', cost:'KÖLTSÉG', status:'ÁLLAPOT', locked:'ZÁRVA', owned:'MEGVAN', selected:'KIVÁLASZTVA', ready:'KÉSZ', notEnoughGold:'NINCS ELÉG ARANY', maxLevel:'MAX SZINT', active:'AKTÍV', buy:'VÁSÁRLÁS', select:'VÁLASZT', ability:'KÉPESSÉG', loading:'BETÖLTÉS...', preparing:'Előkészítés...', loadingHint:'Shaderek, hang és világ előkészítése.', readyToPlay:'KÉSZ', tapToStart:'Érintsd meg a kezdéshez', shieldActive:'PAJZS AKTÍV', bhopCombo:'BHOP KOMBO', speedBonus:'Sebességbónusz', speedIncreasing:'A sebesség nő!', infoText:'1000 pont után az út minden 10000 pontnál szélesedik.', quitHint:'A böngészős játékok csak korlátozottan zárhatják be az ablakot.', menu:'MENÜ', city:'VÁROS', sky:'ÉG' },  
          vi: { ...UI_TRANSLATION_COMPLETION.vi, bestGold:'Vàng cao nhất', runs:'Số lượt', shop:'Cửa hàng', comingSoon:'SẮP CÓ', close:'Đóng', back:'Quay lại', pauseHint:'Tiếp tục, mở cài đặt hoặc về menu chính.', masterVolume:'Âm lượng chính', musicVolume:'Nhạc', sfxVolume:'Hiệu ứng', uiVolume:'Âm menu', audioOn:'Bật âm thanh', audioOff:'Tắt âm thanh', hudStyle:'Kiểu HUD', compactHud:'Gọn', normalHud:'Thường', invertY:'Đảo trục Y', controlMap:'Bảng điều khiển', move:'Di chuyển ngang', jump:'Nhảy / kỹ năng', slide:'Trượt', scoreMultiplier:'ĐIỂM X', goldMultiplier:'VÀNG X', jumpMultiplier:'NHẢY X', level:'CẤP', cost:'GIÁ', status:'TRẠNG THÁI', locked:'KHÓA', owned:'ĐÃ CÓ', selected:'ĐÃ CHỌN', ready:'SẴN SÀNG', notEnoughGold:'KHÔNG ĐỦ VÀNG', maxLevel:'CẤP TỐI ĐA', active:'ĐANG BẬT', buy:'MUA', select:'CHỌN', ability:'KỸ NĂNG', loading:'ĐANG TẢI...', preparing:'Đang chuẩn bị...', loadingHint:'Đang chuẩn bị shader, âm thanh và thế giới.', readyToPlay:'SẴN SÀNG', tapToStart:'Chạm để bắt đầu', shieldActive:'KHIÊN ĐANG BẬT', bhopCombo:'COMBO BHOP', speedBonus:'Thưởng tốc độ', speedIncreasing:'Tốc độ đang tăng!', infoText:'Sau 1000 điểm, đường sẽ rộng hơn mỗi 10000 điểm.', quitHint:'Trò chơi trình duyệt bị giới hạn quyền đóng cửa sổ.', menu:'MENU', city:'THÀNH PHỐ', sky:'BẦU TRỜI' },  
          cs: { ...UI_TRANSLATION_COMPLETION.cs, bestGold:'Nejlepší zlato', runs:'Běhy', shop:'Obchod', comingSoon:'BRZY', close:'Zavřít', back:'Zpět', pauseHint:'Pokračuj, otevři nastavení nebo se vrať do hlavní nabídky.', masterVolume:'Hlavní hlasitost', musicVolume:'Hudba', sfxVolume:'Efekty', uiVolume:'Zvuky menu', audioOn:'Zvuk zapnutý', audioOff:'Zvuk vypnutý', hudStyle:'Styl HUD', compactHud:'Kompaktní', normalHud:'Normální', invertY:'Invertovat osu Y', controlMap:'Ovládání', move:'Pohyb do stran', jump:'Skok / schopnost', slide:'Skluz', scoreMultiplier:'SKÓRE X', goldMultiplier:'ZLATO X', jumpMultiplier:'SKOK X', level:'ÚROVEŇ', cost:'CENA', status:'STAV', locked:'ZAMČENO', owned:'VLASTNĚNO', selected:'VYBRÁNO', ready:'PŘIPRAVENO', notEnoughGold:'MÁLO ZLATA', maxLevel:'MAX ÚROVEŇ', active:'AKTIVNÍ', buy:'KOUPIT', select:'VYBRAT', ability:'SCHOPNOST', loading:'NAČÍTÁNÍ...', preparing:'Příprava...', loadingHint:'Příprava shaderů, zvuku a světa.', readyToPlay:'PŘIPRAVENO', tapToStart:'Klepni pro start', shieldActive:'ŠTÍT AKTIVNÍ', bhopCombo:'BHOP KOMBO', speedBonus:'Bonus rychlosti', speedIncreasing:'Rychlost roste!', infoText:'Po 1000 bodech se cesta každých 10000 bodů rozšíří.', quitHint:'Prohlížečové hry mají omezené oprávnění zavřít okno.', menu:'MENU', city:'MĚSTO', sky:'NEBE' }  
      });  
      Object.entries(UI_TRANSLATION_COMPLETION).forEach(([code, pack]) => {  
          UI_TRANSLATIONS[code] = { ...(UI_TRANSLATIONS[code] || {}), ...pack };  
      });  
      Object.keys(UI_TRANSLATIONS).forEach((code) => {  
          UI_TRANSLATIONS[code] = { ...UI_TRANSLATIONS.en, ...UI_TRANSLATIONS[code] };  
      });  
      const BROWSER_TEXT_KEYS = ['rewardBonus','boosts15','watch15','chance','continueTitle','continueCopy','watchContinue','endRun','watchUpgrade','adLoading','adUnavailable','rewardGranted','upgradeGranted','demoAd','adPlaying','steam'];  
      const BROWSER_TEXT_ROWS = {  
          en: ['REWARDED BONUS','15 MINUTE BOOSTS','WATCH AD · 15 MIN','ONE MORE CHANCE','CONTINUE THE RUN?','Watch a short ad to revive safely and keep your score.','WATCH AD & CONTINUE','END RUN','WATCH AD · FREE UPGRADE','Loading rewarded ad…','No rewarded ad is available right now. Please try again.','Reward activated!','Upgrade granted!','DEMO REWARDED AD','Rewarded ad is playing','STEAM'],  
          tr: ['ÖDÜLLÜ BONUS','15 DAKİKALIK GÜÇLENDİRME','REKLAM İZLE · 15 DK','BİR ŞANS DAHA','KOŞUYA DEVAM ET?','Güvenli şekilde dirilmek ve skorunu korumak için kısa bir reklam izle.','REKLAM İZLE VE DEVAM ET','KOŞUYU BİTİR','REKLAM İZLE · ÜCRETSİZ YÜKSELT','Ödüllü reklam yükleniyor…','Şu anda ödüllü reklam yok. Lütfen tekrar dene.','Ödül etkinleştirildi!','Yükseltme verildi!','DEMO ÖDÜLLÜ REKLAM','Ödüllü reklam oynatılıyor','STEAM'],  
          it: ['BONUS PREMIO','POTENZIAMENTI 15 MIN','GUARDA PUBBLICITÀ · 15 MIN','UN’ALTRA POSSIBILITÀ','CONTINUARE LA CORSA?','Guarda una breve pubblicità per rianimarti e mantenere il punteggio.','GUARDA E CONTINUA','TERMINA CORSA','GUARDA · POTENZIAMENTO GRATIS','Caricamento pubblicità…','Nessuna pubblicità premio disponibile. Riprova.','Bonus attivato!','Potenziamento ottenuto!','PUBBLICITÀ DEMO','Pubblicità premio in corso','STEAM'],  
          'es-ES': ['BONUS CON RECOMPENSA','POTENCIADORES DE 15 MIN','VER ANUNCIO · 15 MIN','UNA OPORTUNIDAD MÁS','¿CONTINUAR LA CARRERA?','Mira un anuncio corto para revivir y conservar tu puntuación.','VER ANUNCIO Y CONTINUAR','TERMINAR CARRERA','VER ANUNCIO · MEJORA GRATIS','Cargando anuncio…','No hay anuncio con recompensa disponible. Inténtalo de nuevo.','¡Recompensa activada!','¡Mejora obtenida!','ANUNCIO DE PRUEBA','Reproduciendo anuncio con recompensa','STEAM'],  
          fr: ['BONUS RÉCOMPENSÉ','BOOSTS DE 15 MIN','VOIR UNE PUB · 15 MIN','UNE CHANCE DE PLUS','CONTINUER LA COURSE ?','Regarde une courte pub pour revivre et conserver ton score.','VOIR LA PUB ET CONTINUER','TERMINER LA COURSE','VOIR UNE PUB · AMÉLIORATION GRATUITE','Chargement de la pub…','Aucune pub récompensée disponible. Réessaie.','Récompense activée !','Amélioration obtenue !','PUB RÉCOMPENSÉE DÉMO','Lecture de la pub récompensée','STEAM'],  
          de: ['BELOHNUNGSBONUS','15-MINUTEN-BOOSTS','WERBUNG ANSEHEN · 15 MIN','NOCH EINE CHANCE','LAUF FORTSETZEN?','Sieh kurze Werbung, um sicher wiederzubeleben und den Punktestand zu behalten.','WERBUNG & WEITER','LAUF BEENDEN','WERBUNG · GRATIS-UPGRADE','Belohnungswerbung wird geladen…','Zurzeit ist keine Belohnungswerbung verfügbar. Versuch es erneut.','Belohnung aktiviert!','Upgrade erhalten!','DEMO-BELOHNUNGSWERBUNG','Belohnungswerbung läuft','STEAM'],  
          ar: ['مكافأة إعلان','تعزيزات لمدة 15 دقيقة','شاهد إعلانًا · 15 دقيقة','فرصة أخرى','هل تتابع الركض؟','شاهد إعلانًا قصيرًا للإحياء بأمان والاحتفاظ بنتيجتك.','شاهد الإعلان وتابع','إنهاء الجولة','شاهد إعلانًا · ترقية مجانية','جارٍ تحميل الإعلان…','لا يتوفر إعلان بمكافأة الآن. حاول مجددًا.','تم تفعيل المكافأة!','تم منح الترقية!','إعلان مكافأة تجريبي','يتم تشغيل إعلان المكافأة','STEAM'],  
          'pt-BR': ['BÔNUS RECOMPENSADO','BÔNUS DE 15 MIN','ASSISTIR ANÚNCIO · 15 MIN','MAIS UMA CHANCE','CONTINUAR A CORRIDA?','Assista a um anúncio curto para reviver com segurança e manter seus pontos.','ASSISTIR E CONTINUAR','ENCERRAR CORRIDA','ASSISTIR · MELHORIA GRÁTIS','Carregando anúncio…','Nenhum anúncio recompensado disponível. Tente novamente.','Recompensa ativada!','Melhoria concedida!','ANÚNCIO DE TESTE','Anúncio recompensado em reprodução','STEAM'],  
          da: ['BELØNNINGSBONUS','15 MIN BOOSTS','SE REKLAME · 15 MIN','EN CHANCE TIL','FORTSÆT LØBET?','Se en kort reklame for at genoplive sikkert og beholde din score.','SE REKLAME OG FORTSÆT','AFSLUT LØB','SE REKLAME · GRATIS OPGRADERING','Indlæser reklame…','Ingen belønningsreklame er tilgængelig. Prøv igen.','Belønning aktiveret!','Opgradering modtaget!','DEMO-REKLAME','Belønningsreklame afspilles','STEAM'],  
          nl: ['BELONINGSBONUS','BOOSTS VAN 15 MIN','BEKIJK ADVERTENTIE · 15 MIN','NOG EEN KANS','RUN DOORGAAN?','Bekijk een korte advertentie om veilig te herleven en je score te behouden.','BEKIJK EN GA DOOR','RUN BEËINDIGEN','BEKIJK · GRATIS UPGRADE','Advertentie laden…','Er is nu geen beloningsadvertentie beschikbaar. Probeer opnieuw.','Beloning geactiveerd!','Upgrade ontvangen!','DEMO-ADVERTENTIE','Beloningsadvertentie wordt afgespeeld','STEAM'],  
          'zh-Hant': ['獎勵加成','15 分鐘增益','觀看廣告 · 15 分鐘','再一次機會','繼續跑局？','觀看短廣告即可安全復活並保留分數。','觀看廣告並繼續','結束跑局','觀看廣告 · 免費升級','正在載入獎勵廣告…','目前沒有可用的獎勵廣告，請稍後再試。','獎勵已啟用！','已獲得升級！','示範獎勵廣告','正在播放獎勵廣告','STEAM'],  
          ko: ['보상 보너스','15분 부스트','광고 보기 · 15분','한 번 더 기회','계속 달릴까요?','짧은 광고를 보고 안전하게 부활해 점수를 유지하세요.','광고 보고 계속','달리기 종료','광고 보기 · 무료 업그레이드','보상 광고 불러오는 중…','현재 보상 광고가 없습니다. 다시 시도하세요.','보상이 활성화되었습니다!','업그레이드를 받았습니다!','데모 보상 광고','보상 광고 재생 중','STEAM'],  
          pl: ['BONUS ZA REKLAMĘ','WZMOCNIENIA 15 MIN','OBEJRZYJ REKLAMĘ · 15 MIN','JESZCZE JEDNA SZANSA','KONTYNUOWAĆ BIEG?','Obejrzyj krótką reklamę, aby bezpiecznie się odrodzić i zachować wynik.','OBEJRZYJ I KONTYNUUJ','ZAKOŃCZ BIEG','REKLAMA · DARMOWE ULEPSZENIE','Ładowanie reklamy…','Brak dostępnej reklamy z nagrodą. Spróbuj ponownie.','Nagroda aktywowana!','Ulepszenie przyznane!','REKLAMA DEMO','Trwa reklama z nagrodą','STEAM'],  
          no: ['BELØNNINGSBONUS','15 MIN BOOST','SE REKLAME · 15 MIN','EN SJANSE TIL','FORTSETTE RUNDET?','Se en kort reklame for å gjenopplive trygt og beholde poengsummen.','SE REKLAME OG FORTSETT','AVSLUTT RUNDE','SE REKLAME · GRATIS OPPGRADERING','Laster reklame…','Ingen belønningsreklame er tilgjengelig. Prøv igjen.','Belønning aktivert!','Oppgradering mottatt!','DEMO-REKLAME','Belønningsreklame spilles av','STEAM'],  
          ro: ['BONUS CU RECOMPENSĂ','BOOSTURI 15 MIN','VEZI RECLAMA · 15 MIN','ÎNCĂ O ȘANSĂ','CONTINUI CURSA?','Urmărește o reclamă scurtă pentru a reînvia în siguranță și a păstra scorul.','VEZI RECLAMA ȘI CONTINUĂ','ÎNCHEIE CURSA','VEZI RECLAMA · UPGRADE GRATUIT','Se încarcă reclama…','Nu este disponibilă nicio reclamă cu recompensă. Încearcă din nou.','Recompensă activată!','Upgrade acordat!','RECLAMĂ DEMO','Reclama cu recompensă rulează','STEAM'],  
          th: ['โบนัสจากโฆษณา','บูสต์ 15 นาที','ดูโฆษณา · 15 นาที','โอกาสอีกครั้ง','เล่นต่อไหม?','ดูโฆษณาสั้นเพื่อฟื้นคืนอย่างปลอดภัยและเก็บคะแนนไว้','ดูโฆษณาและเล่นต่อ','จบรอบ','ดูโฆษณา · อัปเกรดฟรี','กำลังโหลดโฆษณา…','ขณะนี้ไม่มีโฆษณารางวัล โปรดลองอีกครั้ง','เปิดใช้รางวัลแล้ว!','ได้รับอัปเกรดแล้ว!','โฆษณารางวัลเดโม','กำลังเล่นโฆษณารางวัล','STEAM'],  
          uk: ['БОНУС ЗА РЕКЛАМУ','ПІДСИЛЕННЯ НА 15 ХВ','ДИВИТИСЯ РЕКЛАМУ · 15 ХВ','ЩЕ ОДИН ШАНС','ПРОДОВЖИТИ ЗАБІГ?','Переглянь коротку рекламу, щоб безпечно відродитися й зберегти рахунок.','РЕКЛАМА Й ПРОДОВЖИТИ','ЗАВЕРШИТИ ЗАБІГ','РЕКЛАМА · БЕЗКОШТОВНЕ ПОКРАЩЕННЯ','Завантаження реклами…','Наразі немає доступної реклами з нагородою. Спробуй ще раз.','Нагороду активовано!','Покращення надано!','ДЕМО-РЕКЛАМА','Відтворюється реклама з нагородою','STEAM'],  
          el: ['ΜΠΟΝΟΥΣ ΑΝΤΑΜΟΙΒΗΣ','ΕΝΙΣΧΥΣΕΙΣ 15 ΛΕΠΤΩΝ','ΔΕΣ ΔΙΑΦΗΜΙΣΗ · 15 ΛΕΠΤΑ','ΜΙΑ ΑΚΟΜΑ ΕΥΚΑΙΡΙΑ','ΣΥΝΕΧΙΣΗ ΔΙΑΔΡΟΜΗΣ;','Δες μια σύντομη διαφήμιση για ασφαλή αναβίωση και διατήρηση του σκορ.','ΔΕΣ ΚΑΙ ΣΥΝΕΧΙΣΕ','ΤΕΛΟΣ ΔΙΑΔΡΟΜΗΣ','ΔΕΣ ΔΙΑΦΗΜΙΣΗ · ΔΩΡΕΑΝ ΑΝΑΒΑΘΜΙΣΗ','Φόρτωση διαφήμισης…','Δεν υπάρχει διαθέσιμη διαφήμιση ανταμοιβής. Δοκίμασε ξανά.','Η ανταμοιβή ενεργοποιήθηκε!','Η αναβάθμιση δόθηκε!','ΔΟΚΙΜΑΣΤΙΚΗ ΔΙΑΦΗΜΙΣΗ','Παίζει διαφήμιση ανταμοιβής','STEAM'],  
          sv: ['BELÖNINGSBONUS','15 MIN BOOST','SE REKLAM · 15 MIN','EN CHANS TILL','FORTSÄTTA RUNDAN?','Se en kort reklam för att återupplivas säkert och behålla poängen.','SE REKLAM OCH FORTSÄTT','AVSLUTA RUNDAN','SE REKLAM · GRATIS UPPGRADERING','Laddar reklam…','Ingen belöningsreklam finns tillgänglig. Försök igen.','Belöning aktiverad!','Uppgradering erhållen!','DEMO-REKLAM','Belöningsreklam spelas','STEAM'],  
          'zh-Hans': ['奖励加成','15 分钟增益','观看广告 · 15 分钟','再来一次机会','继续跑局？','观看短广告即可安全复活并保留分数。','观看广告并继续','结束跑局','观看广告 · 免费升级','正在加载奖励广告…','目前没有可用的奖励广告，请稍后再试。','奖励已激活！','已获得升级！','演示奖励广告','正在播放奖励广告','STEAM'],  
          bg: ['БОНУС ЗА РЕКЛАМА','15 МИН УСИЛВАНИЯ','ГЛЕДАЙ РЕКЛАМА · 15 МИН','ОЩЕ ЕДИН ШАНС','ДА ПРОДЪЛЖИШ?','Гледай кратка реклама, за да се съживиш безопасно и да запазиш резултата.','ГЛЕДАЙ И ПРОДЪЛЖИ','КРАЙ НА БЯГАНЕТО','РЕКЛАМА · БЕЗПЛАТНО ПОДОБРЕНИЕ','Зареждане на реклама…','В момента няма реклама с награда. Опитай отново.','Наградата е активирана!','Подобрението е дадено!','ДЕМО РЕКЛАМА','Рекламата с награда се възпроизвежда','STEAM'],  
          id: ['BONUS HADIAH','BOOST 15 MENIT','TONTON IKLAN · 15 MENIT','SATU KESEMPATAN LAGI','LANJUTKAN LARI?','Tonton iklan singkat untuk hidup kembali dengan aman dan mempertahankan skor.','TONTON DAN LANJUT','AKHIRI LARI','TONTON · UPGRADE GRATIS','Memuat iklan…','Iklan berhadiah tidak tersedia. Coba lagi.','Hadiah diaktifkan!','Upgrade diberikan!','IKLAN DEMO','Iklan berhadiah sedang diputar','STEAM'],  
          fi: ['PALKKIOBONUS','15 MIN TEHOSTEET','KATSO MAINOS · 15 MIN','VIELÄ YKSI MAHDOLLISUUS','JATKETAANKO JUOKSUA?','Katso lyhyt mainos, herää turvallisesti ja säilytä pisteesi.','KATSO JA JATKA','LOPETA JUOKSU','KATSO MAINOS · ILMAINEN PÄIVITYS','Ladataan mainosta…','Palkintomainosta ei ole saatavilla. Yritä uudelleen.','Palkinto aktivoitu!','Päivitys saatu!','DEMO-MAINOS','Palkintomainos toistetaan','STEAM'],  
          ja: ['リワードボーナス','15分ブースト','広告を見る · 15分','もう一度チャンス','ランを続けますか？','短い広告を見て安全に復活し、スコアを維持します。','広告を見て続ける','ランを終了','広告を見る · 無料アップグレード','リワード広告を読み込み中…','現在リワード広告を利用できません。もう一度お試しください。','報酬を有効にしました！','アップグレードを獲得！','デモリワード広告','リワード広告を再生中','STEAM'],  
          'es-419': ['BONO CON RECOMPENSA','POTENCIADORES DE 15 MIN','VER ANUNCIO · 15 MIN','UNA OPORTUNIDAD MÁS','¿CONTINUAR LA CARRERA?','Mira un anuncio corto para revivir y conservar tu puntaje.','VER ANUNCIO Y CONTINUAR','TERMINAR CARRERA','VER ANUNCIO · MEJORA GRATIS','Cargando anuncio…','No hay anuncio con recompensa disponible. Intenta de nuevo.','¡Recompensa activada!','¡Mejora obtenida!','ANUNCIO DE PRUEBA','Reproduciendo anuncio con recompensa','STEAM'],  
          hu: ['JUTALOMBÓNUSZ','15 PERCES ERŐSÍTÉSEK','REKLÁM MEGTEKINTÉSE · 15 PERC','MÉG EGY ESÉLY','FOLYTATOD A FUTÁST?','Nézz meg egy rövid reklámot a biztonságos újjáéledéshez és a pontszám megtartásához.','REKLÁM ÉS FOLYTATÁS','FUTÁS VÉGE','REKLÁM · INGYENES FEJLESZTÉS','Reklám betöltése…','Jelenleg nincs jutalomreklám. Próbáld újra.','Jutalom aktiválva!','Fejlesztés megadva!','DEMO REKLÁM','Jutalomreklám lejátszása','STEAM'],  
          'pt-PT': ['BÓNUS COM RECOMPENSA','BÓNUS DE 15 MIN','VER ANÚNCIO · 15 MIN','MAIS UMA OPORTUNIDADE','CONTINUAR A CORRIDA?','Vê um anúncio curto para reviver em segurança e manter a pontuação.','VER E CONTINUAR','TERMINAR CORRIDA','VER ANÚNCIO · MELHORIA GRÁTIS','A carregar anúncio…','Não há anúncio com recompensa disponível. Tenta novamente.','Recompensa ativada!','Melhoria concedida!','ANÚNCIO DE TESTE','Anúncio com recompensa em reprodução','STEAM'],  
          ru: ['БОНУС ЗА РЕКЛАМУ','УСИЛЕНИЯ НА 15 МИН','СМОТРЕТЬ РЕКЛАМУ · 15 МИН','ЕЩЁ ОДИН ШАНС','ПРОДОЛЖИТЬ ЗАБЕГ?','Посмотрите короткую рекламу, чтобы безопасно возродиться и сохранить счёт.','РЕКЛАМА И ПРОДОЛЖИТЬ','ЗАВЕРШИТЬ ЗАБЕГ','РЕКЛАМА · БЕСПЛАТНОЕ УЛУЧШЕНИЕ','Загрузка рекламы…','Сейчас нет доступной рекламы с наградой. Попробуйте ещё раз.','Награда активирована!','Улучшение получено!','ДЕМО-РЕКЛАМА','Воспроизводится реклама с наградой','STEAM'],  
          vi: ['THƯỞNG QUẢNG CÁO','TĂNG CƯỜNG 15 PHÚT','XEM QUẢNG CÁO · 15 PHÚT','THÊM MỘT CƠ HỘI','TIẾP TỤC LƯỢT CHẠY?','Xem quảng cáo ngắn để hồi sinh an toàn và giữ điểm.','XEM VÀ TIẾP TỤC','KẾT THÚC LƯỢT','XEM QUẢNG CÁO · NÂNG CẤP MIỄN PHÍ','Đang tải quảng cáo…','Hiện không có quảng cáo thưởng. Hãy thử lại.','Đã kích hoạt phần thưởng!','Đã nhận nâng cấp!','QUẢNG CÁO THỬ','Đang phát quảng cáo thưởng','STEAM'],  
          cs: ['BONUS ZA REKLAMU','POSÍLENÍ NA 15 MIN','SLEDOVAT REKLAMU · 15 MIN','JEŠTĚ JEDNA ŠANCE','POKRAČOVAT V BĚHU?','Podívej se na krátkou reklamu, bezpečně se oživ a zachovej skóre.','SLEDOVAT A POKRAČOVAT','UKONČIT BĚH','REKLAMA · VYLEPŠENÍ ZDARMA','Načítání reklamy…','Žádná reklama s odměnou není dostupná. Zkus to znovu.','Odměna aktivována!','Vylepšení uděleno!','DEMO REKLAMA','Přehrává se reklama s odměnou','STEAM']  
      };  
      const BROWSER_TEXT = {};  
      Object.entries(BROWSER_TEXT_ROWS).forEach(([code, row]) => {  
          BROWSER_TEXT[code] = {};  
          BROWSER_TEXT_KEYS.forEach((key, index) => { BROWSER_TEXT[code][key] = row[index]; });  
      });  
      const DISPLAY_MODE_TRANSLATIONS = {  
          tr: { displayMode: 'Ekran Modu', windowed: 'Pencereli', borderless: 'Tam Ekran Pencereli', fullscreen: 'Tam Ekran' },  
          en: { displayMode: 'Display Mode', windowed: 'Windowed', borderless: 'Borderless Fullscreen', fullscreen: 'Fullscreen' },  
          it: { displayMode: 'Modalità schermo', windowed: 'Finestra', borderless: 'Schermo intero finestra', fullscreen: 'Schermo intero' },  
          'es-ES': { displayMode: 'Modo de pantalla', windowed: 'Ventana', borderless: 'Pantalla completa en ventana', fullscreen: 'Pantalla completa' },  
          fr: { displayMode: 'Mode d’écran', windowed: 'Fenêtré', borderless: 'Plein écran fenêtré', fullscreen: 'Plein écran' },  
          de: { displayMode: 'Anzeigemodus', windowed: 'Fenster', borderless: 'Randloses Vollbild', fullscreen: 'Vollbild' },  
          'pt-BR': { displayMode: 'Modo de tela', windowed: 'Janela', borderless: 'Tela cheia em janela', fullscreen: 'Tela cheia' },  
          da: { displayMode: 'Skærmtilstand', windowed: 'Vindue', borderless: 'Kantløs fuldskærm', fullscreen: 'Fuldskærm' },  
          nl: { displayMode: 'Schermmodus', windowed: 'Venster', borderless: 'Randloos volledig scherm', fullscreen: 'Volledig scherm' },  
          'zh-Hant': { displayMode: '顯示模式', windowed: '視窗', borderless: '無邊框全螢幕', fullscreen: '全螢幕' },  
          ko: { displayMode: '화면 모드', windowed: '창 모드', borderless: '테두리 없는 전체화면', fullscreen: '전체화면' },  
          pl: { displayMode: 'Tryb ekranu', windowed: 'Okno', borderless: 'Pełny ekran w oknie', fullscreen: 'Pełny ekran' },  
          no: { displayMode: 'Skjermmodus', windowed: 'Vindu', borderless: 'Kantløs fullskjerm', fullscreen: 'Fullskjerm' },  
          ro: { displayMode: 'Mod ecran', windowed: 'Fereastră', borderless: 'Ecran complet fără margini', fullscreen: 'Ecran complet' },  
          th: { displayMode: 'โหมดหน้าจอ', windowed: 'หน้าต่าง', borderless: 'เต็มจอไร้ขอบ', fullscreen: 'เต็มจอ' },  
          uk: { displayMode: 'Режим екрана', windowed: 'Вікно', borderless: 'Повноекранне вікно', fullscreen: 'Повний екран' },  
          el: { displayMode: 'Λειτουργία οθόνης', windowed: 'Παράθυρο', borderless: 'Πλήρης οθόνη χωρίς πλαίσιο', fullscreen: 'Πλήρης οθόνη' },  
          sv: { displayMode: 'Skärmläge', windowed: 'Fönster', borderless: 'Kantlös helskärm', fullscreen: 'Helskärm' },  
          'zh-Hans': { displayMode: '显示模式', windowed: '窗口', borderless: '无边框全屏', fullscreen: '全屏' },  
          bg: { displayMode: 'Режим на екрана', windowed: 'Прозорец', borderless: 'Безрамков цял екран', fullscreen: 'Цял екран' },  
          id: { displayMode: 'Mode layar', windowed: 'Jendela', borderless: 'Layar penuh tanpa bingkai', fullscreen: 'Layar penuh' },  
          fi: { displayMode: 'Näyttötila', windowed: 'Ikkuna', borderless: 'Reunaton koko näyttö', fullscreen: 'Koko näyttö' },  
          ja: { displayMode: '画面モード', windowed: 'ウィンドウ', borderless: 'ボーダーレス全画面', fullscreen: '全画面' },  
          'es-419': { displayMode: 'Modo de pantalla', windowed: 'Ventana', borderless: 'Pantalla completa en ventana', fullscreen: 'Pantalla completa' },  
          hu: { displayMode: 'Képernyőmód', windowed: 'Ablakos', borderless: 'Keret nélküli teljes képernyő', fullscreen: 'Teljes képernyő' },  
          'pt-PT': { displayMode: 'Modo de ecrã', windowed: 'Janela', borderless: 'Ecrã inteiro em janela', fullscreen: 'Ecrã inteiro' },  
          vi: { displayMode: 'Chế độ màn hình', windowed: 'Cửa sổ', borderless: 'Toàn màn hình không viền', fullscreen: 'Toàn màn hình' },  
          cs: { displayMode: 'Režim obrazovky', windowed: 'Okno', borderless: 'Bezokrajová celá obrazovka', fullscreen: 'Celá obrazovka' },  
          ar: { displayMode: 'وضع الشاشة', windowed: 'نافذة', borderless: 'ملء الشاشة بلا حدود', fullscreen: 'ملء الشاشة' },  
          ru: { displayMode: 'Режим экрана', windowed: 'Окно', borderless: 'Полноэкранное окно', fullscreen: 'Полный экран' }  
      };  
      Object.entries(DISPLAY_MODE_TRANSLATIONS).forEach(([code, pack]) => {  
          UI_TRANSLATIONS[code] = { ...(UI_TRANSLATIONS[code] || UI_TRANSLATIONS.en), ...pack };  
      });  
      const SPEED_UPGRADE_TRANSLATIONS = {  
          tr: 'HIZ',  
          en: 'SPEED',  
          it: 'VELOCITÀ',  
          'es-ES': 'VELOCIDAD',  
          fr: 'VITESSE',  
          de: 'TEMPO',  
          'pt-BR': 'VELOCIDADE',  
          da: 'HASTIGHED',  
          nl: 'SNELHEID',  
          'zh-Hant': '速度',  
          ko: '속도',  
          pl: 'PRĘDKOŚĆ',  
          no: 'HASTIGHET',  
          ro: 'VITEZĂ',  
          th: 'ความเร็ว',  
          uk: 'ШВИДКІСТЬ',  
          el: 'ΤΑΧΥΤΗΤΑ',  
          sv: 'HASTIGHET',  
          'zh-Hans': '速度',  
          bg: 'СКОРОСТ',  
          id: 'KECEPATAN',  
          fi: 'NOPEUS',  
          ja: 'スピード',  
          'es-419': 'VELOCIDAD',  
          hu: 'SEBESSÉG',  
          'pt-PT': 'VELOCIDADE',  
          ru: 'СКОРОСТЬ',  
          vi: 'TỐC ĐỘ',  
          cs: 'RYCHLOST',  
          ar: 'السرعة'  
      };  
      Object.entries(SPEED_UPGRADE_TRANSLATIONS).forEach(([code, label]) => {  
          UI_TRANSLATIONS[code] = { ...(UI_TRANSLATIONS[code] || UI_TRANSLATIONS.en), speedUpgrade: label };  
      });  
      const GAMEPLAY_UI_TRANSLATIONS = {  
          tr: { gameplayUi: 'OYUN İÇİ UI', uiVisible: 'UI AÇIK', uiHidden: 'UI KAPALI' },  
          en: { gameplayUi: 'IN-GAME UI', uiVisible: 'UI ON', uiHidden: 'UI OFF' },  
          it: { gameplayUi: 'UI DI GIOCO', uiVisible: 'UI ATTIVA', uiHidden: 'UI DISATTIVA' },  
          'es-ES': { gameplayUi: 'UI DEL JUEGO', uiVisible: 'UI ACTIVA', uiHidden: 'UI OCULTA' },  
          fr: { gameplayUi: 'UI EN JEU', uiVisible: 'UI ACTIVE', uiHidden: 'UI MASQUÉE' },  
          de: { gameplayUi: 'SPIEL-UI', uiVisible: 'UI AN', uiHidden: 'UI AUS' },  
          'pt-BR': { gameplayUi: 'UI DO JOGO', uiVisible: 'UI LIGADA', uiHidden: 'UI OCULTA' },  
          da: { gameplayUi: 'SPIL-UI', uiVisible: 'UI TIL', uiHidden: 'UI FRA' },  
          nl: { gameplayUi: 'GAME-UI', uiVisible: 'UI AAN', uiHidden: 'UI UIT' },  
          'zh-Hant': { gameplayUi: '遊戲介面', uiVisible: '介面開啟', uiHidden: '介面關閉' },  
          ko: { gameplayUi: '게임 UI', uiVisible: 'UI 켜짐', uiHidden: 'UI 꺼짐' },  
          pl: { gameplayUi: 'UI GRY', uiVisible: 'UI WŁ.', uiHidden: 'UI WYŁ.' },  
          no: { gameplayUi: 'SPILL-UI', uiVisible: 'UI PÅ', uiHidden: 'UI AV' },  
          ro: { gameplayUi: 'UI ÎN JOC', uiVisible: 'UI PORNIT', uiHidden: 'UI OPRIT' },  
          th: { gameplayUi: 'UI ในเกม', uiVisible: 'เปิด UI', uiHidden: 'ปิด UI' },  
          uk: { gameplayUi: 'ІГРОВИЙ UI', uiVisible: 'UI УВІМК.', uiHidden: 'UI ВИМК.' },  
          el: { gameplayUi: 'UI ΠΑΙΧΝΙΔΙΟΥ', uiVisible: 'UI ΕΝΕΡΓΟ', uiHidden: 'UI ΚΡΥΦΟ' },  
          sv: { gameplayUi: 'SPEL-UI', uiVisible: 'UI PÅ', uiHidden: 'UI AV' },  
          'zh-Hans': { gameplayUi: '游戏界面', uiVisible: '界面开启', uiHidden: '界面关闭' },  
          bg: { gameplayUi: 'UI В ИГРА', uiVisible: 'UI ВКЛ.', uiHidden: 'UI ИЗКЛ.' },  
          id: { gameplayUi: 'UI GAME', uiVisible: 'UI AKTIF', uiHidden: 'UI MATI' },  
          fi: { gameplayUi: 'PELIN UI', uiVisible: 'UI PÄÄLLÄ', uiHidden: 'UI POIS' },  
          ja: { gameplayUi: 'ゲームUI', uiVisible: 'UIオン', uiHidden: 'UIオフ' },  
          'es-419': { gameplayUi: 'UI DEL JUEGO', uiVisible: 'UI ACTIVA', uiHidden: 'UI OCULTA' },  
          hu: { gameplayUi: 'JÁTÉK UI', uiVisible: 'UI BE', uiHidden: 'UI KI' },  
          'pt-PT': { gameplayUi: 'UI DO JOGO', uiVisible: 'UI LIGADA', uiHidden: 'UI OCULTA' },  
          ru: { gameplayUi: 'ИГРОВОЙ UI', uiVisible: 'UI ВКЛ.', uiHidden: 'UI ВЫКЛ.' },  
          vi: { gameplayUi: 'UI TRONG GAME', uiVisible: 'BẬT UI', uiHidden: 'TẮT UI' },  
          cs: { gameplayUi: 'HERNÍ UI', uiVisible: 'UI ZAP.', uiHidden: 'UI VYP.' },  
          ar: { gameplayUi: 'واجهة اللعب', uiVisible: 'الواجهة مفعلة', uiHidden: 'الواجهة مخفية' }  
      };  
      Object.entries(GAMEPLAY_UI_TRANSLATIONS).forEach(([code, pack]) => {  
          UI_TRANSLATIONS[code] = { ...(UI_TRANSLATIONS[code] || UI_TRANSLATIONS.en), ...pack };  
      });  
      const CROSSHAIR_TRANSLATIONS = {  
          tr: { crosshair: 'NİŞANGÂH', crosshairOn: 'NİŞANGÂH AÇIK', crosshairOff: 'NİŞANGÂH KAPALI' },  
          en: { crosshair: 'CROSSHAIR', crosshairOn: 'CROSSHAIR ON', crosshairOff: 'CROSSHAIR OFF' },  
          de: { crosshair: 'FADENKREUZ', crosshairOn: 'FADENKREUZ AN', crosshairOff: 'FADENKREUZ AUS' },  
          fr: { crosshair: 'RÉTICULE', crosshairOn: 'RÉTICULE ACTIF', crosshairOff: 'RÉTICULE MASQUÉ' },  
          'es-ES': { crosshair: 'MIRA', crosshairOn: 'MIRA ACTIVA', crosshairOff: 'MIRA OCULTA' },  
          'es-419': { crosshair: 'MIRA', crosshairOn: 'MIRA ACTIVA', crosshairOff: 'MIRA OCULTA' },  
          'pt-BR': { crosshair: 'MIRA', crosshairOn: 'MIRA LIGADA', crosshairOff: 'MIRA DESLIGADA' },  
          'pt-PT': { crosshair: 'MIRA', crosshairOn: 'MIRA LIGADA', crosshairOff: 'MIRA DESLIGADA' },  
          it: { crosshair: 'MIRINO', crosshairOn: 'MIRINO ATTIVO', crosshairOff: 'MIRINO NASCOSTO' },  
          ru: { crosshair: 'ПРИЦЕЛ', crosshairOn: 'ПРИЦЕЛ ВКЛ.', crosshairOff: 'ПРИЦЕЛ ВЫКЛ.' },  
          ja: { crosshair: '照準', crosshairOn: '照準オン', crosshairOff: '照準オフ' },  
          ko: { crosshair: '조준점', crosshairOn: '조준점 켜짐', crosshairOff: '조준점 꺼짐' },  
          'zh-Hans': { crosshair: '准星', crosshairOn: '准星开启', crosshairOff: '准星关闭' },  
          'zh-Hant': { crosshair: '準星', crosshairOn: '準星開啟', crosshairOff: '準星關閉' },  
          ar: { crosshair: 'علامة التصويب', crosshairOn: 'علامة التصويب مفعلة', crosshairOff: 'علامة التصويب مخفية' }  
      };  
      SUPPORTED_LANGUAGES.forEach((entry) => {  
          const code = typeof entry === 'string' ? entry : entry.code;  
          const pack = CROSSHAIR_TRANSLATIONS[code] || CROSSHAIR_TRANSLATIONS.en;  
          UI_TRANSLATIONS[code] = { ...(UI_TRANSLATIONS[code] || UI_TRANSLATIONS.en), ...pack };  
      });

      // Loading-screen hardware guidance. This dedicated key prevents locales from silently
      // falling back to English and keeps the generic shader-preparation status reusable.
      const LOADING_GRAPHICS_TIPS = Object.freeze({
          en: "If your system is good, don't forget to increase the graphics in the settings.",
          tr: 'Sisteminiz iyiyse ayarlardan grafik kalitesini yükseltmeyi unutmayın.',
          it: 'Se il tuo sistema è potente, non dimenticare di aumentare la qualità grafica nelle impostazioni.',
          'es-ES': 'Si tu equipo es potente, no olvides aumentar la calidad gráfica en los ajustes.',
          fr: "Si votre appareil est performant, pensez à augmenter la qualité graphique dans les paramètres.",
          de: 'Wenn dein System leistungsfähig ist, erhöhe die Grafikqualität in den Einstellungen.',
          ar: 'إذا كان جهازك قويًا، فلا تنسَ رفع جودة الرسومات من الإعدادات.',
          'pt-BR': 'Se o seu dispositivo for potente, não se esqueça de aumentar a qualidade gráfica nas configurações.',
          da: 'Hvis din enhed er kraftig, så husk at øge grafikkvaliteten i indstillingerne.',
          nl: 'Als je systeem krachtig is, vergeet dan niet de grafische kwaliteit in de instellingen te verhogen.',
          'zh-Hant': '如果你的裝置效能良好，別忘了在設定中提高畫質。',
          ko: '기기 성능이 좋다면 설정에서 그래픽 품질을 높이는 것을 잊지 마세요.',
          pl: 'Jeśli urządzenie jest wydajne, pamiętaj, aby zwiększyć jakość grafiki w ustawieniach.',
          no: 'Hvis enheten din er kraftig, husk å øke grafikkvaliteten i innstillingene.',
          ro: 'Dacă dispozitivul tău este performant, nu uita să mărești calitatea grafică din setări.',
          th: 'หากอุปกรณ์ของคุณมีประสิทธิภาพดี อย่าลืมเพิ่มคุณภาพกราฟิกในการตั้งค่า',
          uk: 'Якщо ваш пристрій потужний, не забудьте підвищити якість графіки в налаштуваннях.',
          el: 'Αν η συσκευή σου είναι ισχυρή, μην ξεχάσεις να αυξήσεις την ποιότητα γραφικών στις ρυθμίσεις.',
          sv: 'Om din enhet är kraftfull, glöm inte att höja grafikkvaliteten i inställningarna.',
          'zh-Hans': '如果你的设备性能良好，别忘了在设置中提高画质。',
          bg: 'Ако устройството ви е мощно, не забравяйте да повишите качеството на графиката от настройките.',
          id: 'Jika perangkatmu bertenaga, jangan lupa tingkatkan kualitas grafis di pengaturan.',
          fi: 'Jos laitteesi on tehokas, muista nostaa grafiikan laatua asetuksista.',
          ja: '端末の性能に余裕がある場合は、設定でグラフィック品質を上げてみてください。',
          'es-419': 'Si tu equipo es potente, no olvides aumentar la calidad gráfica en la configuración.',
          hu: 'Ha az eszközöd erős, ne felejtsd el magasabbra állítani a grafikai minőséget a beállításokban.',
          'pt-PT': 'Se o teu dispositivo for potente, não te esqueças de aumentar a qualidade gráfica nas definições.',
          ru: 'Если ваше устройство достаточно мощное, не забудьте повысить качество графики в настройках.',
          vi: 'Nếu thiết bị của bạn đủ mạnh, đừng quên tăng chất lượng đồ họa trong phần cài đặt.',
          cs: 'Pokud je vaše zařízení výkonné, nezapomeňte v nastavení zvýšit kvalitu grafiky.'
      });
      SUPPORTED_LANGUAGES.forEach((entry) => {
          const code = typeof entry === 'string' ? entry : entry.code;
          UI_TRANSLATIONS[code] = {
              ...(UI_TRANSLATIONS[code] || UI_TRANSLATIONS.en),
              loadingGraphicsTip: LOADING_GRAPHICS_TIPS[code]
          };
      });

  // New shop/onboarding strings must be explicit in every supported language.
  // Order: hands, rebirth, reset warning, confirmation, open shop, open hands, buy.
  const SHOP_V14 = {
    en: ['HANDS','REBIRTH','Resets progress','ARE YOU SURE?','Open Upgrades to get your first gloves','Open Hands','Buy your first gloves'],
    tr: ['ELLER','YENİDEN DOĞUŞ','İlerlemeyi sıfırlar','EMİN MİSİN?','İlk eldivenin için Yükseltmeler’i aç','Eller sekmesini aç','İlk eldivenini satın al'],
    it: ['GUANTI','RINASCITA','Azzera i progressi','SEI SICURO?','Apri Potenziamenti per i tuoi primi guanti','Apri Guanti','Acquista i tuoi primi guanti'],
    'es-ES': ['GUANTES','RENACIMIENTO','Reinicia el progreso','¿SEGURO?','Abre Mejoras para conseguir tus primeros guantes','Abre Guantes','Compra tus primeros guantes'],
    fr: ['GANTS','RENAISSANCE','Réinitialise la progression','CONFIRMER ?','Ouvre les améliorations pour obtenir tes premiers gants','Ouvre les gants','Achète tes premiers gants'],
    de: ['HANDSCHUHE','WIEDERGEBURT','Setzt den Fortschritt zurück','BIST DU SICHER?','Öffne Verbesserungen für deine ersten Handschuhe','Öffne Handschuhe','Kaufe deine ersten Handschuhe'],
    ar: ['القفازات','ولادة جديدة','يعيد ضبط التقدم','هل أنت متأكد؟','افتح الترقيات للحصول على قفازاتك الأولى','افتح القفازات','اشترِ قفازاتك الأولى'],
    'pt-BR': ['LUVAS','RENASCIMENTO','Reinicia o progresso','TEM CERTEZA?','Abra Melhorias para obter suas primeiras luvas','Abra Luvas','Compre suas primeiras luvas'],
    da: ['HANDSKER','GENFØDSEL','Nulstiller fremskridt','ER DU SIKKER?','Åbn opgraderinger for dine første handsker','Åbn handsker','Køb dine første handsker'],
    nl: ['HANDSCHOENEN','WEDERGEBOORTE','Reset je voortgang','WEET JE HET ZEKER?','Open upgrades voor je eerste handschoenen','Open handschoenen','Koop je eerste handschoenen'],
    'zh-Hant': ['手套','重生','重設進度','確定嗎？','開啟升級以取得第一副手套','開啟手套頁面','購買第一副手套'],
    ko: ['장갑','환생','진행 상황 초기화','정말 진행할까요?','첫 장갑을 구매하려면 업그레이드를 여세요','장갑 탭을 여세요','첫 장갑을 구매하세요'],
    pl: ['RĘKAWICE','ODRODZENIE','Resetuje postępy','NA PEWNO?','Otwórz ulepszenia, aby zdobyć pierwsze rękawice','Otwórz rękawice','Kup pierwsze rękawice'],
    no: ['HANSKER','GJENFØDELSE','Nullstiller fremdrift','ER DU SIKKER?','Åpne oppgraderinger for dine første hansker','Åpne hansker','Kjøp dine første hansker'],
    ro: ['MĂNUȘI','RENAȘTERE','Resetează progresul','EȘTI SIGUR?','Deschide îmbunătățirile pentru primele mănuși','Deschide mănușile','Cumpără primele mănuși'],
    th: ['ถุงมือ','เกิดใหม่','รีเซ็ตความคืบหน้า','แน่ใจหรือไม่?','เปิดหน้าอัปเกรดเพื่อซื้อถุงมือคู่แรก','เปิดหน้าถุงมือ','ซื้อถุงมือคู่แรก'],
    uk: ['РУКАВИЦІ','ПЕРЕРОДЖЕННЯ','Скидає прогрес','ВИ ВПЕВНЕНІ?','Відкрий покращення, щоб отримати перші рукавиці','Відкрий рукавиці','Придбай перші рукавиці'],
    el: ['ΓΑΝΤΙΑ','ΑΝΑΓΕΝΝΗΣΗ','Μηδενίζει την πρόοδο','ΕΙΣΑΙ ΣΙΓΟΥΡΟΣ;','Άνοιξε τις αναβαθμίσεις για τα πρώτα σου γάντια','Άνοιξε τα γάντια','Αγόρασε τα πρώτα σου γάντια'],
    sv: ['HANDSKAR','ÅTERFÖDELSE','Nollställer framsteg','ÄR DU SÄKER?','Öppna uppgraderingar för dina första handskar','Öppna handskar','Köp dina första handskar'],
    'zh-Hans': ['手套','重生','重置进度','确定吗？','打开升级以获取第一副手套','打开手套页面','购买第一副手套'],
    bg: ['РЪКАВИЦИ','ПРЕРАЖДАНЕ','Нулира напредъка','СИГУРЕН ЛИ СИ?','Отвори подобренията за първите си ръкавици','Отвори ръкавиците','Купи първите си ръкавици'],
    id: ['SARUNG TANGAN','LAHIR KEMBALI','Mengatur ulang progres','YAKIN?','Buka peningkatan untuk sarung tangan pertamamu','Buka sarung tangan','Beli sarung tangan pertamamu'],
    fi: ['HANSIKKAAT','UUDELLEENSYNTYMÄ','Nollaa edistymisen','OLETKO VARMA?','Avaa parannukset hankkiaksesi ensimmäiset hansikkaasi','Avaa hansikkaat','Osta ensimmäiset hansikkaasi'],
    ja: ['グローブ','転生','進行状況をリセット','よろしいですか？','初めてのグローブを買うには強化画面を開こう','グローブを開こう','初めてのグローブを購入しよう'],
    'es-419': ['GUANTES','RENACIMIENTO','Reinicia el progreso','¿SEGURO?','Abre Mejoras para conseguir tus primeros guantes','Abre Guantes','Compra tus primeros guantes'],
    hu: ['KESZTYŰK','ÚJJÁSZÜLETÉS','Visszaállítja a haladást','BIZTOS VAGY BENNE?','Nyisd meg a fejlesztéseket az első kesztyűdhöz','Nyisd meg a kesztyűket','Vedd meg az első kesztyűdet'],
    'pt-PT': ['LUVAS','RENASCIMENTO','Reinicia o progresso','TENS A CERTEZA?','Abre Melhorias para obteres as tuas primeiras luvas','Abre Luvas','Compra as tuas primeiras luvas'],
    ru: ['ПЕРЧАТКИ','ПЕРЕРОЖДЕНИЕ','Сбрасывает прогресс','ВЫ УВЕРЕНЫ?','Открой улучшения, чтобы получить первые перчатки','Открой перчатки','Купи первые перчатки'],
    vi: ['GĂNG TAY','TÁI SINH','Đặt lại tiến trình','BẠN CHẮC CHẮN CHỨ?','Mở nâng cấp để nhận đôi găng tay đầu tiên','Mở găng tay','Mua đôi găng tay đầu tiên'],
    cs: ['RUKAVICE','ZNOVUZROZENÍ','Resetuje postup','OPRAVDU?','Otevři vylepšení pro své první rukavice','Otevři rukavice','Kup si první rukavice']
  };
  const HAND_SKILL_LABELS = {
    en: 'Double Jump|Time Stop|Glide|Air Dash|Time Rewind|Magnet|Phase Shift|Revive',
    tr: 'Çift Zıplama|Zamanı Durdur|Süzülme|Hava Atılımı|Zamanı Geri Sar|Mıknatıs|Faz Geçişi|Dirilme',
    it: 'Doppio salto|Ferma tempo|Planata|Scatto aereo|Riavvolgi tempo|Magnete|Cambio di fase|Rianimazione',
    'es-ES': 'Doble salto|Detener tiempo|Planear|Impulso aéreo|Rebobinar tiempo|Imán|Cambio de fase|Revivir',
    fr: 'Double saut|Arrêt du temps|Planer|Ruée aérienne|Retour temporel|Aimant|Déphasage|Résurrection',
    de: 'Doppelsprung|Zeitstopp|Gleiten|Luftsprint|Zeit zurückspulen|Magnet|Phasenwechsel|Wiederbelebung',
    ar: 'قفزة مزدوجة|إيقاف الزمن|انزلاق هوائي|اندفاع هوائي|إرجاع الزمن|مغناطيس|انتقال طوري|إحياء',
    'pt-BR': 'Salto duplo|Parar o tempo|Planar|Impulso aéreo|Rebobinar o tempo|Ímã|Mudança de fase|Reviver',
    da: 'Dobbeltspring|Tidsstop|Svæv|Luftsprint|Spol tiden tilbage|Magnet|Faseskift|Genoplivning',
    nl: 'Dubbele sprong|Tijdstop|Zweven|Luchtsprint|Tijd terugspoelen|Magneet|Faseverschuiving|Herleven',
    'zh-Hant': '二段跳|時間停止|滑翔|空中衝刺|時間倒流|磁鐵|相位轉移|復活',
    ko: '이단 점프|시간 정지|활공|공중 돌진|시간 되감기|자석|위상 전환|부활',
    pl: 'Podwójny skok|Zatrzymanie czasu|Szybowanie|Powietrzny zryw|Cofnięcie czasu|Magnes|Przesunięcie fazowe|Wskrzeszenie',
    no: 'Dobbelthopp|Tidsstopp|Svev|Luftsprint|Spol tiden tilbake|Magnet|Faseskift|Gjenoppliving',
    ro: 'Salt dublu|Oprirea timpului|Planare|Impuls aerian|Derulare temporală|Magnet|Schimbare de fază|Reînviere',
    th: 'กระโดดสองครั้ง|หยุดเวลา|ร่อน|พุ่งกลางอากาศ|ย้อนเวลา|แม่เหล็ก|เปลี่ยนเฟส|คืนชีพ',
    uk: 'Подвійний стрибок|Зупинка часу|Планерування|Повітряний ривок|Перемотування часу|Магніт|Фазовий зсув|Відродження',
    el: 'Διπλό άλμα|Παύση χρόνου|Αιώρηση|Εναέρια εφόρμηση|Επιστροφή χρόνου|Μαγνήτης|Αλλαγή φάσης|Αναβίωση',
    sv: 'Dubbelhopp|Tidsstopp|Glidflyg|Luftsprint|Spola tillbaka tiden|Magnet|Fasskifte|Återupplivning',
    'zh-Hans': '二段跳|时间停止|滑翔|空中冲刺|时间倒流|磁铁|相位转移|复活',
    bg: 'Двоен скок|Спиране на времето|Планиране|Въздушен тласък|Връщане на времето|Магнит|Фазово преместване|Съживяване',
    id: 'Lompatan ganda|Hentikan waktu|Melayang|Terjangan udara|Putar balik waktu|Magnet|Pergeseran fase|Bangkit',
    fi: 'Tuplahyppy|Ajan pysäytys|Liito|Ilmasyöksy|Ajan kelaus|Magneetti|Vaihesiirtymä|Elvytys',
    ja: '二段ジャンプ|時間停止|滑空|空中ダッシュ|時間巻き戻し|マグネット|位相シフト|復活',
    'es-419': 'Doble salto|Detener tiempo|Planear|Impulso aéreo|Rebobinar tiempo|Imán|Cambio de fase|Revivir',
    hu: 'Dupla ugrás|Időmegállítás|Siklás|Légi roham|Idővisszatekerés|Mágnes|Fázisváltás|Újjáéledés',
    'pt-PT': 'Salto duplo|Parar o tempo|Planar|Impulso aéreo|Rebobinar o tempo|Íman|Mudança de fase|Reviver',
    ru: 'Двойной прыжок|Остановка времени|Планирование|Воздушный рывок|Перемотка времени|Магнит|Фазовый сдвиг|Воскрешение',
    vi: 'Nhảy đôi|Dừng thời gian|Lượn|Lướt trên không|Tua ngược thời gian|Nam châm|Chuyển pha|Hồi sinh',
    cs: 'Dvojitý skok|Zastavení času|Plachtění|Vzdušný výpad|Vrácení času|Magnet|Fázový posun|Oživení'
  };
  const handSkillKeys = ['doubleJump','timeSlow','glide','airDash','timeRewind','magnet','phaseShift','revive'];
  const shopKeys = ['hands','rebirth','rebirthTag','rebirthConfirm','handTutorialOpen','handTutorialHands','handTutorialBuy'];
  SUPPORTED_LANGUAGES.forEach(({code}) => {
    shopKeys.forEach((key, i) => { UI_TRANSLATIONS[code][key] = SHOP_V14[code][i]; });
    UI_TRANSLATIONS[code].rebirthDone = `${SHOP_V14[code][1]} ×`;
    UI_TRANSLATIONS[code].rebirthMax = `${SHOP_V14[code][1]} · MAX`;
    HAND_SKILL_LABELS[code].split('|').forEach((label, i) => { UI_TRANSLATIONS[code]['handSkill_' + handSkillKeys[i]] = label; });
  });

  global.ElementalLocalization = Object.freeze({
    SUPPORTED_LANGUAGES,
    LATIN_AMERICAN_SPANISH_COUNTRIES,
    COUNTRY_LANGUAGE_MAP,
    TIME_SLOW_NAMES,
    MAGNET_NAMES,
    DAILY_MISSION_TITLES,
    DAILY_SHORT_LABELS,
    DAILY_MISSION_TYPES,
    DAILY_LOCALIZATION,
    NEW_RECORD_NAMES,
    UI_TRANSLATIONS,
    LOADING_GRAPHICS_TIPS,
    BROWSER_TEXT,
    BROWSER_TEXT_KEYS,
  });
})(window);

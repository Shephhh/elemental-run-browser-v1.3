(function () {
  'use strict';

  Object.defineProperty(window, 'ELEMENTAL_BROWSER_BUILD', {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
  });

  const config = window.ELEMENTAL_BROWSER_CONFIG || {};
  // Capture a custom bridge only during boot. Assigning a fake provider later
  // from DevTools cannot turn an unfinished ad into a completed reward.
  const customProvider = window.ElementalAdProvider && typeof window.ElementalAdProvider.showRewarded === 'function'
    ? window.ElementalAdProvider
    : null;
  let busy = false;

  function completed(provider) {
    return { status: 'completed', provider };
  }

  function unavailable(provider, error) {
    return { status: 'unavailable', provider, error: error ? String(error.message || error) : '' };
  }

  function normalizeCustomResult(value) {
    if (value === true || value === 'completed' || (value && value.completed === true)) return completed('custom');
    if (value && typeof value.status === 'string') return value;
    return { status: 'skipped', provider: 'custom' };
  }

  function runCrazyGamesAd(onStart) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };
      try {
        window.CrazyGames.SDK.ad.requestAd('rewarded', {
          adStarted: () => onStart(),
          adFinished: () => finish(completed('crazygames')),
          adError: (error, errorData) => finish(unavailable('crazygames', errorData || error))
        });
      } catch (error) {
        finish(unavailable('crazygames', error));
      }
    });
  }

  async function runPokiAd(onStart) {
    try {
      const success = await window.PokiSDK.rewardedBreak({
        size: 'medium',
        onStart
      });
      return success ? completed('poki') : { status: 'skipped', provider: 'poki' };
    } catch (error) {
      return unavailable('poki', error);
    }
  }

  function loadGooglePublisherTag() {
    if (window.googletag && window.googletag.cmd) return Promise.resolve(window.googletag);
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-elemental-gpt]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.googletag), { once: true });
        existing.addEventListener('error', () => reject(new Error('Google Publisher Tag failed to load.')), { once: true });
        return;
      }
      window.googletag = window.googletag || { cmd: [] };
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.elementalGpt = '1';
      script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
      script.addEventListener('load', () => resolve(window.googletag), { once: true });
      script.addEventListener('error', () => reject(new Error('Google Publisher Tag failed to load.')), { once: true });
      document.head.appendChild(script);
    });
  }

  async function runGoogleAdManagerAd(onStart) {
    const unitPath = String(config.googleAdManagerRewardedUnitPath || '').trim();
    if (!unitPath) return unavailable('google-ad-manager');
    try {
      const googletag = await loadGooglePublisherTag();
      return await new Promise((resolve) => {
        let settled = false;
        let granted = false;
        let slot = null;
        let timer = null;
        const finish = (result) => {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          try { if (slot) googletag.destroySlots([slot]); } catch (error) {}
          resolve(result);
        };
        timer = setTimeout(() => finish(unavailable('google-ad-manager', 'Rewarded ad timed out.')), 30000);
        googletag.cmd.push(() => {
          try {
            slot = googletag.defineOutOfPageSlot(unitPath, googletag.enums.OutOfPageFormat.REWARDED);
            if (!slot) {
              finish(unavailable('google-ad-manager', 'Rewarded ads are not supported on this device.'));
              return;
            }
            slot.addService(googletag.pubads());
            googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
              if (event.slot !== slot || settled) return;
              onStart();
              event.makeRewardedVisible();
            });
            googletag.pubads().addEventListener('rewardedSlotGranted', (event) => {
              if (event.slot === slot) granted = true;
            });
            googletag.pubads().addEventListener('rewardedSlotClosed', (event) => {
              if (event.slot !== slot) return;
              finish(granted ? completed('google-ad-manager') : { status: 'skipped', provider: 'google-ad-manager' });
            });
            googletag.pubads().addEventListener('slotRenderEnded', (event) => {
              if (event.slot === slot && event.isEmpty) finish(unavailable('google-ad-manager', 'No ad available.'));
            });
            googletag.enableServices();
            googletag.display(slot);
          } catch (error) {
            finish(unavailable('google-ad-manager', error));
          }
        });
      });
    } catch (error) {
      return unavailable('google-ad-manager', error);
    }
  }

  function canUseDemoAds() {
    if (new URLSearchParams(location.search).get('demoAds') === '1') return true;
    if (config.demoAdsOnLocalhost === false) return false;
    return location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  }

  function runDemoAd(labels, onStart) {
    return new Promise((resolve) => {
      onStart();
      const overlay = document.createElement('div');
      overlay.className = 'browser-demo-ad';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.innerHTML = `
        <div class="browser-demo-ad-card">
          <span class="browser-demo-ad-badge">${labels.demoAd || 'DEMO REWARDED AD'}</span>
          <div class="browser-demo-ad-mark" aria-hidden="true">▶</div>
          <strong>${labels.adPlaying || 'Rewarded ad is playing'}</strong>
          <span class="browser-demo-ad-placement">${labels.placement || ''}</span>
          <div class="browser-demo-ad-progress"><i></i></div>
          <small class="browser-demo-ad-countdown">3</small>
        </div>`;
      document.body.appendChild(overlay);

      const duration = new URLSearchParams(location.search).get('demoAdsFast') === '1' ? 1500 : 3000;
      const startedAt = performance.now();
      const progress = overlay.querySelector('.browser-demo-ad-progress i');
      const countdown = overlay.querySelector('.browser-demo-ad-countdown');
      const tick = () => {
        const elapsed = performance.now() - startedAt;
        const ratio = Math.min(1, elapsed / duration);
        if (progress) progress.style.transform = `scaleX(${ratio})`;
        if (countdown) countdown.textContent = String(Math.max(0, Math.ceil((duration - elapsed) / 1000)));
        if (ratio < 1) {
          requestAnimationFrame(tick);
          return;
        }
        overlay.classList.add('is-complete');
        setTimeout(() => {
          overlay.remove();
          resolve(completed('demo'));
        }, 220);
      };
      requestAnimationFrame(tick);
    });
  }

  async function showRewarded(options) {
    if (busy) return { status: 'busy', provider: 'none' };
    busy = true;
    const request = options || {};
    const onStart = typeof request.onStart === 'function' ? request.onStart : function () {};
    const onFinish = typeof request.onFinish === 'function' ? request.onFinish : function () {};
    let result;
    try {
      if (customProvider) {
        onStart();
        result = normalizeCustomResult(await customProvider.showRewarded({ placement: request.placement }));
      } else if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) {
        result = await runCrazyGamesAd(onStart);
      } else if (window.PokiSDK && typeof window.PokiSDK.rewardedBreak === 'function') {
        result = await runPokiAd(onStart);
      } else if (config.googleAdManagerRewardedUnitPath) {
        result = await runGoogleAdManagerAd(onStart);
      } else if (canUseDemoAds()) {
        result = await runDemoAd(request.labels || {}, onStart);
      } else {
        result = unavailable('none');
      }
    } catch (error) {
      result = unavailable('none', error);
    } finally {
      busy = false;
    }
    try { onFinish(result); } catch (error) {}
    return result;
  }

  const publicAds = Object.freeze({
    showRewarded,
    isBusy: () => busy,
    provider: () => {
      if (customProvider) return 'custom';
      if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) return 'crazygames';
      if (window.PokiSDK && typeof window.PokiSDK.rewardedBreak === 'function') return 'poki';
      if (config.googleAdManagerRewardedUnitPath) return 'google-ad-manager';
      return canUseDemoAds() ? 'demo' : 'none';
    }
  });
  Object.defineProperty(window, 'ElementalBrowserAds', {
    value: publicAds,
    writable: false,
    configurable: false,
    enumerable: false
  });

  const feedbackCopy = {
    en:['HOW TO PLAY','MOVE','JUMP','LOOK','SPACE'],tr:['NASIL OYNANIR','HAREKET','ZIPLA','BAKIŞ','BOŞLUK'],
    it:['COME SI GIOCA','MUOVI','SALTA','GUARDA','SPAZIO'],'es-ES':['CÓMO JUGAR','MOVER','SALTAR','MIRAR','ESPACIO'],'es-419':['CÓMO JUGAR','MOVER','SALTAR','MIRAR','ESPACIO'],
    fr:['COMMENT JOUER','BOUGER','SAUTER','REGARDER','ESPACE'],de:['STEUERUNG','BEWEGEN','SPRINGEN','BLICK','LEERTASTE'],ar:['طريقة اللعب','تحرك','اقفز','انظر','مسافة'],
    'pt-BR':['COMO JOGAR','MOVER','PULAR','OLHAR','ESPAÇO'],'pt-PT':['COMO JOGAR','MOVER','SALTAR','OLHAR','ESPAÇO'],da:['SÅDAN SPILLER DU','BEVÆG','HOP','SE','MELLEMRUM'],
    nl:['HOE TE SPELEN','BEWEGEN','SPRINGEN','KIJKEN','SPATIE'],'zh-Hant':['遊戲方式','移動','跳躍','視角','空白鍵'],'zh-Hans':['游戏方式','移动','跳跃','视角','空格'],
    ko:['플레이 방법','이동','점프','시점','스페이스'],pl:['JAK GRAĆ','RUCH','SKOK','ROZEJRZYJ','SPACJA'],no:['SLIK SPILLER DU','BEVEG','HOPP','SE','MELLOMROM'],
    ro:['CUM SE JOACĂ','MIȘCARE','SALT','PRIVIRE','SPAȚIU'],th:['วิธีเล่น','เคลื่อนที่','กระโดด','มอง','สเปซ'],uk:['ЯК ГРАТИ','РУХ','СТРИБОК','ОГЛЯД','ПРОБІЛ'],
    el:['ΠΩΣ ΠΑΙΖΕΤΑΙ','ΚΙΝΗΣΗ','ΑΛΜΑ','ΚΟΙΤΑ','SPACE'],sv:['SÅ SPELAR DU','RÖR DIG','HOPPA','TITTA','MELLANSLAG'],bg:['КАК СЕ ИГРАЕ','ДВИЖЕНИЕ','СКОК','ОГЛЕД','ИНТЕРВАЛ'],
    id:['CARA BERMAIN','GERAK','LOMPAT','LIHAT','SPASI'],fi:['PELIOHJE','LIIKU','HYPPÄÄ','KATSO','VÄLILYÖNTI'],ja:['遊び方','移動','ジャンプ','視点','スペース'],
    hu:['IRÁNYÍTÁS','MOZGÁS','UGRÁS','NÉZET','SZÓKÖZ'],ru:['КАК ИГРАТЬ','ДВИЖЕНИЕ','ПРЫЖОК','ОБЗОР','ПРОБЕЛ'],vi:['CÁCH CHƠI','DI CHUYỂN','NHẢY','NHÌN','PHÍM CÁCH'],
    cs:['JAK HRÁT','POHYB','SKOK','ROZHLÍŽENÍ','MEZERNÍK']
  };
  let feedbackTimer = 0;
  let feedbackLeaveTimer = 0;
  function ensureFeedbackDom() {
    if (!document.getElementById('wallet-feedback-layer')) {
      const layer = document.createElement('div');
      layer.id = 'wallet-feedback-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);
    }
    if (!document.getElementById('how-to-play-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'how-to-play-overlay';
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '<div class="how-to-play-card"><div class="how-to-play-title"></div><div class="how-to-play-controls">'
        + '<div class="how-to-control"><div class="key-cluster"><span class="keycap key-w">W</span><span class="keycap key-a">A</span><span class="keycap key-s">S</span><span class="keycap key-d">D</span></div><span class="how-to-control-label" data-copy="move"></span></div>'
        + '<div class="how-to-control"><span class="keycap is-space" data-copy="space"></span><span class="how-to-control-label" data-copy="jump"></span></div>'
        + '<div class="how-to-control"><span class="mouse-glyph"></span><span class="how-to-control-label" data-copy="look"></span></div></div></div>';
      document.body.appendChild(overlay);
    }
  }
  function hideFeedback(instant) {
    clearTimeout(feedbackTimer);
    clearTimeout(feedbackLeaveTimer);
    const overlay = document.getElementById('how-to-play-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-visible');
    overlay.classList.toggle('is-leaving', !instant);
    if (instant) {
      overlay.hidden = true;
      overlay.classList.remove('is-leaving');
      return;
    }
    feedbackLeaveTimer = setTimeout(() => {
      overlay.hidden = true;
      overlay.classList.remove('is-leaving');
    }, 420);
  }
  function showFeedback(language) {
    ensureFeedbackDom();
    hideFeedback(true);
    const code = feedbackCopy[language] ? language : 'en';
    const text = feedbackCopy[code];
    const overlay = document.getElementById('how-to-play-overlay');
    overlay.querySelector('.how-to-play-title').textContent = text[0];
    overlay.querySelector('[data-copy="move"]').textContent = text[1];
    overlay.querySelector('[data-copy="jump"]').textContent = text[2];
    overlay.querySelector('[data-copy="look"]').textContent = text[3];
    overlay.querySelector('[data-copy="space"]').textContent = text[4];
    overlay.dir = code === 'ar' ? 'rtl' : 'ltr';
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    void overlay.offsetWidth;
    overlay.classList.add('is-visible');
    feedbackTimer = setTimeout(() => hideFeedback(false), 5000);
  }
  function feedbackPoint(element, x, y) {
    if (element && element.getBoundingClientRect) {
      const rect = element.getBoundingClientRect();
      if (rect.width && rect.height) return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { x, y };
  }
  function replayFeedbackClass(element, className, duration) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), duration);
  }
  function walletTransaction(amount, kind, source) {
    ensureFeedbackDom();
    amount = Math.max(0, Math.floor(Number(amount)) || 0);
    if (!amount) return;
    const gain = kind !== 'spend';
    const layer = document.getElementById('wallet-feedback-layer');
    const start = feedbackPoint(source, innerWidth * .5, innerHeight * .5);
    const target = feedbackPoint(document.getElementById('menu-shop-btn'), innerWidth - 100, 80);
    const value = document.createElement('span');
    value.className = 'wallet-fx-value' + (gain ? '' : ' is-spend');
    value.style.setProperty('--fx-x', start.x + 'px');
    value.style.setProperty('--fx-y', start.y + 'px');
    value.textContent = (gain ? '+' : '−') + amount.toLocaleString();
    layer.appendChild(value);
    setTimeout(() => value.remove(), 1100);
    const reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = reduced ? 0 : (gain ? 12 : 8);
    for (let i = 0; i < count; i++) {
      const coin = document.createElement('i');
      coin.className = 'wallet-fx-coin' + (gain ? '' : ' is-spend');
      const spreadX = (Math.random() - .5) * (gain ? 150 : 110);
      const spreadY = gain ? (-45 - Math.random() * 90) : (45 + Math.random() * 75);
      coin.style.setProperty('--fx-x', start.x + 'px');
      coin.style.setProperty('--fx-y', start.y + 'px');
      coin.style.setProperty('--fx-dx', (gain ? spreadX : (target.x - start.x) * .18 + spreadX) + 'px');
      coin.style.setProperty('--fx-dy', spreadY + 'px');
      coin.style.setProperty('--fx-delay', (i * 24) + 'ms');
      coin.style.setProperty('--fx-dur', (620 + Math.random() * 260) + 'ms');
      layer.appendChild(coin);
      setTimeout(() => coin.remove(), 1250);
    }
    replayFeedbackClass(document.getElementById('menu-shop-btn'), gain ? 'is-wallet-gain' : 'is-wallet-spend', gain ? 760 : 620);
    const card = source && source.closest ? source.closest('.menu-upgrade-card') : null;
    if (!gain && card) replayFeedbackClass(card, 'is-purchase-success', 640);
  }
  Object.defineProperty(window, 'ElementalFeedback', {
    value: Object.freeze({ show: showFeedback, hide: hideFeedback, transaction: walletTransaction }),
    writable: false,
    configurable: false,
    enumerable: false
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureFeedbackDom, { once: true });
  else ensureFeedbackDom();
})();

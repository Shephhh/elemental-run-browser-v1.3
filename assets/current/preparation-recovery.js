(function () {
  'use strict';
  const recent = [];
  function describe(error, phase) {
    const target = error?.target || error?.currentTarget;
    let resource = String(error?.url || target?.responseURL || target?.src || '').split(/[?#]/)[0].slice(0, 500);
    return { phase, name: String(error?.name || 'Error'), message: String(error?.message || error || 'Unknown preparation failure').slice(0, 1000),
      resource, status: Number(target?.status) || 0, stack: String(error?.stack || '').slice(0, 4000) };
  }
  function report(error, phase, attempt, final = false) {
    const info = { ...describe(error, phase), attempt, final };
    recent.push(info); if (recent.length > 8) recent.shift();
    // Error properties are non-enumerable: raw console.error(error) became {}
    // in the portal's collector. Send a readable string, never a hidden Error.
    console[final ? 'error' : 'warn']('[Preparation] ' + JSON.stringify(info));
    return info;
  }
  async function run(phase, work, options = {}) {
    const attempts = Math.max(1, Math.min(2, options.attempts ?? 2));
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try { return await work(attempt); }
      catch (error) {
        const lost = /context\s*lost/i.test(String(error?.message || error));
        const final = attempt === attempts || lost;
        report(error, phase, attempt, final);
        if (final) throw error;
        await options.reset?.();
        await new Promise(resolve => setTimeout(resolve, 180));
      }
    }
  }
  window.ElementalPreparation = Object.freeze({ run, report, describe, snapshot: () => recent.map(info => ({ ...info })) });
})();

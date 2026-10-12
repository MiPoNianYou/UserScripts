// ==UserScript==
// @name         Quark Pilot
// @description  夸克网盘分享页按更新时间倒序并自动取消全选
// @version      1.0.0
// @icon         https://raw.githubusercontent.com/MiPoNianYou/UserScripts/main/Quark-Pilot/assets/icon/quark-pilot.svg
// @homepageURL  https://github.com/MiPoNianYou/UserScripts/tree/main/Quark-Pilot
// @supportURL   https://github.com/MiPoNianYou/UserScripts/issues
// @author       MiPoNianYou
// @namespace    https://github.com/MiPoNianYou
// @license      MIT
// @match        https://pan.quark.cn/s/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/MiPoNianYou/UserScripts/main/Quark-Pilot/quark-pilot.user.js
// @updateURL    https://raw.githubusercontent.com/MiPoNianYou/UserScripts/main/Quark-Pilot/quark-pilot.user.js
// ==/UserScript==

(() => {
  'use strict';

  const DETAIL_PATH = '/1/clouddrive/share/sharepage/detail';
  const DEFAULT_SORT = 'file_type:asc,file_name:asc';
  const UPDATED_SORT = 'file_type:asc,updated_at:desc';

  function modifySpecificRequest(url) {
    try {
      const urlObject = new URL(url, window.location.href);
      if (!urlObject.pathname.endsWith(DETAIL_PATH)) return url;
      if (urlObject.searchParams.get('_sort') !== DEFAULT_SORT) return url;

      urlObject.searchParams.set('_sort', UPDATED_SORT);
      return urlObject.href;
    } catch {
      return url;
    }
  }

  const originXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...options) {
    return originXHROpen.call(this, method, modifySpecificRequest(url), ...options);
  };

  let lastSignature = '';
  let stableSince = 0;
  let lastClick = 0;
  let userSelectionOverride = false;

  document.addEventListener(
    'click',
    (event) => {
      if (!event.isTrusted) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('thead input[type="checkbox"], tbody input[type="checkbox"]')) {
        userSelectionOverride = true;
      }
    },
    true,
  );

  const tick = () => {
    const header = document.querySelector('thead input[type="checkbox"]');
    const rows = [...document.querySelectorAll('tbody tr')].filter(
      (row) => row.querySelector('input[type="checkbox"]'),
    );
    if (!header || rows.length === 0) return;

    const signature = `${location.hash}|${rows.length}|${rows
      .map((row) => row.textContent.trim())
      .join('|')}`;
    if (signature !== lastSignature) {
      lastSignature = signature;
      stableSince = Date.now();
    }

    const allChecked =
      header.checked &&
      rows.every((row) => row.querySelector('input[type="checkbox"]').checked);
    if (
      allChecked &&
      !userSelectionOverride &&
      Date.now() - stableSince >= 300 &&
      Date.now() - lastClick >= 700
    ) {
      header.click();
      lastClick = Date.now();
    }
  };

  setInterval(tick, 50);
  for (const event of ['hashchange', 'popstate']) {
    addEventListener(event, () => {
      lastSignature = '';
      stableSince = 0;
      lastClick = 0;
      userSelectionOverride = false;
    });
  }
})();

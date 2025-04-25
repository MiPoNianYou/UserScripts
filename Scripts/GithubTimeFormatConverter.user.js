// ==UserScript==
// @name               Github Time Format Converter
// @name:zh-CN         Github 时间格式转换
// @name:zh-TW         Github 時間格式轉換
// @description        Convert relative times on GitHub to absolute date and time
// @description:zh-CN  将 GitHub 页面上的相对时间转换为绝对日期和时间
// @description:zh-TW  將 GitHub 頁面上的相對時間轉換成絕對日期與時間
// @version            1.0.1
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/GithubTimeFormatConverterIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              https://github.com/*
// @exclude            https://github.com/topics/*
// @grant              none
// @run-at             document-idle
// ==/UserScript==

(function () {
  "use strict";

  const translations = {
    invalidDate: {
      "zh-CN": "无效日期",
      "zh-TW": "無效日期",
      en: "Invalid Date",
    },
    fullDateLabel: {
      "zh-CN": "完整日期",
      "zh-TW": "完整日期",
      en: "Full Date",
    },
  };
  const PROCESSED_MARKER_CLASS = "gh-time-converter-processed";
  const TOOLTIP_ID = "gh-time-converter-tooltip";
  const TOOLTIP_STYLE_ID = `${TOOLTIP_ID}-style`;
  const TOOLTIP_OFFSET_Y = 5;
  const VIEWPORT_MARGIN = 5;

  let tooltipElement = null;
  let currentLanguage = "en";

  function detectLanguage() {
    const langs = navigator.languages || [navigator.language || "en"];
    for (const lang of langs) {
      const lowerLang = lang.toLowerCase();
      if (lowerLang.startsWith("zh-cn")) return "zh-CN";
      if (lowerLang.startsWith("zh-tw") || lowerLang.startsWith("zh-hk"))
        return "zh-TW";
      if (lowerLang.startsWith("zh")) return "zh-CN";
      if (lowerLang.startsWith("en")) return "en";
    }
    return "en";
  }

  function getStr(key) {
    return translations[key]?.[currentLanguage] || translations[key]?.en || key;
  }

  function pad(num) {
    return String(num).padStart(2, "0");
  }

  function formatDateTime(dateInput, formatType = "short") {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
      return getStr("invalidDate");
    }
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    if (formatType === "full") {
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    return `${month}-${day} ${hours}:${minutes}`;
  }

  function injectTooltipStyles() {
    if (document.getElementById(TOOLTIP_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = TOOLTIP_STYLE_ID;
    style.textContent = `
      #${TOOLTIP_ID} {
        position: absolute;
        background-color: var(--color-canvas-overlay, #222);
        color: var(--color-fg-default, #eee);
        padding: 5px 8px;
        border-radius: 6px;
        font-size: 12px;
        line-height: 1.4;
        z-index: 10000;
        pointer-events: none;
        white-space: pre;
        display: none;
        border: 1px solid var(--color-border-default, #444);
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        max-width: 300px;
        transition: opacity 0.1s ease-in-out;
        opacity: 0;
      }
      #${TOOLTIP_ID}.visible {
          display: block;
          opacity: 1;
      }
      .${PROCESSED_MARKER_CLASS}[data-full-date] {
        color: inherit;
        font-size: inherit;
        display: inline-block;
        vertical-align: baseline;
        font-family: monospace;
        min-width: 85px;
        text-align: right;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        cursor: help;
      }
    `;
    document.head.appendChild(style);
  }

  function createTooltipElement() {
    let element = document.getElementById(TOOLTIP_ID);
    if (!element) {
      element = document.createElement("div");
      element.id = TOOLTIP_ID;
      document.body.appendChild(element);
    }
    return element;
  }

  function showTooltip(targetSpan) {
    const fullDate = targetSpan.dataset.fullDate;
    if (!fullDate || !tooltipElement) return;

    const fullDateLabel = getStr("fullDateLabel");
    tooltipElement.textContent = `${fullDateLabel} ${fullDate}`;

    const rect = targetSpan.getBoundingClientRect();

    tooltipElement.classList.add("visible");
    tooltipElement.style.left = "-9999px";
    tooltipElement.style.top = "-9999px";

    const tooltipWidth = tooltipElement.offsetWidth;
    const tooltipHeight = tooltipElement.offsetHeight;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let desiredLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const minLeft = VIEWPORT_MARGIN;
    const maxLeft = viewportWidth - tooltipWidth - VIEWPORT_MARGIN;
    desiredLeft = Math.max(minLeft, Math.min(desiredLeft, maxLeft));

    let desiredTop;
    const spaceAbove = rect.top - TOOLTIP_OFFSET_Y;
    const spaceBelow = viewportHeight - rect.bottom - TOOLTIP_OFFSET_Y;

    const fitsAbove = spaceAbove >= tooltipHeight + VIEWPORT_MARGIN;
    const fitsBelow = spaceBelow >= tooltipHeight + VIEWPORT_MARGIN;

    if (fitsAbove) {
      desiredTop = rect.top - tooltipHeight - TOOLTIP_OFFSET_Y;
    } else if (fitsBelow) {
      desiredTop = rect.bottom + TOOLTIP_OFFSET_Y;
    } else {
      if (spaceAbove > spaceBelow) {
        desiredTop = Math.max(
          VIEWPORT_MARGIN,
          rect.top - tooltipHeight - TOOLTIP_OFFSET_Y
        );
      } else {
        desiredTop = Math.min(
          viewportHeight - tooltipHeight - VIEWPORT_MARGIN,
          rect.bottom + TOOLTIP_OFFSET_Y
        );
        if (desiredTop < VIEWPORT_MARGIN) {
          desiredTop = VIEWPORT_MARGIN;
        }
      }
    }

    tooltipElement.style.left = `${desiredLeft}px`;
    tooltipElement.style.top = `${desiredTop}px`;
  }

  function hideTooltip() {
    if (tooltipElement) {
      tooltipElement.classList.remove("visible");
    }
  }

  function processTimeElement(element) {
    if (
      !element ||
      !(element instanceof Element) ||
      element.classList.contains(PROCESSED_MARKER_CLASS)
    ) {
      return;
    }

    const dateTimeString = element.getAttribute("datetime");
    if (!dateTimeString) {
      element.classList.add(PROCESSED_MARKER_CLASS);
      return;
    }

    try {
      const formattedTime = formatDateTime(dateTimeString, "short");
      const fullFormattedTime = formatDateTime(dateTimeString, "full");

      if (formattedTime === getStr("invalidDate")) {
        element.classList.add(PROCESSED_MARKER_CLASS);
        return;
      }

      const newSpan = document.createElement("span");
      newSpan.textContent = formattedTime;
      newSpan.dataset.fullDate = fullFormattedTime;

      newSpan.classList.add(PROCESSED_MARKER_CLASS);

      if (element.parentNode) {
        element.parentNode.replaceChild(newSpan, element);
      }
    } catch (error) {
      element.classList.add(PROCESSED_MARKER_CLASS);
    }
  }

  function convertRelativeTimes(rootNode = document.body) {
    const timeElements = rootNode.querySelectorAll(
      `relative-time:not(.${PROCESSED_MARKER_CLASS})`
    );
    timeElements.forEach(processTimeElement);
  }

  function initializeEventListeners() {
    document.body.addEventListener("mouseover", (event) => {
      const targetSpan = event.target.closest(
        `span.${PROCESSED_MARKER_CLASS}[data-full-date]`
      );
      if (targetSpan) {
        showTooltip(targetSpan);
      }
    });

    document.body.addEventListener("mouseout", (event) => {
      const targetSpan = event.target.closest(
        `span.${PROCESSED_MARKER_CLASS}[data-full-date]`
      );
      if (targetSpan) {
        hideTooltip();
      }
    });
  }

  currentLanguage = detectLanguage();
  injectTooltipStyles();
  tooltipElement = createTooltipElement();
  convertRelativeTimes(document.body);
  initializeEventListeners();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const elementsToProcess = [];
            if (node.matches(`relative-time:not(.${PROCESSED_MARKER_CLASS})`)) {
              elementsToProcess.push(node);
            }
            node
              .querySelectorAll(`relative-time:not(.${PROCESSED_MARKER_CLASS})`)
              .forEach((el) => elementsToProcess.push(el));

            elementsToProcess.forEach(processTimeElement);
          }
        });
      }
    }
  });

  const observerConfig = {
    childList: true,
    subtree: true,
  };
  observer.observe(document.body, observerConfig);
})();

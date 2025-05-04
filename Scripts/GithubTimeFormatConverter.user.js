// ==UserScript==
// @name               Github Time Format Converter
// @name:zh-CN         Github 时间格式转换
// @name:zh-TW         Github 時間格式轉換
// @description        Convert relative times on GitHub to absolute date and time
// @description:zh-CN  将 GitHub 页面上的相对时间转换为绝对日期和时间
// @description:zh-TW  將 GitHub 頁面上的相對時間轉換成絕對日期與時間
// @version            1.1.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/GithubTimeFormatConverterIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              https://github.com/*
// @exclude            https://github.com/topics/*
// @grant              GM_addStyle
// @run-at             document-idle
// ==/UserScript==

(function () {
  "use strict";

  const ScriptConfiguration = {
    TOOLTIP_VERTICAL_OFFSET: 5,
    VIEWPORT_EDGE_MARGIN: 5,
    TRANSITION_DURATION_MS: 100,
    UI_FONT_STACK: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    UI_FONT_STACK_MONO: "ui-monospace, SFMono-Regular, Menlo, monospace",
  };

  const ElementIdentifiers = {
    TOOLTIP_CONTAINER_ID: "TimeConverterTooltipContainer",
  };

  const StyleClasses = {
    PROCESSED_TIME_ELEMENT: "time-converter-processed-element",
    TOOLTIP_IS_VISIBLE: "time-converter-tooltip--is-visible",
  };

  const UserInterfaceTextKeys = {
    "zh-CN": {
      INVALID_DATE_STRING: "无效日期",
      FULL_DATE_TIME_LABEL: "完整日期:",
    },
    "zh-TW": {
      INVALID_DATE_STRING: "無效日期",
      FULL_DATE_TIME_LABEL: "完整日期:",
    },
    "en-US": {
      INVALID_DATE_STRING: "Invalid Date",
      FULL_DATE_TIME_LABEL: "Full Date:",
    },
  };

  const DomQuerySelectors = {
    UNPROCESSED_RELATIVE_TIME: `relative-time:not(.${StyleClasses.PROCESSED_TIME_ELEMENT})`,
    PROCESSED_TIME_SPAN: `span.${StyleClasses.PROCESSED_TIME_ELEMENT}[data-full-date-time]`,
    RELATIVE_TIME_TAG: "relative-time",
  };

  let tooltipContainerElement = null;
  let currentUserLocale = "en-US";
  let localizedText = UserInterfaceTextKeys["en-US"];
  let shortDateTimeFormatter = null;
  let fullDateTimeFormatter = null;

  function detectBrowserLanguage() {
    const languages = navigator.languages || [navigator.language];
    for (const lang of languages) {
      const langLower = lang.toLowerCase();
      if (langLower === "zh-cn") return "zh-CN";
      if (
        langLower === "zh-tw" ||
        langLower === "zh-hk" ||
        langLower === "zh-mo"
      )
        return "zh-TW";
      if (langLower === "en-us") return "en-US";
      if (langLower.startsWith("zh-")) return "zh-CN";
      if (langLower.startsWith("en-")) return "en-US";
    }
    for (const lang of languages) {
      const langLower = lang.toLowerCase();
      if (langLower.startsWith("zh")) return "zh-CN";
      if (langLower.startsWith("en")) return "en-US";
    }
    return "en-US";
  }

  function initializeDateTimeFormatters(locale) {
    try {
      shortDateTimeFormatter = new Intl.DateTimeFormat(locale, {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      fullDateTimeFormatter = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      shortDateTimeFormatter = null;
      fullDateTimeFormatter = null;
    }
  }

  function getLocalizedTextForKey(key) {
    return (
      localizedText[key] ||
      UserInterfaceTextKeys["en-US"][key] ||
      key.replace(/_/g, " ")
    );
  }

  function formatDateTimeString(dateSource, formatStyle = "short") {
    const dateObject =
      typeof dateSource === "string" ? new Date(dateSource) : dateSource;

    if (isNaN(dateObject.getTime())) {
      return getLocalizedTextForKey("INVALID_DATE_STRING");
    }

    const formatter =
      formatStyle === "full" ? fullDateTimeFormatter : shortDateTimeFormatter;

    if (!formatter) {
      const year = dateObject.getFullYear();
      const month = String(dateObject.getMonth() + 1).padStart(2, "0");
      const day = String(dateObject.getDate()).padStart(2, "0");
      const hours = String(dateObject.getHours()).padStart(2, "0");
      const minutes = String(dateObject.getMinutes()).padStart(2, "0");
      if (formatStyle === "full") {
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }
      return `${month}-${day} ${hours}:${minutes}`;
    }

    try {
      let formattedString = formatter.format(dateObject);
      formattedString = formattedString.replace(/[/]/g, "-");
      if (formatStyle === "full") {
        formattedString = formattedString.replace(", ", " ");
      } else {
        formattedString = formattedString.replace(", ", " ");
      }
      return formattedString;
    } catch (e) {
      return getLocalizedTextForKey("INVALID_DATE_STRING");
    }
  }

  function injectDynamicStyles() {
    const appleEaseOutStandard = "cubic-bezier(0, 0, 0.58, 1)";
    const transitionDuration = ScriptConfiguration.TRANSITION_DURATION_MS;

    const cssStyles = `
      :root {
        --time-converter-tooltip-background-color-dark: rgba(48, 52, 70, 0.92);
        --time-converter-tooltip-text-color-dark: #c6d0f5;
        --time-converter-tooltip-border-color-dark: rgba(98, 104, 128, 0.25);
        --time-converter-tooltip-shadow-dark: 0 1px 3px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.2);

        --time-converter-tooltip-background-color-light: rgba(239, 241, 245, 0.92);
        --time-converter-tooltip-text-color-light: #4c4f69;
        --time-converter-tooltip-border-color-light: rgba(172, 176, 190, 0.3);
        --time-converter-tooltip-shadow-light: 0 1px 3px rgba(90, 90, 90, 0.08), 0 5px 10px rgba(90, 90, 90, 0.12);
      }

      #${ElementIdentifiers.TOOLTIP_CONTAINER_ID} {
        position: fixed;
        padding: 6px 10px;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.4;
        z-index: 2147483647;
        pointer-events: none;
        white-space: pre;
        max-width: 350px;
        opacity: 0;
        visibility: hidden;
        font-family: ${ScriptConfiguration.UI_FONT_STACK};
        backdrop-filter: blur(10px) saturate(180%);
        -webkit-backdrop-filter: blur(10px) saturate(180%);
        transition: opacity ${transitionDuration}ms ${appleEaseOutStandard},
                    visibility ${transitionDuration}ms ${appleEaseOutStandard};

        background-color: var(--time-converter-tooltip-background-color-dark);
        color: var(--time-converter-tooltip-text-color-dark);
        border: 1px solid var(--time-converter-tooltip-border-color-dark);
        box-shadow: var(--time-converter-tooltip-shadow-dark);
      }

      #${ElementIdentifiers.TOOLTIP_CONTAINER_ID}.${StyleClasses.TOOLTIP_IS_VISIBLE} {
        opacity: 1;
        visibility: visible;
      }

      .${StyleClasses.PROCESSED_TIME_ELEMENT}[data-full-date-time] {
        display: inline-block;
        vertical-align: baseline;
        font-family: ${ScriptConfiguration.UI_FONT_STACK_MONO};
        min-width: 88px;
        text-align: right;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        cursor: help;
        color: inherit;
        background: none;
        border: none;
      }

      @media (prefers-color-scheme: light) {
        #${ElementIdentifiers.TOOLTIP_CONTAINER_ID} {
          background-color: var(--time-converter-tooltip-background-color-light);
          color: var(--time-converter-tooltip-text-color-light);
          border: 1px solid var(--time-converter-tooltip-border-color-light);
          box-shadow: var(--time-converter-tooltip-shadow-light);
        }
      }
    `;
    try {
      GM_addStyle(cssStyles);
    } catch (e) {}
  }

  function ensureTooltipContainerExists() {
    tooltipContainerElement = document.getElementById(
      ElementIdentifiers.TOOLTIP_CONTAINER_ID
    );
    if (!tooltipContainerElement && document.body) {
      tooltipContainerElement = document.createElement("div");
      tooltipContainerElement.id = ElementIdentifiers.TOOLTIP_CONTAINER_ID;
      tooltipContainerElement.setAttribute("role", "tooltip");
      tooltipContainerElement.setAttribute("aria-hidden", "true");
      try {
        if (document.body) {
          document.body.appendChild(tooltipContainerElement);
        }
      } catch (e) {}
    }
    return tooltipContainerElement;
  }

  function displayTooltipNearElement(targetElement) {
    const fullDateTime = targetElement.dataset.fullDateTime;
    ensureTooltipContainerExists();

    if (!fullDateTime || !tooltipContainerElement) return;

    const label = getLocalizedTextForKey("FULL_DATE_TIME_LABEL");
    tooltipContainerElement.textContent = `${label} ${fullDateTime}`;
    tooltipContainerElement.setAttribute("aria-hidden", "false");

    const targetRect = targetElement.getBoundingClientRect();
    tooltipContainerElement.classList.add(StyleClasses.TOOLTIP_IS_VISIBLE);

    tooltipContainerElement.style.left = "-9999px";
    tooltipContainerElement.style.top = "-9999px";
    tooltipContainerElement.style.visibility = "hidden";

    requestAnimationFrame(() => {
      if (!tooltipContainerElement || !targetElement.isConnected) {
        hideTooltip();
        return;
      }

      const tooltipWidth = tooltipContainerElement.offsetWidth;
      const tooltipHeight = tooltipContainerElement.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const verticalOffset = ScriptConfiguration.TOOLTIP_VERTICAL_OFFSET;
      const margin = ScriptConfiguration.VIEWPORT_EDGE_MARGIN;

      let tooltipLeft =
        targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      tooltipLeft = Math.max(margin, tooltipLeft);
      tooltipLeft = Math.min(
        viewportWidth - tooltipWidth - margin,
        tooltipLeft
      );

      let tooltipTop;
      const spaceAbove = targetRect.top - verticalOffset;
      const spaceBelow = viewportHeight - targetRect.bottom - verticalOffset;

      if (spaceAbove >= tooltipHeight + margin) {
        tooltipTop = targetRect.top - tooltipHeight - verticalOffset;
      } else if (spaceBelow >= tooltipHeight + margin) {
        tooltipTop = targetRect.bottom + verticalOffset;
      } else {
        if (spaceAbove > spaceBelow) {
          tooltipTop = Math.max(
            margin,
            targetRect.top - tooltipHeight - verticalOffset
          );
        } else {
          tooltipTop = Math.min(
            viewportHeight - tooltipHeight - margin,
            targetRect.bottom + verticalOffset
          );
          if (tooltipTop < margin) {
            tooltipTop = margin;
          }
        }
      }

      tooltipContainerElement.style.left = `${tooltipLeft}px`;
      tooltipContainerElement.style.top = `${tooltipTop}px`;
      tooltipContainerElement.style.visibility = "visible";
    });
  }

  function hideTooltip() {
    if (tooltipContainerElement) {
      tooltipContainerElement.classList.remove(StyleClasses.TOOLTIP_IS_VISIBLE);
      tooltipContainerElement.setAttribute("aria-hidden", "true");
    }
  }

  function convertRelativeTimeElement(element) {
    if (
      !element ||
      !(element instanceof Element) ||
      element.classList.contains(StyleClasses.PROCESSED_TIME_ELEMENT)
    ) {
      return;
    }

    const dateTimeAttribute = element.getAttribute("datetime");
    if (!dateTimeAttribute) {
      element.classList.add(StyleClasses.PROCESSED_TIME_ELEMENT);
      return;
    }

    try {
      const shortFormattedTime = formatDateTimeString(
        dateTimeAttribute,
        "short"
      );
      const fullFormattedTime = formatDateTimeString(dateTimeAttribute, "full");

      if (
        shortFormattedTime === getLocalizedTextForKey("INVALID_DATE_STRING") ||
        fullFormattedTime === getLocalizedTextForKey("INVALID_DATE_STRING")
      ) {
        element.classList.add(StyleClasses.PROCESSED_TIME_ELEMENT);
        return;
      }

      const replacementSpan = document.createElement("span");
      replacementSpan.textContent = shortFormattedTime;
      replacementSpan.dataset.fullDateTime = fullFormattedTime;
      replacementSpan.classList.add(StyleClasses.PROCESSED_TIME_ELEMENT);

      if (element.parentNode) {
        element.parentNode.replaceChild(replacementSpan, element);
      } else {
        element.classList.add(StyleClasses.PROCESSED_TIME_ELEMENT);
      }
    } catch (error) {
      element.classList.add(StyleClasses.PROCESSED_TIME_ELEMENT);
    }
  }

  function processRelativeTimesInNode(targetNode = document.body) {
    if (!targetNode || typeof targetNode.querySelectorAll !== "function") {
      return;
    }
    try {
      const timeElements = targetNode.querySelectorAll(
        DomQuerySelectors.UNPROCESSED_RELATIVE_TIME
      );
      timeElements.forEach(convertRelativeTimeElement);
    } catch (e) {}
  }

  function setupTooltipInteractionListeners() {
    document.body.addEventListener("mouseover", (event) => {
      const targetSpan = event.target.closest(
        DomQuerySelectors.PROCESSED_TIME_SPAN
      );
      if (targetSpan) {
        displayTooltipNearElement(targetSpan);
      }
    });

    document.body.addEventListener("mouseout", (event) => {
      const targetSpan = event.target.closest(
        DomQuerySelectors.PROCESSED_TIME_SPAN
      );
      if (
        targetSpan &&
        (!event.relatedTarget ||
          !tooltipContainerElement?.contains(event.relatedTarget))
      ) {
        hideTooltip();
      }
    });

    document.body.addEventListener(
      "focusin",
      (event) => {
        const targetSpan = event.target.closest(
          DomQuerySelectors.PROCESSED_TIME_SPAN
        );
        if (targetSpan) {
          displayTooltipNearElement(targetSpan);
        }
      },
      true
    );

    document.body.addEventListener(
      "focusout",
      (event) => {
        const targetSpan = event.target.closest(
          DomQuerySelectors.PROCESSED_TIME_SPAN
        );
        if (targetSpan) {
          hideTooltip();
        }
      },
      true
    );
  }

  function startObservingDomMutations() {
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              if (
                addedNode.matches(DomQuerySelectors.UNPROCESSED_RELATIVE_TIME)
              ) {
                convertRelativeTimeElement(addedNode);
              } else if (
                addedNode.querySelector(
                  DomQuerySelectors.UNPROCESSED_RELATIVE_TIME
                )
              ) {
                const descendantElements = addedNode.querySelectorAll(
                  DomQuerySelectors.UNPROCESSED_RELATIVE_TIME
                );
                descendantElements.forEach(convertRelativeTimeElement);
              }
            }
          }
        }
      }
    });

    const observerConfiguration = {
      childList: true,
      subtree: true,
    };

    if (document.body) {
      try {
        mutationObserver.observe(document.body, observerConfiguration);
      } catch (e) {}
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          if (document.body) {
            try {
              mutationObserver.observe(document.body, observerConfiguration);
            } catch (e) {}
          }
        },
        { once: true }
      );
    }
  }

  function initializeTimeConverterScript() {
    currentUserLocale = detectBrowserLanguage();
    localizedText =
      UserInterfaceTextKeys[currentUserLocale] ||
      UserInterfaceTextKeys["en-US"];
    initializeDateTimeFormatters(currentUserLocale);
    injectDynamicStyles();
    ensureTooltipContainerExists();
    processRelativeTimesInNode(document.body);
    setupTooltipInteractionListeners();
    startObservingDomMutations();
  }

  if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
  ) {
    initializeTimeConverterScript();
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      initializeTimeConverterScript,
      { once: true }
    );
  }
})();

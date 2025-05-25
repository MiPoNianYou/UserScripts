// ==UserScript==
// @name               Github Time Format Converter
// @name:zh-CN         Github 时间格式转换
// @name:zh-TW         Github 時間格式轉換
// @description        Convert relative times on GitHub to absolute date and time
// @description:zh-CN  将 GitHub 页面上的相对时间转换为绝对日期和时间
// @description:zh-TW  將 GitHub 頁面上的相對時間轉換成絕對日期與時間
// @version            1.2.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/Github-Time-Format-Converter-Icon.svg
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

  const Config = {
    SCRIPT_SETTINGS: {
      TOOLTIP_VERTICAL_OFFSET: 5,
      VIEWPORT_EDGE_MARGIN: 5,
      TRANSITION_DURATION_MS: 100,
      UI_FONT_STACK: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      UI_FONT_STACK_MONO: "ui-monospace, SFMono-Regular, Menlo, monospace",
    },
    ELEMENT_IDS: {
      TOOLTIP_CONTAINER: "TimeConverterTooltipContainer",
    },
    CSS_CLASSES: {
      PROCESSED_TIME_ELEMENT: "time-converter-processed-element",
      TOOLTIP_IS_VISIBLE: "time-converter-tooltip--is-visible",
    },
    UI_TEXTS: {
      "zh-CN": {
        INVALID_DATE_STRING: "无效日期",
      },
      "zh-TW": {
        INVALID_DATE_STRING: "無效日期",
      },
      "en-US": {
        INVALID_DATE_STRING: "Invalid Date",
      },
    },
    DOM_SELECTORS: {
      RELATIVE_TIME: `relative-time:not(.${"time-converter-processed-element"})`,
      PROCESSED_TIME_SPAN: `span.${"time-converter-processed-element"}[data-tooltip-time]`,
    },
  };
  Config.DOM_SELECTORS.RELATIVE_TIME = `relative-time:not(.${Config.CSS_CLASSES.PROCESSED_TIME_ELEMENT})`;
  Config.DOM_SELECTORS.PROCESSED_TIME_SPAN = `span.${Config.CSS_CLASSES.PROCESSED_TIME_ELEMENT}[data-tooltip-time]`;

  const State = {
    currentUserLocale: "en-US",
    localizedText: Config.UI_TEXTS["en-US"],
    shortDateFormatter: null,
    tooltipTimeFormatter: null,

    initialize() {
      this.currentUserLocale = this.detectBrowserLanguage();
      this.localizedText =
        Config.UI_TEXTS[this.currentUserLocale] ||
        Config.UI_TEXTS["en-US"] ||
        {};
      this.initializeDateTimeFormatters(this.currentUserLocale);
    },

    detectBrowserLanguage() {
      const languages = navigator.languages || [navigator.language];
      for (const lang of languages) {
        const langLower = lang.toLowerCase();
        if (langLower === "zh-cn") return "zh-CN";
        if (
          langLower === "zh-tw" ||
          langLower === "zh-hk" ||
          langLower === "zh-mo" ||
          langLower === "zh-hant"
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
    },

    initializeDateTimeFormatters(locale) {
      try {
        this.shortDateFormatter = new Intl.DateTimeFormat(locale, {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        });

        this.tooltipTimeFormatter = new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      } catch (e) {
        this.shortDateFormatter = null;
        this.tooltipTimeFormatter = null;
      }
    },

    getLocalizedText(key) {
      return (
        this.localizedText[key] ||
        (Config.UI_TEXTS["en-US"]
          ? Config.UI_TEXTS["en-US"][key]
          : undefined) ||
        key.replace(/_/g, " ")
      );
    },
  };

  const UserInterface = {
    tooltipContainerElement: null,

    injectStyles() {
      const appleEaseOutStandard = "cubic-bezier(0, 0, 0.58, 1)";
      const transitionDuration = Config.SCRIPT_SETTINGS.TRANSITION_DURATION_MS;

      const cssStyles = `
        :root {
          --ctp-frappe-rosewater: rgb(242, 213, 207);
          --ctp-frappe-flamingo: rgb(238, 190, 190);
          --ctp-frappe-pink: rgb(244, 184, 228);
          --ctp-frappe-mauve: rgb(202, 158, 230);
          --ctp-frappe-red: rgb(231, 130, 132);
          --ctp-frappe-maroon: rgb(234, 153, 156);
          --ctp-frappe-peach: rgb(239, 159, 118);
          --ctp-frappe-yellow: rgb(229, 200, 144);
          --ctp-frappe-green: rgb(166, 209, 137);
          --ctp-frappe-teal: rgb(129, 200, 190);
          --ctp-frappe-sky: rgb(153, 209, 219);
          --ctp-frappe-sapphire: rgb(133, 193, 220);
          --ctp-frappe-blue: rgb(140, 170, 238);
          --ctp-frappe-lavender: rgb(186, 187, 241);
          --ctp-frappe-text: rgb(198, 208, 245);
          --ctp-frappe-subtext1: rgb(181, 191, 226);
          --ctp-frappe-subtext0: rgb(165, 173, 206);
          --ctp-frappe-overlay2: rgb(148, 156, 187);
          --ctp-frappe-overlay1: rgb(131, 139, 167);
          --ctp-frappe-overlay0: rgb(115, 121, 148);
          --ctp-frappe-surface2: rgb(98, 104, 128);
          --ctp-frappe-surface1: rgb(81, 87, 109);
          --ctp-frappe-surface0: rgb(65, 69, 89);
          --ctp-frappe-base: rgb(48, 52, 70);
          --ctp-frappe-mantle: rgb(41, 44, 60);
          --ctp-frappe-crust: rgb(35, 38, 52);

          --ctp-latte-rosewater: rgb(220, 138, 120);
          --ctp-latte-flamingo: rgb(221, 120, 120);
          --ctp-latte-pink: rgb(234, 118, 203);
          --ctp-latte-mauve: rgb(136, 57, 239);
          --ctp-latte-red: rgb(210, 15, 57);
          --ctp-latte-maroon: rgb(230, 69, 83);
          --ctp-latte-peach: rgb(254, 100, 11);
          --ctp-latte-yellow: rgb(223, 142, 29);
          --ctp-latte-green: rgb(64, 160, 43);
          --ctp-latte-teal: rgb(23, 146, 153);
          --ctp-latte-sky: rgb(4, 165, 229);
          --ctp-latte-sapphire: rgb(32, 159, 181);
          --ctp-latte-blue: rgb(30, 102, 245);
          --ctp-latte-lavender: rgb(114, 135, 253);
          --ctp-latte-text: rgb(76, 79, 105);
          --ctp-latte-subtext1: rgb(92, 95, 119);
          --ctp-latte-subtext0: rgb(108, 111, 133);
          --ctp-latte-overlay2: rgb(124, 127, 147);
          --ctp-latte-overlay1: rgb(140, 143, 161);
          --ctp-latte-overlay0: rgb(156, 160, 176);
          --ctp-latte-surface2: rgb(172, 176, 190);
          --ctp-latte-surface1: rgb(188, 192, 204);
          --ctp-latte-surface0: rgb(204, 208, 218);
          --ctp-latte-base: rgb(239, 241, 245);
          --ctp-latte-mantle: rgb(230, 233, 239);
          --ctp-latte-crust: rgb(220, 224, 232);

          --ctp-tooltip-bg-dark: rgb(from var(--ctp-frappe-mantle) r g b / 0.92);
          --ctp-tooltip-text-dark: var(--ctp-frappe-text);
          --ctp-tooltip-border-dark: rgb(from var(--ctp-frappe-surface2) r g b / 0.25);
          --ctp-tooltip-shadow-dark: 0 1px 3px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.2);

          --ctp-tooltip-bg-light: rgb(from var(--ctp-latte-mantle) r g b / 0.92);
          --ctp-tooltip-text-light: var(--ctp-latte-text);
          --ctp-tooltip-border-light: rgb(from var(--ctp-latte-surface2) r g b / 0.3);
          --ctp-tooltip-shadow-light: 0 1px 3px rgba(90, 90, 90, 0.08), 0 5px 10px rgba(90, 90, 90, 0.12);
        }

        #${Config.ELEMENT_IDS.TOOLTIP_CONTAINER} {
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
          font-family: ${Config.SCRIPT_SETTINGS.UI_FONT_STACK_MONO};
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          transition: opacity ${transitionDuration}ms ${appleEaseOutStandard},
                      visibility ${transitionDuration}ms ${appleEaseOutStandard};

          background-color: var(--ctp-tooltip-bg-dark);
          color: var(--ctp-tooltip-text-dark);
          border: 1px solid var(--ctp-tooltip-border-dark);
          box-shadow: var(--ctp-tooltip-shadow-dark);
        }

        #${Config.ELEMENT_IDS.TOOLTIP_CONTAINER}.${Config.CSS_CLASSES.TOOLTIP_IS_VISIBLE} {
          opacity: 1;
          visibility: visible;
        }

        .${Config.CSS_CLASSES.PROCESSED_TIME_ELEMENT}[data-tooltip-time] {
          display: inline-block;
          vertical-align: baseline;
          font-family: ${Config.SCRIPT_SETTINGS.UI_FONT_STACK_MONO};
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
          #${Config.ELEMENT_IDS.TOOLTIP_CONTAINER} {
            background-color: var(--ctp-tooltip-bg-light);
            color: var(--ctp-tooltip-text-light);
            border: 1px solid var(--ctp-tooltip-border-light);
            box-shadow: var(--ctp-tooltip-shadow-light);
          }
        }
      `;
      try {
        GM_addStyle(cssStyles);
      } catch (e) {}
    },

    ensureTooltipContainer() {
      this.tooltipContainerElement = document.getElementById(
        Config.ELEMENT_IDS.TOOLTIP_CONTAINER
      );
      if (!this.tooltipContainerElement && document.body) {
        this.tooltipContainerElement = document.createElement("div");
        this.tooltipContainerElement.id = Config.ELEMENT_IDS.TOOLTIP_CONTAINER;
        this.tooltipContainerElement.setAttribute("role", "tooltip");
        this.tooltipContainerElement.setAttribute("aria-hidden", "true");
        try {
          document.body.appendChild(this.tooltipContainerElement);
        } catch (e) {}
      }
      return this.tooltipContainerElement;
    },

    displayTooltip(targetElement) {
      const tooltipTime = targetElement.dataset.tooltipTime;
      this.ensureTooltipContainer();

      if (!tooltipTime || !this.tooltipContainerElement) return;

      this.tooltipContainerElement.textContent = tooltipTime;
      this.tooltipContainerElement.setAttribute("aria-hidden", "false");

      const targetRect = targetElement.getBoundingClientRect();
      this.tooltipContainerElement.classList.add(
        Config.CSS_CLASSES.TOOLTIP_IS_VISIBLE
      );

      this.tooltipContainerElement.style.left = "-9999px";
      this.tooltipContainerElement.style.top = "-9999px";
      this.tooltipContainerElement.style.visibility = "hidden";

      requestAnimationFrame(() => {
        if (!this.tooltipContainerElement || !targetElement.isConnected) {
          this.hideTooltip();
          return;
        }

        const tooltipWidth = this.tooltipContainerElement.offsetWidth;
        const tooltipHeight = this.tooltipContainerElement.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const verticalOffset = Config.SCRIPT_SETTINGS.TOOLTIP_VERTICAL_OFFSET;
        const margin = Config.SCRIPT_SETTINGS.VIEWPORT_EDGE_MARGIN;

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
          tooltipTop =
            spaceAbove > spaceBelow
              ? Math.max(
                  margin,
                  targetRect.top - tooltipHeight - verticalOffset
                )
              : Math.min(
                  viewportHeight - tooltipHeight - margin,
                  targetRect.bottom + verticalOffset
                );
          if (tooltipTop < margin) tooltipTop = margin;
        }

        this.tooltipContainerElement.style.left = `${tooltipLeft}px`;
        this.tooltipContainerElement.style.top = `${tooltipTop}px`;
        this.tooltipContainerElement.style.visibility = "visible";
      });
    },

    hideTooltip() {
      if (this.tooltipContainerElement) {
        this.tooltipContainerElement.classList.remove(
          Config.CSS_CLASSES.TOOLTIP_IS_VISIBLE
        );
        this.tooltipContainerElement.setAttribute("aria-hidden", "true");
      }
    },
  };

  const TimeConverter = {
    formatDateTime(dateSource, formatType) {
      const dateObject =
        typeof dateSource === "string" ? new Date(dateSource) : dateSource;
      if (isNaN(dateObject.getTime())) {
        return State.getLocalizedText("INVALID_DATE_STRING");
      }

      let formatter;
      if (formatType === "shortDate") {
        formatter = State.shortDateFormatter;
      } else if (formatType === "tooltipTime") {
        formatter = State.tooltipTimeFormatter;
      } else {
        formatter = State.shortDateFormatter;
      }

      if (!formatter) {
        const year = String(dateObject.getFullYear()).slice(-2);
        const month = String(dateObject.getMonth() + 1).padStart(2, "0");
        const day = String(dateObject.getDate()).padStart(2, "0");
        const hours = String(dateObject.getHours()).padStart(2, "0");
        const minutes = String(dateObject.getMinutes()).padStart(2, "0");
        const seconds = String(dateObject.getSeconds()).padStart(2, "0");

        if (formatType === "shortDate") {
          return `${year}-${month}-${day}`;
        } else if (formatType === "tooltipTime") {
          return `${hours}:${minutes}:${seconds}`;
        }
        return `${year}-${month}-${day}`;
      }

      try {
        let formattedString = formatter.format(dateObject);
        formattedString = formattedString.replace(/[/]/g, "-");
        if (formatType !== "shortDate" && formatType !== "tooltipTime") {
          formattedString = formattedString.replace(", ", " ");
        }
        return formattedString;
      } catch (e) {
        return State.getLocalizedText("INVALID_DATE_STRING");
      }
    },

    convertElement(element) {
      if (
        !element ||
        !(element instanceof Element) ||
        element.classList.contains(Config.CSS_CLASSES.PROCESSED_TIME_ELEMENT)
      ) {
        return;
      }

      const dateTimeAttribute = element.getAttribute("datetime");
      if (!dateTimeAttribute) {
        element.classList.add(Config.CSS_CLASSES.PROCESSED_TIME_ELEMENT);
        return;
      }

      try {
        const displayDateText = this.formatDateTime(
          dateTimeAttribute,
          "shortDate"
        );
        const tooltipTimeText = this.formatDateTime(
          dateTimeAttribute,
          "tooltipTime"
        );

        if (
          displayDateText === State.getLocalizedText("INVALID_DATE_STRING") ||
          tooltipTimeText === State.getLocalizedText("INVALID_DATE_STRING")
        ) {
          element.classList.add(Config.CSS_CLASSES.PROCESSED_TIME_ELEMENT);
          return;
        }

        const replacementSpan = document.createElement("span");
        replacementSpan.textContent = displayDateText;
        replacementSpan.dataset.tooltipTime = tooltipTimeText;
        replacementSpan.classList.add(
          Config.CSS_CLASSES.PROCESSED_TIME_ELEMENT
        );

        if (element.parentNode) {
          element.parentNode.replaceChild(replacementSpan, element);
        } else {
          element.classList.add(Config.CSS_CLASSES.PROCESSED_TIME_ELEMENT);
        }
      } catch (error) {
        element.classList.add(Config.CSS_CLASSES.PROCESSED_TIME_ELEMENT);
      }
    },

    processAllInNode(targetNode = document.body) {
      if (!targetNode || typeof targetNode.querySelectorAll !== "function")
        return;
      try {
        const timeElements = targetNode.querySelectorAll(
          Config.DOM_SELECTORS.RELATIVE_TIME
        );
        timeElements.forEach(this.convertElement.bind(this));
      } catch (e) {}
    },
  };

  const EventManager = {
    domMutationObserver: null,

    init() {
      this.setupTooltipListeners();
      this.startDomObserver();
    },

    setupTooltipListeners() {
      document.body.addEventListener("mouseover", (event) => {
        const targetSpan = event.target.closest(
          Config.DOM_SELECTORS.PROCESSED_TIME_SPAN
        );
        if (targetSpan) UserInterface.displayTooltip(targetSpan);
      });
      document.body.addEventListener("mouseout", (event) => {
        const targetSpan = event.target.closest(
          Config.DOM_SELECTORS.PROCESSED_TIME_SPAN
        );
        if (
          targetSpan &&
          (!event.relatedTarget ||
            !UserInterface.tooltipContainerElement?.contains(
              event.relatedTarget
            ))
        ) {
          UserInterface.hideTooltip();
        }
      });
      document.body.addEventListener(
        "focusin",
        (event) => {
          const targetSpan = event.target.closest(
            Config.DOM_SELECTORS.PROCESSED_TIME_SPAN
          );
          if (targetSpan) UserInterface.displayTooltip(targetSpan);
        },
        true
      );
      document.body.addEventListener(
        "focusout",
        (event) => {
          const targetSpan = event.target.closest(
            Config.DOM_SELECTORS.PROCESSED_TIME_SPAN
          );
          if (targetSpan) UserInterface.hideTooltip();
        },
        true
      );
    },

    handleDomMutation(mutations) {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              if (addedNode.matches(Config.DOM_SELECTORS.RELATIVE_TIME)) {
                TimeConverter.convertElement(addedNode);
              } else if (
                addedNode.querySelector(Config.DOM_SELECTORS.RELATIVE_TIME)
              ) {
                const descendantElements = addedNode.querySelectorAll(
                  Config.DOM_SELECTORS.RELATIVE_TIME
                );
                descendantElements.forEach(
                  TimeConverter.convertElement.bind(TimeConverter)
                );
              }
            }
          }
        }
      }
    },

    startDomObserver() {
      if (this.domMutationObserver) return;
      this.domMutationObserver = new MutationObserver(
        this.handleDomMutation.bind(this)
      );
      const observerConfiguration = { childList: true, subtree: true };

      if (document.body) {
        try {
          this.domMutationObserver.observe(
            document.body,
            observerConfiguration
          );
        } catch (e) {}
      } else {
        document.addEventListener(
          "DOMContentLoaded",
          () => {
            if (document.body) {
              try {
                this.domMutationObserver.observe(
                  document.body,
                  observerConfiguration
                );
              } catch (e) {}
            }
          },
          { once: true }
        );
      }
    },
  };

  const ScriptManager = {
    init() {
      try {
        State.initialize();
        UserInterface.injectStyles();
        UserInterface.ensureTooltipContainer();
        TimeConverter.processAllInNode(
          document.body || document.documentElement
        );
        EventManager.init();
      } catch (error) {}
    },
  };

  if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
  ) {
    ScriptManager.init();
  } else {
    document.addEventListener("DOMContentLoaded", () => ScriptManager.init(), {
      once: true,
    });
  }
})();

// ==UserScript==
// @name               DuckDuckGo Enhancer
// @name:zh-CN         DuckDuckGo 增强
// @name:zh-TW         DuckDuckGo 增強
// @description        Enhance Your DuckDuckGo Experience - Double-Click To Top / Instant Cross-Engine Search / Focused Keyword Highlighting / Dual-Column Results View / Quick Category Navigation / Search Syntax Helper / One-Click Link Copy / Powerful Keyboard Shortcuts
// @description:zh-CN  增强 DuckDuckGo 浏览体验 - 双点即达页首/跨引擎即刻搜/聚焦搜索文本/分栏结果视图/快捷类别导航/搜索语法助手/网链一键拷贝/全功能快捷键
// @description:zh-TW  增强 DuckDuckGo 瀏覽體驗 - 雙點即達頁首/跨引擎即刻搜/聚焦搜尋文字/分欄結果視圖/快速類別導覽/搜尋語法助手/網址一鍵拷貝/全功能快捷鍵
// @version            1.3.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/DuckDuckGoEnhancerIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              https://duckduckgo.com/*
// @grant              GM_addStyle
// @grant              GM_setValue
// @grant              GM_getValue
// ==/UserScript==

(function () {
  "use strict";

  const UI_SETTINGS = {
    SCROLL_TOP_TRIGGER_RATIO: 0.2,
    DOM_OBSERVER_DELAY_MS: 1000,
    COPY_FEEDBACK_DURATION_MS: 1500,
    UI_FONT_STACK: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    ANIMATION_DURATION_MS: 200,
    ANIMATION_EASING_STANDARD: "cubic-bezier(0, 0, 0.58, 1)",
    ANIMATION_EASING_APPLE_SMOOTH_OUT: "cubic-bezier(0.25, 1, 0.5, 1)",
    BUTTON_TRANSFORM_DURATION: "0.1s",
  };

  const ELEMENT_SELECTORS = {
    INTERACTIVE_ELEMENT:
      'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])',
    SEARCH_FORM: "#search_form",
    SEARCH_INPUT: "#search_form_input",
    HEADER_SEARCH_AREA: "div.header__content.header__search",
    HEADER_ACTIONS: ".header--aside",
    CONTENT_WRAPPER: "#web_content_wrapper",
    LAYOUT_CONTAINER: "#react-layout > div > div",
    MAINLINE_SECTION: 'section[data-testid="mainline"]',
    SIDEBAR: 'section[data-testid="sidebar"]',
    RESULTS_CONTAINER: "ol.react-results--main",
    WEB_RESULT: 'article[data-testid="result"]',
    WEB_RESULT_OPTIONS_CONTAINER: "div.OHr0VX9IuNcv6iakvT6A",
    WEB_RESULT_OPTIONS_BUTTON: "button.cxQwADb9kt3UnKwcXKat",
    WEB_RESULT_TITLE_LINK: 'h2 a[data-testid="result-title-a"]',
    WEB_RESULT_TITLE_SPAN: 'h2 a[data-testid="result-title-a"] span',
    WEB_RESULT_SNIPPET: 'div[data-result="snippet"] > div > span > span',
    WEB_RESULT_URL: 'a[data-testid="result-extras-url-link"] p span',
    IMAGE_RESULT: 'div[data-testid="zci-images"] figure',
    IMAGE_CAPTION: "figcaption p span",
    VIDEO_RESULT: 'div[data-testid="zci-videos"] article.O9Ipab51rBntYb0pwOQn',
    VIDEO_TITLE: "h2 span.kY2IgmnCmOGjharHErah",
    NEWS_RESULT: "article a.ksuAj6IYz34FJu0vGKNy",
    NEWS_TITLE: "h2.WctuDfRzXeUleKwpnBCx",
    NEWS_SNIPPET: "div.kY2IgmnCmOGjharHErah p",
    NAV_TAB: "#react-duckbar nav ul:first-of-type > li > a",
    PAGE_SEPARATOR_LI: "li._LX3Dolif_D4E_6W6Fbr",
  };

  const CSS_CLASSES = {
    PAGE_SEPARATOR_LI_OLD: "_LX3Dolif_D4E_6W6Fbr",
    ACTIVE_NAV_TAB: "SnptgjT2zdOhGYfNng6g",
    SEARCH_ENGINE_GROUP: "ddge-search-engine-group",
    SEARCH_ENGINE_BUTTON: "ddge-search-engine-button",
    SEARCH_ENGINE_ICON: "ddge-search-engine-icon",
    KEYWORD_HIGHLIGHT: "ddge-keyword-highlight",
    HIGHLIGHTING_DISABLED: "ddge-highlighting-disabled",
    COPY_LINK_BUTTON: "ddge-copy-link-button",
    COPY_LINK_ICON_WRAPPER: "ddge-copy-link-icon-wrapper",
    COPY_LINK_TEXT_LABEL_CLASS: "ddge-copy-link-text-label",
    COPY_LINK_BUTTON_COPIED: "ddge-copied",
    COPY_LINK_BUTTON_FAILED: "ddge-failed",
    SYNTAX_SHORTCUT_BUTTON: "ddge-syntax-shortcut-button",
    DUAL_COLUMN_LAYOUT: "ddge-dual-column-layout",
    DUAL_COLUMN_ACTIVE: "ddge-dual-column-active",
    TOGGLE_BUTTON_WRAPPER: "ddge-toggle-wrapper",
    TOGGLE_BUTTON: "ddge-toggle-button",
    MATERIAL_BUTTON: "ddge-material-button",
  };

  const ELEMENT_IDS = {
    HIGHLIGHT_TOGGLE_WRAPPER: "ddge-highlight-toggle-wrapper",
    SYNTAX_SHORTCUTS_CONTAINER: "ddge-syntax-shortcuts-container",
    DUAL_COLUMN_TOGGLE_WRAPPER: "ddge-dual-column-toggle-wrapper",
  };

  const UI_STRINGS = {
    HIGHLIGHT_TOGGLE_LABEL: "文本聚焦",
    DUAL_COLUMN_TOGGLE_LABEL: "分栏视图",
    COPY_BUTTON_DEFAULT_ARIA_LABEL: "拷贝此页网址",
    COPY_BUTTON_SUCCESS_ARIA_LABEL: "拷贝完成",
    COPY_BUTTON_FAILURE_ARIA_LABEL: "拷贝失败",
    COPY_BUTTON_TEXT_LABEL: "拷贝当前网链",
    COPY_BUTTON_ICON_SVG: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 82.1289 135.303"><g><rect height="135.303" opacity="0" width="82.1289" x="0" y="0"/><path d="M82.1289 34.6191L82.1289 108.643C82.1289 118.896 77.0996 123.975 66.9922 123.975L15.1367 123.975C5.0293 123.975 0 118.896 0 108.643L0 34.6191C0 24.3652 5.0293 19.2871 15.1367 19.2871L15.7831 19.2871C15.742 19.6841 15.7227 20.0918 15.7227 20.5078L15.7227 25.6348C15.7227 26.1545 15.7533 26.6614 15.8239 27.1484L15.5273 27.1484C10.4492 27.1484 7.86133 29.8828 7.86133 34.7168L7.86133 108.545C7.86133 113.428 10.4492 116.113 15.5273 116.113L66.6016 116.113C71.6797 116.113 74.2676 113.428 74.2676 108.545L74.2676 34.7168C74.2676 29.8828 71.6797 27.1484 66.6016 27.1484L66.305 27.1484C66.3756 26.6614 66.4062 26.1545 66.4062 25.6348L66.4062 20.5078C66.4062 20.0918 66.3869 19.6841 66.3458 19.2871L66.9922 19.2871C77.0996 19.2871 82.1289 24.3652 82.1289 34.6191Z" fill="currentColor"/><path d="M25.9766 30.4688L56.1523 30.4688C58.9844 30.4688 60.6934 28.6621 60.6934 25.6348L60.6934 20.5078C60.6934 17.4805 58.9844 15.6738 56.1523 15.6738L51.6602 15.6738C51.3184 10.1562 46.7285 5.66406 41.0645 5.66406C35.4004 5.66406 30.8105 10.1562 30.4688 15.6738L25.9766 15.6738C23.1445 15.6738 21.4355 17.4805 21.4355 20.5078L21.4355 25.6348C21.4355 28.6621 23.1445 30.4688 25.9766 30.4688ZM41.0645 20.3125C38.7207 20.3125 36.8164 18.3594 36.8164 16.0645C36.8164 13.6719 38.7207 11.7676 41.0645 11.7676C43.4082 11.7676 45.3125 13.6719 45.3125 16.0645C45.3125 18.3594 43.4082 20.3125 41.0645 20.3125Z" fill="currentColor"/><path d="M19.5312 93.3105L41.2109 93.3105C42.8711 93.3105 44.2383 91.9434 44.2383 90.2832C44.2383 88.623 42.9199 87.2559 41.2109 87.2559L19.5312 87.2559C17.8223 87.2559 16.4551 88.623 16.4551 90.2832C16.4551 91.9434 17.8711 93.3105 19.5312 93.3105Z" fill="currentColor"/><path d="M19.5312 75.0488L62.5977 75.0488C64.3066 75.0488 65.6738 73.6816 65.6738 71.9727C65.6738 70.3125 64.3066 68.9941 62.5977 68.9941L19.5312 68.9941C17.8223 68.9941 16.4551 70.3125 16.4551 71.9727C16.4551 73.6816 17.8223 75.0488 19.5312 75.0488Z" fill="currentColor"/><path d="M19.5312 57.7148L62.5977 57.7148C64.2578 57.7148 65.6738 56.3477 65.6738 54.6875C65.6738 53.0273 64.2578 51.6113 62.5977 51.6113L19.5312 51.6113C17.8711 51.6113 16.4551 53.0273 16.4551 54.6875C16.4551 56.3477 17.8711 57.7148 19.5312 57.7148Z" fill="currentColor"/></g></svg>`,
    COPY_BUTTON_SUCCESS_ICON_SVG: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 84.1309 86.1816"><g><rect height="86.1816" opacity="0" width="84.1309" x="0" y="0"/><path d="M31.8359 86.1816C33.9355 86.1816 35.5957 85.2539 36.7676 83.4473L82.9102 10.791C83.7891 9.375 84.1309 8.30078 84.1309 7.17773C84.1309 4.49219 82.373 2.73438 79.6875 2.73438C77.7344 2.73438 76.6602 3.36914 75.4883 5.22461L31.6406 75.0977L8.88672 45.3125C7.66602 43.6035 6.44531 42.9199 4.6875 42.9199C1.9043 42.9199 0 44.8242 0 47.5098C0 48.6328 0.488281 49.9023 1.41602 51.0742L26.7578 83.3496C28.2227 85.2539 29.7363 86.1816 31.8359 86.1816Z" fill="currentColor"/></g></svg>`,
    COPY_BUTTON_FAILURE_ICON_SVG: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 77.4293 77.4782"><g><rect height="77.4782" opacity="0" width="77.4293" x="0" y="0"/><path d="M1.26349 76.2147C2.97248 77.8748 5.80451 77.8748 7.46467 76.2147L38.7147 44.9647L69.9647 76.2147C71.6248 77.8748 74.5057 77.9237 76.1658 76.2147C77.826 74.5057 77.826 71.7225 76.1658 70.0623L44.9158 38.7635L76.1658 7.51349C77.826 5.85334 77.8748 3.02131 76.1658 1.36115C74.4569-0.347834 71.6248-0.347834 69.9647 1.36115L38.7147 32.6112L7.46467 1.36115C5.80451-0.347834 2.92365-0.396662 1.26349 1.36115C-0.396662 3.07013-0.396662 5.85334 1.26349 7.51349L32.5135 38.7635L1.26349 70.0623C-0.396662 71.7225-0.44549 74.5545 1.26349 76.2147Z" fill="currentColor"/></g></svg>`,
    EXCLUDED_NAV_TAB_TEXT: "地图",
  };

  const STORAGE_KEYS_DDGE = {
    HIGHLIGHT_ENABLED: "ddge_highlightEnabled",
    DUAL_COLUMN_ENABLED: "ddge_dualColumnEnabled",
  };

  const FEATURE_CONFIGS = {
    HIGHLIGHT_SELECTORS: {
      web: {
        itemSelector: ELEMENT_SELECTORS.WEB_RESULT,
        targetSelectors: [
          ELEMENT_SELECTORS.WEB_RESULT_TITLE_SPAN,
          ELEMENT_SELECTORS.WEB_RESULT_SNIPPET,
        ],
      },
      images: {
        itemSelector: ELEMENT_SELECTORS.IMAGE_RESULT,
        targetSelectors: [ELEMENT_SELECTORS.IMAGE_CAPTION],
      },
      videos: {
        itemSelector: ELEMENT_SELECTORS.VIDEO_RESULT,
        targetSelectors: [ELEMENT_SELECTORS.VIDEO_TITLE],
      },
      news: {
        itemSelector: ELEMENT_SELECTORS.NEWS_RESULT,
        targetSelectors: [
          ELEMENT_SELECTORS.NEWS_TITLE,
          ELEMENT_SELECTORS.NEWS_SNIPPET,
        ],
      },
    },
    ALTERNATE_SEARCH_ENGINES: [
      {
        id: "google",
        name: "Google",
        urlTemplate: "https://www.google.com/search?q=",
        iconHost: "www.google.com",
        shortcutKey: "z",
      },
      {
        id: "bing",
        name: "Bing",
        urlTemplate: "https://www.bing.com/search?q=",
        iconHost: "www.bing.com",
        shortcutKey: "x",
      },
      {
        id: "baidu",
        name: "Baidu",
        urlTemplate: "https://www.baidu.com/s?wd=",
        iconHost: "www.baidu.com",
        shortcutKey: "c",
      },
    ],
    SYNTAX_SHORTCUTS: [
      { id: "exact", text: "精确搜索", syntax: '""', action: applyExactPhrase },
      { id: "exclude", text: "搜索排除", syntax: "-", action: applyExclusion },
      { id: "site", text: "限定站点", syntax: "site:", action: appendOperator },
      {
        id: "filetype",
        text: "筛选文件",
        syntax: "filetype:",
        action: appendOperator,
      },
    ],
  };

  let isHighlightActive = GM_getValue(
    STORAGE_KEYS_DDGE.HIGHLIGHT_ENABLED,
    false
  );
  let isDualColumnActive = GM_getValue(
    STORAGE_KEYS_DDGE.DUAL_COLUMN_ENABLED,
    false
  );

  let currentKeybindingConfig = {
    MODIFIERS: {
      CHARACTER_DISPLAY: "Alt / Ctrl",
      EVENT_PROPERTY: "altKey",
    },
    SHORTCUTS: [
      {
        id: "toggleHighlight",
        key: "h",
        description: "切换文本聚焦",
        isSpecialAction: true,
        actionIdentifier: "handleHighlightToggle",
      },
      {
        id: "toggleDualColumn",
        key: "d",
        description: "切换分栏视图",
        isSpecialAction: true,
        actionIdentifier: "handleDualColumnToggle",
      },
      {
        id: "navigateToNextTab",
        key: "=",
        description: "导航到下一个标签页",
        isSpecialAction: true,
        actionIdentifier: "navigateTabsNext",
      },
      {
        id: "navigateToPrevTab",
        key: "-",
        description: "导航到上一个标签页",
        isSpecialAction: true,
        actionIdentifier: "navigateTabsPrev",
      },
    ],
  };

  FEATURE_CONFIGS.ALTERNATE_SEARCH_ENGINES.forEach((engine) => {
    if (engine.shortcutKey) {
      currentKeybindingConfig.SHORTCUTS.push({
        id: `search_${engine.id}`,
        key: engine.shortcutKey,
        description: `转至 ${engine.name} 搜索`,
        isSpecialAction: true,
        actionIdentifier: `triggerSearchEngine_${engine.id}`,
      });
    }
  });

  let domObserver = null;
  let debouncedRunPageEnhancements = null;
  let keydownEventListener = null;

  function injectUserInterfaceStyles() {
    const styles = `
      :root {
        --ctp-frappe-rosewater: #f2d5cf;
        --ctp-frappe-flamingo: #eebebe;
        --ctp-frappe-pink: #f4b8e4;
        --ctp-frappe-mauve: #ca9ee6;
        --ctp-frappe-red: #e78284;
        --ctp-frappe-maroon: #ea999c;
        --ctp-frappe-peach: #ef9f76;
        --ctp-frappe-yellow: #e5c890;
        --ctp-frappe-green: #a6d189;
        --ctp-frappe-teal: #81c8be;
        --ctp-frappe-sky: #99d1db;
        --ctp-frappe-sapphire: #85c1dc;
        --ctp-frappe-blue: #8caaee;
        --ctp-frappe-lavender: #babbf1;
        --ctp-frappe-text: #c6d0f5;
        --ctp-frappe-subtext1: #b5bfe2;
        --ctp-frappe-subtext0: #a5adce;
        --ctp-frappe-overlay2: #949cbb;
        --ctp-frappe-overlay1: #838ba7;
        --ctp-frappe-overlay0: #737994;
        --ctp-frappe-surface2: #626880;
        --ctp-frappe-surface1: #51576d;
        --ctp-frappe-surface0: #414559;
        --ctp-frappe-base: #303446;
        --ctp-frappe-mantle: #292c3c;
        --ctp-frappe-crust: #232634;
        --ctp-frappe-crust-rgb: 35, 38, 52;
        --ctp-frappe-yellow-rgb: 229, 200, 144;
        --ctp-frappe-green-rgb: 166, 209, 137;
        --ctp-frappe-red-rgb: 231, 130, 132;
        --ctp-frappe-surface0-rgb: 65, 69, 89;
        --ctp-frappe-surface1-rgb: 81, 87, 109;
        --ctp-frappe-overlay0-rgb: 115, 121, 148;
        --ctp-frappe-blue-rgb: 140, 170, 238;

        --ddge-text-primary: var(--ctp-frappe-text);
        --ddge-text-secondary: var(--ctp-frappe-subtext0);
        --ddge-bg-surface0: var(--ctp-frappe-surface0);
        --ddge-bg-surface1: var(--ctp-frappe-surface1);
        --ddge-bg-surface2: var(--ctp-frappe-surface2);
        --ddge-bg-base: var(--ctp-frappe-base);
        --ddge-border-color: rgba(var(--ctp-frappe-surface1-rgb), 0.4);
        --ddge-border-color-stronger: rgba(var(--ctp-frappe-overlay0-rgb), 0.6);
        --ddge-button-bg: rgba(var(--ctp-frappe-surface0-rgb), 0.8);
        --ddge-button-hover-bg: rgba(var(--ctp-frappe-surface1-rgb), 0.85);
        --ddge-button-active-bg: rgba(var(--ctp-frappe-surface2-rgb), 0.9);
        --ddge-button-border: var(--ddge-border-color);
        --ddge-button-text: var(--ddge-text-primary);
        --ddge-button-shadow-hover: 0 0 10px 1px rgba(var(--ctp-frappe-blue-rgb), 0.15);
        --ddge-highlight-bg: rgba(var(--ctp-frappe-yellow-rgb), 0.3);
        --ddge-copy-button-success-bg: rgba(var(--ctp-frappe-green-rgb), 0.85);
        --ddge-copy-button-success-border: var(--ctp-frappe-green);
        --ddge-copy-button-fail-bg: rgba(var(--ctp-frappe-red-rgb), 0.85);
        --ddge-copy-button-fail-border: var(--ctp-frappe-red);
        --ddge-copy-button-default-color: var(--ctp-frappe-overlay1);
        --ddge-copy-button-hover-color: var(--ctp-frappe-blue);
        --ddge-copy-button-copied-color: var(--ctp-frappe-green);
        --ddge-copy-button-failed-color: var(--ctp-frappe-red);
        --ddge-dual-col-result-bg: rgba(41, 44, 60, 0.2);
        --ddge-dual-col-result-border: rgba(var(--ctp-frappe-surface0-rgb), 0.3);
        --ddge-toggle-button-disabled-opacity: 0.5;
        --ddge-shadow-color: rgba(var(--ctp-frappe-crust-rgb), 0.1);
      }

      .${CSS_CLASSES.SEARCH_ENGINE_GROUP} {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        max-width: 800px;
        margin: 12px auto;
        padding: 0 10px;
      }
      .${CSS_CLASSES.MATERIAL_BUTTON} {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 7px 14px;
        border: 1px solid var(--ddge-button-border);
        border-radius: 8px;
        box-sizing: border-box;
        font-family: ${UI_SETTINGS.UI_FONT_STACK};
        font-size: 13.5px;
        font-weight: 500;
        color: var(--ddge-button-text);
        text-align: center;
        background-color: var(--ddge-button-bg);
        backdrop-filter: blur(8px);
        cursor: pointer;
        transition: background-color ${UI_SETTINGS.ANIMATION_DURATION_MS}ms ${UI_SETTINGS.ANIMATION_EASING_STANDARD},
                    border-color ${UI_SETTINGS.ANIMATION_DURATION_MS}ms ${UI_SETTINGS.ANIMATION_EASING_STANDARD},
                    transform ${UI_SETTINGS.BUTTON_TRANSFORM_DURATION} ${UI_SETTINGS.ANIMATION_EASING_STANDARD},
                    box-shadow ${UI_SETTINGS.ANIMATION_DURATION_MS}ms ${UI_SETTINGS.ANIMATION_EASING_STANDARD};
        box-shadow: 0 1px 2px var(--ddge-shadow-color);
      }
      .${CSS_CLASSES.MATERIAL_BUTTON}:hover {
        background-color: var(--ddge-button-hover-bg);
        border-color: var(--ddge-border-color-stronger);
        transform: translateY(-1px);
        box-shadow: var(--ddge-button-shadow-hover);
      }
      .${CSS_CLASSES.MATERIAL_BUTTON}:active {
        background-color: var(--ddge-button-active-bg);
        transform: translateY(0px) scale(0.98);
        box-shadow: none;
      }

      .${CSS_CLASSES.SEARCH_ENGINE_BUTTON} {
         flex-grow: 1;
         flex-basis: 110px;
         flex-shrink: 0;
         min-width: 110px;
      }
      .${CSS_CLASSES.SEARCH_ENGINE_ICON} {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        vertical-align: middle;
      }
      #${ELEMENT_IDS.SYNTAX_SHORTCUTS_CONTAINER} {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 10px;
      }
      .${CSS_CLASSES.KEYWORD_HIGHLIGHT} {
        padding: 0 2px;
        border-radius: 3px;
        color: inherit;
        background-color: var(--ddge-highlight-bg);
        box-shadow: none;
      }
      .${CSS_CLASSES.TOGGLE_BUTTON_WRAPPER} {
        display: inline-flex;
        align-items: center;
        margin-right: 10px;
        vertical-align: middle;
      }
      .${CSS_CLASSES.TOGGLE_BUTTON} {
        padding: 5px 12px;
        font-size: 13px;
        line-height: 1.2;
        opacity: 1;
        transition: opacity ${UI_SETTINGS.ANIMATION_DURATION_MS}ms ${UI_SETTINGS.ANIMATION_EASING_STANDARD};
      }

      #${ELEMENT_IDS.HIGHLIGHT_TOGGLE_WRAPPER}.${CSS_CLASSES.HIGHLIGHTING_DISABLED} > button,
      #${ELEMENT_IDS.DUAL_COLUMN_TOGGLE_WRAPPER}:not(.${CSS_CLASSES.DUAL_COLUMN_ACTIVE}) > button {
        opacity: var(--ddge-toggle-button-disabled-opacity);
      }

      ${ELEMENT_SELECTORS.WEB_RESULT} {
        position: relative;
      }
      ${ELEMENT_SELECTORS.WEB_RESULT_OPTIONS_CONTAINER} {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: flex-end;
      }
      .${CSS_CLASSES.COPY_LINK_BUTTON} {
        position: relative;
        top: 0px;
        display: inline-flex;
        align-items: center;
        height: 28px;
        padding: 0;
        margin-right: 4px;
        border: none;
        border-radius: 6px;
        background-color: transparent;
        color: var(--ddge-copy-button-default-color);
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        overflow: hidden;
        transition: opacity 0.2s ease-in-out,
                    background-color 0.2s ${UI_SETTINGS.ANIMATION_EASING_STANDARD},
                    color 0.15s ${UI_SETTINGS.ANIMATION_EASING_STANDARD};
      }
      ${ELEMENT_SELECTORS.WEB_RESULT}:hover .${CSS_CLASSES.COPY_LINK_BUTTON} {
        opacity: 1;
        pointer-events: auto;
      }

      .${CSS_CLASSES.COPY_LINK_ICON_WRAPPER} {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 7px;
        transition: transform 0.25s ${UI_SETTINGS.ANIMATION_EASING_STANDARD};
        z-index: 1;
      }
      .${CSS_CLASSES.COPY_LINK_ICON_WRAPPER} svg {
        width: 14px;
        height: 14px;
        display: block;
        fill: currentColor;
      }

      .${CSS_CLASSES.COPY_LINK_TEXT_LABEL_CLASS} {
        opacity: 0;
        transform: translateX(5px)  scaleX(0.8);
        transform-origin: left center;
        white-space: nowrap;
        margin-left: 0px;
        padding-right: 0px;
        font-size: 10.5px;
        font-weight: 500;
        line-height: 28px;
        max-width: 0;
        overflow: hidden;
        transition: max-width 0.25s ${UI_SETTINGS.ANIMATION_EASING_STANDARD} 0.05s,
                    opacity 0.2s ${UI_SETTINGS.ANIMATION_EASING_STANDARD} 0.1s,
                    transform 0.25s ${UI_SETTINGS.ANIMATION_EASING_APPLE_SMOOTH_OUT} 0.05s,
                    margin-left 0.25s ${UI_SETTINGS.ANIMATION_EASING_STANDARD} 0.05s,
                    padding-right 0.25s ${UI_SETTINGS.ANIMATION_EASING_STANDARD} 0.05s;
        pointer-events: none;
      }

      .${CSS_CLASSES.COPY_LINK_BUTTON}:hover {
        background-color: var(--ddge-bg-surface0);
        color: var(--ddge-copy-button-hover-color);
      }
      .${CSS_CLASSES.COPY_LINK_BUTTON}:hover .${CSS_CLASSES.COPY_LINK_ICON_WRAPPER} {
        transform: translateX(-2px);
      }
      .${CSS_CLASSES.COPY_LINK_BUTTON}:hover .${CSS_CLASSES.COPY_LINK_TEXT_LABEL_CLASS} {
        opacity: 1;
        transform: translateX(0) scaleX(1);
        max-width: 120px;
        margin-left: -2px;
        padding-right: 7px;
        pointer-events: auto;
      }

      .${CSS_CLASSES.COPY_LINK_BUTTON}:active .${CSS_CLASSES.COPY_LINK_ICON_WRAPPER} {
          transform: scale(0.9) translateX(-2px);
      }
       .${CSS_CLASSES.COPY_LINK_BUTTON}:active .${CSS_CLASSES.COPY_LINK_TEXT_LABEL_CLASS}{
         transform: scaleX(1) translateX(0) scaleY(0.95);
      }

      .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_COPIED},
      .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_FAILED} {
          opacity: 1 !important;
          pointer-events: auto !important;
          background-color: var(--ddge-bg-surface0) !important;
          padding-right: 7px !important;
      }
      .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_COPIED} .${CSS_CLASSES.COPY_LINK_ICON_WRAPPER},
      .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_FAILED} .${CSS_CLASSES.COPY_LINK_ICON_WRAPPER} {
          transform: translateX(0) !important;
      }
       .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_COPIED} .${CSS_CLASSES.COPY_LINK_TEXT_LABEL_CLASS},
       .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_FAILED} .${CSS_CLASSES.COPY_LINK_TEXT_LABEL_CLASS} {
          opacity: 1 !important;
          transform: translateX(0) scaleX(1) !important;
          max-width: 120px !important;
          margin-left: 6px !important;
          padding-right: 7px !important;
      }
       .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_COPIED} .${CSS_CLASSES.COPY_LINK_ICON_WRAPPER} {
          color: var(--ddge-copy-button-copied-color) !important;
      }
      .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_COPIED} .${CSS_CLASSES.COPY_LINK_TEXT_LABEL_CLASS} {
          color: var(--ddge-copy-button-copied-color) !important;
      }
      .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_FAILED} .${CSS_CLASSES.COPY_LINK_ICON_WRAPPER} {
          color: var(--ddge-copy-button-failed-color) !important;
      }
      .${CSS_CLASSES.COPY_LINK_BUTTON}.${CSS_CLASSES.COPY_LINK_BUTTON_FAILED} .${CSS_CLASSES.COPY_LINK_TEXT_LABEL_CLASS} {
          color: var(--ddge-copy-button-failed-color) !important;
      }

      ${ELEMENT_SELECTORS.HEADER_ACTIONS} {
        display: flex;
        align-items: center;
      }

      body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.CONTENT_WRAPPER} {
          max-width: none !important;
          width: auto !important;
          padding: 0 20px !important;
      }
      body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.LAYOUT_CONTAINER} {
          display: block !important;
          width: 100% !important;
      }
      body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.MAINLINE_SECTION} {
          float: none !important;
          width: 100% !important;
          max-width: none !important;
          margin-right: 0 !important;
      }
       body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.SIDEBAR} {
          position: absolute !important;
          left: -9999px !important;
          display: none !important;
       }
      body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.RESULTS_CONTAINER} {
        width: 100%;
        padding: 0;
        overflow: auto;
        list-style: none;
        margin-top: 20px;
      }
      body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.RESULTS_CONTAINER}::after {
         content: "";
         display: table;
         clear: both;
      }
      body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.RESULTS_CONTAINER} > li:not(${ELEMENT_SELECTORS.PAGE_SEPARATOR_LI}) {
         float: left !important;
         width: calc(50% - 15px) !important;
         min-height: 160px !important;
         margin: 0 7.5px 15px 7.5px !important;
         padding: 18px !important;
         border: 1px solid var(--ddge-dual-col-result-border) !important;
         border-radius: 10px !important;
         box-sizing: border-box !important;
         overflow: hidden !important;
         background-color: var(--ddge-dual-col-result-bg) !important;
         box-shadow: 0 1px 3px var(--ddge-shadow-color);
         transition: border-color 0.2s ${UI_SETTINGS.ANIMATION_EASING_STANDARD}, background-color 0.2s ${UI_SETTINGS.ANIMATION_EASING_STANDARD};
      }
       body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.RESULTS_CONTAINER} > li:not(${ELEMENT_SELECTORS.PAGE_SEPARATOR_LI}):hover {
           border-color: var(--ctp-frappe-overlay0);
           background-color: rgba(var(--ctp-frappe-surface0-rgb), 0.3);
       }
       body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.RESULTS_CONTAINER} > ${ELEMENT_SELECTORS.PAGE_SEPARATOR_LI} {
           float: none !important;
           clear: both !important;
           width: 100% !important;
           min-height: auto !important;
           margin: 25px 0 !important;
           padding: 0 !important;
           border: none !important;
           box-sizing: content-box !important;
           overflow: visible !important;
           background: none !important;
       }
       body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.RESULTS_CONTAINER} > ${ELEMENT_SELECTORS.PAGE_SEPARATOR_LI} > div {
           text-align: center;
       }
      body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.RESULTS_CONTAINER} ${ELEMENT_SELECTORS.WEB_RESULT_TITLE_SPAN},
      body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.RESULTS_CONTAINER} ${ELEMENT_SELECTORS.WEB_RESULT_SNIPPET},
      body.${CSS_CLASSES.DUAL_COLUMN_LAYOUT} ${ELEMENT_SELECTORS.RESULTS_CONTAINER} ${ELEMENT_SELECTORS.WEB_RESULT_URL} {
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          hyphens: auto !important;
      }
    `;
    try {
      GM_addStyle(styles);
    } catch (e) {
      const styleElement = document.createElement("style");
      styleElement.textContent = styles;
      (document.head || document.documentElement).appendChild(styleElement);
    }
  }

  function debounce(callback, delayMs) {
    let timeoutId;
    return function debounced(...args) {
      const later = () => {
        clearTimeout(timeoutId);
        callback(...args);
      };
      clearTimeout(timeoutId);
      timeoutId = setTimeout(later, delayMs);
    };
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function createButton(options) {
    const button = document.createElement("button");
    button.type = "button";
    if (options.className) {
      button.className = options.className;
    }
    if (options.id) {
      button.id = options.id;
    }
    if (options.text) {
      button.textContent = options.text;
    }
    if (options.innerHTML) {
      button.innerHTML = options.innerHTML;
    }
    if (options.ariaLabel) {
      button.setAttribute("aria-label", options.ariaLabel);
    }
    if (options.onClick) {
      button.addEventListener(
        "click",
        options.onClick,
        options.useCapture ?? false
      );
    }
    if (options.dataset) {
      for (const key in options.dataset) {
        button.dataset[key] = options.dataset[key];
      }
    }
    return button;
  }

  function createToggleButton(wrapperId, config, isActive, handler) {
    const existingToggle = document.getElementById(wrapperId);
    if (existingToggle) return existingToggle.querySelector("button");

    const headerActionsContainer = document.querySelector(
      ELEMENT_SELECTORS.HEADER_ACTIONS
    );
    if (!headerActionsContainer) return null;

    const toggleElement = document.createElement("div");
    toggleElement.id = wrapperId;
    toggleElement.classList.add(CSS_CLASSES.TOGGLE_BUTTON_WRAPPER);
    if (config.activeClass) {
      toggleElement.classList.toggle(config.activeClass, isActive);
    }
    if (config.disabledClass) {
      toggleElement.classList.toggle(config.disabledClass, !isActive);
    }

    const toggleButtonEl = createButton({
      className: `${CSS_CLASSES.TOGGLE_BUTTON} ${CSS_CLASSES.MATERIAL_BUTTON}`,
      text: config.label,
      ariaLabel: config.label,
      onClick: handler,
      useCapture: true,
    });
    toggleButtonEl.setAttribute("aria-pressed", String(isActive));

    toggleElement.appendChild(toggleButtonEl);

    const referenceNode = config.insertAfterId
      ? document.getElementById(config.insertAfterId)?.nextSibling
      : headerActionsContainer.firstChild;
    headerActionsContainer.insertBefore(toggleElement, referenceNode || null);

    return toggleButtonEl;
  }

  function insertEngineButtons() {
    const searchForm = document.querySelector(ELEMENT_SELECTORS.SEARCH_FORM);
    if (!searchForm || !searchForm.parentNode) return;
    const existingGroup = document.querySelector(
      `.${CSS_CLASSES.SEARCH_ENGINE_GROUP}`
    );
    if (existingGroup) existingGroup.remove();

    const engineGroupEl = document.createElement("div");
    engineGroupEl.className = CSS_CLASSES.SEARCH_ENGINE_GROUP;

    FEATURE_CONFIGS.ALTERNATE_SEARCH_ENGINES.forEach((engine) => {
      const engineButtonEl = createButton({
        className: `${CSS_CLASSES.SEARCH_ENGINE_BUTTON} ${CSS_CLASSES.MATERIAL_BUTTON}`,
        onClick: (event) => {
          event.preventDefault();
          triggerSearchEngine(engine.id);
        },
      });

      const engineIconEl = document.createElement("img");
      engineIconEl.className = CSS_CLASSES.SEARCH_ENGINE_ICON;
      engineIconEl.src = `https://icons.duckduckgo.com/ip3/${engine.iconHost}.ico`;
      engineIconEl.alt = `${engine.name} Icon`;

      const engineNameText = document.createTextNode(
        `转至 ${engine.name} 搜索`
      );

      engineButtonEl.appendChild(engineIconEl);
      engineButtonEl.appendChild(engineNameText);

      engineGroupEl.appendChild(engineButtonEl);
    });

    searchForm.parentNode.insertBefore(engineGroupEl, searchForm.nextSibling);
  }

  function applyHighlightsToNode(node, keywords) {
    if (!node || !keywords || keywords.length === 0) {
      return;
    }

    const nodeWalker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let textNodeToProcess;
    const nodesToProcess = [];

    while ((textNodeToProcess = nodeWalker.nextNode())) {
      if (
        textNodeToProcess.parentElement &&
        textNodeToProcess.parentElement.closest(
          `script, style, .${CSS_CLASSES.KEYWORD_HIGHLIGHT}`
        )
      ) {
        continue;
      }
      nodesToProcess.push(textNodeToProcess);
    }

    const keywordRegex = new RegExp(keywords.map(escapeRegex).join("|"), "gi");

    nodesToProcess.forEach((textNode) => {
      const text = textNode.nodeValue;
      if (!text) return;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = keywordRegex.exec(text)) !== null) {
        const index = match.index;
        const matchedText = match[0];

        if (index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex, index))
          );
        }

        const mark = document.createElement("mark");
        mark.className = CSS_CLASSES.KEYWORD_HIGHLIGHT;
        mark.appendChild(document.createTextNode(matchedText));
        fragment.appendChild(mark);

        lastIndex = index + matchedText.length;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex))
        );
      }

      if (fragment.hasChildNodes()) {
        const parentElement = textNode.parentNode;
        if (parentElement) {
          parentElement.replaceChild(fragment, textNode);
        }
      }
    });
  }

  function removeHighlights() {
    document
      .querySelectorAll(`.${CSS_CLASSES.KEYWORD_HIGHLIGHT}`)
      .forEach((highlightElement) => {
        const parentElement = highlightElement.parentNode;
        if (parentElement) {
          const textNode = document.createTextNode(
            highlightElement.textContent || ""
          );
          parentElement.replaceChild(textNode, highlightElement);
          parentElement.normalize();
        }
      });
  }

  function refreshHighlights() {
    removeHighlights();
    if (!isHighlightActive) return;

    const searchInputElement = document.querySelector(
      ELEMENT_SELECTORS.SEARCH_INPUT
    );
    if (!searchInputElement) return;

    const searchQuery = searchInputElement.value.trim();
    if (!searchQuery) return;

    const searchKeywords = searchQuery.split(/\s+/).filter(Boolean);
    if (searchKeywords.length === 0) return;

    const pageType = getCurrentPageType();
    const config = FEATURE_CONFIGS.HIGHLIGHT_SELECTORS[pageType];
    if (!config || !config.itemSelector || !config.targetSelectors) return;

    const resultItems = document.querySelectorAll(config.itemSelector);
    resultItems.forEach((item) => {
      config.targetSelectors.forEach((selector) => {
        const targetElements = item.querySelectorAll(selector);
        targetElements.forEach((element) => {
          applyHighlightsToNode(element, searchKeywords);
        });
      });
    });
  }

  function handleHighlightToggle(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    isHighlightActive = !isHighlightActive;
    try {
      GM_setValue(STORAGE_KEYS_DDGE.HIGHLIGHT_ENABLED, isHighlightActive);
    } catch (e) {}

    const toggleElement = document.getElementById(
      ELEMENT_IDS.HIGHLIGHT_TOGGLE_WRAPPER
    );
    if (toggleElement) {
      toggleElement.classList.toggle(
        CSS_CLASSES.HIGHLIGHTING_DISABLED,
        !isHighlightActive
      );
      const button = toggleElement.querySelector("button");
      if (button)
        button.setAttribute("aria-pressed", String(isHighlightActive));
    }
    refreshHighlights();
  }

  function insertHighlightToggle() {
    createToggleButton(
      ELEMENT_IDS.HIGHLIGHT_TOGGLE_WRAPPER,
      {
        label: UI_STRINGS.HIGHLIGHT_TOGGLE_LABEL,
        disabledClass: CSS_CLASSES.HIGHLIGHTING_DISABLED,
      },
      isHighlightActive,
      handleHighlightToggle
    );
  }

  function insertDualColumnToggle() {
    createToggleButton(
      ELEMENT_IDS.DUAL_COLUMN_TOGGLE_WRAPPER,
      {
        label: UI_STRINGS.DUAL_COLUMN_TOGGLE_LABEL,
        activeClass: CSS_CLASSES.DUAL_COLUMN_ACTIVE,
        insertAfterId: ELEMENT_IDS.HIGHLIGHT_TOGGLE_WRAPPER,
      },
      isDualColumnActive,
      handleDualColumnToggle
    );
  }

  function getCurrentPageType() {
    const urlParams = new URLSearchParams(window.location.search);
    const iaParam = urlParams.get("ia");
    if (iaParam === "images") return "images";
    if (iaParam === "videos") return "videos";
    if (iaParam === "news") return "news";
    return "web";
  }

  function applyDualColumnLayout() {
    const pageType = getCurrentPageType();
    const shouldApply = isDualColumnActive && pageType === "web";
    document.body.classList.toggle(CSS_CLASSES.DUAL_COLUMN_LAYOUT, shouldApply);
  }

  function handleDualColumnToggle(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    isDualColumnActive = !isDualColumnActive;
    try {
      GM_setValue(STORAGE_KEYS_DDGE.DUAL_COLUMN_ENABLED, isDualColumnActive);
    } catch (e) {}

    applyDualColumnLayout();

    const toggleElement = document.getElementById(
      ELEMENT_IDS.DUAL_COLUMN_TOGGLE_WRAPPER
    );
    if (toggleElement) {
      toggleElement.classList.toggle(
        CSS_CLASSES.DUAL_COLUMN_ACTIVE,
        isDualColumnActive && getCurrentPageType() === "web"
      );
      const button = toggleElement.querySelector("button");
      if (button)
        button.setAttribute("aria-pressed", String(isDualColumnActive));
    }
  }

  function insertCopyLinkButtons() {
    const resultElements = document.querySelectorAll(
      ELEMENT_SELECTORS.WEB_RESULT
    );

    resultElements.forEach((resultElement) => {
      if (resultElement.dataset.copyButtonAdded === "true") return;

      const optionsContainer = resultElement.querySelector(
        ELEMENT_SELECTORS.WEB_RESULT_OPTIONS_CONTAINER
      );
      const optionsButton = optionsContainer?.querySelector(
        ELEMENT_SELECTORS.WEB_RESULT_OPTIONS_BUTTON
      );
      const titleLinkElement = resultElement.querySelector(
        ELEMENT_SELECTORS.WEB_RESULT_TITLE_LINK
      );

      if (
        !optionsContainer ||
        !optionsButton ||
        !titleLinkElement ||
        !titleLinkElement.href
      )
        return;

      const copyUrl = titleLinkElement.href;
      let feedbackTimeoutId = null;

      const iconWrapper = document.createElement("span");
      iconWrapper.className = CSS_CLASSES.COPY_LINK_ICON_WRAPPER;
      iconWrapper.innerHTML = UI_STRINGS.COPY_BUTTON_ICON_SVG;

      const textLabel = document.createElement("span");
      textLabel.className = CSS_CLASSES.COPY_LINK_TEXT_LABEL_CLASS;
      textLabel.textContent = UI_STRINGS.COPY_BUTTON_TEXT_LABEL;

      const copyButton = createButton({
        className: CSS_CLASSES.COPY_LINK_BUTTON,
        ariaLabel: UI_STRINGS.COPY_BUTTON_DEFAULT_ARIA_LABEL,
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          clearTimeout(feedbackTimeoutId);

          navigator.clipboard
            .writeText(copyUrl)
            .then(() => {
              iconWrapper.innerHTML = UI_STRINGS.COPY_BUTTON_SUCCESS_ICON_SVG;
              textLabel.textContent = UI_STRINGS.COPY_BUTTON_SUCCESS_ARIA_LABEL;
              copyButton.setAttribute(
                "aria-label",
                UI_STRINGS.COPY_BUTTON_SUCCESS_ARIA_LABEL
              );
              copyButton.classList.remove(CSS_CLASSES.COPY_LINK_BUTTON_FAILED);
              copyButton.classList.add(CSS_CLASSES.COPY_LINK_BUTTON_COPIED);
              copyButton.disabled = true;

              feedbackTimeoutId = setTimeout(() => {
                if (
                  copyButton.classList.contains(
                    CSS_CLASSES.COPY_LINK_BUTTON_COPIED
                  )
                ) {
                  iconWrapper.innerHTML = UI_STRINGS.COPY_BUTTON_ICON_SVG;
                  textLabel.textContent = UI_STRINGS.COPY_BUTTON_TEXT_LABEL;
                  copyButton.setAttribute(
                    "aria-label",
                    UI_STRINGS.COPY_BUTTON_DEFAULT_ARIA_LABEL
                  );
                  copyButton.classList.remove(
                    CSS_CLASSES.COPY_LINK_BUTTON_COPIED
                  );
                  copyButton.disabled = false;
                }
              }, UI_SETTINGS.COPY_FEEDBACK_DURATION_MS);
            })
            .catch((err) => {
              iconWrapper.innerHTML = UI_STRINGS.COPY_BUTTON_FAILURE_ICON_SVG;
              textLabel.textContent = UI_STRINGS.COPY_BUTTON_FAILURE_ARIA_LABEL;
              copyButton.setAttribute(
                "aria-label",
                UI_STRINGS.COPY_BUTTON_FAILURE_ARIA_LABEL
              );
              copyButton.classList.remove(CSS_CLASSES.COPY_LINK_BUTTON_COPIED);
              copyButton.classList.add(CSS_CLASSES.COPY_LINK_BUTTON_FAILED);
              copyButton.disabled = true;

              feedbackTimeoutId = setTimeout(() => {
                if (
                  copyButton.classList.contains(
                    CSS_CLASSES.COPY_LINK_BUTTON_FAILED
                  )
                ) {
                  iconWrapper.innerHTML = UI_STRINGS.COPY_BUTTON_ICON_SVG;
                  textLabel.textContent = UI_STRINGS.COPY_BUTTON_TEXT_LABEL;
                  copyButton.setAttribute(
                    "aria-label",
                    UI_STRINGS.COPY_BUTTON_DEFAULT_ARIA_LABEL
                  );
                  copyButton.classList.remove(
                    CSS_CLASSES.COPY_LINK_BUTTON_FAILED
                  );
                  copyButton.disabled = false;
                }
              }, UI_SETTINGS.COPY_FEEDBACK_DURATION_MS);
            });
        },
      });

      copyButton.appendChild(iconWrapper);
      copyButton.appendChild(textLabel);

      optionsContainer.insertBefore(copyButton, optionsButton);
      resultElement.dataset.copyButtonAdded = "true";
    });

    document
      .querySelectorAll(`.${CSS_CLASSES.COPY_LINK_BUTTON}`)
      .forEach((btn) => {
        if (!btn.closest(ELEMENT_SELECTORS.WEB_RESULT)) {
          btn.remove();
        }
      });
  }

  function applyExactPhrase() {
    const input = document.querySelector(ELEMENT_SELECTORS.SEARCH_INPUT);
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;

    if (start !== end) {
      const selectedText = value.substring(start, end);
      const prefix = value.substring(0, start);
      const suffix = value.substring(end);
      if (prefix.endsWith('"') && suffix.startsWith('"')) {
        input.setSelectionRange(start, end);
      } else {
        input.value = `${prefix}"${selectedText}"${suffix}`;
        input.setSelectionRange(start + 1, end + 1);
      }
    } else {
      if (value && (!value.startsWith('"') || !value.endsWith('"'))) {
        input.value = `"${value}"`;
      }
      input.setSelectionRange(input.value.length, input.value.length);
    }
    input.focus();
  }

  function applyExclusion() {
    const input = document.querySelector(ELEMENT_SELECTORS.SEARCH_INPUT);
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;
    let newValue;
    let newCursorPos;

    if (start !== end) {
      const selectedText = value.substring(start, end);
      newValue = `${value.substring(0, start)}-${selectedText}${value.substring(
        end
      )}`;
      newCursorPos = start + 1;
      const newEndPos = end + 1;
      input.value = newValue;
      input.setSelectionRange(newCursorPos, newEndPos);
    } else {
      newValue = `${value.substring(0, start)}-${value.substring(end)}`;
      newCursorPos = start + 1;
      input.value = newValue;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }
    input.focus();
  }

  function appendOperator(operator) {
    const input = document.querySelector(ELEMENT_SELECTORS.SEARCH_INPUT);
    if (!input) return;
    const currentValue = input.value;
    const prefix =
      currentValue.length > 0 && !currentValue.endsWith(" ") ? " " : "";
    const operatorWithSpace = `${prefix}${operator} `;

    input.value = `${currentValue}${operatorWithSpace}`;
    const newCursorPos = input.value.length;
    input.focus();
    input.setSelectionRange(newCursorPos, newCursorPos);
  }

  function insertSyntaxShortcuts() {
    let shortcutsContainer = document.getElementById(
      ELEMENT_IDS.SYNTAX_SHORTCUTS_CONTAINER
    );
    if (shortcutsContainer) shortcutsContainer.remove();

    const searchArea = document.querySelector(
      ELEMENT_SELECTORS.HEADER_SEARCH_AREA
    );
    if (!searchArea || !searchArea.firstChild) return;

    shortcutsContainer = document.createElement("div");
    shortcutsContainer.id = ELEMENT_IDS.SYNTAX_SHORTCUTS_CONTAINER;

    FEATURE_CONFIGS.SYNTAX_SHORTCUTS.forEach((config) => {
      const button = createButton({
        className: `${CSS_CLASSES.SYNTAX_SHORTCUT_BUTTON} ${CSS_CLASSES.MATERIAL_BUTTON}`,
        text: config.text,
        onClick: (e) => {
          e.preventDefault();
          if (config.action === appendOperator) {
            config.action(config.syntax);
          } else {
            config.action();
          }
        },
      });
      shortcutsContainer.appendChild(button);
    });

    searchArea.insertBefore(shortcutsContainer, searchArea.firstChild);
  }

  function initializeFeatureState() {
    applyDualColumnLayout();
    const highlightToggleElement = document.getElementById(
      ELEMENT_IDS.HIGHLIGHT_TOGGLE_WRAPPER
    );
    if (highlightToggleElement) {
      highlightToggleElement.classList.toggle(
        CSS_CLASSES.HIGHLIGHTING_DISABLED,
        !isHighlightActive
      );
      const button = highlightToggleElement.querySelector("button");
      if (button)
        button.setAttribute("aria-pressed", String(isHighlightActive));
    }
    const dualColToggleElement = document.getElementById(
      ELEMENT_IDS.DUAL_COLUMN_TOGGLE_WRAPPER
    );
    if (dualColToggleElement) {
      dualColToggleElement.classList.toggle(
        CSS_CLASSES.DUAL_COLUMN_ACTIVE,
        isDualColumnActive && getCurrentPageType() === "web"
      );
      const button = dualColToggleElement.querySelector("button");
      if (button)
        button.setAttribute("aria-pressed", String(isDualColumnActive));
    }
    refreshHighlights();
  }

  function runPageEnhancements() {
    const isSearchFormPresent = document.querySelector(
      ELEMENT_SELECTORS.SEARCH_FORM
    );

    if (isSearchFormPresent) {
      insertSyntaxShortcuts();
      insertEngineButtons();
    }

    insertHighlightToggle();
    insertDualColumnToggle();
    insertCopyLinkButtons();

    initializeFeatureState();
  }

  function navigateTabs(dir) {
    const allTabElements = Array.from(
      document.querySelectorAll(ELEMENT_SELECTORS.NAV_TAB)
    );
    if (allTabElements.length === 0) return;

    const visibleTabElements = allTabElements.filter(
      (tab) => tab.textContent.trim() !== UI_STRINGS.EXCLUDED_NAV_TAB_TEXT
    );
    if (visibleTabElements.length === 0) return;

    const currentTabIndex = allTabElements.findIndex((tab) =>
      tab.classList.contains(CSS_CLASSES.ACTIVE_NAV_TAB)
    );
    let isMapTabActive = false;
    let activeTabIndexInVisible = -1;

    if (currentTabIndex !== -1) {
      if (
        allTabElements[currentTabIndex].textContent.trim() ===
        UI_STRINGS.EXCLUDED_NAV_TAB_TEXT
      ) {
        isMapTabActive = true;
      } else {
        activeTabIndexInVisible = visibleTabElements.findIndex((tab) =>
          tab.classList.contains(CSS_CLASSES.ACTIVE_NAV_TAB)
        );
      }
    } else {
      const tabUrlParams = new URLSearchParams(window.location.search);
      if (tabUrlParams.get("iaxm") === "maps") {
        isMapTabActive = true;
      }
    }

    let nextTabIndex;
    const numVisibleTabs = visibleTabElements.length;
    if (isMapTabActive || activeTabIndexInVisible === -1) {
      nextTabIndex = dir === "next" ? 0 : numVisibleTabs - 1;
    } else {
      if (dir === "next") {
        nextTabIndex = (activeTabIndexInVisible + 1) % numVisibleTabs;
      } else {
        nextTabIndex =
          (activeTabIndexInVisible - 1 + numVisibleTabs) % numVisibleTabs;
      }
    }

    const nextTabElement = visibleTabElements[nextTabIndex];
    if (nextTabElement) {
      nextTabElement.click();
    }
  }

  function triggerSearchEngine(engineId) {
    const engine = FEATURE_CONFIGS.ALTERNATE_SEARCH_ENGINES.find(
      (e) => e.id === engineId
    );
    if (!engine) return;

    const currentSearchInput = document.querySelector(
      ELEMENT_SELECTORS.SEARCH_INPUT
    );
    const query = currentSearchInput ? currentSearchInput.value.trim() : "";
    if (query) {
      const searchURL = `${engine.urlTemplate}${encodeURIComponent(query)}`;
      window.open(searchURL, "_blank", "noopener,noreferrer");
    }
  }

  function createKeyboardEventHandler() {
    const specialActionHandlers = {
      handleHighlightToggle: handleHighlightToggle,
      handleDualColumnToggle: handleDualColumnToggle,
      navigateTabsNext: () => navigateTabs("next"),
      navigateTabsPrev: () => navigateTabs("prev"),
    };

    FEATURE_CONFIGS.ALTERNATE_SEARCH_ENGINES.forEach((engine) => {
      if (engine.shortcutKey) {
        specialActionHandlers[`triggerSearchEngine_${engine.id}`] = () =>
          triggerSearchEngine(engine.id);
      }
    });

    const shortcutActionMap = {};
    currentKeybindingConfig.SHORTCUTS.forEach((shortcut) => {
      if (shortcut.key) {
        const lowerKey = shortcut.key.toLowerCase();
        if (
          shortcut.actionIdentifier &&
          specialActionHandlers[shortcut.actionIdentifier]
        ) {
          shortcutActionMap[lowerKey] =
            specialActionHandlers[shortcut.actionIdentifier];
        }
      }
    });

    return function handleKeyDown(event) {
      if (!event.altKey && !event.ctrlKey) return;

      const targetElement = event.target;
      const targetElementTag = targetElement?.tagName?.toLowerCase();
      if (
        targetElementTag === "input" ||
        targetElementTag === "textarea" ||
        targetElementTag === "select" ||
        targetElement?.isContentEditable
      ) {
        return;
      }

      const pressedKey = event.key.toLowerCase();
      const actionToExecute = shortcutActionMap[pressedKey];

      if (typeof actionToExecute === "function") {
        event.preventDefault();
        actionToExecute(event);
      }
    };
  }

  function initializeScript() {
    injectUserInterfaceStyles();

    debouncedRunPageEnhancements = debounce(
      runPageEnhancements,
      UI_SETTINGS.DOM_OBSERVER_DELAY_MS
    );
    domObserver = new MutationObserver(debouncedRunPageEnhancements);

    keydownEventListener = createKeyboardEventHandler();
    window.addEventListener("keydown", keydownEventListener, true);

    document.addEventListener(
      "dblclick",
      function handleDoubleClick(event) {
        const viewportWidth = window.innerWidth;
        const scrollTriggerX =
          viewportWidth * (1 - UI_SETTINGS.SCROLL_TOP_TRIGGER_RATIO);
        if (
          event.clientX > scrollTriggerX &&
          !event.target.closest(ELEMENT_SELECTORS.INTERACTIVE_ELEMENT)
        ) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      { passive: true }
    );

    observeDOM();
  }

  function observeDOM() {
    runPageEnhancements();
    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initializeScript);
  } else {
    initializeScript();
  }
})();

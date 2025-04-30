// ==UserScript==
// @name               DuckDuckGo Optimization
// @name:zh-CN         DuckDuckGo 优化
// @name:zh-TW         DuckDuckGo 優化
// @description        Enhance Your DuckDuckGo Experience - Double-Click To Top / Instant Cross-Engine Search / Focused Keyword Highlighting / Dual-Column Results View / Quick Category Navigation / Search Syntax Helper / One-Click Link Copy / Powerful Keyboard Shortcuts
// @description:zh-CN  优化 DuckDuckGo 浏览体验 - 双点即达页首/跨引擎即刻搜/聚焦搜索文本/分栏结果视图/快捷类别导航/搜索语法助手/网链一键拷贝/全功能快捷键
// @description:zh-TW  優化 DuckDuckGo 瀏覽體驗 - 雙點即達頁首/跨引擎即刻搜/聚焦搜尋文字/分欄結果視圖/快速類別導覽/搜尋語法助手/網址一鍵拷貝/全功能快捷鍵
// @version            1.2.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/DuckDuckGoOptimizationIcon.svg
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

  const CONFIG_VALUES = {
    scrollTopTriggerRatio: 0.2,
    domObserverDelay: 1000,
    copyFeedbackDuration: 1500,
    uiFontStack: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  };

  const SELECTORS = {
    interactiveElement:
      'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])',
    searchForm: "#search_form",
    searchInput: "#search_form_input",
    headerSearchArea: "div.header__content.header__search",
    headerActions: ".header--aside",
    contentWrapper: "#web_content_wrapper",
    layoutContainer: "#react-layout > div > div",
    mainlineSection: 'section[data-testid="mainline"]',
    sidebar: 'section[data-testid="sidebar"]',
    resultsContainer: "ol.react-results--main",
    webResult: 'article[data-testid="result"]',
    webResultOptionsContainer: "div.OHr0VX9IuNcv6iakvT6A",
    webResultOptionsButton: "button.cxQwADb9kt3UnKwcXKat",
    webResultTitleLink: 'h2 a[data-testid="result-title-a"]',
    webResultTitleSpan: 'h2 a[data-testid="result-title-a"] span',
    webResultSnippet: 'div[data-result="snippet"] > div > span > span',
    webResultUrl: 'a[data-testid="result-extras-url-link"] p span',
    imageResult: 'div[data-testid="zci-images"] figure',
    imageCaption: "figcaption p span",
    videoResult: 'div[data-testid="zci-videos"] article.O9Ipab51rBntYb0pwOQn',
    videoTitle: "h2 span.kY2IgmnCmOGjharHErah",
    newsResult: "article a.ksuAj6IYz34FJu0vGKNy",
    newsTitle: "h2.WctuDfRzXeUleKwpnBCx",
    newsSnippet: "div.kY2IgmnCmOGjharHErah p",
    navTab: "#react-duckbar nav ul:first-of-type > li > a",
  };

  const CLASSES = {
    pageSeparatorLi: "_LX3Dolif_D4E_6W6Fbr",
    activeNavTab: "SnptgjT2zdOhGYfNng6g",
    searchEngineGroup: "search-engine-group",
    searchEngineButton: "search-engine-button",
    searchEngineIcon: "search-engine-icon",
    keywordHighlight: "keyword-highlight",
    highlightingDisabled: "highlighting-disabled",
    copyLinkButton: "copy-link-button",
    copyLinkButtonCopied: "copied",
    copyLinkButtonFailed: "failed",
    syntaxShortcutButton: "syntax-shortcut-button",
    dualColumnLayout: "dual-column-layout",
    dualColumnActive: "dual-column-active",
  };

  const IDS = {
    highlightToggle: "ddg-highlight-toggle",
    syntaxShortcutsContainer: "syntax-shortcuts-container",
    dualColumnToggle: "ddg-dual-column-toggle",
  };

  const TEXTS = {
    highlightToggle: "文本聚焦",
    dualColumnToggle: "分栏视图",
    copyButtonDefault: "拷贝此页网址",
    copyButtonSuccess: "拷贝完成",
    copyButtonFailure: "拷贝失败",
    copyButtonIconSvg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 125.834 145.398"><g><rect height="145.398" opacity="0" width="125.834" x="0" y="0"/><path d="M103.957 43.1334L103.957 102.362C103.957 112.616 98.9276 117.694 88.8202 117.694L36.9647 117.694C26.8573 117.694 21.828 112.616 21.828 102.362L21.828 67.3947C23.9408 69.2087 26.911 69.8726 29.6893 69.0624L29.6893 102.264C29.6893 107.147 32.2772 109.833 37.3554 109.833L88.4784 109.833C93.5077 109.833 96.0956 107.147 96.0956 102.264L96.0956 43.2311C96.0956 38.3482 93.5077 35.6627 88.4296 35.6627L44.2584 35.6627C44.1673 33.7229 43.3799 31.757 41.7499 30.0963L39.5161 27.8014L88.8202 27.8014C98.9276 27.8014 103.957 32.8795 103.957 43.1334Z" fill="currentColor"/><path d="M83.3026 91.9127C83.3026 93.5728 82.0331 94.8424 80.2753 94.8424L44.3378 94.8424C42.58 94.8424 41.2616 93.5728 41.2616 91.9127C41.2616 90.2037 42.58 88.8365 44.3378 88.8365L80.2753 88.8365C82.0331 88.8365 83.3026 90.2037 83.3026 91.9127Z" fill="currentColor"/><path d="M83.3026 72.6744C83.3026 74.3834 82.0331 75.7506 80.2753 75.7506L44.3378 75.7506C42.58 75.7506 41.2616 74.3834 41.2616 72.6744C41.2616 71.0143 42.58 69.7447 44.3378 69.7447L80.2753 69.7447C82.0331 69.7447 83.3026 71.0143 83.3026 72.6744Z" fill="currentColor"/><path d="M83.3026 53.5826C83.3026 55.2916 82.0331 56.61 80.2753 56.61L44.3378 56.61C42.58 56.61 41.2616 55.2916 41.2616 53.5826C41.2616 51.9225 42.58 50.6041 44.3378 50.6041L80.2753 50.6041C82.0331 50.6041 83.3026 51.9225 83.3026 53.5826Z" fill="currentColor"/><path d="M6.64247 47.5768C6.59365 49.4322 8.83974 50.067 10.0604 48.8463L17.5311 41.3756L25.6854 61.5904C26.0761 62.5182 27.0526 62.9576 27.9315 62.6158L32.8143 60.6627C33.6933 60.2721 34.0351 59.2467 33.5956 58.3189L25.0018 38.4459L35.4999 38.0064C37.3554 37.9088 38.2831 36.151 36.9159 34.735L10.2558 7.29355C9.03505 6.07285 7.13075 6.75644 7.08193 8.56308Z" fill="currentColor"/></g></svg>`,
    excludedNavTabText: "地图",
  };

  const STORAGE_KEYS = {
    highlightEnabled: "highlightEnabled",
    dualColumnEnabled: "dualColumnEnabled",
  };

  let isHighlightActive = GM_getValue(STORAGE_KEYS.highlightEnabled, false);
  let isDualColumnActive = GM_getValue(STORAGE_KEYS.dualColumnEnabled, false);

  const keyboardShortcuts = {};

  const highlightSelectorsConfig = {
    web: {
      itemSelector: SELECTORS.webResult,
      targetSelectors: [
        SELECTORS.webResultTitleSpan,
        SELECTORS.webResultSnippet,
      ],
    },
    images: {
      itemSelector: SELECTORS.imageResult,
      targetSelectors: [SELECTORS.imageCaption],
    },
    videos: {
      itemSelector: SELECTORS.videoResult,
      targetSelectors: [SELECTORS.videoTitle],
    },
    news: {
      itemSelector: SELECTORS.newsResult,
      targetSelectors: [SELECTORS.newsTitle, SELECTORS.newsSnippet],
    },
  };

  const alternateSearchEngines = [
    {
      name: "Google",
      urlTemplate: "https://www.google.com/search?q=",
      iconHost: "www.google.com",
      shortcutKey: "z",
    },
    {
      name: "Bing",
      urlTemplate: "https://www.bing.com/search?q=",
      iconHost: "www.bing.com",
      shortcutKey: "x",
    },
    {
      name: "Baidu",
      urlTemplate: "https://www.baidu.com/s?wd=",
      iconHost: "www.baidu.com",
      shortcutKey: "c",
    },
  ];

  const syntaxShortcutsConfig = [
    { text: "精确搜索", syntax: '""', action: applyExactPhrase },
    { text: "搜索排除", syntax: "-", action: applyExclusion },
    { text: "限定站点", syntax: "site:", action: appendOperator },
    { text: "筛选文件", syntax: "filetype:", action: appendOperator },
  ];

  document.addEventListener(
    "dblclick",
    function handleDoubleClick(event) {
      const viewportWidth = window.innerWidth;
      const scrollTriggerX =
        viewportWidth * (1 - CONFIG_VALUES.scrollTopTriggerRatio);
      if (
        event.clientX > scrollTriggerX &&
        !event.target.closest(SELECTORS.interactiveElement)
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    { passive: true }
  );

  const scriptStyles = `
  .${CLASSES.searchEngineGroup} {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    max-width: 800px;
    margin: 12px auto;
    padding: 0 10px;
  }
  .${CLASSES.searchEngineButton} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    flex-basis: 110px;
    flex-shrink: 0;
    gap: 8px;
    min-width: 110px;
    padding: 8px 16px;
    border: 1px solid transparent;
    border-color: rgba(85, 85, 85, 0.9);
    border-radius: 8px;
    box-sizing: border-box;
    font-family: ${CONFIG_VALUES.uiFontStack};
    font-size: 14px;
    font-weight: 500;
    color: #f5f5f7;
    text-align: center;
    background-color: rgba(60, 60, 60, 0.8);
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  }
  .${CLASSES.searchEngineButton}:hover {
    background-color: rgba(75, 75, 75, 0.9);
    border-color: rgba(100, 100, 100, 0.9);
    transform: scale(1.03);
  }
  .${CLASSES.searchEngineButton}:active {
    transform: scale(0.98);
  }
  .${CLASSES.searchEngineIcon} {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    vertical-align: middle;
  }
  #${IDS.syntaxShortcutsContainer} {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .${CLASSES.syntaxShortcutButton} {
    display: inline-block;
    padding: 8px 16px;
    border: 1px solid transparent;
    border-color: rgba(85, 85, 85, 0.9);
    border-radius: 8px;
    box-sizing: border-box;
    font-family: ${CONFIG_VALUES.uiFontStack};
    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
    color: #f5f5f7;
    text-align: center;
    background-color: rgba(60, 60, 60, 0.8);
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  }
  .${CLASSES.syntaxShortcutButton}:hover {
    color: #f5f5f7;
    background-color: rgba(75, 75, 75, 0.9);
    border-color: rgba(100, 100, 100, 0.9);
    transform: scale(1.03);
  }
   .${CLASSES.syntaxShortcutButton}:active {
      transform: scale(0.98);
   }
  .${CLASSES.keywordHighlight} {
    padding: 0 1px;
    border-radius: 3px;
    color: inherit;
    background-color: rgba(255, 220, 0, 0.5);
    box-shadow: none;
  }
  #${IDS.highlightToggle},
  #${IDS.dualColumnToggle} {
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
    vertical-align: middle;
  }
   #${IDS.highlightToggle} > button,
   #${IDS.dualColumnToggle} > button {
      padding: 5px 12px;
      border: 1px solid rgba(85, 85, 85, 0.9);
      border-radius: 6px;
      font-family: ${CONFIG_VALUES.uiFontStack};
      font-size: 13px;
      line-height: 1.2;
      color: #f5f5f7;
      background-color: rgba(60, 60, 60, 0.8);
      opacity: 1;
      cursor: pointer;
      transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.3s ease;
  }
   #${IDS.highlightToggle} > button:hover,
   #${IDS.dualColumnToggle} > button:hover {
       background-color: rgba(75, 75, 75, 0.9);
       border-color: rgba(100, 100, 100, 0.9);
   }
  #${IDS.highlightToggle}.${CLASSES.highlightingDisabled} > button {
    opacity: 0.5;
  }
  #${IDS.dualColumnToggle}:not(.${CLASSES.dualColumnActive}) > button {
    opacity: 0.5;
  }
  ${SELECTORS.webResult} {
    position: relative;
  }
  ${SELECTORS.webResultOptionsContainer} {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: flex-end;
  }
  .${CLASSES.copyLinkButton} {
    position: relative;
    top: -1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 110px;
    margin-right: 8px;
    padding: 4px 8px;
    border: 1px solid rgba(85, 85, 85, 0.9);
    border-radius: 6px;
    box-sizing: border-box;
    font-family: ${CONFIG_VALUES.uiFontStack};
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    color: #f5f5f7;
    vertical-align: middle;
    text-align: center;
    background-color: rgba(60, 60, 60, 0.8);
    opacity: 0;
    cursor: pointer;
    pointer-events: none;
    transition: opacity 0.2s ease, background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  }
  ${SELECTORS.webResult}:hover .${CLASSES.copyLinkButton} {
    opacity: 1;
    pointer-events: auto;
  }
  .${CLASSES.copyLinkButton}:hover {
    background-color: rgba(75, 75, 75, 0.9);
    border-color: rgba(100, 100, 100, 0.9);
    transform: scale(1.03);
  }
   .${CLASSES.copyLinkButton}:active {
      transform: scale(0.98);
   }
  .${CLASSES.copyLinkButton} svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    vertical-align: middle;
    fill: currentColor;
  }
  .${CLASSES.copyLinkButton}.${CLASSES.copyLinkButtonCopied} {
      border-color: rgba(0, 90, 190, 0.85) !important;
      color: #f5f5f7 !important;
      background-color: rgba(0, 122, 255, 0.85) !important;
      opacity: 1 !important;
      transform: none !important;
      pointer-events: auto !important;
  }
  .${CLASSES.copyLinkButton}.${CLASSES.copyLinkButtonFailed} {
      border-color: rgba(210, 40, 30, 0.85) !important;
      color: #f5f5f7 !important;
      background-color: rgba(255, 59, 48, 0.85) !important;
      opacity: 1 !important;
      transform: none !important;
      pointer-events: auto !important;
  }
  ${SELECTORS.headerActions} {
    display: flex;
    align-items: center;
  }
  body.${CLASSES.dualColumnLayout} ${SELECTORS.contentWrapper} {
      max-width: none !important;
      width: auto !important;
      padding: 0 20px !important;
  }
  body.${CLASSES.dualColumnLayout} ${SELECTORS.layoutContainer} {
      display: block !important;
      width: 100% !important;
  }
  body.${CLASSES.dualColumnLayout} ${SELECTORS.mainlineSection} {
      float: none !important;
      width: 100% !important;
      max-width: none !important;
      margin-right: 0 !important;
  }
   body.${CLASSES.dualColumnLayout} ${SELECTORS.sidebar} {
      position: absolute !important;
      left: -9999px !important;
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
   }
  body.${CLASSES.dualColumnLayout} ${SELECTORS.resultsContainer} {
    width: 100%;
    padding: 0;
    overflow: auto;
    list-style: none;
  }
  body.${CLASSES.dualColumnLayout} ${SELECTORS.resultsContainer}::after {
     content: "";
     display: table;
     clear: both;
  }
  body.${CLASSES.dualColumnLayout} ${SELECTORS.resultsContainer} > li:not(.${CLASSES.pageSeparatorLi}) {
     float: left !important;
     width: calc(50% - 20px) !important;
     min-height: 155px !important;
     margin: 0 10px 20px 10px !important;
     padding: 15px !important;
     border: 1px solid rgba(85, 85, 85, 0.3) !important;
     border-radius: 8px !important;
     box-sizing: border-box !important;
     overflow: hidden !important;
     background-color: rgba(40, 40, 40, 0.2) !important;
  }
   body.${CLASSES.dualColumnLayout} ${SELECTORS.resultsContainer} > li.${CLASSES.pageSeparatorLi} {
       float: none !important;
       clear: both !important;
       width: 100% !important;
       min-height: auto !important;
       margin: 20px 0 !important;
       padding: 0 !important;
       border: none !important;
       box-sizing: content-box !important;
       overflow: visible !important;
       background: none !important;
   }
   body.${CLASSES.dualColumnLayout} ${SELECTORS.resultsContainer} > li.${CLASSES.pageSeparatorLi} > div {
       text-align: center;
   }
  body.${CLASSES.dualColumnLayout} ${SELECTORS.resultsContainer} ${SELECTORS.webResultTitleSpan},
  body.${CLASSES.dualColumnLayout} ${SELECTORS.resultsContainer} ${SELECTORS.webResultSnippet},
  body.${CLASSES.dualColumnLayout} ${SELECTORS.resultsContainer} ${SELECTORS.webResultUrl} {
      overflow-wrap: break-word !important;
      word-break: break-word !important;
      hyphens: auto !important;
  }
  `;
  GM_addStyle(scriptStyles);

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

  function insertEngineButtons() {
    const searchForm = document.querySelector(SELECTORS.searchForm);
    if (!searchForm || !searchForm.parentNode) return;
    if (document.querySelector(`.${CLASSES.searchEngineGroup}`)) return;

    const engineGroupEl = document.createElement("div");
    engineGroupEl.className = CLASSES.searchEngineGroup;

    alternateSearchEngines.forEach((engine) => {
      const engineButtonEl = createButton({
        className: CLASSES.searchEngineButton,
        onClick: (event) => {
          event.preventDefault();
          const currentSearchInput = document.querySelector(
            SELECTORS.searchInput
          );
          const query = currentSearchInput
            ? currentSearchInput.value.trim()
            : "";
          if (query) {
            const searchURL = `${engine.urlTemplate}${encodeURIComponent(
              query
            )}`;
            window.open(searchURL, "_blank", "noopener,noreferrer");
          }
        },
      });

      const engineIconEl = document.createElement("img");
      engineIconEl.className = CLASSES.searchEngineIcon;
      engineIconEl.src = `https://icons.duckduckgo.com/ip3/${engine.iconHost}.ico`;
      engineIconEl.alt = `${engine.name} Icon`;

      const engineNameText = document.createTextNode(
        `转至 ${engine.name} 搜索`
      );

      engineButtonEl.appendChild(engineIconEl);
      engineButtonEl.appendChild(engineNameText);

      if (engine.shortcutKey) {
        keyboardShortcuts[engine.shortcutKey] = () => engineButtonEl.click();
      }

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
          `script, style, .${CLASSES.keywordHighlight}`
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
        mark.className = CLASSES.keywordHighlight;
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
      .querySelectorAll(`.${CLASSES.keywordHighlight}`)
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

    const searchInputElement = document.querySelector(SELECTORS.searchInput);
    if (!searchInputElement) return;

    const searchQuery = searchInputElement.value.trim();
    if (!searchQuery) return;

    const searchKeywords = searchQuery.split(/\s+/).filter(Boolean);
    if (searchKeywords.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const pageTypeParam = urlParams.get("ia");
    let pageType = "web";
    if (pageTypeParam === "images") pageType = "images";
    else if (pageTypeParam === "videos") pageType = "videos";
    else if (pageTypeParam === "news") pageType = "news";

    const config = highlightSelectorsConfig[pageType];
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
    event.preventDefault();
    event.stopImmediatePropagation();

    isHighlightActive = !isHighlightActive;
    try {
      GM_setValue(STORAGE_KEYS.highlightEnabled, isHighlightActive);
    } catch (e) {}

    const toggleElement = document.getElementById(IDS.highlightToggle);
    if (toggleElement) {
      toggleElement.classList.toggle(
        CLASSES.highlightingDisabled,
        !isHighlightActive
      );
      const button = toggleElement.querySelector("button");
      if (button) button.setAttribute("aria-pressed", isHighlightActive);
    }
    refreshHighlights();
  }

  function insertHighlightToggle() {
    const existingToggle = document.getElementById(IDS.highlightToggle);
    if (existingToggle) return;

    const headerActionsContainer = document.querySelector(
      SELECTORS.headerActions
    );
    if (!headerActionsContainer) return;

    const toggleElement = document.createElement("div");
    toggleElement.id = IDS.highlightToggle;
    toggleElement.classList.toggle(
      CLASSES.highlightingDisabled,
      !isHighlightActive
    );

    const toggleButtonEl = createButton({
      text: TEXTS.highlightToggle,
      ariaLabel: TEXTS.highlightToggle,
      onClick: handleHighlightToggle,
      useCapture: true,
    });
    toggleButtonEl.setAttribute("aria-pressed", isHighlightActive);

    toggleElement.appendChild(toggleButtonEl);

    const firstChild = headerActionsContainer.firstChild;
    if (firstChild) {
      headerActionsContainer.insertBefore(toggleElement, firstChild);
    } else {
      headerActionsContainer.appendChild(toggleElement);
    }

    if (!keyboardShortcuts["h"]) {
      keyboardShortcuts["h"] = () => toggleButtonEl.click();
    }
  }

  function insertDualColumnToggle() {
    const existingToggle = document.getElementById(IDS.dualColumnToggle);
    if (existingToggle) return;

    const headerActionsContainer = document.querySelector(
      SELECTORS.headerActions
    );
    if (!headerActionsContainer) return;

    const highlightToggle = document.getElementById(IDS.highlightToggle);

    const toggleElement = document.createElement("div");
    toggleElement.id = IDS.dualColumnToggle;
    toggleElement.classList.toggle(
      CLASSES.dualColumnActive,
      isDualColumnActive
    );

    const toggleButtonEl = createButton({
      text: TEXTS.dualColumnToggle,
      ariaLabel: TEXTS.dualColumnToggle,
      onClick: handleDualColumnToggle,
      useCapture: true,
    });
    toggleButtonEl.setAttribute("aria-pressed", isDualColumnActive);

    toggleElement.appendChild(toggleButtonEl);

    const referenceNode = highlightToggle
      ? highlightToggle.nextSibling
      : headerActionsContainer.firstChild;
    headerActionsContainer.insertBefore(toggleElement, referenceNode);

    if (!keyboardShortcuts["d"]) {
      keyboardShortcuts["d"] = () => toggleButtonEl.click();
    }
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
    document.body.classList.toggle(CLASSES.dualColumnLayout, shouldApply);
  }

  function handleDualColumnToggle(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    isDualColumnActive = !isDualColumnActive;
    try {
      GM_setValue(STORAGE_KEYS.dualColumnEnabled, isDualColumnActive);
    } catch (e) {}

    applyDualColumnLayout();

    const toggleElement = document.getElementById(IDS.dualColumnToggle);
    if (toggleElement) {
      toggleElement.classList.toggle(
        CLASSES.dualColumnActive,
        isDualColumnActive && getCurrentPageType() === "web"
      );
      const button = toggleElement.querySelector("button");
      if (button) button.setAttribute("aria-pressed", isDualColumnActive);
    }
  }

  function insertCopyLinkButtons() {
    const resultElements = document.querySelectorAll(SELECTORS.webResult);

    resultElements.forEach((resultElement) => {
      if (resultElement.dataset.copyButtonAdded === "true") return;

      const optionsContainer = resultElement.querySelector(
        SELECTORS.webResultOptionsContainer
      );
      const optionsButton = optionsContainer?.querySelector(
        SELECTORS.webResultOptionsButton
      );
      const titleLinkElement = resultElement.querySelector(
        SELECTORS.webResultTitleLink
      );

      if (
        !optionsContainer ||
        !optionsButton ||
        !titleLinkElement ||
        !titleLinkElement.href
      )
        return;

      const copyUrl = titleLinkElement.href;
      const originalContent = `${TEXTS.copyButtonIconSvg} ${TEXTS.copyButtonDefault}`;
      let feedbackTimeoutId = null;

      const copyButton = createButton({
        className: CLASSES.copyLinkButton,
        innerHTML: originalContent,
        ariaLabel: TEXTS.copyButtonDefault,
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          clearTimeout(feedbackTimeoutId);

          navigator.clipboard
            .writeText(copyUrl)
            .then(() => {
              copyButton.innerHTML = `${TEXTS.copyButtonIconSvg} ${TEXTS.copyButtonSuccess}`;
              copyButton.setAttribute("aria-label", TEXTS.copyButtonSuccess);
              copyButton.classList.remove(CLASSES.copyLinkButtonFailed);
              copyButton.classList.add(CLASSES.copyLinkButtonCopied);
              copyButton.disabled = true;

              feedbackTimeoutId = setTimeout(() => {
                if (
                  copyButton.classList.contains(CLASSES.copyLinkButtonCopied)
                ) {
                  copyButton.innerHTML = originalContent;
                  copyButton.setAttribute(
                    "aria-label",
                    TEXTS.copyButtonDefault
                  );
                  copyButton.classList.remove(CLASSES.copyLinkButtonCopied);
                  copyButton.disabled = false;
                }
              }, CONFIG_VALUES.copyFeedbackDuration);
            })
            .catch((err) => {
              copyButton.innerHTML = `${TEXTS.copyButtonIconSvg} ${TEXTS.copyButtonFailure}`;
              copyButton.setAttribute("aria-label", TEXTS.copyButtonFailure);
              copyButton.classList.remove(CLASSES.copyLinkButtonCopied);
              copyButton.classList.add(CLASSES.copyLinkButtonFailed);
              copyButton.disabled = true;

              feedbackTimeoutId = setTimeout(() => {
                if (
                  copyButton.classList.contains(CLASSES.copyLinkButtonFailed)
                ) {
                  copyButton.innerHTML = originalContent;
                  copyButton.setAttribute(
                    "aria-label",
                    TEXTS.copyButtonDefault
                  );
                  copyButton.classList.remove(CLASSES.copyLinkButtonFailed);
                  copyButton.disabled = false;
                }
              }, CONFIG_VALUES.copyFeedbackDuration);
            });
        },
      });

      optionsContainer.insertBefore(copyButton, optionsButton);
      resultElement.dataset.copyButtonAdded = "true";
    });

    document.querySelectorAll(`.${CLASSES.copyLinkButton}`).forEach((btn) => {
      if (!btn.closest(SELECTORS.webResult)) {
        btn.remove();
      }
    });
  }

  function applyExactPhrase() {
    const input = document.querySelector(SELECTORS.searchInput);
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
    const input = document.querySelector(SELECTORS.searchInput);
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
    const input = document.querySelector(SELECTORS.searchInput);
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
    if (document.getElementById(IDS.syntaxShortcutsContainer)) return;

    const searchArea = document.querySelector(SELECTORS.headerSearchArea);
    if (!searchArea || !searchArea.firstChild) return;

    const shortcutsContainer = document.createElement("div");
    shortcutsContainer.id = IDS.syntaxShortcutsContainer;

    syntaxShortcutsConfig.forEach((config) => {
      const button = createButton({
        className: CLASSES.syntaxShortcutButton,
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
    const highlightToggleElement = document.getElementById(IDS.highlightToggle);
    if (highlightToggleElement) {
      highlightToggleElement.classList.toggle(
        CLASSES.highlightingDisabled,
        !isHighlightActive
      );
      const button = highlightToggleElement.querySelector("button");
      if (button) button.setAttribute("aria-pressed", isHighlightActive);
    }
    const dualColToggleElement = document.getElementById(IDS.dualColumnToggle);
    if (dualColToggleElement) {
      dualColToggleElement.classList.toggle(
        CLASSES.dualColumnActive,
        isDualColumnActive && getCurrentPageType() === "web"
      );
      const button = dualColToggleElement.querySelector("button");
      if (button) button.setAttribute("aria-pressed", isDualColumnActive);
    }
    refreshHighlights();
  }

  function runPageEnhancements() {
    const isSearchFormPresent = document.querySelector(SELECTORS.searchForm);

    if (isSearchFormPresent) {
      insertSyntaxShortcuts();
      insertEngineButtons();
    }

    insertHighlightToggle();
    insertDualColumnToggle();
    insertCopyLinkButtons();

    initializeFeatureState();
  }

  const debouncedRunPageEnhancements = debounce(
    runPageEnhancements,
    CONFIG_VALUES.domObserverDelay
  );

  function navigateTabs(dir) {
    const allTabElements = Array.from(
      document.querySelectorAll(SELECTORS.navTab)
    );
    if (allTabElements.length === 0) return;

    const visibleTabElements = allTabElements.filter(
      (tab) => tab.textContent.trim() !== TEXTS.excludedNavTabText
    );
    if (visibleTabElements.length === 0) return;

    const currentTabIndex = allTabElements.findIndex((tab) =>
      tab.classList.contains(CLASSES.activeNavTab)
    );
    let isMapTabActive = false;
    let activeTabIndexInVisible = -1;

    if (currentTabIndex !== -1) {
      if (
        allTabElements[currentTabIndex].textContent.trim() ===
        TEXTS.excludedNavTabText
      ) {
        isMapTabActive = true;
      } else {
        activeTabIndexInVisible = visibleTabElements.findIndex((tab) =>
          tab.classList.contains(CLASSES.activeNavTab)
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

  keyboardShortcuts["="] = () => navigateTabs("next");
  keyboardShortcuts["+"] = () => navigateTabs("next");
  keyboardShortcuts["-"] = () => navigateTabs("prev");

  document.addEventListener("keydown", function handleKeyDown(event) {
    if (!event.ctrlKey && !event.altKey) return;

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

    const keyName = event.key.toLowerCase();
    const shortcutAction = keyboardShortcuts[keyName];

    if (shortcutAction) {
      event.preventDefault();
      shortcutAction();
    }
  });

  const domObserver = new MutationObserver(debouncedRunPageEnhancements);

  function observeDOM() {
    runPageEnhancements();
    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", observeDOM);
  } else {
    observeDOM();
  }
})();

// ==UserScript==
// @name               DeepSeek ShortCuts
// @name:zh-CN         DeepSeek快捷键
// @name:zh-TW         DeepSeek快捷鍵
// @description        Keyboard Shortcuts For DeepSeek (Mac & Windows & Linux)
// @description:zh-CN  为DeepSeek提供快捷键支持（Mac & Windows & Linux）
// @description:zh-TW  為DeepSeek提供快捷鍵支持（Mac & Windows & Linux）
// @version            1.4.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/DeepSeekShortcutsIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              https://chat.deepseek.com/*
// @grant              GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  const helpPanelStyles = `
    .ShortcutsHelpPanel {
      --panel-bg-color: rgba(44, 44, 46, 0.85);
      --panel-text-color: rgba(255, 255, 255, 0.9);
      --panel-secondary-text-color: rgba(235, 235, 245, 0.6);
      --panel-border-color: rgba(84, 84, 88, 0.65);
      --panel-padding: 24px;
      --panel-radius: 12px;
      --key-bg-color: rgba(118, 118, 128, 0.24);
      --warning-bg-color: rgba(118, 118, 128, 0.24);
      --warning-border-color: rgba(84, 84, 88, 0.65);
      --warning-text-color: rgb(255, 159, 10);
      --font-stack: system-ui, sans-serif;
      --closebtn-color: #FF5F57;
      --closebtn-hover-color: #E0443E;
      --closebtn-symbol-color: #4D0000;

      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -48%) scale(0.95);
      z-index: 9999;
      pointer-events: none;
      visibility: hidden;
      min-width: 280px;
      max-width: 450px;
      padding: var(--panel-padding);
      border: 0.5px solid var(--panel-border-color);
      border-radius: var(--panel-radius);
      background: var(--panel-bg-color);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px) saturate(180%);
      color: var(--panel-text-color);
      font-family: var(--font-stack);
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
      opacity: 0;
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out, visibility 0s linear 0.3s;
      display: flex;
      flex-direction: column;
    }
    .ShortcutsHelpPanel.visible {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      pointer-events: auto;
      visibility: visible;
      transition-delay: 0s;
    }
    .ShortcutsHelpCloseButton {
      position: absolute;
      top: 14px;
      left: 14px;
      width: 12px;
      height: 12px;
      padding: 0;
      border: 0.5px solid rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      background-color: var(--closebtn-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.15s ease;
      appearance: none;
      -webkit-appearance: none;
    }
     .ShortcutsHelpCloseButton::before {
      content: '×';
      display: block;
      color: transparent;
      font-size: 11px;
      font-weight: bold;
      line-height: 12px;
      text-align: center;
      transition: color 0.15s ease;
    }
    .ShortcutsHelpCloseButton:hover {
      background-color: var(--closebtn-hover-color);
    }
    .ShortcutsHelpCloseButton:hover::before {
      color: var(--closebtn-symbol-color);
    }
    .ShortcutsHelpCloseButton:active {
      background-color: var(--closebtn-hover-color);
      filter: brightness(0.9);
    }
    .ShortcutsHelpTitle {
      margin: 0 0 15px 0;
      width: 100%;
      color: var(--panel-text-color);
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      padding-top: 5px;
      flex-shrink: 0;
    }
    .ShortcutsHelpContent {
      flex-grow: 1;
      overflow-y: auto;
      max-height: 65vh;
      margin-right: -10px;
      padding-right: 10px;
      scrollbar-width: thin;
      scrollbar-color: rgba(235, 235, 245, 0.3) transparent;
    }
    .ShortcutsHelpContent::-webkit-scrollbar {
      width: 6px;
    }
    .ShortcutsHelpContent::-webkit-scrollbar-track {
      background: transparent;
      margin: 5px 0;
    }
    .ShortcutsHelpContent::-webkit-scrollbar-thumb {
      background-color: rgba(235, 235, 245, 0.4);
      border-radius: 3px;
    }
    .ShortcutsHelpContent::-webkit-scrollbar-thumb:hover {
      background-color: rgba(235, 235, 245, 0.6);
    }
    .ShortcutsHelpRow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding: 5px 0;
    }
    .ShortcutsHelpContent > .ShortcutsHelpRow:last-child {
        margin-bottom: 0;
    }
    .ShortcutsHelpKey {
      min-width: 90px;
      padding: 4px 8px;
      margin-left: 16px;
      background: var(--key-bg-color);
      border: 0.5px solid var(--panel-border-color);
      border-radius: 5px;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
      color: var(--panel-text-color);
      font-family: inherit;
      font-size: 13px;
      text-align: center;
      flex-shrink: 0;
    }
    .ShortcutsHelpDesc {
      flex-grow: 1;
      padding-right: 10px;
      color: var(--panel-secondary-text-color);
    }
    .ShortcutsHelpWarning {
      margin-top: 18px;
      padding: 12px;
      background: var(--warning-bg-color);
      border: 0.5px solid var(--warning-border-color);
      border-radius: 8px;
      color: var(--warning-text-color);
      font-size: 12px;
      line-height: 1.5;
      text-align: center;
      flex-shrink: 0;
    }
  `;

  if (typeof GM_addStyle === "function") {
    GM_addStyle(helpPanelStyles);
  } else {
    const styleElement = document.createElement("style");
    styleElement.textContent = helpPanelStyles;
    document.head.appendChild(styleElement);
  }

  const createFinder = (config) => () => {
    const {
      selector,
      filterCriteria,
      position = "first",
      parentSelector,
      parentPosition = "last",
      childPosition = "first",
    } = config;

    if (parentSelector) {
      const parents = Array.from(document.querySelectorAll(parentSelector));
      if (parents.length === 0) return null;
      const parentIndex = parentPosition === "last" ? parents.length - 1 : 0;
      const targetParent = parents[parentIndex];
      if (!targetParent) return null;
      const children = Array.from(targetParent.querySelectorAll(selector));
      if (children.length === 0) return null;
      const childIndex = childPosition === "last" ? children.length - 1 : 0;
      return children[childIndex] || null;
    } else {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length === 0) return null;
      if (filterCriteria) {
        return (
          elements.find(
            (element) =>
              element.textContent?.includes(filterCriteria) ||
              element.querySelector(filterCriteria)
          ) || null
        );
      } else {
        const index = position === "last" ? elements.length - 1 : 0;
        return elements[index] || null;
      }
    }
  };

  const findRegenerate = createFinder({
    selector: ".ds-icon-button",
    filterCriteria: "#重新生成",
  });
  const findContinue = createFinder({
    selector: ".ds-button",
    filterCriteria: "继续生成",
  });
  const findStop = createFinder({
    selector: "._7436101",
    position: "first",
  });
  const findLastCopy = createFinder({
    parentSelector: "div._4f9bf79.d7dc56a8",
    parentPosition: "last",
    selector: "._965abe9 .ds-icon-button",
    childPosition: "first",
  });
  const findLastEdit = createFinder({
    parentSelector: "._9663006",
    parentPosition: "last",
    selector: "._78e0558 .ds-icon-button",
    childPosition: "last",
  });
  const findDeepThink = createFinder({
    selector: ".ds-button span",
    filterCriteria: "深度思考",
  });
  const findSearch = createFinder({
    selector: ".ds-button span",
    filterCriteria: "联网搜索",
  });
  const findUpload = createFinder({
    selector: ".f02f0e25",
    position: "first",
  });
  const findNewChat = createFinder({
    selector: "._217e214",
    position: "first",
  });
  const findToggleSidebar = createFinder({
    selector: ".ds-icon-button",
    filterCriteria: "svg #打开边栏0730, svg #折叠边栏0730",
  });
  const findChatMenu = createFinder({
    parentSelector: "._83421f9.b64fb9ae",
    parentPosition: "last",
    selector: "._2090548",
    childPosition: "first",
  });

  const getModifiers = () => {
    const isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent);
    return {
      Character: isMac ? "Control" : "Alt",
      Property: isMac ? "ctrlKey" : "altKey",
    };
  };

  const modifierKeys = getModifiers();

  const shortcutDefs = [
    [`${modifierKeys.Character} + R`, "重新生成回答"],
    [`${modifierKeys.Character} + C`, "继续生成回答"],
    [`${modifierKeys.Character} + Q`, "中断当前生成"],
    [`${modifierKeys.Character} + K`, "复制末条回答"],
    [`${modifierKeys.Character} + E`, "编辑末次提问"],
    [`${modifierKeys.Character} + D`, "深度思考模式"],
    [`${modifierKeys.Character} + S`, "联网搜索模式"],
    [`${modifierKeys.Character} + U`, "上传本地文件"],
    [`${modifierKeys.Character} + N`, "新建对话窗口"],
    [`${modifierKeys.Character} + T`, "切换开关边栏"],
    [`${modifierKeys.Character} + I`, "当前对话菜单"],
    [`${modifierKeys.Character} + H`, "快捷按键帮助"],
  ];

  let helpPanelElement = null;

  const createHelpPanel = () => {
    const panelElement = document.createElement("div");
    panelElement.classList.add("ShortcutsHelpPanel");

    const closeButton = document.createElement("button");
    closeButton.classList.add("ShortcutsHelpCloseButton");
    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      closeHelpPanel();
    });

    const titleElement = document.createElement("h3");
    titleElement.textContent = "快捷按键指北";
    titleElement.classList.add("ShortcutsHelpTitle");

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("ShortcutsHelpContent");

    panelElement.append(closeButton, titleElement);

    shortcutDefs.forEach(([keyShortcut, description]) => {
      const rowElement = document.createElement("div");
      rowElement.classList.add("ShortcutsHelpRow");

      const keyElement = document.createElement("span");
      keyElement.textContent = keyShortcut;
      keyElement.classList.add("ShortcutsHelpKey");

      const descriptionElement = document.createElement("span");
      descriptionElement.textContent = description;
      descriptionElement.classList.add("ShortcutsHelpDesc");

      rowElement.append(descriptionElement, keyElement);
      contentDiv.append(rowElement);
    });

    panelElement.append(contentDiv);

    const warningElement = document.createElement("div");
    warningElement.textContent = "⚠️ 脚本依UA自动适配快捷键 篡改UA或致功能异常";
    warningElement.classList.add("ShortcutsHelpWarning");
    panelElement.append(warningElement);

    document.body.append(panelElement);
    return panelElement;
  };

  const handleOutsideClick = (mouseEvent) => {
    if (
      helpPanelElement &&
      helpPanelElement.classList.contains("visible") &&
      !helpPanelElement.contains(mouseEvent.target) &&
      !mouseEvent.target.classList.contains("ShortcutsHelpCloseButton")
    ) {
      closeHelpPanel();
    }
  };

  const toggleHelpPanel = (panelElement) => {
    if (!panelElement) {
      return;
    }
    const isVisible = panelElement.classList.contains("visible");
    if (isVisible) {
      panelElement.classList.remove("visible");
      window.removeEventListener("click", handleOutsideClick, true);
    } else {
      panelElement.classList.add("visible");
      setTimeout(() => {
        window.addEventListener("click", handleOutsideClick, true);
      }, 0);
    }
  };

  const initHelpPanel = () => {
    if (!helpPanelElement) {
      helpPanelElement = createHelpPanel();
    }
  };

  const closeHelpPanel = () => {
    if (helpPanelElement && helpPanelElement.classList.contains("visible")) {
      helpPanelElement.classList.remove("visible");
      window.removeEventListener("click", handleOutsideClick, true);
    }
  };

  const safeClick = (finderFunction) => {
    const element = finderFunction();
    if (element) {
      element.click();
    }
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executeDebounced(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const toggleHelpPanelAction = () => {
    initHelpPanel();
    if (helpPanelElement) {
      toggleHelpPanel(helpPanelElement);
    }
  };

  const debouncedToggleHelpPanel = debounce(toggleHelpPanelAction, 150);

  const keyActionMap = {
    r: () => safeClick(findRegenerate),
    c: () => safeClick(findContinue),
    q: () => safeClick(findStop),
    k: () => safeClick(findLastCopy),
    e: () => safeClick(findLastEdit),
    d: () => safeClick(findDeepThink),
    s: () => safeClick(findSearch),
    u: () => safeClick(findUpload),
    n: () => safeClick(findNewChat),
    t: () => safeClick(findToggleSidebar),
    i: () => safeClick(findChatMenu),
    h: () => {
      debouncedToggleHelpPanel();
      return true;
    },
  };

  const createKeyHandler = () => {
    const isModifierKeyPressed = (keyboardEvent) =>
      keyboardEvent[modifierKeys.Property];

    return (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        if (
          helpPanelElement &&
          helpPanelElement.classList.contains("visible")
        ) {
          closeHelpPanel();
          keyboardEvent.preventDefault();
          keyboardEvent.stopPropagation();
        }
        return;
      }

      if (!isModifierKeyPressed(keyboardEvent)) {
        return;
      }

      const pressedKey = keyboardEvent.key.toLowerCase();
      const actionFunction = keyActionMap[pressedKey];

      if (actionFunction) {
        const actionResult = actionFunction(keyboardEvent);
        if (actionResult !== false) {
          keyboardEvent.preventDefault();
          keyboardEvent.stopPropagation();
        }
      }
    };
  };

  const mainKeyHandler = createKeyHandler();
  window.addEventListener("keydown", mainKeyHandler, true);
})();

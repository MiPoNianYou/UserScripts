// ==UserScript==
// @name               DeepSeek ShortCuts
// @name:zh-CN         DeepSeek 快捷键
// @name:zh-TW         DeepSeek 快捷鍵
// @description        Keyboard Shortcuts For DeepSeek | Support Custom Shortcut Keys
// @description:zh-CN  为DeepSeek提供快捷键支持 | 支持自定义快捷键
// @description:zh-TW  為DeepSeek提供快捷鍵支援 | 支援自定義快捷鍵
// @version            1.5.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/DeepSeekShortcutsIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              https://chat.deepseek.com/*
// @grant              GM_addStyle
// @grant              GM_setValue
// @grant              GM_getValue
// ==/UserScript==

(function () {
  "use strict";

  const UI_SETTINGS = {
    FONT_STACK: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    ANIMATION_DURATION_MS: 350,
    ANIMATION_EASING_POP_OUT: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    ANIMATION_EASING_STANDARD_INTERACTIVE: "cubic-bezier(0, 0, 0.58, 1)",
    BREATHING_ANIMATION_DURATION: "2.2s",
    DEBOUNCE_DELAY_MS: 150,
  };

  const STORAGE_KEYS = {
    CUSTOM_SHORTCUTS_PREFIX: "dsk_custom_shortcuts_",
  };

  const ELEMENT_SELECTORS = {
    REGENERATE_BUTTON: {
      selector: ".ds-icon-button",
      filterText: "#重新生成",
    },
    CONTINUE_BUTTON: {
      selector: ".ds-button",
      filterText: "继续生成",
    },
    STOP_GENERATING_BUTTON: {
      selector: "._7436101",
      position: "first",
    },
    LAST_COPY_BUTTON: {
      parentSelector: "div._4f9bf79.d7dc56a8",
      parentPosition: "last",
      selector: "._965abe9 .ds-icon-button",
      childPosition: "first",
    },
    LAST_EDIT_BUTTON: {
      parentSelector: "._9663006",
      parentPosition: "last",
      selector: "._78e0558 .ds-icon-button",
      childPosition: "last",
    },
    DEEP_THINK_MODE_BUTTON: {
      selector: ".ds-button span",
      filterText: "深度思考",
    },
    SEARCH_MODE_BUTTON: {
      selector: ".ds-button span",
      filterText: "联网搜索",
    },
    UPLOAD_FILE_BUTTON: {
      selector: ".f02f0e25",
      position: "first",
    },
    NEW_CHAT_BUTTON: {
      selector: "._217e214",
      position: "first",
    },
    TOGGLE_SIDEBAR_BUTTON: {
      selector: ".ds-icon-button",
      filterText: "svg #打开边栏0730, svg #折叠边栏0730",
    },
    CURRENT_CHAT_MENU_BUTTON: {
      parentSelector: "._83421f9.b64fb9ae",
      parentPosition: "last",
      selector: "._2090548",
      childPosition: "first",
    },
  };

  const ELEMENT_IDS = {
    HELP_PANEL: "dsk-help-panel",
    HELP_PANEL_ANIMATE_IN: "dsk-help-panel-animate-in",
    HELP_PANEL_ANIMATE_OUT: "dsk-help-panel-animate-out",
  };

  const CSS_CLASSES = {
    HELP_PANEL_VISIBLE: "dsk-help-panel--visible",
    HELP_PANEL_CLOSE_BUTTON: "dsk-help-panel-close-button",
    HELP_PANEL_TITLE: "dsk-help-panel-title",
    HELP_PANEL_CONTENT: "dsk-help-panel-content",
    HELP_PANEL_ROW: "dsk-help-panel-row",
    HELP_PANEL_KEY: "dsk-help-panel-key",
    HELP_PANEL_KEY_DISPLAY: "dsk-help-panel-key--display",
    HELP_PANEL_KEY_SETTING: "dsk-help-panel-key--setting",
    HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT:
      "dsk-help-panel-key--configurable-highlight",
    HELP_PANEL_KEY_LISTENING: "dsk-help-panel-key--listening",
    HELP_PANEL_KEY_INVALID_SHAKE: "dsk-key-invalid-shake",
    HELP_PANEL_DESCRIPTION: "dsk-help-panel-description",
    HELP_PANEL_WARNING: "dsk-help-panel-warning",
  };

  const UI_STRINGS = {
    HELP_PANEL_TITLE: "快捷按键指北",
    HELP_PANEL_WARNING_TEXT: "⚠️ 脚本依UA自动适配快捷键 篡改UA或致功能异常",
    CUSTOMIZE_SHORTCUTS_LABEL: "自定义快捷键",
    SETTINGS_BUTTON_TEXT: "设置自定按键",
    FINISH_CUSTOMIZING_BUTTON_TEXT: "完成自定设置",
    PRESS_NEW_SHORTCUT_TEXT: "请按下快捷键",
    KEY_CONFLICT_TEXT_PREFIX: "键 「",
    KEY_CONFLICT_TEXT_SUFFIX: "」 已被使用",
    INVALID_MODIFIER_TEXT_PREFIX: "请按 ",
    INVALID_MODIFIER_TEXT_SUFFIX: " + 字母/数字",
  };

  let currentKeybindingConfig = {
    MODIFIERS: (() => {
      const isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent);
      return {
        CHARACTER_DISPLAY: isMac ? "Control" : "Alt",
        EVENT_PROPERTY: isMac ? "ctrlKey" : "altKey",
      };
    })(),
    SHORTCUTS: [
      {
        id: "regenerate",
        key: "R",
        description: "重新生成回答",
        selectorConfig: ELEMENT_SELECTORS.REGENERATE_BUTTON,
      },
      {
        id: "continueGenerating",
        key: "C",
        description: "继续生成回答",
        selectorConfig: ELEMENT_SELECTORS.CONTINUE_BUTTON,
      },
      {
        id: "stopGenerating",
        key: "Q",
        description: "中断当前生成",
        selectorConfig: ELEMENT_SELECTORS.STOP_GENERATING_BUTTON,
      },
      {
        id: "copyLastResponse",
        key: "K",
        description: "复制末条回答",
        selectorConfig: ELEMENT_SELECTORS.LAST_COPY_BUTTON,
      },
      {
        id: "editLastQuery",
        key: "E",
        description: "编辑末次提问",
        selectorConfig: ELEMENT_SELECTORS.LAST_EDIT_BUTTON,
      },
      {
        id: "deepThinkMode",
        key: "D",
        description: "深度思考模式",
        selectorConfig: ELEMENT_SELECTORS.DEEP_THINK_MODE_BUTTON,
      },
      {
        id: "searchMode",
        key: "S",
        description: "联网搜索模式",
        selectorConfig: ELEMENT_SELECTORS.SEARCH_MODE_BUTTON,
      },
      {
        id: "uploadFile",
        key: "U",
        description: "上传本地文件",
        selectorConfig: ELEMENT_SELECTORS.UPLOAD_FILE_BUTTON,
      },
      {
        id: "newChat",
        key: "N",
        description: "新建对话窗口",
        selectorConfig: ELEMENT_SELECTORS.NEW_CHAT_BUTTON,
      },
      {
        id: "toggleSidebar",
        key: "T",
        description: "切换开关边栏",
        selectorConfig: ELEMENT_SELECTORS.TOGGLE_SIDEBAR_BUTTON,
      },
      {
        id: "currentChatMenu",
        key: "I",
        description: "当前对话菜单",
        selectorConfig: ELEMENT_SELECTORS.CURRENT_CHAT_MENU_BUTTON,
      },
      {
        id: "toggleHelpPanel",
        key: "H",
        description: "快捷按键帮助",
        actionIdentifier: "toggleHelpPanel",
        isSpecialAction: true,
      },
      {
        id: "settingsEntry",
        key: null,
        description: UI_STRINGS.CUSTOMIZE_SHORTCUTS_LABEL,
        isSettingsEntry: true,
        actionIdentifier: "toggleCustomizationMode",
        nonConfigurable: true,
      },
    ],
  };

  let helpPanelElement = null;
  let keydownEventListener = null;
  let isCustomizingShortcuts = false;
  let activeCustomizationTarget = null;
  const shortcutDisplaySpansMap = new Map();
  let panelCloseTimer = null;

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

        --dsk-panel-bg: rgba(41, 44, 60, 0.85);
        --dsk-panel-border: rgba(65, 69, 89, 0.5);
        --dsk-panel-shadow:
            0 1px 3px rgba(var(--ctp-frappe-crust-rgb), 0.12),
            0 6px 16px rgba(var(--ctp-frappe-crust-rgb), 0.10),
            0 12px 28px rgba(var(--ctp-frappe-crust-rgb), 0.08);
        --dsk-text-primary: var(--ctp-frappe-text);
        --dsk-text-secondary: var(--ctp-frappe-subtext0);
        --dsk-key-bg: var(--ctp-frappe-surface0);
        --dsk-key-border: var(--ctp-frappe-surface1);
        --dsk-key-setting-text: var(--ctp-frappe-blue);
        --dsk-key-setting-hover-bg: var(--ctp-frappe-surface1);
        --dsk-key-breathing-highlight-color: var(--ctp-frappe-mauve);
        --dsk-key-listening-border: var(--ctp-frappe-green);
        --dsk-key-listening-bg: color-mix(in srgb, var(--dsk-key-bg) 85%, var(--ctp-frappe-green) 15%);
        --dsk-key-invalid-shake-color: var(--ctp-frappe-red);
        --dsk-warning-bg: rgba(65, 69, 89, 0.5);
        --dsk-warning-border: var(--ctp-frappe-surface1);
        --dsk-warning-text: var(--ctp-frappe-yellow);
        --dsk-scrollbar-thumb: var(--ctp-frappe-overlay0);
        --dsk-scrollbar-thumb-hover: var(--ctp-frappe-overlay1);
        --dsk-close-button-bg: var(--ctp-frappe-red);
        --dsk-close-button-hover-bg: color-mix(in srgb, var(--ctp-frappe-red) 80%, var(--ctp-frappe-crust) 20%);
        --dsk-close-button-symbol: rgba(var(--ctp-frappe-crust-rgb), 0.7);
      }

      @keyframes dsk-opacity-breathing-effect {
        0%, 100% {
          opacity: 0;
        }
        50% {
          opacity: 0.25;
        }
      }

      @keyframes dsk-border-breathing-effect {
        0%, 100% {
          border-color: var(--dsk-key-border);
        }
        50% {
          border-color: var(--dsk-key-breathing-highlight-color);
        }
      }

      @keyframes dsk-invalid-shake-effect {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
        20%, 40%, 60%, 80% { transform: translateX(3px); }
      }

      @keyframes ${ELEMENT_IDS.HELP_PANEL_ANIMATE_IN} {
        0% {
            transform: translate(-50%, -50%) scale(0.88);
            opacity: 0;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
      }

      @keyframes ${ELEMENT_IDS.HELP_PANEL_ANIMATE_OUT} {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
        }
      }

      #${ELEMENT_IDS.HELP_PANEL} {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.88);
        opacity: 0;
        visibility: hidden;
        z-index: 2147483647;
        min-width: 300px;
        max-width: 480px;
        padding: 24px;
        border: 1px solid var(--dsk-panel-border);
        border-radius: 16px;
        background-color: var(--dsk-panel-bg);
        color: var(--dsk-text-primary);
        font-family: ${UI_SETTINGS.FONT_STACK};
        font-size: 14px;
        font-weight: 500;
        line-height: 1.5;
        box-shadow: var(--dsk-panel-shadow);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        display: flex;
        flex-direction: column;
        pointer-events: none;
      }

      #${ELEMENT_IDS.HELP_PANEL}.${CSS_CLASSES.HELP_PANEL_VISIBLE} {
        pointer-events: auto;
      }

      .${CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON} {
        position: absolute;
        top: 14px;
        left: 14px;
        width: 12px;
        height: 12px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background-color: var(--dsk-close-button-bg);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s ${UI_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE},
                    transform 0.15s ${UI_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE};
        appearance: none;
        -webkit-appearance: none;
        outline: none;
      }

      .${CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON}::before {
        content: '✕';
        display: block;
        color: transparent;
        font-size: 10px;
        font-weight: bold;
        line-height: 12px;
        text-align: center;
        transition: color 0.1s ${UI_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE};
      }

      .${CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON}:hover {
        background-color: var(--dsk-close-button-hover-bg);
      }

      .${CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON}:hover::before {
        color: var(--dsk-close-button-symbol);
      }

      .${CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON}:active {
        filter: brightness(0.85);
        transform: scale(0.9);
      }

      .${CSS_CLASSES.HELP_PANEL_TITLE} {
        margin: 0 0 18px 0;
        padding-top: 8px;
        color: var(--dsk-text-primary);
        font-size: 17px;
        font-weight: 600;
        text-align: center;
        flex-shrink: 0;
      }

      .${CSS_CLASSES.HELP_PANEL_CONTENT} {
        flex-grow: 1;
        overflow-y: auto;
        max-height: 60vh;
        margin-right: -12px;
        padding-right: 12px;
        scrollbar-width: thin;
        scrollbar-color: var(--dsk-scrollbar-thumb) transparent;
      }

      .${CSS_CLASSES.HELP_PANEL_CONTENT}::-webkit-scrollbar {
        width: 6px;
      }

      .${CSS_CLASSES.HELP_PANEL_CONTENT}::-webkit-scrollbar-track {
        background: transparent;
        margin: 4px 0;
      }

      .${CSS_CLASSES.HELP_PANEL_CONTENT}::-webkit-scrollbar-thumb {
        background-color: var(--dsk-scrollbar-thumb);
        border-radius: 3px;
        transition: background-color 0.15s ${UI_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE};
      }

      .${CSS_CLASSES.HELP_PANEL_CONTENT}::-webkit-scrollbar-thumb:hover {
        background-color: var(--dsk-scrollbar-thumb-hover);
      }

      .${CSS_CLASSES.HELP_PANEL_ROW} {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 6px 2px;
      }

      .${CSS_CLASSES.HELP_PANEL_CONTENT} > .${CSS_CLASSES.HELP_PANEL_ROW}:last-child {
        margin-bottom: 0;
      }

      .${CSS_CLASSES.HELP_PANEL_KEY} {
        min-width: 95px;
        padding: 5px 10px;
        margin-left: 18px;
        background-color: var(--dsk-key-bg);
        border: 1px solid var(--dsk-key-border);
        border-radius: 6px;
        box-shadow: 0 1px 1px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.03);
        color: var(--dsk-text-primary);
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        text-align: center;
        flex-shrink: 0;
        transition: background-color 0.15s ${UI_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE},
                    border-color 0.15s ${UI_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE},
                    color 0.15s ${UI_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE};
        cursor: default;
        position: relative;
      }

      .${CSS_CLASSES.HELP_PANEL_KEY}.${CSS_CLASSES.HELP_PANEL_KEY_DISPLAY} {
      }

      .${CSS_CLASSES.HELP_PANEL_KEY}.${CSS_CLASSES.HELP_PANEL_KEY_SETTING} {
        color: var(--dsk-key-setting-text);
        cursor: pointer;
      }

      .${CSS_CLASSES.HELP_PANEL_KEY}.${CSS_CLASSES.HELP_PANEL_KEY_SETTING}:hover {
        background-color: var(--dsk-key-setting-hover-bg);
        border-color: var(--ctp-frappe-overlay0);
      }

      .${CSS_CLASSES.HELP_PANEL_KEY}.${CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT} {
        animation: dsk-border-breathing-effect ${UI_SETTINGS.BREATHING_ANIMATION_DURATION} infinite ease-in-out;
        cursor: pointer;
      }

      .${CSS_CLASSES.HELP_PANEL_KEY}.${CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT}::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: inherit;
        background-color: var(--dsk-key-breathing-highlight-color);
        opacity: 0;
        z-index: 0;
        pointer-events: none;
        animation: dsk-opacity-breathing-effect ${UI_SETTINGS.BREATHING_ANIMATION_DURATION} infinite ease-in-out;
      }

      .${CSS_CLASSES.HELP_PANEL_KEY}.${CSS_CLASSES.HELP_PANEL_KEY_LISTENING} {
        border-color: var(--dsk-key-listening-border) !important;
        background-color: var(--dsk-key-listening-bg) !important;
        color: var(--ctp-frappe-green) !important;
        animation: none !important;
        cursor: default !important;
      }
      .${CSS_CLASSES.HELP_PANEL_KEY}.${CSS_CLASSES.HELP_PANEL_KEY_LISTENING}::after {
        animation: none !important;
        opacity: 0 !important;
      }

      .${CSS_CLASSES.HELP_PANEL_KEY}.${CSS_CLASSES.HELP_PANEL_KEY_INVALID_SHAKE} {
         animation: dsk-invalid-shake-effect 0.5s ${UI_SETTINGS.ANIMATION_EASING_STANDARD_DEFAULT};
         border-color: var(--dsk-key-invalid-shake-color) !important;
         color: var(--dsk-key-invalid-shake-color) !important;
      }


      .${CSS_CLASSES.HELP_PANEL_DESCRIPTION} {
        flex-grow: 1;
        padding-right: 10px;
        color: var(--dsk-text-secondary);
        font-size: 13.5px;
      }

      .${CSS_CLASSES.HELP_PANEL_WARNING} {
        margin-top: 20px;
        padding: 12px 16px;
        background-color: var(--dsk-warning-bg);
        border: 1px solid var(--dsk-warning-border);
        border-radius: 10px;
        color: var(--dsk-warning-text);
        font-size: 12.5px;
        font-weight: 500;
        line-height: 1.45;
        text-align: center;
        flex-shrink: 0;
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

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function getElementByConfig(config) {
    if (!config || !config.selector) return null;
    const {
      selector,
      filterText,
      position = "first",
      parentSelector,
      parentPosition = "last",
      childPosition = "first",
    } = config;

    let targetElements = [];

    if (parentSelector) {
      const parents = Array.from(document.querySelectorAll(parentSelector));
      if (parents.length === 0) return null;
      const parentIndex = parentPosition === "last" ? parents.length - 1 : 0;
      const targetParent = parents[parentIndex];
      if (!targetParent) return null;
      targetElements = Array.from(targetParent.querySelectorAll(selector));
    } else {
      targetElements = Array.from(document.querySelectorAll(selector));
    }

    if (targetElements.length === 0) return null;

    if (filterText) {
      const filters = filterText.split(",").map((f) => f.trim());
      const foundElement = targetElements.find((element) =>
        filters.some(
          (ft) =>
            element.textContent?.includes(ft) ||
            (ft.startsWith("svg #") &&
              element.querySelector(ft.replace("svg ", "")))
        )
      );
      return foundElement || null;
    } else {
      const index =
        position === "last"
          ? targetElements.length - 1
          : childPosition === "last"
          ? targetElements.length - 1
          : 0;
      return targetElements[index] || null;
    }
  }

  function triggerElementClick(elementConfig) {
    const element = getElementByConfig(elementConfig);
    if (element && typeof element.click === "function") {
      element.click();
      return true;
    }
    return false;
  }

  function formatShortcutForDisplay(shortcutKey) {
    if (!shortcutKey) return "---";
    return `${
      currentKeybindingConfig.MODIFIERS.CHARACTER_DISPLAY
    } + ${shortcutKey.toUpperCase()}`;
  }

  function updateShortcutDisplay(shortcutId, newKey) {
    const spanElement = shortcutDisplaySpansMap.get(shortcutId);
    if (spanElement) {
      spanElement.textContent = newKey
        ? formatShortcutForDisplay(newKey)
        : UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
    }
  }

  function saveCustomShortcut(shortcutId, newKey) {
    const shortcutToUpdate = currentKeybindingConfig.SHORTCUTS.find(
      (s) => s.id === shortcutId
    );
    if (shortcutToUpdate) {
      shortcutToUpdate.key = newKey.toUpperCase();
      try {
        GM_setValue(
          `${STORAGE_KEYS.CUSTOM_SHORTCUTS_PREFIX}${shortcutId}`,
          shortcutToUpdate.key
        );
      } catch (e) {}

      if (keydownEventListener) {
        window.removeEventListener("keydown", keydownEventListener, true);
      }
      keydownEventListener = createKeyboardEventHandler();
      window.addEventListener("keydown", keydownEventListener, true);
    }
  }

  function loadCustomShortcuts() {
    currentKeybindingConfig.SHORTCUTS.forEach((shortcut) => {
      if (shortcut.nonConfigurable || shortcut.isSettingsEntry) return;
      try {
        const savedKey = GM_getValue(
          `${STORAGE_KEYS.CUSTOM_SHORTCUTS_PREFIX}${shortcut.id}`,
          shortcut.key
        );
        if (
          savedKey &&
          typeof savedKey === "string" &&
          savedKey.match(/^[a-zA-Z0-9]$/i)
        ) {
          shortcut.key = savedKey.toUpperCase();
        }
      } catch (e) {}
    });
  }

  function setListeningState(shortcutId, spanElement, isListening) {
    if (isListening) {
      if (
        activeCustomizationTarget &&
        activeCustomizationTarget.spanElement !== spanElement
      ) {
        const prevShortcut = currentKeybindingConfig.SHORTCUTS.find(
          (s) => s.id === activeCustomizationTarget.shortcutId
        );
        activeCustomizationTarget.spanElement.textContent =
          formatShortcutForDisplay(prevShortcut?.key);
        activeCustomizationTarget.spanElement.classList.remove(
          CSS_CLASSES.HELP_PANEL_KEY_LISTENING
        );
        activeCustomizationTarget.spanElement.classList.remove(
          CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
        );
        if (isCustomizingShortcuts) {
          activeCustomizationTarget.spanElement.classList.add(
            CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
          );
        }
      }

      activeCustomizationTarget = { shortcutId, spanElement };
      spanElement.textContent = UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
      shortcutDisplaySpansMap.forEach((s) => {
        s.classList.remove(CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT);
      });
      spanElement.classList.add(CSS_CLASSES.HELP_PANEL_KEY_LISTENING);
      spanElement.classList.remove(
        CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
      );
    } else {
      if (
        activeCustomizationTarget &&
        activeCustomizationTarget.shortcutId === shortcutId
      ) {
        activeCustomizationTarget = null;
      }
      spanElement.classList.remove(CSS_CLASSES.HELP_PANEL_KEY_LISTENING);
      const currentKey = currentKeybindingConfig.SHORTCUTS.find(
        (s) => s.id === shortcutId
      )?.key;
      spanElement.textContent = formatShortcutForDisplay(currentKey);

      if (isCustomizingShortcuts) {
        shortcutDisplaySpansMap.forEach((s, id) => {
          const cfg = currentKeybindingConfig.SHORTCUTS.find(
            (sc) => sc.id === id
          );
          if (cfg && !cfg.nonConfigurable && !cfg.isSettingsEntry) {
            s.classList.add(CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT);
          }
        });
      }
    }
  }

  function toggleCustomizationMode(settingsButtonSpan) {
    isCustomizingShortcuts = !isCustomizingShortcuts;

    if (activeCustomizationTarget) {
      setListeningState(
        activeCustomizationTarget.shortcutId,
        activeCustomizationTarget.spanElement,
        false
      );
    }

    if (isCustomizingShortcuts) {
      settingsButtonSpan.textContent =
        UI_STRINGS.FINISH_CUSTOMIZING_BUTTON_TEXT;
      shortcutDisplaySpansMap.forEach((span, id) => {
        const shortcut = currentKeybindingConfig.SHORTCUTS.find(
          (s) => s.id === id
        );
        if (
          shortcut &&
          !shortcut.nonConfigurable &&
          !shortcut.isSettingsEntry
        ) {
          span.classList.add(CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT);
        }
      });
    } else {
      settingsButtonSpan.textContent = UI_STRINGS.SETTINGS_BUTTON_TEXT;
      shortcutDisplaySpansMap.forEach((span) => {
        span.classList.remove(
          CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
        );
        span.classList.remove(CSS_CLASSES.HELP_PANEL_KEY_LISTENING);
      });
    }
  }

  function createHelpPanelElement() {
    if (helpPanelElement && document.body.contains(helpPanelElement)) {
      const settingsButton = helpPanelElement.querySelector(
        `.${CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
      );
      if (settingsButton) {
        settingsButton.textContent = isCustomizingShortcuts
          ? UI_STRINGS.FINISH_CUSTOMIZING_BUTTON_TEXT
          : UI_STRINGS.SETTINGS_BUTTON_TEXT;
      }
      shortcutDisplaySpansMap.forEach((span, id) => {
        const shortcut = currentKeybindingConfig.SHORTCUTS.find(
          (s) => s.id === id
        );
        if (shortcut) {
          span.textContent = formatShortcutForDisplay(shortcut.key);
          span.classList.remove(
            CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT,
            CSS_CLASSES.HELP_PANEL_KEY_LISTENING
          );
          if (
            isCustomizingShortcuts &&
            !shortcut.isSettingsEntry &&
            !shortcut.nonConfigurable
          ) {
            if (
              activeCustomizationTarget &&
              activeCustomizationTarget.shortcutId === id
            ) {
              span.textContent = UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
              span.classList.add(CSS_CLASSES.HELP_PANEL_KEY_LISTENING);
            } else {
              span.classList.add(
                CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
              );
            }
          }
        }
      });
      return helpPanelElement;
    }

    shortcutDisplaySpansMap.clear();

    const panel = document.createElement("div");
    panel.id = ELEMENT_IDS.HELP_PANEL;

    const closeButton = document.createElement("button");
    closeButton.className = CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON;
    closeButton.setAttribute("aria-label", "Close help panel");
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (isCustomizingShortcuts) {
        const settingsBtnInPanel = panel.querySelector(
          `.${CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
        );
        if (settingsBtnInPanel) toggleCustomizationMode(settingsBtnInPanel);
      }
      closeHelpPanel();
    });

    const titleElement = document.createElement("h3");
    titleElement.className = CSS_CLASSES.HELP_PANEL_TITLE;
    titleElement.textContent = UI_STRINGS.HELP_PANEL_TITLE;

    const contentContainer = document.createElement("div");
    contentContainer.className = CSS_CLASSES.HELP_PANEL_CONTENT;

    currentKeybindingConfig.SHORTCUTS.forEach((shortcut) => {
      const row = document.createElement("div");
      row.className = CSS_CLASSES.HELP_PANEL_ROW;

      const descriptionSpan = document.createElement("span");
      descriptionSpan.className = CSS_CLASSES.HELP_PANEL_DESCRIPTION;
      descriptionSpan.textContent = shortcut.description;

      const keySpan = document.createElement("span");
      keySpan.className = CSS_CLASSES.HELP_PANEL_KEY;

      if (shortcut.isSettingsEntry) {
        keySpan.textContent = isCustomizingShortcuts
          ? UI_STRINGS.FINISH_CUSTOMIZING_BUTTON_TEXT
          : UI_STRINGS.SETTINGS_BUTTON_TEXT;
        keySpan.classList.add(CSS_CLASSES.HELP_PANEL_KEY_SETTING);
        keySpan.addEventListener("click", () => {
          toggleCustomizationMode(keySpan);
        });
      } else {
        keySpan.textContent = formatShortcutForDisplay(shortcut.key);
        keySpan.classList.add(CSS_CLASSES.HELP_PANEL_KEY_DISPLAY);
        shortcutDisplaySpansMap.set(shortcut.id, keySpan);

        if (!shortcut.nonConfigurable) {
          keySpan.addEventListener("click", () => {
            if (
              isCustomizingShortcuts &&
              (!activeCustomizationTarget ||
                activeCustomizationTarget.shortcutId !== shortcut.id)
            ) {
              setListeningState(shortcut.id, keySpan, true);
            } else if (
              isCustomizingShortcuts &&
              activeCustomizationTarget &&
              activeCustomizationTarget.shortcutId === shortcut.id
            ) {
              setListeningState(shortcut.id, keySpan, false);
            }
          });
        }

        if (isCustomizingShortcuts && !shortcut.nonConfigurable) {
          if (
            activeCustomizationTarget &&
            activeCustomizationTarget.shortcutId === shortcut.id
          ) {
            keySpan.textContent = UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
            keySpan.classList.add(CSS_CLASSES.HELP_PANEL_KEY_LISTENING);
          } else {
            keySpan.classList.add(
              CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
            );
          }
        }
      }

      row.appendChild(descriptionSpan);
      row.appendChild(keySpan);
      contentContainer.appendChild(row);
    });

    const warningElement = document.createElement("div");
    warningElement.className = CSS_CLASSES.HELP_PANEL_WARNING;
    warningElement.textContent = UI_STRINGS.HELP_PANEL_WARNING_TEXT;

    panel.appendChild(closeButton);
    panel.appendChild(titleElement);
    panel.appendChild(contentContainer);
    panel.appendChild(warningElement);

    helpPanelElement = panel;
    document.body.appendChild(panel);
    return panel;
  }

  function closeHelpPanel() {
    if (
      helpPanelElement &&
      helpPanelElement.classList.contains(CSS_CLASSES.HELP_PANEL_VISIBLE)
    ) {
      helpPanelElement.style.animation = `${ELEMENT_IDS.HELP_PANEL_ANIMATE_OUT} ${UI_SETTINGS.ANIMATION_DURATION_MS}ms ${UI_SETTINGS.ANIMATION_EASING_POP_OUT} forwards`;

      clearTimeout(panelCloseTimer);
      panelCloseTimer = setTimeout(() => {
        if (helpPanelElement) {
          helpPanelElement.classList.remove(CSS_CLASSES.HELP_PANEL_VISIBLE);
          helpPanelElement.style.animation = "";
          helpPanelElement.style.opacity = "0";
          helpPanelElement.style.visibility = "hidden";
        }
        window.removeEventListener(
          "click",
          handlePanelInteractionOutside,
          true
        );
        window.removeEventListener("keydown", handlePanelEscapeKey, true);
      }, UI_SETTINGS.ANIMATION_DURATION_MS);
    }
  }

  function handlePanelInteractionOutside(event) {
    if (
      helpPanelElement &&
      helpPanelElement.classList.contains(CSS_CLASSES.HELP_PANEL_VISIBLE) &&
      !helpPanelElement.contains(event.target) &&
      parseFloat(getComputedStyle(helpPanelElement).opacity) === 1
    ) {
      if (isCustomizingShortcuts) {
        const settingsButton = helpPanelElement.querySelector(
          `.${CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
        );
        if (settingsButton) toggleCustomizationMode(settingsButton);
      }
      closeHelpPanel();
    }
  }

  function handlePanelEscapeKey(event) {
    if (event.key === "Escape") {
      if (
        helpPanelElement &&
        helpPanelElement.classList.contains(CSS_CLASSES.HELP_PANEL_VISIBLE) &&
        parseFloat(getComputedStyle(helpPanelElement).opacity) === 1
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (activeCustomizationTarget) {
          setListeningState(
            activeCustomizationTarget.shortcutId,
            activeCustomizationTarget.spanElement,
            false
          );
        } else if (isCustomizingShortcuts) {
          const settingsButton = helpPanelElement.querySelector(
            `.${CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
          );
          if (settingsButton) toggleCustomizationMode(settingsButton);
        }
        closeHelpPanel();
      }
    }
  }

  function toggleHelpPanelVisibility() {
    if (!helpPanelElement || !document.body.contains(helpPanelElement)) {
      helpPanelElement = createHelpPanelElement();
    } else {
      const settingsButton = helpPanelElement.querySelector(
        `.${CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
      );
      if (settingsButton) {
        settingsButton.textContent = isCustomizingShortcuts
          ? UI_STRINGS.FINISH_CUSTOMIZING_BUTTON_TEXT
          : UI_STRINGS.SETTINGS_BUTTON_TEXT;
      }
      shortcutDisplaySpansMap.forEach((span, id) => {
        const shortcut = currentKeybindingConfig.SHORTCUTS.find(
          (s) => s.id === id
        );
        if (shortcut) {
          span.textContent = formatShortcutForDisplay(shortcut.key);
          span.classList.remove(
            CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT,
            CSS_CLASSES.HELP_PANEL_KEY_LISTENING
          );
          if (
            isCustomizingShortcuts &&
            !shortcut.isSettingsEntry &&
            !shortcut.nonConfigurable
          ) {
            if (
              activeCustomizationTarget &&
              activeCustomizationTarget.shortcutId === id
            ) {
              span.textContent = UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
              span.classList.add(CSS_CLASSES.HELP_PANEL_KEY_LISTENING);
            } else {
              span.classList.add(
                CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
              );
            }
          }
        }
      });
    }

    clearTimeout(panelCloseTimer);
    const isCurrentlyVisibleByClass = helpPanelElement.classList.contains(
      CSS_CLASSES.HELP_PANEL_VISIBLE
    );
    let currentOpacity = 0;
    if (
      isCurrentlyVisibleByClass ||
      helpPanelElement.style.animationName ===
        ELEMENT_IDS.HELP_PANEL_ANIMATE_OUT
    ) {
      currentOpacity = parseFloat(getComputedStyle(helpPanelElement).opacity);
    }
    const isAnimatingOut =
      helpPanelElement.style.animationName ===
      ELEMENT_IDS.HELP_PANEL_ANIMATE_OUT;

    if (isCurrentlyVisibleByClass && currentOpacity > 0.01 && !isAnimatingOut) {
      if (isCustomizingShortcuts && !activeCustomizationTarget) {
        const settingsButton = helpPanelElement.querySelector(
          `.${CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
        );
        if (settingsButton) toggleCustomizationMode(settingsButton);
      }
      closeHelpPanel();
    } else {
      helpPanelElement.style.animation = "";
      helpPanelElement.style.opacity = "0";
      helpPanelElement.style.visibility = "hidden";

      requestAnimationFrame(() => {
        helpPanelElement.classList.add(CSS_CLASSES.HELP_PANEL_VISIBLE);
        helpPanelElement.style.visibility = "visible";
        helpPanelElement.style.animation = `${ELEMENT_IDS.HELP_PANEL_ANIMATE_IN} ${UI_SETTINGS.ANIMATION_DURATION_MS}ms ${UI_SETTINGS.ANIMATION_EASING_POP_OUT} forwards`;
      });

      setTimeout(() => {
        window.addEventListener("click", handlePanelInteractionOutside, true);
        window.addEventListener("keydown", handlePanelEscapeKey, true);
      }, 0);
    }
  }

  const debouncedToggleHelpPanelVisibility = debounce(
    toggleHelpPanelVisibility,
    UI_SETTINGS.DEBOUNCE_DELAY_MS
  );

  function createKeyboardEventHandler() {
    const specialActionHandlers = {
      toggleHelpPanel: debouncedToggleHelpPanelVisibility,
      toggleCustomizationMode: () => {
        if (helpPanelElement) {
          const settingsButton = helpPanelElement.querySelector(
            `.${CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
          );
          if (settingsButton) toggleCustomizationMode(settingsButton);
        }
      },
    };

    const shortcutActionMap = {};
    currentKeybindingConfig.SHORTCUTS.forEach((shortcut) => {
      if (shortcut.key && !shortcut.isSettingsEntry) {
        const lowerKey = shortcut.key.toLowerCase();
        if (
          shortcut.actionIdentifier &&
          specialActionHandlers[shortcut.actionIdentifier]
        ) {
          shortcutActionMap[lowerKey] =
            specialActionHandlers[shortcut.actionIdentifier];
        } else if (shortcut.selectorConfig) {
          shortcutActionMap[lowerKey] = () =>
            triggerElementClick(shortcut.selectorConfig);
        }
      }
    });

    return function handleKeyDown(event) {
      if (event.key === "Escape") {
        return;
      }

      if (activeCustomizationTarget) {
        event.preventDefault();
        event.stopPropagation();

        const newKey = event.key;
        const targetSpan = activeCustomizationTarget.spanElement;

        if (
          newKey &&
          newKey.length === 1 &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.shiftKey &&
          !event.metaKey &&
          !["Control", "Alt", "Shift", "Meta"].includes(newKey)
        ) {
          if (newKey.match(/^[a-zA-Z0-9]$/i)) {
            const conflictingShortcut = currentKeybindingConfig.SHORTCUTS.find(
              (s) =>
                s.key &&
                s.key.toLowerCase() === newKey.toLowerCase() &&
                s.id !== activeCustomizationTarget.shortcutId
            );
            if (conflictingShortcut) {
              targetSpan.textContent = `${
                UI_STRINGS.KEY_CONFLICT_TEXT_PREFIX
              }${newKey.toUpperCase()}${UI_STRINGS.KEY_CONFLICT_TEXT_SUFFIX}`;
              setTimeout(() => {
                if (
                  activeCustomizationTarget &&
                  activeCustomizationTarget.spanElement === targetSpan
                ) {
                  targetSpan.textContent = UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
                }
              }, 2000);
              return;
            }
            saveCustomShortcut(activeCustomizationTarget.shortcutId, newKey);
            updateShortcutDisplay(activeCustomizationTarget.shortcutId, newKey);
            setListeningState(
              activeCustomizationTarget.shortcutId,
              targetSpan,
              false
            );
          } else {
            targetSpan.classList.add(CSS_CLASSES.HELP_PANEL_KEY_INVALID_SHAKE);
            setTimeout(() => {
              if (
                activeCustomizationTarget &&
                activeCustomizationTarget.spanElement === targetSpan
              ) {
                targetSpan.classList.remove(
                  CSS_CLASSES.HELP_PANEL_KEY_INVALID_SHAKE
                );
              }
            }, 500);
          }
        } else if (!["Control", "Alt", "Shift", "Meta"].includes(newKey)) {
          if (event[currentKeybindingConfig.MODIFIERS.EVENT_PROPERTY]) {
            const conflictingShortcut = currentKeybindingConfig.SHORTCUTS.find(
              (s) =>
                s.key &&
                s.key.toLowerCase() === newKey.toLowerCase() &&
                s.id !== activeCustomizationTarget.shortcutId
            );
            if (conflictingShortcut) {
              targetSpan.textContent = `${
                UI_STRINGS.KEY_CONFLICT_TEXT_PREFIX
              }${newKey.toUpperCase()}${UI_STRINGS.KEY_CONFLICT_TEXT_SUFFIX}`;
              setTimeout(() => {
                if (
                  activeCustomizationTarget &&
                  activeCustomizationTarget.spanElement === targetSpan
                ) {
                  targetSpan.textContent = UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
                }
              }, 2000);
              return;
            }
            saveCustomShortcut(activeCustomizationTarget.shortcutId, newKey);
            updateShortcutDisplay(activeCustomizationTarget.shortcutId, newKey);
            setListeningState(
              activeCustomizationTarget.shortcutId,
              targetSpan,
              false
            );
          } else {
            targetSpan.textContent = `${UI_STRINGS.INVALID_MODIFIER_TEXT_PREFIX}${currentKeybindingConfig.MODIFIERS.CHARACTER_DISPLAY}${UI_STRINGS.INVALID_MODIFIER_TEXT_SUFFIX}`;
            setTimeout(() => {
              if (
                activeCustomizationTarget &&
                activeCustomizationTarget.spanElement === targetSpan
              ) {
                targetSpan.textContent = UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
              }
            }, 2000);
          }
        }
        return;
      }

      if (isCustomizingShortcuts) {
        return;
      }

      if (!event[currentKeybindingConfig.MODIFIERS.EVENT_PROPERTY]) {
        return;
      }

      const pressedKey = event.key.toLowerCase();
      const actionToExecute = shortcutActionMap[pressedKey];

      if (typeof actionToExecute === "function") {
        actionToExecute();
        event.preventDefault();
        event.stopPropagation();
      }
    };
  }

  function initializeScript() {
    loadCustomShortcuts();
    injectUserInterfaceStyles();
    keydownEventListener = createKeyboardEventHandler();
    window.addEventListener("keydown", keydownEventListener, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeScript, {
      once: true,
    });
  } else {
    initializeScript();
  }
})();

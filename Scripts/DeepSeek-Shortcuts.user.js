// ==UserScript==
// @name               DeepSeek Shortcuts
// @name:zh-CN         DeepSeek 快捷键
// @name:zh-TW         DeepSeek 快捷鍵
// @description        Keyboard Shortcuts For DeepSeek | Support Custom Shortcut Keys
// @description:zh-CN  为DeepSeek提供快捷键支持 | 支持自定义快捷键
// @description:zh-TW  為DeepSeek提供快捷鍵支援 | 支援自定義快捷鍵
// @version            1.6.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/main/Icons/DeepSeek-Shortcuts-Icon.svg
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

  const Config = {
    SCRIPT_SETTINGS: {
      FONT_STACK: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      ANIMATION_DURATION_MS: 350,
      ANIMATION_EASING_POP_OUT: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      ANIMATION_EASING_STANDARD_INTERACTIVE: "cubic-bezier(0, 0, 0.58, 1)",
      BREATHING_ANIMATION_DURATION: "2.2s",
      DEBOUNCE_DELAY_MS: 150,
    },
    STORAGE_KEYS: {
      CUSTOM_SHORTCUTS_PREFIX: "dsk_custom_shortcuts_",
    },
    ELEMENT_SELECTORS: {
      REGENERATE_BUTTON: {
        parentSelector: "div._4f9bf79.d7dc56a8",
        parentPosition: "last",
        selector: ".ds-icon-button",
        filterText: "#重新生成",
      },
      CONTINUE_BUTTON: { selector: ".ds-button", filterText: "继续生成" },
      STOP_GENERATING_BUTTON: { selector: "._7436101", position: "first" },
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
      UPLOAD_FILE_BUTTON: { selector: ".f02f0e25", position: "first" },
      NEW_CHAT_BUTTON: { selector: "._217e214", position: "first" },
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
    },
    ELEMENT_IDS: {
      HELP_PANEL: "dsk-help-panel",
      HELP_PANEL_ANIMATE_IN: "dsk-help-panel-animate-in",
      HELP_PANEL_ANIMATE_OUT: "dsk-help-panel-animate-out",
    },
    CSS_CLASSES: {
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
    },
    UI_STRINGS: {
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
    },
    DEFAULT_SHORTCUT_CONFIG: {
      MODIFIERS: (() => {
        const isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent);
        return {
          CHARACTER_DISPLAY: isMac ? "⌃ Control" : "Alt",
          EVENT_PROPERTY: isMac ? "ctrlKey" : "altKey",
        };
      })(),
      SHORTCUTS: [
        {
          id: "regenerate",
          key: "R",
          description: "重新生成回答",
          selectorConfig: "REGENERATE_BUTTON",
        },
        {
          id: "continueGenerating",
          key: "C",
          description: "继续生成回答",
          selectorConfig: "CONTINUE_BUTTON",
        },
        {
          id: "stopGenerating",
          key: "Q",
          description: "中断当前生成",
          selectorConfig: "STOP_GENERATING_BUTTON",
        },
        {
          id: "copyLastResponse",
          key: "K",
          description: "复制末条回答",
          selectorConfig: "LAST_COPY_BUTTON",
        },
        {
          id: "editLastQuery",
          key: "E",
          description: "编辑末次提问",
          selectorConfig: "LAST_EDIT_BUTTON",
        },
        {
          id: "deepThinkMode",
          key: "D",
          description: "深度思考模式",
          selectorConfig: "DEEP_THINK_MODE_BUTTON",
        },
        {
          id: "searchMode",
          key: "S",
          description: "联网搜索模式",
          selectorConfig: "SEARCH_MODE_BUTTON",
        },
        {
          id: "uploadFile",
          key: "U",
          description: "上传本地文件",
          selectorConfig: "UPLOAD_FILE_BUTTON",
        },
        {
          id: "newChat",
          key: "N",
          description: "新建对话窗口",
          selectorConfig: "NEW_CHAT_BUTTON",
        },
        {
          id: "toggleSidebar",
          key: "T",
          description: "切换开关边栏",
          selectorConfig: "TOGGLE_SIDEBAR_BUTTON",
        },
        {
          id: "currentChatMenu",
          key: "I",
          description: "当前对话菜单",
          selectorConfig: "CURRENT_CHAT_MENU_BUTTON",
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
          description: "placeholder_settings_label",
          isSettingsEntry: true,
          actionIdentifier: "toggleCustomizationMode",
          nonConfigurable: true,
        },
      ],
    },
  };
  Config.DEFAULT_SHORTCUT_CONFIG.SHORTCUTS.find(
    (s) => s.id === "settingsEntry"
  ).description = Config.UI_STRINGS.CUSTOMIZE_SHORTCUTS_LABEL;

  const State = {
    isCustomizingShortcuts: false,
    activeCustomizationTarget: null,
    currentShortcutConfig: JSON.parse(
      JSON.stringify(Config.DEFAULT_SHORTCUT_CONFIG)
    ),

    initialize() {
      this.loadCustomShortcuts();
    },

    loadCustomShortcuts() {
      this.currentShortcutConfig.SHORTCUTS.forEach((shortcut) => {
        if (shortcut.nonConfigurable || shortcut.isSettingsEntry) return;
        try {
          const savedKey = GM_getValue(
            `${Config.STORAGE_KEYS.CUSTOM_SHORTCUTS_PREFIX}${shortcut.id}`,
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
    },

    saveCustomShortcut(shortcutId, newKey) {
      const shortcutToUpdate = this.currentShortcutConfig.SHORTCUTS.find(
        (s) => s.id === shortcutId
      );
      if (shortcutToUpdate) {
        shortcutToUpdate.key = newKey.toUpperCase();
        try {
          GM_setValue(
            `${Config.STORAGE_KEYS.CUSTOM_SHORTCUTS_PREFIX}${shortcutId}`,
            shortcutToUpdate.key
          );
        } catch (e) {}
        EventManager.reinitializeGlobalKeyListener();
      }
    },

    getActiveModifierProperty() {
      return this.currentShortcutConfig.MODIFIERS.EVENT_PROPERTY;
    },

    getActiveModifierCharDisplay() {
      return this.currentShortcutConfig.MODIFIERS.CHARACTER_DISPLAY;
    },
  };

  const UserInterface = {
    injectStyles() {
      const styles = `
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
            --ctp-frappe-crust-rgb: 35, 38, 52;

            --dsk-panel-bg: rgb(from var(--ctp-frappe-mantle) r g b / 0.85);
            --dsk-panel-border: rgb(from var(--ctp-frappe-surface0) r g b / 0.5);
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
            --dsk-warning-bg: rgb(from var(--ctp-frappe-surface0) r g b / 0.5);
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
            0%, 100% {
              transform: translateX(0);
            }
            10%, 30%, 50%, 70%, 90% {
              transform: translateX(-3px);
            }
            20%, 40%, 60%, 80% {
              transform: translateX(3px);
            }
          }

          @keyframes ${Config.ELEMENT_IDS.HELP_PANEL_ANIMATE_IN} {
            0% {
              transform: translate(-50%, -50%) scale(0.88);
              opacity: 0;
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }

          @keyframes ${Config.ELEMENT_IDS.HELP_PANEL_ANIMATE_OUT} {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(0.9);
              opacity: 0;
            }
          }

          #${Config.ELEMENT_IDS.HELP_PANEL} {
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
            font-family: ${Config.SCRIPT_SETTINGS.FONT_STACK};
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

          #${Config.ELEMENT_IDS.HELP_PANEL}.${Config.CSS_CLASSES.HELP_PANEL_VISIBLE} {
            pointer-events: auto;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON} {
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
            transition: background-color 0.15s ${Config.SCRIPT_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE},
                        transform 0.15s ${Config.SCRIPT_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE};
            appearance: none;
            -webkit-appearance: none;
            outline: none;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON}::before {
            content: '✕';
            display: block;
            color: transparent;
            font-size: 10px;
            font-weight: bold;
            line-height: 12px;
            text-align: center;
            transition: color 0.1s ${Config.SCRIPT_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE};
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON}:hover {
            background-color: var(--dsk-close-button-hover-bg);
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON}:hover::before {
            color: var(--dsk-close-button-symbol);
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON}:active {
            filter: brightness(0.85);
            transform: scale(0.9);
          }

          .${Config.CSS_CLASSES.HELP_PANEL_TITLE} {
            margin: 0 0 18px 0;
            padding-top: 8px;
            color: var(--dsk-text-primary);
            font-size: 17px;
            font-weight: 600;
            text-align: center;
            flex-shrink: 0;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CONTENT} {
            flex-grow: 1;
            overflow-y: auto;
            max-height: 60vh;
            margin-right: -12px;
            padding-right: 12px;
            scrollbar-width: thin;
            scrollbar-color: var(--dsk-scrollbar-thumb) transparent;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CONTENT}::-webkit-scrollbar {
            width: 6px;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CONTENT}::-webkit-scrollbar-track {
            background: transparent;
            margin: 4px 0;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CONTENT}::-webkit-scrollbar-thumb {
            background-color: var(--dsk-scrollbar-thumb);
            border-radius: 3px;
            transition: background-color 0.15s ${Config.SCRIPT_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE};
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CONTENT}::-webkit-scrollbar-thumb:hover {
            background-color: var(--dsk-scrollbar-thumb-hover);
          }

          .${Config.CSS_CLASSES.HELP_PANEL_ROW} {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 6px 2px;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_CONTENT} > .${Config.CSS_CLASSES.HELP_PANEL_ROW}:last-child {
            margin-bottom: 0;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_KEY} {
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
            transition: background-color 0.15s ${Config.SCRIPT_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE},
                        border-color 0.15s ${Config.SCRIPT_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE},
                        color 0.15s ${Config.SCRIPT_SETTINGS.ANIMATION_EASING_STANDARD_INTERACTIVE};
            cursor: default;
            position: relative;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_KEY}.${Config.CSS_CLASSES.HELP_PANEL_KEY_DISPLAY} {
          }

          .${Config.CSS_CLASSES.HELP_PANEL_KEY}.${Config.CSS_CLASSES.HELP_PANEL_KEY_SETTING} {
            color: var(--dsk-key-setting-text);
            cursor: pointer;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_KEY}.${Config.CSS_CLASSES.HELP_PANEL_KEY_SETTING}:hover {
            background-color: var(--dsk-key-setting-hover-bg);
            border-color: var(--ctp-frappe-overlay0);
          }

          .${Config.CSS_CLASSES.HELP_PANEL_KEY}.${Config.CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT} {
            animation: dsk-border-breathing-effect ${Config.SCRIPT_SETTINGS.BREATHING_ANIMATION_DURATION} infinite ease-in-out;
            cursor: pointer;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_KEY}.${Config.CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT}::after {
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
            animation: dsk-opacity-breathing-effect ${Config.SCRIPT_SETTINGS.BREATHING_ANIMATION_DURATION} infinite ease-in-out;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_KEY}.${Config.CSS_CLASSES.HELP_PANEL_KEY_LISTENING} {
            border-color: var(--dsk-key-listening-border) !important;
            background-color: var(--dsk-key-listening-bg) !important;
            color: var(--ctp-frappe-green) !important;
            animation: none !important;
            cursor: default !important;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_KEY}.${Config.CSS_CLASSES.HELP_PANEL_KEY_LISTENING}::after {
            animation: none !important;
            opacity: 0 !important;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_KEY}.${Config.CSS_CLASSES.HELP_PANEL_KEY_INVALID_SHAKE} {
             animation: dsk-invalid-shake-effect 0.5s ease;
             border-color: var(--dsk-key-invalid-shake-color) !important;
             color: var(--dsk-key-invalid-shake-color) !important;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_DESCRIPTION} {
            flex-grow: 1;
            padding-right: 10px;
            color: var(--dsk-text-secondary);
            font-size: 13.5px;
          }

          .${Config.CSS_CLASSES.HELP_PANEL_WARNING} {
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
    },
  };

  const ShortcutManager = {
    getElementByConfig(selectorKeyName) {
      const config = Config.ELEMENT_SELECTORS[selectorKeyName];
      if (!config || !config.selector) return null;

      const {
        selector,
        filterText,
        position = "first",
        parentSelector,
        parentPosition = "last",
        childPosition = "first",
      } = config;
      let baseElements = [];

      if (parentSelector) {
        const parents = Array.from(document.querySelectorAll(parentSelector));
        if (parents.length === 0) return null;
        const parentIndex = parentPosition === "last" ? parents.length - 1 : 0;
        const targetParent = parents[parentIndex];
        if (!targetParent) return null;
        baseElements = Array.from(targetParent.querySelectorAll(selector));
      } else {
        baseElements = Array.from(document.querySelectorAll(selector));
      }

      if (baseElements.length === 0) return null;

      let targetElements = baseElements;

      if (filterText) {
        const filters = filterText.split(",").map((f) => f.trim());
        targetElements = baseElements.filter((element) =>
          filters.some((ft) => {
            if (ft.startsWith("#")) {
              return (
                !!element.querySelector(ft) || element.id === ft.substring(1)
              );
            }
            return (
              element.textContent?.includes(ft) ||
              (ft.startsWith("svg #") &&
                element.querySelector(ft.replace("svg ", "")))
            );
          })
        );
        if (targetElements.length === 0) return null;
      }

      const index = position === "last" ? targetElements.length - 1 : 0;
      return targetElements[index] || null;
    },

    triggerElementClick(selectorKeyName) {
      const element = this.getElementByConfig(selectorKeyName);
      if (element && typeof element.click === "function") {
        element.click();
        return true;
      }
      return false;
    },

    formatShortcutDisplay(shortcutKey) {
      if (!shortcutKey) return "---";
      return `${State.getActiveModifierCharDisplay()} + ${shortcutKey.toUpperCase()}`;
    },
  };

  const HelpPanelManager = {
    helpPanelElement: null,
    shortcutDisplaySpansMap: new Map(),
    panelCloseTimer: null,

    createPanel() {
      if (
        this.helpPanelElement &&
        document.body.contains(this.helpPanelElement)
      ) {
        this.updatePanelContentDynamic();
        return this.helpPanelElement;
      }
      this.shortcutDisplaySpansMap.clear();

      const panel = document.createElement("div");
      panel.id = Config.ELEMENT_IDS.HELP_PANEL;

      const closeButton = this.createCloseButton();
      const titleElement = this.createTitle();
      const contentContainer = this.createContentContainer();
      const warningElement = this.createWarning();

      panel.appendChild(closeButton);
      panel.appendChild(titleElement);
      panel.appendChild(contentContainer);
      panel.appendChild(warningElement);

      this.helpPanelElement = panel;
      document.body.appendChild(panel);
      return panel;
    },

    createCloseButton() {
      const button = document.createElement("button");
      button.className = Config.CSS_CLASSES.HELP_PANEL_CLOSE_BUTTON;
      button.setAttribute("aria-label", "Close help panel");
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        if (State.isCustomizingShortcuts) {
          const settingsBtn = this.helpPanelElement?.querySelector(
            `.${Config.CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
          );
          if (settingsBtn) this.toggleCustomizationModeUI(settingsBtn);
        }
        this.closePanel();
      });
      return button;
    },

    createTitle() {
      const title = document.createElement("h3");
      title.className = Config.CSS_CLASSES.HELP_PANEL_TITLE;
      title.textContent = Config.UI_STRINGS.HELP_PANEL_TITLE;
      return title;
    },

    createContentContainer() {
      const container = document.createElement("div");
      container.className = Config.CSS_CLASSES.HELP_PANEL_CONTENT;
      State.currentShortcutConfig.SHORTCUTS.forEach((shortcut) => {
        const row = document.createElement("div");
        row.className = Config.CSS_CLASSES.HELP_PANEL_ROW;

        const descriptionSpan = document.createElement("span");
        descriptionSpan.className = Config.CSS_CLASSES.HELP_PANEL_DESCRIPTION;
        descriptionSpan.textContent = shortcut.description;

        const keySpan = document.createElement("span");
        keySpan.className = Config.CSS_CLASSES.HELP_PANEL_KEY;

        if (shortcut.isSettingsEntry) {
          keySpan.textContent = State.isCustomizingShortcuts
            ? Config.UI_STRINGS.FINISH_CUSTOMIZING_BUTTON_TEXT
            : Config.UI_STRINGS.SETTINGS_BUTTON_TEXT;
          keySpan.classList.add(Config.CSS_CLASSES.HELP_PANEL_KEY_SETTING);
          keySpan.addEventListener("click", () =>
            this.toggleCustomizationModeUI(keySpan)
          );
        } else {
          keySpan.textContent = ShortcutManager.formatShortcutDisplay(
            shortcut.key
          );
          keySpan.classList.add(Config.CSS_CLASSES.HELP_PANEL_KEY_DISPLAY);
          this.shortcutDisplaySpansMap.set(shortcut.id, keySpan);

          if (!shortcut.nonConfigurable) {
            keySpan.addEventListener("click", () => {
              if (
                State.isCustomizingShortcuts &&
                (!State.activeCustomizationTarget ||
                  State.activeCustomizationTarget.shortcutId !== shortcut.id)
              ) {
                this.setListeningStateUI(shortcut.id, keySpan, true);
              } else if (
                State.isCustomizingShortcuts &&
                State.activeCustomizationTarget &&
                State.activeCustomizationTarget.shortcutId === shortcut.id
              ) {
                this.setListeningStateUI(shortcut.id, keySpan, false);
              }
            });
          }
          this.updateKeySpanAppearance(keySpan, shortcut);
        }
        row.appendChild(descriptionSpan);
        row.appendChild(keySpan);
        container.appendChild(row);
      });
      return container;
    },

    createWarning() {
      const warning = document.createElement("div");
      warning.className = Config.CSS_CLASSES.HELP_PANEL_WARNING;
      warning.textContent = Config.UI_STRINGS.HELP_PANEL_WARNING_TEXT;
      return warning;
    },

    updateKeySpanAppearance(keySpan, shortcut) {
      keySpan.classList.remove(
        Config.CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT,
        Config.CSS_CLASSES.HELP_PANEL_KEY_LISTENING
      );
      if (
        State.isCustomizingShortcuts &&
        !shortcut.isSettingsEntry &&
        !shortcut.nonConfigurable
      ) {
        if (
          State.activeCustomizationTarget &&
          State.activeCustomizationTarget.shortcutId === shortcut.id
        ) {
          keySpan.textContent = Config.UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
          keySpan.classList.add(Config.CSS_CLASSES.HELP_PANEL_KEY_LISTENING);
        } else {
          keySpan.classList.add(
            Config.CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
          );
        }
      }
    },

    updatePanelContentDynamic() {
      if (!this.helpPanelElement) return;
      const settingsButton = this.helpPanelElement.querySelector(
        `.${Config.CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
      );
      if (settingsButton) {
        settingsButton.textContent = State.isCustomizingShortcuts
          ? Config.UI_STRINGS.FINISH_CUSTOMIZING_BUTTON_TEXT
          : Config.UI_STRINGS.SETTINGS_BUTTON_TEXT;
      }
      this.shortcutDisplaySpansMap.forEach((span, id) => {
        const shortcut = State.currentShortcutConfig.SHORTCUTS.find(
          (s) => s.id === id
        );
        if (shortcut) {
          span.textContent = ShortcutManager.formatShortcutDisplay(
            shortcut.key
          );
          this.updateKeySpanAppearance(span, shortcut);
        }
      });
    },

    closePanel() {
      if (
        this.helpPanelElement &&
        this.helpPanelElement.classList.contains(
          Config.CSS_CLASSES.HELP_PANEL_VISIBLE
        )
      ) {
        this.helpPanelElement.style.animation = `${Config.ELEMENT_IDS.HELP_PANEL_ANIMATE_OUT} ${Config.SCRIPT_SETTINGS.ANIMATION_DURATION_MS}ms ${Config.SCRIPT_SETTINGS.ANIMATION_EASING_POP_OUT} forwards`;
        clearTimeout(this.panelCloseTimer);
        this.panelCloseTimer = setTimeout(() => {
          if (this.helpPanelElement) {
            this.helpPanelElement.classList.remove(
              Config.CSS_CLASSES.HELP_PANEL_VISIBLE
            );
            this.helpPanelElement.style.animation = "";
            this.helpPanelElement.style.opacity = "0";
            this.helpPanelElement.style.visibility = "hidden";
          }
          window.removeEventListener(
            "click",
            EventManager.handlePanelInteractionOutsideProxy,
            true
          );
          window.removeEventListener(
            "keydown",
            EventManager.handlePanelEscapeKeyProxy,
            true
          );
        }, Config.SCRIPT_SETTINGS.ANIMATION_DURATION_MS);
      }
    },

    toggleVisibility() {
      if (
        !this.helpPanelElement ||
        !document.body.contains(this.helpPanelElement)
      ) {
        this.createPanel();
      } else {
        this.updatePanelContentDynamic();
      }

      clearTimeout(this.panelCloseTimer);
      const isCurrentlyVisibleByClass =
        this.helpPanelElement.classList.contains(
          Config.CSS_CLASSES.HELP_PANEL_VISIBLE
        );
      let currentOpacity = 0;
      if (
        isCurrentlyVisibleByClass ||
        this.helpPanelElement.style.animationName ===
          Config.ELEMENT_IDS.HELP_PANEL_ANIMATE_OUT
      ) {
        currentOpacity = parseFloat(
          getComputedStyle(this.helpPanelElement).opacity
        );
      }
      const isAnimatingOut =
        this.helpPanelElement.style.animationName ===
        Config.ELEMENT_IDS.HELP_PANEL_ANIMATE_OUT;

      if (
        isCurrentlyVisibleByClass &&
        currentOpacity > 0.01 &&
        !isAnimatingOut
      ) {
        if (State.isCustomizingShortcuts && !State.activeCustomizationTarget) {
          const settingsButton = this.helpPanelElement.querySelector(
            `.${Config.CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
          );
          if (settingsButton) this.toggleCustomizationModeUI(settingsButton);
        }
        this.closePanel();
      } else {
        this.helpPanelElement.style.animation = "";
        this.helpPanelElement.style.opacity = "0";
        this.helpPanelElement.style.visibility = "hidden";

        requestAnimationFrame(() => {
          this.helpPanelElement.classList.add(
            Config.CSS_CLASSES.HELP_PANEL_VISIBLE
          );
          this.helpPanelElement.style.visibility = "visible";
          this.helpPanelElement.style.animation = `${Config.ELEMENT_IDS.HELP_PANEL_ANIMATE_IN} ${Config.SCRIPT_SETTINGS.ANIMATION_DURATION_MS}ms ${Config.SCRIPT_SETTINGS.ANIMATION_EASING_POP_OUT} forwards`;
        });
        setTimeout(() => {
          window.addEventListener(
            "click",
            EventManager.handlePanelInteractionOutsideProxy,
            true
          );
          window.addEventListener(
            "keydown",
            EventManager.handlePanelEscapeKeyProxy,
            true
          );
        }, 0);
      }
    },

    updateShortcutDisplayUI(shortcutId, newKey) {
      const spanElement = this.shortcutDisplaySpansMap.get(shortcutId);
      if (spanElement) {
        spanElement.textContent = newKey
          ? ShortcutManager.formatShortcutDisplay(newKey)
          : Config.UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
      }
    },

    setListeningStateUI(shortcutId, spanElement, isListening) {
      if (isListening) {
        if (
          State.activeCustomizationTarget &&
          State.activeCustomizationTarget.spanElement !== spanElement
        ) {
          const prevShortcut = State.currentShortcutConfig.SHORTCUTS.find(
            (s) => s.id === State.activeCustomizationTarget.shortcutId
          );
          State.activeCustomizationTarget.spanElement.textContent =
            ShortcutManager.formatShortcutDisplay(prevShortcut?.key);
          this.updateKeySpanAppearance(
            State.activeCustomizationTarget.spanElement,
            prevShortcut
          );
        }
        State.activeCustomizationTarget = { shortcutId, spanElement };
        spanElement.textContent = Config.UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
        this.shortcutDisplaySpansMap.forEach((s) =>
          s.classList.remove(
            Config.CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
          )
        );
        spanElement.classList.add(Config.CSS_CLASSES.HELP_PANEL_KEY_LISTENING);
        spanElement.classList.remove(
          Config.CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
        );
      } else {
        if (
          State.activeCustomizationTarget &&
          State.activeCustomizationTarget.shortcutId === shortcutId
        ) {
          State.activeCustomizationTarget = null;
        }
        const currentKey = State.currentShortcutConfig.SHORTCUTS.find(
          (s) => s.id === shortcutId
        )?.key;
        spanElement.textContent =
          ShortcutManager.formatShortcutDisplay(currentKey);
        spanElement.classList.remove(
          Config.CSS_CLASSES.HELP_PANEL_KEY_LISTENING
        );
        if (State.isCustomizingShortcuts) {
          this.shortcutDisplaySpansMap.forEach((s, id) => {
            const cfg = State.currentShortcutConfig.SHORTCUTS.find(
              (sc) => sc.id === id
            );
            if (cfg && !cfg.nonConfigurable && !cfg.isSettingsEntry) {
              s.classList.add(
                Config.CSS_CLASSES.HELP_PANEL_KEY_CONFIGURABLE_HIGHLIGHT
              );
            }
          });
        }
      }
    },

    toggleCustomizationModeUI(settingsButtonSpan) {
      State.isCustomizingShortcuts = !State.isCustomizingShortcuts;
      if (State.activeCustomizationTarget) {
        this.setListeningStateUI(
          State.activeCustomizationTarget.shortcutId,
          State.activeCustomizationTarget.spanElement,
          false
        );
      }
      settingsButtonSpan.textContent = State.isCustomizingShortcuts
        ? Config.UI_STRINGS.FINISH_CUSTOMIZING_BUTTON_TEXT
        : Config.UI_STRINGS.SETTINGS_BUTTON_TEXT;
      this.shortcutDisplaySpansMap.forEach((span, id) => {
        const shortcut = State.currentShortcutConfig.SHORTCUTS.find(
          (s) => s.id === id
        );
        if (shortcut) this.updateKeySpanAppearance(span, shortcut);
      });
    },

    displayKeyConflictWarning(spanElement, conflictingKey) {
      spanElement.textContent = `${
        Config.UI_STRINGS.KEY_CONFLICT_TEXT_PREFIX
      }${conflictingKey.toUpperCase()}${
        Config.UI_STRINGS.KEY_CONFLICT_TEXT_SUFFIX
      }`;
      setTimeout(() => {
        if (
          State.activeCustomizationTarget &&
          State.activeCustomizationTarget.spanElement === spanElement
        ) {
          spanElement.textContent = Config.UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
        }
      }, 2000);
    },

    displayInvalidModifierWarning(spanElement) {
      spanElement.textContent = `${
        Config.UI_STRINGS.INVALID_MODIFIER_TEXT_PREFIX
      }${State.getActiveModifierCharDisplay()}${
        Config.UI_STRINGS.INVALID_MODIFIER_TEXT_SUFFIX
      }`;
      setTimeout(() => {
        if (
          State.activeCustomizationTarget &&
          State.activeCustomizationTarget.spanElement === spanElement
        ) {
          spanElement.textContent = Config.UI_STRINGS.PRESS_NEW_SHORTCUT_TEXT;
        }
      }, 2000);
    },
    triggerInvalidKeyShake(spanElement) {
      spanElement.classList.add(
        Config.CSS_CLASSES.HELP_PANEL_KEY_INVALID_SHAKE
      );
      setTimeout(() => {
        spanElement.classList.remove(
          Config.CSS_CLASSES.HELP_PANEL_KEY_INVALID_SHAKE
        );
      }, 500);
    },
  };

  const EventManager = {
    globalKeyDownListener: null,
    debouncedToggleHelpPanel: null,

    init() {
      this.debouncedToggleHelpPanel = this.debounce(
        HelpPanelManager.toggleVisibility.bind(HelpPanelManager),
        Config.SCRIPT_SETTINGS.DEBOUNCE_DELAY_MS
      );
      this.reinitializeGlobalKeyListener();
    },

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    createGlobalKeyListener() {
      const specialActionHandlers = {
        toggleHelpPanel: this.debouncedToggleHelpPanel,
        toggleCustomizationMode: () => {
          if (HelpPanelManager.helpPanelElement) {
            const settingsButton =
              HelpPanelManager.helpPanelElement.querySelector(
                `.${Config.CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
              );
            if (settingsButton)
              HelpPanelManager.toggleCustomizationModeUI(settingsButton);
          }
        },
      };

      const shortcutActionMap = {};
      State.currentShortcutConfig.SHORTCUTS.forEach((shortcut) => {
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
              ShortcutManager.triggerElementClick(shortcut.selectorConfig);
          }
        }
      });

      return (event) => {
        if (event.key === "Escape") {
          return;
        }

        if (State.activeCustomizationTarget) {
          event.preventDefault();
          event.stopPropagation();
          const newKey = event.key;
          const targetSpan = State.activeCustomizationTarget.spanElement;

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
              const conflictingShortcut =
                State.currentShortcutConfig.SHORTCUTS.find(
                  (s) =>
                    s.key &&
                    s.key.toLowerCase() === newKey.toLowerCase() &&
                    s.id !== State.activeCustomizationTarget.shortcutId
                );
              if (conflictingShortcut) {
                HelpPanelManager.displayKeyConflictWarning(targetSpan, newKey);
                return;
              }
              State.saveCustomShortcut(
                State.activeCustomizationTarget.shortcutId,
                newKey
              );
              HelpPanelManager.updateShortcutDisplayUI(
                State.activeCustomizationTarget.shortcutId,
                newKey
              );
              HelpPanelManager.setListeningStateUI(
                State.activeCustomizationTarget.shortcutId,
                targetSpan,
                false
              );
            } else {
              HelpPanelManager.triggerInvalidKeyShake(targetSpan);
            }
          } else if (!["Control", "Alt", "Shift", "Meta"].includes(newKey)) {
            if (event[State.getActiveModifierProperty()]) {
              const conflictingShortcut =
                State.currentShortcutConfig.SHORTCUTS.find(
                  (s) =>
                    s.key &&
                    s.key.toLowerCase() === newKey.toLowerCase() &&
                    s.id !== State.activeCustomizationTarget.shortcutId
                );
              if (conflictingShortcut) {
                HelpPanelManager.displayKeyConflictWarning(targetSpan, newKey);
                return;
              }
              State.saveCustomShortcut(
                State.activeCustomizationTarget.shortcutId,
                newKey
              );
              HelpPanelManager.updateShortcutDisplayUI(
                State.activeCustomizationTarget.shortcutId,
                newKey
              );
              HelpPanelManager.setListeningStateUI(
                State.activeCustomizationTarget.shortcutId,
                targetSpan,
                false
              );
            } else {
              HelpPanelManager.displayInvalidModifierWarning(targetSpan);
            }
          }
          return;
        }

        if (State.isCustomizingShortcuts) {
          return;
        }

        if (!event[State.getActiveModifierProperty()]) {
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
    },

    reinitializeGlobalKeyListener() {
      if (this.globalKeyDownListener) {
        window.removeEventListener("keydown", this.globalKeyDownListener, true);
      }
      this.globalKeyDownListener = this.createGlobalKeyListener();
      window.addEventListener("keydown", this.globalKeyDownListener, true);
    },

    handlePanelInteractionOutsideProxy(event) {
      if (
        HelpPanelManager.helpPanelElement &&
        HelpPanelManager.helpPanelElement.classList.contains(
          Config.CSS_CLASSES.HELP_PANEL_VISIBLE
        ) &&
        !HelpPanelManager.helpPanelElement.contains(event.target) &&
        parseFloat(
          getComputedStyle(HelpPanelManager.helpPanelElement).opacity
        ) === 1
      ) {
        if (State.isCustomizingShortcuts) {
          const settingsButton =
            HelpPanelManager.helpPanelElement.querySelector(
              `.${Config.CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
            );
          if (settingsButton)
            HelpPanelManager.toggleCustomizationModeUI(settingsButton);
        }
        HelpPanelManager.closePanel();
      }
    },

    handlePanelEscapeKeyProxy(event) {
      if (event.key === "Escape") {
        if (
          HelpPanelManager.helpPanelElement &&
          HelpPanelManager.helpPanelElement.classList.contains(
            Config.CSS_CLASSES.HELP_PANEL_VISIBLE
          ) &&
          parseFloat(
            getComputedStyle(HelpPanelManager.helpPanelElement).opacity
          ) === 1
        ) {
          event.preventDefault();
          event.stopPropagation();
          if (State.activeCustomizationTarget) {
            HelpPanelManager.setListeningStateUI(
              State.activeCustomizationTarget.shortcutId,
              State.activeCustomizationTarget.spanElement,
              false
            );
          } else if (State.isCustomizingShortcuts) {
            const settingsButton =
              HelpPanelManager.helpPanelElement.querySelector(
                `.${Config.CSS_CLASSES.HELP_PANEL_KEY_SETTING}`
              );
            if (settingsButton)
              HelpPanelManager.toggleCustomizationModeUI(settingsButton);
          }
          HelpPanelManager.closePanel();
        }
      }
    },
  };

  const ScriptManager = {
    init() {
      try {
        State.initialize();
        UserInterface.injectStyles();
        EventManager.init();
      } catch (error) {}
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ScriptManager.init(), {
      once: true,
    });
  } else {
    ScriptManager.init();
  }
})();

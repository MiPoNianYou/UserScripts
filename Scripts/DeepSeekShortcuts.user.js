// ==UserScript==
// @name               DeepSeek ShortCuts
// @name:zh-CN         DeepSeek快捷键
// @name:zh-TW         DeepSeek快捷鍵
// @description        Keyboard Shortcuts For DeepSeek (Mac & Windows)
// @description:zh-CN  为DeepSeek提供快捷键支持（Mac & Windows）
// @description:zh-TW  為DeepSeek提供快捷鍵支持（Mac & Windows）
// @version            1.3.0
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

  const Styles = `
    .DsShortcutsHelpOverlay {
      --ds-overlay-bg-color: rgba(44, 44, 46, 0.85);
      --ds-overlay-text-color: rgba(255, 255, 255, 0.9);
      --ds-overlay-secondary-text-color: rgba(235, 235, 245, 0.6);
      --ds-overlay-border-color: rgba(84, 84, 88, 0.65);
      --ds-overlay-padding: 24px;
      --ds-overlay-radius: 12px;
      --ds-key-bg-color: rgba(118, 118, 128, 0.24);
      --ds-warning-bg-color: rgba(118, 118, 128, 0.24);
      --ds-warning-border-color: rgba(84, 84, 88, 0.65);
      --ds-warning-text-color: rgb(255, 159, 10);
      --ds-font-stack: system-ui, sans-serif;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      z-index: 9999;
      pointer-events: none;
      visibility: hidden;
      min-width: 280px;
      padding: var(--ds-overlay-padding);
      border: 0.5px solid var(--ds-overlay-border-color);
      border-radius: var(--ds-overlay-radius);
      background: var(--ds-overlay-bg-color);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px) saturate(180%);
      color: var(--ds-overlay-text-color);
      font-family: var(--ds-font-stack);
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
      opacity: 0;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear 0.3s;
    }
    .DsShortcutsHelpOverlay.visible {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      pointer-events: auto;
      visibility: visible;
      transition-delay: 0s;
    }
    .DsShortcutsHelpTitle {
      margin: 0 0 20px 0;
      width: 100%;
      color: var(--ds-overlay-text-color);
      font-size: 16px;
      font-weight: 600;
      text-align: center;
    }
    .DsShortcutsHelpList {}
    .DsShortcutsHelpRow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding: 5px 0;
    }
    .DsShortcutsHelpKey {
      min-width: 90px;
      padding: 4px 8px;
      margin-left: 16px;
      background: var(--ds-key-bg-color);
      border: 0.5px solid var(--ds-overlay-border-color);
      border-radius: 5px;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
      color: var(--ds-overlay-text-color);
      font-family: inherit;
      font-size: 13px;
      text-align: center;
      flex-shrink: 0;
    }
    .DsShortcutsHelpDesc {
      flex-grow: 1;
      padding-right: 10px;
      color: var(--ds-overlay-secondary-text-color);
    }
    .DsShortcutsHelpWarning {
      margin-top: 18px;
      padding: 12px;
      background: var(--ds-warning-bg-color);
      border: 0.5px solid var(--ds-warning-border-color);
      border-radius: 8px;
      color: var(--ds-warning-text-color);
      font-size: 12px;
      line-height: 1.5;
      text-align: center;
    }
  `;

  if (typeof GM_addStyle === "function") {
    GM_addStyle(Styles);
  } else {
    const StyleElement = document.createElement("style");
    StyleElement.textContent = Styles;
    document.head.appendChild(StyleElement);
  }

  const CreateButtonFinder = (Selector, Text) => () =>
    Array.from(document.querySelectorAll(Selector)).find(
      (Button) =>
        Button.textContent?.includes(Text) || Button.querySelector(Text)
    );

  const FindRegenButton = CreateButtonFinder(".ds-icon-button", "#重新生成");
  const FindContinueButton = CreateButtonFinder(".ds-button", "继续生成");
  const FindDeepThinkButton = CreateButtonFinder(".ds-button span", "深度思考");
  const FindSearchButton = CreateButtonFinder(".ds-button span", "联网搜索");
  const FindUploadButton = () => document.querySelector(".f02f0e25");
  const FindNewChatButton = () => document.querySelector("._217e214");
  const FindToggleSidebarButton = () =>
    document
      .querySelector(
        ".ds-icon-button svg #打开边栏0730, .ds-icon-button svg #折叠边栏0730"
      )
      ?.closest(".ds-icon-button");
  const FindChatMenuButton = () => {
    const SelectedChat = document.querySelector("._83421f9.b64fb9ae");
    return SelectedChat?.querySelector("._2090548");
  };

  const GetModifierKeyInfo = () => {
    const IsMac = /Macintosh|Mac OS X/i.test(navigator.userAgent);
    return {
      Character: IsMac ? "Control" : "Alt",
      Property: IsMac ? "ctrlKey" : "altKey",
    };
  };

  const ModifierKeyInfo = GetModifierKeyInfo();

  const HelpItems = [
    [`${ModifierKeyInfo.Character} + R`, "重新生成回答"],
    [`${ModifierKeyInfo.Character} + C`, "继续生成回答"],
    [`${ModifierKeyInfo.Character} + D`, "深度思考模式"],
    [`${ModifierKeyInfo.Character} + S`, "联网搜索模式"],
    [`${ModifierKeyInfo.Character} + U`, "上传本地文件"],
    [`${ModifierKeyInfo.Character} + N`, "新建对话窗口"],
    [`${ModifierKeyInfo.Character} + T`, "切换开关边栏"],
    [`${ModifierKeyInfo.Character} + I`, "当前对话菜单"],
    [`${ModifierKeyInfo.Character} + H`, "快捷按键帮助"],
  ];

  let HelpOverlayInstance = null;

  const CreateHelpOverlay = () => {
    const OverlayElement = document.createElement("div");
    OverlayElement.classList.add("DsShortcutsHelpOverlay");

    const TitleElement = document.createElement("h3");
    TitleElement.textContent = "快捷按键指北";
    TitleElement.classList.add("DsShortcutsHelpTitle");

    const ListElement = document.createElement("div");
    ListElement.classList.add("DsShortcutsHelpList");

    HelpItems.forEach(([KeyShortcut, Description]) => {
      const RowElement = document.createElement("div");
      RowElement.classList.add("DsShortcutsHelpRow");

      const KeyElement = document.createElement("span");
      KeyElement.textContent = KeyShortcut;
      KeyElement.classList.add("DsShortcutsHelpKey");

      const DescriptionElement = document.createElement("span");
      DescriptionElement.textContent = Description;
      DescriptionElement.classList.add("DsShortcutsHelpDesc");

      RowElement.append(DescriptionElement, KeyElement);
      ListElement.append(RowElement);
    });

    const WarningElement = document.createElement("div");
    WarningElement.textContent = "⚠️ 脚本依UA自动适配快捷键 篡改UA或致功能异常";
    WarningElement.classList.add("DsShortcutsHelpWarning");

    OverlayElement.append(TitleElement, ListElement, WarningElement);
    document.body.append(OverlayElement);
    return OverlayElement;
  };

  const HandleOutsideClick = (MouseEvent) => {
    if (
      HelpOverlayInstance &&
      HelpOverlayInstance.classList.contains("visible") &&
      !HelpOverlayInstance.contains(MouseEvent.target)
    ) {
      CloseHelpOverlay();
    }
  };

  const ToggleHelpOverlay = (OverlayElement) => {
    if (!OverlayElement) return;

    const IsVisible = OverlayElement.classList.contains("visible");

    if (IsVisible) {
      OverlayElement.classList.remove("visible");
      window.removeEventListener("click", HandleOutsideClick, true);
    } else {
      OverlayElement.classList.add("visible");
      setTimeout(() => {
        window.addEventListener("click", HandleOutsideClick, true);
      }, 0);
    }
  };

  const InitializeHelpOverlay = () => {
    if (!HelpOverlayInstance) {
      HelpOverlayInstance = CreateHelpOverlay();
    }
  };

  const CloseHelpOverlay = () => {
    if (
      HelpOverlayInstance &&
      HelpOverlayInstance.classList.contains("visible")
    ) {
      HelpOverlayInstance.classList.remove("visible");
      window.removeEventListener("click", HandleOutsideClick, true);
    }
  };

  const SafeClickElement = (FinderFunction) => {
    const Element = FinderFunction();
    if (Element) {
      Element.click();
    }
  };

  const KeyActionsMap = {
    r: () => SafeClickElement(FindRegenButton),
    c: () => SafeClickElement(FindContinueButton),
    d: () => SafeClickElement(FindDeepThinkButton),
    s: () => SafeClickElement(FindSearchButton),
    u: () => SafeClickElement(FindUploadButton),
    n: () => SafeClickElement(FindNewChatButton),
    t: () => SafeClickElement(FindToggleSidebarButton),
    i: () => SafeClickElement(FindChatMenuButton),
    h: () => {
      InitializeHelpOverlay();
      ToggleHelpOverlay(HelpOverlayInstance);
      return true;
    },
  };

  const CreateKeyHandler = () => {
    const IsModifierPressed = (KeyboardEvent) =>
      KeyboardEvent[ModifierKeyInfo.Property];

    return (KeyboardEvent) => {
      if (KeyboardEvent.key === "Escape") {
        CloseHelpOverlay();
        KeyboardEvent.preventDefault();
        KeyboardEvent.stopPropagation();
        return;
      }

      if (!IsModifierPressed(KeyboardEvent)) {
        return;
      }

      const PressedKey = KeyboardEvent.key.toLowerCase();
      const ActionFunction = KeyActionsMap[PressedKey];

      if (ActionFunction) {
        const ActionResult = ActionFunction(KeyboardEvent);
        if (ActionResult !== false) {
          KeyboardEvent.preventDefault();
          KeyboardEvent.stopPropagation();
        }
      }
    };
  };

  const GlobalKeyHandler = CreateKeyHandler();
  window.addEventListener("keydown", GlobalKeyHandler, true);
})();

// ==UserScript==
// @name         DeepSeek快捷键
// @description  为DeepSeek提供快捷键支持（Mac & Windows）
// @version      1.1.2
// @icon         https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/DeepSeekShortcutIcon.svg
// @author       念柚
// @namespace    https://github.com/MiPoNianYou/UserScripts
// @license      GPL-3.0
// @match        https://chat.deepseek.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const CreateButtonFinder = (selector, text) => () =>
    Array.from(document.querySelectorAll(selector)).find((btn) =>
      btn.textContent?.trim().includes(text)
    );

  const FindRegenBtn = CreateButtonFinder(".ds-icon-button", "#重新生成");
  const FindContinueBtn = CreateButtonFinder(".ds-button", "继续生成");
  const FindDeepThinkBtn = CreateButtonFinder(".ds-button span", "深度思考");
  const FindSearchBtn = CreateButtonFinder(".ds-button span", "联网搜索");
  const FindUploadBtn = () => document.querySelector(".f02f0e25");
  const FindNewChatBtn = () => document.querySelector("._217e214");
  const FindToggleSidebarBtn = () =>
    document
      .querySelector(
        ".ds-icon-button svg #打开边栏0730, .ds-icon-button svg #折叠边栏0730"
      )
      ?.closest(".ds-icon-button");
  const FindChatMenuBtn = () => {
    const SelectedChat = document.querySelector("._83421f9.b64fb9ae");
    return SelectedChat?.querySelector("._2090548");
  };

  const GetModifierKey = () => {
    const UA = navigator.userAgent;
    const IsMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(UA);
    return {
      Character: IsMac ? "Control" : "Alt",
      IsMac,
    };
  };

  const ModifierKey = GetModifierKey();
  const HelpItems = [
    [`${ModifierKey.Character} + R`, "重新生成"],
    [`${ModifierKey.Character} + C`, "继续生成"],
    [`${ModifierKey.Character} + D`, "深度思考"],
    [`${ModifierKey.Character} + S`, "联网搜索"],
    [`${ModifierKey.Character} + U`, "上传文件"],
    [`${ModifierKey.Character} + N`, "新建对话"],
    [`${ModifierKey.Character} + T`, "开关边栏"],
    [`${ModifierKey.Character} + I`, "对话菜单"],
    [`${ModifierKey.Character} + H`, "脚本帮助"],
  ];

  const CreateHelpOverlay = () => {
    const Overlay = document.createElement("div");
    Overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      background: rgba(28, 28, 30, 0.9);
      border: 0.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px) saturate(180%);
      opacity: 0;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 9999;
      pointer-events: none;
      min-width: 280px;
      color: rgba(255, 255, 255, 0.95);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
    `;

    const Title = document.createElement("h3");
    Title.textContent = "快捷按键指北";
    Title.style.cssText = `
      margin: 0 0 20px 0;
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      width: 100%;
    `;

    const List = document.createElement("div");
    HelpItems.forEach(([key, desc]) => {
      const Row = document.createElement("div");
      Row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding: 5px 0;
        border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
      `;
      if (HelpItems.indexOf([key, desc]) === HelpItems.length - 1) {
        Row.style.borderBottom = "none";
        Row.style.marginBottom = "0";
      }

      const KeyEl = document.createElement("span");
      KeyEl.textContent = key;
      KeyEl.style.cssText = `
        color: rgba(255, 255, 255, 0.95);
        background: rgba(255, 255, 255, 0.1);
        padding: 4px 8px;
        border-radius: 5px;
        border: 0.5px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        font-family: inherit;
        font-size: 13px;
        min-width: 90px;
        text-align: center;
        flex-shrink: 0;
        margin-left: 16px;
      `;

      const DescEl = document.createElement("span");
      DescEl.textContent = desc;
      DescEl.style.cssText = `
        color: rgba(255, 255, 255, 0.8);
        flex-grow: 1;
        padding-right: 10px;
      `;

      Row.append(DescEl, KeyEl);
      List.append(Row);
    });

    const Warning = document.createElement("div");
    Warning.textContent =
      "⚠️ 本脚本通过检测浏览器UA自动切换快捷键 使用修改UA的插件可能导致功能异常";
    Warning.style.cssText = `
      margin-top: 24px;
      padding: 12px;
      color: rgba(255, 119, 119, 0.9);
      background: rgba(255, 119, 119, 0.1);
      border-radius: 8px;
      line-height: 1.5;
      text-align: center;
      font-size: 12px;
      border: 0.5px solid rgba(255, 119, 119, 0.2);
    `;

    Overlay.append(Title, List, Warning);
    document.body.append(Overlay);
    return Overlay;
  };

  const ToggleHelpOverlay = (Overlay) => {
    const IsVisible = parseFloat(Overlay.style.opacity || 0) > 0;
    Overlay.style.opacity = IsVisible ? "0" : "1";
    Overlay.style.transform = `translate(-50%, -50%) scale(${
      IsVisible ? 0.95 : 1
    })`;
    Overlay.style.pointerEvents = IsVisible ? "none" : "auto";
  };

  let HelpOverlay = null;
  const InitHelpOverlay = () => {
    if (!HelpOverlay) {
      HelpOverlay = CreateHelpOverlay();
    }
  };

  const SafeClick = (FinderFunc) => {
    FinderFunc()?.click();
  };

  const KeyActions = {
    r: () => SafeClick(FindRegenBtn),
    c: () => SafeClick(FindContinueBtn),
    d: () => SafeClick(FindDeepThinkBtn),
    s: () => SafeClick(FindSearchBtn),
    u: () => SafeClick(FindUploadBtn),
    n: () => SafeClick(FindNewChatBtn),
    t: () => SafeClick(FindToggleSidebarBtn),
    i: () => SafeClick(FindChatMenuBtn),
    h: () => {
      InitHelpOverlay();
      ToggleHelpOverlay(HelpOverlay);
    },
  };

  const CreateKeyHandler = () => {
    const IsModifierPressed = (Event) =>
      ModifierKey.IsMac ? Event.ctrlKey : Event.altKey;

    return (Event) => {
      if (Event.key === "Escape" && HelpOverlay?.style.opacity === "1") {
        ToggleHelpOverlay(HelpOverlay);
        return;
      }

      if (!IsModifierPressed(Event)) return;
      const Key = Event.key.toLowerCase();
      const Action = KeyActions[Key];
      Action?.(Event) && Event.preventDefault();
    };
  };

  const KeyHandler = CreateKeyHandler();
  window.addEventListener("keydown", KeyHandler, true);
})();

// ==UserScript==
// @name         DeepSeek快捷键
// @description  为DeepSeek提供快捷键支持（Mac & Windows）
// @version      1.1.0
// @author       念柚
// @namespace    https://github.com/MiPoNianYou/UserScripts
// @license      GPL-3.0
// @match        https://chat.deepseek.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const CreateButtonFinder = (selector, text) => () =>
    Array.from(document.querySelectorAll(selector)).find(
      (btn) => btn.textContent?.includes(text) || btn.querySelector(text)
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
    if (!SelectedChat) return null;
    const ChatMenuBtn = SelectedChat.querySelector("._2090548");
    if (ChatMenuBtn) ChatMenuBtn.click();
  };

  const GetModifierKey = () => {
    const UA = navigator.userAgent;
    const IsMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(UA);
    return {
      Key: IsMac ? "ctrl" : "alt",
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
      background: rgba(28, 28, 30, 0.95);
      border: 0.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 13px;
      padding: 20px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px) saturate(180%);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.28, 0.55, 0.385, 1.1);
      z-index: 9999;
      pointer-events: none;
      min-width: 260px;
      color: #ffffff;
    `;

    const Title = document.createElement("h3");
    Title.textContent = "快捷键指南";
    Title.style.cssText = `
      margin: 0 0 16px 0;
      font: 500 16px/-apple-system, sans-serif;
      color: rgba(255, 255, 255, 0.85);
      text-align: center;
      width: 100%;
    `;

    const List = document.createElement("div");
    HelpItems.forEach(([key, desc]) => {
      const Row = document.createElement("div");
      Row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 3px 0;
        border-bottom: 0.5px solid rgba(255, 255, 255, 0.05);
      `;

      const KeyEl = document.createElement("span");
      KeyEl.textContent = key;
      KeyEl.style.cssText = `
        font: 13px/.system-ui, -apple-system, sans-serif;
        color: rgba(255, 255, 255, 0.9);
        background: rgba(120, 120, 128, 0.2);
        padding: 5px 10px;
        border-radius: 6px;
        letter-spacing: -0.2px;
        min-width: 88px;
        text-align: center;
        flex-shrink: 0;
      `;

      const DescEl = document.createElement("span");
      DescEl.textContent = desc;
      DescEl.style.cssText = `
        font: 13px/-apple-system, sans-serif;
        color: rgba(255, 255, 255, 0.75);
        margin-right: 12px;
        flex: 1;
      `;

      Row.append(DescEl, KeyEl);
      List.append(Row);
    });

    const Warning = document.createElement("div");
    Warning.textContent =
      "⚠️ 本脚本通过检测浏览器UA自动切换快捷键 使用修改UA的插件可能导致功能异常";
    Warning.style.cssText = `
      margin-top: 20px;
      padding: 10px;
      font: 11px/-apple-system, sans-serif;
      color: #ff6961;
      background: rgba(255, 105, 97, 0.1);
      border-radius: 8px;
      line-height: 1.4;
      text-align: center;
      border: 0.5px solid rgba(255, 105, 97, 0.2);
    `;

    Overlay.append(Title, List, Warning);
    document.body.append(Overlay);
    return Overlay;
  };

  const ToggleHelpOverlay = (Overlay) => {
    const IsVisible = Overlay.style.opacity === "1";
    Overlay.style.opacity = IsVisible ? "0" : "1";
    Overlay.style.transform = `translate(-50%, -50%) scale(${
      IsVisible ? 0.95 : 1
    })`;
    Overlay.style.pointerEvents = IsVisible ? "none" : "auto";
  };

  const SafeClick = (FinderFunc) => {
    FinderFunc()?.click();
  };

  let HelpOverlay = null;
  const InitHelpOverlay = () => {
    if (!HelpOverlay) HelpOverlay = CreateHelpOverlay();
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
      if (!IsModifierPressed(Event)) return;
      const Key = Event.key.toLowerCase();
      const Action = KeyActions[Key];
      Action?.(Event) && Event.preventDefault();
    };
  };

  const KeyHandler = CreateKeyHandler();
  window.addEventListener("keydown", KeyHandler);
})();

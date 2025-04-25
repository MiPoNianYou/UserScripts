// ==UserScript==
// @name               Password Revealer
// @name:zh-CN         密码显示助手
// @name:zh-TW         密碼顯示助手
// @description        Reveal Passwords By Hovering/DoubleClicking/Always Show Select Mode Via The Tampermonkey Menu Or Shortcut Ctrl/Meta+Alt+P.
// @description:zh-CN  通过鼠标悬浮/双击/始终显示来显示密码框内容 可通过脚本菜单或快捷键 Ctrl/Meta+Alt+P 选择触发方式
// @description:zh-TW  透過滑鼠懸浮/雙擊/始終顯示來顯示密碼框內容 可透過腳本選單或快捷鍵 Ctrl/Meta+Alt+P 選擇觸發方式
// @version            1.3.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/PasswordRevealerIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              *://*/*
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_registerMenuCommand
// @grant              GM_unregisterMenuCommand
// @grant              GM_addStyle
// @run-at             document-idle
// ==/UserScript==

(function () {
  "use strict";

  const MODE_KEY = "PasswordDisplayMode";
  const MODE_HOVER = "Hover";
  const MODE_DBLCLICK = "DoubleClick";
  const MODE_ALWAYS_SHOW = "AlwaysShow";
  const NOTIFICATION_ID = "PasswordRevealerNotification";
  const NOTIFICATION_TIMEOUT = 2000;
  const ANIMATION_DURATION = 300;
  const SCRIPT_ICON_URL =
    "https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/PasswordRevealerIcon.svg";
  const PROCESSED_ATTRIBUTE = "data-password-revealer-processed";

  const VALID_MODES = [MODE_HOVER, MODE_DBLCLICK, MODE_ALWAYS_SHOW];

  const LOCALIZATION = {
    "en-US": {
      ScriptTitle: "Password Revealer",
      MenuCmdSetHover: "「Hover」Mode",
      MenuCmdSetDBClick: "「Double Click」Mode",
      MenuCmdSetAlwaysShow: "「Always Show」Mode",
      AlertMessages: {
        [MODE_HOVER]: "Mode Switched To 「Hover」",
        [MODE_DBLCLICK]: "Mode Switched To 「Double Click」",
        [MODE_ALWAYS_SHOW]: "Mode Switched To 「Always Show」",
      },
    },
    "zh-CN": {
      ScriptTitle: "密码显示助手",
      MenuCmdSetHover: "「悬浮显示」模式",
      MenuCmdSetDBClick: "「双击切换」模式",
      MenuCmdSetAlwaysShow: "「始终显示」模式",
      AlertMessages: {
        [MODE_HOVER]: "模式已切换为「悬浮显示」",
        [MODE_DBLCLICK]: "模式已切换为「双击切换」",
        [MODE_ALWAYS_SHOW]: "模式已切换为「始终显示」",
      },
    },
    "zh-TW": {
      ScriptTitle: "密碼顯示助手",
      MenuCmdSetHover: "「懸浮顯示」模式",
      MenuCmdSetDBClick: "「雙擊切換」模式",
      MenuCmdSetAlwaysShow: "「始終顯示」模式",
      AlertMessages: {
        [MODE_HOVER]: "模式已切換為「懸浮顯示」",
        [MODE_DBLCLICK]: "模式已切換為「雙擊切換」",
        [MODE_ALWAYS_SHOW]: "模式已切換為「始終顯示」",
      },
    },
  };

  const MODE_MENU_TEXT_KEYS = {
    [MODE_HOVER]: "MenuCmdSetHover",
    [MODE_DBLCLICK]: "MenuCmdSetDBClick",
    [MODE_ALWAYS_SHOW]: "MenuCmdSetAlwaysShow",
  };

  let registeredMenuCommandIds = [];
  let notificationTimer = null;
  let removalTimer = null;
  let currentMode = GM_getValue(MODE_KEY, MODE_HOVER);

  function getLanguageKey() {
    const lang = navigator.language;
    if (lang.startsWith("zh")) {
      return lang === "zh-TW" || lang === "zh-HK" || lang === "zh-Hant"
        ? "zh-TW"
        : "zh-CN";
    }
    return "en-US";
  }

  function getLocalizedText(key, subKey = null, fallbackLang = "en-US") {
    const langKey = getLanguageKey();
    const primaryLangData = LOCALIZATION[langKey] || LOCALIZATION[fallbackLang];
    const fallbackLangData = LOCALIZATION[fallbackLang];

    let value;
    if (subKey && key === "AlertMessages") {
      value = primaryLangData[key]?.[subKey] ?? fallbackLangData[key]?.[subKey];
    } else {
      value = primaryLangData[key] ?? fallbackLangData[key];
    }
    return value ?? (subKey ? `${key}.${subKey}?` : `${key}?`);
  }

  function injectNotificationStyles() {
    GM_addStyle(`
      #${NOTIFICATION_ID} {
        position: fixed;
        top: 20px;
        right: -400px;
        width: 300px;
        background-color: rgba(240, 240, 240, 0.9);
        color: #333;
        padding: 10px;
        border-radius: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        z-index: 99999;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: flex-start;
        opacity: 0;
        transition: right ${ANIMATION_DURATION}ms ease-out, opacity ${
      ANIMATION_DURATION * 0.8
    }ms ease-out;
        box-sizing: border-box;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      #${NOTIFICATION_ID}.visible {
        right: 20px;
        opacity: 1;
      }

      #${NOTIFICATION_ID} .pr-icon {
        width: 32px;
        height: 32px;
        margin-right: 10px;
        flex-shrink: 0;
      }

      #${NOTIFICATION_ID} .pr-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-width: 0;
      }

      #${NOTIFICATION_ID} .pr-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 2px;
        color: #111;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #${NOTIFICATION_ID} .pr-message {
        font-size: 12px;
        line-height: 1.3;
        color: #444;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      @media (prefers-color-scheme: dark) {
        #${NOTIFICATION_ID} {
          background-color: rgba(50, 50, 50, 0.85);
          color: #eee;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        #${NOTIFICATION_ID} .pr-title {
          color: #f0f0f0;
        }
        #${NOTIFICATION_ID} .pr-message {
          color: #ccc;
        }
      }
    `);
  }

  function showNotification(message) {
    if (notificationTimer) clearTimeout(notificationTimer);
    if (removalTimer) clearTimeout(removalTimer);

    const existingNotification = document.getElementById(NOTIFICATION_ID);
    if (existingNotification) {
      existingNotification.remove();
    }

    const notificationElement = document.createElement("div");
    notificationElement.id = NOTIFICATION_ID;
    notificationElement.innerHTML = `
      <img src="${SCRIPT_ICON_URL}" alt="" class="pr-icon">
      <div class="pr-content">
        <div class="pr-title">${getLocalizedText("ScriptTitle")}</div>
        <div class="pr-message">${message}</div>
      </div>
    `;

    document.body.appendChild(notificationElement);

    requestAnimationFrame(() => {
      notificationElement.classList.add("visible");
    });

    notificationTimer = setTimeout(() => {
      notificationElement.classList.remove("visible");
      removalTimer = setTimeout(() => {
        if (notificationElement.parentNode) {
          notificationElement.remove();
        }
        notificationTimer = null;
        removalTimer = null;
      }, ANIMATION_DURATION);
    }, NOTIFICATION_TIMEOUT);
  }

  function processPasswordInput(input, mode) {
    if (
      !(input instanceof HTMLInputElement) ||
      input.type === "hidden" ||
      input.hasAttribute(PROCESSED_ATTRIBUTE)
    ) {
      return;
    }

    if (mode === MODE_ALWAYS_SHOW) {
      input.type = "text";
    } else {
      if (input.type !== "password") {
        input.type = "password";
      }
    }
    input.setAttribute(PROCESSED_ATTRIBUTE, mode);
  }

  function findAllPasswordInputs(rootNode) {
    const results = [];
    try {
      rootNode
        .querySelectorAll(
          `input[type="password"]:not([${PROCESSED_ATTRIBUTE}])`
        )
        .forEach((input) => results.push(input));

      rootNode.querySelectorAll("*").forEach((el) => {
        if (el.shadowRoot) {
          results.push(...findAllPasswordInputs(el.shadowRoot));
        }
      });
    } catch (e) {}
    return results;
  }

  function setMode(newMode) {
    if (currentMode === newMode || !VALID_MODES.includes(newMode)) {
      return;
    }

    const oldMode = currentMode;
    currentMode = newMode;
    GM_setValue(MODE_KEY, currentMode);

    const alertMessage = getLocalizedText("AlertMessages", currentMode);
    showNotification(alertMessage);

    const processedInputs = document.querySelectorAll(
      `input[${PROCESSED_ATTRIBUTE}]`
    );
    processedInputs.forEach((input) => {
      input.setAttribute(PROCESSED_ATTRIBUTE, currentMode);
      if (currentMode === MODE_ALWAYS_SHOW) {
        input.type = "text";
      } else if (oldMode === MODE_ALWAYS_SHOW) {
        input.type = "password";
      }
    });

    const untrackedPasswordInputs = findAllPasswordInputs(document.body);
    untrackedPasswordInputs.forEach((input) =>
      processPasswordInput(input, currentMode)
    );

    registerModeMenuCommands();
  }

  function registerModeMenuCommands() {
    registeredMenuCommandIds.forEach((id) => {
      try {
        GM_unregisterMenuCommand(id);
      } catch (e) {}
    });
    registeredMenuCommandIds = [];

    VALID_MODES.forEach((mode) => {
      const menuKey = MODE_MENU_TEXT_KEYS[mode];
      const baseText = getLocalizedText(menuKey);
      const commandText = baseText + (mode === currentMode ? " ✅" : "");

      const commandId = GM_registerMenuCommand(commandText, () =>
        setMode(mode)
      );
      registeredMenuCommandIds.push(commandId);
    });
  }

  function showPasswordOnHover(event) {
    const input = event.target;
    if (
      currentMode === MODE_HOVER &&
      input.matches(
        `input[type="password"][${PROCESSED_ATTRIBUTE}="${MODE_HOVER}"]`
      )
    ) {
      input.type = "text";
    }
  }

  function hidePasswordOnLeave(event) {
    const input = event.target;
    if (
      currentMode === MODE_HOVER &&
      input.matches(
        `input[type="text"][${PROCESSED_ATTRIBUTE}="${MODE_HOVER}"]`
      )
    ) {
      input.type = "password";
    }
  }

  function togglePasswordOnDoubleClick(event) {
    const input = event.target;
    if (
      currentMode === MODE_DBLCLICK &&
      input.matches(`input[${PROCESSED_ATTRIBUTE}="${MODE_DBLCLICK}"]`)
    ) {
      input.type = input.type === "password" ? "text" : "password";
    }
  }

  function initializeEventListeners() {
    document.body.addEventListener("mouseenter", showPasswordOnHover, true);
    document.body.addEventListener("mouseleave", hidePasswordOnLeave, true);
    document.body.addEventListener("dblclick", togglePasswordOnDoubleClick);
  }

  function handleKeyDown(event) {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.altKey &&
      event.code === "KeyP"
    ) {
      event.preventDefault();
      event.stopPropagation();

      const currentIndex = VALID_MODES.indexOf(currentMode);
      const nextIndex = (currentIndex + 1) % VALID_MODES.length;
      const nextMode = VALID_MODES[nextIndex];

      setMode(nextMode);
    }
  }

  const observerCallback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const inputsToProcess = findAllPasswordInputs(node);
            inputsToProcess.forEach((input) =>
              processPasswordInput(input, currentMode)
            );
          }
        });
      } else if (
        mutation.type === "attributes" &&
        mutation.attributeName === "type"
      ) {
        const targetInput = mutation.target;
        if (
          targetInput.nodeType === Node.ELEMENT_NODE &&
          targetInput.matches &&
          targetInput.matches('input[type="password"]') &&
          !targetInput.hasAttribute(PROCESSED_ATTRIBUTE)
        ) {
          processPasswordInput(targetInput, currentMode);
        }
      }
    }
  };

  const observer = new MutationObserver(observerCallback);

  if (!VALID_MODES.includes(currentMode)) {
    currentMode = MODE_HOVER;
    GM_setValue(MODE_KEY, currentMode);
  }

  injectNotificationStyles();
  findAllPasswordInputs(document.body).forEach((input) =>
    processPasswordInput(input, currentMode)
  );

  initializeEventListeners();
  document.addEventListener("keydown", handleKeyDown, true);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["type"],
  });

  registerModeMenuCommands();
})();

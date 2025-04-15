// ==UserScript==
// @name               Password Revealer
// @name:zh-CN         密码显示助手
// @name:zh-TW         密碼顯示助手
// @description        Reveal Passwords By Hovering Or DoubleClicking The Input Field Switch Modes Via The Tampermonkey Menu
// @description:zh-CN  通过鼠标悬浮或双击来显示密码框内容 可通过脚本菜单切换触发方式
// @description:zh-TW  透過滑鼠懸浮或雙擊來顯示密碼框內容 可透過腳本選單切換觸發方式
// @version            1.1.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/PasswordRevealerIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              *://*/*
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_registerMenuCommand
// @grant              GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  const ModeKey = "PasswordDisplayMode";
  const ModeHover = "Hover";
  const ModeDBClick = "DoubleClick";
  const NotificationId = "password-revealer-notification";
  const NotificationTimeout = 2000;
  const AnimationDuration = 300;
  const ScriptIconUrl =
    "https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/PasswordRevealerIcon.svg";

  const ScriptTitles = {
    "en-US": "Password Revealer",
    "zh-CN": "密码显示助手",
    "zh-TW": "密碼顯示助手",
  };

  const MenuCommandTexts = {
    "en-US": "Toggle Password Display Mode",
    "zh-CN": "切换密码显示模式",
    "zh-TW": "切換密碼顯示模式",
  };

  const AlertMessages = {
    "en-US": {
      [ModeHover]: "Mode Switched To 「Hover」",
      [ModeDBClick]: "Mode Switched To 「Double Click」",
    },
    "zh-CN": {
      [ModeHover]: "模式已切换为：悬浮显示",
      [ModeDBClick]: "模式已切换为：双击切换",
    },
    "zh-TW": {
      [ModeHover]: "模式已切換為：懸浮顯示",
      [ModeDBClick]: "模式已切換為：雙擊切換",
    },
  };

  function InjectNotificationStyles() {
    GM_addStyle(`
      #${NotificationId} {
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
        transition: right ${AnimationDuration}ms ease-out, opacity ${
      AnimationDuration * 0.8
    }ms ease-out;
        box-sizing: border-box;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      #${NotificationId}.visible {
        right: 20px;
        opacity: 1;
      }
      #${NotificationId} .pr-icon {
        width: 32px;
        height: 32px;
        margin-right: 10px;
        flex-shrink: 0;
      }
      #${NotificationId} .pr-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-width: 0;
      }
      #${NotificationId} .pr-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 2px;
        color: #111;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${NotificationId} .pr-message {
        font-size: 12px;
        line-height: 1.3;
        color: #444;
         word-wrap: break-word;
         overflow-wrap: break-word;
      }
      @media (prefers-color-scheme: dark) {
          #${NotificationId} {
              background-color: rgba(50, 50, 50, 0.85);
              color: #eee;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          }
          #${NotificationId} .pr-title {
              color: #f0f0f0;
          }
          #${NotificationId} .pr-message {
               color: #ccc;
          }
      }
    `);
  }

  let NotificationTimer = null;
  let RemovalTimer = null;

  function ShowNotification(Message) {
    if (NotificationTimer) clearTimeout(NotificationTimer);
    if (RemovalTimer) clearTimeout(RemovalTimer);

    const ExistingNotification = document.getElementById(NotificationId);
    if (ExistingNotification) {
      ExistingNotification.remove();
    }

    const NotificationElement = document.createElement("div");
    NotificationElement.id = NotificationId;

    const LocalizedTitle = GetLocalizedScriptTitle();

    NotificationElement.innerHTML = `
      <img src="${ScriptIconUrl}" alt="Icon" class="pr-icon">
      <div class="pr-content">
        <div class="pr-title">${LocalizedTitle}</div>
        <div class="pr-message">${Message}</div>
      </div>
    `;

    document.body.appendChild(NotificationElement);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        NotificationElement.classList.add("visible");
      });
    });

    NotificationTimer = setTimeout(() => {
      NotificationElement.classList.remove("visible");
      RemovalTimer = setTimeout(() => {
        if (NotificationElement.parentNode) {
          NotificationElement.remove();
        }
        NotificationTimer = null;
        RemovalTimer = null;
      }, AnimationDuration);
    }, NotificationTimeout);
  }

  function GetLanguageKey() {
    const Lang = navigator.language;
    if (Lang.startsWith("zh")) {
      if (Lang === "zh-TW" || Lang === "zh-HK" || Lang === "zh-Hant") {
        return "zh-TW";
      } else {
        return "zh-CN";
      }
    } else {
      if (Lang.startsWith("en")) {
        return "en-US";
      }
      return "en-US";
    }
  }

  function GetLocalizedScriptTitle() {
    const LangKey = GetLanguageKey();
    return ScriptTitles[LangKey] || ScriptTitles["en-US"];
  }

  function GetLocalizedMenuCommandText() {
    const LangKey = GetLanguageKey();
    return MenuCommandTexts[LangKey] || MenuCommandTexts["en-US"];
  }

  function GetLocalizedAlertMessage(Mode) {
    const LangKey = GetLanguageKey();
    const LangMessages = AlertMessages[LangKey] || AlertMessages["en-US"];
    return LangMessages[Mode] || `Mode: ${Mode}`;
  }

  let CurrentMode = GM_getValue(ModeKey, ModeHover);
  const LocalizedCommandText = GetLocalizedMenuCommandText();

  function ShowPasswordOnHover() {
    this.type = "text";
  }

  function HidePasswordOnLeave() {
    this.type = "password";
  }

  function TogglePasswordOnDoubleClick() {
    this.type = this.type === "password" ? "text" : "password";
  }

  function ApplyHoverBehavior(Input) {
    Input.addEventListener("mouseenter", ShowPasswordOnHover);
    Input.addEventListener("mouseleave", HidePasswordOnLeave);
    Input.removeEventListener("dblclick", TogglePasswordOnDoubleClick);
  }

  function RemoveHoverBehavior(Input) {
    Input.removeEventListener("mouseenter", ShowPasswordOnHover);
    Input.removeEventListener("mouseleave", HidePasswordOnLeave);
  }

  function ApplyDoubleClickBehavior(Input) {
    Input.addEventListener("dblclick", TogglePasswordOnDoubleClick);
    Input.removeEventListener("mouseenter", ShowPasswordOnHover);
    Input.removeEventListener("mouseleave", HidePasswordOnLeave);
  }

  function RemoveDoubleClickBehavior(Input) {
    Input.removeEventListener("dblclick", TogglePasswordOnDoubleClick);
  }

  function ProcessPasswordInput(Input, Mode) {
    RemoveHoverBehavior(Input);
    RemoveDoubleClickBehavior(Input);

    if (Mode === ModeHover) {
      ApplyHoverBehavior(Input);
    } else if (Mode === ModeDBClick) {
      ApplyDoubleClickBehavior(Input);
    }
    Input.dataset.passwordProcessed = Mode;
  }

  function ToggleMode() {
    const OldMode = CurrentMode;
    const NewMode = OldMode === ModeHover ? ModeDBClick : ModeHover;
    GM_setValue(ModeKey, NewMode);
    CurrentMode = NewMode;

    const AlertMessage = GetLocalizedAlertMessage(NewMode);
    ShowNotification(AlertMessage);

    document.querySelectorAll('input[type="password"]').forEach((Input) => {
      ProcessPasswordInput(Input, NewMode);
    });
  }

  InjectNotificationStyles();

  document
    .querySelectorAll('input[type="password"]')
    .forEach((Input) => ProcessPasswordInput(Input, CurrentMode));

  const Observer = new MutationObserver((Mutations) => {
    Mutations.forEach((Mutation) => {
      if (Mutation.addedNodes && Mutation.addedNodes.length > 0) {
        Mutation.addedNodes.forEach((Node) => {
          if (
            Node.nodeType === Node.ELEMENT_NODE &&
            Node.tagName === "INPUT" &&
            Node.type === "password" &&
            !Node.dataset.passwordProcessed
          ) {
            ProcessPasswordInput(Node, CurrentMode);
          } else if (
            Node.nodeType === Node.ELEMENT_NODE &&
            Node.querySelectorAll
          ) {
            const PasswordInputs = Node.querySelectorAll(
              'input[type="password"]:not([data-password-processed])'
            );
            PasswordInputs.forEach((Input) =>
              ProcessPasswordInput(Input, CurrentMode)
            );
          }
        });
      }
    });
  });

  Observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  GM_registerMenuCommand(LocalizedCommandText, ToggleMode);
})();

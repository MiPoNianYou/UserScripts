// ==UserScript==
// @name               Password Revealer
// @name:zh-CN         密码显示助手
// @name:zh-TW         密碼顯示助手
// @description        Reveal Passwords By Hovering/DoubleClicking/Always Show Select Mode Via The Tampermonkey Menu
// @description:zh-CN  通过鼠标悬浮/双击/始终显示来显示密码框内容 可通过脚本菜单选择触发方式
// @description:zh-TW  透過滑鼠懸浮/雙擊/始終顯示來顯示密碼框內容 可透過腳本選單選擇觸發方式
// @version            1.2.0
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
// ==/UserScript==

(function () {
  "use strict";

  const ModeKey = "PasswordDisplayMode";
  const ModeHover = "Hover";
  const ModeDBClick = "DoubleClick";
  const ModeAlwaysShow = "AlwaysShow";
  const NotificationId = "PasswordRevealerNotification";
  const NotificationTimeout = 2000;
  const AnimationDuration = 300;
  const ScriptIconUrl =
    "https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/PasswordRevealerIcon.svg";
  const ProcessedAttribute = "DataPasswordRevealerProcessed";

  const Localization = {
    "en-US": {
      ScriptTitle: "Password Revealer",
      MenuCmdSetHover: "「Hover」Mode",
      MenuCmdSetDBClick: "「Double Click」Mode",
      MenuCmdSetAlwaysShow: "「Always Show」Mode",
      AlertMessages: {
        [ModeHover]: "Mode Switched To 「Hover」",
        [ModeDBClick]: "Mode Switched To 「Double Click」",
        [ModeAlwaysShow]: "Mode Switched To 「Always Show」",
      },
    },
    "zh-CN": {
      ScriptTitle: "密码显示助手",
      MenuCmdSetHover: "「悬浮显示」模式",
      MenuCmdSetDBClick: "「双击切换」模式",
      MenuCmdSetAlwaysShow: "「始终显示」模式",
      AlertMessages: {
        [ModeHover]: "模式已切换为「悬浮显示」",
        [ModeDBClick]: "模式已切换为「双击切换」",
        [ModeAlwaysShow]: "模式已切换为「始终显示」",
      },
    },
    "zh-TW": {
      ScriptTitle: "密碼顯示助手",
      MenuCmdSetHover: "「懸浮顯示」模式",
      MenuCmdSetDBClick: "「雙擊切換」模式",
      MenuCmdSetAlwaysShow: "「始終顯示」模式",
      AlertMessages: {
        [ModeHover]: "模式已切換為「懸浮顯示」",
        [ModeDBClick]: "模式已切換為「雙擊切換」",
        [ModeAlwaysShow]: "模式已切換為「始終顯示」",
      },
    },
  };

  const ModeMenuTextKeys = {
    [ModeHover]: "MenuCmdSetHover",
    [ModeDBClick]: "MenuCmdSetDBClick",
    [ModeAlwaysShow]: "MenuCmdSetAlwaysShow",
  };

  let RegisteredMenuCommandIds = [];

  function GetLanguageKey() {
    const Lang = navigator.language;
    if (Lang.startsWith("zh")) {
      return Lang === "zh-TW" || Lang === "zh-HK" || Lang === "zh-Hant"
        ? "zh-TW"
        : "zh-CN";
    }
    return "en-US";
  }

  function GetLocalizedText(Key, SubKey = null, FallbackLang = "en-US") {
    const LangKey = GetLanguageKey();
    const PrimaryLangData = Localization[LangKey] || Localization[FallbackLang];
    const FallbackLangData = Localization[FallbackLang];

    let Value;
    if (SubKey && Key === "AlertMessages") {
      Value = PrimaryLangData[Key]?.[SubKey] ?? FallbackLangData[Key]?.[SubKey];
    } else {
      Value = PrimaryLangData[Key] ?? FallbackLangData[Key];
    }
    return Value ?? (SubKey ? `${Key}.${SubKey}?` : `${Key}?`);
  }

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
    NotificationElement.innerHTML = `
      <img src="${ScriptIconUrl}" alt="Icon" class="pr-icon">
      <div class="pr-content">
        <div class="pr-title">${GetLocalizedText("ScriptTitle")}</div>
        <div class="pr-message">${Message}</div>
      </div>
    `;

    document.body.appendChild(NotificationElement);

    requestAnimationFrame(() => {
      NotificationElement.classList.add("visible");
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
    if (!(Input instanceof HTMLInputElement)) return;

    RemoveHoverBehavior(Input);
    RemoveDoubleClickBehavior(Input);

    switch (Mode) {
      case ModeHover:
        Input.type = "password";
        ApplyHoverBehavior(Input);
        break;
      case ModeDBClick:
        Input.type = "password";
        ApplyDoubleClickBehavior(Input);
        break;
      case ModeAlwaysShow:
        Input.type = "text";
        break;
      default:
        Input.type = "password";
        ApplyHoverBehavior(Input);
        Mode = ModeHover;
    }

    Input.setAttribute(ProcessedAttribute, Mode);
  }

  function SetMode(NewMode) {
    if (
      NewMode === CurrentMode ||
      ![ModeHover, ModeDBClick, ModeAlwaysShow].includes(NewMode)
    ) {
      return;
    }

    CurrentMode = NewMode;
    GM_setValue(ModeKey, CurrentMode);

    const AlertMessage = GetLocalizedText("AlertMessages", CurrentMode);
    ShowNotification(AlertMessage);

    const AllPasswordInputs = document.querySelectorAll(
      `input[type="password"], input[type="text"][${ProcessedAttribute}]`
    );
    AllPasswordInputs.forEach((Input) => {
      if (Input.hasAttribute(ProcessedAttribute) || Input.type === "password") {
        ProcessPasswordInput(Input, CurrentMode);
      }
    });

    RegisterModeMenuCommands();
  }

  function RegisterModeMenuCommands() {
    RegisteredMenuCommandIds.forEach((Id) => {
      try {
        GM_unregisterMenuCommand(Id);
      } catch (E) {}
    });
    RegisteredMenuCommandIds = [];

    const ModesToRegister = [ModeHover, ModeDBClick, ModeAlwaysShow];

    ModesToRegister.forEach((Mode) => {
      const MenuKey = ModeMenuTextKeys[Mode];
      const BaseText = GetLocalizedText(MenuKey);
      const CommandText = BaseText + (Mode === CurrentMode ? " ✅" : "");

      const CommandId = GM_registerMenuCommand(CommandText, () =>
        SetMode(Mode)
      );
      RegisteredMenuCommandIds.push(CommandId);
    });
  }

  let CurrentMode = GM_getValue(ModeKey, ModeHover);

  if (![ModeHover, ModeDBClick, ModeAlwaysShow].includes(CurrentMode)) {
    CurrentMode = ModeHover;
    GM_setValue(ModeKey, CurrentMode);
  }

  InjectNotificationStyles();

  document
    .querySelectorAll('input[type="password"]')
    .forEach((Input) => ProcessPasswordInput(Input, CurrentMode));

  const ObserverCallback = (MutationsList) => {
    for (const Mutation of MutationsList) {
      if (Mutation.type === "childList" && Mutation.addedNodes.length > 0) {
        Mutation.addedNodes.forEach((Node) => {
          if (
            Node.nodeType === Node.ELEMENT_NODE &&
            Node.matches &&
            Node.matches('input[type="password"]') &&
            !Node.hasAttribute(ProcessedAttribute)
          ) {
            ProcessPasswordInput(Node, CurrentMode);
          } else if (
            Node.nodeType === Node.ELEMENT_NODE &&
            Node.querySelectorAll
          ) {
            const DescendantInputs = Node.querySelectorAll(
              `input[type="password"]:not([${ProcessedAttribute}])`
            );
            DescendantInputs.forEach((Input) =>
              ProcessPasswordInput(Input, CurrentMode)
            );
          }
        });
      } else if (
        Mutation.type === "attributes" &&
        Mutation.attributeName === "type"
      ) {
        const TargetInput = Mutation.target;
        if (
          TargetInput.nodeType === Node.ELEMENT_NODE &&
          TargetInput.matches &&
          TargetInput.matches('input[type="password"]') &&
          !TargetInput.hasAttribute(ProcessedAttribute)
        ) {
          ProcessPasswordInput(TargetInput, CurrentMode);
        }
      }
    }
  };

  const Observer = new MutationObserver(ObserverCallback);
  Observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["type"],
  });

  RegisterModeMenuCommands();
})();

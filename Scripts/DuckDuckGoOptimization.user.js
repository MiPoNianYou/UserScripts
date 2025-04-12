// ==UserScript==
// @name               DuckDuckGo Optimization
// @name:zh-CN         DuckDuckGo优化
// @name:zh-TW         DuckDuckGo優化
// @description        Double Click To Return The Top / Shortcuts To Other Search Engines
// @description:zh-CN  便捷返回顶部/跨引擎一键搜
// @description:zh-TW  便捷返回頂部/跨引擎一鍵搜
// @version            1.0.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/DuckDuckGoOptimization.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts
// @license            GPL-3.0
// @match              https://duckduckgo.com/*
// @grant              GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  const RightAreaRatio = 0.2;
  const InteractiveElementsSelector =
    'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
  document.addEventListener(
    "dblclick",
    function (Event) {
      const WindowWidth = window.innerWidth;
      const TriggerBoundary = WindowWidth * (1 - RightAreaRatio);
      if (
        Event.clientX > TriggerBoundary &&
        !Event.target.closest(InteractiveElementsSelector)
      ) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    },
    { passive: true }
  );

  const SearchButtonStyle = `
    .SearchBtnGroup {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 12px auto;
      max-width: 800px
      justify-content: center;
    }
    .SearchBtn {
      padding: 10px 20px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 24px;
      color: #e6e6e6;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 120px;
      text-align: center;
      flex-grow: 1;
      flex-basis: 120px;
    }
    .SearchBtn:hover {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.3);
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    @media (prefers-color-scheme: light) {
      .SearchBtn {
        background: #f8f9fa;
        border-color: #ddd;
        color: #444;
      }
      .SearchBtn:hover {
        background: #f1f3f4;
        border-color: #dadce0;
      }
    }
  `;

  GM_addStyle(SearchButtonStyle);

  function CreateSearchButtons() {
    const SearchForm = document.querySelector("#search_form");
    if (!SearchForm || document.querySelector(".SearchBtnGroup")) return;

    const BtnGroup = document.createElement("div");
    BtnGroup.className = "SearchBtnGroup";

    const EngineList = [
      { Name: "Google", Url: "https://www.google.com/search?q=" },
      { Name: "Bing", Url: "https://www.bing.com/search?q=" },
      { Name: "Baidu", Url: "https://www.baidu.com/s?wd=" },
    ];

    EngineList.forEach((Engine) => {
      const Button = document.createElement("button");
      Button.className = "SearchBtn";
      Button.textContent = `使用 ${Engine.Name} 搜索`;
      Button.type = "button";
      Button.addEventListener("click", (Event) => {
        Event.preventDefault();
        const Query = encodeURIComponent(
          document.querySelector("#search_form_input").value
        );
        window.open(`${Engine.Url}${Query}`, "_blank");
      });
      BtnGroup.appendChild(Button);
    });

    SearchForm.parentNode.insertBefore(BtnGroup, SearchForm.nextSibling);
  }

  const Observer = new MutationObserver(() => {
    if (!document.querySelector(".SearchBtnGroup")) CreateSearchButtons();
  });
  Observer.observe(document.body, { subtree: true, childList: true });
  window.addEventListener("DOMContentLoaded", CreateSearchButtons);
})();

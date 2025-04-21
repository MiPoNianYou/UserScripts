// ==UserScript==
// @name               DuckDuckGo Optimization
// @name:zh-CN         DuckDuckGo优化
// @name:zh-TW         DuckDuckGo優化
// @description        Double Click To Return The Top / Shortcuts To Other Search Engines
// @description:zh-CN  便捷返回顶部/跨引擎一键搜
// @description:zh-TW  便捷返回頂部/跨引擎一鍵搜
// @version            1.1.1
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/DuckDuckGoOptimizationIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              https://duckduckgo.com/*
// @grant              GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  const RightAreaRatio = 0.2;
  const InteractiveElementsSelector =
    'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
  const SearchFormSelector = "#search_form";
  const SearchInputSelector = "#search_form_input";
  const SearchBtnGroupClass = "SearchBtnGroup";
  const SearchBtnClass = "SearchBtn";
  const DebounceDelay = 250;

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
  .${SearchBtnGroupClass} {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 12px auto;
    padding: 0 10px;
    max-width: 800px;
    justify-content: center;
  }
  .${SearchBtnClass} {
    padding: 8px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
    min-width: 110px;
    text-align: center;
    flex-grow: 1;
    flex-basis: 110px;
    box-sizing: border-box;
    border: 1px solid transparent;
    background-color: rgba(60, 60, 60, 0.8);
    color: #f5f5f7;
    border-color: rgba(85, 85, 85, 0.9);
  }
  .${SearchBtnClass}:hover {
    background-color: rgba(75, 75, 75, 0.9);
    border-color: rgba(100, 100, 100, 0.9);
  }
  `;
  GM_addStyle(SearchButtonStyle);

  const EngineList = [
    { Name: "Google", Url: "https://www.google.com/search?q=" },
    { Name: "Bing", Url: "https://www.bing.com/search?q=" },
    { Name: "Baidu", Url: "https://www.baidu.com/s?wd=" },
  ];

  function Debounce(Func, Wait) {
    let Timeout;
    return function ExecutedFunction(...Args) {
      const Later = () => {
        clearTimeout(Timeout);
        Func(...Args);
      };
      clearTimeout(Timeout);
      Timeout = setTimeout(Later, Wait);
    };
  }

  function CreateSearchButtons() {
    const SearchForm = document.querySelector(SearchFormSelector);
    const SearchInput = SearchForm?.querySelector(SearchInputSelector);

    if (
      !SearchForm ||
      !SearchInput ||
      document.querySelector(`.${SearchBtnGroupClass}`)
    ) {
      return;
    }

    const BtnGroup = document.createElement("div");
    BtnGroup.className = SearchBtnGroupClass;

    EngineList.forEach((Engine) => {
      const Button = document.createElement("button");
      Button.className = SearchBtnClass;
      Button.textContent = `使用 ${Engine.Name} 搜索`;
      Button.type = "button";

      Button.addEventListener("click", (Event) => {
        Event.preventDefault();
        const Query = SearchInput.value.trim();
        if (Query) {
          const SearchUrl = `${Engine.Url}${encodeURIComponent(Query)}`;
          window.open(SearchUrl, "_blank", "noopener,noreferrer");
        }
      });
      BtnGroup.appendChild(Button);
    });

    SearchForm.parentNode.insertBefore(BtnGroup, SearchForm.nextSibling);
  }

  const DebouncedCreateSearchButtons = Debounce(
    CreateSearchButtons,
    DebounceDelay
  );

  function CheckAndMaybeCreateButtons() {
    const SearchFormExists = document.querySelector(SearchFormSelector);
    const ButtonsExist = document.querySelector(`.${SearchBtnGroupClass}`);

    if (SearchFormExists && !ButtonsExist) {
      DebouncedCreateSearchButtons();
    }
  }

  const Observer = new MutationObserver(CheckAndMaybeCreateButtons);

  Observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", CheckAndMaybeCreateButtons);
  } else {
    CheckAndMaybeCreateButtons();
  }
})();

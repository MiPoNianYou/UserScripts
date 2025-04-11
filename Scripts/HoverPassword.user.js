// ==UserScript==
// @name         悬浮显示密码
// @description  鼠标悬浮在密码输入框上时 临时将密码显示为明文 鼠标移出后恢复为隐藏状态
// @version      1.0.0
// @icon         https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/HoverPasswordIcon.svg
// @author       念柚
// @namespace    https://github.com/MiPoNianYou/UserScripts
// @license      GPL-3.0
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function HandlePasswordInput(input) {
    input.addEventListener("mouseover", function () {
      this.type = "text";
    });
    input.addEventListener("mouseout", function () {
      this.type = "password";
    });
  }

  document
    .querySelectorAll('input[type="password"]')
    .forEach(HandlePasswordInput);

  const Observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(function (node) {
          if (
            node.nodeType === 1 &&
            node.tagName === "INPUT" &&
            node.type === "password"
          ) {
            HandlePasswordInput(node);
          } else if (node.nodeType === 1) {
            node
              .querySelectorAll('input[type="password"]')
              .forEach(HandlePasswordInput);
          }
        });
      }
    });
  });

  Observer.observe(document.body, { childList: true, subtree: true });
})();

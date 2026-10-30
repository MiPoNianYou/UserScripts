// ==UserScript==
// @name         GPT ThinkOn
// @description  打开 ChatGPT 后自动开启思考模式
// @version      1.0.0
// @icon         https://raw.githubusercontent.com/MiPoNianYou/UserScripts/main/assets/icon/gpt-thinkon-icon.svg
// @homepageURL  https://github.com/MiPoNianYou/UserScripts/tree/main/GPT-ThinkOn
// @supportURL   https://github.com/MiPoNianYou/UserScripts/issues
// @author       MiPoNianYou
// @namespace    https://github.com/MiPoNianYou
// @license      MIT
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/MiPoNianYou/UserScripts/main/GPT-ThinkOn/gpt-thinkon.user.js
// @updateURL    https://raw.githubusercontent.com/MiPoNianYou/UserScripts/main/GPT-ThinkOn/gpt-thinkon.user.js
// ==/UserScript==

(() => {
  "use strict";

  if (window.top !== window.self) return;

  const names = new Set([
    "\u601d\u8003",
    "\u601d\u8003\u4e2d",
    "think",
    "thinking",
  ]);
  let finished = false;
  let frame = 0;
  let previous = null;

  function isThinkingButton(button) {
    const name = (button.getAttribute("aria-label") || button.textContent)
      .trim()
      .toLowerCase();
    if (!names.has(name)) return false;
    const composerInput =
      '#prompt-textarea, textarea, [contenteditable="true"][role="textbox"]';
    for (
      let parent = button.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      if (
        (parent.tagName === "FORM" ||
          [...parent.classList].some((name) =>
            name.startsWith("ComposerLayout"),
          )) &&
        parent.querySelector(composerInput)
      )
        return true;
    }
    return false;
  }

  function findCandidate() {
    const buttons = [
      ...document.querySelectorAll("button[aria-pressed]"),
    ].filter(
      (button) =>
        isThinkingButton(button) &&
        button.getClientRects().length > 0 &&
        getComputedStyle(button).visibility === "visible" &&
        !button.closest("[inert]"),
    );
    if (buttons.length !== 1) return null;
    const button = buttons[0];
    const state = button.getAttribute("aria-pressed");
    if (
      button.matches(":disabled") ||
      button.getAttribute("aria-disabled") === "true"
    )
      return null;
    return state === "true" || state === "false" ? { button, state } : null;
  }

  function finish() {
    finished = true;
    observer.disconnect();
    cancelAnimationFrame(frame);
    for (const type of ["pointerdown", "click", "keydown"]) {
      document.removeEventListener(type, onUserAction, true);
    }
  }

  function onUserAction(event) {
    if (
      !event.isTrusted ||
      (event.type === "keydown" && !["Enter", " "].includes(event.key))
    )
      return;
    const button =
      event.target instanceof Element ? event.target.closest("button") : null;
    if (button && isThinkingButton(button)) finish();
  }

  function check() {
    frame = 0;
    if (finished) return;
    const candidate = findCandidate();
    if (!candidate) {
      previous = null;
      return;
    }
    if (
      previous?.button !== candidate.button ||
      previous.state !== candidate.state
    ) {
      previous = candidate;
      schedule();
      return;
    }
    // Consume the opportunity before clicking, even if the page ignores the click.
    finish();
    if (candidate.state === "false") candidate.button.click();
  }

  function schedule() {
    if (!finished && !frame) frame = requestAnimationFrame(check);
  }

  const observer = new MutationObserver(schedule);
  for (const type of ["pointerdown", "click", "keydown"]) {
    document.addEventListener(type, onUserAction, true);
  }
  observer.observe(document, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [
      "aria-pressed",
      "aria-label",
      "aria-disabled",
      "disabled",
      "class",
      "style",
      "hidden",
      "inert",
      "id",
    ],
  });
  schedule();
})();

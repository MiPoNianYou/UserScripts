<!-- # 请前往[**Github**](https://github.com/MiPoNianYou/UserScripts/blob/main/UpdateLogs/UniversalWebLiberatorUpdateLog.md)观看 -->

<details>
<summary>🌐 Simplified Chinese / 简体中文</summary>

- ✨ **Shadow DOM 支持** - 实现递归处理，以清除开放`Shadow DOM(影子 DOM)`树内部元素的内联事件处理器，显著提高对使用`Web Components(网页组件技术)`的现代网站的兼容性。

- 🛡️ **增强限制解除** - 扩展了需要阻止传播的事件列表(如`dragstart(开始拖拽)`, `drag(拖拽中)`, `mousedown(鼠标按下)`)和需要清除的内联事件属性列表(如`onmousedown(鼠标按下事件)`, `onselect(文本选择事件)`)，以应对更多限制网页交互的技术。

- ⚙️ **初始化优化** - 将处理页面初始加载元素的时机从`requestIdleCallback(浏览器空闲回调)`调整为`DOMContentLoaded(DOM 加载完成)`事件触发后，确保更及时和可靠地移除限制。

- 🎨 **CSS 改进** - 在强制样式中添加了`-webkit-`, `-moz-`, `-ms-`前缀以提高`user-select(文本选择)`的兼容性，并加入了`cursor: auto !important(自动光标样式)`来重置可能被修改的鼠标光标。为`adoptedStyleSheets(可共享样式表)`添加了使用`<style>(样式)`标签的备选注入方式。

- 🏗️ **代码结构与重构** - 将事件处理器清除逻辑重构为递归函数(`clearHandlersRecursive`)，以统一处理`Light DOM(常规 DOM)`和`Shadow DOM(影子 DOM)`。

</details>

---

<details>
<summary>🌐 Traditional Chinese / 繁體中文</summary>

- ✨ **Shadow DOM 支援** - 實作遞迴處理，以清除開放`Shadow DOM(影子 DOM)`樹內部元素的內聯事件處理器，顯著提高對使用`Web Components(網頁元件技術)`的現代網站的相容性。

- 🛡️ **增強限制解除** - 擴展了需要阻止傳播的事件清單(如`dragstart(開始拖曳)`, `drag(拖曳中)`, `mousedown(滑鼠按下)`)和需要清除的內聯事件屬性清單(如`onmousedown(滑鼠按下事件)`, `onselect(文字選取事件)`)，以應對更多限制網頁互動的技術。

- ⚙️ **初始化優化** - 將處理頁面初始載入元素的時機從`requestIdleCallback(瀏覽器空閒回呼)`調整為`DOMContentLoaded(DOM 載入完成)`事件觸發後，確保更及時和可靠地移除限制。

- 🎨 **CSS 改進** - 在強制樣式中新增了`-webkit-`, `-moz-`, `-ms-`前綴以提高`user-select(文字選取)`的相容性，並加入了`cursor: auto !important(自動游標樣式)`來重設可能被修改的滑鼠游標。為`adoptedStyleSheets(可共用樣式表)`新增了使用`<style>(樣式)`標籤的備選注入方式。

- 🏗️ **程式碼結構與重構** - 將事件處理器清除邏輯重構為遞迴函數(`clearHandlersRecursive`)，以統一處理`Light DOM(常規 DOM)`和`Shadow DOM(影子 DOM)`。

</details>

---

<details>
<summary>🌐 English / 英文</summary>

- ✨ **Shadow DOM Support** - Implemented recursive processing to clear inline event handlers within open Shadow DOM trees, significantly improving compatibility with modern websites using Web Components.

- 🛡️ **Enhanced Restriction Bypass** - Expanded the list of events whose propagation needs to be stopped (e.g., `dragstart`, `drag`, `mousedown`) and the list of inline event attributes to clear (e.g., `onmousedown`, `onselect`) to counter more techniques restricting web interaction.

- ⚙️ **Initialization Optimization** - Adjusted the timing for processing initially loaded page elements from `requestIdleCallback` to after the `DOMContentLoaded` event fires, ensuring more timely and reliable removal of restrictions.

- 🎨 **CSS Improvements** - Added browser prefixes (`-webkit-`, `-moz-`, `-ms-`) to `user-select` in the injected styles for better compatibility, and included `cursor: auto !important` to reset potentially altered mouse cursors. Added a fallback injection method using a `<style>` tag for `adoptedStyleSheets`.

- 🏗️ **Code Structure & Refactoring** - Refactored the event handler clearing logic into a recursive function (`clearHandlersRecursive`) to uniformly handle both Light DOM and Shadow DOM.

</details>

---

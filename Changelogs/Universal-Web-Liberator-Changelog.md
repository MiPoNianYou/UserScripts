<!--
# 建议在 [GitHub](https://github.com/MiPoNianYou/UserScripts/blob/main/Changelogs/Universal-Web-Liberator-Changelog.md) 查看完整日志 以获得最佳呈现效果 <br/> 建議在 [GitHub](https://github.com/MiPoNianYou/UserScripts/blob/main/Changelogs/Universal-Web-Liberator-Changelog.md) 查看完整日誌 以獲得最佳呈現效果 <br/> For The Most Accurate & Clear Presentation We Recommend Viewing The Full Changelog On [GitHub](https://github.com/MiPoNianYou/UserScripts/blob/main/Changelogs/Universal-Web-Liberator-Changelog.md)
-->

# Universal Web Liberator V1.5.0 Changelog

---

<details>
<summary>🌐 Simplified Chinese / 简体中文</summary>

## ✨ 视觉交互焕新

- **🔔 通知体验精进**
    - **全新视觉呈现** - 状态切换的通知窗口从原先的右上角卡片设计 优雅变身为屏幕**底部中央的灵动气泡** 新的设计包含一个灵动的呼吸圆点及清晰的模式状态文本 带来更沉浸 干扰更少的视觉反馈
    - **底部动效滑入** - 通知窗口采用全新的动画效果 从屏幕底部**平滑向上滑入** 并在短暂显示后优雅滑出 操作感知更加自然流畅
    - **呼吸光晕点缀** - 为状态指示的呼吸圆点增添了**柔和的光晕效果** 当功能启用时 绿色的呼吸点将散发出淡淡的辉光 禁用时 红色的呼吸点亦有相应光晕 视觉反馈更显精致与生动

## 🛠️ 效能逻辑优化

- **⚙️ 核心逻辑重塑**
    - **递归遍历精炼** - 重构了对页面元素及其 Shadow DOM 中內联事件处理器的递归清理逻辑 新的遍历算法采用更高效的**递归下降方式** 显著减少了对不必要的节点重复检查 提升在处理复杂页面结构时的**执行效率与响应速度**
    - **节点响应处理** - 优化了对页面动态添加内容时的响应处理逻辑 确保了对新增元素的限制接触能够**及时且准确地**应用限制接触策略

- **🔗 监听机制简化**
    - **监听绑定优化** - 优化了右下角灵动指示器的事件监听器附加机制 通过更直接的元素获取与状态检查 减少了对复杂 DOM 变动观察的依赖 使得交互组件的初始化更为稳健 响应更可靠

</details>

---

<details>
<summary>🌐 Traditional Chinese / 繁體中文</summary>

## ✨ 視覺互動煥新

- **🔔 通知體驗精進**
    - **全新視覺呈現** - 狀態切換的通知視窗從原先的右上角卡片設計 優雅變身為螢幕**底部中央的靈動氣泡** 新的設計包含一個靈動的呼吸圓點及清晰的模式狀態文字 帶來更沉浸 干擾更少的視覺回饋
    - **底層動效滑入** - 通知視窗採用全新的動畫效果 從螢幕底部**平滑向上滑入** 並在短暫顯示後優雅滑出 操作感知更加自然流暢
    - **呼吸光暈點綴** - 為狀態指示的呼吸圓點增添了**柔和的光暈效果** 當功能啟用時 綠色的呼吸點將散發出淡淡的輝光 停用時 紅色的呼吸點亦有相應光暈 視覺回饋更顯精緻與生動

## 🛠️ 效能邏輯優化

- **⚙️ 核心邏輯重塑**
    - **遞迴遍歷精煉** - 重構了對頁面元素及其 Shadow DOM 中內嵌事件處理器的遞迴清理邏輯 新的遍歷演算法採用更高效的**遞迴下降方式** 顯著減少了對不必要的節點重複檢查 提升在處理複雜頁面結構时的**執行效率与回應速度**
    - **節點回應處理** - 優化了對頁面動態新增內容時的回應處理邏輯 確保了對新增元素的限制接觸能夠**即時且準確地**套用限制接觸策略

- **🔗 監聽機制簡化**
    - **監聽綁定優化** - 優化了右下角靈動指示器的事件監聽器附加機制 透過更直接的元素擷取與狀態檢查 減少了對複雜 DOM 變動觀察的依賴 使得互動元件的初始化更為穩健 回應更可靠

</details>

---

<details>
<summary>🌐 English / 英文</summary>

## ✨ Visuals & Interactions Revamp

- **🔔 Refined Notification Experience**
    - **New Visual Design** - The notification window for state changes has been elegantly redesigned from the previous top-right card to a **dynamic bubble at the bottom center** of the screen. This new design features an animated **breathing dot** and clear mode status text, delivering a more immersive and less intrusive visual feedback.
    - **Smooth Slide-In Animation** - The notification window now employs a new animation, **smoothly sliding up from the bottom** of the screen and gracefully sliding out after a brief display, making the interaction feel more natural and fluid.
    - **Subtle Glow Accent** - A **soft glow effect** has been added to the status-indicating breathing dot. When the feature is enabled, the green breathing dot emits a subtle glow; similarly, when disabled, the red breathing dot features a corresponding halo, rendering the visual feedback more refined and vivid.

## 🛠️ Performance & Logic Optimization

- **⚙️ Core Logic Refactoring**
    - **Refined Recursive Traversal** - Refactored the recursive cleanup logic for inline event handlers in page elements and their Shadow DOM. The new traversal algorithm employs a more efficient **recursive descent approach**, significantly reducing redundant checks on unnecessary nodes and enhancing **execution efficiency and responsiveness** when handling complex page structures.
    - **Dynamic Content Response Handling** - Optimized response handling for dynamically added page content, ensuring that interaction restrictions for new elements are applied **promptly and accurately** according to the defined strategy.

- **🔗 Listener Mechanism Simplification**
    - **Listener Binding Optimization** - Optimized the event listener attachment mechanism for the dynamic indicator in the bottom-right corner. By employing more direct element retrieval and **state checks**, reliance on complex DOM mutation observation is reduced, **rendering** the interactive **component's** initialization more robust and its responses more reliable.

</details>

---

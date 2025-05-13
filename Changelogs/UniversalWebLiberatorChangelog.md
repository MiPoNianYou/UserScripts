<!--
# 建议在 [GitHub](https://github.com/MiPoNianYou/UserScripts/blob/main/Changelogs/UniversalWebLiberatorChangelog.md) 查看完整日志 以获得最佳呈现效果
# 建議在 [GitHub](https://github.com/MiPoNianYou/UserScripts/blob/main/Changelogs/UniversalWebLiberatorChangelog.md) 查看完整日誌 以獲得最佳呈現效果
# For The Most Accurate & Clear Presentation We Recommend Viewing The Full Changelog On [GitHub](https://github.com/MiPoNianYou/UserScripts/blob/main/Changelogs/UniversalWebLiberatorChangelog.md)
-->

# V1.4.3

<details>
<summary>🌐 Simplified Chinese / 简体中文</summary>

- **✨ 视觉体验升级**
    - **🎨 状态可见提升** - 右下角灵动指示器在**未启用**状态下 现采用精心择取的中性色调 并优化了其不透明度 确保在深色与浅色模式下均能**清晰辨识** 不再隐匿与背景之中 提升了对状态的感知度

- **🛠️ 核心逻辑增强**
    - **🚀 启动流程重塑** - 优化了功能激活状态下的初始化逻辑 核心的**限制解除操作**现在会更智能地**延迟至页面 DOM 结构稳定后**执行 解决刷新页面后 功能虽为启用状态但部分内容限制偶现未能及时解除的问题
    - **⚡️ 状态即时响应** - 增强了状态在页面加载和用户操作间的同步性 当用户切换功能状态时 对当前页面的限制解除与监控机制会**立即全面应用或撤销** 确保操作的即时响应与状态的准确反馈
    - **🛡️ 初始时序稳固** - 尽早应用全局 CSS 覆盖和高优先级事件拦截 以最大限度防止页面早期限制 同时将对完整 DOM 树的深度处理置于更稳妥的加载节点 力求在**效能与兼容性间取得最佳平衡**

- **⚙️ 内部结构精进**
    - **🧹 变动处理优化** - 对回调逻辑中处理新增 DOM 节点的部分进行了微调 移除了潜在的冗余函数调用 提升了代码的**执行效率**

</details>

---

<details>
<summary>🌐 Traditional Chinese / 繁體中文</summary>

- **✨ 視覺體驗升級**
    - **🎨 狀態可見提升** - 右下角靈動指示器在**未啟用**狀態下 現採用精心挑選的中性色調 並優化了其不透明度 確保在深色與淺色模式下均能**清晰辨識** 不再隱匿於背景之中 提升了對狀態的感知度

- **🛠️ 核心邏輯強化**
    - **🚀 啟動流程重塑** - 優化了功能啟用狀態下的初始化邏輯 核心的**限制解除操作** 現在會更智慧地**延遲至頁面 DOM 結構穩定後**執行 解決重新整理頁面後 功能雖已啟用但部分內容限制偶爾未能及時解除的問題
    - **⚡️ 狀態即時回應** - 增強了狀態在頁面載入和使用者操作間的同步性 當使用者切換功能狀態時 對當前頁面的限制解除與監控機制會**立即全面套用或撤銷** 確保操作的即時回應與狀態的準確回饋
    - **🛡️ 初始時序穩固** - 儘早套用全域 CSS 覆蓋和高優先權事件攔截 以最大程度防止頁面早期限制 同時將對完整 DOM 樹的深度處理置於更穩妥的載入節點 力求在**效能與相容性間取得最佳平衡**

- **⚙️ 內部結構精進**
    - **🧹 變動處理優化** - 對回呼邏輯中處理新增 DOM 節點的部分進行了微調 移除了潛在的多餘函式胡椒 提升了程式碼的**執行效率**

</details>

---

<details>
<summary>🌐 English / 英文</summary>

- **✨ Visual Experience Enhancement**
    - **🎨 Enhanced State Visibility** - The dynamic indicator in the bottom-right corner, when **inactive**, now features a meticulously selected neutral hue with optimized opacity. This ensures it is **clearly discernible** in both dark and light modes, **preventing** it from blending into the background, thereby enhancing state awareness.

- **🛠️ Core Logic Enhancements**
    - **🚀 Revamped Startup Process** - Optimized **the** initialization logic for when the feature is active. The core **restriction-lifting operation** is now intelligently **deferred until the page's DOM structure stabilizes**, resolving an issue where, **upon page refresh**, content restrictions sometimes **failed to lift promptly** even when the feature was active.
    - **⚡️ Instantaneous State Responsiveness** - **Enhanced** state synchronization **during page loading and user interactions**. When the user toggles the feature's state, the **restriction-lifting and monitoring mechanisms** for the current page are now **immediately and comprehensively applied or revoked**. This ensures **immediate operational response and accurate state feedback**.
    - **🛡️ Robust Initial Sequencing** - Global CSS overrides and high-priority event interception are now applied **as early as possible** to **minimize restrictions during early page rendering**. Simultaneously, deep processing of the full DOM tree has been **shifted to a more robust loading point**, striving for an **optimal balance between performance and compatibility**.

- **⚙️ Internal Structure Refinement**
    - **🧹 Optimized Change Handling** - **Fine-tuned** the part of the callback logic that handles newly added DOM nodes, **eliminating** potential redundant function calls to **improve the code's execution efficiency**.

</details>

---

<!--
# 建议在 [GitHub](https://github.com/MiPoNianYou/UserScripts/blob/main/Changelogs/DuckDuckGo-Enhancer-Changelog.md) 查看完整日志 以获得最佳呈现效果 <br/> 建議在 [GitHub](https://github.com/MiPoNianYou/UserScripts/blob/main/Changelogs/DuckDuckGo-Enhancer-Changelog.md) 查看完整日誌 以獲得最佳呈現效果 <br/> For The Most Accurate & Clear Presentation We Recommend Viewing The Full Changelog On [GitHub](https://github.com/MiPoNianYou/UserScripts/blob/main/Changelogs/DuckDuckGo-Enhancer-Changelog.md)
-->

# DuckDuckGo Enhancer V1.4.0 Changelog

---

<details>
<summary>🌐 Simplified Chinese / 简体中文</summary>

## 🚀 功能体验升级

- **✨ 交互体验增强**
    - **🎯 站内搜索直达** - 新增「**仅搜此站内容**」按钮 点击即可将当前搜索词与该结果的域名组合 并立即执行站内搜索 快速缩小范围至特定网站
    - **🚫 便捷域名排除** - 新增「**屏蔽此域结果**」按钮 点击后会自动将该结果的域名排除 并立即重新搜索 有效过滤干扰信息

## 🛠️ 效能逻辑优化

- **⚙️ 逻辑执行优化**
    - **🔗 复制反馈独立** - 重构了「拷贝此页网址」按钮的反馈状态管理机制 原先共享的反馈定时器被优化为**每个按钮独立的定时器** 消除了之前版本中多个按钮反馈可能互相干扰的问题 确保了操作反馈的准确性
    - **🔩 正则匹配修正** - 完善了「屏蔽站点」功能中用于构建排除性搜索词的正则表达式逻辑 避免了因双重转义导致的**匹配失效问题** 确保了屏蔽规则能被正确和稳定地使用
    - **🛡️ 空值处理加固** - 在涉及 DOM 元素的属性访问前 增加了更周全的空值检测 有效**避免了潜在的运行时错误** 提升了脚本在不同页面加载状态下的稳定性

## ✨ 界面交互升级

- **🎨 界面元素优化**
    - **🌟 图标焕新呈现** - 为搜索结果项的操作按钮引入了**全新的图标** 视觉风格更加精致统一
    - **🧹 移除冗余按钮** - 智能移除 DuckDuckGo 页面上的「意见反馈 / 顶部隐私保护推广 / 搜索结果的三点菜单」按钮 使界面更加清爽 带来**更纯净/更聚焦的搜索界面**

</details>

---

<details>
<summary>🌐 Traditional Chinese / 繁體中文</summary>

## 🚀 功能體驗升級

- **✨ 互動體驗增強**
    - **🎯 站內搜尋直達** - 新增「**僅搜此站內容**」按鈕 點擊即可將當前搜尋詞與該結果的網域組合 並立即執行站內搜尋 快速縮小範圍至特定網站
    - **🚫 便捷網域排除** - 新增「**封鎖此域結果**」按鈕 點擊後會自動將該結果的網域排除 並立即重新搜尋 有效過濾干擾資訊

## 🛠️ 效能邏輯優化

- **⚙️ 邏輯執行優化**
    - **🔗 複製回饋獨立** - 重構了「拷貝此頁網址」按鈕的回饋狀態管理機制 原先共用的回饋計時器已優化為**每個按鈕獨立的計時器** 消除了先前版本中多個按鈕回饋可能互相干擾的問題 確保了操作回饋的準確性
    - **🔩 正規比對修正** - 完善了「封鎖網站」功能中用於建構排除性搜尋詞的正規表示式邏輯 避免了因雙重跳脫導致的**匹配失效問題** 確保了封鎖規則能被正確且穩定地使用
    - **🛡️ 空值處理強化** - 在涉及 DOM 元素的屬性存取前 增加了更周全的空值偵測 有效**避免了潛在的執行階段錯誤** 提升了腳本在不同頁面載入狀態下的穩定性

## ✨ 介面互動升級

- **🎨 介面元素優化**
    - **🌟 圖示煥新呈現** - 為搜尋結果項的操作按鈕引入了**全新的圖示** 視覺風格更加精緻統一
    - **🧹 移除多餘按鈕** - 智慧移除 DuckDuckGo 頁面上的「意見回饋 / 頂部隱私保護推廣 / 搜尋結果的三點選單」按鈕 使介面更加清爽 帶來**更純淨/更聚焦的搜尋介面**

</details>

---

<details>
<summary>🌐 English / 英文</summary>

## 🚀 Feature & Experience Enhancements

- **✨ Enhanced Interaction Experience**
    - **🎯 Direct Site Search** - Introduced a '**Search only this site**' button. Clicking it combines the current search term with the result's domain to instantly perform an **on-site search**, rapidly **refining** results to the specific website.
    - **🚫 Convenient Domain Exclusion** - Introduced an '**Exclude this domain**' button. Clicking it automatically excludes the result's domain and **instantly re-searches**, effectively filtering out **irrelevant** information.

## 🛠️ Performance & Logic Optimizations

- **⚙️ Optimized Logic Execution**
    - **🔗 Independent Copy Feedback Timers** - Refactored the feedback state management for the 'Copy this page URL' button. The previously shared feedback timer has been replaced with **an independent timer for each button**. This eliminates potential interference between multiple button feedbacks seen in earlier versions, ensuring precise operational feedback.
    - **🔩 Corrected Regex Matching** - Refined the regular expression logic for constructing exclusion search terms in the 'Block Site' feature. This resolves **match failures** previously caused by double-escaping issues, ensuring blocking rules are applied correctly and reliably.
    - **🛡️ Robust Null Value Handling** - Implemented more comprehensive null checks before accessing DOM element properties. This proactively prevents **potential runtime errors**, enhancing script stability across various page loading states.

## ✨ UI/UX Upgrades

- **🎨 Optimized UI Elements**
    - **🌟 Refreshed Iconography** - Introduced **all-new icons** for action buttons on search result items, achieving a more polished and cohesive visual style.
    - **🧹 Redundant Button Removal** - Intelligently removed the 'Feedback', 'Top Privacy Protection Promotion', and 'Search Result Three-Dot Menu' buttons from DuckDuckGo pages, decluttering the interface and providing a **more streamlined and focused search experience**.

</details>

---

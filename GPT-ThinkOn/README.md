<p align="center">
  <img src="https://raw.githubusercontent.com/MiPoNianYou/UserScripts/main/assets/readme/gpt-thinkon-hero.svg" width="100%" alt="ChatGPT 输入框中的思考模式已开启">
</p>

## 功能

- 自动识别输入框旁的思考开关。
- 开关关闭时点击一次；已经开启时保持现状。
- 如果用户先手动操作思考开关，脚本立即停止。
- 同一页面不反复切换思考模式。

## 工作方式

脚本在 `document-start` 开始监听页面。脚本只选择输入框所在表单内、可见且唯一的思考开关。按钮状态连续 2 帧保持稳定后，脚本在关闭时点击一次，然后断开监听并停止。

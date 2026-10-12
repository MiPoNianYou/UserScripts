<p align="center">
  <img src="https://raw.githubusercontent.com/MiPoNianYou/UserScripts/main/Quark-Pilot/assets/readme/hero.svg" width="100%" alt="Quark Pilot Hero">
</p>

## 功能

- **按更新时间排序**：夸克读取分享页文件清单时（`sharepage/detail`），默认先按文件类型、再按文件名从小到大排列（`file_type:asc,file_name:asc`）。脚本会继续按文件类型从小到大排列，同类型中最近更新的文件排在前面（`file_type:asc,updated_at:desc`）。
- **取消默认全选**：列表中有文件，且列表顶部的“全选”框和每个文件都已勾选后，脚本等到网页内容不再变化，再点击“全选”框取消选择。

## 致谢

- [夸克网盘-分享按时间倒序排序](https://greasyfork.org/scripts/530361)

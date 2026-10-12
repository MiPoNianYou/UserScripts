# Quark Share Pages

This project describes the behavior of Quark shared-file pages and the file-tree state exposed to visitors.

## Language

**Share Page**:
A Quark `/s/` page that exposes a shared file tree.
_Avoid_: Download page, share URL

**Share Directory**:
The root or subfolder view currently displayed within a Share Page.
_Avoid_: Folder route, API directory

**Selection State**:
The set of files and folders currently selected in a Share Directory.
_Avoid_: Checkbox state, selected rows

**Default Selection**:
The Selection State applied by Quark when a Share Directory finishes loading.
_Avoid_: Initial checkboxes, auto selection

**Share Sort Order**:
The ordering rule used to arrange entries in a Share Directory.
_Avoid_: Visual order, list order

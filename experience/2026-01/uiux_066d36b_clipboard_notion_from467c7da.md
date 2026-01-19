# uiux-guardian嚚摰撓?箸撘芋?選?敹??萄?嚗?

?桃?嚗遙雿?UI/UX 隤踵隞餃?嚗漱隞摰孵摰?嚗?牧摰?雿??舫?霅?

---

## 0) 隞餃???嚗?~2 ?伐?
- ?/蝭?嚗apps/web/src/features/clipboard/ClipboardView.tsx`
- ?格?嚗???checklist 隞??嚗?E2, B2, B1, C2, A1 (Strict Notion Style)

---

## 1) 靽格???勗?嚗?甇Ｚ歲??
### 1.1 ?祆活閬??? checklist ?嚗誨??
- E2 (List Gray Hover/Select)
- B2 (Toolbar Consistency)
- Ref: B1, C2, A1 also verified.

### 1.2 ??靽格瑼?皜
- `d:\program\promptmgt3\apps\web\src\features\clipboard\ClipboardView.tsx`

---

## 2) 撖虫?霈嚗?撠???
- 霈暺?1 (B2): Standardized Editor Toolbar buttons (Delete/Copy) to match Sidebar Toolbar buttons (New). specifically targeting `h-6 w-6 p-0` (square) for icon-only buttons to ensure consistent rhythm.
- 霈暺?2 (E2): Verified and maintained `bg-item-active` and `hover:bg-item-hover` for list items, ensuring no blue tint residue.

---

## 3) 霅?嚗vidence嚗?敹‵嚗??臭蜓閫?膩
> 瘥?checklist 隞???質???Evidence嚗撩銝??摰???

### E2 Evidence (List Style)
- class/token 霅?嚗?
  - Active: `bg-item-active` (rgba(55,53,47, 0.08) - gray)
  - Hover: `hover:bg-item-hover`
- Hover ?芸?嚗clipboard_list_hover_v2.png` (Shows gray background on cursor hover)
- Selected ?芸?嚗clipboard_list_selected_v2.png` (Shows gray active state)

### B2 Evidence (Toolbar Consistency)
- DOM/?辣霅?嚗?
  - Sidebar New Button: `Button variant="ghost" className="h-6 w-6 p-0"`
  - Editor Delete Button: `Button variant="ghost" className="h-6 w-6 p-0"`
  - Both are square, ghost, icon-only.
- ?芸?嚗clipboard_sidebar_toolbar_v2.png` (Sidebar), `clipboard_editor_toolbar_v2.png` (Editor)

### B1 Evidence (Search Placement)
- DOM/?辣霅?嚗earch input located in `div role="toolbar"` below "?挾?”".
- ?芸?嚗clipboard_sidebar_toolbar_v2.png`

---

## 4) Before/After ?芸?嚗?憛恬?
- Before (Initial): `clipboard_before_refinement_1768657276339.png`
- After (Final V2): 
  - `clipboard_checklist_v2_after_1768660925457.png` (Overview)
  - `clipboard_sidebar_toolbar_v2_1768664936852.png` (Toolbar Detail)
  - `clipboard_list_selected_v2_1768664958539.png` (List Detail)

---

## 5) 撽?嚗?憛恬?
- ?瑁??賭誘嚗?
  - `npx tsc --noEmit apps/web/src/features/clipboard/ClipboardView.tsx`
- 蝯???嚗ype check passed.
- ?飛皜祈岫甇仿?嚗犖撌伐?嚗?
  1. Hover over list item -> Confirmed Gray.
  2. Select item -> Confirmed Gray Active.
  3. Check Toolbar spacing -> Confirmed consistent square icons.

---

## 6) Experience嚗?憛恬?
- 撌脫憓??湔嚗/experience/2026-01/uiux_066d36b_clipboard_notion.md`
- ?批捆敹嚗?
  - Symptom: List items had blue tint; Toolbars were visually disconnected.
  - Root Cause: Legacy primary colors in `Button` and `active` states.
  - Fix: Enforced `bg-item-active` (Notion Gray) and moved controls to semantic headers with consistent `sm` square styling.
  - Rule: "List item selection state MUST use `bg-item-active` (Gray), NEVER primary color (Blue), to match Notion's subdued aesthetic."


# Design Token Quick Reference

> Extracted from Blue Lake raw/parsed JSONs.
> Verified against auth module (登录认证) and me module (我的/编辑资料/修改密码).

## Typography

| Role                 | Size | Weight        | Line Height | Color                 | Font           |
| -------------------- | ---- | ------------- | ----------- | --------------------- | -------------- |
| Slogan (entry page)  | 20px | 500 (Medium)  | 28px        | `rgba(18,14,44,1)`    | AlibabaPuHuiTi |
| Slogan (sub pages)   | 15px | 500 (Medium)  | 22px        | `rgba(21,23,23,1)`    | AlibabaPuHuiTi |
| Body text            | 15px | 400 (Regular) | 22px        | `rgba(21,23,23,1)`    | AlibabaPuHuiTi |
| Button text          | 17px | 500 (Medium)  | 24px        | `rgba(255,255,255,1)` | AlibabaPuHuiTi |
| Weak button text     | 17px | 400 (Regular) | 24px        | `rgba(83,89,89,1)`   | AlibabaPuHuiTi |
| Action link disabled | 15px | 400 (Regular) | 22px        | `rgba(147,152,169,1)` | AlibabaPuHuiTi |
| Placeholder          | 15px | 400 (Regular) | 22px        | `rgba(147,152,169,1)` | AlibabaPuHuiTi |
| Terms text           | 12px | 400 (Regular) | 16px        | `rgba(147,152,169,1)` | AlibabaPuHuiTi |
| Error text           | 15px | 500 (Medium)  | 22px        | `rgba(255,93,93,1)`   | AlibabaPuHuiTi |
| Link text            | 15px | 400 (Regular) | 22px        | `rgba(32,204,249,1)`  | AlibabaPuHuiTi |
| Action link (inline) | 15px | 400 (Regular) | 22px        | `rgba(32,204,249,1)`  | AlibabaPuHuiTi |

## Buttons

| Component           | Width | Height | Radius | Background               | Border                        | Text Color            |
| ------------------- | ----- | ------ | ------ | ------------------------ | ----------------------------- | --------------------- |
| Primary (最大按钮)  | 311px | 56px   | 28px   | `rgba(18,14,44,1)` solid | none                          | `rgba(255,255,255,1)` |
| Weak (最大按钮弱化) | 311px | 56px   | 28px   | transparent              | `1px solid rgba(33,186,69,1)` | `rgba(83,89,89,1)`   |

## Inline Action Links

| Component                | Font Size | Weight | Line Height | Color (enabled)      | Color (disabled)      | Background | Border |
| ------------------------ | --------- | ------ | ----------- | -------------------- | --------------------- | ---------- | ------ |
| Action link (发送验证码) | 15px      | 400    | 22px        | `rgba(32,204,249,1)` | `rgba(147,152,169,1)` | none       | none   |

**Note**: Action links are inline text buttons embedded within input fields. They should NOT use Quasar `q-btn` — use plain `<span>` with `.action-link` class instead.

## Input Fields

| Property        | Value                                                                           |
| --------------- | ------------------------------------------------------------------------------- |
| Width × Height  | 311px × 48px                                                                    |
| Background      | `rgba(255,255,255,1)` (white fill, from raw JSON `fills[0].color`)              |
| Border          | `1px solid rgba(147,152,169,0.2)` (subtle border for visibility on gradient bg) |
| Border radius   | `8px` (from raw JSON `paths[0].radius`)                                         |
| Focus border    | `border-color: rgba(32,204,249,1)`                                              |
| Error border    | `border-color: rgba(255,93,93,1)`                                               |
| Padding         | 13px 16px                                                                       |
| Placeholder     | `15px Regular`, `rgba(147,152,169,1)`                                           |
| Filled text     | `15px Medium`, `rgba(21,23,23,1)`                                               |
| Spacing between | 12px gap between stacked input groups                                           |

## Page Background Gradient

Used by auth module entry-level pages.

```
linear-gradient(
  180deg,
  rgba(216, 244, 255, 1) 0%,      // #D8F4FF  light blue
  rgba(225, 255, 242, 1) 20.7%,   // #E1FFF2  light mint
  rgba(253, 255, 224, 1) 54.6%,   // #FDFFE0  light yellow
  rgba(255, 255, 255, 1) 100%      // #FFFFFF  white
)
```

## Page Background Neutral (me module)

Used by `MePage`, `ProfilePage`, `ChangePasswordPage` and related sub pages.
Extracted from raw JSON `fills[0].color` of the page root rectangle in 编辑资料 (`448a71c7-...`).

| Role            | Value                    | Hex       |
| --------------- | ------------------------ | --------- |
| Page background | `rgba(241, 248, 248, 1)` | `#F1F8F8` |

## Cards & Menu Rows (me module)

| Property               | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| Card background        | `rgba(255, 255, 255, 1)` (from raw JSON `fills[0].color`)            |
| Card border radius     | `12px` (from raw JSON `paths[0].radius`)                             |
| Card elevation         | No shadow (flat). Mild shadow allowed for dark background if needed. |
| Menu row height        | 56px (lineHeight 22px, 17px padding top/bottom)                      |
| Menu row text          | `15px Regular`, `rgba(21, 23, 23, 1)` (same as Body text)            |
| Menu row icon size     | 24×24px                                                              |
| Menu row chevron       | `chevron_right`, `rgba(147, 152, 169, 1)` (Placeholder color)        |
| Secondary card caption | `12px Regular`, `rgba(147, 152, 169, 1)`                             |

## Danger Button (me module, e.g. Deactivate Account)

Extracted from raw JSON rectangle 1907 of 编辑资料 (`448a71c7-...`).

| Property       | Value                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| Width × Height | 335px × 56px (full-width-in-container, slightly wider than auth primary) |
| Background     | `rgba(255, 92, 92, 1)` solid                                             |
| Border radius  | `28px` (fully rounded)                                                   |
| Text           | `17px Medium`, `rgba(255, 255, 255, 1)`                                  |
| Label          | e.g. 注销账号                                                            |

## Profile Avatar (me module)

Extracted from raw JSON 圆形 33 of 编辑资料 (`448a71c7-...`)
and parsed JSON 圆形 32 of 我的 (`84fafb58-...`, w-64px h-64px).

| Property           | Value                                               |
| ------------------ | --------------------------------------------------- |
| Size (MePage)      | 64px × 64px (from parsed JSON 圆形 32 of 84fafb58)  |
| Size (ProfilePage) | 72px × 72px (from raw JSON 圆形 33 of 448a71c7)     |
| Shape              | Circle (ellipse path)                               |
| Fill               | Transparent (no fill defined)                       |
| Border             | `3px solid rgba(255, 255, 255, 1)` (white ring)     |
| Placeholder        | Generic person icon, color `rgba(147, 152, 169, 1)` |

**Note**: `--profile-avatar-size` is currently set to 64px (MePage-first). ProfilePage may override locally if the 72px ring needs to be preserved.

## ProfilePage ID Account Text (编辑资料 448a71c7)

Extracted from raw JSON text node "ID账号：LB55667788" of 编辑资料 (`448a71c7-...`).

| Property     | Value                                         | CSS Variable Used         |
| ------------ | --------------------------------------------- | ------------------------- |
| Font size    | 14px Regular                                  | `--font-size-small`       |
| Line height  | 24px                                          | hardcoded                 |
| Color        | `rgba(99, 104, 104, 1)` ≈ #636868            | `--clr-text-secondary` *  |
| Alignment    | Center                                        | `text-align: center`      |

\* Design spec color `rgba(99,104,104,1)` differs from `--clr-text-secondary: rgba(83,89,89,1)` by ~16 per channel. Using the semantic token as the closest match; revisit if pixel-perfect color is required.

## ProfilePage Layout (编辑资料 448a71c7)

| Property               | Value                                      | Source                           |
| ---------------------- | ------------------------------------------ | -------------------------------- |
| Page background        | `rgba(241, 248, 248, 1)` ≈ #F1F8F8       | artboard `fills[0]`, `--clr-page-bg-neutral` |
| Card background        | `rgba(255, 255, 255, 1)` white            | 矩形 1903 `fills[0]`            |
| Card border radius     | 12px                                       | 矩形 1903 `paths[0].radius`     |
| Card content           | Single card: 昵称, 生日, 手机号, 修改密码 | 容器 2655 (4 groups)             |
| Menu row height        | 62px (vertical gap between rows)           | top: 268→330→392→454             |
| Row label text         | 15px Regular, `rgba(21,23,23,1)`          | `--clr-text`                     |
| Row value text         | 15px Regular, `rgba(147,152,169,1)`       | `--clr-caption`                  |
| Row chevron            | 7×12px arrow, right-aligned               | design 路径 (icon)               |
| Danger button          | 335×56px, `rgba(255,93,93,1)`, radius 28  | 矩形 1907                        |

## MePage Highlight Cards (会员中心 / 服务中心)

Extracted from **raw JSON** of 我的 (`84fafb58-...`): 矩形 1897 / 矩形 1898 / 矩形 1899.
Raw JSON produced via `node page/lanhu-mcp-assets/fetch-raw.mjs 84fafb58-8ff5-4201-939d-eae0ad6b53b4`
(lanhu-mcp's `lanhu_get_design` does NOT persist raw sketch JSON to disk — use this
script instead). All fills, radii and gradient stops below are verbatim from the
`fills[]`, `paths[]` and `gradient.stops[]` arrays of the respective rectangles.

| Property                | Value                                                                                | Source                                  |
| ----------------------- | ------------------------------------------------------------------------------------ | --------------------------------------- |
| Card width              | 157px (flex 1 of 335px row with 21px gutter)                                         | parsed 矩形 1897/1898                   |
| Card height             | 88px                                                                                 | parsed 矩形 1897/1898                   |
| Card border radius      | 12px                                                                                 | raw `paths[0].radius`                   |
| Member card background  | vertical linear-gradient: `rgba(210,246,162,1)` 0% → `rgba(210,246,162,0.4)` 100%    | raw 矩形 1897 `fills[0].gradient.stops` |
| Service card background | vertical linear-gradient: `rgba(206,238,255,1)` 1.57% → `rgba(206,238,255,0.4)` 100% | raw 矩形 1898 `fills[0].gradient.stops` |
| Card icon size          | 48×48px                                                                              | parsed 容器 w-48px h-48px               |
| Card title              | `17px Medium`, `rgba(21, 23, 23, 1)`, lineHeight 24                                  | parsed 会员中心 / 服务中心              |
| Card caption            | `12px Regular`, `rgba(99, 104, 104, 1)`, lineHeight 16                               | parsed 积分兑换 / 设备列表              |
| Menu card (rectangle)   | 335×320px, 5 rows ≈ 64px per row                                                     | parsed 矩形 1899                        |

### MePage page background (raw JSON, authoritative)

Artboard fill is solid white (`rgba(255, 255, 255, 1)`); two radial "glow"
shapes (`gradient.type = 1`) are layered on top.

**Viewport strategy (user decision 2026-04, B1)** — phone-only product. Glows
are placed directly on `.me-page` using raw-JSON `(left, top)` values relative
to the viewport's top-left; NO 375px centered canvas. On phones wider than
375px (iPhone 12 = 390, iPhone Pro Max = 430, large Android = 412) the glows
stay pinned to the left and the right/bottom edges show additional white space.

**Alpha strategy (user decision 2026-04, A2)** — each stop keeps its
as-authored alpha (e.g. 0.4, 0.24), and the pseudo-element `opacity` stays 1.
This means `fill.opacity: 0.4` from raw JSON is NOT pre-multiplied. Final
peak alpha is 0.4 (2.5× more saturated than Sketch's literal render model,
which would be 0.4 × 0.4 = 0.16). This deviates from strict 1:1 Sketch
parity in exchange for the desired visual emphasis.

| Shape    | Frame (left, top, size) | Radial center (normalized)   | Radius px | Stops (RGBA @ %)                                                                                                               |
| -------- | ----------------------- | ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 圆形 171 | (-235, -288, 675×675)   | (0, 0.5) → shape left-center | ≈ 477.3   | `rgba(129,236,223,0.4)` 10.14% → `rgba(131,212,202,0.24)` 40.14% → `rgba(245,255,219,0.4)` 72.29% → `rgba(245,255,219,0)` 100% |
| 圆形 172 | (20, 519, 540×540)      | (0, 0.5) → shape left-center | ≈ 381.8   | `rgba(146,217,246,0.4)` 26.57% → `rgba(146,217,246,0)` 100%                                                                    |

Both shapes have `paths[0].type = "ellipse"` and `width == height`, so the
Sketch radial renders as a true circle clipped to a circular mask.
CSS equivalent: `radial-gradient(circle <radius>px at <from.x*100%> <from.y*100%>, …stops…)`
on a `<div>` with `border-radius: 50%` and the shape's (left, top, width, height)
from raw JSON, positioned `absolute` relative to `.me-page`.

### Icon slices

Authoritative mapping verified by **SHA-256 exact match** between the CDN `imageRef`
binaries (from parsed JSON, downloaded from `lanhu-oss-2537-2.lanhuapp.com/MasterSlicePNG{hash}.png`)
and the generic `icon-{1..8}.png` produced by `lanhu_download_slices`.
Reproducible via `node page/lanhu-mcp-assets/slice-mapping.mjs` (prints the 8/8 match table).

| Semantic alias          | CDN hash (imageRef)                | Generic      | Local alias                                  | Size  | Usage                              |
| ----------------------- | ---------------------------------- | ------------ | -------------------------------------------- | ----- | ---------------------------------- |
| `img_member_center_me`  | `f52c67fa1f82d5ad75d906df7f92b4e2` | `icon-1.png` | `src/assets/lanhu/me/img-member-center.png`  | 48×48 | 会员中心卡片右下角 (green diamond) |
| `img_service_center_me` | `243d3622c263e592a4ef40fb3e56753e` | `icon-2.png` | `src/assets/lanhu/me/img-service-center.png` | 48×48 | 服务中心卡片右下角 (blue heart)    |
| `icon_order_me`         | `f6e7a658ba07f146e402d72d22473681` | `icon-3.png` | `src/assets/lanhu/me/icon-order.png`         | 24×24 | 我的订单菜单行                     |
| `icon_child_infor_me`   | `8311b64fe8946df5585833f72e0746f5` | `icon-4.png` | `src/assets/lanhu/me/icon-child-infor.png`   | 24×24 | 家庭组设置菜单行                   |
| `icon_feedback_me`      | `67f9ec8a3e10948aece5ed3c18d9c07a` | `icon-5.png` | `src/assets/lanhu/me/icon-feedback.png`      | 24×24 | 帮助与反馈菜单行                   |
| `icon_about_us_me`      | `b26128594ade476a79386eb526d1f9fa` | `icon-6.png` | `src/assets/lanhu/me/icon-about-us.png`      | 24×24 | 关于我们菜单行                     |
| `icon_set_me`           | `4d0ba7a977fdad138855cbd2859c96a3` | `icon-7.png` | `src/assets/lanhu/me/icon-set.png`           | 24×24 | 设置菜单行                         |
| `icon_msg_home`         | `abe56ad8be74ca698e519ec1c16c3fc3` | `icon-8.png` | `src/assets/lanhu/me/icon-msg-home.png`      | 24×24 | 右上角扫描框入口 (NOT a bell)      |

**Method note**: The CDN URLs in parsed JSON `imageRef` field are the authoritative source
of slice identity when raw JSON is unavailable. Never infer semantic role from the
`icon-N.png` filename ordering — that ordering is traversal-dependent with no relation to
element semantics. Always run `slice-mapping.mjs` to produce a SHA-verified mapping table
before aliasing. Prior to this verification, 7/8 slices were mis-mapped by visual inspection.

### Known unimplemented items

- (none — radial glow shapes 171/172 are now implemented directly on `.me-page` per decision B1)

## Profile ID Account Label

| Role        | Value                                                   |
| ----------- | ------------------------------------------------------- |
| Format (zh) | `ID账号{id}`                                            |
| Format (en) | `ID Account {id}`                                       |
| Style       | `12px Regular`, `rgba(147, 152, 169, 1)`, lineHeight 16 |
| Source      | parsed JSON of 我的 (`84fafb58-...`)                    |

## Brand Colors

| Name              | RGBA                  | Hex       | Usage                            |
| ----------------- | --------------------- | --------- | -------------------------------- |
| 品牌色/辅助色深紫 | `rgba(18,14,44,1)`    | `#120E2C` | Primary button background        |
| 链接色/主色青     | `rgba(32,204,249,1)`  | `#20CCF9` | Links, focus states              |
| 错误色            | `rgba(255,93,93,1)`   | `#FF5D5D` | Error messages, error borders    |
| 危险色            | `rgba(255,93,93,1)`   | `#FF5D5D` | Deactivate / destructive actions |
| 弱化文字色/文本2  | `rgba(83,89,89,1)`    | `#535959` | Weak button text, secondary text |
| 文本3             | `rgba(74,74,74,1)`    | `#4A4A4A` | Tertiary text                    |
| 占位符色          | `rgba(147,152,169,1)` | `#9398A9` | Placeholder text, icons          |
| 正文字色          | `rgba(21,23,23,1)`    | `#151717` | Body text                        |
| 分割线            | `rgba(229,229,239,1)` | `#E5E5EF` | Dividers, separators             |
| 浅绿背景          | `rgba(241,249,248,1)` | `#F1F9F8` | Neutral page background          |
| 边框/弱化色       | `rgba(33,186,69,1)`   | `#21BA45` | Weak button border               |
| 极光渐变          | `rgba(129,236,223,1)` | `#81ECDF` | Gradient backgrounds             |

## Sizing

| Element          | Size       | Notes                      |
| ---------------- | ---------- | -------------------------- |
| Page container   | 375px wide | Fixed width, centered      |
| Logo             | 120×120px  | Rounded, centered          |
| Avatar (profile) | 87×87px    | Circular                   |
| Checkbox         | 14×14px    | Rounded rect, 4px radius   |
| Eye icon         | 20×20px    | Password visibility toggle |
| Back arrow       | 9×16px     | Top-left navigation        |
| Status bar       | 375×44px   | iPhone X style             |

## HomePage (ed2b5fdd)

> Extracted from `page/lanhu-mcp-assets/designs/ed2b5fdd-c624-4a3c-9750-5d442d8a9ef2.json`.
> Decision D1: **B3 scale strategy** — canvas fixed at 375×812, whole artboard scaled via `transform: scale(calc(100vw / 375))`. Spacer `.home-canvas-spacer` preserves vertical flow.

### Artboard & Background

| Token                                         | Value                                                                                                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artboard                                      | 375 × 812 px                                                                                                                                       |
| `--home-bg-gradient` (linear 180deg, 5 stops) | `rgba(219,244,255,1) 0%` → `rgba(236,255,246,1) 21.57%` → `rgba(255,255,255,1) 43.71%` → `rgba(254,255,229,1) 65.86%` → `rgba(255,255,255,1) 100%` |

### Hero Glow (two stacked radial ellipses, pointer-events: none)

| Glow  | Size (WxH) | Position (L,T) | Gradient                                                                                                                                    |
| ----- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Warm  | 374×367 px | 1, 189 px      | `radial-gradient(ellipse 262.1px 262.1px at 0% 50%, rgba(255,238,205,0.6) 63.71%, rgba(255,246,227,0.44) 80.86%, rgba(255,245,222,0) 100%)` |
| Amber | 364×75 px  | 6, 478 px      | `radial-gradient(ellipse 182px 37.5px at 50% 50%, rgba(246,223,175,1) 40.86%, rgba(255,245,222,0) 100%)`                                    |

### Speech Bubble

| Property | Value                                                              |
| -------- | ------------------------------------------------------------------ |
| Size     | 175 × 86 px                                                        |
| Position | left 168 px, top 168 px                                            |
| Radius   | 16 px (corner with tail pointing towards mascot)                   |
| Text     | `rgba(21,23,23,1)` 14px / lineHeight 20 / Medium, white-space: pre |

### Mascot Placeholder (Decision D2: lightbox placeholder + TODO)

| Property | Value                                            |
| -------- | ------------------------------------------------ |
| Size     | 230 × 334 px                                     |
| Position | left 73 px, top 219 px                           |
| Fill     | dashed 1px rgba(147,152,169,0.4) + center label  |
| TODO     | Swap for lottie / 3D asset when design hands off |

### Top Nav Row

| Element           | Icon source                                    | Size  | Notes                                |
| ----------------- | ---------------------------------------------- | ----- | ------------------------------------ |
| Robot name + days | text only                                      | —     | `#120E2C` 16px Medium + 12px Regular |
| Device change     | `src/assets/lanhu/home/icon-device-change.png` | 16×16 | Right of robot name                  |
| Robot settings    | `src/assets/lanhu/home/icon-robot-set.png`     | 24×24 |                                      |
| Messages          | `src/assets/lanhu/home/icon-msg.png`           | 24×24 | Scan-frame icon (top-right)          |

### Hot Topics Section

| Token             | Value                                                         |
| ----------------- | ------------------------------------------------------------- |
| Section title     | 18px Medium, `#120E2C`                                        |
| History link icon | `src/assets/lanhu/home/icon-next.png` 20×20                   |
| Chip bg           | `rgba(255,255,255,0.7)` with 1px border `rgba(18,14,44,0.08)` |
| Chip text         | 14px Medium, `#120E2C`                                        |
| Chip leading icon | `src/assets/lanhu/home/icon-topic.png` 16×16                  |
| Chip padding      | 6px 12px, radius 16 px, gap 8 px                              |

### Bottom Tab (Decision D6'-a: mdi icons)

| Token               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| Font size / line-ht | 12 px / 16 px                                        |
| Active color        | `#120E2C`                                            |
| Inactive color      | `#9398A9`                                            |
| Overrides           | global rule in `src/css/app.scss` under `.q-footer`  |
| Icon                | `mdi-*` placeholders until raw imageRef is available |

### Slice Mapping (HomePage)

| Semantic key              | CDN SHA                            | Local alias                                    | Size  | Usage                           |
| ------------------------- | ---------------------------------- | ---------------------------------------------- | ----- | ------------------------------- |
| `icon_msg_home`           | `5476f743edd90bcc0daae4f83dbb471e` | `src/assets/lanhu/home/icon-msg.png`           | 24×24 | Top-right messages button       |
| `icon_device_change_home` | `12a534ec9572b42616c9a27a2d4269b2` | `src/assets/lanhu/home/icon-device-change.png` | 16×16 | Inline after robot name         |
| `icon_robot_set_home`     | `76a9bb968257b38dc13d194697cc575c` | `src/assets/lanhu/home/icon-robot-set.png`     | 24×24 | Top-right robot settings button |
| `icon_topic_home`         | `c57fd2333f8ed02eba9a746c17b4ca86` | `src/assets/lanhu/home/icon-topic.png`         | 16×16 | Leading icon in hot-topic chips |
| `icon_next_home`          | `1dce1bcb6b8d9cfb08e772f9119cdde2` | `src/assets/lanhu/home/icon-next.png`          | 20×20 | Chat-history right arrow        |

**Download**: `node page/lanhu-mcp-assets/home-slice-mapping.mjs`. Tab icons are absent from raw JSON (Sketch `symbolInstence`, `paths[0].type=unknown`) — no imageRef to pull.

### Global Theme Cascade (Decision D5)

| Change                          | Reason                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `$primary: #20ccf9` → `#120e2c` | Designed tab-active color is 品牌色/辅助色深紫 `#120E2C`. Applied in `src/css/quasar.variables.scss`. |
| `$secondary: #4da7ff`           | (unchanged)                                                                                           |
| `$accent: #20ccf9`              | Former primary retained as accent for link states                                                     |

> Side-effects: any previous `color="primary"` bindings (q-btn / q-toggle / q-spinner) now render deep-purple instead of cyan. Pages that want the old cyan should switch to `color="accent"`.

## SettingsPage (daac9da5)

> Design: `daac9da5-6de6-4e89-8550-4ddae94deac5`, artboard 375×1264, bg `#F1F8F8`.

### Layout

| Token            | Value                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Page background  | `var(--clr-page-bg-neutral)` (`#F1F8F8`)                         |
| Page padding     | 20 px all sides                                                  |
| Card gap         | 12 px (vertical stack)                                           |
| Card style       | reuse `.me-card` (radius 12, white fill, 335 px wide)            |
| Menu row height  | 62 px (fixed, 3/4/6 rows per card = 186/248/372 px card heights) |
| Menu row padding | 0 20 px horizontal                                               |

### Menu Row Typography

| Token            | Value                                          |
| ---------------- | ---------------------------------------------- |
| Label            | 15 px / 22 px, 400, `var(--clr-text)`          |
| Trailing caption | 15 px / 22 px, 400, `#9398A9`                  |
| Trailing chevron | `q-icon` mdi `chevron_right`, 12 px, `#9398A9` |
| Disabled opacity | 0.5 (applied via `aria-disabled="true"`)       |

### Menu Groups (4 cards × 16 items, Decision strict-follow)

| Group | Items                                                                                         |
| ----- | --------------------------------------------------------------------------------------------- |
| 1     | 个人资料 / 登录注册, 收货地址, 多语言 Language                                                |
| 2     | 消息设置, 声纹设置, 通用设置, 隐私设置, 权限管理, 敏感词过滤                                  |
| 3     | 清理缓存 (caption `146M`), 网络检测, 存储空间                                                 |
| 4     | 关于版本 (caption `v1.0`), 隐私政策, 个人信息收集清单, 备案号 (caption `沪ICP备00000000号-1`) |

### Bottom Action Button

| Token | Value                                                                   |
| ----- | ----------------------------------------------------------------------- |
| Class | `.me-btn-danger.settings-logout` (reuse danger button + 20 px margin)   |
| Fill  | `#FF5C5C` radius 28, 335×56                                             |
| Text  | logged-in → `退出登录`; logged-out → `登录 / 注册` (routes to AuthPage) |

### i18n Keys (`pages.stack.SettingsPage.labels`)

Added: `signInOrSignUp`, `sensitiveWordFilter`, `personalInfoList`, `icpFilingNumber`. Removed: `termsOfService`. Renamed captions (see design strings above).

## VoiceprintPage (94e98b66)

> Design: `94e98b66-8705-4e69-ba16-7f78550175d9`, artboard 375×812, bg `#F1F8F8`. Route: `/stack/settings/voiceprint` (name `settings-voiceprint`).

### Layout

| Token           | Value                                                               |
| --------------- | ------------------------------------------------------------------- |
| Page background | `var(--clr-page-bg-neutral)` (`#F1F8F8`)                            |
| Page padding    | `20px 0` (top/bottom only; card and button have independent widths) |
| Card            | 335×206, radius 12, white (reuse `.me-card` + `.voiceprint-card`)   |
| Card Y          | 108 (= header 88 + 20 page-top)                                     |
| Add button Y    | 354 (= card bottom 314 + 40; achieved via `gap: 20` + `margin: 20`) |

### Row Typography (`.voiceprint-row`)

| Token      | Value                                                        |
| ---------- | ------------------------------------------------------------ |
| Row height | 69 px (derived from text-top deltas 128→97→266)              |
| Label      | 15 px / 22 px, 400 Regular, `rgba(21,23,23,1)`               |
| Template   | `i18n('labels.personVoiceprint', { name })` → `{name}的声纹` |
| Chevron    | `q-icon chevron_right` 12 px, `#9398A9`                      |
| Divider    | 1 px `rgba(147,152,169,0.15)` via `& + &` selector           |

### Add Button (`.voiceprint-add-btn`)

| Token      | Value                                                                 |
| ---------- | --------------------------------------------------------------------- |
| Size       | 311×56, radius 28 (reuse `--btn-width`/`--btn-height`/`--btn-radius`) |
| Background | `var(--clr-btn-primary-bg)` = `#120E2C` (品牌辅助色深紫)              |
| Layout     | `inline-flex`, gap 8 px, vertically/horizontally centered             |
| Icon       | mdi `add` 14 px white (design `+` composed of 14×4 + 4×14 crosshair)  |
| Label      | 17 px / 24 px Medium white `添加新的声纹`                             |

### Decisions (Principle 10 escalation)

| Id  | Topic       | Choice                                                                     |
| --- | ----------- | -------------------------------------------------------------------------- |
| D1  | Test button | Hide entry on list page; keep route `.../voiceprint/test` + `TestPage.vue` |
| D2  | Row caption | Strict: remove `person_id` subline; show only `{name}的声纹`               |

### i18n Keys (`pages.stack.settings.VoiceprintPage.labels`)

Added: `personVoiceprint` (`{name}的声纹` / `{name}'s Voiceprint`). Renamed: `addNewPerson` → `添加新的声纹` / `Add New Voiceprint`, `testVoice` → `测试声纹` / `Test Voiceprint` (not rendered).

## VoiceprintPage DetailPage (d2a7b5f3)

Source: `page/lanhu-mcp-assets/designs/d2a7b5f3-5628-47b0-a6f9-8f827c5e17c7_raw.json` (parsed JSON empty; tokens extracted from raw).

### Layout (artboard 375×812, bg `#fff`)

| Element       | Position (x,y) | Size   | Notes                                         |
| ------------- | -------------- | ------ | --------------------------------------------- |
| Page padding  | —              | —      | `120px 32px 40px` (top/sides/bottom)          |
| Avatar        | (144, 208)     | 88×88  | `img_name_vocal_print` slice → `avatar.webp`  |
| Question 1    | —, 328         | —      | `这是谁的声音？`                              |
| Input box 1   | (32, 364)      | 311×48 | radius 8, bg `rgba(245,245,245,1)` (name)     |
| Value 1       | —, 377         | —      | `风间` (inline editable `<input>`)            |
| Question 2    | —, 432         | —      | `与孩子的关系`                                |
| Input box 2   | (32, 468)      | 311×48 | radius 8, bg `rgba(245,245,245,1)` (select)   |
| Value 2       | —, 481         | —      | `朋友` (BottomSheet trigger)                  |
| Spacer        | —              | —      | `.voiceprint-detail-spacer` flex + min 136 px |
| Submit button | (32, 652)      | 311×56 | radius 28, bg `rgba(18,14,44,1)`              |
| Delete button | (32, 716)      | 311×56 | radius 28, bg `rgba(255,93,93,1)` (gap 8px)   |

### Avatar + Question Typography

| Class                         | Properties                                                          |
| ----------------------------- | ------------------------------------------------------------------- |
| `.voiceprint-detail-avatar`   | 88×88, `object-fit: cover`, margin-bottom 12 px                     |
| `.voiceprint-detail-question` | 17px/24 Regular `var(--clr-text)`, margin `20px 0 12px`, self-start |

### Input (both rows share styling)

| Class                          | Properties                                                          |
| ------------------------------ | ------------------------------------------------------------------- |
| `.voiceprint-detail-input-box` | 311×48, radius 8, bg `rgba(245,245,245,1)`                          |
| `.voiceprint-detail-input`     | 16px Regular center, bg `transparent`, no border, `var(--clr-text)` |

### Buttons

| Class                           | Properties                                                                 |
| ------------------------------- | -------------------------------------------------------------------------- |
| `.voiceprint-detail-spacer`     | `flex: 1 1 auto`, `min-height: 136px` (keeps min Input2→Submit gap)        |
| `.voiceprint-detail-submit-btn` | 311×56, radius 28, bg `var(--clr-btn-primary-bg)`, 17 Medium white         |
| `.voiceprint-detail-delete-btn` | 311×56, radius 28, bg `rgba(255,93,93,1)`, 17 Medium white, margin-top 8px |

### Decisions (Principle 10 escalation)

| Id  | Topic          | Choice                                                                                                  |
| --- | -------------- | ------------------------------------------------------------------------------------------------------- |
| D1  | Feature scope  | Strict: hide voices list + `添加新声纹` entry; keep `DeleteVoiceDialog`/`NewPage`                       |
| D2  | Edit UX        | Inline `<input>` for name; Quasar `BottomSheet` for relationship; submit → `updatePerson` PUT           |
| D3  | Avatar source  | Download `img_name_vocal_print` via `lanhu_download_slices` → `src/assets/lanhu/voiceprint/avatar.webp` |
| D4  | Header title   | Reuse `声纹设置` (rewrite `stack.settingsVoiceprintDetail` i18n value, do not add new key)              |
| D5  | Submit spacing | Spacer `flex: 1 1 auto; min-height: 136px` for screen-height adaptive with 136 px minimum gap           |

### i18n Keys (`pages.stack.settings.voiceprint.DetailPage`)

Added under `labels`: `whoseVoice` (`这是谁的声音？` / `Whose voice is this?`), `relationshipToChild` (`与孩子的关系` / `Relationship to the child`), `submitUpdate` (`提交修改` / `Submit`), `deleteVoiceprint` (`删除声纹` / `Delete Voiceprint`), `selectRelationship` (`请选择与孩子的关系` / `Select relationship to the child`), `namePlaceholder` (`请输入姓名` / `Enter name`). Added under `notifications`: `updateSuccess`, `updateFailed`, `updateError`, `nameRequired`.

---

## ChangePasswordPage (修改密码) — design ec169e34

### Page Layout

| Token   | Value                                              |
| ------- | -------------------------------------------------- |
| Page bg | `var(--clr-page-bg-neutral)` = rgba(241,248,248,1) |
| Padding | 20px all sides                                     |
| Layout  | flex column center                                 |

### Input Fields (.cpw-input-wrap / .cpw-input)

| Property    | Value                               |
| ----------- | ----------------------------------- |
| Size        | 311x48                              |
| Radius      | 8px                                 |
| Background  | var(--clr-card-bg) white            |
| Border      | none                                |
| Font        | 16px Regular, color var(--clr-text) |
| Padding     | 0 20px                              |
| Placeholder | 16px Regular rgba(147,152,169,1)    |

### Error Text (.cpw-error)

| Property | Value                              |
| -------- | ---------------------------------- |
| Font     | 16px Regular                       |
| Color    | var(--clr-error) rgba(255,93,93,1) |

### Submit Button (.cpw-submit)

| Property   | Value                                      |
| ---------- | ------------------------------------------ |
| Size       | 311x56                                     |
| Radius     | 28px                                       |
| Background | var(--clr-btn-primary-bg) rgba(18,14,44,1) |
| Font       | 17px Medium white                          |
| Text       | "提交修改并返回"                           |

### i18n Updates

| Key                    | zh-CN                | en-US              |
| ---------------------- | -------------------- | ------------------ |
| labels.oldPassword     | 请输入旧密码         | (unchanged)        |
| labels.confirmPassword | 请再次输入设置的密码 | (unchanged)        |
| labels.submit          | 提交修改并返回       | Submit and Go Back |

## Voiceprint Recording Module (4e6ad306 / 1ed5ff10 / affd466e)

> Designs: `4e6ad306-e156-47f9-8a60-4de5914aff7c` (录制准备 tips), `1ed5ff10-0b86-4caf-8846-174b6c36982a` (朗读短语 reading), `affd466e-a969-448a-a618-79efac46a594` (这是谁的声音 naming). Shared 375×812 iPhone frame, page bg `rgba(241,248,248,1)` (`--clr-page-bg-neutral`).

### Typography

| Token               | Value                                        | Usage                                               |
| ------------------- | -------------------------------------------- | --------------------------------------------------- |
| Stage title         | 20px Medium / 28 lh / `rgba(48,49,51,1)`     | `.voiceprint-record-page-title` (录制准备 朗读短语) |
| Section title       | 17px Medium / 24 lh / `rgba(21,23,23,1)`     | `.voiceprint-record-section-title`                  |
| Section description | 14px Regular / 24 lh / `rgba(99,104,104,1)`  | `.voiceprint-record-section-desc`                   |
| Reading phrase      | 17px Regular / 24 lh / `rgba(48,49,51,1)`    | `.voiceprint-record-phrase`                         |
| Naming headline     | 17px Regular / 24 lh / `rgba(21,23,23,1)`    | `.voiceprint-record-voice-headline`                 |
| Naming placeholder  | 15px Regular / 22 lh / `rgba(147,152,169,1)` | input placeholder, equals `--clr-placeholder`       |
| CTA label           | 17px Medium white                            | `.auth-btn-primary` reused                          |

### Sizing

| Element             | Value                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Section row width   | 311px (aligned with primary button)                                                              |
| Section icon        | 32×32 webp slice                                                                                 |
| Pet stage container | 120×120, halo ring 70×70 · 2px stroke                                                            |
| Halo color          | border `rgba(32,204,249,0.4)`, fill `radial-gradient(rgba(32,204,249,0.18) 0%, transparent 70%)` |
| Waveform            | 204×23, 21 bars 4px, gap 6px, centre 15/23/15                                                    |
| Bar color           | `rgba(32,204,249,1)` accent                                                                      |
| Mic icon            | 24×24 webp slice                                                                                 |
| Voice icon (naming) | 88×88 container, q-icon 80px primary                                                             |
| Naming input        | 311×48 reusing `auth-input-group`                                                                |

### Slices (SHA-256, 2x webp via lanhu_download_slices)

| File                                                | SHA-256                                                            | Source                       |
| --------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------- |
| `src/assets/lanhu/voiceprint/prepare-quiet.webp`    | `F86835581DD205F01C4FF8F5FE59096DCB093CE3E664BA6A8685460845EA3D21` | 4e6ad306 · img_environment   |
| `src/assets/lanhu/voiceprint/prepare-natural.webp`  | `A9B190863646461241083A8B57F2D48CBBFDBB1950EEE5557D2AD346998D77E1` | 4e6ad306 · img_natural_voice |
| `src/assets/lanhu/voiceprint/prepare-distance.webp` | `C8E11B8AA51B0265B01A9CBDFB7D8F4C24E6BEF4D462D438D93791EBDA6EB6AF` | 4e6ad306 · img_distance      |
| `src/assets/lanhu/voiceprint/record-mic.webp`       | `D509BE2621DD0DE32B4C4608F56324E2FF35FF8B9CDFDCCD05B0C2170A2A2B06` | 1ed5ff10 · icon_read         |

### Background scope fix

The page tinted background previously only showed inside the `q-tab-panel` rectangle because Quasar's `.q-panel` middle wrapper kept its default white fill. Fix lives in `app.scss` under `.voiceprint-record-page` and forces `.q-tab-panels`, `.q-panel`, `.q-tab-panel` to `background: transparent` only within the voiceprint scope so other modules are unaffected.

### i18n updates (zh-CN / en-US)

| Key                                            | zh-CN (new)                                                  | en-US (new)                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| RecordPanel.labels.preparation                 | 录制准备                                                     | Recording Preparation                                                                  |
| RecordPanel.labels.quietEnvironment            | 环境安静                                                     | Quiet Environment                                                                      |
| RecordPanel.labels.quietEnvironmentDescription | 在无噪音、无回音的室内进行，确保录音清晰。                   | Record in a quiet, echo-free room to ensure clarity.                                   |
| RecordPanel.labels.naturalVoice                | 声音自然                                                     | Natural Voice                                                                          |
| RecordPanel.labels.naturalVoiceDescription     | 用您平时说话的语速、语调和音量朗读，不要刻意模仿或改变声音。 | Read aloud at your normal pace, tone, and volume; do not imitate or modify your voice. |
| RecordPanel.labels.moderateDistance            | 距离适中                                                     | Moderate Distance                                                                      |
| RecordPanel.labels.moderateDistanceDescription | 嘴巴与麦克风保持约一拳的距离，避免喷麦或声音过小。           | Keep about a fist's distance from the mic to avoid popping or low volume.              |
| RecordPanel.labels.readAloudPhrases            | 朗读短语                                                     | Read Aloud Phrases                                                                     |
| RecordPanel.labels.readAloudPhrasesDescription | 可爱的乐宝是我的好朋友。                                     | Lovely LeBot is my good friend.                                                        |
| RecordPanel.labels.startRecording              | 准备去录制                                                   | Get Ready to Record                                                                    |
| RecordPanel.labels.finish                      | 完成录制并提交                                               | Finish and Submit                                                                      |
| SubmitPanel.labels.whoseVoiceHint              | 请输入声音主人的称呼                                         | Enter the voice owner's name                                                           |

### Functional escalation (kept against design)

- `SubmitPanel` retains the relationship `q-select` and the secondary `返回` button. Design `affd466e` does not show them but they back real API parameters and navigation; per user direction "保留现有功能元素".
- `SubmitPanel` primary button text remains `确认提交` / `Confirm and Submit` (design says `下一步`) because in the implemented flow this is the terminal submit step.

## LanguagePage (d4baeedf)

> Source: `page/lanhu-mcp-assets/designs/d4baeedf-5229-49ec-aaf9-8130ce3d722b_raw.json`. Route `/stack/device-config/language` → [src/pages/stack/device-config/LanguagePage.vue](../../../src/pages/stack/device-config/LanguagePage.vue). All styles live in global `.device-lang-*` selectors in [app.scss](../../../src/css/app.scss).

### Layout (artboard 375×812, bg `--clr-page-bg-neutral` = #F1F8F8)

| Element      | Position (x, y)     | Size    | Notes                                       |
| ------------ | ------------------- | ------- | ------------------------------------------- |
| Page padding | —                   | —       | 20 px all sides                             |
| 矩形 1903    | (20, 108)           | 335×198 | `.device-lang-card`, radius 12              |
| Text rows    | y = 128 / 197 / 266 | 295×66  | 66 px row stride (198 / 3)                  |
| 矩形 2025    | —                   | 295×1   | Row divider, fill = page bg (`#F1F8F8`)     |
| Mark icon    | left 321            | 14×14   | `.device-lang-mark`, shared check/radio PNG |

### Token map

| Token                      | Value                                                   |
| -------------------------- | ------------------------------------------------------- |
| `--device-card-max-w`      | 335 px                                                  |
| `--device-row-height-lang` | 66 px                                                   |
| `.device-lang-row` font    | 15 px / 20 px / 400 Regular                             |
| `.device-lang-row` color   | `var(--clr-text)`                                       |
| Row divider                | 1 px solid `var(--clr-page-bg-neutral)`                 |
| Disabled row               | `aria-disabled="true"` opacity 0.5 + cursor not-allowed |

### i18n keys (`pages.stack.LanguagePage`)

Uses `labels.comingSoon` (Cantonese toast), `languages.{chinese,english,cantonese}` for row labels.

## VoiceStylePage (4b20baad)

> Source: `page/lanhu-mcp-assets/designs/4b20baad-348f-4230-948c-7a7c375939b6_raw.json`. Route `/stack/device-config/voice-style` → [src/pages/stack/device-config/VoiceStylePage.vue](../../../src/pages/stack/device-config/VoiceStylePage.vue). Styles in global `.voice-style-*` selectors in app.scss.

### Layout (artboard 375×812, bg `--clr-page-bg-neutral`)

| Element            | Position (x, y) | Size    | Notes                                             |
| ------------------ | --------------- | ------- | ------------------------------------------------- |
| 矩形 1904 (top)    | (20, 108)       | 335×136 | `.voice-style-card.voice-style-card--current`     |
| 矩形 2003 (track)  | 295×6, radius 4 | —       | Slider grey track `rgba(209,216,219,1)`           |
| 矩形 2004 (fill)   | 148×6           | —       | Slider cyan fill `rgba(32,204,249,1)` (=$accent)  |
| 圆形 198 (thumb)   | 22×22           | —       | White thumb, 2 px cyan border                     |
| 矩形 1903 (bottom) | (20, 300)       | 335×338 | `.voice-style-card` (list). 5 rows, 69 px stride. |

### Token map

| Token                             | Value                                      |
| --------------------------------- | ------------------------------------------ |
| `--device-card-max-w`             | 335 px                                     |
| `--voice-style-row-height`        | 69 px                                      |
| `--clr-voice-slider-fill`         | `rgba(32, 204, 249, 1)` (= Quasar $accent) |
| `--clr-voice-slider-track`        | `rgba(209, 216, 219, 1)`                   |
| `--clr-voice-slider-thumb-bg`     | `rgba(255, 255, 255, 1)`                   |
| `--clr-voice-slider-thumb-border` | `rgba(32, 204, 249, 1)`                    |
| `--voice-slider-track-h`          | 6 px                                       |
| `--voice-slider-thumb-size`       | 22 px                                      |
| `--voice-slider-pct` (inline)     | `((rate - 0.5) / 1.5) * 100%`              |
| Current name font                 | 15 px / 22 / 500 Medium                    |
| List row font                     | 15 px / 22 / 400 Regular                   |
| Section title                     | 17 px / 24 / 500 Medium                    |
| Rate range                        | 0.5x – 2.0x, step 0.1                      |

### i18n keys (`pages.stack.VoiceStylePage`)

`styles.{cuteChild, gentleSister, sunnyBoy, cuteRobot, sweetLady}` for row/header labels, `labels.rateLabel`, `labels.sectionTitle`.

## PersonalityPage (f001e23d) / PersonalityDetailPage (31e9fabe, 31c5986a)

> Sources: `page/lanhu-mcp-assets/designs/{f001e23d,31e9fabe,31c5986a}-*_raw.json`. Routes `/stack/device-config/personality` → [PersonalityPage.vue](../../../src/pages/stack/device-config/PersonalityPage.vue), `/stack/device-config/personality/detail` → [PersonalityDetailPage.vue](../../../src/pages/stack/device-config/PersonalityDetailPage.vue). Styles in global `.device-personality-*` selectors in app.scss.

### PersonalityPage empty state (f001e23d)

| Element      | Position (x, y)                  | Size    | Notes                                              |
| ------------ | -------------------------------- | ------- | -------------------------------------------------- |
| Page padding | —                                | —       | 20 px, gap 12 px                                   |
| 矩形         | (20, 108)                        | 335×64  | `.device-personality-card`, radius 12              |
| Row label    | 15 px / 22 / 400                 | —       | “AI个性调节” (`labels.toggleLabel`)                |
| Toggle       | Quasar `q-toggle color="accent"` | —       | Matches raw `rgba(32,204,249,1)` precisely         |
| Tip text     | (23, 180)                        | 12 / 16 | `rgba(147,152,169,1)` (`--personality-hint-color`) |

### PersonalityDetailPage (31e9fabe / 31c5986a)

| Element              | Position (x, y)  | Size    | Notes                                              |
| -------------------- | ---------------- | ------- | -------------------------------------------------- |
| Toggle card          | (20, 108)        | 335×64  | Reuses `.device-personality-card`                  |
| Tip text             | (23, 180)        | —       | Same as empty state                                |
| Section title 1/2    | 17 px / 24 / 400 | —       | `labels.traitsTitle` / `labels.goalsTitle`         |
| 矩形 1993 (textarea) | (20, 252)        | 335×160 | `.device-personality-textarea`, radius 12          |
| 矩形 1994 (textarea) | (20, 466)        | 335×160 | Same as above                                      |
| 矩形 1907 (submit)   | (32, 666)        | 311×56  | `.device-personality-submit`, radius 28, `#120E2C` |

### Token map

| Token                             | Value                                                                    |
| --------------------------------- | ------------------------------------------------------------------------ |
| `--device-card-max-w`             | 335 px                                                                   |
| `--device-row-height-personality` | 64 px                                                                    |
| `--personality-textarea-h`        | 160 px                                                                   |
| `--personality-textarea-radius`   | 12 px (equals `--card-radius`)                                           |
| `--personality-hint-color`        | `rgba(147, 152, 169, 1)` (equals `--clr-placeholder` / `--clr-caption`)  |
| `--personality-section-gap`       | 16 px                                                                    |
| Submit button                     | `--btn-width` / `--btn-height` / `--btn-radius` / `--clr-btn-primary-bg` |
| Submit disabled                   | opacity 0.5, `cursor: not-allowed`                                       |
| Toggle color                      | Quasar preset `accent` (= `#20CCF9`)                                     |

### Decisions (Principle 10)

| Id  | Topic         | Choice                                                                                                                                                                                                                                                 |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Toggle color  | Use Quasar `color="accent"` (mapped to `$accent: #20ccf9` in `quasar.variables.scss`) on both pages. This matches raw `rgba(32,204,249,1)` exactly; `color="primary"` (deep purple) and `color="cyan"` (Quasar built-in `#00BCD4`) are both incorrect. |
| D2  | Submit gating | Enable when either `traits` OR `goals` has non-empty trimmed value; not both required.                                                                                                                                                                 |
| D3  | Empty-state   | PersonalityPage merely toggles → push to `/stack/device-config/personality/detail`; no inline form.                                                                                                                                                    |

### i18n keys

- `pages.stack.PersonalityPage.labels`: `toggleLabel`, `tip`
- `pages.stack.PersonalityDetailPage.labels`: `toggleLabel`, `tip`, `traitsTitle`, `traitsPlaceholder`, `goalsTitle`, `goalsPlaceholder`, `submit`

## Device-Config Slice Fingerprints

Slices shared by LanguagePage / VoiceStylePage selection UI. Stored at `src/assets/lanhu/device-config/voice/` to keep the existing Vite static-import paths stable.

| Local alias                                             | SHA-256                                                            | Size  | Usage                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------ | ----- | -------------------------------------------------------------- |
| `src/assets/lanhu/device-config/voice/icon-check.png`   | `7F0F3BC4ADA5E42C9BCED654C7FA54144AC663C7E609AE282C117538B7D59E8B` | 14×14 | Selected-state mark on LanguagePage / VoiceStylePage list rows |
| `src/assets/lanhu/device-config/voice/icon-radio.png`   | `33360BB915191FE4806E5D665BA55FDFA3E96E8C7DD74A334A04940D6FB27D35` | 14×14 | Unselected-state mark on same rows                             |
| `src/assets/lanhu/device-config/voice/icon-speaker.png` | `D31B8E2E2A6F73B496FC803C73766D93B18228A1BA61913EA873415D2A16A5AA` | 20×20 | Leading icon of VoiceStylePage current-style header            |

Downloaded via `lanhu_download_slices` during prior rounds; SHA-256 captured via PowerShell `Get-FileHash` against the in-repo assets. When re-downloading (e.g. raw JSON updates), keep the file names identical to avoid updating four `.vue` imports.

## ChatPage (a2096a64)

聊天页，375×812 画板，artboard fills[0] = `rgba(241.22,248.93,248.16,1)` ≈ `--clr-page-bg-neutral: rgba(241,248,248,1)`（1/255 容差内）。顶部 88px 由 StackHeader 托管（title 与 mute / call headerActions 走路由 meta + 全局 bus）；底部 48px 按压说话条 + 24px 安全槽；中间 hero 装饰组（opacity 0.3）叠在消息列表下层。

### Layout (raw frame values)

| Layer                    | Raw frame                            | Radius | Fill                                    | 代码映射                      |
| ------------------------ | ------------------------------------ | ------ | --------------------------------------- | ----------------------------- |
| 组 385 (hero decoration) | 374×367 @ left:1 top:88, opacity 0.3 | —      | `fills: []` (empty)                     | `.chat-page__hero`            |
| 乐宝正面 (mascot)        | 230×334 @ left:73 top:118            | —      | shape placeholder, master slice PNG     | `.chat-page__hero-mascot`     |
| 矩形 1904 (AI bubble)    | 335×72 @ left:20 top:392             | 12     | `rgba(255,255,255,1)`                   | `.chat-bubble--ai`            |
| 矩形 1908 (AI bubble)    | 335×72 @ left:20 top:248             | 12     | `rgba(255,255,255,1)`                   | `.chat-bubble--ai`            |
| 矩形 1906 (AI bubble)    | 335×72 @ left:20 top:536             | 12     | `rgba(255,255,255,1)`                   | `.chat-bubble--ai`            |
| 矩形 1910 (AI bubble)    | 283×48 @ left:20 top:128             | 12     | `rgba(255,255,255,1)`                   | `.chat-bubble--ai`            |
| 矩形 1903 (user bubble)  | 214×48 @ left:141 top:332            | 12     | `rgba(39.3,145.4,233.75,1)` ≈ `#2791EA` | `.chat-bubble--user`          |
| 矩形 1909 (user bubble)  | 192×48 @ left:163 top:188            | 12     | `rgba(39.3,145.4,233.75,1)`             | `.chat-bubble--user`          |
| 矩形 1905 (user bubble)  | 192×48 @ left:163 top:476            | 12     | `rgba(39.3,145.4,233.75,1)`             | `.chat-bubble--user`          |
| 矩形 1907 (input bar)    | 335×48 @ left:20 top:740             | 12     | `rgba(255,255,255,1)`                   | `.chat-input-bar`             |
| mic icon (内嵌 SVG)      | 24×24 @ left:140 top:752             | —      | —                                       | `<svg>` in `ChatInputBar.vue` |

Raw carries no shadows on any bubble or the input bar (`shadows: []` on every relevant layer). The artboard canvas has no gradient; the hero group likewise has empty fills.

### Token map (`:root` in `src/css/app.scss`)

| Token                                | Value                                              | Source                                  |
| ------------------------------------ | -------------------------------------------------- | --------------------------------------- |
| `--chat-hero-opacity`                | `0.3`                                              | 组 385 `opacity` (0.30000001192092896)  |
| `--chat-hero-top`                    | `88px`                                             | 组 385 frame.top (aligned with nav bar) |
| `--chat-hero-h`                      | `367px`                                            | 组 385 realFrame.height                 |
| `--chat-hero-bg-gradient`            | radial `rgba(224,240,255,1) → 0` at 50% 45%        | Code-enhanced (raw has empty fills)     |
| `--chat-hero-mascot-w` / `-h`        | `230px` / `334px`                                  | 乐宝正面 frame                          |
| `--chat-hero-mascot-left`            | `73px`                                             | 乐宝正面 frame.left                     |
| `--chat-hero-mascot-top`             | `30px` (= raw `top 118` − hero container `top 88`) | 乐宝正面 frame.top remapped             |
| `--chat-bubble-radius`               | `12px`                                             | All bubble/input rect `radius.topLeft`  |
| `--chat-bubble-max-w`                | `295px`                                            | Implementation bound; raw widest AI 335 |
| `--chat-bubble-gap`                  | `16px`                                             | Inferred from 72-bubble stride          |
| `--chat-list-padding-{top,x,bottom}` | `16px` / `20px` / `24px`                           | Gutters; bubble top-spacing cadence     |
| `--chat-ai-bg`                       | `rgba(255,255,255,1)`                              | 矩形 1904/1908/1906/1910 fills[0]       |
| `--chat-user-bg`                     | `rgba(39,145,234,1)`                               | 矩形 1903/1909/1905 fills[0] (rounded)  |
| `--chat-bubble-shadow`               | `0 2px 8px rgba(18,14,44,0.05)`                    | **Code-enhanced** (raw `shadows: []`)   |
| `--chat-user-bubble-shadow`          | `0 2px 8px rgba(39,145,234,0.24)`                  | **Code-enhanced** (raw `shadows: []`)   |
| `--chat-input-bar-w` / `-h`          | `335px` / `48px`                                   | 矩形 1907 frame                         |
| `--chat-input-bar-left`              | `20px`                                             | 矩形 1907 frame.left                    |
| `--chat-input-bar-bottom`            | `24px`                                             | Implementation (safe-area gutter)       |
| `--chat-input-bg`                    | `rgba(255,255,255,1)`                              | 矩形 1907 fills[0]                      |
| `--chat-input-pressing-bg`           | `rgba(224,240,255,1)`                              | Interaction state (no raw counterpart)  |
| `--chat-input-bar-shadow`            | `0 2px 12px rgba(18,14,44,0.06)`                   | **Code-enhanced** (raw `shadows: []`)   |

### Decisions (Principle 10 — code enhancements beyond raw)

| Id  | Topic            | Choice                                                                                                                                                                                                                                                              |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Bubble shadows   | Raw carries no shadows; keep soft drop-shadows on AI (`rgba(18,14,44,0.05)`) and user (`rgba(39,145,234,0.24)`) bubbles for layer separation against the page background. Gated behind `--chat-bubble-shadow` / `--chat-user-bubble-shadow` so removal is one-line. |
| D2  | Input bar shadow | Same reasoning — raw `shadows: []` on 矩形 1907. The `0 2px 12px rgba(18,14,44,0.06)` shadow is retained for visual affordance of the press-to-talk surface. Controlled by `--chat-input-bar-shadow`.                                                               |
| D3  | Hero gradient    | 组 385 raw `fills: []`. The radial `rgba(224,240,255,1) → 0` gradient on `.chat-page__hero-bg` is a code enhancement to soften the mascot silhouette. Controlled by `--chat-hero-bg-gradient`.                                                                      |
| D4  | Typography       | Raw has no `type:"text"` layers (text rendered as paths); AI bubble text color uses `--clr-text: rgba(21,23,23,1)`, user bubble uses `--clr-white`. Matches the ChatMessageItem.vue authoring comment and Quasar theme.                                             |
| D5  | Mascot placement | Mascot container top corrected from previous `16px` to `30px` (= raw mascot top 118 − hero container top 88); left from `72px` to `73px` (matches raw).                                                                                                             |
| D6  | Press gesture    | Raw is a static mock so the press / release state is implementation-only. `pointerdown → emit('press')` wakes `useChatSession`; release relies on the silence detector (no stop-recording API yet). Documented in `ChatInputBar.vue` comment header.                |

### i18n keys (`pages.stack.ChatPage`)

- `labels`: `pressToTalk`, `emptyHint`, `callDevice`, `callDeviceConfirm`
- `notifications`: `notLoggedIn`, `notReady`, `wakeFailed`, `connectFailed`, `muteComingSoon`, `callComingSoon`

## Chat Slice Fingerprints

StackHeader action icons rendered via the shared `.stack-header-action--chat-*` pattern. Slices live at `src/assets/lanhu/chat/`.

| Local alias                            | SHA-256                                                            | Usage                                                       |
| -------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| `src/assets/lanhu/chat/icon-mute.webp` | `3CFA713BCBB6F669713E6A81F6C34F19F8F2DDE13469044EF2D36AEC67B626E4` | `.stack-header-action--chat-mute` (route meta headerAction) |
| `src/assets/lanhu/chat/icon-call.webp` | `6C662D33DA3336CC5EA4C3F368C4E16014EE26EDC5C06C84A33ED6AD4DD5E1D0` | `.stack-header-action--chat-call` (route meta headerAction) |
| `src/assets/lanhu/chat/icon-3.webp`    | `3CFA713BCBB6F669713E6A81F6C34F19F8F2DDE13469044EF2D36AEC67B626E4` | Legacy / unreferenced; keep for future use                  |

Mascot image at `src/assets/lanhu/home/mascot.png` is **not yet committed** (shared TODO with HomePage.vue). The master slice URL lives at `assets[0]` of `a2096a64-5686-4d42-b857-2119eed0214f_raw.json` (`MasterSlicePNG6b878688a12499a132141fcc4ff5e121.png`) — waiting for user to download and drop in place. Both `.home-hero-mascot` and `.chat-page__hero-mascot` will start rendering automatically once the file exists.

## SetupProfilePanel (ed71eb82 / fb8d01d5)

Raw JSON timestamps: `page/lanhu-mcp-assets/designs/ed71eb82-f281-497a-be98-eed664237878_raw.json` and `.../fb8d01d5-25d5-4e4f-91af-35ba5ada9aaa_raw.json` (re-parsed 2026-05-08).

Implementation: `src/components/auth/SetupProfilePanel.vue` + the `SetupProfilePanel patterns` block in `src/css/app.scss` (under the generic `.auth-panel` / `.auth-input-group` shell defined in the login token sections above).

### Layout (artboard 375×812, bg white)

| Region         | Raw frame (x, y, w, h) | Notes                                                                                                            |
| -------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Avatar circle  | (144, 120) 87×87       | `oval-199:6216`: fill `rgba(229,229,239,1)`, 3px solid `#fff` border, border-radius 50%                          |
| Nickname label | (40, 231) 15px Medium  | `text`: `昵称`, color `rgba(147,152,169,1)` (= `--clr-placeholder`); label x=40 / input x=32 => +8px left indent |
| Nickname input | (32, 261) 311×48 r8    | `rect-1993`: fill `#fff` (reuses `.auth-input-group` + `.auth-input`)                                            |
| Birthday label | (40, 321) 15px Medium  | `text`: `生日`                                                                                                   |
| Birthday input | (32, 351) 311×48 r8    | `rect-1994`: clickable row, chevron right (7×12 stroke `#9398A9` 1.5px)                                          |
| Relation label | (40, 411) 15px Medium  | `text`: `您与孩子的关系`                                                                                         |
| Relation input | (32, 441) 311×48 r8    | `rect-1995`: clickable row, opens fb8d01d5 bottom sheet                                                          |
| Primary button | (30, 586) 311×56 r28   | fill `rgba(18,14,44,1)` (= `--clr-btn-primary`), text `完成` 17px Regular `#fff`                                 |
| Skip button    | (30, 654) 311×56 r28   | fill `#fff`, **border 1.5px `rgba(212,246,170,1)`** (diverges from global weak token)                            |

### Relationship bottom sheet (fb8d01d5)

| Region            | Raw frame (x, y, w, h) | Notes                                                                                                                                               |
| ----------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overlay mask      | (0, 0) 375×812         | `rect-190:6333`: fill `rgba(0,0,0,1)`, opacity `0.5` → CSS `rgba(0,0,0,0.5)`                                                                        |
| Sheet container   | (0, 536) 375×276       | `group-190:6332`: bottom sheet region. Raw has no independent rounded rect; top radius `20px` kept as Principle 10 enhancement                      |
| Header `选择关系` | 17px Medium            | color `--clr-text`, 16×20 padding, 1px divider `rgba(147,152,169,0.15)`                                                                             |
| Chip (未选)       | 100×40                 | `rect-190:6337`: cornerRadius `12`, fill `#fff`, border `1px solid rgba(229,229,239,1)` (= `--clr-divider`), text 15px Regular `rgba(99,104,104,1)` |
| Chip (选中)       | 100×40                 | `rect-17` at (138,612): fill `rgba(18,14,44,1)`, no border, text 15px Regular `#fff`                                                                |
| Grid              | 3 cols × 3 rows        | `grid-template-columns: repeat(3, 100px)`, `gap: 12px`, last row has only 1 chip (朋友 left-aligned)                                                |

**Options (7 only, reduced from prior 8)**: `爸爸` / `妈妈` / `爷爷` / `奶奶` / `外公` / `外婆` / `朋友`. `其他亲属` was removed per fb8d01d5 raw text frames (no such label exists).

### Decisions (Principle 10 escalation)

| ID  | Area               | Decision                                                                                                                                                                                                                                                                |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Skip button border | Design calls for `1.5px solid rgba(212,246,170,1)` soft-green; global `.auth-btn-weak` token is `1px solid rgba(33,186,69,1)` (consumed by SignInOrSignUpPanel too). Scoped override via `.setup-profile-btn-skip` class — global `--clr-btn-weak-border` stays intact. |
| P2  | Sheet top radius   | Raw has no independent rounded rect for the sheet body. Kept existing `20px 20px 0 0` top radius as code enhancement for touch affordance.                                                                                                                              |
| P3  | Label indent       | Label x=40 but input x=32 in raw → rendered as `padding-left: 8px` on `.setup-profile-field-label` (stable inside 311px row) instead of absolute positioning.                                                                                                           |

### i18n keys

No i18n migration this round — the panel is the only consumer of its strings and the relation labels are already Chinese literals (zh-CN only project convention elsewhere in auth).

## FamilyGroupPage (902f07b4)

Raw JSON: `page/lanhu-mcp-assets/designs/902f07b4-b2b3-45fd-a5c6-6a5cb05f3d4a_raw.json` (re-parsed 2026-05-08). Implementation: `src/pages/stack/FamilyGroupPage.vue` + `.family-group-*` block in `src/css/app.scss`.

### Layout (artboard 375×812, bg `rgba(241,248,248,1)` = `--clr-page-bg-neutral`)

| Region          | Raw frame (x, y, w, h) | Notes                                                                                               |
| --------------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| Page bg         | 375×812                | `rgba(241,248,248,1)` (same neutral cyan as LanguagePage/VoiceStylePage)                            |
| Card 1 (家庭组) | (20, 108) 335×62 r12   | `rect-1904`: fill `#fff`, menu row style                                                            |
| Card 2 (成员)   | (20, 178) 335×62 r12   | `rect-1905`: fill `#fff`, menu row style (one blank row below in raw — reserved for future)         |
| Primary btn     | (32, 715) 311×56 r28   | `rect-1907`: fill `rgba(18,14,44,1)` (= `--clr-btn-primary`), text `添加家庭组` 17px Regular `#fff` |

Current `.family-group-page` / `.family-group-card` / `.family-group-add-btn` rules in `src/css/app.scss` already match all raw values — **no code changes this round**, only this tokens entry added.

### i18n keys (`pages.stack.FamilyGroupPage.labels`)

Existing: `familyGroup`, `members`, `addFamilyGroup`. No new keys needed.

## FamilyGroupDetailPage (eb36a568)

Raw JSON: `page/lanhu-mcp-assets/designs/eb36a568-7f3f-4c9c-84d4-d60cf6f6a001_raw.json`. Implementation: `src/pages/stack/family-group/DetailPage.vue` + `.family-group-member-*` block in `src/css/app.scss`.

### Layout (artboard 375×812, bg `rgba(241,248,248,1)` = `--clr-page-bg-neutral`)

| Region                 | Raw frame (x, y, w, h)                   | Notes                                                                                    |
| ---------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| Member card 1..4       | (20, 108/178/248/318) 335×62 r12         | `rect-1904/1906/1907/1908`: fill `#fff`, 8px gap (178-170) → `& + & { margin-top: 8px }` |
| Member name            | text at x=40, card inner padding-left 20 | 15px Regular `rgba(21,23,23,1)` = `--clr-text`                                           |
| Member meta (right)    | right-aligned at x=277-319, 15px         | `rgba(147,152,169,1)` = `--clr-caption`, e.g. `男 5岁` / role label                      |
| Chevron                | 7×12 at x=330, icon_go group             | `rgba(21,23,23,1)` tinted, Quasar `chevron_right` renders equivalent arrow               |
| Primary btn `邀请成员` | (32, 715) 311×56 r28                     | `rect-1907` fill `--clr-btn-primary-bg`, 812-(715+56)=41 → `bottom: 41px`                |

### i18n keys (`pages.stack.family-group.DetailPage`)

`role.father/mother/grandpa/grandma`, `meta.male/female/years`, `labels.invite`. All already in `src/i18n/zh-CN/index.ts`.

## FamilyGroupMemberPage (5d6d5199)

Raw JSON: `page/lanhu-mcp-assets/designs/5d6d5199-d357-4fb5-9075-8c91315d1f11_raw.json`. Implementation: `src/pages/stack/family-group/MemberPage.vue` + `.family-member-info-*` / `.family-member-delete-btn` in `src/css/app.scss`.

### Layout (artboard 375×812)

| Region                    | Raw frame (x, y, w, h)                                                    | Notes                                                                                           |
| ------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Info card                 | (20, 108) 335×302 r12                                                     | `rect-1903` fill `#fff`. Explicit `height: 302px`.                                              |
| Row 1..5                  | y=128/188/248/308/368, each 22 tall                                       | 5 rows: 称呼 / 性别 / 身份 / 生日 / 声纹. Padding 20px + 4 gaps of 38px + row 22px × 5 = 302px. |
| Label (left)              | 15px Regular `rgba(21,23,23,1)` = `--clr-text`                            |                                                                                                 |
| Value (right)             | 15px Regular `rgba(147,152,169,1)` = `--clr-caption`, `text-align: right` |                                                                                                 |
| Chevron (only row 5 声纹) | 7×12 at x=326                                                             | Row 5 is clickable; others are data-only.                                                       |
| Danger btn `删除成员`     | (20, 716) 335×56 r28                                                      | `rect-1907` fill `rgba(255,92,92,1)` = `--clr-danger-bg`, 812-(716+56)=40 ≈ `bottom: 41px`.     |

Row spacing derivation: first-row top = card-top(108) + 20 (padding) = 128 ✓; last-row bottom = 368+22 = 390; card bottom = 108+302 = 410; bottom padding = 20.

### i18n keys (`pages.stack.family-group.MemberPage`)

`labels.nickname/gender/role/birthday/voiceprint/delete`, `values.male/female`. Already in zh-CN.

## FamilyGroupInvitePage (90de50b4)

Raw JSON: `page/lanhu-mcp-assets/designs/90de50b4-897c-4122-b5c3-63e8068d8822_raw.json`. Implementation: `src/pages/stack/family-group/InvitePage.vue` + `.family-invite-*` in `src/css/app.scss`.

### Layout (artboard 375×812)

| Region                   | Raw frame (x, y, w, h) | Notes                                                                                             |
| ------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------- |
| Title `扫码加入家庭组`   | (137, 120) 104×22      | 15px Medium `--clr-text`, centered. Page-top to title = 32 (header 88 + 32) → `margin-top: 32px`. |
| QR frame                 | (68, 162) 240×240 r12  | `rect-2131` fill `#fff`. Title bottom 142 + 20 → `margin-top: 20px`.                              |
| QR image slot            | (88, 182) 200×200      | Inner area 20px inset on all sides.                                                               |
| Tip `直接分享到微信聊天` | (126, 679) 124×24      | 14px Medium `--clr-caption`. 812-679-24=109 → `bottom: 109px`.                                    |
| Primary btn              | (32, 715) 311×56 r28   | Shared primary pattern; `bottom: 41px`.                                                           |

### i18n keys (`pages.stack.family-group.InvitePage`)

`labels.title/shareTip/save`. Already in zh-CN.

## ChildEditPage (b7df1135 / c7826afa)

Raw JSONs:

- b7df1135 (edit mode, values pre-filled): `page/lanhu-mcp-assets/designs/b7df1135-1767-445d-ba29-bd003f152589_raw.json`
- c7826afa (create mode, placeholders + extra skip btn): `page/lanhu-mcp-assets/designs/c7826afa-f2e0-4e69-943a-1156be312f31_raw.json`

Implementation: `src/pages/stack/family-group/ChildEditPage.vue` + `.child-edit-*` in `src/css/app.scss`.

### Spacing table (all y are page-y; header bottom = 88, page height = 812)

| Element                         | Raw y | Derivation             | CSS                                                   |
| ------------------------------- | ----- | ---------------------- | ----------------------------------------------------- |
| Q1 `你是男生还是女生？`         | 120   | 88 (header) + 32       | `.child-edit-question--first { margin-top: 32px }`    |
| Gender avatar (100×100)         | 168   | Q1 bottom 144 + 24     | `.child-edit-gender-row { margin-top: 24px }`         |
| Gender label                    | 276   | avatar bottom 268 + 8  | `.child-edit-gender-label { margin-top: 8px }`        |
| Q2 `你的名字是什么呢？`         | 338   | label bottom 298 + 40  | `.child-edit-question--followup { margin-top: 40px }` |
| Input 1 (name) 311×48           | 374   | Q2 bottom 362 + 12     | `.child-edit-input { margin-top: 12px }`              |
| Q3 `你的生日是哪一天？`         | 462   | input1 bottom 422 + 40 | Same `--followup` rule                                |
| Input 2 (birthday)              | 498   | Q3 bottom 486 + 12     | Same `--input` rule                                   |
| Primary btn 311×56              | 586   | 812-(586+56)=170       | `.child-edit-primary-btn { bottom: 170px }`           |
| Skip btn 311×56 (c7826afa only) | 653   | 812-(653+56)=103       | `.child-edit-skip-btn { bottom: 103px }`              |

### Colors

| Region                    | Raw fill                    | Token                                                                             |
| ------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| Gender avatar bg (male)   | `rgba(134,224,248,1)`       | Not tokenised — photo covers via `<img>` in-page.                                 |
| Gender avatar bg (female) | `rgba(129,236,223,1)`       | Same as above.                                                                    |
| Gender label (active)     | `rgba(32,204,249,1)`        | `--clr-link` ✓                                                                    |
| Gender label (inactive)   | `rgba(147,152,169,1)`       | `--clr-caption` ✓                                                                 |
| Skip btn bg               | `rgba(255,255,255,1)`       | `--clr-white`                                                                     |
| Skip btn border           | `1.5px rgba(212,246,170,1)` | **Shared** `--clr-btn-weak-border-soft` (also used by SetupProfilePanel skip btn) |
| Skip btn text             | `rgba(99,104,104,1)`        | `--clr-weak`                                                                      |

### Decisions (Principle 10)

| ID  | Area                         | Decision                                                                                                                                                                                                      |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Skip btn token shared        | `--clr-btn-weak-border-soft` extracted to `:root` because raw c7826afa rect-2015 and ed71eb82 rect-199:6282 use the exact same color+width → one global token, two consumers.                                 |
| P2  | `--single` modifier position | Raw always renders primary at `bottom: 170`; single-button variant (no skip below) **also** sits at 170 per raw (no design case for 74). Kept modifier class for semantic API but collapsed its value to 170. |
| P3  | Gender avatar bg colors      | Not promoted to CSS tokens — raw frames are user photos via mask group; in-app we render `<img>`, so the shape fill is invisible. Documented here for reference only.                                         |

### i18n keys (`pages.stack.family-group.ChildEditPage`)

Existing: `labels.genderQuestion/nameQuestion/birthdayQuestion/male/female/namePlaceholder/birthdayPlaceholder/save/skip`. All already in zh-CN.

## MessagesPage (5f6208e5)

Raw JSON: `page/lanhu-mcp-assets/designs/5f6208e5-5b99-41fa-a7b9-7850b1197120_raw.json`. Implementation: `src/pages/stack/MessagesPage.vue` + `.messages-*` in `src/css/app.scss`.

### Layout (artboard 375×812, bg `rgba(241,248,248,1)` = `--clr-page-bg-neutral`)

| Region        | Raw frame (x, y, w, h)       | Notes                                                                                                                                                       |
| ------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Row card 1..4 | (20, 108/192/276/360) 335×72 | `rect-1900 ×4` fill `#fff`. Gap = 192−(108+72) = 12 → `& + & { margin-top: 12px }`. Page container uses `gap: 12px` + transparent wrapper `.messages-card`. |
| Icon          | (32, card_top+12) 48×48      | Circle avatar, bg varies per row (`rgba(240,254,244,1)` etc.). Rendered via slice `src/assets/lanhu/messages/icon-1..4.webp`.                               |
| Title         | (88, card_top+15) 60×22      | 15px Medium `rgba(21,23,23,1)` = `--clr-text`.                                                                                                              |
| Content       | (88, card_top+41) auto×16    | 12px Regular `rgba(74,74,74,1)` ≈ `rgba(0.29,0.29,0.29,1)`. Mapped to `--clr-caption-strong`-style literal (kept inline).                                   |
| Date (right)  | (284, card_top+18) 59×16     | 12px Regular `rgba(147,152,169,1)` = `--clr-caption`.                                                                                                       |
| Unread dot    | (339, card_top+47) 4×4       | `rgba(255,92,92,1)` = `--clr-danger-bg` (NOT `--clr-error`, see P1).                                                                                        |

### Decisions (Principle 10)

| ID  | Area                   | Decision                                                                                                                                                                                                                                                                          |
| --- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Unread dot color token | Raw fill `rgba(1,0.3628,0.3628,1)` = `rgba(255,92,92,1)` matches `--clr-danger-bg` exactly; previous code used `--clr-error` (close but off by ∼3 units). Aligned to danger-bg for consistency with MemberPage delete button.                                                     |
| P2  | Card structure         | Raw renders 4 independent 335×72 cards with 12px gap, not a single 335×324 card with internal dividers. Refactored `.messages-card` to a transparent flex wrapper; each `.messages-row` becomes an elevated card. Vue template unchanged (outer `div.messages-card` still wraps). |
| P3  | Icon assets            | Raw draws icons as layered shape primitives (circle+sub-shapes). In code we use pre-exported webp slices under `src/assets/lanhu/messages/` to avoid re-composing shapes.                                                                                                         |

### i18n keys (`pages.stack.MessagesPage`)

Existing: `items.m1Title/m1Content … m4Title/m4Content`, `labels.empty`. All in zh-CN.

## OrdersPage (64595f70)

Raw JSON: `page/lanhu-mcp-assets/designs/64595f70-2fe7-4a9d-aded-0a0ea165abfb_raw.json`. Implementation: `src/pages/stack/OrdersPage.vue` + `.orders-*` in `src/css/app.scss`.

### Layout (artboard 375×812, bg `--clr-page-bg-neutral`)

| Region              | Raw frame (x, y, w, h)                    | Notes                                                                                                                                               |
| ------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab `全部` (active) | (22, 106) 34×24                           | 17px Medium `rgba(48,49,51,1)` ≈ `--clr-text`.                                                                                                      |
| Tab inactive ×4     | (90/167/245/322, 108) 42×24 (28 for 售后) | 14px Regular `rgba(96,98,102,1)` ≈ `--clr-weak`.                                                                                                    |
| Order card 1..4     | (16, 152/316/480/644) 343×152 r12         | `rect-1986` fill `#fff`. Gap = 316−(152+152) = 12 → `& + & { margin-top: 12px }`.                                                                   |
| Product image       | (28, card_top+16) 88×88                   | `rect-1985` (empty shape = placeholder slot).                                                                                                       |
| Product name        | (128, card_top+16) 170×48                 | 15px Medium `--clr-text`, 2-line clamp.                                                                                                             |
| Price               | (322, card_top+18) 25×19                  | 14px Medium `--clr-text`, right-aligned.                                                                                                            |
| Variant             | (128, card_top+68) 36×16                  | 12px Regular `--clr-caption`.                                                                                                                       |
| Action button ×3    | (131/207/283, card_top+112) 64×24 r12     | 1px border. Left/mid: `rgba(203,203,203,1)` = neutral gray (literal, not tokenised — see P2). Right (primary): `rgba(32,204,249,1)` = `--clr-link`. |
| `更多` label        | (28, card_top+116) 24×16                  | 12px Regular `--clr-caption`.                                                                                                                       |

### Decisions (Principle 10)

| ID  | Area                 | Decision                                                                                                                                                                               |
| --- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Button height        | Raw is 24px, not the 31px previously in code. Also added `min-width: 64px` and `padding: 0 10px` to match the 64×24 raw rect exactly. Font-size stays 12px.                            |
| P2  | Button border color  | `rgba(203,203,203,1)` kept as literal (not a CSS var) because this is the only place using this exact hairline gray; introducing a token would be premature abstraction.               |
| P3  | Primary action color | Raw uses `rgba(32,204,249,1)` (`--clr-link`, cyan-blue), not the previous `--clr-dark-indigo`. `.orders-action-btn--primary` now sets both `border-color` and `color` to `--clr-link`. |
| P4  | `更多` label         | Present in raw (leftmost of action row) but not wired in current Vue; scss reserves space via the 3-button layout. Left as-is to avoid Vue refactor.                                   |

### i18n keys (`pages.stack.OrdersPage`)

Existing: `labels.tabAll/tabPending/tabShip/tabRecv/tabAfter/more/repurchase/refund/review/empty`, `items.orderName/variant`. All in zh-CN.

## AboutPage (897ffb14)

Raw JSON: `page/lanhu-mcp-assets/designs/897ffb14-28d6-425b-9c28-fa53719f3157_raw.json`. Implementation: `src/pages/stack/AboutPage.vue` + `.about-*` in `src/css/app.scss`.

### Layout (artboard 375×812, **bg `rgba(1,1,1,1)` normalized = `rgba(255,255,255,1)` pure white**)

| Region           | Raw frame (x, y, w, h) | Notes                                                                                                               |
| ---------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Title `公司简介` | (156, 120) 64×20       | 15px Medium `rgba(21,23,23,1)` = `--clr-text`, centered. Page-top to title = 88 (header) + 32 → `margin-top: 32px`. |
| Body paragraph   | (28, 152) 319×462      | 14px Regular `rgba(99,104,104,1)` = `--clr-weak`, line-height 24. Title bottom 140 + 12 → `margin-top: 12px`.       |

### Decisions (Principle 10)

| ID  | Area            | Decision                                                                                                                                                                                            |
| --- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Page background | Raw artboard fill `rgba(1,1,1,1)` in the 0–1 color space normalises to `rgba(255,255,255,1)`, i.e. pure white, **not** `--clr-page-bg-neutral`. Switched `.about-page` background to `--clr-white`. |
| P2  | Title font-size | Raw is 15px/20lh, not 16px. Adjusted `.about-section-title` to `font-size: 15px; line-height: 20px`. Also `margin-top` 56→32 to match raw y=120.                                                    |
| P3  | Body margin-top | Raw y=152 minus title bottom 140 = 12. Changed from 32 → 12.                                                                                                                                        |

### i18n keys (`pages.stack.AboutPage`)

Existing: `labels.companyDescriptionTitle/companyDescription`. All in zh-CN.

## HelpPage (689263cd)

Raw JSON: `page/lanhu-mcp-assets/designs/689263cd-5305-4654-9c6f-2061959d191f_raw.json`. Implementation: `src/pages/stack/HelpPage.vue` + `.help-*` in `src/css/app.scss`.

### Layout (artboard 375×812, bg `--clr-page-bg-neutral`)

| Region                                                                    | Raw frame (x, y, w, h)             | Notes                                                                                                                                                                                                  |
| ------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Top card `常见问题`                                                       | (20, 108) 335×62 r12               | `rect-1900` fill `#fff`. Label (40, 128) 60×22 15px Medium; chevron (326, 132) 7×12.                                                                                                                   |
| Body card                                                                 | (20, 182) 335×310 r12              | `rect-1903` fill `#fff`. Top card bottom 170 + 12 → `margin-top: 12px`.                                                                                                                                |
| Row 1..5 (`客服电话` / `邮箱` / `微信客服` / `意见反馈` / `问题日志上报`) | y=202/264/326/388/450, each 295×22 | Label left (40), value/chevron right. Row height 22 + gap 40 (264−(202+22)) → `line-height: 22px; & + & { margin-top: 40px }`. Body padding = 202−182 = 20. Derivation: 20 + 5×22 + 4×40 + 20 = 310 ✓. |
| Phone value                                                               | (238, 202) 97×20                   | `rgba(32,204,249,1)` = `--clr-link`.                                                                                                                                                                   |
| Email value                                                               | (206, 264) 129×20                  | **Also `rgba(32,204,249,1)` = `--clr-link`** (both value rows are blue).                                                                                                                               |
| Chevron (rows 3–5)                                                        | (326, row_y+4) 7×12                | `rgba(21,23,23,1)` = `--clr-text`.                                                                                                                                                                     |

### Decisions (Principle 10)

| ID  | Area                             | Decision                                                                                                                                                                                                                                                                                                                        |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | `.help-row__value` default color | Raw makes BOTH phone and email values link-blue (`rgba(32,204,249,1)`), despite Vue modelling email as `kind='value'` vs phone as `kind='link'`. Changed `.help-row__value` default color from `--clr-caption` to `--clr-link`; `--link` modifier kept for semantic clarity but now visually identical. No Vue change required. |
| P2  | Row layout                       | Replaced prior `border-top` separator + `height: 62px` pattern with `line-height: 22px` + `margin-top: 40px` chained rule to match raw 22h/40gap geometry exactly. Body card gets explicit `height: 310px` + `padding: 20px`.                                                                                                   |
| P3  | Chevron color                    | Raw fill `rgba(21,23,23,1)` maps to `--clr-text` (dark), not `--clr-placeholder` (mid-gray).                                                                                                                                                                                                                                    |

### i18n keys (`pages.stack.HelpPage`)

Existing: `labels.faq/phone/phoneValue/email/emailValue/wechat/feedback/logReport`, `notifications.comingSoon`. All in zh-CN.

## GrowthDataPage (824d2d70)

### Page background

| Property                        | Value                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Background gradient             | `linear-gradient(180deg, rgba(114, 228, 218, 1) 0%, rgba(236, 255, 246, 1) 8.7%, rgba(255, 255, 255, 1) 20%)` |
| Glow 171 (675x675)              | Radial from top-left, `rgba(129, 236, 223, 1)` → `rgba(131, 212, 202, 0.6)` → `rgba(245, 255, 219, 1)`        |
| Glow 172 (357x357, opacity 0.8) | Radial, `rgba(168, 233, 253, 1)` → `rgba(168, 233, 253, 0.4)` → `rgba(245, 255, 219, 1)`                      |

### Page title

| Property | Value                                                                 |
| -------- | --------------------------------------------------------------------- |
| Font     | YouSheBiaoTiHei 36px Bold, letterSpacing 4%                           |
| Color    | `rgba(36, 61, 59, 1)` → `--clr-growth-page-title`                     |
| Date     | Roboto 14px Regular, `rgba(58, 89, 86, 1)` → `--clr-growth-page-date` |

### Profile section

| Property        | Value                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Avatar          | 56x56px circle, border `#c2c2c2`                                        |
| Nickname        | AlibabaPuHuiTi 17px Regular, `rgba(21, 23, 23, 1)`                      |
| Gender/Age      | 12px Regular, `rgba(147, 152, 169, 1)` → `--clr-growth-section-caption` |
| Accompany badge | 12px Regular, `rgba(32, 204, 249, 1)` → `--clr-growth-accompany-badge`  |

### Stats row (\u77e9\u5f62 2055)

| Property         | Value                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Background       | `rgba(241, 249, 248, 1)` → `--clr-growth-stats-bg`, sharedStyle "\u80cc\u666f\u8272/\u6d45\u7eff\u8272\u80cc\u666f" |
| Border radius    | 12px                                                                                                                |
| Divider (1x16px) | `rgba(32, 204, 249, 1)` → `--clr-growth-stats-divider`, sharedStyle "\u54c1\u724c\u8272/\u8f85\u52a9\u8272\u9752"   |
| Values           | 15px Regular, `rgba(21, 23, 23, 1)`, centered                                                                       |
| Labels           | 12px Regular, `rgba(147, 152, 169, 1)`, centered                                                                    |

### Section cards

| Property            | Value                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Card background     | `rgba(255, 255, 255, 1)` (white)                                                           |
| Card radius         | 12px                                                                                       |
| Section title       | 17px Medium, `rgba(21, 23, 23, 1)` → `--clr-growth-section-title`                          |
| Accent bar (4x12px) | Gradient `rgba(129, 236, 223, 1)` → `rgba(114, 228, 218, 1)` → `--clr-growth-accent-bar-*` |
| Summary tag bg      | `rgba(18, 14, 44, 1)` → `--clr-growth-summary-tag-bg`                                      |
| Summary tag text    | 12px Medium, white                                                                         |
| Summary text        | 14px Regular, `rgba(74, 74, 74, 1)` → `--clr-growth-summary-text`                          |
| Chart labels        | 10px Regular, `rgba(74, 74, 74, 1)` → `--clr-growth-chart-label`                           |
| Capability score    | Roboto 18px Medium, `rgba(32, 204, 249, 1)` → `--clr-growth-capability-score`              |
| View report         | 12px Regular, `rgba(99, 104, 104, 1)` → `--clr-growth-view-report`                         |
| Weekly total        | Roboto 20px Medium, `rgba(21, 23, 23, 1)`                                                  |

### Principle decisions

| ID  | Area       | Decision                                                                                                                        |
| --- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Charts     | Emotion line chart / interaction bar chart / capability radar are CSS-only placeholders pending real chart library integration. |
| D2  | Title font | YouSheBiaoTiHei is added as a local-only font face with `font-weight: 400` fallback.                                            |
| D3  | Stats row  | Uses flexbox 3-column with 1px dividers instead of Quasar grid to match design's precise alignment.                             |

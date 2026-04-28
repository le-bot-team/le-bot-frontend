# Design Token Quick Reference

> Extracted from Blue Lake raw/parsed JSONs. Verified against auth module (登录认证).

## Typography

| Role                 | Size | Weight        | Line Height | Color                 | Font           |
| -------------------- | ---- | ------------- | ----------- | --------------------- | -------------- |
| Slogan (entry page)  | 20px | 500 (Medium)  | 28px        | `rgba(18,14,44,1)`    | AlibabaPuHuiTi |
| Slogan (sub pages)   | 15px | 500 (Medium)  | 22px        | `rgba(21,23,23,1)`    | AlibabaPuHuiTi |
| Body text            | 15px | 400 (Regular) | 22px        | `rgba(21,23,23,1)`    | AlibabaPuHuiTi |
| Button text          | 17px | 500 (Medium)  | 24px        | `rgba(255,255,255,1)` | AlibabaPuHuiTi |
| Weak button text     | 17px | 400 (Regular) | 24px        | `rgba(99,104,104,1)`  | AlibabaPuHuiTi |
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
| Weak (最大按钮弱化) | 311px | 56px   | 28px   | transparent              | `1px solid rgba(33,186,69,1)` | `rgba(99,104,104,1)`  |

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

```
linear-gradient(
  180deg,
  rgba(216, 244, 255, 1) 0%,      // #D8F4FF  light blue
  rgba(225, 255, 242, 1) 20.7%,   // #E1FFF2  light mint
  rgba(253, 255, 224, 1) 54.6%,   // #FDFFE0  light yellow
  rgba(255, 255, 255, 1) 100%      // #FFFFFF  white
)
```

## Brand Colors

| Name              | RGBA                  | Hex       | Usage                         |
| ----------------- | --------------------- | --------- | ----------------------------- |
| 品牌色/辅助色深紫 | `rgba(18,14,44,1)`    | `#120E2C` | Primary button background     |
| 链接色            | `rgba(32,204,249,1)`  | `#20CCF9` | Links, focus states           |
| 错误色            | `rgba(255,93,93,1)`   | `#FF5D5D` | Error messages, error borders |
| 弱化文字色        | `rgba(99,104,104,1)`  | `#636868` | Weak button text              |
| 占位符色          | `rgba(147,152,169,1)` | `#9398A9` | Placeholder text, icons       |
| 正文字色          | `rgba(21,23,23,1)`    | `#151717` | Body text                     |
| 边框/弱化色       | `rgba(33,186,69,1)`   | `#21BA45` | Weak button border            |

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

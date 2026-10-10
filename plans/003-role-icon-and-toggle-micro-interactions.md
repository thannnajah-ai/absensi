# 003 — Role Tab Icon Crossfade and Password Toggle Micro-Interactions

- **Status**: TODO
- **Commit**: 8288166
- **Severity**: LOW
- **Category**: Missed opportunities / Polish
- **Estimated scope**: 2 files (`css/components.css`, `js/views/login.js`)

## Problem

When the user switches tabs between "Siswa (NIS)" and "Admin / Guru", the sliding pill glides smoothly with `--ease-drawer`, but the identifier icon inside the input field (`#identifierIcon`) snaps abruptly from the user icon to the building icon. Similarly, clicking `#btnTogglePassword` to view/hide password instantly swaps the SVG icon without transition. This creates an uncoordinated visual seam where one part of the component moves smoothly while its dependent icon teleports.

```javascript
/* js/views/login.js:241 — current */
if (iconId) iconId.innerHTML = Icons.building(18);
// ...
if (iconId) iconId.innerHTML = Icons.user(18);
```

```javascript
/* js/views/login.js:267 — current */
if (btn) {
  btn.innerHTML = this.isPasswordVisible ? Icons.eyeOff(18) : Icons.eye(18);
}
```

## Target

Apply a subtle 160ms scale-and-crossfade transition on `#identifierIcon` and `#btnTogglePassword`:

```css
/* css/components.css — target */
.login-input-icon-btn,
.login-input-icon-static {
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), opacity 160ms cubic-bezier(0.23, 1, 0.32, 1), color 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.login-input-icon-btn.icon-morphing,
.login-input-icon-static.icon-morphing {
  opacity: 0;
  transform: scale(0.8);
}
```

```javascript
/* js/views/login.js — target helper */
  static morphIcon(el, newHtml) {
    if (!el) return;
    el.classList.add('icon-morphing');
    setTimeout(() => {
      el.innerHTML = newHtml;
      el.classList.remove('icon-morphing');
    }, 80);
  }
```

## Repo conventions to follow

- Uses `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` token.
- Minimal vanilla JavaScript helper without external dependencies.

## Steps

1. In `css/components.css`, update `.login-input-icon-btn` and define `.login-input-icon-static` with transition on `transform, opacity, color`.
2. In `css/components.css`, add the `.icon-morphing` class (`opacity: 0; transform: scale(0.8);`).
3. In `js/views/login.js`, add the `static morphIcon(el, newHtml)` method.
4. In `js/views/login.js:setTab`, replace direct `iconId.innerHTML = ...` with `this.morphIcon(iconId, ...)`.
5. In `js/views/login.js:togglePassword`, replace direct `btn.innerHTML = ...` with `this.morphIcon(btn, ...)`.

## Boundaries

- Do NOT alter input field borders, paddings, or widths.
- Do NOT alter password visibility state management.

## Verification

- **Mechanical**: Run `node -c js/views/login.js` to ensure clean syntax.
- **Feel check**:
  - Click "Admin / Guru" tab: observe the left icon smoothly fade-scale into the building icon in sync with the sliding pill.
  - Click the eye icon: observe the eye icon smoothly swap with a tactile micro-zoom.
- **Done when**: Icon swaps occur with a seamless 160ms crossfade rather than a harsh pop.

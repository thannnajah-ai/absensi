# 001 — Target Error Shake to Form and Smooth Banner Reveal

- **Status**: DONE
- **Commit**: 8288166
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Missed opportunities
- **Estimated scope**: 2 files (`js/views/login.js`, `css/components.css`)

## Problem

Currently, when login validation fails (empty credentials or invalid password), `triggerShake()` shakes the entire 960px split-screen container (`#loginSplitCard`). This shakes the branding panel, school badge, live clock, and background aurora mesh unnecessarily. Physical restraint requires that only the element failing validation (`#loginForm`) should shake. Furthermore, `#loginErrorBanner` appears abruptly via `display: flex`, popping into view without transition and abruptly displacing the form layout.

```javascript
/* js/views/login.js:405 — current */
  static triggerShake() {
    const card = document.getElementById('loginSplitCard');
    if (card) {
      card.classList.remove('shake-card');
      void card.offsetWidth;
      card.classList.add('shake-card');
      setTimeout(() => card.classList.remove('shake-card'), 500);
    }
  }
```

```html
<!-- js/views/login.js:106 — current -->
<div id="loginErrorBanner" style="display: ${this.errorMessage ? 'flex' : 'none'}; background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; padding: 10px 14px; border-radius: var(--radius-input); margin-bottom: 16px; font-size: 0.82rem; align-items: flex-start; gap: 8px;">
```

## Target

1. `triggerShake()` targets `#loginForm` instead of `#loginSplitCard`.
2. `#loginErrorBanner` transitions into view smoothly with a 200ms `--ease-out` opacity fade and a subtle 4px vertical expansion, preventing jarring layout pops.

```javascript
/* js/views/login.js — target */
  static triggerShake() {
    const form = document.getElementById('loginForm');
    if (form) {
      form.classList.remove('shake-form');
      void form.offsetWidth;
      form.classList.add('shake-form');
      setTimeout(() => form.classList.remove('shake-form'), 450);
    }
  }
```

```css
/* css/components.css — target */
.shake-form {
  animation: horizontalFormShake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes horizontalFormShake {
  10%, 90% { transform: translate3d(-3px, 0, 0); }
  20%, 80% { transform: translate3d(4px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
  40%, 60% { transform: translate3d(5px, 0, 0); }
}

.login-error-banner {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin-bottom: 16px;
  font-size: 0.82rem;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
  overflow: hidden;
  padding-top: 0;
  padding-bottom: 0;
  border-width: 0;
  transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 200ms cubic-bezier(0.23, 1, 0.32, 1), max-height 200ms ease, padding 200ms ease;
}

.login-error-banner.visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 100px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-width: 1px;
}
```

## Repo conventions to follow

- Easing curves use the token `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`.
- Reusable component classes live in `css/components.css`.
- View markup and handlers live in `js/views/login.js`.

## Steps

1. In `css/components.css`, replace `.shake-card` and `@keyframes horizontalShake` with `.shake-form` and `@keyframes horizontalFormShake`.
2. In `css/components.css`, add the `.login-error-banner` and `.login-error-banner.visible` classes with hardware-accelerated opacity and subtle height transition.
3. In `js/views/login.js`, update `#loginErrorBanner` to use class `login-error-banner` (with class `visible` if `this.errorMessage` is present).
4. In `js/views/login.js`, update `handleSubmit` and `setTab` error handling to toggle `.classList.add('visible')` and `.classList.remove('visible')` instead of changing `style.display`.
5. In `js/views/login.js`, update `triggerShake()` to find `#loginForm` and toggle `.shake-form`.

## Boundaries

- Do NOT touch `css/style.css`.
- Do NOT touch authentication logic in `DB.authenticate`.
- Do NOT alter hero panel styling.

## Verification

- **Mechanical**: Run `node -c js/views/login.js` without errors.
- **Feel check**:
  - Open `https://absensigratis.vercel.app` (or local server).
  - Click "Masuk ke Sistem" with empty inputs.
  - Confirm: ONLY the form container shakes; the school badge, clock, and left hero remain rock-solid.
  - Confirm: The error banner smoothly unfurls downwards in 200ms without an abrupt layout jump.
- **Done when**: Validation errors trigger a localized form shake and a fluid error banner reveal.

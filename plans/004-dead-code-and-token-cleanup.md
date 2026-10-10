# 004 — Clean Dead Code and Consolidate Motion Tokens

- **Status**: TODO
- **Commit**: 8288166
- **Severity**: LOW
- **Category**: Performance / Cohesion & tokens
- **Estimated scope**: 1 file (`css/components.css`)

## Problem

In `css/components.css:1200`, `.login-exit-zoom` and its `@keyframes loginExitTransition` are unused leftovers from previous experiments. They use an untokenized cubic-bezier `cubic-bezier(0.4, 0, 0.2, 1)` and add bloat. In addition, in `css/components.css:1053`, `.btn-login-submit` has hardcoded `background 0.3s ease, box-shadow 0.3s ease`, which does not use the design system's `--motion-standard` (220ms) and `--ease-out` tokens.

```css
/* css/components.css:1200 — current */
.login-exit-zoom {
  animation: loginExitTransition 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes loginExitTransition {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.97) translateY(-12px); }
}
```

```css
/* css/components.css:1053 — current */
.btn-login-submit {
  /* ... */
  transition: transform 160ms var(--ease-out), width 0.38s var(--ease-drawer), background 0.3s ease, border-radius 0.38s var(--ease-drawer), box-shadow 0.3s ease;
}
```

## Target

Remove `.login-exit-zoom` and unify all button property transitions with existing motion tokens:

```css
/* css/components.css:1053 — target */
.btn-login-submit {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%);
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition:
    transform var(--motion-fast) var(--ease-out),
    width 0.38s var(--ease-drawer),
    background-color var(--motion-standard) var(--ease-out),
    border-radius 0.38s var(--ease-drawer),
    box-shadow var(--motion-standard) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.28);
  position: relative;
  overflow: hidden;
  margin: 10px auto 0 auto;
}
```

## Repo conventions to follow

- Motion tokens live in `css/style.css`: `--motion-fast` (140ms), `--motion-standard` (220ms), `--ease-out`, `--ease-drawer`.
- No dead CSS rules or untracked legacy keyframes.

## Steps

1. In `css/components.css`, delete lines 1200 to 1207 (`.login-exit-zoom` and `@keyframes loginExitTransition`).
2. In `css/components.css`, update `.btn-login-submit` to use `--motion-standard` and `--ease-out` for `background-color` and `box-shadow`.

## Boundaries

- Do NOT touch button states (`.state-loading`, `.state-success`).
- Do NOT touch welcome card transition rules.

## Verification

- **Mechanical**: Search for `login-exit-zoom` in the repository and verify zero references remain.
- **Feel check**:
  - Hover and click `.btn-login-submit`: confirm hover elevation and background gradient glow transitions smoothly without sluggish delay.
- **Done when**: Dead CSS rules are pruned and submit button transitions strictly adhere to global tokens.

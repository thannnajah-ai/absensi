# 002 — Refine Reduced Motion to Preserve Essential Feedback

- **Status**: TODO
- **Commit**: 8288166
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file (`css/components.css`)

## Problem

In `css/components.css:1376`, `prefers-reduced-motion: reduce` sets `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important;` on all animated elements. While this eliminates motion sickness from translations and rotations, it also wipes out subtle opacity fades, focus rings, hover color transitions, and button state indications. Emil Kowalski's accessibility guideline states: *"Reduced motion means fewer and gentler animations, not zero — keep transitions that aid comprehension and state feedback, remove movement and position animations."*

```css
/* css/components.css:1376 — current */
@media (prefers-reduced-motion: reduce) {
  .login-split-card,
  .login-form-stagger > *,
  .aurora-orb,
  .login-hero-badge,
  .hero-clock-dot,
  .btn-login-submit,
  .welcome-transition-card,
  .welcome-transition-overlay,
  .dashboard-cascade-enter,
  .cascade-item-1,
  .cascade-item-2,
  .cascade-item-3,
  .cascade-item-4 {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Target

Keep `opacity` and color transitions active, but remove translation, scaling, floating, and drifting animations:

```css
/* css/components.css — target */
@media (prefers-reduced-motion: reduce) {
  .login-split-card,
  .login-form-stagger > *,
  .cascade-item-1,
  .cascade-item-2,
  .cascade-item-3,
  .cascade-item-4,
  .dashboard-cascade-enter {
    animation: simpleFade 200ms ease forwards !important;
    transform: none !important;
  }

  .aurora-orb,
  .login-hero-badge,
  .hero-clock-dot,
  .shake-form {
    animation: none !important;
    transform: none !important;
  }

  .btn-login-submit,
  .role-tab-btn,
  .btn-hero-action,
  .login-input-icon-btn {
    transform: none !important;
  }
}

@keyframes simpleFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Repo conventions to follow

- Media queries live at the bottom of `css/components.css`.
- Keyframes use descriptive lowerCamelCase naming.

## Steps

1. In `css/components.css`, replace the blanket duration-kill media query with the targeted `@media (prefers-reduced-motion: reduce)` block.
2. Add `@keyframes simpleFade` for non-moving, gentle opacity revelations.
3. Ensure button active states do not scale on reduced-motion, but maintain their color/border feedback.

## Boundaries

- Do NOT touch JavaScript files.
- Do NOT alter standard `@media (hover: hover)` blocks.

## Verification

- **Mechanical**: Inspect CSS syntax and verify no missing closing brackets.
- **Feel check**:
  - In Chrome/Edge DevTools, open the **Rendering** tab (Ctrl+Shift+P -> "Rendering").
  - Under **Emulate CSS media feature prefers-reduced-motion**, select **prefers-reduced-motion: reduce**.
  - Reload and test the login page.
  - Confirm: The card and form do NOT slide or scale from offsets, but fade in cleanly.
  - Confirm: Background aurora and levitating badges remain static, but clicking buttons still confirms click through clear color/state changes.
- **Done when**: Reduced motion eliminates spatial travel while retaining legible state transitions.

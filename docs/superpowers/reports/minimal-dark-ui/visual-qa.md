# Actual React synthetic preview QA

Boundary: ignored fixture imports real GameLibrary/index.css and stubs only hook/API imports, without a backend proxy. Seven synthetic games, two synthetic Steam profiles, original SVG sample artwork; all account mutations reject and launch returns preview-only failure. Production gate/bootstrap untouched. Not native Photino certification.

## Controller checks

- Desktop 1200 x 800, standard grid: three columns, persistent actions within first viewport, flat chrome, muted sidebar, missing-cover monogram identifiable and long title truncates while title/actions remain usable.
- Compact 640 x 800, list: search wraps into its own toolbar row; sidebar retains a separately scrollable filter pane; content list and Details/Play/Install remain inside viewport with no visible horizontal clipping; long title truncates safely. AX confirms each metadata area belongs to body details action, buttons remain siblings.
- Resize screenshot taken immediately after viewport change initially reflected previous paint; separate subsequent screenshot confirmed actual compact rendering. No production issue/fix was inferred from that snapshot timing.

- Compact 640 x 800 grid: two covers, monogram and long-title handling remain readable; main content scrolls for actions below first viewport.
- Desktop actual details: flat opaque panel, path and two profile-specific Launch/Switch & Play actions visible; Escape dismisses. No launch submitted.
- Desktop conflict selector: two profiles, active label, explicit hot-swap warning and Close visible; Close cancels without submitting.
- Accounts manager desktop and 640 x 800: platform selections, Refresh, Capture Active, Add Profile, rename/remove icon labels, session state, View in Library and Switch/Done remain reachable. Long profile name wraps while actions remain within panel.
- Manual-add form: both text fields have visible/accessibility labels, selected platform is exposed, empty required name disables Add Profile. Escape closes without submitting.
- Remove confirmation: explicit local-backup deletion warning and distinct destructive button preserved. Cancel only; no deletion submitted.

Observation to final reviewer: AX reports page focus after controlled-dialog dismissal rather than originating button. Existing Radix components are programmatically controlled without DialogTrigger; judge whether new body-details routing creates a keyboard regression and whether current tests actually cover restoration. Do not infer native focus behavior from browser AX alone.

Confirmed browser keyboard reproduction on committed 064f297: actual list body `Open details for Hades` focused/Enter -> details initial focus Launch -> Escape -> readonly document.activeElement is BODY, aria-label null. Final reviewer confirms app wiring lacks DialogTrigger/onCloseAutoFocus restoration; primitive Trigger test does not cover new path. Await consolidated final findings before a single fix wave.

- Committed source 064f297 reloaded after implementer finished: desktop list 1200 x 800 is flat, readable and retains profile/status/actions. Browser captured error/warn logs returns empty array.

Final committed d8cce0d keyboard checks: grid Hades body Enter -> Escape returns focus to DIV aria-label Open details for Hades; list Hades body Enter -> footer Close returns the same named body; Accounts keyboard activation -> Add Profile keyboard activation -> Escape returns Add Profile -> manager Escape returns toolbar Accounts. Readonly DOM active-element checks confirm each. No launch or account mutation submitted. Viewport override reset and synthetic preview marked deliverable.

Residual: scoped re-review found unfocused/programmatic DialogTrigger compatibility edge, not a current app controlled-path failure; production has no Trigger consumers. Native, exhaustive geometry and live screen-reader checks remain unverified as disclosed.

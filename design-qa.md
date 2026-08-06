# 日序 · Design QA

final result: passed

## Comparison target

- Source visual truth:
  - `C:\Users\刘梦竹\.codex\generated_images\019fd055-775c-7ba1-8b0d-943b20aa7b95\exec-e6b3ae40-d197-4d58-beac-9b1db5ef02b6.png`
  - `C:\Users\刘梦竹\.codex\generated_images\019fd055-775c-7ba1-8b0d-943b20aa7b95\exec-360f6194-28bd-4c0a-bdec-1e0eddd33b14.png`
  - Mobile layout reference: `C:\Users\刘梦竹\.codex\generated_images\019fd055-775c-7ba1-8b0d-943b20aa7b95\exec-23fc368e-bfd8-4ba2-8da6-af95fd464733.png`
- Final implementation screenshots:
  - `C:\Users\刘梦竹\.codex\visualizations\2026\08\05\019fd055-775c-7ba1-8b0d-943b20aa7b95\rizu-final-desktop.png`
  - `C:\Users\刘梦竹\.codex\visualizations\2026\08\05\019fd055-775c-7ba1-8b0d-943b20aa7b95\rizu-final-composer.png`
  - `C:\Users\刘梦竹\.codex\visualizations\2026\08\05\019fd055-775c-7ba1-8b0d-943b20aa7b95\rizu-final-mobile.png`
  - `C:\Users\刘梦竹\.codex\visualizations\2026\08\05\019fd055-775c-7ba1-8b0d-943b20aa7b95\rizu-final-mobile-drawer.png`
- Combined comparison evidence:
  - `C:\Users\刘梦竹\.codex\visualizations\2026\08\05\019fd055-775c-7ba1-8b0d-943b20aa7b95\rizu-final-desktop-compare.png`
  - `C:\Users\刘梦竹\.codex\visualizations\2026\08\05\019fd055-775c-7ba1-8b0d-943b20aa7b95\rizu-final-mobile-compare.png`

## Viewport and normalization

- Desktop source: 1484 × 1060 px, normalized to 1485 × 1060 for a 1 px width difference.
- Desktop implementation: 1485 × 1060 CSS px, deviceScaleFactor 1.
- Mobile source: 853 × 1844 px, normalized to 393 × 852.
- Mobile implementation: 393 × 852 CSS px, deviceScaleFactor 1.
- State: 分类“论文” / 每日；2 条未完成、1 条已完成并折叠。生产数据仍为空，QA 数据仅存在于隔离的 Edge 测试配置中。

## Full-view comparison evidence

- Layout: desktop sidebar width, main content start, title position, tab baseline, add-control origin, task dividers and edit controls align with the selected visual.
- Spacing: the final task rows are 129 px tall on desktop, matching the reference rhythm; mobile uses a denser 104 px row appropriate to the narrow viewport.
- Typography: system Chinese sans stack, title hierarchy, navigation weight and task/date scale match the reference closely without loading an external font.
- Colors: pure white canvas, cool gray sidebar, graphite selection block, gray hairlines and restrained semantic red use the approved tokens.
- Icons: visible UI icons use one Tabler outline family with consistent 1.1–1.55 strokes. The PWA notebook icon is also sourced from Tabler.
- Copy: above-the-fold app copy, navigation labels, tabs, task copy and completed label match. No production demo items are shipped.

## Focused interaction evidence

- Add control rest state is a backgroundless thin plus.
- Click starts a 220 ms graphite ink-circle bloom; the composer begins 40 ms later and completes its 240 ms horizontal fade/expand.
- Expanded composer uses a white surface and one graphite bottom rule, with title, required date, optional time, save and cancel controls.
- `prefers-reduced-motion` reduces all motion to 1 ms.
- Mobile keeps the same top add control and exposes the full sidebar through a hamburger drawer; no bottom navigation is introduced.

## Required fidelity surfaces

- Fonts and typography: passed. No clipping, accidental wrapping or browser-default body typography remains.
- Spacing and layout rhythm: passed. Sidebar group rhythm, task heights, divider positions and content bounds match the approved desktop composition; mobile has no horizontal overflow.
- Colors and visual tokens: passed. All primary surfaces and emphasis colors map to the approved white/cool-gray/graphite palette.
- Image quality and asset fidelity: passed. The interface contains no content imagery; all icons are library vectors and PWA PNGs were rendered from the same library source.
- Copy and content: passed. The old mobile reference’s “添加事项” text button is intentionally replaced by the later-approved naked top plus.

## Comparison history

### Iteration 1

- [P2] Desktop navigation and task rhythm were too compact.
  - Fix: increased desktop group spacing, navigation row height, composer origin and task row height.
  - Post-fix evidence: task divider positions and plus origin now align with the desktop source.
- [P2] The ink bloom could be cut off when the closed button unmounted.
  - Fix: moved the bloom into a persistent `NakedAdd` component and delayed composer activation by 40 ms.
  - Post-fix evidence: automated focus check passes after the completed motion, and the bloom remains mounted for its 220 ms duration.

### Iteration 2

- [P2] Sidebar/task type was optically smaller and the category group rhythm drifted.
  - Fix: adjusted brand, navigation, task, date and completed-label type sizes; tuned category row height and group gap.
  - Post-fix evidence: final side-by-side desktop comparison has matching hierarchy and near-matching text density.

### Final pass

- No actionable P0, P1 or P2 findings remain.
- Intentional deviation: the QA date is 2026-08-06, so 8月5日未完成事项 correctly display the specified overdue red; the reference was created on 2026-08-05.
- P3 follow-up only: native Edge date/time fields use system-local numeric formatting in the expanded editor instead of the concept’s typeset date shorthand.

## Functional and browser verification

- Browser: Microsoft Edge headless via CDP because the Browser plugin was not available; the user-selected Edge engine was preserved.
- Page identity, nonblank content, selected route and title: passed.
- Add, complete, category period reset and reload-to-global-daily flows: passed.
- Console errors/warnings: none.
- Production Service Worker: activated.
- Offline reload: passed; title “日序”, heading “每日”, route `#/daily`.

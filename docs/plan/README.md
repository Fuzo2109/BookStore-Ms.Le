# Group 4 – Daily work plan (03/11 → 17/11/2026)

Built from `Group4_MasterPlan.xlsx` (task IDs and dates) and the HK261 SPM Final Project brief. Source-defined deadlines are fixed; other dates are the Masterplan's proposals. Status as of **03/11/2026**: Sprint 1 done; F1–F5 and CR-04 code is merged on `main` and live at https://book-store-ms-le.vercel.app – remaining work is **AC test evidence, CR-04 process documents, UAT, release and closure**.

## Team and roles

| Member | Role |
|---|---|
| Le Tan Nguyen | Product Owner · Sprint 2 Leader |
| Tran Minh Khoa | Developer · Sprint 3 Leader · closure coordinator* |
| Vo Ngoc Phu | Developer · Sprint 1 Leader · workbook owner* |

Sprint Leaders: Sprint 1 – Vo Ngoc Phu · Sprint 2 – Le Tan Nguyen · Sprint 3 – Tran Minh Khoa. Product Owner (fixed): Le Tan Nguyen.

\* **Assumptions to confirm:** Khoa (Sprint 3 Leader) also coordinates closure 13–17/11; Phu owns the Excel workbook and EVM. Hour estimates are proposals – the Masterplan has no hour figures; confirm them in Sprint Planning.

## Key dates

| Date | Event |
|---|---|
| Thu 05/11 | 23:59 – Sprint 2 submission |
| Fri 06/11 | In class – Sprint Review 2 + Retro |
| Thu 12/11 | 23:59 – Sprint 3 submission |
| Fri 13/11 | In class – Sprint Review 3 + UAT |
| Sun 15/11 | 23:59 – FINAL submission |
| Tue 17/11 | 07:00 – Final presentation (exam) |

## Catch-up needed today (03/11)

- **S2-03 CCB decision** and **CR04-01** are overdue (Masterplan: 30/10–02/11). PRs #1–#3 containing CR-04 code were merged before a written CCB record – record the decision now and log this as an issue.
- Masterplan rows MP-001…S2-02 show “Done” but 0 % complete – update the % column.

## Days

| Date | Sprint | Coordinator | Tasks |
|---|---|---|---|
| [Tue 03/11](daily/2026-11-03.md) | Sprint 2 | Le Tan Nguyen | S2-03, CR04-01, S2-04, S2-05, S2-06/07/08, S2-09/10, CR04-02..05, CR04-06, S2-13, S2-12 |
| [Wed 04/11](daily/2026-11-04.md) | Sprint 2 | Le Tan Nguyen | S2-04, S2-05, S2-06/07/08, S2-09/10, CR04-02..05, CR04-06, S2-11, CR04-07, S2-13, S2-14, S2-15, S2-12 |
| [Thu 05/11](daily/2026-11-05.md) | Sprint 2 | Le Tan Nguyen | CR04-07, S2-15, S2-12 |
| [Fri 06/11](daily/2026-11-06.md) | Sprint 3 | Tran Minh Khoa | S2-16, S3-01 |
| [Sat 07/11](daily/2026-11-07.md) | Sprint 3 | Tran Minh Khoa | S3-02/03, S3-04/05 |
| [Sun 08/11](daily/2026-11-08.md) | Sprint 3 | Tran Minh Khoa | S3-02/03, S3-04/05 |
| [Mon 09/11](daily/2026-11-09.md) | Sprint 3 | Tran Minh Khoa | S3-02/03, S3-04/05, S3-06, S3-07 |
| [Tue 10/11](daily/2026-11-10.md) | Sprint 3 | Tran Minh Khoa | S3-02/03, S3-04/05, S3-06, S3-07, S3-08, S3-09 |
| [Wed 11/11](daily/2026-11-11.md) | Sprint 3 | Tran Minh Khoa | S3-06, S3-07, S3-08, S3-09, S3-11, S3-12 |
| [Thu 12/11](daily/2026-11-12.md) | Sprint 3 | Tran Minh Khoa | S3-08, S3-09, S3-11, S3-12 |
| [Fri 13/11](daily/2026-11-13.md) | Closure | Tran Minh Khoa | S3-10, S3-13, CL-01, CL-02, CL-03, CL-04, CL-05 |
| [Sat 14/11](daily/2026-11-14.md) | Closure | Tran Minh Khoa | CL-01, CL-02, CL-03, CL-04, CL-05, CL-06, CL-07, CL-08, CL-09, CL-10 |
| [Sun 15/11](daily/2026-11-15.md) | Closure | Tran Minh Khoa | CL-03, CL-04, CL-05, CL-06, CL-07, CL-08, CL-09, CL-10, CL-11, CL-12 |
| [Mon 16/11](daily/2026-11-16.md) | Closure | Tran Minh Khoa | CL-12 |
| [Tue 17/11](daily/2026-11-17.md) | Closure | Tran Minh Khoa | CL-13 |

## All tasks

| ID | Task | Owner | Support | Start | Due | Est. h* |
|---|---|---|---|---|---|---|
| S2-03 | CCB decision record for CR-04 | Le Tan Nguyen | Tran Minh Khoa | 03/11 | 03/11 | 2 |
| CR04-01 | Confirm CR-04 scope, affected features and AC | Le Tan Nguyen |  | 03/11 | 03/11 | 1 |
| S2-04 | Baseline update after CR-04 approval | Le Tan Nguyen | Tran Minh Khoa | 03/11 | 04/11 | 3 |
| S2-05 | Communicate CCB decision to stakeholders | Le Tan Nguyen |  | 03/11 | 04/11 | 1 |
| S2-06/07/08 | Verify F2 – book data, categories/authors, validation (code already on main) | Tran Minh Khoa |  | 03/11 | 04/11 | 5 |
| S2-09/10 | Verify F3 – book list, 12/page, newest first, responsive | Vo Ngoc Phu |  | 03/11 | 04/11 | 4 |
| CR04-02..05 | Verify CR-04 upload, storage, thumbnail, default image | Tran Minh Khoa | Vo Ngoc Phu | 03/11 | 04/11 | 3 |
| CR04-06 | CR-04 performance: 30 books with covers load < 2 s | Vo Ngoc Phu |  | 03/11 | 04/11 | 3 |
| S2-13 | Risk register and issue log update | Vo Ngoc Phu | Tran Minh Khoa, Le Tan Nguyen | 03/11 | 04/11 | 2 |
| S2-12 | Daily monitoring: board, burndown, actual hours | Le Tan Nguyen | All members | 03/11 | 05/11 | 1 |
| S2-11 | Compile F2/F3 + CR-04 test cases into the Sprint 2 report | Le Tan Nguyen | Tran Minh Khoa, Vo Ngoc Phu | 04/11 | 04/11 | 2 |
| S2-14 | Weekly Status Report (Green/Amber/Red) | Le Tan Nguyen |  | 04/11 | 04/11 | 1.5 |
| CR04-07 | CR-04 documentation + CCB evidence | Le Tan Nguyen |  | 04/11 | 05/11 | 2 |
| S2-15 | Submit Sprint 2 files (deadline 23:59 Thu 05/11) | Le Tan Nguyen |  | 04/11 | 05/11 | 2 |
| S2-16 | Sprint Review 2 + Retrospective (in class) | Le Tan Nguyen | All members | 06/11 | 06/11 | 2 |
| S3-01 | Sprint Planning 3 (≤ 45 min) | Tran Minh Khoa | All members | 06/11 | 06/11 | 1.5 |
| S3-02/03 | Verify F4 – detail page, missing ID, Back to same list page | Tran Minh Khoa |  | 07/11 | 10/11 | 4 |
| S3-04/05 | Verify F5 – search title/author, category + price filters with pagination | Vo Ngoc Phu |  | 07/11 | 10/11 | 5 |
| S3-06 | Regression tests F1–F3 (+ CR-04) | All members | Tran Minh Khoa, Le Tan Nguyen, Vo Ngoc Phu | 09/11 | 11/11 | 4 |
| S3-07 | Non-functional evidence | Vo Ngoc Phu | Tran Minh Khoa | 09/11 | 11/11 | 3 |
| S3-08 | Release v1.0: tag + release notes | Tran Minh Khoa | All members | 10/11 | 12/11 | 2 |
| S3-09 | UAT scripts mapped to every Acceptance Criterion | Le Tan Nguyen | Tran Minh Khoa, Vo Ngoc Phu | 10/11 | 12/11 | 4 |
| S3-11 | Collect closure data | Tran Minh Khoa | All members | 11/11 | 12/11 | 2 |
| S3-12 | Submit Sprint 3 files (deadline 23:59 Thu 12/11) | Tran Minh Khoa |  | 11/11 | 12/11 | 2 |
| S3-10 | UAT session with the customer (in class) | Le Tan Nguyen | Tran Minh Khoa, Vo Ngoc Phu | 13/11 | 13/11 | 2 |
| S3-13 | Sprint Review 3 + Retrospective (in class) | Tran Minh Khoa | All members | 13/11 | 13/11 | 2 |
| CL-01 | Hosting check + demo accounts | Vo Ngoc Phu |  | 13/11 | 14/11 | 1.5 |
| CL-02 | Final PMP update (c1_ProjectPlan_Final.docx) | Le Tan Nguyen | Tran Minh Khoa | 13/11 | 14/11 | 3 |
| CL-03 | Finalise cumulative workbook | Vo Ngoc Phu | Tran Minh Khoa | 13/11 | 15/11 | 3 |
| CL-04 | Final Report – results of each Sprint | Tran Minh Khoa | Vo Ngoc Phu, Le Tan Nguyen | 13/11 | 15/11 | 4 |
| CL-05 | Plan vs actual + EVM | Vo Ngoc Phu | Tran Minh Khoa | 13/11 | 15/11 | 3 |
| CL-06 | Risks and changes summary + closure checklist | Le Tan Nguyen | Tran Minh Khoa | 14/11 | 15/11 | 2 |
| CL-07 | Lessons Learned (≥ 5) | All members | Tran Minh Khoa, Le Tan Nguyen, Vo Ngoc Phu | 14/11 | 15/11 | 2 |
| CL-08 | Appendices: links + AI usage declaration | Vo Ngoc Phu |  | 14/11 | 15/11 | 1.5 |
| CL-09 | Final consistency + file-name check | Tran Minh Khoa | All members | 14/11 | 15/11 | 2 |
| CL-10 | 360° peer evaluation (each member) | All members | Tran Minh Khoa, Le Tan Nguyen, Vo Ngoc Phu | 14/11 | 15/11 | 0.5 |
| CL-11 | FINAL SUBMISSION (deadline 23:59 Sun 15/11) | Tran Minh Khoa | All members | 15/11 | 15/11 | 1 |
| CL-12 | Prepare final presentation + demo video | All members | Tran Minh Khoa, Le Tan Nguyen, Vo Ngoc Phu | 15/11 | 16/11 | 4 |
| CL-13 | Final presentation – 07:00 Tue 17/11 | All members | Tran Minh Khoa, Le Tan Nguyen, Vo Ngoc Phu | 17/11 | 17/11 | 1 |

## Proposed owned hours (03–17/11, excluding support)

| Member | Hours |
|---|---|
| Le Tan Nguyen | 32.3 |
| Tran Minh Khoa | 32.3 |
| Vo Ngoc Phu | 29.8 |


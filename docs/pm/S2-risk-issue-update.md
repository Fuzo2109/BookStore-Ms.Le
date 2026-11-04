# Sprint 2 – Risk register and Issue Log update (S2-13)

Owner: Vo Ngoc Phu · Prepared 04/11/2026 · Copy these rows into the **Risk Register** and **Issue Log** sheets of
`c2_SprintBacklog_S2.xlsx`, next to the ≥ 8 risks already in risk register v1.0.

The existing v1.0 risks are in the team workbook (not in this repository) – review each of them as well and
update its **Status** (Open / Monitoring / Occurred → Issue / Closed). Scale: Probability (P) and Impact (I) 1–5,
Score = P × I.

## New risks identified in Sprint 2

| ID | Risk (cause → event → effect) | P | I | Score | Strategy | Response | Owner | Trigger | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-S2-01 | Supabase free project is **paused after 7 days without activity** → site and DB offline → lecturer cannot open the hosted site (B9) | 3 | 5 | 15 | Mitigate | Open the site every 2–3 days until 17/11; CL-01 smoke test on 13–14/11; know how to press "Restore" in the dashboard | Vo Ngoc Phu | No visit for 5 days / Supabase pause e-mail | Open |
| R-S2-02 | Code merged to `main` before the related CCB decision is recorded → process non-compliance in CR control (B10) | 4 | 3 | 12 | Mitigate | PR template requires CCB reference for CR work; reviewer checks it | Le Tan Nguyen | PR touches CR scope without CCB link | **Occurred → I-S2-01** |
| R-S2-03 | Build depends on Google Fonts download → intermittent build failure (`next/font` error) → delayed deploy | 2 | 3 | 6 | Accept / Mitigate | Re-run the failed job; if it repeats, self-host the font files | Tran Minh Khoa | CI or Vercel build fails with `next/font` | **Occurred once → I-S2-02** |
| R-S2-04 | Vercel functions run far from the database (default US region vs DB in Mumbai) → list page > 2 s → NFR / CR-04 AC4 fail | 3 | 4 | 12 | Mitigate | Set Function Region to Mumbai (bom1); measure in CR04-06 | Vo Ngoc Phu | Any measured load ≥ 2 s | Open – measure 04/11 |
| R-S2-05 | Free-tier storage limit 1 GB → cover uploads fail later | 1 | 3 | 3 | Accept | 2 MB cap per cover + ~20 kB thumbnails → ~500 books fit; monitor Storage usage | Tran Minh Khoa | Storage > 700 MB | Open |
| R-S2-06 | Most implementation committed by one identity → individual factor cᵢ and "every member has commits" check | 3 | 4 | 12 | Mitigate | Every member opens their own PRs for tests, fixes and docs from 03/11; commits under own name | Le Tan Nguyen | A member with no commit by 08/11 | Open |
| R-S2-07 | Admin account password shared in a chat → account misuse | 2 | 4 | 8 | Mitigate | Change the admin password; never share secrets in chat (AGENTS.md rule) | Le Tan Nguyen | – | Open – change password |
| R-S2-08 | Book descriptions copied from a retailer website → copyright issue in the submitted product | 2 | 2 | 4 | Avoid | Use original descriptions (done for 35 seed books on 04/11); re-write the two hand-entered "Overview" descriptions in own words | Vo Ngoc Phu | Description pasted from another site | Open |

## Issue Log entries

| ID | Date | Issue | From risk | Impact | Action | Owner | Due | Status |
|---|---|---|---|---|---|---|---|---|
| I-S2-01 | 02–03/11 | PRs #1–#3 containing CR-04 code merged before the written CCB decision (S2-03 planned 01–02/11) | R-S2-02 | CR process order not followed; scope risk if CR were rejected | Record CCB decision with date and rationale; note the deviation in the CR form and as a Lesson Learned | Le Tan Nguyen | 04/11 | Open |
| I-S2-02 | 02/11 | CI build failed once on Google Fonts download (`next/font`), passed on re-run | R-S2-03 | ~5 min delay | Re-run; monitor | Tran Minh Khoa | – | Closed |
| I-S2-03 | 03/11 | Several Masterplan tasks planned 30/10–02/11 not started (S2-03, CR04-01…04, S2-06…10) | – | Sprint 2 compressed into 03–05/11 | Rescheduled in `docs/plan/`; daily follow-up by Sprint Leader | Le Tan Nguyen | 05/11 | Open |
| I-S2-04 | 03/11 | Supabase "Email signups are disabled" blocked registration until the setting was fixed | – | New customers could not register until the setting was fixed | Setting corrected; note in installation guide | Le Tan Nguyen | 03/11 | Closed |

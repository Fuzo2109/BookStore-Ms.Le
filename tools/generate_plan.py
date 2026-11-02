"""Generates docs/plan/* from one task list so every day file stays consistent.

Usage: python3 tools/generate_plan.py .   (edit the task list below, then re-run)
"""
import datetime as dt
import os
import sys

ROOT = sys.argv[1]
OUT = os.path.join(ROOT, "docs", "plan")
os.makedirs(os.path.join(OUT, "daily"), exist_ok=True)

K, N, P = "Tran Minh Khoa", "Le Tan Nguyen", "Vo Ngoc Phu"
ALL = "All members"
MEMBERS = [N, K, P]
ROLE = {
    N: "Product Owner · Sprint 2 Leader",
    K: "Developer · Sprint 3 Leader · closure coordinator*",
    P: "Developer · Sprint 1 Leader · workbook owner*",
}
TODAY = dt.date(2026, 11, 3)   # status date: days before this are a record of the past
START = dt.date(2026, 10, 23)
END = dt.date(2026, 11, 17)


def d(day, month=11):
    return dt.date(2026, month, day)


def sprint_of(day):
    if day <= d(29, 10):
        return "Sprint 1"
    if day <= d(5):
        return "Sprint 2"
    if day <= d(12):
        return "Sprint 3"
    return "Closure"


LEADER = {"Sprint 1": P, "Sprint 2": N, "Sprint 3": K, "Closure": K}

# (id, title, owner, support, start, end, est_h, steps, output, done_when, note)
T = []


def task(id, title, owner, start, end, est, steps, output, done, support="", note="", status="open", evidence=""):
    T.append(dict(id=id, title=title, owner=owner, support=support, start=start, end=end, est=est,
                  steps=steps, output=output, done=done, note=note, status=status, evidence=evidence))


def past(id, title, owner, start, end, role, output, done, support="", evidence="", note=""):
    """Sprint 1 / early Sprint 2 task recorded as Done in the Masterplan (status column)."""
    task(id, title, owner, start, end, None, [], output, done, support=support, note=note,
         status="done", evidence=evidence or "add link to the file / board card / PR")
    T[-1]["role"] = role


# ---------------- Sprint 1 (23/10 – 29/10) + early Sprint 2 – from the Masterplan, status "Done" ----------------
past("MP-001", "Kick-off and team working agreement", ALL, d(23, 10), d(23, 10), "Sprint Leader / all members",
     "Kick-off notes / working agreement",
     "Release 1.0 scope, team rules, availability, decision-making and escalation confirmed.")
past("MP-002", "Review and consolidate inherited artefacts (Lab 1–3, TA, Week 1–6)", N, d(23, 10), d(24, 10), "PO + Sprint Leader",
     "Inherited-artifact checklist", "List of what is reused and what changes.", support=P)
past("MP-003", "Update Project Charter (SMART objectives, scope, stakeholders, BAC approach)", N, d(23, 10), d(24, 10), "PO + Sprint Leader",
     "c1_ProjectPlan.docx – Charter", "Charter has milestones, budget approach/BAC, success criteria and Release 1.0 scope.", support=P)
past("MP-004", "Version-history table in every inherited document", ALL, d(23, 10), d(25, 10), "Document owners",
     "Version-history tables", "Each document identifies the previous version and the changes.")
past("MP-005", "Confirm F1–F5, non-functional requirements and out-of-scope items", N, d(23, 10), d(24, 10), "PO + Developers",
     "Release scope and AC checklist",
     "All five features; responsive UI, ≥ 30 books, list < 2 s, client/server validation, hashed passwords; cart/payment/social login excluded.",
     support=f"{K}, {P}")
past("MP-006", "Assign PO and Sprint Leader rotation", ALL, d(23, 10), d(24, 10), "All members",
     "Role assignment / Leader rotation", "PO: Le Tan Nguyen · Leaders: S1 Vo Ngoc Phu, S2 Le Tan Nguyen, S3 Tran Minh Khoa.")
past("MP-007", "Tailored Scrum events, timeboxes, artefacts", P, d(23, 10), d(25, 10), "Sprint Leader + PO",
     "PMP v1.0 – Scrum process", "Planning ≤ 45 min, Daily ≤ 10 min, Review + Retro 30 min on Friday; tailoring and risks recorded.", support=N)
past("MP-008", "PM board set up, lecturer invited as Reader", P, d(23, 10), d(24, 10), "Sprint Leader",
     "PM tool access evidence", "Every task has Original Estimate and Completed Work (hours).")
past("MP-009", "Team repository, branch strategy, PR process", P, d(23, 10), d(25, 10), "Developers + Leader",
     "Repository settings / initial CI list", "Lecturer invited; no direct commits to main; reviewed PRs and tags.", support=f"{K}, {N}",
     note="The GitHub repo held only a README until 02/11 (first code PR #1). Record this honestly if asked.")
past("MP-010", "Product Backlog v1.0 (≥ 15 INVEST user stories)", N, d(23, 10), d(25, 10), "PO + all members",
     "Product Backlog v1.0", "Ordered by value; MoSCoW, Story Points, Given–When–Then AC (main, exception, boundary), DoR.", support=f"{K}, {P}")
past("MP-011", "Planning Poker estimation + evidence", N, d(24, 10), d(25, 10), "PO + all members",
     "Planning Poker log", "Estimates and meeting record kept; capacity and expected velocity estimated.", support=f"{K}, {P}")
past("MP-012", "Release Plan (Sprint goals, allocation, velocity, PSP, BAC)", N, d(24, 10), d(26, 10), "PO + Sprint Leader",
     "Release plan and budget inputs", "Covers 23/10–17/11, 3 Sprints, PSP and BAC = planned hours × 200,000 VND.", support=P)
past("MP-013", "Quality plan: 3-level DoD and quality metrics", N, d(24, 10), d(26, 10), "Developers + PO",
     "PMP v1.0 – Quality Plan", "DoD for Story/Sprint/Release with evidence and checker; AC pass rate, defects by severity, reopened rate.",
     support=f"{K}, {P}")
past("MP-014", "Risk management plan + register (≥ 8 risks)", P, d(24, 10), d(26, 10), "Leader + all members",
     "Risk register v1.0", "P × I scale 1–5; response, owner, trigger, status.", support=f"{K}, {N}")
past("MP-015", "Configuration management plan", P, d(24, 10), d(26, 10), "Sprint Leader + Developers",
     "PMP v1.0 – Configuration Plan", "CI list, naming/versioning, branches, commits, baselines/tags, CR + CCB procedure.", support=f"{K}, {N}")
past("MP-016", "Communication plan + Scrum-event calendar", N, d(24, 10), d(26, 10), "PO + Sprint Leader",
     "PMP v1.0 – Communication Plan", "Stakeholder – information – channel – frequency – owner; response rules.", support=P)
past("MP-017", "Compile PMP v1.0 for Sponsor approval", P, d(26, 10), d(28, 10), "Sprint Leader + PO",
     "c1_ProjectPlan.docx (PMP v1.0)", "All seven parts; consistent with Product Backlog, Release Plan and board.", support=N)
past("S1-01", "Sprint Planning 1 (Excel S1_Backlog → board)", P, d(24, 10), d(25, 10), "Sprint Leader + all members",
     "c2_SprintBacklog_S1.xlsx – S1_Backlog", "Sprint Goal, capacity, items, tasks ≤ 1 person-day with owners and hours.", support=f"{K}, {N}")
past("S1-02", "F1 – registration, login, logout", ALL, d(24, 10), d(28, 10), "Developers",
     "F1 code + test evidence", "Customer can register and log in; invalid input handled safely.",
     note="In this repository F1 code arrived with PR #1 (02/11). Link where the Sprint 1 demo code lived.")
past("S1-03", "F1 – admin creates and locks accounts", ALL, d(25, 10), d(28, 10), "Developers",
     "F1 code + test evidence", "Admin can create/lock accounts; locked accounts cannot sign in.")
past("S1-04", "F1 – roles and authorization (Administrator, Customer)", ALL, d(25, 10), d(28, 10), "Developers",
     "F1 authorization tests", "Non-admins cannot reach admin functions (server-side); passwords hashed.")
past("S1-05", "Daily monitoring: board, burndown, Daily Scrum log, actual hours", P, d(24, 10), d(29, 10), "All members; Leader checks",
     "PM board / daily log / burndown", "Every task has Original Estimate and Completed Work; variances recorded.", support=f"{K}, {N}")
past("S1-06", "F1 test cases from the AC", ALL, d(26, 10), d(28, 10), "Test owners / Developers",
     "F1 test cases in Sprint Report", "≥ 1 test case per F1 AC with expected and actual result.")
past("S1-07", "Log Sponsor's CR-04 in the Change Log (issued Tue 27/10)", N, d(27, 10), d(27, 10), "PO + Sprint Leader",
     "Change Log entry – CR-04", "CR-04 recorded during Sprint 1; original request preserved.", support=P)
past("S1-08", "Submit Sprint 1 files (23:59 Thu 29/10)", P, d(28, 10), d(29, 10), "Sprint Leader",
     "S1 submission checklist", "c1_ProjectPlan, c2_SprintBacklog_S1, c3_SprintReport_S1, c0_Eval_S1 uploaded individually.")
past("S1-09", "Sprint Review 1 + Retrospective (in class)", P, d(30, 10), d(30, 10), "Sprint Leader presents; all members",
     "S1 report / review evidence / retro actions", "Demo against AC, burndown, hours, risks; ≥ 2 retro actions tracked in Sprint 2.",
     support=f"{K}, {N}")
past("S2-01", "Sprint Planning 2 using actual Sprint 1 velocity", N, d(30, 10), d(30, 10), "Sprint Leader + all members",
     "S2_Backlog in cumulative workbook", "Items sized with observed velocity; Excel backlog then PM tool.", support=f"{K}, {P}")
past("S2-02", "CR-04 impact analysis (scope, schedule, cost, quality, risk)", N, d(30, 10), d(1), "PO + Sprint Leader + Developers",
     "c4_ChangeRequest_CR04.docx – impact analysis", "Quantified with SP, hours, cost (200,000 VND/h) and ≥ 2 options.",
     support=f"{K}, {P}")

# Masterplan items whose original window started before 03/11 but are still "Not Started" → rescheduled.
RESCHEDULED = [
    ("CR04-01", d(30, 10), d(30, 10), d(3)), ("CR04-02", d(31, 10), d(2), d(3)), ("S2-06", d(31, 10), d(3), d(3)),
    ("S2-07", d(31, 10), d(3), d(3)), ("S2-09", d(31, 10), d(3), d(3)), ("S2-08", d(1), d(4), d(3)),
    ("S2-10", d(1), d(4), d(3)), ("S2-03", d(1), d(2), d(3)), ("CR04-03", d(1), d(2), d(3)),
    ("S2-04", d(2), d(3), d(3)), ("S2-05", d(2), d(3), d(3)), ("S2-11", d(2), d(4), d(4)),
    ("S2-13", d(2), d(4), d(3)), ("CR04-04", d(2), d(3), d(3)), ("S2-12", d(30, 10), d(5), d(3)),
]


# ---------------- Sprint 2 (remaining: 03/11 – 06/11) ----------------
task("S2-03", "CCB decision record for CR-04", N, d(3), d(3), 2,
     ["Record the CCB decision (PO + Sprint Leader + Sponsor): Approve / Reject / Defer, with rationale, impact and conditions.",
      "Note honestly that PRs #1–#3 (which include CR-04 code) were merged on 02–03/11 before the written CCB record; explain this in the Change Log and as an issue/lesson.",
      "Link the at-least-2 options presented (e.g. A: upload + thumbnail now; B: defer to Release 1.1)."],
     "CCB decision record (in c4_ChangeRequest_CR04.docx + ChangeLog sheet)",
     "Decision, date, attendees, rationale and conditions are written down and agreed by the Sponsor.",
     support=K, note="Overdue – Masterplan date was 01–02/11.")
task("CR04-01", "Confirm CR-04 scope, affected features and AC", N, d(3), d(3), 1,
     ["Confirm affected features F2/F3/F4, AC1–AC5 from the CR form, and constraints (Supabase Storage 1 GB, Vercel 4.5 MB body limit – see README).",
      "Add CR-04 AC1–AC5 to the Product Backlog items for F2/F3/F4 in Given–When–Then form."],
     "CR-04 section in Product Backlog + impact analysis", "AC1–AC5 appear in the backlog and match the CR form.",
     note="Overdue – Masterplan date was 30/10.")
task("S2-04", "Baseline update after CR-04 approval", N, d(3), d(4), 3,
     ["Update Product Backlog (new/changed PBIs, Story Points from Planning Poker), Release Plan (PSP, BAC), risk register.",
      "Keep BOTH the original baseline and the updated baseline (version-history table).",
      "Create the configuration tag on main, e.g. `git tag -a baseline-v1.1-cr04 -m \"Baseline after CR-04\"` (via PR/maintainer)."],
     "Updated workbook sheets + git tag `baseline-v1.1-cr04`", "Old and new PSP/BAC both visible; tag exists on GitHub.",
     support=K)
task("S2-05", "Communicate CCB decision to stakeholders", N, d(3), d(4), 1,
     ["Send the decision, owner and next steps to the team and Sponsor using the channel in the Communication Plan.",
      "Keep a screenshot/record as evidence."],
     "Communication record", "Message sent and evidence saved.")
task("S2-06/07/08", "Verify F2 – book data, categories/authors, validation (code already on main)", K, d(3), d(4), 5,
     ["Code is merged (PR #1, #3). Your job: test it against every F2 AC on https://book-store-ms-le.vercel.app/admin.",
      "Cases to cover: add/edit book; price 0, negative, text; stock negative/decimal; blank title; author typed with suggestions + new author created once (PR #3); soft delete hides book from /books; restore; delete category in use is blocked.",
      "Check client-side (browser blocks) AND server-side (disable JS or use DevTools to remove `required`) validation.",
      "Fix any defect on a `fix/...` branch and open a PR; log defects in the Issue Log."],
     "F2 test cases (Given–When–Then → steps → expected → actual) for the S2 report; defect list",
     "At least one test case per F2 AC executed with the Actual Result filled in; all blocking defects fixed or logged.")
task("S2-09/10", "Verify F3 – book list, 12/page, newest first, responsive", P, d(3), d(4), 4,
     ["Test /books on desktop, tablet (768px) and phone (375px) widths (DevTools device mode); screenshot each.",
      "Check 12 books per page, newest first, page 3 starts with 'Homo Deus' (seed data), page 99 shows the friendly 'page does not exist' message.",
      "Fix defects on a `fix/...` branch + PR."],
     "F3 test cases + screenshots", "Every F3 AC has an executed test case with evidence.")
task("CR04-02..05", "Verify CR-04 upload, storage, thumbnail, default image", K, d(3), d(4), 3,
     ["AC1: upload a 1.5 MB JPG when adding a book → saved and shown on the detail page (original).",
      "AC2: 2.5 MB file → rejected with the 2 MB message. AC3: .gif and .pdf → rejected with the accepted-formats message (also try a .pdf renamed to .jpg).",
      "AC5: a book without cover shows the default image on list and detail pages.",
      "Check in Supabase Storage → book-covers that both `original-*.jpg` and `thumb-*.webp` exist."],
     "CR-04 test evidence (screenshots + Storage listing)", "AC1, AC2, AC3, AC5 executed with actual results recorded.",
     support=P)
task("CR04-06", "CR-04 performance: 30 books with covers load < 2 s", P, d(3), d(4), 3,
     ["Upload real covers for at least 30 sample books (Admin → Books → Edit → Replace cover). Free cover images: Open Library (covers.openlibrary.org) – save JPG ≤ 2 MB first.",
      "Open /books with DevTools → Network (disable cache, 'Fast 4G'), record load time (DOMContentLoaded/Load) 3 times; confirm list uses `thumb-*.webp`, not originals.",
      "If > 2 s: check the Vercel Function Region is Mumbai (bom1) – Settings → Functions."],
     "AC4 evidence: timing screenshots + table of 3 measurements", "AC4 passes (< 2 s) with evidence, or the gap is logged as an issue with an action.")
task("S2-11", "Compile F2/F3 + CR-04 test cases into the Sprint 2 report", N, d(4), d(4), 2,
     ["Collect test cases from Khoa (F2, CR-04) and Phu (F3, CR-04 AC4) into c3_SprintReport_S2.docx.",
      "Make sure no executed test has an empty Actual Result."],
     "Test-case section of c3_SprintReport_S2.docx", "All F2/F3/CR-04 AC covered.", support=f"{K}, {P}")
task("CR04-07", "CR-04 documentation + CCB evidence", N, d(4), d(5), 2,
     ["Fill HK261_SPM_FP_Team4_c4_ChangeRequest_CR04.docx (template FP_Template_ChangeRequest.docx): request, impact on scope/schedule/cost/quality/risk with SP, hours, cost (200,000 VND/h), ≥ 2 options, CCB decision, baseline changes."],
     "c4_ChangeRequest_CR04.docx", "All 5 steps of the CR process evidenced.")
task("S2-13", "Risk register and issue log update", P, d(3), d(4), 2,
     ["Review every risk; add new ones found this sprint (e.g. Supabase free project pauses after 7 days idle; CR-04 merged before CCB record; Google Fonts build flake).",
      "Risks that occurred become issues in the Issue Log with owner and next action."],
     "Updated Risk Register + Issue Log sheets", "No risk left with an outdated status.", support=f"{K}, {N}")
task("S2-14", "Weekly Status Report (Green/Amber/Red)", N, d(4), d(4), 1.5,
     ["Status for scope, schedule, cost, quality with reasons; work done, next work, issues needing Sponsor support."],
     "Weekly Status Report section in c3_SprintReport_S2.docx", "Each of the 4 areas has a colour and a reason.")
task("S2-15", "Submit Sprint 2 files (deadline 23:59 Thu 05/11)", N, d(4), d(5), 2,
     ["Files (prefix HK261_SPM_FP_Team4_): c2_SprintBacklog_S2.xlsx (cumulative), c3_SprintReport_S2.docx, c4_ChangeRequest_CR04.docx, c0_Eval_S2.xlsx.",
      "Upload each file individually to E-learning – no ZIP. Late = −10% per 5 hours."],
     "E-learning submission", "All 4 files uploaded before 23:59 05/11 with correct names.")
task("S2-12", "Daily monitoring: board, burndown, actual hours", N, d(3), d(5), 1,
     ["Leader checks every day that each member updated their cards (Completed Work hours) and the Daily Scrum log."],
     "Burndown + daily log", "Board matches the repository and the work done.", support=ALL)
task("S2-16", "Sprint Review 2 + Retrospective (in class)", N, d(6), d(6), 2,
     ["Present: Sprint Goal and results, demo F2/F3/CR-04 against AC (pass AND fail cases), burndown with explanation, planned vs actual hours, CR/CCB decision, risks/issues.",
      "Retro: agree ≥ 2 concrete action items to track in Sprint 3."],
     "S2 review slides/notes + retro actions", "Presented; retro actions recorded.", support=ALL)

# ---------------- Sprint 3 (06/11 – 12/11) ----------------
task("S3-01", "Sprint Planning 3 (≤ 45 min)", K, d(6), d(6), 1.5,
     ["Use ACTUAL velocity from Sprints 1–2. Prepare S3_Backlog in the Excel workbook, then copy to the board.",
      "Tasks ≤ 1 person-day, each with an owner and hour estimate. Include F4/F5, regression, UAT, v1.0 tag tasks."],
     "S3_Backlog sheet + board", "Sprint Goal, capacity, items and tasks recorded.", support=ALL)
task("S3-02/03", "Verify F4 – detail page, missing ID, Back to same list page", K, d(7), d(10), 4,
     ["Code is on main. Test: open a book from list page 2 → detail shows all fields → Back returns to page 2 with the same filters.",
      "/books/999999 and /books/abc show the friendly message (no crash). CR-04: detail uses original image; default image when no cover.",
      "Fix defects via `fix/...` PR."],
     "F4 test cases + evidence", "Every F4 AC executed with actual results.")
task("S3-04/05", "Verify F5 – search title/author, category + price filters with pagination", P, d(7), d(10), 5,
     ["Search: 'orwell' → 2 books; 'tolkien'; empty search → all; no match → friendly message; Vietnamese text.",
      "Filters: category + price range together; boundary prices (exactly min/max, 0, min > max is swapped); pagination keeps filters.",
      "Fix defects via `fix/...` PR."],
     "F5 test cases + evidence", "Every F5 AC executed, including boundary cases.")
task("S3-06", "Regression tests F1–F3 (+ CR-04)", ALL, d(9), d(11), 4,
     ["Khoa: F1 (register, login, logout, admin create/lock, locked user cannot log in, customer blocked from /admin).",
      "Nguyen: F2 + CR-04. Phu: F3. Re-run after every fix; record pass/fail."],
     "Regression test log + defect list", "All release-blocking defects fixed or logged with a decision.", support=f"{K}, {N}, {P}")
task("S3-07", "Non-functional evidence", P, d(9), d(11), 3,
     ["Responsive screenshots (desktop/tablet/phone); ≥ 30 sample books count; list page < 2 s timing; client + server validation proof;",
      "Password hashing proof (Supabase → Authentication → Users shows no plain passwords; explain bcrypt in auth.users) – Khoa supports."],
     "NFR evidence section", "Every NFR in brief §2.2 has evidence.", support=K)
task("S3-08", "Release v1.0: tag + release notes", K, d(10), d(12), 2,
     ["After regression passes: tag `v1.0` on main and publish a GitHub Release with notes: features F1–F5 + CR-04, known issues, how to run (link README), hosted URL."],
     "GitHub Release v1.0", "Tag v1.0 exists; release notes published.", support=ALL)
task("S3-09", "UAT scripts mapped to every Acceptance Criterion", N, d(10), d(12), 4,
     ["Write c5_UAT.docx (template FP_Template_UAT.docx): one acceptance test per AC of F1–F5 + CR-04, with pass/fail and evidence columns.",
      "Prepare demo accounts (Administrator + Customer) and test data for the session."],
     "c5_UAT.docx (scripts)", "Every AC has a UAT script.", support=f"{K}, {P}")
task("S3-11", "Collect closure data", K, d(11), d(12), 2,
     ["Story Points done per Sprint, actual hours, defects by severity, CR data, risk status – consistent across workbook, reports, board and repo."],
     "Closure data sheet", "Numbers match everywhere.", support=ALL)
task("S3-12", "Submit Sprint 3 files (deadline 23:59 Thu 12/11)", K, d(11), d(12), 2,
     ["c2_SprintBacklog_S3.xlsx (cumulative, draft EVM), c3_SprintReport_S3.docx (+ F4/F5 test cases + release notes), c5_UAT.docx, c0_Eval_S3.xlsx – individually, no ZIP."],
     "E-learning submission", "All files uploaded on time with correct names.")
task("S3-10", "UAT session with the customer (in class)", N, d(13), d(13), 2,
     ["Run the UAT scripts with the lecturer/another team as customer; record pass/fail per AC, observations, and customer sign-off."],
     "c5_UAT.docx acceptance record", "Every AC has a result and the customer confirmation is recorded.", support=f"{K}, {P}")
task("S3-13", "Sprint Review 3 + Retrospective (in class)", K, d(13), d(13), 2,
     ["Present F4/F5 and Release 1.0 status, burndown, hours, defects, risk/change status, UAT evidence, retro actions."],
     "S3 review notes", "Presented; retro actions recorded.", support=ALL)

# ---------------- Closure (13/11 – 17/11) ----------------
task("CL-01", "Hosting check + demo accounts", P, d(13), d(14), 1.5,
     ["Confirm https://book-store-ms-le.vercel.app works logged-out, as Customer and as Administrator; record URL + demo accounts for the Final Report.",
      "Keep the Supabase project active until 17/11 (free projects pause after 7 days idle) – open the site every 2–3 days."],
     "Hosted URL + demo accounts + smoke-test evidence", "Lecturer can log in with both demo accounts.")
task("CL-02", "Final PMP update (c1_ProjectPlan_Final.docx)", N, d(13), d(14), 3,
     ["Apply lecturer feedback and CR-04; keep baseline + updated versions and version history; describe the process actually followed."],
     "c1_ProjectPlan_Final.docx", "All 7 PMP parts updated and consistent with the workbook.", support=K)
task("CL-03", "Finalise cumulative workbook", P, d(13), d(15), 3,
     ["Merge S1–S3 sheets: Product Backlog, Planning Poker, Release Plan, Sprint Backlogs, burndowns, Risk, Issue, Change Log, Config Items, EVM."],
     "c2_SprintBacklog_Final.xlsx", "Workbook complete and consistent with reports.", support=K)
task("CL-04", "Final Report – results of each Sprint", K, d(13), d(15), 4,
     ["Each Sprint Leader writes their sprint: Phu → Sprint 1, Nguyen → Sprint 2, Khoa → Sprint 3 (goal, items done, burndown, velocity, issues and resolution). Khoa merges into c6_FinalReport.docx."],
     "c6_FinalReport.docx – sprint results", "Three sprint sections with real data.", support=f"{P}, {N}")
task("CL-05", "Plan vs actual + EVM", P, d(13), d(15), 3,
     ["Scope (planned/done/added by CR), milestones, 3 burndowns, PV/EV/AC/SV/CV/SPI/CPI/EAC/ETC with BAC = planned hours × 200,000 VND; explain variances and corrective actions."],
     "EVM sheet + Final Report section", "Formulas match brief §6.4; numbers match the workbook.", support=K)
task("CL-06", "Risks and changes summary + closure checklist", N, d(14), d(15), 2,
     ["Risks that occurred and how effective the responses were; CR-04 actual impact; closure checklist (acceptance, hand-over, archiving, release of resources)."],
     "Final Report section", "Section complete with real outcomes.", support=K)
task("CL-07", "Lessons Learned (≥ 5)", ALL, d(14), d(15), 2,
     ["Each member writes ≥ 2 lessons in the form Situation – Impact – Cause – Lesson – Recommendation (e.g. CR-04 code merged before CCB record; free-tier pausing; CI font flake)."],
     "Lessons Learned section", "≥ 5 lessons in the required structure.", support=f"{K}, {N}, {P}")
task("CL-08", "Appendices: links + AI usage declaration", P, d(14), d(15), 1.5,
     ["File list; hosted URL + demo accounts; repository, board and demo-video (≤ 3 min) links; AI usage declaration (tool, purpose, affected content – e.g. Claude used for code scaffolding, docs and plan)."],
     "Final Report appendices", "All links open with the lecturer's account.")
task("CL-09", "Final consistency + file-name check", K, d(14), d(15), 2,
     ["Appendix C checklist: names with prefix HK261_SPM_FP_Team4_, no ZIP, SP/hours/EVM identical across workbook, reports and slides; v1.0 tag exists; every member has commits."],
     "Completed checklist", "Checklist all ticked.", support=ALL)
task("CL-10", "360° peer evaluation (each member)", ALL, d(14), d(15), 0.5,
     ["Each member submits Eval360_Team4_<StudentID>.xlsx (template FP_Template_Eval.xlsx)."],
     "3 Eval360 files", "Each member has submitted their own file.", support=f"{K}, {N}, {P}")
task("CL-11", "FINAL SUBMISSION (deadline 23:59 Sun 15/11)", K, d(15), d(15), 1,
     ["Upload c1_ProjectPlan_Final.docx, c2_SprintBacklog_Final.xlsx, c6_FinalReport.docx, c6_Slides.pptx/.pdf and links – individually, no ZIP."],
     "E-learning submission", "Everything uploaded before 23:59 15/11.", support=ALL)
task("CL-12", "Prepare final presentation + demo video", ALL, d(15), d(16), 4,
     ["10 min + 5 min Q&A, every member presents, slide font ≥ 20 pt, one idea per slide.",
      "Suggested split – Nguyen: Charter + plan + CR-04; Khoa: 3-sprint execution + EVM; Phu: live demo/video (pass AND fail AC) + lessons.",
      "Demo video ≤ 3 min recorded at readable size (Phu). Rehearse once with a timer; prepare Planning Poker evidence and risk answers."],
     "c6_Slides + demo video", "Full rehearsal done within 10 minutes.", support=f"{K}, {N}, {P}")
task("CL-13", "Final presentation – 07:00 Tue 17/11", ALL, d(17), d(17), 1,
     ["Arrive early; open the hosted site and slides before 07:00; every member presents and answers individual questions."],
     "Presentation", "Delivered.", support=f"{K}, {N}, {P}")

DAILY_ALL = {
    "Sprint 1": "Daily Scrum (≤ 10 min, online OK) logged; update your cards with Completed Work hours.",
    "Sprint 2": "Daily Scrum (≤ 10 min, online OK) logged; update your cards with Completed Work hours; commit/PR your work on a branch (never on main).",
    "Sprint 3": "Daily Scrum (≤ 10 min, online OK) logged; update your cards with Completed Work hours; commit/PR your work on a branch (never on main).",
    "Closure": "Short daily check-in; keep the board current; open the hosted site once (keeps Supabase awake).",
}

PAST_DEADLINES = [
    (d(27, 10), "In class – Sponsor issues CR-04"),
    (d(29, 10), "23:59 – Sprint 1 submission"),
    (d(30, 10), "In class – Sprint Review 1 + Retro; CCB meeting date in the CR form"),
]
DEADLINES = [
    (d(5), "23:59 – Sprint 2 submission"),
    (d(6), "In class – Sprint Review 2 + Retro"),
    (d(12), "23:59 – Sprint 3 submission"),
    (d(13), "In class – Sprint Review 3 + UAT"),
    (d(15), "23:59 – FINAL submission"),
    (d(17), "07:00 – Final presentation (exam)"),
]

WD = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def fmt(x):
    return x.strftime("%d/%m")


def owners_of(t):
    if t["owner"] == ALL:
        return [N, K, P]
    return [t["owner"]]


def render_past(t, day):
    span = (t["end"] - t["start"]).days + 1
    idx = (day - t["start"]).days + 1
    when = "" if span == 1 else f" — day {idx} of {span} ({fmt(t['start'])}–{fmt(t['end'])})"
    lines = [f"- [x] **{t['id']} · {t['title']}**{when}",
             f"  - Masterplan role: {t['role']} · status in Masterplan: **Done**"]
    if t["owner"] != ALL and t["support"]:
        lines.append(f"  - Support: {t['support']}")
    if t["note"]:
        lines.append(f"  - ⚠️ {t['note']}")
    lines.append(f"  - **Output:** {t['output']}")
    lines.append(f"  - **Acceptance:** {t['done']}")
    lines.append(f"  - **Evidence:** _{t['evidence']}_")
    return "\n".join(lines)


def render_task(t, day):
    if t["status"] == "done":
        return render_past(t, day)
    span = (t["end"] - t["start"]).days + 1
    idx = (day - t["start"]).days + 1
    when = "today" if span == 1 else f"day {idx} of {span} ({fmt(t['start'])}–{fmt(t['end'])})"
    due = " · **DUE TODAY**" if day == t["end"] and span > 1 else ""
    lines = [f"- [ ] **{t['id']} · {t['title']}** — {when}{due}"]
    if t["note"]:
        lines.append(f"  - ⚠️ {t['note']}")
    if t["owner"] == ALL:
        lines.append("  - Shared task: every member does their own part.")
        lines.append(f"  - Estimate (proposed, confirm in Sprint Planning): {t['est']} h for the team")
    else:
        if t["support"]:
            lines.append(f"  - Support: {t['support']}")
        lines.append(f"  - Estimate (proposed, confirm in Sprint Planning): {t['est']} h total")
    for s in t["steps"]:
        lines.append(f"  - {s}")
    lines.append(f"  - **Output:** {t['output']}")
    lines.append(f"  - **Done when:** {t['done']}")
    return "\n".join(lines)


def next_deadline(day):
    for dd, label in PAST_DEADLINES + DEADLINES:
        if dd >= day:
            return dd, label
    return None


days = []
cur = START
while cur <= END:
    days.append(cur)
    cur += dt.timedelta(days=1)

for day in days:
    sp = sprint_of(day)
    leader = LEADER[sp]
    todays = [t for t in T if t["start"] <= day <= t["end"]]
    nd = next_deadline(day)
    out = [f"# {WD[day.weekday()]} {day.strftime('%d/%m/%Y')} — {sp}", ""]
    if day < TODAY:
        out.append("> **Past day – record.** Items below are marked Done because the Masterplan status column says Done. "
                   "Fill in each **Evidence** link (document, board card, PR, screenshot) before the final submission; "
                   "if something was not actually done, untick it and add it to the Issue Log.")
        out.append("")
    out.append(f"- **Coordinator today:** {leader} ({'Sprint Leader' if sp != 'Closure' else 'closure coordinator*'})")
    if nd:
        dd, label = nd
        days_left = (dd - day).days
        out.append(f"- **Next deadline:** {fmt(dd)} {label}" + (" ← **TODAY**" if days_left == 0 else f" (in {days_left} day{'s' if days_left != 1 else ''})"))
    nav = []
    prev_d, next_d = day - dt.timedelta(days=1), day + dt.timedelta(days=1)
    if prev_d >= START:
        nav.append(f"Previous day: [{fmt(prev_d)}]({prev_d.isoformat()}.md)")
    if next_d <= END:
        nav.append(f"Next day: [{fmt(next_d)}]({next_d.isoformat()}.md)")
    nav.append("[Plan overview](../README.md)")
    out.append("- " + " · ".join(nav))
    out.append("")
    out.append("## Everyone")
    if day < TODAY and sp == "Sprint 1":
        out.append(f"- [x] {DAILY_ALL[sp]} _(covered by S1-05, Done in the Masterplan)_")
    elif day < TODAY:
        out.append(f"- [ ] {DAILY_ALL[sp]} _(S2-12 daily monitoring is “Not Started” in the Masterplan – tick only if the Daily Scrum log exists)_")
    else:
        out.append(f"- [ ] {DAILY_ALL[sp]}")
    if day < TODAY:
        moved = [(i, s0, e0, n0) for (i, s0, e0, n0) in RESCHEDULED if s0 <= day <= e0]
        if moved:
            out.append("")
            out.append("**Also planned for this day in the Masterplan, but still “Not Started” → rescheduled:** "
                       + ", ".join(f"{i} (planned {fmt(s0)}–{fmt(e0)}, now from {fmt(n0)})" for i, s0, e0, n0 in moved))
    out.append("")
    for m in MEMBERS:
        mine = [t for t in todays if m in owners_of(t)]
        helping = [t for t in todays if m not in owners_of(t) and (m in t["support"] or t["support"] == ALL)]
        out.append(f"## {m} — {ROLE[m]}")
        if not mine:
            out.append("- No owned task today – pick up support work below, review open PRs, or update documentation.")
        for t in mine:
            out.append(render_task(t, day))
        if helping:
            out.append("")
            out.append("Supporting: " + ", ".join(f"{t['id']} ({t['owner']})" for t in helping))
        out.append("")
    out.append("---")
    out.append("Tick a box only when the **Done when** condition is met, via a pull request (see `AGENTS.md`). "
               "Unfinished work moves to the next day: copy the item there and note why.")
    with open(os.path.join(OUT, "daily", f"{day.isoformat()}.md"), "w") as f:
        f.write("\n".join(out) + "\n")

# ---------------- Overview ----------------
ov = ["# Group 4 – Day-by-day project plan (23/10 → 17/11/2026)", ""]
ov.append("Built from `Group4_MasterPlan.xlsx` (task IDs, dates, roles, status) and the HK261 SPM Final Project brief. "
          "Source-defined deadlines are fixed; other dates are the Masterplan's proposals. "
          f"Status date: **{TODAY.strftime('%d/%m/%Y')}**. Sprint 1 (23/10–29/10) and the start of Sprint 2 are a record of what the "
          "Masterplan marks Done; F1–F5 and CR-04 code is merged on `main` and live at https://book-store-ms-le.vercel.app. "
          "Remaining work: **AC test evidence, CR-04 process documents, UAT, release and closure**.")
ov.append("")
ov.append("## Team and roles")
ov.append("")
ov.append("| Member | Role |\n|---|---|")
for m in MEMBERS:
    ov.append(f"| {m} | {ROLE[m]} |")
ov.append("")
ov.append("Sprint Leaders: Sprint 1 – Vo Ngoc Phu · Sprint 2 – Le Tan Nguyen · Sprint 3 – Tran Minh Khoa. "
          "Product Owner (fixed): Le Tan Nguyen. Masterplan roles are mapped to these names "
          "(\"Sprint Leader\" = the leader of that sprint, \"PO\" = Nguyen, \"Developers\" = all three).")
ov.append("")
ov.append("\\* **Assumptions to confirm:** Khoa (Sprint 3 Leader) also coordinates closure 13–17/11; Phu owns the Excel workbook and EVM. "
          "Hour estimates for open tasks are proposals – the Masterplan has no hour figures; confirm them in Sprint Planning. "
          "Actual hours for Sprint 1 come from the PM board (Completed Work), not from this plan.")
ov.append("")
ov.append("## Key dates")
ov.append("")
ov.append("| Date | Event |\n|---|---|")
ov.append("| Fri 23/10 | Project assigned – Sprint 1 starts |")
for dd, label in PAST_DEADLINES + DEADLINES:
    ov.append(f"| {WD[dd.weekday()][:3]} {fmt(dd)} | {label} |")
ov.append("")
ov.append("## Sprint 1 – Plan baseline & F1 (23/10 – 29/10, Leader: Vo Ngoc Phu) and start of Sprint 2 (30/10 – 02/11)")
ov.append("")
ov.append("Sprint Goal (brief §6.1): Sponsor-approved PMP v1.0 (7 parts) and Increment F1 – accounts and roles. "
          "Deliverables: `c1_ProjectPlan.docx`, `c2_SprintBacklog_S1.xlsx`, `c3_SprintReport_S1.docx`, `c0_Eval_S1.xlsx`.")
ov.append("")
ov.append("| ID | Task | Owner | Support | Masterplan role | Dates | Status | Evidence |\n|---|---|---|---|---|---|---|---|")
for t in [t for t in T if t["status"] == "done"]:
    ov.append(f"| {t['id']} | {t['title']} | {t['owner']} | {t['support']} | {t['role']} | {fmt(t['start'])}–{fmt(t['end'])} | Done (Masterplan) | _to add_ |")
ov.append("")
ov.append("**Check before the final submission:** the Masterplan's “% Complete” column still shows 0 % for these Done rows, and the "
          "GitHub repository only received code on 02/11 (PR #1). Make sure each row above has real evidence; anything not actually "
          "done should be reopened and logged.")
ov.append("")
ov.append("## Catch-up needed (03/11)")
ov.append("")
ov.append("- **S2-03 CCB decision** and **CR04-01** are overdue (Masterplan: 30/10–02/11). PRs #1–#3 containing CR-04 code were merged before a written CCB record – record the decision now and log this as an issue.")
ov.append("- Masterplan items planned 30/10–02/11 but still “Not Started” were moved to 03/11 or later: "
          + ", ".join(i for i, *_ in RESCHEDULED) + ".")
ov.append("")
ov.append("## Days")
ov.append("")
ov.append("| Date | Sprint | Coordinator | Tasks |\n|---|---|---|---|")
for day in days:
    todays = [t for t in T if t["start"] <= day <= t["end"]]
    mark = " (past)" if day < TODAY else (" **← status date**" if day == TODAY else "")
    ov.append(f"| [{WD[day.weekday()][:3]} {fmt(day)}](daily/{day.isoformat()}.md){mark} | {sprint_of(day)} | {LEADER[sprint_of(day)]} | "
              + ", ".join(t["id"] for t in todays) + " |")
ov.append("")
ov.append("## Open tasks (03/11 → 17/11)")
ov.append("")
ov.append("| ID | Task | Owner | Support | Start | Due | Est. h* |\n|---|---|---|---|---|---|---|")
for t in sorted([t for t in T if t["status"] != "done"], key=lambda t: (t["start"], t["end"])):
    ov.append(f"| {t['id']} | {t['title']} | {t['owner']} | {t['support']} | {fmt(t['start'])} | {fmt(t['end'])} | {t['est']} |")
ov.append("")
hours = {m: 0.0 for m in MEMBERS}
for t in T:
    if t["est"] is None:
        continue
    for m in owners_of(t):
        hours[m] += t["est"] / (3 if t["owner"] == ALL else 1)
ov.append("## Proposed owned hours for open tasks (03–17/11, excluding support)")
ov.append("")
ov.append("| Member | Hours |\n|---|---|")
for m in MEMBERS:
    ov.append(f"| {m} | {hours[m]:.1f} |")
ov.append("")
with open(os.path.join(OUT, "README.md"), "w") as f:
    f.write("\n".join(ov) + "\n")
print("days:", len(days), "tasks:", len(T), {m: round(h, 1) for m, h in hours.items()})

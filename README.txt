PORTFOLIO ADMIN V3 — LESSON 1

1. BACK UP your existing admin.html, admin.css, admin.js.
2. Replace those three files in your main portfolio folder (NOT docs/).
3. Keep docs/portfolio-content.json where it is.
4. Open admin.html with Live Server (http://127.0.0.1:...); do not use file://.
5. Check the source message near the dashboard.

BEHAVIOR:
- If you have no saved browser draft, the editor loads docs/portfolio-content.json automatically.
- If a browser draft already exists, the editor preserves it and warns if the website JSON differs.
- To intentionally replace the draft, click Load website JSON and confirm.
- Save changes keeps a local browser draft. Export for website downloads portfolio-content.json.
- To publish: replace docs/portfolio-content.json, then git add, commit and push.
- The admin is NOT password protected. Keep it outside the public docs folder.

NOTE: The website preview reads docs/portfolio-content.json, not unsaved browser drafts.

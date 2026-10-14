PORTFOLIO ADMIN V2 — INSTALLATION

1. Make a backup of your current admin.html, admin.css, admin.js.
2. Copy these three replacement files into the ROOT of your portfolio repository (beside docs/).
3. Open admin.html through VS Code Live Server, using the same local address/port as before.
4. Your existing browser localStorage edits should remain available if the origin (including port) is unchanged. If not, use Import JSON backup with your saved backup file.
5. Edit and Save as usual. Click Export for website to download portfolio-content.json.
6. Replace docs/portfolio-content.json with the exported file. Preview docs/index.html via Live Server.
7. Run git add docs/portfolio-content.json && git commit -m "Update portfolio content" && git push origin main.
8. Wait for GitHub Pages deployment, then refresh the public site.

IMPORTANT: Exporting alone does NOT update GitHub Pages. Admin files are not authenticated; do not publish them under docs/.

/* ==========================================
   ARINDA COLEB | PORTFOLIO JAVASCRIPT
========================================== */

// 1. Select HTML elements
const themeButton = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeColor = document.querySelector('meta[name="theme-color"]');
const copyrightYear = document.querySelector("#current-year");

// 2. Apply the selected theme
function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    const isDark = theme === "dark";

    // Update the theme icon
    themeIcon.textContent = isDark ? "☀" : "☾";

    // Update the button's accessible label
    themeButton.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
    );

    // Update browser theme color
    themeColor.setAttribute(
        "content",
        isDark ? "#101820" : "#142B4A"
    );
}

// 3. Load the saved theme
let savedTheme = null;

try {
    savedTheme = localStorage.getItem("portfolio-theme");
} catch (error) {
    // Continue if browser storage is unavailable
}

const initialTheme =
    savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : "light";

applyTheme(initialTheme);

// 4. Toggle between light and dark themes
themeButton.addEventListener("click", function () {
    const currentTheme =
        document.documentElement.dataset.theme;

    const newTheme =
        currentTheme === "light" ? "dark" : "light";

    // Apply the new theme
    applyTheme(newTheme);

    // Remember the user's preference
    try {
        localStorage.setItem("portfolio-theme", newTheme);
    } catch (error) {
        // Theme switching still works without storage
    }
});

// 5. Update the copyright year automatically
copyrightYear.textContent = new Date().getFullYear();
// Public portfolio content is loaded from the JSON file published alongside this script.
// Admin edits remain local until exported and copied into docs/portfolio-content.json.
async function loadPortfolioContent() {
  try {
    const response = await fetch('./portfolio-content.json', {cache: 'no-cache'});
    if (!response.ok) throw new Error('Content file unavailable');
    const data = await response.json();
    if (!data || typeof data !== 'object') return;
    renderPortfolioContent(data);
  } catch (error) {
    console.warn('Using default HTML content:', error.message);
  }
}
function renderPortfolioContent(data) {
  if (data.skills && typeof data.skills === 'object') {
    document.querySelectorAll('[data-skill-category]').forEach(list => {
      const values = data.skills[list.dataset.skillCategory];
      if (!Array.isArray(values)) return;
      list.replaceChildren(...values.filter(x => typeof x === 'string').map(name => {
        const tag = document.createElement('span'); tag.textContent = name; return tag;
      }));
    });
  }
  if (typeof data.about === 'string') {
    const about = document.querySelector('#editable-about');
    if (about) {
      about.querySelectorAll('p').forEach(el => el.remove());
      const p = document.createElement('p'); p.textContent = data.about; about.append(p);
    }
  }
  if (Array.isArray(data.projects)) {
    const grid = document.querySelector('#editable-projects');
    if (grid) {
      grid.replaceChildren();
      data.projects.forEach((project, i) => {
        if (!project || typeof project.title !== 'string') return;
        const article = document.createElement('article'); article.className = 'project-card';
        const visual = document.createElement('div'); visual.className = 'project-visual ' + (i % 2 ? 'visual-rps' : 'visual-guess');
        const label = document.createElement('span'); label.className = 'visual-label'; label.textContent = 'PORTFOLIO PROJECT';
        const mark = document.createElement('div'); mark.className = 'project-mark'; mark.textContent = '✦';
        visual.append(label, mark);
        const content = document.createElement('div'); content.className = 'project-content';
        const category = document.createElement('p'); category.className = 'project-category'; category.textContent = project.category || 'PROJECT';
        const title = document.createElement('h3'); title.textContent = project.title;
        const desc = document.createElement('p'); desc.textContent = project.description || '';
        content.append(category, title, desc);
        if (typeof project.link === 'string' && /^(?:\.\/)?projects\/[a-z0-9_-]+\/index\.html$/i.test(project.link)) {
          const a = document.createElement('a'); a.className = 'project-link'; a.href = project.link;
          a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'View project ↗'; content.append(a);
        }
        article.append(visual, content); grid.append(article);
      });
    }
  }
  const fields=data.fields||{};
  const map={heroTitle:'#hero-title',heroHighlight:'#hero-highlight',heroDescription:'#hero-description',aboutHeading:'#about-heading',aboutIntro:'#about-intro',aboutQuote:'#about-quote',skillsHeading:'#skills-heading',skillsNote:'#skills-note',projectsHeading:'#projects-heading',contactHeading:'#contact-heading',contactDescription:'#contact-description',contactEmail:'#contact-email',footerText:'#footer-text'};
  for(const [key,selector] of Object.entries(map)){
    if(typeof fields[key]!=='string')continue;
    const element=document.querySelector(selector);if(element)element.textContent=fields[key];
  }
  if(typeof fields.contactEmail==='string'){
    const link=document.querySelector('#contact-link');if(link)link.href='mailto:'+fields.contactEmail;
  }
  if(data.categories && typeof data.categories==='object'){
    document.querySelectorAll('[data-category-description]').forEach(element=>{
      const value=data.categories[element.dataset.categoryDescription];
      if(typeof value==='string')element.textContent=value;
    });
  }
}
loadPortfolioContent();

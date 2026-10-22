/* ==========================================
   ARINDA COLEB | PORTFOLIO JAVASCRIPT
========================================== */

// 1. Select HTML elements
const themeButton = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeColor = document.querySelector('meta[name="theme-color"]');
const copyrightYear = document.querySelector("#current-year");

// 2. Theme management
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const isDark = theme === "dark";

  themeIcon.textContent = isDark ? "☀" : "☾";

  themeButton.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );

  themeColor.setAttribute("content", isDark ? "#101820" : "#142B4A");
}

let savedTheme = null;

try {
  savedTheme = localStorage.getItem("portfolio-theme");
} catch (error) {
  console.warn("Theme storage unavailable:", error);
}

const initialTheme =
  savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";

applyTheme(initialTheme);

themeButton.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  const newTheme = currentTheme === "light" ? "dark" : "light";

  applyTheme(newTheme);

  try {
    localStorage.setItem("portfolio-theme", newTheme);
  } catch (error) {
    console.warn("Could not save theme:", error);
  }
});

// 3. Copyright year
copyrightYear.textContent = new Date().getFullYear();

// 4. Load portfolio content
async function loadPortfolioContent() {
  try {
    if (typeof supabaseClient === "undefined") {
      throw new Error("Supabase client is unavailable");
    }

    const { data: row, error } = await supabaseClient
      .from("portfolio_content")
      .select("content")
      .eq("id", 1)
      .single();

    if (error) throw error;

    if (!row || !row.content || typeof row.content !== "object") {
      throw new Error("Invalid cloud portfolio content");
    }

    renderPortfolioContent(row.content);
    console.log("Portfolio loaded from Supabase.");
  } catch (cloudError) {
    console.warn(
      "Supabase unavailable. Trying JSON backup:",
      cloudError.message,
    );

    try {
      const response = await fetch("./portfolio-content.json", {
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error("Portfolio JSON unavailable");
      }

      const backup = await response.json();

      if (!backup || typeof backup !== "object") {
        throw new Error("Invalid portfolio JSON");
      }

      renderPortfolioContent(backup);
      console.log("Portfolio loaded from JSON backup.");
    } catch (backupError) {
      console.warn("Using default HTML content:", backupError.message);
    }
  }
}

// 5. Render portfolio content
function renderPortfolioContent(data) {
  // Skills
  if (data.skills && typeof data.skills === "object") {
    document.querySelectorAll("[data-skill-category]").forEach((list) => {
      const values = data.skills[list.dataset.skillCategory];

      if (!Array.isArray(values)) return;

      const tags = values
        .filter((name) => typeof name === "string")
        .map((name) => {
          const tag = document.createElement("span");
          tag.textContent = name;
          return tag;
        });

      list.replaceChildren(...tags);
    });
  }

  // About Me
  if (typeof data.about === "string") {
    const about = document.querySelector("#editable-about");

    if (about) {
      about.querySelectorAll("p").forEach((element) => {
        element.remove();
      });

      const paragraph = document.createElement("p");
      paragraph.textContent = data.about;
      about.append(paragraph);
    }
  }

  // Projects
  if (Array.isArray(data.projects)) {
    const grid = document.querySelector("#editable-projects");

    if (grid) {
      grid.replaceChildren();

      data.projects.forEach((project, index) => {
        if (!project || typeof project.title !== "string") {
          return;
        }

        const article = document.createElement("article");
        article.className = "project-card";

        const visual = document.createElement("div");
        visual.className =
          "project-visual " + (index % 2 ? "visual-rps" : "visual-guess");

        const label = document.createElement("span");
        label.className = "visual-label";
        label.textContent = "PORTFOLIO PROJECT";

        const mark = document.createElement("div");
        mark.className = "project-mark";
        mark.textContent = "✦";

        visual.append(label, mark);

        const content = document.createElement("div");
        content.className = "project-content";

        const category = document.createElement("p");
        category.className = "project-category";
        category.textContent = project.category || "PROJECT";

        const title = document.createElement("h3");
        title.textContent = project.title;

        const description = document.createElement("p");
        description.textContent = project.description || "";

        content.append(category, title, description);

        // Accept local project paths or secure HTTPS links.
        if (typeof project.link === "string") {
          const link = project.link.trim();

          const localProject =
            /^(?:\.\/)?projects\/[a-z0-9_-]+\/index\.html$/i.test(link);

          const secureExternal = /^https:\/\/[^\s<>]+$/i.test(link);

          if (localProject || secureExternal) {
            const anchor = document.createElement("a");
            anchor.className = "project-link";
            anchor.href = link;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            anchor.textContent = "View project ↗";

            content.append(anchor);
          }
        }

        article.append(visual, content);
        grid.append(article);
      });
    }
  }

  // Editable text fields
  const fields = data.fields || {};

  const fieldMap = {
    heroTitle: "#hero-title",
    heroHighlight: "#hero-highlight",
    heroDescription: "#hero-description",
    aboutHeading: "#about-heading",
    aboutIntro: "#about-intro",
    aboutQuote: "#about-quote",
    skillsHeading: "#skills-heading",
    skillsNote: "#skills-note",
    projectsHeading: "#projects-heading",
    contactHeading: "#contact-heading",
    contactDescription: "#contact-description",
    contactEmail: "#contact-email",
    footerText: "#footer-text",
  };

  for (const [key, selector] of Object.entries(fieldMap)) {
    if (typeof fields[key] !== "string") continue;

    const element = document.querySelector(selector);

    if (element) {
      element.textContent = fields[key];
    }
  }

  // Contact email link
  if (typeof fields.contactEmail === "string") {
    const link = document.querySelector("#contact-link");

    if (link) {
      link.href = "mailto:" + fields.contactEmail;
    }
  }

  // Skill category descriptions
  if (data.categories && typeof data.categories === "object") {
    document
      .querySelectorAll("[data-category-description]")
      .forEach((element) => {
        const value = data.categories[element.dataset.categoryDescription];

        if (typeof value === "string") {
          element.textContent = value;
        }
      });
  }
}

// 6. Initialize portfolio
loadPortfolioContent();

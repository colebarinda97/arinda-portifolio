const KEY = "colebs-portfolio-content-v1";
const defaults = {
  skills: {
    "Web Development": ["HTML5", "CSS3", "JavaScript"],
    "Data & Analysis": ["Excel", "Data Analysis", "Visualization"],
    "Economics & Research": ["Development Economics", "Research", "Policy"],
  },
  about:
    "I have a background in Development Economics and a strong interest in how evidence, institutions, and public policy can improve people's lives. My interests include education systems, employment, agriculture, infrastructure, and inclusive development. I'm also developing my skills in data analysis and frontend development.",
  projects: [
    {
      title: "Number Guessing Game",
      category: "GAME · LOGIC",
      description:
        "A browser game in which users try to guess a randomly generated number, with feedback and an attempt counter.",
      link: "projects/number-guessing/index.html",
    },
    {
      title: "Rock Paper Scissors",
      category: "GAME · INTERACTION",
      description:
        "A browser-based game featuring player choices, computer-generated moves, game results, and score tracking.",
      link: "projects/rock-paper-scissors/index.html",
    },
  ],
  fields: {
    heroTitle: "Hello, I'm Arinda Coleb.",
    heroHighlight: "I turn ideas into insight.",
    heroDescription:
      "I'm a development economist, analyst, and frontend developer interested in understanding problems through data, exploring public policy, and building useful digital experiences.",
    aboutHeading: "Curiosity drives my work.",
    aboutIntro:
      "Bringing together economics, analytical thinking, and technology.",
    aboutQuote:
      "Good analysis helps us understand a problem. Good solutions help us do something about it.",
    skillsHeading: "Skills & interests",
    skillsNote:
      "I'm continuously learning and expanding these skills through practical exercises and projects.",
    projectsHeading: "Projects I've been building",
    contactHeading: "Have an idea or opportunity?",
    contactDescription:
      "I'm interested in meaningful conversations, professional opportunities, and projects involving economics, data, and technology.",
    contactEmail: "colebarinda97r@gmail.com",
    footerText: "Economics, analysis, and technology — always learning.",
  },
  categories: {
    "Web Development":
      "Building the foundations of responsive, interactive websites.",
    "Data & Analysis":
      "Developing practical skills to organize, explore, and communicate data.",
    "Economics & Research":
      "Exploring economic development, public policy, and evidence-based decision-making.",
  },
};
const $ = (selector) => document.querySelector(selector);
function valid(value) {
  return (
    value &&
    typeof value === "object" &&
    value.skills &&
    typeof value.skills === "object" &&
    Object.keys(defaults.skills).every(
      (k) =>
        Array.isArray(value.skills[k]) &&
        value.skills[k].every((s) => typeof s === "string"),
    ) &&
    typeof value.about === "string" &&
    Array.isArray(value.projects) &&
    value.projects.every(
      (p) =>
        p &&
        ["title", "description", "category", "link"].every(
          (k) => typeof p[k] === "string",
        ),
    )
  );
}
let data;
let hasLocalDraft = false;
try {
  data = JSON.parse(localStorage.getItem(KEY));
  hasLocalDraft = valid(data);
} catch {}
if (!hasLocalDraft) data = structuredClone(defaults);
let sourceState = hasLocalDraft ? "Local draft loaded" : "Loading website JSON…";
const normalize = (value) => ({
  ...value,
  fields: { ...defaults.fields, ...(value.fields || {}) },
  categories: { ...defaults.categories, ...(value.categories || {}) },
});
function showSourceState() {
  const el = document.querySelector("#content-source");
  if (el) el.textContent = sourceState;
}
async function fetchWebsiteContent() {
  const response = await fetch(`./docs/portfolio-content.json?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (!valid(result)) throw new Error("Invalid portfolio JSON");
  return normalize(result);
}
async function loadWebsiteContent(force = false) {
  try {
    const website = await fetchWebsiteContent();
    if (!force && hasLocalDraft) {
      sourceState = JSON.stringify(website) === JSON.stringify(data)
        ? "Local draft matches website JSON"
        : "Local draft loaded · website JSON available (click Load website JSON to replace draft)";
      showSourceState();
      return;
    }
    if (force && !confirm("Replace the current local draft with docs/portfolio-content.json? Export a backup first if needed.")) return;
    data = website;
    hasLocalDraft = true;
    localStorage.setItem(KEY, JSON.stringify(data));
    resetSkill(); resetProject(); render(); updateOverview();
    sourceState = "Website JSON loaded · saved as local draft";
    showSourceState();
    status("Loaded docs/portfolio-content.json. Your browser draft now matches this file.");
  } catch (error) {
    sourceState = `Could not load website JSON (${error.message}); using local draft`;
    showSourceState();
    status("Check that Live Server is running and docs/portfolio-content.json exists.");
  }
}
data.fields = { ...defaults.fields, ...(data.fields || {}) };
data.categories = { ...defaults.categories, ...(data.categories || {}) };
let editingSkill = null,
  editingProject = null;
const status = (msg) => ($("#status").textContent = msg);
function updateOverview() {
  $("#stat-projects").textContent = data.projects.length;
  $("#stat-skills").textContent = Object.values(data.skills).reduce((sum, items) => sum + items.length, 0);
  $("#stat-categories").textContent = Object.keys(data.skills).length;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    hasLocalDraft = true;
    sourceState = "Local draft saved · not yet published";
    showSourceState();
    status("Saved locally. Export for website when ready to publish.");
    updateOverview();
  } catch {
    status("Saving failed. Check browser storage settings.");
  }
}
function safeLink(value) {
  const v = value.trim();
  return (
    !v ||
    (/^https?:\/\//i.test(v) && !/[\s<>]/.test(v)) ||
    /^(?:\.\/)?projects\/[a-z0-9_-]+\/index\.html$/i.test(v)
  );
}
function actionButton(label, fn) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.addEventListener("click", fn);
  return b;
}
function resetSkill() {
  editingSkill = null;
  $("#skill-form").reset();
  $("#skill-form-heading").textContent = "Add skill";
  $("#skill-submit").textContent = "Add skill";
  $("#cancel-skill").hidden = true;
}
function resetProject() {
  editingProject = null;
  $("#project-form").reset();
  $("#project-form-heading").textContent = "Add project";
  $("#project-submit").textContent = "Add project";
  $("#cancel-edit").hidden = true;
}
function renderSkills() {
  const root = $("#skill-lists");
  root.replaceChildren();
  Object.entries(data.skills).forEach(([category, skills]) => {
    const section = document.createElement("div");
    section.className = "admin-list";
    const h = document.createElement("h3");
    h.textContent = category;
    section.append(h);
    skills.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "admin-entry";
      const span = document.createElement("span");
      span.textContent = name;
      const actions = document.createElement("div");
      actions.className = "entry-actions";
      actions.append(
        actionButton("Edit", () => {
          editingSkill = { category, index: i };
          $("#category").value = category;
          $("#skill").value = name;
          $("#skill-form-heading").textContent = "Edit skill";
          $("#skill-submit").textContent = "Save skill";
          $("#cancel-skill").hidden = false;
          $("#skill-form").scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }),
        actionButton("Remove", () => {
          if (!confirm(`Remove skill "${name}"?`)) return;
          data.skills[category].splice(i, 1);
          resetSkill();
          save();
          renderSkills();
        }),
      );
      row.append(span, actions);
      section.append(row);
    });
    root.append(section);
  });
}
function renderProjects() {
  const root = $("#project-lists");
  root.replaceChildren();
  data.projects.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "admin-entry";
    const name = document.createElement("span");
    name.textContent = p.title;
    const actions = document.createElement("div");
    actions.className = "entry-actions";
    actions.append(
      actionButton("Edit", () => {
        editingProject = i;
        $("#project-title").value = p.title;
        $("#project-category").value = p.category;
        $("#project-description").value = p.description;
        $("#project-link").value = p.link;
        $("#project-form-heading").textContent = "Edit project";
        $("#project-submit").textContent = "Save project";
        $("#cancel-edit").hidden = false;
        $("#project-form").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }),
      actionButton("Remove", () => {
        if (!confirm(`Remove project "${p.title}"?`)) return;
        data.projects.splice(i, 1);
        resetProject();
        save();
        renderProjects();
      }),
    );
    row.append(name, actions);
    root.append(row);
  });
}
function renderCategories() {
  const root = $("#category-editor");
  root.replaceChildren();
  Object.keys(defaults.categories).forEach((cat) => {
    const form = document.createElement("form");
    form.className = "admin-form category-form";
    const h = document.createElement("h3");
    h.textContent = cat;
    const label = document.createElement("label");
    label.textContent = "Category description";
    const textarea = document.createElement("textarea");
    textarea.rows = 2;
    textarea.maxLength = 500;
    textarea.value = data.categories[cat];
    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.type = "submit";
    button.textContent = "Save description";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      data.categories[cat] = textarea.value.trim();
      save();
    });
    form.append(h, label, textarea, button);
    root.append(form);
  });
}
function renderFields() {
  document.querySelectorAll("[data-section]").forEach((form) =>
    form.querySelectorAll("input,textarea").forEach((input) => {
      input.value =
        input.id === "about" ? data.about : (data.fields[input.id] ?? "");
    }),
  );
}
function render() {
  renderFields();
  renderCategories();
  renderSkills();
  renderProjects();
}
document.querySelectorAll("[data-section]").forEach((form) =>
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.querySelectorAll("input,textarea").forEach((input) => {
      if (input.id === "about") data.about = input.value.trim();
      else data.fields[input.id] = input.value.trim();
    });
    save();
  }),
);
$("#skill-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const category = $("#category").value;
  const name = $("#skill").value.trim();
  if (!name) return;
  if (
    data.skills[category].some(
      (s, i) =>
        s.toLowerCase() === name.toLowerCase() &&
        !(
          editingSkill &&
          editingSkill.category === category &&
          editingSkill.index === i
        ),
    )
  ) {
    status("This skill already exists in the selected category.");
    return;
  }
  if (editingSkill) {
    data.skills[editingSkill.category].splice(editingSkill.index, 1);
  }
  data.skills[category].push(name);
  resetSkill();
  save();
  renderSkills();
});
$("#cancel-skill").addEventListener("click", resetSkill);
$("#project-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const link = $("#project-link").value.trim();
  if (!safeLink(link)) {
    status(
      "Use an https:// URL or a path such as projects/calculator/index.html",
    );
    return;
  }
  const project = {
    title: $("#project-title").value.trim(),
    category: $("#project-category").value.trim(),
    description: $("#project-description").value.trim(),
    link,
  };
  if (!project.title) return;
  if (editingProject === null) data.projects.push(project);
  else data.projects[editingProject] = project;
  resetProject();
  save();
  renderProjects();
});
$("#cancel-edit").addEventListener("click", resetProject);
function downloadJson(filename) {
  const blob = new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  sourceState = "Exported JSON · replace docs file and push to publish";
  showSourceState();
  status(`Downloaded ${filename}. Not published yet.`);
}
$("#export").addEventListener("click", () => downloadJson("portfolio-content-backup.json"));
$("#export-publish").addEventListener("click", () => downloadJson("portfolio-content.json"));
$("#import").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!valid(parsed)) throw Error("Invalid backup");
    data = parsed;
    data.fields = { ...defaults.fields, ...(data.fields || {}) };
    data.categories = { ...defaults.categories, ...(data.categories || {}) };
    save();
    render();
    resetSkill();
    resetProject();
  } catch {
    status("Invalid backup. No changes imported.");
  }
  e.target.value = "";
});
$("#load-website").addEventListener("click", () => loadWebsiteContent(true));
render();
updateOverview();
showSourceState();
loadWebsiteContent(false);

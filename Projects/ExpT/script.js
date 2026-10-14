"use strict";
const $ = (id) => document.getElementById(id);
const money = (n) =>
  "SAR " +
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
let entries = [];
try {
  const saved = JSON.parse(localStorage.getItem("portfolio-expenses"));
  if (Array.isArray(saved))
    entries = saved.filter(
      (e) =>
        e &&
        typeof e.id === "string" &&
        typeof e.description === "string" &&
        Number.isFinite(e.amount) &&
        e.amount > 0 &&
        ["income", "expense"].includes(e.type) &&
        typeof e.date === "string" &&
        typeof e.category === "string",
    );
} catch {}
$("date").value = new Date().toLocaleDateString("en-CA");
function save() {
  try {
    localStorage.setItem("portfolio-expenses", JSON.stringify(entries));
    $("notice").textContent = "Saved in this browser.";
  } catch {
    $("notice").textContent = "Could not save. Export your data as CSV.";
  }
  render();
}
function render() {
  const income = entries
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0),
    expenses = entries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);
  $("income").textContent = money(income);
  $("expenses").textContent = money(expenses);
  $("balance").textContent = money(income - expenses);
  const term = $("search").value.trim().toLowerCase(),
    filter = $("filter").value;
  const visible = entries
    .filter(
      (e) =>
        (filter === "all" || e.type === filter) &&
        e.description.toLowerCase().includes(term),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const tbody = $("transactions");
  tbody.replaceChildren();
  $("empty").hidden = visible.length > 0;
  for (const e of visible) {
    const row = document.createElement("tr");
    for (const value of [e.date, e.description, e.category, e.type]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }
    const amount = document.createElement("td");
    amount.textContent = (e.type === "income" ? "+" : "−") + money(e.amount);
    amount.className = e.type === "income" ? "positive" : "negative";
    row.append(amount);
    const action = document.createElement("td"),
      button = document.createElement("button");
    button.className = "delete";
    button.textContent = "Delete";
    button.setAttribute("aria-label", `Delete ${e.description}`);
    button.addEventListener("click", () => {
      if (confirm(`Delete "${e.description}"?`)) {
        entries = entries.filter((x) => x.id !== e.id);
        save();
      }
    });
    action.append(button);
    row.append(action);
    tbody.append(row);
  }
}
$("transaction-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const description = $("description").value.trim(),
    amount = Number($("amount").value),
    date = $("date").value;
  if (
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    $("notice").textContent =
      "Enter a valid description, positive amount, and date.";
    return;
  }
  entries.push({
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random(),
    description,
    amount: Math.round(amount * 100) / 100,
    type: $("type").value,
    category: $("category").value,
    date,
  });
  $("description").value = "";
  $("amount").value = "";
  save();
});
$("search").addEventListener("input", render);
$("filter").addEventListener("change", render);
$("export").addEventListener("click", () => {
  const rows = [
    ["Date", "Description", "Category", "Type", "Amount"],
    ...entries.map((e) => [
      e.date,
      e.description,
      e.category,
      e.type,
      e.amount.toFixed(2),
    ]),
  ];
  const csv = rows
    .map((row) =>
      row
        .map((value) => '"' + String(value).replaceAll('"', '""') + '"')
        .join(","),
    )
    .join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "expense-transactions.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render();

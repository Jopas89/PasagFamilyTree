/*******************************************************
 *  DATALOADER.JS — CLEAN REVISED VERSION
 *******************************************************/

/*******************************************************
 *  GLOBAL EXPANSION DEPTH
 *******************************************************/
const GLOBAL_DEPTH = 1;

/*******************************************************
 *  GLOBAL FAMILY DATA STORAGE
 *******************************************************/
window.GlobalData = {
  raw: null,
  members: [],
  isLoaded: false,
};

/*******************************************************
 *  GLOBAL SETTINGS
 *******************************************************/
window.GlobalSettings = {
  jsonFile: "pasagFamily.json",  /*"pasagFamily.json", "MasterCopy.json",*/
  bgImage: "images/IMG_0740.JPG",
};

/*******************************************************
 *  START FAMILY TREE @ NODE
 *******************************************************/
const startFamilyTreeNode = "2";

/*******************************************************
 *  GLOBAL CONTENT (Home, About, HowToUse)
 *******************************************************/
window.GlobalContent = {
  home: {
    title: "Welcome to Pasag Family Tree",
    description: [
      "Explore your family lineage, connect with relatives, and discover your heritage through our interactive family tree.",
      "If you find any discrepancies, please send an email to webmaster.pasag@yahoo.com.",
    ],
    stats: {
      totalMembers: 0,
      generations: 5,
      newMembers: 0,
    },
    recentUpdates: [
      "New members: Ciriaco Pasag's family and his siblings added on Nov 2025.",
      "New members: Benito Pasag's, Pedro's, and Valeriana's families added on Dec 2025.",
    ],
    attention: [
      "Lets document our family heritage and make our family linage accessible to our future generations.",
    ],
  },

  about: {
    title: "Pasag Family Tree",
    description: [
      "This family tree lets you explore relationships interactively, but it is still in the development stage.",
      "Click nodes to expand, drag to pan, or scroll to zoom.",
      "Developed by Jojo C. Pasag (2025)(Baguio City) — Source data: Family Records and Emails.",
    ],
  },

  howToUse: {
    title: "How To Use",
    description01: [
      "Expand/Collapse: Use the mouse to click on a <strong>name</strong> to expand or collapse a node.",
      "Pan: Click and hold the mouse button on a <strong>name</strong>, then drag it to pan across the interface.",
      "Zoom: Click and use the scroll wheel to zoom in or out.",
    ],
    description02: [
      "<strong>NOT RECOMMENDED using iPhone</strong>",
      "Expand or Collapse: Tap on a <strong>name</strong> to expand or collapse.",
      "Pan: Tap and hold on a <strong>name</strong>, then drag your finger to pan.",
      "Zoom: Use two fingers to scroll or pinch to zoom in/out.",
    ],
  },
};

/*******************************************************
 *  GLOBAL CONTROL BUTTONS
 *******************************************************/
window.GlobalControls = [
  { label: "Reset View", action: "resetViewAndRoot", nodeId: "2" },
  { label: "Grandfather", action: "loadNewNode", nodeId: "2" },
  { label: "Ciriaco Pasag", action: "loadNewNode", nodeId: "3" },
  { label: "Eugenio Pasag", action: "loadNewNode", nodeId: "5" },
  { label: "Benito Pasag", action: "loadNewNode", nodeId: "4" },
  { label: "Valeriana Pasag", action: "loadNewNode", nodeId: "6" },
  { label: "Pedro Pasag", action: "loadNewNode", nodeId: "7" },
];

/*******************************************************
 *  GLOBAL CONFIG – UNUSED OR HIDDEN NODES
 *******************************************************/
window.GlobalConfig = window.GlobalConfig || {};
window.GlobalConfig.unwantedNodes = [
  "Folks",
  "Forefather II",
  "Forefather III",
  "Grandfather I",
  "Grandfather II",
];

/*******************************************************
 *  GLOBAL CONTACT MESSAGE GENERATOR
 *******************************************************/
window.getContactMessage = function (action) {
  let header = ["Send an email to webmaster.pasag@yahoo.com"];
  let body = [];

  switch (action) {
    case "suggest":
      header.push("Subject: Suggestion and Recommendations");
      body = [
        "Include any comments or suggestions to improve our family tree. Thank you",
      ];
      break;

    case "add":
      header.push("Subject: Add a Member");
      body = [
        "Full name (including maiden name)",
        "Great grandparents names (if known)",
        "Grandparents names (if known)",
        "Parents names",
        "Location",
        "Birth year",
        "Death year (if applicable)",
        "Spouse name",
        "Spouse birth year",
        "Spouse death year",
      ];
      break;

    case "remove":
      header.push("Subject: Remove a Member");
      body = [
        "State only the full name of the member to be removed. Thank You",
      ];
      break;
  }

  return { header, body };
};

/*******************************************************
 *  RENDER CONTROL BUTTONS
 *******************************************************/
window.renderControlButtons = function () {
  const container = document.querySelector("#controls .control-buttons");
  if (!container) return;

  container.innerHTML = "";

  window.GlobalControls.forEach((btn) => {
    const button = document.createElement("button");
    button.className = "button-gradient";
    button.textContent = btn.label;

    button.addEventListener("click", () => {
      if (typeof window[btn.action] === "function") {
        window[btn.action](btn.nodeId);
      }
    });

    container.appendChild(button);
  });
};

/*******************************************************
 *  JSON LOADER WITH HOME STATS
 *******************************************************/
window.loadFamilyJSON = async function (jsonPath) {
  try {
    const res = await fetch(jsonPath);
    const data = await res.json();

    window.GlobalData.raw = data;
    window.GlobalData.members = data.map((m) => m.pDFfilename).filter(Boolean);

    // Update home stats
    const currentYear = new Date().getFullYear();
    const newMembers = data.filter(
      (m) =>
        m.dateSubmitted &&
        new Date(m.dateSubmitted).getFullYear() === currentYear
    );

    window.GlobalContent.home.stats.totalMembers = data.length;
    window.GlobalContent.home.stats.newMembers = newMembers.length;

    if (window.applyHomeContent) window.applyHomeContent();

    window.GlobalData.isLoaded = true;
    return data;
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
};

/*******************************************************
 *  PDF DROPDOWN POPULATION
 *******************************************************/
window.populatePDFDropdown = function () {
  const dropdown = document.getElementById("searchDropdown");
  if (!dropdown || dropdown.dataset.populated === "true") return;

  dropdown.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select member PDF…";
  placeholder.disabled = true;
  placeholder.selected = true;
  dropdown.appendChild(placeholder);

  window.GlobalData.members.forEach((pdf) => {
    const option = document.createElement("option");
    option.value = pdf;
    option.textContent = pdf.replace(".pdf", "").replace(/_/g, " ");
    dropdown.appendChild(option);
  });

  dropdown.dataset.populated = "true";
};

/*******************************************************
 *  OPEN SELECTED PDF
 *******************************************************/
window.openSelectedPDF = function () {
  const dropdown = document.getElementById("searchDropdown");
  if (!dropdown) return alert("Dropdown not found");

  const selected = dropdown.value;
  if (!selected) return alert("Please select a member.");

  window.open("pdfs/" + selected, "_blank");
};

/*******************************************************
 *  NAME NORMALIZER
 *******************************************************/
window.normalizeName = function (name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

/*******************************************************
 *  APPLY GLOBAL BACKGROUND
 *******************************************************/
window.applyGlobalBackground = function () {
  const el = document.getElementById("treeContainer");
  if (!el) return;

  el.style.background = `
    linear-gradient(to top, rgba(12,2,2,0.45) 50%, rgba(11,0,0,0.55) 50%),
    url(${window.GlobalSettings.bgImage})
  `;
  el.style.backgroundPosition = "center";
  el.style.backgroundSize = "cover";
  el.style.backgroundRepeat = "no-repeat";
};

/*******************************************************
 *  UPDATE HOME STATS AFTER LOAD
 *******************************************************/
window.updateHomeStats = function () {
  if (!window.GlobalData.raw) return;

  const currentYear = new Date().getFullYear();
  const newMembers = window.GlobalData.raw.filter(
    (m) =>
      m.dateSubmitted && new Date(m.dateSubmitted).getFullYear() === currentYear
  );

  window.GlobalContent.home.stats.totalMembers = window.GlobalData.raw.length;
  window.GlobalContent.home.stats.newMembers = newMembers.length;

  if (window.applyHomeContent) window.applyHomeContent();
};

/*******************************************************
 *  START FAMILY TREE
 *******************************************************/
window.startFamilyTree = function () {
  if (window.GlobalData.isLoaded && typeof window.loadNewNode === "function") {
    window.members = window.GlobalData.members;
    window.loadNewNode(startFamilyTreeNode);
    return true;
  }
  return false;
};

/*******************************************************
 *  AUTO-START ON PAGE LOAD
 *******************************************************/
document.addEventListener("DOMContentLoaded", () => {
  window.applyGlobalBackground();
  window.renderControlButtons();

  // About + HowToUse handled in navbar.js
  if (window.applyAboutContent) window.applyAboutContent();
  if (window.applyHowToUseContent) window.applyHowToUseContent();
  if (window.applyHomeContent) window.applyHomeContent();

  window.loadFamilyJSON(window.GlobalSettings.jsonFile).then(() => {
    window.populatePDFDropdown();
    window.updateHomeStats();

    if (!window.startFamilyTree()) {
      window.addEventListener("treeJSLoaded", () => window.startFamilyTree());
    }
  });
});

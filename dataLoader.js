/*******************************************************
 *  GLOBAL EXPANSION DEPTH
 *  Determines how many levels of the tree are expanded initially
 *******************************************************/
const GLOBAL_DEPTH = 1; // Default depth

/*******************************************************
 *  GLOBAL FAMILY DATA STORAGE
 *  Holds raw JSON, member list, and load status
 *******************************************************/
window.GlobalData = {
  raw: null,       // Raw JSON data
  members: [],     // Array of member PDF filenames
  isLoaded: false, // Flag to indicate if JSON is loaded
};

/*******************************************************
 *  GLOBAL SETTINGS
 *  Configuration for JSON file and background image
 *******************************************************/
window.GlobalSettings = {
  jsonFile: "pasagFamily.json", // Path to family JSON
  bgImage: "IMG_0740.JPG",      // Background image for tree container
};

/*******************************************************
 *  GLOBAL CONTENT
 *  Static text content for home, stats, recent updates, and about modal
 *******************************************************/
window.GlobalContent = {
  homeTitle: "Welcome to the Pasag Family Tree",
  homeDescription: [
    "Explore your family lineage, connect with relatives, and discover your heritage through our interactive family tree.",
    "If you find any discrepancies, please send an email to webmaster.pasag@yahoo.com.",
  ],
  stats: { totalMembers: 0, generations: 5, newMembers: 3 },
  recentUpdates: [
    "New members: Ciriaco Pasag and siblings added on Nov 2025.",
    "New members: Ciriaco Pasag and family added on Nov 2025.",
  ],
  attention: [
    "Please be encouraged to design and develop software or webpages to preserve our family data,",
    "and make it accessible to our future generations.",
  ],
  about: {
    title: "Pasag Family Tree",
    paragraphs: [
      "This family tree lets you explore relationships interactively, but it is still in the development stage.",
      "Click nodes to expand, drag to pan, or scroll to zoom.",
      "Developed by Jojo C. Pasag (2025) — Source data: Family Records and Emails.",
    ],
  },
};

/*******************************************************
 *  GLOBAL CONTROL BUTTONS
 *  Buttons for navigating or resetting tree views
 *******************************************************/
window.GlobalControls = [
  { label: "Reset View", action: "resetViewAndRoot", nodeId: "1" },
  { label: "Grandfather", action: "loadNewNode", nodeId: "2" },
  { label: "Ciriaco Pasag", action: "loadNewNode", nodeId: "3" },
  { label: "Eugenio Pasag", action: "loadNewNode", nodeId: "5" },
  { label: "Benito Pasag", action: "loadNewNode", nodeId: "4" },
  { label: "Valeriana Pasag", action: "loadNewNode", nodeId: "6" },
  { label: "Pedro Pasag", action: "loadNewNode", nodeId: "7" },
];

/*******************************************************
 *  GLOBAL LIST OF UNWANTED NODES
 *  List of nodes to remove from the tree visualization
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
 *  RENDER CONTROL BUTTONS
 *  Dynamically generates buttons in the left control panel
 *******************************************************/
window.renderControlButtons = function () {
  const container = document.querySelector("#controls .control-buttons");
  if (!container) return;

  container.innerHTML = ""; // Clear existing buttons

  window.GlobalControls.forEach((btn) => {
    const button = document.createElement("button");
    button.className = "button-gradient";
    button.textContent = btn.label;

    button.addEventListener("click", () => {
      if (typeof window[btn.action] === "function") {
        window[btn.action](btn.nodeId);
      } else {
        console.warn(`Function ${btn.action} is not defined`);
      }
    });

    container.appendChild(button);
  });
};

/*******************************************************
 *  JSON LOADER
 *  Fetches JSON file and updates GlobalData and UI
 *******************************************************/
window.loadFamilyJSON = async function (jsonPath) {
  try {
    const res = await fetch(jsonPath);
    const data = await res.json();

    // Store data globally
    window.GlobalData.raw = data;
    window.GlobalData.members = data.map((m) => m.pDFfilename).filter(Boolean);

    // Update total members in stats
    window.GlobalContent.stats.totalMembers = data.length;

    // Populate recent updates in UI
    const updatesEl = document.querySelector(".recent-updates ul");
    if (updatesEl) {
      updatesEl.innerHTML = "";
      window.GlobalContent.recentUpdates.forEach((update) => {
        const li = document.createElement("li");
        li.textContent = update;
        updatesEl.appendChild(li);
      });
    }

    window.GlobalData.isLoaded = true;
    console.log("✔ JSON loaded:", window.GlobalData);

    return data;
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
};

/*******************************************************
 *  PDF DROPDOWN
 *  Populates dropdown with member PDFs and handles selection
 *******************************************************/
window.populatePDFDropdown = function () {
  const dropdown = document.getElementById("searchDropdown");
  if (!dropdown || !window.GlobalData.members.length) return;
  if (dropdown.dataset.populated === "true") return; // prevent re-population

  dropdown.innerHTML = ""; // clear existing options

  // Placeholder option
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select member PDF…";
  placeholder.disabled = true;
  placeholder.selected = true;
  dropdown.appendChild(placeholder);

  // Add member PDFs
  window.GlobalData.members.forEach((pdf) => {
    const option = document.createElement("option");
    option.value = pdf;
    option.textContent = pdf.replace(".pdf", "").replace(/_/g, " ");
    dropdown.appendChild(option);
  });

  dropdown.dataset.populated = "true"; // mark as populated
};

window.openSelectedPDF = function () {
  const dropdown = document.getElementById("searchDropdown");
  if (!dropdown) return alert("Dropdown not found");

  const selected = dropdown.value;
  if (!selected) return alert("Please select a member.");

  window.open("pdfs/" + selected, "_blank");
};

/*******************************************************
 *  NAME NORMALIZER
 *  Converts names to lowercase, underscores, alphanumeric
 *******************************************************/
window.normalizeName = function (name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

/*******************************************************
 *  BACKGROUND
 *  Applies global background image and overlay to tree container
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
 *  HOME CONTENT
 *  Populates home section with title, description, and attention messages
 *******************************************************/
window.applyHomeContent = function () {
  const homeSection = document.getElementById("home");
  if (!homeSection) return;

  // Main title
  const h1 = homeSection.querySelector("h1");
  if (h1) h1.textContent = window.GlobalContent.homeTitle;

  // Clear and add description paragraphs
  const p = homeSection.querySelector("p");
  if (p) {
    p.innerHTML = "";
    window.GlobalContent.homeDescription.forEach((text) => {
      const para = document.createElement("p");
      para.textContent = text;
      p.appendChild(para);
    });
  }

  // Attention messages
  if (window.GlobalContent.attention.length > 0) {
    const attentionHeading = document.createElement("h3");
    attentionHeading.textContent = "Attention";
    attentionHeading.style.color = "#d9534f"; // red
    attentionHeading.style.marginTop = "20px";
    homeSection.appendChild(attentionHeading);

    window.GlobalContent.attention.forEach((text) => {
      const para = document.createElement("p");
      para.textContent = text;
      para.className = "attention";
      homeSection.appendChild(para);
    });
  }
};

/*******************************************************
 *  ABOUT MODAL CONTENT
 *  Populates about modal with title and paragraphs
 *******************************************************/
window.applyAboutContent = function () {
  const modal = document.getElementById("aboutModal");
  if (!modal) return;

  const h2 = modal.querySelector("h2");
  const modalContent = modal.querySelector(".modal-content");

  if (h2) h2.textContent = window.GlobalContent.about.title;

  // Clear old paragraphs
  modalContent.querySelectorAll("p").forEach((p) => p.remove());

  // Add new paragraphs
  window.GlobalContent.about.paragraphs.forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    modalContent.appendChild(p);
  });
};

/*******************************************************
 *  FAMILY TREE INITIALIZER
 *  Starts the tree visualization from root node
 *******************************************************/
window.startFamilyTree = function () {
  if (window.GlobalData.isLoaded && typeof window.loadNewNode === "function") {
    window.members = window.GlobalData.members;
    window.loadNewNode("1"); // root node
    console.log("✔ Family tree initialized");
    return true;
  }
  return false;
};

/*******************************************************
 *  AUTO-START ON PAGE LOAD
 *  Initializes UI, loads JSON, and populates tree & dropdown
 *******************************************************/
document.addEventListener("DOMContentLoaded", () => {
  window.applyGlobalBackground();
  window.applyHomeContent();
  window.applyAboutContent();
  window.renderControlButtons();

  window.loadFamilyJSON(window.GlobalSettings.jsonFile).then(() => {
    window.populatePDFDropdown();
    if (!window.startFamilyTree()) {
      window.addEventListener("treeJSLoaded", () => window.startFamilyTree());
    }
  });
});


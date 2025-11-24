/*******************************************************
 *  GLOBAL EXPANSION DEPTH
 *******************************************************/
const GLOBAL_DEPTH = 1; // Default expansion depth for tree nodes

/*******************************************************
 *  GLOBAL FAMILY DATA STORAGE
 *******************************************************/
window.GlobalData = {
  raw: null,              // Raw JSON family data
  members: [],            // Array of PDF filenames
  isLoaded: false,        // Indicates when JSON is fully loaded
};

/*******************************************************
 *  GLOBAL SETTINGS
 *******************************************************/
window.GlobalSettings = {
  jsonFile: "pasagFamily.json",     // Path to family JSON file
  bgImage: "images/IMG_0740.JPG",   // Background image for tree
};

/*******************************************************
 *  GLOBAL CONTENT (Home, About, Stats, Notices)
 *******************************************************/
window.GlobalContent = {
  homeTitle: "Welcome to the Pasag Family Tree",
  homeDescription: [
    "Explore your family lineage, connect with relatives, and discover your heritage through our interactive family tree.",
    "If you find any discrepancies, please send an email to webmaster.pasag@yahoo.com.",
  ],
  stats: {
    totalMembers: 0,
    generations: 5,
    newMembers: 0,
  },
  recentUpdates: [
    "New members: Ciriaco Pasag and siblings added on Nov 2025.",
    "New members: Ciriaco Pasag and family added on Nov 2025.",
  ],
  attention: [
    "Please be encouraged to design and develop software or webpages to preserve our family data, and make it accessible to our future generations.",
  ],
  about: {
    title: "Pasag Family Tree",
    paragraphs: [
      "This family tree lets you explore relationships interactively, but it is still in the development stage.",
      "Click nodes to expand, drag to pan, or scroll to zoom.",
      "Developed by Jojo C. Pasag [Baguio City] (2025)  — Source data: Family Records and Emails.",
    ],
  },
  howToUse: {
    title: "How To Use",
    paragraphs: [
      "<strong>Using computer browser:</strong>",
      "• Expand/Collapse: Use the mouse to click on a <strong>(name)</strong> to expand or collapse a node.",
      "• Pan: Click and hold the mouse button on a <strong>(name)</strong>, then drag it to pan across the interface.",
      "• Zoom: Click the mouse (or a specific button) and use the scroll wheel to zoom in or out.",
      "<strong>Using iPad: (NOT RECOMMENDED in iPhone):</strong>",
      "• Expand or Collapse: Tap on a <strong>(name)</strong> to expand or collapse.",
      "• Pan: Tap and hold on a <strong>(name)</strong>, then drag with your fingers to pan across the screen or move the item.",
      "• Scroll and Zoom: Tap anywhere on the screen and use two fingers to scroll or pinch to zoom in and out",
    ],
  },
};

/*******************************************************
 *  GLOBAL CONTROL BUTTONS
 *******************************************************/
window.GlobalControls = [
  { label: "Reset View",     action: "resetViewAndRoot", nodeId: "1" },
  { label: "Grandfather",    action: "loadNewNode",      nodeId: "2" },
  { label: "Ciriaco Pasag",  action: "loadNewNode",      nodeId: "3" },
  { label: "Eugenio Pasag",  action: "loadNewNode",      nodeId: "5" },
  { label: "Benito Pasag",   action: "loadNewNode",      nodeId: "4" },
  { label: "Valeriana Pasag",action: "loadNewNode",      nodeId: "6" },
  { label: "Pedro Pasag",    action: "loadNewNode",      nodeId: "7" },
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
window.getContactMessage = function(action) {
  let header = ["Send an email to webmaster.pasag@yahoo.com"];
  let body = [];

  switch (action) {
    case "suggest":
      header.push("Subject: Suggestion and Recommendations");
      body = ["Include any comments or suggestions to improve our family tree. Thank you"];
      break;

    case "add":
      header.push("Subject: Add a Member");
      body = [
        "Full name (including maiden name)",
        "Great grandparents full names (if known)",
        "Grandparents full names (if known)",
        "Parents full names",
        "Location",
        "Birth year",
        "Death year (if applicable)",
        "Spouse name (if applicable)",
        "Spouse birth year (if applicable)",
        "Spouse death year (if applicable)",
      ];
      break;

    case "remove":
      header.push("Subject: Remove a Member");
      body = ["State only the full name of the member to be removed. Thank You"];
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
      } else {
        console.warn(`Function ${btn.action} is not defined`);
      }
    });

    container.appendChild(button);
  });
};

/*******************************************************
 *  JSON LOADER WITH DYNAMIC STATS (totalMembers and dateSubmitted)
 *******************************************************/
window.loadFamilyJSON = async function (jsonPath) {
  try {
    const res = await fetch(jsonPath);
    const data = await res.json();

    window.GlobalData.raw = data;
    window.GlobalData.members = data.map(m => m.pDFfilename).filter(Boolean);

    // Update stats (totalMembers and dateSubmitted) dynamically
    window.GlobalContent.stats.totalMembers = data.length;

    const currentYear = new Date().getFullYear();
    const newMembers = data.filter(member => member.dateSubmitted &&
      new Date(member.dateSubmitted).getFullYear() === currentYear
    );
    window.GlobalContent.stats.newMembers = newMembers.length;

    // Re-render home content
    window.applyHomeContent();

    // Fill recent updates
    const updatesEl = document.querySelector(".recent-updates ul");
    if (updatesEl) {
      updatesEl.innerHTML = "";
      window.GlobalContent.recentUpdates.forEach(update => {
        const li = document.createElement("li");
        li.textContent = update;
        updatesEl.appendChild(li);
      });
    }

    window.GlobalData.isLoaded = true;
    console.log("JSON loaded:", window.GlobalData);
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
  if (!dropdown || !window.GlobalData.members.length) return;
  if (dropdown.dataset.populated === "true") return;

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
  return name.toLowerCase()
             .replace(/\s+/g, "_")
             .replace(/[^a-z0-9_]/g, "");
};

/*******************************************************
 *  APPLY BACKGROUND IMAGE
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
 *  APPLY HOME PAGE CONTENT
 *******************************************************/
window.applyHomeContent = function () {
  const homeSection = document.getElementById("home");
  if (!homeSection) return;

  // Title
  const h1 = homeSection.querySelector("h1");
  if (h1) h1.textContent = window.GlobalContent.homeTitle;

  // Description
  const p = homeSection.querySelector("p");
  if (p) {
    p.innerHTML = "";
    window.GlobalContent.homeDescription.forEach(text => {
      const para = document.createElement("p");
      para.textContent = text;
      p.appendChild(para);
    });
  }

  // Stats block with <br>
  const statsBox = homeSection.querySelector(".stats");
  if (statsBox) {
    statsBox.innerHTML = `
      ${window.GlobalContent.stats.totalMembers} Family Members<br>
      ${window.GlobalContent.stats.generations} Generations<br>
      ${window.GlobalContent.stats.newMembers} New Members This Year<br>
    `;
  }

  // Attention
  if (window.GlobalContent.attention && window.GlobalContent.attention.length) {
    if (!homeSection.querySelector(".attention-heading")) {
      const heading = document.createElement("h3");
      heading.className = "attention-heading";
      heading.textContent = "Attention";
      homeSection.appendChild(heading);

      window.GlobalContent.attention.forEach(text => {
        const para = document.createElement("p");
        para.textContent = text;
        para.className = "attention";
        homeSection.appendChild(para);
      });
    }
  }
};

/*******************************************************
 *  APPLY ABOUT MODAL CONTENT
 *******************************************************/
window.applyAboutContent = function () {
  const modal = document.getElementById("aboutModal");
  if (!modal) return;

  const h2 = modal.querySelector("h2");
  if (h2) h2.textContent = window.GlobalContent.about.title;

  const messageContainer = modal.querySelector(".modal-message");
  if (!messageContainer) return;

  messageContainer.innerHTML = "";
  window.GlobalContent.about.paragraphs.forEach(text => {
    const p = document.createElement("p");
    p.textContent = text;
    messageContainer.appendChild(p);
  });
};

/*******************************************************
 *  APPLY HOW-TO-USE MODAL CONTENT
 *******************************************************/
window.applyHowToUseContent = function () {
  const modal = document.getElementById("howToUseModal");
  if (!modal) return;

  const messageContainer = modal.querySelector(".modal-message");
  if (!messageContainer) return;

  messageContainer.innerHTML = "";
  window.GlobalContent.howToUse.paragraphs.forEach(text => {
    const p = document.createElement("p");
    p.innerHTML = text; // preserve <strong>
    messageContainer.appendChild(p);
  });
};

/*******************************************************
 *  INITIALIZE FAMILY TREE
 *******************************************************/
window.startFamilyTree = function () {
  if (window.GlobalData.isLoaded && typeof window.loadNewNode === "function") {
    window.members = window.GlobalData.members;
    window.loadNewNode("1");
    console.log("Family tree initialized");
    return true;
  }
  return false;
};

/*******************************************************
 *  AUTO-START ON PAGE LOAD
 *******************************************************/
document.addEventListener("DOMContentLoaded", () => {
  window.applyGlobalBackground();
  window.applyHomeContent();
  window.applyAboutContent();
  window.applyHowToUseContent();
  window.renderControlButtons();

  window.loadFamilyJSON(window.GlobalSettings.jsonFile).then(() => {
    window.populatePDFDropdown();
    if (!window.startFamilyTree()) {
      window.addEventListener("treeJSLoaded", () => window.startFamilyTree());
    }
  });
});

// ======================================================
// NAVBAR.JS — Handles navbar, dropdowns, and modal logic
// ======================================================


// ======================================================
//  DROPDOWN MENU (CONTACT US)
// ======================================================
document.querySelectorAll(".dropdown").forEach((dropdown) => {
  const button = dropdown.querySelector(".dropbtn");

  // Toggle dropdown open/close on click
  button.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown.classList.toggle("active");
  });

  // Reference contact modal + message container
  const contactModal = document.getElementById("contactModal");
  const modalMessage = contactModal?.querySelector(".modal-message");

  // Handle Contact Us menu options (Suggest/Add/Remove)
  dropdown.querySelectorAll(".dropdown-content a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Process contact message if modal exists
      if (contactModal && modalMessage) {
        const action = link.dataset.action;       // e.g. "suggest"
        const message = window.getContactMessage(action);

        modalMessage.innerHTML = "";              // Clear previous content

        // Header (plain text lines)
        message.header.forEach((line) => {
          const p = document.createElement("p");
          p.textContent = line;
          modalMessage.appendChild(p);
        });

        // Body (bullet list)
        if (message.body?.length) {
          const ul = document.createElement("ul");
          message.body.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
          });
          modalMessage.appendChild(ul);
        }

        // Show modal
        contactModal.hidden = false;
      }

      // Close dropdown
      dropdown.classList.remove("active");
    });
  });
});

// Close any open dropdown when clicking outside
document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});


// ======================================================
//  HOME MODAL
// ======================================================
const homeModal = document.getElementById("home");
const homeLink = document.getElementById("homeLink");
const closeHomeBtn = document.getElementById("closeHome");

// Show/hide functions (CSS display is required for this modal)
function showHome() {
  homeModal.style.display = "block";
}
function hideHome() {
  homeModal.style.display = "none";
}

// Open home modal
homeLink.addEventListener("click", (e) => {
  e.preventDefault();
  showHome();
});

// Close home modal
closeHomeBtn.addEventListener("click", hideHome);


// ======================================================
//  ABOUT MODAL
// ======================================================
const aboutModal = document.getElementById("aboutModal");
const aboutLink = document.getElementById("aboutLink");
const closeAboutBtn = document.getElementById("closeAbout");
const aboutMessage = aboutModal.querySelector(".modal-message");

// Insert static About content
if (aboutMessage) {
  aboutMessage.innerHTML = window.ABOUT_TEXT;
}

// Open About modal
aboutLink.addEventListener("click", (e) => {
  e.preventDefault();
  aboutModal.hidden = false;
});

// Close About modal
closeAboutBtn.addEventListener("click", () => {
  aboutModal.hidden = true;
});

// Close when clicking outside modal content
aboutModal.addEventListener("click", (e) => {
  if (e.target === aboutModal) {
    aboutModal.hidden = true;
  }
});


// ======================================================
//  HOW-TO-USE MODAL
// ======================================================
const howToUseModal = document.getElementById("howToUseModal");
const howToUseLink = document.getElementById("howToUse");
const closeHowToUseBtn = document.getElementById("closeHowToUse");
const howToUseMessage = howToUseModal.querySelector(".modal-message");

// Insert How-To-Use text
if (howToUseMessage) {
  howToUseMessage.innerHTML = window.HOW_TO_USE_TEXT;
}

// Open modal
howToUseLink.addEventListener("click", (e) => {
  e.preventDefault();
  howToUseModal.hidden = false;
});

// Close modal
closeHowToUseBtn.addEventListener("click", () => {
  howToUseModal.hidden = true;
});

// Close on outside click
howToUseModal.addEventListener("click", (e) => {
  if (e.target === howToUseModal) {
    howToUseModal.hidden = true;
  }
});


// ======================================================
//  CONTACT MODAL (Shared content controlled by dropdown)
// ======================================================
const contactModalRef = document.getElementById("contactModal");
const closeContactBtn = document.getElementById("closeContact");

// Close with button
if (closeContactBtn) {
  closeContactBtn.addEventListener("click", () => {
    contactModalRef.hidden = true;
  });
}

// Close when clicking the backdrop
if (contactModalRef) {
  contactModalRef.addEventListener("click", (e) => {
    if (e.target === contactModalRef) {
      contactModalRef.hidden = true;
    }
  });
}

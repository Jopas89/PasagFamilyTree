document.addEventListener("DOMContentLoaded", function () {
  /*******************************************************
   *  HOME SECTION TOGGLE
   *  Show/hide home section and tree container
   *******************************************************/
  const homeSection = document.getElementById("home");
  const closeBtn = document.getElementById("closeHome");
  const treeContainer = document.getElementById("treeContainer");
  const homeLink = document.getElementById("homeLink");

  // Function to show HOME section and hide tree
  function showHome() {
    homeSection.style.display = "block";
    treeContainer.style.display = "none";
  }

  // Close button: hide HOME, show tree
  closeBtn.addEventListener("click", function () {
    homeSection.style.display = "none";
    treeContainer.style.display = "block";
  });

  // Navbar HOME link: show HOME section
  homeLink.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent page jump
    showHome();
  });

  // Optional: show HOME initially on page load
  showHome(); // Remove if not desired

  /*******************************************************
   *  CONTACT DROPDOWN
   *  Toggle dropdown visibility and handle actions
   *******************************************************/
  const dropdown = document.querySelector(".dropdown");
  const dropbtn = dropdown.querySelector(".dropbtn");

  // Toggle dropdown on button click
  dropbtn.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove("active");
  });

  // Handle dropdown action links
  dropdown.querySelectorAll(".dropdown-content a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const action = link.dataset.action;
      let message = "Send an email to webmaster.pasag@yahoo.com\n\n";

      switch (action) {
        case "suggest":
          message +=
            "Subject: Suggestion and Recommendations\nInclude any comments or suggestions to improve our family tree. Thank you";
          break;
        case "add":
          message +=
            "Subject: Add a Member\nInclude the following:\n" +
            "- Full name (including maiden name)\n" +
            "- Great grandparents full names (if known)\n" +
            "- Grandparents full names (if known)\n" +
            "- Parents full names\n" +
            "- Location\n" +
            "- Birth year\n" +
            "- Death year (if applicable)\n" +
            "- Spouse name (if applicable)\n" +
            "- Spouse birth year (if applicable)\n" +
            "- Spouse death year (if applicable)";
          break;
        case "remove":
          message +=
            "Subject: Remove a Member\nState only the full name of the member to be removed. Thank You";
          break;
      }

      alert(message);
      dropdown.classList.remove("active"); // collapse dropdown
    });
  });

  /*******************************************************
   *  ABOUT MODAL
   *  Show and hide the About modal window
   *******************************************************/
  const aboutLink = document.getElementById("aboutLink");
  const aboutModal = document.getElementById("aboutModal");
  const closeAbout = document.getElementById("closeAbout");

  // Show modal when ABOUT link is clicked
  aboutLink.addEventListener("click", (event) => {
    event.preventDefault();
    aboutModal.removeAttribute("hidden");
  });

  // Close modal when clicking the close button
  closeAbout.addEventListener("click", () => {
    aboutModal.setAttribute("hidden", "");
  });

  // Optional: close modal when clicking outside modal content
  aboutModal.addEventListener("click", (event) => {
    if (event.target === aboutModal) {
      aboutModal.setAttribute("hidden", "");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const navPlaceholder = document.getElementById("nav-placeholder");
  const heroContent = document.querySelector("[data-lazy-reveal]");

  if (heroContent) {
    window.setTimeout(() => {
      heroContent.classList.remove("hero-content--pending");
      heroContent.classList.add("hero-content--visible");
    }, 350);
  }

  if (navPlaceholder) {
    fetch("./components/navbar.html")
      .then((response) => {
        if (!response.ok) throw new Error("Nav load failed");
        return response.text();
      })
      .then((data) => {
        navPlaceholder.innerHTML = data;

        const nav = navPlaceholder.querySelector(".site-nav");
        const toggle = navPlaceholder.querySelector(".nav-toggle");
        const links = navPlaceholder.querySelectorAll(".nav-links a");
        const currentPage = window.location.pathname.split("/").pop() || "index.html";

        links.forEach((link) => {
          if (link.getAttribute("href") === currentPage) {
            link.setAttribute("aria-current", "page");
          }
        });

        toggle?.addEventListener("click", () => {
          const isOpen = nav.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", String(isOpen));
        });

        nav.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && nav.classList.contains("is-open")) {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.focus();
          }
        });
      })
      .catch((error) => console.error("Error loading navbar:", error));
  }
});

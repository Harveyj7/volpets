document.addEventListener("DOMContentLoaded", () => {
  const navPlaceholder = document.getElementById("nav-placeholder");
  const pageHeader = document.querySelector("main > header");
  const navbarTransitionTarget = document.querySelector("[data-navbar-transition]");
  const heroContent = document.querySelector("[data-lazy-reveal]");
  const contactForm = document.getElementById("contact-form");

  if (pageHeader) {
    pageHeader.classList.toggle("has-navbar-hero", Boolean(navbarTransitionTarget));
  }

  if (pageHeader && navbarTransitionTarget) {
    let navbarUpdatePending = false;

    const updateNavbarSurface = () => {
      const heroBottom = navbarTransitionTarget.getBoundingClientRect().bottom;
      const headerBottom = pageHeader.getBoundingClientRect().bottom;

      pageHeader.classList.toggle("is-past-hero", heroBottom <= headerBottom);
      navbarUpdatePending = false;
    };

    const requestNavbarUpdate = () => {
      if (navbarUpdatePending) return;

      navbarUpdatePending = true;
      window.requestAnimationFrame(updateNavbarSurface);
    };

    updateNavbarSurface();
    window.requestAnimationFrame(requestNavbarUpdate);
    window.addEventListener("load", requestNavbarUpdate);
    window.addEventListener("pageshow", requestNavbarUpdate);
    window.addEventListener("hashchange", requestNavbarUpdate);
    window.addEventListener("scroll", requestNavbarUpdate, { passive: true });
    window.addEventListener("resize", requestNavbarUpdate);

    if ("ResizeObserver" in window) {
      const navbarResizeObserver = new ResizeObserver(requestNavbarUpdate);
      navbarResizeObserver.observe(pageHeader);
      navbarResizeObserver.observe(navbarTransitionTarget);
    }

    if ("IntersectionObserver" in window) {
      const navbarIntersectionObserver = new IntersectionObserver(requestNavbarUpdate);
      navbarIntersectionObserver.observe(navbarTransitionTarget);
    }
  }

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

  if (contactForm) {
    const emailJsConfig = {
      publicKey: "QkQOLzSvp2UUeodIy",
      serviceId: "service_i4yj1re",
      templateId: "template_mtqd8kn",
    };
    const submitBtn = document.getElementById("submit-btn");
    const formStatus = document.getElementById("contact-form-status");
    const honeypot = document.getElementById("contact-website");
    const defaultButtonText = submitBtn.textContent;

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (honeypot.value.trim()) {
        contactForm.reset();
        formStatus.textContent = "";
        formStatus.className = "contact-form__status";
        return;
      }

      const isConfigured = Object.values(emailJsConfig).every(
        (value) => value && !value.startsWith("YOUR_"),
      );

      if (!isConfigured) {
        formStatus.textContent = "The contact form is not configured yet. Please try again later.";
        formStatus.className = "contact-form__status contact-form__status--error";
        return;
      }

      if (!window.emailjs) {
        formStatus.textContent = "The contact service could not load. Please try again later.";
        formStatus.className = "contact-form__status contact-form__status--error";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      contactForm.setAttribute("aria-busy", "true");
      formStatus.textContent = "";
      formStatus.className = "contact-form__status";

      try {
        await window.emailjs.sendForm(
          emailJsConfig.serviceId,
          emailJsConfig.templateId,
          contactForm,
          { publicKey: emailJsConfig.publicKey },
        );
        contactForm.reset();
        formStatus.textContent = "Thanks — your message has been sent.";
        formStatus.className = "contact-form__status contact-form__status--success";
      } catch (error) {
        console.error("EmailJS send failed:", error);
        formStatus.textContent = "Sorry, your message could not be sent. Please try again.";
        formStatus.className = "contact-form__status contact-form__status--error";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultButtonText;
        contactForm.removeAttribute("aria-busy");
      }
    });
  }
});

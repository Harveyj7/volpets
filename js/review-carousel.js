class ReviewCard extends HTMLElement {
  connectedCallback() {
    if (this.querySelector(".review-card")) return;

    const review = this.textContent.trim();
    const rating = Math.min(5, Math.max(1, Number(this.getAttribute("rating")) || 5));
    const title = this.getAttribute("review-title") || "Client review";
    const clientName = this.getAttribute("client-name") || "Volpets client";
    const clientArea = this.getAttribute("client-area") || "";

    const card = document.createElement("article");
    card.className = "review-card";

    const stars = document.createElement("div");
    stars.className = "review-card__rating";
    stars.setAttribute("aria-label", `${rating} out of 5 stars`);
    stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);

    const heading = document.createElement("h2");
    heading.className = "review-card__title";
    heading.textContent = title;

    const copy = document.createElement("p");
    copy.className = "review-card__copy";
    copy.textContent = review;

    const client = document.createElement("p");
    client.className = "review-card__client";
    client.textContent = clientName;

    if (clientArea) {
      const area = document.createElement("span");
      area.className = "review-card__area";
      area.textContent = clientArea;
      client.append(area);
    }

    card.append(stars, heading, copy, client);
    this.replaceChildren(card);
  }
}

class ReviewCarousel extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === "true") return;

    this.dataset.ready = "true";
    this.setAttribute("role", "region");
    this.setAttribute("aria-roledescription", "carousel");
    this.cards = Array.from(this.querySelectorAll(":scope > review-card"));
    this.currentPage = 0;

    const viewport = document.createElement("div");
    viewport.className = "review-carousel__viewport";

    this.track = document.createElement("div");
    this.track.className = "review-carousel__track";
    this.cards.forEach((card) => this.track.append(card));
    viewport.append(this.track);

    const controls = document.createElement("div");
    controls.className = "review-carousel__controls";

    this.previousButton = this.createButton("previous", "Previous reviews");
    this.nextButton = this.createButton("next", "Next reviews");

    this.status = document.createElement("p");
    this.status.className = "visually-hidden";
    this.status.setAttribute("aria-live", "polite");
    this.status.setAttribute("aria-atomic", "true");

    controls.append(this.previousButton, this.nextButton);
    this.replaceChildren(viewport, controls, this.status);

    this.previousButton.addEventListener("click", () => this.goToPage(this.currentPage - 1));
    this.nextButton.addEventListener("click", () => this.goToPage(this.currentPage + 1));
    this.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.goToPage(this.currentPage - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.goToPage(this.currentPage + 1);
      }
    });

    this.resizeObserver = new ResizeObserver(() => this.update(false));
    this.resizeObserver.observe(this);
    this.update(false);
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  createButton(direction, label) {
    const button = document.createElement("button");
    const isPrevious = direction === "previous";
    button.className = `review-carousel__button review-carousel__button--${direction}`;
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="${isPrevious ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </svg>
    `;
    return button;
  }

  get cardsPerPage() {
    return Number.parseInt(getComputedStyle(this).getPropertyValue("--reviews-per-page"), 10) || 1;
  }

  get pageCount() {
    return Math.ceil(this.cards.length / this.cardsPerPage);
  }

  goToPage(page) {
    const nextPage = Math.min(Math.max(page, 0), this.pageCount - 1);
    if (nextPage === this.currentPage) return;
    this.currentPage = nextPage;
    this.update(true);
  }

  update(announce = false) {
    this.currentPage = Math.min(this.currentPage, Math.max(0, this.pageCount - 1));
    const firstCardIndex = Math.min(
      this.currentPage * this.cardsPerPage,
      Math.max(0, this.cards.length - this.cardsPerPage),
    );
    const firstCard = this.cards[firstCardIndex];
    const trackOffset = (firstCard?.offsetLeft || 0) - (this.cards[0]?.offsetLeft || 0);
    this.track.style.transform = `translateX(-${trackOffset}px)`;

    this.cards.forEach((card, index) => {
      const isVisible = index >= firstCardIndex && index < firstCardIndex + this.cardsPerPage;
      card.setAttribute("aria-hidden", String(!isVisible));
    });

    this.previousButton.disabled = this.currentPage === 0;
    this.nextButton.disabled = this.currentPage >= this.pageCount - 1;

    if (announce) {
      const firstVisible = firstCardIndex + 1;
      const lastVisible = Math.min(firstCardIndex + this.cardsPerPage, this.cards.length);
      this.status.textContent = `Showing reviews ${firstVisible} to ${lastVisible} of ${this.cards.length}`;
    }
  }
}

customElements.define("review-card", ReviewCard);
customElements.define("review-carousel", ReviewCarousel);

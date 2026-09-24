document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery-grid");
  const lightbox = document.getElementById("gallery-lightbox");

  if (!gallery || !lightbox || typeof lightbox.showModal !== "function") {
    return;
  }

  const photos = [...gallery.querySelectorAll(".image-container img")];
  const lightboxImage = lightbox.querySelector(".gallery-lightbox__image");
  const count = lightbox.querySelector(".gallery-lightbox__count");
  const previousButton = lightbox.querySelector(".gallery-lightbox__arrow--previous");
  const nextButton = lightbox.querySelector(".gallery-lightbox__arrow--next");
  const closeButton = lightbox.querySelector(".gallery-lightbox__close");
  let currentIndex = 0;
  let openingTile = null;
  let touchStartX = null;

  const preloadAdjacentPhotos = () => {
    [-1, 1].forEach((offset) => {
      const photo = photos[(currentIndex + offset + photos.length) % photos.length];
      const preload = new Image();
      preload.src = photo.currentSrc || photo.src;
    });
  };

  const showPhoto = (index) => {
    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];

    lightboxImage.src = photo.currentSrc || photo.src;
    lightboxImage.alt = photo.alt;
    count.textContent = `${currentIndex + 1} / ${photos.length}`;
    preloadAdjacentPhotos();
  };

  const move = (direction) => showPhoto(currentIndex + direction);

  photos.forEach((photo, index) => {
    const tile = photo.closest(".image-container");
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("aria-label", `Open photo: ${photo.alt}`);

    const openPhoto = () => {
      openingTile = tile;
      showPhoto(index);
      lightbox.showModal();
      closeButton.focus();
    };

    tile.addEventListener("click", openPhoto);
    tile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPhoto();
      }
    });
  });

  previousButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));
  closeButton.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox
        || event.target.classList.contains("gallery-lightbox__frame")) {
      lightbox.close();
    }
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      move(-1);
    } else if (event.key === "ArrowRight") {
      move(1);
    }
  });

  lightbox.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, {passive: true});

  lightbox.addEventListener("touchend", (event) => {
    if (touchStartX === null) {
      return;
    }

    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 50) {
      move(distance > 0 ? -1 : 1);
    }
    touchStartX = null;
  }, {passive: true});

  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    openingTile?.focus();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const navPlaceholder = document.getElementById("nav-placeholder");

  if (navPlaceholder) {
    fetch("components/navbar.html")
      .then((response) => response.text())
      .then((data) => {
        navPlaceholder.innerHTML = data;
      })
      .catch((error) => console.error("Error loading navbar:", error));
  }
});

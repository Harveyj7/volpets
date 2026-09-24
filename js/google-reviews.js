(() => {
  const widget = document.querySelector(".sk-ww-google-reviews");
  if (!widget) return;

  const applyTheme = () => {
    if (!widget.shadowRoot) return false;
    if (widget.shadowRoot.querySelector("[data-volpets-theme]")) return true;

    const theme = document.createElement("style");
    theme.dataset.volpetsTheme = "";
    theme.textContent = `
      :host {
        background: transparent !important;
        color-scheme: dark;
      }

      .sk-google-reviews {
        --widget-bg-color: var(--page-bg) !important;
        --widget-font-color: var(--text) !important;
        --article-bg-color: var(--page-bg) !important;
        --article-text-color: var(--text) !important;
        --details-bg-color: var(--page-bg) !important;
        --details-font-color: var(--text) !important;
        --details-secondary-font-color: var(--text) !important;
        --profile-name-color: var(--text) !important;
        --reviewer-name-color: var(--text) !important;
        --widget-tertiary-font-color: var(--text) !important;
        --badge-bg-color: var(--page-bg) !important;
        --badge-font-color: var(--text) !important;
        --item-border-color: var(--surface-border) !important;
        --show-item-border: 1px solid var(--surface-border) !important;
        --review-rating-star-color: var(--accent) !important;
        --star-color: var(--accent) !important;
        border: 0 !important;
        box-shadow: none !important;
        outline: 0 !important;
      }

      .sk-review-card {
        background: var(--page-bg) !important;
        border-color: var(--surface-border) !important;
        color: var(--text) !important;
      }

      .sk-review-card .sk-card__date,
      .sk-review-card .sk-card__share,
      .sk-review-card .sk-card__action,
      .sk-review-card .sk-card__source-label,
      .sk-review-card strong,
      .sk-review-card .sk-review-footer__text {
        color: var(--text) !important;
      }
    `;
    widget.shadowRoot.append(theme);
    return true;
  };

  let attempts = 0;
  const waitForWidget = () => {
    if (applyTheme() || attempts >= 600) return;
    attempts += 1;
    requestAnimationFrame(waitForWidget);
  };

  waitForWidget();
})();

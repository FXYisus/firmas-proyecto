/**
 * theme.js
 * Motor de temas en tiempo real. Cambiar de tema es solo cambiar un atributo
 * data-theme en <html>; todo el color de la app depende de variables CSS
 * definidas en theme-minimal.css / theme-glass.css / theme-modern.css.
 */
const ThemeEngine = (() => {
  const DEFAULT_THEME = "modern";

  async function apply(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    await Storage.set("theme", themeName);
    const select = document.getElementById("theme-select")

    //document.querySelectorAll(".theme-option").forEach((opt) => {
    //  opt.classList.toggle("active", opt.dataset.themeValue === themeName);
    //});
    if (select) select.value = themeName;
  }

  async function init() {
    const saved = await Storage.get("theme", DEFAULT_THEME);
    await apply(saved);

    document.getElementById("theme-select").addEventListener("change", (e) => {
      apply(e.target.value)
    })
    //document.querySelectorAll(".theme-option").forEach((opt) => {
    //  opt.addEventListener("click", () => apply(opt.dataset.themeValue));
    //});
  }

  return { init, apply };
})();

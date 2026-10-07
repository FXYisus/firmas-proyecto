/**
 * greeting.js
 * Saludo condicional según la hora local del sistema, con nombre opcional
 * guardado por el usuario (ver vista "Configuración").
 */
const Greeting = (() => {
  function getPartOfDay(hour = new Date().getHours()) {
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  async function render() {
    const saludo = getPartOfDay();
    const nombre = await Storage.get("username", "");
    const el = document.getElementById("greeting-text");
    el.textContent = nombre ? `${saludo}, ${nombre}` : `${saludo}`;
  }

  return { render, getPartOfDay };
})();

/**
 * metrics.js
 * Calcula los números del dashboard a partir de la biblioteca guardada.
 * No inventa datos: todo sale de las firmas que el usuario realmente creó.
 */
const Metrics = (() => {

  const TEMPLATE_LABEL = {
    minimal: "Minimalista",
    corporate: "Corporativa",
  };

  function tiempoRelativo(isoString) {
    if (!isoString) return "—";

    const diffMs = Date.now() - new Date(isoString).getTime();
    const minutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return "Hace un momento";
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    if (dias === 1) return "Ayer";
    if (dias < 30) return `Hace ${dias} días`;
    return new Date(isoString).toLocaleDateString("es");
  }

  function contarPorEstado(lib) {
    const conteo = {
      todos: lib.length,
      "en-progreso": 0,
      finalizado: 0,
      borrador: 0,
      archivado: 0,
    };
    lib.forEach((firma) => {
      if (firma.status in conteo) conteo[firma.status]++;
    });
    return conteo;
  }

  function plantillaFavorita(lib) {
    if (lib.length === 0) return null;

    const conteo = {};
    lib.forEach((firma) => {
      conteo[firma.template] = (conteo[firma.template] || 0) + 1;
    });

    let ganadora = null;
    let maximo = 0;
    for (const [plantilla, veces] of Object.entries(conteo)) {
      if (veces > maximo) {
        maximo = veces;
        ganadora = plantilla;
      }
    }

    return {
      nombre: TEMPLATE_LABEL[ganadora] || ganadora,
      porcentaje: Math.round((maximo / lib.length) * 100),
    };
  }

  function ultimaModificada(lib) {
    if (lib.length === 0) return null;
    return [...lib].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    )[0];
  }

  function render(lib) {
    const conteo = contarPorEstado(lib);

    document.getElementById("m-total").textContent = conteo.todos;
    document.getElementById("m-activas").textContent = conteo.finalizado;

    const fav = plantillaFavorita(lib);
    const favEl = document.getElementById("m-favorita");
    const favFoot = document.getElementById("m-favorita-foot");
    if (fav) {
      favEl.textContent = fav.nombre;
      favFoot.textContent = `${fav.porcentaje}% de tus firmas la usan`;
    } else {
      favEl.textContent = "—";
      favFoot.textContent = "Sin datos aún";
    }

    const ultima = ultimaModificada(lib);
    document.getElementById("m-ultima").textContent = ultima
      ? tiempoRelativo(ultima.updatedAt)
      : "—";

    const activasFoot = document.getElementById("m-activas-foot");
    activasFoot.textContent =
      conteo.finalizado > 0 ? "Listas para usar" : "Ninguna finalizada todavía";

    document.querySelectorAll(".status-chip .count").forEach((el) => {
      const estado = el.dataset.count;
      el.textContent = conteo[estado] ?? 0;
    });
  }

  return { render, tiempoRelativo, contarPorEstado, plantillaFavorita };
})();

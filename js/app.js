/**
 * app.js
 * Punto de entrada. Conecta la navegación entre vistas, pinta el dashboard
 * a partir de la biblioteca guardada, y arranca los demás módulos.
 */
const App = (() => {
  let statusFilter = "todos";

  function switchView(viewName) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    document.getElementById(`view-${viewName}`).classList.add("active");
    document.querySelector(`.nav-item[data-view="${viewName}"]`).classList.add("active");
  }

  function bindNav() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => switchView(item.dataset.view));
    });
  }

  function bindStatusFilters() {
    document.querySelectorAll(".status-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".status-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        statusFilter = chip.dataset.status;
        refreshDashboard();
      });
    });
  }

  const STATUS_LABEL = {
    "en-progreso": "En Progreso",
    finalizado: "Finalizado",
    borrador: "Borrador",
    archivado: "Archivado",
  };

  async function refreshDashboard() {
    const lib = await SignatureEditor.getLibrary();

    // Actualiza las tarjetas de métricas y los contadores de los chips
    Metrics.render(lib);

    const grid = document.getElementById("signature-grid");
    const filtered = statusFilter === "todos" ? lib : lib.filter((s) => s.status === statusFilter);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state">Aún no hay firmas aquí. Ve a "Editor" para crear la primera.</div>`;
      return;
    }

    grid.innerHTML = filtered
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(
        (s) => `
        <div class="sig-card" data-id="${s.id}">
          <div class="name">${s.nombre}</div>
          <div class="meta">${s.form.cargo || ""}${s.form.empresa ? " · " + s.form.empresa : ""}</div>
          <div class="status-tag">${STATUS_LABEL[s.status] || s.status}</div>
        </div>`
      )
      .join("");

    grid.querySelectorAll(".sig-card").forEach((card) => {
      card.addEventListener("click", async () => {
        await SignatureEditor.loadSignature(card.dataset.id);
        switchView("editor");
      });
    });
  }

  async function bindSettings() {
    const input = document.getElementById("settings-username");
    input.value = await Storage.get("username", "");

    document.getElementById("btn-save-username").addEventListener("click", async () => {
      await Storage.set("username", input.value.trim());
      await Greeting.render();
      await renderProfileName();
      alert("Nombre guardado.");
    });
  }

  /** Muestra el nombre del usuario en el bloque de perfil del sidebar. */
  async function renderProfileName() {
    const nombre = await Storage.get("username", "");
    document.getElementById("profile-name").textContent = nombre || "Sin nombre";
  }

  /** Botón "+ Nueva Firma" del hero: limpia el editor y salta a esa vista. */
  function bindNuevaFirma() {
    document.getElementById("btn-nueva-firma").addEventListener("click", () => {
      SignatureEditor.newSignature();
      SignatureEditor.renderPreview();
      switchView("editor");
    });
  }

  /**
   * Pestañas del formulario del editor (Personal/Empresa/Contacto/Social).
   * Solo mueve una clase .active entre botones y paneles — los campos
   * nunca se destruyen, así que cambiar de pestaña no borra lo escrito.
   */
  function bindEditorTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));

        btn.classList.add("active");
        document
          .querySelector(`.tab-panel[data-tab-panel="${btn.dataset.tab}"]`)
          .classList.add("active");
      });
    });
  }

  function renderTemplateGallery() {
    const grid = document.getElementById("template-grid");
    grid.innerHTML = `
      <div class="template-card">
        <div class="thumb"></div>
        <div class="info"><strong>Minimalista</strong><div class="meta" style="color:var(--color-text-muted);font-size:12px">Texto plano, un separador, sin logo grande.</div></div>
      </div>
      <div class="template-card">
        <div class="thumb"></div>
        <div class="info"><strong>Corporativa</strong><div class="meta" style="color:var(--color-text-muted);font-size:12px">Logo, columna de datos y redes sociales.</div></div>
      </div>
    `;
  }

  async function boot() {
    await ThemeEngine.init();
    await Greeting.render();
    bindNav();
    bindStatusFilters();
    bindNuevaFirma();
    bindEditorTabs();
    await bindSettings();
    await renderProfileName();
    renderTemplateGallery();
    SignatureEditor.init();
    Exporter.init();
    await refreshDashboard();
  }

  document.addEventListener("DOMContentLoaded", boot);

  return { switchView, refreshDashboard };
})();

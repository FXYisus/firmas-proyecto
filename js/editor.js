/**
 * editor.js
 * - Carga la plantilla HTML activa.
 * - Sustituye placeholders {{campo}} con los valores del formulario.
 * - Renderiza el resultado dentro del <iframe> de vista previa (mismo HTML/CSS
 *   que terminará exportándose, para que "lo que ves es lo que envías").
 * - Guarda/lee firmas en la "biblioteca" (Storage) con su estado.
 */
const SignatureEditor = (() => {
  const templateCache = {};
  let currentSignatureId = null;

  const FORM_IDS = ["nombre", "cargo", "empresa", "telefono", "correo", "web", "redes", "logo"];

  async function loadTemplate(name) {
    if (templateCache[name]) return templateCache[name];
    const res = await fetch(`templates/${name}.html`);
    const text = await res.text();
    templateCache[name] = text;
    return text;
  }

  function readForm() {
    const data = {};
    FORM_IDS.forEach((id) => {
      data[id] = document.getElementById(`f-${id}`).value.trim();
    });
    data.redesList = data.redes
      ? data.redes.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    return data;
  }

  function writeForm(data = {}) {
    FORM_IDS.forEach((id) => {
      document.getElementById(`f-${id}`).value = data[id] || "";
    });
  }

  function renderCustomFieldsHtml(customFields) {
    return customFields
      .filter((f) => f.label || f.value)
      .map((f) => {
        switch (f.type) {
          case "enlace":
            return `<div class="cf-row"><span class="cf-label">${f.label}:</span> <a href="${f.value}">${f.value}</a></div>`;
          case "imagen":
            return `<div class="cf-row"><img src="${f.value}" alt="${f.label}" height="20" /></div>`;
          case "etiqueta":
            return `<div class="cf-row"><span class="cf-tag">${f.label || f.value}</span></div>`;
          default:
            return `<div class="cf-row"><span class="cf-label">${f.label}:</span> ${f.value}</div>`;
        }
      })
      .join("\n");
  }

  function interpolate(templateHtml, data, customFields) {
    const redesHtml = data.redesList
      .map((r) => `<a href="https://${r.replace(/^https?:\/\//, "")}" class="social-link">${r}</a>`)
      .join(" ");

    const map = {
      "{{nombre}}": data.nombre || "Tu Nombre",
      "{{cargo}}": data.cargo || "",
      "{{empresa}}": data.empresa || "",
      "{{telefono}}": data.telefono || "",
      "{{correo}}": data.correo || "",
      "{{web}}": data.web || "",
      "{{redes}}": redesHtml,
      "{{logo}}": data.logo || "",
      "{{campos_personalizados}}": renderCustomFieldsHtml(customFields),
    };

    let out = templateHtml;
    for (const [k, v] of Object.entries(map)) {
      out = out.split(k).join(v);
    }
    return out;
  }

  async function renderPreview() {
    const templateName = document.getElementById("editor-template-select").value;
    const templateHtml = await loadTemplate(templateName);
    const data = readForm();
    const customFields = CustomFields.getAll();
    const finalHtml = interpolate(templateHtml, data, customFields);

    const frame = document.getElementById("preview-frame");
    frame.srcdoc = finalHtml;
    return finalHtml;
  }

  function bindLiveUpdate() {
    FORM_IDS.forEach((id) => {
      document.getElementById(`f-${id}`).addEventListener("input", debounce(renderPreview, 150));
    });
    document.getElementById("editor-template-select").addEventListener("change", renderPreview);
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  // --- Biblioteca de firmas (dashboard) ---
  async function getLibrary() {
    return await Storage.get("signatures", []);
  }

  async function saveCurrent() {
    const lib = await getLibrary();
    const data = readForm();
    const record = {
      id: currentSignatureId || "sig_" + Date.now(),
      nombre: data.nombre || "Firma sin nombre",
      status: document.getElementById("editor-status-select").value,
      template: document.getElementById("editor-template-select").value,
      form: data,
      customFields: CustomFields.getAll(),
      updatedAt: new Date().toISOString(),
    };
    currentSignatureId = record.id;

    const idx = lib.findIndex((s) => s.id === record.id);
    if (idx >= 0) lib[idx] = record;
    else lib.push(record);

    await Storage.set("signatures", lib);
    return record;
  }

  async function loadSignature(id) {
    const lib = await getLibrary();
    const record = lib.find((s) => s.id === id);
    if (!record) return;
    currentSignatureId = record.id;
    writeForm(record.form);
    document.getElementById("editor-status-select").value = record.status;
    document.getElementById("editor-template-select").value = record.template;
    CustomFields.setAll(record.customFields || []);
    await renderPreview();
  }

  function newSignature() {
    currentSignatureId = null;
    writeForm({});
    CustomFields.setAll([]);
    document.getElementById("editor-status-select").value = "en-progreso";
  }

  function init() {
    bindLiveUpdate();
    CustomFields.init(() => renderPreview());
    renderPreview();
  }

  return {
    init,
    renderPreview,
    saveCurrent,
    loadSignature,
    newSignature,
    getLibrary,
    interpolate,
    loadTemplate,
    get currentSignatureId() {
      return currentSignatureId;
    },
  };
})();

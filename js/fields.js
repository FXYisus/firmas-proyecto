/**
 * fields.js
 * Campos personalizados dinámicos: el usuario puede añadir cuantos quiera,
 * elegir su tipo (Texto, Enlace, Imagen/Icono, Etiqueta) y reordenarlos.
 * El orden final es el orden en que aparecerán en la plantilla exportada.
 */
const CustomFields = (() => {
  let fields = []; // [{ id, label, type, value }]
  let onChange = () => {};

  const TYPES = [
    { value: "texto", label: "Texto" },
    { value: "enlace", label: "Enlace" },
    { value: "imagen", label: "Imagen/Icono" },
    { value: "etiqueta", label: "Etiqueta" },
  ];

  function uid() {
    return "cf_" + Math.random().toString(36).slice(2, 9);
  }

  function add(field = {}) {
    fields.push({
      id: field.id || uid(),
      label: field.label ?? "",
      type: field.type ?? "texto",
      value: field.value ?? "",
    });
    render();
  }

  function remove(id) {
    fields = fields.filter((f) => f.id !== id);
    render();
  }

  function move(id, direction) {
    const i = fields.findIndex((f) => f.id === id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= fields.length) return;
    [fields[i], fields[j]] = [fields[j], fields[i]];
    render();
  }

  function update(id, patch) {
    const f = fields.find((f) => f.id === id);
    if (f) Object.assign(f, patch);
    onChange(fields);
  }

  function setAll(list) {
    fields = Array.isArray(list) ? list : [];
    render();
  }

  function getAll() {
    return fields;
  }

  function render() {
    const container = document.getElementById("custom-fields-list");
    if (!container) return;
    container.innerHTML = "";

    fields.forEach((f) => {
      const row = document.createElement("div");
      row.className = "custom-field-row";
      row.innerHTML = `
        <input type="text" placeholder="Etiqueta (ej. Móvil)" value="${escapeAttr(f.label)}" data-role="label" />
        <input type="text" placeholder="Valor" value="${escapeAttr(f.value)}" data-role="value" />
        <select data-role="type">
          ${TYPES.map((t) => `<option value="${t.value}" ${t.value === f.type ? "selected" : ""}>${t.label}</option>`).join("")}
        </select>
        <span class="drag-handle" title="Reordenar" data-role="up">↑</span>
        <span class="drag-handle" title="Reordenar" data-role="down">↓</span>
        <button type="button" class="remove-field" data-role="remove">✕</button>
      `;

      row.querySelector('[data-role="label"]').addEventListener("input", (e) => update(f.id, { label: e.target.value }));
      row.querySelector('[data-role="value"]').addEventListener("input", (e) => update(f.id, { value: e.target.value }));
      row.querySelector('[data-role="type"]').addEventListener("change", (e) => update(f.id, { type: e.target.value }));
      row.querySelector('[data-role="up"]').addEventListener("click", () => move(f.id, "up"));
      row.querySelector('[data-role="down"]').addEventListener("click", () => move(f.id, "down"));
      row.querySelector('[data-role="remove"]').addEventListener("click", () => remove(f.id));

      container.appendChild(row);
    });

    onChange(fields);
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }

  function init(changeHandler) {
    onChange = changeHandler || (() => {});
    document.getElementById("btn-add-field").addEventListener("click", () => add());
  }

  return { init, add, remove, getAll, setAll, TYPES };
})();

/**
 * export.js
 * Al terminar de editar, exporta la firma como .html, .png o .json (proyecto
 * recuperable). Versión web: el navegador no permite elegir carpeta de
 * destino por seguridad, así que se usa la descarga estándar — el archivo
 * cae directo a la carpeta de Descargas (o el navegador pregunta, según
 * la configuración de cada usuario).
 */
const Exporter = (() => {
  async function pickSavePath(defaultName) {
    return defaultName;
  }

  async function writeFile(path, contents, isBinary = false) {
    const blob = isBinary ? new Blob([contents]) : new Blob([contents], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = path;
    a.click();
    URL.revokeObjectURL(url);
    return path;
  }

  async function exportHtml() {
    const html = await SignatureEditor.renderPreview();
    const name = (document.getElementById("f-nombre").value || "firma").replace(/\s+/g, "-").toLowerCase();
    const path = await pickSavePath(`${name}.html`, [{ name: "HTML", extensions: ["html"] }]);
    if (!path) return null;
    return await writeFile(path, html);
  }

  async function exportJsonProject() {
    const record = await SignatureEditor.saveCurrent();
    const name = (record.nombre || "firma").replace(/\s+/g, "-").toLowerCase();
    const path = await pickSavePath(`${name}.json`, [{ name: "Proyecto JSON", extensions: ["json"] }]);
    if (!path) return null;
    return await writeFile(path, JSON.stringify(record, null, 2));
  }

  async function exportPng() {
    const frame = document.getElementById("preview-frame");
    const name = (document.getElementById("f-nombre").value || "firma").replace(/\s+/g, "-").toLowerCase();
    const path = await pickSavePath(`${name}.png`, [{ name: "Imagen PNG", extensions: ["png"] }]);
    if (!path) return null;

    if (window.html2canvas) {
      const canvas = await window.html2canvas(frame.contentDocument.body);
      const dataUrl = canvas.toDataURL("image/png");
      const binary = atob(dataUrl.split(",")[1]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return await writeFile(path, bytes, true);
    }

    console.warn("html2canvas no está cargado; exportando .html como alternativa.");
    return await exportHtml();
  }

  async function runExportFlow() {
    const choice = document.getElementById("export-format")?.value || "html";
    if (choice === "html") return exportHtml();
    if (choice === "json") return exportJsonProject();
    if (choice === "png") return exportPng();
  }

  function init() {
    document.getElementById("btn-export").addEventListener("click", async () => {
      const format = prompt("Formato de exportación: html / png / json", "html");
      if (!format) return;
      if (format === "html") await exportHtml();
      else if (format === "png") await exportPng();
      else if (format === "json") await exportJsonProject();
    });

    document.getElementById("btn-save").addEventListener("click", async () => {
      await SignatureEditor.saveCurrent();
      await App.refreshDashboard();
      alert("Firma guardada en la biblioteca.");
    });
  }

  return { init, exportHtml, exportJsonProject, exportPng };
})();

/**
 * storage.js
 * Capa de persistencia 100% local en el navegador (localStorage).
 * Zero-telemetry: nunca hace fetch/http salvo cargar las plantillas locales.
 */
const Storage = (() => {
  const NS = "gestor-firmas";

  function readAll() {
    try {
      const raw = localStorage.getItem(NS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeAll(data) {
    localStorage.setItem(NS, JSON.stringify(data));
  }

  return {
    async get(key, fallback = null) {
      const all = readAll();
      return key in all ? all[key] : fallback;
    },

    async set(key, value) {
      const all = readAll();
      all[key] = value;
      writeAll(all);
    },

    async remove(key) {
      const all = readAll();
      delete all[key];
      writeAll(all);
    },
  };
})();

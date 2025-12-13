// client/src/utils/api.js

// Re-export everything from the main api module so older imports still work.
export * from "../api";

// Also forward the default export if something imports `default` from here.
import api from "../api";
export default api;

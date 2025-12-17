// client/src/utils/api.js

// Thin re-export layer so code can import from either
// "./api" or "./utils/api" without caring where the logic lives.

export { default } from "../api.js";
export * from "../api.js";
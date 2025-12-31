// client/src/habitCheckService.js

const DEFAULT_CONFIG = {
  enabled: false,
  // minutes between prompts (60 = 1h)
  frequencyMinutes: 60,
};

function makeKey(userId) {
  const id = userId || "anon";
  return `qtc_habitCheck_${id}`;
}

export function loadHabitCheck(userId) {
  if (typeof window === "undefined") {
    return {
      config: { ...DEFAULT_CONFIG },
      nextCheckAt: null,
      logs: [],
    };
  }

  const key = makeKey(userId);

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return {
        config: { ...DEFAULT_CONFIG },
        nextCheckAt: null,
        logs: [],
      };
    }

    const parsed = JSON.parse(raw);

    return {
      config: {
        ...DEFAULT_CONFIG,
        ...(parsed.config || {}),
      },
      nextCheckAt:
        typeof parsed.nextCheckAt === "number" ? parsed.nextCheckAt : null,
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
  } catch (err) {
    console.warn("HabitCheck: failed to load state", err);
    return {
      config: { ...DEFAULT_CONFIG },
      nextCheckAt: null,
      logs: [],
    };
  }
}

export function saveHabitCheck(userId, state) {
  if (typeof window === "undefined") return;
  const key = makeKey(userId);

  try {
    const clean = {
      config: {
        enabled: !!state?.config?.enabled,
        frequencyMinutes:
          Number(state?.config?.frequencyMinutes) ||
          DEFAULT_CONFIG.frequencyMinutes,
      },
      nextCheckAt:
        typeof state?.nextCheckAt === "number" ? state.nextCheckAt : null,
      // keep last 200 entries max
      logs: Array.isArray(state?.logs)
        ? state.logs.slice(-200)
        : [],
    };

    window.localStorage.setItem(key, JSON.stringify(clean));
  } catch (err) {
    console.warn("HabitCheck: failed to save state", err);
  }
}

export function computeNextCheckAt(config, fromTimeMs) {
  const base =
    typeof fromTimeMs === "number" ? fromTimeMs : Date.now();
  const freq =
    Number(config?.frequencyMinutes) ||
    DEFAULT_CONFIG.frequencyMinutes;

  return base + freq * 60 * 1000;
}

// Pure state transformer: take old state, return new state with a log entry.
export function addLog(prevState, entry) {
  const base =
    prevState || {
      config: { ...DEFAULT_CONFIG },
      nextCheckAt: null,
      logs: [],
    };

  const logs = Array.isArray(base.logs) ? base.logs.slice() : [];

  logs.push({
    timestamp: Date.now(),
    used: !!entry.used,
    units: entry.used ? Number(entry.units || 0) : 0,
  });

  const nextCheckAt = computeNextCheckAt(base.config);

  return {
    ...base,
    logs,
    nextCheckAt,
  };
}

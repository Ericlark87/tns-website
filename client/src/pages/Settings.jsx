// client/src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const pageStyle = {
  minHeight: "100vh",
  paddingTop: "80px",
  paddingBottom: "80px",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  background:
    "radial-gradient(circle at top left, #1b2840 0, #050816 45%, #02030a 100%)",
  color: "#f9fafb",
};

const shellStyle = {
  width: "100%",
  maxWidth: "900px",
  padding: "24px",
};

const cardStyle = {
  background:
    "linear-gradient(145deg, rgba(22, 27, 51, 0.95), rgba(8, 13, 28, 0.98))",
  borderRadius: "18px",
  padding: "28px 32px 32px",
  boxShadow:
    "0 22px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(148, 163, 184, 0.09)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
};

const headlineStyle = {
  fontSize: "22px",
  fontWeight: 700,
  letterSpacing: "0.03em",
  marginBottom: "4px",
};

const sublineStyle = {
  fontSize: "13px",
  color: "rgba(209, 213, 219, 0.85)",
  maxWidth: "520px",
};

const sectionTitleStyle = {
  fontSize: "13px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(148, 163, 184, 0.95)",
  marginTop: "24px",
  marginBottom: "10px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px 18px",
};

const fieldLabelStyle = {
  fontSize: "12px",
  color: "rgba(209, 213, 219, 0.92)",
  marginBottom: "4px",
};

const helpTextStyle = {
  fontSize: "11px",
  color: "rgba(148, 163, 184, 0.9)",
  marginTop: "3px",
};

const inputBase = {
  width: "100%",
  borderRadius: "999px",
  border: "1px solid rgba(55, 65, 81, 0.9)",
  background:
    "linear-gradient(120deg, rgba(15,23,42,0.95), rgba(15,23,42,0.98))",
  color: "#f9fafb",
  padding: "9px 14px",
  fontSize: "13px",
  outline: "none",
  boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.9)",
};

const inputStyle = {
  ...inputBase,
};

const selectStyle = {
  ...inputBase,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

const toggleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "12px",
};

const checkboxStyle = {
  width: "16px",
  height: "16px",
  borderRadius: "6px",
  border: "1px solid rgba(148, 163, 184, 0.9)",
};

const buttonRowStyle = {
  marginTop: "26px",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: "12px",
};

const primaryButtonStyle = (disabled) => ({
  border: "none",
  borderRadius: "999px",
  padding: "9px 22px",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: disabled ? "default" : "pointer",
  color: disabled ? "rgba(15,23,42,0.9)" : "#020617",
  background: disabled
    ? "linear-gradient(135deg, #9ca3af, #d1d5db)"
    : "linear-gradient(135deg, #f97316, #fb923c)",
  boxShadow: disabled
    ? "0 0 0 1px rgba(148,163,184,0.5)"
    : "0 14px 30px rgba(251, 146, 60, 0.45)",
  transition: "transform 0.08s ease-out, box-shadow 0.08s ease-out",
});

const statusTextStyle = {
  fontSize: "12px",
  color: "rgba(148, 163, 184, 0.96)",
};

const alertStyle = (variant) => {
  const base = {
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "12px",
    marginBottom: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  };

  if (variant === "error") {
    return {
      ...base,
      background: "rgba(220, 38, 38, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.6)",
      color: "#fecaca",
    };
  }
  return {
    ...base,
    background: "rgba(22, 163, 74, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.6)",
    color: "#bbf7d0",
  };
};

const quickPresetRowStyle = {
  marginTop: "10px",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  flexWrap: "wrap",
};

const presetButtonStyle = (active) => ({
  borderRadius: "999px",
  border: active
    ? "1px solid rgba(251, 146, 60, 0.9)"
    : "1px solid rgba(75, 85, 99, 0.9)",
  background: active
    ? "rgba(251, 146, 60, 0.16)"
    : "rgba(15, 23, 42, 0.9)",
  color: "rgba(229, 231, 235, 0.96)",
  padding: "4px 10px",
  fontSize: "11px",
  cursor: "pointer",
});

const defaultForm = {
  substance: "cigarettes",
  customName: "",
  intent: "quit",
  unitsPerDay: "",
  packCost: "",
  unitsPerPack: 20,
  currency: "USD",
};

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const data = await getSettings(); // from api.js
        const habit = data?.habit || data || null;

        if (!cancelled && habit) {
          setForm({
            ...defaultForm,
            ...habit,
            unitsPerDay:
              habit.unitsPerDay === null || habit.unitsPerDay === undefined
                ? ""
                : habit.unitsPerDay,
            packCost:
              habit.packCost === null || habit.packCost === undefined
                ? ""
                : habit.packCost,
          });
        }
      } catch (err) {
        console.error("Load habit settings failed", err);
        const msg = err?.message || String(err);
        if (!cancelled && !/not authenticated/i.test(msg)) {
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const onChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  };

  const applyPreset = (units) => {
    setForm((prev) => ({
      ...prev,
      unitsPerDay: units,
    }));
    setError("");
    setSuccess("");
  };

  const currentPreset =
    Number(form.unitsPerDay) === 5
      ? "light"
      : Number(form.unitsPerDay) === 10
      ? "moderate"
      : Number(form.unitsPerDay) === 20
      ? "heavy"
      : Number(form.unitsPerDay) === 30
      ? "extreme"
      : "custom";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        substance: form.substance,
        customName: form.customName?.trim() || "",
        intent: form.intent,
        unitsPerDay: Number(form.unitsPerDay) || 0,
        packCost: Number(form.packCost) || 0,
        unitsPerPack: Number(form.unitsPerPack) || 20,
        currency: form.currency || "USD",
      };

      const saved = await saveSettings(payload); // from api.js
      const habit = saved?.habit || saved || payload;

      setForm({
        ...defaultForm,
        ...habit,
        unitsPerDay:
          habit.unitsPerDay === null || habit.unitsPerDay === undefined
            ? ""
            : habit.unitsPerDay,
        packCost:
          habit.packCost === null || habit.packCost === undefined
            ? ""
            : habit.packCost,
      });

      setSuccess("Settings saved. Dashboard will use these numbers.");
    } catch (err) {
      console.error("Save habit settings failed", err);
      setError(err?.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const disabled = saving || loading;

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={cardStyle}>
          <div style={{ marginBottom: "12px" }}>
            <div style={headlineStyle}>Habit settings</div>
            <div style={sublineStyle}>
              Tell QuitChampion what you were doing before you decided to stop.
              These numbers drive all of the money and streak stats.
            </div>
          </div>

          {error && (
            <div style={alertStyle("error")}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div style={alertStyle("success")}>
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={sectionTitleStyle}>What are we tracking?</div>
            <div style={gridStyle}>
              <div>
                <div style={fieldLabelStyle}>Substance / habit</div>
                <select
                  style={selectStyle}
                  value={form.substance}
                  onChange={onChange("substance")}
                  disabled={disabled}
                >
                  <option value="cigarettes">Cigarettes</option>
                  <option value="vape">Vape / nicotine</option>
                  <option value="alcohol">Alcohol</option>
                  <option value="weed">Weed</option>
                  <option value="other">Something else</option>
                </select>
                <div style={helpTextStyle}>
                  This is just for labels and math. No judgement.
                </div>
              </div>

              <div>
                <div style={fieldLabelStyle}>
                  Brand / label (optional, just for you)
                </div>
                <input
                  type="text"
                  style={inputStyle}
                  value={form.customName}
                  onChange={onChange("customName")}
                  disabled={disabled}
                  placeholder="e.g. Marlboro Reds, Truly Wild Berry, etc."
                />
              </div>
            </div>

            <div style={sectionTitleStyle}>What&apos;s the plan?</div>
            <div style={gridStyle}>
              <div>
                <div style={fieldLabelStyle}>Intent</div>
                <select
                  style={selectStyle}
                  value={form.intent}
                  onChange={onChange("intent")}
                  disabled={disabled}
                >
                  <option value="quit">Quit for good</option>
                  <option value="cut-back">Cut back</option>
                  <option value="break">Take a break</option>
                  <option value="taper">Taper down</option>
                </select>
              </div>
            </div>

            <div style={sectionTitleStyle}>Baseline usage</div>
            <div style={gridStyle}>
              <div>
                <div style={fieldLabelStyle}>Average units per day</div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  style={inputStyle}
                  value={form.unitsPerDay}
                  onChange={onChange("unitsPerDay")}
                  disabled={disabled}
                  placeholder="How many per day before you decided to stop?"
                />
                <div style={helpTextStyle}>
                  Cigarettes = sticks. Beer = bottles / cans. Vapes = reasonable
                  &quot;session&quot; estimate.
                </div>
                <div style={quickPresetRowStyle}>
                  <span style={{ ...helpTextStyle, marginTop: 0 }}>
                    Quick presets:
                  </span>
                  <button
                    type="button"
                    style={presetButtonStyle(currentPreset === "light")}
                    onClick={() => applyPreset(5)}
                    disabled={disabled}
                  >
                    Light (~5 / day)
                  </button>
                  <button
                    type="button"
                    style={presetButtonStyle(currentPreset === "moderate")}
                    onClick={() => applyPreset(10)}
                    disabled={disabled}
                  >
                    Moderate (~10 / day)
                  </button>
                  <button
                    type="button"
                    style={presetButtonStyle(currentPreset === "heavy")}
                    onClick={() => applyPreset(20)}
                    disabled={disabled}
                  >
                    Heavy (~20 / day)
                  </button>
                  <button
                    type="button"
                    style={presetButtonStyle(currentPreset === "extreme")}
                    onClick={() => applyPreset(30)}
                    disabled={disabled}
                  >
                    Savage (30+ / day)
                  </button>
                </div>
              </div>

              <div>
                <div style={fieldLabelStyle}>
                  Typical cost (pack / bottle / unit)
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  value={form.packCost}
                  onChange={onChange("packCost")}
                  disabled={disabled}
                  placeholder="What did that usually cost you?"
                />
                <div style={helpTextStyle}>
                  Approximate is fine. We just need a ballpark for the money
                  saved numbers.
                </div>
              </div>

              <div>
                <div style={fieldLabelStyle}>Units per pack (if relevant)</div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  style={inputStyle}
                  value={form.unitsPerPack}
                  onChange={onChange("unitsPerPack")}
                  disabled={disabled}
                  placeholder="20 for a pack of cigarettes, 6 for a six-pack, etc."
                />
              </div>

              <div>
                <div style={fieldLabelStyle}>Currency</div>
                <select
                  style={selectStyle}
                  value={form.currency}
                  onChange={onChange("currency")}
                  disabled={disabled}
                >
                  <option value="USD">USD – US Dollar</option>
                  <option value="CAD">CAD – Canadian Dollar</option>
                  <option value="EUR">EUR – Euro</option>
                  <option value="GBP">GBP – British Pound</option>
                  <option value="AUD">AUD – Australian Dollar</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                style={checkboxStyle}
                checked
                readOnly
              />
              <span style={helpTextStyle}>
                Stats will use these numbers to estimate health streak and money
                saved. You can change this later.
              </span>
            </div>

            <div style={buttonRowStyle}>
              <button type="submit" style={primaryButtonStyle(disabled)}>
                {saving ? "Saving…" : "Save settings"}
              </button>
              <div style={statusTextStyle}>
                {loading
                  ? "Loading your last saved settings…"
                  : saving
                  ? "Writing this to your account…"
                  : success
                  ? success
                  : "Once saved, the dashboard will start crunching the numbers."}
              </div>
            </div>
          </form>

          {user && (
            <div
              style={{
                marginTop: "18px",
                fontSize: "11px",
                color: "rgba(148,163,184,0.9)",
              }}
            >
              Logged in as <strong>{user.email}</strong>. These settings are
              stored on your QuitChampion account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

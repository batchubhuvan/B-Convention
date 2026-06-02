import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../utils/db';

export default function BrandingEditor() {
  const branding = useAppStore((state) => state.branding);
  const saveBranding = useAppStore((state) => state.saveBranding);
  const reloadData = useAppStore((state) => state.reloadData);

  // Settings states initialized from DB
  const [nameText, setNameText] = useState(branding.conventionName);
  const [fontFamily, setFontFamily] = useState(branding.style.fontFamily || 'Outfit');
  const [gradientStart, setGradientStart] = useState(branding.style.gradientStart || '#d4af37');
  const [gradientEnd, setGradientEnd] = useState(branding.style.gradientEnd || '#f9d976');
  const [shadowColor, setShadowColor] = useState(branding.style.shadowColor || 'rgba(212, 175, 55, 0.4)');
  const [glowStrength, setGlowStrength] = useState(branding.style.glowStrength || '10px');
  const [fontSize, setFontSize] = useState(branding.style.fontSize || '28px');

  // Preview styling
  const previewStyle = {
    fontFamily:
      fontFamily === 'Outfit'
        ? '"Outfit", sans-serif'
        : fontFamily === 'Inter'
        ? '"Inter", sans-serif'
        : 'sans-serif',
    fontSize: fontSize,
    fontWeight: 'bold',
    background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: `0px 2px ${glowStrength} ${shadowColor}`,
    display: 'inline-block',
    letterSpacing: '-0.5px',
    transition: 'all 0.3s ease',
    padding: '10px 0'
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!nameText.trim()) {
      alert('Convention Name cannot be empty.');
      return;
    }

    const payload = {
      conventionName: nameText,
      style: {
        fontFamily,
        gradientStart,
        gradientEnd,
        shadowColor,
        glowStrength,
        fontSize
      }
    };

    saveBranding(payload);
    db.addNotification('Branding style updated successfully! All headers updated.', 'success');
    reloadData();
  };

  return (
    <div className="branding-editor-card glass-panel animate-fade-in text-left">
      <div className="card-header-icon">🎨</div>
      <h3>Convention branding Style Editor</h3>
      <p className="subtitle">
        Customize the name text, fonts, colors, and shadows displayed at the top-left of the portal. Changes are saved globally.
      </p>

      <form onSubmit={handleSave} className="branding-form-grid">
        {/* LEFT: Inputs controls */}
        <div className="editor-controls-column">
          <div className="form-group">
            <label htmlFor="logo-name-input">Convention Hall Name</label>
            <input
              id="logo-name-input"
              type="text"
              value={nameText}
              onChange={(e) => setNameText(e.target.value)}
              className="theme-input font-bold"
              placeholder="e.g. Sri Srinivasa Grand Palace"
              required
            />
          </div>

          <div className="form-row-two">
            <div className="form-group">
              <label htmlFor="font-select">Branding Font Family</label>
              <select
                id="font-select"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="theme-dropdown"
              >
                <option value="Outfit">Outfit (Premium Elegant)</option>
                <option value="Inter">Inter (Modern Clean)</option>
                <option value="System">System Default</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="font-size-slider">Font Size: {fontSize}</label>
              <input
                id="font-size-slider"
                type="range"
                min="20"
                max="36"
                step="1"
                value={parseInt(fontSize)}
                onChange={(e) => setFontSize(`${e.target.value}px`)}
                className="theme-range-slider"
              />
            </div>
          </div>

          <div className="form-row-two">
            <div className="form-group">
              <label>Gradient Start Color</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="color-picker-dot"
                />
                <input
                  type="text"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="theme-input color-hex-text"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Gradient End Color</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="color-picker-dot"
                />
                <input
                  type="text"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="theme-input color-hex-text"
                />
              </div>
            </div>
          </div>

          <div className="form-row-two">
            <div className="form-group">
              <label>Glowing Shadow Color</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={shadowColor.startsWith('rgba') ? '#d4af37' : shadowColor}
                  onChange={(e) => setShadowColor(e.target.value)}
                  className="color-picker-dot"
                />
                <input
                  type="text"
                  value={shadowColor}
                  onChange={(e) => setShadowColor(e.target.value)}
                  className="theme-input color-hex-text"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="glow-strength-slider">Glow Blur: {glowStrength}</label>
              <input
                id="glow-strength-slider"
                type="range"
                min="0"
                max="20"
                step="1"
                value={parseInt(glowStrength)}
                onChange={(e) => setGlowStrength(`${e.target.value}px`)}
                className="theme-range-slider"
              />
            </div>
          </div>

          <button type="submit" className="save-branding-btn theme-btn-primary">
            Save Branding Style 💾
          </button>
        </div>

        {/* RIGHT: Live Visual Preview Card */}
        <div className="preview-display-column">
          <div className="preview-card-frame">
            <span className="frame-tag">Live Header Preview</span>
            <div className="preview-space">
              <span style={previewStyle}>{nameText}</span>
            </div>
            <p className="preview-footer">
              Your header will dynamically appear with these styles at the top-left of the portal.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

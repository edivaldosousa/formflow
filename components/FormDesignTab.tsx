'use client';

import React, { useState } from 'react';

export interface FormTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontSize: number;
  fontFamily: string;
  borderRadius: number;
  buttonStyle: 'rounded' | 'square' | 'pill';
  shadowEnabled: boolean;
}

const DEFAULT_THEME: FormTheme = {
  primaryColor: '#007bff',
  secondaryColor: '#6c757d',
  backgroundColor: '#ffffff',
  textColor: '#212529',
  borderColor: '#dee2e6',
  fontSize: 14,
  fontFamily: 'sans-serif',
  borderRadius: 4,
  buttonStyle: 'rounded',
  shadowEnabled: true,
};

export interface FormDesignTabProps {
  theme?: FormTheme;
  onThemeChange: (theme: FormTheme) => void;
}

export const FormDesignTab: React.FC<FormDesignTabProps> = ({
  theme = DEFAULT_THEME,
  onThemeChange,
}) => {
  const [selectedTab, setSelectedTab] = useState<'colors' | 'typography' | 'layout'>('colors');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  const handleColorChange = (key: keyof Omit<FormTheme, 'fontSize' | 'fontFamily' | 'borderRadius' | 'buttonStyle' | 'shadowEnabled'>, value: string) => {
    onThemeChange({ ...theme, [key]: value });
  };

  const handleNumberChange = (key: keyof Omit<FormTheme, 'primaryColor' | 'secondaryColor' | 'backgroundColor' | 'textColor' | 'borderColor' | 'fontFamily' | 'buttonStyle' | 'shadowEnabled'>, value: number) => {
    onThemeChange({ ...theme, [key]: value });
  };

  return (
    <div className="form-design-tab p-6">
      <div className="flex gap-6">
        {/* Left Panel: Controls */}
        <div className="flex-1 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b">
            {(['colors', 'typography', 'layout'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  selectedTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Colors Tab */}
          {selectedTab === 'colors' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                    placeholder="#007bff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                    placeholder="#212529"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {selectedTab === 'typography' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Font Size: {theme.fontSize}px</label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={theme.fontSize}
                  onChange={(e) => handleNumberChange('fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => onThemeChange({ ...theme, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="sans-serif">Sans-serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
            </div>
          )}

          {/* Layout Tab */}
          {selectedTab === 'layout' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Border Radius: {theme.borderRadius}px</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={theme.borderRadius}
                  onChange={(e) => handleNumberChange('borderRadius', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Button Style</label>
                <div className="flex gap-2">
                  {(['rounded', 'square', 'pill'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onThemeChange({ ...theme, buttonStyle: style })}
                      className={`px-3 py-2 border rounded transition-colors ${
                        theme.buttonStyle === style
                          ? 'bg-blue-100 border-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={theme.shadowEnabled}
                  onChange={(e) => onThemeChange({ ...theme, shadowEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Enable Shadows</label>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Live Preview */}
        <div className="flex-1">
          <div className="space-y-4">
            <h3 className="font-semibold">Live Preview</h3>
            <div
              className="p-6 border-2 rounded"
              style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                fontFamily: theme.fontFamily,
                fontSize: `${theme.fontSize}px`,
                borderRadius: `${theme.borderRadius}px`,
              }}
            >
              <h2 className="text-xl font-bold mb-4">Sample Form</h2>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border"
                    style={{
                      borderColor: theme.borderColor,
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 border"
                    style={{
                      borderColor: theme.borderColor,
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  />
                </div>
                <button
                  className="w-full px-4 py-2 text-white font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderRadius: theme.buttonStyle === 'pill' ? '20px' : theme.buttonStyle === 'square' ? '0px' : `${theme.borderRadius}px`,
                    boxShadow: theme.shadowEnabled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

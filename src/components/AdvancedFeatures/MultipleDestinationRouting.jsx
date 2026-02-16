// src/components/AdvancedFeatures/MultipleDestinationRouting.jsx
import React, { useState, useEffect } from 'react';
import './MultipleDestination.css';

// ----- Predefined option lists -----
const COUNTRY_OPTIONS = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
  'Spain', 'Italy', 'Netherlands', 'Australia', 'Japan',
  'China', 'India', 'Brazil', 'Mexico', 'South Africa',
  'Russia', 'South Korea', 'Turkey', 'Indonesia', 'Saudi Arabia',
  'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Belgium', 'Austria', 'Poland', 'Ukraine', 'Argentina',
  'Chile', 'Colombia', 'Peru', 'Venezuela', 'Nigeria',
  'Egypt', 'Kenya', 'Israel', 'UAE', 'Singapore',
  'Malaysia', 'Philippines', 'Thailand', 'Vietnam', 'Pakistan'
];

const OS_OPTIONS = ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Windows Phone', 'Chrome OS'];

const DEVICE_OPTIONS = ['desktop', 'mobile', 'tablet', 'bot', 'tv', 'console'];

const BROWSER_OPTIONS = [
  'Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Brave',
  'Internet Explorer', 'Samsung Internet', 'UC Browser', 'Yandex'
];

const TIME_PRESETS = [
  { label: 'Morning (06:00–12:00)', value: '06:00-12:00' },
  { label: 'Afternoon (12:00–18:00)', value: '12:00-18:00' },
  { label: 'Evening (18:00–00:00)', value: '18:00-00:00' },
  { label: 'Night (00:00–06:00)', value: '00:00-06:00' },
  { label: 'Custom', value: 'custom' }
];

// ----- Helper to get operator options per field -----
const getOperatorOptions = (field) => {
  const base = [
    { value: 'eq', label: 'equals' },
    { value: 'neq', label: 'not equals' }
  ];
  if (field === 'country' || field === 'language' || field === 'os' || field === 'browser' || field === 'device') {
    base.push({ value: 'in', label: 'in list' });
  }
  if (field === 'time') {
    return [{ value: 'between', label: 'between' }];
  }
  return base;
};

// ----- Individual condition row with smart inputs -----
const ConditionRow = ({ condition, onChange, onRemove }) => {
  const [customTime, setCustomTime] = useState(
    condition.value && !TIME_PRESETS.some(p => p.value === condition.value) ? condition.value : ''
  );
  const [timePreset, setTimePreset] = useState(
    TIME_PRESETS.find(p => p.value === condition.value) ? condition.value : 'custom'
  );

  const handleFieldChange = (newField) => {
    const newCondition = {
      ...condition,
      field: newField,
      operator: newField === 'time' ? 'between' : 'eq',
      value: ''
    };
    onChange(newCondition);
  };

  const handleOperatorChange = (newOp) => {
    onChange({ ...condition, operator: newOp, value: '' });
  };

  const handleValueChange = (newValue) => {
    onChange({ ...condition, value: newValue });
  };

  // Render appropriate value input based on field and operator
  const renderValueInput = () => {
    const { field, operator, value } = condition;

    if (field === 'country') {
      if (operator === 'in') {
        return (
          <div className="multi-select-input">
            <select
              multiple
              size="4"
              value={value ? value.split(',').map(v => v.trim()) : []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                handleValueChange(selected.join(', '));
              }}
            >
              {COUNTRY_OPTIONS.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <small className="field-hint">⌘/Ctrl to select multiple</small>
          </div>
        );
      }
      return (
        <select
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
        >
          <option value="" disabled>Select country</option>
          {COUNTRY_OPTIONS.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      );
    }

    if (field === 'os') {
      const options = OS_OPTIONS;
      if (operator === 'in') {
        return (
          <div className="multi-select-input">
            <select
              multiple
              size="4"
              value={value ? value.split(',').map(v => v.trim()) : []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                handleValueChange(selected.join(', '));
              }}
            >
              {options.map(os => <option key={os} value={os}>{os}</option>)}
            </select>
          </div>
        );
      }
      return (
        <select value={value} onChange={(e) => handleValueChange(e.target.value)}>
          <option value="" disabled>Select OS</option>
          {options.map(os => <option key={os} value={os}>{os}</option>)}
        </select>
      );
    }

    if (field === 'device') {
      const options = DEVICE_OPTIONS;
      if (operator === 'in') {
        return (
          <div className="multi-select-input">
            <select
              multiple
              size="4"
              value={value ? value.split(',').map(v => v.trim()) : []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                handleValueChange(selected.join(', '));
              }}
            >
              {options.map(dev => <option key={dev} value={dev}>{dev}</option>)}
            </select>
          </div>
        );
      }
      return (
        <select value={value} onChange={(e) => handleValueChange(e.target.value)}>
          <option value="" disabled>Select device</option>
          {options.map(dev => <option key={dev} value={dev}>{dev}</option>)}
        </select>
      );
    }

    if (field === 'browser') {
      const options = BROWSER_OPTIONS;
      if (operator === 'in') {
        return (
          <div className="multi-select-input">
            <select
              multiple
              size="4"
              value={value ? value.split(',').map(v => v.trim()) : []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                handleValueChange(selected.join(', '));
              }}
            >
              {options.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        );
      }
      return (
        <select value={value} onChange={(e) => handleValueChange(e.target.value)}>
          <option value="" disabled>Select browser</option>
          {options.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      );
    }

    if (field === 'time') {
      return (
        <div className="time-input-group">
          <select
            value={timePreset}
            onChange={(e) => {
              const preset = e.target.value;
              setTimePreset(preset);
              if (preset !== 'custom') {
                handleValueChange(preset);
                setCustomTime('');
              } else {
                handleValueChange(customTime);
              }
            }}
          >
            {TIME_PRESETS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {timePreset === 'custom' && (
            <input
              type="text"
              placeholder="HH:MM-HH:MM"
              value={customTime}
              onChange={(e) => {
                setCustomTime(e.target.value);
                handleValueChange(e.target.value);
              }}
              pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
            />
          )}
        </div>
      );
    }

    if (field === 'language') {
      return (
        <input
          type="text"
          placeholder="e.g., en, fr, de"
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
        />
      );
    }

    // Default fallback – simple text input
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="Enter value"
      />
    );
  };

  return (
    <div className="condition-row">
      <select
        className="field-select"
        value={condition.field}
        onChange={(e) => handleFieldChange(e.target.value)}
      >
        <option value="country">Country</option>
        <option value="language">Language</option>
        <option value="os">Operating System</option>
        <option value="device">Device Type</option>
        <option value="browser">Browser</option>
        <option value="time">Time of Day</option>
      </select>

      <select
        className="operator-select"
        value={condition.operator}
        onChange={(e) => handleOperatorChange(e.target.value)}
        disabled={condition.field === 'time' && condition.operator === 'between'} // time only has between
      >
        {getOperatorOptions(condition.field).map(op => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      <div className="value-input">
        {renderValueInput()}
      </div>

      <button
        type="button"
        className="remove-condition-btn"
        onClick={onRemove}
        title="Remove condition"
      >
        ×
      </button>
    </div>
  );
};

// ----- Main Component -----
const MultipleDestinationRouting = ({ rules = [], onChange }) => {
  const [enabled, setEnabled] = useState(rules.length > 0);
  const [destRules, setDestRules] = useState(rules);

  useEffect(() => {
    if (enabled) {
      onChange(destRules);
    } else {
      onChange([]);
    }
  }, [enabled, destRules, onChange]);

  const addRule = () => {
    setDestRules([
      ...destRules,
      {
        id: Date.now() + Math.random(),
        destination: '',
        conditions: [{ field: 'country', operator: 'eq', value: '' }],
        priority: destRules.length
      }
    ]);
  };

  const updateRule = (index, updatedRule) => {
    const newRules = [...destRules];
    newRules[index] = updatedRule;
    setDestRules(newRules);
  };

  const removeRule = (index) => {
    const newRules = destRules.filter((_, i) => i !== index);
    setDestRules(newRules);
  };

  const addCondition = (ruleIndex) => {
    const rule = { ...destRules[ruleIndex] };
    rule.conditions = [
      ...rule.conditions,
      { field: 'country', operator: 'eq', value: '' }
    ];
    updateRule(ruleIndex, rule);
  };

  const updateCondition = (ruleIndex, condIndex, updatedCondition) => {
    const rule = { ...destRules[ruleIndex] };
    rule.conditions[condIndex] = updatedCondition;
    updateRule(ruleIndex, rule);
  };

  const removeCondition = (ruleIndex, condIndex) => {
    const rule = { ...destRules[ruleIndex] };
    rule.conditions = rule.conditions.filter((_, i) => i !== condIndex);
    updateRule(ruleIndex, rule);
  };

  // Simple validation
  const isRuleValid = (rule) => {
    if (!rule.destination || !rule.destination.trim()) return false;
    return rule.conditions.every(cond => cond.value && cond.value.trim() !== '');
  };

  return (
    <div className="feature-multiple-destination">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            if (!e.target.checked) setDestRules([]);
          }}
        />
        <span className="checkbox-custom"></span>
        <span className="checkbox-text">
          Route visitors to different destinations
        </span>
      </label>

      {enabled && (
        <div className="rules-container">
          {destRules.map((rule, ruleIndex) => (
            <div
              key={rule.id || ruleIndex}
              className={`rule-card ${!isRuleValid(rule) ? 'rule-invalid' : ''}`}
            >
              <div className="rule-header">
                <div className="rule-title">
                  <span className="rule-number">Rule #{ruleIndex + 1}</span>
                  {!isRuleValid(rule) && (
                    <span className="validation-warning">⚠️ Incomplete</span>
                  )}
                </div>
                <button
                  type="button"
                  className="remove-rule-btn"
                  onClick={() => removeRule(ruleIndex)}
                  title="Remove rule"
                >
                  ×
                </button>
              </div>

              <div className="rule-destination">
                <label className="feature-label">
                  Destination URL *
                  <div className="destination-input-wrapper">
                    <input
                      type="url"
                      value={rule.destination}
                      onChange={(e) => updateRule(ruleIndex, { ...rule, destination: e.target.value })}
                      placeholder="https://example.com"
                      className={!rule.destination ? 'error' : ''}
                      required
                    />
                    {!rule.destination && (
                      <span className="field-error">Required</span>
                    )}
                  </div>
                </label>
              </div>

              <div className="rule-conditions">
                <label className="feature-label">Conditions</label>
                {rule.conditions.map((cond, condIndex) => (
                  <ConditionRow
                    key={condIndex}
                    condition={cond}
                    onChange={(updatedCond) => updateCondition(ruleIndex, condIndex, updatedCond)}
                    onRemove={() => removeCondition(ruleIndex, condIndex)}
                  />
                ))}

                <button
                  type="button"
                  className="add-condition-btn"
                  onClick={() => addCondition(ruleIndex)}
                >
                  + Add condition
                </button>
              </div>

              {/* Rule preview / summary */}
              {rule.conditions.length > 0 && rule.destination && (
                <div className="rule-preview">
                  <strong>When</strong>{' '}
                  {rule.conditions.map((cond, idx) => (
                    <span key={idx}>
                      {idx > 0 && ' and '}
                      <span className="condition-tag">
                        {cond.field}: {cond.operator}{' '}
                        {cond.field === 'time' ? cond.value : `"${cond.value}"`}
                      </span>
                    </span>
                  ))}
                  {' → '}
                  <span className="destination-preview">{rule.destination}</span>
                </div>
              )}
            </div>
          ))}

          <div className="rules-actions">
            <button type="button" className="add-rule-btn" onClick={addRule}>
              + Add another rule
            </button>
          </div>

          <div className="feature-note">
            <span className="note-icon">ℹ️</span>
            Rules are evaluated in order (top to bottom). The first matching rule will be used. If no rule matches, the default destination is used.
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleDestinationRouting;
/**
 * Control Panel - Broadcast operator interface
 * Professional broadcast control with visual zone mapping and drag-and-drop
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEvents, useBroadcastSync } from '../hooks/index.js';
import { formatPrice, formatVolume } from '../utils/formatters.js';
import {
  getAllThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  resetTheme,
  builtInThemes,
  colorLabels,
  defaultColors,
} from '../themes/themes.js';

// Design system - Mission Control aesthetic
const UI = {
  // Base colors
  bg: '#08090c',
  surface: '#0f1115',
  surfaceHover: '#161a20',
  surfaceActive: '#1c2128',
  border: '#262d38',
  borderHover: '#3d4856',

  // Text
  text: '#e8eaed',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  // Accents
  accent: '#3b82f6',
  accentHover: '#60a5fa',
  accentMuted: 'rgba(59, 130, 246, 0.15)',

  // Zone colors
  zones: {
    header: '#8b5cf6',
    main: '#3b82f6',
    featured: '#6366f1',
    secondary: '#8b5cf6',
    sidebar: '#f59e0b',
    lowerThird: '#10b981',
    bottomCorner: '#ec4899',
    ticker: '#06b6d4',
  },

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',

  // Shadows
  glow: (color) => `0 0 20px ${color}33, 0 0 40px ${color}11`,
};

// Zone metadata for visibility toggles (only top-level zones)
const ZONE_INFO = {
  header: { label: 'Header', desc: 'Logo, live indicator, countdown timer' },
  main: { label: 'Main', desc: 'Featured market and secondary grid' },
  sidebar: { label: 'Sidebar', desc: 'Right column - trending/big movers' },
  lowerThird: { label: 'Lower Third', desc: 'Editorial content rotation' },
  bottomCorner: { label: 'QR Code', desc: 'Voting companion link' },
  ticker: { label: 'Ticker', desc: 'Scrolling market summaries' },
};

// Sub-zone metadata for mini-map display
const SUB_ZONE_INFO = {
  featured: { label: 'Featured', desc: 'Trending market with price chart' },
  secondary: { label: 'Secondary', desc: 'Rotating market cards grid' },
};

// ============================================================================
// COMPONENTS
// ============================================================================

function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseEnter = (e) => {
    setShow(true);
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setPosition({ x: rect.left + rect.width / 2, y: rect.top });
    }
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {children}
      {show && (
        <div style={{
          position: 'fixed',
          left: position.x,
          top: position.y - 8,
          transform: 'translate(-50%, -100%)',
          padding: '6px 10px',
          backgroundColor: UI.surfaceActive,
          color: UI.text,
          fontSize: '11px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          border: `1px solid ${UI.border}`,
          pointerEvents: 'none',
        }}>
          {text}
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '8px',
            height: '8px',
            backgroundColor: UI.surfaceActive,
            borderRight: `1px solid ${UI.border}`,
            borderBottom: `1px solid ${UI.border}`,
          }} />
        </div>
      )}
    </div>
  );
}

function StatusIndicator({ connected, lastUpdate, eventCount }) {
  const [timeSince, setTimeSince] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdate) {
        setTimeSince(Math.floor((Date.now() - lastUpdate) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Tooltip text={connected ? 'Broadcasting to viewers' : 'No broadcast connection'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: connected ? UI.success : UI.error,
            boxShadow: connected ? UI.glow(UI.success) : 'none',
            animation: connected ? 'pulse 2s infinite' : 'none',
          }} />
          <span style={{ fontSize: '12px', color: UI.textSecondary }}>
            {connected ? 'Broadcasting' : 'Disconnected'}
          </span>
        </div>
      </Tooltip>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 10px',
        backgroundColor: UI.surfaceHover,
        borderRadius: '6px',
      }}>
        <span style={{ fontSize: '11px', color: UI.textMuted }}>
          {eventCount} markets
        </span>
        <span style={{ color: UI.border }}>·</span>
        <span style={{ fontSize: '11px', color: UI.textMuted }}>
          {timeSince}s ago
        </span>
      </div>
    </div>
  );
}

function QuickActions({ onClearAll, onResetDefaults }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={onResetDefaults}
        style={{
          padding: '6px 12px',
          backgroundColor: 'transparent',
          color: UI.textSecondary,
          border: `1px solid ${UI.border}`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = UI.borderHover;
          e.target.style.color = UI.text;
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = UI.border;
          e.target.style.color = UI.textSecondary;
        }}
      >
        ↺ Reset Defaults
      </button>
      <button
        onClick={onClearAll}
        style={{
          padding: '6px 12px',
          backgroundColor: 'transparent',
          color: UI.error,
          border: `1px solid ${UI.error}44`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = `${UI.error}11`;
          e.target.style.borderColor = UI.error;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.borderColor = `${UI.error}44`;
        }}
      >
        ✕ Clear All Zones
      </button>
    </div>
  );
}

function Panel({ title, collapsed, onToggle, children, badge, allowOverflow }) {
  return (
    <div style={{
      backgroundColor: UI.surface,
      borderRadius: '12px',
      border: `1px solid ${UI.border}`,
      overflow: allowOverflow ? 'visible' : 'hidden',
      transition: 'all 0.2s ease',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderBottom: collapsed ? 'none' : `1px solid ${UI.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            color: UI.text,
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}>
            {title}
          </span>
          {badge !== undefined && (
            <span style={{
              padding: '2px 8px',
              backgroundColor: UI.accentMuted,
              color: UI.accent,
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 600,
            }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{
          color: UI.textMuted,
          fontSize: '14px',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}>
          ▼
        </span>
      </button>
      <div style={{
        maxHeight: collapsed ? '0px' : '2000px',
        overflow: allowOverflow ? 'visible' : 'hidden',
        transition: collapsed ? 'max-height 0.3s ease' : 'none',
      }}>
        <div style={{ padding: '16px', overflow: allowOverflow ? 'visible' : 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: UI.bg,
          color: UI.text,
          border: `1px solid ${UI.border}`,
          borderRadius: '8px',
          fontSize: '13px',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => e.target.style.borderColor = UI.accent}
        onBlur={(e) => e.target.style.borderColor = UI.border}
      />
    </div>
  );
}

function HighlightedText({ text, highlight }) {
  if (!highlight || !text) return text;

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} style={{
            backgroundColor: UI.accentMuted,
            color: UI.accent,
            padding: '0 2px',
            borderRadius: '2px',
          }}>
            {part}
          </mark>
        ) : part
      )}
    </span>
  );
}

function EventCard({ event, searchTerm, onDragStart, isAssigned, isSelected, onSelect, selectedCount }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = (e) => {
    // Simple click to toggle selection
    onSelect(event);
  };

  return (
    <div
      draggable
      onClick={handleClick}
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, event);
      }}
      onDragEnd={() => setIsDragging(false)}
      style={{
        padding: '12px 14px',
        backgroundColor: isSelected ? UI.accentMuted : (isDragging ? UI.surfaceActive : UI.surfaceHover),
        borderRadius: '8px',
        cursor: 'grab',
        marginBottom: '8px',
        border: `2px solid ${isSelected ? UI.accent : 'transparent'}`,
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isDragging && !isSelected) e.currentTarget.style.backgroundColor = UI.surfaceActive;
      }}
      onMouseLeave={(e) => {
        if (!isDragging && !isSelected) e.currentTarget.style.backgroundColor = UI.surfaceHover;
      }}
    >
      {/* Selection checkbox */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '18px',
        height: '18px',
        borderRadius: '4px',
        border: `2px solid ${isSelected ? UI.accent : UI.border}`,
        backgroundColor: isSelected ? UI.accent : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}>
        {isSelected && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>}
      </div>

      {/* Assigned indicator */}
      {isAssigned && !isSelected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: UI.success,
        }} />
      )}

      {/* Multi-select badge when dragging */}
      {isSelected && selectedCount > 1 && (
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: UI.accent,
          color: '#fff',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          {selectedCount}
        </div>
      )}

      <div style={{
        color: UI.text,
        fontWeight: 500,
        fontSize: '13px',
        marginBottom: '4px',
        marginLeft: '28px',
        lineHeight: 1.3,
      }}>
        <HighlightedText text={event.title} highlight={searchTerm} />
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: UI.textMuted,
        fontSize: '11px',
        marginLeft: '28px',
      }}>
        <span>{event.outcomes?.length || 0} outcomes</span>
        <span>{formatVolume(event.totalVolume)}</span>
      </div>
    </div>
  );
}

function EventBrowser({
  events,
  loading,
  searchTerm,
  onSearchChange,
  onDragStart,
  assignedEventIds,
  selectedIds,
  onSelect,
  onClearSelection
}) {
  const filteredEvents = searchTerm
    ? events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.outcomes?.some(o => o.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : events;

  const selectedCount = selectedIds.size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search markets..."
      />

      {/* Selection toolbar */}
      {selectedCount > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: UI.accentMuted,
          borderRadius: '8px',
          border: `1px solid ${UI.accent}33`,
        }}>
          <span style={{ fontSize: '12px', color: UI.accent, fontWeight: 600 }}>
            {selectedCount} market{selectedCount > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            style={{
              padding: '4px 10px',
              backgroundColor: 'transparent',
              color: UI.textSecondary,
              border: `1px solid ${UI.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Clear
          </button>
        </div>
      )}

      <div style={{ fontSize: '11px', color: UI.textMuted, padding: '0 4px' }}>
        Click to select · Drag selection to zones
      </div>

      <div style={{
        maxHeight: 'calc(100vh - 300px)',
        minHeight: '400px',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '4px',
      }}>
        {loading ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: UI.textMuted,
            fontSize: '13px',
          }}>
            Loading markets...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: UI.textMuted,
            fontSize: '13px',
          }}>
            {searchTerm ? 'No markets match your search' : 'No markets available'}
          </div>
        ) : (
          filteredEvents.slice(0, 50).map(event => (
            <EventCard
              key={event.id}
              event={event}
              searchTerm={searchTerm}
              onDragStart={onDragStart}
              isAssigned={assignedEventIds.has(event.id)}
              isSelected={selectedIds.has(event.id)}
              onSelect={onSelect}
              selectedCount={selectedCount}
            />
          ))
        )}
      </div>

      {filteredEvents.length > 50 && (
        <div style={{
          textAlign: 'center',
          color: UI.textMuted,
          fontSize: '11px',
          padding: '8px',
        }}>
          Showing 50 of {filteredEvents.length} markets
        </div>
      )}
    </div>
  );
}

function ZoneMiniMap({ zones, onDrop, dropTarget, assignedContent, flipped = false }) {
  const [localDropTarget, setLocalDropTarget] = useState(null);
  const activeTarget = dropTarget || localDropTarget;

  const handleDragOver = (e, zoneId) => {
    e.preventDefault();
    setLocalDropTarget(zoneId);
  };

  const handleDragLeave = () => {
    setLocalDropTarget(null);
  };

  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    setLocalDropTarget(null);
    onDrop(zoneId);
  };

  // Drop target slot for sub-zones (featured, secondary) - smaller to fit inside Main
  const SubZoneSlot = ({ id }) => {
    const info = SUB_ZONE_INFO[id];
    const color = UI.zones[id];
    const isTarget = activeTarget === id;
    const content = assignedContent[id];

    return (
      <div
        onDragOver={(e) => handleDragOver(e, id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, id)}
        style={{
          flex: 1,
          backgroundColor: isTarget ? `${color}22` : UI.bg,
          border: `2px ${isTarget ? 'solid' : 'dashed'} ${isTarget ? color : UI.border}`,
          borderRadius: '4px',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          position: 'relative',
          minHeight: '36px',
        }}
      >
        <span style={{
          fontSize: '9px',
          fontWeight: 600,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: content ? '2px' : 0,
        }}>
          {info.label}
        </span>
        {content && (
          <div style={{
            fontSize: '8px',
            color: UI.textMuted,
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {content}
          </div>
        )}
        {isTarget && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}44`,
            color: color,
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '2px',
          }}>
            Drop here
          </div>
        )}
      </div>
    );
  };

  // Standard zone slot
  // locked: zone cannot be changed (header, QR code)
  // autoLabel: text to show for auto-populated zones (e.g., "Biggest Movers")
  const ZoneSlot = ({ id, showContent = true, locked = false, autoLabel = null, children }) => {
    const info = ZONE_INFO[id];
    const color = UI.zones[id];
    const isTarget = !locked && activeTarget === id;
    const content = assignedContent[id];
    const isVisible = zones[id]?.visible !== false;

    // If children provided, render as container
    if (children) {
      return (
        <div style={{
          backgroundColor: UI.surfaceHover,
          border: `2px solid ${color}`,
          borderRadius: '8px',
          padding: '8px',
          opacity: isVisible ? 1 : 0.4,
          transition: 'opacity 0.2s ease',
        }}>
          {/* Main label */}
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: color,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
            textAlign: 'center',
          }}>
            {info.label}
          </div>
          {children}
        </div>
      );
    }

    // Locked zones have solid border and lock icon
    const borderStyle = locked ? 'solid' : (isTarget ? 'solid' : 'dashed');
    const borderColor = locked ? UI.border : (isTarget ? color : UI.border);

    return (
      <div
        onDragOver={locked ? undefined : (e) => handleDragOver(e, id)}
        onDragLeave={locked ? undefined : handleDragLeave}
        onDrop={locked ? undefined : (e) => handleDrop(e, id)}
        style={{
          backgroundColor: isTarget ? `${color}22` : UI.surfaceHover,
          border: `2px ${borderStyle} ${borderColor}`,
          borderRadius: '8px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          opacity: isVisible ? (locked ? 0.6 : 1) : 0.4,
          position: 'relative',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
          cursor: locked ? 'not-allowed' : 'default',
        }}
      >
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          color: locked ? UI.textMuted : color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: (showContent && content) || autoLabel ? '4px' : 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {info.label}
          {locked && <span style={{ fontSize: '7px', opacity: 0.7 }}>(Fixed)</span>}
        </span>
        {autoLabel && (
          <div style={{
            fontSize: '8px',
            color: UI.textMuted,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            {autoLabel}
          </div>
        )}
        {showContent && content && !autoLabel && (
          <div style={{
            fontSize: '9px',
            color: UI.textMuted,
            textAlign: 'center',
          }}>
            {content}
          </div>
        )}
        {isTarget && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}44`,
            color: color,
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '6px',
          }}>
            Drop here
          </div>
        )}
      </div>
    );
  };

  // Main container with Featured and Secondary sub-zones (grey background like other zones)
  const MainZone = () => {
    const isVisible = zones.main?.visible !== false;
    const color = UI.zones.main;
    return (
      <div style={{
        backgroundColor: UI.surfaceHover,
        border: `2px dashed ${UI.border}`,
        borderRadius: '8px',
        padding: '8px',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        opacity: isVisible ? 1 : 0.4,
        transition: 'opacity 0.2s ease',
      }}>
        {/* Main label - centered */}
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '6px',
          textAlign: 'center',
        }}>
          Main
        </div>
        {/* Sub-zones - smaller inside the container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <SubZoneSlot id="featured" />
          <SubZoneSlot id="secondary" />
        </div>
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: UI.bg,
      borderRadius: '8px',
      padding: '12px',
      border: `1px solid ${UI.border}`,
    }}>
      {/* Grid layout - sidebar spans main + lowerthird rows */}
      <div style={{
        display: 'grid',
        gridTemplateAreas: flipped
          ? `"header header"
             "sidebar main"
             "sidebar main"
             "bottomcorner lowerthird"
             "ticker ticker"`
          : `"header header"
             "main sidebar"
             "main sidebar"
             "lowerthird bottomcorner"
             "ticker ticker"`,
        gridTemplateColumns: flipped ? '100px 1fr' : '1fr 100px',
        gridTemplateRows: '32px 55px 55px 50px 28px',
        gap: '6px',
      }}>
        <div style={{ gridArea: 'header' }}>
          <ZoneSlot id="header" showContent={false} locked />
        </div>
        <div style={{ gridArea: 'main' }}>
          <MainZone />
        </div>
        <div style={{ gridArea: 'sidebar' }}>
          <ZoneSlot id="sidebar" autoLabel="Biggest Movers (Auto)" />
        </div>
        <div style={{ gridArea: 'lowerthird' }}>
          <ZoneSlot id="lowerThird" autoLabel="Editorial (Auto)" />
        </div>
        <div style={{ gridArea: 'bottomcorner' }}>
          <ZoneSlot id="bottomCorner" showContent={false} locked />
        </div>
        <div style={{ gridArea: 'ticker' }}>
          <ZoneSlot id="ticker" showContent={false} />
        </div>
      </div>

      <div style={{
        marginTop: '10px',
        fontSize: '11px',
        color: UI.textMuted,
        textAlign: 'center',
      }}>
        Drag markets to assign zones
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      padding: '8px 0',
    }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: '36px',
          height: '20px',
          backgroundColor: checked ? UI.accent : UI.border,
          borderRadius: '10px',
          position: 'relative',
          transition: 'background-color 0.2s ease',
        }}
      >
        <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: checked ? '18px' : '2px',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
      <span style={{ color: UI.text, fontSize: '12px' }}>{label}</span>
    </label>
  );
}

function ZoneVisibilityToggles({ zones, onToggle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {Object.entries(ZONE_INFO).map(([id, info]) => (
        <div
          key={id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = UI.surfaceHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div>
            <div style={{ fontSize: '12px', color: UI.text, fontWeight: 500 }}>
              {info.label}
            </div>
            <div style={{ fontSize: '10px', color: UI.textMuted }}>
              {info.desc}
            </div>
          </div>
          <ToggleSwitch
            checked={zones[id]?.visible !== false}
            onChange={(v) => onToggle(id, v)}
            label=""
          />
        </div>
      ))}
    </div>
  );
}

function ColorPicker({ label, value, onChange }) {
  const [localValue, setLocalValue] = useState(value);

  // Handle hex colors and rgba
  const isRgba = value?.startsWith('rgba');
  const hexValue = isRgba ? '#888888' : value;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 0',
    }}>
      <span style={{ fontSize: '11px', color: UI.textSecondary }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="color"
          value={hexValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange(e.target.value);
          }}
          style={{
            width: '28px',
            height: '28px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: 'transparent',
          }}
        />
        <input
          type="text"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange(e.target.value);
          }}
          style={{
            width: '90px',
            padding: '4px 8px',
            backgroundColor: UI.bg,
            color: UI.text,
            border: `1px solid ${UI.border}`,
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
          }}
        />
      </div>
    </div>
  );
}

function ThemeEditor({ theme, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(theme?.name || 'New Theme');
  const [colors, setColors] = useState(theme?.colors || { ...defaultColors });

  const handleColorChange = (key, value) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave({ name, colors });
  };

  const isBuiltIn = theme?.builtIn;
  const isModified = theme && builtInThemes[theme.id];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        width: '400px',
        maxHeight: '90vh',
        backgroundColor: UI.surface,
        borderRadius: '12px',
        border: `1px solid ${UI.border}`,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: `1px solid ${UI.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ color: UI.text, fontSize: '14px', fontWeight: 600, margin: 0 }}>
            {theme ? 'Edit Theme' : 'New Theme'}
          </h3>
          <button
            onClick={onCancel}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              color: UI.textMuted,
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Theme name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: UI.textMuted, marginBottom: '6px' }}>
              Theme Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: UI.bg,
                color: UI.text,
                border: `1px solid ${UI.border}`,
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Preview */}
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            borderRadius: '8px',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '8px' }}>PREVIEW</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: colors.primary }} />
              <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: colors.secondary }} />
              <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: colors.tertiary }} />
              <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: colors.accent }} />
            </div>
            <div style={{ color: colors.text, fontSize: '12px' }}>Sample text</div>
            <div style={{ color: colors.textMuted, fontSize: '11px' }}>Muted text</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span style={{ color: colors.positive, fontSize: '11px' }}>+5.2%</span>
              <span style={{ color: colors.negative, fontSize: '11px' }}>-3.1%</span>
            </div>
          </div>

          {/* Color pickers */}
          <div style={{ fontSize: '11px', color: UI.textMuted, marginBottom: '8px' }}>COLORS</div>
          {Object.entries(colorLabels).map(([key, label]) => (
            <ColorPicker
              key={key}
              label={label}
              value={colors[key]}
              onChange={(value) => handleColorChange(key, value)}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${UI.border}`,
          display: 'flex',
          gap: '8px',
          justifyContent: 'space-between',
        }}>
          <div>
            {theme && !isBuiltIn && (
              <button
                onClick={() => onDelete(theme.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: UI.error,
                  border: `1px solid ${UI.error}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Delete
              </button>
            )}
            {isModified && isBuiltIn && (
              <button
                onClick={() => {
                  resetTheme(theme.id);
                  onCancel();
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: UI.textSecondary,
                  border: `1px solid ${UI.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Reset to Default
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: UI.textSecondary,
                border: `1px solid ${UI.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                backgroundColor: UI.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Save Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeManager({ currentTheme, onSelect, onThemesChanged }) {
  const [themes, setThemes] = useState(() => Object.values(getAllThemes()));
  const [editingTheme, setEditingTheme] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const refreshThemes = () => {
    setThemes(Object.values(getAllThemes()));
    onThemesChanged?.();
  };

  const handleCreateNew = () => {
    setEditingTheme(null);
    setShowEditor(true);
  };

  const handleEdit = (theme) => {
    setEditingTheme(theme);
    setShowEditor(true);
  };

  const handleSave = ({ name, colors }) => {
    if (editingTheme) {
      updateTheme(editingTheme.id, { name, colors });
    } else {
      const newTheme = createTheme(name, colors);
      onSelect(newTheme.id);
    }
    refreshThemes();
    setShowEditor(false);
  };

  const handleDelete = (id) => {
    if (deleteTheme(id)) {
      if (currentTheme === id) {
        onSelect('default');
      }
      refreshThemes();
      setShowEditor(false);
    }
  };

  const current = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div>
      {/* Theme list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '12px',
        maxHeight: '300px',
        overflowY: 'auto',
      }}>
        {themes.map(theme => (
          <div
            key={theme.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              backgroundColor: currentTheme === theme.id ? UI.accentMuted : 'transparent',
              border: `1px solid ${currentTheme === theme.id ? UI.accent : 'transparent'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onClick={() => onSelect(theme.id)}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: `linear-gradient(135deg, ${theme.colors.primary} 50%, ${theme.colors.accent} 50%)`,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px',
                color: UI.text,
                fontWeight: currentTheme === theme.id ? 600 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {theme.name}
              </div>
              {!theme.builtIn && (
                <div style={{ fontSize: '10px', color: UI.textMuted }}>Custom</div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(theme);
              }}
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                color: UI.textMuted,
                border: `1px solid ${UI.border}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
              }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Create new button */}
      <button
        onClick={handleCreateNew}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: 'transparent',
          color: UI.accent,
          border: `1px dashed ${UI.accent}`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        + Create New Theme
      </button>

      {/* Editor modal */}
      {showEditor && (
        <ThemeEditor
          theme={editingTheme}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function LivePreview() {
  const [landscapeError, setLandscapeError] = useState(false);
  const [portraitError, setPortraitError] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Labels */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, fontSize: '10px', fontWeight: 600, color: UI.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          16:9 Landscape
        </div>
        <div style={{ width: '80px', fontSize: '10px', fontWeight: 600, color: UI.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          9:16 Portrait
        </div>
      </div>

      {/* Previews */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Landscape Preview */}
        <div
          style={{
            flex: 1,
            backgroundColor: UI.bg,
            borderRadius: '8px',
            border: `1px solid ${UI.border}`,
            aspectRatio: '16/9',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {landscapeError ? (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: UI.textMuted,
              fontSize: '11px',
              gap: '6px',
            }}>
              <span style={{ fontSize: '20px' }}>📺</span>
              <span>Preview unavailable</span>
            </div>
          ) : (
            <iframe
              src="/broadcast?preview=true"
              title="Landscape Preview"
              style={{
                width: '1920px',
                height: '1080px',
                border: 'none',
                transform: 'scale(0.15)',
                transformOrigin: 'top left',
                pointerEvents: 'none',
              }}
              onError={() => setLandscapeError(true)}
            />
          )}
        </div>

        {/* Portrait Preview */}
        <div
          style={{
            width: '80px',
            backgroundColor: UI.bg,
            borderRadius: '8px',
            border: `1px solid ${UI.border}`,
            aspectRatio: '9/16',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {portraitError ? (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: UI.textMuted,
              fontSize: '9px',
              gap: '4px',
            }}>
              <span style={{ fontSize: '16px' }}>📱</span>
              <span>N/A</span>
            </div>
          ) : (
            <iframe
              src="/broadcast/portrait?preview=true"
              title="Portrait Preview"
              style={{
                width: '1080px',
                height: '1920px',
                border: 'none',
                transform: 'scale(0.074)',
                transformOrigin: 'top left',
                pointerEvents: 'none',
              }}
              onError={() => setPortraitError(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AssignmentFeedback({ message, type }) {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '12px 20px',
      backgroundColor: type === 'success' ? UI.success : UI.error,
      color: '#fff',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      animation: 'slideIn 0.3s ease',
      zIndex: 1000,
    }}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Control() {
  // Market source toggle - false = filtered by env vars, true = all markets
  const [fetchAllMarkets, setFetchAllMarkets] = useState(false);
  const { events, loading, meta } = useEvents({ fetchAll: fetchAllMarkets });
  const { state, setZoneVisibility, assignContent, setTheme, setFlipped } = useBroadcastSync({ isController: true });

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedPanels, setCollapsedPanels] = useState({});
  const [selectedEventIds, setSelectedEventIds] = useState(new Set());
  const [dropTarget, setDropTarget] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [connected, setConnected] = useState(true);

  // Update timestamp periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Track assigned event IDs
  const assignedEventIds = new Set();
  const mainContent = state.zones?.main?.content;
  if (mainContent?.featured?.id) assignedEventIds.add(mainContent.featured.id);
  mainContent?.secondary?.forEach(e => e?.id && assignedEventIds.add(e.id));
  if (state.zones?.sidebar?.content?.event?.id) assignedEventIds.add(state.zones.sidebar.content.event.id);

  // Get selected events as array
  const getSelectedEvents = useCallback(() => {
    return events.filter(e => selectedEventIds.has(e.id));
  }, [events, selectedEventIds]);

  // Get assigned content for mini-map display
  const getAssignedContent = () => {
    const content = {};
    const main = state.zones?.main?.content;

    // Featured zone content
    if (main?.featured) {
      content.featured = main.featured.title;
    } else if (main?.rotation?.zone === 'featured') {
      content.featured = `${main.rotation.events.length} rotating`;
    } else {
      content.featured = 'Trending (auto)';
    }

    // Secondary zone content
    if (main?.secondary?.length > 0) {
      content.secondary = `${main.secondary.length} market${main.secondary.length > 1 ? 's' : ''}`;
    }
    if (main?.rotation?.zone === 'secondary') {
      content.secondary = `${main.rotation.events.length} rotating`;
    }

    const sidebar = state.zones?.sidebar?.content;
    if (sidebar?.event) content.sidebar = sidebar.event.title;

    return content;
  };

  // Panel toggle
  const togglePanel = (id) => {
    setCollapsedPanels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Selection handlers
  const handleSelect = (event) => {
    setSelectedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(event.id)) {
        newSet.delete(event.id);
      } else {
        newSet.add(event.id);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedEventIds(new Set());
  };

  // Drag and drop handlers
  const handleDragStart = (e, event) => {
    // If dragging an unselected event, select only that one
    if (!selectedEventIds.has(event.id)) {
      setSelectedEventIds(new Set([event.id]));
    }
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (zoneId) => {
    const selectedEvents = getSelectedEvents();
    if (selectedEvents.length === 0) return;

    setDropTarget(null);

    const count = selectedEvents.length;
    const isMulti = count > 1;

    // Assign to zone based on selection count
    if (zoneId === 'featured') {
      // Drop to Featured zone - sets the main featured market
      const current = state.zones?.main?.content || {};
      if (isMulti) {
        // Multiple events - set up rotation for featured
        assignContent('main', {
          type: 'featuredLayout',
          featured: selectedEvents[0],
          secondary: current.secondary || [],
          rotation: { events: selectedEvents, zone: 'featured', interval: 15000 },
        });
        showFeedback(`${count} markets rotating in Featured`, 'success');
      } else {
        assignContent('main', {
          type: 'featuredLayout',
          featured: selectedEvents[0],
          secondary: current.secondary || [],
        });
        showFeedback(`Assigned to Featured`, 'success');
      }
    } else if (zoneId === 'secondary') {
      // Drop to Secondary zone - sets the secondary markets grid
      const current = state.zones?.main?.content || {};
      if (isMulti) {
        // Multiple events - set up rotation for secondary
        assignContent('main', {
          type: 'featuredLayout',
          featured: current.featured || null,
          secondary: selectedEvents.slice(0, 3),
          rotation: { events: selectedEvents, zone: 'secondary', interval: 20000 },
        });
        showFeedback(`${count} markets rotating in Secondary`, 'success');
      } else {
        // Single event - add to secondary list
        const existingSecondary = current.secondary || [];
        assignContent('main', {
          type: 'featuredLayout',
          featured: current.featured || null,
          secondary: [...existingSecondary, selectedEvents[0]].slice(0, 6),
        });
        showFeedback(`Added to Secondary markets`, 'success');
      }
    } else if (zoneId === 'sidebar') {
      if (isMulti) {
        assignContent('sidebar', {
          type: 'eventGroup',
          event: selectedEvents[0],
          rotation: { events: selectedEvents, interval: 15000 },
        });
        showFeedback(`${count} markets rotating in Sidebar`, 'success');
      } else {
        assignContent('sidebar', { type: 'eventGroup', event: selectedEvents[0] });
        showFeedback(`Assigned to Sidebar`, 'success');
      }
    } else if (zoneId === 'lowerThird') {
      if (isMulti) {
        assignContent('lowerThird', {
          type: 'eventGroup',
          event: selectedEvents[0],
          rotation: { events: selectedEvents, interval: 12000 },
        });
        showFeedback(`${count} markets rotating in Lower Third`, 'success');
      } else {
        assignContent('lowerThird', { type: 'eventGroup', event: selectedEvents[0] });
        showFeedback(`Assigned to Lower Third`, 'success');
      }
    } else if (zoneId === 'ticker') {
      assignContent('ticker', { type: 'eventGroup', events: selectedEvents });
      showFeedback(`${count} market${isMulti ? 's' : ''} in Ticker`, 'success');
    }

    // Clear selection after drop
    setSelectedEventIds(new Set());
    setLastUpdate(Date.now());
  };

  // Feedback toast
  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 2500);
  };

  // Quick actions
  const handleClearAll = () => {
    assignContent('main', { type: 'featuredLayout', featured: null, secondary: [] });
    assignContent('sidebar', { type: 'marketList' });
    assignContent('lowerThird', { type: 'singleMarket' });
    assignContent('ticker', { type: 'marketList' });
    showFeedback('All zones cleared', 'success');
  };

  const handleResetDefaults = () => {
    assignContent('main', { type: 'featuredLayout', featured: null, secondary: [] });
    assignContent('sidebar', { type: 'marketList' });
    assignContent('lowerThird', { type: 'singleMarket' });
    assignContent('ticker', { type: 'marketList' });
    Object.keys(ZONE_INFO).forEach(id => setZoneVisibility(id, true));
    showFeedback('Reset to defaults', 'success');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: UI.bg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Global styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${UI.bg};
        }
        ::-webkit-scrollbar-thumb {
          background: ${UI.border};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${UI.borderHover};
        }
      `}</style>

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: `1px solid ${UI.border}`,
        backgroundColor: UI.surface,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{
            color: UI.text,
            fontSize: '18px',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Broadcast Control
          </h1>
          <StatusIndicator connected={connected} lastUpdate={lastUpdate} eventCount={events.length} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <QuickActions onClearAll={handleClearAll} onResetDefaults={handleResetDefaults} />
          <a
            href="/broadcast?debug=true"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: UI.accent,
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = UI.accentHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = UI.accent}
          >
            Open Broadcast
            <span style={{ fontSize: '11px' }}>↗</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '20px',
        padding: '20px',
        maxWidth: '1600px',
        margin: '0 auto',
      }}>
        {/* Left column - Event browser */}
        <div>
          <Panel
            title="Available Markets"
            badge={loading ? '...' : events.length}
            collapsed={collapsedPanels.events}
            onToggle={() => togglePanel('events')}
          >
            {/* Market source toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              padding: '8px 10px',
              backgroundColor: UI.surfaceHover,
              borderRadius: '6px',
            }}>
              <div>
                <div style={{ fontSize: '12px', color: UI.text, fontWeight: 500 }}>
                  {fetchAllMarkets ? 'All Markets' : 'Filtered Markets'}
                </div>
                <div style={{ fontSize: '10px', color: UI.textMuted }}>
                  {fetchAllMarkets
                    ? 'Showing all available markets'
                    : 'Showing markets matching deployment filters'}
                </div>
              </div>
              <ToggleSwitch
                checked={fetchAllMarkets}
                onChange={(v) => setFetchAllMarkets(v)}
                label=""
              />
            </div>

            <EventBrowser
              events={events}
              loading={loading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDragStart={handleDragStart}
              assignedEventIds={assignedEventIds}
              selectedIds={selectedEventIds}
              onSelect={handleSelect}
              onClearSelection={handleClearSelection}
            />
          </Panel>
        </div>

        {/* Middle column - Zone Layout & Visibility (workflow step 2) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Zone mini-map */}
          <Panel
            title="Zone Layout"
            collapsed={collapsedPanels.zones}
            onToggle={() => togglePanel('zones')}
          >
            {/* Flip layout toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              padding: '8px 10px',
              backgroundColor: UI.surfaceHover,
              borderRadius: '6px',
            }}>
              <div>
                <div style={{ fontSize: '12px', color: UI.text, fontWeight: 500 }}>
                  Flip Layout
                </div>
                <div style={{ fontSize: '10px', color: UI.textMuted }}>
                  Move sidebar to left side
                </div>
              </div>
              <ToggleSwitch
                checked={state.flipped || false}
                onChange={(v) => setFlipped(v)}
                label=""
              />
            </div>

            <ZoneMiniMap
              zones={state.zones}
              onDrop={handleDrop}
              dropTarget={dropTarget}
              assignedContent={getAssignedContent()}
              flipped={state.flipped || false}
            />
          </Panel>

          {/* Zone visibility */}
          <Panel
            title="Zone Visibility"
            collapsed={collapsedPanels.visibility}
            onToggle={() => togglePanel('visibility')}
          >
            <ZoneVisibilityToggles
              zones={state.zones}
              onToggle={setZoneVisibility}
            />
          </Panel>
        </div>

        {/* Right column - Preview & Theme (workflow step 3) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Live preview */}
          <Panel
            title="Live Preview"
            collapsed={collapsedPanels.preview}
            onToggle={() => togglePanel('preview')}
          >
            <LivePreview />
          </Panel>

          {/* Theme selector */}
          <Panel
            title="Broadcast Theme"
            collapsed={collapsedPanels.theme}
            onToggle={() => togglePanel('theme')}
          >
            <ThemeManager
              currentTheme={state.theme}
              onSelect={setTheme}
              onThemesChanged={() => {}}
            />
          </Panel>
        </div>
      </div>

      {/* Feedback toast */}
      <AssignmentFeedback message={feedback?.message} type={feedback?.type} />
    </div>
  );
}

export default Control;

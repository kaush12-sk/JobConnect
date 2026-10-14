import React from 'react';

const SkeletonCard = () => {
  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '40%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ width: '70%', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ width: '25%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: '25%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: '25%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <div style={{ width: '50px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: '60px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: '55px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '30%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: '25%', height: '28px', backgroundColor: '#e2e8f0', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SkeletonCard;

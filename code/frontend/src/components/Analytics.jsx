import React from 'react'

export default function Analytics() {
  return (
    <div className="analytics-container">
      <div className="analytics-content" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="analytics-header" style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', color: 'var(--pax-dark)', fontSize: '2rem' }}>
            Analytics Dashboard
          </h1>
          <p style={{ margin: 0, color: 'rgba(0,0,0,0.6)', fontSize: '1.1rem' }}>
            Performance insights and trends over time
          </p>
        </div>

        <div className="analytics-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div className="stat-card" style={{
            padding: '24px',
            background: 'var(--card)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Cases Processed
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--pax-primary)' }}>
              1,247
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--pax-green)', marginTop: '8px' }}>
              ↑ 12% from last month
            </div>
          </div>

          <div className="stat-card" style={{
            padding: '24px',
            background: 'var(--card)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Acceptance Rate
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--pax-green)' }}>
              68.5%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)', marginTop: '8px' }}>
              Average over last 30 days
            </div>
          </div>

          <div className="stat-card" style={{
            padding: '24px',
            background: 'var(--card)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Model Accuracy
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#4285f4' }}>
              94.2%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)', marginTop: '8px' }}>
              Last 7 days performance
            </div>
          </div>
        </div>

        <div className="analytics-section" style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'var(--pax-dark)', fontSize: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '12px' }}>
            Performance Trends
          </h2>
          <div style={{
            padding: '48px',
            background: 'var(--card)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            textAlign: 'center',
            color: 'rgba(0,0,0,0.4)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📈</div>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>Performance charts and trends will be displayed here</p>
          </div>
        </div>

        <div className="analytics-section" style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'var(--pax-dark)', fontSize: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '12px' }}>
            Key Insights
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '20px',
              background: 'var(--card)',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              borderLeft: '4px solid var(--pax-primary)'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--pax-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Trend Analysis
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--pax-dark)', lineHeight: '1.5' }}>
                Acceptance rate has increased by 5.2% over the past quarter, indicating improved model performance and data quality.
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: 'var(--card)',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              borderLeft: '4px solid var(--pax-green)'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--pax-green)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Model Performance
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--pax-dark)', lineHeight: '1.5' }}>
                The latest model version shows 94.2% accuracy with particularly strong performance in age and occupation-based risk assessment.
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: 'var(--card)',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              borderLeft: '4px solid #ff9800'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ff9800', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Processing Time
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--pax-dark)', lineHeight: '1.5' }}>
                Average case processing time has decreased by 23% compared to last month, now averaging 4.2 minutes per case.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


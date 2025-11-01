import React from 'react'

export default function Analytics() {
  return (
    <div className="analytics-container">
      <div className="analytics-content" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="analytics-header" style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', color: 'var(--pax-dark)', fontSize: '2rem' }}>
            Analytics Dashboard
          </h1>
          <p style={{ margin: 0, color: 'rgba(0,0,0,0.6)', fontSize: '1.1rem' }}>
            Life insurance performance metrics and timeline
          </p>
        </div>

        {/* KPI Panels */}
        <div className="analytics-kpi-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '0.8fr 1.4fr 1fr', 
          gap: '20px',
          marginBottom: '36px'
        }}>
          {/* Left Panel - Policies */}
          <div className="kpi-panel kpi-yellow" style={{
            padding: '16px 8px',
            background: '#FFEB3B',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            aspectRatio: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '6px'
          }}>
            <div style={{ textAlign: 'center', position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              <div style={{ fontSize: '6.5rem', fontWeight: 700, color: '#000', lineHeight: 1 }}>
                500K
              </div>
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '35%',
                transform: 'translateX(-50%)',
                background: '#fff',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '1rem',
                fontWeight: 400,
                color: '#000',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 10
              }}>
                Policies
                <div style={{
                  position: 'absolute',
                  bottom: '-7px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '7px solid #fff'
                }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              <div style={{ fontSize: '6.5rem', fontWeight: 700, color: '#000', lineHeight: 1 }}>
                500K
              </div>
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '65%',
                transform: 'translateX(-50%)',
                background: '#fff',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '1rem',
                fontWeight: 400,
                color: '#000',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 10
              }}>
                Underwritten
                <div style={{
                  position: 'absolute',
                  bottom: '-7px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '7px solid #fff'
                }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              <div style={{ fontSize: '6.5rem', fontWeight: 700, color: '#000', lineHeight: 1 }}>
                500K
              </div>
            </div>
          </div>

          {/* Middle Panel - Growth */}
          <div className="kpi-panel kpi-purple" style={{
            padding: '32px 28px',
            background: '#3A3A52',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>
              Growth in Policy Portfolio
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: '20px',
              flex: 1,
              minHeight: '140px'
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '4px',
                flex: 1,
                alignItems: 'flex-end',
                height: '100%'
              }}>
                {[1, 1, 1, 0.8, 0.9, 0.85, 0.95, 1, 1.05, 1.1, 1.15, 1.2].map((height, i) => (
                  <div 
                    key={i}
                    style={{
                      flex: 1,
                      height: `${height * 80}px`,
                      background: i < 4 ? '#000' : 'rgba(140, 205, 15, 0.8)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '40px'
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                20%
              </div>
            </div>
            <div style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M7 7H17V17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Right Panel - Applications */}
          <div className="kpi-panel kpi-pink" style={{
            padding: '32px 28px',
            background: 'linear-gradient(135deg, #ff6b9d, #ff8787)',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
                <path d="M2 12H22M12 2C15 6 15 18 12 22M12 2C9 6 9 18 12 22" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '4.5rem', fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: '12px' }}>
                1M+
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                Applications
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                Processed
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '3px',
              justifyContent: 'flex-start',
              marginTop: '16px'
            }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i}
                  style={{
                    width: '10px',
                    height: '10px',
                    background: '#000',
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>


        {/* Growth Metrics Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.7fr 0.8fr 0.85fr', 
          gap: '24px',
          marginTop: '48px',
          marginBottom: '48px'
        }}>
          {/* Policy Portfolio Growth */}
          <div style={{
            padding: '32px',
            background: '#00B865',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'relative',
            minHeight: '180px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#000' }}>
                Annual Policy Issuance
              </h3>
              <div style={{ 
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#000" strokeWidth="2" fill="none"/>
                  <path d="M2 12H22M12 2C15 6 15 18 12 22M12 2C9 6 9 18 12 22" stroke="#000" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            
            <PolicyGrowthChart />
          </div>

          {/* Applications Processed */}
          <div style={{
            padding: '32px',
            background: '#FFEB3B',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'relative',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '24px',
              background: 'repeating-linear-gradient(45deg, #000 0px, #000 8px, #FFEB3B 8px, #FFEB3B 16px)'
            }} />
            
            <div style={{ paddingLeft: '40px' }}>
              <div style={{ fontSize: '4rem', fontWeight: 700, color: '#000', lineHeight: 1, marginBottom: '12px' }}>
                12K
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#000', lineHeight: 1.4 }}>
                Applications
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#000', lineHeight: 1.4 }}>
                Processed
              </div>
            </div>
          </div>

          {/* Hours Saved */}
          <div className="kpi-panel kpi-pink" style={{
            padding: '12px 8px',
            background: '#FFB6C1',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '4px',
            position: 'relative',
            border: '2px solid #000',
            overflow: 'hidden',
            height: '100%'
          }}>
            {/* Three dots in top right */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              gap: '4px',
              zIndex: 20
            }}>
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#000'
              }} />
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#000'
              }} />
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#000'
              }} />
            </div>

            {/* White card overlay in center */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              padding: '14px 22px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 400,
              color: '#000',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 15,
              textAlign: 'left',
              border: '1px solid rgba(0,0,0,0.1)',
              minWidth: '140px'
            }}>
              <div style={{ marginBottom: '4px', lineHeight: 1.3 }}>Hours of</div>
              <div style={{ lineHeight: 1.3 }}>Saved Time</div>
            </div>

            <div style={{ textAlign: 'center', position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              <div style={{ 
                fontSize: '5.5rem', 
                fontWeight: 700, 
                color: '#000', 
                lineHeight: 1,
                transform: 'rotate(-2deg)',
                opacity: 0.9
              }}>
                10,000
              </div>
            </div>
            <div style={{ textAlign: 'center', position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              <div style={{ 
                fontSize: '5.5rem', 
                fontWeight: 700, 
                color: '#000', 
                lineHeight: 1,
                transform: 'rotate(1deg)',
                opacity: 0.9
              }}>
                10,000
              </div>
            </div>
            <div style={{ textAlign: 'center', position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              <div style={{ 
                fontSize: '5.5rem', 
                fontWeight: 700, 
                color: '#000', 
                lineHeight: 1,
                transform: 'rotate(-1.5deg)',
                opacity: 0.9
              }}>
                10,000
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts Section */}
        <div className="analytics-charts" style={{ marginTop: '48px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1.3fr 0.8fr', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Underwriting Funnel */}
            <div style={{
              padding: '28px 24px 6px 24px',
              background: 'var(--card)',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <UnderwritingFunnelChart />
            </div>

            {/* Gender Diversity Donut Chart */}
            <div style={{
              padding: '28px 24px 6px 24px',
              background: 'var(--card)',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--pax-dark)', fontSize: '1.1rem', fontWeight: 700 }}>
                Applicant Gender Distribution
              </h3>
              <GenderDonutChart />
            </div>

            {/* Acceptance Rate by Risk Category */}
            <div style={{
              padding: '28px 24px 6px 24px',
              background: 'var(--card)',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--pax-dark)', fontSize: '1.1rem', fontWeight: 700 }}>
                Acceptance Rate
              </h3>
              <RiskCategoryChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Gender Donut Chart Component
function GenderDonutChart() {
  const data = [
    { label: 'Female', value: 52, color: '#FB6F7C' },
    { label: 'Male', value: 45, color: '#3A3A52' },
    { label: 'Other', value: 3, color: '#FFD700' }
  ]

  const size = 240
  const radius = 75
  const innerRadius = 45
  const centerX = size / 2
  const centerY = size / 2

  let currentAngle = -90 // Start from top
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const paths = data.map((item, index) => {
    const percentage = item.value / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    const x1Inner = centerX + innerRadius * Math.cos(startAngleRad)
    const y1Inner = centerY + innerRadius * Math.sin(startAngleRad)
    const x2Inner = centerX + innerRadius * Math.cos(endAngleRad)
    const y2Inner = centerY + innerRadius * Math.sin(endAngleRad)

    const largeArc = angle > 180 ? 1 : 0

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x2Inner} ${y2Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}`,
      'Z'
    ].join(' ')

    // Calculate label position on top of section (outer edge)
    const midAngle = (startAngle + endAngle) / 2
    const midAngleRad = (midAngle * Math.PI) / 180
    const tooltipRadius = radius + 20 // Position tooltip outside the ring
    const tooltipX = centerX + tooltipRadius * Math.cos(midAngleRad)
    const tooltipY = centerY + tooltipRadius * Math.sin(midAngleRad)
    
    // Calculate pointer position (pointing from tooltip to segment)
    const pointerRadius = radius + 5 // Position pointer near the outer edge
    const pointerX = centerX + pointerRadius * Math.cos(midAngleRad)
    const pointerY = centerY + pointerRadius * Math.sin(midAngleRad)

    currentAngle = endAngle

    return {
      path: pathData,
      color: item.color,
      label: item.label,
      percentage: item.value,
      tooltipX,
      tooltipY,
      pointerX,
      pointerY,
      startAngle,
      endAngle,
      midAngle
    }
  })

  // Draw separation lines at boundaries
  const separationLines = paths.map((path, index) => {
    if (index === paths.length - 1) return null // Skip last boundary
    
    const endAngleRad = (path.endAngle * Math.PI) / 180
    const lineX1 = centerX + radius * Math.cos(endAngleRad)
    const lineY1 = centerY + radius * Math.sin(endAngleRad)
    const lineX2 = centerX + innerRadius * Math.cos(endAngleRad)
    const lineY2 = centerY + innerRadius * Math.sin(endAngleRad)
    
    return { x1: lineX1, y1: lineY1, x2: lineX2, y2: lineY2 }
  }).filter(Boolean)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      {/* Legend - Left side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minWidth: '150px' }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: item.color,
                borderRadius: '2px'
              }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--pax-dark)' }}>{item.label}</span>
            </div>
            {/* Line underneath each item */}
            <div style={{
              height: '1px',
              background: 'var(--border)',
              width: '100%'
            }} />
          </div>
        ))}
      </div>
      
      {/* Chart - Right side */}
      <div style={{ position: 'relative', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          {paths.map((path, index) => (
            <g key={index}>
              <path
                d={path.path}
                fill={path.color}
                stroke="#fff"
                strokeWidth="0"
              />
            </g>
          ))}
          {/* Separation lines */}
          {separationLines.map((line, index) => (
            <line
              key={`sep-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
          {/* Tooltips with pointers */}
          {paths.map((path, index) => {
            // Position tooltip over the segment (centered on segment)
            const midAngleRad = (path.midAngle * Math.PI) / 180
            const segmentCenterX = centerX + (radius + innerRadius) / 2 * Math.cos(midAngleRad)
            const segmentCenterY = centerY + (radius + innerRadius) / 2 * Math.sin(midAngleRad)
            
            // Tooltip positioned over the segment
            const tooltipX = segmentCenterX
            const tooltipY = segmentCenterY - 30 // Position above the segment
            
            // Standardized rounded rectangle dimensions (same for all tooltips)
            const tooltipWidth = 52 // Standardized width for all tooltips
            const tooltipHeight = 28
            const tooltipRx = 14 // Rounder corners (increased from 6)
            const tooltipXPos = tooltipX - tooltipWidth / 2
            const tooltipYPos = tooltipY - tooltipHeight / 2
            
            // Triangle positioned at bottom center of tooltip, pointing straight down
            const triangleX = tooltipX
            const triangleY = tooltipYPos + tooltipHeight // Bottom center of rounded rectangle
            const triangleLength = 8 // Shorter triangle (not as long)
            const triangleTipX = triangleX
            const triangleTipY = triangleY + triangleLength // Point straight down
            const triangleBaseHalfWidth = 5
            
            // Triangle base points (horizontal base at bottom of tooltip)
            const baseX1 = triangleX - triangleBaseHalfWidth
            const baseY1 = triangleY
            const baseX2 = triangleX + triangleBaseHalfWidth
            const baseY2 = triangleY
            
            const trianglePoints = `${triangleTipX},${triangleTipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`
            
            return (
              <g key={`tooltip-${index}`}>
                {/* Tooltip rounded rectangle */}
                <rect
                  x={tooltipXPos}
                  y={tooltipYPos}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx={tooltipRx}
                  ry={tooltipRx}
                  fill="#000"
                />
                {/* Triangle pointer at bottom of tooltip pointing straight down */}
                <polygon
                  points={trianglePoints}
                  fill="#000"
                />
                {/* Percentage text */}
                <text
                  x={tooltipX}
                  y={tooltipY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#fff"
                >
                  {path.percentage}%
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// Age Distribution Chart Component
function AgeDistributionChart() {
  const ageRanges = [
    { range: '18-25', count: 8 },
    { range: '26-35', count: 25 },
    { range: '36-45', count: 32 },
    { range: '46-55', count: 22 },
    { range: '56-65', count: 10 },
    { range: '65+', count: 3 }
  ]

  const maxCount = Math.max(...ageRanges.map(r => r.count))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {ageRanges.map((range, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ minWidth: '60px', fontSize: '0.85rem', color: 'rgba(0,0,0,0.7)', fontWeight: 600 }}>
            {range.range}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              flex: range.count / maxCount,
              height: '24px',
              background: range.count / maxCount > 0.6 ? '#8CCD0F' : range.count / maxCount > 0.3 ? '#3A3A52' : '#ffd166',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: range.count / maxCount > 0.6 ? '#fff' : '#000'
            }}>
              {range.count}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Policy Growth Chart Component
function PolicyGrowthChart() {
  const years = [
    { year: '2021', count: 180, display: true, label: '180' },
    { year: '2022', count: 320, display: true, label: '320' },
    { year: '2023', count: 415, display: true, label: '415', growth: '+29%' },
    { year: '2024', count: 485, display: true, label: '485' }
  ]

  const maxCount = Math.max(...years.map(y => y.count))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px', position: 'relative' }}>
        {years.map((yearData, index) => {
          const barHeight = (yearData.count / maxCount) * 100
          // Different green shades for each bar
          const greenShades = ['#004D2E', '#006B3E', '#000', '#008B55'] // 2021, 2022, 2023 (black), 2024
          const barColor = greenShades[index]

          return (
            <div 
              key={index}
              style={{ 
                flex: 1, 
                minWidth: '45px',
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                position: 'relative'
              }}
            >
              {/* Number above bar - for all years */}
              {yearData.display && (
                <div style={{
                  position: 'absolute',
                  bottom: `${barHeight + 6}px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '1.2rem',
                  fontWeight: 300,
                  color: '#000',
                  whiteSpace: 'nowrap',
                  zIndex: 10
                }}>
                  {yearData.label}
                </div>
              )}

              {/* Growth tooltip for 2023 - positioned above the number */}
              {yearData.growth && (
                <div style={{
                  position: 'absolute',
                  bottom: `${barHeight + 45}px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 400,
                  color: '#000',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 10
                }}>
                  {yearData.growth}
                  <div style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #fff'
                  }} />
                </div>
              )}

              {/* Bar */}
              <div style={{
                width: '100%',
                minWidth: '20px',
                height: `${barHeight}px`,
                background: barColor,
                borderRadius: '0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                position: 'relative'
              }}>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Year labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
        {years.map((yearData, index) => (
          <div 
            key={index}
            style={{ 
              flex: 1,
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: 400,
              color: '#000',
              paddingLeft: '2px'
            }}
          >
            {yearData.year}
          </div>
        ))}
      </div>
    </div>
  )
}

// Underwriting Funnel Chart Component
function UnderwritingFunnelChart() {
  const funnelSteps = [
    { label: 'Applications', percentage: 100, color: '#3A3A52' },
    { label: 'Under Review', percentage: 71, color: '#3A3A52' },
    { label: 'Pending Info', percentage: 27, color: '#3A3A52' },
    { label: 'Approved', percentage: 60, color: '#3A3A52' },
    { label: 'Rejected', percentage: 11, color: '#3A3A52' }
  ]

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1.5fr', 
      gap: '32px',
      alignItems: 'center',
      minHeight: '240px'
    }}>
      {/* Left Column - Title, Icon, Description */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <div>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#000', 
            fontSize: '1.5rem', 
            fontWeight: 700,
            lineHeight: '1.2'
          }}>
            Underwriting<br />Pipeline Flow
          </h3>
        </div>
        
        {/* Globe Icon */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flex: 1,
          minHeight: '80px'
        }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#000" strokeWidth="2" fill="none"/>
            <path d="M2 12H22M12 2C15 6 15 18 12 22M12 2C9 6 9 18 12 22" stroke="#000" strokeWidth="2"/>
          </svg>
        </div>
        
        <div style={{ 
          color: '#000', 
          fontSize: '0.95rem', 
          lineHeight: '1.4'
        }}>
          Pipeline stages and<br />conversion metrics
        </div>
      </div>

      {/* Right Column - Data Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {funnelSteps.map((step, index) => (
          <div key={index} style={{
            display: 'flex',
            height: '44px',
            border: '2px solid #000',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            {/* Black Label Segment */}
            <div style={{
              width: '120px',
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              flexShrink: 0
            }}>
              <span style={{
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                {step.label}
              </span>
            </div>
            
            {/* Colored Percentage Segment */}
            <div style={{
              flex: 1,
              background: step.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '16px'
            }}>
              <span style={{
                color: '#000',
                fontSize: '1.3rem',
                fontWeight: 700
              }}>
                {step.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Risk Category Chart Component
function RiskCategoryChart() {
  const riskCategories = [
    { category: 'Low Risk', accepted: 92, rejected: 8 },
    { category: 'Medium Risk', accepted: 68, rejected: 32 },
    { category: 'High Risk', accepted: 35, rejected: 65 }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {riskCategories.map((cat, index) => {
        const total = cat.accepted + cat.rejected
        const acceptedPercent = (cat.accepted / total) * 100
        const rejectedPercent = (cat.rejected / total) * 100

        return (
          <div key={index}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'rgba(0,0,0,0.7)'
            }}>
              <span>{cat.category}</span>
              <span>{Math.round(acceptedPercent)}% accepted</span>
            </div>
            <div style={{ 
              display: 'flex', 
              height: '32px', 
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                flex: acceptedPercent,
                background: '#8CCD0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {acceptedPercent > 5 && `${Math.round(acceptedPercent)}%`}
              </div>
              <div style={{
                flex: rejectedPercent,
                background: '#ff6b9d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {rejectedPercent > 5 && `${Math.round(rejectedPercent)}%`}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

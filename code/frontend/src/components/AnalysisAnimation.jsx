import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function AnalysisAnimation(){
  return (
    <div className="extraction-animation">
      <div className="extraction-container">
        {/* Lottie Animation */}
        <div className="lottie-container">
          <DotLottieReact
            src="/Data Analysis.lottie"
            loop
            autoplay
            style={{ width: '350px', height: '350px' }}
          />
        </div>
        <h3 className="extraction-text">Running risk analysis...</h3>
      </div>
    </div>
  )
}

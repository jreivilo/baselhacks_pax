import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function ExtractionAnimation(){
  return (
    <div className="extraction-animation">
      <div className="extraction-container">
        {/* Lottie Animation */}
        <div className="lottie-container">
          <DotLottieReact
            src="/Data Scanning.lottie"
            loop
            autoplay
            style={{ width: '350px', height: '350px' }}
          />
        </div>
        <h3 className="extraction-text">Extracting information...</h3>
      </div>
    </div>
  )
}

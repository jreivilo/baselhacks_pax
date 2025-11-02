import React, { useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function SuccessConfetti({ onComplete }){
  useEffect(() => {
    // Set a timer to call onComplete after animation duration (typically 2-3 seconds for confetti)
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3000); // 3 seconds should be enough for most confetti animations

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '400px', height: '400px' }}>
          <DotLottieReact
            src="/success confetti.lottie"
            loop={false}
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <h3 style={{
          marginTop: '2rem',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#ffffff',
          textAlign: 'center'
        }}>
          Decision Submitted Successfully!
        </h3>
      </div>
    </div>
  )
}

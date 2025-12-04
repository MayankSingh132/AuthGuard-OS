import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#3F51B5',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 6
        }}
      >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <path d="M2 16a10 10 0 0 1 20 0"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

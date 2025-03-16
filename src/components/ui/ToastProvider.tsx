'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position='top-center'
      richColors
      closeButton
      expand={true}
      toastOptions={{
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e2e8f0',
        },
        className: 'border-gray-200 shadow-md',
      }}
    />
  )
}

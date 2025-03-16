import Link from 'next/link'
import { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border-blue-600 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800',
  secondary:
    'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700',
  danger:
    'border-red-300 text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
  success:
    'border-green-300 text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800',
  warning:
    'border-yellow-300 text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  href,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center border rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
  const styles = `${baseStyles} ${variantStyles[variant]} ${
    sizeStyles[size]
  } ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`

  const content = (
    <>
      {icon && <span className={size === 'sm' ? 'mr-1' : 'mr-2'}>{icon}</span>}
      {children}
    </>
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={styles}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={styles}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  )
}

// Common icons as components
export function PlusIcon(props: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={props.className || 'h-4 w-4'}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 6v6m0 0v6m0-6h6m-6 0H6'
      />
    </svg>
  )
}

export function EditIcon(props: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={props.className || 'h-4 w-4'}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
      />
    </svg>
  )
}

export function HomeIcon(props: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={props.className || 'h-4 w-4'}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
      />
    </svg>
  )
}

export function ListIcon(props: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={props.className || 'h-4 w-4'}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M4 6h16M4 10h16M4 14h16M4 18h16'
      />
    </svg>
  )
}

export function TrashIcon(props: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={props.className || 'h-4 w-4'}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
      />
    </svg>
  )
}

export function ActivateIcon(props: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={props.className || 'h-4 w-4'}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  )
}

export function DeactivateIcon(props: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={props.className || 'h-4 w-4'}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
      />
    </svg>
  )
}

export function BackIcon(props: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={props.className || 'h-4 w-4'}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M11 17l-5-5m0 0l5-5m-5 5h12'
      />
    </svg>
  )
}

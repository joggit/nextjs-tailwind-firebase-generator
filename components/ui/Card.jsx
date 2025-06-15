import { forwardRef } from 'react'

const Card = forwardRef(({ 
  children, 
  className = '',
  hover = false,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${
        hover ? 'hover:shadow-md transition-shadow duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card
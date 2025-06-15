'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'

const Form = forwardRef((props, ref) => {
  return (
    <form ref={ref} {...props}>
      {props.children}
    </form>
  )
})

export default Form
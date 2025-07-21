'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

export default function ProgressSteps({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full flex justify-center px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center w-full gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isAccessible = index <= currentStep

          return (
            <div key={step.id} className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
              <motion.button
                onClick={() => isAccessible && onStepClick(index)}
                className={`relative flex items-center justify-center w-12 h-12 mx-auto sm:mx-0 rounded-full transition-colors ${isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-blue-600 text-white'
                      : isAccessible
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                whileHover={isAccessible ? { scale: 1.05 } : {}}
                whileTap={isAccessible ? { scale: 0.95 } : {}}
                disabled={!isAccessible}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}

                {/* Step label */}
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                  {step.title}
                </span>
              </motion.button>

              {/* Connector: animate color and size */}
              {index < steps.length - 1 && (
                <>
                  {/* Desktop (horizontal line) */}
                  <motion.div
                    className="hidden sm:block mx-2 h-1 rounded"
                    initial={{ width: 64, backgroundColor: '#e5e7eb' }}
                    animate={{
                      width: 64,
                      backgroundColor: index < currentStep ? '#22c55e' : '#e5e7eb',
                    }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Mobile (vertical line) */}
                  <motion.div
                    className="block sm:hidden w-1 h-6 mx-auto my-2 rounded"
                    initial={{ backgroundColor: '#e5e7eb' }}
                    animate={{
                      backgroundColor: index < currentStep ? '#22c55e' : '#e5e7eb',
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

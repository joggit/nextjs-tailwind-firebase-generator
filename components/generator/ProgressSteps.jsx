'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

export default function ProgressSteps({ steps, currentStep, onStepClick }) {
  return (
    <div className="flex items-center justify-center px-4 sm:px-6">
      <div className="flex flex-wrap justify-center gap-y-6 gap-x-4 sm:flex-nowrap sm:gap-x-6">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isAccessible = index <= currentStep

          return (
            <div key={step.id} className="flex items-center">
              <motion.button
                onClick={() => isAccessible && onStepClick(index)}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  isCompleted
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
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                  {step.title}
                </span>
              </motion.button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block w-16 h-1 mx-2 bg-gray-200 transition-colors"
                  style={{
                    backgroundColor: index < currentStep ? '#22c55e' : undefined,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Dynamic Hero Component
// File: src/components/Hero.js

'use client'

import { ArrowRight, Play, Star, Users, Award, TrendingUp, Brain, Zap, Database } from 'lucide-react'

function Hero({ content, config }) {
  // Use passed props or fallback to default values
  const heroContent = content?.hero || {}
  const appName = config?.businessName || config?.name || 'Your Business'
  const industry = config?.industry || 'business'
  
  const headline = heroContent.headline || `Welcome to ${appName}`
  const subheadline = heroContent.subheadline || `Professional ${industry} solutions for ${config?.targetAudience || 'your success'}`
  const ctaText = heroContent.ctaText || 'Get Started'

  const stats = [
    { icon: Users, label: 'AI-Enhanced Reach', value: '10K+' },
    { icon: Award, label: 'Vector Matches', value: '99%' },
    { icon: Star, label: 'Content Quality', value: '4.9/5' },
    { icon: TrendingUp, label: 'Smart Growth', value: '200%' }
  ]

  const aiFeatures = [
    { icon: Brain, text: 'AI-Generated Content' },
    { icon: Database, text: 'Vector Intelligence' },
    { icon: Zap, text: 'Industry Insights' }
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 sm:py-32">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
        
        {/* Vector enhancement indicators */}
        <div className="absolute top-10 right-10 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2 text-sm font-medium text-blue-600">
            <Brain className="w-5 h-5" />
            <span>Vector Enhanced</span>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Industry Badge with AI Enhancement */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-8">
            <Brain className="w-4 h-4 mr-2 text-blue-600" />
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            AI-Enhanced {industry} Solutions
          </div>

          {/* Main Headline with Vector Enhancement */}
          <div className="animate-fadeInUp">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              {headline.split(' ').map((word, index) => {
                if (index === headline.split(' ').length - 1) {
                  return (
                    <span key={index} className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {word}
                    </span>
                  )
                }
                return <span key={index}>{word} </span>
              })}
            </h1>
            <p className="text-xl leading-8 text-gray-600 max-w-3xl mx-auto mb-6">
              {subheadline}
            </p>
            
            {/* AI Enhancement Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {aiFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                    <span>{feature.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex items-center justify-center gap-x-6 mb-16 animate-fadeInUp delay-200">
            <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all hover:scale-105 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl">
              <Brain className="mr-2 w-5 h-5" />
              {ctaText}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl">
              <Play className="mr-2 w-5 h-5" />
              See AI Demo
            </button>
          </div>

          {/* Enhanced Trust Indicators */}
          {config?.businessType !== 'personal' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div key={index} className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                    <div className="text-xs text-blue-600 font-medium mt-1">AI-Optimized</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Hero
'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, FileText, Users, Phone, Briefcase } from 'lucide-react'

export default function ContentEditor({ config, onChange, onNext, onPrev }) {
  const [activeTab, setActiveTab] = useState('about')

  const updatePageContent = (pageType, field, value) => {
    onChange({
      ...config,
      pageContent: {
        ...config.pageContent,
        [pageType]: {
          ...config.pageContent?.[pageType],
          [field]: value
        }
      }
    })
  }

  const pageTypes = [
    { id: 'about', name: 'About Us', icon: Users },
    { id: 'services', name: 'Services', icon: Briefcase },
    { id: 'contact', name: 'Contact', icon: Phone }
  ]

  const isComplete = () => {
    const content = config.pageContent || {}
    return pageTypes.every(page => 
      content[page.id]?.title && content[page.id]?.description
    )
  }

  const renderAboutForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Page Title
        </label>
        <input
          type="text"
          value={config.pageContent?.about?.title || ''}
          onChange={(e) => updatePageContent('about', 'title', e.target.value)}
          placeholder="About Our Company"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Main Description
        </label>
        <textarea
          rows={4}
          value={config.pageContent?.about?.description || ''}
          onChange={(e) => updatePageContent('about', 'description', e.target.value)}
          placeholder="Tell visitors about your company, mission, and what makes you unique..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company History/Story
        </label>
        <textarea
          rows={3}
          value={config.pageContent?.about?.story || ''}
          onChange={(e) => updatePageContent('about', 'story', e.target.value)}
          placeholder="Brief history of your company or founding story..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Team/Values (Optional)
        </label>
        <textarea
          rows={3}
          value={config.pageContent?.about?.values || ''}
          onChange={(e) => updatePageContent('about', 'values', e.target.value)}
          placeholder="Information about your team, company values, or culture..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  )

  const renderServicesForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Page Title
        </label>
        <input
          type="text"
          value={config.pageContent?.services?.title || ''}
          onChange={(e) => updatePageContent('services', 'title', e.target.value)}
          placeholder="Our Services"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Overview
        </label>
        <textarea
          rows={3}
          value={config.pageContent?.services?.description || ''}
          onChange={(e) => updatePageContent('services', 'description', e.target.value)}
          placeholder="Overview of the services you provide..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Main Services (one per line)
        </label>
        <textarea
          rows={5}
          value={config.pageContent?.services?.serviceList || ''}
          onChange={(e) => updatePageContent('services', 'serviceList', e.target.value)}
          placeholder="Web Development&#10;Mobile Apps&#10;Consulting&#10;Support Services"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Why Choose Us
        </label>
        <textarea
          rows={3}
          value={config.pageContent?.services?.whyChooseUs || ''}
          onChange={(e) => updatePageContent('services', 'whyChooseUs', e.target.value)}
          placeholder="What sets your services apart from competitors..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  )

  const renderContactForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Page Title
        </label>
        <input
          type="text"
          value={config.pageContent?.contact?.title || ''}
          onChange={(e) => updatePageContent('contact', 'title', e.target.value)}
          placeholder="Get In Touch"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Description
        </label>
        <textarea
          rows={3}
          value={config.pageContent?.contact?.description || ''}
          onChange={(e) => updatePageContent('contact', 'description', e.target.value)}
          placeholder="Encourage visitors to contact you..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="text"
            value={config.pageContent?.contact?.phone || ''}
            onChange={(e) => updatePageContent('contact', 'phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={config.pageContent?.contact?.email || ''}
            onChange={(e) => updatePageContent('contact', 'email', e.target.value)}
            placeholder="contact@company.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Address
        </label>
        <textarea
          rows={3}
          value={config.pageContent?.contact?.address || ''}
          onChange={(e) => updatePageContent('contact', 'address', e.target.value)}
          placeholder="123 Business Street&#10;City, State 12345&#10;Country"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Hours
        </label>
        <textarea
          rows={3}
          value={config.pageContent?.contact?.hours || ''}
          onChange={(e) => updatePageContent('contact', 'hours', e.target.value)}
          placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Add Your Page Content
      </h2>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          {pageTypes.map((page) => {
            const Icon = page.icon
            return (
              <button
                key={page.id}
                onClick={() => setActiveTab(page.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === page.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{page.name}</span>
                {config.pageContent?.[page.id]?.title && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'about' && renderAboutForm()}
        {activeTab === 'services' && renderServicesForm()}
        {activeTab === 'contact' && renderContactForm()}
      </div>

      {/* Completion Status */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Content Completion Status</h4>
        <div className="flex space-x-4">
          {pageTypes.map((page) => {
            const isPageComplete = config.pageContent?.[page.id]?.title && config.pageContent?.[page.id]?.description
            return (
              <div key={page.id} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isPageComplete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${isPageComplete ? 'text-green-700' : 'text-gray-500'}`}>
                  {page.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={onNext}
          disabled={!isComplete()}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next: Preview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
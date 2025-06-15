// --------------------------------------------------
// Updated Header with Vector Admin Link
// File: src/components/Header.js - Add this to your existing Header

export function HeaderWithVectorAdmin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { 
      name: 'Vector Admin', 
      href: '/admin/vector', 
      icon: Brain, 
      special: true,
      description: 'AI Document Management'
    }
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg relative">
                A
                <Brain className="absolute -top-1 -right-1 w-4 h-4 text-green-400" title="Vector Enhanced" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  Your App
                </span>
                <div className="text-xs text-gray-500 font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  AI-Enhanced Platform
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.special 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-purple-100' 
                      : 'text-gray-600 hover:text-blue-600'
                  } transition-colors font-medium relative group flex items-center space-x-2`}
                  title={item.description}
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{item.name}</span>
                  {!item.special && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>}
                </a>
              )
            })}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
              {navItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.special 
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    } block px-3 py-2 rounded-lg transition-colors flex items-center space-x-2`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <div>
                      <span>{item.name}</span>
                      {item.description && (
                        <div className="text-xs opacity-75">{item.description}</div>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
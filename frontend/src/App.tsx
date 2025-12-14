import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function App() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch health:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🏆 Athlete Pension
            </h1>
            <p className="text-xl text-gray-600">
              AI-Powered Investment Advisory Platform
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Backend Health Check
            </h2>
            {loading ? (
              <p className="text-blue-700">Checking backend status...</p>
            ) : health ? (
              <div className="space-y-2">
                <p className="text-green-700 font-medium">✅ Backend is healthy!</p>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Status:</strong> {health.status}</p>
                  <p><strong>Environment:</strong> {health.environment}</p>
                  <p><strong>Version:</strong> {health.version}</p>
                </div>
              </div>
            ) : (
              <p className="text-red-700">❌ Backend is not responding</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link to="/smart-planning" className="block">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 cursor-pointer">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold mb-1">Smart Planning</h3>
                <p className="text-sm text-blue-100">
                  AI-powered investment strategies tailored for athletes
                </p>
              </div>
            </Link>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 opacity-50 cursor-not-allowed">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Portfolio Management</h3>
              <p className="text-sm text-green-100">
                Track and optimize your investment portfolio (Coming Soon)
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 opacity-50 cursor-not-allowed">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-semibold mb-1">AI Advisor</h3>
              <p className="text-sm text-purple-100">
                Get personalized advice from our AI agent (Coming Soon)
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Ready to secure your financial future?
            </p>
            <Link to="/smart-planning">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200">
                Get Started with Smart Planning
              </button>
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Built with FastAPI + React + PostgreSQL + AI
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
import { useState, useEffect } from 'react'

interface QuestionnaireData {
  age: number | null
  currentIncome: number | null
  currentWealth: number | null
  retirementAge: number | null
  monthlyPayoutRequired: number | null
}

interface Props {
  questionnaireData: QuestionnaireData
  currentStep: number
  onClose: () => void
  analysis?: any  // Financial analysis from backend
  onOpenFullReport?: () => void  // Callback to open full report modal
}

const advisorMessages = [
  {
    step: 0,
    messages: [
      "👋 Hi! I'm your AI Financial Advisor. Let's start by understanding your timeline.",
      "Your age helps me calculate how long your investments need to grow and how to balance risk vs. safety.",
      "For athletes, career timelines can be shorter, so we'll plan accordingly!"
    ]
  },
  {
    step: 1,
    messages: [
      "💰 Great! Now let's talk about your income.",
      "Your income level helps me determine your savings capacity and recommend appropriate investment strategies.",
      "Higher income usually means more investment options and flexibility in planning."
    ]
  },
  {
    step: 2,
    messages: [
      "📊 Excellent! Let's assess your current financial position.",
      "Don't worry if you're starting from scratch - the important thing is planning for the future!",
      "Your current wealth gives us a starting point for calculating what you'll need at retirement."
    ]
  },
  {
    step: 3,
    messages: [
      "🏖️ Now the exciting part - planning your retirement!",
      "Many athletes retire earlier than traditional careers, which means you'll need to make your money last longer.",
      "We'll factor in inflation and life expectancy to ensure you're covered."
    ]
  },
  {
    step: 4,
    messages: [
      "🎯 Final step! Let's determine your retirement income needs.",
      "Think about your desired lifestyle - will you travel? Start a business? Focus on family?",
      "Remember to account for healthcare, housing, and fun activities!"
    ]
  }
]

export default function AIAdvisor({ questionnaireData, currentStep, onClose, analysis, onOpenFullReport }: Props) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const currentMessages = advisorMessages[currentStep]?.messages || []
  const currentMessage = currentMessages[currentMessageIndex] || ''

  // Typing animation effect
  useEffect(() => {
    if (!currentMessage) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    setDisplayedText('')
    setIsTyping(true)
    
    let index = 0
    const typingInterval = setInterval(() => {
      if (index < currentMessage.length) {
        setDisplayedText(currentMessage.substring(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 20) // 20ms per character for smooth typing

    return () => clearInterval(typingInterval)
  }, [currentMessage])

  // Reset to first message when step changes
  useEffect(() => {
    setCurrentMessageIndex(0)
  }, [currentStep])

  const handleNextMessage = () => {
    if (currentMessageIndex < currentMessages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1)
    } else {
      setCurrentMessageIndex(0)
    }
  }

  // Generate personalized insights based on data
  const getPersonalizedInsights = () => {
    const insights: string[] = []

    if (questionnaireData.age && questionnaireData.retirementAge) {
      const yearsToRetirement = questionnaireData.retirementAge - questionnaireData.age
      if (yearsToRetirement < 10) {
        insights.push("⚡ You have less than 10 years to retirement - we'll focus on accelerated savings strategies!")
      } else if (yearsToRetirement > 20) {
        insights.push("✨ You have great time on your side! We can leverage compound growth for maximum returns.")
      }
    }

    if (questionnaireData.currentIncome && questionnaireData.monthlyPayoutRequired) {
      const annualNeed = questionnaireData.monthlyPayoutRequired * 12
      const incomeRatio = (annualNeed / questionnaireData.currentIncome) * 100
      if (incomeRatio > 80) {
        insights.push("💡 You're aiming for a lifestyle similar to your current one - great planning!")
      } else if (incomeRatio < 50) {
        insights.push("🎯 You're planning for a more modest retirement - this gives you flexibility in your savings strategy.")
      }
    }

    if (questionnaireData.currentWealth !== null && questionnaireData.currentIncome) {
      if (questionnaireData.currentWealth < questionnaireData.currentIncome * 0.5) {
        insights.push("🚀 Let's focus on building your wealth foundation. Every dollar saved now works harder for your future!")
      }
    }

    return insights
  }

  const personalizedInsights = getPersonalizedInsights()

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl p-6 sticky top-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Financial Advisor</h3>
            <p className="text-xs text-gray-500">Here to guide you</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close advisor"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {/* Show analysis if available, otherwise show guidance messages */}
        {analysis ? (
          <div className="space-y-4">
            {/* Financial Analysis Results */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-lg text-gray-900 mb-3">📊 Your Financial Analysis</h4>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Required Corpus</p>
                  <p className="text-lg font-bold text-blue-900">
                    €{analysis.projections?.required_corpus?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Projected Wealth</p>
                  <p className="text-lg font-bold text-green-900">
                    €{analysis.projections?.projected_wealth_at_retirement?.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded ${analysis.projections?.wealth_gap > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                  <p className="text-xs text-gray-600">
                    {analysis.projections?.wealth_gap > 0 ? 'Wealth Gap' : 'Surplus'}
                  </p>
                  <p className={`text-lg font-bold ${analysis.projections?.wealth_gap > 0 ? 'text-orange-900' : 'text-green-900'}`}>
                    €{Math.abs(analysis.projections?.wealth_gap || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Monthly Savings Needed</p>
                  <p className="text-lg font-bold text-purple-900">
                    €{analysis.projections?.required_monthly_savings?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.status?.is_on_track
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {analysis.status?.is_on_track ? '✅ On Track!' : '⚠️ Needs Attention'}
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  Savings Rate: {analysis.projections?.savings_rate_percentage?.toFixed(1)}%
                </span>
              </div>

              {/* Years Money Will Last */}
              {analysis.projections?.estimated_years_money_lasts && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded mb-3">
                  <p className="text-sm text-gray-700">
                    💰 Your retirement fund is estimated to last{' '}
                    <strong>{analysis.projections.estimated_years_money_lasts} years</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  💡 Personalized Recommendations
                </h4>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="text-sm text-gray-700 leading-relaxed">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assumptions Used */}
            <details className="bg-white/50 rounded-lg p-3 border border-gray-200">
              <summary className="text-xs font-medium text-gray-700 cursor-pointer">
                📋 Calculation Assumptions
              </summary>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <p>• Withdrawal Rate: {(analysis.assumptions?.withdrawal_rate * 100).toFixed(1)}% (4% Rule)</p>
                <p>• Pre-Retirement Growth: {(analysis.assumptions?.growth_rate_pre_retirement * 100).toFixed(1)}% CAGR</p>
                <p>• Post-Retirement Growth: {(analysis.assumptions?.growth_rate_post_retirement * 100).toFixed(1)}%</p>
                <p>• Inflation Rate: {(analysis.assumptions?.inflation_rate * 100).toFixed(1)}%</p>
                <p>• Tax Rate: {(analysis.assumptions?.tax_rate * 100).toFixed(1)}%</p>
              </div>
            </details>

            {/* Full Report Button */}
            {onOpenFullReport && (
              <button
                onClick={onOpenFullReport}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
              >
                📊 See Detailed Analysis
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 shadow-sm min-h-[120px]">
            <p className="text-gray-800 whitespace-pre-wrap">
              {displayedText}
              {isTyping && <span className="inline-block w-1 h-4 bg-purple-600 ml-1 animate-pulse" />}
            </p>
          </div>
        )}

        {/* Navigation for messages (only show if no analysis) */}
        {!analysis && currentMessages.length > 1 && !isTyping && (
          <button
            onClick={handleNextMessage}
            className="w-full text-center text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            {currentMessageIndex < currentMessages.length - 1 ? '💬 See more tips' : '🔄 Start over'}
          </button>
        )}

        {/* Personalized Insights (only show if no analysis) */}
        {!analysis && personalizedInsights.length > 0 && currentStep === 4 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              📊 Your Personal Insights
            </h4>
            <ul className="space-y-2">
              {personalizedInsights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Tips (only show if no analysis) */}
        {!analysis && (
          <div className="bg-white/50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
            💡 Quick Tip
          </h4>
          {currentStep === 0 && (
            <p className="text-xs text-gray-600">
              The earlier you start planning, the more time your money has to grow through compound interest.
            </p>
          )}
          {currentStep === 1 && (
            <p className="text-xs text-gray-600">
              Try to save at least 15-20% of your income for retirement. As an athlete, consider saving more during peak earning years.
            </p>
          )}
          {currentStep === 2 && (
            <p className="text-xs text-gray-600">
              Diversification is key! Don't put all your eggs in one basket - spread investments across different asset types.
            </p>
          )}
          {currentStep === 3 && (
            <p className="text-xs text-gray-600">
              The rule of 25: Multiply your annual expenses by 25 to estimate how much you need to retire comfortably.
            </p>
          )}
          {currentStep === 4 && (
            <p className="text-xs text-gray-600">
              Factor in 2-3% annual inflation when planning your retirement income needs.
            </p>
          )}
          </div>
        )}

        {/* Progress Indicator (only show if no analysis) */}
        {!analysis && (
          <div className="text-center text-xs text-gray-500">
            Step {currentStep + 1} of 5 complete
          </div>
        )}
      </div>
    </div>
  )
}
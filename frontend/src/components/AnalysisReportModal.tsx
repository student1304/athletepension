import { useState } from 'react'

interface AnalysisData {
  inputs: {
    current_age: number
    retirement_age: number
    current_wealth: number
    current_income: number
    monthly_payout_required: number
    annual_payout_required: number
  }
  projections: {
    years_to_retirement: number
    required_corpus: number
    projected_wealth_at_retirement: number
    wealth_gap: number
    required_monthly_savings: number
    required_annual_savings: number
    savings_rate_percentage: number
    estimated_years_money_lasts: number
    inflation_adjusted_annual_payout: number
  }
  status: {
    is_on_track: boolean
    feasibility_score: number
    urgency_level: string
  }
  assumptions: {
    withdrawal_rate: number
    growth_rate_pre_retirement: number
    growth_rate_post_retirement: number
    inflation_rate: number
    tax_rate: number
    after_tax_growth_pre_retirement: number
    after_tax_growth_post_retirement: number
  }
  recommendations: string[]
}

interface Props {
  analysis: AnalysisData
  onClose: () => void
}

export default function AnalysisReportModal({ analysis, onClose }: Props) {
  const [emailSent, setEmailSent] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [email, setEmail] = useState('')

  const handleEmailReport = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/financial/email-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          analysis
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 3000)
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error sending email. Please try again.')
    }
  }

  const handlePrintPDF = async () => {
    setPdfGenerating(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/financial/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysis }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-analysis-report-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setPdfGenerating(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">📊 Your Financial Analysis Report</h2>
              <p className="text-blue-100">Comprehensive retirement planning analysis</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8" id="report-content">
          {/* Status Overview */}
          <div className={`p-6 rounded-xl ${analysis.status.is_on_track ? 'bg-green-50 border-2 border-green-500' : 'bg-orange-50 border-2 border-orange-500'}`}>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{analysis.status.is_on_track ? '✅' : '⚠️'}</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {analysis.status.is_on_track ? 'You\'re On Track!' : 'Action Required'}
                </h3>
                <p className="text-gray-700">
                  Feasibility Score: <strong>{analysis.status.feasibility_score}/100</strong> | 
                  Urgency: <strong className="capitalize">{analysis.status.urgency_level}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Your Input Data */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📝 Your Input Data
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Age</p>
                <p className="text-2xl font-bold text-blue-900">{analysis.inputs.current_age} years</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Retirement Age</p>
                <p className="text-2xl font-bold text-blue-900">{analysis.inputs.retirement_age} years</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Years to Save</p>
                <p className="text-2xl font-bold text-blue-900">{analysis.projections.years_to_retirement} years</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Income</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(analysis.inputs.current_income)}/year</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Wealth</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(analysis.inputs.current_wealth)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Monthly Needs</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(analysis.inputs.monthly_payout_required)}/mo</p>
              </div>
            </div>
          </section>

          {/* Financial Projections */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📈 Financial Projections
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Required Retirement Corpus</p>
                <p className="text-3xl font-bold text-blue-900 mb-2">{formatCurrency(analysis.projections.required_corpus)}</p>
                <p className="text-xs text-gray-600">Based on {formatCurrency(analysis.inputs.annual_payout_required)}/year with {formatPercent(analysis.assumptions.withdrawal_rate)} withdrawal rate</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Projected Wealth at Retirement</p>
                <p className="text-3xl font-bold text-green-900 mb-2">{formatCurrency(analysis.projections.projected_wealth_at_retirement)}</p>
                <p className="text-xs text-gray-600">If current wealth grows at {formatPercent(analysis.assumptions.growth_rate_pre_retirement)} CAGR</p>
              </div>
              
              <div className={`bg-gradient-to-br p-6 rounded-xl border ${analysis.projections.wealth_gap > 0 ? 'from-orange-50 to-orange-100 border-orange-200' : 'from-green-50 to-green-100 border-green-200'}`}>
                <p className="text-sm text-gray-600 mb-2">{analysis.projections.wealth_gap > 0 ? 'Wealth Gap to Fill' : 'Surplus'}</p>
                <p className={`text-3xl font-bold mb-2 ${analysis.projections.wealth_gap > 0 ? 'text-orange-900' : 'text-green-900'}`}>
                  {formatCurrency(Math.abs(analysis.projections.wealth_gap))}
                </p>
                <p className="text-xs text-gray-600">
                  {analysis.projections.wealth_gap > 0 ? 'Additional savings needed' : 'You have extra cushion'}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Required Monthly Savings</p>
                <p className="text-3xl font-bold text-purple-900 mb-2">{formatCurrency(analysis.projections.required_monthly_savings)}</p>
                <p className="text-xs text-gray-600">That's {analysis.projections.savings_rate_percentage.toFixed(1)}% of your current income</p>
              </div>
            </div>
          </section>

          {/* Growth & Payout Plan */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              💰 Growth & Payout Plan
            </h3>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm text-gray-600 mb-1">Pre-Retirement Growth</p>
                  <p className="text-2xl font-bold text-indigo-900">{formatPercent(analysis.assumptions.growth_rate_pre_retirement)}</p>
                  <p className="text-xs text-gray-600 mt-1">Annual compound growth</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm text-gray-600 mb-1">Post-Retirement Growth</p>
                  <p className="text-2xl font-bold text-indigo-900">{formatPercent(analysis.assumptions.growth_rate_post_retirement)}</p>
                  <p className="text-xs text-gray-600 mt-1">Conservative allocation</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">⏱️</div>
                  <p className="text-sm text-gray-600 mb-1">Portfolio Duration</p>
                  <p className="text-2xl font-bold text-indigo-900">{analysis.projections.estimated_years_money_lasts} years</p>
                  <p className="text-xs text-gray-600 mt-1">Estimated longevity</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">💡 Understanding Your Plan:</p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Your money will grow at {formatPercent(analysis.assumptions.growth_rate_pre_retirement)} annually until retirement</li>
                  <li>• At retirement, you'll have approximately {formatCurrency(analysis.projections.projected_wealth_at_retirement + (analysis.projections.required_monthly_savings * 12 * analysis.projections.years_to_retirement))}</li>
                  <li>• You can withdraw {formatPercent(analysis.assumptions.withdrawal_rate)} annually ({formatCurrency(analysis.inputs.annual_payout_required)}/year)</li>
                  <li>• After accounting for inflation ({formatPercent(analysis.assumptions.inflation_rate)}), your purchasing power is preserved</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Calculation Assumptions */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🔬 Calculation Assumptions
            </h3>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Withdrawal Rate</p>
                  <p className="text-xl font-bold text-gray-900">{formatPercent(analysis.assumptions.withdrawal_rate)}</p>
                  <p className="text-xs text-gray-500 mt-1">The 4% rule</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pre-Retirement Growth</p>
                  <p className="text-xl font-bold text-gray-900">{formatPercent(analysis.assumptions.growth_rate_pre_retirement)}</p>
                  <p className="text-xs text-gray-500 mt-1">Expected CAGR</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Post-Retirement Growth</p>
                  <p className="text-xl font-bold text-gray-900">{formatPercent(analysis.assumptions.growth_rate_post_retirement)}</p>
                  <p className="text-xs text-gray-500 mt-1">Conservative rate</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Inflation Rate</p>
                  <p className="text-xl font-bold text-gray-900">{formatPercent(analysis.assumptions.inflation_rate)}</p>
                  <p className="text-xs text-gray-500 mt-1">Annual adjustment</p>
                </div>
              </div>
            </div>
          </section>

          {/* Personalized Recommendations */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              💡 Personalized Recommendations
            </h3>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-gray-800">{rec}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Financial Terms Glossary */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📚 Financial Terms Explained
            </h3>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">4% Withdrawal Rule</h4>
                  <p className="text-sm text-gray-700">A widely accepted guideline that suggests you can safely withdraw 4% of your retirement portfolio annually without running out of money over a 30-year retirement period.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">CAGR (Compound Annual Growth Rate)</h4>
                  <p className="text-sm text-gray-700">The rate at which your investment grows annually when accounting for compounding. We use {formatPercent(analysis.assumptions.growth_rate_pre_retirement)} before tax ({formatPercent(analysis.assumptions.after_tax_growth_pre_retirement)} after {formatPercent(analysis.assumptions.tax_rate)} tax) as a conservative estimate based on historical market data.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Tax Rate</h4>
                  <p className="text-sm text-gray-700">We apply a {formatPercent(analysis.assumptions.tax_rate)} tax rate on investment gains to calculate realistic after-tax returns. This reduces your effective CAGR from {formatPercent(analysis.assumptions.growth_rate_pre_retirement)} to {formatPercent(analysis.assumptions.after_tax_growth_pre_retirement)}, providing a more accurate projection.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Retirement Corpus</h4>
                  <p className="text-sm text-gray-700">The total amount of money you need saved by retirement to support your desired lifestyle. Calculated as: Annual Expenses ÷ Withdrawal Rate.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Wealth Gap</h4>
                  <p className="text-sm text-gray-700">The difference between what you'll have at retirement (if you maintain current savings) and what you actually need. A positive gap means you need to save more.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Inflation Adjustment</h4>
                  <p className="text-sm text-gray-700">We account for {formatPercent(analysis.assumptions.inflation_rate)} annual inflation to ensure your purchasing power is maintained throughout retirement. Today's {formatCurrency(analysis.inputs.monthly_payout_required)}/month will need to be {formatCurrency(analysis.projections.inflation_adjusted_annual_payout / 12)}/month in {analysis.projections.years_to_retirement} years.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Important Disclaimer */}
          <section className="bg-gray-100 p-6 rounded-xl border border-gray-300">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Disclaimer:</strong> This analysis is for educational and planning purposes only and should not be considered financial advice. 
              Market returns are not guaranteed and actual results may vary. We recommend consulting with a certified financial planner 
              before making significant financial decisions. Past performance does not guarantee future results. All projections are based 
              on the assumptions stated above and should be reviewed regularly as your circumstances change.
            </p>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Email Section */}
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleEmailReport}
                  disabled={emailSent}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    emailSent
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {emailSent ? '✓ Sent!' : '📧 Email Report'}
                </button>
              </div>
            </div>
            
            {/* PDF Button */}
            <button
              onClick={handlePrintPDF}
              disabled={pdfGenerating}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400"
            >
              {pdfGenerating ? '⏳ Generating...' : '📄 Download PDF'}
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
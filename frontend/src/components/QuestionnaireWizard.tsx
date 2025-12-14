import { useState, useEffect, useRef } from 'react'

interface QuestionnaireData {
  age: number | null
  currentIncome: number | null
  currentWealth: number | null
  retirementAge: number | null
  monthlyPayoutRequired: number | null
}

interface Props {
  data: QuestionnaireData
  onDataUpdate: (data: Partial<QuestionnaireData>) => void
  currentStep: number
  onStepChange: (step: number) => void
  onAnalysisComplete?: () => void
}

const steps = [
  { id: 'age', title: 'Your Age', icon: '🎂' },
  { id: 'income', title: 'Current Income', icon: '💵' },
  { id: 'wealth', title: 'Current Wealth', icon: '💰' },
  { id: 'retirement', title: 'Retirement Plans', icon: '🏖️' },
  { id: 'payout', title: 'Monthly Needs', icon: '📊' },
]

export default function QuestionnaireWizard({ data, onDataUpdate, currentStep, onStepChange, onAnalysisComplete }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Refs for input fields
  const ageInputRef = useRef<HTMLInputElement>(null)
  const incomeInputRef = useRef<HTMLInputElement>(null)
  const wealthInputRef = useRef<HTMLInputElement>(null)
  const retirementAgeInputRef = useRef<HTMLInputElement>(null)
  const payoutInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when step changes
  useEffect(() => {
    const focusInput = () => {
      switch (currentStep) {
        case 0:
          ageInputRef.current?.focus()
          break
        case 1:
          incomeInputRef.current?.focus()
          break
        case 2:
          wealthInputRef.current?.focus()
          break
        case 3:
          retirementAgeInputRef.current?.focus()
          break
        case 4:
          payoutInputRef.current?.focus()
          break
      }
    }
    
    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(focusInput, 100)
    return () => clearTimeout(timeoutId)
  }, [currentStep])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0:
        if (!data.age || data.age < 18 || data.age > 100) {
          newErrors.age = 'Please enter a valid age between 18 and 100'
        }
        break
      case 1:
        if (!data.currentIncome || data.currentIncome < 0) {
          newErrors.currentIncome = 'Please enter a valid income'
        }
        break
      case 2:
        if (data.currentWealth === null || data.currentWealth < 0) {
          newErrors.currentWealth = 'Please enter a valid amount (can be 0)'
        }
        break
      case 3:
        if (!data.retirementAge || data.retirementAge <= (data.age || 0)) {
          newErrors.retirementAge = 'Retirement age must be greater than current age'
        }
        break
      case 4:
        if (!data.monthlyPayoutRequired || data.monthlyPayoutRequired < 0) {
          newErrors.monthlyPayoutRequired = 'Please enter required monthly amount'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        onStepChange(currentStep + 1)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (currentStep < steps.length - 1) {
        handleNext()
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
      setErrors({})
    }
  }

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      try {
        // Call the financial analysis API
        const response = await fetch('http://localhost:8000/api/v1/financial/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            age: data.age,
            retirement_age: data.retirementAge,
            current_wealth: data.currentWealth || 0,
            current_income: data.currentIncome,
            monthly_payout_required: data.monthlyPayoutRequired,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to analyze financial data')
        }

        const result = await response.json()
        console.log('Analysis result:', result)
        
        // Pass the analysis back to parent
        if (onDataUpdate) {
          onDataUpdate({ analysis: result.analysis })
        }
        
        // Open modal if callback provided
        if (onAnalysisComplete) {
          onAnalysisComplete()
        }
      } catch (error) {
        console.error('Error submitting data:', error)
        alert('Error analyzing your data. Please try again.')
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 ${index < steps.length - 1 ? 'mr-2' : ''}`}
            >
              <div
                className={`h-2 rounded-full transition-all ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="text-white text-center">
          <div className="text-4xl mb-2">{steps[currentStep].icon}</div>
          <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
          <p className="text-blue-100 mt-1">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        {/* Step 0: Age */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your current age?
              </label>
              <input
                ref={ageInputRef}
                type="number"
                value={data.age || ''}
                onChange={(e) => onDataUpdate({ age: parseInt(e.target.value) || null })}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="e.g., 28"
                min="18"
                max="100"
              />
              {errors.age && (
                <p className="mt-2 text-sm text-red-600">{errors.age}</p>
              )}
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                💡 <strong>Why we ask:</strong> Your age helps us calculate how long your money needs to last and the best investment strategies for your timeline.
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Current Income */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your current annual income after tax?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 text-lg">€</span>
                <input
                  ref={incomeInputRef}
                  type="number"
                  value={data.currentIncome || ''}
                  onChange={(e) => onDataUpdate({ currentIncome: parseFloat(e.target.value) || null })}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="e.g., 150000"
                  min="0"
                  step="1000"
                />
              </div>
              {errors.currentIncome && (
                <p className="mt-2 text-sm text-red-600">{errors.currentIncome}</p>
              )}
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-sm text-green-900">
                💡 <strong>Why we ask:</strong> Your income level helps us understand your capacity to save and invest, and determine appropriate investment options.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Current Wealth */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your current total wealth (savings, investments, assets)?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 text-lg">€</span>
                <input
                  ref={wealthInputRef}
                  type="number"
                  value={data.currentWealth ?? ''}
                  onChange={(e) => onDataUpdate({ currentWealth: parseFloat(e.target.value) || null })}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="e.g., 50000"
                  min="0"
                  step="1000"
                />
              </div>
              {errors.currentWealth && (
                <p className="mt-2 text-sm text-red-600">{errors.currentWealth}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Include all savings, investments, real estate equity, etc. Enter 0 if starting from scratch.
              </p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <p className="text-sm text-purple-900">
                💡 <strong>Why we ask:</strong> Your current wealth is the foundation for building your retirement nest egg. It helps us calculate how much more you need to save.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Retirement Age */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                At what age do you plan to retire?
              </label>
              <input
                ref={retirementAgeInputRef}
                type="number"
                value={data.retirementAge || ''}
                onChange={(e) => onDataUpdate({ retirementAge: parseInt(e.target.value) || null })}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="e.g., 35"
                min={(data.age || 18) + 1}
                max="100"
              />
              {errors.retirementAge && (
                <p className="mt-2 text-sm text-red-600">{errors.retirementAge}</p>
              )}
              {data.age && data.retirementAge && (
                <p className="mt-2 text-sm text-gray-600">
                  You have <strong>{data.retirementAge - data.age} years</strong> until retirement.
                </p>
              )}
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <p className="text-sm text-orange-900">
                💡 <strong>For athletes:</strong> Many professional athletes retire earlier than traditional careers. Plan accordingly for a longer retirement period!
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Monthly Payout Required */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How much monthly income after tax do you need after retirement?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 text-lg">€</span>
                <input
                  ref={payoutInputRef}
                  type="number"
                  value={data.monthlyPayoutRequired || ''}
                  onChange={(e) => onDataUpdate({ monthlyPayoutRequired: parseFloat(e.target.value) || null })}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="e.g., 5000"
                  min="0"
                  step="100"
                />
              </div>
              {errors.monthlyPayoutRequired && (
                <p className="mt-2 text-sm text-red-600">{errors.monthlyPayoutRequired}</p>
              )}
              {data.monthlyPayoutRequired && (
                <p className="mt-2 text-sm text-gray-600">
                  Annual requirement: <strong>€{(data.monthlyPayoutRequired * 12).toLocaleString()}</strong>
                </p>
              )}
            </div>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
              <p className="text-sm text-indigo-900">
                💡 <strong>Tip:</strong> Consider your desired lifestyle, healthcare costs, and inflation. Most experts recommend planning for 70-80% of your pre-retirement income.
              </p>
            </div>

            {/* Summary */}
            {data.age && data.currentIncome && data.retirementAge && data.monthlyPayoutRequired && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Your Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Current Age</p>
                    <p className="font-semibold text-lg">{data.age} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Retirement Age</p>
                    <p className="font-semibold text-lg">{data.retirementAge} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Years to Save</p>
                    <p className="font-semibold text-lg">{data.retirementAge - data.age} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Needs</p>
                    <p className="font-semibold text-lg">€{data.monthlyPayoutRequired.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors"
            >
              Analyze My Plan 🤖
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import QuestionnaireWizard from '../components/QuestionnaireWizard'
import AIAdvisor from '../components/AIAdvisor'
import AnalysisReportModal from '../components/AnalysisReportModal'

interface QuestionnaireData {
  age: number | null
  currentIncome: number | null
  currentWealth: number | null
  retirementAge: number | null
  monthlyPayoutRequired: number | null
  analysis?: any  // Financial analysis result from backend
}

export default function SmartPlanning() {
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    age: null,
    currentIncome: null,
    currentWealth: null,
    retirementAge: null,
    monthlyPayoutRequired: null,
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [showAIAdvisor, setShowAIAdvisor] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)

  const handleDataUpdate = (data: Partial<QuestionnaireData>) => {
    setQuestionnaireData(prev => ({ ...prev, ...data }))
  }
  
  const handleOpenModal = () => {
    console.log('Opening modal, analysis exists:', !!questionnaireData.analysis)
    setShowReportModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-4">
            <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
              <span>←</span> Back to Home
            </button>
          </a>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💰 Smart Financial Planning
          </h1>
          <p className="text-xl text-gray-600">
            Let our AI advisor guide you through your financial journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Questionnaire Section (2 columns) */}
          <div className="lg:col-span-2">
            <QuestionnaireWizard
              data={questionnaireData}
              onDataUpdate={handleDataUpdate}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onAnalysisComplete={handleOpenModal}
            />
          </div>

          {/* AI Advisor Section (1 column) */}
          <div className="lg:col-span-1">
            {showAIAdvisor && (
              <AIAdvisor
                questionnaireData={questionnaireData}
                currentStep={currentStep}
                onClose={() => setShowAIAdvisor(false)}
                analysis={questionnaireData.analysis}
                onOpenFullReport={handleOpenModal}
              />
            )}
            {!showAIAdvisor && (
              <button
                onClick={() => setShowAIAdvisor(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                🤖 Show AI Advisor
              </button>
            )}
          </div>
          
          {/* Analysis Report Modal */}
          {showReportModal && questionnaireData.analysis && (
            <AnalysisReportModal
              analysis={questionnaireData.analysis}
              onClose={() => setShowReportModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
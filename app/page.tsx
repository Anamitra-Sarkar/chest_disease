'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Shield, Info, ChevronDown, Heart, Zap, Brain, Stethoscope, Syringe, Pill, Thermometer, Microscope, Clipboard, FileText, Radio } from 'lucide-react'

// Floating icon component
function FloatingIcon({ icon: Icon, delay }: { icon: any, delay: number }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const velocityRef = useRef({ 
    x: (Math.random() - 0.5) * 0.3, 
    y: (Math.random() - 0.5) * 0.3 
  })

  useEffect(() => {
    // Initialize random position
    setPosition({
      x: Math.random() * 80 + 10, // 10-90% of width
      y: Math.random() * 80 + 10  // 10-90% of height
    })

    const interval = setInterval(() => {
      setPosition(prev => {
        const velocity = velocityRef.current
        let newX = prev.x + velocity.x
        let newY = prev.y + velocity.y

        // Bounce off edges
        if (newX < 5 || newX > 95) {
          velocity.x = -velocity.x
          newX = newX < 5 ? 5 : 95
        }
        if (newY < 5 || newY > 95) {
          velocity.y = -velocity.y
          newY = newY < 5 ? 5 : 95
        }

        return { x: newX, y: newY }
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="absolute transition-all duration-100 ease-linear pointer-events-none"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`
      }}
    >
      <Icon className="w-8 h-8 md:w-10 md:h-10 text-accent-400 opacity-20" />
    </div>
  )
}

export default function Home() {
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-accent-50 to-medical-100 relative overflow-hidden">
      {/* Floating Medical Icons - Increased to 14 */}
      <FloatingIcon icon={Activity} delay={0} />
      <FloatingIcon icon={Heart} delay={0.5} />
      <FloatingIcon icon={Stethoscope} delay={1} />
      <FloatingIcon icon={Syringe} delay={1.5} />
      <FloatingIcon icon={Pill} delay={2} />
      <FloatingIcon icon={Brain} delay={2.5} />
      <FloatingIcon icon={Thermometer} delay={3} />
      <FloatingIcon icon={Microscope} delay={3.5} />
      <FloatingIcon icon={Clipboard} delay={4} />
      <FloatingIcon icon={FileText} delay={4.5} />
      <FloatingIcon icon={Radio} delay={5} />
      <FloatingIcon icon={Shield} delay={5.5} />
      <FloatingIcon icon={Zap} delay={6} />
      <FloatingIcon icon={Heart} delay={6.5} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Image src="/logo.svg" alt="Chest X-Ray Assistant Logo" width={64} height={64} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-medical-900 mb-4">
              Chest X-Ray Assistant
            </h1>
            <p className="text-xl text-medical-600">
              AI-powered chest X-ray analysis for educational purposes
            </p>
          </header>

          {/* Enhanced Feature Showcase Section */}
          <div className="bg-gradient-to-br from-white to-accent-50/30 rounded-2xl shadow-medical-glow overflow-hidden mb-12 relative z-20 border-2 border-accent-200/50">
            <div className="relative w-full py-16 px-8">
              <div className="text-center">
                <div className="inline-block p-6 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full mb-6 shadow-glow">
                  <Activity className="w-24 h-24 text-accent-700" />
                </div>
                <h3 className="text-3xl font-bold text-medical-900 mb-4 glow-text">
                  AI-Powered Chest X-Ray Analysis
                </h3>
                <p className="text-xl text-medical-700 max-w-2xl mx-auto leading-relaxed">
                  Advanced deep learning technology trained on thousands of medical images
                  to provide educational insights into chest X-ray findings
                </p>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  <div className="flex flex-col items-center">
                    <div className="bg-accent-100 p-4 rounded-full mb-3 shadow-glow-sm">
                      <Brain className="w-10 h-10 text-accent-600" />
                    </div>
                    <span className="text-sm font-semibold text-medical-800">Neural Network</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-accent-100 p-4 rounded-full mb-3 shadow-glow-sm">
                      <Zap className="w-10 h-10 text-accent-600" />
                    </div>
                    <span className="text-sm font-semibold text-medical-800">Real-time</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-accent-100 p-4 rounded-full mb-3 shadow-glow-sm">
                      <Shield className="w-10 h-10 text-accent-600" />
                    </div>
                    <span className="text-sm font-semibold text-medical-800">Secure</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-accent-100 p-4 rounded-full mb-3 shadow-glow-sm">
                      <Microscope className="w-10 h-10 text-accent-600" />
                    </div>
                    <span className="text-sm font-semibold text-medical-800">Accurate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-accent-50/20 rounded-2xl shadow-medical-glow p-8 mb-12 relative z-20 border border-accent-200/30">
            <p className="text-lg text-medical-700 leading-relaxed mb-6">
              This assistant uses a trained neural network to analyze chest X-ray images
              and provide educational insights about potential findings. It is designed
              to support medical education and awareness.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-gradient-to-b from-accent-50 to-white shadow-glow-sm hover:shadow-glow transition-all duration-300">
                <div className="bg-gradient-to-br from-accent-100 to-accent-200 p-4 rounded-lg shadow-glow-sm">
                  <Brain className="w-8 h-8 text-accent-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-medical-900 mb-1">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-medical-600 text-sm">
                    CheXpert-trained CNN model for multi-label classification
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-gradient-to-b from-accent-50 to-white shadow-glow-sm hover:shadow-glow transition-all duration-300">
                <div className="bg-gradient-to-br from-accent-100 to-accent-200 p-4 rounded-lg shadow-glow-sm">
                  <Shield className="w-8 h-8 text-accent-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-medical-900 mb-1">
                    Privacy First
                  </h3>
                  <p className="text-medical-600 text-sm">
                    Images are processed in real-time, never stored
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-gradient-to-b from-accent-50 to-white shadow-glow-sm hover:shadow-glow transition-all duration-300">
                <div className="bg-gradient-to-br from-accent-100 to-accent-200 p-4 rounded-lg shadow-glow-sm">
                  <Zap className="w-8 h-8 text-accent-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-medical-900 mb-1">
                    Instant Results
                  </h3>
                  <p className="text-medical-600 text-sm">
                    Get immediate AI-powered insights and explanations
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Link
                href="/assistant"
                className="relative bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-4 px-10 rounded-lg transition-all duration-300 glow-button shadow-glow-lg hover:shadow-glow-xl transform hover:scale-105"
              >
                <span className="relative z-10">Start Analysis</span>
              </Link>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg mb-12 relative z-20">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-medical-900 mb-2">
                  Important Disclaimer
                </h3>
                <p className="text-medical-700 text-sm leading-relaxed">
                  This tool is for educational purposes only and is not a substitute for
                  professional medical diagnosis. Always consult a qualified healthcare
                  provider for medical advice. The AI outputs are probabilistic estimates
                  and should be interpreted with appropriate medical supervision.
                </p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-medical-lg p-8 relative z-20">
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h2 className="text-2xl font-bold text-medical-900 flex items-center gap-3">
                <Heart className="w-6 h-6 text-accent-600" />
                About & FAQs
              </h2>
              <ChevronDown
                className={`w-6 h-6 text-medical-600 transition-transform ${
                  showAbout ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showAbout && (
              <div className="space-y-6 pt-4 border-t border-medical-200">
                <div>
                  <h3 className="font-semibold text-medical-900 mb-2">
                    How does the AI work?
                  </h3>
                  <p className="text-medical-700 text-sm leading-relaxed">
                    Our system uses a Convolutional Neural Network (CNN) trained on the CheXpert
                    dataset to detect 14 different chest conditions. When you upload an image,
                    the model analyzes it and provides probability scores for each condition. 
                    These scores are then interpreted by an advanced language model to provide 
                    human-readable explanations.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-medical-900 mb-2">
                    What happens to my images?
                  </h3>
                  <p className="text-medical-700 text-sm leading-relaxed">
                    Your privacy is our priority. All images are processed in real-time and are
                    never stored on our servers. Once the analysis is complete, the image is
                    immediately discarded from memory. We do not collect, save, or share any
                    medical images or personal information.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-medical-900 mb-2">
                    Can I use this for medical diagnosis?
                  </h3>
                  <p className="text-medical-700 text-sm leading-relaxed">
                    <strong>No.</strong> This tool is strictly for educational purposes only.
                    It is not a medical device and should never be used for diagnosis, treatment,
                    or clinical decision-making. Always consult with qualified healthcare
                    professionals for any medical concerns or interpretations of medical imaging.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-medical-900 mb-2">
                    What conditions can it detect?
                  </h3>
                  <p className="text-medical-700 text-sm leading-relaxed mb-2">
                    The model can identify probability scores for 14 chest conditions:
                  </p>
                  <ul className="grid grid-cols-2 gap-2 text-sm text-medical-600">
                    <li>• No Finding</li>
                    <li>• Enlarged Cardiomediastinum</li>
                    <li>• Cardiomegaly</li>
                    <li>• Lung Opacity</li>
                    <li>• Lung Lesion</li>
                    <li>• Edema</li>
                    <li>• Consolidation</li>
                    <li>• Pneumonia</li>
                    <li>• Atelectasis</li>
                    <li>• Pneumothorax</li>
                    <li>• Pleural Effusion</li>
                    <li>• Pleural Other</li>
                    <li>• Fracture</li>
                    <li>• Support Devices</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-medical-900 mb-2">
                    How accurate is the AI?
                  </h3>
                  <p className="text-medical-700 text-sm leading-relaxed">
                    While our model has been trained on a large dataset, AI systems can make
                    mistakes and should not be relied upon for medical decisions. The probability
                    scores represent the model's confidence, not definitive diagnoses. Factors
                    like image quality, positioning, and patient-specific conditions can affect
                    accuracy.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-medical-900 mb-2">
                    Who built this application?
                  </h3>
                  <p className="text-medical-700 text-sm leading-relaxed">
                    This educational tool was developed to demonstrate the capabilities of AI
                    in medical imaging analysis. It combines deep learning for image analysis
                    with advanced language models for interpretation, creating an accessible
                    learning experience for students, educators, and anyone interested in
                    medical AI technology.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

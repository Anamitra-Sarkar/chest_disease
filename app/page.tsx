'use client'

import Link from 'next/link'
import { Activity, Shield, Info } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-50 to-medical-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Activity className="w-12 h-12 text-accent-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-medical-900 mb-4">
              Chest X-Ray Assistant
            </h1>
            <p className="text-xl text-medical-600">
              AI-powered chest X-ray analysis for educational purposes
            </p>
          </header>

          <div className="bg-white rounded-2xl shadow-medical-lg p-8 mb-12">
            <p className="text-lg text-medical-700 leading-relaxed mb-6">
              This assistant uses a trained neural network to analyze chest X-ray images
              and provide educational insights about potential findings. It is designed
              to support medical education and awareness.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-accent-50 p-3 rounded-lg">
                  <Activity className="w-6 h-6 text-accent-600" />
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

              <div className="flex items-start gap-3">
                <div className="bg-accent-50 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-accent-600" />
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
            </div>

            <div className="flex justify-center">
              <Link
                href="/assistant"
                className="bg-accent-600 hover:bg-accent-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Start Analysis
              </Link>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
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

          <footer className="text-center mt-16 text-medical-500 text-sm">
            <p>Built with CheXert CNN model • Powered by Groq API</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, Shield, Info, ChevronDown, Heart, Zap, Brain } from 'lucide-react'

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [showAbout, setShowAbout] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videos = ['/video1.mp4', '/video2.mp4', '/video3.mp4']

  const handleVideoEnd = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length)
  }

  const handleVideoError = () => {
    setVideoError(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-50 to-medical-100">
      <div className="container mx-auto px-4 py-16">
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

          {/* Video Loop Section */}
          <div className="bg-white rounded-2xl shadow-medical-lg overflow-hidden mb-12">
            {!videoError ? (
              <div className="relative w-full h-96 md:h-[600px] lg:h-screen lg:max-h-[800px]">
                <video
                  key={currentVideo}
                  src={videos[currentVideo]}
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleVideoEnd}
                  onError={handleVideoError}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {videos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideo(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentVideo ? 'bg-accent-600 w-8' : 'bg-white/50'
                      }`}
                      aria-label={`Go to video ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative w-full h-96 bg-gradient-to-br from-accent-50 to-medical-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <Activity className="w-16 h-16 text-accent-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-medical-900 mb-2">
                    AI-Powered Chest X-Ray Analysis
                  </h3>
                  <p className="text-medical-600">
                    Advanced deep learning for medical imaging insights
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-medical-lg p-8 mb-12">
            <p className="text-lg text-medical-700 leading-relaxed mb-6">
              This assistant uses a trained neural network to analyze chest X-ray images
              and provide educational insights about potential findings. It is designed
              to support medical education and awareness.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="bg-accent-50 p-4 rounded-lg">
                  <Brain className="w-8 h-8 text-accent-600" />
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

              <div className="flex flex-col items-center text-center gap-3">
                <div className="bg-accent-50 p-4 rounded-lg">
                  <Shield className="w-8 h-8 text-accent-600" />
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

              <div className="flex flex-col items-center text-center gap-3">
                <div className="bg-accent-50 p-4 rounded-lg">
                  <Zap className="w-8 h-8 text-accent-600" />
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
                className="relative bg-accent-600 hover:bg-accent-700 text-white font-semibold py-4 px-10 rounded-lg transition-all duration-200 glow-button"
              >
                <span className="relative z-10">Start Analysis</span>
              </Link>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg mb-12">
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
          <div className="bg-white rounded-2xl shadow-medical-lg p-8">
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

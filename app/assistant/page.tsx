'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Image as ImageIcon, AlertCircle, Activity, ChevronLeft, Bot } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Robot Nurse component for floating animation
function RobotNurse({ delay }: { delay: number }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const velocityRef = useRef({ 
    x: (Math.random() - 0.5) * 0.4, 
    y: (Math.random() - 0.5) * 0.4 
  })

  useEffect(() => {
    // Initialize random position
    setPosition({
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5
    })

    const interval = setInterval(() => {
      setPosition(prev => {
        const velocity = velocityRef.current
        let newX = prev.x + velocity.x
        let newY = prev.y + velocity.y

        // Bounce off edges with smoother motion
        if (newX < 3 || newX > 97) {
          velocity.x = -velocity.x
          newX = newX < 3 ? 3 : 97
        }
        if (newY < 3 || newY > 97) {
          velocity.y = -velocity.y
          newY = newY < 3 ? 3 : 97
        }

        return { x: newX, y: newY }
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="absolute transition-all duration-100 ease-linear pointer-events-none z-0"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        animationDelay: `${delay}s`
      }}
    >
      <div className="relative">
        <Bot className="w-6 h-6 md:w-8 md:h-8 text-accent-300 opacity-15 animate-pulse" 
             style={{ animationDuration: '3s' }} />
        {/* Nurse cap */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 md:w-4 md:h-3 bg-white opacity-15 rounded-t-lg" 
             style={{ 
               clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
             }} 
        />
      </div>
    </div>
  )
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  hasImageAnalysis?: boolean
  conditions?: Record<string, number>
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Chest X-Ray assistant. You can upload a chest X-ray image for analysis, or ask me general questions about chest conditions and radiology.\n\nPlease note: This tool is for educational purposes only and not a substitute for professional medical diagnosis.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Regex for bold text parsing (compiled once)
  const boldRegex = /\*\*(.*?)\*\*/g

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Please select an image smaller than 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setImageFile(file)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const textToSend = input.trim()
    const imageToSend = uploadedImage
    const fileToSend = imageFile

    if (!textToSend && !imageToSend) return

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      imageUrl: imageToSend || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setUploadedImage(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      if (textToSend) {
        formData.append('message', textToSend)
      }
      if (fileToSend) {
        formData.append('image', fileToSend)
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process request')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        hasImageAnalysis: data.has_image_analysis || false,
        conditions: data.conditions || undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your request. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-100 via-medical-100 to-accent-200 flex flex-col relative overflow-hidden">
      {/* Floating Robot Nurses - 20 robots */}
      <RobotNurse delay={0} />
      <RobotNurse delay={0.3} />
      <RobotNurse delay={0.6} />
      <RobotNurse delay={0.9} />
      <RobotNurse delay={1.2} />
      <RobotNurse delay={1.5} />
      <RobotNurse delay={1.8} />
      <RobotNurse delay={2.1} />
      <RobotNurse delay={2.4} />
      <RobotNurse delay={2.7} />
      <RobotNurse delay={3.0} />
      <RobotNurse delay={3.3} />
      <RobotNurse delay={3.6} />
      <RobotNurse delay={3.9} />
      <RobotNurse delay={4.2} />
      <RobotNurse delay={4.5} />
      <RobotNurse delay={4.8} />
      <RobotNurse delay={5.1} />
      <RobotNurse delay={5.4} />
      <RobotNurse delay={5.7} />

      <div className="relative z-10">
        <header className="bg-white/90 backdrop-blur-md border-b border-accent-200 px-4 py-4 shadow-glow-sm">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-accent-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-accent-700" />
              </Link>
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-accent-600 animate-pulse" />
                <div>
                  <h1 className="font-semibold text-medical-900">Chest X-Ray Assistant</h1>
                  <p className="text-xs text-accent-600">Educational Analysis Tool</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto max-w-4xl px-4 py-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-glow-lg flex flex-col h-[calc(100vh-200px)] min-h-[500px] border border-accent-200/50">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-glow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-accent-600 to-accent-700 text-white'
                      : 'bg-gradient-to-br from-medical-100 to-accent-50 text-medical-900'
                  }`}
                >
                  {message.imageUrl && (
                    <div className="mb-3">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-medical-200">
                        <Image
                          src={message.imageUrl}
                          alt="Uploaded X-ray"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {message.conditions && (
                    <div className="mb-4 p-3 bg-white/10 rounded-lg">
                      <p className="text-sm font-semibold mb-2">
                        Analysis Results (Probabilities):
                      </p>
                      <ul className="text-sm space-y-1">
                        {Object.entries(message.conditions).map(([condition, probability]) => (
                          <li key={condition} className="flex justify-between">
                            <span>{condition}:</span>
                            <span className="font-mono">
                              {(probability as number).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content.split('\n').map((line, idx) => {
                      // Handle bold text
                      const parts = line.split(boldRegex)
                      
                      return (
                        <p key={idx} className="mb-2 last:mb-0">
                          {parts.map((part, partIdx) => 
                            partIdx % 2 === 1 ? (
                              <strong key={partIdx}>{part}</strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-medical-100 rounded-2xl p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-accent-200 p-4 bg-white/80 backdrop-blur-md rounded-b-2xl">
            <form onSubmit={handleSubmit} className="space-y-3">
              {uploadedImage && (
                <div className="relative inline-block">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-accent-300">
                    <Image
                      src={uploadedImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white border-2 border-accent-300 rounded-lg hover:bg-accent-50 hover:border-accent-400 transition-all duration-200 flex-shrink-0 shadow-glow-sm"
                  disabled={isLoading}
                >
                  <ImageIcon className="w-5 h-5 text-accent-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message or upload an X-ray..."
                  className="flex-1 px-4 py-3 bg-white border-2 border-accent-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 disabled:opacity-50 transition-all duration-200"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !uploadedImage)}
                  className="p-3 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 disabled:from-medical-300 disabled:to-medical-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex-shrink-0 shadow-glow-sm hover:shadow-glow"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-4 bg-amber-50/90 backdrop-blur-md border-2 border-amber-300 rounded-lg p-4 shadow-glow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-medical-700">
                <strong>Important:</strong> This assistant provides educational information
                only. Probabilities shown are model outputs and should not be used for
                diagnosis. Always consult a qualified healthcare professional for medical
                advice.
              </p>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}

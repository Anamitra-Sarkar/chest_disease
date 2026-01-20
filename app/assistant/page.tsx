'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Image as ImageIcon, AlertCircle, Activity, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
    <div className="min-h-screen bg-medical-50 flex flex-col">
      <header className="bg-white border-b border-medical-200 px-4 py-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-medical-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-medical-600" />
            </Link>
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-accent-600" />
              <div>
                <h1 className="font-semibold text-medical-900">Chest X-Ray Assistant</h1>
                <p className="text-xs text-medical-500">Educational Analysis Tool</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-6">
        <div className="bg-white rounded-2xl shadow-medical flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-accent-600 text-white'
                      : 'bg-medical-100 text-medical-900'
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
                    {message.content}
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

          <div className="border-t border-medical-200 p-4 bg-medical-50 rounded-b-2xl">
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
                  className="p-3 bg-white border border-medical-300 rounded-lg hover:bg-medical-100 transition-colors flex-shrink-0"
                  disabled={isLoading}
                >
                  <ImageIcon className="w-5 h-5 text-medical-600" />
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
                  className="flex-1 px-4 py-3 bg-white border border-medical-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent disabled:opacity-50"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !uploadedImage)}
                  className="p-3 bg-accent-600 hover:bg-accent-700 disabled:bg-medical-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
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
  )
}

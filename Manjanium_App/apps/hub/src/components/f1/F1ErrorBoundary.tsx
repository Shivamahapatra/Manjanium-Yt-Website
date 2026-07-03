'use client'

import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: string }

export default class F1ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('F1 Hub Error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-[#EF4444] font-bold">⚠️ F1 Hub Error</div>
          <p className="text-[#6B7280] text-sm text-center max-w-md">
            {this.state.error || 'Something went wrong loading F1 data'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
            className="px-4 py-2 bg-[#FBBF24] text-black rounded-lg font-bold text-sm cursor-pointer"
          >
            Reload F1 Hub
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

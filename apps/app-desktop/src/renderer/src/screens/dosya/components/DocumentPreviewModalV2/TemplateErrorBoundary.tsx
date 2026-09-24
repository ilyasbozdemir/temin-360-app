import React from 'react'

export class TemplateErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Template rendering error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center text-amber-700 bg-amber-50 rounded-xl border border-amber-200 m-4">
            ⚠️ Belge şablonu çizilirken bir hata oluştu. Değişkenleri kontrol edip tekrar deneyiniz.
          </div>
        )
      )
    }
    return this.props.children
  }
}

import React, { Suspense } from 'react'

export function lazyRoute(
  factory: () => Promise<any>,
  exportName = 'default'
): () => React.ReactElement {
  const LazyComponent = React.lazy(async () => {
    const mod = await factory()
    const Component = mod[exportName] || mod.default || mod
    return { default: Component }
  })

  return function LazyRouteWrapper(): React.ReactElement {
    return (
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center p-8 text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        }
      >
        <LazyComponent />
      </Suspense>
    )
  }
}

import type { ReactNode } from 'react'

interface DrawYouMainProps {
  canvas: ReactNode
}

export const DrawYouMain = ({ canvas }: DrawYouMainProps) => {
  return (
    <main className="workspace-main">
      <section className="canvas-section">{canvas}</section>
    </main>
  )
}

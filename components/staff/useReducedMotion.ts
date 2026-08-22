'use client'

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * The single motion gate for the staff area. Import it; do not re-implement it.
 *
 * Section 3 of the spec: reduced motion means the scene STOPS MOVING ON ITS
 * OWN. It does not disappear. Gate autonomous drift, idle loops and scripted
 * tweens on this; leave pointer-driven response running either way.
 *
 * The server has no matchMedia, so this starts at `false` and corrects on
 * mount. That keeps the first client render identical to the server's — reading
 * the media query during render would hydrate-mismatch — and the correction
 * lands before paint via useEffect's commit, so no motion is ever shown to
 * someone who asked for none.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    setReduced(mq.matches)

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export default useReducedMotion

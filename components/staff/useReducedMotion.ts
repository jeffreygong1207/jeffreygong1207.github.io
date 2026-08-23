'use client'

import { useCallback, useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * The single motion gate for the staff area. Import it; do not re-implement it.
 *
 * Reduced motion means the scene stops moving on its own. It does not
 * disappear. Gate autonomous drift, idle loops and scripted tweens on this;
 * leave pointer-driven response running either way.
 *
 * Prefer CSS. `@media (prefers-reduced-motion: ...)` needs no hook, no
 * hydration and no JavaScript at all, and the motion tokens in globals.css are
 * already zeroed at `:root` under `reduce`. This hook is only for motion that
 * genuinely cannot be expressed in CSS — a rAF loop, a scripted tween, a
 * canvas.
 *
 * Implemented with useSyncExternalStore rather than useState + useEffect. The
 * previous version started at `false` and corrected in a `useEffect`, which
 * runs AFTER paint: a component that starts moving on mount got one painted
 * frame of motion in front of someone who had asked for none. React applies the
 * client snapshot from useSyncExternalStore before the browser paints, so the
 * first frame anyone sees is already correct, and passing a server snapshot
 * keeps hydration from mismatching.
 */

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

/**
 * The server cannot know the preference, so it renders the no-preference
 * branch — the same branch the blunt CSS clamp in globals.css stops anyway.
 */
function getServerSnapshot(): boolean {
  return false
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    useCallback(subscribe, []),
    getSnapshot,
    getServerSnapshot
  )
}

export default useReducedMotion

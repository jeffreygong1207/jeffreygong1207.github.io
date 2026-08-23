'use client'

import { useEffect } from 'react'

/**
 * Escape closes the open Vitrine in a group and hands focus back to its face.
 *
 * Render one per group, anywhere inside the surface. It draws nothing.
 *
 * <details> has no native Escape. It also has no native focus return: closing
 * one while focus is inside the panel drops focus to <body>, and the reader
 * loses their place in the tab order. Both are fixed here.
 *
 * Progressive enhancement, and only that. It gates no visible state: if this
 * chunk never loads, or hydration never happens, the face is still the toggle
 * and activating it a second time closes the object. Nothing on the page
 * becomes unreachable when this is absent — which is why it is allowed to be
 * script at all.
 *
 * Focus is only recaptured when it was inside the object being closed. Escape
 * pressed while the reader is somewhere else on the page closes the object
 * without moving them.
 */
export default function VitrineEscape({ group }: { group: string }) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return

      // Read `name` off the attribute rather than selecting on it: the group
      // key is arbitrary text and an attribute selector would need escaping.
      // Several may be open at once where the exclusive-accordion behaviour of
      // `name` is unsupported, so close every one of them.
      const open = Array.from(
        document.querySelectorAll<HTMLDetailsElement>('details[open]')
      ).filter((element) => element.getAttribute('name') === group)
      if (open.length === 0) return

      // Drop a fragment that names something we are about to close, so that
      // clicking the SAME spine again is a real fragment navigation rather than
      // a re-navigation to the URL the page is already on.
      //
      // This does NOT clear `:target`, and must not be relied on to: per spec
      // the document's target element is set by fragment navigation and history
      // traversal, and pushState/replaceState do not touch it. The stale-mark
      // problem this once claimed to fix is solved in Catalogue.module.css
      // instead, by keying the mark to [open].
      //
      // decodeURIComponent throws URIError on a malformed escape — a hand-typed
      // `#100%` is enough. Thrown here it would abort the handler before
      // anything closed and leave Escape dead for as long as that hash survived,
      // so a fragment we cannot read is simply a fragment we do not act on.
      const fragment = location.hash.slice(1)
      let targeted: HTMLElement | null = null
      if (fragment) {
        try {
          targeted = document.getElementById(decodeURIComponent(fragment))
        } catch {
          targeted = document.getElementById(fragment)
        }
      }

      const active = document.activeElement
      for (const details of open) {
        const held = active instanceof Node && details.contains(active)
        const face = details.querySelector<HTMLElement>('summary')
        // Focus first, close second: moving focus out before the panel stops
        // being rendered is what keeps it off <body>.
        if (held && face) face.focus()
        details.open = false
      }

      if (targeted && open.some((details) => details.contains(targeted))) {
        history.replaceState(null, '', `${location.pathname}${location.search}`)
      }

      event.preventDefault()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [group])

  return null
}

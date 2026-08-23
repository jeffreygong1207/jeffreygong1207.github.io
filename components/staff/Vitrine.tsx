import type { ReactNode } from 'react'
import styles from './Vitrine.module.css'

/**
 * THE VITRINE — one object that opens in place to reveal content.
 *
 * Built once, consumed by every staff surface that has an object with more to
 * say than fits on its face. A server component: nothing here is a client
 * boundary, nothing here hydrates, and no visible state is gated on JavaScript.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT RENDERS
 *
 *   <details class="salon-vitrine vitrine {styles.root} {className}"
 *            name={group} data-kind={kind}>
 *     <summary id={id} class="salon-focus {styles.face} {faceClassName}">
 *       {face}
 *     </summary>
 *     <div class="{styles.panel} {panelClassName}" data-vitrine="panel">
 *       <div class="{styles.panelInner}" data-vitrine="panel-inner">
 *         {children}
 *       </div>
 *     </div>
 *   </details>
 *
 * A native <details>. It opens with no CSS and no JavaScript at all, the
 * <summary> is focusable and in the tab order for free, and browsers expand a
 * closed one to satisfy find-in-page. Every failure path — stylesheet dropped,
 * script dead, `@starting-style` unsupported, reduced motion — resolves to
 * "snaps open, content visible".
 *
 * ---------------------------------------------------------------------------
 * PROPS
 *
 *   id             Lands on the <summary>, never on the <details>. The HTML
 *                  ancestor-details-revealing algorithm expands a closed
 *                  <details> when the fragment target is INSIDE it, so
 *                  `href="#{id}"` opens the object with zero script and gives
 *                  every opened object a URL. Build it with vitrineId().
 *   group          The `name` attribute: one open at a time across the group,
 *                  native, free. Where it is unsupported the group simply
 *                  allows several open at once.
 *   face           Summary content — the object itself. Must contain no
 *                  interactive element: a link or a button inside a <summary>
 *                  is invalid and unreachable. Links belong in the panel.
 *   children       Panel content.
 *   className      Lands on the <details>. Style open state from your own
 *                  module against the native attribute — `.yourClass[open]`.
 *                  Never import this component's stylesheet.
 *   faceClassName  Lands on the <summary>.
 *   panelClassName Lands on the panel wrapper, for padding and ground.
 *   kind           `data-kind`, for a consumer that renders more than one
 *                  species of object into one group.
 *
 * ---------------------------------------------------------------------------
 * THE CSS CONTRACT — what a consumer may rely on
 *
 *   --vitrine-open            0 closed, 1 open, interpolated across the open
 *                             transition and inherited all the way down.
 *                             Registered in app/globals.css. Derive every
 *                             transform from it in calc(); write no keyframes:
 *
 *                               translate: calc(var(--vitrine-open, 1) * 140px) 0;
 *
 *                             Pass 1 as the var() fallback so a missing
 *                             registration lands the object opened, not shut.
 *   --vitrine-dur-open        420ms via --salon-dur-slow.
 *   --vitrine-dur-close       240ms via --salon-dur-ui. Close is faster than
 *                             open: by then the reader has already decided.
 *   --vitrine-ease            The house curve.
 *   --vitrine-stagger-index   Set it per panel child (0, 1, 2, ...) and that
 *                             child's settle is delayed by --salon-stagger
 *                             times the index. Default 0.
 *   [open]                    The state selector. There is no state class and
 *                             no data attribute to watch.
 *   [data-vitrine]            "panel" / "panel-inner", stable hooks for a
 *                             consumer that would rather not thread a
 *                             className through.
 *
 * Escape-to-close and focus return are progressive enhancement and live in
 * VitrineEscape; render one per group. Without it the face is still the
 * toggle and activating it again closes.
 */

export default function Vitrine({
  id,
  group,
  face,
  children,
  className,
  faceClassName,
  panelClassName,
  kind,
}: {
  id: string
  group: string
  face: ReactNode
  children: ReactNode
  className?: string
  faceClassName?: string
  panelClassName?: string
  kind?: string
}) {
  return (
    <details
      className={join('salon-vitrine vitrine', styles.root, className)}
      name={group}
      data-kind={kind}
    >
      <summary id={id} className={join('salon-focus', styles.face, faceClassName)}>
        {face}
      </summary>

      <div className={join(styles.panel, panelClassName)} data-vitrine="panel">
        <div className={styles.panelInner} data-vitrine="panel-inner">
          {children}
        </div>
      </div>
    </details>
  )
}

function join(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/**
 * The shared id builder. Two surfaces link into each other's Vitrines by
 * fragment, so both sides have to arrive at the same string from the same key
 * — and the keys are not clean: a volume key reads `Fall 2023-UGBA 196`,
 * spaces and all.
 *
 * Output is `[a-z0-9-]` only, which is both a valid HTML id and a valid CSS
 * selector. The prefix leads so the id always starts with a letter; an id
 * beginning with a digit is legal HTML and unusable in a bare `#id` selector.
 */
export function vitrineId(prefix: string, key: string): string {
  const tail = slug(key)
  const head = slug(prefix)
  if (!tail) return head
  return head ? `${head}-${tail}` : tail
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

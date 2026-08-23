'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { ExperienceRole } from '@/lib/experience'
import useReducedMotion from './useReducedMotion'
import styles from './Slate.module.css'

/* Rest pose, matching the CSS defaults on `.device`. Kept in both places on
   purpose: CSS owns the pose before hydration and on touch, JS only nudges it. */
const REST_Y = -13
const REST_X = 3
/* Degrees of swing across the full stage, split either side of rest. Small:
   this is a reading surface, not a toy, and the text has to stay readable at
   the extremes. */
const SWING_Y = 11
const SWING_X = 7

function yearRange(roles: ExperienceRole[]): string {
  const years = roles
    .flatMap((role) => role.date.match(/\d{4}/g) ?? [])
    .map(Number)
  if (years.length === 0) return ''
  const first = Math.min(...years)
  const last = Math.max(...years)
  return first === last ? `${first}` : `${first} – ${last}`
}

function Mark({ role }: { role: ExperienceRole }) {
  if (role.logo) {
    return (
      <span className={styles.mark}>
        {/* Rendered at 20px CSS, requested at 2x so it stays crisp. alt is
            empty because the organisation name sits right beside it. */}
        <Image
          src={role.logo}
          alt=""
          width={40}
          height={40}
          className={styles.markImg}
        />
      </span>
    )
  }
  // No mark on file. A monogram in the display face — deliberately typographic
  // rather than a redrawn trademark, because this repo is public.
  return (
    <span className={`${styles.mark} ${styles.markLetter}`} aria-hidden="true">
      {role.organization.slice(0, 1)}
    </span>
  )
}

/**
 * §2.4 — six roles on an unbranded generic slate.
 *
 * §1: the 3D is the shell. Everything on the screen is ordinary DOM with real
 * focus order and real selection; a role is focusable only when it has a `url`,
 * and none do today, so the list is static text rather than fake affordances.
 */
export default function Slate({ roles }: { roles: ExperienceRole[] }) {
  const reduced = useReducedMotion()
  const deviceRef = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  const pose = useRef({ y: REST_Y, x: REST_X })

  // Pose is written straight onto the element's custom properties inside a
  // rAF rather than held in state: no re-render per pointer move, no layout
  // read/write thrash, and the browser only ever recomposites a transform.
  const flush = useCallback(() => {
    frame.current = null
    const el = deviceRef.current
    if (!el) return
    el.style.setProperty('--tilt-y', `${pose.current.y.toFixed(2)}deg`)
    el.style.setProperty('--tilt-x', `${pose.current.x.toFixed(2)}deg`)
  }, [])

  const schedule = useCallback(() => {
    if (frame.current === null) frame.current = requestAnimationFrame(flush)
  }, [flush])

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    },
    []
  )

  // §3: reduced motion stops the scene moving ON ITS OWN. Pointer-driven
  // response is not autonomous, so it is not gated here.
  const handleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Touch would fight the scroll and leave the slate stuck at whatever angle
    // the finger lifted at.
    if (event.pointerType === 'touch') return
    const box = event.currentTarget.getBoundingClientRect()
    if (box.width === 0 || box.height === 0) return
    const dx = (event.clientX - box.left) / box.width - 0.5
    const dy = (event.clientY - box.top) / box.height - 0.5
    pose.current = { y: REST_Y + dx * SWING_Y, x: REST_X - dy * SWING_X }
    schedule()
  }

  const handleLeave = () => {
    pose.current = { y: REST_Y, x: REST_X }
    schedule()
  }

  const described = roles.filter((role) => role.description).length

  return (
    <div className={styles.plate}>
      <div
        className={styles.stage}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <div
          ref={deviceRef}
          className={`${styles.device} ${reduced ? '' : styles.enter}`}
        >
          <div className={styles.screen}>
            <div className={styles.clip}>
              <div className={styles.head}>
                <span className={styles.headTitle}>Experience</span>
                <span className={styles.headRange}>{yearRange(roles)}</span>
              </div>

              <ol className={styles.roles}>
                {roles.map((role) => (
                  <li
                    key={`${role.organization}-${role.date}`}
                    className={styles.role}
                  >
                    <div className={styles.roleHead}>
                      <span className={styles.roleName}>
                        <Mark role={role} />
                        {role.url ? (
                          <a
                            className={`${styles.org} ${styles.orgLink}`}
                            href={role.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {role.organization}
                          </a>
                        ) : (
                          <span className={styles.org}>{role.organization}</span>
                        )}
                      </span>
                      <span className={styles.date}>{role.date}</span>
                    </div>

                    <p className={styles.position}>{role.position}</p>

                    {role.description ? (
                      <p className={styles.placeholder}>{role.description}</p>
                    ) : (
                      // §2.4: the absence is the point. A marked slug, not blank
                      // space and not invented copy.
                      <p className={styles.placeholder}>
                        <span className={styles.placeholderTag}>EMPTY</span>
                        <span>no description on file</span>
                      </p>
                    )}
                  </li>
                ))}
              </ol>

              <div className={styles.foot}>
                <span>
                  {roles.length} ROLES &middot; {described} DESCRIBED
                </span>
                <span className={styles.footPath}>lib/experience.ts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

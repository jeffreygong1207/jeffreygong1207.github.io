/**
 * The interactive surface, defined once.
 *
 * This existed as six near-identical strings across three files — two of them
 * byte-identical, the other four drifting in four separate ways: the
 * rgba(221,238,255,0.14/0.30) literal written out where --salon-edge and
 * --salon-edge-strong already hold exactly those values, the 240ms and the
 * house curve written out where --salon-dur-ui and --salon-ease already hold
 * them, and — the one that was not merely cosmetic — three different focus
 * behaviours for the same gesture.
 *
 * That last one was a real inconsistency, not a tidiness one. The media tile
 * and the posts row lifted on `focus-within` as well as `hover`; the /admin
 * cards and the /admin drafts row lifted on `hover` only. A keyboard user got
 * strictly less feedback than a pointer user on half the surfaces in the
 * product. `:focus-within` matches the element itself as well as its
 * descendants, so one variant serves both "the link IS the plate" and "the link
 * is INSIDE the plate" — there was never a reason for two mechanisms.
 *
 * Two constants rather than one: a card takes a full inset ring, a row takes a
 * left bar. That distinction is real and worth keeping. Six strings were not.
 */

/** The resting surface: plate ground, hairline edge. No states. */
export const PLATE = 'bg-salon-plate shadow-[inset_0_0_0_1px_var(--salon-edge)]'

/**
 * Two channels, deliberately. `bg-salon-raised` alone measures ~1.5:1 against
 * the plate, which is a nudge rather than a state change, so the hairline
 * brightens at the same time and the edge of the object moves with its face.
 */
const LIFT =
  'transition-[background-color,box-shadow] duration-[var(--salon-dur-ui)] ease-[var(--salon-ease)] hover:bg-salon-raised focus-within:bg-salon-raised'

/** A plate that is itself a target: full ring on lift. */
export const PLATE_CARD = `${PLATE} ${LIFT} hover:shadow-[inset_0_0_0_1px_var(--salon-edge-strong)] focus-within:shadow-[inset_0_0_0_1px_var(--salon-edge-strong)]`

/**
 * A row inside a plate: a left bar rather than a ring, because the ring belongs
 * to the container the rows sit in. Carries `group` for descendant ink.
 */
export const PLATE_ROW = `group ${LIFT} hover:shadow-[inset_2px_0_0_0_var(--salon-edge-strong)] focus-within:shadow-[inset_2px_0_0_0_var(--salon-edge-strong)]`

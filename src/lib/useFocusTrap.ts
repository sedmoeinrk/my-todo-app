import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Open traps, innermost last — only the top one handles keyboard focus. */
const trapStack: HTMLElement[] = []

const focusablesIn = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.getClientRects().length > 0 && !el.closest('[inert]'),
  )

/**
 * Keeps keyboard focus inside the returned ref's element while `active`:
 * - moves focus in on open (to `[data-autofocus]`, else the first focusable element),
 * - wraps Tab / Shift+Tab at the edges and pulls focus back if it escapes,
 * - restores focus to the previously focused element on close.
 *
 * Give the container `tabIndex={-1}` so it can hold focus when it has no controls.
 * Use `data-autofocus` instead of React's `autoFocus` inside a trap: `autoFocus`
 * fires before the trap can record which element to return focus to.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const container = ref.current
    if (!active || !container) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    trapStack.push(container)
    const isTopmost = () => trapStack[trapStack.length - 1] === container

    const initial = container.querySelector<HTMLElement>('[data-autofocus]') ?? focusablesIn(container)[0] ?? container
    initial.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !isTopmost()) return
      const items = focusablesIn(container)
      if (items.length === 0) {
        e.preventDefault()
        container.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement
      const outside = !container.contains(current)
      if (e.shiftKey && (current === first || current === container || outside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (current === last || outside)) {
        e.preventDefault()
        first.focus()
      }
    }

    const onFocusIn = (e: FocusEvent) => {
      if (isTopmost() && !container.contains(e.target as Node)) {
        ;(focusablesIn(container)[0] ?? container).focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onFocusIn)
      trapStack.splice(trapStack.indexOf(container), 1)
      // Return focus to the trigger, unless it was removed (e.g. a deleted todo's button).
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [active])

  return ref
}

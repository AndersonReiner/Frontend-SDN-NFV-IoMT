import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Informa se o viewport atual esta abaixo do breakpoint mobile definido pela aplicacao.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
}

/**
 * Observa mudancas no media query mobile para notificar o store externo.
 */
function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

/**
 * Snapshot client-side atual do media query mobile.
 */
function getSnapshot() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
}

/**
 * Snapshot server-side estavel para evitar dependencias de `window` na renderizacao.
 */
function getServerSnapshot() {
  return false
}

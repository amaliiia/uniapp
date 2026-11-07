import { useSyncExternalStore } from 'react'

function assinar(cb: () => void) {
    window.addEventListener('online', cb)
    window.addEventListener('offline', cb)
    return () => {
        window.removeEventListener('online', cb)
        window.removeEventListener('offline', cb)
    }
}

export function useOnline() {
    return useSyncExternalStore(assinar, () => navigator.onLine)
}
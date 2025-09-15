"use client"

import { useEffect } from 'react'

export function FontLoader() {
    useEffect(() => {
        // Preload critical fonts with error handling
        const preloadFont = (url: string, descriptor?: FontFaceDescriptors) => {
            try {
                const font = new FontFace('Inter', `url(${url})`, descriptor)
                font.load().then(() => {
                    document.fonts.add(font)
                }).catch(() => {
                    // Silently fail and use fallback fonts
                    console.log('Font loading failed, using fallback fonts')
                })
            } catch {
                // FontFace not supported, use fallback
            }
        }

        // Critical font preloading with timeout
        const fontTimeout = setTimeout(() => {
            // Force fallback fonts after timeout
            document.documentElement.classList.add('fonts-loaded')
        }, 3000)

        // Check if fonts are already loaded
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                clearTimeout(fontTimeout)
                document.documentElement.classList.add('fonts-loaded')
            })
        }

        return () => {
            clearTimeout(fontTimeout)
        }
    }, [])

    return null
}

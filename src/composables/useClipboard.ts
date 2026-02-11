import * as htmlToImage from 'html-to-image'

export function useClipboardShare() {
  /**
   * Check if Clipboard API is supported in the browser
   */
  const isClipboardSupported = computed(() => {
    if (typeof navigator === 'undefined')
      return false
    return !!(navigator.clipboard && navigator.clipboard.write)
  })

  /**
   * Copy plain text to clipboard
   * @param text - Text to copy
   * @throws Error if Clipboard API is not supported
   */
  async function copyText(text: string): Promise<void> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported')
    }
    await navigator.clipboard.writeText(text)
  }

  /**
   * Copy HTML element as PNG image to clipboard
   * @param element - HTML element to capture as image
   * @throws Error if Clipboard API is not supported
   */
  async function copyImage(element: HTMLElement): Promise<void> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported')
    }

    const filter = (node: HTMLElement) => {
      const exclusionClasses = ['hide-me']
      return !exclusionClasses.some(cls => node.classList?.contains(cls))
    }

    // Generate PNG data URL from HTML element
    const dataUrl = await htmlToImage.toPng(element, {
      quality: 1.0,
      pixelRatio: 2, // Retina display support
      cacheBust: true, // Ensure fresh render
      preferredFontFormat: 'woff2', // Prefer woff2 format for better compatibility
      filter,
    })

    // Convert data URL to blob
    const response = await fetch(dataUrl)
    const blob = await response.blob()

    // Write to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ])
  }

  return {
    isClipboardSupported,
    copyText,
    copyImage,
  }
}

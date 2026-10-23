import { chromium, webkit } from 'playwright'

const base = 'http://127.0.0.1:4173/#/gioi-thieu'
const browsers = [
  ['Chromium mobile', chromium],
  ['WebKit mobile', webkit],
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function coloredPixelCount(page) {
  return page.locator('.painter-mobile-canvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return -1
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let count = 0
    for (let y = 14; y < canvas.height - 14; y += 11) {
      for (let x = 14; x < canvas.width - 14; x += 11) {
        if (data[(y * canvas.width + x) * 4 + 3] > 10) count++
      }
    }
    return count
  })
}

for (const [label, type] of browsers) {
  const browser = await type.launch({ headless: true })
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'no-preference',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await page.locator('.painter-mobile-canvas').waitFor()
    await page.waitForTimeout(900)

    const painter = page.locator('.painter-mobile-canvas')
    assert(await painter.count() === 1, label + ': mobile renderer not selected')
    const dimensions = await painter.evaluate(canvas => [canvas.width, canvas.height])
    assert(dimensions[0] === 420 && dimensions[1] === 336, label + ': unbounded canvas resolution')

    await page.evaluate(() => {
      const section = document.querySelector('.painting-story')
      const sticky = section.querySelector('.motion-sticky')
      const distance = Math.max(0, section.offsetHeight - sticky.offsetHeight)
      window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top + distance * .7, behavior: 'instant' })
    })
    await page.waitForTimeout(1900)
    const pixels = await coloredPixelCount(page)
    const mobileDebug = await page.evaluate(() => {
      const section = document.querySelector('.painting-story')
      const element = document.querySelector('.painter-mobile-canvas')
      const fallback = document.querySelector('.painter-mobile-fallback')
      const brush = document.querySelector('.painter-mobile-brush')
      return {
        scrollY, innerWidth, innerHeight, hidden: document.hidden,
        sectionTop: section?.getBoundingClientRect().top,
        sectionHeight: section?.offsetHeight,
        stickyHeight: section?.querySelector('.motion-sticky')?.offsetHeight,
        fallback: !!fallback,
        brushOpacity: brush?.style.opacity,
        brushTransform: brush?.style.transform,
        canvasWidth: element?.width,
        canvasHeight: element?.height,
      }
    })
    console.log(label + ': diagnostics', JSON.stringify(mobileDebug))
    assert(pixels > 45, label + ': image failed to paint any visible pixels (' + pixels + ')')

    const brush = await page.locator('.painter-mobile-brush').evaluate(element => ({
      movement: element.style.transform,
      opacity: parseFloat(element.style.opacity || '0'),
    }))
    assert(brush.movement.includes('translate3d'), label + ': brush animation did not start')
    assert(Number.isFinite(brush.opacity), label + ': invalid brush opacity')

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    assert(overflow <= 2, label + ': page overflows mobile viewport by ' + overflow + 'px')
    assert(errors.length === 0, label + ': JavaScript errors: ' + JSON.stringify(errors))
    const frozen = await page.locator('.painter-viewport').getAttribute('data-paint-progress')
    const brushLeft = await page.locator('.painter-mobile-brush').evaluate(e => e.style.left)
    await page.waitForTimeout(550)
    const frozenAfter = await page.locator('.painter-viewport').getAttribute('data-paint-progress')
    const pixelsAfter = await coloredPixelCount(page)
    const brushLeftAfter = await page.locator('.painter-mobile-brush').evaluate(e => e.style.left)
    assert(frozen === frozenAfter && pixels === pixelsAfter && brushLeft === brushLeftAfter,
      label + ': painting continued moving after scroll stopped')

    const scrollToPainting = async (amount) => {
      await page.evaluate(amount => {
        const section = document.querySelector('.painting-story')
        const sticky = section.querySelector('.motion-sticky')
        const distance = Math.max(1, section.offsetHeight - sticky.offsetHeight)
        const raw = .015 + amount * .945
        window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top + distance * raw, behavior: 'instant' })
      }, amount)
      await page.waitForTimeout(160)
    }
    await scrollToPainting(.23)
    const pixelsBack = await coloredPixelCount(page)
    assert(pixelsBack < pixels * .75,
      label + ': painting did not reverse when scrolling upward (' + pixelsBack + ' vs ' + pixels + ')')
    await scrollToPainting(.012)
    const forwardLeft = parseFloat(await page.locator('.painter-mobile-brush').evaluate(e => e.style.left))
    await scrollToPainting(.038)
    const forwardRight = parseFloat(await page.locator('.painter-mobile-brush').evaluate(e => e.style.left))
    assert(forwardRight > forwardLeft, label + ': top row should paint left to right')
    await scrollToPainting(.070)
    const backwardRight = parseFloat(await page.locator('.painter-mobile-brush').evaluate(e => e.style.left))
    await scrollToPainting(.091)
    const backwardLeft = parseFloat(await page.locator('.painter-mobile-brush').evaluate(e => e.style.left))
    assert(backwardLeft < backwardRight, label + ': next row should paint right to left')
    console.log(label + ': PASS', JSON.stringify({ pixels, pixelsBack, dimensions, overflow, brushOpacity: brush.opacity }))

    const reduced = await browser.newPage({
      viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce',
    })
    await reduced.goto(base, { waitUntil: 'domcontentloaded' })
    await reduced.locator('.painter-mobile-canvas').waitFor()
    await reduced.waitForTimeout(950)
    const accessiblePixels = await coloredPixelCount(reduced)
    assert(accessiblePixels > 100, label + ': reduced motion did not display the finished image')
    console.log(label + ': REDUCED MOTION PASS', accessiblePixels)
    await reduced.close()
    await page.close()
  } finally {
    await browser.close()
  }
}

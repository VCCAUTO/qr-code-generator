import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'

const HISTORY_KEY = 'qr-code-history-v1'

const presets = {
  url: 'https://example.com',
  email: 'mailto:hello@example.com?subject=Hello',
  phone: 'tel:+1234567890',
  wifi: 'WIFI:T:WPA;S:MyNetwork;P:password123;;',
  vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Doe;Jane\nFN:Jane Doe\nORG:Example Company\nTITLE:Product Manager\nTEL;TYPE=CELL:+1234567890\nEMAIL:jane@example.com\nEND:VCARD`,
}

const presetLabels = [
  ['url', 'URL'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['wifi', 'WiFi'],
  ['vcard', 'vCard'],
]

function App() {
  const [value, setValue] = useState('https://example.com')
  const [note, setNote] = useState('')
  const [errorLevel, setErrorLevel] = useState('M')
  const [size, setSize] = useState(240)
  const [format, setFormat] = useState('PNG')
  const [fgColor, setFgColor] = useState('#111827')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [includeMargin, setIncludeMargin] = useState(true)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [copyStatus, setCopyStatus] = useState('')
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )

  const qrSignature = useMemo(
    () => `${value}|${note}|${errorLevel}|${size}|${format}|${fgColor}|${bgColor}|${includeMargin}`,
    [value, note, errorLevel, size, format, fgColor, bgColor, includeMargin],
  )

  const previewRef = useRef(null)
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      // localStorage can be unavailable in private mode
    }
  }, [history])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (!value.trim()) {
      return undefined
    }

    const timer = setTimeout(() => {
      setHistory((previous) => {
        const record = {
          value,
          note,
          errorLevel,
          size,
          format,
          fgColor,
          bgColor,
          includeMargin,
          createdAt: Date.now(),
          signature: qrSignature,
        }

        const filtered = previous.filter((item) => item.signature !== qrSignature)
        return [record, ...filtered].slice(0, 12)
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [value, note, errorLevel, size, format, fgColor, bgColor, includeMargin, qrSignature])

  const applyPreset = (presetKey) => {
    setValue(presets[presetKey])
  }

  const getCanvas = () => previewRef.current?.querySelector('canvas')
  const getSvg = () => previewRef.current?.querySelector('svg')

  const downloadCode = () => {
    if (!value.trim()) {
      return
    }

    const link = document.createElement('a')
    link.download = `qr-code.${format.toLowerCase()}`

    if (format === 'SVG') {
      const svgElement = getSvg()
      if (!svgElement) {
        return
      }

      const svgText = new XMLSerializer().serializeToString(svgElement)
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
      return
    }

    const canvas = getCanvas()
    if (!canvas) {
      return
    }

    link.href = canvas.toDataURL(format === 'JPEG' ? 'image/jpeg' : 'image/png')
    link.click()
  }

  const copyToClipboard = async () => {
    if (!value.trim()) {
      return
    }

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API unavailable')
      }

      if (window.ClipboardItem && navigator.clipboard.write) {
        if (format === 'SVG') {
          const svgElement = getSvg()
          if (svgElement) {
            const svgText = new XMLSerializer().serializeToString(svgElement)
            const svgBlob = new Blob([svgText], {
              type: 'image/svg+xml;charset=utf-8',
            })
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/svg+xml': svgBlob }),
            ])
            setCopyStatus('Copied image to clipboard')
            return
          }
        }

        const canvas = getCanvas()
        if (canvas) {
          const mimeType = format === 'JPEG' ? 'image/jpeg' : 'image/png'
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType))
          if (blob) {
            await navigator.clipboard.write([new ClipboardItem({ [mimeType]: blob })])
            setCopyStatus('Copied image to clipboard')
            return
          }
        }
      }

      await navigator.clipboard.writeText(value)
      setCopyStatus('Copied QR content text')
    } catch {
      setCopyStatus('Copy failed. Your browser may block clipboard image access.')
    }
  }

  const restoreFromHistory = (item) => {
    setValue(item.value)
    setNote(item.note)
    setErrorLevel(item.errorLevel)
    setSize(item.size)
    setFormat(item.format)
    setFgColor(item.fgColor)
    setBgColor(item.bgColor)
    setIncludeMargin(item.includeMargin)
  }

  return (
    <main
      className={`min-h-screen px-4 py-6 transition-colors sm:px-6 lg:px-8 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">QR Code Generator</h1>
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm font-medium hover:opacity-80"
            onClick={() => setDarkMode((current) => !current)}
          >
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section
            className={`rounded-xl border p-4 shadow-sm ${
              darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {presetLabels.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-xs font-semibold sm:text-sm ${
                    darkMode
                      ? 'border-slate-600 hover:bg-slate-800'
                      : 'border-slate-300 hover:bg-slate-100'
                  }`}
                  onClick={() => applyPreset(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-sm font-semibold">QR Data</label>
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Enter URL, text, or any data..."
              rows={5}
              className={`w-full rounded-md border p-3 text-sm outline-none focus:ring-2 ${
                darkMode
                  ? 'border-slate-700 bg-slate-950 text-slate-100 focus:ring-indigo-400'
                  : 'border-slate-300 bg-white text-slate-900 focus:ring-indigo-500'
              }`}
            />

            <label className="mb-2 mt-4 block text-sm font-semibold">Description / Notes</label>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional notes about this QR code"
              className={`w-full rounded-md border p-3 text-sm outline-none focus:ring-2 ${
                darkMode
                  ? 'border-slate-700 bg-slate-950 text-slate-100 focus:ring-indigo-400'
                  : 'border-slate-300 bg-white text-slate-900 focus:ring-indigo-500'
              }`}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Error Correction
                <select
                  value={errorLevel}
                  onChange={(event) => setErrorLevel(event.target.value)}
                  className={`mt-1 w-full rounded-md border p-2 ${
                    darkMode
                      ? 'border-slate-700 bg-slate-950 text-slate-100'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  {['L', 'M', 'Q', 'H'].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Export Format
                <select
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                  className={`mt-1 w-full rounded-md border p-2 ${
                    darkMode
                      ? 'border-slate-700 bg-slate-950 text-slate-100'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  {['PNG', 'SVG', 'JPEG'].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Foreground Color
                <input
                  type="color"
                  value={fgColor}
                  onChange={(event) => setFgColor(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border p-1"
                />
              </label>

              <label className="text-sm font-medium">
                Background Color
                <input
                  type="color"
                  value={bgColor}
                  onChange={(event) => setBgColor(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border p-1"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium">
              Size ({size}px)
              <input
                type="range"
                min="120"
                max="480"
                step="8"
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>

            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeMargin}
                onChange={(event) => setIncludeMargin(event.target.checked)}
              />
              Include outer margin
            </label>
          </section>

          <section
            className={`rounded-xl border p-4 shadow-sm ${
              darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            }`}
          >
            <h2 className="text-lg font-semibold">Live Preview</h2>
            <p className={`mb-4 mt-1 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Changes are applied in real time.
            </p>

            <div
              className={`mb-4 flex min-h-72 items-center justify-center rounded-lg border p-4 ${
                darkMode ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {value.trim() ? (
                <div ref={previewRef} className="rounded-md bg-white p-2">
                  {format === 'SVG' ? (
                    <QRCodeSVG
                      value={value}
                      size={size}
                      level={errorLevel}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      marginSize={includeMargin ? 4 : 0}
                    />
                  ) : (
                    <QRCodeCanvas
                      value={value}
                      size={size}
                      level={errorLevel}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      marginSize={includeMargin ? 4 : 0}
                    />
                  )}
                </div>
              ) : (
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Enter data to render a QR code
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={downloadCode}
                disabled={!value.trim()}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download {format}
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!value.trim()}
                className={`rounded-md border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                  darkMode ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
                }`}
              >
                Copy QR to Clipboard
              </button>
            </div>

            {copyStatus ? (
              <p className={`mt-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {copyStatus}
              </p>
            ) : null}

            {note ? (
              <p className={`mt-4 rounded-md p-3 text-sm ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <span className="font-semibold">Note:</span> {note}
              </p>
            ) : null}
          </section>
        </div>

        <section
          className={`rounded-xl border p-4 shadow-sm ${
            darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
          }`}
        >
          <h2 className="text-lg font-semibold">Recent History</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {history.length === 0 ? (
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Your recent QR codes will appear here.
              </p>
            ) : (
              history.map((item) => (
                <button
                  key={`${item.createdAt}-${item.signature}`}
                  type="button"
                  className={`rounded-lg border p-3 text-left text-sm ${
                    darkMode
                      ? 'border-slate-700 hover:bg-slate-800'
                      : 'border-slate-200 hover:bg-slate-100'
                  }`}
                  onClick={() => restoreFromHistory(item)}
                >
                  <p className="line-clamp-2 font-medium">{item.value}</p>
                  {item.note ? (
                    <p className={`mt-1 line-clamp-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.note}
                    </p>
                  ) : null}
                  <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App

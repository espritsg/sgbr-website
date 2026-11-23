'use client'

/**
 * One look for every form field on the site (docs/design-system.md):
 * square, 1px border, small uppercase label, navy focus, red error.
 */
import {
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

export const fieldClass =
  'block w-full border border-line bg-surface px-3.5 py-3 text-[0.9375rem] text-text transition-colors placeholder:text-muted hover:border-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'

export function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted"
    >
      {children}
      {required && <span className="text-accent"> *</span>}
    </label>
  )
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="mt-1.5 text-sm text-danger">
      {children}
    </p>
  )
}

type Base = { label?: string; hint?: string; error?: string; className?: string }

export function TextInput({
  label,
  hint,
  error,
  className = '',
  id,
  ...props
}: Base & InputHTMLAttributes<HTMLInputElement>) {
  const fallback = useId()
  const inputId = id ?? fallback
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={inputId} required={props.required}>
          {label}
        </Label>
      )}
      <input id={inputId} className={fieldClass} aria-invalid={Boolean(error)} {...props} />
      {hint && <p className="meta mt-1.5">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function TextArea({
  label,
  error,
  className = '',
  id,
  ...props
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fallback = useId()
  const inputId = id ?? fallback
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={inputId} required={props.required}>
          {label}
        </Label>
      )}
      <textarea
        id={inputId}
        rows={6}
        className={`${fieldClass} resize-y`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function SelectField({
  label,
  error,
  className = '',
  id,
  options,
  placeholder,
  ...props
}: Base &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ label: string; value: string }>
    placeholder?: string
  }) {
  const fallback = useId()
  const inputId = id ?? fallback
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={inputId} required={props.required}>
          {label}
        </Label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={`${fieldClass} appearance-none pr-10`}
          defaultValue=""
          aria-invalid={Boolean(error)}
          {...props}
        >
          <option value="" disabled>
            {placeholder ?? '—'}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="pointer-events-none absolute right-3.5 top-1/2 size-3 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </div>
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function Checkbox({
  children,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return (
    <label
      className={`group flex cursor-pointer items-start gap-3 text-sm leading-snug ${className}`}
    >
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden
        className="mt-px flex size-[18px] shrink-0 items-center justify-center border border-muted bg-surface transition-colors group-hover:border-text peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <svg
          viewBox="0 0 12 12"
          className="size-3 text-on-accent transition-opacity"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2.5 6.5 5 9l4.5-5.5" />
        </svg>
      </span>
      <span>
        {children}
        {props.required && <span className="text-accent"> *</span>}
      </span>
    </label>
  )
}

/** Large selectable tiles (newsletter interests). */
export function ChoiceTile({
  title,
  description,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { title: string; description: string }) {
  return (
    <label className="group relative flex cursor-pointer gap-3 border border-line bg-surface p-4 transition-colors hover:border-muted has-[:checked]:border-accent has-[:checked]:bg-band has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden
        className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center border border-muted transition-colors peer-checked:border-accent peer-checked:bg-accent [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <svg
          viewBox="0 0 12 12"
          className="size-3 text-on-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2.5 6.5 5 9l4.5-5.5" />
        </svg>
      </span>
      <span>
        <span className="block text-sm font-semibold text-text">{title}</span>
        <span className="meta mt-0.5 block">{description}</span>
      </span>
    </label>
  )
}

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** PDF upload with drag & drop, file name, size and remove (docs/formulare.md). */
export function FileDrop({
  name,
  label,
  required,
  maxBytes,
  texts,
}: {
  name: string
  label?: string
  required?: boolean
  maxBytes: number
  texts: {
    choose: string
    drop: string
    hint: string
    remove: string
    tooLarge: string
    wrongType: string
  }
}) {
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function accept(candidate: File | undefined) {
    if (!candidate) return
    const isPdf =
      candidate.type === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) return setError(texts.wrongType)
    if (candidate.size > maxBytes) return setError(texts.tooLarge)
    setError(null)
    setFile(candidate)
    // Keep the dropped file in the real input so the form sends it.
    if (input.current) {
      const transfer = new DataTransfer()
      transfer.items.add(candidate)
      input.current.files = transfer.files
    }
  }

  function clear() {
    setFile(null)
    if (input.current) input.current.value = ''
  }

  return (
    <div>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          accept(event.dataTransfer.files[0])
        }}
        className={`relative border border-dashed px-5 py-6 transition-colors ${dragging ? 'border-accent bg-band' : 'border-muted bg-surface'} ${error ? 'border-danger' : ''}`}
      >
        <input
          ref={input}
          id={inputId}
          name={name}
          type="file"
          accept="application/pdf,.pdf"
          required={required && !file}
          onChange={(event) => accept(event.target.files?.[0])}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-describedby={`${inputId}-hint`}
        />
        {file ? (
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="flex h-10 w-8 shrink-0 items-center justify-center border border-accent text-[0.5625rem] font-bold text-accent"
              >
                PDF
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{file.name}</span>
                <span className="meta">{formatSize(file.size)}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={clear}
              className="meta shrink-0 font-semibold text-text underline underline-offset-4 hover:text-danger"
            >
              {texts.remove}
            </button>
          </div>
        ) : (
          <div className="pointer-events-none flex items-center gap-4">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-7 shrink-0 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M12 16V4m0 0-4 4m4-4 4 4M5 15v4h14v-4" />
            </svg>
            <span>
              <span className="block text-sm">
                <span className="font-semibold text-accent underline underline-offset-4">
                  {texts.choose}
                </span>{' '}
                {texts.drop}
              </span>
              <span id={`${inputId}-hint`} className="meta">
                {texts.hint}
              </span>
            </span>
          </div>
        )}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  )
}

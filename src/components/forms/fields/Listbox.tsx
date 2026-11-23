'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { CaretDown, Check } from '../../ui/icons'

export type ListboxOption = { label: string; value: string }

type Props = {
  name?: string
  options: ListboxOption[]
  defaultValue?: string
  /** Shown while nothing is chosen. */
  placeholder?: string
  required?: boolean
  invalid?: boolean
  id?: string
  /** id of the visible label, for aria-labelledby. */
  labelId?: string
  /** Accessible name when there is no visible label. */
  ariaLabel?: string
  className?: string
}

/**
 * Custom select (replaces the browser's <select>, docs/design-system.md): a button
 * plus a listbox in the same look as the language dropdown. The value travels in a
 * normal form field, so it works in plain GET forms and with FormData. Keyboard:
 * arrows, Home/End, Enter/Space, Esc, and typing jumps to the first matching option.
 */
export function Listbox({
  name,
  options,
  defaultValue = '',
  placeholder,
  required,
  invalid,
  id,
  labelId,
  ariaLabel,
  className = '',
}: Props) {
  const fallbackId = useId()
  const buttonId = id ?? fallbackId
  const listId = `${buttonId}-list`
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const typed = useRef({ text: '', at: 0 })

  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  // Keep the highlighted option in view while moving through a long list.
  useEffect(() => {
    if (!open) return
    list.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  function show() {
    setActive(Math.max(0, options.indexOf(selected as ListboxOption)))
    setOpen(true)
  }

  function choose(index: number) {
    const option = options[index]
    if (option) setValue(option.value)
    setOpen(false)
    button.current?.focus()
  }

  function typeAhead(key: string) {
    const now = Date.now()
    typed.current = {
      text: (now - typed.current.at < 700 ? typed.current.text : '') + key.toLowerCase(),
      at: now,
    }
    const index = options.findIndex((option) =>
      option.label.toLowerCase().startsWith(typed.current.text),
    )
    if (index < 0) return
    if (open) setActive(index)
    else setValue(options[index].value)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = options.length - 1
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        if (!open) return show()
        const step = event.key === 'ArrowDown' ? 1 : -1
        setActive((index) => Math.min(last, Math.max(0, index + step)))
        return
      }
      case 'Home':
      case 'End':
        if (!open) return
        event.preventDefault()
        setActive(event.key === 'Home' ? 0 : last)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (open) choose(active)
        else show()
        return
      case 'Escape':
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        return
      case 'Tab':
        setOpen(false)
        return
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          typeAhead(event.key)
        }
    }
  }

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        ref={button}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId ? `${labelId} ${buttonId}` : undefined}
        aria-label={labelId ? undefined : ariaLabel}
        aria-invalid={invalid || undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={`flex h-12 w-full items-center justify-between gap-3 border bg-surface pl-3.5 pr-3 text-left text-[0.9375rem] transition-colors focus:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent ${
          open ? 'border-accent ring-1 ring-accent' : 'border-line hover:border-muted'
        } ${invalid ? 'border-danger' : ''}`}
      >
        <span className={`truncate ${selected ? 'text-text' : 'text-muted'}`}>
          {selected?.label ?? placeholder ?? '—'}
        </span>
        <CaretDown
          aria-hidden
          className={`size-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {/* Carries the value; focusable only so the browser can report "required". */}
      <input
        name={name}
        value={value}
        required={required}
        onChange={() => {}}
        onFocus={() => button.current?.focus()}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-px opacity-0"
      />
      <ul
        ref={list}
        id={listId}
        role="listbox"
        hidden={!open}
        aria-labelledby={labelId}
        className="absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-auto border border-line bg-surface py-1 shadow-[0_8px_24px_rgb(0_0_0/0.08)] [animation:sgbr-fade-in_160ms_var(--ease-out-soft)]"
      >
        {options.map((option, index) => {
          const isSelected = option.value === value
          return (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={isSelected}
              onPointerEnter={() => setActive(index)}
              onClick={() => choose(index)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-sm text-text ${
                index === active ? 'bg-band' : ''
              }`}
            >
              {option.label}
              {isSelected && <Check aria-hidden className="size-4 shrink-0 text-accent" />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

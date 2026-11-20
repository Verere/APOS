'use client'

import { ChevronDown, Download } from 'lucide-react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const defaultFormats = ['CSV', 'Excel', 'PDF']

export default function ExportButtons({
  label = 'Export',
  formats = defaultFormats,
  exportLoading = '',
  disabled = false,
  buttonLabels = {},
  onExport,
}) {
  const resolvedLabel = String(label || '').trim()

  return (
    <div className="w-full min-w-0 md:w-auto">
      <Menu as="div" className="relative inline-block w-full text-left md:w-auto">
        <MenuButton
          type="button"
          disabled={Boolean(exportLoading) || disabled}
          aria-busy={Boolean(exportLoading)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-blue-500 bg-slate-900 px-3 py-2.5 text-center text-[clamp(13px,2vw,16px)] font-semibold leading-none text-blue-200 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 md:w-auto"
        >
          <Download aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
          <span>
            {exportLoading
              ? `Preparing ${exportLoading}...`
              : resolvedLabel || 'Export'}
          </span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
        </MenuButton>
        <MenuItems
          anchor="bottom end"
          className="z-50 mt-2 min-w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg outline-none dark:border-slate-700 dark:bg-slate-900"
        >
          {formats.map((format) => (
            <MenuItem
              key={format}
              as="button"
              type="button"
              onClick={() => onExport(format)}
              className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none dark:text-gray-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
            >
              <Download aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" />
              {buttonLabels[format] || (format === 'Excel' ? 'Excel (.xlsx)' : format)}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  )
}

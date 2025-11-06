/**
 * FE-a11y-3: ARIA helper utilities for complex components
 * WCAG 2.1 AA compliance helpers
 */

/**
 * Generate unique ID for ARIA relationships
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * ARIA props for table components
 * Implements ARIA Grid pattern
 */
export interface TableAriaProps {
  /**
   * Total number of rows
   */
  rowCount: number
  /**
   * Total number of columns
   */
  colCount: number
  /**
   * Label for the table
   */
  label?: string
  /**
   * Description for the table
   */
  description?: string
}

export function getTableAriaProps({
  rowCount,
  colCount,
  label,
  description,
}: TableAriaProps) {
  const tableId = generateAriaId('table')
  const descId = description ? generateAriaId('table-desc') : undefined

  return {
    table: {
      role: 'grid',
      'aria-label': label,
      'aria-describedby': descId,
      'aria-rowcount': rowCount,
      'aria-colcount': colCount,
      id: tableId,
    },
    description: descId
      ? {
          id: descId,
          className: 'sr-only',
          children: description,
        }
      : null,
  }
}

/**
 * ARIA props for table header
 */
export function getTableHeaderAriaProps(index: number, sortable: boolean = false) {
  return {
    role: 'columnheader',
    'aria-colindex': index + 1,
    'aria-sort': sortable ? 'none' : undefined,
    scope: 'col',
  }
}

/**
 * ARIA props for table row
 */
export function getTableRowAriaProps(index: number, selected: boolean = false) {
  return {
    role: 'row',
    'aria-rowindex': index + 1,
    'aria-selected': selected,
  }
}

/**
 * ARIA props for table cell
 */
export function getTableCellAriaProps(rowIndex: number, colIndex: number) {
  return {
    role: 'gridcell',
    'aria-colindex': colIndex + 1,
    'aria-rowindex': rowIndex + 1,
  }
}

/**
 * ARIA props for sortable column header
 */
export function getSortableColumnAriaProps(
  index: number,
  sortDirection?: 'asc' | 'desc' | null
) {
  return {
    ...getTableHeaderAriaProps(index, true),
    'aria-sort': sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none',
    'aria-label': `Sort column ${sortDirection === 'asc' ? 'descending' : 'ascending'}`,
  }
}

/**
 * ARIA props for combobox (searchable select)
 */
export function getComboboxAriaProps(options: {
  id?: string
  label?: string
  expanded: boolean
  activeDescendant?: string
}) {
  const id = options.id || generateAriaId('combobox')
  const listboxId = `${id}-listbox`

  return {
    combobox: {
      role: 'combobox',
      'aria-label': options.label,
      'aria-expanded': options.expanded,
      'aria-controls': listboxId,
      'aria-activedescendant': options.activeDescendant,
      'aria-autocomplete': 'list' as const,
      id,
    },
    listbox: {
      role: 'listbox',
      id: listboxId,
      'aria-label': `${options.label} options`,
    },
  }
}

/**
 * ARIA props for tabs
 */
export function getTabsAriaProps(id: string, activeTab: string) {
  const tablistId = `${id}-tablist`

  return {
    tablist: {
      role: 'tablist',
      'aria-label': 'Tabs',
      id: tablistId,
    },
    tab: (tabId: string) => ({
      role: 'tab',
      'aria-selected': tabId === activeTab,
      'aria-controls': `${id}-${tabId}-panel`,
      id: `${id}-${tabId}-tab`,
      tabIndex: tabId === activeTab ? 0 : -1,
    }),
    panel: (tabId: string) => ({
      role: 'tabpanel',
      'aria-labelledby': `${id}-${tabId}-tab`,
      id: `${id}-${tabId}-panel`,
      hidden: tabId !== activeTab,
      tabIndex: 0,
    }),
  }
}

/**
 * ARIA props for toast/alert
 */
export function getToastAriaProps(type: 'success' | 'error' | 'warning' | 'info') {
  const roleMap = {
    success: 'status',
    error: 'alert',
    warning: 'alert',
    info: 'status',
  }

  const liveMap = {
    success: 'polite',
    error: 'assertive',
    warning: 'assertive',
    info: 'polite',
  }

  return {
    role: roleMap[type],
    'aria-live': liveMap[type] as 'polite' | 'assertive',
    'aria-atomic': 'true',
  }
}

/**
 * ARIA props for progress bar
 */
export function getProgressAriaProps(options: {
  value?: number
  max?: number
  label?: string
  indeterminate?: boolean
}) {
  if (options.indeterminate) {
    return {
      role: 'progressbar',
      'aria-label': options.label || 'Loading',
      'aria-valuemin': undefined,
      'aria-valuemax': undefined,
      'aria-valuenow': undefined,
    }
  }

  const value = options.value ?? 0
  const max = options.max ?? 100
  const percentage = Math.round((value / max) * 100)

  return {
    role: 'progressbar',
    'aria-label': options.label || 'Progress',
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': value,
    'aria-valuetext': `${percentage}%`,
  }
}

/**
 * ARIA props for menu
 */
export function getMenuAriaProps(id?: string) {
  const menuId = id || generateAriaId('menu')

  return {
    button: {
      'aria-haspopup': 'true' as const,
      'aria-expanded': false,
      'aria-controls': menuId,
    },
    menu: {
      role: 'menu',
      id: menuId,
    },
    menuitem: {
      role: 'menuitem',
      tabIndex: -1,
    },
  }
}

/**
 * ARIA props for breadcrumbs
 */
export function getBreadcrumbsAriaProps() {
  return {
    nav: {
      'aria-label': 'Breadcrumb',
    },
    list: {
      role: 'list',
    },
    item: {
      role: 'listitem',
    },
    currentPage: {
      'aria-current': 'page' as const,
    },
  }
}

/**
 * ARIA props for pagination
 */
export function getPaginationAriaProps(currentPage: number, totalPages: number) {
  return {
    nav: {
      role: 'navigation',
      'aria-label': 'Pagination',
    },
    button: (page: number) => ({
      'aria-label': `Go to page ${page}`,
      'aria-current': page === currentPage ? ('page' as const) : undefined,
    }),
    prev: {
      'aria-label': 'Go to previous page',
      'aria-disabled': currentPage === 1,
    },
    next: {
      'aria-label': 'Go to next page',
      'aria-disabled': currentPage === totalPages,
    },
  }
}

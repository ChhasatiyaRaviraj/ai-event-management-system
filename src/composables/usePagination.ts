import { ref, computed } from 'vue'

interface PaginationOptions {
  page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
}

interface UsePaginationOptions {
  initialPage?: number
  initialPerPage?: number
  totalItems?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPerPage = 15,
    totalItems = 0
  } = options

  // State
  const currentPage = ref(initialPage)
  const perPage = ref(initialPerPage)
  const total = ref(totalItems)

  // Computed
  const lastPage = computed(() => Math.ceil(total.value / perPage.value))
  const from = computed(() => {
    if (total.value === 0) return 0
    return (currentPage.value - 1) * perPage.value + 1
  })
  const to = computed(() => {
    if (total.value === 0) return 0
    return Math.min(from.value + perPage.value - 1, total.value)
  })

  const paginationInfo = computed<PaginationOptions>(() => ({
    page: currentPage.value,
    per_page: perPage.value,
    total: total.value,
    last_page: lastPage.value,
    from: from.value,
    to: to.value
  }))

  // Methods
  const setPage = (page: number) => {
    if (page >= 1 && page <= lastPage.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    if (currentPage.value < lastPage.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const setPerPage = (newPerPage: number) => {
    if (newPerPage > 0) {
      perPage.value = newPerPage
      currentPage.value = 1 // Reset to first page when changing per page
    }
  }

  const setTotal = (newTotal: number) => {
    total.value = newTotal
    // Adjust current page if necessary
    if (currentPage.value > lastPage.value && lastPage.value > 0) {
      currentPage.value = lastPage.value
    }
  }

  const reset = () => {
    currentPage.value = initialPage
    perPage.value = initialPerPage
    total.value = totalItems
  }

  // URL query parameter helpers
  const getQueryParams = () => {
    return {
      page: currentPage.value > 1 ? currentPage.value : undefined,
      per_page: perPage.value !== initialPerPage ? perPage.value : undefined
    }
  }

  const updateFromQuery = (query: Record<string, any>) => {
    if (query.page) {
      setPage(parseInt(query.page))
    }
    if (query.per_page) {
      setPerPage(parseInt(query.per_page))
    }
  }

  // Common pagination ranges
  const pageNumbers = computed(() => {
    const current = currentPage.value
    const last = lastPage.value
    const delta = 2 // Number of pages to show on each side

    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
      range.push(i)
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current + delta < last - 1) {
      rangeWithDots.push('...', last)
    } else {
      rangeWithDots.push(last)
    }

    return rangeWithDots.filter((item, index, array) => {
      // Remove duplicates
      return array.indexOf(item) === index
    })
  })

  const hasNextPage = computed(() => currentPage.value < lastPage.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  return {
    // State
    currentPage,
    perPage,
    total,
    
    // Computed
    lastPage,
    from,
    to,
    paginationInfo,
    pageNumbers,
    hasNextPage,
    hasPrevPage,
    
    // Methods
    setPage,
    nextPage,
    prevPage,
    setPerPage,
    setTotal,
    reset,
    getQueryParams,
    updateFromQuery
  }
}

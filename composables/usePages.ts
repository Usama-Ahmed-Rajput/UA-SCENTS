import pagesData from '~/data/pages.json'

export interface PageData {
  title: string
  description: string
  image?: string
  video?: string
  items?: Array<{ q: string; a: string }>
}

const fallbackPages = pagesData as Record<string, PageData>

export function usePage(slug: string): PageData {
  const pageState = useState<PageData>(`page-${slug}`, () => fallbackPages[slug] || { title: '', description: '' })

  if (process.client) {
    onMounted(async () => {
      try {
        const data = await $fetch<PageData>(`/api/pages/${slug}`)
        if (data) {
          pageState.value = {
            title: data.title,
            description: data.description,
            image: data.image || fallbackPages[slug]?.image,
            video: data.video || fallbackPages[slug]?.video,
            items: data.items || fallbackPages[slug]?.items,
          }
        }
      } catch {
        // Keep fallback
      }
    })
  }

  return pageState.value
}

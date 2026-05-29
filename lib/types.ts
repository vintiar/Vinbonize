export interface Border {
  id: string
  name: string
  image_url: string
  thumbnail_url: string | null
  category: string
  tags: string[]
  download_count: number
  created_at: string
}

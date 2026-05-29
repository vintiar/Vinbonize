import { fetchBorders } from '@/lib/borders'
import EditorClient from '@/components/EditorClient'

export default async function EditorPage() {
  const borders = await fetchBorders()
  return <EditorClient borders={borders} />
}

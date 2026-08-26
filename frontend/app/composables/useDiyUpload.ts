import type { DiyProductPhoto } from '@/types/diy'

const BUCKET = 'diy-product-photos'

export function useDiyUpload() {
  const supabase = useSupabase()
  const { user } = useAuth()

  async function uploadPhotos(productId: string, files: File[]): Promise<DiyProductPhoto[]> {
    if (!user.value) {
      throw new Error('You must be signed in to upload photos.')
    }

    const uploaded: DiyProductPhoto[] = []

    for (const [i, file] of files.entries()) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.value.id}/${productId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg',
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data, error } = await supabase
        .from('diy_product_photos')
        .insert({
          product_id: productId,
          storage_path: path,
          sort_order: i,
        })
        .select('id, product_id, storage_path, sort_order, created_at')
        .single()

      if (error) {
        throw new Error(error.message)
      }

      uploaded.push(data)
    }

    return uploaded
  }

  async function getSignedUrls(photos: DiyProductPhoto[]): Promise<DiyProductPhoto[]> {
    if (photos.length === 0) {
      return []
    }

    const paths = photos.map((photo) => photo.storage_path)
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, 60 * 60)

    if (error) {
      throw new Error(error.message)
    }

    const urlByPath = new Map(
      (data ?? []).map((item) => [item.path, item.signedUrl ?? undefined]),
    )

    return photos.map((photo) => ({
      ...photo,
      signed_url: urlByPath.get(photo.storage_path),
    }))
  }

  async function removePhoto(photo: DiyProductPhoto) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([photo.storage_path])

    if (storageError) {
      throw new Error(storageError.message)
    }

    const { error } = await supabase
      .from('diy_product_photos')
      .delete()
      .eq('id', photo.id)

    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    uploadPhotos,
    getSignedUrls,
    removePhoto,
  }
}

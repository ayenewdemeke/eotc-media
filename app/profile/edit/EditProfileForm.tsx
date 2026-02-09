"use client"

import { useState, FormEvent } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Area } from "react-easy-crop"
import InputError from "@/components/InputError"
import ImageCropper from "@/components/ImageCropper"
import getCroppedImg from "@/lib/cropImage"

interface EditProfileFormProps {
  user: {
    name: string
    email: string
    image: string | null
  }
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: user.name,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  // Cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10240 * 1024) {
        setErrors({ ...errors, image: 'Image must be less than 10MB' })
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'File must be an image' })
        return
      }

      setErrors({ ...errors, image: undefined })

      // Read file and open cropper
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setImageToCrop(null)
    setCroppedAreaPixels(null)
  }

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return

    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels)

      // Convert blob to file
      const croppedFile = new File([croppedBlob], "profile.jpg", {
        type: "image/jpeg",
      })

      setImageFile(croppedFile)

      // Create preview from blob
      const previewUrl = URL.createObjectURL(croppedBlob)
      setImagePreview(previewUrl)

      setShowCropper(false)
      setImageToCrop(null)
    } catch (error) {
      console.error("Error cropping image:", error)
      setErrors({ ...errors, image: "Failed to crop image" })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setUploadProgress(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }

      console.log('Submitting form with name:', formData.name, 'Image:', imageFile?.name)

      const response = await fetch('/api/main/profile/update', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()
      console.log('Response:', response.ok, data)

      if (!response.ok) {
        console.error('Update failed:', data)
        setErrors(data.errors || { name: data.error || 'Update failed' })
      } else {
        // Re-fetch session so UI updates with new user data
        await getSession()
        // Optionally, you can update local UI state or redirect as needed
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error during submission:', error)
      setErrors({ name: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
      setUploadProgress(null)
    }
  }

  return (
    <>
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          onSave={handleCropSave}
        />
      )}

      <form onSubmit={handleSubmit}>
      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '50%' }}>
          {/* Profile Image */}
          <div className="text-center my-12">
            <Image
              id="imageview"
              src={
                imagePreview ||
                (user.image ? `/api/main/profile/pictures/${user.image}` : "/images/placeholders/profile-default.jpg")
              }
              alt={user.name}
              width={200}
              height={200}
              className="rounded inline-block"
              style={{ width: '25%', height: 'auto' }}
              unoptimized
            />
            <div className="text-center m-3">
              <label
                htmlFor="image-upload"
                className="inline-block px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Choose File
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {uploadProgress !== null && (
                <progress value={uploadProgress} max="100" className="w-full mt-2">
                  {uploadProgress}%
                </progress>
              )}
              {errors.image && <InputError message={errors.image} />}
            </div>
          </div>

          {/* Profile Information */}
          <ul className="list-none border border-gray-300 rounded">
            <li className="px-4 border-b border-gray-300 bg-white">
              <div className="flex items-center py-2">
                <span>Name</span>
                <input
                  id="name"
                  type="text"
                  className="ms-4 flex-1 border-0 px-0 py-0 text-end focus:outline-none focus:ring-0"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name"
                  required
                  autoComplete="name"
                />
              </div>
              {errors.name && <InputError message={errors.name} />}
            </li>
            <li className="px-4 py-3 bg-white">
              <span>Email</span>
              <span className="float-end text-gray-700">{user.email}</span>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="text-end my-12">
            <Link
              href="/profile"
              className="inline-block px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              Back
            </Link>
            <button
              type="submit"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 ms-2 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </form>
    </>
  )
}

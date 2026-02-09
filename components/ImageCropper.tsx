"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Point, Area } from "react-easy-crop"

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedAreaPixels: Area) => void
  onCancel: () => void
  onSave: () => void
}

export default function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  onSave,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const handleCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete(croppedAreaPixels)
    },
    [onCropComplete]
  )

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-95 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Crop profile picture</h2>
        <div className="space-x-2">
          <button
            onClick={onCancel}
            className="inline-block px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative bg-gray-100">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
        />
      </div>

      {/* Zoom Controls */}
      <div className="bg-white border-t border-gray-300 p-4">
        <div className="max-w-md mx-auto">
          <label htmlFor="zoom-slider" className="block text-sm mb-2 text-gray-700">
            Zoom
          </label>
          <input
            id="zoom-slider"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

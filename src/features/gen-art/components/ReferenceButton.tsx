import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { UploadIcon, X } from 'lucide-react'

const ReferenceButton = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      alert('Please select an image file')
      event.target.value = ''
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="relative w-20 h-20">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile && previewUrl ? (
        <div className="relative w-full h-full">
          <img
            src={previewUrl}
            alt="Selected"
            className="border border-mountain-300 rounded-lg w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveFile}
            className="-top-2 -right-2 absolute bg-white hover:bg-gray-100 shadow-md p-1 rounded-full"
          >
            <X className="size-4 text-red-500" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col justify-center items-center space-y-1 bg-white hover:bg-mountain-50 shadow-md border border-mountain-300 rounded-lg w-full h-full"
        >
          <UploadIcon className="size-6 text-indigo-950" />
          <p className="text-mountain-950 text-xs">Upload</p>
        </Button>
      )}
    </div>
  )
}

export default ReferenceButton

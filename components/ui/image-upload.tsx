"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "lucide-react";
import { useState } from "react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  uploadPreset?: string;
  buttonText?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onUpload,
  uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  buttonText = "Upload Image",
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (result: any) => {
    if (result.event === "success") {
      const url = result.info.secure_url;
      onUpload(url);
    }
    setIsUploading(false);
  };

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      onSuccess={handleUpload}
      onUpload={handleUpload} // Fallback for older versions if needed
      options={{
        maxFiles: 1,
        resourceType: "image",
      }}
    >
      {({ open }) => {
        const onClick = () => {
          setIsUploading(true);
          open();
        };

        return (
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || isUploading}
            onClick={onClick}
            className="w-full sm:w-auto"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 h-4 w-4" />
            )}
            {buttonText}
          </Button>
        );
      }}
    </CldUploadWidget>
  );
}

import type { ImageInput } from "@/lib/types";

interface ImagePreviewStripProps {
  images: ImageInput[];
  onRemove: (index: number) => void;
}

export function ImagePreviewStrip({ images, onRemove }: ImagePreviewStripProps) {
  if (images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {images.map((image, index) => (
        <div
          key={`${image.mimeType}-${index}`}
          className="relative w-[152px] h-[152px] rounded-xl overflow-hidden border border-[#343434] flex-shrink-0 bg-[#1d1d1d]"
        >
          <img src={image.previewUrl} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            className="absolute top-1.5 right-1.5 bg-white border-none text-[#111] w-[27px] h-[27px] rounded-full text-xl cursor-pointer flex items-center justify-center leading-none shadow-md"
            onClick={() => onRemove(index)}
            title="Remove image"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

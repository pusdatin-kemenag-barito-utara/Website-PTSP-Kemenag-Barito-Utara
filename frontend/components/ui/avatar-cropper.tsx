"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedImg } from "@/lib/utils/image-crop";
import { Loader2 } from "lucide-react";

interface AvatarCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropComplete: (croppedBlob: Blob) => void;
}

export function AvatarCropper({ isOpen, onClose, imageSrc, onCropComplete }: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        onCropComplete(croppedImageBlob);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sesuaikan Foto Profil</DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            Geser dan perbesar gambar untuk menyesuaikan posisi foto profil Anda.
          </p>
        </DialogHeader>
        
        <div className="relative w-full h-64 sm:h-80 bg-slate-100 rounded-xl overflow-hidden my-4">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
            />
          )}
        </div>
        
        <div className="px-2">
          <label className="text-xs font-semibold text-slate-600 block mb-2">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={isProcessing || !imageSrc}
            className="bg-[#059669] hover:bg-[#047857] text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              "Simpan Foto"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

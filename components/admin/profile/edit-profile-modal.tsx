"use client";

import { useState, useRef, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Shield, Mail, Calendar, Camera, ZoomIn, ZoomOut, Upload, Loader2, AlertCircle, Save } from "lucide-react";
import { uploadAvatarAction, updateProfileNameAction } from "@/lib/actions/admin/admin-profile";
import { toast } from "sonner";
import { getRoleLabel } from "@/lib/constants";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Record<string, any>;
  isSuperAdmin: boolean;
  initials: string;
}

function getCroppedBlob(imageSrc: string, crop: Area, outputSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outputSize, outputSize);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        "image/jpeg",
        0.92,
      );
    };
    image.onerror = () => reject(new Error("Gagal memuat gambar"));
    image.src = imageSrc;
  });
}

export function EditProfileModal({
  open,
  onOpenChange,
  profile,
  isSuperAdmin,
  initials,
}: EditProfileModalProps) {
  const avatarUrl = profile?.avatarUrl as string | undefined;
  const userId = profile?.id as string | undefined;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [nameValue, setNameValue] = useState(profile?.fullName || "");
  const [savingName, setSavingName] = useState(false);
  const originalName = profile?.fullName || "";
  const nameChanged = nameValue.trim() !== originalName.trim();

  const canUpload = isSuperAdmin || ["admin_ptsp", "kepala_kantor", "kasubag_tu"].includes(profile?.role);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format file harus JPG, PNG, atau WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");
      return;
    }

    setError("");
    setSelectedFile(file);
    setImageSrc(URL.createObjectURL(file));
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels || !userId) return;
    setUploading(true);
    setError("");

    try {
      const croppedBlob = await getCroppedBlob(imageSrc!, croppedAreaPixels, 400);
      const ext = selectedFile.name.split(".").pop() || "jpg";
      const fileName = `admin-${userId}.${ext}`;

      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Gagal membaca file"));
        reader.readAsDataURL(croppedBlob);
      });

      const result = await uploadAvatarAction(base64, fileName);
      if (!result.success) throw new Error(result.error);

      toast.success("Foto profil berhasil diperbarui");
      resetCrop();
    } catch (err: any) {
      setError(err.message || "Gagal mengupload foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setError("Nama tidak boleh kosong.");
      return;
    }
    setSavingName(true);
    setError("");

    try {
      const result = await updateProfileNameAction(trimmed);
      if (!result.success) throw new Error(result.error);
      toast.success("Nama berhasil diperbarui");
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui nama");
    } finally {
      setSavingName(false);
    }
  };

  const resetCrop = () => {
    setImageSrc(null);
    setSelectedFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const createdAt = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const isCropping = !!imageSrc;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profil</DialogTitle>
        </DialogHeader>

        {/* Hidden file input */}
        {canUpload && (
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        )}

        {isCropping ? (
          /* ── Crop Mode ── */
          <div className="space-y-4">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-xl bg-black/50 px-3 py-2 backdrop-blur-sm">
                <ZoomOut className="h-4 w-4 text-white/70" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1 appearance-none rounded-full bg-white/20 accent-emerald-400 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-md"
                />
                <ZoomIn className="h-4 w-4 text-white/70" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetCrop}
                className="flex-1 h-11 rounded-xl font-bold text-sm"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !croppedAreaPixels}
                className="flex-1 h-11 rounded-xl font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Simpan Foto
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Info Mode ── */
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              {canUpload ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="group relative h-24 w-24 overflow-hidden rounded-full border-4 border-emerald-100 shadow-lg hover:border-emerald-300 transition-all cursor-pointer"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-50">
                      <span className="text-3xl font-black text-[#059669]">{initials}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="h-7 w-7 text-white" />
                  </div>
                </button>
              ) : (
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-200 shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
                      <span className="text-3xl font-black text-[#059669]">{initials}</span>
                    </div>
                  )}
                </div>
              )}
              {canUpload && (
                <p className="text-xs text-slate-400 font-medium -mt-2">
                  Klik foto untuk mengganti
                </p>
              )}
            </div>

            <div className="space-y-3 text-center">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="Nama lengkap"
                  className="flex-1 text-lg font-extrabold text-slate-800 text-center bg-transparent border-b-2 border-transparent focus:border-emerald-500 focus:outline-none px-1 py-0.5 transition-colors"
                />
                {nameChanged && (
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    title="Simpan nama"
                  >
                    {savingName ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/80 px-3 py-1.5 text-xs font-bold text-amber-700">
                    <Crown className="h-3.5 w-3.5" />
                    Super Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-bold text-[#059669]">
                    <Shield className="h-3.5 w-3.5" />
                    {getRoleLabel(profile?.role, profile?.email)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">Email</p>
                  <p className="text-sm font-bold text-slate-800 break-all">{profile?.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">Bergabung Sejak</p>
                  <p className="text-sm font-bold text-slate-800">{createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

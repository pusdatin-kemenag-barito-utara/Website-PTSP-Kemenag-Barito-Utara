"use client";

import React, { useState, useRef } from "react";
import { User, KeyRound, Save, Upload, Info, Image as ImageIcon } from "lucide-react";
import { updatePegawaiAvatar, updatePegawaiPassword } from "@/lib/actions/pegawai/profile";
import { updatePegawaiPhoneAction } from "@/lib/actions/auth/complete-profile";
import { AvatarCropper } from "@/components/ui/avatar-cropper";
import { PasswordStrength } from "@/components/ui/password-strength";
import { PasswordInput } from "@/components/ui/password-input";
import { SignaturePad } from "@/components/ui/signature-pad";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ProfileClient({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState<"data" | "security">("data");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const nipValue = profile?.nip || profile?.email?.split('@')[0] || "-";
  
  // Cropper State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImageStr, setSelectedImageStr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Phone State
  const initialPhone = profile?.phone 
    ? (profile.phone.startsWith("62") ? "0" + profile.phone.substring(2) : profile.phone)
    : "";
  const [phoneValue, setPhoneValue] = useState(initialPhone);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate type
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Format file tidak didukung", { description: "Gunakan JPG, PNG, atau WEBP" });
        return;
      }
      
      // Validate size
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File terlalu besar", { description: "Ukuran maksimal adalah 2MB" });
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSelectedImageStr(reader.result?.toString() || null);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
      
      // Reset input
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropperOpen(false);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", croppedBlob, "avatar.jpg");

      const result = await updatePegawaiAvatar(formData);
      
      if (result.success && result.avatarUrl) {
        setAvatarUrl(result.avatarUrl);
        toast.success("Foto profil berhasil diperbarui");
      } else {
        toast.error("Gagal", { description: result.error });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengunggah foto");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }
    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setIsSavingPassword(true);
    try {
      const formData = new FormData();
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      
      const result = await updatePegawaiPassword(formData);
      
      if (result.success) {
        toast.success(result.message);
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Gagal memperbarui password", { description: result.error });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!phoneValue || phoneValue.length < 10) {
      toast.error("Format nomor WhatsApp tidak valid.");
      return;
    }

    setIsSavingPhone(true);
    try {
      const formData = new FormData();
      formData.append("phone", phoneValue);
      
      const result = await updatePegawaiPhoneAction(formData);
      
      if (result.success) {
        toast.success("Nomor WhatsApp berhasil diperbarui.");
        setIsEditingPhone(false);
        // Optional: refresh page or state to reflect original state if needed
      } else {
        toast.error("Gagal memperbarui nomor", { description: result.error });
        setPhoneValue(initialPhone); // Revert to original
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
      setPhoneValue(initialPhone); // Revert to original
    } finally {
      setIsSavingPhone(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
          <div className="flex flex-row md:flex-col p-2 md:p-4 gap-1 md:gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-2.5 px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 md:flex-none justify-center md:justify-start ${
                activeTab === "data" 
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-100" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/80"
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === "data" ? "text-emerald-600" : "text-slate-400"}`} />
              Data Diri
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 md:flex-none justify-center md:justify-start ${
                activeTab === "security" 
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-100" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/80"
              }`}
            >
              <KeyRound className={`w-4 h-4 ${activeTab === "security" ? "text-emerald-600" : "text-slate-400"}`} />
              Keamanan Akun
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-8">
          {activeTab === "data" && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Informasi Data Diri</h2>
              
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center sm:items-start gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                          <User className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    
                    {/* Overlay Upload Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white cursor-pointer"
                    >
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-semibold">Ubah Foto</span>
                    </button>
                    
                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handleFileChange}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center sm:text-left max-w-[140px]">
                    Format: JPG, PNG, WEBP. Maks: 2MB. Rasio 1:1.
                  </p>
                </div>

                {/* Info Fields */}
                <div className="flex-1 flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">
                  <div className="flex-1 w-full space-y-4 sm:space-y-5">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm mb-2">
                      <Info className="w-5 h-5 shrink-0 text-blue-500" />
                      <p>
                        Data diri di bawah ini dikelola secara terpusat oleh Admin Kepegawaian PTSP. Jika terdapat ketidaksesuaian data, silakan hubungi Admin untuk melakukan perubahan.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Lengkap</label>
                        <input type="text" readOnly value={profile?.fullName || "-"} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">NIP</label>
                        <input type="text" readOnly value={nipValue} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Jabatan</label>
                        <input type="text" readOnly value={profile?.jabatan || "-"} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm outline-none" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nomor WhatsApp</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            readOnly={!isEditingPhone}
                            value={phoneValue}
                            onChange={(e) => setPhoneValue(e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className={`flex-1 h-11 px-4 rounded-xl border ${isEditingPhone ? 'border-slate-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-700 outline-none'} text-sm transition-all`} 
                          />
                          {!isEditingPhone ? (
                            <Button 
                              type="button"
                              onClick={() => setIsEditingPhone(true)}
                              className="h-11 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl"
                            >
                              Ubah Nomor WhatsApp
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button 
                                type="button"
                                onClick={handleUpdatePhone}
                                disabled={isSavingPhone}
                                className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl"
                              >
                                {isSavingPhone ? "Menyimpan..." : "Simpan"}
                              </Button>
                              <Button 
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingPhone(false);
                                  setPhoneValue(initialPhone);
                                }}
                                disabled={isSavingPhone}
                                className="h-11 border-slate-200 px-4 rounded-xl"
                              >
                                Batal
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">Nomor ini digunakan untuk verifikasi keamanan dan fitur Lupa Password.</p>
                      </div>
                    </div>
                  </div>

                  {/* Barcode TTE Section */}
                  <div className="w-full xl:w-auto pt-6 xl:pt-0 border-t xl:border-t-0 xl:border-l border-slate-100 xl:pl-8 flex flex-col items-center xl:items-start shrink-0">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 text-center xl:text-left w-full">Tanda Tangan Elektronik (TTE)</h3>
                    <div className="inline-block">
                      <SignaturePad 
                        nip={nipValue !== "-" ? nipValue : undefined} 
                        nama={profile?.fullName} 
                        className="scale-90 origin-top-left sm:scale-100" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Ubah Password</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Password Baru</label>
                  <PasswordInput 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                  />
                  <PasswordStrength password={password} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Konfirmasi Password Baru</label>
                  <PasswordInput 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-rose-500 font-medium">Password tidak cocok</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSavingPassword || password.length < 8 || password !== confirmPassword}
                    className="w-full bg-[#059669] hover:bg-[#047857] text-white rounded-xl h-11"
                  >
                    {isSavingPassword ? (
                      "Menyimpan..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <AvatarCropper 
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageSrc={selectedImageStr}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}

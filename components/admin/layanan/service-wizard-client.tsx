"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronRight, Settings2, Trash2, Pencil, ListChecks, FormInput, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AddEditItemModal } from "@/components/admin/item-layanan/add-edit-item-modal";
import { AddEditFieldModal } from "@/components/admin/form-layanan/add-edit-field-modal";
import { AddEditRequirementModal } from "@/components/admin/persyaratan/add-edit-requirement-modal";

// Actions
import {
  createServiceItemAction,
  updateServiceItemAction,
  deleteServiceItemAction,
  reorderServiceItemsAction,
  createFieldAction,
  updateFieldAction,
  deleteFieldAction,
  reorderFieldsAction,
  createRequirementAction,
  updateRequirementAction,
  deleteRequirementAction,
  reorderRequirementsAction,
} from "@/lib/actions/admin-master";
import { slugify } from "@/lib/utils";

export function ServiceWizardClient({ 
  initialService,
  isSuperAdmin = false 
}: { 
  initialService: any,
  isSuperAdmin?: boolean 
}) {
  const [service, setService] = useState(initialService);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  // Sync state with props when router.refresh() is called
  useEffect(() => {
    setService(initialService);
  }, [initialService]);


  // Modals state
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isFieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);

  const [isReqModalOpen, setReqModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<any>(null);

  // Accordion state for items
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "req">("form"); // Used when an item is expanded
  
  // Form Data States
  const [itemFormData, setItemFormData] = useState({
    service_id: initialService.id,
    name: "",
    slug: "",
    estimated_time: "1-3 Hari Kerja",
    is_active: true,
  });

  const [fieldFormData, setFieldFormData] = useState({
    service_item_id: "",
    label: "",
    name: "",
    type: "text",
    placeholder: "",
    is_required: true,
    options: "",
  });

  const [reqFormData, setReqFormData] = useState({
    service_item_id: "",
    document_name: "",
    is_required: true,
    allowed_extensions: "pdf,jpg,jpeg,png",
    max_file_size_mb: 5,
  });

  // Items sorted by sort_order
  const items = service.service_items?.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) || [];

  // --- REORDER ITEM HANDLER ---
  const handleReorderItem = (itemId: any, direction: 'up' | 'down') => {
    const index = items.findIndex((i: any) => i.id === itemId);
    if (index === -1) return;
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    
    const newItems = [...items];
    const moveIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[moveIndex]] = [newItems[moveIndex], newItems[index]];
    
    const ids = newItems.map((i: any) => Number(i.id));
    
    startTransition(async () => {
      try {
        await reorderServiceItemsAction(ids);
        toast.success("Urutan Item Diperbarui");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Gagal memperbarui urutan.");
      }
    });
  };

  // --- DELETE HANDLERS ---
  const handleDeleteItem = (id: number) => {
    if (!confirm("Hapus item layanan ini beserta semua form dan persyaratannya?")) return;
    const fd = new FormData();
    fd.append("id", id.toString());
    startTransition(async () => {
      try {
        await deleteServiceItemAction(fd);
        toast.success("Item Dihapus");
        router.refresh(); 
      } catch {
        toast.error("Gagal menghapus item.");
      }
    });
  };

  const handleDeleteField = (id: number) => {
    if (!confirm("Hapus field ini?")) return;
    const fd = new FormData();
    fd.append("id", id.toString());
    startTransition(async () => {
      try {
        await deleteFieldAction(fd);
        toast.success("Field Dihapus");
        router.refresh(); 
      } catch {
        toast.error("Gagal menghapus field.");
      }
    });
  };

  const handleDeleteReq = (id: number) => {
    if (!confirm("Hapus persyaratan ini?")) return;
    const fd = new FormData();
    fd.append("id", id.toString());
    startTransition(async () => {
      try {
        await deleteRequirementAction(fd);
        toast.success("Persyaratan Dihapus");
        router.refresh(); 
      } catch {
        toast.error("Gagal menghapus persyaratan.");
      }
    });
  };

  // --- SUBMIT HANDLERS ---
  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("service_id", itemFormData.service_id.toString());
    fd.append("name", itemFormData.name);
    fd.append("slug", itemFormData.slug);
    fd.append("estimated_time", itemFormData.estimated_time);
    if (itemFormData.is_active) fd.append("is_active", "on");

    startTransition(async () => {
      try {
        if (editingItem) {
          fd.append("id", editingItem.id.toString());
          await updateServiceItemAction(fd);
          toast.success("Item Diperbarui");
        } else {
          await createServiceItemAction(fd);
          toast.success("Item Ditambahkan");
        }
        if (editingItem) {
          setItemModalOpen(false);
          setEditingItem(null);
        } else {
          setItemFormData(p => ({
            ...p,
            name: "",
            slug: "",
            estimated_time: "1-3 Hari Kerja",
          }));
        }
        router.refresh();
      } catch {
        toast.error("Gagal menyimpan item.");
      }
    });
  };

  const handleFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("service_item_id", fieldFormData.service_item_id);
    fd.append("label", fieldFormData.label);
    fd.append("name", fieldFormData.name);
    fd.append("type", fieldFormData.type);
    fd.append("placeholder", fieldFormData.placeholder);
    fd.append("options", fieldFormData.options);
    if (fieldFormData.is_required) fd.append("is_required", "on");

    startTransition(async () => {
      try {
        if (editingField) {
          fd.append("id", editingField.id.toString());
          await updateFieldAction(fd);
          toast.success("Field Diperbarui");
          setFieldModalOpen(false);
          setEditingField(null);
        } else {
          await createFieldAction(fd);
          toast.success("Field Ditambahkan");
          // Keep modal open but reset form for next field
          setFieldFormData(p => ({
            ...p,
            label: "",
            name: "",
            placeholder: "",
          }));
        }
        router.refresh();
      } catch {
        toast.error("Gagal menyimpan field.");
      }
    });
  };

  const handleReqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("service_item_id", reqFormData.service_item_id);
    fd.append("document_name", reqFormData.document_name);
    fd.append("allowed_extensions", reqFormData.allowed_extensions);
    fd.append("max_file_size_mb", reqFormData.max_file_size_mb.toString());
    if (reqFormData.is_required) fd.append("is_required", "on");

    startTransition(async () => {
      try {
        if (editingReq) {
          fd.append("id", editingReq.id.toString());
          await updateRequirementAction(fd);
          toast.success("Persyaratan Diperbarui");
          setReqModalOpen(false);
          setEditingReq(null);
        } else {
          await createRequirementAction(fd);
          toast.success("Persyaratan Ditambahkan");
          // Keep modal open but reset form for next requirement
          setReqFormData(p => ({
            ...p,
            document_name: "",
          }));
        }
        router.refresh();
      } catch {
        toast.error("Gagal menyimpan persyaratan.");
      }
    });
  };
 
  const handleReorderField = (fieldId: any, direction: 'up' | 'down', currentFields: any[]) => {
    const index = currentFields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentFields.length - 1) return;
    
    const newFields = [...currentFields];
    const moveIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[moveIndex]] = [newFields[moveIndex], newFields[index]];
    
    const ids = newFields.map(f => f.id.toString());
    
    startTransition(async () => {
      try {
        const result = await reorderFieldsAction(ids);
        if (result?.success) {
          toast.success("Urutan Diperbarui");
          router.refresh();
        } else {
          toast.error(result?.error || "Gagal memperbarui urutan.");
        }
      } catch {
        toast.error("Terjadi kesalahan sistem.");
      }
    });
  };

  const handleReorderReq = (reqId: any, direction: 'up' | 'down', currentReqs: any[]) => {
    const sorted = [...currentReqs].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const index = sorted.findIndex((r: any) => r.id === reqId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const newReqs = [...sorted];
    const moveIndex = direction === 'up' ? index - 1 : index + 1;
    [newReqs[index], newReqs[moveIndex]] = [newReqs[moveIndex], newReqs[index]];

    const ids = newReqs.map((r: any) => r.id.toString());

    startTransition(async () => {
      try {
        const result = await reorderRequirementsAction(ids);
        if (result?.success) {
          toast.success("Urutan Persyaratan Diperbarui");
          router.refresh();
        } else {
          toast.error(result?.error || "Gagal memperbarui urutan.");
        }
      } catch {
        toast.error("Terjadi kesalahan sistem.");
      }
    });
  };

  const handleExtensionChange = (ext: string, checked: boolean) => {

    setReqFormData(prev => {
      const current = prev.allowed_extensions ? prev.allowed_extensions.split(',').map((e: string) => e.trim()).filter(Boolean) : [];
      let next;
      if (checked) {
        if (current.includes(ext)) return prev;
        next = [...current, ext];
      } else {
        next = current.filter((e: string) => e !== ext);
      }
      return { ...prev, allowed_extensions: next.join(',') };
    });
  };


  return (
    <div className="space-y-8">
      {/* HEADER SECTION: Items List */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-800">Daftar Item Layanan</h2>
            <p className="text-sm text-slate-500 mt-1">Kelola jenis-jenis layanan turunan di dalam layanan ini.</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setItemFormData({ service_id: initialService.id, name: "", slug: "", estimated_time: "1-3 Hari Kerja", is_active: true });
              setItemModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#059669] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Item
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item: any, idx: number) => (
            <div key={item.id} className="group">
              {/* ITEM ROW */}
              <div 
                className={`p-4 sm:px-6 flex items-center justify-between cursor-pointer transition-colors ${expandedItemId === item.id ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}
                onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg transition-colors ${expandedItemId === item.id ? 'bg-[#059669] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    {expandedItemId === item.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{item.slug}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {/* REORDER BUTTONS (SUPER ADMIN ONLY) */}
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1 mr-4 border-r pr-4 border-slate-200">
                      <button
                        onClick={() => handleReorderItem(item.id, 'up')}
                        disabled={idx === 0 || isPending}
                        className="p-1.5 text-slate-400 hover:text-[#059669] disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReorderItem(item.id, 'down')}
                        disabled={idx === items.length - 1 || isPending}
                        className="p-1.5 text-slate-400 hover:text-[#059669] disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold mr-4 ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {item.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                  
                  <button
                    onClick={() => { 
                      setEditingItem(item); 
                      setItemFormData({
                        service_id: initialService.id,
                        name: item.name,
                        slug: item.slug,
                        estimated_time: item.estimated_time || "1-3 Hari Kerja",
                        is_active: item.is_active
                      });
                      setItemModalOpen(true); 
                    }}
                    className="p-2 text-slate-400 hover:text-[#059669] hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* EXPANDED CONTENT (Forms & Requirements) */}
              <AnimatePresence>
                {expandedItemId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                  >
                    <div className="p-6">
                      
                      {/* Sub-tabs for Form and Requirements */}
                      <div className="flex gap-4 mb-6 border-b border-slate-200">
                        <button
                          onClick={() => setActiveTab("form")}
                          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'form' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                          <FormInput className="h-4 w-4" />
                          Form Input ({item.service_form_fields?.length || 0})
                        </button>
                        <button
                          onClick={() => setActiveTab("req")}
                          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'req' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                          <ListChecks className="h-4 w-4" />
                          Persyaratan Dokumen ({item.service_requirements?.length || 0})
                        </button>
                      </div>

                      {/* FORM TAB */}
                      {activeTab === "form" && (
                        <div className="space-y-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setEditingField(null);
                                setFieldFormData({
                                  service_item_id: item.id.toString(),
                                  label: "",
                                  name: "",
                                  type: "text",
                                  placeholder: "",
                                  is_required: true,
                                  options: "",
                                });
                                setFieldModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
                            >
                              <Plus className="h-3 w-3" /> Tambah Field
                            </button>
                          </div>
                          
                          {item.service_form_fields?.length === 0 ? (
                            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                              <p className="text-sm text-slate-500">Belum ada form input.</p>
                            </div>
                          ) : (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                                  <tr>
                                    <th className="px-4 py-3">Label</th>
                                    <th className="px-4 py-3">Tipe</th>
                                    <th className="px-4 py-3 text-center">Wajib</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {item.service_form_fields?.sort((a:any,b:any)=>a.sort_order-b.sort_order).map((field: any, fidx: number) => (
                                    <tr key={field.id} className="hover:bg-slate-50">
                                      <td className="px-4 py-3 font-medium text-slate-900">{field.label}</td>
                                      <td className="px-4 py-3 text-slate-600"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono">{field.type}</span></td>
                                      <td className="px-4 py-3 text-center">{field.is_required ? "✅" : "-"}</td>
                                      <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <button 
                                            onClick={() => handleReorderField(field.id, 'up', item.service_form_fields)}
                                            disabled={fidx === 0}
                                            className="p-1 text-slate-400 hover:text-[#059669] disabled:opacity-30"
                                          >
                                            <ArrowUp className="h-3.5 w-3.5" />
                                          </button>
                                          <button 
                                            onClick={() => handleReorderField(field.id, 'down', item.service_form_fields)}
                                            disabled={fidx === item.service_form_fields.length - 1}
                                            className="p-1 text-slate-400 hover:text-[#059669] disabled:opacity-30"
                                          >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                          </button>
                                          <div className="w-px h-4 bg-slate-200 mx-1" />
                                          <button onClick={() => { 
                                            setEditingField(field); 
                                            setFieldFormData({
                                              service_item_id: item.id.toString(),
                                              label: field.label,
                                              name: field.name,
                                              type: field.type,
                                              placeholder: field.placeholder || "",
                                              is_required: field.is_required,
                                              options: field.options || "",
                                            });
                                            setFieldModalOpen(true); 
                                          }} className="text-slate-400 hover:text-emerald-600 p-1"><Pencil className="h-3.5 w-3.5" /></button>
                                          <button onClick={() => handleDeleteField(field.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* REQ TAB */}
                      {activeTab === "req" && (
                        <div className="space-y-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setEditingReq(null);
                                setReqFormData({
                                  service_item_id: item.id.toString(),
                                  document_name: "",
                                  is_required: true,
                                  allowed_extensions: "pdf,jpg,jpeg,png",
                                  max_file_size_mb: 5,
                                });
                                setReqModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
                            >
                              <Plus className="h-3 w-3" /> Tambah Persyaratan
                            </button>
                          </div>

                          {item.service_requirements?.length === 0 ? (
                            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                              <p className="text-sm text-slate-500">Belum ada persyaratan dokumen.</p>
                            </div>
                          ) : (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                                  <tr>
                                    <th className="px-4 py-3">Nama Dokumen</th>
                                    <th className="px-4 py-3">Format</th>
                                    <th className="px-4 py-3 text-center">Wajib</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {[...item.service_requirements].sort((a:any,b:any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((req: any, idx: number) => (
                                    <tr key={req.id} className="hover:bg-slate-50">
                                      <td className="px-4 py-3 font-medium text-slate-900">{req.document_name}</td>
                                      <td className="px-4 py-3 text-slate-600"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono">{req.allowed_extensions}</span></td>
                                      <td className="px-4 py-3 text-center">{req.is_required ? "✅" : "-"}</td>
                                      <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <button 
                                            onClick={() => handleReorderReq(req.id, 'up', item.service_requirements)}
                                            disabled={idx === 0}
                                            className="p-1 text-slate-400 hover:text-[#059669] disabled:opacity-30"
                                          >
                                            <ArrowUp className="h-3.5 w-3.5" />
                                          </button>
                                          <button 
                                            onClick={() => handleReorderReq(req.id, 'down', item.service_requirements)}
                                            disabled={idx === item.service_requirements.length - 1}
                                            className="p-1 text-slate-400 hover:text-[#059669] disabled:opacity-30"
                                          >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                          </button>
                                          <div className="w-px h-4 bg-slate-200 mx-1" />
                                          <button onClick={() => { 
                                            setEditingReq(req); 
                                            setReqFormData({
                                              service_item_id: item.id.toString(),
                                              document_name: req.document_name,
                                              is_required: req.is_required,
                                              allowed_extensions: req.allowed_extensions,
                                              max_file_size_mb: req.max_file_size_mb || 5,
                                            });
                                            setReqModalOpen(true); 
                                          }} className="text-slate-400 hover:text-emerald-600 p-1"><Pencil className="h-3.5 w-3.5" /></button>
                                          <button onClick={() => handleDeleteReq(req.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
                <Settings2 className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-slate-500 font-bold">Layanan Kosong</h3>
              <p className="text-sm text-slate-400 mt-1">Mulai dengan menambahkan item layanan pertama.</p>
            </div>
          )}
        </div>
      </div>

      <AddEditItemModal
        isOpen={isItemModalOpen}
        editingItem={editingItem}
        services={[initialService]}
        formData={itemFormData}
        isPending={isPending}
        onClose={() => { setItemModalOpen(false); setEditingItem(null); }}
        onChangeName={(e) => setItemFormData(p => ({...p, name: e.target.value, slug: slugify(e.target.value)}))}
        onChangeFormData={(updates) => setItemFormData(p => ({...p, ...updates}))}
        onSubmit={handleItemSubmit}
      />

      <AddEditFieldModal
        isOpen={isFieldModalOpen}
        editingField={editingField}
        items={items}
        formData={fieldFormData}
        isPending={isPending}
        onClose={() => { setFieldModalOpen(false); setEditingField(null); }}
        onChangeLabel={(e) => {
          const val = e.target.value;
          setFieldFormData(p => ({...p, label: val, name: val.toLowerCase().replace(/[^a-z0-9]/g, "_")}));
        }}
        onChangeFormData={(updates) => setFieldFormData(p => ({...p, ...updates}))}
        onSubmit={handleFieldSubmit}
      />

      <AddEditRequirementModal
        isOpen={isReqModalOpen}
        editingRequirement={editingReq}
        items={items}
        formData={reqFormData}
        isPending={isPending}
        onClose={() => { setReqModalOpen(false); setEditingReq(null); }}
        onChangeFormData={(updates) => setReqFormData(p => ({...p, ...updates}))}
        onExtensionChange={handleExtensionChange}
        onSubmit={handleReqSubmit}
      />
    </div>
  );
}

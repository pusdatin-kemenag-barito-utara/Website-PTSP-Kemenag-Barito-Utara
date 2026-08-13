import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExportButtonProps {
  data: any[];
  fileName: string;
  sheetName?: string;
  variant?: "outline" | "default" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function ExportButton({
  data,
  fileName,
  sheetName = "Sheet1",
  variant = "outline",
  size = "sm",
  label = "Export Excel",
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      toast.error("Tidak ada data untuk di-export.");
      return;
    }

    setLoading(true);
    try {
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Add data
      if (data.length > 0) {
        // Add headers
        const headers = Object.keys(data[0]);
        worksheet.columns = headers.map((header) => ({
          header: header.toUpperCase(),
          key: header,
          width: Math.max(header.length, 15),
        }));

        // Add rows
        worksheet.addRows(data);
      }

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Create blob and save
      const dataBlob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(dataBlob, `${fileName}_${new Date().getTime()}.xlsx`);
      toast.success(`Data berhasil di-export ke ${fileName}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal melakukan export data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      variant={variant}
      size={size}
      className="flex items-center gap-2 rounded-xl font-bold uppercase tracking-wider text-[11px]"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}

export const isSameDay = (dateStr1: string, dateStr2: string): boolean => {
  try {
    const d1 = new Date(dateStr1);
    const year = d1.getFullYear();
    const month = String(d1.getMonth() + 1).padStart(2, "0");
    const day = String(d1.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}` === dateStr2;
  } catch (e) {
    return false;
  }
};

export const isSameMonth = (dateStr1: string, monthStr: string): boolean => {
  try {
    const d1 = new Date(dateStr1);
    const year = d1.getFullYear();
    const month = String(d1.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}` === monthStr;
  } catch (e) {
    return false;
  }
};

export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

export const maskPhoneNumber = (num: string): string => {
  if (!num) return "";
  const cleanNum = num.replace(/\D/g, "");
  if (cleanNum.length <= 6) return num;
  const firstPart = cleanNum.slice(0, 4);
  const lastPart = cleanNum.slice(-4);
  const masks = "*".repeat(4);
  return `${firstPart}${masks}${lastPart}`;
};

export const formatDateHeading = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const [year, month, day] = dateStr.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} - ${months[monthIndex]} - ${year}`;
  } catch (e) {
    return dateStr;
  }
};

export const formatMonthHeading = (monthStr: string): string => {
  if (!monthStr) return "-";
  try {
    const months = [
      "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
      "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ];
    const [year, month] = monthStr.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex]} - ${year}`;
  } catch (e) {
    return monthStr;
  }
};

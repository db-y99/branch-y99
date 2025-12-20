import stringSimilarity from "string-similarity";

export function generateAvatarUrl(name: string): string {
  if (!name) {
    return "";
  }
  // Generate a simple avatar URL from ui-avatars.com
  // You can customize parameters like background color, text color, size, etc.
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=128`;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateTimeVN(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export const getDefaultDateRange = () => {
  const now = new Date();

  // 1️⃣ Ngày đầu tháng trước
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // 2️⃣ Hôm nay
  const to = new Date();

  return { from, to };
};

export const getFileUrl = (file: string) => {
  if (!file) return;
  return `${process.env.NEXT_PUBLIC_API_URL}/static/files/${file}`;
};

// User Role Constants
export const USER_ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  CS: "cs",
  USER: "user",
} as const;

export const APPLICATION_STATUS_MAP: Record<
  number,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "danger";
  }
> = {
  0: { label: "Tất cả", color: "default" },
  1: { label: "Mới khởi tạo", color: "default" },
  2: { label: "Chờ thẩm định", color: "warning" },
  3: { label: "Bổ sung thông tin", color: "primary" },
  4: { label: "Từ chối", color: "danger" },

  5: { label: "Đồng ý", color: "success" }, // Credit approved
  6: { label: "Đã ký hợp đồng", color: "primary" }, // Legal phase
  7: { label: "Đã giải ngân", color: "secondary" }, // Financial complete
};

export const APPLICATION_FILE_TYPE_MAP = {
  CCCD_MT: "cccd-mt",
  CCCD_MS: "cccd-ms",
  AVATAR: "avatar",
  DKKH: "dkkh",
  DKKD: "dkkd",
  XNL: "xnl",
  XNTN: "xntn",
  DKX: "dkx",
  BLX: "blx",
  HDDC: "hddc",
  SD: "sd",
  IMAGE: "image",
  CV: "cv",
  CHUKY: "chuky",
  XNCT: "xnct",
} as const;

import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Profile = {
  id: number;
  username: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export type ApplicationFee = {
  code: string;
  name: string;
  type: number;
  value: number;
  amount: number;
  method: number;
  type__code: string;
  method__code: string;
  custom_amount: number;
};

export type Application = {
  id: number;
  code: string;
  fullname: string;
  phone: string;

  province: string;
  district: string;
  address: string;

  legal_code: string;
  issue_date: string; // ISO date (YYYY-MM-DD)
  issue_place: string;

  loan_amount: number;
  loan_term: number;

  approve_amount: number;
  approve_term: number;
  approve_time: string | null; // ISO datetime

  salary_income: number;
  business_income: number;
  other_income: number;

  living_expense: number;
  loan_expense: number;
  other_expense: number;

  credit_fee: number | null;
  disbursement_fee: number | null;
  loan_fee: number | null;
  colateral_fee: number | null;

  note: string;

  commission_rate: number | null;
  commission: number | null;

  fees: ApplicationFee[];

  create_time: string; // ISO datetime
  update_time: string; // ISO datetime

  country: number;
  sex: number;
  legal_type: number;
  product: number;
  collaborator: number | null;
  branch: number;
  currency: number;

  status: number;
  customer: number;

  creator: number | null;
  updater: number | null;
  approver: number | null;

  source: number;

  payment_status: number;
  payment_info: any | null;

  purpose: number;
  history: number;
  ability: number;

  doc_audit: number;
  onsite_audit: number;
};

export type ApplicationListResponse = {
  total_rows: number;
  full_data: boolean;
  rows: Application[];
};

export type StatusOption = {
  value: number;
  label: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
};

export type ApplicationFile = {
  id: number;
  ref: number;
  file: string;
  file__name: string;
  file__file: string;
  file__type__code: string;
  file__type__name: string;
  file__doc_type__code: string;
  file__doc_type__name: string;
  file__doc_type__en: string;
};

export type ApplicationFileListResponse = {
  total_rows: number;
  full_data: boolean;
  rows: ApplicationFile[];
};

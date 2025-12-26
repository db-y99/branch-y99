import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const loginId = searchParams.get("loginId");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Pagination parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  // Sort parameters
  const sortColumn = searchParams.get("sort") || "create_time";
  const sortOrder = searchParams.get("order") || "desc";

  // Filter parameters
  const search = searchParams.get("search"); // General search

  const supabase = await createClient();

  // Get user profile to check branch
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      *,
      branch_id:branches(*)
      `
    )
    .eq("id", loginId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Build query for application_records
  let query = supabase.from("application_records").select(
    `
        *,
        branches:branches!branch_uuid(*)
        `,
    { count: "exact" }
  );

  // Only allow sorting by create_time
  if (sortColumn === "create_time") {
    query = query.order("create_time", {
      ascending: sortOrder === "asc",
    });
  } else {
    // Default sort by create_time descending
    query = query.order("create_time", { ascending: false });
  }

  // Apply date filter
  if (from) {
    query = query.gte("create_time", `${from}T00:00:00Z`);
  } else {
    // Default: from 2025-01-01
    query = query.gte("create_time", "2025-01-01T00:00:00Z");
  }

  if (to) {
    query = query.lte("create_time", `${to}T23:59:59Z`);
  }

  // Apply status filter
  if (status) {
    query = query.eq("status", parseInt(status));
  }

  // Apply branch filter if user is not from headquarter
  const { data: headquarter } = await supabase
    .from("branches")
    .select("id")
    .eq("is_headquarter", true)
    .maybeSingle();
  if (profile?.branch_id?.id) {
    if (headquarter?.id && profile.branch_id.id !== headquarter.id) {
      // Filter by branch_uuid
      query = query.eq("branch_uuid", profile.branch_id.id);
    }
  }

  // Apply general search (searches in code, fullname, customer_code, phone)
  if (search) {
    query = query.or(
      `code.ilike.%${search}%,fullname.ilike.%${search}%,customer_code.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  try {
    // Apply pagination
    const {
      data: records,
      error,
      count,
    } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    // Map application_records to Application type format
    const rows = (records || []).map((record: any) => ({
      id: record.id,
      code: record.code,
      fullname: record.fullname || "",
      phone: record.phone || "",
      province: record.province || "",
      district: record.district || "",
      address: record.address || "",
      legal_code: record.legal_code || "",
      issue_date: record.issue_date || "",
      issue_place: record.issue_place || "",
      loan_amount: record.loan_amount || 0,
      loan_term: record.loan_term || 0,
      approve_amount: record.approve_amount || 0,
      approve_term: record.approve_term || 0,
      approve_time: null,
      salary_income: 0,
      business_income: 0,
      other_income: 0,
      living_expense: 0,
      loan_expense: 0,
      other_expense: 0,
      credit_fee: null,
      disbursement_fee: null,
      loan_fee: null,
      colateral_fee: null,
      note: record.note || "",
      commission_rate: null,
      commission: null,
      fees: [],
      create_time: record.create_time || "",
      update_time: record.update_time || "",
      country: record.country_id || 0,
      sex: record.sex || 0,
      legal_type: record.legal_type || 0,
      product: record.product_id || 0,
      collaborator: record.collaborator_id || null,
      branch: record.branch_id || 0,
      currency: record.currency_id || 0,
      status: record.status || 0,
      customer: record.customer_id || 0,
      creator: record.creator_id || null,
      creator__fullname: record.creator_fullname || null,
      updater: record.updater_id || null,
      updater__fullname: record.updater_fullname || null,
      approver: record.approver_id || null,
      approver__fullname: record.approver_fullname || null,
      source: record.source_id || 0,
      payment_status: 0,
      payment_info: null,
      purpose: 0,
      history: 0,
      ability: 0,
      doc_audit: 0,
      onsite_audit: 0,
      // Additional fields for display
      customer__code: record.customer_code || null,
      sex__name: record.sex_name || null,
      legal_type__name: record.legal_type_name || null,
      legal_type__code: record.legal_type_code || null,
      product__type__name: record.product_type_name || null,
      product__type__code: record.product_type_code || null,
      product__category__name: record.product_category_name || null,
      product__category__code: record.product_category_code || null,
      branch__code: record.branch_code || null,
      country__code: record.country_code || null,
      country__name: record.country_name || null,
      currency__code: record.currency_code || null,
      source__name: record.source_name || null,
      loanapp__code: record.loanapp_code || null,
      status__name: record.status_name || null,
      branch_uuid: record.branch_uuid || null,
      branches: record.branches || null,
    }));

    return NextResponse.json({
      total_rows: count || 0,
      full_data: true,
      rows: rows,
      is_profile_headquarter: profile?.branch_id?.id === headquarter?.id,
    });
  } catch (error: any) {
    console.error("Error fetching application records:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

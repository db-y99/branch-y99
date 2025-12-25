import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_API_URL is not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    //
    // 1. Lấy mốc sync gần nhất
    //
    const { data: sync, error: syncError } = await supabase
      .from("sync_state")
      .select("last_synced_at")
      .eq("id", "application_records")
      .maybeSingle();

    if (syncError && syncError.code !== "PGRST116") {
      // PGRST116 is "no rows returned", which is expected if sync_state doesn't exist
      console.error("Error fetching sync state:", syncError);
      return NextResponse.json(
        { error: "Failed to fetch sync state", details: syncError.message },
        { status: 500 }
      );
    }

    const lastSyncedAt = sync?.last_synced_at;

    //
    // 2. Gọi API CMS chỉ lấy record mới / thay đổi
    //
    const filterObj: Record<string, any> = {};

    if (lastSyncedAt) {
      // Filter by update_time if we have a last sync timestamp
      filterObj.update_time__gte = lastSyncedAt;
    } else {
      // If no last sync, get all records from a reasonable date
      filterObj.create_time__date__gte = "2025-01-01";
    }

    // Get all necessary fields for mapping
    const valuesParam =
      "id,code,approve_amount,approve_term,loan_amount,loan_term,status,status__name,product,product__type__name,product__type__code,product__category__name,product__category__code,customer,customer__code,fullname,phone,sex,sex__name,legal_type,legal_type__code,legal_type__name,legal_code,issue_place,issue_date,province,district,address,country,country__code,country__name,currency,currency__code,branch,branch__code,creator,creator__fullname,updater,updater__fullname,approver,approver__fullname,source,source__name,collaborator,loanapp__code,note,create_time,update_time";

    const url = `${apiUrl}/data/Application/?sort=-id&values=${valuesParam}&filter=${encodeURIComponent(JSON.stringify(filterObj))}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const apiData = await response.json();
    const list = apiData?.rows || [];

    console.log({ list, filterObj, length: list.length });

    if (!Array.isArray(list) || list.length === 0) {
      return NextResponse.json({
        message: "No new records to sync",
        synced_count: 0,
      });
    }

    //
    // 3. Map dữ liệu đúng schema DB
    //
    const rows = list.map((item: any) => ({
      id: item.id,
      code: item.code,

      approve_amount: item.approve_amount,
      approve_term: item.approve_term,

      loan_amount: item.loan_amount,
      loan_term: item.loan_term,

      status: item.status,
      status_name: item.status__name,

      product_id: item.product,
      product_type_name: item.product__type__name,
      product_type_code: item.product__type__code,
      product_category_name: item.product__category__name,
      product_category_code: item.product__category__code,

      customer_id: item.customer,
      customer_code: item.customer__code,
      fullname: item.fullname,
      phone: item.phone,
      sex: item.sex,
      sex_name: item.sex__name,

      legal_type: item.legal_type,
      legal_type_code: item.legal_type__code,
      legal_type_name: item.legal_type__name,
      legal_code: item.legal_code,
      issue_place: item.issue_place,
      issue_date: item.issue_date,

      province: item.province,
      district: item.district,
      address: item.address,

      country_id: item.country,
      country_code: item.country__code,
      country_name: item.country__name,

      currency_id: item.currency,
      currency_code: item.currency__code,

      branch_id: item.branch,
      branch_code: item.branch__code,

      creator_id: item.creator,
      creator_fullname: item.creator__fullname,
      updater_id: item.updater,
      updater_fullname: item.updater__fullname,
      approver_id: item.approver,
      approver_fullname: item.approver__fullname,

      source_id: item.source,
      source_name: item.source__name,

      collaborator_id: item.collaborator,

      loanapp_code: item.loanapp__code,

      note: item.note,

      create_time: item.create_time,
      update_time: item.update_time,
    }));

    //
    // 4. UPSERT — nếu trùng id hoặc code thì UPDATE
    //
    const { error: upsertError } = await supabase
      .from("application_records")
      .upsert(rows, {
        onConflict: "id",
      });

    if (upsertError) {
      console.error("Error upserting application records:", upsertError);
      return NextResponse.json(
        {
          error: "Failed to upsert records",
          details: upsertError.message,
        },
        { status: 500 }
      );
    }

    //
    // 5. Cập nhật mốc sync
    //
    const now = new Date().toISOString();
    const { error: updateSyncError } = await supabase.from("sync_state").upsert(
      {
        id: "application_records",
        last_synced_at: now,
      },
      {
        onConflict: "id",
      }
    );

    if (updateSyncError) {
      console.error("Error updating sync state:", updateSyncError);
      // Don't fail the request if sync state update fails
      // The data was already synced successfully
    }

    return NextResponse.json({
      message: "Sync completed successfully",
      synced_count: rows.length,
      last_synced_at: now,
    });
  } catch (error: any) {
    console.error("Error syncing application records:", error);
    return NextResponse.json(
      { error: "Failed to sync application records", details: error.message },
      { status: 500 }
    );
  }
}

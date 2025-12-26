import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const BATCH_SIZE = 500;
const RE_SYNC_WINDOW_MS = 60 * 60 * 1000; // sync lại 1 giờ gần đây

export async function POST(request: Request) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl)
    return NextResponse.json(
      { error: "API_URL not configured" },
      { status: 500 }
    );

  const supabase = await createClient();
  const lockKey = "sync_application_records";

  try {
    // 1️⃣ Locking mechanism
    const { data: existingLock } = await supabase
      .from("sync_locks")
      .select("*")
      .eq("id", lockKey)
      .maybeSingle();

    if (
      existingLock &&
      Date.now() - new Date(existingLock.locked_at).getTime() < 300_000
    ) {
      return NextResponse.json(
        { error: "Sync already running" },
        { status: 429 }
      );
    }

    await supabase
      .from("sync_locks")
      .upsert({ id: lockKey, locked_at: new Date().toISOString() });

    // 2️⃣ Lấy cursor
    const { data: syncState } = await supabase
      .from("sync_state")
      .select("last_synced_at, sync_cursor")
      .eq("id", "application_records")
      .maybeSingle();

    const syncCursor = syncState?.sync_cursor || {
      last_timestamp: null,
      last_id: 0,
    };

    let hasMore = true;
    let page = 1;
    let totalSynced = 0;

    while (hasMore) {
      const lastTimestamp = syncCursor.last_timestamp || null;
      const reSyncFrom = new Date(Date.now() - RE_SYNC_WINDOW_MS).toISOString();

      // 3️⃣ Build filter object (API chỉ hỗ trợ filter timestamp)
      const filterObj: Record<string, any> = {
        update_time__gte: lastTimestamp || reSyncFrom,
      };

      const valuesParam =
        "id,code,approve_amount,approve_term,loan_amount,loan_term,status,status__name,product,product__type__name,product__type__code,product__category__name,product__category__code,customer,customer__code,fullname,phone,sex,sex__name,legal_type,legal_type__code,legal_type__name,legal_code,issue_place,issue_date,province,district,address,country,country__code,country__name,currency,currency__code,branch,branch__code,creator,creator__fullname,updater,updater__fullname,approver,approver__fullname,source,source__name,collaborator,loanapp__code,note,create_time,update_time";

      const url = `${apiUrl}/data/Application/?page=${page}&limit=${BATCH_SIZE}&sort=update_time,id&values=${valuesParam}&filter=${encodeURIComponent(
        JSON.stringify(filterObj)
      )}`;

      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok)
        throw new Error(`API call failed with status ${response.status}`);

      const apiData = await response.json();
      const batchData = apiData?.rows || [];

      console.log({ batchData, filterObj, lastTimestamp, reSyncFrom });
      if (!batchData.length) break;

      // 4️⃣ Filter cursor client-side (update_time + id)
      const filteredBatch = batchData.filter(
        (r: any) =>
          !syncCursor.last_timestamp ||
          new Date(r.update_time) > new Date(syncCursor.last_timestamp) ||
          (r.update_time === syncCursor.last_timestamp &&
            r.id > syncCursor.last_id)
      );

      if (!filteredBatch.length) {
        hasMore = false;
        break;
      }

      // 5️⃣ Map dữ liệu đúng schema DB
      const rows = filteredBatch.map((item: any) => ({
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

      // 6️⃣ Upsert batch vào DB
      const { error: upsertError } = await supabase
        .from("application_records")
        .upsert(rows, { onConflict: "id" });

      if (upsertError)
        console.error(`Batch ${page} upsert error:`, upsertError);

      // 7️⃣ Cập nhật cursor sau mỗi batch
      const lastRecord = filteredBatch[filteredBatch.length - 1];
      await supabase.from("sync_state").upsert({
        id: "application_records",
        last_synced_at: new Date().toISOString(),
        sync_cursor: {
          last_timestamp: lastRecord.update_time,
          last_id: lastRecord.id,
        },
      });

      totalSynced += filteredBatch.length;
      page++;
      if (filteredBatch.length < BATCH_SIZE) hasMore = false;
    }

    // 8️⃣ Release lock
    await supabase.from("sync_locks").delete().eq("id", lockKey);

    return NextResponse.json({
      message: "Sync completed",
      synced_count: totalSynced,
    });
  } catch (err: any) {
    console.error("Error syncing application records:", err);
    await supabase.from("sync_locks").delete().eq("id", lockKey);
    return NextResponse.json(
      { error: "Sync failed", details: err.message },
      { status: 500 }
    );
  }
}

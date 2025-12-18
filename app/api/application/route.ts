import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { searchParams } = new URL(request.url);
  const loginId = searchParams.get("loginId");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filterObj: Record<string, any> = {
    create_time__date__gte: "2025-01-01",
  };

  if (status) {
    filterObj.status = status;
  }

  if (from) {
    filterObj.create_time__date__gte = from;
  }

  if (to) {
    filterObj.create_time__date__lte = to;
  }

  const url = `${apiUrl}/data/Application/?sort=-id&values=id,approve_amount,approve_term,note,loanapp__code,creator,updater,approver,approver__fullname,product,product__type__name,product__type__code,product__category__name,product__category__code,branch,customer,customer__code,status,status__name,branch__code,country__code,country__name,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,legal_type,legal_type__code,legal_type__name,sex,sex__name,issue_place,loan_term,loan_amount,legal_type__name,legal_code,issue_date,issue_place,country,collaborator,create_time,update_time,creator__fullname,updater,updater__fullname,source,source__name&filter=${encodeURIComponent(JSON.stringify(filterObj))}&login=${loginId}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching application data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

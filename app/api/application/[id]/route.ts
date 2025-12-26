import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { searchParams } = new URL(request.url);
  const loginId = searchParams.get("loginId");
  const applicationId = (await params).id;

  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL not configured" },
      { status: 500 }
    );
  }

  if (!loginId) {
    return NextResponse.json(
      { error: "Missing loginId parameter" },
      { status: 400 }
    );
  }

  if (!applicationId) {
    return NextResponse.json(
      { error: "Missing application id" },
      { status: 400 }
    );
  }

  const filterObj: Record<string, any> = {
    id: parseInt(applicationId),
  };

  const valuesParam =
    "id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,creator__fullname,approver,approver__fullname,product__type__name,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,legal_type__name,legal_code,legal_type__en,issue_date,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index";

  const url = `${apiUrl}/data/Application/?sort=-id&values=${valuesParam}&filter=${encodeURIComponent(JSON.stringify(filterObj))}&login=${loginId}`;

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

    // Return the first row if exists, or empty object
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching application detail:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

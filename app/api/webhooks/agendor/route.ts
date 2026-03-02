import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type DealPayload = {
  dealId?: number;
  id?: number;
  title?: string;
  status?: string;
  stageKey?: string;
  monthlyValue?: number;
  contractDurationMonths?: number;
  contractType?: "PROSPECCAO_QUALIFICACAO" | "VENDAS_PONTUAIS" | "COMODATO";
  customer?: { name?: string; email?: string; phone?: string };
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function isWonDeal(payload: DealPayload) {
  const status = (payload.status || "").toLowerCase();
  return status.includes("won") || status.includes("ganho") || status.includes("fechado") || payload.stageKey === process.env.AGENDOR_WON_STAGE_KEY;
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

async function createAsaasSubscription(params: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  monthlyValue: number;
  nextDueDate: string;
  cycle?: "MONTHLY";
}) {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) return { customerId: null, subscriptionId: null };

  const baseUrl = process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3";

  const customerRes = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey
    },
    body: JSON.stringify({
      name: params.customerName,
      email: params.customerEmail,
      phone: params.customerPhone
    })
  });

  const customer = await customerRes.json();
  const customerId = customer?.id || null;

  if (!customerId) return { customerId: null, subscriptionId: null };

  const subRes = await fetch(`${baseUrl}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey
    },
    body: JSON.stringify({
      customer: customerId,
      billingType: "BOLETO",
      value: params.monthlyValue,
      nextDueDate: params.nextDueDate,
      cycle: params.cycle || "MONTHLY"
    })
  });

  const subscription = await subRes.json();
  return {
    customerId,
    subscriptionId: subscription?.id || null
  };
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-webhook-token");
  if ((process.env.AGENDOR_WEBHOOK_TOKEN || "") && token !== process.env.AGENDOR_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const payload = (await request.json()) as DealPayload;

  if (!isWonDeal(payload)) {
    return NextResponse.json({ ok: true, skipped: "Negócio ainda não fechado" });
  }

  const dealId = payload.dealId || payload.id;
  const customerName = payload.customer?.name || "Cliente sem nome";

  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("email", payload.customer?.email || "")
    .maybeSingle();

  let clientId = existingClient?.id;

  if (!clientId) {
    const { data: createdClient } = await supabase
      .from("clients")
      .insert({ name: customerName, email: payload.customer?.email || null, phone: payload.customer?.phone || null })
      .select("id")
      .single();
    clientId = createdClient?.id;
  }

  if (!clientId) {
    return NextResponse.json({ error: "Não foi possível identificar cliente" }, { status: 422 });
  }

  const startDate = new Date();
  const durationMonths = payload.contractDurationMonths || 12;
  const endDate = addMonths(startDate, durationMonths);
  const monthlyValue = payload.monthlyValue || 0;

  const asaas = await createAsaasSubscription({
    customerName,
    customerEmail: payload.customer?.email,
    customerPhone: payload.customer?.phone,
    monthlyValue,
    nextDueDate: startDate.toISOString().slice(0, 10)
  });

  await supabase.from("contracts").insert({
    client_id: clientId,
    description: payload.title || `Contrato do negócio ${dealId}`,
    start_date: startDate.toISOString().slice(0, 10),
    end_date: endDate.toISOString().slice(0, 10),
    status: "ATIVO",
    monthly_value: monthlyValue,
    agendor_deal_id: dealId || null,
    asaas_customer_id: asaas.customerId,
    asaas_subscription_id: asaas.subscriptionId,
    contract_duration_months: durationMonths
  });

  return NextResponse.json({ ok: true, dealId, clientId, asaas });
}

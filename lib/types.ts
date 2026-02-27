export type Client = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
};

export type Contract = {
  id: number;
  client_id: number;
  description: string;
  start_date: string;
  end_date: string | null;
  status: "ATIVO" | "INATIVO";
  monthly_value: number | null;
  referred_by_client_id: number | null;
  clients?: { name: string };
  referrer?: { name: string };
};

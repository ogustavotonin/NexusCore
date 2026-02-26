"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Client } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional()
});

type Input = z.infer<typeof schema>;

export default function FormCliente({ onSaved, initial }: { onSaved: () => void; initial?: Client | null }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: initial ? {
      name: initial.name,
      phone: initial.phone ?? "",
      email: initial.email ?? "",
      address: initial.address ?? "",
      notes: initial.notes ?? ""
    } : undefined
  });

  const onSubmit = async (values: Input) => {
    if (initial) {
      await supabase.from("clients").update(values).eq("id", initial.id);
    } else {
      await supabase.from("clients").insert(values);
      reset();
    }
    onSaved();
  };

  return (
    <form className="card space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="font-semibold">{initial ? "Editar cliente" : "Novo cliente"}</h3>
      <input placeholder="Nome" {...register("name")} />
      {errors.name && <p className="text-xs text-red-600">Nome obrigatório.</p>}
      <input placeholder="Telefone" {...register("phone")} />
      <input placeholder="Email" {...register("email")} />
      <input placeholder="Endereço" {...register("address")} />
      <textarea placeholder="Observações" {...register("notes")} />
      <button disabled={isSubmitting} className="bg-slate-900 text-white">Salvar</button>
    </form>
  );
}

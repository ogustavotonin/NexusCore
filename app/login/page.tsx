"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { setSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

const schema = z.object({
  username: z.string().min(2, "Nome obrigatório"),
  password: z.string().min(2, "Senha obrigatória")
});

type LoginInput = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginInput) => {
    setError(null);
    const { data, error: dbError } = await supabase
      .from("users")
      .select("username,password_hash")
      .eq("username", values.username)
      .maybeSingle();

    if (dbError || !data || data.password_hash !== values.password) {
      setError("Credenciais inválidas");
      return;
    }

    setSession(values.username);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-3">Login</h1>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label>Nome de usuário</label>
            <input {...register("username")} />
            {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
          </div>
          <div>
            <label>Senha</label>
            <input type="password" {...register("password")} />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={isSubmitting} className="bg-slate-900 text-white w-full">
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

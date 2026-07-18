"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotaoSair() {
  const router = useRouter();
  const supabase = createClient();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={sair}
      className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg px-4 py-3 mx-2 w-[calc(100%-1rem)] text-left transition-colors"
    >
      <span className="material-symbols-outlined">logout</span>
      <span className="font-label">Sair</span>
    </button>
  );
}

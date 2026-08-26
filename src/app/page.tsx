"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { PlanCard } from "@/components/plans/PlanCard";
import { PlanCreateForm } from "@/components/plans/PlanCreateForm";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import { useToast } from "@/components/ui/toast";

type Plan = Database["public"]["Tables"]["plans"]["Row"];

export default function BucketList() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tab, setTab] = useState("pendientes");
  const [sort, setSort] = useState("recent");
  const { toast } = useToast();

  const fetchPlans = async () => {
    const { data, error } = await supabase.from("plans").select("*");
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los planes", type: "error" });
    } else {
      setPlans(data || []);
    }
  };

  useEffect(() => {
    fetchPlans();

    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "plans" }, () => {
        fetchPlans();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleToggle = async (id: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from("plans")
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq("id", id);
      
    if (error) {
      toast({ title: "Error al actualizar", description: error.message, type: "error" });
    }
  };

  const filteredPlans = plans.filter((p) => (tab === "pendientes" ? !p.is_completed : p.is_completed));

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (sort === "recent") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    if (sort === "old") return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    return 0; // rating requires joining with reviews
  });

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 pb-24">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Nuestra Bucket List</h1>
          <p className="text-muted-foreground mt-2">Nuestros planes, viajes y aventuras.</p>
        </div>
        <Link href="/calendar" className="flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </Link>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
          <TabsList className="w-full">
            <TabsTrigger value="pendientes" className="flex-1">Pendientes</TabsTrigger>
            <TabsTrigger value="completados" className="flex-1">Completados</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más recientes</SelectItem>
            <SelectItem value="old">Más antiguos</SelectItem>
            <SelectItem value="rating">Mejor valorados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedPlans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            No hay planes en esta categoría.
          </div>
        ) : (
          sortedPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onToggle={handleToggle} />
          ))
        )}
      </div>

      <PlanCreateForm onCreated={fetchPlans} />
    </main>
  );
}

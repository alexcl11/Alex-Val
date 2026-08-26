"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function PlanCreateForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const category = formData.get("category") as string;
      const trip_date = formData.get("trip_date") as string;

      // 1. Crear carpeta en Google Drive via API
      const driveRes = await fetch("/api/drive/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!driveRes.ok) throw new Error("Failed to create Drive folder");
      const driveData = await driveRes.json();

      // 2. Crear plan en Supabase
      const { error } = await supabase.from("plans").insert({
        title,
        description,
        category,
        drive_folder_id: driveData.driveFolderId,
        drive_url: driveData.driveUrl,
        trip_date: trip_date ? trip_date : null,
        is_completed: trip_date ? true : false,
      });

      if (error) throw error;

      toast({ title: "Plan creado", description: "Carpeta en Drive generada correctamente.", type: "success" });
      setOpen(false);
      onCreated();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl" size="icon" />}>
        <PlusIcon className="!h-6 !w-6" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título del plan</label>
            <Input name="title" required placeholder="Ej: Viaje a París" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <select name="category" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              <option value="Escapada">Escapada</option>
              <option value="Viaje Corto">Viaje Corto</option>
              <option value="Viaje Largo">Viaje Largo</option>
              <option value="Ruta">Ruta</option>
              <option value="Cultural">Cultural</option>
              <option value="Relax">Relax</option>
              <option value="Aventura">Aventura</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea name="description" placeholder="¿De qué trata este plan?" className="min-h-[100px]" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha del Viaje (Opcional)</label>
            <p className="text-xs text-muted-foreground">Si pones fecha, aparecerá como completado en el calendario.</p>
            <Input type="date" name="trip_date" />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2Icon className="animate-spin mr-2" /> : null}
            Crear Plan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

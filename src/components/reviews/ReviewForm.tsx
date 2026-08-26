"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Loader2Icon, StarIcon } from "lucide-react";

export function ReviewForm({ planId, onReviewAdded }: { planId: string; onReviewAdded: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const author_name = formData.get("author_name") as string;
    const reflection = formData.get("reflection") as string;
    const rating = parseInt(formData.get("rating") as string, 10);

    const { error } = await supabase.from("plan_reviews").insert({
      plan_id: planId,
      author_name,
      reflection,
      rating,
    });

    if (error) {
      toast({ title: "Error", description: error.message, type: "error" });
    } else {
      toast({ title: "Reflexión añadida", type: "success" });
      (e.target as HTMLFormElement).reset();
      onReviewAdded();
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-muted/30 p-4 rounded-xl mt-6">
      <h3 className="font-semibold text-lg">Añadir Reflexión</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre</label>
          <Input name="author_name" required placeholder="Tu nombre" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Puntuación</label>
          <Select name="rating" defaultValue="5">
            <SelectTrigger>
              <SelectValue placeholder="Estrellas" />
            </SelectTrigger>
            <SelectContent>
              {[5, 4, 3, 2, 1].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} Estrellas
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mensaje / Reflexión</label>
        <Textarea name="reflection" required placeholder="¿Qué tal estuvo?" />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? <Loader2Icon className="animate-spin mr-2" /> : <StarIcon className="mr-2 h-4 w-4" />}
        Guardar
      </Button>
    </form>
  );
}

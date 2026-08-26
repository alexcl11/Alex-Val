import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/types/database.types";

type Plan = Database["public"]["Tables"]["plans"]["Row"];

export function PlanCard({ plan, onToggle }: { plan: Plan; onToggle: (id: string, isCompleted: boolean) => void }) {
  return (
    <Card className="overflow-hidden group relative">
      <Link href={`/plan/${plan.id}`} className="block">
        <div className="relative h-48 w-full bg-muted">
          {plan.cover_image_url ? (
            <img
              src={plan.cover_image_url}
              alt={plan.title}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              Sin imagen
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-2">
            {plan.category && (
              <span className="bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                {plan.category}
              </span>
            )}
          </div>
        </div>
      </Link>
      <CardContent className="p-4 flex items-start gap-3">
        <Checkbox
          className="mt-1 w-5 h-5"
          checked={plan.is_completed || false}
          onCheckedChange={(checked) => onToggle(plan.id, checked as boolean)}
        />
        <div className="flex-1">
          <Link href={`/plan/${plan.id}`} className="hover:underline">
            <h3 className="font-semibold text-lg line-clamp-1">{plan.title}</h3>
          </Link>
          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {plan.description || "Sin descripción"}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {plan.is_completed && plan.completed_at
              ? `Completado el ${format(new Date(plan.completed_at), "dd MMM yyyy", { locale: es })}`
              : `Creado el ${format(new Date(plan.created_at || new Date()), "dd MMM yyyy", { locale: es })}`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import Link from "next/link";
import { ArrowLeftIcon, MapPinIcon } from "lucide-react";

type Plan = Database["public"]["Tables"]["plans"]["Row"];

export default function CalendarPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPlans, setSelectedPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("plans")
        .select("*")
        .not("trip_date", "is", null);
      
      setPlans(data || []);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    // Filtrar los planes que coincidan con la fecha seleccionada
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const plansForDate = plans.filter((plan) => plan.trip_date === formattedDate);
    setSelectedPlans(plansForDate);
  }, [selectedDate, plans]);

  // Función para renderizar el puntito rosa en los días que tienen un viaje completado
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const formattedDate = date.toISOString().split("T")[0];
      const hasPlan = plans.some((plan) => plan.trip_date === formattedDate && plan.is_completed);
      
      if (hasPlan) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 rounded-full bg-pink-500 shadow-sm" />
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando calendario...</div>;
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 pb-24 space-y-8">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon className="mr-2 w-4 h-4" /> Volver a la lista
      </Link>

      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Calendario de Viajes</h1>
        <p className="text-muted-foreground">Tus aventuras planificadas y completadas.</p>
      </header>

      <section className="bg-card border rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col items-center">
        <style jsx global>{`
          .react-calendar {
            width: 100%;
            max-width: 100%;
            background: transparent;
            border: none;
            font-family: inherit;
          }
          .react-calendar__navigation button {
            color: inherit;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 8px;
            padding: 10px;
          }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background-color: rgba(0,0,0,0.05);
          }
          .react-calendar__tile {
            padding: 1rem 0.5rem;
            border-radius: 12px;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background-color: rgba(236, 72, 153, 0.1);
            color: #ec4899;
          }
          .react-calendar__tile--active {
            background-color: #ec4899 !important;
            color: white !important;
            box-shadow: 0 4px 14px 0 rgba(236, 72, 153, 0.39);
          }
          .react-calendar__tile--active:enabled:hover,
          .react-calendar__tile--active:enabled:focus {
            background-color: #db2777 !important;
          }
          .react-calendar__month-view__days__day--weekend {
            color: #ef4444;
          }
          .react-calendar__month-view__days__day--neighboringMonth {
            color: #9ca3af;
          }
        `}</style>
        
        <Calendar 
          onChange={(value) => setSelectedDate(value as Date)} 
          value={selectedDate} 
          tileContent={tileContent}
          locale="es-ES"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Planes para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {selectedPlans.length === 0 ? (
            <p className="text-muted-foreground">No hay viajes registrados para este día.</p>
          ) : (
            selectedPlans.map((plan) => (
              <Link key={plan.id} href={`/plan/${plan.id}`} className="group relative overflow-hidden rounded-2xl bg-card border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                {plan.cover_image_url ? (
                  <div className="h-32 w-full overflow-hidden">
                    <img src={plan.cover_image_url} alt={plan.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <MapPinIcon className="w-8 h-8 text-primary/30" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight">{plan.title}</h3>
                    {plan.is_completed && <span className="w-3 h-3 rounded-full bg-pink-500 shrink-0 mt-1" />}
                  </div>
                  {plan.location_name && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPinIcon className="w-3 h-3 mr-1" /> {plan.location_name}
                    </p>
                  )}
                  <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                    {plan.category}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

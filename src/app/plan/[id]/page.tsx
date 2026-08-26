"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { PlanUploadForm } from "@/components/plans/PlanUploadForm";
import { Input } from "@/components/ui/input";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPinIcon, FolderIcon, StarIcon, ArrowLeftIcon, TrashIcon, AlertTriangleIcon, Edit2Icon } from "lucide-react";
import Link from "next/link";
import { Database } from "@/types/database.types";

type Plan = Database["public"]["Tables"]["plans"]["Row"];
type Photo = Database["public"]["Tables"]["plan_photos"]["Row"];
type Review = Database["public"]["Tables"]["plan_notes"]["Row"];

export default function PlanDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    if (!id) return;
    
    const { data: planData } = await supabase.from("plans").select("*").eq("id", id).single();
    const { data: photosData } = await supabase.from("plan_photos").select("*").eq("plan_id", id).order("created_at", { ascending: false });
    const { data: reviewsData } = await supabase
      .from("plan_notes")
      .select("*")
      .eq("plan_id", id)
      .order("created_at", { ascending: false });
    
    setPlan(planData);
    setPhotos(photosData || []);
    setReviews(reviewsData || []);
    setLoading(false);
  };

  const handleDeletePlan = async () => {
    if (!plan) return;
    setIsDeleting(true);
    try {
      if (photos.length > 0) {
        const photoPaths = photos.map(p => p.storage_path);
        await supabase.storage.from("bucket-photos").remove(photoPaths);
      }
      
      if (plan.drive_folder_id) {
        await fetch(`/api/drive/delete-folder?folderId=${plan.drive_folder_id}`, { method: 'DELETE' });
      }

      await supabase.from("plans").delete().eq("id", plan.id);

      router.push("/");
    } catch (error) {
      console.error("Error al eliminar plan", error);
      setIsDeleting(false);
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!plan) return;
    setIsUpdatingLocation(true);
    const formData = new FormData(e.currentTarget);
    const location_name = formData.get("location_name") as string;
    const location_url = formData.get("location_url") as string;

    await supabase.from("plans").update({ location_name, location_url }).eq("id", plan.id);
    await fetchData();
    setIsUpdatingLocation(false);
  };

  useEffect(() => {
    fetchData();

    if (!id) return;

    const channel = supabase
      .channel(`plan-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "plan_photos", filter: `plan_id=eq.${id}` }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "plan_notes", filter: `plan_id=eq.${id}` }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (!plan) {
    return <div className="flex h-screen items-center justify-center flex-col gap-4">
      <p>Plan no encontrado</p>
      <Link href="/" className="text-primary hover:underline">Volver a inicio</Link>
    </div>;
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 pb-24 space-y-8">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon className="mr-2 w-4 h-4" /> Volver a la lista
      </Link>

      <header className="space-y-4">
        {plan.cover_image_url ? (
          <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden relative shadow-lg">
            <img src={plan.cover_image_url} alt={plan.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="bg-primary/90 text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block">
                {plan.category}
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold">{plan.title}</h1>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block">
              {plan.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold">{plan.title}</h1>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {plan.location_url && (
            <a className={buttonVariants({ variant: "secondary", size: "sm" })} href={plan.location_url} target="_blank" rel="noopener noreferrer">
              <MapPinIcon className="w-4 h-4 mr-2" /> {plan.location_name || "Google Maps"}
            </a>
          )}
          
          <Dialog>
            <DialogTrigger render={<button type="button" className={buttonVariants({ variant: "outline", size: "sm" })} />}>
              <Edit2Icon className="w-4 h-4 mr-2" /> Ubicación
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Ubicación</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateLocation} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del lugar</label>
                  <Input name="location_name" defaultValue={plan.location_name || ""} placeholder="Ej: Restaurante El Faro" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enlace de Google Maps</label>
                  <Input name="location_url" defaultValue={plan.location_url || ""} placeholder="https://maps.google.com/..." />
                </div>
                <button type="submit" disabled={isUpdatingLocation} className={buttonVariants({ className: "w-full" })}>
                  {isUpdatingLocation ? "Guardando..." : "Guardar ubicación"}
                </button>
              </form>
            </DialogContent>
          </Dialog>

          {plan.drive_url && (
            <a className={buttonVariants({ variant: "default", size: "sm" })} href={plan.drive_url} target="_blank" rel="noopener noreferrer">
              <FolderIcon className="w-4 h-4 mr-2" /> Álbum en Drive
            </a>
          )}
          <Dialog>
            <DialogTrigger render={<button type="button" className={buttonVariants({ variant: "destructive", size: "sm" })} />}>
              <TrashIcon className="w-4 h-4 mr-2" /> Eliminar Plan
            </DialogTrigger>
            <DialogContent className="p-6 max-w-sm rounded-2xl space-y-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                  <AlertTriangleIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">¿Eliminar plan?</h3>
                <p className="text-sm text-muted-foreground">Esta acción borrará permanentemente la carpeta de Drive, las fotos y las notas asociadas. No se puede deshacer.</p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <DialogTrigger render={<button type="button" className={buttonVariants({ variant: "outline", className: "flex-1" })} />}>
                  Cancelar
                </DialogTrigger>
                <button type="button" onClick={handleDeletePlan} disabled={isDeleting} className={buttonVariants({ variant: "destructive", className: "flex-1" })}>
                  {isDeleting ? "Borrando..." : "Sí, eliminar"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {plan.description && (
          <p className="text-muted-foreground text-lg">{plan.description}</p>
        )}
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Galería</h2>
        {photos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aún no hay fotos.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Dialog key={photo.id}>
                <DialogTrigger render={<button type="button" className="cursor-pointer aspect-square rounded-xl overflow-hidden shadow-sm hover:ring-2 ring-primary transition-all p-0 border-none bg-transparent" />}>
                  <img src={photo.public_url} alt="Galería" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none flex items-center justify-center">
                  <img src={photo.public_url} alt="Galería" className="max-h-[90vh] max-w-full rounded-lg object-contain" />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
        
        {plan.drive_folder_id && (
          <PlanUploadForm planId={plan.id} driveFolderId={plan.drive_folder_id} onUploadComplete={fetchData} />
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Nuestras Reflexiones</h2>
        
        <div className="grid gap-4">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nadie ha añadido una reflexión todavía.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-card border rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg">{review.author_name}</h4>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: review.rating || 5 }).map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground italic">&ldquo;{review.content}&rdquo;</p>
              </div>
            ))
          )}
        </div>

        <ReviewForm planId={plan.id} onReviewAdded={fetchData} />
      </section>
    </main>
  );
}

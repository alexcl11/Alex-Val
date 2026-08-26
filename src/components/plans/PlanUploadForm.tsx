"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";
import { Loader2Icon, UploadCloudIcon } from "lucide-react";

export function PlanUploadForm({ planId, driveFolderId, onUploadComplete }: { planId: string; driveFolderId: string; onUploadComplete: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const { toast } = useToast();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const files = formData.getAll("files") as File[];
    
    if (files.length === 0 || files[0].size === 0) return;

    setIsUploading(true);

    try {
      setProgressText("Subiendo originales a Google Drive...");
      const driveFormData = new FormData();
      driveFormData.append("folderId", driveFolderId);
      files.forEach((file) => driveFormData.append("files", file));

      const driveUploadPromise = fetch("/api/drive/upload", {
        method: "POST",
        body: driveFormData,
      });

      setProgressText("Optimizando imágenes para la galería...");
      const imageFiles = files.filter(f => f.type.startsWith("image/")).slice(0, 10);
      
      let coverUpdated = false;

      for (const file of imageFiles) {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
        });

        const fileName = `${planId}/${Date.now()}-${file.name.split('.')[0]}.webp`;
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from("bucket-photos")
          .upload(fileName, compressedFile);

        if (storageError) {
          console.error("Storage error:", storageError);
          continue;
        }

        const { data: publicUrlData } = supabase.storage.from("bucket-photos").getPublicUrl(fileName);
        
        await supabase.from("plan_photos").insert({
          plan_id: planId,
          storage_path: fileName,
          public_url: publicUrlData.publicUrl,
        });

        if (!coverUpdated) {
          const { data: planData } = await supabase.from("plans").select("cover_image_url").eq("id", planId).single();
          if (!planData?.cover_image_url) {
            await supabase.from("plans").update({ cover_image_url: publicUrlData.publicUrl }).eq("id", planId);
            coverUpdated = true;
          }
        }
      }

      setProgressText("Esperando a Google Drive...");
      await driveUploadPromise;

      toast({ title: "Subida completada", description: "Fotos en galería y originales en Drive", type: "success" });
      (e.target as HTMLFormElement).reset();
      onUploadComplete();
    } catch (error: any) {
      toast({ title: "Error en la subida", description: error.message, type: "error" });
    } finally {
      setIsUploading(false);
      setProgressText("");
    }
  };

  return (
    <form onSubmit={handleUpload} className="bg-muted/30 p-4 rounded-xl space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <UploadCloudIcon className="w-5 h-5" />
        Añadir Fotos
      </h3>
      <p className="text-sm text-muted-foreground">
        Añade fotos para la galería de este plan. (Límite: 10 fotos por tanda).
      </p>
      
      <Input type="file" name="files" multiple accept="image/*" required disabled={isUploading} />
      
      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
            {progressText}
          </>
        ) : (
          "Subir Fotos"
        )}
      </Button>
    </form>
  );
}

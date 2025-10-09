// /src/app/settings/settings-form.tsx
"use client";

import { useState, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";
import { updateUserProfile } from "@/services/user-service";

const formSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email(),
  avatarUrl: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  userProfile: UserProfile;
}

export function SettingsForm({ userProfile }: SettingsFormProps) {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userProfile.name || "",
      email: userProfile.email,
      avatarUrl: userProfile.avatarUrl || "",
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        form.setValue('avatarUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      const updates: Partial<UserProfile> = { name: data.name };
      if (data.avatarUrl && data.avatarUrl !== userProfile.avatarUrl) {
          updates.avatarUrl = data.avatarUrl;
      }

      await updateUserProfile(userProfile.uid, updates);

      toast({
        title: "Éxito",
        description: "Tu perfil ha sido actualizado correctamente.",
      });
      // Force a reload to reflect changes everywhere (like the header avatar)
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 flex flex-col items-center">
        <Image
          src={avatarPreview || "https://picsum.photos/seed/user-avatar/200/200"}
          alt="User Avatar"
          width={150}
          height={150}
          className="rounded-full aspect-square object-cover"
          data-ai-hint="person portrait"
        />
        <Input 
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => fileInputRef.current?.click()}
        >
          Cambiar Foto
        </Button>
      </div>
      <div className="md:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input readOnly disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Guardando..."
                : "Guardar Cambios"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

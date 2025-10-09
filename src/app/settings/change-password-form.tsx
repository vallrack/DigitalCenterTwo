// /src/app/settings/change-password-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { auth } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { updateUserProfile } from "@/services/user-service";

const formSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof formSchema>;

export function ChangePasswordForm() {
  const { toast } = useToast();
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({
        title: "Error",
        description: "No se ha encontrado un usuario autenticado.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. If re-authentication is successful, update the password
      await updatePassword(user, data.newPassword);
      
      // 3. After successfully changing password, update the flag in Firestore
      await updateUserProfile(user.uid, { forcePasswordChange: false });

      toast({
        title: "Éxito",
        description: "Tu contraseña ha sido actualizada correctamente.",
      });
       // Force a reload to lift restrictions
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating password:", error);
      let description = "No se pudo actualizar tu contraseña. Por favor, intenta de nuevo.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = "La contraseña actual no es correcta. Verifícala e intenta de nuevo.";
      } else if (error.code === 'auth/requires-recent-login') {
          description = "Por seguridad, debes iniciar sesión de nuevo antes de cambiar tu contraseña.";
      }
      toast({
        title: "Error de autenticación",
        description: description,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña Actual</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Nueva Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Actualizando..."
            : "Actualizar Contraseña"}
        </Button>
      </form>
    </Form>
  );
}

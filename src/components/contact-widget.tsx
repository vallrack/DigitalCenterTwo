// /src/components/contact-widget.tsx
"use client";

import { useState } from 'react';
import { MessageSquare, X, Mail, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addContactMessage } from '@/services/contact-service';

const contactFormSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
  email: z.string().email('Por favor, ingrese un correo válido.'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
    onSuccess?: () => void;
}

const ContactForm = ({ onSuccess }: ContactFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await addContactMessage(data);
      toast({
        title: '¡Mensaje Enviado!',
        description: 'Gracias por contactarnos. Nos pondremos en contacto contigo pronto.',
      });
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar tu mensaje. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label>Nombre Completo</Label>
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
              <Label>Correo Electrónico</Label>
              <FormControl>
                <Input type="email" placeholder="tu@correo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <Label>Mensaje</Label>
              <FormControl>
                <Textarea placeholder="¿Cómo podemos ayudarte?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
        </Button>
      </form>
    </Form>
  )
}


export function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir formulario de contacto"
      >
        <MessageSquare className="h-8 w-8" />
      </Button>
      
      {isOpen && (
         <div className="fixed bottom-24 right-6 w-80 bg-background rounded-lg shadow-2xl z-50">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5"/>
                          Contáctanos
                        </CardTitle>
                        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-5 w-5"/>
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ContactForm onSuccess={() => setIsOpen(false)} />
                </CardContent>
            </Card>
         </div>
      )}
    </>
  );
}

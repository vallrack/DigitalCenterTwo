// /src/app/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, BookOpen, DollarSign, Users, GraduationCap, Archive, ShoppingCart, AreaChart, Loader2, Mail, UserSquare, Shield, Menu, UserPlus, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addContactMessage } from '@/services/contact-service';
import { ContactWidget } from '@/components/contact-widget';
import { FeaturesCarousel } from './features-carousel';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const features = [
  {
    icon: UserPlus,
    title: 'Gestión de Clientes (CRM)',
    description: 'Centraliza la información y el ciclo de vida de tus clientes.',
    imageUrl: 'https://www.brickcontrol.com/wp-content/uploads/2022/05/gestion-clientes.png'
  },
  {
    icon: GraduationCap,
    title: 'Gestión de Estudiantes',
    description: 'Perfiles, matrículas y seguimiento detallado.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/hombre-trabajando-en-la-computadora-portatil-3d-icon-png-download-9291886.png'
  },
  {
    icon: BookOpen,
    title: 'Gestión Académica',
    description: 'Cree materias, planes de lección y horarios.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/edificio-escolar-3d-icon-png-download-7762972.png'
  },
  {
    icon: DollarSign,
    title: 'Finanzas y Contabilidad',
    description: 'Facturación, CXC, CXP y contabilidad completa.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/finanzas-internacionales-3d-icon-png-download-8646468.png'
  },
  {
    icon: Users,
    title: 'Recursos Humanos',
    description: 'Gestione empleados y procese la nómina.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/gestion-de-empleados-3d-icon-png-download-10456344.png'
  },
  {
    icon: Archive,
    title: 'Inventario',
    description: 'Controle su catálogo de productos y stock.',
    imageUrl: 'https://png.pngtree.com/png-vector/20250205/ourmid/pngtree-inventory-management-software-featuring-3d-icon-isolated-on-a-transparent-background-png-image_15380981.png'
  },
   {
    icon: ShoppingCart,
    title: 'Punto de Venta (POS)',
    description: 'TPV integrado que actualiza stock y contabilidad.',
    imageUrl: 'https://png.pngtree.com/png-vector/20231023/ourmid/pngtree-3d-chart-illustrating-the-increasing-sales-growth-with-png-image_10172727.png'
  },
  {
    icon: AreaChart,
    title: 'Reportes y Analíticas',
    description: 'Informes de rentabilidad, ventas e inventario.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/reporte-de-analisis-3d-icon-png-download-4497657.png'
  },
  {
    icon: UserSquare,
    title: 'Portal Estudiantil',
    description: 'Espacio para que estudiantes consulten notas.',
    imageUrl: 'https://png.pngtree.com/png-vector/20240720/ourmid/pngtree-education-logo-vector-3d-png-image_13152483.png'
  },
  {
    icon: Shield,
    title: 'Administración y Seguridad',
    description: 'Gestión centralizada de clientes y usuarios.',
    imageUrl: 'https://png.pngtree.com/png-clipart/20240817/original/pngtree-digital-paint-illustration-of-padlock-in-a-cyber-world-png-image_15791680.png'
  },
  {
    icon: Leaf,
    title: 'Gestión de Caficultores',
    description: 'Administra lotes, cultivos y trazabilidad del café.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/granos-de-cafe-en-un-recipiente-con-cuchara-3d-icon-png-download-12027615.png'
  },
  {
    icon: AreaChart,
    title: 'Analisis de datos y toma de decisiones',
    description: 'Visualiza y analiza la información para tomar decisiones inteligentes.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/analisis-de-datos-3d-icon-png-download-12839918.png'
  }
];

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


export default function LandingPage() {
  const bubbleSizes = ['w-4 h-4', 'w-8 h-8', 'w-3 h-3', 'w-6 h-6', 'w-5 h-5', 'w-7 h-7', 'w-2 h-2', 'w-4 h-4', 'w-5 h-5', 'w-8 h-8'];
  const animationDetails = [
    { duration: '18s', delay: '0s' }, { duration: '12s', delay: '1s' }, { duration: '15s', delay: '2s' },
    { duration: '20s', delay: '0s' }, { duration: '22s', delay: '3s' }, { duration: '18s', delay: '1s' },
    { duration: '16s', delay: '4s' }, { duration: '13s', delay: '2s' }, { duration: '19s', delay: '0s' },
    { duration: '14s', delay: '3s' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 z-20 absolute top-0 left-0 right-0">
        <Link href="#" className="flex items-center gap-2 font-semibold" prefetch={false}>
         <Image src="https://dprogramadores.com.co/img/logoD.png" alt="DigitalCenter Logo" width={32} height={32} />
          <span className="text-2xl font-bold text-white">DigitalCenter</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4 text-white/80 hover:text-white" prefetch={false}>
            Características
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4 text-white/80 hover:text-white" prefetch={false}>
            Precios
          </Link>
          <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4 text-white/80 hover:text-white" prefetch={false}>
            Contacto
          </Link>
          <Link href="/login" prefetch={false}>
            <Button className="bg-green-500 text-white hover:bg-green-600">Iniciar Sesión</Button>
          </Link>
          <Link href="/signup" prefetch={false}>
            <Button className="bg-white text-primary hover:bg-white/90">Registrarse Gratis</Button>
          </Link>
        </nav>
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 hover:text-white">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir menú</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                    <Link href="#" className="flex items-center gap-2 font-semibold" prefetch={false}>
                        <Image src="https://dprogramadores.com.co/img/logoD.png" alt="DigitalCenter Logo" width={24} height={24} />
                        <span className="text-lg font-bold">DigitalCenter</span>
                    </Link>
                    <Link href="#features" className="text-muted-foreground hover:text-foreground">Características</Link>
                    <Link href="#pricing" className="text-muted-foreground hover:text-foreground">Precios</Link>
                    <Link href="#contact" className="text-muted-foreground hover:text-foreground">Contacto</Link>
                     <div className="flex flex-col gap-4 pt-4">
                        <Link href="/login" prefetch={false}>
                            <Button className="w-full bg-green-500 text-white hover:bg-green-600">Iniciar Sesión</Button>
                        </Link>
                        <Link href="/signup" prefetch={false}>
                            <Button className="w-full">Registrarse Gratis</Button>
                        </Link>
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
      </header>
      <main className="flex-1">
        <section 
          className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center text-white bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 overflow-hidden"
        >
             <div className="absolute top-0 left-0 w-full h-full z-[1]">
              {Array.from({ length: 10 }).map((_, i) => (
                  <div
                  key={i}
                  className={`absolute bottom-[-150px] bg-white/10 rounded-full animate-float-bubbles ${bubbleSizes[i % bubbleSizes.length]}`}
                  style={{
                      left: `${Math.random() * 100}%`,
                      animationDuration: animationDetails[i % animationDetails.length].duration,
                      animationDelay: animationDetails[i % animationDetails.length].delay,
                  }}
                  />
              ))}
            </div>
             <div className="container px-4 md:px-6 z-10 pt-20">
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start justify-center space-y-4 animate-fade-in-up">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl flex flex-col items-center md:items-start">
                           <span>La Plataforma de Gestión</span>
                           <span className="text-cyan-300">Todo-en-Uno</span>
                        </h1>
                        <p className="max-w-2xl text-lg text-white/80 md:text-xl">
                        DigitalCenter centraliza la gestión Académica, Financiera y de Recursos Humanos para llevar su institución al siguiente nivel.
                        </p>
                         <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/signup" prefetch={false}>
                                <Button size="lg" className="bg-white text-primary hover:bg-gray-200 w-full sm:w-auto">Empezar Ahora</Button>
                            </Link>
                             <Link href="/login" prefetch={false}>
                                <Button size="lg" className="w-full sm:w-auto bg-green-500 text-white hover:bg-green-600">Iniciar Sesión</Button>
                            </Link>
                        </div>
                    </div>
                     <div className="relative w-60 h-60 md:w-80 md:h-80 lg:w-96 lg:h-96 shrink-0 animate-float">
                        <div className="absolute inset-0 text-white">
                           <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <path fill="#ffffff" d="M48.1,-58.3C62.5,-46.9,73.4,-31,75.4,-14.6C77.4,1.8,70.5,18.8,60.8,33.5C51.1,48.2,38.6,60.6,23.6,68.4C8.6,76.2,-8.8,79.3,-25.5,74.5C-42.2,69.7,-58.1,57,-68.2,41.9C-78.3,26.8,-82.6,9.3,-79.9,-6.5C-77.2,-22.3,-67.5,-36.4,-54.8,-47.5C-42.1,-58.6,-26.4,-66.7,-9.4,-69.1C7.6,-71.5,24.6,-68.2,38.8,-59.8C53,-51.4,48.1,-58.3,48.1,-58.3Z" transform="translate(100 100) scale(1.4)"></path>
                            </svg>
                        </div>
                        <Image
                            src="https://dprogramadores.com.co/img/logoD.png"
                            alt="DigitalCenter Logo"
                            layout="fill"
                            objectFit="contain"
                            className="relative z-10 p-12"
                        />
                    </div>
                </div>
            </div>
             <div className="absolute bottom-0 left-0 w-full h-[150px] z-[5] overflow-hidden">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none">
                    <defs>
                        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                    </defs>
                    <g className="fill-background">
                        <use xlinkHref="#gentle-wave" x="50" y="0" className="animate-move-forever opacity-40" style={{ animationDelay: '-2s', animationDuration: '4s' }} />
                        <use xlinkHref="#gentle-wave" x="50" y="3" className="animate-move-forever opacity-50" style={{ animationDelay: '-3s', animationDuration: '5s' }} />
                        <use xlinkHref="#gentle-wave" x="50" y="6" className="animate-move-forever opacity-20" style={{ animationDelay: '-4s', animationDuration: '6s' }} />
                        <use xlinkHref="#gentle-wave" x="50" y="9" className="animate-move-forever" style={{ animationDelay: '-5s', animationDuration: '7s' }} />
                    </g>
                </svg>
            </div>
        </section>
        
        <section id="features" className="w-full bg-background py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Nuestros Módulos</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Una solución para cada necesidad</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Desde la Gestión de estudiantes y calificaciones hasta la Contabilidad y el Inventario, DigitalCenter tiene todo lo que necesita.
              </p>
            </div>
            <FeaturesCarousel features={features} />
          </div>
        </section>


        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Precios flexibles para cada Institución</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Elija el plan que mejor se adapte a sus necesidades. Contáctanos para una demostración personalizada.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 pt-12 md:grid-cols-3 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Básico</CardTitle>
                  <CardDescription>Para instituciones pequeñas que recién comienzan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-bold">$199.000<span className="text-xl text-muted-foreground"> COP/mes</span></div>
                  <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Módulo académico</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Módulo de estudiantes</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Soporte por correo</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Seleccionar Plan</Button>
                </CardFooter>
              </Card>
               <Card className="border-2 border-primary relative bg-white shadow-2xl">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                   <div className="inline-block rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">Más Popular</div>
                </div>
                <CardHeader>
                  <CardTitle>Profesional</CardTitle>
                  <CardDescription>La solución completa para instituciones en crecimiento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-bold">$399.000<span className="text-xl text-muted-foreground"> COP/mes</span></div>
                   <ul className="space-y-2 text-left text-sm">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Todo en el plan Básico</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Módulo financiero</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Módulo de RRHH</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Reportes y analíticas</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Seleccionar Plan</Button>
                </CardFooter>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle>Empresarial</CardTitle>
                  <CardDescription>Para grandes organizaciones con necesidades avanzadas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-bold">Contáctenos</div>
                  <ul className="space-y-2 text-left text-sm">
                     <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Todo en el plan Profesional</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Módulos de inventario y ventas (POS)</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Soporte prioritario y personalizado</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Contactar</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 text-white overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full z-[1]">
              {Array.from({ length: 10 }).map((_, i) => (
                  <div
                  key={i}
                  className={`absolute bottom-[-150px] bg-white/10 rounded-full animate-float-bubbles ${bubbleSizes[i % bubbleSizes.length]}`}
                  style={{
                      left: `${Math.random() * 100}%`,
                      animationDuration: animationDetails[i % animationDetails.length].duration,
                      animationDelay: animationDetails[i % animationDetails.length].delay,
                  }}
                  />
              ))}
            </div>
          <div className="container grid items-center justify-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16 z-10 relative">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-white/20 px-3 py-1 text-sm">Contáctanos</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">¿listo para empezar?</h2>
              <p className="max-w-[600px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Nos encantaría saber de ti. Completa el formulario y uno de nuestros especialistas se pondrá en contacto para programar una demostración gratuita y sin compromiso.
              </p>
              <p className="text-white/80">
                Recuerda que también puedes registrarte para una prueba gratuita de 15 días y explorar la plataforma por tu cuenta.
              </p>
               <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-200">
                        <a href="#contact-form">
                            <Mail className="mr-2"/> Dejar un Mensaje
                        </a>
                    </Button>
                    <Button asChild size="lg" className="bg-green-500 text-white hover:bg-green-600">
                        <a href="/signup">
                            <Check className="mr-2"/> Iniciar Prueba Gratuita
                        </a>
                    </Button>
                </div>
            </div>
            <Card id="contact-form" className="w-full max-w-md bg-background/90 backdrop-blur-sm text-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5"/>
                  Escríbenos
                </CardTitle>
                <CardDescription>Déjanos tus datos y te responderemos lo antes posible.</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
            <div className="absolute bottom-0 left-0 w-full h-[150px] z-[5] overflow-hidden">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none">
                    <defs>
                        <path id="gentle-wave-contact" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                    </defs>
                    <g className="fill-muted">
                        <use xlinkHref="#gentle-wave-contact" x="50" y="0" className="animate-move-forever opacity-40" style={{ animationDelay: '-2s', animationDuration: '4s' }} />
                        <use xlinkHref="#gentle-wave-contact" x="50" y="3" className="animate-move-forever opacity-50" style={{ animationDelay: '-3s', animationDuration: '5s' }} />
                        <use xlinkHref="#gentle-wave-contact" x="50" y="6" className="animate-move-forever opacity-20" style={{ animationDelay: '-4s', animationDuration: '6s' }} />
                        <use xlinkHref="#gentle-wave-contact" x="50" y="9" className="animate-move-forever" style={{ animationDelay: '-5s', animationDuration: '7s' }} />
                    </g>
                </svg>
            </div>
        </section>
      </main>
      <footer className="w-full border-t bg-muted">
        <div className="container flex flex-col gap-4 sm:flex-row py-6 items-center justify-between px-4 md:px-6">
          <p className="text-xs text-muted-foreground">&copy; 2024 DProgramadores. Todos los derechos reservados.</p>
           <Link href="#" className="flex items-center gap-2 font-semibold" prefetch={false}>
              <Image src="https://dprogramadores.com.co/img/logoD.png" alt="DigitalCenter Logo" width={24} height={24} />
              <span className="text-lg font-bold">DigitalCenter</span>
            </Link>
        </div>
      </footer>

      <ContactWidget />
    </div>
  );
}

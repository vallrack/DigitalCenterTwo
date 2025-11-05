
// /src/app/page.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FeaturesCarousel } from './features-carousel';
import Bubbles from './bubbles'; 
import { AreaChart, Briefcase, Calendar, CheckSquare, FileText, HeartPulse, Home, Users, X, ShoppingCart, Truck, Wrench, Building2, Bell, BookOpen, Utensils, Leaf, Shield, UserSquare, DollarSign, BarChart2, Factory, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChatWidget } from './chat-widget';

const features = [
  {
    icon: Home,
    title: 'Página Pública',
    description: 'Página de inicio personalizable para tu negocio.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/haga-clic-en-dominio-3d-icon-png-download-10174717.png'
  },
  {
    icon: ShoppingCart,
    title: 'Ventas (POS)',
    description: 'Terminal de punto de venta rápido y eficiente.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/crecimiento-de-las-ventas-3d-icon-png-download-12132035.png'
  },
  {
    icon: Truck,
    title: 'Inventario',
    description: 'Control de productos, stock y movimientos.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/inventario-3d-icon-png-download-10958665.png'
  },
  {
    icon: Briefcase,
    title: 'Recursos Humanos',
    description: 'Gestión de empleados, nómina y desempeño.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/recursos-humanos-3d-icon-png-download-12542195.png'
  },
  {
    icon: Building2,
    title: 'Gestión de Activos',
    description: 'Control y mantenimiento de activos fijos.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/fixed-asset-register-3d-icon-png-download-12839912.png'
  },
  {
    icon: Bell,
    title: 'Comunicaciones',
    description: 'Campañas de Email y WhatsApp.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/comunicacion-3d-icon-png-download-4745548.png'
  },
  {
    icon: BookOpen,
    title: 'Gestión Académica',
    description: 'Planes de lección, materias y horarios.',
    imageUrl: 'https://png.pngtree.com/png-vector/20250226/ourmid/pngtree-user-friendly-3d-educational-app-interface-design-vector-png-image_15598649.png'
  },
  {
    icon: Users,
    title: 'Gestión de Estudiantes',
    description: 'Administra expedientes y seguimiento estudiantil.',
    imageUrl: 'https://png.pngtree.com/png-clipart/20240318/original/pngtree-3d-render-student-studying-concept-png-image_14621216.png'
  },
  {
    icon: DollarSign,
    title: 'Finanzas',
    description: 'Contabilidad, facturación y cuentas por pagar/cobrar.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/grafico-de-finanzas-3d-icon-png-download-11304363.png'
  },
  {
    icon: AreaChart,
    title: 'Reportes y Analíticas',
    description: 'Informes de rentabilidad, ventas e inventario.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/analysis-report-3d-icon-png-download-4497657.png'
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
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/coffee-beans-in-a-bowl-with-spoon-3d-icon-png-download-12027615.png'
  },
  {
    icon: HeartPulse, // Icon for Odontology
    title: 'Módulo de Odontología',
    description: 'Gestiona historias clínicas, odontogramas 3D y planes de tratamiento.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/dental-clinic-3d-icon-png-download-12541682.png'
  },
  {
    icon: BarChart2,
    title: 'Analisis de datos y toma de decisiones',
    description: 'Visualiza y analiza la información para tomar decisiones inteligentes.',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/data-analysis-3d-icon-png-download-12839918.png'
  }
];

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-white overflow-x-hidden">

      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-50 px-4 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-white text-xl font-bold">DigitalCenter</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-white hover:text-gray-200">Características</a>
            <a href="#pricing" className="text-white hover:text-gray-200">Precios</a>
            <a href="#contact" className="text-white hover:text-gray-200">Contacto</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button className="bg-green-500 text-white hover:bg-green-600 shadow-lg transform hover:scale-105 transition-transform">Iniciar Sesión</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-purple-600 hover:bg-gray-200">Registrarse Gratis</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white text-center px-4 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 z-0"></div>
        <Bubbles />
        <div className="absolute bottom-0 left-0 w-full h-[15vh] z-10">
            <div className="relative w-full h-full">
                <svg className="absolute bottom-0 w-full h-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none">
                    <defs>
                        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                    </defs>
                    <g className="parallax">
                        <use xlinkHref="#gentle-wave" x="50" y="0" fill="rgba(255,255,255,0.7)" className="animate-move-forever" />
                        <use xlinkHref="#gentle-wave" x="50" y="3" fill="rgba(255,255,255,0.5)" className="animate-move-forever" style={{animationDelay: '-2s', animationDuration: '7s'}}/>
                        <use xlinkHref="#gentle-wave" x="50" y="5" fill="rgba(255,255,255,0.3)" className="animate-move-forever" style={{animationDelay: '-4s', animationDuration: '10s'}}/>
                        <use xlinkHref="#gentle-wave" x="50" y="7" fill="#fff" className="animate-move-forever" style={{animationDelay: '-5s', animationDuration: '13s'}}/>
                    </g>
                </svg>
            </div>
        </div>

        <div className="relative z-20 flex flex-col md:flex-row items-center justify-between container mx-auto">
            <div className="md:w-1/2 text-left mb-10 md:mb-0">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">La Plataforma de Gestión <br /> <span className='text-cyan-300'>Todo-en-Uno</span></h1>
                <p className="text-lg md:text-xl mb-8">
                DigitalCenter centraliza la gestión Académica, Financiera y de Recursos <br /> Humanos para llevar su institución al siguiente nivel.
                </p>
                <div className="flex space-x-4">
                  <Link href="/signup">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-200 shadow-lg transform hover:scale-105 transition-transform">Empezar Ahora</Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" className="bg-green-500 text-white hover:bg-green-600 shadow-lg transform hover:scale-105 transition-transform">Iniciar Sesión</Button>
                  </Link>
                </div>
            </div>
            <div className="md:w-1/2 flex justify-center animate-float">
                <div className="relative w-80 h-80 md:w-[450px] md:h-[450px]">
                    <div className="absolute inset-0 rounded-[40px] bg-white/10 backdrop-blur-md animate-pulse-slow shadow-purple-glow-lg z-10"></div>
                    <div className="absolute inset-6 rounded-[30px] border-4 border-cyan-300 animate-spin-slow shadow-blue-glow-lg z-20"></div>
                    <div className="absolute inset-12 rounded-[20px] border-4 border-pink-400 animate-spin-reverse-slow z-30"></div>
                    <img src="https://dprogramadores.com.co/img/logoD.png" alt="DProgramadores Logo" className="w-64 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40"/>
                </div>
            </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Una solución para cada necesidad</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">Desde la gestión de estudiantes y calificaciones hasta la Contabilidad y el Inventario, DigitalCenter tiene todo lo que necesita.</p>
          <FeaturesCarousel features={features} />
        </div>
      </section>
      
       {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Precios flexibles para cada Institución</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">Elija el plan que mejor se adapte a sus necesidades. Contáctanos para una demostración personalizada.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            
            {/* Basic Plan */}
            <div className="border rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Básico</h3>
              <p className="text-gray-500 mb-6">Para instituciones pequeñas que recién comienzan.</p>
              <p className="text-4xl font-bold mb-4">$199.000 <span className="text-lg font-normal">COP/mes</span></p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Módulo académico</li>
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Módulo de estudiantes</li>
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Soporte por correo</li>
              </ul>
              <Button variant="outline" className="w-full">Seleccionar Plan</Button>
            </div>

            {/* Professional Plan */}
            <div className="border-2 border-purple-600 rounded-lg p-8 relative shadow-lg">
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">Más Popular</div>
              <h3 className="text-2xl font-bold mb-4">Profesional</h3>
              <p className="text-gray-500 mb-6">La solución completa para instituciones en crecimiento.</p>
              <p className="text-4xl font-bold mb-4">$399.000 <span className="text-lg font-normal">COP/mes</span></p>
               <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Todo en el plan Básico</li>
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Módulo financiero</li>
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Módulo de RRHH</li>
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Reportes y analíticas</li>
              </ul>
              <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">Seleccionar Plan</Button>
            </div>

            {/* Enterprise Plan */}
            <div className="border rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Empresarial</h3>
              <p className="text-gray-500 mb-6">Para grandes organizaciones con necesidades avanzadas.</p>
              <p className="text-4xl font-bold mb-4">Contáctenos</p>
               <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Todo en el plan Profesional</li>
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Módulos de inventario y ventas (POS)</li>
                <li className="flex items-center"><CheckSquare className="h-5 w-5 text-green-500 mr-2" /> Soporte prioritario y personalizado</li>
              </ul>
              <Button variant="outline" className="w-full">Contactar</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative text-white py-20 px-4">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 z-0"></div>
        <Bubbles />
        <div className="container mx-auto relative z-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <Button variant="outline" className="bg-transparent border-white text-white mb-4">Contáctanos</Button>
            <h2 className="text-4xl font-bold my-4">¿Listo para empezar?</h2>
            <p className="mb-6">
              Nos encantaría saber de ti. Completa el formulario y uno de nuestros especialistas se pondrá en contacto para programar una demostración gratuita y sin compromiso.
            </p>
            <p className="text-sm">
                Recuerda que también puedes registrarte para una prueba gratuita de 15 días y explorar la plataforma por tu cuenta.
            </p>
            <div className="flex space-x-4 mt-6">
                <Button variant="outline" className="bg-white text-purple-600 hover:bg-gray-200"><CheckSquare className="h-5 w-5 mr-2" />Dejar un Mensaje</Button>
                <Link href="/signup">
                    <Button className="bg-green-500 text-white hover:bg-green-600">Iniciar Prueba Gratuita</Button>
                </Link>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><FileText className="h-6 w-6 mr-2" />Escríbenos</h3>
              <p className="text-gray-600 mb-6">Déjanos tus datos y te responderemos lo antes posible.</p>
              <form>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                  <input type="text" id="name" placeholder="Tu nombre" className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50" />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico</label>
                  <input type="email" id="email" placeholder="tu@correo.com" className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50" />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Mensaje</label>
                  <textarea id="message" rows={4} placeholder="¿Cómo podemos ayudarte?" className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50"></textarea>
                </div>
                <Button className="w-full bg-gray-800 text-white hover:bg-gray-900">Enviar Mensaje</Button>
              </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-4">
          <div className="container mx-auto text-center text-sm text-gray-500">
              <span>© 2024 DProgramadores. Todos los derechos reservados.</span>
          </div>
      </footer>

       {/* Chat Widget */}
        <div className="fixed bottom-4 right-4 z-50">
            {!isChatOpen && (
                <Button onClick={() => setIsChatOpen(true)} className="rounded-full w-16 h-16 bg-gray-800 hover:bg-gray-900 shadow-lg">
                    <MessageSquare className="h-8 w-8 text-white" />
                </Button>
            )}
            {isChatOpen && (
                <ChatWidget onClose={() => setIsChatOpen(false)} />
            )}
        </div>
    </div>
  );
}

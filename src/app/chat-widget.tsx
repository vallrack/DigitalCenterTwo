
// /src/app/chat-widget.tsx
"use client";

import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ChatWidgetProps {
  onClose: () => void;
}

export function ChatWidget({ onClose }: ChatWidgetProps) {
  return (
    <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col">
      <header className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold">Contáctanos</h3>
        <Button onClick={onClose} variant="ghost" size="sm">
          <X className="h-5 w-5" />
        </Button>
      </header>
      <div className="flex-grow p-4 space-y-4">
        <p className="text-sm text-gray-600">Déjanos tus datos y te responderemos lo antes posible.</p>
        <form>
            <div className="mb-2">
                <label htmlFor="chat-name" className="text-sm font-medium text-gray-700">Nombre Completo</label>
                <Input id="chat-name" placeholder="Tu nombre" className="mt-1"/>
            </div>
            <div className="mb-2">
                <label htmlFor="chat-email" className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                <Input id="chat-email" type="email" placeholder="tu@correo.com" className="mt-1"/>
            </div>
            <div className="mb-2">
                <label htmlFor="chat-message" className="text-sm font-medium text-gray-700">Mensaje</label>
                <Textarea id="chat-message" placeholder="¿Cómo podemos ayudarte?" className="mt-1"/>
            </div>
        </form>
      </div>
      <footer className="p-4 border-t">
        <Button className="w-full bg-gray-800 text-white hover:bg-gray-900">
          <Send className="h-4 w-4 mr-2" />
          Enviar Mensaje
        </Button>
      </footer>
    </div>
  );
}

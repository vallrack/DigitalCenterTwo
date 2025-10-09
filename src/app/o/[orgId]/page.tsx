// /src/app/o/[orgId]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPublicOrganizationData } from '@/services/public-service';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

interface OrganizationPageProps {
  params: {
    orgId: string;
  };
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const organization = await getPublicOrganizationData(params.orgId);

  // If the organization doesn't exist OR the landing page module is not active, show 404.
  if (!organization || !organization.modules.landingPage) {
    notFound();
  }

  const {
    name,
    landingPageConfig = { title: `Bienvenido a ${name}`, description: 'Su plataforma de gestión integral.' },
    themeColors = { primary: '240 5.9% 10%', background: '0 0% 100%', accent: '240 4.8% 95.9%' }
  } = organization;

  const themeStyle = {
    '--background': themeColors.background,
    '--foreground': themeColors.primary,
    '--card': themeColors.accent,
    '--card-foreground': themeColors.primary,
    '--popover': themeColors.background,
    '--popover-foreground': themeColors.primary,
    '--primary': themeColors.primary,
    '--primary-foreground': themeColors.background,
    '--secondary': themeColors.accent,
    '--secondary-foreground': themeColors.primary,
    '--muted': themeColors.accent,
    '--muted-foreground': `hsl(${themeColors.primary} / 0.6)`,
    '--accent': themeColors.accent,
    '--accent-foreground': themeColors.primary,
    '--border': `hsl(${themeColors.primary} / 0.1)`,
    '--input': `hsl(${themeColors.primary} / 0.1)`,
    '--ring': themeColors.primary,
  } as React.CSSProperties;

  return (
    <div style={themeStyle}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <span className="text-2xl font-bold">{name}</span>
          </div>
          <nav>
            <Button asChild>
              <a href="/login">Iniciar Sesión</a>
            </Button>
          </nav>
        </header>

        <main className="flex-1">
          <section className="w-full py-20 md:py-32 lg:py-40">
            <div className="container px-4 md:px-6 text-center">
              <div className="max-w-3xl mx-auto space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-primary">
                  {landingPageConfig.title}
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
                  {landingPageConfig.description}
                </p>
                <Button asChild size="lg">
                    <a href="#contact">Contáctenos</a>
                </Button>
              </div>
            </div>
          </section>

          <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-accent">
             <div className="container grid items-center justify-center gap-10 px-4 md:px-6">
                <div className="space-y-4 text-center">
                    <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm text-primary">Contacto</div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">¿Preguntas?</h2>
                    <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed">
                        Nos encantaría saber de usted. Envíenos un correo para más información.
                    </p>
                    <Button asChild>
                         <a href={`mailto:info@${name.toLowerCase().replace(/\s+/g, '')}.com`}>
                            <Mail className="mr-2 h-4 w-4"/>
                            Enviar un Correo
                        </a>
                    </Button>
                </div>
            </div>
          </section>
        </main>
        
        <footer className="w-full border-t bg-muted">
          <div className="container flex flex-col gap-4 sm:flex-row py-6 items-center justify-between px-4 md:px-6">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {name}. Todos los derechos reservados.</p>
            <div className="flex items-center gap-2 font-semibold text-primary">
              <span className="text-xs">Powered by</span>
               <Image src="https://dprogramadores.com.co/img/logoD.png" alt="DigitalCenter Logo" width={20} height={20} />
              <span className="text-sm font-bold">DigitalCenter</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

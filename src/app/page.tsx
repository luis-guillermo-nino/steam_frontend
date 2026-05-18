import Link from "next/link";
import { Button } from "@/components/ui/button"; 

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
          IA Inclusiva <span className="text-blue-600">STEM+</span>
        </h1>
        <p className="mb-8 text-lg text-slate-600 max-w-md mx-auto">
          Plataforma educativa adaptativa para docentes, estudiantes y padres de familia.
        </p>
        
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-md">
          <Link href="/login">
            Comenzar / Iniciar Sesión
          </Link>
        </Button>

      </div>
    </div>
  );
}
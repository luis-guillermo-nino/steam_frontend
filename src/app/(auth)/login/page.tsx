import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-900">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            Ingresa tu correo y contraseña para acceder a la plataforma STEM+.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input 
                id="correo" 
                type="email" 
                placeholder="usuario@ejemplo.com" 
                required 
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="bg-slate-50"
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all" type="submit">
              Entrar
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-blue-600 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
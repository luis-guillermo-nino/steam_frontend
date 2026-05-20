"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("estudiante"); 
  
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const nuevoUsuario = {
        nombre: nombre,
        correo: correo,
        password: password,
        rol: rol
      };


      await axios.post("http://127.0.0.1:8000/api/usuarios/registro", nuevoUsuario);

      router.push("/login");

    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Hubo un error al crear la cuenta. Intenta de nuevo."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-900">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            Únete a la plataforma STEM+ y personaliza tu experiencia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          <form onSubmit={manejarRegistro} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input 
                id="nombre" 
                placeholder="Ej. Luis López" 
                required 
                className="bg-slate-50"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input 
                id="correo" 
                type="email" 
                placeholder="usuario@ejemplo.com" 
                required 
                className="bg-slate-50"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="bg-slate-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">¿Cuál es tu rol?</Label>
              <Select value={rol} onValueChange={setRol}>
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estudiante">Estudiante</SelectItem>
                  <SelectItem value="docente">Docente</SelectItem>
                  <SelectItem value="padre">Padre de Familia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium text-center">{error}</p>
            )}

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all mt-2" 
              type="submit"
              disabled={cargando}
            >
              {cargando ? "Creando cuenta..." : "Registrarme"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
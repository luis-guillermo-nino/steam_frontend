"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Detiene el refresco de la página obligatoriamente
    setError("");
    setCargando(true);
    
    console.log("1. Iniciando intento de login para:", correo);

    try {
      // Preparar los datos del formulario (OAuth2 estándar)
      const formData = new URLSearchParams();
      formData.append("username", correo);
      formData.append("password", password);

      console.log("2. Enviando petición a FastAPI...");
      
      const respuesta = await axios.post("http://127.0.0.1:8000/api/usuarios/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      console.log("3. Respuesta del servidor recibida con éxito:", respuesta.data);

      if (respuesta.data.access_token) {
        console.log("4. Token encontrado. Guardando en localStorage...");
        localStorage.setItem("stem_token", respuesta.data.access_token);
        
        console.log("5. Redirigiendo al dashboard...");
        router.push("/dashboard");
      } else {
        console.warn("El servidor respondió pero no envió un 'access_token'. Checkea el backend.");
        setError("Error en la estructura de la respuesta del servidor.");
      }

    } catch (err: any) {
      console.error("❌ Error detectado en la petición:");
      
      if (err.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error("Código de estado del backend:", err.response.status);
        console.error("Detalle enviado por el backend:", err.response.data);
        
        if (err.response.status === 401) {
          setError("El correo o la contraseña son incorrectos.");
        } else if (err.response.status === 422) {
          setError("Error de validación (422): El backend no entiende los campos enviados.");
        } else {
          setError(`Error del servidor (${err.response.status}): ${err.response.data?.detail || "Intenta de nuevo"}`);
        }
      } else if (err.request) {
        // La petición se hizo pero no se recibió respuesta (ej. backend apagado o CORS)
        console.error("No se recibió respuesta del backend. ¿Está encendido uvicorn? ¿Falta CORS?");
        setError("No se pudo conectar con el servidor. Verifica que esté encendido.");
      } else {
        // Algo pasó al configurar la petición que disparó un error
        console.error("Error de configuración de Axios:", err.message);
        setError("Ocurrió un error inesperado en la aplicación.");
      }
    } finally {
      setCargando(false);
      console.log("6. Proceso de login finalizado.");
    }
  };

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
          
          <form onSubmit={manejarLogin} className="space-y-4">
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

            {error && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all" 
              type="submit"
              disabled={cargando}
            >
              {cargando ? "Conectando..." : "Entrar"}
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
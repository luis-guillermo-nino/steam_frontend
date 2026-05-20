"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, LogOut, BookOpen, Puzzle, MessageSquare, Plus } from "lucide-react";
import CuestionarioInteractivo from "@/components/CuestionarioInteractivo";

interface Mensaje {
  id: number;
  remitente: "usuario" | "ia";
  texto: string;
}

interface Sesion {
  id: number;
  titulo: string;
}

const extraerJson = (str: string) => {
  try {
    const inicio = str.indexOf('{');
    const fin = str.lastIndexOf('}');
    
    if (inicio !== -1 && fin !== -1) {
      let jsonPuro = str.substring(inicio, fin + 1);
      
      
      jsonPuro = jsonPuro.replace(/\n/g, " ").replace(/\r/g, "");
      
      jsonPuro = jsonPuro.replace(/,\s*([\]}])/g, '$1'); 

      const obj = JSON.parse(jsonPuro);
      
      if (obj && typeof obj === "object" && obj.preguntas) {
        return obj;
      }
    }
    return null;
  } catch (e) {
    console.error("El JSON sigue teniendo un formato inválido:", e);
    return null;
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  
  const [inputUsuario, setInputUsuario] = useState("");
  const [modoActividad, setModoActividad] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(false);
  
  const [sesionId, setSesionId] = useState<number | null>(null);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);

  const finalDelChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("stem_token");
    if (!token) {
      router.push("/login");
    } else {
      setAutenticado(true);
      cargarSesiones(token);
    }
  }, [router]);

  useEffect(() => {
    finalDelChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);


  const cargarSesiones = async (token: string) => {
    try {
      const respuesta = await axios.get("http://localhost:8000/api/ia/sesiones", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSesiones(respuesta.data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  const seleccionarSesion = async (id: number) => {
    const token = localStorage.getItem("stem_token");
    setSesionId(id);
    setMensajes([]); 
    setCargando(true);

    try {
      const respuesta = await axios.get(`http://localhost:8000/api/ia/sesiones/${id}/mensajes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const historialFormateado = respuesta.data.map((msg: any) => ({
        id: msg.id,
        remitente: msg.remitente,
        texto: msg.contenido
      }));
      
      setMensajes(historialFormateado);
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
    } finally {
      setCargando(false);
    }
  };

  const nuevaConversacion = () => {
    setSesionId(null);
    setMensajes([]);
  };


  const cerrarSesion = () => {
    localStorage.removeItem("stem_token");
    router.push("/login");
  };

  const enviarMensaje = async () => {
    if (!inputUsuario.trim()) return;

    const textoEnviado = inputUsuario;
    const nuevoMensajeUsuario: Mensaje = {
      id: Date.now(),
      remitente: "usuario",
      texto: textoEnviado,
    };
    
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setInputUsuario("");
    setCargando(true);

    try {
      const token = localStorage.getItem("stem_token");
      const payload = {
        texto: textoEnviado,
        modo: modoActividad ? "actividad" : "tema",
        sesion_id: sesionId !== null ? sesionId : null
      };

      const respuesta = await axios.post("http://localhost:8000/api/ia/generar", payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      const nuevoId = respuesta.data.sesion_id;
      
      if (!sesionId && nuevoId) {
        setSesionId(nuevoId);
        if (token) cargarSesiones(token); 
      }

      const nuevoMensajeIA: Mensaje = {
        id: Date.now() + 1,
        remitente: "ia",
        texto: respuesta.data.respuesta_ia,
      };

      setMensajes((prev) => [...prev, nuevoMensajeIA]);

    } catch (error) {
      console.error("Error al conectar con la IA:", error);
      const mensajeError: Mensaje = {
        id: Date.now() + 1,
        remitente: "ia",
        texto: "❌ Ocurrió un error. Verifica tu conexión o intenta más tarde.",
      };
      setMensajes((prev) => [...prev, mensajeError]);
    } finally {
      setCargando(false);
    }
  };

  if (!autenticado) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10  md:flex">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl text-blue-600">STEM+</h2>
            <p className="text-xs text-slate-500 font-medium">IA Inclusiva</p>
          </div>
        </div>

        <div className="p-4 pb-2">
          <Button 
            onClick={nuevaConversacion}
            className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-none font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nueva Consulta
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4 pt-2">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Historial</h3>
            
            {sesiones.length === 0 ? (
              <p className="text-sm text-slate-500 italic px-2">Aún no hay historial...</p>
            ) : (
              sesiones.map((sesion) => (
                <button
                  key={sesion.id}
                  onClick={() => seleccionarSesion(sesion.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 truncate ${
                    sesionId === sesion.id 
                      ? "bg-slate-100 font-semibold text-slate-900" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="truncate">{sesion.titulo}</span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors" onClick={cerrarSesion}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full bg-slate-50/50 relative">
        <header className="h-16 shrink-0 border-b border-slate-200 flex items-center px-6 bg-white/80 backdrop-blur-sm z-10">
          <h1 className="font-semibold text-slate-800">
            {sesionId ? "Continuando Conversación" : "Nueva Sesión"}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6 pb-2">
            
            {mensajes.length === 0 && !cargando && (
              <div className="flex flex-col items-center justify-center text-center mt-20 space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">¿Qué aprenderemos hoy?</h3>
                <p className="text-slate-500 max-w-md">
                  Escribe un concepto que quieras entender o pide una dinámica interactiva usando el interruptor de abajo.
                </p>
              </div>
            )}

          {mensajes.map((msg) => {
              const datosQuiz = extraerJson(msg.texto);

              return (
                <div key={msg.id} className={`flex gap-4 ${msg.remitente === "usuario" ? "justify-end" : "justify-start"}`}>
                  {msg.remitente === "ia" && (
                    <Avatar className="h-10 w-10 shrink-0 border shadow-sm">
                      <AvatarFallback className="bg-blue-600 text-white font-bold">IA</AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`${
                    datosQuiz 
                      ? "w-full max-w-2xl" 
                      : `p-4 rounded-2xl max-w-[80%] shadow-sm ${
                          msg.remitente === "usuario" 
                            ? "bg-blue-600 text-white rounded-br-none" 
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                        }`
                  }`}>
                    {datosQuiz ? (
                      <CuestionarioInteractivo data={datosQuiz} />
                    ) : (
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.texto}</p>
                    )}
                  </div>

                  {msg.remitente === "usuario" && (
                    <Avatar className="h-10 w-10 shrink-0 border shadow-sm">
                      <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">Tú</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            
            {cargando && (
              <div className="flex gap-4 justify-start animate-pulse">
                <Avatar className="h-10 w-10 shrink-0 border">
                  <AvatarFallback className="bg-blue-300 text-white">...</AvatarFallback>
                </Avatar>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-bl-none">
                  <div className="flex space-x-2 mt-2">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={finalDelChatRef} />
          </div>
        </div>

        <div className="shrink-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-end space-x-3 px-2">
              <Label htmlFor="modo-switch" className={`text-sm font-medium transition-colors ${!modoActividad ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                <BookOpen className="w-4 h-4 inline mr-1" /> Tema
              </Label>
              <Switch 
                id="modo-switch" 
                checked={modoActividad} 
                onCheckedChange={setModoActividad}
                className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-blue-500"
              />
              <Label htmlFor="modo-switch" className={`text-sm font-medium transition-colors ${modoActividad ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                <Puzzle className="w-4 h-4 inline mr-1" /> Actividad
              </Label>
            </div>

            <div className="relative flex items-end gap-2 bg-white border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all p-2">
              <Textarea 
                placeholder={modoActividad ? "Ej. Crea un cuestionario sobre el ciclo del agua..." : "Ej. Explícame cómo funciona la gravedad..."}
                className="min-h-15 max-h-40 border-0 focus-visible:ring-0 resize-none shadow-none text-[15px] overflow-y-auto"
                value={inputUsuario}
                onChange={(e) => setInputUsuario(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensaje();
                  }
                }}
              />
              <Button 
                size="icon" 
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 shrink-0 mb-1 mr-1"
                onClick={enviarMensaje}
                disabled={!inputUsuario.trim() || cargando}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
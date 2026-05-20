"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowRight, RefreshCcw } from "lucide-react";

interface Pregunta {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
  explicacion: string;
}

interface QuizProps {
  data: {
    titulo: string;
    preguntas: Pregunta[];
  };
}

export default function CuestionarioInteractivo({ data }: QuizProps) {
  const [index, setIndex] = useState(0);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [puntaje, setPuntaje] = useState(0);
  const [completado, setCompletado] = useState(false);

  const preguntaActual = data.preguntas[index];

  const manejarRespuesta = (opcion: string) => {
    if (respondido) return;
    setSeleccion(opcion);
    setRespondido(true);
    if (opcion === preguntaActual.respuesta_correcta) {
      setPuntaje(puntaje + 1);
    }
  };

  const siguientePregunta = () => {
    if (index + 1 < data.preguntas.length) {
      setIndex(index + 1);
      setSeleccion(null);
      setRespondido(false);
    } else {
      setCompletado(true);
    }
  };

  if (completado) {
    return (
      <Card className="w-full border-2 border-blue-100 shadow-md">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">¡Actividad Completada!</h3>
          <p className="text-slate-600">
            Lograste <span className="font-bold text-blue-600">{puntaje}</span> de <span className="font-bold">{data.preguntas.length}</span> respuestas correctas.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            <RefreshCcw className="mr-2 h-4 w-4" /> Intentar otro tema
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-2 border-blue-500/20 shadow-lg overflow-hidden">
      <CardHeader className="bg-blue-50/50 border-b">
        <CardTitle className="text-lg text-blue-800 flex justify-between items-center">
          <span>{data.titulo}</span>
          <span className="text-sm font-normal bg-blue-200 text-blue-800 px-3 py-1 rounded-full">
            Pregunta {index + 1}/{data.preguntas.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <p className="text-lg font-medium text-slate-800">{preguntaActual.pregunta}</p>
        
        <div className="grid grid-cols-1 gap-3">
          {preguntaActual.opciones.map((opcion, i) => {
            const esCorrecta = opcion === preguntaActual.respuesta_correcta;
            const esSeleccionada = opcion === seleccion;
            
            let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
            if (respondido) {
              if (esCorrecta) variant = "default"; 
              else if (esSeleccionada) variant = "destructive";
            }

            return (
              <Button
                key={i}
                variant={variant}
                className={`h-auto py-4 px-6 justify-start text-left text-wrap transition-all ${
                  !respondido && "hover:border-blue-500 hover:bg-blue-50"
                } ${respondido && esCorrecta && "bg-green-600 hover:bg-green-600 text-white"}`}
                onClick={() => manejarRespuesta(opcion)}
                disabled={respondido}
              >
                <span className="mr-4 font-bold opacity-50">{String.fromCharCode(65 + i)})</span>
                {opcion}
              </Button>
            );
          })}
        </div>

        {respondido && (
          <div className={`p-4 rounded-xl animate-in slide-in-from-top duration-300 ${
            seleccion === preguntaActual.respuesta_correcta ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {seleccion === preguntaActual.respuesta_correcta 
                ? <CheckCircle2 className="text-green-600 h-5 w-5" /> 
                : <XCircle className="text-red-600 h-5 w-5" />
              }
              <span className={`font-bold ${seleccion === preguntaActual.respuesta_correcta ? "text-green-700" : "text-red-700"}`}>
                {seleccion === preguntaActual.respuesta_correcta ? "¡Correcto!" : "Casi lo logras"}
              </span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              {preguntaActual.explicacion}
            </p>
            <Button onClick={siguientePregunta} className="w-full mt-4 bg-slate-800 hover:bg-slate-900">
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
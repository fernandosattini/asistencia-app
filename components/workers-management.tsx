"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getWorkers, saveWorker, type Worker } from "./attendance-processor"

const DIAS_SEMANA = [
  { id: "Lu", label: "Lunes" },
  { id: "Ma", label: "Martes" },
  { id: "Mi", label: "Miércoles" },
  { id: "Ju", label: "Jueves" },
  { id: "Vi", label: "Viernes" },
  { id: "Sa", label: "Sábado" },
]

export function WorkersManagement() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [editedWorker, setEditedWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkers()
  }, [])

  const loadWorkers = async () => {
    setLoading(true)
    const loadedWorkers = await getWorkers()
    setWorkers(loadedWorkers)
    if (loadedWorkers.length > 0) {
      setSelectedWorker(loadedWorkers[0].nombre)
      setEditedWorker({ ...loadedWorkers[0] })
    }
    setLoading(false)
  }

  const handleWorkerSelect = (nombre: string) => {
    const worker = workers.find((w) => w.nombre === nombre)
    if (worker) {
      setSelectedWorker(nombre)
      setEditedWorker({ ...worker })
    }
  }

  const handleDayToggle = (dia: string) => {
    if (!editedWorker) return
    const newDias = editedWorker.dias_trabajo.includes(dia)
      ? editedWorker.dias_trabajo.filter((d) => d !== dia)
      : [...editedWorker.dias_trabajo, dia]
    setEditedWorker({ ...editedWorker, dias_trabajo: newDias })
  }

  const handleSave = async () => {
    if (!editedWorker) return
    try {
      await saveWorker(editedWorker)
      await loadWorkers()
      alert(`Configuración de ${editedWorker.nombre} guardada correctamente`)
    } catch (error) {
      alert("Error al guardar la configuración")
      console.error(error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando trabajadores...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Trabajadores</CardTitle>
        <CardDescription>Configura la tarifa, días laborales y horarios de cada empleado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          {/* Lista de trabajadores */}
          <div className="space-y-2">
            <Label>Seleccionar Trabajador</Label>
            <div className="space-y-1">
              {workers.map((worker) => (
                <Button
                  key={worker.nombre}
                  variant={selectedWorker === worker.nombre ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleWorkerSelect(worker.nombre)}
                >
                  {worker.nombre}
                </Button>
              ))}
            </div>
          </div>

          {/* Formulario de edición */}
          {editedWorker && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tarifa">Tarifa por Hora ($)</Label>
                <Input
                  id="tarifa"
                  type="number"
                  value={editedWorker.tarifa_hora}
                  onChange={(e) => setEditedWorker({ ...editedWorker, tarifa_hora: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Días Laborales</Label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dia-${dia.id}`}
                        checked={editedWorker.dias_trabajo.includes(dia.id)}
                        onCheckedChange={() => handleDayToggle(dia.id)}
                      />
                      <label
                        htmlFor={`dia-${dia.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {dia.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="entrada">Hora de Entrada Programada</Label>
                  <Input
                    id="entrada"
                    type="time"
                    value={editedWorker.hora_entrada_programada}
                    onChange={(e) => setEditedWorker({ ...editedWorker, hora_entrada_programada: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salida">Hora de Salida Programada</Label>
                  <Input
                    id="salida"
                    type="time"
                    value={editedWorker.hora_salida_programada || ""}
                    onChange={(e) => setEditedWorker({ ...editedWorker, hora_salida_programada: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                Guardar Cambios
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

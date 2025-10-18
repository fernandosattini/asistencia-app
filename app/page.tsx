"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceProcessor } from "@/components/attendance-processor"
import { Settings } from "@/components/settings"
import { WorkersManagement } from "@/components/workers-management"

export default function Home() {
  const [reportText, setReportText] = useState("")
  const [result, setResult] = useState<any>(null)
  const [showConfig, setShowConfig] = useState(false)

  const handleProcess = () => {
    const processor = new AttendanceProcessor()
    const processedResult = processor.processReport(reportText)
    setResult(processedResult)
  }

  const handleClear = () => {
    setReportText("")
    setResult(null)
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Procesador de Asistencia</h1>
            <p className="text-muted-foreground">Calcula pagos y bonos automáticamente</p>
          </div>
          <Button variant="outline" onClick={() => setShowConfig(!showConfig)}>
            {showConfig ? "Ocultar Configuración" : "Configuración"}
          </Button>
        </div>

        {showConfig && (
          <Tabs defaultValue="workers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="workers">Trabajadores</TabsTrigger>
              <TabsTrigger value="settings">Ajustes</TabsTrigger>
            </TabsList>
            <TabsContent value="workers">
              <WorkersManagement />
            </TabsContent>
            <TabsContent value="settings">
              <Settings />
            </TabsContent>
          </Tabs>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Reporte de Asistencia</CardTitle>
            <CardDescription>Pega el reporte crudo de asistencia en el campo de texto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report">Texto del Reporte</Label>
              <Textarea
                id="report"
                placeholder="Pega aquí el reporte de asistencia..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleProcess} disabled={!reportText.trim()}>
                Procesar Reporte
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado del Cálculo</CardTitle>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
                  <p className="font-semibold">Error:</p>
                  <p>{result.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left font-semibold">Empleado</th>
                          <th className="p-3 text-left font-semibold">Horas</th>
                          <th className="p-3 text-left font-semibold">Tarifa x Hora</th>
                          <th className="p-3 text-left font-semibold">Total a Pagar</th>
                          <th className="p-3 text-left font-semibold">Bono</th>
                          <th className="p-3 text-left font-semibold">Total Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3">{result.nombre}</td>
                          <td className="p-3">{result.horasTrabajadas}</td>
                          <td className="p-3">${result.tarifa.toLocaleString("es-CL")}</td>
                          <td className="p-3 font-semibold">${result.totalPagar.toLocaleString("es-CL")}</td>
                          <td className="p-3">
                            <span
                              className={`inline-block rounded px-2 py-1 text-sm ${
                                result.bono === "bono1"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : result.bono === "bono2"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {result.bono}
                              {result.valorBono > 0 && ` (+$${result.valorBono.toLocaleString("es-CL")})`}
                            </span>
                          </td>
                          <td className="p-3 text-lg font-bold text-primary">
                            ${result.totalFinal.toLocaleString("es-CL")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {result.detalles && result.detalles.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-3 font-semibold">Detalle por Día</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="p-2 text-left">Fecha</th>
                              <th className="p-2 text-left">Día</th>
                              <th className="p-2 text-left">Entrada</th>
                              <th className="p-2 text-left">Salida</th>
                              <th className="p-2 text-left">Horas</th>
                              <th className="p-2 text-left">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.detalles.map((detalle: any, idx: number) => (
                              <tr key={idx} className="border-b">
                                <td className="p-2">{detalle.fecha}</td>
                                <td className="p-2">{detalle.dia}</td>
                                <td className="p-2">{detalle.entrada || "-"}</td>
                                <td className="p-2">{detalle.salida || "-"}</td>
                                <td className="p-2">{detalle.horas?.toFixed(2) || "-"}</td>
                                <td className="p-2">
                                  <span
                                    className={`text-xs ${
                                      detalle.estado === "trabajado"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {detalle.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

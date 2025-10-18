"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getBonos, setBonos } from "./attendance-processor"

export function Settings() {
  const [bono1, setBono1Value] = useState(0)
  const [bono2, setBono2Value] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBonos()
  }, [])

  const loadBonos = async () => {
    setLoading(true)
    const bonos = await getBonos()
    setBono1Value(bonos.bono1_valor)
    setBono2Value(bonos.bono2_valor)
    setLoading(false)
  }

  const handleSave = async () => {
    try {
      await setBonos(bono1, bono2)
      alert("Bonos guardados correctamente")
    } catch (error) {
      alert("Error al guardar los bonos")
      console.error(error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando configuración...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Bonos</CardTitle>
        <CardDescription>Define los valores monetarios de los bonos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bono1">Bono 1 (Siempre 10+ min temprano)</Label>
            <Input
              id="bono1"
              type="number"
              value={bono1}
              onChange={(e) => setBono1Value(Number(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bono2">Bono 2 (Nunca 10+ min tarde)</Label>
            <Input
              id="bono2"
              type="number"
              value={bono2}
              onChange={(e) => setBono2Value(Number(e.target.value))}
              placeholder="0"
            />
          </div>
        </div>
        <Button onClick={handleSave}>Guardar Configuración</Button>
      </CardContent>
    </Card>
  )
}

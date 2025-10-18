// Configuración inicial de empleados
const EMPLEADOS_INICIAL: Worker[] = [
  {
    nombre: "ricardo gall",
    tarifa_hora: 4850,
    dias_trabajo: ["Lu", "Ma", "Mi", "Ju", "Vi"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "eze perez",
    tarifa_hora: 4850,
    dias_trabajo: ["Ju", "Vi", "Sa", "Mi"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "pablo",
    tarifa_hora: 4850,
    dias_trabajo: ["Lu", "Ma", "Mi", "Ju", "Vi"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "caccho",
    tarifa_hora: 4850,
    dias_trabajo: ["Vi", "Sa", "Ma", "Mi", "Ju"],
    hora_entrada_programada: "09:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "camilo palle",
    tarifa_hora: 4850,
    dias_trabajo: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "ezequiel par",
    tarifa_hora: 4850,
    dias_trabajo: ["Lu", "Ma", "Mi", "Ju", "Vi"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "alexis perez",
    tarifa_hora: 4850,
    dias_trabajo: ["Lu", "Ma", "Mi", "Ju", "Vi"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "jesus diaz",
    tarifa_hora: 4850,
    dias_trabajo: ["Lu", "Ma", "Mi", "Ju", "Vi"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "franco lopez",
    tarifa_hora: 4850,
    dias_trabajo: ["Lu", "Ma", "Mi", "Ju", "Vi"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "lucho",
    tarifa_hora: 4850,
    dias_trabajo: ["Lu", "Ma", "Mi", "Ju", "Vi"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
  {
    nombre: "valentino",
    tarifa_hora: 4850,
    dias_trabajo: ["Lu", "Ma", "Mi", "Ju", "Vi"],
    hora_entrada_programada: "08:00",
    hora_salida_programada: "14:00",
  },
]

// Configuración de bonos (se puede modificar desde ajustes)
const BONO1_VALOR = 0
const BONO2_VALOR = 0

import { createClient } from "@/lib/supabase/client"

export async function getWorkers(): Promise<Worker[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("workers").select("*").order("nombre")

  if (error) {
    console.error("[v0] Error loading workers:", error)
    return []
  }

  return data || []
}

export async function saveWorker(worker: Worker) {
  const supabase = createClient()
  const { error } = await supabase.from("workers").upsert(worker, { onConflict: "nombre" })

  if (error) {
    console.error("[v0] Error saving worker:", error)
    throw error
  }
}

export async function getBonos() {
  const supabase = createClient()
  const { data, error } = await supabase.from("bonos").select("*").limit(1).single()

  if (error) {
    console.error("[v0] Error loading bonos:", error)
    return { bono1_valor: 0, bono2_valor: 0 }
  }

  return data || { bono1_valor: 0, bono2_valor: 0 }
}

export async function setBonos(bono1: number, bono2: number) {
  const supabase = createClient()
  const { data: existing } = await supabase.from("bonos").select("id").limit(1).single()

  if (existing) {
    const { error } = await supabase
      .from("bonos")
      .update({ bono1_valor: bono1, bono2_valor: bono2 })
      .eq("id", existing.id)

    if (error) {
      console.error("[v0] Error updating bonos:", error)
      throw error
    }
  }
}

interface DayRecord {
  fecha: string
  dia: string
  entrada: string | null
  salida: string | null
  horas: number | null
  estado: string
}

export class AttendanceProcessor {
  private empleadosConfig: Worker[] = []

  async initialize() {
    this.empleadosConfig = await getWorkers()
  }

  async processReport(reportText: string) {
    try {
      if (this.empleadosConfig.length === 0) {
        await this.initialize()
      }

      // Extraer nombre del empleado
      const nombreMatch = reportText.match(/Nombre\s+(.+?)(?:\s+Fecha|\s+\n)/is)
      if (!nombreMatch) {
        return { error: "No se pudo encontrar el nombre del empleado en el reporte" }
      }

      const nombreEmpleado = nombreMatch[1].trim().toLowerCase()

      // Buscar configuración del empleado
      const empleadoConfig = this.empleadosConfig.find((emp) => emp.nombre.toLowerCase() === nombreEmpleado)

      if (!empleadoConfig) {
        return {
          error: `Empleado "${nombreEmpleado}" no encontrado en la configuración. Empleados disponibles: ${this.empleadosConfig.map((e) => e.nombre).join(", ")}`,
        }
      }

      // Extraer tabla de asistencia
      const { registrosTrabajados, totalDiasLaborales, diasFaltados } = this.extractAttendanceRecords(
        reportText,
        empleadoConfig,
      )

      // Calcular horas totales
      const totalHoras = registrosTrabajados.reduce((sum, r) => sum + (r.horas || 0), 0)

      // Aplicar redondeo comercial
      const horasRedondeadas = this.roundCommercial(totalHoras)

      // Calcular pago base
      const totalPagar = horasRedondeadas * empleadoConfig.tarifa_hora

      const bono = diasFaltados > 0 ? "sin bono" : this.determineBono(registrosTrabajados, empleadoConfig)

      const bonosConfig = await getBonos()
      let valorBono = 0
      if (bono === "bono1") {
        valorBono = bonosConfig.bono1_valor
      } else if (bono === "bono2") {
        valorBono = bonosConfig.bono2_valor
      }

      const totalFinal = totalPagar + valorBono

      return {
        nombre: empleadoConfig.nombre,
        horasTrabajadas: horasRedondeadas,
        tarifa: empleadoConfig.tarifa_hora,
        totalPagar: totalPagar,
        bono: bono,
        valorBono: valorBono,
        totalFinal: totalFinal,
        detalles: registrosTrabajados,
        diasFaltados: diasFaltados,
        totalDiasLaborales: totalDiasLaborales,
      }
    } catch (error) {
      return {
        error: `Error al procesar el reporte: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  private extractAttendanceRecords(
    reportText: string,
    empleadoConfig: Worker,
  ): { registrosTrabajados: DayRecord[]; totalDiasLaborales: number; diasFaltados: number } {
    const records: DayRecord[] = []
    const lines = reportText.split("\n")

    let diasFaltados = 0
    let totalDiasLaborales = 0

    const dayPattern = /(\d{2})\s+(Lu|Ma|Mi|Ju|Vi|Sa|Do)\s+(.+)/

    for (const line of lines) {
      const match = line.match(dayPattern)
      if (match) {
        const [, fecha, dia, resto] = match

        // Parsear entrada y salida
        const timePattern = /(\d{2}:\d{2})/g
        const times = resto.match(timePattern) || []

        const entrada = times[0] || null
        const salida = times[1] || null

        // Verificar si es día laboral
        const esDiaLaboral = empleadoConfig.dias_trabajo.includes(dia)

        if (!esDiaLaboral) continue

        totalDiasLaborales++

        // Verificar si es falta
        const esFalta = resto.includes("Falta")

        let horas: number | null = null
        let estado = "no laboral"

        if (esFalta) {
          estado = "falta"
          diasFaltados++
        } else if (entrada && salida) {
          horas = this.calculateHours(entrada, salida)
          estado = "trabajado"
        } else if (entrada || salida) {
          estado = "incompleto"
        }

        records.push({
          fecha,
          dia,
          entrada,
          salida,
          horas,
          estado,
        })
      }
    }

    const registrosTrabajados = records.filter((r) => r.estado === "trabajado")

    return { registrosTrabajados, totalDiasLaborales, diasFaltados }
  }

  private calculateHours(entrada: string, salida: string): number {
    const [entradaHora, entradaMin] = entrada.split(":").map(Number)
    const [salidaHora, salidaMin] = salida.split(":").map(Number)

    const entradaMinutos = entradaHora * 60 + entradaMin
    const salidaMinutos = salidaHora * 60 + salidaMin

    const diferenciaMinutos = salidaMinutos - entradaMinutos
    return diferenciaMinutos / 60
  }

  private roundCommercial(hours: number): number {
    const wholeHours = Math.floor(hours)
    const minutes = (hours - wholeHours) * 60

    if (minutes >= 35) {
      return wholeHours + 1
    } else {
      return wholeHours
    }
  }

  private determineBono(registros: DayRecord[], empleadoConfig: Worker): string {
    if (registros.length === 0) return "sin bono"

    const [horaProgHora, horaProgMin] = empleadoConfig.hora_entrada_programada.split(":").map(Number)
    const horaProgMinutos = horaProgHora * 60 + horaProgMin

    let siempreTemprano = true
    let nuncaTarde = true

    for (const registro of registros) {
      if (!registro.entrada) continue

      const [entradaHora, entradaMin] = registro.entrada.split(":").map(Number)
      const entradaMinutos = entradaHora * 60 + entradaMin

      const diferencia = entradaMinutos - horaProgMinutos

      // Si llegó menos de 10 minutos temprano, no cumple bono1
      if (diferencia >= -10) {
        siempreTemprano = false
      }

      // Si llegó más de 10 minutos tarde, no cumple bono2
      if (diferencia > 10) {
        nuncaTarde = false
      }
    }

    if (siempreTemprano) return "bono1"
    if (nuncaTarde) return "bono2"
    return "sin bono"
  }
}

export interface Worker {
  id?: string
  nombre: string
  tarifa_hora: number
  dias_trabajo: string[]
  hora_entrada_programada: string
  hora_salida_programada?: string
}

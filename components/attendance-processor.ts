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
let BONO1_VALOR = 0
let BONO2_VALOR = 0

export function setBonos(bono1: number, bono2: number) {
  BONO1_VALOR = bono1
  BONO2_VALOR = bono2
}

export function getBonos() {
  return { bono1: BONO1_VALOR, bono2: BONO2_VALOR }
}

export function getWorkers(): Worker[] {
  if (typeof window === "undefined") return EMPLEADOS_INICIAL
  const stored = localStorage.getItem("workers_config")
  if (stored) {
    return JSON.parse(stored)
  }
  return EMPLEADOS_INICIAL
}

export function saveWorkers(workers: Worker[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("workers_config", JSON.stringify(workers))
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
  private empleadosConfig = getWorkers()

  processReport(reportText: string) {
    try {
      // Extraer nombre del empleado - buscar después de "Nombre" hasta "Fecha"
      const nombreMatch = reportText.match(/Nombre\s+(.+?)(?:\s+Fecha|\s+\n)/is)
      if (!nombreMatch) {
        return { error: "No se pudo encontrar el nombre del empleado en el reporte" }
      }

      const nombreEmpleado = nombreMatch[1].trim().toLowerCase()

      console.log("[v0] Nombre detectado:", nombreEmpleado)

      // Buscar configuración del empleado
      const empleadoConfig = this.empleadosConfig.find((emp) => emp.nombre.toLowerCase() === nombreEmpleado)

      if (!empleadoConfig) {
        return {
          error: `Empleado "${nombreEmpleado}" no encontrado en la configuración. Empleados disponibles: ${this.empleadosConfig.map((e) => e.nombre).join(", ")}`,
        }
      }

      // Extraer tabla de asistencia
      const registros = this.extractAttendanceRecords(reportText, empleadoConfig)

      // Calcular horas totales
      const totalHoras = registros.reduce((sum, r) => sum + (r.horas || 0), 0)

      // Aplicar redondeo comercial
      const horasRedondeadas = this.roundCommercial(totalHoras)

      // Calcular pago base
      const totalPagar = horasRedondeadas * empleadoConfig.tarifa_hora

      // Determinar bono
      const bono = this.determineBono(registros, empleadoConfig)

      let valorBono = 0
      if (bono === "bono1") {
        valorBono = BONO1_VALOR
      } else if (bono === "bono2") {
        valorBono = BONO2_VALOR
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
        detalles: registros,
      }
    } catch (error) {
      return {
        error: `Error al procesar el reporte: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  private extractAttendanceRecords(reportText: string, empleadoConfig: any): DayRecord[] {
    const records: DayRecord[] = []
    const lines = reportText.split("\n")

    // Buscar la sección de la tabla de asistencia
    let inTable = false
    const dayPattern = /(\d{2})\s+(Lu|Ma|Mi|Ju|Vi|Sa|Do)\s+(.+)/

    for (const line of lines) {
      const match = line.match(dayPattern)
      if (match) {
        inTable = true
        const [, fecha, dia, resto] = match

        // Parsear entrada y salida
        const timePattern = /(\d{2}:\d{2})/g
        const times = resto.match(timePattern) || []

        const entrada = times[0] || null
        const salida = times[1] || null

        // Verificar si es día laboral
        const esDiaLaboral = empleadoConfig.dias_trabajo.includes(dia)

        // Verificar si es falta
        const esFalta = resto.includes("Falta")

        let horas: number | null = null
        let estado = "no laboral"

        if (esDiaLaboral) {
          if (esFalta) {
            estado = "falta"
          } else if (entrada && salida) {
            horas = this.calculateHours(entrada, salida)
            estado = "trabajado"
          } else if (entrada || salida) {
            estado = "incompleto"
          }
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

    return records.filter((r) => r.estado === "trabajado")
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

  private determineBono(registros: DayRecord[], empleadoConfig: any): string {
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

// Added Worker type
export interface Worker {
  nombre: string
  tarifa_hora: number
  dias_trabajo: string[]
  hora_entrada_programada: string
  hora_salida_programada?: string
}

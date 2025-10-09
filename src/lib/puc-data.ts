// /src/lib/puc-data.ts

/**
 * @fileoverview Este archivo contiene las estructuras de datos para los diferentes
 * Planes Únicos de Cuentas (PUC) por sector.
 */

export const pucData = {
  sectores: {
    general: {
      clases: [
        {
          clase_numero: "1",
          nombre: "ACTIVO",
          type: 'Activo',
          funcion: "Registra todos los bienes y derechos que posee la empresa.",
          grupos: [
            { numero: "11", nombre: "Disponible", descripcion: "Caja, bancos, cuentas de ahorro." },
            { numero: "12", nombre: "Inversiones", descripcion: "Títulos de renta fija, acciones." },
            { numero: "13", nombre: "Deudores", descripcion: "Clientes, cuentas por cobrar a socios y trabajadores." },
            { numero: "14", nombre: "Inventarios", descripcion: "Mercancías no fabricadas por la empresa, productos terminados, materias primas." },
            { numero: "15", nombre: "Propiedad, Planta y Equipo", descripcion: "Terrenos, construcciones, maquinaria, vehículos." },
            { numero: "16", nombre: "Intangibles", descripcion: "Patentes, marcas, derechos de autor." },
            { numero: "17", nombre: "Diferidos", descripcion: "Gastos pagados por anticipado." },
            { numero: "18", nombre: "Otros activos", descripcion: "Reclamaciones, bienes de arte y cultura." },
            { numero: "19", nombre: "Valorizaciones", descripcion: "Ajustes por valor de inversiones o propiedades." },
          ],
        },
        {
          clase_numero: "2",
          nombre: "PASIVO",
          type: 'Pasivo',
          funcion: "Registra todas las deudas y obligaciones de la empresa con terceros.",
          grupos: [
            { numero: "21", nombre: "Obligaciones financieras", descripcion: "Préstamos bancarios a corto y largo plazo." },
            { numero: "22", nombre: "Proveedores", descripcion: "Cuentas por pagar por la compra de bienes y servicios." },
            { numero: "23", nombre: "Cuentas por pagar", descripcion: "A acreedores, a trabajadores, a entidades de seguridad social." },
            { numero: "24", nombre: "Impuestos, gravámenes y tasas", descripcion: "Impuesto de renta, IVA por pagar, retención en la fuente." },
            { numero: "25", nombre: "Obligaciones laborales", descripcion: "Salarios, cesantías consolidadas, vacaciones." },
            { numero: "26", nombre: "Pasivos estimados y provisiones", descripcion: "Para litigios, garantías." },
            { numero: "27", nombre: "Diferidos", descripcion: "Ingresos recibidos por anticipado." },
            { numero: "28", nombre: "Otros pasivos", descripcion: "Anticipos y avances recibidos." },
          ],
        },
        {
          clase_numero: "3",
          nombre: "PATRIMONIO",
          type: 'Patrimonio',
          funcion: "Representa los recursos propios de la empresa, es decir, las deudas con los propietarios.",
          grupos: [
            { numero: "31", nombre: "Capital social", descripcion: "Aportes de los socios o accionistas." },
            { numero: "32", nombre: "Superávit de capital", descripcion: "Prima en colocación de acciones." },
            { numero: "33", nombre: "Reservas", descripcion: "Reserva legal, estatutaria y ocasional." },
            { numero: "34", nombre: "Revalorización del patrimonio", descripcion: "Para ajustar el valor del patrimonio." },
            { numero: "36", nombre: "Resultados del ejercicio", descripcion: "Utilidad o pérdida del período." },
            { numero: "37", nombre: "Resultados de ejercicios anteriores", descripcion: "Utilidades o pérdidas acumuladas." },
          ],
        },
        {
          clase_numero: "4",
          nombre: "INGRESOS",
          type: 'Ingreso',
          funcion: "Registra los ingresos obtenidos por la empresa en sus actividades.",
          grupos: [
            { numero: "41", nombre: "Operacionales", descripcion: "Ingresos de las actividades principales (ventas de bienes o servicios)." },
            { numero: "42", nombre: "No operacionales", descripcion: "Rendimientos financieros, ingresos por arrendamientos." },
          ],
        },
        {
          clase_numero: "5",
          nombre: "GASTOS",
          type: 'Gasto',
          funcion: "Registra los gastos incurridos para generar los ingresos.",
          grupos: [
            { numero: "51", nombre: "Operacionales de administración", descripcion: "Gastos de personal, honorarios, servicios públicos." },
            { numero: "52", nombre: "Operacionales de ventas", descripcion: "Gastos de publicidad, transporte de mercancía." },
            { numero: "53", nombre: "No operacionales", descripcion: "Gastos financieros, pérdidas en venta de activos." },
          ],
        },
        {
          clase_numero: "6",
          nombre: "COSTOS DE VENTA Y DE OPERACIÓN",
          type: 'Gasto',
          funcion: "Registra el costo de los productos o servicios que la empresa vende.",
          grupos: [
            { numero: "61", nombre: "Costo de ventas", descripcion: "Costo de la mercancía vendida." },
          ],
        },
        {
          clase_numero: "7",
          nombre: "COSTOS DE PRODUCCIÓN O DE OPERACIÓN",
          type: 'Gasto',
          funcion: "Registra el costo de los bienes o servicios que la empresa produce.",
          grupos: [
             { numero: "71", nombre: "Cuentas de Orden", descripcion: "Para registrar costos de producción indirectos, mano de obra, etc." },
          ],
        },
        {
          clase_numero: "8",
          nombre: "CUENTAS DE ORDEN DEUDORAS",
          type: 'Activo', // Placeholder type
          funcion: "Representan derechos o hechos futuros.",
          grupos: [
            { numero: "81", nombre: "Derechos y Bienes Recibidos en Garantía", descripcion: "Ejemplos: bienes recibidos en custodia o para la venta." },
            { numero: "82", nombre: "Títulos de Inversión", descripcion: "Ejemplo: Títulos de inversión." },
            { numero: "83", nombre: "Bienes de Arte y Cultura", descripcion: "Ejemplo: Bienes de arte y cultura." },
            { numero: "84", nombre: "Bienes Entregados en Administración", descripcion: "Ejemplo: Bienes entregados en administración." },
          ],
        },
        {
          clase_numero: "9",
          nombre: "CUENTAS DE ORDEN ACREEDORAS",
          type: 'Pasivo', // Placeholder type
          funcion: "Representan obligaciones o compromisos futuros.",
          grupos: [
            { numero: "91", nombre: "Deudas de Difícil Cobro", descripcion: "Ejemplo: Deudas de difícil cobro." },
            { numero: "92", nombre: "Contingencias y Reservas", descripcion: "Ejemplo: Contingencias y reservas." },
            { numero: "93", nombre: "Obligaciones con Empleados", descripcion: "Ejemplo: Obligaciones con empleados." },
          ],
        },
      ],
    },
    financiero: {
      descripcion: "PUC para bancos, corporaciones financieras, compañías de financiamiento comercial, etc. Refleja la intermediación de recursos.",
      clases: [
        {
          clase_numero: "1",
          nombre: "ACTIVO",
          type: 'Activo',
          funcion: "Contiene cuentas específicas para su operación de intermediación.",
          grupos: [
            { numero: '11', nombre: "Cartera de Créditos", descripcion: "Se subdivide en créditos de consumo, hipotecarios, comerciales, etc." },
            { numero: '12', nombre: "Fondos Interbancarios Negociables", descripcion: "Cuenta específica para su uso." }
          ]
        },
        {
          clase_numero: "2",
          nombre: "PASIVO",
          type: 'Pasivo',
          funcion: "Incluye cuentas para recursos que captan del público.",
          grupos: [
            { numero: '21', nombre: "Depósitos y Exigibilidades", descripcion: "Recursos que captan del público a través de cuentas de ahorro, corrientes o CDT." }
          ]
        },
        {
          clase_numero: "4",
          nombre: "INGRESOS",
          type: 'Ingreso',
          funcion: "Refleja sus principales fuentes de ingreso.",
          grupos: [
            { numero: '41', nombre: "Intereses y Rendimientos de Cartera de Créditos", descripcion: "Primordiales, ya que reflejan sus principales fuentes de ingreso." }
          ]
        }
      ]
    },
    solidario: {
      descripcion: "PUC diseñado para entidades de la economía solidaria, como cooperativas, fondos de empleados y asociaciones mutuales. Refleja la naturaleza social y el tipo de relación con sus asociados.",
      clases: [
        {
          clase_numero: "1",
          nombre: "ACTIVO",
          type: 'Activo',
          funcion: "Cuentas que reflejan el capital aportado y los préstamos a sus miembros.",
          grupos: [
            { numero: '11', nombre: "Aportes Sociales por Cobrar", descripcion: "Única de este sector." },
            { numero: '12', nombre: "Cartera de Créditos a Asociados", descripcion: "Única de este sector." }
          ]
        },
        {
          clase_numero: "3",
          nombre: "PATRIMONIO",
          type: 'Patrimonio',
          funcion: "El capital se maneja a través de cuentas específicas.",
          grupos: [
            { numero: '31', nombre: "Aportes Sociales", descripcion: "Equivalente al capital social, pero aportado por los asociados." }
          ]
        },
        {
          clase_numero: "6",
          nombre: "COSTOS",
          type: 'Gasto',
          funcion: "Cuentas que registran costos de actividades propias del sector.",
          grupos: [
            { numero: '61', nombre: "Costo de la Actividad de Ahorro y Crédito", descripcion: "Costo de la actividad principal o de otros servicios que prestan a sus asociados." }
          ]
        }
      ]
    },
    salud: {
      descripcion: "PUC para hospitales, clínicas, y demás prestadoras de servicios de salud. La contabilidad se enfoca en el registro de servicios médicos y la gestión de convenios con aseguradoras.",
      clases: [
        {
          clase_numero: "1",
          nombre: "ACTIVO",
          type: 'Activo',
          funcion: "Cuentas que detallan los ingresos pendientes de las EPS o aseguradoras.",
          grupos: [
            { numero: '11', nombre: "Cuentas por Cobrar de Servicios de Salud", descripcion: "Detallando los ingresos pendientes de las EPS o aseguradoras." }
          ]
        },
        {
          clase_numero: "4",
          nombre: "INGRESOS",
          type: 'Ingreso',
          funcion: "Cuentas que se desglosan por el tipo de servicio.",
          grupos: [
            { numero: '41', nombre: "Ingresos por Prestación de Servicios de Salud", descripcion: "Desglosados por el tipo de servicio (consultas, cirugías, exámenes)." }
          ]
        },
        {
          clase_numero: "6",
          nombre: "COSTOS",
          type: 'Gasto',
          funcion: "Registran los costos de los servicios.",
          grupos: [
            { numero: '61', nombre: "Costos de los Servicios de Salud", descripcion: "Incluyen insumos médicos, medicamentos y honorarios del personal médico." }
          ]
        }
      ]
    },
    sin_animo_lucro: {
      descripcion: "Aunque no es un PUC completamente separado, existen reglas especiales para las fundaciones, corporaciones y otras entidades del tercer sector. El enfoque contable está en la gestión de donaciones, el uso de los fondos y la transparencia.",
      clases: [
        {
          clase_numero: "3",
          nombre: "PATRIMONIO",
          type: 'Patrimonio',
          funcion: "Se usan cuentas para garantizar que las donaciones se utilicen para los fines que fueron designadas.",
          grupos: [
            { numero: '31', nombre: "Fondos con Destinación Específica", descripcion: "Para garantizar que las donaciones se utilicen para los fines que fueron designadas." }
          ]
        },
        {
          clase_numero: "4",
          nombre: "INGRESOS",
          type: 'Ingreso',
          funcion: "Se enfatiza el registro de donaciones y aportes.",
          grupos: [
            { numero: '41', nombre: "Donaciones y Aportes", descripcion: "Se enfatiza el registro de 'Donaciones y Aportes', así como los ingresos de proyectos específicos." }
          ]
        },
        {
          clase_numero: "5",
          nombre: "GASTOS",
          type: 'Gasto',
          funcion: "Los gastos se clasifican según el fin social de la entidad.",
          grupos: [
            { numero: '51', nombre: "Gastos de Misión", descripcion: "Los gastos se clasifican según el fin social de la entidad (gastos de administración vs. gastos de la misión). Esto es crucial para la rendición de cuentas." }
          ]
        }
      ]
    },
    publico: {
        descripcion: "PUC para entidades del sector público.",
        clases: [],
    }
  }
};

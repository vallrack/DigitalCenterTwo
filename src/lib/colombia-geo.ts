// /src/lib/colombia-geo.ts

/**
 * @fileoverview This file contains geographical data for Colombia,
 * including departments and their municipalities.
 */

export const departments = [
  {
    id: "91",
    name: "Amazonas",
    municipalities: ["Leticia", "El Encanto", "La Chorrera", "La Pedrera", "La Victoria", "Mirití-Paraná", "Puerto Alegría", "Puerto Arica", "Puerto Nariño", "Puerto Santander", "Tarapacá"]
  },
  {
    id: "05",
    name: "Antioquia",
    municipalities: ["Medellín", "Abejorral", "Abriaquí", "Alejandría", "Amagá", "Amalfi", "Andes", "Angelópolis", "Angostura", "Anorí", "Anzá", "Apartadó", "Arboletes", "Argelia", "Armenia", "Barbosa", "Bello", "Belmira", "Betania", "Betulia", "Briceño", "Buriticá", "Cáceres", "Caicedo", "Caldas", "Campamento", "Cañasgordas", "Caracolí", "Caramanta", "Carepa", "Carmen de Viboral", "Carolina", "Caucasia", "Chigorodó", "Cisneros", "Cocorná", "Concepción", "Concordia", "Copacabana", "Dabeiba", "Donmatías", "Ebéjico", "El Bagre", "El Peñol", "El Retiro", "Entrerríos", "Envigado", "Fredonia", "Frontino", "Giraldo", "Girardota", "Gómez Plata", "Granada", "Guadalupe", "Guarne", "Guatapé", "Heliconia", "Hispania", "Itagüí", "Ituango", "Jardín", "Jericó", "La Ceja", "La Estrella", "La Pintada", "La Unión", "Liborina", "Maceo", "Marinilla", "Montebello", "Murindó", "Mutatá", "Nariño", "Nechí", "Necoclí", "Olaya", "Peque", "Pueblorrico", "Puerto Berrío", "Puerto Nare", "Puerto Triunfo", "Remedios", "Rionegro", "Sabanalarga", "Sabaneta", "Salgar", "San Andrés de Cuerquia", "San Carlos", "San Francisco", "San Jerónimo", "San José de la Montaña", "San Juan de Urabá", "San Luis", "San Pedro de los Milagros", "San Pedro de Urabá", "San Rafael", "San Roque", "San Vicente", "Santa Bárbara", "Santa Fe de Antioquia", "Santa Rosa de Osos", "Santo Domingo", "Santuario", "Segovia", "Sonsón", "Sopetrán", "Támesis", "Tarazá", "Tarso", "Titiribí", "Toledo", "Turbo", "Uramita", "Urrao", "Valdivia", "Valparaíso", "Vegachí", "Venecia", "Vigía del Fuerte", "Yalí", "Yarumal", "Yolombó", "Yondó", "Zaragoza"]
  },
  {
    id: "81",
    name: "Arauca",
    municipalities: ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón", "Saravena", "Tame"]
  },
  {
    id: "08",
    name: "Atlántico",
    municipalities: ["Barranquilla", "Baranoa", "Campo de la Cruz", "Candelaria", "Galapa", "Juan de Acosta", "Luruaco", "Malambo", "Manatí", "Palmar de Varela", "Piojó", "Polonuevo", "Ponedera", "Puerto Colombia", "Repelón", "Sabanagrande", "Sabanalarga", "Santa Lucía", "Santo Tomás", "Soledad", "Suán", "Tubará", "Usiacurí"]
  },
  {
    id: "13",
    name: "Bolívar",
    municipalities: ["Cartagena de Indias", "Achí", "Altos del Rosario", "Arenal", "Arjona", "Arroyohondo", "Barranco de Loba", "Brazuelo de Papayal", "Calamar", "Cantagallo", "Cicuco", "Clemencia", "Córdoba", "El Carmen de Bolívar", "El Guamo", "El Peñón", "Hatillo de Loba", "Magangué", "Mahates", "Margarita", "María la Baja", "Mompós", "Montecristo", "Morales", "Norosí", "Pinillos", "Regidor", "Rioviejo", "San Cristóbal", "San Estanislao", "San Fernando", "San Jacinto", "San Jacinto del Cauca", "San Juan Nepomuceno", "San Martín de Loba", "San Pablo", "Santa Catalina", "Santa Rosa", "Santa Rosa del Sur", "Simití", "Soplaviento", "Talaigua Nuevo", "Tiquisio", "Turbaco", "Turbaná", "Villanueva", "Zambrano"]
  },
  {
    id: "15",
    name: "Boyacá",
    municipalities: ["Tunja", "Almeida", "Aquitania", "Arcabuco", "Belén", "Berbeo", "Betéitiva", "Boavita", "Boyacá", "Briceño", "Buenavista", "Busbanzá", "Caldas", "Campohermoso", "Cerinza", "Chinavita", "Chiquinquirá", "Chíquiza", "Chiscas", "Chita", "Chitaraque", "Chivatá", "Chivor", "Ciénega", "Cómbita", "Coper", "Corrales", "Covarachía", "Cubará", "Cucaita", "Cuítiva", "Duitama", "El Cocuy", "El Espino", "Firavitoba", "Floresta", "Gachantivá", "Gameza", "Garagoa", "Guateque", "Guayatá", "Güicán", "Iza", "Jenesano", "Jericó", "La Capilla", "La Uvita", "La Victoria", "Labranzagrande", "Macanal", "Maripí", "Miraflores", "Mongua", "Monguí", "Moniquirá", "Motavita", "Muzo", "Nobsa", "Nuevo Colón", "Oicatá", "Otanche", "Pachavita", "Páez", "Paipa", "Pajarito", "Panqueba", "Pauna", "Paya", "Paz de Río", "Pesca", "Pisba", "Puerto Boyacá", "Quípama", "Ramiriquí", "Ráquira", "Rondón", "Saboyá", "Sáchica", "Samacá", "San Eduardo", "San José de Pare", "San Luis de Gaceno", "San Mateo", "San Miguel de Sema", "San Pablo de Borbur", "Santa María", "Santa Rosa de Viterbo", "Santa Sofía", "Santana", "Sativanorte", "Sativasur", "Siachoque", "Soatá", "Socha", "Socotá", "Sogamoso", "Somondoco", "Sora", "Soracá", "Sotaquirá", "Susacón", "Sutamarchán", "Sutatenza", "Tasco", "Tenza", "Tibaná", "Tibasosa", "Tinjacá", "Tipacoque", "Toca", "Togüí", "Tópaga", "Tota", "Turmequé", "Tuta", "Tutazá", "Úmbita", "Ventaquemada", "Villa de Leyva", "Viracachá", "Zetaquira"]
  },
  {
    id: "17",
    name: "Caldas",
    municipalities: ["Manizales", "Aguadas", "Anserma", "Aranzazu", "Belalcázar", "Chinchiná", "Filadelfia", "La Dorada", "La Merced", "Manzanares", "Marmato", "Marquetalia", "Marulanda", "Neira", "Norcasia", "Pácora", "Palestina", "Pensilvania", "Riosucio", "Risaralda", "Salamina", "Samaná", "San José", "Supía", "Victoria", "Villamaría", "Viterbo"]
  },
  {
    id: "18",
    name: "Caquetá",
    municipalities: ["Florencia", "Albania", "Belén de los Andaquíes", "Cartagena del Chairá", "Curillo", "El Doncello", "El Paujil", "La Montañita", "Milán", "Morelia", "Puerto Rico", "San José del Fragua", "San Vicente del Caguán", "Solano", "Solita", "Valparaíso"]
  },
  {
    id: "85",
    name: "Casanare",
    municipalities: ["Yopal", "Aguazul", "Chámeza", "Hato Corozal", "La Salina", "Maní", "Monterrey", "Nunchía", "Orocué", "Paz de Ariporo", "Pore", "Recetor", "Sabanalarga", "Sácama", "San Luis de Palenque", "Támara", "Tauramena", "Trinidad", "Villanueva"]
  },
  {
    id: "19",
    name: "Cauca",
    municipalities: ["Popayán", "Almaguer", "Argelia", "Balboa", "Bolívar", "Buenos Aires", "Cajibío", "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guachené", "Guapi", "Inzá", "Jambaló", "La Sierra", "La Vega", "López de Micay", "Mercaderes", "Miranda", "Morales", "Padilla", "Páez", "Patía", "Piamonte", "Piendamó", "Puerto Tejada", "Puracé", "Rosas", "San Sebastián", "Santa Rosa", "Santander de Quilichao", "Silvia", "Sotará", "Suárez", "Sucre", "Timbío", "Timbiquí", "Toribío", "Totoró", "Villa Rica"]
  },
  {
    id: "20",
    name: "Cesar",
    municipalities: ["Valledupar", "Aguachica", "Agustín Codazzi", "Astrea", "Becerril", "Bosconia", "Chimichagua", "Chiriguaná", "Curumaní", "El Copey", "El Paso", "Gamarra", "González", "La Gloria", "La Jagua de Ibirico", "La Paz", "Manaure Balcón del Cesar", "Pailitas", "Pelaya", "Pueblo Bello", "Río de Oro", "San Alberto", "San Diego", "San Martín", "Tamalameque"]
  },
  {
    id: "27",
    name: "Chocó",
    municipalities: ["Quibdó", "Acandí", "Alto Baudó", "Atrato", "Bagadó", "Bahía Solano", "Bajo Baudó", "Bojayá", "Cantón de San Pablo", "Carmen del Darién", "Cértegui", "Condoto", "El Carmen de Atrato", "Istmina", "Juradó", "Litoral de San Juan", "Lloró", "Medio Atrato", "Medio Baudó", "Medio San Juan", "Nóvita", "Nuquí", "Riosucio", "San José del Palmar", "Sipí", "Tadó", "Unguía", "Unión Panamericana"]
  },
  {
    id: "25",
    name: "Cundinamarca",
    municipalities: ["Bogotá D.C.", "Agua de Dios", "Albán", "Anapoima", "Anolaima", "Apulo", "Arbeláez", "Beltrán", "Bituima", "Bojacá", "Cabrera", "Cachipay", "Cajicá", "Caparrapí", "Cáqueza", "Carmen de Carupa", "Chaguaní", "Chía", "Chipaque", "Choachí", "Chocontá", "Cogua", "Cota", "Cucunubá", "El Colegio", "El Peñón", "El Rosal", "Facatativá", "Fómeque", "Fosca", "Funza", "Fúquene", "Fusagasugá", "Gachalá", "Gachancipá", "Gachetá", "Gama", "Girardot", "Granada", "Guachetá", "Guaduas", "Guasca", "Guataquí", "Guatavita", "Guayabal de Síquima", "Guayabetal", "Gutiérrez", "Jerusalén", "Junín", "La Calera", "La Mesa", "La Palma", "La Peña", "La Vega", "Lenguazaque", "Machetá", "Madrid", "Manta", "Medina", "Mosquera", "Nariño", "Nemocón", "Nilo", "Nimaima", "Nocaima", "Pacho", "Paime", "Pandi", "Paratebueno", "Pasca", "Puerto Salgar", "Pulí", "Quebradanegra", "Quetame", "Quipile", "Ricaurte", "San Antonio del Tequendama", "San Bernardo", "San Cayetano", "San Francisco", "San Juan de Rioseco", "Sasaima", "Sesquilé", "Sibaté", "Silvania", "Simijaca", "Soacha", "Sopó", "Subachoque", "Suesca", "Supatá", "Susa", "Sutatausa", "Tabio", "Tausa", "Tena", "Tenjo", "Tibacuy", "Tibirita", "Tocaima", "Tocancipá", "Topaipí", "Ubalá", "Ubaque", "Ubaté", "Une", "Útica", "Venecia", "Vergara", "Vianí", "Villagómez", "Villapinzón", "Villeta", "Viotá", "Yacopí", "Zipacón", "Zipaquirá"]
  },
  {
    id: "23",
    name: "Córdoba",
    municipalities: ["Montería", "Ayapel", "Buenavista", "Canalete", "Cereté", "Chimá", "Chinú", "Ciénaga de Oro", "Cotorra", "La Apartada", "Lorica", "Los Córdobas", "Momil", "Moñitos", "Montelíbano", "Planeta Rica", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purísima", "Sahagún", "San Andrés de Sotavento", "San Antero", "San Bernardo del Viento", "San Carlos", "San José de Uré", "San Pelayo", "Santa Cruz de Lorica", "Tierralta", "Tuchín", "Valencia"]
  },
  {
    id: "94",
    name: "Guainía",
    municipalities: ["Inírida", "Barrancominas", "Cacahual", "La Guadalupe", "Mapiripana", "Morichal Nuevo", "Pana Pana", "Puerto Colombia", "Puerto Santander", "San Felipe"]
  },
  {
    id: "95",
    name: "Guaviare",
    municipalities: ["San José del Guaviare", "Calamar", "El Retorno", "Miraflores"]
  },
  {
    id: "41",
    name: "Huila",
    municipalities: ["Neiva", "Acevedo", "Agrado", "Aipe", "Algeciras", "Altamira", "Baraya", "Campoalegre", "Colombia", "Elías", "Garzón", "Gigante", "Guadalupe", "Hobo", "Íquira", "Isnos", "La Argentina", "La Plata", "Nátaga", "Oporapa", "Paicol", "Palermo", "Palestina", "Pital", "Pitalito", "Rivera", "Saladoblanco", "San Agustín", "Santa María", "Suaza", "Tarqui", "Tello", "Teruel", "Tesalia", "Timaná", "Villavieja", "Yaguará"]
  },
  {
    id: "44",
    name: "La Guajira",
    municipalities: ["Riohacha", "Albania", "Barrancas", "Dibulla", "Distracción", "El Molino", "Fonseca", "Hatonuevo", "La Jagua del Pilar", "Maicao", "Manaure", "San Juan del Cesar", "Uribia", "Urumita", "Villanueva"]
  },
  {
    id: "47",
    name: "Magdalena",
    municipalities: ["Santa Marta", "Algarrobo", "Aracataca", "Ariguaní", "Cerro de San Antonio", "Chibolo", "Ciénaga", "Concordia", "El Banco", "El Piñón", "El Retén", "Fundación", "Guamal", "Nueva Granada", "Pedraza", "Pijiño del Carmen", "Pivijay", "Plato", "Puebloviejo", "Remolino", "Sabanas de San Ángel", "Salamina", "San Sebastián de Buenavista", "San Zenón", "Santa Ana", "Santa Bárbara de Pinto", "Sitionuevo", "Tenerife", "Zapayán", "Zona Bananera"]
  },
  {
    id: "50",
    name: "Meta",
    municipalities: ["Villavicencio", "Acacías", "Barranca de Upía", "Cabuyaro", "Castilla la Nueva", "Cubarral", "Cumaral", "El Calvario", "El Castillo", "El Dorado", "Fuente de Oro", "Granada", "Guamal", "La Macarena", "Lejanías", "Mapiripán", "Mesetas", "Puerto Concordia", "Puerto Gaitán", "Puerto Lleras", "Puerto López", "Puerto Rico", "Restrepo", "San Carlos de Guaroa", "San Juan de Arama", "San Juanito", "San Martín", "Uribe", "Vista Hermosa"]
  },
  {
    id: "52",
    name: "Nariño",
    municipalities: ["Pasto", "Albán", "Aldana", "Ancuyá", "Arboleda", "Barbacoas", "Belén", "Buesaco", "Chachagüí", "Colón", "Consacá", "Contadero", "Córdoba", "Cuaspud", "Cumbal", "Cumbitara", "El Charco", "El Peñol", "El Rosario", "El Tablón de Gómez", "El Tambo", "Francisco Pizarro", "Funes", "Guachucal", "Guaitarilla", "Gualmatán", "Iles", "Imués", "Ipiales", "La Cruz", "La Florida", "La Llanada", "La Tola", "La Unión", "Leiva", "Linares", "Los Andes", "Magüí Payán", "Mallama", "Mosquera", "Nariño", "Olaya Herrera", "Ospina", "Policarpa", "Potosí", "Providencia", "Puerres", "Pupiales", "Ricaurte", "Roberto Payán", "Samaniego", "San Bernardo", "San Lorenzo", "San Pablo", "San Pedro de Cartago", "Sandoná", "Santa Bárbara", "Santacruz", "Sapuyes", "Taminango", "Tangua", "Tumaco", "Túquerres", "Yacuanquer"]
  },
  {
    id: "54",
    name: "Norte de Santander",
    municipalities: ["Cúcuta", "Ábrego", "Arboledas", "Bochalema", "Bucarasica", "Cáchira", "Cácota", "Chinácota", "Chitagá", "Convención", "Cucutilla", "Duranía", "El Carmen", "El Tarra", "El Zulia", "Gramalote", "Hacarí", "Herrán", "La Esperanza", "La Playa", "Labateca", "Los Patios", "Lourdes", "Mutiscua", "Ocaña", "Pamplona", "Pamplonita", "Puerto Santander", "Ragonvalia", "Salazar", "San Calixto", "San Cayetano", "Santiago", "Sardinata", "Silos", "Teorama", "Tibú", "Toledo", "Villa Caro", "Villa del Rosario"]
  },
  {
    id: "86",
    name: "Putumayo",
    municipalities: ["Mocoa", "Colón", "Orito", "Puerto Asís", "Puerto Caicedo", "Puerto Guzmán", "Puerto Leguízamo", "San Francisco", "San Miguel", "Santiago", "Sibundoy", "Valle del Guamuez", "Villagarzón"]
  },
  {
    id: "63",
    name: "Quindío",
    municipalities: ["Armenia", "Buenavista", "Calarcá", "Circasia", "Córdoba", "Filandia", "Génova", "La Tebaida", "Montenegro", "Pijao", "Quimbaya", "Salento"]
  },
  {
    id: "66",
    name: "Risaralda",
    municipalities: ["Pereira", "Apía", "Balboa", "Belén de Umbría", "Dosquebradas", "Guática", "La Celia", "La Virginia", "Marsella", "Mistrató", "Pueblo Rico", "Quinchía", "Santa Rosa de Cabal", "Santuario"]
  },
  {
    id: "88",
    name: "San Andrés y Providencia",
    municipalities: ["San Andrés", "Providencia y Santa Catalina Islas"]
  },
  {
    id: "68",
    name: "Santander",
    municipalities: ["Bucaramanga", "Aguada", "Albania", "Aratoca", "Barbosa", "Barichara", "Barrancabermeja", "Betulia", "Bolívar", "Cabrera", "California", "Capitanejo", "Carcasí", "Cepitá", "Cerrito", "Charalá", "Charta", "Chima", "Chipatá", "Cimitarra", "Concepción", "Confines", "Contratación", "Coromoro", "Curití", "El Carmen de Chucurí", "El Guacamayo", "El Peñón", "El Playón", "Encino", "Enciso", "Florián", "Floridablanca", "Galán", "Gámbita", "Girón", "Guaca", "Guadalupe", "Guapotá", "Guavatá", "Güepsa", "Hato", "Jesús María", "Jordán", "La Belleza", "La Paz", "Landázuri", "Lebrija", "Los Santos", "Macaravita", "Málaga", "Matanza", "Mogotes", "Molagavita", "Ocamonte", "Oiba", "Onzaga", "Palmar", "Palmas del Socorro", "Páramo", "Piedecuesta", "Pinchote", "Puente Nacional", "Puerto Parra", "Puerto Wilches", "Rionegro", "Sabana de Torres", "San Andrés", "San Benito", "San Gil", "San Joaquín", "San José de Miranda", "San Miguel", "San Vicente de Chucurí", "Santa Bárbara", "Santa Helena del Opón", "Simacota", "Socorro", "Suaita", "Sucre", "Suratá", "Tona", "Valle de San José", "Vélez", "Vetas", "Villanueva", "Zapatoca"]
  },
  {
    id: "70",
    name: "Sucre",
    municipalities: ["Sincelejo", "Buenavista", "Caimito", "Chalán", "Colosó", "Corozal", "Coveñas", "El Roble", "Galeras", "Guaranda", "La Unión", "Los Palmitos", "Majagual", "Morroa", "Ovejas", "Palmito", "Sampués", "San Benito Abad", "San Juan de Betulia", "San Marcos", "San Onofre", "San Pedro", "Sincé", "Sucre", "Tolú", "Tolúviejo"]
  },
  {
    id: "73",
    name: "Tolima",
    municipalities: ["Ibagué", "Alpujarra", "Alvarado", "Ambalema", "Anzoátegui", "Armero", "Ataco", "Cajamarca", "Carmen de Apicalá", "Casabianca", "Chaparral", "Coello", "Coyaima", "Cunday", "Dolores", "Espinal", "Falan", "Flandes", "Fresno", "Guamo", "Herveo", "Honda", "Icononzo", "Lérida", "Líbano", "Mariquita", "Melgar", "Murillo", "Natagaima", "Ortega", "Palocabildo", "Piedras", "Planadas", "Prado", "Purificación", "Rioblanco", "Roncesvalles", "Rovira", "Saldaña", "San Antonio", "San Luis", "Santa Isabel", "Suárez", "Valle de San Juan", "Venadillo", "Villahermosa", "Villarrica"]
  },
  {
    id: "76",
    name: "Valle del Cauca",
    municipalities: ["Cali", "Alcalá", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Buenaventura", "Buga", "Bugalagrande", "Caicedonia", "Calima", "Candelaria", "Cartago", "Dagua", "El Águila", "El Cairo", "El Cerrito", "El Dovio", "Florida", "Ginebra", "Guacarí", "Jamundí", "La Cumbre", "La Unión", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo", "Riofrío", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo", "Tuluá", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"]
  },
  {
    id: "97",
    name: "Vaupés",
    municipalities: ["Mitú", "Carurú", "Pacoa", "Papunahua", "Taraira", "Yavaraté"]
  },
  {
    id: "99",
    name: "Vichada",
    municipalities: ["Puerto Carreño", "Cumaribo", "La Primavera", "Santa Rosalía"]
  }
];

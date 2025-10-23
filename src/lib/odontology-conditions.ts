
export interface Condition {
    id: string;
    name: string;
    color?: string;
    textureUrl?: string;
  }
  
  export const conditions: Condition[] = [
    { id: "presente", name: "Presente", color: "#FFFFFF" },
    { id: "ausente", name: "Ausente", color: "#a9a9a9" },
    { id: "caries", name: "Caries", color: "#000000" },
    { id: "restauracion", name: "Restauración", color: "#c0c0c0" },
    { id: "endodoncia", name: "Endodoncia", color: "#ff4500" },
    { id: "extraccion", name: "Para Extracción", color: "#ff0000" },
    { id: "corona", name: "Corona", color: "#ffd700" },
    { id: "implante", name: "Implante", color: "#4169e1" },
    { id: "sellante", name: "Sellante", color: "#32cd32" },
    { id: "puente", name: "Puente", color: "#8a2be2" },
  ];

// Contenido redactado de las unidades: un archivo JSON por unidad (CURSO-NÚMERO.json).
// Para añadir una unidad: copia uno de estos archivos, cámbiale el nombre y los
// campos «curso» y «unidad», y añádelo aquí abajo. Las unidades sin archivo
// muestran solo lo que viene de TEMARIO.md (hardware, bloques y modelo).

import ud1ESO_1 from "./1ESO-1.json";
import ud1ESO_2 from "./1ESO-2.json";
import ud1ESO_3 from "./1ESO-3.json";
import ud2ESO_1 from "./2ESO-1.json";
import ud2ESO_2 from "./2ESO-2.json";
import ud2ESO_3 from "./2ESO-3.json";
import ud3ESO_1 from "./3ESO-1.json";
import ud3ESO_2 from "./3ESO-2.json";
import ud3ESO_3 from "./3ESO-3.json";

export const CONTENIDOS: unknown[] = [
  ud1ESO_1,
  ud1ESO_2,
  ud1ESO_3,
  ud2ESO_1,
  ud2ESO_2,
  ud2ESO_3,
  ud3ESO_1,
  ud3ESO_2,
  ud3ESO_3,
];

// Copia los iconos y los sonidos de Blockly a public/, para que la mesa de
// bloques los sirva desde la propia web.
//
// Sin esto, Blockly los busca en «./media/» —que en nuestras rutas no existe—
// y se quedarían sin dibujo la papelera y los botones de acercar y alejar, y
// sin sonido el encaje de los bloques. Se ejecuta solo, antes de cada
// compilación (el «prebuild» de package.json).

import { cp, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origen = join(raiz, "node_modules", "blockly", "media");
const destino = join(raiz, "public", "blockly-media");

try {
  await access(origen);
} catch {
  console.warn("[blockly] No encuentro node_modules/blockly/media: no copio nada.");
  process.exit(0);
}

await cp(origen, destino, { recursive: true });
console.log(`[blockly] Iconos y sonidos copiados a ${destino}`);

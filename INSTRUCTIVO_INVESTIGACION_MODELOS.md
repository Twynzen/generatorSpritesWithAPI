# 🎯 INSTRUCTIVO DE INVESTIGACIÓN: Selector de Modelos de Video por Calidad

## OBJETIVO PRINCIPAL
Investigar y documentar TODOS los modelos de generación de video disponibles en FAL.ai que soporten **image-to-video** para implementar un desplegable (dropdown) que permita al usuario seleccionar entre diferentes niveles de calidad/velocidad/costo.

---

## 📋 CONTEXTO DEL PROYECTO ACTUAL

### Arquitectura Actual
```
├── API Provider: FAL.ai (https://queue.fal.run)
├── Modelo Actual: fal-ai/luma-dream-machine/image-to-video
├── Framework: Angular 18 (standalone components)
├── Patrón: Submit → Polling → Result
└── Auth: Header "Authorization: Key {API_KEY}"
```

### Archivos Clave a Modificar
| Archivo | Propósito |
|---------|-----------|
| `src/app/core/services/fal-api.service.ts` | Llamadas a la API |
| `src/app/core/models/video-generation.model.ts` | Interfaces y tipos |
| `src/app/core/constants/api.constants.ts` | Configuración de modelos |
| `src/app/state/video-generator.state.ts` | Estado del modelo seleccionado |
| `src/app/features/generator/generator.component.ts` | UI del selector |

### Endpoint Actual Funcional
```
POST /fal-ai/luma-dream-machine/image-to-video
Headers: Authorization: Key {FAL_API_KEY}
Body: {
  "prompt": "...",
  "image_url": "data:image/png;base64,...",
  "aspect_ratio": "4:3",
  "loop": true
}
```

---

## 🔬 INVESTIGACIÓN REQUERIDA

### PARTE 1: Catálogo de Modelos FAL.ai

**TAREA:** Buscar en la documentación oficial de FAL.ai TODOS los modelos que soporten:
- `image-to-video` (conversión de imagen a video)
- Que acepten una imagen de entrada
- Que generen video como output

**URLs a Investigar:**
1. https://fal.ai/models - Catálogo completo de modelos
2. https://fal.ai/models?categories=video - Filtro por video
3. https://docs.fal.ai/ - Documentación oficial
4. https://fal.ai/pricing - Precios por modelo

**Información a Extraer por CADA Modelo:**

```markdown
### Modelo: [NOMBRE]
- **Endpoint FAL:** fal-ai/[nombre-modelo]/image-to-video
- **Descripción:** [Qué hace exactamente]
- **Calidad:** [Alta/Media/Baja]
- **Velocidad:** [Rápido/Normal/Lento] (tiempo estimado de generación)
- **Costo:** $[precio] por generación
- **Resolución máxima:** [dimensiones]
- **Duración video:** [segundos]
- **Aspect Ratios soportados:** [lista]
- **Parámetros específicos:**
  - param1: [tipo] - [descripción]
  - param2: [tipo] - [descripción]
- **Ejemplo de Request:**
```json
{
  "image_url": "...",
  "prompt": "...",
  // parámetros específicos del modelo
}
```
- **Ejemplo de Response:**
```json
{
  // estructura de respuesta
}
```
- **Notas importantes:** [limitaciones, requisitos especiales]
```

---

### PARTE 2: Modelos Candidatos a Investigar

Basándome en el ecosistema FAL.ai, estos son los modelos **PROBABLES** que deberían investigarse:

#### Categoría: ALTA CALIDAD (Premium)
| Modelo Probable | Endpoint Esperado | Prioridad |
|-----------------|-------------------|-----------|
| Luma Dream Machine (actual) | `fal-ai/luma-dream-machine/image-to-video` | ✅ YA FUNCIONA |
| Runway Gen-3 | `fal-ai/runway-gen3/image-to-video` | INVESTIGAR |
| Kling AI | `fal-ai/kling-video/v1/standard/image-to-video` | INVESTIGAR |
| Kling Pro | `fal-ai/kling-video/v1/pro/image-to-video` | INVESTIGAR |
| Minimax Video | `fal-ai/minimax/video-01/image-to-video` | INVESTIGAR |

#### Categoría: CALIDAD MEDIA (Balance)
| Modelo Probable | Endpoint Esperado | Prioridad |
|-----------------|-------------------|-----------|
| Stable Video Diffusion | `fal-ai/stable-video-diffusion` | INVESTIGAR |
| AnimateDiff | `fal-ai/animatediff-v2v` | INVESTIGAR |
| Wan Video | `fal-ai/wan-flf2v` | INVESTIGAR (está en config) |

#### Categoría: CALIDAD BÁSICA (Económico/Rápido)
| Modelo Probable | Endpoint Esperado | Prioridad |
|-----------------|-------------------|-----------|
| Fast SVD | `fal-ai/fast-svd/image-to-video` | INVESTIGAR |
| SDXL Video | Similar | INVESTIGAR |

**NOTA CRÍTICA:** Los endpoints anteriores son SUPOSICIONES basadas en patrones comunes. La investigación DEBE confirmar los endpoints exactos.

---

### PARTE 3: Validación de Compatibilidad

Para CADA modelo encontrado, verificar:

#### A) Compatibilidad de Input
```
□ ¿Acepta imagen en base64 data URI? (como el actual)
□ ¿Requiere URL de imagen pública?
□ ¿Tiene límite de tamaño de imagen?
□ ¿Qué formatos de imagen acepta? (PNG, JPEG, WebP)
□ ¿Hay requisitos de resolución mínima/máxima?
```

#### B) Compatibilidad de Parámetros
```
□ ¿Acepta prompt de texto?
□ ¿Soporta aspect_ratio? ¿Cuáles exactamente?
□ ¿Tiene parámetro loop?
□ ¿Parámetros únicos del modelo?
□ ¿Valores por defecto vs requeridos?
```

#### C) Compatibilidad de Response
```
□ ¿Usa el mismo sistema queue/polling? (submit → status → result)
□ ¿La estructura de response es igual?
□ ¿El video viene en video.url igual que Luma?
□ ¿Diferencias en status codes?
```

#### D) Información Comercial
```
□ Precio por generación
□ Tiempo promedio de generación
□ Límites de rate (requests/minuto)
□ Calidad subjetiva del output
```

---

### PARTE 4: Pruebas de API Requeridas

**IMPORTANTE:** Para cada modelo candidato, realizar pruebas con cURL:

#### Template de Prueba
```bash
# 1. Submit Request
curl -X POST "https://queue.fal.run/fal-ai/[MODELO]/image-to-video" \
  -H "Authorization: Key YOUR_FAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "[URL_IMAGEN_PRUEBA]",
    "prompt": "simple walk cycle animation"
  }'

# Guardar el request_id de la respuesta

# 2. Check Status
curl "https://queue.fal.run/fal-ai/[MODELO]/requests/[REQUEST_ID]/status" \
  -H "Authorization: Key YOUR_FAL_API_KEY"

# 3. Get Result (cuando status sea 200)
curl "https://queue.fal.run/fal-ai/[MODELO]/requests/[REQUEST_ID]" \
  -H "Authorization: Key YOUR_FAL_API_KEY"
```

**Imagen de Prueba Sugerida:** Usar un sprite simple PNG de 256x256 o 512x512

---

## 📊 FORMATO DE ENTREGA DE LA INVESTIGACIÓN

### Sección 1: Tabla Resumen de Modelos

```markdown
| Modelo | Endpoint | Calidad | Velocidad | Costo | Compatible | Status |
|--------|----------|---------|-----------|-------|------------|--------|
| Luma Dream Machine | fal-ai/luma-dream-machine/image-to-video | ⭐⭐⭐⭐⭐ | ~60s | $0.50 | ✅ | FUNCIONAL |
| [Modelo 2] | [...] | ⭐⭐⭐⭐ | ~30s | $0.XX | ✅/❌ | PROBADO/PENDIENTE |
| [...] | [...] | [...] | [...] | [...] | [...] | [...] |
```

### Sección 2: Detalle por Modelo (usar template de PARTE 1)

### Sección 3: Mapeo de Calidad
```typescript
// Propuesta de configuración para el dropdown
export const VIDEO_MODELS = {
  PREMIUM: {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine (Premium)',
    endpoint: 'fal-ai/luma-dream-machine/image-to-video',
    quality: 5,
    speed: 'slow',
    costPerVideo: 0.50,
    description: 'Máxima calidad, ideal para producción'
  },
  HIGH: {
    id: 'modelo-high',
    name: 'Nombre (Alta Calidad)',
    endpoint: 'fal-ai/.../image-to-video',
    quality: 4,
    speed: 'medium',
    costPerVideo: 0.XX,
    description: '...'
  },
  MEDIUM: {
    // ...
  },
  FAST: {
    // ...
  },
  ECONOMY: {
    // ...
  }
};
```

### Sección 4: Diferencias de Parámetros
```typescript
// Documentar parámetros únicos por modelo
interface ModelSpecificParams {
  'luma-dream-machine': {
    loop: boolean;
    aspect_ratio: AspectRatio;
  };
  'otro-modelo': {
    motion_bucket_id?: number;
    fps?: number;
    // etc.
  };
}
```

### Sección 5: Código de Ejemplo Funcional

Para cada modelo CONFIRMADO como funcional, proveer:

```typescript
// Ejemplo de llamada para [Nombre Modelo]
submitGeneration_ModeloX(request: ModelXRequest): Observable<FalSubmitResponse> {
  return this.http.post<FalSubmitResponse>(
    `${this.baseUrl}/fal-ai/[modelo-x]/image-to-video`,
    {
      image_url: request.imageUrl,
      prompt: request.prompt,
      // parámetros específicos del modelo
    }
  );
}
```

---

## 🎨 DISEÑO DEL SELECTOR (UI)

### Propuesta de Dropdown

```html
<!-- Selector de Modelo/Calidad -->
<div class="model-selector">
  <label>Calidad de Generación</label>
  <select [(ngModel)]="selectedModel">
    <option value="economy">🚀 Económico - Rápido (~$0.10, ~15s)</option>
    <option value="standard">⚡ Estándar - Balanceado (~$0.25, ~30s)</option>
    <option value="high">🎬 Alta Calidad (~$0.40, ~45s)</option>
    <option value="premium" selected>👑 Premium - Máxima Calidad (~$0.50, ~60s)</option>
  </select>
</div>
```

### Información a Mostrar por Opción
- Icono representativo
- Nombre del nivel de calidad
- Costo aproximado
- Tiempo estimado de generación
- (Tooltip): Descripción detallada y modelo usado

---

## ✅ CHECKLIST DE INVESTIGACIÓN COMPLETA

```
PREPARACIÓN
□ Crear cuenta FAL.ai si no existe
□ Obtener API Key válida
□ Preparar imagen de prueba (sprite PNG)

INVESTIGACIÓN DOCUMENTAL
□ Revisar https://fal.ai/models?categories=video
□ Documentar TODOS los modelos image-to-video disponibles
□ Extraer precios de https://fal.ai/pricing
□ Leer documentación de cada modelo candidato

PRUEBAS PRÁCTICAS
□ Probar cada modelo con cURL
□ Documentar estructura exacta de request/response
□ Medir tiempos de generación reales
□ Verificar calidad de output (subjetivo)
□ Identificar errores o limitaciones

ANÁLISIS
□ Crear tabla comparativa final
□ Clasificar modelos por calidad (1-5 estrellas)
□ Identificar 4-5 modelos para el dropdown
□ Documentar diferencias de parámetros

ENTREGABLES
□ Documento con tabla resumen
□ Detalle de cada modelo funcional
□ Código TypeScript propuesto para configuración
□ Ejemplos de request/response por modelo
□ Recomendación final de modelos a implementar
```

---

## 🚀 IMPLEMENTACIÓN POST-INVESTIGACIÓN

Una vez completada la investigación, Claude Code deberá:

### 1. Actualizar Modelos (`api.constants.ts`)
```typescript
export const VIDEO_MODELS: VideoModel[] = [
  // Array con todos los modelos confirmados
];
```

### 2. Crear Interface de Modelo (`video-generation.model.ts`)
```typescript
export interface VideoModel {
  id: string;
  name: string;
  displayName: string;
  endpoint: string;
  quality: 1 | 2 | 3 | 4 | 5;
  estimatedTime: number; // segundos
  costPerVideo: number;
  description: string;
  params: ModelParams;
  aspectRatios: AspectRatio[];
}
```

### 3. Agregar Estado de Modelo Seleccionado (`video-generator.state.ts`)
```typescript
selectedModel = signal<VideoModel>(DEFAULT_MODEL);

setModel(model: VideoModel) {
  this.selectedModel.set(model);
}
```

### 4. Modificar Servicio de API (`fal-api.service.ts`)
```typescript
submitGeneration(request: FalSubmitRequest, model: VideoModel): Observable<...> {
  const endpoint = model.endpoint;
  const body = this.buildRequestBody(request, model);
  return this.http.post(`${this.baseUrl}/${endpoint}`, body);
}
```

### 5. Crear Componente Selector
```typescript
// Nueva: src/app/shared/components/model-selector/model-selector.component.ts
@Component({
  selector: 'app-model-selector',
  // ...
})
export class ModelSelectorComponent {
  models = VIDEO_MODELS;
  @Output() modelChange = new EventEmitter<VideoModel>();
}
```

### 6. Actualizar Cost Service
```typescript
calculateCost(model: VideoModel): CostEstimate {
  return {
    pricePerVideo: model.costPerVideo,
    // ...
  };
}
```

---

## ⚠️ NOTAS IMPORTANTES

1. **NO ASUMIR** - Todos los endpoints deben ser VERIFICADOS con la documentación oficial y pruebas reales

2. **API Key** - Las pruebas requieren una API Key válida de FAL.ai con créditos

3. **Rate Limits** - Considerar límites de la API al hacer pruebas

4. **Pricing puede cambiar** - Documentar fecha de la investigación, precios pueden variar

5. **Algunos modelos pueden no estar disponibles** - FAL.ai puede retirar o agregar modelos

6. **Diferentes estructuras de response** - Algunos modelos pueden tener respuestas diferentes, documentar TODAS las diferencias

---

## 📚 RECURSOS ÚTILES

- **FAL.ai Dashboard:** https://fal.ai/dashboard
- **Documentación FAL:** https://docs.fal.ai
- **Modelos de Video:** https://fal.ai/models?categories=video
- **Pricing:** https://fal.ai/pricing
- **API Reference:** https://docs.fal.ai/api-reference
- **Status Page:** https://status.fal.ai

---

## 🎯 RESULTADO ESPERADO

Al finalizar la investigación, tener:

1. **Lista definitiva** de 4-6 modelos image-to-video funcionales en FAL.ai
2. **Clasificación por calidad** de mejor a peor
3. **Código TypeScript** listo para copiar/pegar con la configuración
4. **Ejemplos funcionales** de llamadas a cada API
5. **Guía clara** para que Claude Code pueda implementar el selector sin ambigüedades

---

*Documento creado para: Proyecto Sprite Video Generator*
*Fecha: [Insertar fecha de investigación]*
*Versión: 1.0*

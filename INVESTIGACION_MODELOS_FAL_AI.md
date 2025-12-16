# INVESTIGACION EXHAUSTIVA: Modelos FAL.ai para Video Generation

## OBJETIVO
Validar, documentar y corregir la implementacion de CADA modelo de video disponible en la aplicacion, asegurando que:
1. Los endpoints sean correctos y funcionales
2. Los parametros enviados sean los que requiere cada modelo
3. Se documente que modelos soportan first/last frame (interpolacion)
4. Se identifiquen y corrijan problemas de compatibilidad

---

## ESTADO ACTUAL DEL SISTEMA

### Arquitectura Implementada
```
Frontend: Angular 18 (standalone components)
API Provider: FAL.ai (https://queue.fal.run)
Patron: Submit -> Polling -> Result
Auth: Header "Authorization: Key {FAL_API_KEY}"
```

### Archivos Clave
```
src/app/core/constants/api.constants.ts      # Configuracion de modelos
src/app/core/services/fal-api.service.ts     # Logica de llamadas API
src/app/core/models/video-generation.model.ts # Interfaces
src/app/state/video-generator.state.ts       # Estado (incluye endImage)
src/app/features/generator/generator.component.ts # UI principal
```

### Flujo de Generacion Actual
```
1. Usuario sube imagen(es)
2. Imagen se convierte a base64 data URI
3. Se construye request body segun modelo seleccionado
4. POST a /{model-endpoint}
5. Se obtiene request_id
6. Polling a /{polling-endpoint}/requests/{id}/status
7. Cuando HTTP 200, GET a /{polling-endpoint}/requests/{id}
8. Se obtiene video.url del resultado
```

---

## MODELOS IMPLEMENTADOS - INVESTIGACION REQUERIDA

### IMPORTANTE: Cada modelo debe validarse con la documentacion oficial de FAL.ai

Para cada modelo, investigar y documentar:
- [ ] Endpoint correcto (verificar en https://fal.ai/models)
- [ ] Estructura exacta del request body
- [ ] Parametros obligatorios vs opcionales
- [ ] Valores por defecto
- [ ] Estructura del response
- [ ] Si soporta first/last frame (start_image_url + end_image_url)
- [ ] Aspect ratios soportados
- [ ] Resolucion de salida
- [ ] Duracion del video generado
- [ ] Precio real

---

## MODELO 1: Luma Dream Machine v1.5 (FUNCIONANDO)

**Status:** VERIFICADO FUNCIONANDO

### Configuracion Actual
```typescript
{
  id: 'luma-dream-machine',
  endpoint: 'fal-ai/luma-dream-machine/image-to-video',
  pollingEndpoint: 'fal-ai/luma-dream-machine',
  supportsEndImage: false,
}
```

### Request Body Implementado
```typescript
{
  image_url: "data:image/png;base64,...",
  prompt: "Character walking...",
  aspect_ratio: "16:9", // 16:9, 9:16, 4:3, 3:4, 21:9, 9:21
  loop: true
}
```

### INVESTIGAR
- [ ] Verificar si existe parametro `end_image_url` para interpolacion
- [ ] Verificar parametro `duration` si existe
- [ ] Documentar response structure exacta

### URL Documentacion
https://fal.ai/models/fal-ai/luma-dream-machine/image-to-video

---

## MODELO 2: Luma Ray 2

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'luma-ray-2',
  endpoint: 'fal-ai/luma-dream-machine/ray-2/image-to-video',
  pollingEndpoint: 'fal-ai/luma-dream-machine/ray-2',
  supportsEndImage: false,
}
```

### Request Body Implementado
```typescript
{
  image_url: "...",
  prompt: "...",
  aspect_ratio: "16:9",
  resolution: "540p", // 540p, 720p, 1080p
  duration: "5s",     // 5s, 9s
  loop: true
}
```

### INVESTIGAR
- [ ] Verificar endpoint correcto
- [ ] Verificar si soporta `end_image_url` (blending)
- [ ] Documentar parametros exactos
- [ ] Probar request real

### URL Documentacion
https://fal.ai/models/fal-ai/luma-dream-machine/ray-2/image-to-video

---

## MODELO 3: Luma Ray 2 Flash

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'luma-ray-2-flash',
  endpoint: 'fal-ai/luma-dream-machine/ray-2-flash/image-to-video',
  pollingEndpoint: 'fal-ai/luma-dream-machine/ray-2-flash',
}
```

### INVESTIGAR
- [ ] Verificar que el endpoint existe
- [ ] Comparar con Ray 2 regular
- [ ] Documentar diferencias

---

## MODELO 4: Wan 2.1 First-Last Frame (wan-flf2v)

**Status:** IMPLEMENTADO - REQUIERE VALIDACION

### Configuracion Actual
```typescript
{
  id: 'wan-flf2v',
  endpoint: 'fal-ai/wan-flf2v',
  pollingEndpoint: 'fal-ai/wan-flf2v',
  supportsEndImage: true, // REQUIERE DOS IMAGENES
}
```

### Request Body Implementado
```typescript
{
  start_image_url: "data:image/png;base64,...",  // Primera imagen
  end_image_url: "data:image/png;base64,...",    // Ultima imagen
  prompt: "Character walking cycle...",
  negative_prompt: "blur, distort, low quality, static",
  resolution: "720p",    // 480p, 720p
  aspect_ratio: "auto",  // auto, 16:9, 9:16, 1:1
  num_frames: 81,        // 81-100
  frames_per_second: 16  // 5-24
}
```

### INVESTIGAR CRITICO
- [ ] Verificar que `start_image_url` y `end_image_url` son los nombres correctos de parametros
- [ ] Verificar si acepta base64 data URI o requiere URL publica
- [ ] Probar con un request real
- [ ] Documentar errores comunes
- [ ] Verificar que el modelo interpola correctamente entre frames

### URL Documentacion
https://fal.ai/models/fal-ai/wan-flf2v

---

## MODELO 5: Wan 2.1 Image-to-Video (wan-i2v)

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'wan-i2v',
  endpoint: 'fal-ai/wan-i2v',
  pollingEndpoint: 'fal-ai/wan-i2v',
  supportsEndImage: false,
}
```

### Request Body Implementado
```typescript
{
  image_url: "...",
  prompt: "...",
  resolution: "480p",
  aspect_ratio: "auto",
  num_frames: 81,
  frames_per_second: 16
}
```

### INVESTIGAR
- [ ] Verificar diferencia con wan-flf2v
- [ ] Confirmar que NO soporta end image
- [ ] Documentar parametros exactos

### URL Documentacion
https://fal.ai/models/fal-ai/wan-i2v

---

## MODELO 6: Kling v2.1 Master

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'kling-v2.1-master',
  endpoint: 'fal-ai/kling-video/v2.1/master/image-to-video',
  pollingEndpoint: 'fal-ai/kling-video/v2.1/master',
}
```

### Request Body Implementado
```typescript
{
  image_url: "...",
  prompt: "...",
  duration: "5",           // "5" o "10" segundos
  aspect_ratio: "16:9",    // 16:9, 9:16, 1:1
  negative_prompt: "blur, distort, low quality",
  cfg_scale: 0.5           // 0-1
}
```

### INVESTIGAR
- [ ] Verificar endpoint correcto
- [ ] Verificar si soporta `tail_image` (end frame)
- [ ] Documentar todos los parametros
- [ ] Verificar precio real ($1.40?)

### URL Documentacion
https://fal.ai/models/fal-ai/kling-video/v2.1/master/image-to-video

---

## MODELO 7: Kling v2.1 Pro

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'kling-v2.1-pro',
  endpoint: 'fal-ai/kling-video/v2.1/pro/image-to-video',
  pollingEndpoint: 'fal-ai/kling-video/v2.1/pro',
}
```

### INVESTIGAR
- [ ] Diferencias con Master
- [ ] Verificar parametro `tail_image` para end frame
- [ ] Documentar

---

## MODELO 8: Kling v2.1 Standard

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'kling-v2.1-standard',
  endpoint: 'fal-ai/kling-video/v2.1/standard/image-to-video',
  pollingEndpoint: 'fal-ai/kling-video/v2.1/standard',
}
```

### INVESTIGAR
- [ ] Diferencias con Pro y Master
- [ ] Calidad vs costo

---

## MODELO 9: MiniMax Video-01

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'minimax-video-01',
  endpoint: 'fal-ai/minimax/video-01/image-to-video',
  pollingEndpoint: 'fal-ai/minimax/video-01',
}
```

### Request Body Implementado
```typescript
{
  image_url: "...",
  prompt: "...",
  prompt_optimizer: true
}
```

### INVESTIGAR
- [ ] Verificar endpoint
- [ ] Documentar parametros de camera movement
- [ ] Verificar si soporta end image

### URL Documentacion
https://fal.ai/models/fal-ai/minimax/video-01/image-to-video

---

## MODELO 10: Pika v2.2

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'pika-v2.2',
  endpoint: 'fal-ai/pika/v2.2/image-to-video',
  pollingEndpoint: 'fal-ai/pika/v2.2',
}
```

### Request Body Implementado
```typescript
{
  image_url: "...",
  prompt: "...",
  resolution: "720p"
}
```

### INVESTIGAR
- [ ] Verificar endpoint existe
- [ ] Documentar parametros completos

---

## MODELO 11: Stable Video Diffusion

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'stable-video',
  endpoint: 'fal-ai/stable-video',
  pollingEndpoint: 'fal-ai/stable-video',
  promptRequired: false, // NO REQUIERE PROMPT
}
```

### Request Body Implementado
```typescript
{
  image_url: "...",
  motion_bucket_id: 127,  // 1-255, controla cantidad de movimiento
  fps: 25
}
```

### INVESTIGAR
- [ ] Verificar endpoint correcto
- [ ] Confirmar que NO requiere prompt
- [ ] Documentar motion_bucket_id

### URL Documentacion
https://fal.ai/models/fal-ai/stable-video

---

## MODELO 12: Fast SVD LCM

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'fast-svd-lcm',
  endpoint: 'fal-ai/fast-svd-lcm',
  pollingEndpoint: 'fal-ai/fast-svd-lcm',
  promptRequired: false,
}
```

### INVESTIGAR
- [ ] Verificar endpoint
- [ ] Diferencias con stable-video

---

## MODELO 13: LTX Video

**Status:** PENDIENTE VERIFICACION

### Configuracion Actual
```typescript
{
  id: 'ltx-video',
  endpoint: 'fal-ai/ltx-video/image-to-video',
  pollingEndpoint: 'fal-ai/ltx-video',
}
```

### Request Body Implementado
```typescript
{
  image_url: "...",
  prompt: "...",
  negative_prompt: "..."
}
```

### INVESTIGAR
- [ ] Verificar endpoint
- [ ] Documentar parametros

---

## TEMPLATE PARA PRUEBAS CON cURL

### Prueba Basica de Endpoint
```bash
# Reemplazar {MODEL_ENDPOINT} y {FAL_API_KEY}

# 1. Submit Request
curl -X POST "https://queue.fal.run/{MODEL_ENDPOINT}" \
  -H "Authorization: Key {FAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/test-sprite.png",
    "prompt": "Character walking cycle animation"
  }' | jq .

# Guardar el request_id de la respuesta

# 2. Check Status (reemplazar {POLLING_ENDPOINT} y {REQUEST_ID})
curl "https://queue.fal.run/{POLLING_ENDPOINT}/requests/{REQUEST_ID}/status" \
  -H "Authorization: Key {FAL_API_KEY}" | jq .

# 3. Get Result (cuando status sea COMPLETED)
curl "https://queue.fal.run/{POLLING_ENDPOINT}/requests/{REQUEST_ID}" \
  -H "Authorization: Key {FAL_API_KEY}" | jq .
```

### Prueba First/Last Frame (wan-flf2v)
```bash
curl -X POST "https://queue.fal.run/fal-ai/wan-flf2v" \
  -H "Authorization: Key {FAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "start_image_url": "https://example.com/frame1.png",
    "end_image_url": "https://example.com/frame2.png",
    "prompt": "Character walking from pose A to pose B",
    "resolution": "720p",
    "num_frames": 81
  }' | jq .
```

---

## PREGUNTAS CRITICAS A RESPONDER

### Por cada modelo:

1. **Endpoint Correcto?**
   - El endpoint configurado existe en FAL.ai?
   - El polling endpoint es correcto (sin /image-to-video)?

2. **Parametros Correctos?**
   - Cuales son obligatorios?
   - Cuales son opcionales?
   - Los nombres de parametros coinciden con la API? (snake_case vs camelCase)

3. **Soporta First/Last Frame?**
   - Acepta `end_image_url` o `tail_image`?
   - Como se llama el parametro exacto?

4. **Aspect Ratios?**
   - Cuales soporta realmente?
   - Que pasa si se envia uno no soportado?

5. **Base64 vs URL?**
   - Acepta base64 data URI directamente?
   - Requiere URL publica?

6. **Response Structure?**
   - El video viene en `response.video.url`?
   - Hay diferencias entre modelos?

---

## RESULTADO ESPERADO DE LA INVESTIGACION

### Por cada modelo, documentar:

```markdown
## [NOMBRE MODELO]

### Status: FUNCIONANDO / NO FUNCIONA / DEPRECADO

### Endpoint Verificado
- Submit: `fal-ai/xxx/image-to-video`
- Polling: `fal-ai/xxx`

### Request Body Correcto
```json
{
  // parametros exactos
}
```

### Response Structure
```json
{
  "video": {
    "url": "...",
    "content_type": "video/mp4"
  }
}
```

### Soporta First/Last Frame: SI/NO
- Parametro: `end_image_url` / `tail_image` / N/A

### Aspect Ratios Verificados
- 16:9, 9:16, etc.

### Notas/Problemas
- Cualquier issue encontrado
```

---

## CORRECCIONES A IMPLEMENTAR POST-INVESTIGACION

Una vez completada la investigacion, actualizar:

### 1. api.constants.ts
- Corregir endpoints incorrectos
- Actualizar `supportsEndImage` segun hallazgos
- Ajustar aspect ratios soportados
- Corregir precios

### 2. fal-api.service.ts
- Ajustar nombres de parametros si difieren
- Agregar casos para modelos con parametros especiales
- Corregir estructura de request para modelos con first/last frame

### 3. model-selector.component.ts
- Marcar modelos no funcionales
- Agregar indicadores de first/last frame support

### 4. Eliminar modelos no disponibles
- Si un modelo no existe en FAL.ai, removerlo de la lista

---

## RECURSOS

- FAL.ai Models: https://fal.ai/models
- FAL.ai Docs: https://docs.fal.ai
- FAL.ai Pricing: https://fal.ai/pricing
- FAL.ai Status: https://status.fal.ai

---

## NOTAS ADICIONALES

### Sobre First/Last Frame
Esta funcionalidad es CRITICA para sprites de juegos porque permite:
- Crear walk cycles perfectos (frame 1 -> frame N -> frame 1)
- Interpolacion suave entre poses
- Animaciones que loopeean naturalmente

### Modelos que PROBABLEMENTE soporten First/Last Frame:
1. **wan-flf2v** - Confirmado (First Last Frame to Video)
2. **Luma Ray 2** - Posible (tiene "end image blending" en la descripcion)
3. **Kling Pro** - Posible (menciona "tail_image" en documentacion)

### Prioridad de Investigacion:
1. wan-flf2v (ya implementado, validar)
2. Luma Ray 2 (verificar end image support)
3. Kling models (verificar tail_image)
4. Resto de modelos

---

*Fecha de creacion: [FECHA]*
*Ultima actualizacion: [FECHA]*

package com.malvinas.comandoia.servicios;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.malvinas.comandoia.modelo.MensajeIA;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service

public class GPTService {

    private final WebClient webClient;
    private final String apiKey;

    public GPTService(Environment env) {
        this.apiKey = env.getProperty("openai.api.key");

        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1/chat/completions")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String enviarPrompt(List<Map<String, String>> mensajes){
        Map<String, Object> request = Map.of(
                "model", "gpt-4o",
                "messages", mensajes,
                "temperature", 0.3
        );

        return webClient.post()
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class)
                .map(respuesta -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) respuesta.get("choices");
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return message.get("content").toString();
                })
                .doOnError(Throwable::printStackTrace)
                .onErrorReturn("Error al comunicarse con la IA")
                .block();
    }
    public Map<String, String> generarSQLDesdePregunta(String  pregunta, List<MensajeIA> historial) {
        String systemPrompt = """
                🚫 No uses comillas triples ni bloques de código.
                ✅ La respuesta debe comenzar directamente con { y ser JSON válido.
                ❌ Nunca agregues texto como ```json ni explicaciones antes o después del JSON.
                                           
                Sos un asesor político inteligente con acceso a la base de datos municipal (reclamos, obras, nivel de satisfacción, territorio, etc). Tu objetivo es analizar el territorio y detectar riesgos, oportunidades o patrones políticos. Podés generar SQL para buscar datos concretos, y también interpretar o recomendar acciones.
                                           
                Para cada pregunta del usuario:
                                           
                Si se puede responder con datos concretos, generá un SQL.
                                           
                Si se necesita análisis interpretativo, usá los datos disponibles y tu conocimiento general.
                                           
                Siempre respondé en un tono político claro, breve, directo y profesional.
                                           
                Si la pregunta se puede responder con SQL (SELECT), devolvé:
                {
                "tipo": "sql",
                "contenido": "SELECT ..."
                }
                                           
                Si se requiere interpretación textual:
                {
                "tipo": "texto",
                "contenido": "..."
                }
                ⚠️ IMPORTANTE: No uses campos como "response", "respuesta", "result", ni ningún nombre inventado. Solo devolvé:
                                
                {
                  "tipo": "sql",
                  "contenido": "..."
                }
                                
                o
                                
                {
                  "tipo": "texto",
                  "contenido": "..."
                }
                                           
                ⚠️ No devuelvas texto fuera de este formato.
                ⚠️ Solo se permite SELECT. Nunca uses DELETE, INSERT, UPDATE, DROP ni TRUNCATE.
                                           
                Tablas disponibles:
                                           
                obra_publica(id, nombre, descripcion, tipo_id, estado_id, avance_fisico, monto_presupuestado, monto_ejecutado, fecha_inicio, fecha_estimada_finalizacion, fecha_real_finalizacion, direccion_id)
                tipo_obra(id, descripcion)
                estado_obra(id, descripcion)
                direccion(id, localidad, barrio, calle, numero_calle)
                                           
                reclamo(id, nombre, descripcion, tipo_id, estado_id, nivel_satisfaccion_id, direccion_id, fecha_reclamo, fecha_creacion, tiempo_resolucion)
                estado_reclamo(id, descripcion)
                tipo_reclamo(id, descripcion)
                tipo_nivel_satisfaccion(id, descripcion)
                                           
                Relaciones:
                obra_publica.tipo_id → tipo_obra.id
                obra_publica.estado_id → estado_obra.id
                obra_publica.direccion_id → direccion.id
                reclamo.tipo_id → tipo_reclamo.id
                reclamo.estado_id → estado_reclamo.id
                reclamo.nivel_satisfaccion_id → tipo_nivel_satisfaccion.id
                reclamo.direccion_id → direccion.id
                                           
                Alias recomendados:
                                           
                r (reclamo), er (estado_reclamo), tr (tipo_reclamo), n (nivel_satisfaccion), dir (direccion)
                                           
                op (obra_publica), e (estado_obra), tob (tipo_obra)
                                           
                Sinónimos a reconocer:
                                           
                "sin resolver", "pendiente", "por atender" → estado 'Abierto'
                                           
                "en trámite", "procesando" → estado 'En Proceso'
                                           
                "solucionado", "resuelto" → estado 'Cerrado'
                                           
                "pésimo", "muy mal" → 'Muy Insatisfecho'
                                           
                "mal", "malo" → 'Insatisfecho'
                                           
                "excelente" → 'Muy Satisfecho'
                                           
                📌 Interpretación especial para malestar, riesgo, imagen, bronca:
                → Usar reclamos con nivel_satisfaccion en ('Insatisfecho', 'Muy Insatisfecho'), sin importar estado.
                                           
                📌 En obras:
                                           
                "planificada", "por hacer", "pendiente" → estado_obra ILIKE '%planificada%'
                                           
                "en ejecución", "en marcha" → estado_obra ILIKE '%ejecuc%'
                                           
                "finalizada", "terminada" → estado_obra ILIKE '%finalizada%'
                   
                 📌  Comparacion de tablas o uniones:
                   
                 Si vas a usar UNION o UNION ALL entre obras públicas y reclamos:
                 
                 Asegurate de que ambos SELECTs tengan la misma cantidad y orden de columnas.
                 
                 Si una de las fuentes (como reclamos) no tiene un campo, agregá NULL AS nombre_columna para mantener la estructura.
                 
                 Las columnas deben coincidir en tipo y orden.
                 
                 Por ejemplo, si el primer SELECT tiene 11 columnas, el segundo también debe tener 11, aunque algunas sean NULL.
                 
                 🛠️ Ejemplo :
                              
                 SELECT
                   op.descripcion AS descripcion_obra,
                   op.nombre AS nombre_obra,
                   e.descripcion AS estado_obra,
                   tob.descripcion AS tipo_obra,
                   op.avance_fisico,
                   op.fecha_inicio,
                   op.fecha_estimada_finalizacion,
                   op.fecha_real_finalizacion,
                   dir.localidad,
                   dir.barrio,
                   NULL AS nivel_satisfaccion
                 FROM obra_publica op
                 JOIN estado_obra e ON op.estado_id = e.id
                 JOIN tipo_obra tob ON op.tipo_id = tob.id
                 JOIN direccion dir ON op.direccion_id = dir.id
                 
                 UNION ALL
                 
                 SELECT
                   r.descripcion AS descripcion_obra,
                   r.nombre AS nombre_obra,
                   er.descripcion AS estado_obra,
                   tr.descripcion AS tipo_obra,
                   NULL AS avance_fisico,
                   NULL AS fecha_inicio,
                   NULL AS fecha_estimada_finalizacion,
                   NULL AS fecha_real_finalizacion,
                   dir.localidad,
                   dir.barrio,
                   n.descripcion AS nivel_satisfaccion
                 FROM reclamo r
                 JOIN estado_reclamo er ON r.estado_id = er.id
                 JOIN tipo_reclamo tr ON r.tipo_id = tr.id
                 JOIN tipo_nivel_satisfaccion n ON r.n
                                           
                📌 Comparación de texto:
                                           
                Nunca uses =, siempre ILIKE '%valor%'.
                                
                Si necesitás filtrar por el estado de una obra (por ejemplo, "finalizada", "en ejecución"), no lo hagas sobre estado_id directamente. Primero hacé JOIN con la tabla estado_obra, y filtrá por estado_obra.descripcion.
                                           
                📌 Fechas:
                                           
                Para años: EXTRACT(YEAR FROM fecha_inicio) = 2024
                                           
                📌 Geografía:
                                           
                Buscar localidades, barrios o calles con ILIKE '%valor%'
                                           
                Usar dir.localidad, dir.barrio
                                           
                📌 Recomendaciones técnicas (obras):
                                           
                Si está en ejecución: revisar contratistas, acelerar tiempos.
                                           
                Si está planificada: establecer cronograma.
                                           
                Si está retrasada: alertar demora, sugerir intervención.
                                           
                Si está finalizada: evaluar impacto, comunicar logros.
                                           
                📌 Datos requeridos en respuesta:
                   
                   
                   
                                           
                Nunca incluir IDs.
                                           
                 ⚠️MUY IMPORTANTE: Siempre devolve todos los datos de los resultados, osea todos los campos de obras o reclamos obtenidos aparte de lo que se solicite

                                
                Además, si se solicita reclamos o obras que no esten en un estado recordá usar not ilike para el estado mencionado
                asi mostras todos los distintos a tipo o estado particular que no quiere el usuario por ejemplo para los reclamos que
                no estan resueltos seria:
                                
                WHERE er.descripcion NOT ILIKE '%cerrado%'
                                
                De este modo se incluirán todos los reclamos que aún no fueron cerrados, sin importar si están abiertos, en proceso u otro estado intermedio.
                                           
                🔍 Mapeo de preguntas posibles según tus datos actuales (reclamos y obras):
                                           
                🔥 CONFLICTOS Y RIESGOS:
                                           
                ✅ ¿Dónde podría estallar un conflicto social?
                                           
                Datos necesarios: Devuelves el porcentaje de reclamos satisfechos , el porcentaje de reclamos insatisfecho y el porcentaje neutral agrupados por localidad)
                el porcentaje de insatisfaccion y el de satisfaccion
                                           
                Análisis: Detecta zonas críticas combinando malestar con falta de resolución.
                                           
                ✅ ¿Qué barrios tienen más reclamos acumulados sin respuesta?
                                           
                Datos necesarios: Reclamos con estado 'Abierto', agrupados por barrio o localidad.
                                           
                Análisis: Alta acumulación de reclamos abiertos indica falta de atención.
                                           
                ✅ ¿En qué zona está cayendo más la imagen de la gestión?
                                           
                Datos necesarios: Todos los reclamos con nivel de satisfacción negativo (insatisfecho o muy insatisfecho).
                                           
                Análisis: Alta frecuencia de insatisfacción refleja percepción negativa sostenida.
                                           
                ✅ ¿Qué sectores muestran malestar silencioso?
                                           
                 Datos necesarios:
                Reclamos con nivel de satisfacción negativo (Insatisfecho o Muy Insatisfecho) y estado = 'Cerrado'.
                                
                Obras sin fecha real de finalización (fecha_real_finalizacion IS NULL) y cuya fecha estimada de finalización ya venció (fecha_estimada_finalizacion < NOW()).
                        
                  Cuando combines datos de reclamos y obras usando UNION, asegurate de que:
                                                                                                                                                            
                                                                                                                                                            Ambas consultas tengan la misma cantidad de columnas, en el mismo orden y con tipos compatibles.
                                                                                                                                                            
                                                                                                                                                            Si una tabla no tiene un campo que la otra sí tiene, usá NULL AS nombre_columna para completar la estructura.
                                                                                                                                                            
                                                                                                                                                            Ejemplo: en la parte de reclamos agregá NULL AS fecha_estimada_finalizacion, NULL AS fecha_real_finalizacion; y en obras agregá NULL AS nivel_satisfaccion, etc.
                                                                                                                                                            
                                                                                                                                                            Siempre usá UNION ALL en lugar de UNION para evitar pérdida de registros por deduplicación automática.
                                
                Análisis: Zonas donde el reclamo fue respondido pero generó descontento y donde hay obras que no se estan realizando en tiempo y forma.
                                           
                📍 PRESENCIA POLÍTICA:
                                           
                ⚠️ ¿Dónde hay baja presencia del municipio?
                                           
                Datos sugeridos: Comparar zonas sin reclamos ni obras .
                    - Para detectar zonas sin presencia institucional (vacío político), el SQL debe ser:
                      te recomiendo usar esta query:
                                                                                                                                                            SELECT dir.localidad, dir.barrio,
                                                                                                                                                                   MAX(op.fecha_real_finalizacion) AS ultima_obra,
                                                                                                                                                                   COUNT(CASE WHEN r.fecha_reclamo > NOW() - INTERVAL '6 months' THEN 1 END) AS reclamos_ultimos_6_meses
                                                                                                                                                            FROM direccion dir
                                                                                                                                                            LEFT JOIN obra_publica op ON dir.id = op.direccion_id
                                                                                                                                                            LEFT JOIN reclamo r ON dir.id = r.direccion_id
                                                                                                                                                            GROUP BY dir.localidad, dir.barrio
                                                                                                                                                            HAVING
                                                                                                                                                              (MAX(op.fecha_real_finalizacion) IS NULL OR MAX(op.fecha_real_finalizacion) < NOW() - INTERVAL '1 year')
                                                                                                                                                              AND COUNT(CASE WHEN r.fecha_reclamo > NOW() - INTERVAL '6 months' THEN 1 END) < 3
                    
                                           
                Análisis: Inferir zonas sin intervención.
                                           
                ❌ ¿Qué zonas gana la oposición? ¿Con qué discurso?
                                           
                ❌ ¿Quiénes son los referentes que crecen?
                                           
                ❌ ¿Qué actividades impactaron más?
                                           
                Requiere datos políticos, actores o encuestas no disponibles.
                                           
                📊 GESTIÓN Y PERCEPCIÓN:
                                           
                ✅ ¿Qué obra fue mal comunicada?
                                           
                Datos necesarios: Obras finalizadas en zonas con reclamos posteriores o sin buena percepción.
                                           
                Análisis: Detección de obras no valoradas.
                                           
                ✅ ¿Qué servicio municipal tiene más quejas?
                                           
                Datos necesarios: Agrupar reclamos por tipo.
                                           
                Análisis: Alta concentración de quejas en un tipo indica problema operativo.
                                           
                ⚠️ ¿Qué políticas tienen aceptación o rechazo?
                                           
                Requiere cruzar con encuestas o opiniones sociales.
                                           
                ❌ ¿Qué piensan los jóvenes/empleados?
                                           
                No hay datos sociales ni de encuestas.
                                           
                🗳️ INTENCIÓN DE VOTO:
                                           
                ❌ ¿Dónde perdemos votos y por qué?
                                           
                ❌ ¿Qué perfiles están más indecisos?
                                           
                ❌ ¿Qué mensaje mejora intención en X?
                                           
                ❌ ¿Impacto de alianzas o anuncios?
                                           
                Requiere datos electorales / encuestas.
                                           
                📈 DECISIONES POLÍTICAS:
                                           
                ⚠️ ¿Qué medidas mejorarían apoyo?
                                           
                Puede sugerir en base a zonas de malestar acumulado.
                                           
                ⚠️ ¿Qué hacer para recuperar control?
                                           
                Interpretación basada en reclamos abiertos y zonas críticas.
                                           
                ⚠️ ¿Cómo enfrentar críticas opositoras?
                                           
                Puede dar respuesta general estratégica.
                                           
                ⚠️ ¿Qué no estoy viendo que puede poner en riesgo mi poder?
                                           
                Puede listar zonas con riesgo acumulado o baja percepción.
                                
                                
                🛑 IMPORTANTE:
                Si la consulta SQL involucra reclamos, SIEMPRE devolvé estos campos, aunque el usuario no los pida explícitamente:
                                
                - `r.nombre`
                - `r.descripcion`
                - `er.descripcion AS estado`
                - `tr.descripcion AS tipo`
                - `n.descripcion AS nivel_satisfaccion`
                - `r.fecha_reclamo`
                - `dir.localidad`
                - `dir.barrio`
                                
                Si la consulta involucra obras públicas, incluí:
                                
                - `op.nombre`
                - `op.descripcion`
                - `e.descripcion AS estado`
                - `tob.descripcion AS tipo`
                - `op.avance_fisico`
                - `op.fecha_inicio`
                - `op.fecha_estimada_finalizacion`
                - `op.fecha_real_finalizacion`
                - `dir.localidad`
                - `dir.barrio`
                                
                                
                                
                ⚠️ IMPORTANTE para consultas combinadas con UNION:
                Cuando combines datos de reclamos y obras usando UNION, asegurate de que:
                                
                Ambas consultas tengan la misma cantidad de columnas, en el mismo orden y con tipos compatibles.
                                
                Si una tabla no tiene un campo que la otra sí, completá con NULL AS nombre_columna.
                                
                Ejemplo: si reclamos tiene nivel_satisfaccion y obras no, agregá NULL AS nivel_satisfaccion en la parte de obras.
                                
                Usá UNION ALL para evitar pérdida de registros por deduplicación.
                                
                IMPORTANTE – INSTRUCCIÓN SOBRE NIVELES DE SATISFACCIÓN:
                               
                Cuando se soliciten porcentajes o promedios relacionados con el nivel de satisfacción de los reclamos:
                               
                1. Recordá que el campo `tipo_nivel_satisfaccion.descripcion` es un VARCHAR y sus valores pueden incluir sinónimos.\s
                2. No agrupes directamente por `descripcion`. En su lugar, aplicá esta lógica semántica:
                               
                   - Satisfecho: incluye descripciones que contengan '%satisfecho%' (como "Satisfecho", "Muy satisfecho", etc.)
                   - Insatisfecho: incluye descripciones que contengan '%insatisfecho%' (como "Insatisfecho", "Muy insatisfecho", etc.)
                   - Neutral: cualquier descripción que NO contenga ni '%satisfecho%' ni '%insatisfecho%'
                               
                3. Si el análisis es sobre reclamos cerrados, primero filtrá por `estado_reclamo.descripcion ILIKE '%cerrado%'`, contá el total, y calculá el porcentaje de cada categoría sobre ese total.
                               
                4. Devolvé los porcentajes agrupados únicamente como: **Satisfecho, Neutral, Insatisfecho**.
                               
                Ejemplo de agrupación válida:
                               
                - Satisfecho: 50.0%
                - Neutral: 33.3%
                - Insatisfecho: 16.7%
                
                IMPORTANTE LEELO:
                Si hay riesgo de errores por acentos, sugerí:
                - eliminar los acentos del texto antes de usarlo en la condición ILIKE.
                Por ejemplo para Pablo Nogués
                                
                                """




                ;




        try {

            List<Map<String, String>> mensajes = new ArrayList<>();

            mensajes.add(Map.of(
                    "role", "system",
                    "content", systemPrompt
            ));

            if (historial != null) {
                for (MensajeIA m : historial) {
                    mensajes.add(Map.of(
                            "role", m.getRol(),
                            "content", m.getContent()
                    ));
                }
            }

            mensajes.add(Map.of(
                    "role", "user",
                    "content", pregunta
            ));

            String respuesta = enviarPrompt(mensajes);

            // ✅ Log para debugging
            System.out.println("Respuesta IA cruda: " + respuesta);

            // ✅ Validación inicial básica
            if (!respuesta.trim().startsWith("{")) {
                return Map.of(
                        "tipo", "error",
                        "contenido", "La IA no devolvió un JSON válido. Respuesta: " + respuesta
                );
            }

            // ✅ Intentar parsear la respuesta como JSON
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(respuesta, new TypeReference<>() {});
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of(
                    "tipo", "error",
                    "contenido", "Error al interpretar la respuesta de la IA."
            );
        }

    }



    public String redactarRespuesta(String pregunta, List<Map<String, Object>> resultados) {
        String systemPrompt = """
                                🚫 No uses comillas triples ni bloques de código.
                                                                                                                                                            🚫 No uses comillas triples ni bloques de código.
                                                                                                                                                            ✅ La respuesta debe estar en formato Markdown válido, sin estructura de JSON.
                                                                                                                                                            ❌ Nunca devuelvas un objeto JSON ni uses etiquetas como ```json ni campos "tipo", "contenido", etc.
                                                                                                                                                            
                                                                                                                                                            Sos un asesor político que transforma resultados SQL en respuestas claras y estratégicas para un usuario no técnico. El objetivo es mostrar datos procesados desde la base municipal (reclamos, obras, satisfacción) con claridad y sentido político.
                                                                                                                                                            
                                                                                                                                                            Mostrá los resultados en formato Markdown válido, listo para ser renderizado por un componente Angular con ngx-markdown.
                                                                                                                                                            
                                                                                                                                                            Si hay múltiples ítems, usá listas con * o 1., según corresponda.
                                                                                                                                                            
                                                                                                                                                            Usá negrita para destacar campos importantes como localidad, barrio, tipo de reclamo, estado, nivel de satisfacción.
                                                                                                                                                            
                                                                                                                                                            Si detectás algo relevante (como reclamos sin atender, zonas con insatisfacción, obras demoradas), podés agregar una breve interpretación política al final.
                                                                                                                                                            
                                                                                                                                                            No uses encabezados (#), ni introducciones como "Aquí tienes los resultados".
                                                                                                                                                            
                                                                                                                                                            Si encontrás más de un reclamo relevante por localidad, listalos todos. Mostrar todos permite una mejor evaluación del riesgo territorial.
                                                                                                                                                            
                                                                                                                                                            No expliques cómo se hizo la consulta, solo mostrale el resultado como si fueras un analista político.
                                                                                                                                                            
                                                                                                                                                            Si no hay resultados, devolvé: "No se encontraron resultados para esa consulta."
                                                                                                                                                            
                                                                                                                                                            Ejemplos de estilo:
                                                                                                                                                            ❌ NO:
                                                                                                                                                            Aquí están los resultados:
                                                                                                                                                            ✅ SÍ:
                                                                                                                                                            Localidad: Grand Bourg
                                                                                                                                                            
                                                                                                                                                            Cantidad de reclamos sin atender: 4
                                                                                                                                                            
                                                                                                                                                            Localidad: Tierras Altas
                                                                                                                                                            
                                                                                                                                                            Cantidad de reclamos sin atender: 3
                                                                                                                                                            
                                                                                                                                                            Estos datos sugieren focos de malestar que podrían requerir intervención territorial.
                                                                                                                                                            
                                                                                                                                                            Mostrá todos los reclamos que cumplan las condiciones de riesgo, sin limitar la cantidad por localidad.
                                                                                                                                                            
                                                                                                                                                            No omitas reclamos si hay más de uno en la misma localidad o barrio.
                                                                                                                                                            
                                                                                                                                                            Considerá todos los tipos de reclamo por igual. No asumas que un tipo (como 'Servicio' o 'Agua') es menos importante que 'Gas' o 'Internet'.
                                                                                                                                                            
                                                                                                                                                            Si hay varios reclamos en una misma localidad, listalos todos con claridad bajo el mismo encabezado.
                                                                                                                                                            
                                                                                                                                                            No asumas que todos los reclamos de una localidad comparten el mismo estado.
                                                                                                                                                            
                                                                                                                                                            Si vas a decir "a pesar de estar cerrados", asegurate de que todos los reclamos relevantes en esa zona estén efectivamente cerrados.
                                                                                                                                                            
                                                                                                                                                            Si hay mezcla de estados, usá una expresión precisa como:
                                                                                                                                                            
                                                                                                                                                            “Uno de los reclamos ya fue cerrado, pero persiste malestar por otro aún no resuelto”.
                                                                                                                                                            
                                                                                                                                                            “Aunque uno fue cerrado, el otro sigue abierto”.
                                                                                                                                                            ⚠️ Si los datos provienen solo de reclamos en estado 'Abierto', debés usar la frase "sin atender". Nunca uses "sin resolver".
                                                                                                                                                            
                                                                                                                                                            NO DIGAS QUE ALGUNA LOCALIDAD ESTÁ MÁS COMPROMETIDA QUE OTRA SI TIENEN LA MISMA CANTIDAD DE PROBLEMAS O RECLAMOS.
                                                                                                                                                            
                                                                                                                                                            Si el SQL contiene campos como nivel_satisfaccion, estado, tipo, fecha, etc., usá esa información para redactar la descripción detallada de cada reclamo, no solo cuentes la cantidad.
                                                                                                                                                            
                                                                                                                                                            Mostrá los datos relevantes por reclamo en listas. Ejemplo:
                                                                                                                                                            
                                                                                                                                                            Localidad: Grand Bourg
                                                                                                                                                            
                                                                                                                                                            Reclamo: Reclamo 8Estado: CerradoTipo: AguaNivel de Satisfacción: InsatisfechoFecha: 2024-06-29
                                                                                                                                                            
                                                                                                                                                            Esto ayuda a entender por qué esos reclamos son críticos y evita ambigüedades como “hay 2 reclamos”.
                                                                                                                                                            
                                                                                                                                                            🧠 Instrucciones para interpretar preguntas estratégicas:
                                                                                                                                                            Según el tipo de consulta, usá los siguientes criterios extraídos del análisis SQL para contextualizar la respuesta:
                                                                                                                                                            
                                                                                                                                                            🔥 SOBRE CONFLICTOS Y RIESGOS
                                                                                                                                                            
                                                                                                                                                            ¿Dónde podría estallar un conflicto social?
                                                                                                                                                            
                                                                                                                                                            Datos: Porcentaje de reclamos con buena satisfaccion y mala satisfaccion
                                                                                                                                                            Deberias responder algo como el estilo de esto:
                                                                                                                                                            Localidad: Los Polvorines
                                                                                                                                                            
                                                                                                                                                            Porcentaje de satisfaccion: 40%.
                                                                                                                                                            Porcentaje de insatisfaccion: 50%
                                                                                                                                                            El resto faltante seria neutral
                                                                                                                                                            
                                                                                                                                                            Interpretación: Alertá sobre posibles focos de tensión por malestar no resuelto. Incluí el nivel de satisfacción y el estado.
                                                                                                                                                            
                                                                                                                                                            ¿Qué barrios tienen más reclamos acumulados sin respuesta?
                                                                                                                                                            
                                                                                                                                                            Datos: Reclamos con estado 'Abierto'.
                                                                                                                                                            
                                                                                                                                                            Interpretación: Usá la expresión “sin atender”. No uses “sin resolver”.
                                                                                                                                                            
                                                                                                                                                            ¿En qué zona está cayendo más la imagen de la gestión?
                                                                                                                                                            
                                                                                                                                                            Datos: Todos los reclamos con satisfacción negativa, sin importar estado.
                                                                                                                                                            
                                                                                                                                                            Interpretación: Posible consolidación de percepción negativa.
                                                                                                                                                            
                                                                                                                                                            ¿Qué sectores muestran malestar silencioso?
                                                                                                                                                            
                                                                                                                                                            Datos: 
                                                                                                                                                            -Reclamos cerrados con satisfacción negativa.
                                                                                                                                                            - Obras con la fecha estimada de finalizacion vencida, osea que al dia de hoy la fecha de estimacion es menor y todavia no tiene una fecha de finalizacion real
                                                                                                                                                            - ACORDATE DE MENCIONAR QUE TODAS LAS OBRAS QUE LISTASTE TIENEN UNA FECHA DE ESTIMACION DE FIN VENCIDA CON RESPECTO AL DIA DE HOY
                                                                                                                                                            
                                                                                                                                                          
                                                                                                                                                            
                                                                                                                                                        Análisis: Zonas donde el reclamo fue respondido pero generó descontento y donde hay obras que no se estan realizando en tiempo y forma.
                                                                                                                                                            
                                                                                                                                                            📍 SOBRE PRESENCIA POLÍTICA Y TERRITORIAL
                                                                                                                                                            
                                                                                                                                                            ¿Qué zonas están desatendidas o vacías políticamente?
                                                                                                                                                            
                                                                                                                                                            Datos: localidades donde hay vacio o poca presencia institucional con respecto a obras realizadas en el ultimo año y menos de 3 reclamos en 6 meses 
                                                                                                                                                            
                                                                                                                                                            Interpretación: Posible falta de presencia institucional.
                                                                                                                                                            
                                                                                                                                                            📊 SOBRE GESTIÓN Y PERCEPCIÓN
                                                                                                                                                            
                                                                                                                                                            ¿Qué obra fue mal comunicada o no valorada?
                                                                                                                                                            
                                                                                                                                                            Datos: Obras finalizadas en zonas con reclamos posteriores o sin mejora en percepción.
                                                                                                                                                            
                                                                                                                                                            Interpretación: 
                                                                                                                                                              - Datos: Obras **finalizadas** en zonas donde **persisten reclamos con nivel de satisfacción negativo**.
                                                                                                                                                              - Mostrá el **avance físico**, las **fechas** (inicio, estimada y real), y la **localización**.
                                                                                                                                                              - Interpretación: Indicá si la obra pudo haber sido mal comunicada, no ejecutada como se esperaba, o no percibida positivamente por la comunidad. Destacá si hay ausencia de datos críticos (como fecha real de finalización).
                                                                                                                                                            
                                                                                                                                                            ¿Qué servicio tiene más quejas o fallas?
                                                                                                                                                            
                                                                                                                                                            Datos: Agrupamiento de reclamos por tipo.
                                                                                                                                                            
                                                                                                                                                            Interpretación: Indicar fallas operativas por tipo de reclamo.
                                                                                                                                                            
                                                                                                                                                            🗳️ SOBRE ELECCIONES
                                                                                                                                                            
                                                                                                                                                            ¿Qué perfiles sociales están más indecisos?
                                                                                                                                                            
                                                                                                                                                            ¿Qué mensaje podría mejorar la intención de voto?
                                                                                                                                                            
                                                                                                                                                            ¿Qué piensan los jóvenes o empleados municipales?
                                                                                                                                                            
                                                                                                                                                            Actualmente no se puede responder con los datos disponibles.
                                                                                                                                                            
                                                                                                                                                            Siempre priorizá precisión política, sin exagerar si los datos no lo justifican, y no afirmes desigualdad si los datos muestran igualdad. Nunca respondas en formato JSON.
                                                                                                                                                            🔍 MUY PARA TODAS LAS RESPUESTAS IMPORTANTE:
                                                                                                                                                            Si el resultado SQL contiene columnas como estado, nivel_satisfaccion, tipo, fecha, o descripcion, no está permitido resumir la información solo como “Cantidad de reclamos: N”.
                                                                                                                                                            Debés mostrar cada reclamo individualmente con todos sus campos clave (estado, tipo, satisfacción, fecha).
                                                                                                                                                            Esto evita respuestas ambiguas y permite una lectura política precisa.
                                                                                                                                                            🛑 IMPORTANTE:
                                                                                                                                                            Si la consulta tiene muchos datos devueltos muestra todos no resumas nada si tiene 100 muestra los 100.
                                                                                                                                                            
                                                                                                                                                            
                                                                                                                                                            🛑 IMPORTANTE:
                                                                                                                                                            Si la consulta involucra reclamos, SIEMPRE devolvé estos campos, aunque el usuario no los pida explícitamente:
                                                                                                                                                            
                                                                                                                                                            - `r.nombre`
                                                                                                                                                            - `r.descripcion`
                                                                                                                                                            - `er.descripcion AS estado`
                                                                                                                                                            - `tr.descripcion AS tipo`
                                                                                                                                                            - `n.descripcion AS nivel_satisfaccion`
                                                                                                                                                            - `r.fecha_reclamo`
                                                                                                                                                            - `dir.localidad`
                                                                                                                                                            - `dir.barrio`
                                                                                                                                                            
                                                                                                                                                            Si la consulta involucra obras públicas, incluí:
                                                                                                                                                            
                                                                                                                                                            - `op.nombre`
                                                                                                                                                            - `op.descripcion`
                                                                                                                                                            - `e.descripcion AS estado`
                                                                                                                                                            - `tob.descripcion AS tipo`
                                                                                                                                                            - `op.avance_fisico`
                                                                                                                                                            - `op.fecha_inicio`
                                                                                                                                                            - `op.fecha_estimada_finalizacion`
                                                                                                                                                            - `op.fecha_real_finalizacion`
                                                                                                                                                            - `dir.localidad`
                                                                                                                                                            - `dir.barrio`
                                                                                                                                                            
                                                                                                                                                            
                                                                                                                                                            ⚠️ IMPORTANTE para consultas combinadas con UNION:
                                                                                                                                                            Cuando combines datos de reclamos y obras usando UNION, asegurate de que:
                                                                                                                                                            
                                                                                                                                                            Ambas consultas tengan la misma cantidad de columnas, en el mismo orden y con tipos compatibles.
                                                                                                                                                            
                                                                                                                                                            Si una tabla no tiene un campo que la otra sí, completá con NULL AS nombre_columna.
                                                                                                                                                            
                                                                                                                                                            Ejemplo: si reclamos tiene nivel_satisfaccion y obras no, agregá NULL AS nivel_satisfaccion en la parte de obras.
                                                                                                                                                            
                                                                                                                                                            Usá UNION ALL para evitar pérdida de registros por deduplicación.
                                                                                                                                                            
                                                                                                                                                            ⚠️ Si la consulta filtra por un único nivel de satisfacción (por ejemplo, solo reclamos neutrales, insatisfechos o satisfechos), no asumas que todos los reclamos de esa zona comparten ese mismo nivel.
                                                                                                                                                            
                                                                                                                                                            La interpretación debe indicar claramente que hay reclamos de ese tipo, pero pueden coexistir otros con diferente nivel de satisfacción.
                                                                                                                                                            
                                                                                                                                                            Ejemplo correcto:
                                                                                                                                                            
                                                                                                                                                            “En estas localidades se registran reclamos con satisfacción neutral. Esto representa una oportunidad para mejorar la percepción ciudadana, aunque podrían existir también reclamos positivos o negativos que requieren análisis complementario.”
                                                                                                                                                            
                                                                                                                                                            IMPORTANTE:
                                                                                                                                                            SI TE LLEGA UN COUNT O UN NUMERO COMO RESPUESTA VINCULA ESE NUMERO CON LA CONSULTA DEL USUARIO POR EJEMPLO:
                                                                                                                                                            - Respuesta SQL: 10
                                                                                                                                                            - Consulta: ¿Cuantos reclamos de luz se registraron en los ultimos 5 años?
                                                                                                                                                            - Respuesta: se registraron 10 reclamos de luz en los ultimos 5 años
                                                                                                                                                            
                                                                                                                                                            
                                                                                                                                                            IMPORTANTE:
                                                                                                                                                            AGRUPA LOS RESULTADOS DE SATISFECHO Y MUY SATISFECHO SI ES QUE EL USUARIO NO SOLICITO
                """;

        String datos = resultados.isEmpty()
                ? "_No se encontraron resultados para esa consulta._"
                : resultados.stream()
                .map(map -> "- " + map.entrySet().stream()
                        .map(entry -> "**" + entry.getKey() + "**: " + entry.getValue())
                        .collect(Collectors.joining(", ")))
                .collect(Collectors.joining("\n"));

        String userPrompt = "Pregunta del usuario: " + pregunta + "\nResultados:\n" + datos + "\nMostrá una respuesta clara en Markdown.";

        List<Map<String, String>> mensajes = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
        );

        return enviarPrompt(mensajes);

    }


}

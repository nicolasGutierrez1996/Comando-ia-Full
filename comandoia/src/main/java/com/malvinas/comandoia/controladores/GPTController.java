package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.MensajeIA;
import com.malvinas.comandoia.modelo.PreguntaIARequest;
import com.malvinas.comandoia.modelo.PromptRequest;
import com.malvinas.comandoia.servicios.GPTService;
import com.malvinas.comandoia.servicios.SQLExecutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ia")
@CrossOrigin(origins = "*")
public class GPTController {

    @Autowired
    private GPTService gptService;

    @Autowired
    private SQLExecutorService sqlExecutorService;

    @PostMapping("/preguntar")
    public ResponseEntity<?> preguntarIA(@RequestBody PreguntaIARequest request) {
        String pregunta = request.getPrompt();
        List<MensajeIA> historial = request.getHistorial() != null ? request.getHistorial() : new ArrayList<>();


        try {
            // 1. GPT genera una respuesta con tipo y contenido
            Map<String, String> respuestaIA = gptService.generarSQLDesdePregunta(pregunta, historial);
            String tipo = respuestaIA.get("tipo");
            String contenido = respuestaIA.get("contenido");

            System.out.println("🧠 Tipo de respuesta: " + tipo);
            System.out.println("📄 Contenido: " + contenido);

            // 2. Si es SQL, ejecutamos y redactamos
            if ("sql".equalsIgnoreCase(tipo)) {
                // Ejecutar SQL
                List<Map<String, Object>> resultados = sqlExecutorService.ejecutarConsulta(contenido);

                // Redactar respuesta para el usuario
                String respuestaRedactada = gptService.redactarRespuesta(pregunta, resultados);
                return ResponseEntity.ok(Map.of(
                        "tipo", "sql",
                        "respuesta", respuestaRedactada,
                        "query", contenido
                ));
            }

            // 3. Si es texto, devolvemos directo lo que dijo la IA
            else if ("texto".equalsIgnoreCase(tipo)) {
                return ResponseEntity.ok(Map.of(
                        "tipo", "texto",
                        "respuesta", contenido
                ));
            }

            // 4. Si hubo error en el análisis
            else {
                return ResponseEntity.badRequest().body(Map.of(
                        "tipo", "error",
                        "mensaje", contenido
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "tipo", "error",
                    "mensaje", "❌ Error procesando la consulta: " + e.getMessage()
            ));
        }
    }
}
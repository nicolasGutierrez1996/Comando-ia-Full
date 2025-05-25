package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.*;
import com.malvinas.comandoia.servicios.*;
import jakarta.validation.Valid;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/Reclamos")
@CrossOrigin(origins = "*")
public class ReclamoController {

    @Autowired
    private ReclamoService reclamoService;
    @Autowired
    private TipoReclamoService tipoReclamoService;

    @Autowired
    private EstadoReclamoService estadoReclamoService;

    @Autowired
    private TipoNivelSatisfaccionService nivelSatisfaccionService;

    @Autowired
    private DireccionService direccionService;

    @GetMapping
    public Iterable<Reclamo> listarReclamos() {
        return reclamoService.listarReclamos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerReclamoPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<Reclamo> reclamo = reclamoService.obtenerReclamoPorId(id);

        if (!reclamo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("reclamo", reclamo.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearReclamo(@Valid @RequestBody Reclamo reclamo, BindingResult result) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errores = new HashMap<>();

        if (result.hasErrors()) {
            result.getFieldErrors().forEach(error ->
                    errores.put(error.getField(), error.getDefaultMessage())
            );
            response.put("success", false);
            response.put("errores", errores);
            return ResponseEntity.badRequest().body(response);
        }

        Reclamo nuevo = reclamoService.guardarReclamo(reclamo);
        response.put("success", true);
        response.put("reclamo", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarReclamo(@PathVariable Integer id, @Valid @RequestBody Reclamo reclamo, BindingResult result) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errores = new HashMap<>();

        if (result.hasErrors()) {
            result.getFieldErrors().forEach(error ->
                    errores.put(error.getField(), error.getDefaultMessage())
            );
            response.put("success", false);
            response.put("errores", errores);
            return ResponseEntity.badRequest().body(response);
        }

        Optional<Reclamo> existente = reclamoService.obtenerReclamoPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        reclamo.setId(id);
        Reclamo actualizado = reclamoService.guardarReclamo(reclamo);
        response.put("success", true);
        response.put("reclamo", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReclamo(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        Optional<Reclamo> reclamo = reclamoService.obtenerReclamoPorId(id);
        if (!reclamo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. El reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        reclamoService.eliminarReclamo(id);
        response.put("success", true);
        response.put("mensaje", String.format("Reclamo con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }

    @PostMapping("excel/upload")
    public ResponseEntity<?> handleFileUploadReclamo(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();

        try {
            importarDesdeExcel(file);
            response.put("success", true);
            response.put("message", "Archivo procesado correctamente.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", true); // ⬅️ ¡OJO! El archivo sí se procesó, aunque con errores
            response.put("message", "Archivo procesado con errores.");
            response.put("errores", Arrays.asList(e.getMessage().split("\n")));
            return ResponseEntity.ok(response); // ⬅️ Devolvemos 200 para que el frontend pueda mostrar feedback útil
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error inesperado: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public void importarDesdeExcel(MultipartFile file) throws IOException {
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<String> erroresPorFila = new ArrayList<>();

        for (Row row : sheet) {
            if (row.getRowNum() == 0) continue; // salta encabezado

            try {

                if (row.getCell(0) == null || row.getCell(0).getCellType() == CellType.BLANK) {
                    break;
                }

                String nombre = row.getCell(0).getStringCellValue();
                String descripcion = row.getCell(1).getStringCellValue();
                String tipo_reclamo = row.getCell(2).getStringCellValue();
                LocalDateTime fecha_reclamo = row.getCell(3).getLocalDateTimeCellValue();
                String estado_reclamo = row.getCell(4).getStringCellValue();
                int tiempo_resolucion = (int) row.getCell(5).getNumericCellValue();
                String nivel_satisfaccion = row.getCell(6).getStringCellValue();

                String localidad = getStringCellValueSafe(row.getCell(7));
                String barrio = getStringCellValueSafe(row.getCell(8));
                String calle = getStringCellValueSafe(row.getCell(9));
                Integer numero_calle = getIntegerCellValueSafe(row.getCell(10));

                EstadoReclamo estadoReclamo = estadoReclamoService.buscarEstadoReclamoPorDescripcion(estado_reclamo)
                        .stream().findFirst().orElseGet(() -> {
                            EstadoReclamo nuevo = new EstadoReclamo();
                            nuevo.setDescripcion(estado_reclamo);
                            return estadoReclamoService.guardarEstadoReclamo(nuevo);
                        });

                TipoReclamo tipoReclamo = tipoReclamoService.buscarTipoReclamoPorDescripcion(tipo_reclamo)
                        .stream().findFirst().orElseGet(() -> {
                            TipoReclamo nuevo = new TipoReclamo();
                            nuevo.setDescripcion(tipo_reclamo);
                            return tipoReclamoService.guardarTipoReclamo(nuevo);
                        });

                TipoNivelSatisfaccion nivelSatisfaccion = nivelSatisfaccionService.buscarTipoNivelPorDescripcion(nivel_satisfaccion)
                        .stream().findFirst().orElseGet(() -> {
                            TipoNivelSatisfaccion nuevo = new TipoNivelSatisfaccion();
                            nuevo.setDescripcion(nivel_satisfaccion);
                            return nivelSatisfaccionService.guardarTipoNivelSatisfaccion(nuevo);
                        });

                Direccion direccionRegistro = null;
                System.out.printf("Fila %d: localidad='%s'%n", row.getRowNum(), barrio);
                System.out.printf("Fila %d: localidad='%s'%n", row.getRowNum(), calle);
                System.out.printf("Fila %d: localidad='%s'%n", row.getRowNum(), numero_calle);
                System.out.printf("Fila %d: localidad='%s'%n", row.getRowNum(), localidad);

                boolean direccionTieneDatos =
                        (localidad != null && !localidad.isBlank()) ||
                                (barrio != null && !barrio.isBlank()) ||
                                (calle != null && !calle.isBlank()) ||
                                (numero_calle != null);

                if (direccionTieneDatos) {
                    direccionRegistro = direccionService
                            .buscarDireccionFlexible(localidad, barrio, calle, numero_calle)
                            .orElseGet(() -> {
                                Direccion nueva = new Direccion();
                                nueva.setLocalidad(localidad);
                                nueva.setBarrio(barrio);
                                nueva.setCalle(calle);
                                nueva.setNumeroCalle(numero_calle);
                                nueva = direccionService.guardarDireccion(nueva);
                                System.out.println("ID DIRECCION (creada): " + nueva.getId());
                                return nueva;
                            });
                }
                Reclamo reclamo = new Reclamo();
                reclamo.setNombre(nombre);
                reclamo.setDescripcion(descripcion);
                reclamo.setTipo_reclamo(tipoReclamo);
                reclamo.setFecha_reclamo(fecha_reclamo);
                reclamo.setEstado(estadoReclamo);
                reclamo.setTiempo_resolucion(tiempo_resolucion);
                reclamo.setNivel_satisfaccion(nivelSatisfaccion);
                reclamo.setDireccion(direccionRegistro);

                reclamoService.guardarReclamo(reclamo);

            } catch (Exception e) {
                erroresPorFila.add("Fila " + (row.getRowNum() + 1) + ": " + e.getMessage());
            }
        }

        workbook.close();

        if (!erroresPorFila.isEmpty()) {
            throw new RuntimeException("Errores al procesar el archivo:\n" + String.join("\n", erroresPorFila));
        }
    }


// Métodos auxiliares para leer celdas con seguridad y evitar excepciones

    private String getStringCellValueSafe(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();

            case NUMERIC:
                double value = cell.getNumericCellValue();
                if (value == (int) value) {
                    return String.valueOf((int) value); // sin decimales si es entero
                } else {
                    return String.valueOf(value); // con decimales si aplica
                }

            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());

            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    try {
                        return String.valueOf(cell.getNumericCellValue());
                    } catch (Exception ex) {
                        return null;
                    }
                }

            default:
                return null;
        }
    }
    private Integer getIntegerCellValueSafe(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return Integer.parseInt(cell.getStringCellValue());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

}

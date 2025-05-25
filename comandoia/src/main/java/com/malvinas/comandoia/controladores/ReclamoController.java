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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
        Map<String,Object> response= new HashMap<>();

        try {
            importarDesdeExcel(file);
             response.put("success",true);
             response.put("message","Archivo procesado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success",false);
            response.put("message","Error al procesar el archivo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(response);
        }
    }

    public void importarDesdeExcel(MultipartFile file) throws IOException {
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        for (Row row : sheet) {
            if (row.getRowNum() == 0) continue; // salta encabezado

            String nombre = row.getCell(0).getStringCellValue();
            String descripcion = row.getCell(1).getStringCellValue();
            String tipo_reclamo = row.getCell(2).getStringCellValue();
            LocalDateTime fecha_reclamo = row.getCell(3).getLocalDateTimeCellValue();
            String estado_reclamo = row.getCell(4).getStringCellValue();
            int tiempo_resolucion = (int) row.getCell(5).getNumericCellValue();
            String nivel_satisfaccion = row.getCell(6).getStringCellValue();

            // Leer campos de dirección con métodos seguros para evitar errores por celdas vacías
            String localidad = getStringCellValueSafe(row.getCell(7));
            String barrio = getStringCellValueSafe(row.getCell(8));
            String calle = getStringCellValueSafe(row.getCell(9));
            Integer numero_calle = getIntegerCellValueSafe(row.getCell(10));

            // Buscar o crear EstadoReclamo
            List<EstadoReclamo> listaEstadoReclamo = estadoReclamoService.buscarEstadoReclamoPorDescripcion(estado_reclamo);
            EstadoReclamo estadoReclamo;
            if (listaEstadoReclamo.isEmpty()) {
                estadoReclamo = new EstadoReclamo();
                estadoReclamo.setDescripcion(estado_reclamo);
                estadoReclamo = estadoReclamoService.guardarEstadoReclamo(estadoReclamo);
            } else {
                estadoReclamo = listaEstadoReclamo.get(0);
            }

            // Buscar o crear TipoReclamo
            List<TipoReclamo> listaTipoReclamo = tipoReclamoService.buscarTipoReclamoPorDescripcion(tipo_reclamo);
            TipoReclamo tipoReclamo;
            if (listaTipoReclamo.isEmpty()) {
                tipoReclamo = new TipoReclamo();
                tipoReclamo.setDescripcion(tipo_reclamo);
                tipoReclamo = tipoReclamoService.guardarTipoReclamo(tipoReclamo);
            } else {
                tipoReclamo = listaTipoReclamo.get(0);
            }

            // Buscar o crear TipoNivelSatisfaccion
            List<TipoNivelSatisfaccion> listaNivelSatisfaccion = nivelSatisfaccionService.buscarTipoNivelPorDescripcion(nivel_satisfaccion);
            TipoNivelSatisfaccion nivelSatisfaccion;
            if (listaNivelSatisfaccion.isEmpty()) {
                nivelSatisfaccion = new TipoNivelSatisfaccion();
                nivelSatisfaccion.setDescripcion(nivel_satisfaccion);
                nivelSatisfaccion = nivelSatisfaccionService.guardarTipoNivelSatisfaccion(nivelSatisfaccion);
            } else {
                nivelSatisfaccion = listaNivelSatisfaccion.get(0);
            }

            // Manejo de Dirección
            Direccion direccionRegistro = null;

            // Verificamos si hay al menos un dato para dirección
            boolean direccionTieneDatos = (localidad != null && !localidad.isEmpty())
                    || (barrio != null && !barrio.isEmpty())
                    || (calle != null && !calle.isEmpty())
                    || (numero_calle != null);

            if (direccionTieneDatos) {
                Optional<Direccion> direccion = Optional.empty();

                // Solo buscamos si calle y numero_calle están presentes para evitar búsquedas inválidas
                if (calle != null && !calle.isEmpty() && numero_calle != null) {
                    direccion = direccionService.buscarDireccionPorCalleNumero(calle, numero_calle);
                }

                if (direccion.isPresent()) {
                    direccionRegistro = direccion.get();
                } else {
                    direccionRegistro = new Direccion();
                    direccionRegistro.setLocalidad(localidad);
                    direccionRegistro.setBarrio(barrio);
                    direccionRegistro.setCalle(calle);
                    direccionRegistro.setNumeroCalle(numero_calle);

                    // Guardamos la dirección nueva para que quede persistida
                    direccionRegistro = direccionService.guardarDireccion(direccionRegistro);
                }
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
        }

        workbook.close();
    }

// Métodos auxiliares para leer celdas con seguridad y evitar excepciones

    private String getStringCellValueSafe(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            // Convertimos número a texto si es necesario (ej: calle "123")
            return String.valueOf((int) cell.getNumericCellValue());
        }
        return null;
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

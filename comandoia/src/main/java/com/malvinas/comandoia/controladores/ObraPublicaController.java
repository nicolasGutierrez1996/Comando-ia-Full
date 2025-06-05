package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.*;
import com.malvinas.comandoia.servicios.DireccionService;
import com.malvinas.comandoia.servicios.EstadoObraService;
import com.malvinas.comandoia.servicios.ObraPublicaService;
import com.malvinas.comandoia.servicios.TipoObraService;
import jakarta.validation.Valid;
import org.apache.poi.hpsf.Decimal;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/ObrasPublicas")
@CrossOrigin(origins = "*")
public class ObraPublicaController {

    @Autowired
    private ObraPublicaService obraPublicaService;

    @Autowired
    private EstadoObraService estadoObraService;

    @Autowired
    private TipoObraService tipoObraService;

    @Autowired
    private DireccionService direccionService;

    @GetMapping
    public Iterable<ObraPublica> listarObrasPublicas() {
        return obraPublicaService.listarObrasPublicas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerObraPublicaPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<ObraPublica> obra = obraPublicaService.obtenerObraPublicaPorId(id);

        if (!obra.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("La obra pública con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("obraPublica", obra.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearObraPublica(@Valid @RequestBody ObraPublica obraPublica, BindingResult result) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errores = new HashMap<>();

        Direccion direccion = obraPublica.getDireccion();
        if(direccion.getBarrio()!= null && direccion.getBarrio()==""){
            direccion.setBarrio(null);
        }
        if(direccion.getCalle()!= null && direccion.getCalle()==""){
            direccion.setCalle(null);
        }
        if(direccion.getNumeroCalle() != null && direccion.getNumeroCalle()==0){
            direccion.setNumeroCalle(null);
        }

        Optional<Direccion> optionalDireccion=direccionService.buscarDireccionFlexible(direccion.getLocalidad(),direccion.getBarrio(),direccion.getCalle(),direccion.getNumeroCalle());

        if(!optionalDireccion.isPresent()){
            direccion = direccionService.guardarDireccion(direccion);
            obraPublica.setDireccion(direccion);
        }else{
            direccion=optionalDireccion.get();
            obraPublica.setDireccion(direccion);
        }

        if (result.hasErrors()) {
            result.getFieldErrors().forEach(error ->
                    errores.put(error.getField(), error.getDefaultMessage())
            );
            response.put("success", false);
            response.put("errores", errores);
            return ResponseEntity.badRequest().body(response);
        }

        ObraPublica nueva = obraPublicaService.guardarObraPublica(obraPublica);
        response.put("success", true);
        response.put("obraPublica", nueva);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarObraPublica(@PathVariable Integer id, @Valid @RequestBody ObraPublica obraPublica, BindingResult result) {
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

        Optional<ObraPublica> existente = obraPublicaService.obtenerObraPublicaPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("La obra pública con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        obraPublica.setId(id);
        ObraPublica actualizada = obraPublicaService.guardarObraPublica(obraPublica);
        response.put("success", true);
        response.put("obraPublica", actualizada);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarObraPublica(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        Optional<ObraPublica> obra = obraPublicaService.obtenerObraPublicaPorId(id);
        if (!obra.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. La obra pública con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        obraPublicaService.eliminarObraPublica(id);
        response.put("success", true);
        response.put("mensaje", String.format("Obra pública con ID %d eliminada correctamente", id));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscarObraPorNombre/{nombre}")
    public ResponseEntity<List<ObraPublica>> buscarReclamoPorNombre(@PathVariable String nombre) {
        List<ObraPublica> listaObra = obraPublicaService.buscarObraPorNombre(nombre);
        return ResponseEntity.ok(listaObra);
    }

    @GetMapping("/existe-nombre/{nombre}")
    public ResponseEntity<Boolean> existeDescripcion(@PathVariable String nombre) {
        return ResponseEntity.ok(obraPublicaService.existeNombre(nombre));
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
            if (row.getRowNum() == 0) continue;

            try {

                if (row.getCell(0) == null || row.getCell(0).getCellType() == CellType.BLANK) {
                    break;
                }
                System.out.println("Por mapear valores");
                String nombre = row.getCell(0).getStringCellValue();
                String descripcion = row.getCell(1).getStringCellValue();
                String tipo_obra = row.getCell(2).getStringCellValue();
                String estado_obra = row.getCell(4).getStringCellValue();
                Double avance_fisico = (Double)row.getCell(5).getNumericCellValue();
                BigDecimal monto_presupuestado = BigDecimal.valueOf(row.getCell(6).getNumericCellValue());
                BigDecimal monto_ejecutado = BigDecimal.valueOf(row.getCell(7).getNumericCellValue());
                LocalDateTime fecha_inicio = row.getCell(8).getLocalDateTimeCellValue();
                LocalDateTime fecha_estimada_finalizacion = row.getCell(9).getLocalDateTimeCellValue();
                LocalDateTime fecha_real_finalizacion = row.getCell(10).getLocalDateTimeCellValue();


                String localidad = getStringCellValueSafe(row.getCell(11));
                String barrio = getStringCellValueSafe(row.getCell(12));
                String calle = getStringCellValueSafe(row.getCell(13));
                Integer numero_calle = getIntegerCellValueSafe(row.getCell(14));



                EstadoObra estadoObra = estadoObraService.buscarEstadoObraPorDescripcion(estado_obra)
                        .stream().findFirst().orElseGet(() -> {
                            EstadoObra nuevo = new EstadoObra();
                            nuevo.setDescripcion(estado_obra);
                            return estadoObraService.guardarEstadoObra(nuevo);
                        });

                TipoObra tipoObra = tipoObraService.buscarTipoObraPorDescripcion(tipo_obra)
                        .stream().findFirst().orElseGet(() -> {
                            TipoObra nuevo = new TipoObra();
                            nuevo.setDescripcion(tipo_obra);
                            return tipoObraService.guardarTipoObra(nuevo);
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
                ObraPublica obraPublica = new ObraPublica();
                obraPublica.setNombre(nombre);
                obraPublica.setDescripcion(descripcion);
                obraPublica.setTipo_obra(tipoObra);
                obraPublica.setAvance_fisico(avance_fisico);
                obraPublica.setEstado(estadoObra);
                obraPublica.setFecha_inicio(fecha_inicio);
                obraPublica.setFecha_estimada_finalizacion(fecha_estimada_finalizacion);
                obraPublica.setFecha_real_finalizacion(fecha_real_finalizacion);
                obraPublica.setDireccion(direccionRegistro);
                obraPublica.setMonto_presupuestado(monto_presupuestado);
                obraPublica.setMonto_ejecutado(monto_ejecutado);

                obraPublicaService.guardarObraPublica(obraPublica);

            } catch (Exception e) {
                erroresPorFila.add("Fila " + (row.getRowNum() + 1) + ": " + e.getMessage());
            }
        }

        workbook.close();

        if (!erroresPorFila.isEmpty()) {
            throw new RuntimeException("Errores al procesar el archivo:\n" + String.join("\n", erroresPorFila));
        }
    }



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


    @GetMapping("/buscarObras")
    public List<ObraPublica> buscarObras(
            @RequestParam String fechaInicioDesde,
            @RequestParam String fechaInicioHasta,
            @RequestParam String fechaEstimadaFinDesde,
            @RequestParam String fechaEstimadaFinHasta,
            @RequestParam String fechaRealFinDesde,
            @RequestParam String fechaRealFinHasta,
            @RequestParam(required = false) String tipoObra,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Double avanceFisicoMayor,
            @RequestParam(required = false) Double avanceFisicoMenor,
            @RequestParam(required = false) BigDecimal montoPresupuestadoMayor,
            @RequestParam(required = false) BigDecimal montoPresupuestadoMenor,
            @RequestParam(required = false) BigDecimal montoEjecutadoMayor,
            @RequestParam(required = false) BigDecimal montoEjecutadoMenor,
            @RequestParam(required = false) String localidad,
            @RequestParam(required = false) String barrio
    ) {

        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        LocalDateTime inicioDesde = LocalDateTime.parse(fechaInicioDesde, formatter);
        LocalDateTime inicioHasta = LocalDateTime.parse(fechaInicioHasta, formatter);
        LocalDateTime estimadaDesde = LocalDateTime.parse(fechaEstimadaFinDesde, formatter);
        LocalDateTime estimadaHasta = LocalDateTime.parse(fechaEstimadaFinHasta, formatter);
        LocalDateTime realDesde = LocalDateTime.parse(fechaRealFinDesde, formatter);
        LocalDateTime realHasta = LocalDateTime.parse(fechaRealFinHasta, formatter);

        return obraPublicaService.buscarConFiltros(
                inicioDesde,
                inicioHasta,
                estimadaDesde,
                estimadaHasta,
                realDesde,
                realHasta,
                tipoObra,
                estado,
                avanceFisicoMayor,
                avanceFisicoMenor,
                montoPresupuestadoMayor,
                montoPresupuestadoMenor,
                montoEjecutadoMayor,
                montoEjecutadoMenor,
                localidad,
                barrio
        );
    }


}

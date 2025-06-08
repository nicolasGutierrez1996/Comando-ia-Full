package com.malvinas.comandoia.servicios;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SQLExecutorService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> ejecutarConsulta(String sqlOriginal) {
        System.out.println("📄 SQL recibida:\n" + sqlOriginal);

        String sql = limpiarSQL(sqlOriginal);
        System.out.println("🧾 SQL normalizada: " + sql);

        if (!esConsultaSegura(sql)) {
            System.out.println("⛔ SQL bloqueada por seguridad");
            throw new IllegalArgumentException("Consulta no permitida.");
        }

        return jdbcTemplate.queryForList(sql);
    }

    private String limpiarSQL(String sql) {
        // Eliminamos etiquetas ```sql o ```
        sql = sql.replaceAll("(?i)^```sql", "")
                .replaceAll("(?i)^```", "")
                .replaceAll("(?i)```$", "")
                .trim();

        // Quitamos punto y coma final si lo tiene
        if (sql.endsWith(";")) {
            sql = sql.substring(0, sql.length() - 1).trim();
        }

        return sql;
    }

    private boolean esConsultaSegura(String sql) {
        String sqlLower = sql.toLowerCase().replaceAll("\\s+", " ").trim();

        if (!sqlLower.startsWith("select")) {
            System.out.println("🔒 SQL bloqueada: no comienza con SELECT");
            return false;
        }

        String[] bloqueos = {"insert", "update", "delete", "drop", "truncate", "--", "select into"};
        for (String palabra : bloqueos) {
            if (sqlLower.contains(palabra)) {
                System.out.println("🔒 SQL bloqueada por: " + palabra);
                return false;
            }
        }

        if (sqlLower.matches("(?s).+;\\s*.+")) {
            System.out.println("🔒 SQL bloqueada por múltiples sentencias (;)");
            return false;
        }

        return true;
    }
}
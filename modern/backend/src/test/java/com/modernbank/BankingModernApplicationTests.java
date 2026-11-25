package com.modernbank;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Context wiring smoke test.
 * Uses an in-memory SQLite DB (jdbc:sqlite::memory:) with ddl-auto=create-drop
 * so the full context can be bootstrapped without the production legacybank.db.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite::memory:",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class BankingModernApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring application context wires up without errors
    }
}

package com.modernbank.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    // Base64 of a 32-byte key: "testSecretKeyForJwtSigningTest!!"
    private static final String SECRET = "dGVzdFNlY3JldEtleUZvckp3dFNpZ25pbmdUZXN0ISE=";
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 8);
    }

    @Test
    void generateAndValidate_validToken_returnTrue() {
        String token = jwtService.generateToken(1L, "admin", "Admin User");
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void extractUsername_returnsCorrectUsername() {
        String token = jwtService.generateToken(1L, "admin", "Admin User");
        assertThat(jwtService.extractUsername(token)).isEqualTo("admin");
    }

    @Test
    void isTokenValid_invalidToken_returnsFalse() {
        assertThat(jwtService.isTokenValid("not.a.token")).isFalse();
    }
}

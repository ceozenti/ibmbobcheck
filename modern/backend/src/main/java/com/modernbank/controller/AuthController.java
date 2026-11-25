package com.modernbank.controller;

import com.modernbank.dto.LoginRequest;
import com.modernbank.dto.LoginResponse;
import com.modernbank.entity.Employee;
import com.modernbank.entity.EmployeeStatus;
import com.modernbank.repository.EmployeeRepository;
import com.modernbank.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Employee employee = employeeRepository
                .findByUsernameAndPassword(request.getUsername(), request.getPassword())
                .orElse(null);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Invalid username or password", "status", 401));
        }

        if (employee.getStatus() != EmployeeStatus.ACTIVE) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Account is inactive", "status", 401));
        }

        String token = jwtService.generateToken(
                employee.getEmployeeId(),
                employee.getUsername(),
                employee.getEmployeeName()
        );

        return ResponseEntity.ok(new LoginResponse(
                token,
                employee.getEmployeeId(),
                employee.getEmployeeName(),
                employee.getUsername()
        ));
    }
}

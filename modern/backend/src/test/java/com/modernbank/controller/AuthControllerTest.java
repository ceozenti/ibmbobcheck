package com.modernbank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.modernbank.config.SecurityConfig;
import com.modernbank.dto.LoginRequest;
import com.modernbank.entity.Employee;
import com.modernbank.entity.EmployeeStatus;
import com.modernbank.repository.EmployeeRepository;
import com.modernbank.security.JwtAuthFilter;
import com.modernbank.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmployeeRepository employeeRepository;

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        Employee emp = new Employee();
        emp.setEmployeeId(1L);
        emp.setUsername("admin");
        emp.setPassword("admin123");
        emp.setEmployeeName("Admin User");
        emp.setStatus(EmployeeStatus.ACTIVE);

        when(employeeRepository.findByUsernameAndPassword("admin", "admin123"))
                .thenReturn(Optional.of(emp));
        when(employeeRepository.findByUsername("admin")).thenReturn(Optional.of(emp));

        LoginRequest req = new LoginRequest();
        req.setUsername("admin");
        req.setPassword("admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.employeeName").value("Admin User"));
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        when(employeeRepository.findByUsernameAndPassword("admin", "wrong"))
                .thenReturn(Optional.empty());

        LoginRequest req = new LoginRequest();
        req.setUsername("admin");
        req.setPassword("wrong");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_inactiveEmployee_returns401() throws Exception {
        Employee emp = new Employee();
        emp.setEmployeeId(2L);
        emp.setUsername("inactive");
        emp.setPassword("pass");
        emp.setEmployeeName("Inactive User");
        emp.setStatus(EmployeeStatus.INACTIVE);

        when(employeeRepository.findByUsernameAndPassword("inactive", "pass"))
                .thenReturn(Optional.of(emp));

        LoginRequest req = new LoginRequest();
        req.setUsername("inactive");
        req.setPassword("pass");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }
}

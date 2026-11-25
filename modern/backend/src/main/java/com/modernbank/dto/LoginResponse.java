package com.modernbank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long employeeId;
    private String employeeName;
    private String username;
}

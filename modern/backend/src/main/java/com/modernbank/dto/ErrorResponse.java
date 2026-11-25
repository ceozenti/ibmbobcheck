package com.modernbank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private String error;
    private int status;
    private Map<String, String> fieldErrors;

    public ErrorResponse(String error, int status) {
        this.error = error;
        this.status = status;
        this.fieldErrors = null;
    }
}

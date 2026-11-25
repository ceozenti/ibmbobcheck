package com.modernbank.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomerInfo {
    private Long customerId;
    private String customerName;
    private String email;
    private String phone;
}


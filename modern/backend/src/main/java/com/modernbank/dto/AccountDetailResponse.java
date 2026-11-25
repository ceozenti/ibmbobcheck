package com.modernbank.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountDetailResponse {
    private String accountNumber;
    private String accountType;
    private String status;
    private BigDecimal balance;
    private String createdDate;
    private CustomerInfo customer;
}

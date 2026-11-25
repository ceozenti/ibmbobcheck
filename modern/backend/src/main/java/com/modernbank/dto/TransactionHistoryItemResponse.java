package com.modernbank.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionHistoryItemResponse {
    private Long transactionId;
    private String transactionType;
    private BigDecimal amount;
    private String transactionDate;
    private String referenceNumber;
    private String description;
}

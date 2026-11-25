package com.modernbank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class TransferResponse {
    private String reference;
    private BigDecimal sourceNewBalance;
    private BigDecimal destinationNewBalance;
}

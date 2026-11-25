package com.modernbank.dto;

import lombok.Data;

import java.util.List;

@Data
public class CustomerResponse {
    private Long customerId;
    private String customerName;
    private String email;
    private String phone;
    private String address;
    private String createdDate;
    private List<AccountSummaryResponse> accounts;
}

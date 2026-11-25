package com.modernbank.controller;

import com.modernbank.dto.CustomerResponse;
import com.modernbank.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerService.findById(customerId));
    }

    @GetMapping
    public ResponseEntity<CustomerResponse> getByAccountNumber(@RequestParam String accountNumber) {
        return ResponseEntity.ok(customerService.findByAccountNumber(accountNumber));
    }
}

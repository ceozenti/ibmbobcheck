package com.modernbank.service;

import com.modernbank.dto.AccountSummaryResponse;
import com.modernbank.dto.CustomerResponse;
import com.modernbank.entity.Account;
import com.modernbank.entity.Customer;
import com.modernbank.exception.ResourceNotFoundException;
import com.modernbank.repository.AccountRepository;
import com.modernbank.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final AccountService accountService;

    @Transactional(readOnly = true)
    public CustomerResponse findById(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse findByAccountNumber(String accountNumber) {
        Customer customer = customerRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("No customer found for account: " + accountNumber));
        return toResponse(customer);
    }

    private CustomerResponse toResponse(Customer customer) {
        List<Account> accounts = accountRepository.findByCustomerCustomerId(customer.getCustomerId());
        List<AccountSummaryResponse> accountSummaries = accounts.stream()
                .map(accountService::toSummary)
                .collect(Collectors.toList());

        CustomerResponse resp = new CustomerResponse();
        resp.setCustomerId(customer.getCustomerId());
        resp.setCustomerName(customer.getCustomerName());
        resp.setEmail(customer.getEmail());
        resp.setPhone(customer.getPhone());
        resp.setAddress(customer.getAddress());
        resp.setCreatedDate(customer.getCreatedDate());
        resp.setAccounts(accountSummaries);
        return resp;
    }
}

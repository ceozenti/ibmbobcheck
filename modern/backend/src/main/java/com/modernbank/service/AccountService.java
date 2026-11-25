package com.modernbank.service;

import com.modernbank.dto.AccountDetailResponse;
import com.modernbank.dto.AccountSummaryResponse;
import com.modernbank.dto.CustomerInfo;
import com.modernbank.entity.Account;
import com.modernbank.exception.ResourceNotFoundException;
import com.modernbank.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public AccountDetailResponse findByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));

        AccountDetailResponse resp = new AccountDetailResponse();
        resp.setAccountNumber(account.getAccountNumber());
        resp.setAccountType(account.getAccountType().name());
        resp.setStatus(account.getStatus().name());
        resp.setBalance(account.getBalance());
        resp.setCreatedDate(account.getCreatedDate());

        CustomerInfo ci = new CustomerInfo();
        ci.setCustomerId(account.getCustomer().getCustomerId());
        ci.setCustomerName(account.getCustomer().getCustomerName());
        ci.setEmail(account.getCustomer().getEmail());
        ci.setPhone(account.getCustomer().getPhone());
        resp.setCustomer(ci);

        return resp;
    }

    public AccountSummaryResponse toSummary(Account account) {
        AccountSummaryResponse s = new AccountSummaryResponse();
        s.setAccountNumber(account.getAccountNumber());
        s.setAccountType(account.getAccountType().name());
        s.setStatus(account.getStatus().name());
        s.setBalance(account.getBalance());
        s.setCreatedDate(account.getCreatedDate());
        return s;
    }
}

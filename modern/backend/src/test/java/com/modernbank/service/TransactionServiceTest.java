package com.modernbank.service;

import com.modernbank.dto.DepositRequest;
import com.modernbank.dto.TransactionResponse;
import com.modernbank.dto.TransferRequest;
import com.modernbank.dto.WithdrawalRequest;
import com.modernbank.entity.Account;
import com.modernbank.entity.AccountStatus;
import com.modernbank.entity.AccountType;
import com.modernbank.entity.Transaction;
import com.modernbank.exception.BankingRuleException;
import com.modernbank.exception.ResourceNotFoundException;
import com.modernbank.repository.AccountRepository;
import com.modernbank.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private AccountRepository accountRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private ReferenceService referenceService;

    @InjectMocks
    private TransactionService transactionService;

    private Account activeAccount;
    private Account frozenAccount;

    @BeforeEach
    void setUp() {
        activeAccount = new Account();
        activeAccount.setAccountNumber("1001000001");
        activeAccount.setAccountType(AccountType.SAVINGS);
        activeAccount.setStatus(AccountStatus.ACTIVE);
        activeAccount.setBalance(new BigDecimal("1000.00"));

        frozenAccount = new Account();
        frozenAccount.setAccountNumber("1001000002");
        frozenAccount.setAccountType(AccountType.SAVINGS);
        frozenAccount.setStatus(AccountStatus.FROZEN);
        frozenAccount.setBalance(new BigDecimal("500.00"));
    }

    // --- Deposit tests ---

    @Test
    void deposit_validRequest_updatesBalance() {
        when(accountRepository.findByAccountNumber("1001000001")).thenReturn(Optional.of(activeAccount));
        when(referenceService.next("DEP")).thenReturn("DEP0000000001");
        when(accountRepository.save(any())).thenReturn(activeAccount);
        when(transactionRepository.save(any())).thenReturn(new Transaction());

        DepositRequest req = new DepositRequest();
        req.setAccountNumber("1001000001");
        req.setAmount(new BigDecimal("500.00"));

        TransactionResponse resp = transactionService.deposit(req);

        assertThat(resp.getReference()).isEqualTo("DEP0000000001");
        assertThat(resp.getNewBalance()).isEqualByComparingTo("1500.00");
    }

    @Test
    void deposit_inactiveAccount_throwsBankingRuleException() {
        when(accountRepository.findByAccountNumber("1001000002")).thenReturn(Optional.of(frozenAccount));

        DepositRequest req = new DepositRequest();
        req.setAccountNumber("1001000002");
        req.setAmount(new BigDecimal("100.00"));

        assertThatThrownBy(() -> transactionService.deposit(req))
                .isInstanceOf(BankingRuleException.class)
                .hasMessageContaining("not active");
    }

    @Test
    void deposit_accountNotFound_throwsResourceNotFoundException() {
        when(accountRepository.findByAccountNumber("NOTFOUND")).thenReturn(Optional.empty());

        DepositRequest req = new DepositRequest();
        req.setAccountNumber("NOTFOUND");
        req.setAmount(new BigDecimal("100.00"));

        assertThatThrownBy(() -> transactionService.deposit(req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- Withdrawal tests ---

    @Test
    void withdrawal_validRequest_updatesBalance() {
        when(accountRepository.findByAccountNumber("1001000001")).thenReturn(Optional.of(activeAccount));
        when(referenceService.next("WDR")).thenReturn("WDR0000000001");
        when(accountRepository.save(any())).thenReturn(activeAccount);
        when(transactionRepository.save(any())).thenReturn(new Transaction());

        WithdrawalRequest req = new WithdrawalRequest();
        req.setAccountNumber("1001000001");
        req.setAmount(new BigDecimal("200.00"));

        TransactionResponse resp = transactionService.withdrawal(req);

        assertThat(resp.getReference()).isEqualTo("WDR0000000001");
        assertThat(resp.getNewBalance()).isEqualByComparingTo("800.00");
    }

    @Test
    void withdrawal_insufficientFunds_throwsBankingRuleException() {
        when(accountRepository.findByAccountNumber("1001000001")).thenReturn(Optional.of(activeAccount));

        WithdrawalRequest req = new WithdrawalRequest();
        req.setAccountNumber("1001000001");
        req.setAmount(new BigDecimal("2000.00"));

        assertThatThrownBy(() -> transactionService.withdrawal(req))
                .isInstanceOf(BankingRuleException.class)
                .hasMessageContaining("Insufficient funds");
    }

    // --- Transfer tests ---

    @Test
    void transfer_sameAccount_throwsBankingRuleException() {
        TransferRequest req = new TransferRequest();
        req.setSourceAccount("1001000001");
        req.setDestinationAccount("1001000001");
        req.setAmount(new BigDecimal("100.00"));

        assertThatThrownBy(() -> transactionService.transfer(req))
                .isInstanceOf(BankingRuleException.class)
                .hasMessageContaining("different");
    }

    @Test
    void transfer_destinationFrozen_throwsBankingRuleException() {
        when(accountRepository.findByAccountNumber("1001000001")).thenReturn(Optional.of(activeAccount));
        when(accountRepository.findByAccountNumber("1001000002")).thenReturn(Optional.of(frozenAccount));

        TransferRequest req = new TransferRequest();
        req.setSourceAccount("1001000001");
        req.setDestinationAccount("1001000002");
        req.setAmount(new BigDecimal("100.00"));

        assertThatThrownBy(() -> transactionService.transfer(req))
                .isInstanceOf(BankingRuleException.class)
                .hasMessageContaining("not active");
    }

    @Test
    void transfer_valid_updatesBothBalances() {
        Account dest = new Account();
        dest.setAccountNumber("1001000003");
        dest.setStatus(AccountStatus.ACTIVE);
        dest.setBalance(new BigDecimal("200.00"));
        dest.setAccountType(AccountType.CHECKING);

        when(accountRepository.findByAccountNumber("1001000001")).thenReturn(Optional.of(activeAccount));
        when(accountRepository.findByAccountNumber("1001000003")).thenReturn(Optional.of(dest));
        when(referenceService.next("TRF")).thenReturn("TRF0000000001");
        when(accountRepository.save(any())).thenReturn(activeAccount);
        when(transactionRepository.save(any())).thenReturn(new Transaction());

        TransferRequest req = new TransferRequest();
        req.setSourceAccount("1001000001");
        req.setDestinationAccount("1001000003");
        req.setAmount(new BigDecimal("300.00"));

        var resp = transactionService.transfer(req);

        assertThat(resp.getReference()).isEqualTo("TRF0000000001");
        assertThat(resp.getSourceNewBalance()).isEqualByComparingTo("700.00");
        assertThat(resp.getDestinationNewBalance()).isEqualByComparingTo("500.00");
    }
}

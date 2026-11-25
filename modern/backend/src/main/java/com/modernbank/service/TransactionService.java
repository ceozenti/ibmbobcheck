package com.modernbank.service;

import com.modernbank.dto.*;
import com.modernbank.entity.*;
import com.modernbank.exception.BankingRuleException;
import com.modernbank.exception.ResourceNotFoundException;
import com.modernbank.repository.AccountRepository;
import com.modernbank.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private static final BigDecimal MAX_AMOUNT = new BigDecimal("10000000.00");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final ReferenceService referenceService;

    @Transactional
    public TransactionResponse deposit(DepositRequest request) {
        validateAmount(request.getAmount());

        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.getAccountNumber()));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BankingRuleException("Account is not active");
        }

        String reference = referenceService.next("DEP");
        BigDecimal newBalance = account.getBalance().add(request.getAmount()).setScale(2, RoundingMode.HALF_UP);
        account.setBalance(newBalance);
        accountRepository.save(account);

        Transaction txn = new Transaction();
        txn.setAccount(account);
        txn.setTransactionType(TransactionType.DEPOSIT);
        txn.setAmount(request.getAmount().setScale(2, RoundingMode.HALF_UP));
        txn.setDescription(request.getDescription());
        txn.setReferenceNumber(reference);
        txn.setTransactionDate(LocalDateTime.now().format(DATE_FMT));
        transactionRepository.save(txn);

        return new TransactionResponse(reference, newBalance);
    }

    @Transactional
    public TransactionResponse withdrawal(WithdrawalRequest request) {
        validateAmount(request.getAmount());

        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.getAccountNumber()));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BankingRuleException("Account is not active");
        }

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BankingRuleException("Insufficient funds");
        }

        String reference = referenceService.next("WDR");
        BigDecimal newBalance = account.getBalance().subtract(request.getAmount()).setScale(2, RoundingMode.HALF_UP);
        account.setBalance(newBalance);
        accountRepository.save(account);

        Transaction txn = new Transaction();
        txn.setAccount(account);
        txn.setTransactionType(TransactionType.WITHDRAWAL);
        txn.setAmount(request.getAmount().setScale(2, RoundingMode.HALF_UP));
        txn.setDescription(request.getDescription());
        txn.setReferenceNumber(reference);
        txn.setTransactionDate(LocalDateTime.now().format(DATE_FMT));
        transactionRepository.save(txn);

        return new TransactionResponse(reference, newBalance);
    }

    @Transactional
    public TransferResponse transfer(TransferRequest request) {
        validateAmount(request.getAmount());

        if (request.getSourceAccount().equals(request.getDestinationAccount())) {
            throw new BankingRuleException("Source and destination accounts must be different");
        }

        Account source = accountRepository.findByAccountNumber(request.getSourceAccount())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found: " + request.getSourceAccount()));

        Account destination = accountRepository.findByAccountNumber(request.getDestinationAccount())
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found: " + request.getDestinationAccount()));

        if (source.getStatus() != AccountStatus.ACTIVE) {
            throw new BankingRuleException("Source account is not active");
        }
        if (destination.getStatus() != AccountStatus.ACTIVE) {
            throw new BankingRuleException("Destination account is not active");
        }
        if (source.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BankingRuleException("Insufficient funds");
        }

        String reference = referenceService.next("TRF");
        String now = LocalDateTime.now().format(DATE_FMT);
        BigDecimal amount = request.getAmount().setScale(2, RoundingMode.HALF_UP);

        BigDecimal sourceNewBalance = source.getBalance().subtract(amount).setScale(2, RoundingMode.HALF_UP);
        source.setBalance(sourceNewBalance);
        accountRepository.save(source);

        BigDecimal destNewBalance = destination.getBalance().add(amount).setScale(2, RoundingMode.HALF_UP);
        destination.setBalance(destNewBalance);
        accountRepository.save(destination);

        Transaction debit = new Transaction();
        debit.setAccount(source);
        debit.setTransactionType(TransactionType.TRANSFER_DEBIT);
        debit.setAmount(amount);
        debit.setDescription(request.getDescription());
        debit.setReferenceNumber(reference);
        debit.setTransactionDate(now);
        transactionRepository.save(debit);

        Transaction credit = new Transaction();
        credit.setAccount(destination);
        credit.setTransactionType(TransactionType.TRANSFER_CREDIT);
        credit.setAmount(amount);
        credit.setDescription(request.getDescription());
        credit.setReferenceNumber(reference);
        credit.setTransactionDate(now);
        transactionRepository.save(credit);

        return new TransferResponse(reference, sourceNewBalance, destNewBalance);
    }

    @Transactional(readOnly = true)
    public List<TransactionHistoryItemResponse> getHistory(String accountNumber, String type) {
        // Verify account exists
        accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));

        List<Transaction> transactions;
        if (type != null && !type.isBlank()) {
            TransactionType txType = TransactionType.valueOf(type.toUpperCase());
            transactions = transactionRepository.findByAccountNumberAndTypeOrderByDateDesc(accountNumber, txType);
        } else {
            transactions = transactionRepository.findByAccountNumberOrderByDateDesc(accountNumber);
        }

        return transactions.stream()
                .map(this::toHistoryItem)
                .collect(Collectors.toList());
    }

    private TransactionHistoryItemResponse toHistoryItem(Transaction txn) {
        TransactionHistoryItemResponse item = new TransactionHistoryItemResponse();
        item.setTransactionId(txn.getTransactionId());
        item.setTransactionType(txn.getTransactionType().name());
        item.setAmount(txn.getAmount());
        item.setTransactionDate(txn.getTransactionDate());
        item.setReferenceNumber(txn.getReferenceNumber());
        item.setDescription(txn.getDescription());
        return item;
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BankingRuleException("Amount must be greater than 0");
        }
        if (amount.scale() > 2) {
            throw new BankingRuleException("Amount must have at most 2 decimal places");
        }
        if (amount.compareTo(MAX_AMOUNT) > 0) {
            throw new BankingRuleException("Amount must not exceed 10,000,000");
        }
    }
}

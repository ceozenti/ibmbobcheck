package com.modernbank.repository;

import com.modernbank.entity.Transaction;
import com.modernbank.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.account.accountNumber = :accountNumber ORDER BY t.transactionDate DESC, t.transactionId DESC")
    List<Transaction> findByAccountNumberOrderByDateDesc(@Param("accountNumber") String accountNumber);

    @Query("SELECT t FROM Transaction t WHERE t.account.accountNumber = :accountNumber AND t.transactionType = :type ORDER BY t.transactionDate DESC, t.transactionId DESC")
    List<Transaction> findByAccountNumberAndTypeOrderByDateDesc(@Param("accountNumber") String accountNumber, @Param("type") TransactionType type);
}

package com.modernbank.exception;

public class BankingRuleException extends RuntimeException {

    public BankingRuleException(String message) {
        super(message);
    }
}

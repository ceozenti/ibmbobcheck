package com.modernbank.repository;

import com.modernbank.entity.ReferenceSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface ReferenceSequenceRepository extends JpaRepository<ReferenceSequence, Long> {

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO REFERENCE_SEQUENCE DEFAULT VALUES", nativeQuery = true)
    void insertRow();

    @Query(value = "SELECT last_insert_rowid()", nativeQuery = true)
    Long getLastInsertedId();
}

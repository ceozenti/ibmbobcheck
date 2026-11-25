package com.modernbank.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "REFERENCE_SEQUENCE")
@Getter
public class ReferenceSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REF_ID")
    private Long refId;
}

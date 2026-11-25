package com.modernbank.service;

import com.modernbank.entity.ReferenceSequence;
import com.modernbank.repository.ReferenceSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReferenceService {

    private final ReferenceSequenceRepository referenceSequenceRepository;

    @Transactional
    public String next(String prefix) {
        ReferenceSequence seq = new ReferenceSequence();
        referenceSequenceRepository.save(seq);
        long id = seq.getRefId();
        return prefix + String.format("%010d", id);
    }
}

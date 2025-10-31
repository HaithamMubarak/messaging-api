package com.hmdev.messaging.service.repo;

import com.hmdev.messaging.service.data.model.Developer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DeveloperRepository extends JpaRepository<Developer, Long> {
    Optional<Developer> findByEmail(String email);
}


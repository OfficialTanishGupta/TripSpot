package com.tripspot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripspot.model.WebAuthnCredential;

public interface WebAuthnCredentialRepository extends JpaRepository<WebAuthnCredential, String> {
    Optional<WebAuthnCredential> findByCredentialId(String credentialId);
    List<WebAuthnCredential> findByUserId(String userId);
}

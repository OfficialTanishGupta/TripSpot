package com.tripspot.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "webauthn_credential")
public class WebAuthnCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Breaks the User -> credentials -> user -> credentials... cycle that Jackson
    // was walking infinitely (StackOverflowError) whenever a Booking or User got
    // serialized for a user who had a registered fingerprint.
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 1024)
    private String credentialId;

    @Lob
    @Column(nullable = false)
    private String publicKeyCose;

    private long signatureCount;

    private String deviceLabel;

    public WebAuthnCredential() {}

    public String getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCredentialId() { return credentialId; }
    public void setCredentialId(String credentialId) { this.credentialId = credentialId; }
    public String getPublicKeyCose() { return publicKeyCose; }
    public void setPublicKeyCose(String publicKeyCose) { this.publicKeyCose = publicKeyCose; }
    public long getSignatureCount() { return signatureCount; }
    public void setSignatureCount(long signatureCount) { this.signatureCount = signatureCount; }
    public String getDeviceLabel() { return deviceLabel; }
    public void setDeviceLabel(String deviceLabel) { this.deviceLabel = deviceLabel; }
}
package com.tripspot.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;
    private String phone;

    private String preferredMode;
    private String seatPreference;
    private String homeCity;

    @JsonIgnore
    private String passwordHash;

    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WebAuthnCredential> credentials = new ArrayList<>();

    public User() {}

    public User(String email, String fullName) {
        this.email = email;
        this.fullName = fullName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPreferredMode() { return preferredMode; }
    public void setPreferredMode(String preferredMode) { this.preferredMode = preferredMode; }
    public String getSeatPreference() { return seatPreference; }
    public void setSeatPreference(String seatPreference) { this.seatPreference = seatPreference; }
    public String getHomeCity() { return homeCity; }
    public void setHomeCity(String homeCity) { this.homeCity = homeCity; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Instant getCreatedAt() { return createdAt; }
    public List<WebAuthnCredential> getCredentials() { return credentials; }
}
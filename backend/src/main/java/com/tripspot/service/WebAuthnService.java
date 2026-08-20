package com.tripspot.service;

import com.webauthn4j.WebAuthnManager;
import com.webauthn4j.authenticator.Authenticator;
import com.webauthn4j.authenticator.AuthenticatorImpl;
import com.webauthn4j.converter.util.ObjectConverter;
import com.webauthn4j.data.*;
import com.webauthn4j.data.client.Origin;
import com.webauthn4j.data.client.challenge.Challenge;
import com.webauthn4j.data.client.challenge.DefaultChallenge;
import com.webauthn4j.server.ServerProperty;
import com.tripspot.model.User;
import com.tripspot.model.WebAuthnCredential;
import com.tripspot.repository.UserRepository;
import com.tripspot.repository.WebAuthnCredentialRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handles the two WebAuthn ceremonies (registration + authentication) that
 * power fingerprint / Face ID / Windows Hello login. Challenges are kept
 * in-memory keyed by email for simplicity - swap for Redis in production.
 */
@Service
public class WebAuthnService {

    @Value("${tripspot.webauthn.rp-id:localhost}")
    private String rpId;

    @Value("${tripspot.webauthn.rp-name:TripSpot}")
    private String rpName;

    @Value("${tripspot.webauthn.origin:http://localhost:5173}")
    private String origin;

    private final ObjectConverter objectConverter = new ObjectConverter();
    private final WebAuthnManager webAuthnManager = WebAuthnManager.createNonStrictWebAuthnManager();
    private final Map<String, Challenge> pendingChallenges = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final WebAuthnCredentialRepository credentialRepository;

    public WebAuthnService(UserRepository userRepository, WebAuthnCredentialRepository credentialRepository) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
    }

    public Map<String, Object> startRegistration(User user) {
        Challenge challenge = new DefaultChallenge(randomBytes(32));
        pendingChallenges.put(user.getEmail(), challenge);

        return Map.of(
                "rp", Map.of("id", rpId, "name", rpName),
                "user", Map.of(
                        "id", Base64.getUrlEncoder().withoutPadding().encodeToString(user.getId().getBytes()),
                        "name", user.getEmail(),
                        "displayName", user.getFullName() == null ? user.getEmail() : user.getFullName()
                ),
                "challenge", Base64.getUrlEncoder().withoutPadding().encodeToString(challenge.getValue()),
                "pubKeyCredParams", new Object[]{
                        Map.of("type", "public-key", "alg", -7),
                        Map.of("type", "public-key", "alg", -257)
                },
                "authenticatorSelection", Map.of(
                        "authenticatorAttachment", "platform",
                        "userVerification", "required"
                ),
                "timeout", 60000
        );
    }

    public void finishRegistration(User user, byte[] attestationObject, byte[] clientDataJSON, String deviceLabel) {
        Challenge expected = pendingChallenges.remove(user.getEmail());
        ServerProperty serverProperty = new ServerProperty(new Origin(origin), rpId, expected, null);

        RegistrationRequest registrationRequest = new RegistrationRequest(attestationObject, clientDataJSON);
        RegistrationParameters registrationParameters = new RegistrationParameters(serverProperty, null, false, true);

        RegistrationData registrationData = webAuthnManager.parse(registrationRequest);
        webAuthnManager.validate(registrationData, registrationParameters);

        var attestedCredentialData = registrationData.getAttestationObject().getAuthenticatorData().getAttestedCredentialData();
        String credentialId = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(attestedCredentialData.getCredentialId());
        String publicKeyCose = Base64.getEncoder().encodeToString(
                objectConverter.getCborConverter().writeValueAsBytes(attestedCredentialData.getCOSEKey())
        );

        WebAuthnCredential cred = new WebAuthnCredential();
        cred.setUser(user);
        cred.setCredentialId(credentialId);
        cred.setPublicKeyCose(publicKeyCose);
        cred.setSignatureCount(registrationData.getAttestationObject().getAuthenticatorData().getSignCount());
        cred.setDeviceLabel(deviceLabel == null ? "Registered device" : deviceLabel);
        credentialRepository.save(cred);
    }

    public Map<String, Object> startLogin(String email) {
        Challenge challenge = new DefaultChallenge(randomBytes(32));
        pendingChallenges.put(email, challenge);

        return Map.of(
                "challenge", Base64.getUrlEncoder().withoutPadding().encodeToString(challenge.getValue()),
                "rpId", rpId,
                "userVerification", "required",
                "timeout", 60000
        );
    }

    public User finishLogin(String email, String credentialId, byte[] authenticatorData,
                             byte[] clientDataJSON, byte[] signature) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Unknown user"));

        WebAuthnCredential storedCred = credentialRepository.findByCredentialId(credentialId)
                .orElseThrow(() -> new IllegalArgumentException("Credential not recognized"));

        Challenge expected = pendingChallenges.remove(email);
        ServerProperty serverProperty = new ServerProperty(new Origin(origin), rpId, expected, null);

        var coseKey = objectConverter.getCborConverter()
                .readValue(Base64.getDecoder().decode(storedCred.getPublicKeyCose()),
                        com.webauthn4j.data.attestation.authenticator.COSEKey.class);

        Authenticator authenticator = new AuthenticatorImpl(
                new com.webauthn4j.data.attestation.authenticator.AttestedCredentialData(
                        null, Base64.getUrlDecoder().decode(credentialId), coseKey),
                null,
                storedCred.getSignatureCount()
        );

        AuthenticationRequest authenticationRequest = new AuthenticationRequest(
                Base64.getUrlDecoder().decode(credentialId), authenticatorData, clientDataJSON, signature);
        AuthenticationParameters authenticationParameters = new AuthenticationParameters(
                serverProperty, authenticator, null, false, true);

        AuthenticationData authenticationData = webAuthnManager.parse(authenticationRequest);
        webAuthnManager.validate(authenticationData, authenticationParameters);

        storedCred.setSignatureCount(authenticationData.getAuthenticatorData().getSignCount());
        credentialRepository.save(storedCred);

        return user;
    }

    private byte[] randomBytes(int len) {
        byte[] b = new byte[len];
        new SecureRandom().nextBytes(b);
        return b;
    }
}

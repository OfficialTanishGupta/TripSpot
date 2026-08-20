package com.tripspot.controller;

import com.tripspot.model.User;
import com.tripspot.repository.UserRepository;
import com.tripspot.service.JwtService;
import com.tripspot.service.WebAuthnService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final WebAuthnService webAuthnService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, WebAuthnService webAuthnService,
                           JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.webAuthnService = webAuthnService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public record SignupRequest(String email, String fullName, String password) {}

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        if (userRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        User user = new User(req.email(), req.fullName());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        userRepository.save(user);
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "userId", user.getId()));
    }

    public record LoginRequest(String email, String password) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.email()).orElse(null);
        if (user == null || user.getPasswordHash() == null
                || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "userId", user.getId()));
    }

    @PostMapping("/webauthn/register/options")
    public ResponseEntity<?> webAuthnRegisterOptions(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Sign up with email/password first, then attach a fingerprint"));
        }
        return ResponseEntity.ok(webAuthnService.startRegistration(user));
    }

    public record WebAuthnRegisterVerifyRequest(String email, String attestationObject, String clientDataJSON, String deviceLabel) {}

    @PostMapping("/webauthn/register/verify")
    public ResponseEntity<?> webAuthnRegisterVerify(@RequestBody WebAuthnRegisterVerifyRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Unknown user"));
        webAuthnService.finishRegistration(
                user,
                Base64.getUrlDecoder().decode(req.attestationObject()),
                Base64.getUrlDecoder().decode(req.clientDataJSON()),
                req.deviceLabel()
        );
        return ResponseEntity.ok(Map.of("status", "registered"));
    }

    @PostMapping("/webauthn/login/options")
    public ResponseEntity<?> webAuthnLoginOptions(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(webAuthnService.startLogin(body.get("email")));
    }

    public record WebAuthnLoginVerifyRequest(
            String email, String credentialId, String authenticatorData, String clientDataJSON, String signature) {}

    @PostMapping("/webauthn/login/verify")
    public ResponseEntity<?> webAuthnLoginVerify(@RequestBody WebAuthnLoginVerifyRequest req) {
        User user = webAuthnService.finishLogin(
                req.email(),
                req.credentialId(),
                Base64.getUrlDecoder().decode(req.authenticatorData()),
                Base64.getUrlDecoder().decode(req.clientDataJSON()),
                Base64.getUrlDecoder().decode(req.signature())
        );
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "userId", user.getId()));
    }
}

package com.tripspot.controller;

import com.tripspot.dto.MlDtos.PersonaResponsePayload;
import com.tripspot.model.Booking;
import com.tripspot.model.SavedPassenger;
import com.tripspot.model.User;
import com.tripspot.repository.BookingRepository;
import com.tripspot.repository.SavedPassengerRepository;
import com.tripspot.repository.UserRepository;
import com.tripspot.repository.WebAuthnCredentialRepository;
import com.tripspot.service.MlServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final MlServiceClient mlServiceClient;
    private final WebAuthnCredentialRepository webAuthnCredentialRepository;
    private final SavedPassengerRepository savedPassengerRepository;

    public UserController(UserRepository userRepository, BookingRepository bookingRepository,
                           MlServiceClient mlServiceClient, WebAuthnCredentialRepository webAuthnCredentialRepository,
                           SavedPassengerRepository savedPassengerRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.mlServiceClient = mlServiceClient;
        this.webAuthnCredentialRepository = webAuthnCredentialRepository;
        this.savedPassengerRepository = savedPassengerRepository;
    }

    @GetMapping
    public User me(Authentication auth) {
        return userRepository.findById((String) auth.getPrincipal()).orElseThrow();
    }

    public record PreferencesRequest(String preferredMode, String seatPreference, String homeCity, String phone) {}

    @PutMapping("/preferences")
    public User updatePreferences(Authentication auth, @RequestBody PreferencesRequest req) {
        User user = userRepository.findById((String) auth.getPrincipal()).orElseThrow();
        user.setPreferredMode(req.preferredMode());
        user.setSeatPreference(req.seatPreference());
        user.setHomeCity(req.homeCity());
        user.setPhone(req.phone());
        return userRepository.save(user);
    }

    /** Surfaces the ML persona model's read on this user - powers the frontend's "AI Traveler Insight" card. */
    @GetMapping("/persona")
    public ResponseEntity<?> persona(Authentication auth) {
        List<Booking> history = bookingRepository.findByUserIdOrderByBookedAtDesc((String) auth.getPrincipal());
        PersonaResponsePayload result = mlServiceClient.persona(history);
        if (result == null) {
            return ResponseEntity.status(503).body(Map.of("error", "ML service unavailable"));
        }
        return ResponseEntity.ok(result);
    }

    public record PassengerDto(String name, Integer age, String type) {}
    public record PassengerProfileResponse(boolean hasFingerprint, String email, String phone, List<PassengerDto> passengers) {}

    /** Booking page calls this to decide: show "use fingerprint" prompt, or go straight to a blank form. */
    @GetMapping("/passenger-profile")
    public PassengerProfileResponse passengerProfile(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow();
        boolean hasFingerprint = !webAuthnCredentialRepository.findByUserId(userId).isEmpty();
        List<PassengerDto> passengers = savedPassengerRepository.findByUserIdOrderBySortOrderAsc(userId)
                .stream()
                .map(p -> new PassengerDto(p.getName(), p.getAge(), p.getType()))
                .collect(Collectors.toList());
        return new PassengerProfileResponse(hasFingerprint, user.getEmail(), user.getPhone(), passengers);
    }

    public record SavePassengerProfileRequest(String phone, List<PassengerDto> passengers) {}

    /** Called after a successful booking (with consent) so next time's form can be autofilled via fingerprint. */
    @Transactional
    @PutMapping("/passenger-profile")
    public PassengerProfileResponse savePassengerProfile(Authentication auth, @RequestBody SavePassengerProfileRequest req) {
        String userId = (String) auth.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow();
        if (req.phone() != null && !req.phone().isBlank()) {
            user.setPhone(req.phone());
            userRepository.save(user);
        }

        savedPassengerRepository.deleteByUserId(userId);
        int order = 0;
        for (PassengerDto p : req.passengers()) {
            SavedPassenger saved = new SavedPassenger();
            saved.setUser(user);
            saved.setName(p.name());
            saved.setAge(p.age() == null ? 0 : p.age());
            saved.setType(p.type());
            saved.setSortOrder(order++);
            savedPassengerRepository.save(saved);
        }

        return passengerProfile(auth);
    }
}
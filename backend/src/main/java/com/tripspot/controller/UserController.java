package com.tripspot.controller;

import com.tripspot.dto.MlDtos.PersonaResponsePayload;
import com.tripspot.model.Booking;
import com.tripspot.model.User;
import com.tripspot.repository.BookingRepository;
import com.tripspot.repository.UserRepository;
import com.tripspot.service.MlServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final MlServiceClient mlServiceClient;

    public UserController(UserRepository userRepository, BookingRepository bookingRepository,
                           MlServiceClient mlServiceClient) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.mlServiceClient = mlServiceClient;
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
}

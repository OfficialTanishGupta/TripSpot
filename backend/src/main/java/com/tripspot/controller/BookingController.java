package com.tripspot.controller;

import com.tripspot.model.Booking;
import com.tripspot.model.TransportMode;
import com.tripspot.model.User;
import com.tripspot.repository.BookingRepository;
import com.tripspot.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingController(BookingRepository bookingRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public record CreateBookingRequest(
            TransportMode mode, String providerName, String origin, String destination,
            String departureTime, double price, Integer adults, Integer children,
            Boolean isWeekend, Integer advanceDays, Double cheapestAvailablePrice, String status) {}

    @PostMapping
    public Booking create(Authentication auth, @RequestBody CreateBookingRequest req) {
        User user = currentUser(auth);
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setMode(req.mode());
        booking.setProviderName(req.providerName());
        booking.setOrigin(req.origin());
        booking.setDestination(req.destination());
        booking.setDepartureTime(req.departureTime());
        booking.setPrice(req.price());
        if (req.adults() != null) booking.setAdults(req.adults());
        if (req.children() != null) booking.setChildren(req.children());
        if (req.isWeekend() != null) booking.setWeekend(req.isWeekend());
        if (req.advanceDays() != null) booking.setAdvanceDays(req.advanceDays());
        booking.setCheapestAvailablePrice(req.cheapestAvailablePrice());
        if (req.status() != null && !req.status().isBlank()) booking.setStatus(req.status());
        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}/status")
    public Booking updateStatus(Authentication auth, @PathVariable String id, @RequestBody StatusUpdate body) {
        Booking booking = bookingRepository.findById(id).orElseThrow();
        if (!booking.getUser().getId().equals(currentUser(auth).getId())) {
            throw new SecurityException("Not your booking");
        }
        booking.setStatus(body.status());
        return bookingRepository.save(booking);
    }

    public record StatusUpdate(String status) {}

    @GetMapping
    public List<Booking> myBookings(Authentication auth) {
        User user = currentUser(auth);
        return bookingRepository.findByUserIdOrderByBookedAtDesc(user.getId());
    }

    @DeleteMapping("/{id}")
    public void cancel(Authentication auth, @PathVariable String id) {
        Booking booking = bookingRepository.findById(id).orElseThrow();
        if (!booking.getUser().getId().equals(currentUser(auth).getId())) {
            throw new SecurityException("Not your booking");
        }
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    private User currentUser(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return userRepository.findById(userId).orElseThrow();
    }
}
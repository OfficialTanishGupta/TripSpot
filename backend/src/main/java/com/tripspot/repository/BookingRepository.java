package com.tripspot.repository;

import com.tripspot.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserIdOrderByBookedAtDesc(String userId);
}

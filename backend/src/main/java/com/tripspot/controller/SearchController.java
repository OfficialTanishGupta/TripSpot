package com.tripspot.controller;

import com.tripspot.dto.MlDtos.RerankResponsePayload;
import com.tripspot.dto.SearchRequest;
import com.tripspot.dto.TripOption;
import com.tripspot.model.Booking;
import com.tripspot.repository.BookingRepository;
import com.tripspot.service.AggregatorService;
import com.tripspot.service.MlServiceClient;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final AggregatorService aggregatorService;
    private final MlServiceClient mlServiceClient;
    private final BookingRepository bookingRepository;

    public SearchController(AggregatorService aggregatorService, MlServiceClient mlServiceClient,
                             BookingRepository bookingRepository) {
        this.aggregatorService = aggregatorService;
        this.mlServiceClient = mlServiceClient;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public List<TripOption> search(Authentication auth, @Valid @RequestBody SearchRequest request) {
        // /api/search is public (permitAll). Spring Security still populates
        // `auth` even for unauthenticated requests - it's an anonymous token
        // with principal "anonymousUser" (Spring's default), not null. A real
        // signed-in user has their actual user ID as the principal instead
        // (set by JwtAuthFilter when a valid Bearer token is present).
        if (auth == null || "anonymousUser".equals(auth.getPrincipal())) {
            return aggregatorService.compare(request);
        }

        // Collect options exactly ONCE - the same TripOption objects (and their
        // random IDs) are used both for the ML request and the final response.
        List<TripOption> options = aggregatorService.collectAndBadge(request);

        String userId = (String) auth.getPrincipal();
        List<Booking> history = bookingRepository.findByUserIdOrderByBookedAtDesc(userId);
        boolean isWeekend = isWeekendDate(request.getTravelDate());

        RerankResponsePayload mlResponse = mlServiceClient.rerank(
                history, request.getAdults(), request.getChildren(), isWeekend, options);

        return aggregatorService.applyPersonalization(options, mlResponse);
    }

    private boolean isWeekendDate(String isoDate) {
        try {
            DayOfWeek d = LocalDate.parse(isoDate).getDayOfWeek();
            return d == DayOfWeek.SATURDAY || d == DayOfWeek.SUNDAY;
        } catch (Exception e) {
            return false;
        }
    }
}

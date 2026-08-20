package com.tripspot.service;

import com.tripspot.dto.MlDtos.*;
import com.tripspot.dto.TripOption;
import com.tripspot.model.Booking;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Talks to the Python ML service (persona clustering + XGBoost ranking).
 * Every call is wrapped so a slow/unreachable ML service degrades to the
 * plain price-sorted fare board instead of breaking search - the model is a
 * personalization layer on top of a working product, never a hard dependency.
 */
@Service
public class MlServiceClient {

    @Value("${tripspot.ml.service-url:http://localhost:8000}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public RerankResponsePayload rerank(List<Booking> history, int currentAdults, int currentChildren,
                                         boolean currentIsWeekend, List<TripOption> options) {
        try {
            List<TripEventPayload> trips = history.stream().map(this::toTripEvent).collect(Collectors.toList());
            CurrentPartyPayload party = new CurrentPartyPayload(currentAdults, currentChildren, currentIsWeekend, null);

            List<CandidateOptionPayload> candidates = options.stream()
                    .map(o -> new CandidateOptionPayload(
                            o.getId(), o.getMode().name(), o.getProviderName(), o.getPrice(), o.getRating(), 2))
                    .collect(Collectors.toList());

            RerankRequestPayload req = new RerankRequestPayload(trips, party, candidates);
            return restTemplate.postForObject(mlServiceUrl + "/rerank", req, RerankResponsePayload.class);
        } catch (RestClientException e) {
            return null; // caller falls back to price-sorted results
        }
    }

    public PersonaResponsePayload persona(List<Booking> history) {
        try {
            List<TripEventPayload> trips = history.stream().map(this::toTripEvent).collect(Collectors.toList());
            PersonaRequestPayload req = new PersonaRequestPayload(trips);
            return restTemplate.postForObject(mlServiceUrl + "/persona", req, PersonaResponsePayload.class);
        } catch (RestClientException e) {
            return null;
        }
    }

    private TripEventPayload toTripEvent(Booking b) {
        long daysAgo = Duration.between(b.getBookedAt(), Instant.now()).toDays();
        return new TripEventPayload(
                b.getMode().name(), b.getAdults(), b.getChildren(), b.isWeekend(),
                b.getAdvanceDays(), b.getPrice(), b.getCheapestAvailablePrice(), (int) Math.max(daysAgo, 0)
        );
    }
}

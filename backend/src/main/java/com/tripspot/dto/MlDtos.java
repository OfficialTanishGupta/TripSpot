package com.tripspot.dto;

import java.util.List;

public class MlDtos {

    public record TripEventPayload(
            String mode, int adults, int children, boolean isWeekend,
            int advanceDays, double price, Double cheapestAvailablePrice, int daysAgo) {}

    public record CurrentPartyPayload(int adults, int children, Boolean isWeekend, Integer advanceDays) {}

    public record CandidateOptionPayload(
            String id, String mode, String providerName, double price, double rating, int durationRank) {}

    public record RerankRequestPayload(
            List<TripEventPayload> trips, CurrentPartyPayload currentParty, List<CandidateOptionPayload> options) {}

    public record RankedOptionPayload(String id, double personalizedScore, String reason) {}

    public record RerankResponsePayload(String persona, List<String> rankedOptionIds, List<RankedOptionPayload> scored) {}

    public record PersonaRequestPayload(List<TripEventPayload> trips) {}

    public record PersonaResponsePayload(
            String persona, double confidence, boolean isNewTraveler, Object features, String insight) {}
}

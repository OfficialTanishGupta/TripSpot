package com.tripspot.service;

import com.tripspot.dto.MlDtos.RankedOptionPayload;
import com.tripspot.dto.MlDtos.RerankResponsePayload;
import com.tripspot.dto.SearchRequest;
import com.tripspot.dto.TripOption;
import com.tripspot.model.TransportMode;
import com.tripspot.provider.TransportProvider;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AggregatorService {

    private final List<TransportProvider> providers;

    public AggregatorService(List<TransportProvider> providers) {
        this.providers = providers;
    }

    /** Plain price-sorted comparison - the anonymous-user path. */
    public List<TripOption> compare(SearchRequest request) {
        List<TripOption> all = collectAndBadge(request);
        all.sort(Comparator.comparingDouble(TripOption::getPrice));
        return all;
    }

    /**
     * Collects fresh options from every provider exactly once and badges them.
     * IMPORTANT: providers assign a random UUID per option on every call, so
     * this must only be called ONCE per request - the same list of TripOption
     * objects is then both sent to the ML service (for scoring) and returned
     * to the client (after personalization is merged in). Calling collect
     * twice would generate two different sets of IDs and silently break the
     * score-matching in applyPersonalization().
     */
    public List<TripOption> collectAndBadge(SearchRequest request) {
        List<TripOption> all = providers.stream()
                .filter(p -> request.getPreferredMode() == null
                        || request.getPreferredMode().isBlank()
                        || p.getMode() == TransportMode.valueOf(request.getPreferredMode().toUpperCase()))
                .flatMap(p -> p.search(request).stream())
                .collect(Collectors.toList());
        applyBadges(all);
        return all;
    }

    /**
     * Merges an ML rerank response into an already-collected option list (the
     * exact same objects that were sent to the ML service) and re-sorts by
     * personalized score. Falls back to price sort if the ML service didn't
     * return anything usable, so the page never breaks.
     */
    public List<TripOption> applyPersonalization(List<TripOption> options, RerankResponsePayload mlResponse) {
        if (mlResponse == null || mlResponse.scored() == null || mlResponse.scored().isEmpty()) {
            options.sort(Comparator.comparingDouble(TripOption::getPrice));
            return options;
        }

        Map<String, RankedOptionPayload> scoreById = new HashMap<>();
        for (RankedOptionPayload r : mlResponse.scored()) {
            scoreById.put(r.id(), r);
        }

        for (TripOption opt : options) {
            RankedOptionPayload scored = scoreById.get(opt.getId());
            if (scored != null) {
                opt.setPersonalizedScore(scored.personalizedScore());
                opt.setPersonalizedReason(scored.reason());
            }
        }

        options.sort((a, b) -> {
            Double sa = a.getPersonalizedScore();
            Double sb = b.getPersonalizedScore();
            if (sa == null && sb == null) return Double.compare(a.getPrice(), b.getPrice());
            if (sa == null) return 1;
            if (sb == null) return -1;
            return Double.compare(sb, sa);
        });

        return options;
    }

    private void applyBadges(List<TripOption> options) {
        if (options.isEmpty()) return;

        options.stream()
                .min(Comparator.comparingDouble(TripOption::getPrice))
                .ifPresent(o -> o.setBadge("Cheapest"));

        options.stream()
                .min(Comparator.comparing(o -> durationMinutes(o.getDurationLabel())))
                .ifPresent(o -> {
                    if (o.getBadge() == null) o.setBadge("Fastest");
                    else o.setBadge(o.getBadge() + " & Fastest");
                });

        options.stream()
                .max(Comparator.comparingDouble(TripOption::getRating))
                .ifPresent(o -> {
                    if (o.getBadge() == null) o.setBadge("Top Rated");
                });
    }

    private int durationMinutes(String label) {
        try {
            String[] parts = label.replace("h", "").replace("m", "").trim().split(" ");
            int h = Integer.parseInt(parts[0]);
            int m = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
            return h * 60 + m;
        } catch (Exception e) {
            return Integer.MAX_VALUE;
        }
    }
}

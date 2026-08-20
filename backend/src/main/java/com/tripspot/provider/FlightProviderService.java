package com.tripspot.provider;

import com.tripspot.dto.SearchRequest;
import com.tripspot.dto.TripOption;
import com.tripspot.model.TransportMode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class FlightProviderService implements TransportProvider {

    private static final String[] AIRLINES = {"IndiGo", "Air India", "Vistara", "SpiceJet"};
    private static final double PER_KM_RATE = 6.5;
    private static final double BASE_FARE = 1200;

    @Value("${tripspot.flights.api-key:}")
    private String apiKey;

    @Override
    public TransportMode getMode() { return TransportMode.FLIGHT; }

    @Override
    public String getProviderName() { return apiKey.isBlank() ? "Flight Aggregator (mock)" : "Flight Aggregator (live)"; }

    @Override
    public List<TripOption> search(SearchRequest request) {
        if (!apiKey.isBlank()) {
            try {
                return callRealApi(request);
            } catch (Exception e) {
                return mockSearch(request);
            }
        }
        return mockSearch(request);
    }

    private List<TripOption> callRealApi(SearchRequest request) {
        throw new UnsupportedOperationException("Real flight API not yet configured");
    }

    private List<TripOption> mockSearch(SearchRequest request) {
        int distanceKm = MockPricingUtil.estimateDistanceKm(request.getOrigin(), request.getDestination());
        if (distanceKm < 150) {
            return List.of();
        }
        double basePrice = BASE_FARE + distanceKm * PER_KM_RATE;

        List<TripOption> options = new ArrayList<>();
        for (String airline : AIRLINES) {
            long seed = MockPricingUtil.seedFor(request.getOrigin(), request.getDestination(), request.getTravelDate(), airline);
            double price = MockPricingUtil.jitterPrice(basePrice, seed, 0.22);
            LocalTime dep = MockPricingUtil.randomDepartureTime(seed);
            double avgSpeedKmh = 750;
            long flightMinutes = (long) (distanceKm / avgSpeedKmh * 60) + 40;
            LocalTime arr = dep.plusMinutes(flightMinutes);
            double rating = MockPricingUtil.randomRating(seed, 3.6, 4.7);

            TripOption opt = new TripOption(
                    UUID.randomUUID().toString(), TransportMode.FLIGHT, airline,
                    request.getOrigin(), request.getDestination(),
                    dep.toString(), arr.toString(),
                    (flightMinutes / 60) + "h " + (flightMinutes % 60) + "m", price, rating
            );
            options.add(opt);
        }
        return options;
    }
}

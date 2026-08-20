package com.tripspot.provider;

import com.tripspot.dto.SearchRequest;
import com.tripspot.dto.TripOption;
import com.tripspot.model.TransportMode;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class BusProviderService implements TransportProvider {

    private static final String[] OPERATORS = {"VRL Travels", "SRS Travels", "Orange Tours", "Zing Bus"};
    private static final double PER_KM_RATE = 1.6;

    @Override
    public TransportMode getMode() { return TransportMode.BUS; }

    @Override
    public String getProviderName() { return "Bus Aggregator (mock)"; }

    @Override
    public List<TripOption> search(SearchRequest request) {
        int distanceKm = MockPricingUtil.estimateDistanceKm(request.getOrigin(), request.getDestination());
        double basePrice = 100 + distanceKm * PER_KM_RATE;

        List<TripOption> options = new ArrayList<>();
        for (String operator : OPERATORS) {
            long seed = MockPricingUtil.seedFor(request.getOrigin(), request.getDestination(), request.getTravelDate(), operator);
            double price = MockPricingUtil.jitterPrice(basePrice, seed, 0.15);
            LocalTime dep = MockPricingUtil.randomDepartureTime(seed);
            double avgSpeedKmh = 50;
            LocalTime arr = dep.plusMinutes((long) (distanceKm / avgSpeedKmh * 60));
            double rating = MockPricingUtil.randomRating(seed, 3.3, 4.5);

            TripOption opt = new TripOption(
                    UUID.randomUUID().toString(), TransportMode.BUS, operator,
                    request.getOrigin(), request.getDestination(),
                    dep.toString(), arr.toString(),
                    approxDuration(distanceKm, avgSpeedKmh), price, rating
            );
            options.add(opt);
        }
        return options;
    }

    private String approxDuration(int km, double speed) {
        double hours = km / speed;
        int h = (int) hours;
        int m = (int) ((hours - h) * 60);
        return h + "h " + m + "m";
    }
}

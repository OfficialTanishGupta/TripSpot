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
public class CabProviderService implements TransportProvider {

    private static final String[] OPERATORS = {"Ola", "Uber", "Rapido Cabs"};
    private static final double PER_KM_RATE = 14.0;
    private static final double BASE_FARE = 60.0;

    @Override
    public TransportMode getMode() { return TransportMode.CAB; }

    @Override
    public String getProviderName() { return "Cab Aggregator (mock)"; }

    @Override
    public List<TripOption> search(SearchRequest request) {
        int distanceKm = MockPricingUtil.estimateDistanceKm(request.getOrigin(), request.getDestination());
        int effectiveKm = Math.min(distanceKm, 400);
        double basePrice = BASE_FARE + effectiveKm * PER_KM_RATE;

        List<TripOption> options = new ArrayList<>();
        for (String operator : OPERATORS) {
            long seed = MockPricingUtil.seedFor(request.getOrigin(), request.getDestination(), request.getTravelDate(), operator);
            double price = MockPricingUtil.jitterPrice(basePrice, seed, 0.18);
            LocalTime dep = MockPricingUtil.randomDepartureTime(seed);
            LocalTime arr = dep.plusMinutes((long) (effectiveKm / 40.0 * 60));
            double rating = MockPricingUtil.randomRating(seed, 3.8, 4.9);

            TripOption opt = new TripOption(
                    UUID.randomUUID().toString(), TransportMode.CAB, operator,
                    request.getOrigin(), request.getDestination(),
                    dep.toString(), arr.toString(),
                    approxDuration(effectiveKm), price, rating
            );
            options.add(opt);
        }
        return options;
    }

    private String approxDuration(int km) {
        double hours = km / 40.0;
        int h = (int) hours;
        int m = (int) ((hours - h) * 60);
        return h + "h " + m + "m";
    }
}

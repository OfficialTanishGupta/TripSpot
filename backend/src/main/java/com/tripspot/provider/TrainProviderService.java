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
public class TrainProviderService implements TransportProvider {

    private static final String[] CLASSES = {"Sleeper (SL)", "AC 3-Tier (3A)", "AC 2-Tier (2A)", "Chair Car (CC)"};
    private static final double[] RATE_PER_KM = {0.5, 1.4, 2.1, 1.1};

    @Override
    public TransportMode getMode() { return TransportMode.TRAIN; }

    @Override
    public String getProviderName() { return "IRCTC-style (mock)"; }

    @Override
    public List<TripOption> search(SearchRequest request) {
        int distanceKm = MockPricingUtil.estimateDistanceKm(request.getOrigin(), request.getDestination());
        List<TripOption> options = new ArrayList<>();

        for (int i = 0; i < CLASSES.length; i++) {
            long seed = MockPricingUtil.seedFor(request.getOrigin(), request.getDestination(), request.getTravelDate(), CLASSES[i]);
            double basePrice = 50 + distanceKm * RATE_PER_KM[i];
            double price = MockPricingUtil.jitterPrice(basePrice, seed, 0.08);
            LocalTime dep = MockPricingUtil.randomDepartureTime(seed);
            double avgSpeedKmh = 55;
            LocalTime arr = dep.plusMinutes((long) (distanceKm / avgSpeedKmh * 60));
            double rating = MockPricingUtil.randomRating(seed, 3.5, 4.6);

            TripOption opt = new TripOption(
                    UUID.randomUUID().toString(), TransportMode.TRAIN, CLASSES[i],
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

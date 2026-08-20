package com.tripspot.provider;

import java.time.LocalTime;
import java.util.Random;

public final class MockPricingUtil {

    private MockPricingUtil() {}

    public static long seedFor(String origin, String destination, String date, String salt) {
        String key = (origin + "|" + destination + "|" + date + "|" + salt).toLowerCase();
        return key.hashCode();
    }

    public static int estimateDistanceKm(String origin, String destination) {
        Random r = new Random(seedFor(origin, destination, "", "distance"));
        return 50 + r.nextInt(1750);
    }

    public static double jitterPrice(double base, long seed, double spreadPct) {
        Random r = new Random(seed);
        double factor = 1.0 + ((r.nextDouble() * 2 - 1) * spreadPct);
        return Math.round(base * factor);
    }

    public static LocalTime randomDepartureTime(long seed) {
        Random r = new Random(seed);
        int hour = r.nextInt(24);
        int minute = r.nextInt(4) * 15;
        return LocalTime.of(hour, minute);
    }

    public static double randomRating(long seed, double min, double max) {
        Random r = new Random(seed + 999);
        double val = min + r.nextDouble() * (max - min);
        return Math.round(val * 10) / 10.0;
    }
}

package com.tripspot.dto;

import com.tripspot.model.TransportMode;

public class TripOption {

    private String id;
    private TransportMode mode;
    private String providerName;
    private String origin;
    private String destination;
    private String departureTime;
    private String arrivalTime;
    private String durationLabel;
    private double price;
    private String currency = "INR";
    private double rating;
    private String badge;

    // Populated after the ML service re-ranks this option for the current user
    private Double personalizedScore;
    private String personalizedReason;

    public TripOption() {}

    public TripOption(String id, TransportMode mode, String providerName, String origin, String destination,
                       String departureTime, String arrivalTime, String durationLabel, double price, double rating) {
        this.id = id;
        this.mode = mode;
        this.providerName = providerName;
        this.origin = origin;
        this.destination = destination;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.durationLabel = durationLabel;
        this.price = price;
        this.rating = rating;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public TransportMode getMode() { return mode; }
    public void setMode(TransportMode mode) { this.mode = mode; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public String getDurationLabel() { return durationLabel; }
    public void setDurationLabel(String durationLabel) { this.durationLabel = durationLabel; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getCurrency() { return currency; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
    public Double getPersonalizedScore() { return personalizedScore; }
    public void setPersonalizedScore(Double personalizedScore) { this.personalizedScore = personalizedScore; }
    public String getPersonalizedReason() { return personalizedReason; }
    public void setPersonalizedReason(String personalizedReason) { this.personalizedReason = personalizedReason; }
}

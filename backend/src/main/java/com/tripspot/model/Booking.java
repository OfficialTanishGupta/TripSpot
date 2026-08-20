package com.tripspot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "booking")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private TransportMode mode;

    private String providerName;
    private String origin;
    private String destination;
    private String departureTime;
    private double price;
    private String currency = "INR";
    private String status = "CONFIRMED"; // CONFIRMED, CANCELLED

    // Party/context fields - feed the ML persona and ranking models
    private int adults = 1;
    private int children = 0;
    private boolean isWeekend = false;
    private int advanceDays = 0;
    private Double cheapestAvailablePrice; // cheapest option shown at booking time, nullable

    private Instant bookedAt = Instant.now();

    public Booking() {}

    public String getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
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
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getCurrency() { return currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getAdults() { return adults; }
    public void setAdults(int adults) { this.adults = adults; }
    public int getChildren() { return children; }
    public void setChildren(int children) { this.children = children; }
    public boolean isWeekend() { return isWeekend; }
    public void setWeekend(boolean weekend) { isWeekend = weekend; }
    public int getAdvanceDays() { return advanceDays; }
    public void setAdvanceDays(int advanceDays) { this.advanceDays = advanceDays; }
    public Double getCheapestAvailablePrice() { return cheapestAvailablePrice; }
    public void setCheapestAvailablePrice(Double cheapestAvailablePrice) { this.cheapestAvailablePrice = cheapestAvailablePrice; }
    public Instant getBookedAt() { return bookedAt; }
}

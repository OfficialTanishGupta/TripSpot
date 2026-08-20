package com.tripspot.provider;

import com.tripspot.dto.SearchRequest;
import com.tripspot.dto.TripOption;
import com.tripspot.model.TransportMode;

import java.util.List;

public interface TransportProvider {
    TransportMode getMode();
    String getProviderName();
    List<TripOption> search(SearchRequest request);
}

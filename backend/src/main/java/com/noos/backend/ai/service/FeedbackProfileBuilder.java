package com.noos.backend.ai.service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

final class FeedbackProfileBuilder {

    private FeedbackProfileBuilder() {
    }

    static Map<String, Object> build(List<Map<String, Object>> feedbackHistory) {
        if (feedbackHistory == null || feedbackHistory.isEmpty()) {
            return Map.of();
        }

        int counted = 0;
        double ratingTotal = 0.0;
        Map<String, Integer> visitedPlanets = new HashMap<>();
        Map<String, Integer> ratingDistribution = new LinkedHashMap<>();

        for (Map<String, Object> entry : feedbackHistory) {
            double rating = numberValue(entry.get("rating"), 0.0);
            if (rating > 0.0) {
                counted += 1;
                ratingTotal += rating;
                int roundedRating = Math.max(1, Math.min(5, roundedInt(rating)));
                String ratingKey = String.valueOf(roundedRating);
                ratingDistribution.put(ratingKey, ratingDistribution.getOrDefault(ratingKey, 0) + 1);
            }

            String planet = stringValue(entry.get("planetSlug"));
            if (planet == null || planet.isBlank()) {
                planet = stringValue(entry.get("planet"));
            }
            if (planet != null && !planet.isBlank()) {
                visitedPlanets.put(planet, visitedPlanets.getOrDefault(planet, 0) + 1);
            }
        }

        if (counted == 0) {
            return Map.of();
        }

        return Map.of(
                "rating_count", counted,
                "average_rating", rounded(ratingTotal / counted),
                "rating_distribution", ratingDistribution,
                "visited_planets", visitedPlanets,
                "top_planets", topPlanetVotes(visitedPlanets)
        );
    }

    private static double numberValue(Object value, double fallback) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof String string) {
            try {
                return Double.parseDouble(string);
            } catch (NumberFormatException ignored) {
                return fallback;
            }
        }
        return fallback;
    }

    private static double rounded(double value) {
        return Math.round(value * 1000.0) / 1000.0;
    }

    private static int roundedInt(double value) {
        return (int) Math.round(value);
    }

    private static List<String> topPlanetVotes(Map<String, Integer> votes) {
        return votes.entrySet().stream()
                .sorted(
                        Map.Entry.<String, Integer>comparingByValue(Comparator.reverseOrder())
                                .thenComparing(Map.Entry.comparingByKey())
                )
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private static String stringValue(Object value) {
        return value instanceof String string ? string : null;
    }
}

package com.nourishnet.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * UserRole specification for NourishNet.
 * Exactly three roles supported: DONOR, RECIPIENT, VEHICLE_VOLUNTEER.
 * Strictly NO ADMIN role.
 */
public enum UserRole {
    DONOR,
    RECIPIENT,
    VEHICLE_VOLUNTEER;

    @JsonCreator
    public static UserRole fromString(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        if ("VOLUNTEER".equals(normalized)) {
            return VEHICLE_VOLUNTEER;
        }
        for (UserRole role : UserRole.values()) {
            if (role.name().equals(normalized)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: '" + value + "'. Accepted values are: [DONOR, RECIPIENT, VEHICLE_VOLUNTEER]");
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}

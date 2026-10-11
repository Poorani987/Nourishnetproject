package org.nourishnet.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    DONOR,
    RECIPIENT,
    VEHICLE_VOLUNTEER;

    @JsonCreator
    public static Role fromString(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        if ("VOLUNTEER".equals(normalized)) {
            return VEHICLE_VOLUNTEER;
        }
        for (Role role : Role.values()) {
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

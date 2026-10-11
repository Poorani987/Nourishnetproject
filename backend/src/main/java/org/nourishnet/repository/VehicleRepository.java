package org.nourishnet.repository;

import org.nourishnet.entity.Vehicle;
import org.nourishnet.entity.VolunteerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVolunteerProfile(VolunteerProfile volunteerProfile);
    Optional<Vehicle> findByVolunteerProfileId(Long volunteerProfileId);
    boolean existsByRegistrationNumber(String registrationNumber);
}

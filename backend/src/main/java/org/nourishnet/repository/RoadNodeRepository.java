package org.nourishnet.repository;

import org.nourishnet.entity.RoadNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoadNodeRepository extends JpaRepository<RoadNode, Long> {
    Optional<RoadNode> findByNodeCode(String nodeCode);
}

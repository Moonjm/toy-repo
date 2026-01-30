package com.example.backend.activitytypes

import org.springframework.data.jpa.repository.JpaRepository

interface ActivityTypeRepository : JpaRepository<ActivityType, Long> {
    fun existsByEmoji(emoji: String): Boolean

    fun findAllByIsActiveOrderBySortOrderAscIdAsc(isActive: Boolean): List<ActivityType>

    fun findAllByOrderBySortOrderAscIdAsc(): List<ActivityType>
}

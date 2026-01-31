package com.example.backend.activitytypes

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank

@Schema(description = "운동 타입 응답")
data class ActivityTypeResponse(
    @field:Schema(description = "ID", example = "1")
    val id: Long,
    @field:Schema(description = "이모지", example = "🏋️")
    val emoji: String,
    @field:Schema(description = "이름", example = "헬스")
    val name: String,
    @field:Schema(description = "활성 여부", example = "true")
    val isActive: Boolean,
    @field:Schema(description = "정렬 순서", example = "1")
    val sortOrder: Int,
)

fun ActivityType.toResponse(): ActivityTypeResponse =
    ActivityTypeResponse(
        id = id ?: 0L,
        emoji = emoji,
        name = name,
        isActive = isActive,
        sortOrder = sortOrder,
    )

@Schema(description = "운동 타입 요청")
data class ActivityTypeRequest(
    @field:Schema(description = "이모지", example = "🏊")
    @field:NotBlank
    val emoji: String,
    @field:Schema(description = "이름", example = "수영")
    @field:NotBlank
    val name: String,
    @field:Schema(description = "활성 여부", example = "true")
    val isActive: Boolean,
    @field:Schema(description = "정렬 순서", example = "2")
    val sortOrder: Int,
)

@Schema(description = "운동 타입 순서 변경 요청")
data class ActivityTypeMoveRequest(
    @field:Schema(description = "이동할 운동 타입 ID", example = "3")
    val targetId: Long,
    @field:Schema(description = "앞에 둘 운동 타입 ID", example = "8")
    val beforeId: Long? = null,
)

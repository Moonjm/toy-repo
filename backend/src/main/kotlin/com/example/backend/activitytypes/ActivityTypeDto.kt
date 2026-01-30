package com.example.backend.activitytypes

import io.swagger.v3.oas.annotations.media.Schema

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
    val sortOrder: Int
)

@Schema(description = "운동 타입 생성 요청")
data class ActivityTypeCreateRequest(
    @field:Schema(description = "이모지", example = "🏊")
    val emoji: String?,
    @field:Schema(description = "이름", example = "수영")
    val name: String?,
    @field:Schema(description = "활성 여부", example = "true")
    val isActive: Boolean? = true,
    @field:Schema(description = "정렬 순서", example = "2")
    val sortOrder: Int? = 0
)

@Schema(description = "운동 타입 수정 요청")
data class ActivityTypeUpdateRequest(
    @field:Schema(description = "이모지", example = "🏃")
    val emoji: String? = null,
    @field:Schema(description = "이름", example = "러닝")
    val name: String? = null,
    @field:Schema(description = "활성 여부", example = "false")
    val isActive: Boolean? = null,
    @field:Schema(description = "정렬 순서", example = "3")
    val sortOrder: Int? = null
)

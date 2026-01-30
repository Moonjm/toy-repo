package com.example.backend.activitytypes

import com.example.backend.common.constant.ErrorCode
import com.example.backend.common.exception.CustomException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ActivityTypeService(
    private val repository: ActivityTypeRepository
) {
    @Transactional(readOnly = true)
    fun list(active: Boolean?): List<ActivityTypeResponse> {
        val entities =
            if (active == null) {
                repository.findAllByOrderBySortOrderAscIdAsc()
            } else {
                repository.findAllByIsActiveOrderBySortOrderAscIdAsc(active)
            }
        return entities.map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun get(id: Long): ActivityTypeResponse =
        repository.findByIdOrNull(id)?.toResponse()
            ?: throw CustomException(ErrorCode.RESOURCE_NOT_FOUND, id)

    @Transactional
    fun create(request: ActivityTypeCreateRequest): ActivityTypeResponse {
        val emoji = request.emoji?.trim().orEmpty()
        val name = request.name?.trim().orEmpty()
        validateRequired(emoji, name)

        if (repository.existsByEmoji(emoji)) {
            throw CustomException(ErrorCode.DUPLICATE_RESOURCE, emoji)
        }

        val entity =
            ActivityType(
                emoji = emoji,
                name = name,
                isActive = request.isActive ?: true,
                sortOrder = request.sortOrder ?: 0
            )
        return repository.save(entity).toResponse()
    }

    @Transactional
    fun update(id: Long, request: ActivityTypeUpdateRequest): ActivityTypeResponse {
        val entity =
            repository.findByIdOrNull(id)
                ?: throw CustomException(ErrorCode.RESOURCE_NOT_FOUND, id)

        request.emoji?.trim()?.takeIf { it.isNotEmpty() }?.let { emoji ->
            if (emoji != entity.emoji && repository.existsByEmoji(emoji)) {
                throw CustomException(ErrorCode.DUPLICATE_RESOURCE, emoji)
            }
            entity.emoji = emoji
        }

        request.name?.trim()?.takeIf { it.isNotEmpty() }?.let { entity.name = it }
        request.isActive?.let { entity.isActive = it }
        request.sortOrder?.let { entity.sortOrder = it }

        return repository.save(entity).toResponse()
    }

    @Transactional
    fun delete(id: Long) {
        val entity =
            repository.findByIdOrNull(id)
                ?: throw CustomException(ErrorCode.RESOURCE_NOT_FOUND, id)
        repository.delete(entity)
    }

    private fun validateRequired(emoji: String, name: String) {
        if (emoji.isBlank()) {
            throw CustomException(ErrorCode.INVALID_REQUEST, "emoji")
        }
        if (name.isBlank()) {
            throw CustomException(ErrorCode.INVALID_REQUEST, "name")
        }
    }

    private fun ActivityType.toResponse(): ActivityTypeResponse =
        ActivityTypeResponse(
            id = id ?: 0L,
            emoji = emoji,
            name = name,
            isActive = isActive,
            sortOrder = sortOrder
        )
}

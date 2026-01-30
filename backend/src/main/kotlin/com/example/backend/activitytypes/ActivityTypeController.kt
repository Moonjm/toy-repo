package com.example.backend.activitytypes

import com.example.backend.common.annotation.ResponseCreated
import com.example.backend.common.response.DataResponseBody
import com.example.backend.common.response.ResponseBody
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@Tag(name = "운동 타입", description = "운동 타입 API")
@RestController
@RequestMapping("/activity-types")
class ActivityTypeController(
    private val service: ActivityTypeService
) {
    @GetMapping
    @Operation(summary = "운동 타입 목록 조회")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "성공")
        ]
    )
    fun list(
        @Parameter(description = "활성 여부 필터", example = "true")
        @RequestParam(required = false) active: Boolean?
    ): ResponseEntity<DataResponseBody<List<ActivityTypeResponse>>> =
        ResponseEntity.ok(DataResponseBody(service.list(active)))

    @GetMapping("/{id}")
    @Operation(summary = "운동 타입 단건 조회")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "성공"),
            ApiResponse(responseCode = "404", description = "찾을 수 없음")
        ]
    )
    fun get(
        @Parameter(description = "운동 타입 ID", example = "1")
        @PathVariable id: Long
    ): ResponseEntity<DataResponseBody<ActivityTypeResponse>> =
        ResponseEntity.ok(DataResponseBody(service.get(id)))

    @PostMapping
    @ResponseCreated(locationPath = "/activity-types/{id}")
    @Operation(summary = "운동 타입 생성")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "201", description = "생성됨"),
            ApiResponse(responseCode = "400", description = "잘못된 요청")
        ]
    )
    fun create(@RequestBody request: ActivityTypeCreateRequest): Long =
        service.create(request).id

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody request: ActivityTypeUpdateRequest
    ): ResponseEntity<Void> {
        service.update(id, request)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "운동 타입 삭제")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "삭제됨"),
            ApiResponse(responseCode = "404", description = "찾을 수 없음")
        ]
    )
    fun delete(
        @Parameter(description = "운동 타입 ID", example = "1")
        @PathVariable id: Long
    ): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}

package com.example.backend.holidays

import com.example.backend.common.response.DataResponseBody
import com.example.backend.common.response.ResponseBody
import org.springframework.http.ResponseEntity
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@Tag(name = "공휴일", description = "공휴일 API")
@RestController
@RequestMapping("/holidays")
class HolidaysController(
    private val holidaysService: HolidaysService
) {
    @GetMapping
    @Operation(summary = "공휴일 조회", description = "지정한 연도의 공휴일을 조회합니다.")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "성공"),
            ApiResponse(responseCode = "400", description = "잘못된 연도"),
            ApiResponse(responseCode = "502", description = "외부 API 오류")
        ]
    )
    fun getHolidays(
        @Parameter(description = "4자리 연도", example = "2026", required = true)
        @RequestParam(name = "year", required = true) year: String
    ): ResponseEntity<DataResponseBody<List<ExternalHoliday>>> {
        return ResponseEntity.ok(DataResponseBody(holidaysService.fetch(year)))
    }
}

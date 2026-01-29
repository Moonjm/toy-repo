package com.example.backend.holidays

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/holidays")
class HolidaysController(
    private val holidaysService: HolidaysService
) {
    @GetMapping
    fun getHolidays(@RequestParam year: String?): ResponseEntity<HolidaysResponse> {
        val safeYear = year?.trim().orEmpty()
        if (!safeYear.matches(Regex("\\d{4}"))) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(HolidaysResponse(success = false, data = emptyList(), message = "year required"))
        }

        return try {
            val data = holidaysService.fetch(safeYear)
            ResponseEntity.ok(HolidaysResponse(success = true, data = data))
        } catch (ex: Exception) {
            ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(HolidaysResponse(success = false, data = emptyList(), message = "holiday fetch failed"))
        }
    }
}

data class HolidaysResponse(
    val success: Boolean,
    val data: List<HolidayItem>,
    val message: String? = null
)

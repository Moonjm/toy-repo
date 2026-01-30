package com.example.backend.holidays

import com.example.backend.common.response.DataResponseBody
import com.example.backend.common.response.ResponseBody
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
    fun getHolidays(@RequestParam(name ="year", required = true) year: String): ResponseEntity<ResponseBody> {
        return ResponseEntity.ok(DataResponseBody(holidaysService.fetch(year)))
    }
}

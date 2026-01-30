package com.example.backend.holidays

import java.time.LocalDate
import org.springframework.core.ParameterizedTypeReference
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import com.example.backend.config.HolidaysProperties
import com.fasterxml.jackson.annotation.JsonFormat
import io.swagger.v3.oas.annotations.media.Schema

@Service
class HolidaysService(
    private val webClient: WebClient,
    private val holidaysProperties: HolidaysProperties
) {
    fun fetch(year: String): List<ExternalHoliday> {
        val responseType = object : ParameterizedTypeReference<List<ExternalHoliday>>() {}
        val external = webClient.get()
            .uri(holidaysProperties.url, year)
            .retrieve()
            .bodyToMono(responseType)
            .block()
            .orEmpty()

        return external
    }
}

@Schema(description = "공휴일 항목")
data class ExternalHoliday(
    @field:Schema(description = "날짜", example = "2026-01-01")
    @field:JsonFormat(pattern = "yyyy-MM-dd")
    val date: LocalDate,
    @field:Schema(description = "현지 이름", example = "신정")
    val localName: String? = null,
    @field:Schema(description = "영문 이름", example = "New Year's Day")
    val name: String? = null
)

package com.example.backend.holidays

import java.time.LocalDate
import org.springframework.core.ParameterizedTypeReference
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import com.example.backend.config.HolidaysProperties
import com.fasterxml.jackson.annotation.JsonFormat

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

data class ExternalHoliday(
    @field:JsonFormat(pattern = "yyyy-MM-dd")
    val date: LocalDate,
    val localName: String? = null,
    val name: String? = null
)

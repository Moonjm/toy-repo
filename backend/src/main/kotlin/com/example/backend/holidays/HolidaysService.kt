package com.example.backend.holidays

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import org.springframework.core.ParameterizedTypeReference
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import com.example.backend.config.HolidaysProperties

@Service
class HolidaysService(
    private val webClient: WebClient,
    private val holidaysProperties: HolidaysProperties
) {
    fun fetch(year: String): List<HolidayItem> {
        val responseType = object : ParameterizedTypeReference<List<ExternalHoliday>>() {}
        val external = webClient.get()
            .uri(holidaysProperties.url, year)
            .retrieve()
            .bodyToMono(responseType)
            .block()
            .orEmpty()

        return external.mapNotNull { it.toHolidayItemOrNull() }
    }

    private fun ExternalHoliday.toHolidayItemOrNull(): HolidayItem? {
        val nameValue = localName ?: name
        if (nameValue.isNullOrBlank()) return null

        val parsedDate = try {
            LocalDate.parse(date)
        } catch (_: Exception) {
            return null
        }

        val dateInt = parsedDate.format(DateTimeFormatter.BASIC_ISO_DATE).toInt()
        return HolidayItem(date = dateInt, name = nameValue)
    }
}

data class HolidayItem(
    val date: Int,
    val name: String
)

data class ExternalHoliday(
    val date: String,
    val localName: String? = null,
    val name: String? = null
)

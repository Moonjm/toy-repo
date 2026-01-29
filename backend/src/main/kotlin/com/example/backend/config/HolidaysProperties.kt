package com.example.backend.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "holidays")
data class HolidaysProperties(
    val url: String
)

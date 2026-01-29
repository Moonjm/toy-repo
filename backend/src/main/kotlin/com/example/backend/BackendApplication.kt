package com.example.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["com.example"])
@ConfigurationPropertiesScan
class BackendApplication

fun main(args: Array<String>) {
    runApplication<BackendApplication>(*args)
}

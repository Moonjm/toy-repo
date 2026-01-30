package com.example.backend.common.annotation

@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class ResponseCreated(
    val locationPath: String
)

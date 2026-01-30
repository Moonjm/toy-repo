package com.example.backend.common.constant

import org.springframework.http.HttpStatus

enum class ErrorCode(
    private val httpStatus: HttpStatus,
    private val message: String,
) : Code {

    DUPLICATE_RESOURCE_ID(HttpStatus.BAD_REQUEST, "중복된 리소스 ID가 포함되어 있습니다."),
    ;

    override fun getHttpStatus(): HttpStatus = httpStatus

    override fun getMessage(): String = message

    override fun getStatusName(): String = httpStatus.name
}

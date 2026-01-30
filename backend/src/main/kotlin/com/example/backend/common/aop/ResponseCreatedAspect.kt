package com.example.backend.common.aop

import com.example.backend.common.annotation.ResponseCreated
import com.example.backend.common.response.DataResponseBody
import com.example.backend.common.response.ResponseBody
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.net.URI

@Aspect
@Component
class ResponseCreatedAspect {

    @Around("@annotation(responseCreated)")
    fun wrapCreatedResponse(
        joinPoint: ProceedingJoinPoint,
        responseCreated: ResponseCreated
    ): ResponseEntity<ResponseBody> {
        val result = joinPoint.proceed()
        val id = result as? Long
            ?: throw IllegalStateException("@ResponseCreated requires controller to return Long id")
        val location = buildLocation(responseCreated.locationPath, id)

        return ResponseEntity
            .created(location)
            .body(DataResponseBody(id))
    }

    private fun buildLocation(path: String, id: Long): URI {
        val resolvedPath =
            if (path.contains("{id}")) {
                path.replace("{id}", id.toString())
            } else {
                "${path.trimEnd('/')}/$id"
            }

        return ServletUriComponentsBuilder
            .fromCurrentContextPath()
            .path(resolvedPath)
            .build()
            .toUri()
    }
}

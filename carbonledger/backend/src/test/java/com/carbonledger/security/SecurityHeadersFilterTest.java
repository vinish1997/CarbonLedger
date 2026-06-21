package com.carbonledger.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

public class SecurityHeadersFilterTest {

    private final SecurityHeadersFilter filter = new SecurityHeadersFilter();

    @Test
    public void testDoFilter_HttpServletResponse() throws Exception {
        jakarta.servlet.http.HttpServletRequest request = mock(jakarta.servlet.http.HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");

        filter.doFilter(request, response, chain);

        verify(response).setHeader("X-Frame-Options", "DENY");
        verify(response).setHeader("X-Content-Type-Options", "nosniff");
        verify(response).setHeader("X-XSS-Protection", "1; mode=block");
        verify(response).setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        verify(response).setHeader(eq("Content-Security-Policy"), anyString());
        verify(response).setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
        verify(response).setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
        verify(response).setHeader("Cross-Origin-Opener-Policy", "same-origin");
        verify(response).setHeader("Cross-Origin-Resource-Policy", "same-origin");
        verify(response).setHeader("X-Permitted-Cross-Domain-Policies", "none");
        verify(chain).doFilter(request, response);
    }

    @Test
    public void testDoFilter_BlockedHttpMethods() throws Exception {
        jakarta.servlet.http.HttpServletRequest request = mock(jakarta.servlet.http.HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getMethod()).thenReturn("TRACE");

        filter.doFilter(request, response, chain);

        verify(response).setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
        verifyNoInteractions(chain);
    }

    @Test
    public void testDoFilter_AllowedHttpMethods() throws Exception {
        jakarta.servlet.http.HttpServletRequest request = mock(jakarta.servlet.http.HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");

        filter.doFilter(request, response, chain);

        verify(response).setHeader("X-Frame-Options", "DENY");
        verify(chain).doFilter(request, response);
    }

    @Test
    public void testDoFilter_NonHttpServletResponse() throws Exception {
        ServletRequest request = mock(ServletRequest.class);
        ServletResponse response = mock(ServletResponse.class); // Not HttpServletResponse
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    public void testInitAndDestroy() throws Exception {
        FilterConfig config = mock(FilterConfig.class);
        // Verify default interface method call-backs do not error
        filter.init(config);
        filter.destroy();
    }
}

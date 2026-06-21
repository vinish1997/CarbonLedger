package com.carbonledger.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import java.io.IOException;

/**
 * Filter to automatically inject industry-standard HTTP security headers.
 * Protects against clickjacking, content sniffing, XSS, and enforces same-origin policies.
 */
@Component
public class SecurityHeadersFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization if needed
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof jakarta.servlet.http.HttpServletRequest && response instanceof HttpServletResponse) {
            jakarta.servlet.http.HttpServletRequest httpRequest = (jakarta.servlet.http.HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            // Block insecure HTTP methods (TRACE/TRACK) to prevent cross-site tracking/debugging leaks
            String method = httpRequest.getMethod();
            if ("TRACE".equalsIgnoreCase(method) || "TRACK".equalsIgnoreCase(method)) {
                httpResponse.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
                return;
            }

            // Prevent site from being embedded in frames/iframes (clickjacking)
            httpResponse.setHeader("X-Frame-Options", "DENY");
            
            // Prevent browser from MIME-sniffing away from declared Content-Type
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            
            // Enable browser built-in XSS filter
            httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
            
            // Protect referrer privacy while maintaining security context
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            
            // Inject a tight, robust Content Security Policy (CSP) compatible with standard React resources (excluding unsafe-inline scripts)
            httpResponse.setHeader("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "font-src 'self' https://fonts.gstatic.com; " +
                "img-src 'self' data:; " +
                "connect-src 'self';"
            );

            // Enforce Strict Transport Security (HSTS)
            httpResponse.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

            // Control browser feature access (geolocation, camera, mic)
            httpResponse.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");

            // Control cross-origin interactions
            httpResponse.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            httpResponse.setHeader("Cross-Origin-Resource-Policy", "same-origin");

            // Prevent Flash/PDF content from executing cross-domain requests
            httpResponse.setHeader("X-Permitted-Cross-Domain-Policies", "none");
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // Cleanup if needed
    }
}

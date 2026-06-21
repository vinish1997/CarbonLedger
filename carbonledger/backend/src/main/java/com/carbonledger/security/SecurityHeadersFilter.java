package com.carbonledger.security;

import jakarta.servlet.*;
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
        if (response instanceof HttpServletResponse) {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            // Prevent site from being embedded in frames/iframes (clickjacking)
            httpResponse.setHeader("X-Frame-Options", "DENY");
            
            // Prevent browser from MIME-sniffing away from declared Content-Type
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            
            // Enable browser built-in XSS filter
            httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
            
            // Protect referrer privacy while maintaining security context
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            
            // Inject a tight, robust Content Security Policy (CSP) compatible with standard React resources
            httpResponse.setHeader("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline'; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "font-src 'self' https://fonts.gstatic.com; " +
                "img-src 'self' data:; " +
                "connect-src 'self';"
            );
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // Cleanup if needed
    }
}

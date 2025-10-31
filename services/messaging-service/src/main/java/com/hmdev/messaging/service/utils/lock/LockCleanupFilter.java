package com.hmdev.messaging.service.utils.lock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * Servlet filter that ensures any locks registered during the request are
 * released when the request completes. This prevents forgetting to unlock in
 * controller finally blocks.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class LockCleanupFilter implements Filter {
    private static final Logger LOGGER = LoggerFactory.getLogger(LockCleanupFilter.class);

    private final LockRegisterService lockRegisterService;

    public LockCleanupFilter(LockRegisterService lockRegisterService) {
        this.lockRegisterService = lockRegisterService;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // no-op
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            chain.doFilter(request, response);
        } finally {
            try {
                lockRegisterService.clearAndUnlockAll();
            } catch (Exception ex) {
                LOGGER.warn("Error while cleaning up locks for request {}: {}",
                        (request instanceof HttpServletRequest) ? ((HttpServletRequest) request).getRequestURI() : request.toString(),
                        ex.getMessage());
            }
        }
    }

    @Override
    public void destroy() {
        // no-op
    }
}


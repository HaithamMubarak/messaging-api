package com.hmdev.messaging.service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${messaging.cors.allowed-origins:*}")
    private String allowedOrigins;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Keep existing generated/ mapping but prefer static resources under classpath:/static/
        registry.addResourceHandler("/messaging-platform/**")
                .addResourceLocations("classpath:/generated/", "classpath:/static/");

        // Ensure admin UI served directly from src/main/resources/static/admin
        registry.addResourceHandler("/admin/**")
                .addResourceLocations("classpath:/static/admin/", "classpath:/static/");

        registry.addResourceHandler("/messaging-platform/admin/**")
                .addResourceLocations("classpath:/static/admin/", "classpath:/static/", "classpath:/generated/");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/messaging-platform/web-agent")
                .setViewName("redirect:/messaging-platform/web-agent/index.html");

        // Admin UI entrypoint under messaging-platform path
        registry.addViewController("/messaging-platform/admin")
                .setViewName("redirect:/messaging-platform/admin/index.html");

        // Also expose a short /admin entrypoint that redirects to the static admin page
        registry.addViewController("/admin")
                .setViewName("redirect:/admin/index.html");
        registry.addViewController("/admin/")
                .setViewName("redirect:/admin/index.html");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Configure CORS for messaging endpoints. Property supports comma-separated list of origins.
        String[] origins = new String[] {"*"};
        if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
            origins = java.util.Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toArray(String[]::new);
        }
        // Use allowedOriginPatterns to permit wildcard patterns (e.g. "*") when credentials are allowed.
        registry.addMapping("/messaging-platform/**")
                .allowedOriginPatterns(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true)
                .maxAge(3600);

        // Allow admin static pages and local assets to be requested from the allowed origins as well
        registry.addMapping("/messaging-platform/admin/**")
                .allowedOriginPatterns(origins)
                .allowedMethods("GET", "OPTIONS")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

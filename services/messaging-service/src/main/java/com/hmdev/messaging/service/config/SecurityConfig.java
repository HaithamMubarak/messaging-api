package com.hmdev.messaging.service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.core.annotation.Order;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        // Highest precedence chain: completely open the public messaging-service API
        http
            .requestMatchers(matchers -> matchers.antMatchers("/messaging-platform/api/v1/messaging-service", "/messaging-platform/api/v1/messaging-service/**"))
            .authorizeRequests().anyRequest().permitAll()
            .and().csrf().disable();
        return http.build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                // allow anonymous access to actuator, site root, web-agent static files
                .antMatchers(
                    "/actuator/**",
                    "/",
                    "/index.html",
                    "/static/**",
                    "/messaging-platform/web-agent/**"
                ).permitAll()
                .anyRequest().authenticated()
            .and()
                .httpBasic();

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // Keep ignoring for static resources if desired
        return (web) -> web.ignoring().antMatchers("/static/**");
    }
}

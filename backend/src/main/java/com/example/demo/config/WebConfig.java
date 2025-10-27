package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve home directory using Java
        String homeDir = System.getProperty("user.home");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + homeDir + "/uploads/");
    }
}

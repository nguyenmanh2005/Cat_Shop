//package com.catshop.catshop.config;
//
//import com.fasterxml.jackson.databind.SerializationFeature;
//import com.fasterxml.jackson.databind.DeserializationFeature;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
//import com.fasterxml.jackson.annotation.JsonInclude;
//import org.springframework.context.annotation.Configuration;
//import jakarta.annotation.PostConstruct;
//
//import java.text.SimpleDateFormat;
//
//@Configuration
//public class JacksonConfig {
//
//    private final ObjectMapper objectMapper;
//
//    public JacksonConfig(ObjectMapper objectMapper) {
//        this.objectMapper = objectMapper;
//    }
//
//    @PostConstruct
//    public void setUp() {
//        objectMapper.registerModule(new JavaTimeModule());
//        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
//        objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
//        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
//        objectMapper.setDateFormat(new SimpleDateFormat("dd/MM/yyyy HH:mm:ss"));
//    }
//}

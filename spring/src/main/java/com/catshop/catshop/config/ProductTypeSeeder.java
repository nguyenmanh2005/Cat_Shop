package com.catshop.catshop.config;

import com.catshop.catshop.entity.ProductType;
import com.catshop.catshop.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Component
public class ProductTypeSeeder implements CommandLineRunner {
    private  final ProductTypeRepository productTypeRepository;

    @Override
    public void run(String... args) throws Exception {
        List<String> defaultTypes = List.of("Cat","Food","Cage","Cleaning");

        for (String typeName : defaultTypes){
            if(!productTypeRepository.existsByTypeName(typeName)){
                ProductType type = ProductType.builder().typeName(typeName).build();
                productTypeRepository.save(type);
                log.info("Inserted default type: " + typeName);
            }
            else {
                log.info("Type already exists: " + typeName);
            }
        }
    }
}

package com.catshop.catshop.config;

import com.catshop.catshop.entity.Role;
import com.catshop.catshop.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoleSeeder implements CommandLineRunner {
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        List<String> defaultRoles = List.of("Customer","Admin");
        for(String roles : defaultRoles){
            if(!roleRepository.existsByRoleName(roles)){
                Role role = Role.builder().roleName(roles).build();
                roleRepository.save(role);
                log.info("Insered Role: "+roles);

            }else {
                log.info("Role " + roles +" already existed!");
            }
        }
    }
}

package com.catshop.catshop;

import com.catshop.catshop.entity.User;
import com.catshop.catshop.repository.UserRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class Test {
    private UserRepository userRepository;
    private  UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken;

    public void test(){
        User user = userRepository.findByEmail("tauhaitac3k@gmail.com").get();

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);

    }

    public static void main(String[] args) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
    }
}

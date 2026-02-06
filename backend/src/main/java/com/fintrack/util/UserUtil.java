package com.fintrack.util;

import com.fintrack.model.Users;
import com.fintrack.repository.UsersRepository;
import com.fintrack.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserUtil {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsersRepository usersRepository;

    public Optional<Users> getCurrentUser(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return Optional.empty();
            }

            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);

            return usersRepository.findByUsername(username);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Long getCurrentUserId(String authHeader) {
        return getCurrentUser(authHeader)
                .map(Users::getId)
                .orElse(null);
    }
}
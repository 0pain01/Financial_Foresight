package com.fintrack.controller;

import com.fintrack.model.Users;
import com.fintrack.repository.UsersRepository;
import com.fintrack.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String email = request.get("email");
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");

            // Check if username already exists
            Optional<Users> existingUser = usersRepository.findByUsername(username);
            if (existingUser.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Create new user
            Users user = new Users();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);

            Users savedUser = usersRepository.save(user);

            // Generate JWT token
            String token = jwtService.generateToken(savedUser);

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", createUserResponse(savedUser));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            Optional<Users> userOpt = usersRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid username or password");
                return ResponseEntity.badRequest().body(response);
            }

            Users user = userOpt.get();
            if (!passwordEncoder.matches(password, user.getPassword())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid username or password");
                return ResponseEntity.badRequest().body(response);
            }

            // Generate JWT token
            String token = jwtService.generateToken(user);

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", createUserResponse(user));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);

            Optional<Users> userOpt = usersRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            return ResponseEntity.ok(createUserResponse(userOpt.get()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }



    private Map<String, Object> createUserResponse(Users user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        return userResponse;
    }
}
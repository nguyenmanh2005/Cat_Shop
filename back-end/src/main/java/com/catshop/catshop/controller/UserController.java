package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.UserResponse;
import com.catshop.catshop.service.impl.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UserController {

    private final UserServiceImpl userServiceImpl;

    // Get All User from database checked
    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUser (){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(
                userServiceImpl.getAllUser(),"Fetched all users successfully"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id){
        UserResponse userResponse = userServiceImpl.getUserById(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success(userResponse,"User found successfully")
        );
    }

    // Lấy user theo email
    // http://localhost:8080/api/users/email/anhnguyen@example.com  checked
    // Throw exception checked
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        UserResponse userResponse = userServiceImpl.getUserByEmail(email);
        return ResponseEntity.ok(
                ApiResponse.success(userResponse,"User found successfully")
        );
    }

    // Tạo user mới  checked
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> insertUser(@Valid @RequestBody UserRequest request) {
        UserResponse userResponse = userServiceImpl.insertUser(request);
        return ResponseEntity.ok(ApiResponse.success(userResponse,"User created successfully"));
    }

    // Update user theo id
    // Throwing Exception checked
    //
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        userServiceImpl.updateUserByUserId(id,request),
                        "User updated successfully"
                )
        );
    }

    // Xoá user theo id
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userServiceImpl.deleteUserByUserId(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success(
                        null,
                        "User deleted successfully"
                )
        );

    }
}

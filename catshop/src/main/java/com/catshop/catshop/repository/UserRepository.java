package com.catshop.catshop.repository;

import com.catshop.catshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);


    @Query(value = "SELECT * FROM users WHERE phone = :phone", nativeQuery = true)
    Optional<User> findByPhoneNumber (@Param("phone") String phone);


}

package com.noos.backend.auth.service;

import com.noos.backend.auth.dto.UpdateUserRequest;
import com.noos.backend.auth.dto.User;
import com.noos.backend.auth.dto.UserSearchRequest;
import com.noos.backend.auth.mapper.AdminMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static com.noos.backend.auth.session.AuthSessionKeys.LOGIN_USER_NAME;
import static com.noos.backend.auth.session.AuthSessionKeys.LOGIN_USER_ROLE;

@Service
public class AdminService {

    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminMapper adminMapper, PasswordEncoder passwordEncoder) {
        this.adminMapper = adminMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAllUsers(HttpSession session) {
        requireAdmin(session);
        return adminMapper.findAllUsers();
    }

    public List<User> searchUsers(UserSearchRequest request, HttpSession session) {
        String type = request.getType();
        String keyword = request.getKeyword();
        String startDate = request.getStartDate();
        String endDate = request.getEndDate();

        requireAdmin(session);
        return adminMapper.searchUsers(
                normalize(type),
                normalize(keyword),
                normalize(startDate),
                normalize(endDate)
        );
    }

    public void updateUser(Long userId, UpdateUserRequest request, HttpSession session) {
        requireAdmin(session);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            request.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        adminMapper.updateUser(userId, request);
    }

    public void deleteUser(Long userId, HttpSession session) {
        requireAdmin(session);
        adminMapper.deleteUser(userId);
    }

    public String describeCurrentAdmin(HttpSession session) {
        requireAdmin(session);
        if (session == null || session.getAttribute(LOGIN_USER_NAME) == null) {
            return "로그인 안됨";
        }
        return "이름: " + session.getAttribute(LOGIN_USER_NAME)
                + " / 권한: " + session.getAttribute(LOGIN_USER_ROLE);
    }

    private void requireAdmin(HttpSession session) {
        Object role = session != null ? session.getAttribute(LOGIN_USER_ROLE) : null;
        if (!"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role is required.");
        }
    }

    private String normalize(String value) {
        return value != null ? value : "";
    }
}

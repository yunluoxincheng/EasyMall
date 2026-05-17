package org.ruikun.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.enums.UserRole;
import org.ruikun.infrastructure.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        // 跳过不需要验证的路径
        if (requestURI.startsWith("/api/user/login") ||
                requestURI.startsWith("/api/user/register") ||
                requestURI.startsWith("/api/product/") ||
                requestURI.startsWith("/api/category/") ||
                ("GET".equals(method) && requestURI.startsWith("/api/comment/product/")) ||
                ("GET".equals(method) && requestURI.startsWith("/api/comment/count/")) ||
                ("GET".equals(method) && requestURI.startsWith("/api/comment/rating/")) ||
                ("POST".equals(method) && "/api/payment/callback".equals(requestURI)) ||
                requestURI.startsWith("/actuator/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = request.getHeader("Authorization");
        boolean isAuthenticated = false;

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);

            try {
                String username = jwtUtil.getUsernameFromToken(token);
                Long userId = jwtUtil.getUserIdFromToken(token);
                Integer role = jwtUtil.getRoleFromToken(token);

                // 检查token是否过期
                if (!jwtUtil.isTokenExpired(token)) {
                    // 可选：检查Redis中的token
                    String redisToken = redisTemplate.opsForValue().get("login:" + userId);
                    if (redisToken != null && redisToken.equals(token)) {
                        // 根据角色设置权限
Collection<SimpleGrantedAuthority> authorities = Collections.emptyList();
                        if (UserRole.isAdmin(role)) {
                            authorities = Collections.singletonList(new SimpleGrantedAuthority(UserRole.ADMIN.getAuthority()));
                        }

                        // 创建认证对象
                        UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // 设置到Security上下文
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        // 将用户信息放入request，供Controller使用
                        request.setAttribute("userId", userId);
                        request.setAttribute("username", username);
                        request.setAttribute("role", role);

                        isAuthenticated = true;
                    }
                }
            } catch (Exception e) {
                log.error("Token验证失败: {}", e.getMessage());
            }
        }

        // 如果未认证且不是公开接口，返回 401
        if (!isAuthenticated) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"code\":\"UNAUTHORIZED\",\"message\":\"未授权，请先登录\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
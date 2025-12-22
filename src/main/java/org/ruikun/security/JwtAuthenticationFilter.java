package org.ruikun.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

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

        // 跳过不需要验证的路径
        if (requestURI.startsWith("/api/user/login") ||
            requestURI.startsWith("/api/user/register") ||
            requestURI.startsWith("/api/product/") ||
            requestURI.startsWith("/api/category/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);

            try {
                String username = jwtUtil.getUsernameFromToken(token);
                Long userId = jwtUtil.getUserIdFromToken(token);

                // 检查token是否过期
                if (!jwtUtil.isTokenExpired(token)) {
                    // 可选：检查Redis中的token
                    String redisToken = redisTemplate.opsForValue().get("login:" + userId);
                    if (redisToken != null && redisToken.equals(token)) {
                        // 创建认证对象
                        UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, null);
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // 设置到Security上下文
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        // 将用户信息放入request，供Controller使用
                        request.setAttribute("userId", userId);
                        request.setAttribute("username", username);
                    }
                }
            } catch (Exception e) {
                log.error("Token验证失败: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
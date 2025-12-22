package org.ruikun.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.dto.CartAddDTO;
import org.ruikun.dto.CartUpdateDTO;
import org.ruikun.service.ICartService;
import org.ruikun.utils.JwtUtil;
import org.ruikun.vo.CartVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final ICartService cartService;
    private final JwtUtil jwtUtil;

    @GetMapping("/list")
    public Result<List<CartVO>> getCartList(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        List<CartVO> cartList = cartService.getCartList(userId);
        return Result.success(cartList);
    }

    @GetMapping("/count")
    public Result<Integer> getCartCount(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        Integer count = cartService.getCartCount(userId);
        return Result.success(count);
    }

    @PostMapping("/add")
    public Result<?> addToCart(@RequestBody @Validated CartAddDTO cartAddDTO,
                               HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        cartService.addToCart(userId, cartAddDTO);
        return Result.success("添加成功");
    }

    @PutMapping("/{cartId}")
    public Result<?> updateCartItem(@PathVariable Long cartId,
                                    @RequestBody @Validated CartUpdateDTO cartUpdateDTO,
                                    HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        cartService.updateCartItem(userId, cartId, cartUpdateDTO);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{cartId}")
    public Result<?> deleteCartItem(@PathVariable Long cartId,
                                    HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        cartService.deleteCartItem(userId, cartId);
        return Result.success("删除成功");
    }

    @DeleteMapping("/batch")
    public Result<?> batchDeleteCartItems(@RequestBody List<Long> cartIds,
                                          HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        cartService.batchDeleteCartItems(userId, cartIds);
        return Result.success("删除成功");
    }

    @PutMapping("/selectAll/{selected}")
    public Result<?> selectAll(@PathVariable Boolean selected,
                               HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        cartService.selectAll(userId, selected);
        return Result.success("操作成功");
    }

    @PutMapping("/batchSelect/{selected}")
    public Result<?> batchSelect(@PathVariable Boolean selected,
                                 @RequestBody List<Long> cartIds,
                                 HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        cartService.batchSelect(userId, cartIds, selected);
        return Result.success("操作成功");
    }

    private Long getUserIdFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.getUserIdFromToken(token);
    }
}
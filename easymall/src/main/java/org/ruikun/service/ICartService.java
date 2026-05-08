package org.ruikun.service;

import org.ruikun.dto.CartAddDTO;
import org.ruikun.dto.CartUpdateDTO;
import org.ruikun.vo.CartVO;

import java.util.List;

public interface ICartService {
    List<CartVO> getCartList(Long userId);

    void addToCart(Long userId, CartAddDTO cartAddDTO);

    void updateCartItem(Long userId, Long cartId, CartUpdateDTO cartUpdateDTO);

    void deleteCartItem(Long userId, Long cartId);

    void batchDeleteCartItems(Long userId, List<Long> cartIds);

    void selectAll(Long userId, Boolean selected);

    void batchSelect(Long userId, List<Long> cartIds, Boolean selected);

    Integer getCartCount(Long userId);
}
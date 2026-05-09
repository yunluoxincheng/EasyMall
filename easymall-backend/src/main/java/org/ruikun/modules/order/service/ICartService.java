package org.ruikun.modules.order.service;

import org.ruikun.modules.order.dto.CartAddDTO;
import org.ruikun.modules.order.dto.CartUpdateDTO;
import org.ruikun.modules.order.vo.CartVO;

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
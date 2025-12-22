package org.ruikun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.ruikun.dto.CartAddDTO;
import org.ruikun.dto.CartUpdateDTO;
import org.ruikun.entity.Cart;
import org.ruikun.entity.Product;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.CartMapper;
import org.ruikun.mapper.ProductMapper;
import org.ruikun.service.ICartService;
import org.ruikun.vo.CartVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements ICartService {

    private final CartMapper cartMapper;
    private final ProductMapper productMapper;

    @Override
    public List<CartVO> getCartList(Long userId) {
        List<Cart> cartList = cartMapper.getCartByUserId(userId);
        return cartList.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public void addToCart(Long userId, CartAddDTO cartAddDTO) {
        Product product = productMapper.selectById(cartAddDTO.getProductId());
        if (product == null || product.getStatus() != 1) {
            throw new BusinessException("商品不存在或已下架");
        }

        if (product.getStock() < cartAddDTO.getQuantity()) {
            throw new BusinessException("商品库存不足");
        }

        Cart existCart = cartMapper.getCartByUserIdAndProductId(userId, cartAddDTO.getProductId());
        if (existCart != null) {
            cartMapper.updateCartByUserIdAndProductId(userId, cartAddDTO.getProductId(), cartAddDTO.getQuantity());
        } else {
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setProductId(cartAddDTO.getProductId());
            cart.setProductName(product.getName());
            cart.setProductImage(product.getImage());
            cart.setProductPrice(product.getPrice());
            cart.setQuantity(cartAddDTO.getQuantity());
            cart.setTotalPrice(product.getPrice().multiply(new BigDecimal(cartAddDTO.getQuantity())));
            cart.setSelected(true);
            cartMapper.insert(cart);
        }
    }

    @Override
    public void updateCartItem(Long userId, Long cartId, CartUpdateDTO cartUpdateDTO) {
        Cart cart = cartMapper.selectById(cartId);
        if (cart == null || !cart.getUserId().equals(userId)) {
            throw new BusinessException("购物车记录不存在");
        }

        if (cartUpdateDTO.getQuantity() != null) {
            Product product = productMapper.selectById(cart.getProductId());
            if (product.getStock() < cartUpdateDTO.getQuantity()) {
                throw new BusinessException("商品库存不足");
            }
            cart.setQuantity(cartUpdateDTO.getQuantity());
            cart.setTotalPrice(cart.getProductPrice().multiply(new BigDecimal(cartUpdateDTO.getQuantity())));
        }

        if (cartUpdateDTO.getSelected() != null) {
            cart.setSelected(cartUpdateDTO.getSelected());
        }

        cartMapper.updateById(cart);
    }

    @Override
    public void deleteCartItem(Long userId, Long cartId) {
        Cart cart = cartMapper.selectById(cartId);
        if (cart == null || !cart.getUserId().equals(userId)) {
            throw new BusinessException("购物车记录不存在");
        }
        cartMapper.deleteById(cartId);
    }

    @Override
    public void batchDeleteCartItems(Long userId, List<Long> cartIds) {
        LambdaQueryWrapper<Cart> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Cart::getUserId, userId).in(Cart::getId, cartIds);
        cartMapper.delete(wrapper);
    }

    @Override
    public void selectAll(Long userId, Boolean selected) {
        cartMapper.batchUpdateSelected(userId, null, selected);
    }

    @Override
    public void batchSelect(Long userId, List<Long> cartIds, Boolean selected) {
        cartMapper.batchUpdateSelected(userId, cartIds, selected);
    }

    @Override
    public Integer getCartCount(Long userId) {
        LambdaQueryWrapper<Cart> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Cart::getUserId, userId);
        return Math.toIntExact(cartMapper.selectCount(wrapper));
    }

    private CartVO convertToVO(Cart cart) {
        CartVO cartVO = new CartVO();
        BeanUtils.copyProperties(cart, cartVO);
        return cartVO;
    }
}
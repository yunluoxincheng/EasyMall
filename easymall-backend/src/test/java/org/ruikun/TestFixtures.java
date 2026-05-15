package org.ruikun;

import org.ruikun.enums.OrderStatus;
import org.ruikun.modules.comment.entity.Comment;
import org.ruikun.modules.favorite.entity.Favorite;
import org.ruikun.modules.order.entity.Cart;
import org.ruikun.modules.order.entity.Order;
import org.ruikun.modules.order.entity.OrderItem;
import org.ruikun.modules.payment.entity.PaymentOrder;
import org.ruikun.modules.product.entity.Category;
import org.ruikun.modules.product.entity.Product;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.user.entity.UserSign;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class TestFixtures {

    private TestFixtures() {}

    public static User createTestUser() {
        User user = new User();
        user.setId(100L);
        user.setUsername("testuser");
        user.setPassword("$2a$10$dummyhashedpassword");
        user.setNickname("测试用户");
        user.setPhone("13800000000");
        user.setEmail("test@example.com");
        user.setRole(0);
        user.setStatus(1);
        user.setPoints(100);
        user.setLevel(1);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        return user;
    }

    public static User createTestAdmin() {
        User admin = createTestUser();
        admin.setId(200L);
        admin.setUsername("admin");
        admin.setRole(1);
        return admin;
    }

    public static Product createTestProduct() {
        Product product = new Product();
        product.setId(5L);
        product.setName("测试商品");
        product.setSubtitle("测试副标题");
        product.setPrice(new BigDecimal("99.00"));
        product.setOriginalPrice(new BigDecimal("129.00"));
        product.setStock(100);
        product.setSales(50);
        product.setImage("test.jpg");
        product.setCategoryId(1L);
        product.setStatus(1);
        product.setCreateTime(LocalDateTime.now());
        product.setUpdateTime(LocalDateTime.now());
        return product;
    }

    public static Product createTestProduct(int stock) {
        Product product = createTestProduct();
        product.setStock(stock);
        return product;
    }

    public static Order createTestOrder() {
        Order order = new Order();
        order.setId(10L);
        order.setOrderNo("ORD20240515001");
        order.setUserId(100L);
        order.setTotalAmount(new BigDecimal("99.00"));
        order.setPayAmount(new BigDecimal("99.00"));
        order.setStatus(OrderStatus.PENDING_PAYMENT.getCode());
        order.setReceiverName("张三");
        order.setReceiverPhone("13800000000");
        order.setReceiverAddress("测试地址");
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        return order;
    }

    public static OrderItem createTestOrderItem() {
        OrderItem item = new OrderItem();
        item.setId(1L);
        item.setOrderId(10L);
        item.setProductId(5L);
        item.setProductName("测试商品");
        item.setProductImage("test.jpg");
        item.setProductPrice(new BigDecimal("99.00"));
        item.setQuantity(1);
        item.setTotalPrice(new BigDecimal("99.00"));
        return item;
    }

    public static Cart createTestCart() {
        Cart cart = new Cart();
        cart.setId(1L);
        cart.setUserId(100L);
        cart.setProductId(5L);
        cart.setProductName("测试商品");
        cart.setProductImage("test.jpg");
        cart.setProductPrice(new BigDecimal("99.00"));
        cart.setQuantity(1);
        cart.setTotalPrice(new BigDecimal("99.00"));
        cart.setSelected(true);
        return cart;
    }

    public static Favorite createTestFavorite() {
        Favorite favorite = new Favorite();
        favorite.setId(1L);
        favorite.setUserId(100L);
        favorite.setProductId(5L);
        favorite.setProductName("测试商品");
        favorite.setProductImage("test.jpg");
        favorite.setProductPrice("99.00");
        return favorite;
    }

    public static Comment createTestComment() {
        Comment comment = new Comment();
        comment.setId(1L);
        comment.setUserId(100L);
        comment.setProductId(5L);
        comment.setOrderId(10L);
        comment.setContent("很好用");
        comment.setRating(5);
        comment.setShowStatus(1);
        comment.setCreateTime(LocalDateTime.now());
        return comment;
    }

    public static PaymentOrder createTestPaymentOrder() {
        PaymentOrder payment = new PaymentOrder();
        payment.setPaymentNo("PAY123");
        payment.setOrderId(10L);
        payment.setOrderNo("ORD20240515001");
        payment.setUserId(100L);
        payment.setAmount(new BigDecimal("99.00"));
        payment.setChannel("MOCK");
        payment.setStatus("PENDING");
        payment.setCreateTime(LocalDateTime.now());
        return payment;
    }

    public static Category createTestCategory() {
        Category category = new Category();
        category.setId(1L);
        category.setName("测试分类");
        category.setParentId(0L);
        category.setLevel(1);
        category.setStatus(1);
        category.setSort(1);
        return category;
    }

    public static UserSign createTestUserSign() {
        UserSign sign = new UserSign();
        sign.setId(1L);
        sign.setUserId(100L);
        sign.setSignDate(LocalDate.now());
        sign.setContinuousDays(1);
        sign.setPointsEarned(10);
        sign.setCreateTime(LocalDateTime.now());
        return sign;
    }
}

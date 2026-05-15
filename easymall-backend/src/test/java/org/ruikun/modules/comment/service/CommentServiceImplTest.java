package org.ruikun.modules.comment.service;

import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.common.ResponseCode;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.comment.dto.CommentCreateDTO;
import org.ruikun.modules.comment.entity.Comment;
import org.ruikun.modules.comment.mapper.CommentMapper;
import org.ruikun.modules.order.entity.Order;
import org.ruikun.modules.order.entity.OrderItem;
import org.ruikun.modules.order.mapper.OrderItemMapper;
import org.ruikun.modules.order.mapper.OrderMapper;
import org.ruikun.modules.points.service.IPointsService;
import org.ruikun.modules.user.mapper.UserMapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CommentServiceImpl 单元测试")
class CommentServiceImplTest {

    private static final Long USER_ID = 100L;
    private static final Long ORDER_ID = 200L;
    private static final Long PRODUCT_ID = 300L;

    @BeforeAll
    static void initMybatisPlusLambdaCache() {
        Configuration configuration = new Configuration();

        MapperBuilderAssistant assistant1 = new MapperBuilderAssistant(configuration, "");
        assistant1.setCurrentNamespace("org.ruikun.modules.comment.mapper.CommentMapper");
        TableInfoHelper.initTableInfo(assistant1, Comment.class);

        MapperBuilderAssistant assistant2 = new MapperBuilderAssistant(configuration, "");
        assistant2.setCurrentNamespace("org.ruikun.modules.order.mapper.OrderItemMapper");
        TableInfoHelper.initTableInfo(assistant2, OrderItem.class);
    }

    @Mock
    private CommentMapper commentMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderItemMapper orderItemMapper;

    @Mock
    private IPointsService pointsService;

    @InjectMocks
    private CommentServiceImpl commentService;

    @Captor
    private ArgumentCaptor<Comment> commentCaptor;

    private CommentCreateDTO buildDTO(Integer rating) {
        CommentCreateDTO dto = new CommentCreateDTO();
        dto.setProductId(PRODUCT_ID);
        dto.setOrderId(ORDER_ID);
        dto.setContent("商品质量很好，值得购买");
        dto.setRating(rating);
        dto.setImages("img1.jpg,img2.jpg");
        return dto;
    }

    private Order buildCompletedOrder() {
        Order order = new Order();
        order.setId(ORDER_ID);
        order.setUserId(USER_ID);
        order.setStatus(3);
        return order;
    }

    private Order buildOrderWithStatus(Integer status) {
        Order order = new Order();
        order.setId(ORDER_ID);
        order.setUserId(USER_ID);
        order.setStatus(status);
        return order;
    }

    private OrderItem buildOrderItem() {
        OrderItem item = new OrderItem();
        item.setId(400L);
        item.setOrderId(ORDER_ID);
        item.setProductId(PRODUCT_ID);
        return item;
    }

    @Nested
    @DisplayName("createComment")
    class CreateComment {

        @Test
        @DisplayName("4.2 创建评论成功：订单已完成，评分合法，商品在订单中，未评过")
        void createCommentSuccess() {
            CommentCreateDTO dto = buildDTO(4);
            Order order = buildCompletedOrder();
            OrderItem orderItem = buildOrderItem();

            when(orderMapper.selectById(ORDER_ID)).thenReturn(order);
            when(orderItemMapper.selectOne(any())).thenReturn(orderItem);
            when(commentMapper.selectCount(any())).thenReturn(0L);
            when(commentMapper.insert(any(Comment.class))).thenAnswer(invocation -> {
                Comment c = invocation.getArgument(0);
                c.setId(500L);
                return 1;
            });

            Long commentId = commentService.createComment(USER_ID, dto);

            assertNotNull(commentId);
            assertEquals(500L, commentId);

            verify(commentMapper).insert(commentCaptor.capture());
            Comment saved = commentCaptor.getValue();
            assertEquals(USER_ID, saved.getUserId());
            assertEquals(PRODUCT_ID, saved.getProductId());
            assertEquals(ORDER_ID, saved.getOrderId());
            assertEquals(4, saved.getRating());
            assertEquals(1, saved.getShowStatus());

            verify(pointsService).addPointsForComment(USER_ID, ORDER_ID, PRODUCT_ID);
        }

        @Test
        @DisplayName("4.3 订单未完成 (status != 3) -> 抛出 ORDER_NOT_COMPLETED")
        void createCommentOrderNotCompleted() {
            CommentCreateDTO dto = buildDTO(4);
            Order order = buildOrderWithStatus(1);
            when(orderMapper.selectById(ORDER_ID)).thenReturn(order);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> commentService.createComment(USER_ID, dto));

            assertEquals(ResponseCode.ORDER_NOT_COMPLETED, ex.getResponseCode());
            verify(orderItemMapper, never()).selectOne(any());
            verify(commentMapper, never()).selectCount(any());
            verify(commentMapper, never()).insert(any(Comment.class));
            verify(pointsService, never()).addPointsForComment(anyLong(), anyLong(), anyLong());
        }

        @Test
        @DisplayName("评分 < 1 -> 抛出 COMMENT_RATING_INVALID")
        void createCommentRatingTooLow() {
            CommentCreateDTO dto = buildDTO(0);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> commentService.createComment(USER_ID, dto));

            assertEquals(ResponseCode.COMMENT_RATING_INVALID, ex.getResponseCode());
            verify(commentMapper, never()).insert(any(Comment.class));
            verify(pointsService, never()).addPointsForComment(anyLong(), anyLong(), anyLong());
        }

        @Test
        @DisplayName("已评论过该商品 -> 抛出 COMMENT_ALREADY_EXISTS")
        void createCommentAlreadyExists() {
            CommentCreateDTO dto = buildDTO(4);
            Order order = buildCompletedOrder();
            OrderItem orderItem = buildOrderItem();

            when(orderMapper.selectById(ORDER_ID)).thenReturn(order);
            when(orderItemMapper.selectOne(any())).thenReturn(orderItem);
            when(commentMapper.selectCount(any())).thenReturn(1L);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> commentService.createComment(USER_ID, dto));

            assertEquals(ResponseCode.COMMENT_ALREADY_EXISTS, ex.getResponseCode());
            verify(commentMapper, never()).insert(any(Comment.class));
            verify(pointsService, never()).addPointsForComment(anyLong(), anyLong(), anyLong());
        }
    }
}

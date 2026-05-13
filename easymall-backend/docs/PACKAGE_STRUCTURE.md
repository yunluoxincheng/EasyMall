# EasyMall 项目包结构说明文档

> 本文档详细说明了 EasyMall 项目的软件包结构和各模块的功能作用，帮助开发者快速理解项目架构。

## 目录

- [项目整体架构](#项目整体架构)
- [包结构概览](#包结构概览)
- [各包详细说明](#各包详细说明)
- [数据流向与调用关系](#数据流向与调用关系)
- [开发规范与最佳实践](#开发规范与最佳实践)

---

## 项目整体架构

### 架构模式

EasyMall 采用经典的三层架构设计：

```
┌─────────────────────────────────────────────────────────┐
│                      表现层 (Controller)                   │
│  接收 HTTP 请求、参数校验、返回 JSON 响应                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                       业务层 (Service)                     │
│  处理业务逻辑、事务管理、调用数据访问层                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                       持久层 (Mapper)                      │
│  数据库访问、SQL 执行、结果映射                              │
└─────────────────────────────────────────────────────────┘
```

### 技术栈

- **框架**: Spring Boot 4.0.1
- **安全**: Spring Security + JWT
- **ORM**: MyBatis Plus
- **数据库**: MySQL 8
- **缓存**: Redis

---

## 包结构概览

```
org.ruikun/
├── common/              # 公共类和通用组件
├── config/              # 配置类
├── controller/          # 控制器层（用户端接口）
│   └── admin/          # 后台管理接口
├── dto/                # 数据传输对象
│   └── admin/          # 后台管理专用 DTO
├── entity/             # 实体类（对应数据库表）
├── enums/              # 枚举类
├── exception/          # 自定义异常
├── mapper/             # 数据访问层接口
├── security/           # 安全配置和过滤器
├── service/            # 业务逻辑接口
│   └── impl/           # 业务逻辑实现类
├── task/               # 定时任务
├── util/               # 工具类
├── utils/              # 工具类（备用）
└── vo/                 # 视图对象
    └── admin/          # 后台管理专用 VO
```

---

## 各包详细说明

### 1. `common` - 公共类包

**功能**: 存放项目中的公共类和通用组件，供所有模块共享使用。

**主要类**:

| 类名 | 功能说明 |
|------|----------|
| `Result<T>` | 统一 API 响应封装类，包含成功/失败状态、消息、数据等 |
| `PageRequest` | 分页查询请求参数封装 |
| `PageResult<T>` | 分页查询结果封装，包含记录列表和总数 |
| `ResponseCode` | 业务状态码枚举，定义各种响应状态 |
| `ErrorDetail` | 错误详情类，用于描述具体的验证错误 |

**代码示例**:

```java
// 成功响应
return Result.success(productData);

// 失败响应
return Result.error(ResponseCode.PRODUCT_NOT_FOUND);

// 带数据的分页响应
PageResult<ProductVO> pageResult = productService.getProductPage(pageRequest);
return Result.success(pageResult);
```

---

### 2. `config` - 配置类包

**功能**: 存放 Spring Boot 配置类，用于配置框架行为和组件。

**主要类**:

| 类名 | 功能说明 |
|------|----------|
| `MyBatisPlusConfig` | MyBatis Plus 配置，实现自动填充（创建时间、更新时间等） |
| `FileUploadProperties` | 文件上传相关配置 |

**代码示例**:

```java
@Component
public class MyBatisPlusConfig implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        // 插入时自动填充创建时间和更新时间
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

---

### 3. `controller` - 控制器层包

**功能**: 处理 HTTP 请求，调用业务逻辑，返回 JSON 响应。

**子包结构**:

#### `controller/` - 用户端接口

提供普通用户可访问的接口，如商品浏览、购物车、订单等。

| 控制器 | 功能 |
|--------|------|
| `UserController` | 用户注册、登录、信息管理 |
| `ProductController` | 商品查询、搜索、详情 |
| `CategoryController` | 商品分类查询 |
| `CartController` | 购物车管理 |
| `OrderController` | 订单创建、查询 |
| `CommentController` | 商品评论 |
| `FavoriteController` | 收藏管理 |
| `SignInController` | 用户签到 |
| `MemberController` | 会员信息查询 |
| `PointsController` | 积分查询 |
| `PointsExchangeController` | 积分兑换 |
| `CouponController` | 优惠券管理 |
| `FileUploadController` | 文件上传 |
| `DevToolsController` | 开发工具接口 |

**代码示例**:

```java
@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {

    private final IProductService productService;

    @GetMapping("/{id}")
    public Result<ProductVO> getProductById(@PathVariable Long id) {
        ProductVO product = productService.getProductById(id);
        return Result.success(product);
    }
}
```

#### `controller/admin/` - 后台管理接口

提供管理员专用的后台管理功能，需要 ADMIN 角色权限。

| 控制器 | 功能 |
|--------|------|
| `AdminProductController` | 商品管理（增删改查、上下架） |
| `AdminCategoryController` | 分类管理 |
| `AdminOrderController` | 订单管理 |
| `AdminUserController` | 用户管理 |
| `AdminCommentController` | 评论审核 |
| `AdminMemberLevelController` | 会员等级管理 |
| `AdminPointsProductController` | 积分商品管理 |
| `CouponAdminController` | 优惠券管理 |

**权限控制**:

```java
@RestController
@RequestMapping("/api/admin/product")
@RequiredArgsConstructor
public class AdminProductController {

    // 需要管理员权限才能访问
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Result<Void> saveProduct(@Valid @RequestBody ProductSaveDTO dto) {
        // ...
    }
}
```

---

### 4. `dto` - 数据传输对象包

**功能**: 封装客户端传入的数据，用于接收和验证请求参数。

**命名规范**: `XxxDTO` 或 `XxxRequest`

**主要 DTO**:

- `UserRegisterDTO` - 用户注册数据
- `UserLoginDTO` - 用户登录数据
- `CartAddDTO` - 添加购物车数据
- `ProductDTO` - 商品信息传输
- `CommentCreateDTO` - 创建评论数据

**子包 `dto/admin/`**: 后台管理专用的 DTO

- `ProductSaveDTO` - 后台保存商品
- `ProductQueryDTO` - 后台查询商品
- `OrderQueryDTO` - 后台查询订单
- `UserQueryDTO` - 后台查询用户

**代码示例**:

```java
@Data
public class CartAddDTO {
    @NotNull(message = "商品ID不能为空")
    private Long productId;

    @Min(value = 1, message = "数量至少为1")
    private Integer quantity;
}

// 使用
@PostMapping("/cart/add")
public Result<Void> addToCart(@Valid @RequestBody CartAddDTO dto) {
    cartService.addToCart(dto);
    return Result.success();
}
```

---

### 5. `entity` - 实体类包

**功能**: 对应数据库表的实体类，使用 MyBatis Plus 注解进行映射。

**命名规范**: 与数据库表名对应（通常去掉下划线）

**主要实体**:

| 实体类 | 对应表 | 说明 |
|--------|--------|------|
| `User` | user | 用户信息 |
| `Product` | product | 商品信息 |
| `Category` | category | 商品分类 |
| `Cart` | cart | 购物车 |
| `Order` / `OrderItem` | order / order_item | 订单及明细 |
| `Comment` | comment | 商品评论 |
| `MemberLevel` | member_level | 会员等级 |
| `PointsRecord` | points_record | 积分记录 |
| `PointsExchange` | points_exchange | 积分兑换记录 |
| `Favorite` | favorite | 收藏 |

**代码示例**:

```java
@Data
@TableName("product")
public class Product {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private BigDecimal price;

    private Integer stock;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
```

**关键注解说明**:

- `@TableName`: 指定对应的数据库表名
- `@TableId`: 标识主键，`type = IdType.AUTO` 表示自增
- `@TableField`: 字段映射，`fill` 设置自动填充策略
- `@TableLogic`: 逻辑删除字段标记

---

### 6. `enums` - 枚举类包

**功能**: 定义项目中的枚举类型，提供类型安全的常量。

**主要枚举**:

- `PointsTypeEnum` - 积分类型（签到、购物、兑换等）

**代码示例**:

```java
@Getter
@AllArgsConstructor
public enum PointsTypeEnum {
    SIGN_IN("签到", 1),
    SHOPPING("购物", 2),
    EXCHANGE("兑换", -1);

    private final String description;
    private final Integer value;
}
```

---

### 7. `exception` - 异常类包

**功能**: 自定义异常类，用于处理业务逻辑中的错误情况。

**主要类**:

| 类名 | 功能说明 |
|------|----------|
| `BusinessException` | 业务异常基类 |

**代码示例**:

```java
// 抛出业务异常
if (product.getStock() < quantity) {
    throw new BusinessException(ResponseCode.PRODUCT_OUT_OF_STOCK, "库存不足");
}

// 在全局异常处理器中捕获并转换为统一响应
@ExceptionHandler(BusinessException.class)
public Result<Void> handleBusinessException(BusinessException e) {
    return Result.error(e.getResponseCode(), e.getMessage());
}
```

---

### 8. `mapper` - 数据访问层包

**功能**: MyBatis Plus 的 Mapper 接口，负责数据库 CRUD 操作。

**命名规范**: `XxxMapper`

**主要 Mapper**:

- `UserMapper` - 用户数据访问
- `ProductMapper` - 商品数据访问
- `OrderMapper` - 订单数据访问
- `CartMapper` - 购物车数据访问
- `CategoryMapper` - 分类数据访问

**代码示例**:

```java
@Mapper
public interface ProductMapper extends BaseMapper<Product> {
    // BaseMapper 已提供基本的 CRUD 方法
    // 可以在这里定义自定义查询方法

    @Select("SELECT * FROM product WHERE status = 1 ORDER BY sales DESC LIMIT #{limit}")
    List<Product> selectHotProducts(@Param("limit") int limit);
}
```

---

### 9. `security` - 安全配置包

**功能**: Spring Security 配置和 JWT 认证过滤器。

**主要类**:

| 类名 | 功能说明 |
|------|----------|
| `SecurityConfig` | Spring Security 配置类 |
| `JwtAuthenticationFilter` | JWT 认证过滤器 |

**代码示例**:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/user/login", "/api/user/register").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

---

### 10. `service` - 业务逻辑层包

**功能**: 定义业务逻辑接口，处理核心业务规则。

**子包 `service/impl/`**: 业务逻辑实现类

**命名规范**: 接口 `IXxxService`，实现类 `XxxServiceImpl`

**主要 Service**:

| 接口 | 实现类 | 功能 |
|------|--------|------|
| `IUserService` | `UserServiceImpl` | 用户业务逻辑 |
| `IProductService` | `ProductServiceImpl` | 商品业务逻辑 |
| `ICartService` | `CartServiceImpl` | 购物车业务逻辑 |
| `IOrderService` | `OrderServiceImpl` | 订单业务逻辑 |
| `IMemberService` | `MemberServiceImpl` | 会员业务逻辑 |
| `ISignInService` | `SignInServiceImpl` | 签到业务逻辑 |
| `ICommentService` | `CommentServiceImpl` | 评论业务逻辑 |

**代码示例**:

```java
// 接口定义
public interface IProductService {
    ProductVO getProductById(Long id);
    PageResult<ProductVO> getProductPage(PageRequest pageRequest);
    void updateSales(Long productId, Integer quantity);
}

// 实现类
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {

    private final ProductMapper productMapper;

    @Override
    public ProductVO getProductById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND);
        }
        return BeanUtil.copyProperties(product, ProductVO.class);
    }
}
```

---

### 11. `task` - 定时任务包

**功能**: 存放定时任务相关的类。

**主要类**:

- `CouponScheduledTask` - 优惠券相关的定时任务

**代码示例**:

```java
@Component
public class CouponScheduledTask {

    @Scheduled(cron = "0 0 * * * ?")  // 每小时执行
    public void updateCouponStatus() {
        // 更新优惠券状态
    }
}
```

---

### 12. `util` / `utils` - 工具类包

**功能**: 存放通用的工具方法类。

**主要类**:

| 类名 | 功能说明 |
|------|----------|
| `TraceIdUtil` | 请求追踪 ID 生成和管理 |
| `JwtUtil` | JWT 令牌生成和解析 |

**代码示例**:

```java
public class TraceIdUtil {

    public static String getOrCreate() {
        String traceId = MDC.get("traceId");
        if (traceId == null) {
            traceId = generate();
            MDC.put("traceId", traceId);
        }
        return traceId;
    }

    public static String generate() {
        return UUID.randomUUID().toString()
            .replace("-", "").substring(0, 16);
    }
}
```

---

### 13. `vo` - 视图对象包

**功能**: 封装返回给客户端的数据，按前端展示需求定制。

**命名规范**: `XxxVO`

**主要 VO**:

- `UserVO` - 用户信息视图
- `ProductVO` - 商品信息视图
- `CartVO` - 购物车视图
- `OrderVO` - 订单视图
- `LoginVO` - 登录响应视图（包含 JWT）

**子包 `vo/admin/`**: 后台管理专用 VO

- `AdminProductVO` - 后台商品视图
- `AdminOrderVO` - 后台订单视图

**代码示例**:

```java
@Data
public class ProductVO {
    private Long id;
    private String name;
    private BigDecimal price;
    private String categoryName;  // 关联查询的分类名

    // 可以包含不属于原始表的计算字段
    public String getDiscount() {
        // 计算折扣信息
    }
}
```

---

## 数据流向与调用关系

### 请求处理流程

```
用户请求
   │
   ▼
┌─────────────────────────────────────┐
│  SecurityConfig (JWT 验证)           │
│  - 公开接口直接通过                  │
│  - 受保护接口验证 JWT                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Controller 层                       │
│  - 接收请求参数 (@RequestBody, etc)  │
│  - 参数校验 (@Valid)                 │
│  - 调用 Service                     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Service 层                          │
│  - 业务逻辑处理                      │
│  - 事务管理 (@Transactional)         │
│  - 调用 Mapper                       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Mapper 层                           │
│  - 执行 SQL                          │
│  - 返回 Entity                       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  数据库                              │
└─────────────────────────────────────┘
```

### 数据转换链路

```
数据库 (Entity)
    │
    ▼ Mapper 返回
Entity
    │
    ▼ Service 转换
DTO / VO
    │
    ▼ Controller 返回
Result<VO>
    │
    ▼ 序列化
JSON 响应
```

**转换示例**:

```java
// 1. Mapper 查询返回 Entity
Product entity = productMapper.selectById(id);

// 2. Service 转换为 VO
ProductVO vo = BeanUtil.copyProperties(entity, ProductVO.class);
vo.setCategoryName(categoryMapper.selectById(entity.getCategoryId()).getName());

// 3. Controller 返回统一响应
return Result.success(vo);
```

---

## 开发规范与最佳实践

### 1. 分层职责明确

| 层次 | 职责 | 不应做的事情 |
|------|------|--------------|
| Controller | 接收请求、参数校验、返回响应 | 不应包含业务逻辑 |
| Service | 业务逻辑处理、事务管理 | 不直接访问 HTTP 请求/响应 |
| Mapper | 数据库访问 | 不包含业务逻辑 |

### 2. 命名规范

- **Controller**: `XxxController`
- **Service 接口**: `IXxxService`
- **Service 实现**: `XxxServiceImpl`
- **Mapper**: `XxxMapper`
- **Entity**: `Xxx` (与表对应)
- **DTO**: `XxxDTO` 或 `XxxRequest`
- **VO**: `XxxVO` 或 `XxxResponse`

### 3. 依赖注入

使用 `@RequiredArgsConstructor` 进行构造器注入：

```java
@RestController
@RequiredArgsConstructor
public class ProductController {
    private final IProductService productService;
    // Spring 自动注入，无需 @Autowired
}
```

### 4. 异常处理

业务异常使用 `BusinessException`：

```java
if (product == null) {
    throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND);
}
```

### 5. 统一响应

所有接口统一使用 `Result<T>` 封装：

```java
return Result.success(data);
return Result.error(ResponseCode.ERROR);
```

### 6. 日志追踪

每个请求自动生成 `traceId`，用于日志关联和问题追踪。

---

## 总结

EasyMall 项目采用标准的三层架构，各包职责清晰：

- **controller**: 处理 HTTP 请求
- **service**: 处理业务逻辑
- **mapper**: 数据库访问
- **entity/dto/vo**: 数据对象转换
- **common**: 公共组件
- **config/security**: 配置和安全

理解这些包的作用和相互关系，有助于快速定位代码、进行功能开发和问题排查。

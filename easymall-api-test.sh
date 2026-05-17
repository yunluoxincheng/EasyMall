#!/bin/bash
# EasyMall API 全接口 curl 测试

BASE="http://127.0.0.1:8080"
PASS=0
FAIL=0
FAIL_LIST=""

green()  { printf "\033[32m%s\033[0m\n" "$1"; }
red()    { printf "\033[31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

test_api() {
  local method="$1"
  local url="$2"
  local data="$3"
  local token="$4"
  local expect="$5"
  [ -z "$expect" ] && expect=200

  local args=(-s -w '\n%{http_code}' -o /tmp/api_resp.json)
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")

  local code
  case "$method" in
    GET)
      code=$(curl "${args[@]}" "$BASE$url" | tail -1)
      ;;
    POST)
      args+=(-X POST -H "Content-Type: application/json")
      [ -n "$data" ] && args+=(-d "$data")
      code=$(curl "${args[@]}" "$BASE$url" | tail -1)
      ;;
    PUT)
      args+=(-X PUT -H "Content-Type: application/json")
      [ -n "$data" ] && args+=(-d "$data")
      code=$(curl "${args[@]}" "$BASE$url" | tail -1)
      ;;
    DELETE)
      args+=(-X DELETE)
      code=$(curl "${args[@]}" "$BASE$url" | tail -1)
      ;;
  esac

  if [ "$code" = "$expect" ]; then
    green "  PASS  $method $url => $code"
    PASS=$((PASS+1))
  else
    red "  FAIL  $method $url => $code (expected $expect)"
    local body=$(cat /tmp/api_resp.json | head -c 300)
    red "        Response: $body"
    FAIL=$((FAIL+1))
    FAIL_LIST="$FAIL_LIST
  $method $url => $code (expected $expect)"
  fi
}

echo ""
yellow "============================================="
yellow " EasyMall API 接口测试"
yellow "============================================="

# ─────────────────────────────
# 1. 登录获取 Token
# ─────────────────────────────
echo ""
yellow "--- [1] 登录 ---"

test_api POST "/api/user/login" '{"username":"admin","password":"admin123"}' '' '200'
ADMIN_TOKEN=$(grep -oP '"token"\s*:\s*"\K[^"]+' /tmp/api_resp.json)
yellow "  admin token: ${ADMIN_TOKEN:0:20}..."

# 注册测试用户（忽略已存在的情况）
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username":"apitest_user","password":"test123456","confirmPassword":"test123456","nickname":"API测试","phone":"13888888888"}' \
  "$BASE/api/user/register" > /dev/null 2>&1

# 尝试用测试用户登录，失败则回退到 admin token
USER_TOKEN=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username":"apitest_user","password":"test123456"}' \
  "$BASE/api/user/login" | grep -oP '"token"\s*:\s*"\K[^"]+')

if [ -z "$USER_TOKEN" ]; then
  yellow "  注册/登录失败，使用 admin token 进行用户端测试"
  USER_TOKEN="$ADMIN_TOKEN"
else
  yellow "  user token: ${USER_TOKEN:0:20}..."
fi

# ─────────────────────────────
# 2. 商品 & 分类（公开）
# ─────────────────────────────
echo ""
yellow "--- [2] 商品 & 分类（公开） ---"
test_api GET "/api/product/page"
test_api GET "/api/product/page?pageNum=1&pageSize=5"
test_api GET "/api/product/1"
test_api GET "/api/product/hot"
test_api GET "/api/product/new"
test_api GET "/api/product/related?categoryId=1&productId=1"
test_api GET "/api/category/tree"
test_api GET "/api/category/1"
test_api GET "/api/category/level/1"
test_api GET "/api/comment/product/1"
test_api GET "/api/comment/count/1"
test_api GET "/api/comment/rating/1"

# ─────────────────────────────
# 3. 用户信息
# ─────────────────────────────
echo ""
yellow "--- [3] 用户信息 ---"
test_api GET "/api/user/info" '' "$USER_TOKEN"
test_api PUT  "/api/user/info" '{"nickname":"API Test User","phone":"13888888888"}' "$USER_TOKEN"
test_api GET "/api/member/levels" '' "$USER_TOKEN"
test_api GET "/api/member/level" '' "$USER_TOKEN"
test_api GET "/api/member/discount" '' "$USER_TOKEN"

# ─────────────────────────────
# 4. 签到
# ─────────────────────────────
echo ""
yellow "--- [4] 签到 ---"
test_api POST "/api/signin/do" '' "$USER_TOKEN"
test_api GET  "/api/signin/status" '' "$USER_TOKEN"
test_api GET  "/api/signin/continuous" '' "$USER_TOKEN"

# ─────────────────────────────
# 5. 积分
# ─────────────────────────────
echo ""
yellow "--- [5] 积分 ---"
test_api GET "/api/points/records" '' "$USER_TOKEN"
test_api GET "/api/points/exchange/products" '' "$USER_TOKEN"
test_api GET "/api/points/exchange/records" '' "$USER_TOKEN"

# ─────────────────────────────
# 6. 优惠券
# ─────────────────────────────
echo ""
yellow "--- [6] 优惠券 ---"
test_api GET "/api/coupon/templates" '' "$USER_TOKEN"
test_api GET "/api/coupon/my" '' "$USER_TOKEN"
test_api GET "/api/coupon/available?orderAmount=100" '' "$USER_TOKEN"

# ─────────────────────────────
# 7. 收藏
# ─────────────────────────────
echo ""
yellow "--- [7] 收藏 ---"
test_api POST "/api/favorite/toggle/1" '' "$USER_TOKEN"
test_api GET  "/api/favorite/check/1" '' "$USER_TOKEN"
test_api GET  "/api/favorite/page" '' "$USER_TOKEN"
test_api POST "/api/favorite/toggle/1" '' "$USER_TOKEN"

# ─────────────────────────────
# 8. 购物车
# ─────────────────────────────
echo ""
yellow "--- [8] 购物车 ---"
test_api POST "/api/cart/add" '{"productId":1,"quantity":1}' "$USER_TOKEN"
test_api GET  "/api/cart/list" '' "$USER_TOKEN"
test_api GET  "/api/cart/count" '' "$USER_TOKEN"

CART_ID=$(grep -oP '"id"\s*:\s*\K[0-9]+' /tmp/api_resp.json | head -1)
if [ -z "$CART_ID" ]; then
  # cart/list 返回的是数组格式，尝试从 data 中提取
  CART_ID=$(curl -s -H "Authorization: Bearer $USER_TOKEN" "$BASE/api/cart/list" | grep -oP '"id"\s*:\s*\K[0-9]+' | head -1)
fi
ALL_CART_IDS=$(curl -s -H "Authorization: Bearer $USER_TOKEN" "$BASE/api/cart/list" | grep -oP '"id"\s*:\s*\K[0-9]+' | tr '\n' ',' | sed 's/,$//')
if [ -n "$CART_ID" ]; then
  test_api PUT "/api/cart/$CART_ID" '{"quantity":2}' "$USER_TOKEN"
  test_api PUT "/api/cart/selectAll/true" '' "$USER_TOKEN"
  test_api PUT "/api/cart/batchSelect/true" "[$CART_ID]" "$USER_TOKEN"
fi

# ─────────────────────────────
# 9. 订单
# ─────────────────────────────
echo ""
yellow "--- [9] 订单 ---"
test_api POST "/api/order/create" "{\"cartIds\":[$ALL_CART_IDS],\"receiverName\":\"Zhang San\",\"receiverPhone\":\"13900001111\",\"receiverAddress\":\"Test Address\"}" "$USER_TOKEN"
test_api GET  "/api/order/page" '' "$USER_TOKEN"

ORDER_ID=$(grep -oP '"id"\s*:\s*\K[0-9]+' /tmp/api_resp.json | head -1)
if [ -n "$ORDER_ID" ]; then
  test_api GET "/api/order/$ORDER_ID" '' "$USER_TOKEN"
  test_api GET "/api/order/$ORDER_ID/payment" '' "$USER_TOKEN"
  test_api PUT "/api/order/$ORDER_ID/cancel" '' "$USER_TOKEN" '200' || true
fi

# ─────────────────────────────
# 10. 评论（用户）
# ─────────────────────────────
echo ""
yellow "--- [10] 评论 ---"
test_api GET "/api/comment/user" '' "$USER_TOKEN"

# ─────────────────────────────
# 11. 支付
# ─────────────────────────────
echo ""
yellow "--- [11] 支付 ---"
test_api GET "/api/payment/order/1" '' "$USER_TOKEN"

# ─────────────────────────────
# 12. 管理员 - 商品
# ─────────────────────────────
echo ""
yellow "--- [12] 管理员 - 商品管理 ---"
test_api GET "/api/admin/products" '' "$ADMIN_TOKEN"
test_api GET "/api/admin/products/1" '' "$ADMIN_TOKEN"

# ─────────────────────────────
# 13. 管理员 - 分类
# ─────────────────────────────
echo ""
yellow "--- [13] 管理员 - 分类管理 ---"
test_api GET "/api/admin/categories" '' "$ADMIN_TOKEN"
test_api GET "/api/admin/categories/1" '' "$ADMIN_TOKEN"

# ─────────────────────────────
# 14. 管理员 - 订单
# ─────────────────────────────
echo ""
yellow "--- [14] 管理员 - 订单管理 ---"
test_api GET "/api/admin/orders" '' "$ADMIN_TOKEN"
if [ -n "$ORDER_ID" ]; then
  test_api GET "/api/admin/orders/$ORDER_ID" '' "$ADMIN_TOKEN"
fi

# ─────────────────────────────
# 15. 管理员 - 用户
# ─────────────────────────────
echo ""
yellow "--- [15] 管理员 - 用户管理 ---"
test_api GET "/api/admin/users" '' "$ADMIN_TOKEN"

# ─────────────────────────────
# 16. 管理员 - 评论
# ─────────────────────────────
echo ""
yellow "--- [16] 管理员 - 评论管理 ---"
test_api GET "/api/admin/comments" '' "$ADMIN_TOKEN"

# ─────────────────────────────
# 17. 管理员 - 会员等级
# ─────────────────────────────
echo ""
yellow "--- [17] 管理员 - 会员等级 ---"
test_api GET "/api/admin/member-levels" '' "$ADMIN_TOKEN"

# ─────────────────────────────
# 18. 管理员 - 积分商品
# ─────────────────────────────
echo ""
yellow "--- [18] 管理员 - 积分商品 ---"
test_api GET "/api/admin/points-products" '' "$ADMIN_TOKEN"

# ─────────────────────────────
# 19. 管理员 - 优惠券
# ─────────────────────────────
echo ""
yellow "--- [19] 管理员 - 优惠券 ---"
test_api GET "/api/admin/coupon/templates" '' "$ADMIN_TOKEN"
test_api GET "/api/admin/coupon/statistics" '' "$ADMIN_TOKEN"
test_api GET "/api/admin/coupon/usage-logs" '' "$ADMIN_TOKEN"

# ─────────────────────────────
# 20. 认证边界
# ─────────────────────────────
echo ""
yellow "--- [20] 认证边界测试 ---"
test_api GET "/api/user/info" '' '' '401'
test_api POST "/api/user/logout" '' "$USER_TOKEN"

# ─────────────────────────────
# 清理购物车
# ─────────────────────────────
curl -s -X DELETE -H "Authorization: Bearer $USER_TOKEN" "$BASE/api/cart/batch" > /dev/null 2>&1

# ─────────────────────────────
# 汇总
# ─────────────────────────────
echo ""
yellow "============================================="
yellow " 测试结果汇总"
yellow "============================================="
green "通过: $PASS"
red "失败: $FAIL"
TOTAL=$((PASS+FAIL))
echo "总计: $TOTAL"
if [ $FAIL -gt 0 ]; then
  echo ""
  red "失败列表:"
  echo "$FAIL_LIST"
fi
echo ""

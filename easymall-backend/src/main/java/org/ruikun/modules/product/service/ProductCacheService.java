package org.ruikun.modules.product.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductCacheService {

    private static final String KEY_PREFIX = "product:";
    private static final String KEY_DETAIL = KEY_PREFIX + "detail:";
    private static final String KEY_HOT = KEY_PREFIX + "hot";
    private static final String KEY_NEW = KEY_PREFIX + "new";
    private static final String KEY_SEARCH = KEY_PREFIX + "search:";

    private final StringRedisTemplate redisTemplate;

    public String detailKey(Long productId) {
        return KEY_DETAIL + productId;
    }

    public String hotKey() {
        return KEY_HOT;
    }

    public String newKey() {
        return KEY_NEW;
    }

    public String searchKey(String rawKey) {
        return KEY_SEARCH + rawKey;
    }

    public void deleteDetail(Long productId) {
        redisTemplate.delete(detailKey(productId));
        log.debug("Deleted product detail cache: {}", productId);
    }

    public void deleteHotAndNew() {
        redisTemplate.delete(hotKey());
        redisTemplate.delete(newKey());
        log.debug("Deleted hot and new product caches");
    }

    public void deleteSearchCaches() {
        Set<String> keys = redisTemplate.keys(KEY_SEARCH + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.debug("Deleted {} product search cache keys", keys.size());
        }
    }

    public void invalidateAll(Long productId) {
        deleteDetail(productId);
        deleteHotAndNew();
        deleteSearchCaches();
    }
}

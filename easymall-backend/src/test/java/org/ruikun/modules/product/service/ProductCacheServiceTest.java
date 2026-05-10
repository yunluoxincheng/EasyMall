package org.ruikun.modules.product.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductCacheServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private ProductCacheService cacheService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        cacheService = new ProductCacheService(redisTemplate);
    }

    @Nested
    @DisplayName("7.7 Product cache key contract")
    class CacheKeyContract {

        @Test
        @DisplayName("Detail key format")
        void detailKey() {
            assertEquals("product:detail:42", cacheService.detailKey(42L));
        }

        @Test
        @DisplayName("Hot key")
        void hotKey() {
            assertEquals("product:hot", cacheService.hotKey());
        }

        @Test
        @DisplayName("New key")
        void newKey() {
            assertEquals("product:new", cacheService.newKey());
        }

        @Test
        @DisplayName("Search key")
        void searchKey() {
            assertEquals("product:search:keyword", cacheService.searchKey("keyword"));
        }
    }

    @Nested
    @DisplayName("7.7 Cache invalidation")
    class CacheInvalidation {

        @Test
        @DisplayName("Delete detail cache")
        void deleteDetail() {
            cacheService.deleteDetail(42L);
            verify(redisTemplate).delete("product:detail:42");
        }

        @Test
        @DisplayName("Delete hot and new caches")
        void deleteHotAndNew() {
            cacheService.deleteHotAndNew();
            verify(redisTemplate).delete("product:hot");
            verify(redisTemplate).delete("product:new");
        }

        @Test
        @DisplayName("Invalidate all for a product")
        void invalidateAll() {
            when(redisTemplate.keys("product:search:*")).thenReturn(Set.of("product:search:k1"));
            cacheService.invalidateAll(42L);
            verify(redisTemplate).delete("product:detail:42");
            verify(redisTemplate).delete("product:hot");
            verify(redisTemplate).delete("product:new");
            verify(redisTemplate).delete(Set.of("product:search:k1"));
        }

        @Test
        @DisplayName("Missing cache keys are handled gracefully")
        void missingKeysHandled() {
            when(redisTemplate.keys("product:search:*")).thenReturn(null);
            assertDoesNotThrow(() -> cacheService.deleteSearchCaches());
        }

        @Test
        @DisplayName("Empty search cache set is handled")
        void emptySearchKeys() {
            when(redisTemplate.keys("product:search:*")).thenReturn(Set.of());
            assertDoesNotThrow(() -> cacheService.deleteSearchCaches());
            verify(redisTemplate, never()).delete(any(Set.class));
        }
    }
}

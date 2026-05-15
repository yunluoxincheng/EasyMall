<script setup lang="ts">
</script>

<template>
  <footer class="user-footer">
    <div class="footer-content">
      <p class="footer-brand">EasyMall</p>
      <p class="footer-copy">基于 Spring Boot + Redis + RabbitMQ 的 B2C 商城系统</p>
    </div>
  </footer>
</template>

<style scoped>
.user-footer {
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  padding: 24px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-brand {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.footer-copy {
  font-size: 12px;
  color: #999;
  margin: 0;
}
</style>

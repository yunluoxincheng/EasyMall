<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { NGrid, NGi, NCard, NImage, NButton, NEmpty, NSpin, NModal, NForm, NFormItem, NInput, useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { getPointsProducts, exchangeProduct } from '@/api/user-points-exchange'
import { useUserAuthStore } from '@/stores/userAuth'
import type { PointsProductVO } from '@/types/points'

const message = useMessage()
const userAuth = useUserAuthStore()
const loading = ref(true)
const products = ref<PointsProductVO[]>([])

const showModal = ref(false)
const exchanging = ref(false)
const exchangeFormRef = ref<FormInst | null>(null)
const selectedProduct = ref<PointsProductVO | null>(null)
const receiverForm = reactive({ receiverName: '', receiverPhone: '', receiverAddress: '', remark: '' })

const rules: FormRules = {
  receiverName: { required: true, message: '请输入收货人姓名', trigger: 'blur' },
  receiverPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  receiverAddress: { required: true, message: '请输入收货地址', trigger: 'blur' },
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getPointsProducts()
    products.value = res.data.data
  } catch {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

function openExchange(product: PointsProductVO) {
  const userPoints = userAuth.userInfo?.points ?? 0
  if (userPoints < product.pointsRequired) {
    message.warning('积分不足')
    return
  }
  selectedProduct.value = product
  receiverForm.receiverName = ''
  receiverForm.receiverPhone = ''
  receiverForm.receiverAddress = ''
  receiverForm.remark = ''
  showModal.value = true
}

async function confirmExchange() {
  try {
    await exchangeFormRef.value?.validate()
  } catch {
    return
  }
  if (!selectedProduct.value) return
  exchanging.value = true
  try {
    await exchangeProduct({
      productId: selectedProduct.value.id,
      receiverName: receiverForm.receiverName,
      receiverPhone: receiverForm.receiverPhone,
      receiverAddress: receiverForm.receiverAddress,
      remark: receiverForm.remark || undefined,
    })
    message.success('兑换成功')
    showModal.value = false
    fetchData()
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '兑换失败')
  } finally {
    exchanging.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <NSpin :show="loading">
    <div class="points-products-page">
      <h2 class="page-title">积分商品</h2>
      <div class="points-info">当前积分：{{ userAuth.userInfo?.points ?? 0 }}</div>

      <NEmpty v-if="!loading && products.length === 0" description="暂无积分商品" />

      <NGrid v-else :x-gap="16" :y-gap="16" :cols="4">
        <NGi v-for="item in products" :key="item.id">
          <NCard hoverable class="product-card">
            <div class="product-image">
              <NImage :src="item.image" object-fit="cover" :preview-disabled="true" />
            </div>
            <div class="product-name">{{ item.name }}</div>
            <div class="product-points">{{ item.pointsRequired }} 积分</div>
            <div class="product-stock">库存：{{ item.stock }}</div>
            <NButton
              type="primary"
              block
              size="small"
              :disabled="!item.canExchange || item.stock <= 0"
              @click="openExchange(item)"
            >
              {{ item.canExchange && item.stock > 0 ? '兑换' : '积分不足' }}
            </NButton>
          </NCard>
        </NGi>
      </NGrid>

      <NModal v-model:show="showModal" preset="dialog" :title="`兑换「${selectedProduct?.name}」`" :show-icon="false" style="width: 480px">
        <p style="margin-bottom: 16px; color: #999">需要 {{ selectedProduct?.pointsRequired }} 积分</p>
        <NForm ref="exchangeFormRef" :model="receiverForm" :rules="rules">
          <NFormItem path="receiverName" label="收货人姓名">
            <NInput v-model:value="receiverForm.receiverName" placeholder="请输入" />
          </NFormItem>
          <NFormItem path="receiverPhone" label="手机号">
            <NInput v-model:value="receiverForm.receiverPhone" placeholder="请输入手机号" />
          </NFormItem>
          <NFormItem path="receiverAddress" label="收货地址">
            <NInput v-model:value="receiverForm.receiverAddress" placeholder="请输入地址" />
          </NFormItem>
          <NFormItem path="remark" label="备注（选填）">
            <NInput v-model:value="receiverForm.remark" placeholder="选填" />
          </NFormItem>
        </NForm>
        <template #action>
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" :loading="exchanging" @click="confirmExchange">确认兑换</NButton>
        </template>
      </NModal>
    </div>
  </NSpin>
</template>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
}

.points-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.product-card {
  text-align: center;
}

.product-image {
  height: 160px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 8px;
}

.product-image :deep(img) {
  width: 100%;
  height: 160px;
}

.product-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.product-points {
  font-size: 16px;
  font-weight: 600;
  color: #e4393c;
  margin-bottom: 4px;
}

.product-stock {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { NForm, NFormItem, NInput, NInputNumber, NSelect, NButton, NSpace, useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { createProduct, updateProduct, updateProductStock, getProductById } from '@/api/product'
import { getCategoryPage } from '@/api/category'
import type { ProductFormData } from '@/types/product'
import type { CategoryPageItem } from '@/types/category'
import type { PageResult } from '@/types/api'

const props = defineProps<{ editId: number | null }>()
const emit = defineEmits<{ success: []; cancel: [] }>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)
const categoryOptions = ref<{ label: string; value: number }[]>([])
const originalStock = ref<number | null>(null)
const formData = reactive<ProductFormData>({
  name: '',
  subtitle: '',
  description: '',
  originalPrice: null,
  price: null,
  stock: null,
  image: '',
  images: '',
  categoryId: null,
  brand: '',
})

const rules: FormRules = {
  name: { required: true, message: '请输入商品名称', trigger: 'blur' },
  price: { required: true, type: 'number', message: '请输入售价', trigger: 'blur' },
  stock: { required: true, type: 'number', message: '请输入库存', trigger: 'blur' },
  categoryId: { required: true, type: 'number', message: '请选择分类', trigger: 'change' },
}

async function loadCategories() {
  try {
    const res = await getCategoryPage({ pageNum: 1, pageSize: 100 })
    const page = res.data.data as PageResult<CategoryPageItem>
    categoryOptions.value = page.records.map((c: CategoryPageItem) => ({ label: c.name, value: c.id }))
  } catch {
    // ignore
  }
}

async function loadProduct() {
  if (!props.editId) return
  try {
    const res = await getProductById(props.editId)
    const d = res.data.data
    formData.name = d.name
    formData.subtitle = d.subtitle || ''
    formData.description = d.description || ''
    formData.originalPrice = d.originalPrice
    formData.price = d.price
    formData.stock = d.stock
    originalStock.value = d.stock
    formData.image = d.image || ''
    formData.images = Array.isArray(d.images) ? d.images.join(',') : ''
    formData.categoryId = d.categoryId
    formData.brand = d.brand || ''
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载商品信息失败')
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    if (props.editId) {
      await updateProduct(props.editId, formData)
      if (formData.stock !== null && formData.stock !== originalStock.value) {
        await updateProductStock(props.editId, formData.stock)
      }
      message.success('修改成功')
    } else {
      await createProduct(formData)
      message.success('新增成功')
    }
    emit('success')
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadProduct()
})
</script>

<template>
  <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
    <NFormItem label="商品名称" path="name">
      <NInput v-model:value="formData.name" placeholder="请输入商品名称" />
    </NFormItem>
    <NFormItem label="副标题" path="subtitle">
      <NInput v-model:value="formData.subtitle" placeholder="请输入副标题" />
    </NFormItem>
    <NFormItem label="分类" path="categoryId">
      <NSelect v-model:value="formData.categoryId" :options="categoryOptions" placeholder="请选择分类" />
    </NFormItem>
    <NFormItem label="原价" path="originalPrice">
      <NInputNumber v-model:value="formData.originalPrice" :min="0" :precision="2" placeholder="请输入原价" style="width: 100%" />
    </NFormItem>
    <NFormItem label="售价" path="price">
      <NInputNumber v-model:value="formData.price" :min="0.01" :precision="2" placeholder="请输入售价" style="width: 100%" />
    </NFormItem>
    <NFormItem label="库存" path="stock">
      <NInputNumber v-model:value="formData.stock" :min="0" placeholder="请输入库存" style="width: 100%" />
    </NFormItem>
    <NFormItem label="品牌" path="brand">
      <NInput v-model:value="formData.brand" placeholder="请输入品牌" />
    </NFormItem>
    <NFormItem label="主图URL" path="image">
      <NInput v-model:value="formData.image" placeholder="请输入主图URL" />
    </NFormItem>
    <NFormItem label="图片列表" path="images">
      <NInput v-model:value="formData.images" placeholder="多张图片用逗号分隔" />
    </NFormItem>
    <NFormItem label="描述" path="description">
      <NInput v-model:value="formData.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
    </NFormItem>
    <NSpace justify="end">
      <NButton @click="emit('cancel')">取消</NButton>
      <NButton type="primary" :loading="saving" @click="handleSubmit">保存</NButton>
    </NSpace>
  </NForm>
</template>

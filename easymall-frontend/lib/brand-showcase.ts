export interface BrandShowcaseMeta {
  story: string;
  tags: string[];
  tone: string;
  accent: string;
}

const brandMetaMap: Record<string, BrandShowcaseMeta> = {
  Apple: {
    story: "围绕高端数码、生态联动和设计质感打造的品牌会场，适合从旗舰机、电脑和平板一路向下比较。",
    tags: ["旗舰数码", "生态协同", "高客单价"],
    tone: "from-[#eef5ff] to-[#ffffff]",
    accent: "bg-[#e8f1ff] text-[#245cb8]",
  },
  Xiaomi: {
    story: "强调性价比与多品类覆盖的品牌会场，既能看手机和平板，也适合承接数码配件与智能设备场景。",
    tags: ["性价比", "多品类", "热门爆款"],
    tone: "from-[#fff4ea] to-[#ffffff]",
    accent: "bg-[#fff0e5] text-[#d15a00]",
  },
  Huawei: {
    story: "兼顾旗舰定位、长续航和智能互联的品牌会场，适合先看品牌偏好，再进入具体机型和穿戴产品。",
    tags: ["旗舰通信", "智慧生态", "长续航"],
    tone: "from-[#f7f1ff] to-[#ffffff]",
    accent: "bg-[#f1e9ff] text-[#6e46b6]",
  },
  Nike: {
    story: "偏运动消费场景的品牌入口，适合围绕鞋服、训练和高频穿搭需求做品类联动展示。",
    tags: ["运动热销", "鞋服联动", "场景穿搭"],
    tone: "from-[#eef5ff] to-[#ffffff]",
    accent: "bg-[#ecf5ff] text-[#1666c5]",
  },
  Uniqlo: {
    story: "围绕高频基础款和日常穿搭逻辑做品牌会场，更适合服饰类低门槛浏览与加购。",
    tags: ["基础款", "日常穿搭", "高频复购"],
    tone: "from-[#fff4ea] to-[#ffffff]",
    accent: "bg-[#fff0e5] text-[#d45f05]",
  },
  "EasyMall Select": {
    story: "平台精选品牌入口，聚合不同品类里更适合做首页专题展示的高转化商品。",
    tags: ["平台精选", "专题聚合", "活动推荐"],
    tone: "from-[#f7f1ff] to-[#ffffff]",
    accent: "bg-[#f2ecff] text-[#6f4cc1]",
  },
};

export function getBrandShowcaseMeta(brand: string): BrandShowcaseMeta {
  return (
    brandMetaMap[brand] ?? {
      story: `${brand} 品牌会场用于承接品牌偏好型用户，从品牌心智出发继续筛选价格、销量和热门单品。`,
      tags: ["品牌会场", "专题浏览", "商品联动"],
      tone: "from-[#fff4ea] to-[#ffffff]",
      accent: "bg-[#fff0e5] text-[#d15a00]",
    }
  );
}

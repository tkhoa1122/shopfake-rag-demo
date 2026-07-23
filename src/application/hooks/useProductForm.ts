"use client";

import { useState, useMemo, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AttributeValue {
  id: string;
  label: string;
}

export interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
  inputDraft: string; // current typing value before confirming
}

export interface Variant {
  id: string;
  combination: Record<string, string>; // { "Màu sắc": "Đen", "Size": "M" }
  sku: string;
  price: string;
  stock: string;
  imageFile: File | null;
}

export interface BasicInfo {
  name: string;
  description: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

// ─── Cartesian Product ──────────────────────────────────────────────────────

function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((combo) => curr.map((val) => [...combo, val])),
    [[]]
  );
}

// ─── Dummy Data ─────────────────────────────────────────────────────────────

const DUMMY_CATEGORIES: Category[] = [
  { id: "1", name: "Áo thun" },
  { id: "2", name: "Áo khoác" },
  { id: "3", name: "Quần jeans" },
  { id: "4", name: "Váy đầm" },
  { id: "5", name: "Áo sơ mi" },
];

const INITIAL_BASIC_INFO: BasicInfo = {
  name: "Áo Thun Cotton Oversize Unisex",
  description:
    "Áo thun chất liệu cotton 100% mềm mịn, thoáng mát. Kiểu dáng oversize phong cách Hàn Quốc, phù hợp với cả nam và nữ. Thiết kế đơn giản, dễ phối đồ cho nhiều phong cách khác nhau.",
  categoryId: "1",
};

const INITIAL_ATTRIBUTES: Attribute[] = [
  {
    id: "attr-1",
    name: "Màu sắc",
    values: [
      { id: "v-1", label: "Đen" },
      { id: "v-2", label: "Trắng" },
      { id: "v-3", label: "Xám" },
    ],
    inputDraft: "",
  },
  {
    id: "attr-2",
    name: "Kích cỡ",
    values: [
      { id: "v-4", label: "S" },
      { id: "v-5", label: "M" },
      { id: "v-6", label: "L" },
      { id: "v-7", label: "XL" },
    ],
    inputDraft: "",
  },
];

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useProductForm() {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(INITIAL_BASIC_INFO);
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL_ATTRIBUTES);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // ─── Auto-generate variants from attribute combinations ───────────────────
  const generatedVariants = useMemo<Variant[]>(() => {
    const filled = attributes.filter((a) => a.name.trim() && a.values.length > 0);
    if (filled.length === 0) return [];

    const arrays = filled.map((a) => a.values.map((v) => ({ attrName: a.name, value: v.label })));
    const combos = cartesianProduct(arrays);

    return combos.map((combo, idx) => {
      const combination = Object.fromEntries(combo.map((c) => [c.attrName, c.value]));
      const comboKey = combo.map((c) => c.value).join("-");

      // preserve existing variant data if it already exists
      const existing = variants.find(
        (v) => JSON.stringify(v.combination) === JSON.stringify(combination)
      );

      if (existing) return existing;

      const skuBase = basicInfo.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 4);

      return {
        id: `variant-${idx}`,
        combination,
        sku: `${skuBase}-${comboKey.replace(/\s+/g, "").toUpperCase()}`,
        price: "299000",
        stock: "50",
        imageFile: null,
      };
    });
  }, [attributes, basicInfo.name]);

  // ─── Basic Info handlers ───────────────────────────────────────────────────
  const updateBasicInfo = useCallback(<K extends keyof BasicInfo>(key: K, value: BasicInfo[K]) => {
    setBasicInfo((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ─── Attribute handlers ───────────────────────────────────────────────────
  const addAttribute = useCallback(() => {
    const newAttr: Attribute = {
      id: `attr-${Date.now()}`,
      name: "",
      values: [],
      inputDraft: "",
    };
    setAttributes((prev) => [...prev, newAttr]);
  }, []);

  const removeAttribute = useCallback((attrId: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== attrId));
  }, []);

  const updateAttributeName = useCallback((attrId: string, name: string) => {
    setAttributes((prev) => prev.map((a) => (a.id === attrId ? { ...a, name } : a)));
  }, []);

  const updateAttributeDraft = useCallback((attrId: string, draft: string) => {
    setAttributes((prev) => prev.map((a) => (a.id === attrId ? { ...a, inputDraft: draft } : a)));
  }, []);

  const confirmAttributeValue = useCallback((attrId: string) => {
    setAttributes((prev) =>
      prev.map((a) => {
        if (a.id !== attrId) return a;
        const label = a.inputDraft.trim();
        if (!label || a.values.some((v) => v.label.toLowerCase() === label.toLowerCase())) {
          return { ...a, inputDraft: "" };
        }
        return {
          ...a,
          inputDraft: "",
          values: [...a.values, { id: `v-${Date.now()}`, label }],
        };
      })
    );
  }, []);

  const removeAttributeValue = useCallback((attrId: string, valueId: string) => {
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === attrId ? { ...a, values: a.values.filter((v) => v.id !== valueId) } : a
      )
    );
  }, []);

  // ─── Variant update ───────────────────────────────────────────────────────
  const updateVariantField = useCallback(
    (variantId: string, field: "sku" | "price" | "stock", value: string) => {
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
      );
    },
    []
  );

  const updateVariantImage = useCallback((variantId: string, file: File | null) => {
    setVariants((prev) => prev.map((v) => (v.id === variantId ? { ...v, imageFile: file } : v)));
  }, []);

  // Sync generatedVariants → state (merge user edits)
  const syncedVariants = useMemo(() => {
    return generatedVariants.map((gen) => {
      const userEdited = variants.find((v) => v.id === gen.id);
      return userEdited ?? gen;
    });
  }, [generatedVariants, variants]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1500));
    setIsSubmitting(false);
    alert("Sản phẩm đã được tạo thành công!");
  }, []);

  return {
    basicInfo,
    updateBasicInfo,
    categories: DUMMY_CATEGORIES,
    attributes,
    addAttribute,
    removeAttribute,
    updateAttributeName,
    updateAttributeDraft,
    confirmAttributeValue,
    removeAttributeValue,
    variants: syncedVariants,
    updateVariantField,
    updateVariantImage,
    isSubmitting,
    currentStep,
    setCurrentStep,
    handleSubmit,
  };
}

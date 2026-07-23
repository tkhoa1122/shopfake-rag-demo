import type { Product, ProductSearchResult } from "@/domain/entities/Product";
import type { ProductDTO, ProductSearchResultDTO } from "@/infrastructure/dto/ProductDTO";

export class ProductMapper {
  static toEntity(dto: ProductDTO): Product {
    return {
      id: dto.product_id as string,
      tenantId: dto.tenant_id as string,
      name: dto.p_name || "",
      description: dto.p_description || "",
      price: dto.p_price || 0,
      currency: dto.p_currency || "VND",
      imageUrl: dto.p_image_url || "",
      category: dto.p_category || "",
      tags: dto.p_tags || [],
      stock: dto.in_stock || 0,
      isActive: dto.is_active || false,
      createdAt: dto.created_at || new Date().toISOString(),
      updatedAt: dto.updated_at || "",
    };
  }

  static toEntityList(dtos: ProductDTO[]): Product[] {
    return dtos.map(this.toEntity);
  }

  static toSearchResultEntity(dto: ProductSearchResultDTO): ProductSearchResult {
    return {
      products: this.toEntityList(dto.products),
      total: dto.total,
      page: dto.page,
      pageSize: dto.page_size,
    };
  }

  static toDTO(entity: Partial<Product>): Partial<ProductDTO> {
    const dto: Partial<ProductDTO> = {};
    if (entity.id !== undefined) dto.product_id = entity.id;
    if (entity.tenantId !== undefined) dto.tenant_id = entity.tenantId;
    if (entity.name !== undefined) dto.p_name = entity.name;
    if (entity.description !== undefined) dto.p_description = entity.description;
    if (entity.price !== undefined) dto.p_price = entity.price;
    if (entity.currency !== undefined) dto.p_currency = entity.currency;
    if (entity.imageUrl !== undefined) dto.p_image_url = entity.imageUrl;
    if (entity.category !== undefined) dto.p_category = entity.category;
    if (entity.tags !== undefined) dto.p_tags = entity.tags;
    if (entity.stock !== undefined) dto.in_stock = entity.stock;
    if (entity.isActive !== undefined) dto.is_active = entity.isActive;
    if (entity.createdAt !== undefined) dto.created_at = entity.createdAt;
    if (entity.updatedAt !== undefined) dto.updated_at = entity.updatedAt;
    return dto;
  }
}

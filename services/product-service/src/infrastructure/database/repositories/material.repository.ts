import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Material } from "../entities/material.entity";
import { CreateMaterialDto, UpdateMaterialDto } from "../../../application/dtos/material.dto";

@Injectable()
export class MaterialRepository {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    const material = this.materialRepository.create({
      name: createMaterialDto.name,
      display_name: createMaterialDto.displayName,
      description: createMaterialDto.description,
      is_active: createMaterialDto.isActive ?? true,
      sort_order: createMaterialDto.sortOrder ?? 0,
    });

    return this.materialRepository.save(material);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ materials: Material[]; total: number }> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    const [materials, total] = await this.materialRepository.findAndCount({
      where: { is_active: true },
      order: { sort_order: "ASC", name: "ASC" },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return { materials, total };
  }

  async findById(id: number): Promise<Material | null> {
    return this.materialRepository.findOne({
      where: { id, is_active: true },
    });
  }

  async findByName(name: string): Promise<Material | null> {
    return this.materialRepository.findOne({
      where: { name, is_active: true },
    });
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto): Promise<Material | null> {
    const material = await this.findById(id);
    if (!material) {
      return null;
    }

    const updateData: Partial<Material> = {};
    if (updateMaterialDto.name !== undefined) updateData.name = updateMaterialDto.name;
    if (updateMaterialDto.displayName !== undefined) updateData.display_name = updateMaterialDto.displayName;
    if (updateMaterialDto.description !== undefined) updateData.description = updateMaterialDto.description;
    if (updateMaterialDto.isActive !== undefined) updateData.is_active = updateMaterialDto.isActive;
    if (updateMaterialDto.sortOrder !== undefined) updateData.sort_order = updateMaterialDto.sortOrder;

    await this.materialRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.materialRepository.update(id, { is_active: false });
    return result.affected > 0;
  }

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const query = this.materialRepository
      .createQueryBuilder("material")
      .where("material.name = :name", { name })
      .andWhere("material.is_active = :isActive", { isActive: true });

    if (excludeId) {
      query.andWhere("material.id != :excludeId", { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}



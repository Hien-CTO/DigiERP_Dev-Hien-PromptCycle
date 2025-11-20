import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandService } from '../../services/product-service/src/application/services/brand.service';
import { Brand } from '../../services/product-service/src/infrastructure/database/entities/brand.entity';
import { CreateBrandDto } from '../../services/product-service/src/application/dtos/brand.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('BrandService', () => {
  let service: BrandService;
  let repository: Repository<Brand>;

  const mockBrand: Brand = {
    id: 1,
    code: 'TEST_BRAND',
    name: 'Test Brand',
    description: 'Test Description',
    logo_url: null,
    website: null,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: 1,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        {
          provide: getRepositoryToken(Brand),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
    repository = module.get<Repository<Brand>>(getRepositoryToken(Brand));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new brand successfully', async () => {
      const createBrandDto: CreateBrandDto = {
        code: 'TEST_BRAND',
        name: 'Test Brand',
        description: 'Test Description',
        is_active: true,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockBrand);
      mockRepository.save.mockResolvedValue(mockBrand);

      const result = await service.create(createBrandDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { code: createBrandDto.code },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createBrandDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockBrand);
      expect(result).toEqual({
        id: 1,
        code: 'TEST_BRAND',
        name: 'Test Brand',
        description: 'Test Description',
        logo_url: null,
        website: null,
        is_active: true,
        created_at: mockBrand.created_at,
        updated_at: mockBrand.updated_at,
        created_by: 1,
        updated_by: 1,
      });
    });

    it('should throw ConflictException when brand code already exists', async () => {
      const createBrandDto: CreateBrandDto = {
        code: 'EXISTING_BRAND',
        name: 'Existing Brand',
        is_active: true,
      };

      mockRepository.findOne.mockResolvedValue(mockBrand);

      await expect(service.create(createBrandDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { code: createBrandDto.code },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated brands', async () => {
      const mockBrands = [mockBrand];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockBrands, 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: 'test',
        isActive: true,
      });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('brand');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result).toEqual({
        brands: [{
          id: 1,
          code: 'TEST_BRAND',
          name: 'Test Brand',
          description: 'Test Description',
          logo_url: null,
          website: null,
          is_active: true,
          created_at: mockBrand.created_at,
          updated_at: mockBrand.updated_at,
          created_by: 1,
          updated_by: 1,
        }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should return brands without filters', async () => {
      const mockBrands = [mockBrand];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockBrands, 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('brand');
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result.brands).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a brand by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockBrand);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({
        id: 1,
        code: 'TEST_BRAND',
        name: 'Test Brand',
        description: 'Test Description',
        logo_url: null,
        website: null,
        is_active: true,
        created_at: mockBrand.created_at,
        updated_at: mockBrand.updated_at,
        created_by: 1,
        updated_by: 1,
      });
    });

    it('should throw NotFoundException when brand not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('update', () => {
    it('should update a brand successfully', async () => {
      const updateData = {
        name: 'Updated Brand Name',
        description: 'Updated Description',
      };

      const updatedBrand = { ...mockBrand, ...updateData };

      mockRepository.findOne.mockResolvedValue(mockBrand);
      mockRepository.save.mockResolvedValue(updatedBrand);

      const result = await service.update(1, updateData);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedBrand);
      expect(result.name).toBe('Updated Brand Name');
    });

    it('should throw NotFoundException when brand not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when updating to existing code', async () => {
      const updateData = { code: 'EXISTING_CODE' };
      const existingBrand = { ...mockBrand, id: 2, code: 'EXISTING_CODE' };

      mockRepository.findOne
        .mockResolvedValueOnce(mockBrand)
        .mockResolvedValueOnce(existingBrand);

      await expect(service.update(1, updateData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a brand successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockBrand);
      mockRepository.remove.mockResolvedValue(mockBrand);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockBrand);
    });

    it('should throw NotFoundException when brand not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('should activate a brand successfully', async () => {
      const inactiveBrand = { ...mockBrand, is_active: false };
      const activatedBrand = { ...mockBrand, is_active: true };

      mockRepository.findOne.mockResolvedValue(inactiveBrand);
      mockRepository.save.mockResolvedValue(activatedBrand);

      const result = await service.activate(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(activatedBrand);
      expect(result.is_active).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a brand successfully', async () => {
      const deactivatedBrand = { ...mockBrand, is_active: false };

      mockRepository.findOne.mockResolvedValue(mockBrand);
      mockRepository.save.mockResolvedValue(deactivatedBrand);

      const result = await service.deactivate(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(deactivatedBrand);
      expect(result.is_active).toBe(false);
    });
  });
});

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceLocation } from '../entities/attendance-location.entity';

@Injectable()
export class AttendanceLocationRepository {
  constructor(
    @InjectRepository(AttendanceLocation)
    private readonly repository: Repository<AttendanceLocation>,
  ) {}

  async findAllActive(): Promise<AttendanceLocation[]> {
    return await this.repository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<AttendanceLocation | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(locationData: Partial<AttendanceLocation>): Promise<AttendanceLocation> {
    const location = this.repository.create(locationData);
    return await this.repository.save(location);
  }

  async update(id: number, locationData: Partial<AttendanceLocation>): Promise<AttendanceLocation | null> {
    await this.repository.update(id, locationData);
    return await this.findById(id);
  }

  /**
   * Check if GPS coordinates are within allowed radius of any active location
   */
  async isLocationValid(
    latitude: number,
    longitude: number,
    allowedRadiusMeters: number,
  ): Promise<{ valid: boolean; location?: AttendanceLocation }> {
    const locations = await this.findAllActive();

    for (const location of locations) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        Number(location.latitude),
        Number(location.longitude),
      );

      if (distance <= allowedRadiusMeters) {
        return { valid: true, location };
      }
    }

    return { valid: false };
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula (in meters)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}


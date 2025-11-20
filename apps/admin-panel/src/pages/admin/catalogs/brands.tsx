import React, { useState, useEffect } from 'react';
import { BrandForm } from '@/components/forms/brand-form';
import { BrandTable } from '@/components/tables/brand-table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';

interface Brand {
  id: number;
  code: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch brands
  const fetchBrands = async (pageNum: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/brands?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const data = await response.json();
      setBrands(data.brands);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Create brand
  const handleCreateBrand = async (data: any) => {
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create brand');
      }

      setSuccess('Brand created successfully');
      setShowForm(false);
      fetchBrands();
    } catch (err) {
      throw err;
    }
  };

  // Update brand
  const handleUpdateBrand = async (data: any) => {
    try {
      const response = await fetch(`/api/brands/${editingBrand?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update brand');
      }

      setSuccess('Brand updated successfully');
      setShowForm(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (err) {
      throw err;
    }
  };

  // Delete brand
  const handleDeleteBrand = async (id: number) => {
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }

      setSuccess('Brand deleted successfully');
      fetchBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const endpoint = isActive ? 'activate' : 'deactivate';
      const response = await fetch(`/api/brands/${id}/${endpoint}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to update brand status');
      }

      setSuccess(`Brand ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Handle search
  const handleSearch = (search: string) => {
    setSearchTerm(search);
    fetchBrands(1, search);
  };

  // Handle page change
  const handlePageChange = (pageNum: number) => {
    fetchBrands(pageNum, searchTerm);
  };

  // Handle edit
  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setShowForm(true);
  };

  // Handle create
  const handleCreate = () => {
    setEditingBrand(null);
    setShowForm(true);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBrand(null);
  };

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {editingBrand ? 'Edit Brand' : 'Create New Brand'}
          </h1>
          <Button variant="outline" onClick={handleFormCancel}>
            <X className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <BrandForm
          initialData={editingBrand || undefined}
          onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Brands Management</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <BrandTable
        brands={brands}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDeleteBrand}
        onToggleActive={handleToggleActive}
        onCreate={handleCreate}
        isLoading={isLoading}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Camera, Upload, X, Plus, Trash2, Loader2, ChevronDown, ChevronUp, Edit2, Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '@/types/user';
import { TenantListResponse, TenantResponse } from '@/types/tenant';
import { RoleListResponse } from '@/types/role';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface UserFormProps {
  initialData?: UserResponse;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserForm({ initialData, onSubmit, onCancel, isLoading }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // State for managing tenant assignments (removed - now add directly via API)
  const [selectedTenantForForm, setSelectedTenantForForm] = useState<number | undefined>();
  const [selectedRolesForForm, setSelectedRolesForForm] = useState<number[]>([]);
  const [isPrimaryForForm, setIsPrimaryForForm] = useState(false);
  const [expandedTenants, setExpandedTenants] = useState<Set<number>>(new Set());
  const [showAddTenantForm, setShowAddTenantForm] = useState(false);
  
  // State for managing GLOBAL roles
  const [selectedGlobalRolesForForm, setSelectedGlobalRolesForForm] = useState<number[]>([]);
  const [showAddGlobalRolesForm, setShowAddGlobalRolesForm] = useState(false);
  
  // State for avatar upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Store original file for FormData
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditMode = !!initialData;
  const { user: currentUser, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch tenants from API
  const { data: tenantsData, isLoading: isLoadingTenants, error: tenantsError } = useQuery<TenantListResponse>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await apiClient.get<TenantListResponse>('/api/tenants');
      return response;
    },
    enabled: true, // Enable in both create and edit mode
    retry: false,
  });

  // Check if error is permission related
  const isPermissionError = tenantsError && (
    (tenantsError as any)?.response?.status === 403 || 
    (tenantsError as any)?.response?.data?.message?.includes('permission')
  );

  // Use tenants from API response, fallback to user's tenants only if permission error and no data
  const availableTenants = tenantsData?.tenants 
    ? tenantsData.tenants.filter((tenant) => tenant.isActive && tenant.status === 'ACTIVE')
    : isPermissionError && currentUser?.tenants
    ? currentUser.tenants.map(t => ({
        id: t.tenantId,
        code: t.tenantCode,
        name: t.tenantName,
        displayName: t.tenantName,
        isActive: true,
        status: 'ACTIVE' as const,
      }))
    : [];

  // Watch selected tenantId to fetch roles
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: initialData ? {
      username: initialData.username,
      email: initialData.email,
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      phone: initialData.phone || '',
      isActive: initialData.isActive,
      isVerified: initialData.isVerified,
      tenantId: initialData.primaryTenant?.tenantId || initialData.tenants?.[0]?.tenantId,
      roleId: initialData.primaryTenant?.roleId || initialData.tenants?.[0]?.roleId,
      isPrimary: initialData.primaryTenant?.isPrimary || initialData.tenants?.[0]?.isPrimary || false,
    } : {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      avatarUrl: '',
      isActive: true,
      isVerified: false,
      tenantId: undefined,
      roleId: undefined,
      isPrimary: false,
    }
  });

  const password = watch('password');
  const selectedTenantId = watch('tenantId');
  const isActive = watch('isActive');
  const isVerified = watch('isVerified');
  const isPrimary = watch('isPrimary');
  const avatarUrl = watch('avatarUrl');

  // Fetch roles for selected tenant (enable in both create and edit mode)
  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError } = useQuery<RoleListResponse>({
    queryKey: ['tenant-roles', selectedTenantId],
    queryFn: async () => {
      if (!selectedTenantId) return { roles: [], total: 0 };
      const response = await apiClient.get<RoleListResponse>(`/api/tenants/${selectedTenantId}/roles`);
      return response;
    },
    enabled: !!selectedTenantId,
  });

  // Fetch roles for form tenant selection (for adding new tenants)
  const { data: formRolesData, isLoading: isLoadingFormRoles } = useQuery<RoleListResponse>({
    queryKey: ['tenant-roles', selectedTenantForForm],
    queryFn: async () => {
      if (!selectedTenantForForm) return { roles: [], total: 0 };
      const response = await apiClient.get<RoleListResponse>(`/api/tenants/${selectedTenantForForm}/roles`);
      return response;
    },
    enabled: !!selectedTenantForForm,
  });


  // Get current tenant roles for filtering
  const getCurrentTenantRoleIds = (tenantId: number): number[] => {
    if (!initialData?.tenants) return [];
    return initialData.tenants
      .filter(t => t.tenantId === tenantId)
      .map(t => t.roleId);
  };

  // Fetch user GLOBAL roles
  const { data: userGlobalRolesData, isLoading: isLoadingUserGlobalRoles } = useQuery<{ roles: Array<{ id: number; name: string; displayName?: string; scope: string }> }>({
    queryKey: ['user-global-roles', initialData?.id],
    queryFn: async () => {
      if (!initialData?.id) return { roles: [] };
      // Get roles without tenantId to get only GLOBAL roles
      const response = await apiClient.get<{ roles: Array<{ id: number; name: string; displayName?: string; scope: string }> }>(
        `/api/users/${initialData.id}/roles`
      );
      // Filter only GLOBAL roles
      return {
        roles: (response.roles || []).filter(role => role.scope === 'GLOBAL')
      };
    },
    enabled: !!initialData?.id && isEditMode,
  });

  // Fetch all GLOBAL roles for selection
  const { data: allGlobalRolesData, isLoading: isLoadingAllGlobalRoles } = useQuery<RoleListResponse>({
    queryKey: ['all-global-roles'],
    queryFn: async () => {
      const response = await apiClient.get<RoleListResponse>('/api/roles?scope=GLOBAL');
      return response;
    },
    enabled: isEditMode && showAddGlobalRolesForm,
  });

  const userGlobalRoleIds = useMemo(() => {
    return userGlobalRolesData?.roles?.map(r => r.id) || [];
  }, [userGlobalRolesData]);

  // Mutation to add roles to tenant immediately
  const addRolesToTenantMutation = useMutation({
    mutationFn: async ({ tenantId, roleIds, isPrimary }: { tenantId: number; roleIds: number[]; isPrimary: boolean }) => {
      if (!initialData?.id) throw new Error('User ID is required');
      return await apiClient.post(`/api/tenants/${tenantId}/assign-user`, {
        userId: initialData.id,
        tenantId,
        roleId: roleIds,
        isPrimary,
      });
    },
    onSuccess: async (_, variables) => {
      const tenant = availableTenants.find(t => t.id === variables.tenantId);
      toast.success(`Đã thêm ${variables.roleIds.length} role(s) cho ${tenant?.displayName || tenant?.name || 'tenant'} thành công`);
      
      // Force logout ONLY if the user being edited is the current logged-in user
      const isCurrentUser = currentUser && initialData?.id === currentUser.id;
      if (isCurrentUser) {
        try {
          await apiClient.post(`/api/users/${initialData?.id}/logout`);
          await logout();
          toast.success('Đã cập nhật thành công. Vui lòng đăng nhập lại để áp dụng thay đổi.');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } catch (error: any) {
          console.error('Failed to logout user:', error);
        }
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user', initialData?.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Reset form
      setSelectedTenantForForm(undefined);
      setSelectedRolesForForm([]);
      setIsPrimaryForForm(false);
      setShowAddTenantForm(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Thêm roles thất bại';
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    },
  });

  // Mutation to add GLOBAL roles to user
  const addGlobalRolesMutation = useMutation({
    mutationFn: async ({ roleIds }: { roleIds: number[] }) => {
      if (!initialData?.id) throw new Error('User ID is required');
      return await apiClient.post(`/api/permissions/users/${initialData.id}/assign-roles`, {
        roleIds,
      });
    },
    onSuccess: async (_, variables) => {
      toast.success(`Đã thêm ${variables.roleIds.length} GLOBAL role(s) thành công`);
      
      // Force logout ONLY if the user being edited is the current logged-in user
      const isCurrentUser = currentUser && initialData?.id === currentUser.id;
      if (isCurrentUser) {
        try {
          await apiClient.post(`/api/users/${initialData?.id}/logout`);
          await logout();
          toast.success('Đã cập nhật thành công. Vui lòng đăng nhập lại để áp dụng thay đổi.');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } catch (error: any) {
          console.error('Failed to logout user:', error);
        }
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user', initialData?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-global-roles', initialData?.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Reset form
      setSelectedGlobalRolesForForm([]);
      setShowAddGlobalRolesForm(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Thêm GLOBAL roles thất bại';
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    },
  });

  // Mutation to remove GLOBAL role from user
  const removeGlobalRoleMutation = useMutation({
    mutationFn: async ({ roleId }: { roleId: number }) => {
      if (!initialData?.id) throw new Error('User ID is required');
      return await apiClient.delete(`/api/users/${initialData.id}/roles/${roleId}`);
    },
    onSuccess: async (_, variables) => {
      const role = userGlobalRolesData?.roles?.find(r => r.id === variables.roleId);
      toast.success(`Đã xóa role "${role?.displayName || role?.name || 'role'}" thành công`);
      
      // Force logout ONLY if the user being edited is the current logged-in user
      const isCurrentUser = currentUser && initialData?.id === currentUser.id;
      if (isCurrentUser) {
        try {
          await apiClient.post(`/api/users/${initialData?.id}/logout`);
          await logout();
          toast.success('Đã cập nhật thành công. Vui lòng đăng nhập lại để áp dụng thay đổi.');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } catch (error: any) {
          console.error('Failed to logout user:', error);
        }
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user', initialData?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-global-roles', initialData?.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Xóa role thất bại';
      toast.error(errorMessage);
    },
  });

  // Helper function to add GLOBAL roles
  const handleAddGlobalRoles = () => {
    if (selectedGlobalRolesForForm.length === 0) {
      setSubmitError('Vui lòng chọn ít nhất một role');
      toast.error('Vui lòng chọn ít nhất một role');
      return;
    }

    // Only add new roles (not already assigned)
    const newRoleIds = selectedGlobalRolesForForm.filter(roleId => !userGlobalRoleIds.includes(roleId));

    // Check if there are any new roles to add
    if (newRoleIds.length === 0) {
      setSubmitError('Tất cả các roles đã chọn đều đã có sẵn. Vui lòng chọn roles khác.');
      toast.error('Tất cả các roles đã chọn đều đã có sẵn');
      return;
    }

    // Call API immediately to add roles
    addGlobalRolesMutation.mutate({
      roleIds: newRoleIds,
    });
  };

  // Helper function to add roles to tenant immediately
  const handleAddRolesToTenant = () => {
    if (!selectedTenantForForm || selectedRolesForForm.length === 0) {
      setSubmitError('Vui lòng chọn tenant và ít nhất một role');
      toast.error('Vui lòng chọn tenant và ít nhất một role');
      return;
    }

    const tenant = availableTenants.find(t => t.id === selectedTenantForForm);
    if (!tenant) {
      setSubmitError('Không tìm thấy tenant');
      return;
    }

    // Get current roles if tenant already exists
    const currentRoleIds = getCurrentTenantRoleIds(selectedTenantForForm);
    
    // Only add new roles (not already assigned)
    const newRoleIds = selectedRolesForForm.filter(roleId => !currentRoleIds.includes(roleId));

    // Check if there are any new roles to add
    if (newRoleIds.length === 0) {
      setSubmitError('Tất cả các roles đã chọn đều đã có sẵn trong tenant này. Vui lòng chọn roles khác.');
      toast.error('Tất cả các roles đã chọn đều đã có sẵn');
      return;
    }

    // Call API immediately to add roles
    addRolesToTenantMutation.mutate({
      tenantId: selectedTenantForForm,
      roleIds: newRoleIds,
      isPrimary: isPrimaryForForm,
    });
  };


  const toggleTenantExpand = (tenantId: number) => {
    setExpandedTenants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tenantId)) {
        newSet.delete(tenantId);
      } else {
        newSet.add(tenantId);
      }
      return newSet;
    });
  };

  const handleEditTenantRoles = (tenantId: number) => {
    setSelectedTenantForForm(tenantId);
    setShowAddTenantForm(true);
    // Scroll to form
    setTimeout(() => {
      const formElement = document.getElementById('add-tenant-form');
      formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRolesForForm(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAllRoles = () => {
    if (formRolesData?.roles && selectedTenantForForm) {
      const currentRoleIds = getCurrentTenantRoleIds(selectedTenantForForm);
      const activeRoleIds = formRolesData.roles
        .filter(role => role.isActive && !currentRoleIds.includes(role.id))
        .map(role => role.id);
      setSelectedRolesForForm(activeRoleIds);
    }
  };

  const handleDeselectAllRoles = () => {
    setSelectedRolesForForm([]);
  };

  // Reset roleId when tenant changes (only in create mode)
  useEffect(() => {
    if (selectedTenantId && !isEditMode) {
      setValue('roleId', undefined);
    }
  }, [selectedTenantId, setValue, isEditMode]);

  // Reset form roles when tenant changes
  useEffect(() => {
    if (selectedTenantForForm) {
      setSelectedRolesForForm([]);
    }
  }, [selectedTenantForForm]);

  // Fetch user roles for a specific tenant
  const fetchUserRolesInTenant = async (tenantId: number) => {
    if (!initialData?.id) return [];
    try {
      const response = await apiClient.get<{ roles: Array<{ id: number; name: string; displayName?: string }> }>(
        `/api/users/${initialData.id}/roles?tenantId=${tenantId}`
      );
      return response.roles || [];
    } catch (error) {
      console.error(`Failed to fetch roles for tenant ${tenantId}:`, error);
      return [];
    }
  };

  // Group tenants by tenantId (since one tenant can have multiple roles)
  const groupedTenants = useMemo(() => {
    if (!initialData?.tenants) return [];
    
    const grouped = new Map<number, {
      tenantId: number;
      tenantName: string;
      tenantCode: string;
      isPrimary: boolean;
      joinedAt?: string;
      roles: Array<{ roleId: number; roleName: string }>;
    }>();

    initialData.tenants.forEach(tenant => {
      if (!grouped.has(tenant.tenantId)) {
        grouped.set(tenant.tenantId, {
          tenantId: tenant.tenantId,
          tenantName: tenant.tenantName,
          tenantCode: tenant.tenantCode,
          isPrimary: tenant.isPrimary || false,
          joinedAt: tenant.joinedAt,
          roles: [],
        });
      }
      
      const group = grouped.get(tenant.tenantId)!;
      if (tenant.roleId && tenant.roleName) {
        group.roles.push({
          roleId: tenant.roleId,
          roleName: tenant.roleName,
        });
      }
    });

    return Array.from(grouped.values());
  }, [initialData?.tenants]);

  // Remove role from user tenant mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ tenantId, roleId }: { tenantId: number; roleId: number }) => {
      if (!initialData?.id) throw new Error('User ID is required');
      return await apiClient.delete<{ message: string }>(`/api/users/${initialData.id}/tenants/${tenantId}/roles/${roleId}`);
    },
    onSuccess: async () => {
      toast.success('Đã xóa role khỏi tenant thành công');
      
      // Force logout ONLY if the user being edited is the current logged-in user
      const isCurrentUser = currentUser && initialData?.id === currentUser.id;
      if (isCurrentUser) {
        try {
          await apiClient.post(`/api/users/${initialData?.id}/logout`);
          await logout();
          toast.success('Đã xóa role thành công. Vui lòng đăng nhập lại để áp dụng thay đổi.');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } catch (error: any) {
          console.error('Failed to logout user:', error);
        }
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user', initialData?.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Xóa role khỏi tenant thất bại';
      toast.error(errorMessage);
    },
  });

  // Remove tenant from user mutation
  const removeTenantMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      if (!initialData?.id) throw new Error('User ID is required');
      return await apiClient.delete<{ message: string }>(`/api/users/${initialData.id}/tenants/${tenantId}`);
    },
    onSuccess: async () => {
      toast.success('Đã xóa tenant khỏi user thành công');
      
      // Force logout ONLY if the user being edited is the current logged-in user
      const isCurrentUser = currentUser && initialData?.id === currentUser.id;
      if (isCurrentUser) {
        try {
          // First, call API to logout from backend (clear Redis session)
          await apiClient.post(`/api/users/${initialData?.id}/logout`);
          console.log(`✓ Backend logout successful for user ${initialData?.id}`);
          
          // Then, logout from frontend (clear tokens and state)
          await logout();
          console.log(`✓ Frontend logout successful for user ${initialData?.id}`);
          
          // Show success message and redirect to login
          toast.success('Đã xóa tenant thành công. Vui lòng đăng nhập lại để áp dụng thay đổi.');
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } catch (error: any) {
          console.error('Failed to logout user:', error);
          // Even if API fails, still logout from frontend
          try {
            await logout();
            toast.success('Đã xóa tenant thành công. Vui lòng đăng nhập lại để áp dụng thay đổi.');
            setTimeout(() => {
              router.push('/login');
            }, 1500);
          } catch (logoutError) {
            console.error('Failed to logout from frontend:', logoutError);
          }
        }
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user', initialData?.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Xóa tenant khỏi user thất bại';
      toast.error(errorMessage);
    },
  });

  // Handle remove tenant from user
  const handleRemoveTenant = (tenantId: number, tenantName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tenant "${tenantName}" khỏi user này?`)) {
      removeTenantMutation.mutate(tenantId);
    }
  };

  // Update form values when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isEditMode) {
      setValue('username', initialData.username);
      setValue('email', initialData.email);
      setValue('firstName', initialData.firstName);
      setValue('lastName', initialData.lastName);
      setValue('phone', initialData.phone || '');
      setValue('isActive', initialData.isActive);
      setValue('isVerified', initialData.isVerified);
      setValue('avatarUrl', initialData.avatarUrl || '');
      setValue('tenantId', initialData.primaryTenant?.tenantId || initialData.tenants?.[0]?.tenantId);
      setValue('roleId', initialData.primaryTenant?.roleId || initialData.tenants?.[0]?.roleId);
      setValue('isPrimary', initialData.primaryTenant?.isPrimary || initialData.tenants?.[0]?.isPrimary || false);
      
      // Set avatar preview if avatarUrl exists
      if (initialData.avatarUrl) {
        setAvatarPreview(initialData.avatarUrl);
        setAvatarFile(null); // Clear any file selection when loading initial data
      }
    }
  }, [initialData, isEditMode, setValue]);

  // Handle avatar file upload
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const processAvatarFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSubmitError('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Store the original file for FormData submission
    setAvatarFile(file);

    // Create preview for display
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      // Don't set avatarUrl in form data - we'll use the file directly in FormData
    };
    reader.onerror = () => {
      setSubmitError('Lỗi khi đọc file');
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop for avatar
  const handleAvatarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const onSubmitForm = async (data: any) => {
    try {
      setSubmitError(null);
      
      if (!isEditMode && data.password !== data.confirmPassword) {
        setSubmitError('Mật khẩu xác nhận không khớp');
        return;
      }

      // Check if we need to use FormData (if there's a file upload or in edit mode)
      const hasFileUpload = avatarFile !== null;
      const useFormData = hasFileUpload || isEditMode;

      let submitData: any;
      
      if (useFormData) {
        // Create FormData for multipart/form-data
        submitData = new FormData();
        
        // Add text fields - include username for edit mode
        if (isEditMode && data.username !== undefined && data.username !== '') {
          submitData.append('username', data.username);
        }
        if (data.email !== undefined && data.email !== '') submitData.append('email', data.email);
        if (data.firstName !== undefined && data.firstName !== '') submitData.append('firstName', data.firstName);
        if (data.lastName !== undefined && data.lastName !== '') submitData.append('lastName', data.lastName);
        if (data.phone !== undefined && data.phone !== '') submitData.append('phone', data.phone);
        
        // Add boolean fields as strings
        if (data.isActive !== undefined) submitData.append('isActive', String(data.isActive));
        if (data.isVerified !== undefined) submitData.append('isVerified', String(data.isVerified));
        
        // Add avatar file if exists - use field name 'avatarUrl' to match backend FileInterceptor
        if (avatarFile) {
          submitData.append('avatarUrl', avatarFile);
        }
        
        // Add tenant-related fields
        if (!isEditMode) {
          if (data.tenantId !== undefined && data.tenantId !== null && data.tenantId !== '') {
            submitData.append('tenantId', String(data.tenantId));
          }
          if (data.roleId !== undefined && data.roleId !== null && data.roleId !== '') {
            submitData.append('roleId', String(data.roleId));
          }
          if (data.isPrimary !== undefined) {
            submitData.append('isPrimary', String(data.isPrimary));
          }
        }
        
        // In create mode, add password fields
        if (!isEditMode) {
          if (data.password) submitData.append('password', data.password);
        }
        
        console.log('Submitting FormData:', {
          hasFile: !!avatarFile,
          fileName: avatarFile?.name,
          fileSize: avatarFile?.size,
          fields: Array.from(submitData.keys()),
        });
      } else {
        // Use JSON for create mode without file upload
        submitData = { ...data };
        delete submitData.confirmPassword;
        
        // Handle avatarUrl
        if (submitData.avatarUrl === '') {
          submitData.avatarUrl = null;
        }
        if (avatarPreview && !submitData.avatarUrl) {
          submitData.avatarUrl = avatarPreview;
        }
        
        // Convert tenantId and roleId to numbers if they exist
        if (submitData.tenantId !== undefined && submitData.tenantId !== null) {
          submitData.tenantId = typeof submitData.tenantId === 'string' ? parseInt(submitData.tenantId, 10) : submitData.tenantId;
        }
        if (submitData.roleId !== undefined && submitData.roleId !== null) {
          submitData.roleId = typeof submitData.roleId === 'string' ? parseInt(submitData.roleId, 10) : submitData.roleId;
        }
      }

      // In edit mode, just update user info (tenant/roles are handled separately via API)
      if (isEditMode) {
        // Remove tenant-related fields from submitData for user update
        if (useFormData) {
          submitData.delete('tenantId');
          submitData.delete('roleId');
          submitData.delete('isPrimary');
        } else {
          delete submitData.tenantId;
          delete submitData.roleId;
          delete submitData.isPrimary;
        }
        
        // Check if basic user info changed (not tenant/roles)
        const hasUserInfoChange = (
          data.email !== initialData?.email ||
          data.firstName !== initialData?.firstName ||
          data.lastName !== initialData?.lastName ||
          data.phone !== initialData?.phone ||
          data.isActive !== initialData?.isActive ||
          data.isVerified !== initialData?.isVerified
        );
        
        if (hasUserInfoChange) {
          await onSubmit(submitData);
        }
      } else {
        // For create mode or edit mode without tenant assignments
        // Check if tenantId or roleId changed in simple mode
        if (isEditMode && initialData) {
          const initialTenantId = initialData.primaryTenant?.tenantId || initialData.tenants?.[0]?.tenantId;
          const initialRoleId = initialData.primaryTenant?.roleId || initialData.tenants?.[0]?.roleId;
          const newTenantId = submitData.tenantId;
          const newRoleId = submitData.roleId;
          
          const hasTenantOrRoleChange = (initialTenantId !== newTenantId) || (initialRoleId !== newRoleId);
          const isCurrentUser = currentUser && initialData.id === currentUser.id;
          
          if (hasTenantOrRoleChange && isCurrentUser) {
            // Tenant or role changed AND it's the current user, logout after update
            await onSubmit(submitData);
            const userId = initialData.id;
            try {
              // First, call API to logout from backend (clear Redis session)
              await apiClient.post(`/api/users/${userId}/logout`);
              console.log(`✓ Backend logout successful for user ${userId}`);
              
              // Then, logout from frontend (clear tokens and state)
              await logout();
              console.log(`✓ Frontend logout successful for user ${userId}`);
              
              // Show success message and redirect to login
              toast.success('Đã cập nhật thành công. Vui lòng đăng nhập lại để áp dụng thay đổi.');
              
              // Redirect to login page after a short delay
              setTimeout(() => {
                router.push('/login');
              }, 1500);
            } catch (error: any) {
              console.error('Failed to logout user:', error);
              // Even if API fails, still logout from frontend
              try {
                await logout();
                toast.success('Đã cập nhật thành công. Vui lòng đăng nhập lại để áp dụng thay đổi.');
                setTimeout(() => {
                  router.push('/login');
                }, 1500);
              } catch (logoutError) {
                console.error('Failed to logout from frontend:', logoutError);
              }
            }
            return;
          } else if (hasTenantOrRoleChange && !isCurrentUser) {
            // Tenant or role changed but it's NOT the current user, just update without logout
            await onSubmit(submitData);
            return;
          }
        }
        
        if (!isEditMode && submitData.tenantId && !submitData.roleId) {
          setSubmitError('Role ID là bắt buộc khi có tenant ID');
          return;
        }

        await onSubmit(submitData);
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>
            Thông tin đăng nhập và liên hệ của người dùng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Avatar Upload - Moved to top */}
          <div className="space-y-2 pb-4 border-b">
            <Label htmlFor="avatarUrl">Avatar</Label>
            <div className="flex items-start gap-4">
              {/* Avatar Preview */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {avatarPreview || avatarUrl ? (
                    <img
                      src={avatarPreview || avatarUrl || ''}
                      alt="Avatar preview"
                      className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initialData?.fullName || watch('firstName') + ' ' + watch('lastName') || 'User')}&background=random&size=96`;
                      }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200 shadow-md">
                      {(watch('firstName')?.charAt(0) || watch('lastName')?.charAt(0) || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                {/* Upload File - Drag & Drop */}
                <div
                  onDragOver={handleAvatarDragOver}
                  onDrop={handleAvatarDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-50 hover:bg-green-50"
                  onClick={() => avatarFileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    ref={avatarFileInputRef}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Upload className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Kéo thả ảnh vào đây hoặc click để chọn
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Tên đăng nhập <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                {...register('username', { 
                  required: 'Tên đăng nhập là bắt buộc',
                  minLength: { value: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
                })}
                placeholder="johnsmith"
                disabled={isEditMode}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message as string}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ'
                  }
                })}
                placeholder="john@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Họ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                {...register('firstName', { required: 'Họ là bắt buộc' })}
                placeholder="John"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message as string}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...register('lastName', { required: 'Tên là bắt buộc' })}
                placeholder="Smith"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message as string}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+84 123 456 789"
            />
          </div>

          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Mật khẩu là bắt buộc',
                      minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                    })}
                    placeholder="••••••••"
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message as string}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', { 
                      required: 'Xác nhận mật khẩu là bắt buộc',
                      validate: (value) => value === password || 'Mật khẩu không khớp'
                    })}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message as string}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt tài khoản</CardTitle>
          <CardDescription>
            Cấu hình trạng thái và quyền của người dùng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Is Active */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Kích hoạt tài khoản</Label>
              <p className="text-sm text-gray-500">
                Cho phép người dùng đăng nhập vào hệ thống
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          {/* Is Verified */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isVerified">Xác thực email</Label>
              <p className="text-sm text-gray-500">
                Đánh dấu email đã được xác thực
              </p>
            </div>
            <Switch
              id="isVerified"
              checked={isVerified}
              onCheckedChange={(checked) => setValue('isVerified', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {!isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle>Gán Tenant và Role</CardTitle>
            <CardDescription>
              Chọn tenant và vai trò cho người dùng mới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tenant Selection */}
            <div className="space-y-2">
              <Label htmlFor="tenantId">
                Tenant
              </Label>
              {isPermissionError && availableTenants.length === 0 ? (
                <>
                  <div className="mb-2 p-3 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium">Không có quyền xem danh sách tenant</p>
                    <p className="text-xs mt-1">Vui lòng nhập Tenant ID và Role ID thủ công</p>
                  </div>
                  <Input
                    id="tenantId"
                    type="number"
                    placeholder="Nhập Tenant ID (ví dụ: 1)"
                    {...register('tenantId', {
                      setValueAs: (value) => value === '' ? undefined : parseInt(value, 10),
                    })}
                    className={errors.tenantId ? 'border-red-500' : ''}
                  />
                  {errors.tenantId && (
                    <p className="text-sm text-red-500">{errors.tenantId.message as string}</p>
                  )}
                </>
              ) : (
                <>
                  {isPermissionError && availableTenants.length > 0 && (
                    <div className="mb-2 p-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded">
                      Đang hiển thị các tenants mà bạn thuộc về
                    </div>
                  )}
                  <Select
                    value={selectedTenantId?.toString() || ''}
                    onValueChange={(value) => {
                      setValue('tenantId', value ? parseInt(value, 10) : undefined, { shouldValidate: true });
                    }}
                    disabled={isLoadingTenants}
                  >
                    <SelectTrigger className={errors.tenantId ? 'border-red-500' : ''}>
                      <SelectValue placeholder={isLoadingTenants ? 'Đang tải danh sách tenant...' : 'Chọn tenant'} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTenants ? (
                        <SelectItem value="loading" disabled>
                          Đang tải...
                        </SelectItem>
                      ) : availableTenants.length > 0 ? (
                        availableTenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id.toString()}>
                            {tenant.displayName || tenant.name} ({tenant.code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          {tenantsError ? 'Không thể tải danh sách tenant' : 'Không có tenant nào'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.tenantId && (
                    <p className="text-sm text-red-500">{errors.tenantId.message as string}</p>
                  )}
                  {tenantsError && !isPermissionError && (
                    <p className="text-sm text-red-500">Không thể tải danh sách tenant. Vui lòng thử lại sau.</p>
                  )}
                  {!isLoadingTenants && !tenantsError && tenantsData && tenantsData.tenants.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tìm thấy {tenantsData.total || tenantsData.tenants.length} tenant
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Role Selection - only show when tenant is selected OR when permission error */}
            {(selectedTenantId || (isPermissionError && availableTenants.length === 0)) && (
              <div className="space-y-2">
                <Label htmlFor="roleId">
                  Role {selectedTenantId && <span className="text-red-500">*</span>}
                </Label>
                {isPermissionError && availableTenants.length === 0 ? (
                  <>
                    <Input
                      id="roleId"
                      type="number"
                      placeholder="Nhập Role ID (ví dụ: 1)"
                      {...register('roleId', {
                        required: selectedTenantId ? 'Role ID là bắt buộc khi có tenant ID' : false,
                        setValueAs: (value) => value === '' ? undefined : parseInt(value, 10),
                      })}
                      className={errors.roleId ? 'border-red-500' : ''}
                    />
                    {errors.roleId && (
                      <p className="text-sm text-red-500">{errors.roleId.message as string}</p>
                    )}
                  </>
                ) : (
                  <>
                    <Select
                      value={watch('roleId')?.toString() || ''}
                      onValueChange={(value) => {
                        setValue('roleId', parseInt(value, 10), { shouldValidate: true });
                      }}
                      disabled={isLoadingRoles}
                    >
                      <SelectTrigger className={errors.roleId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={isLoadingRoles ? 'Đang tải...' : 'Chọn role'} />
                      </SelectTrigger>
                      <SelectContent>
                        {rolesError ? (
                          <SelectItem value="error" disabled>
                            Lỗi khi tải danh sách role
                          </SelectItem>
                        ) : isLoadingRoles ? (
                          <SelectItem value="loading" disabled>
                            Đang tải...
                          </SelectItem>
                        ) : rolesData?.roles && rolesData.roles.length > 0 ? (
                          rolesData.roles
                            .filter((role) => role.isActive)
                            .map((role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.displayName || role.name}
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="no-data" disabled>
                            Tenant này chưa có role nào
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.roleId && (
                      <p className="text-sm text-red-500">{errors.roleId.message as string}</p>
                    )}
                    {rolesError && (
                      <p className="text-sm text-red-500">Không thể tải danh sách role. Vui lòng thử lại sau.</p>
                    )}
                    {rolesData && rolesData.roles.length === 0 && !isLoadingRoles && !rolesError && (
                      <p className="text-sm text-yellow-600">Tenant này chưa có role nào</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Is Primary - only show when tenant is selected */}
            {selectedTenantId && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPrimary">Đặt làm tenant chính</Label>
                  <p className="text-sm text-gray-500">
                    Đánh dấu tenant này là tenant chính của người dùng
                  </p>
                </div>
                <Switch
                  id="isPrimary"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setValue('isPrimary', checked)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isEditMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Quản lý Tenants và Roles
                </CardTitle>
                <CardDescription className="mt-1">
                  Quản lý danh sách tenants và roles của người dùng. <strong>Lưu ý:</strong> User chỉ có các roles được gán cụ thể, không tự động có tất cả roles của tenant.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddTenantForm(!showAddTenantForm);
                  if (!showAddTenantForm) {
                    setSelectedTenantForForm(undefined);
                    setSelectedRolesForForm([]);
                    setIsPrimaryForForm(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {showAddTenantForm ? 'Ẩn form thêm' : 'Thêm Tenant'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Tenants List - Improved UX */}
            {groupedTenants.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Danh sách Tenants ({groupedTenants.length})
                  </Label>
                </div>
                <div className="space-y-3">
                  {groupedTenants.map((tenant) => {
                    const isExpanded = expandedTenants.has(tenant.tenantId);
                    
                    return (
                      <div
                        key={tenant.tenantId}
                        className={`border rounded-lg overflow-hidden transition-all ${
                          tenant.isPrimary
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Tenant Header */}
                        <div className="flex items-start justify-between p-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg mt-1 ${
                              tenant.isPrimary ? 'bg-blue-200' : 'bg-gray-100'
                            }`}>
                              <Building2 className={`h-5 w-5 ${
                                tenant.isPrimary ? 'text-blue-700' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="font-semibold text-gray-900 text-lg">
                                  {tenant.tenantName}
                                </span>
                                {tenant.isPrimary && (
                                  <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {tenant.tenantCode}
                                </span>
                                {tenant.joinedAt && (
                                  <>
                                    <span>•</span>
                                    <span className="text-xs">
                                      Tham gia: {new Date(tenant.joinedAt).toLocaleDateString('vi-VN')}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {/* Roles List - Always visible */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium text-gray-700">
                                    Roles đã được gán cho user trong tenant này ({tenant.roles.length})
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditTenantRoles(tenant.tenantId)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Thêm roles
                                  </Button>
                                </div>
                                {tenant.roles.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {tenant.roles.map((role) => (
                                      <div
                                        key={role.roleId}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                                      >
                                        <Badge variant="outline" className="bg-white text-blue-700 border-blue-300 text-xs font-medium">
                                          {role.roleName}
                                        </Badge>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            if (window.confirm(`Bạn có chắc chắn muốn xóa role "${role.roleName}" khỏi tenant "${tenant.tenantName}"?`)) {
                                              removeRoleMutation.mutate({ tenantId: tenant.tenantId, roleId: role.roleId });
                                            }
                                          }}
                                          disabled={removeRoleMutation.isPending}
                                          className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Xóa role này"
                                        >
                                          {removeRoleMutation.isPending ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <X className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200 text-center">
                                    Chưa có role nào. Nhấn "Thêm roles" để thêm role đầu tiên.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 pt-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTenantRoles(tenant.tenantId)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Thêm roles cho tenant này"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa tenant "${tenant.tenantName}" khỏi user này? Tất cả roles trong tenant này cũng sẽ bị xóa.`)) {
                                  handleRemoveTenant(tenant.tenantId, tenant.tenantName);
                                }
                              }}
                              disabled={removeTenantMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Xóa tenant khỏi user"
                            >
                              {removeTenantMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Add Tenant Form - Collapsible */}
            {showAddTenantForm && (
              <div id="add-tenant-form" className="space-y-4 border-2 border-dashed border-gray-300 rounded-lg p-5 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  <Label className="text-base font-semibold">
                    {selectedTenantForForm && initialData?.tenants?.some(t => t.tenantId === selectedTenantForForm)
                      ? 'Thêm roles cho tenant hiện tại'
                      : 'Thêm tenant mới'}
                  </Label>
                </div>
              
              {/* Tenant Selection */}
              <div className="space-y-2">
                <Label htmlFor="tenantForForm">Tenant</Label>
                {isPermissionError && availableTenants.length === 0 ? (
                  <div className="p-3 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium">Không có quyền xem danh sách tenant</p>
                  </div>
                ) : (
                  <>
                    <Select
                      value={selectedTenantForForm?.toString() || ''}
                      onValueChange={(value) => {
                        setSelectedTenantForForm(value ? parseInt(value, 10) : undefined);
                      }}
                      disabled={isLoadingTenants}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingTenants ? 'Đang tải...' : 'Chọn tenant'} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingTenants ? (
                          <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                        ) : availableTenants.length > 0 ? (
                          <>
                            {initialData?.tenants && initialData.tenants.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                                  Tenants hiện tại
                                </div>
                                {initialData.tenants.map((tenant) => {
                                  const tenantData = availableTenants.find(t => t.id === tenant.tenantId);
                                  if (!tenantData) return null;
                                  return (
                                    <SelectItem key={tenant.tenantId} value={tenant.tenantId.toString()}>
                                      <div className="flex items-center gap-2">
                                        {tenantData.displayName || tenantData.name} ({tenantData.code})
                                        {tenant.isPrimary && (
                                          <Badge variant="outline" className="text-xs">Primary</Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs bg-blue-50">
                                          Có {initialData.tenants?.filter(t => t.tenantId === tenant.tenantId).length || 0} role(s)
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-1">
                                  Thêm tenant mới
                                </div>
                              </>
                            )}
                            {availableTenants
                              .filter(tenant => 
                                !initialData?.tenants?.some(t => t.tenantId === tenant.id)
                              )
                              .map((tenant) => (
                                <SelectItem key={tenant.id} value={tenant.id.toString()}>
                                  {tenant.displayName || tenant.name} ({tenant.code})
                                </SelectItem>
                              ))}
                          </>
                        ) : (
                          <SelectItem value="no-data" disabled>
                            {tenantsError ? 'Không thể tải danh sách tenant' : 'Không còn tenant nào để thêm'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>

              {/* Roles Selection - Multiple */}
              {selectedTenantForForm && formRolesData && (() => {
                const currentRoleIds = getCurrentTenantRoleIds(selectedTenantForForm);
                const isExistingTenant = initialData?.tenants?.some(t => t.tenantId === selectedTenantForForm);
                const availableRoles = formRolesData.roles.filter(role => role.isActive);
                
                return (
                  <div className="space-y-2">
                    {isExistingTenant && currentRoleIds.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-2">
                          Roles đã được gán cho user trong tenant này:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {currentRoleIds.map(roleId => {
                            const role = formRolesData.roles.find(r => r.id === roleId);
                            return role ? (
                              <Badge key={roleId} variant="outline" className="bg-white">
                                {role.displayName || role.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Label>
                        {isExistingTenant ? 'Thêm roles mới cho user' : 'Chọn roles để gán cho user'} <span className="text-red-500">*</span>
                        {selectedRolesForForm.length > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({selectedRolesForForm.length} đã chọn)
                          </span>
                        )}
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Only select roles that user doesn't have yet
                            const rolesToSelect = availableRoles
                              .filter(role => !currentRoleIds.includes(role.id))
                              .map(role => role.id);
                            setSelectedRolesForForm(rolesToSelect);
                          }}
                          disabled={isLoadingFormRoles}
                        >
                          Chọn tất cả
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDeselectAllRoles}
                          disabled={isLoadingFormRoles}
                        >
                          Bỏ chọn tất cả
                        </Button>
                      </div>
                    </div>
                    
                    {isLoadingFormRoles ? (
                      <div className="p-4 text-center text-gray-500">Đang tải roles...</div>
                    ) : availableRoles.length > 0 ? (
                      <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                        {availableRoles.map((role) => {
                          const isCurrentRole = currentRoleIds.includes(role.id);
                          return (
                            <div key={role.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`role-${role.id}`}
                                checked={selectedRolesForForm.includes(role.id)}
                                onCheckedChange={() => handleToggleRole(role.id)}
                                disabled={isCurrentRole}
                              />
                              <Label
                                htmlFor={`role-${role.id}`}
                                className={`flex-1 cursor-pointer font-normal ${isCurrentRole ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-center gap-2">
                                  <div>
                                    <div className="font-medium">{role.displayName || role.name}</div>
                                    {role.description && (
                                      <div className="text-xs text-gray-500">{role.description}</div>
                                    )}
                                  </div>
                                  {isCurrentRole && (
                                    <Badge variant="outline" className="text-xs">Đã có</Badge>
                                  )}
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Tenant này chưa có role nào để gán cho user
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Is Primary */}
              {selectedTenantForForm && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Đặt làm tenant chính</Label>
                    <p className="text-sm text-gray-500">
                      Đánh dấu tenant này là tenant chính của người dùng
                    </p>
                  </div>
                  <Switch
                    checked={isPrimaryForForm}
                    onCheckedChange={setIsPrimaryForForm}
                  />
                </div>
              )}

                {/* Add Button */}
                {selectedTenantForForm && (
                  <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleAddRolesToTenant}
                            disabled={selectedRolesForForm.length === 0 || addRolesToTenantMutation.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {addRolesToTenantMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang thêm...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                {selectedTenantForForm && initialData?.tenants?.some(t => t.tenantId === selectedTenantForForm)
                                  ? 'Thêm roles ngay'
                                  : 'Thêm tenant và roles'}
                              </>
                            )}
                          </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedTenantForForm(undefined);
                        setSelectedRolesForForm([]);
                        setIsPrimaryForForm(false);
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            )}

                  {/* Empty State */}
                  {(!initialData?.tenants || initialData.tenants.length === 0) && !showAddTenantForm && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">Chưa có tenant nào</p>
                <p className="text-sm text-gray-500 mb-4">Nhấn nút "Thêm Tenant" để bắt đầu</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddTenantForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Thêm Tenant đầu tiên
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* GLOBAL Roles Management Section */}
      {isEditMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Quản lý GLOBAL Roles
                </CardTitle>
                <CardDescription className="mt-1">
                  Quản lý các GLOBAL roles của người dùng (không gắn với tenant cụ thể)
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddGlobalRolesForm(!showAddGlobalRolesForm);
                  if (!showAddGlobalRolesForm) {
                    setSelectedGlobalRolesForForm([]);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {showAddGlobalRolesForm ? 'Ẩn form thêm' : 'Thêm GLOBAL Roles'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current GLOBAL Roles List */}
            {userGlobalRoleIds.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Danh sách GLOBAL Roles ({userGlobalRoleIds.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {userGlobalRolesData?.roles?.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
                    >
                      <Badge variant="outline" className="bg-white text-purple-700 border-purple-300 text-xs font-medium">
                        {role.displayName || role.name}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc chắn muốn xóa GLOBAL role "${role.displayName || role.name}" khỏi user này?`)) {
                            removeGlobalRoleMutation.mutate({ roleId: role.id });
                          }
                        }}
                        disabled={removeGlobalRoleMutation.isPending}
                        className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa role này"
                      >
                        {removeGlobalRoleMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add GLOBAL Roles Form */}
            {showAddGlobalRolesForm && (
              <div id="add-global-roles-form" className="space-y-4 border-2 border-dashed border-purple-300 rounded-lg p-5 bg-gradient-to-br from-purple-50 to-white">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  <Label className="text-base font-semibold">
                    Thêm GLOBAL Roles
                  </Label>
                </div>
                
                {/* Roles Selection */}
                {isLoadingAllGlobalRoles ? (
                  <div className="p-4 text-center text-gray-500">Đang tải roles...</div>
                ) : allGlobalRolesData?.roles && allGlobalRolesData.roles.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        Chọn GLOBAL Roles <span className="text-red-500">*</span>
                        {selectedGlobalRolesForForm.length > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({selectedGlobalRolesForForm.length} đã chọn)
                          </span>
                        )}
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const rolesToSelect = allGlobalRolesData.roles
                              .filter(role => role.isActive && role.scope === 'GLOBAL' && !userGlobalRoleIds.includes(role.id))
                              .map(role => role.id);
                            setSelectedGlobalRolesForForm(rolesToSelect);
                          }}
                          disabled={isLoadingAllGlobalRoles}
                        >
                          Chọn tất cả
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedGlobalRolesForForm([])}
                          disabled={isLoadingAllGlobalRoles}
                        >
                          Bỏ chọn tất cả
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                      {allGlobalRolesData.roles
                        .filter(role => role.isActive && role.scope === 'GLOBAL')
                        .map((role) => {
                          const isCurrentRole = userGlobalRoleIds.includes(role.id);
                          return (
                            <div key={role.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`global-role-${role.id}`}
                                checked={selectedGlobalRolesForForm.includes(role.id)}
                                onCheckedChange={() => {
                                  setSelectedGlobalRolesForForm(prev => 
                                    prev.includes(role.id) 
                                      ? prev.filter(id => id !== role.id)
                                      : [...prev, role.id]
                                  );
                                }}
                                disabled={isCurrentRole}
                              />
                              <Label
                                htmlFor={`global-role-${role.id}`}
                                className={`flex-1 cursor-pointer font-normal ${isCurrentRole ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-center gap-2">
                                  <div>
                                    <div className="font-medium">{role.displayName || role.name}</div>
                                    {role.description && (
                                      <div className="text-xs text-gray-500">{role.description}</div>
                                    )}
                                  </div>
                                  {isCurrentRole && (
                                    <Badge variant="outline" className="text-xs">Đã có</Badge>
                                  )}
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Không có GLOBAL role nào trong hệ thống
                  </div>
                )}

                {/* Add Button */}
                {selectedGlobalRolesForForm.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAddGlobalRoles}
                      disabled={addGlobalRolesMutation.isPending}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {addGlobalRolesMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang thêm...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm {selectedGlobalRolesForForm.length} GLOBAL role(s)
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedGlobalRolesForForm([]);
                        setShowAddGlobalRolesForm(false);
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {userGlobalRoleIds.length === 0 && !showAddGlobalRolesForm && (
                  <div className="text-center py-8 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
                    <Shield className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">Chưa có GLOBAL role nào</p>
                    <p className="text-sm text-gray-500 mb-4">Nhấn nút "Thêm GLOBAL Roles" để bắt đầu</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
}


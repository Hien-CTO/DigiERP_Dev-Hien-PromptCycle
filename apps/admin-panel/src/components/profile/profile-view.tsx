'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Upload, X, Save, User, Mail, Phone, Calendar, Shield, Building2, Key, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserResponse, UpdateUserRequest } from '@/types/user';
import { toast } from 'react-hot-toast';

interface ProfileViewProps {
  userData: UserResponse;
  onSubmit: (data: UpdateUserRequest | FormData) => Promise<void>;
  isLoading?: boolean;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function ProfileView({ userData, onSubmit, isLoading = false }: ProfileViewProps) {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || '',
    },
  });

  // Reset form when userData changes
  useEffect(() => {
    reset({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || '',
    });
    if (userData.avatarUrl) {
      setAvatarPreview(userData.avatarUrl);
      setAvatarFile(null);
    }
  }, [userData, reset]);

  const email = watch('email');
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const phone = watch('phone');

  // Handle avatar file upload
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const processAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
    };
    reader.onerror = () => {
      toast.error('Lỗi khi đọc file');
    };
    reader.readAsDataURL(file);
  };

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

  const handleCancelAvatarEdit = () => {
    setAvatarPreview(userData.avatarUrl || null);
    setAvatarFile(null);
    setIsEditingAvatar(false);
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = '';
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    const formData = new FormData();
    formData.append('avatarUrl', avatarFile);
    
    await onSubmit(formData);
    setIsEditingAvatar(false);
    setAvatarFile(null);
  };

  const onSubmitForm = async (data: any) => {
    const hasFileUpload = avatarFile !== null;
    
    if (hasFileUpload) {
      // If there's a file, we already handled it in handleSaveAvatar
      return;
    }

    // Create FormData for consistency (even without file)
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    if (data.phone) {
      formData.append('phone', data.phone);
    }

    await onSubmit(formData);
  };

  const displayAvatar = avatarPreview || userData.avatarUrl || '';
  const hasAvatar = !!displayAvatar;
  const fullName = `${firstName} ${lastName}`.trim() || userData.fullName;
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
          <CardDescription>
            Quản lý thông tin cá nhân và avatar của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-start gap-6 pb-6 border-b">
            <div className="flex-shrink-0">
              <div className="relative">
                {hasAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={fullName}
                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&size=128`;
                    }}
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200 shadow-lg">
                    {initials}
                  </div>
                )}
                {!isEditingAvatar && (
                  <button
                    onClick={() => setIsEditingAvatar(true)}
                    className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
                    title="Chỉnh sửa avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {isEditingAvatar ? (
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-base font-semibold">Chỉnh sửa Avatar</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Tải lên file ảnh mới
                  </p>
                </div>

                <div
                  onDragOver={handleAvatarDragOver}
                  onDrop={handleAvatarDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-50 hover:bg-green-50"
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
                    <div className="p-3 bg-green-100 rounded-full">
                      <Upload className="h-6 w-6 text-green-600" />
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

                {avatarPreview && avatarFile && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{avatarFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(avatarFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelAvatarEdit}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={isLoading || !avatarFile}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu avatar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelAvatarEdit}
                    disabled={isLoading}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 pt-2">
                <Label className="text-base font-semibold">Avatar</Label>
                {hasAvatar ? (
                  <p className="text-sm text-gray-500 mt-1">
                    Nhấn vào icon camera để thay đổi avatar
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    Chưa có avatar. Nhấn vào icon camera để thêm avatar.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Họ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register('firstName', { required: 'Họ là bắt buộc' })}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...register('lastName', { required: 'Tên là bắt buộc' })}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message as string}</p>
                )}
              </div>
            </div>

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
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+84 123 456 789"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Trạng thái tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {userData.isActive ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Đang hoạt động
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <Badge variant="destructive">Không hoạt động</Badge>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {userData.isVerified ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Đã xác thực
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-yellow-600" />
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Chưa xác thực
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Information */}
      {(userData.primaryTenant || (userData.tenants && userData.tenants.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Thông tin Tenants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userData.primaryTenant && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Primary Tenant
                </label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{userData.primaryTenant.tenantName}</p>
                      <p className="text-sm text-gray-600">Mã: {userData.primaryTenant.tenantCode}</p>
                      {userData.primaryTenant.roleName && (
                        <p className="text-sm text-gray-600 mt-1">
                          Role: <span className="font-medium">{userData.primaryTenant.roleName}</span>
                        </p>
                      )}
                    </div>
                    <Badge className="bg-blue-600 text-white">Primary</Badge>
                  </div>
                </div>
              </div>
            )}
            
            {userData.tenants && userData.tenants.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Tất cả Tenants ({userData.tenants.length})
                </label>
                <div className="space-y-2">
                  {userData.tenants.map((tenant) => (
                    <div
                      key={tenant.tenantId}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{tenant.tenantName}</p>
                          <p className="text-sm text-gray-600">Mã: {tenant.tenantCode}</p>
                          {tenant.roleName && (
                            <p className="text-sm text-gray-600 mt-1">
                              Role: <span className="font-medium">{tenant.roleName}</span>
                            </p>
                          )}
                        </div>
                        {tenant.isPrimary && (
                          <Badge className="bg-blue-600 text-white">Primary</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Thông tin thời gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Ngày tạo
              </label>
              <p className="text-base text-gray-900 mt-1">{formatDate(userData.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Cập nhật lần cuối
              </label>
              <p className="text-base text-gray-900 mt-1">{formatDate(userData.updatedAt)}</p>
            </div>
            {userData.lastLoginAt && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Đăng nhập lần cuối
                </label>
                <p className="text-base text-gray-900 mt-1">{formatDate(userData.lastLoginAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


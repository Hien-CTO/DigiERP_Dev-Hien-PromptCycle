'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle, User, Mail, Phone, Calendar, Shield, Building2, Key, CheckCircle2, XCircle, Clock, Camera, Upload, X, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserResponse, UpdateUserRequest } from '@/types/user';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';

interface UserRolesPermissionsResponse {
  userId: number;
  roles: Array<{
    id: number;
    name: string;
    displayName: string;
    description?: string;
    scope: 'GLOBAL' | 'TENANT';
    tenantId?: number;
    isSystemRole: boolean;
    isActive: boolean;
  }>;
  permissions: string[];
  allPermissions: string[];
}

interface UserDetailViewProps {
  userId: number;
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

export function UserDetailView({ userId }: UserDetailViewProps) {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch user details
  const { data: userData, isLoading: isLoadingUser, error: userError } = useQuery<UserResponse>({
    queryKey: ['user', userId],
    queryFn: async () => {
      return await apiClient.get<UserResponse>(`/api/users/${userId}`);
    },
    enabled: !!userId,
    onSuccess: (data) => {
      setAvatarUrl(data.avatarUrl || '');
    },
  });

  // Fetch user roles and permissions
  const { data: rolesPermissionsData, isLoading: isLoadingRolesPermissions } = useQuery<UserRolesPermissionsResponse>({
    queryKey: ['user-roles-permissions', userId],
    queryFn: async () => {
      return await apiClient.get<UserRolesPermissionsResponse>(`/api/users/${userId}/roles-permissions`);
    },
    enabled: !!userId,
  });

  // Update avatar mutation - must be called before any early returns (Rules of Hooks)
  const updateAvatarMutation = useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      return await apiClient.put<UserResponse>(`/api/users/${userId}`, data);
    },
    onSuccess: () => {
      toast.success('Cập nhật avatar thành công');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setIsEditingAvatar(false);
      setAvatarPreview(null);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Cập nhật avatar thất bại';
      toast.error(errorMessage);
    },
  });

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Đang tải thông tin người dùng...</span>
      </div>
    );
  }

  if (userError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Đã xảy ra lỗi khi tải thông tin người dùng. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  if (!userData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Không tìm thấy thông tin người dùng
        </AlertDescription>
      </Alert>
    );
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarUrl(result); // Set base64 data URL
    };
    reader.onerror = () => {
      toast.error('Lỗi khi đọc file');
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle avatar URL change
  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value);
    setAvatarPreview(e.target.value || null);
  };

  // Handle save avatar
  const handleSaveAvatar = () => {
    if (!avatarUrl.trim()) {
      toast.error('Vui lòng nhập URL avatar hoặc chọn file ảnh');
      return;
    }

    updateAvatarMutation.mutate({
      avatarUrl: avatarUrl.trim() || undefined,
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setAvatarUrl(userData?.avatarUrl || '');
    setAvatarPreview(null);
    setIsEditingAvatar(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayAvatar = avatarPreview || userData?.avatarUrl || '';
  const hasAvatar = !!displayAvatar;

  const roles = rolesPermissionsData?.roles || [];
  const permissions = rolesPermissionsData?.allPermissions || [];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Section - chỉ hiển thị khi đang edit */}
          {isEditingAvatar && (
            <div className="pb-4 border-b">
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-base font-semibold">Chỉnh sửa Avatar</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Tải lên file ảnh hoặc nhập URL ảnh
                  </p>
                </div>

                {/* Upload File - Drag & Drop Area */}
                <div className="space-y-2">
                  <Label htmlFor="avatar-file">Tải lên file ảnh</Label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-50 hover:bg-green-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      id="avatar-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
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
                  {avatarPreview && avatarPreview.startsWith('data:image') && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      <strong>Lưu ý:</strong> File sẽ được lưu dưới dạng base64. Để tối ưu, hãy upload lên storage service (Cloudinary, AWS S3, etc.) và nhập URL vào ô bên dưới.
                    </div>
                  )}
                </div>

                {/* Avatar URL */}
                <div className="space-y-2">
                  <Label htmlFor="avatar-url">Hoặc nhập URL ảnh</Label>
                  <Input
                    id="avatar-url"
                    type="url"
                    value={avatarUrl}
                    onChange={handleAvatarUrlChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Nhập URL ảnh từ internet hoặc từ storage service
                  </p>
                </div>

                {/* Preview */}
                {avatarPreview && (
                  <div className="space-y-2">
                    <Label>Xem trước</Label>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          toast.error('Không thể load ảnh preview');
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">Avatar sẽ được cập nhật</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAvatarPreview(null);
                              setAvatarUrl(userData?.avatarUrl || '');
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {avatarPreview.startsWith('data:image') && (
                          <p className="text-xs text-gray-500">
                            File size: {Math.round((avatarPreview.length * 3) / 4 / 1024)} KB (base64)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={updateAvatarMutation.isPending || !avatarUrl.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updateAvatarMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu avatar
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={updateAvatarMutation.isPending}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* User Information with Avatar */}
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                {hasAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={userData?.fullName || 'Avatar'}
                    className="h-28 w-28 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.fullName || 'User')}&background=random&size=128`;
                    }}
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200 shadow-lg">
                    {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
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

            {/* Other Information */}
            <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Tên đầy đủ</label>
                <p className="text-base font-semibold text-gray-900">{userData.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Username</label>
                <p className="text-base font-semibold text-gray-900">{userData.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1.5 block flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-base text-gray-900 mt-0.5">{userData.email}</p>
              </div>
              {userData.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1.5 block flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    Số điện thoại
                  </label>
                  <p className="text-base text-gray-900 mt-0.5">{userData.phone}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Information */}
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

      {/* Tenants Information */}
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
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{userData.primaryTenant.tenantName}</p>
                      <p className="text-sm text-gray-600">Mã: {userData.primaryTenant.tenantCode}</p>
                      {userData.primaryTenant.roleName && (
                        <p className="text-sm text-gray-600 mt-1">
                          Role: <span className="font-medium">{userData.primaryTenant.roleName}</span>
                        </p>
                      )}
                      {userData.primaryTenant.joinedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tham gia: {formatDate(userData.primaryTenant.joinedAt)}
                        </p>
                      )}
                    </div>
                    {userData.primaryTenant.isPrimary && (
                      <Badge className="bg-blue-600 text-white">Primary</Badge>
                    )}
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
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{tenant.tenantName}</p>
                          <p className="text-sm text-gray-600">Mã: {tenant.tenantCode}</p>
                          {tenant.roleName && (
                            <p className="text-sm text-gray-600 mt-1">
                              Role: <span className="font-medium">{tenant.roleName}</span>
                            </p>
                          )}
                          {tenant.joinedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Tham gia: {formatDate(tenant.joinedAt)}
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

      {/* Roles and Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Roles và Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingRolesPermissions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Đang tải roles và permissions...</span>
            </div>
          ) : (
            <>
              {/* Roles */}
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Roles ({roles.length})
                </label>
                {roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Badge
                        key={role.id}
                        variant={role.isActive ? 'default' : 'secondary'}
                        className={
                          role.isActive
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            : 'bg-gray-100 text-gray-600'
                        }
                      >
                        {role.displayName}
                        {role.isSystemRole && (
                          <span className="ml-1 text-xs">(System)</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      User này chưa có roles nào được gán
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Permissions */}
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Permissions ({permissions.length})
                </label>
                {permissions.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto border rounded-md p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {permissions.map((permission, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="justify-start text-xs font-mono"
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      User này chưa có permissions nào được gán
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

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


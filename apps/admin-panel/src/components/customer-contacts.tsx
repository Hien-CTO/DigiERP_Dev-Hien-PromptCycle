'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Phone,
  Mail,
  Copy,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
  User,
  Briefcase,
} from 'lucide-react';
import { useCustomerContacts, useCreateCustomerContact, useUpdateCustomerContact, useDeleteCustomerContact, CustomerContact } from '@/hooks/use-customer-contacts';
import { toast } from 'react-hot-toast';

interface CustomerContactsProps {
  customerId: string;
}

export function CustomerContacts({ customerId }: CustomerContactsProps) {
  const { data: contacts, isLoading } = useCustomerContacts(customerId);
  const createMutation = useCreateCustomerContact(customerId);
  const updateMutation = useUpdateCustomerContact(customerId);
  const deleteMutation = useDeleteCustomerContact(customerId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CustomerContact | null>(null);

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success('Đã copy email vào clipboard');
    } catch (error) {
      toast.error('Không thể copy email');
    }
  };

  const handleOpenZalo = (zaloUrl: string | null) => {
    if (zaloUrl) {
      window.open(zaloUrl, '_blank');
    }
  };

  const handleDelete = async (contactId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      try {
        await deleteMutation.mutateAsync(contactId);
        toast.success('Đã xóa liên hệ thành công');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Không thể xóa liên hệ');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Danh sách liên hệ</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý các thông tin liên hệ của khách hàng
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm liên hệ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm liên hệ mới</DialogTitle>
              <DialogDescription>
                Thêm thông tin liên hệ cho khách hàng này
              </DialogDescription>
            </DialogHeader>
            <CreateContactForm
              customerId={customerId}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                toast.success('Đã thêm liên hệ thành công');
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!contacts || contacts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Chưa có thông tin liên hệ nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className={contact.isPrimary ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-base">{contact.title}</CardTitle>
                      {contact.isPrimary && (
                        <Badge variant="default" className="text-xs">Liên hệ chính</Badge>
                      )}
                    </div>
                    {contact.contactPerson && (
                      <CardDescription className="mt-1">
                        <User className="inline h-3 w-3 mr-1" />
                        {contact.contactPerson}
                      </CardDescription>
                    )}
                    {(contact.department || contact.position) && (
                      <CardDescription className="mt-1">
                        <Briefcase className="inline h-3 w-3 mr-1" />
                        {contact.department && contact.position
                          ? `${contact.department} - ${contact.position}`
                          : contact.department || contact.position}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingContact(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                    {contact.zaloUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenZalo(contact.zaloUrl)}
                        className="h-8 w-8 p-0"
                        title="Mở Zalo"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyEmail(contact.email!)}
                      className="h-8 w-8 p-0"
                      title="Copy email"
                    >
                      <Copy className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                )}
                {contact.notes && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm text-muted-foreground">{contact.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingContact && (
        <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa liên hệ</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin liên hệ
              </DialogDescription>
            </DialogHeader>
            <EditContactForm
              contact={editingContact}
              customerId={customerId}
              onSuccess={() => {
                setEditingContact(null);
                toast.success('Đã cập nhật liên hệ thành công');
              }}
              onCancel={() => setEditingContact(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateContactForm({
  customerId,
  onSuccess,
  onCancel,
}: {
  customerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    contactPerson: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    notes: '',
    isPrimary: false,
  });

  const createMutation = useCreateCustomerContact(customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tạo liên hệ');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="VD: Kế Toán, Nhận Hàng, Bộ phận kho"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Người liên hệ</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            placeholder="Tên người liên hệ"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0123456789"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Phòng ban</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="VD: Phòng Kế Toán"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Chức vụ</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="VD: Trưởng phòng"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Ghi chú thêm về liên hệ này"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPrimary"
          checked={formData.isPrimary}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isPrimary: checked === true })
          }
        />
        <Label htmlFor="isPrimary" className="cursor-pointer">
          Đặt làm liên hệ chính
        </Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Đang tạo...' : 'Tạo liên hệ'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditContactForm({
  contact,
  customerId,
  onSuccess,
  onCancel,
}: {
  contact: CustomerContact;
  customerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: contact.title,
    contactPerson: contact.contactPerson || '',
    phone: contact.phone || '',
    email: contact.email || '',
    department: contact.department || '',
    position: contact.position || '',
    notes: contact.notes || '',
    isPrimary: contact.isPrimary,
    isActive: contact.isActive,
  });

  const updateMutation = useUpdateCustomerContact(customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ id: contact.id, ...formData });
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật liên hệ');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Tiêu đề *</Label>
          <Input
            id="edit-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-contactPerson">Người liên hệ</Label>
          <Input
            id="edit-contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-phone">Số điện thoại</Label>
          <Input
            id="edit-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-department">Phòng ban</Label>
          <Input
            id="edit-department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-position">Chức vụ</Label>
          <Input
            id="edit-position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-notes">Ghi chú</Label>
        <Textarea
          id="edit-notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="edit-isPrimary"
            checked={formData.isPrimary}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isPrimary: checked === true })
            }
          />
          <Label htmlFor="edit-isPrimary" className="cursor-pointer">
            Liên hệ chính
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="edit-isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked === true })
            }
          />
          <Label htmlFor="edit-isActive" className="cursor-pointer">
            Đang hoạt động
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </DialogFooter>
    </form>
  );
}


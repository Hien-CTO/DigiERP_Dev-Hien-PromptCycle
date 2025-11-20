'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Globe,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'DigiERP',
    companyEmail: 'admin@digierp.com',
    companyPhone: '+84 123 456 789',
    companyAddress: '123 Đường ABC, Quận 1, TP.HCM',
    
    // System Settings
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    currency: 'VND',
    dateFormat: 'DD/MM/YYYY',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    sessionTimeout: 30,
    passwordExpiry: 90,
    twoFactorAuth: false,
    loginAttempts: 5,
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Cài đặt đã được lưu thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu cài đặt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      companyName: 'DigiERP',
      companyEmail: 'admin@digierp.com',
      companyPhone: '+84 123 456 789',
      companyAddress: '123 Đường ABC, Quận 1, TP.HCM',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi',
      currency: 'VND',
      dateFormat: 'DD/MM/YYYY',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
      twoFactorAuth: false,
      loginAttempts: 5,
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
    });
    toast.success('Đã khôi phục cài đặt mặc định');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-gray-600 mt-2">Quản lý cài đặt và cấu hình hệ thống</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Khôi phục
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Cài đặt chung
            </CardTitle>
            <CardDescription>
              Thông tin công ty và cài đặt cơ bản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Tên công ty</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="companyEmail">Email công ty</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="companyPhone">Số điện thoại</Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="companyAddress">Địa chỉ</Label>
              <Input
                id="companyAddress"
                value={settings.companyAddress}
                onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Cài đặt hệ thống
            </CardTitle>
            <CardDescription>
              Cấu hình ngôn ngữ, múi giờ và định dạng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="timezone">Múi giờ</Label>
              <select
                id="timezone"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              >
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
            <div>
              <Label htmlFor="language">Ngôn ngữ</Label>
              <select
                id="language"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <Label htmlFor="currency">Đơn vị tiền tệ</Label>
              <select
                id="currency"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Định dạng ngày</Label>
              <select
                id="dateFormat"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.dateFormat}
                onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Cài đặt thông báo
            </CardTitle>
            <CardDescription>
              Quản lý các loại thông báo hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Thông báo email</Label>
                <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smsNotifications">Thông báo SMS</Label>
                <p className="text-sm text-gray-500">Nhận thông báo qua SMS</p>
              </div>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotifications">Thông báo push</Label>
                <p className="text-sm text-gray-500">Nhận thông báo push trong trình duyệt</p>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Cài đặt bảo mật
            </CardTitle>
            <CardDescription>
              Cấu hình bảo mật và xác thực
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Thời gian hết hạn phiên (phút)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="passwordExpiry">Thời gian hết hạn mật khẩu (ngày)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => setSettings({...settings, passwordExpiry: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="loginAttempts">Số lần đăng nhập sai tối đa</Label>
              <Input
                id="loginAttempts"
                type="number"
                value={settings.loginAttempts}
                onChange={(e) => setSettings({...settings, loginAttempts: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactorAuth">Xác thực 2 yếu tố</Label>
                <p className="text-sm text-gray-500">Bật xác thực 2 yếu tố cho tài khoản</p>
              </div>
              <Switch
                id="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Cài đặt sao lưu
            </CardTitle>
            <CardDescription>
              Quản lý sao lưu dữ liệu tự động
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Sao lưu tự động</Label>
                <p className="text-sm text-gray-500">Tự động sao lưu dữ liệu hệ thống</p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
              />
            </div>
            {settings.autoBackup && (
              <>
                <div>
                  <Label htmlFor="backupFrequency">Tần suất sao lưu</Label>
                  <select
                    id="backupFrequency"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                  >
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="backupRetention">Thời gian lưu trữ (ngày)</Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    value={settings.backupRetention}
                    onChange={(e) => setSettings({...settings, backupRetention: parseInt(e.target.value)})}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}








'use client';

import { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { GreenButton } from '@/components/ui/green-button';
import { useCheckIn, useTodayAttendance } from '@/hooks/use-attendance';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface CheckInButtonProps {
  className?: string;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({ className }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [lateReason, setLateReason] = useState('');
  const { data: todayAttendance, isLoading: isLoadingToday } = useTodayAttendance();
  const checkInMutation = useCheckIn();

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync({
        location: location || undefined,
        lateReason: lateReason || undefined,
      });
      toast.success('Check-in thành công!');
      setIsDialogOpen(false);
      setLocation('');
      setLateReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Check-in thất bại. Vui lòng thử lại.');
    }
  };

  // Nếu đã check-in hôm nay, disable button
  const isCheckedIn = todayAttendance?.check_in_time && !todayAttendance?.check_out_time;
  const isCompleted = todayAttendance?.check_out_time;

  if (isLoadingToday) {
    return (
      <GreenButton disabled className={className}>
        <Clock className="mr-2 h-4 w-4" />
        Đang tải...
      </GreenButton>
    );
  }

  if (isCheckedIn) {
    return (
      <GreenButton disabled variant="secondary" className={className}>
        <Clock className="mr-2 h-4 w-4" />
        Đã check-in
      </GreenButton>
    );
  }

  if (isCompleted) {
    return (
      <GreenButton disabled variant="secondary" className={className}>
        <Clock className="mr-2 h-4 w-4" />
        Đã hoàn thành hôm nay
      </GreenButton>
    );
  }

  return (
    <>
      <GreenButton
        onClick={() => setIsDialogOpen(true)}
        className={className}
        icon={<Clock className="h-4 w-4" />}
      >
        Check-in
      </GreenButton>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Check-in</DialogTitle>
            <DialogDescription>
              Xác nhận check-in và cung cấp thông tin nếu cần
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="location">Địa điểm (tùy chọn)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="location"
                  placeholder="Nhập địa điểm check-in"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateReason">Lý do đi muộn (nếu có)</Label>
              <Textarea
                id="lateReason"
                placeholder="Nhập lý do đi muộn nếu bạn check-in sau giờ quy định"
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <GreenButton
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setLocation('');
                setLateReason('');
              }}
            >
              Hủy
            </GreenButton>
            <GreenButton
              onClick={handleCheckIn}
              loading={checkInMutation.isPending}
            >
              Xác nhận Check-in
            </GreenButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


'use client';

import { useState } from 'react';
import { ClockOut } from 'lucide-react';
import { GreenButton } from '@/components/ui/green-button';
import { useCheckOut, useTodayAttendance } from '@/hooks/use-attendance';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface CheckOutButtonProps {
  className?: string;
}

export const CheckOutButton: React.FC<CheckOutButtonProps> = ({ className }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [earlyLeaveReason, setEarlyLeaveReason] = useState('');
  const { data: todayAttendance, isLoading: isLoadingToday } = useTodayAttendance();
  const checkOutMutation = useCheckOut();

  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync({
        earlyLeaveReason: earlyLeaveReason || undefined,
      });
      toast.success('Check-out thành công!');
      setIsDialogOpen(false);
      setEarlyLeaveReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Check-out thất bại. Vui lòng thử lại.');
    }
  };

  // Chỉ cho phép check-out nếu đã check-in và chưa check-out
  const canCheckOut = todayAttendance?.check_in_time && !todayAttendance?.check_out_time;

  if (isLoadingToday) {
    return (
      <GreenButton disabled className={className}>
        <ClockOut className="mr-2 h-4 w-4" />
        Đang tải...
      </GreenButton>
    );
  }

  if (!canCheckOut) {
    return (
      <GreenButton disabled variant="secondary" className={className}>
        <ClockOut className="mr-2 h-4 w-4" />
        {todayAttendance?.check_out_time ? 'Đã check-out' : 'Chưa check-in'}
      </GreenButton>
    );
  }

  return (
    <>
      <GreenButton
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        className={className}
        icon={<ClockOut className="h-4 w-4" />}
      >
        Check-out
      </GreenButton>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Check-out</DialogTitle>
            <DialogDescription>
              Xác nhận check-out và cung cấp lý do nếu về sớm
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="earlyLeaveReason">Lý do về sớm (nếu có)</Label>
              <Textarea
                id="earlyLeaveReason"
                placeholder="Nhập lý do về sớm nếu bạn check-out trước giờ quy định"
                value={earlyLeaveReason}
                onChange={(e) => setEarlyLeaveReason(e.target.value)}
                rows={3}
              />
            </div>

            {todayAttendance?.check_in_time && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Check-in:</span>{' '}
                  {new Date(todayAttendance.check_in_time).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <GreenButton
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEarlyLeaveReason('');
              }}
            >
              Hủy
            </GreenButton>
            <GreenButton
              onClick={handleCheckOut}
              loading={checkOutMutation.isPending}
            >
              Xác nhận Check-out
            </GreenButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


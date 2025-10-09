import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface ReportModalProps {
  target: { type: 'post' | 'user'; id: string };
  onClose: () => void;
  onSubmit: (data: { reason: string; details: string }) => void;
}

export function ReportModal({ target, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = {
    post: [
      { value: 'spam', label: 'Spam or unwanted content' },
      { value: 'harassment', label: 'Harassment or bullying' },
      { value: 'hate-speech', label: 'Hate speech' },
      { value: 'misinformation', label: 'False or misleading information' },
      { value: 'inappropriate', label: 'Inappropriate content' },
      { value: 'copyright', label: 'Copyright violation' },
      { value: 'other', label: 'Other' }
    ],
    user: [
      { value: 'harassment', label: 'Harassment or bullying' },
      { value: 'spam', label: 'Spam behavior' },
      { value: 'impersonation', label: 'Impersonation' },
      { value: 'hate-speech', label: 'Hate speech' },
      { value: 'inappropriate', label: 'Inappropriate behavior' },
      { value: 'other', label: 'Other' }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit({ reason, details });
      toast.success('Report submitted successfully. Thank you for helping keep our community safe.');
      onClose();
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Report {target.type}</DialogTitle>
          </div>
          <DialogDescription>
            Help us understand what's happening. Your report will be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for reporting *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons[target.type].map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context that might help us understand the issue..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {details.length}/500 characters
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="space-y-1 text-xs">
              <li>• Our moderation team will review your report</li>
              <li>• We'll take appropriate action if guidelines are violated</li>
              <li>• You'll receive an update on the outcome</li>
              <li>• Reports are kept confidential</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive" 
              disabled={!reason || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { Component, Input, Output, EventEmitter, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ReportReason {
    value: string;
    label: string;
    description: string;
    icon: string;
}

@Component({
    selector: 'app-report-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './report-modal.component.html',
    styleUrls: ['./report-modal.component.css'],
})
export class ReportModalComponent {
    @Input() type: 'post' | 'user' = 'post';
    @Input() show: WritableSignal<boolean> = signal(false);
    @Output() close = new EventEmitter<void>();
    @Output() submit = new EventEmitter<{ reason: string; details: string }>();

    selectedReason = signal('');
    reportDetails = signal('');
    submittingReport = signal(false);

    reportReasons: ReportReason[] = [
        {
            value: 'SPAM',
            label: 'Spam',
            description: 'Repetitive or promotional content',
            icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>',
        },
        {
            value: 'HARASSMENT',
            label: 'Harassment or Bullying',
            description: 'Targeting or attacking someone',
            icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>',
        },
        {
            value: 'HATE_SPEECH',
            label: 'Hate Speech',
            description: 'Discriminatory or offensive language',
            icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>',
        },
        {
            value: 'FALSE_INFORMATION',
            label: 'False Information',
            description: 'Misleading or untrue content',
            icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        },
        {
            value: 'VIOLENCE',
            label: 'Violence or Dangerous Content',
            description: 'Threatening or harmful content',
            icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
        },
        {
            value: 'INAPPROPRIATE',
            label: 'Inappropriate Content',
            description: 'Sexually explicit or offensive material',
            icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>',
        },
        {
            value: 'OTHER',
            label: 'Other',
            description: 'Something else',
            icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        },
    ];

    get title(): string {
        return this.type === 'user' ? 'Report User' : 'Report Post';
    }

    get description(): string {
        return this.type === 'user'
            ? 'Please select a reason for reporting this user. Our team will review your report.'
            : 'Please select a reason for reporting this post. Our team will review your report.';
    }

    closeModal(event: Event) {
        event.stopPropagation();
        this.selectedReason.set('');
        this.reportDetails.set('');
        this.close.emit();
    }

    submitReport(event: Event) {
        event.stopPropagation();

        if (!this.selectedReason()) {
            return;
        }

        this.submittingReport.set(true);
        this.submit.emit({
            reason: this.selectedReason(),
            details: this.reportDetails(),
        });
    }
}


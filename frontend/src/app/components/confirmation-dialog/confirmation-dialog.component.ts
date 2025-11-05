import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirmation-dialog.component.html',
    styleUrl: './confirmation-dialog.component.css',
})
export class ConfirmationDialogComponent implements OnChanges {
    private _showValue = false;

    @Input() show: boolean | (() => boolean) = false; // Accept signal function or boolean
    @Input() title = 'Confirm Action';
    @Input() message = 'Are you sure you want to proceed?';
    @Input() confirmText = 'Confirm';
    @Input() cancelText = 'Cancel';
    @Input() type: 'danger' | 'warning' | 'info' = 'info';
    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['show']) {
            const showValue = changes['show'].currentValue;
            if (typeof showValue === 'function') {
                // If it's a signal function, call it to get the current value
                this._showValue = showValue();
            } else {
                this._showValue = !!showValue;
            }
        }
    }

    get isVisible(): boolean {
        // Use the stored value from OnChanges, which is updated when the input changes
        // This ensures we react to signal changes properly
        return this._showValue;
    }

    onConfirm(): void {
        this.confirmed.emit();
    }

    onCancel(): void {
        this.cancelled.emit();
    }

    onOverlayClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
            this.onCancel();
        }
    }
}



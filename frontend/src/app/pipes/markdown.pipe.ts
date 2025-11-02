import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

// Configure marked once for the entire application
marked.use({
    gfm: true, // GitHub Flavored Markdown (includes tables)
    breaks: true, // Support line breaks
});

@Pipe({
    name: 'markdown',
    standalone: true
})
export class MarkdownPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string): SafeHtml {
        if (!value) return this.sanitizer.bypassSecurityTrustHtml('');

        try {
            // Convert markdown to HTML synchronously
            const rawHtml = marked.parse(value, { async: false });

            // Sanitize the HTML to prevent XSS attacks
            const cleanHtml = DOMPurify.sanitize(rawHtml, {
                ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 's',
                    'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'br', 'img',
                    'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'style', 'class'],
                ALLOW_DATA_ATTR: false,
            });

            // Wrap images with max-width style for responsive design
            const styledHtml = cleanHtml.replace(
                /<img([^>]*)>/gi,
                '<img$1 style="max-width: 100%; height: auto;">'
            );

            // Add safe rel attributes to external links
            const safeLinksHtml = styledHtml.replace(
                /<a([^>]*href="https?:\/\/[^"]*"[^>]*)>/gi,
                '<a$1 rel="noopener noreferrer" target="_blank">'
            );

            // Return sanitized HTML marked as safe by Angular
            // DOMPurify already sanitized, so we can safely bypass Angular's sanitizer
            return this.sanitizer.bypassSecurityTrustHtml(safeLinksHtml);
        } catch (error) {
            console.error('Error parsing markdown:', error);
            // Return original text if markdown parsing fails
            return this.sanitizer.bypassSecurityTrustHtml(DOMPurify.sanitize(value));
        }
    }
}

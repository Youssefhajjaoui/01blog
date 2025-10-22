import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'markdown',
    standalone: true
})
export class MarkdownPipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';

        return this.parseMarkdown(value);
    }

    private parseMarkdown(text: string): string {
        // Convert markdown to HTML
        let html = text;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');

        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Inline code
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">');

        // Lists
        html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

        // Wrap consecutive list items in ul/ol
        html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
            const listItems = match.match(/<li>.*?<\/li>/g);
            if (listItems) {
                return `<ul>${listItems.join('')}</ul>`;
            }
            return match;
        });

        // Blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        // Remove extra line breaks before block elements
        html = html.replace(/<br>(<h[1-6]>)/g, '$1');
        html = html.replace(/<br>(<ul>)/g, '$1');
        html = html.replace(/<br>(<ol>)/g, '$1');
        html = html.replace(/<br>(<blockquote>)/g, '$1');
        html = html.replace(/<br>(<pre>)/g, '$1');

        // Wrap in paragraphs
        html = html.replace(/([^<>]+)/g, (match) => {
            const trimmed = match.trim();
            if (trimmed && !trimmed.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|code)/)) {
                return `<p>${trimmed}</p>`;
            }
            return match;
        });

        return html;
    }
}

import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * Get the correct API URL based on where the code is running
 * - Server-side (SSR in Docker): use gateway hostname
 * - Client-side (browser): use localhost
 */
export function getApiUrl(): string {
    const platformId = inject(PLATFORM_ID);

    if (isPlatformServer(platformId)) {
        // Server-side rendering in Docker container
        return 'http://gateway:8080';
    } else {
        // Client-side in browser
        return 'http://localhost:8080';
    }
}

/**
 * API URL constant for use in components and services
 * Call this function in constructor to get platform-aware URL
 */
export const API_BASE_URL = {
    get: getApiUrl
};


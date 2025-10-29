// Environment for server-side rendering (Docker)
export const environment = {
    production: false,
    // Use gateway hostname when running in Docker container (SSR)
    apiUrl: typeof process !== 'undefined' && process.env?.['API_URL']
        ? process.env['API_URL']
        : 'http://gateway:8080'
};


import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Web Utils — Developer Tools',
        short_name: 'Web Utils',
        description:
            'A suite of fast, free developer tools for editing, previewing, formatting, and converting code — all in your browser.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/favicon.ico',
                sizes: '256x256',
                type: 'image/x-icon',
            },
        ],
    };
}

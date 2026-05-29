import '../css/app.css';
import './bootstrap';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
      createRoot(el).render(
        <MantineProvider>
            <App {...props} />
        </MantineProvider>
      );
    },
    progress: {
        color: '#4B5563',
    },
});

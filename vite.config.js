import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <--- Importa el plugin

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(), // <--- Añade Tailwind aquí
    ],
    // resolve: {
    //     alias: {
    //         '@': path.resolve(__dirname, 'resources/js'),
    //     },
    // },
    
    // AÑADE ESTA SECCIÓN SERVER COMPLETA:
    // server: {
    //     host: 'localhost', // Volvemos a la estabilidad local
    //     port: 5173,
    //     hmr: {
    //         host: 'localhost',
    //     },
    //     cors: {
    //         origin: '*', // Permite que el túnel de internet lea los componentes
    //     },
    // },
    server: {
        host: '0.0.0.0',
        port: 5173,
    }
});

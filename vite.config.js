/**
 * VITE CONFIGURATION FILE
 * 
 * Vite is a modern build tool and development server for frontend applications.
 * It provides:
 * - Fast Hot Module Replacement (HMR) - instant updates without full page reload
 * - Optimized production builds
 * - Modern JavaScript/TypeScript support
 * - Plugin ecosystem
 * 
 * This configuration sets up Vite for the React frontend application.
 */

// Import Vite's configuration function
import { defineConfig } from 'vite'

// Import React plugin with SWC compiler for faster builds
// SWC is a super-fast TypeScript/JavaScript compiler written in Rust
import react from '@vitejs/plugin-react-swc'

/**
 * Export Vite configuration
 * 
 * Configuration options:
 * - plugins: Array of Vite plugins to use
 *   - react(): Enables React Fast Refresh and JSX transformation
 * 
 * Additional options you could add:
 * - server: { port: 3000 } - Change dev server port
 * - build: { outDir: 'dist' } - Change build output directory
 * - resolve: { alias: {...} } - Set up path aliases
 */
export default defineConfig({
  plugins: [react()],
})

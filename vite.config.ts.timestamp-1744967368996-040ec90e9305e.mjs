// vite.config.ts
import mdx from "file:///home/liaozhengyang/projects/three_demos/node_modules/@mdx-js/rollup/index.js";
import basicSSL from "file:///home/liaozhengyang/projects/three_demos/node_modules/@vitejs/plugin-basic-ssl/dist/index.mjs";
import react from "file:///home/liaozhengyang/projects/three_demos/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///home/liaozhengyang/projects/three_demos/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  plugins: [react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }), mdx(), basicSSL()],
  server: {
    hmr: false,
    host: "0.0.0.0",
    https: true,
    cors: true
  },
  resolve: {
    alias: {
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9saWFvemhlbmd5YW5nL3Byb2plY3RzL3RocmVlX2RlbW9zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9saWFvemhlbmd5YW5nL3Byb2plY3RzL3RocmVlX2RlbW9zL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2xpYW96aGVuZ3lhbmcvcHJvamVjdHMvdGhyZWVfZGVtb3Mvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgbWR4IGZyb20gJ0BtZHgtanMvcm9sbHVwJztcbmltcG9ydCBiYXNpY1NTTCBmcm9tICdAdml0ZWpzL3BsdWdpbi1iYXNpYy1zc2wnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbcmVhY3QoeyBpbmNsdWRlOiAvXFwuKGpzeHxqc3xtZHh8bWR8dHN4fHRzKSQvIH0pLCBtZHgoKSwgYmFzaWNTU0woKV0sXG5cdHNlcnZlcjoge1xuXHRcdGhtcjogZmFsc2UsXG5cdFx0aG9zdDogJzAuMC4wLjAnLFxuXHRcdGh0dHBzOiB0cnVlLFxuXHRcdGNvcnM6IHRydWUsXG5cdH0sXG5cdHJlc29sdmU6IHtcblx0XHRhbGlhczoge1xuXHRcdFx0J0B0YWJsZXIvaWNvbnMtcmVhY3QnOiAnQHRhYmxlci9pY29ucy1yZWFjdC9kaXN0L2VzbS9pY29ucy9pbmRleC5tanMnLFxuXHRcdH0sXG5cdH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFMsT0FBTyxTQUFTO0FBQzFULE9BQU8sY0FBYztBQUNyQixPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLDRCQUE0QixDQUFDLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQztBQUFBLEVBQzVFLFFBQVE7QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxFQUNQO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTix1QkFBdUI7QUFBQSxJQUN4QjtBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

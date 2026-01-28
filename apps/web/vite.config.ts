import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { holidays } from "@kyungseopk1m/holidays-kr";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: "holidays-kr-middleware",
      configureServer(server) {
        server.middlewares.use("/api/holidays", async (req, res, next) => {
          try {
            const reqUrl = (req as { url?: string }).url ?? "";
            const url = new URL(reqUrl, "http://localhost");
            const year = url.searchParams.get("year");

            if (!year) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ success: false, message: "year required", data: [] })
              );
              return;
            }

            const result = await holidays(year);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (error) {
            next(error);
          }
        });
      }
    }
  ]
});

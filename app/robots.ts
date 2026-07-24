import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/admin/",
                "/success/",
                "/cancelled/",
            ],
        },

        sitemap: getAbsoluteUrl("/sitemap.xml"),
        host: getAbsoluteUrl("/"),
    };
}
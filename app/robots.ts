import type { MetadataRoute } from "next";

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://booking.royalwaycc.org";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/admin/",
                "/checkout/",
            ],
        },

        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
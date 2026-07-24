import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return [
        {
            url: getAbsoluteUrl("/"),
            lastModified,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: getAbsoluteUrl("/book"),
            lastModified,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: getAbsoluteUrl("/agreement"),
            lastModified,
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}
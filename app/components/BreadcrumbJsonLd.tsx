type BreadcrumbItem = {
    name: string;
    url: string;
};

type BreadcrumbJsonLdProps = {
    items: BreadcrumbItem[];
};

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://royalwaycc.org";

export default function BreadcrumbJsonLd({
                                             items,
                                         }: BreadcrumbJsonLdProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${siteUrl}${item.url}`,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(jsonLd).replace(
                    /</g,
                    "\\u003c"
                ),
            }}
        />
    );
}
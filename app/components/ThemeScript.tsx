export default function ThemeScript() {
    const script = `
        (function () {
            try {
                var storageKey = "royalwaycc-theme";
                var savedTheme = localStorage.getItem(storageKey);
                var systemDark = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;

                var theme =
                    savedTheme === "dark" ||
                    savedTheme === "light"
                        ? savedTheme
                        : systemDark
                            ? "dark"
                            : "light";

                var root = document.documentElement;

                root.classList.toggle(
                    "dark",
                    theme === "dark"
                );

                root.style.colorScheme = theme;
            } catch (error) {
                document.documentElement.classList.add("dark");
                document.documentElement.style.colorScheme = "dark";
            }
        })();
    `;

    return (
        <script
            dangerouslySetInnerHTML={{
                __html: script,
            }}
        />
    );
}
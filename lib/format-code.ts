// Prettier's standalone build plus its five parser plugins is ~1.5 MB, and
// sql-formatter adds more. Both only matter once a format action actually runs,
// so they are imported on demand instead of at module load.

export async function formatWithPrettier(content: string, parser: string): Promise<string> {
    const [prettier, html, postcss, babel, estree, markdown] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/html'),
        import('prettier/plugins/postcss'),
        import('prettier/plugins/babel'),
        import('prettier/plugins/estree'),
        import('prettier/plugins/markdown'),
    ]);

    return prettier.format(content, {
        parser,
        plugins: [html, postcss, babel, estree, markdown],
        semi: true,
        singleQuote: true,
        tabWidth: 2,
    });
}

export async function formatSql(content: string): Promise<string> {
    const { format } = await import('sql-formatter');
    return format(content);
}

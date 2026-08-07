

export function generateSlug(title: string): string {
    const baseSlug = title
        .trim()
        .toLocaleLowerCase()  
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

        const random = Math.random()
            .toString(36)
            .substring(2, 8);

        return `${baseSlug}-${random}`;
}
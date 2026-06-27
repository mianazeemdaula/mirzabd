import prisma from "./prisma";
import { slugify_safe } from "./utils";

/**
 * Generates a unique product slug, checking both the database and an optional local set of already used slugs.
 * Useful to avoid unique constraint violations on slug field.
 *
 * @param baseText The name or slug to start with.
 * @param currentProductId Optional product ID to ignore (useful when updating an existing product).
 * @param localUsedSlugs Optional Set of slugs already used/generated in the current batch.
 */
export async function generateUniqueProductSlug(
  baseText: string,
  currentProductId?: number,
  localUsedSlugs?: Set<string>
): Promise<string> {
  let baseSlug = slugify_safe(baseText.trim());
  if (!baseSlug) {
    baseSlug = "product";
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    // Check local set first
    const isUsedLocally = localUsedSlugs && localUsedSlugs.has(slug);
    if (isUsedLocally) {
      counter++;
      slug = `${baseSlug}-${counter}`;
      continue;
    }

    // Check database
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(currentProductId !== undefined ? { NOT: { id: currentProductId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      // Unique! Add to local set if provided
      if (localUsedSlugs) {
        localUsedSlugs.add(slug);
      }
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

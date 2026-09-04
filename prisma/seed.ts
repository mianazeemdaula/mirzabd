import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@bookdepot.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "StrongPass123!";
  const hashedAdminPassword = await hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin Mirza",
      email: adminEmail,
      passwordHash: hashedAdminPassword,
      role: Role.ADMIN,
      phone: "03336936666",
    },
  });
  console.log(`Admin user created/verified: ${admin.email}`);

  // 2. Create Categories
  const categoriesData = [
    { name: "Fiction", slug: "fiction", description: "Bestselling novels, drama, and literature", displayOrder: 1 },
    { name: "Non-Fiction", slug: "non-fiction", description: "Biographies, history, essays, and true stories", displayOrder: 2 },
    { name: "Urdu Literature", slug: "urdu-literature", description: "Classic Urdu novels, poetry, and stories", displayOrder: 3 },
    { name: "Islamic Books", slug: "islamic-books", description: "Quran translations, Hadith collections, and history", displayOrder: 4 },
    { name: "Self-Help & Philosophy", slug: "self-help-philosophy", description: "Personal development, growth, and wisdom", displayOrder: 5 },
    { name: "Academic & Science", slug: "academic-science", description: "Educational textbooks, research, and science guides", displayOrder: 6 },
    { name: "Children's Books", slug: "childrens-books", description: "Illustrated storybooks, activities, and learning aids", displayOrder: 7 },
    { name: "Poetry", slug: "poetry", description: "Stunning collections of local and international verse", displayOrder: 8 },
  ];

  const categories: any[] = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, displayOrder: cat.displayOrder },
      create: cat,
    });
    categories.push(createdCat);
  }
  console.log(`Seeded ${categories.length} categories.`);

  // 3. Create Sample Products
  const sampleBooks = [
    {
      name: "Peer-e-Kamil (The Perfect Mentor)",
      slug: "peer-e-kamil",
      description: "Peer-e-Kamil is a masterpiece Urdu novel by Umera Ahmad, depicting the spiritual journeys of two distinct individuals and how their paths cross around divine guidance.",
      shortDescription: "Umera Ahmad's legendary spiritual bestseller.",
      sku: "PK-978-001",
      isbn: "9789696450009",
      author: "Umera Ahmad",
      publisher: "Ferozsons",
      publishYear: 2004,
      pages: 512,
      language: "Urdu",
      regularPrice: 1500.0,
      salePrice: 1200.0,
      manageStock: true,
      stockQuantity: 45,
      stockStatus: "instock",
      weight: 0.6,
      isFeatured: true,
      images: JSON.stringify([
        { src: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400", alt: "Peer-e-Kamil Book Cover", position: 0 }
      ]),
      categorySlug: "urdu-literature",
    },
    {
      name: "Jannat Kay Pattay",
      slug: "jannat-kay-pattay",
      description: "Jannat Kay Pattay is a widely popular romantic social novel by Nemrah Ahmed, outlining trust, struggle, and spiritual evolution through study abroad and dynamic character arcs.",
      shortDescription: "A tale of trust, agency, and spiritual evolution.",
      sku: "JKP-978-002",
      isbn: "9789696450016",
      author: "Nemrah Ahmed",
      publisher: "Al-Quresh",
      publishYear: 2013,
      pages: 650,
      language: "Urdu",
      regularPrice: 1800.0,
      salePrice: 1650.0,
      manageStock: true,
      stockQuantity: 28,
      stockStatus: "instock",
      weight: 0.8,
      isFeatured: true,
      images: JSON.stringify([
        { src: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400", alt: "Jannat Kay Pattay Cover", position: 0 }
      ]),
      categorySlug: "urdu-literature",
    },
    {
      name: "Atomic Habits",
      slug: "atomic-habits",
      description: "James Clear explains how tiny changes, repeated daily, lead to remarkable results. This book offers practical frameworks for building good habits and breaking bad ones.",
      shortDescription: "Build good habits, break bad ones.",
      sku: "AH-978-003",
      isbn: "9780735211292",
      author: "James Clear",
      publisher: "Penguin Books",
      publishYear: 2018,
      pages: 320,
      language: "English",
      regularPrice: 999.0,
      salePrice: 799.0,
      manageStock: true,
      stockQuantity: 120,
      stockStatus: "instock",
      weight: 0.4,
      isFeatured: true,
      images: JSON.stringify([
        { src: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400", alt: "Atomic Habits Cover", position: 0 }
      ]),
      categorySlug: "self-help-philosophy",
    },
    {
      name: "The Sealed Nectar (Ar-Raheeq Al-Makhtum)",
      slug: "the-sealed-nectar",
      description: "A complete authoritative book on the life of Prophet Muhammad (S.A.W.) by Sheikh Safi-ur-Rahman al-Mubarkpuri, awarded first prize by the Muslim World League.",
      shortDescription: "Award-winning biography of Prophet Muhammad (S.A.W.).",
      sku: "TSN-978-004",
      isbn: "9786035001106",
      author: "Safi-ur-Rahman al-Mubarkpuri",
      publisher: "Darussalam",
      publishYear: 1979,
      pages: 588,
      language: "English",
      regularPrice: 2200.0,
      salePrice: null,
      manageStock: true,
      stockQuantity: 15,
      stockStatus: "instock",
      weight: 0.9,
      isFeatured: false,
      images: JSON.stringify([
        { src: "https://images.unsplash.com/photo-1608223652353-247950e247b6?auto=format&fit=crop&q=80&w=400", alt: "The Sealed Nectar Cover", position: 0 }
      ]),
      categorySlug: "islamic-books",
    },
    {
      name: "Forty Rules of Love",
      slug: "forty-rules-of-love",
      description: "Elif Shafak unfolds two parallel narratives: one modern-day and another centering on the historical encounters of Rumi and Shams of Tabriz, revealing the timeless nature of divine love.",
      shortDescription: "A novel of Rumi, Shams, and the rules of love.",
      sku: "FRL-978-005",
      isbn: "9780143118527",
      author: "Elif Shafak",
      publisher: "Viking",
      publishYear: 2010,
      pages: 354,
      language: "English",
      regularPrice: 1250.0,
      salePrice: 950.0,
      manageStock: true,
      stockQuantity: 62,
      stockStatus: "instock",
      weight: 0.45,
      isFeatured: true,
      images: JSON.stringify([
        { src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400", alt: "Forty Rules of Love Cover", position: 0 }
      ]),
      categorySlug: "fiction",
    },
    {
      name: "Sapiens: A Brief History of Humankind",
      slug: "sapiens",
      description: "Yuval Noah Harari spans the history of human evolution from the Stone Age to modern political systems, describing how cognitive, agricultural, and scientific revolutions shaped our destiny.",
      shortDescription: "A brief history of humankind's revolutions.",
      sku: "SAP-978-006",
      isbn: "9780062316097",
      author: "Yuval Noah Harari",
      publisher: "Harper",
      publishYear: 2014,
      pages: 443,
      language: "English",
      regularPrice: 1600.0,
      salePrice: 1400.0,
      manageStock: true,
      stockQuantity: 30,
      stockStatus: "instock",
      weight: 0.5,
      isFeatured: false,
      images: JSON.stringify([
        { src: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=400", alt: "Sapiens Cover", position: 0 }
      ]),
      categorySlug: "non-fiction",
    },
  ];

  for (const book of sampleBooks) {
    const category = categories.find((c) => c.slug === book.categorySlug);
    if (!category) continue;

    // Remove categorySlug from the object to prevent Prisma runtime errors
    const { categorySlug, ...dbProduct } = book;

    const createdProduct = await prisma.product.upsert({
      where: { slug: dbProduct.slug },
      update: {
        name: dbProduct.name,
        regularPrice: dbProduct.regularPrice,
        salePrice: dbProduct.salePrice,
        stockQuantity: dbProduct.stockQuantity,
        description: dbProduct.description,
        isFeatured: dbProduct.isFeatured,
      },
      create: {
        ...dbProduct,
        categories: {
          connect: { id: category.id },
        },
      },
    });

    // Seed a category count update
    const productCount = await prisma.product.count({
      where: { categories: { some: { id: category.id } } }
    });
    
    await prisma.category.update({
      where: { id: category.id },
      data: { count: productCount }
    });
  }

  // Create an API credential for POS sync tests
  await prisma.apiCredential.upsert({
    where: { consumerKey: "ck_test_key_123456" },
    update: {},
    create: {
      description: "Test POS Integration",
      consumerKey: "ck_test_key_123456",
      consumerSecret: "cs_test_secret_789012",
      permissions: "read_write",
      isActive: true,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

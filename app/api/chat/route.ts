// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";

// Ensure the endpoint is dynamic and doesn't cache
export const dynamic = "force-dynamic";

const BYNARA_API_URL = "https://router.bynara.id/v1/chat/completions";
const MODEL_NAME = "mistral-large";

// Helper to convert Prisma Decimal values to regular numbers or strings for JSON serialization
function serializePrisma(data: any): any {
  if (data === null || data === undefined) return data;
  if (data instanceof Prisma.Decimal) return Number(data);
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map(serializePrisma);
  if (typeof data === "object") {
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializePrisma(data[key]);
      }
    }
    return serialized;
  }
  return data;
}

// -------------------------------------------------------------
// Database Tool Handlers
// -------------------------------------------------------------

async function searchBooks(args: {
  query?: string;
  categorySlug?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}) {
  try {
    const where: any = { status: "publish" };

    if (args.query) {
      where.OR = [
        { name: { contains: args.query } },
        { description: { contains: args.query } },
        { shortDescription: { contains: args.query } },
        { author: { contains: args.query } },
        { publisher: { contains: args.query } },
        { isbn: { contains: args.query } },
      ];
    }

    if (args.categorySlug) {
      where.categories = {
        some: { slug: args.categorySlug },
      };
    }

    if (args.author) {
      where.author = { contains: args.author };
    }

    if (args.isFeatured !== undefined) {
      where.isFeatured = args.isFeatured;
    }

    if (args.minPrice !== undefined || args.maxPrice !== undefined) {
      where.regularPrice = {};
      if (args.minPrice !== undefined) {
        where.regularPrice.gte = args.minPrice;
      }
      if (args.maxPrice !== undefined) {
        where.regularPrice.lte = args.maxPrice;
      }
    }

    const books = await prisma.product.findMany({
      where,
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        author: true,
        regularPrice: true,
        salePrice: true,
        stockStatus: true,
        stockQuantity: true,
        images: true,
      },
    });

    return serializePrisma(books);
  } catch (error: any) {
    console.error("searchBooks tool error:", error);
    return { error: error.message || "Failed to search books" };
  }
}

async function getBookDetails(args: { slug?: string; id?: number }) {
  try {
    if (!args.slug && !args.id) {
      return { error: "Either slug or id parameter is required" };
    }

    const where = args.id ? { id: args.id } : { slug: args.slug };
    const book = await prisma.product.findUnique({
      where,
      include: {
        categories: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!book) {
      return { error: "Book not found" };
    }

    return serializePrisma(book);
  } catch (error: any) {
    console.error("getBookDetails tool error:", error);
    return { error: error.message || "Failed to retrieve book details" };
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        count: true,
      },
    });

    return serializePrisma(categories);
  } catch (error: any) {
    console.error("getCategories tool error:", error);
    return { error: error.message || "Failed to retrieve categories" };
  }
}

async function getMyOrders(userId?: string) {
  try {
    if (!userId) {
      return { error: "User is not logged in. Log in to view order history." };
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: true,
      },
    });

    return serializePrisma(orders);
  } catch (error: any) {
    console.error("getMyOrders tool error:", error);
    return { error: error.message || "Failed to retrieve order history" };
  }
}

async function trackOrder(args: { orderNumber: string; email?: string }) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: args.orderNumber.trim() },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { error: `Order with number "${args.orderNumber}" was not found` };
    }

    // Verify email if provided (or if order has a guest email)
    if (args.email) {
      const queryEmail = args.email.trim().toLowerCase();
      const guestEmail = order.guestEmail?.trim().toLowerCase();
      const billing = order.billingAddress as any;
      const billingEmail = billing?.email?.trim().toLowerCase();
      const shipping = order.shippingAddress as any;
      const shippingEmail = shipping?.email?.trim().toLowerCase();

      if (
        guestEmail !== queryEmail &&
        billingEmail !== queryEmail &&
        shippingEmail !== queryEmail
      ) {
        return { error: "The email address provided does not match the order information." };
      }
    }

    return serializePrisma({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
      shippingCost: order.shippingCost,
      createdAt: order.createdAt,
      billingAddress: order.billingAddress,
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
      })),
    });
  } catch (error: any) {
    console.error("trackOrder tool error:", error);
    return { error: error.message || "Failed to track order" };
  }
}

async function getStoreInfo() {
  try {
    // Try reading knowledge base / QA md file if it exists
    const kbPath = path.join(process.cwd(), "chatbot-info.md");
    let markdownKnowledgeBase = "";
    if (fs.existsSync(kbPath)) {
      markdownKnowledgeBase = fs.readFileSync(kbPath, "utf-8");
    }

    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return {
      storeName: process.env.NEXT_PUBLIC_APP_NAME || "Mirza Book Depot",
      url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4066",
      knowledgeBase: markdownKnowledgeBase || undefined,
      deliveryInfo: "Standard Delivery (COD & Pre-paid via Stripe) across Pakistan. Delivery charges are flat PKR 200. Orders above PKR 2,000 get Free Shipping! Orders usually arrive within 2-4 business days.",
      returnsPolicy: "Mirza Book Depot offers a 7-day hassle-free returns policy. Books must be returned in their original condition (unmarked and undamaged) for a full refund or exchange.",
      contact: {
        email: "support@mirzabd.com",
        phone: "+92 300 1234567",
        address: "Mirza Book Depot, Mall Road, Lahore, Pakistan",
        hours: "Monday to Saturday, 10:00 AM - 10:00 PM PST",
      },
      settings: settingsMap,
    };
  } catch (error: any) {
    console.error("getStoreInfo tool error:", error);
    return { error: error.message || "Failed to retrieve store info" };
  }
}

// -------------------------------------------------------------
// OpenAI-Compatible Tool Schema Definitions
// -------------------------------------------------------------

const chatTools = [
  {
    type: "function",
    function: {
      name: "search_books",
      description: "Search books in the catalog by keyword, categories, authors, and price ranges.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Keyword search query (matches title, description, author, isbn, publisher)",
          },
          categorySlug: {
            type: "string",
            description: "Filter books by a specific category slug (e.g. 'fiction', 'history')",
          },
          author: {
            type: "string",
            description: "Filter books by author name",
          },
          minPrice: {
            type: "number",
            description: "Minimum price threshold",
          },
          maxPrice: {
            type: "number",
            description: "Maximum price threshold",
          },
          isFeatured: {
            type: "boolean",
            description: "Filter by featured products only",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_book_details",
      description: "Get detailed information of a specific book using its slug or ID.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The unique URL slug of the book",
          },
          id: {
            type: "number",
            description: "The database ID of the book",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_categories",
      description: "Retrieve a list of all active book categories in the store catalog.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_my_orders",
      description: "Get the order history for the logged-in customer.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "track_order",
      description: "Track shipping & payment status of an order using its order number (e.g. 'BD-YYYY-XXXX') and customer email.",
      parameters: {
        type: "object",
        properties: {
          orderNumber: {
            type: "string",
            description: "The order number (formatted like 'BD-2024-0001')",
          },
          email: {
            type: "string",
            description: "Optional email address associated with the order to verify ownership",
          },
        },
        required: ["orderNumber"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_store_info",
      description: "Retrieve store policies, shipping rates, delivery times, contact details, and location.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

// Helper to clean messages payload for OpenAI compatible Bynara API (removes reasoning_content and custom properties)
function cleanMessagesForApi(messages: any[]): any[] {
  return messages.map((m) => {
    const clean: any = {
      role: m.role,
      content: m.content || "",
    };

    if (m.name) {
      clean.name = m.name;
    }

    if (m.role === "assistant") {
      if (m.tool_calls && m.tool_calls.length > 0) {
        clean.tool_calls = m.tool_calls.map((tc: any) => ({
          id: tc.id,
          type: tc.type || "function",
          function: {
            name: tc.function.name,
            arguments: typeof tc.function.arguments === "object"
              ? JSON.stringify(tc.function.arguments)
              : tc.function.arguments || "{}",
          },
        }));
      }
    }

    if (m.role === "tool") {
      clean.tool_call_id = m.tool_call_id;
    }

    return clean;
  });
}

// Main Handler
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.BYNARA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "BYNARA_API_KEY environment variable is not set." },
        { status: 500 }
      );
    }

    const session = await auth();
    const currentUser = session?.user;

    const { messages: clientMessages } = await req.json();

    if (!clientMessages || !Array.isArray(clientMessages)) {
      return NextResponse.json(
        { error: "Invalid request payload. Expected an array of 'messages'." },
        { status: 400 }
      );
    }

    // Extract the latest user query to perform local RAG semantic search
    const lastUserMessage = [...clientMessages].reverse().find((m) => m.role === "user");
    const userQuery = lastUserMessage?.content || "";

    let ragContext = "";
    let semanticProductsContext = "";
    
    if (userQuery) {
      try {
        const { semanticSearch } = await import("@/lib/rag");
        const ragResult = await semanticSearch(userQuery, {
          limitKb: 3,
          limitProducts: 4,
          minScore: 0.3,
        });
        
        if (ragResult.knowledgeBase.length > 0) {
          ragContext = ragResult.knowledgeBase
            .map((chunk) => `[Topic: ${chunk.title}]\n${chunk.text}`)
            .join("\n\n");
        }
        
        if (ragResult.products.length > 0) {
          semanticProductsContext = ragResult.products
            .map((p) => `- ${p.name} (${p.author ? `by ${p.author}, ` : ""}Price: Rs. ${p.price}, Slug: '${p.slug}')`)
            .join("\n");
        }
      } catch (err) {
        console.error("Local RAG semantic search error:", err);
      }
    }

    // Fallback to minimal essential info if RAG didn't find specific chunks or had error
    if (!ragContext) {
      ragContext = "Store Name: Mirza Book Depot.\nAddress: Allah O Akbar Chowk, Deplapur, Punjab, Pakistan.\nStandard delivery: Rs. 200 (Free over Rs. 2,000). 7-day returns policy. Cash on Delivery (COD) and Credit/Debit Cards accepted. Contact: +92 333 6936666.";
    }

    let categoriesList = "";
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: { name: true, slug: true }
      });
      categoriesList = categories.map((c) => `- ${c.name} (slug: '${c.slug}')`).join("\n");
    } catch (err) {
      console.error("Failed to read categories list for system prompt:", err);
    }

    // Insert system prompt and construct full context
    const systemPrompt = {
      role: "system",
      content: `You are the Mirza Book Depot AI Assistant, a friendly and helpful virtual bookseller.
Your goals:
1. Help users search, browse and find products they love.
2. Provide details about product listings including authors, prices, publisher, pages, and availability.
3. Track client order status and retrieve their order details.
4. Answer general store info (delivery rates, refund rules, contact, opening times).

Relevant Knowledge Base Sections (RAG - Semantic Search):
${ragContext}

${semanticProductsContext ? `Suggested Products Matching Query (RAG - Semantic Search):\n${semanticProductsContext}` : ""}

Store Active Catalog Categories:
${categoriesList || "No categories found."}

Current user context:
- Name: ${currentUser?.name || "Guest User"}
- Email: ${currentUser?.email || "Not logged in"}
- Logged In: ${currentUser ? "Yes" : "No"}

Guidelines:
- CRITICAL: Skip reasoning steps and limit thinking. Keep your thinking/reasoning extremely brief (1-2 sentences maximum). Respond as fast as possible.
- CRITICAL: Do NOT use markdown tables (such as using pipes | and dashes -) or code block tables to present products, orders, or lists. Tables render poorly in the chat bubble UI. Instead, always use simple, clean bulleted lists or numbered lists with bold text for fields (e.g. title, price, author) and line breaks.
- You have direct access to the relevant Store Knowledge Base and Catalog Categories above. Answer general FAQs, address, hours, shipping, refund and category enquiries immediately using this context. Do NOT call the 'get_store_info' or 'get_categories' tools unless the information is not present in the static text.
- If a user asks about "my orders" or "my order history", and they are logged in, call the 'get_my_orders' tool.
- If a user asks to track a specific order and didn't provide a verification email, but is logged in, you can look up their orders. If guest, ask for their order number. If they give order number, call 'track_order'. You can request their email if required.
- Do not make up product listings, prices, or orders. Always call the corresponding tool to retrieve accurate database records.
- Format all response texts in beautiful Markdown. Use bullet points, bold tags, and spacing for high-end readability. Include links to product detail pages like '/products/[slug]' where appropriate.
- Keep answers polite, brief, and highly informative.`,
    };

    let messages = [systemPrompt, ...clientMessages];

    let loopLimit = 5;
    let toolExecutionCount = 0;
    let keepLooping = true;
    let lastResponseJson: any = null;

    while (keepLooping && toolExecutionCount < loopLimit) {
      const apiPayload = {
        model: MODEL_NAME,
        messages: cleanMessagesForApi(messages),
        tools: chatTools,
        tool_choice: "auto",
      };

      const response = await fetch(BYNARA_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bynara API returned error:", errorText);
        console.error("Request payload was:", JSON.stringify(apiPayload, null, 2));
        throw new Error(`Bynara API request failed: ${response.status} - ${errorText}`);
      }

      lastResponseJson = await response.json();
      const choice = lastResponseJson.choices?.[0];
      const assistantMessage = choice?.message;

      if (!assistantMessage) {
        throw new Error("Invalid response format received from Bynara LLM");
      }

      // Add the assistant's message to the conversation history
      messages.push(assistantMessage);

      // Check if the assistant wants to call any tools
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        toolExecutionCount++;
        const toolCalls = assistantMessage.tool_calls;

        for (const toolCall of toolCalls) {
          const { name: toolName, arguments: rawArgs } = toolCall.function;
          let args = {};
          try {
            args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
          } catch (e) {
            console.error("Failed to parse tool arguments:", rawArgs, e);
          }

          console.log(`Executing tool: ${toolName} with args:`, args);

          let toolResult: any;

          switch (toolName) {
            case "search_books":
              toolResult = await searchBooks(args);
              break;
            case "get_book_details":
              toolResult = await getBookDetails(args);
              break;
            case "get_categories":
              toolResult = await getCategories();
              break;
            case "get_my_orders":
              toolResult = await getMyOrders(currentUser?.id);
              break;
            case "track_order":
              toolResult = await trackOrder(args as { orderNumber: string; email?: string });
              break;
            case "get_store_info":
              toolResult = await getStoreInfo();
              break;
            default:
              toolResult = { error: `Tool ${toolName} not supported` };
          }

          // Push the tool result to messages array in OpenAI compatible format
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content: JSON.stringify(toolResult),
          });
        }
      } else {
        // No tool calls needed, we are done
        keepLooping = false;
      }
    }

    // Extract the final assistant reply to return to client
    const finalChoice = lastResponseJson?.choices?.[0];
    const finalMessage = finalChoice?.message;

    return NextResponse.json({
      message: finalMessage,
      history: messages.slice(1), // Exclude the initial system prompt to keep client logs clean
    });
  } catch (error: any) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during chat processing." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

async function groqSummarize(text: string, style: "short" | "detailed"): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key not configured");
  }

  const prompts = {
    short: "Create a concise, 2-3 sentence summary that captures the main points of this document:",
    detailed: "Create a comprehensive summary that covers all key points, main arguments, and important details from this document. Use bullet points where appropriate:"
  };

  const maxTokens = {
    short: 100,
    detailed: 300
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant", // Current fast model
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates accurate, informative summaries. Always focus on the key information and main ideas."
        },
        {
          role: "user",
          content: `${prompts[style]}\n\n${text.substring(0, 7000)}` // Limit input to avoid token limits
        }
      ],
      max_tokens: maxTokens[style],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.choices[0]?.message?.content || "Unable to generate summary";
}

// Generate both summary versions
async function generateSummaries(text: string) {
  try {
    // Run both summarizations in parallel for speed
    const [short, detailed] = await Promise.all([
      groqSummarize(text, "short"),
      groqSummarize(text, "detailed")
    ]);

    return { short, detailed };
  } catch (error) {
    console.error("Error generating summaries:", error);
    throw error;
  }
}

// ------------------ API Route ------------------

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    // Save file to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadsDir, safeFileName);
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${safeFileName}`;

    // Extract text based on file type
    if (file.type === "application/pdf") {
      const data = await pdf(buffer);
      text = data.text;
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.type === "text/plain") {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Clean up the extracted text
    const cleanedText = text
      .replace(/\s+/g, " ")  // Normalize whitespace
      .replace(/\n+/g, " ")  // Replace newlines with spaces
      .trim();

    if (!cleanedText || cleanedText.length < 50) {
      return NextResponse.json(
        {
          error: "File appears to be empty or contains insufficient text for summarization",
        },
        { status: 400 }
      );
    }

    // Generate summaries using Groq
    const summaries = await generateSummaries(cleanedText);

    return NextResponse.json({
      text: cleanedText,
      summaries: {
        short: summaries.short,
        detailed: summaries.detailed
      },
      wordCount: cleanedText.split(/\s+/).length,
      fileName: file.name,
      fileType: file.type,
      fileUrl, // ✅ now included
    });

  } catch (err) {
    console.error("❌ Server error:", err);
    
    if (err instanceof Error) {
      if (err.message.includes("Groq API")) {
        return NextResponse.json(
          { error: "AI summarization service unavailable. Please try again later." },
          { status: 503 }
        );
      }
      if (err.message.includes("API key")) {
        return NextResponse.json(
          { error: "AI service configuration error." },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

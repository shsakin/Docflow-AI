import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

export const runtime = "nodejs";

// ------------------ Helpers ------------------

// Break long texts into smaller chunks to avoid Hugging Face 400 errors
function chunkText(text: string, maxChunkSize: number = 900): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  for (const word of words) {
    if (currentChunk.join(" ").length + word.length > maxChunkSize) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [word];
    } else {
      currentChunk.push(word);
    }
  }

  if (currentChunk.length > 0) chunks.push(currentChunk.join(" "));
  return chunks;
}

// Hugging Face summarizer
async function hfSummarize(
  text: string,
  max_length: number,
  min_length: number
): Promise<string> {
  const API_TOKEN = process.env.HF_API_KEY;
  if (!API_TOKEN) throw new Error("Hugging Face API token not configured");

  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: text,
        parameters: { max_length, min_length, do_sample: false },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  return result[0]?.summary_text || "Unable to generate summary";
}

// Handle chunking + multiple versions
async function generateSummaries(text: string) {
  const chunks = chunkText(text, 900);

  // Summarize each chunk
  const summarizedChunks = await Promise.all(
    chunks.map((chunk) => hfSummarize(chunk, 120, 40))
  );

  const combinedText = summarizedChunks.join(" ");

  // Generate different styles
  const [short, medium, long] = await Promise.all([
    hfSummarize(combinedText, 60, 20),   // Short
    hfSummarize(combinedText, 120, 50),  // Medium
    hfSummarize(combinedText, 250, 100), // Long
  ]);

  const keyPoints = medium
    .split(". ")
    .map((s) => "• " + s.trim())
    .join("\n");

  return { short, medium, long, keyPoints };
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

    // Extract text
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

    const cleanedText = text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();

    if (!cleanedText || cleanedText.length < 50) {
      return NextResponse.json(
        {
          error:
            "File appears to be empty or contains insufficient text for summarization",
        },
        { status: 400 }
      );
    }

    // Generate summaries safely with chunking
    const summaries = await generateSummaries(cleanedText);

    return NextResponse.json({
      text: cleanedText,
      summaries,
      wordCount: cleanedText.split(/\s+/).length,
      fileName: file.name,
      fileType: file.type,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

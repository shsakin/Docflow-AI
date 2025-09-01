import { NextRequest, NextResponse } from "next/server";
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from "mammoth";

export const runtime = "nodejs";

// Function to chunk text into smaller pieces for summarization
function chunkText(text: string, maxChunkSize: number = 2000): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence.trim();
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Function to summarize text using Hugging Face API
async function summarizeText(text: string): Promise<string> {
  const API_TOKEN = process.env.HF_API_KEY;
  
  if (!API_TOKEN) {
    throw new Error("Hugging Face API token not configured");
  }

  // If text is too long, chunk it and summarize each chunk
  if (text.length > 3000) {
    const chunks = chunkText(text, 2000);
    const summaries: string[] = [];
    
    for (const chunk of chunks) {
      try {
        const response = await fetch(
          "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: chunk,
              parameters: {
                max_length: 150,
                min_length: 50,
                do_sample: false,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const result = await response.json();
        if (result[0]?.summary_text) {
          summaries.push(result[0].summary_text);
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn("Failed to summarize chunk:", error);
      }
    }
    
    // If we have multiple summaries, combine and summarize again
    if (summaries.length > 1) {
      const combinedSummary = summaries.join(" ");
      if (combinedSummary.length > 2000) {
        return await summarizeText(combinedSummary);
      }
      return combinedSummary;
    } else if (summaries.length === 1) {
      return summaries[0];
    } else {
      return "Unable to generate summary";
    }
  } else {
    // Text is short enough to summarize directly
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
          parameters: {
            max_length: 150,
            min_length: 30,
            do_sample: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    return result[0]?.summary_text || "Unable to generate summary";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

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
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Clean up the extracted text
    const cleanedText = text
      .replace(/\s+/g, " ")  // Normalize whitespace
      .replace(/\n+/g, " ")  // Replace newlines with spaces
      .trim();

    if (!cleanedText || cleanedText.length < 50) {
      return NextResponse.json({ 
        error: "File appears to be empty or contains insufficient text for summarization" 
      }, { status: 400 });
    }

    // Generate AI summary
    let summary = "";
    try {
      summary = await summarizeText(cleanedText);
    } catch (summaryError) {
      console.error("Summarization error:", summaryError);
      return NextResponse.json({ 
        error: "Failed to generate summary. Please check your API configuration." 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      text: cleanedText,
      summary: summary,
      wordCount: cleanedText.split(/\s+/).length,
      fileName: file.name,
      fileType: file.type
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
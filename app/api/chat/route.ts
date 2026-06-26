import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: Request) {
  try {
    console.log("API KEY:", process.env.GEMINI_API_KEY);
    const { message } = await req.json();

   const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

    const result = await model.generateContent(message);

    const response = result.response.text();

    return NextResponse.json({
      response,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const images = await prisma.siteImage.findMany({
    where: { category: category as string },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json(images);
}
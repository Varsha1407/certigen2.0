import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { read, utils } from "xlsx";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

interface Coordinates {
  x: number;
  y: number;
}

registerFont(
  path.join(process.cwd(), "public", "fonts", "Montserrat-Bold.ttf"),
  {
    family: "Montserrat",
  }
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const templateFile = formData.get("template") as Blob;
    const namesBatch = JSON.parse(formData.get("names") as string) as string[];
    const fontSize = parseInt(formData.get("fontSize") as string);
    const coordinates: Coordinates = JSON.parse(
      formData.get("coordinates") as string
    );

    if (!templateFile || !namesBatch || !fontSize || !coordinates) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert the template Blob to a buffer
    const templateArrayBuffer = await templateFile.arrayBuffer();
    const templateBuffer = Buffer.from(templateArrayBuffer);

    // Load the template image using canvas
    const templateImage = await loadImage(templateBuffer);
    const canvas = createCanvas(templateImage.width, templateImage.height);
    const ctx = canvas.getContext("2d");

    const zip = new JSZip();

    for (const name of namesBatch) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(templateImage, 0, 0);

      ctx.font = `${fontSize}px Montserrat`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "white";

      ctx.fillText(name, coordinates.x, coordinates.y);

      const buffer = canvas.toBuffer("image/png");
      zip.file(`${name}.png`, buffer);
    }

    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipContent, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="certificates.zip"',
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


import { read, utils } from 'xlsx';
import JSZip from 'jszip';
import { createCanvas, loadImage } from 'canvas';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
    const zip = new JSZip();
    const { name, coordinates, roleId, discordid, githubid } = await req.json();
    const formData = req.body;
    const position = JSON.parse(formData.get('position'));

    // Load the certificate template image
    const imageBuffer = formData.get('image').buffer;
    const img = await loadImage(imageBuffer);

    // Parse the Excel file
    const excelBuffer = formData.get('excel').buffer;
    const workbook = read(excelBuffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const names = utils.sheet_to_json(sheet).map((row) => row['Name']);

    // Generate certificates
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    for (const name of names) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.font = '30px Arial';
      ctx.fillText(name, position.x, position.y);

      const certificateBuffer = canvas.toBuffer('image/png');
      zip.file(`${name}.png`, certificateBuffer);
    }

    // Create zip and send it to the client
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=certificates.zip');
    res.send(zipBuffer);
   else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

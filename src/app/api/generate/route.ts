import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { read, utils } from 'xlsx';
import { createCanvas, loadImage } from 'canvas';

interface Coordinates {
    x: number;
    y: number;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const templateFile = formData.get('template') as Blob;
        const excelFile = formData.get('excel') as Blob;
        const fontSize = parseInt(formData.get('fontSize') as string);
        const coordinates: Coordinates = JSON.parse(formData.get('coordinates') as string);

        if (!templateFile || !excelFile || !fontSize || !coordinates) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const zip = new JSZip();

        // Convert the template Blob to a buffer
        const templateArrayBuffer = await templateFile.arrayBuffer();
        const templateBuffer = Buffer.from(templateArrayBuffer);

        // Load the template image using canvas
        const templateImage = await loadImage(templateBuffer);
        const canvas = createCanvas(templateImage.width, templateImage.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(templateImage, 0, 0);

        // Read the Excel file
        const excelArrayBuffer = await excelFile.arrayBuffer();
        const workbook = read(excelArrayBuffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const names = utils.sheet_to_json<string[]>(sheet, { header: 1 }).slice(1).map(row => row[0]);

        for (const name of names) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(templateImage, 0, 0);

            ctx.font = `${fontSize}px Montserrat`;
            ctx.textAlign = 'left'; // Ensure text aligns as expected
            ctx.textBaseline = 'top';
            const xOffset = 0; // Adjust as necessary
            const yOffset = 0; 
            ctx.fillText(name, coordinates.x + xOffset, coordinates.y + yOffset);

            const buffer = canvas.toBuffer('image/png');
            zip.file(`${name}.png`, buffer);
        }

        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

        return new NextResponse(zipContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="certificates.zip"',
            },
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
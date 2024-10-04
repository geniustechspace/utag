import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import libre from "libreoffice-convert";
import { v4 as uuidv4 } from "uuid";
import { tmpdir } from "os";
import { promisify } from "util";

// Promisify the `libreoffice-convert.convert` function
const convertAsync = promisify(libre.convert);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as Blob;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert Blob to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        // Temporary paths
        const tempDir = tmpdir();
        const inputFilePath = join(tempDir, `${uuidv4()}.docx`);
        const outputFilePath = join(tempDir, `${uuidv4()}.pdf`);

        // Write the input file to disk
        // await fs.writeFile(inputFilePath, inputBuffer);

        // Convert DOCX to PDF
        const ext = ".pdf";
        const pdfBuffer = await convertAsync(inputBuffer, ext, undefined);

        // Optionally, save the PDF to disk
        await fs.writeFile(outputFilePath, pdfBuffer);

        // Respond with the converted PDF file as a blob
        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="converted.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error converting file to PDF:", error);
        return NextResponse.json({ error: "File conversion failed" }, { status: 500 });
    }
}

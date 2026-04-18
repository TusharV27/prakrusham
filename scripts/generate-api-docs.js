import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import fs from 'fs';
import path from 'path';

// List of User-Facing API routes (Excluding Admin and Debug/Log APIs)
const userRouteFiles = [
    "app\\api\\auth\\otp\\route.js",
    "app\\api\\auth\\verify\\route.js",
    "app\\api\\articles\\route.js",
    "app\\api\\articles\\[handle]\\route.js",
    "app\\api\\blogs\\route.js",
    "app\\api\\cart\\route.js",
    "app\\api\\cart\\recommendations\\route.js",
    "app\\api\\categories\\route.js",
    "app\\api\\categories\\[id]\\route.js",
    "app\\api\\customers\\route.js",
    "app\\api\\customers\\addresses\\route.js",
    "app\\api\\customers\\addresses\\[addressId]\\route.js",
    "app\\api\\customers\\[id]\\route.js",
    "app\\api\\events\\route.js",
    "app\\api\\events\\[slug]\\route.js",
    "app\\api\\location\\route.js",
    "app\\api\\offers\\route.js",
    "app\\api\\offers\\[slug]\\route.js",
    "app\\api\\products\\route.js",
    "app\\api\\products\\bulk\\route.js",
    "app\\api\\products\\[id]\\route.js",
    "app\\api\\profile\\route.js",
    "app\\api\\reviews\\route.js",
    "app\\api\\vendors\\route.js",
    "app\\api\\vendors\\login\\route.js",
    "app\\api\\vendors\\[id]\\route.js",
    "app\\api\\wishlist\\route.js"
];

function createEndpointTable(pathStr) {
    const apiPath = "/" + pathStr.replace(/\\/g, "/").replace("app/api/", "").replace("/route.js", "");
    
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Path", bold: true })] })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: apiPath, color: "2E74B5" })] })], width: { size: 80, type: WidthType.PERCENTAGE } }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Module", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph(apiPath.split('/')[1].toUpperCase())] }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph("User-facing endpoint for " + apiPath.split('/')[1] + " functionality. Refer to route handler for detailed parameters.")] }),
                ],
            }),
        ],
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
    });
}

const doc = new Document({
    sections: [
        {
            children: [
                new Paragraph({
                    text: "Prakrushi Application - User API Reference",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: `Documentation for ${userRouteFiles.length} User-facing API endpoints (Excluding Admin Access).`,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    text: "Overview",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph("This document contains the API endpoints relevant to the frontend application and general users. Administrative and debugging endpoints have been excluded for security and clarity."),
                
                ...userRouteFiles.flatMap((route) => {
                    const moduleName = route.replace("app\\api\\", "").replace("\\route.js", "");
                    return [
                        new Paragraph({
                            text: moduleName,
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 200 },
                        }),
                        createEndpointTable(route),
                        new Paragraph({ text: "", spacing: { after: 200 } })
                    ];
                })
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    const outputPath = "Prakrushi_User_API_Docs.docx";
    fs.writeFileSync(outputPath, buffer);
    console.log(`Documentation generated successfully: ${outputPath}`);
});

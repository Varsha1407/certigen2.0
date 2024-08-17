## Certigen2.0
This certificate generator  allows you to upload a certificate template (PNG), select a position for the names, and generate certificates in batches using names from an Excel sheet. The generated certificates will be downloaded as ZIP files.

## Features
* Upload a PNG certificate template.
* Upload an Excel file containing names.
* Drag and drop to adjust the name's position on the certificate.
* Set custom font size for the names.
* Generate certificates in batches and download them as ZIP files.
* Automatically skip generating certificates for empty or null values in the Excel sheet.

## How to Use
1. Upload Certificate Template: Click "Upload Certificate Template" and choose a PNG image file that will serve as the certificate template.
2. Upload Excel Sheet: Upload an Excel file (.xlsx) containing names. The names should be in the first column.
3. Set Font Size: Input the desired font size for the names.
4. Adjust Name Position: Drag the [Name] placeholder on the certificate template to adjust its position. The adjusted coordinates will be used for placing names.
5. Generate Certificates: Click "Generate Certificates". The names will be processed in batches of 10, and certificates will be downloaded as ZIP files.

## Frameworks Used: 
NextJS

## Packages Used:
1. Draggable
2. XLSX.js
3. Canvas(Node.js)
4. JSZip


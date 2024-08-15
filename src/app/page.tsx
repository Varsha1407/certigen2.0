"use client";
import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";

export default function Home() {
  const handleStop = (e: any, data: any) => {
    const draggableElement = e.target;
    const elementWidth = draggableElement.offsetWidth;
    const elementHeight = draggableElement.offsetHeight;
    setPosition({ x: data.x, y: data.y });
    setOffset({ x: elementWidth / 2, y: elementHeight / 2 });
  };

  const [image, setImage] = useState<File | null>(null);
  const [namesFile, setNamesFile] = useState<File | null>(null);
  const [fontSize, setFontSize] = useState<number>(30);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 100,
    y: 100,
  });
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [displayedDimensions, setDisplayedDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNamesFile(e.target.files[0]);
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(parseInt(e.target.value));
  };

  // Set displayed image dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      setDisplayedDimensions({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight,
      });
    }
  };

  const handleSubmit = async () => {
    if (!image || !namesFile || !fontSize || !position) {
      alert("Please ensure all fields are filled out correctly.");
      return;
    }

    console.log("Draggable Position:", position);

    const img = new Image();
    img.src = URL.createObjectURL(image);

    img.onload = async () => {
      const originalWidth = img.width;
      const originalHeight = img.height;

      // Get the displayed image dimensions
      const displayedImage = document.querySelector("img");
      const displayedWidth =
        document.querySelector("img")?.clientWidth ?? originalWidth;
      const displayedHeight =
        document.querySelector("img")?.clientHeight ?? originalHeight;

      // Calculate scaling factors
      const scaleX = originalWidth / displayedWidth;
      const scaleY = originalHeight / displayedHeight;

      // Adjust the position
      const adjustedPosition = {
        x: (position.x + offset.x) * scaleX,
        y: (position.y + offset.y) * scaleY,
      };

      const formData = new FormData();
      formData.append("template", image);
      formData.append("excel", namesFile);
      formData.append("fontSize", fontSize.toString());
      formData.append("coordinates", JSON.stringify(adjustedPosition));

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "certificates.zip";
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to generate certificates.");
      }
    };
  };

  return (
    <div>
      <h1>Certificate Generator</h1>
      <div>
        <div>Upload Certificate Template (PNG): </div>
        <input type="file" accept="image/png" onChange={handleImageUpload} />
      </div>
      <div>
        <div>Upload Names Excel Sheet: </div>
        <input type="file" accept=".xlsx" onChange={handleExcelUpload} />
      </div>
      <div>
        <div>Font Size: </div>
        <input
          className="text-black"
          type="number"
          value={fontSize}
          onChange={handleFontSizeChange}
          min="1"
        />
      </div>
      {image && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            ref={imageRef}
            src={URL.createObjectURL(image)}
            alt="Certificate Template"
            onLoad={handleImageLoad} // Ensures the dimensions are set once the image is loaded
          />
          <Draggable position={position} onStop={handleStop}>
            <div style={{ position: "absolute", top: 0, left: 0 }}>
              <span
                draggable="false"
                style={{ fontSize: `${fontSize}px`, cursor: "move" }}
              >
                [Name]
              </span>
            </div>
          </Draggable>
        </div>
      )}
      <button onClick={handleSubmit}>Generate Certificates</button>
    </div>
  );
}

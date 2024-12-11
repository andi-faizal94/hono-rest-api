import { fileTypeFromBuffer } from "file-type";
import * as fs from "fs";
import { createWriteStream } from "fs";
import { Context } from "hono";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../prisma/client";

const UPLOAD_DIR = "./uploads";

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const uploadedFiles: any = [];

// Limit for file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadFile(c: Context) {
  try {
    const formData = await c.req.parseBody();
    const file = formData.file; // Ensure this matches the form field name

    if (!file || typeof file === "string") {
      return c.json(
        {
          message: "No valid file uploaded",
        },
        400
      );
    }

    const mimeType = file.type; // Check the mime type
    if (!mimeType.startsWith("image/")) {
      return c.json({ message: "Uploaded file is not an image." }, 400);
    }

    const filePath = path.join(UPLOAD_DIR, file.name);

    // Ensure the upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Write the file asynchronously
    await fs.promises.writeFile(filePath, file.file); // Make

    return c.json({
      message: "File uploaded successfully!",
      filePath: `/uploads/${file.name}`,
    });
  } catch (error) {
    // Log an error message to the console
    console.error("Error during file upload:", error);
    // Return a 500 error response with a generic message
    return c.json(
      {
        message: "An internal error occurred.",
      },
      500
    );
  }
}

export async function uploadImage(c: Context) {
  try {
    const { file } = await c.req.parseBody();

    if (!file || typeof file === "string" || !(file instanceof File)) {
      return c.json({ message: "No image uploaded or invalid type" }, 400);
    }

    const fileArrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileArrayBuffer);
    const base64String = buffer.toString("base64"); // Convert buffer to base64

    const fileType = await fileTypeFromBuffer(buffer);

    console.log({ fileType });

    if (fileType && fileType.ext) {
      const outputFileName = path.join(
        "./uploads",
        `${file.name}.${fileType.ext}`
      );

      const writeStream = createWriteStream(outputFileName);
      writeStream.write(buffer);
      writeStream.end();

      uploadedFiles.push({
        id: uuidv4(),
        name: file.name,
        path: outputFileName,
        type: fileType.mime,
        size: file.size,
        uploadedAt: new Date(),
        base64: base64String, //
      });

      const fileRecord = await prisma.file.create({
        data: {
          filename: file.name,
          type: fileType.mime,
          size: file.size,
          path: outputFileName,
          base64: base64String, //
        },
      });

      const post = await prisma.post.create({
        data: {
          title: "New Post Title", // You may want to specify this based on your logic
          content: "Post content goes here", // Optional content
          // fileId: fileRecord.id, // Link the Post to the File record
        },
      });

      return c.json({
        message: "File uploaded successfully!",
        file: outputFileName,
        fileType: fileType.ext,
      });
    } else {
      return c.json({ message: "Invalid file type" }, 400);
    }
  } catch (error) {
    console.error(error);
    return c.json({ message: "Server error occurred" }, 500);
  }
}

export async function getImage(c: Context) {
  const files = await prisma.file.findMany();
  return c.json(files);
}

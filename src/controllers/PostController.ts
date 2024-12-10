import { Context, Next } from "hono";
import prisma from "../../prisma/client";
import * as fs from "fs";
import * as path from "path";
import { createWriteStream } from "fs";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = "./uploads";

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const uploadedFiles: any = [];

// Limit for file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function getPosts(c: Context) {
  try {
    const posts = await prisma.post.findMany({ orderBy: { id: "desc" } });

    return c.json(
      {
        success: true,
        message: "List Data Posts!",
        data: posts,
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error getting posts: ${e}`);
  }
}

export async function createPost(c: Context) {
  try {
    // using form data
    // const body = await c.req.parseBody();

    // const title = typeof body["title"] === "string" ? body["title"] : "";
    // const content = typeof body["content"] === "string" ? body["content"] : "";

    // using json
    const { title, content } = await c.req.json();

    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
      },
    });

    return c.json(
      {
        success: true,
        message: "Post Created Successfully!",
        data: post,
      },
      201
    );
  } catch (e: unknown) {
    console.error(`Error creating post: ${e}`);
  }
}

export async function getPostById(c: Context) {
  try {
    const postId = parseInt(c.req.param("id"));

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return c.json(
        {
          success: false,
          message: "Post Not Found!",
        },
        404
      );
    }

    return c.json(
      {
        success: true,
        message: `Detail Data Post By ID : ${postId}`,
        data: post,
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error finding post: ${e}`);
  }
}
export async function updatePost(c: Context) {
  try {
    const postId = parseInt(c.req.param("id"));
    // ini menggunakan form data
    // const body = await c.req.parseBody();

    // const title = typeof body["title"] === "string" ? body["title"] : "";
    // const content = typeof body["content"] === "string" ? body["content"] : "";

    // ini menggunakan json
    const { title, content } = await c.req.json();

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title,
        content: content,
        updatedAt: new Date(),
      },
    });

    return c.json(
      {
        success: true,
        message: "Post Updated Successfully!",
        data: post,
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error updating post: ${e}`);
  }
}

export async function deletePost(c: Context) {
  try {
    const postId = parseInt(c.req.param("id"));

    await prisma.post.delete({
      where: { id: postId },
    });

    return c.json(
      {
        success: true,
        message: "Post Deleted Successfully!",
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error deleting post: ${e}`);
  }
}

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

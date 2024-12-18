import { Context } from "hono";
import prisma from "../../prisma/client";

export async function getPosts(c: Context) {
  try {
    const skip = Number(c.req.query("skip")) || 0;
    const limit = Number(c.req.query("limit")) || 10;
    const posts = await prisma.post.findMany({
      orderBy: { id: "desc" },
      where: { isDeleted: false },
      skip: skip,
      take: limit,
    });

    const totalPosts = await prisma.post.count();

    return c.json(
      {
        success: true,
        message: "List Data Posts!",
        data: posts,
        pagination: {
          skip: skip,
          limit: limit,
          total: totalPosts,
          totalPages: Math.ceil(totalPosts / limit),
          currentPage: Math.floor(skip / limit) + 1,
        },
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

    const existingPost = await prisma.post.findMany({
      where: { title: title },
    });

    if (existingPost.length > 0) {
      return c.json(
        {
          success: false,
          message: "Post with this title already exists.",
        },
        400 // 400 Bad Request
      );
    }

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

export async function editPost(c: Context) {
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

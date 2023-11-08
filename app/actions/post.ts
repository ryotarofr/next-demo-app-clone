'use server';

import { authGuard } from '@/app/actions/auth';
import { db } from '@/app/actions/lib';
import { dataURLtoBuffer } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { z } from 'zod';

const PostSchema = z.object({
  body: z.string().max(140),
});

export const createPost = async (formData: FormData) => {
  const authorId = authGuard();
  const id = randomUUID();
  const validatedData = PostSchema.parse({
    body: formData.get('body'),
  });
  const newData: Prisma.PostUncheckedCreateInput = {
    ...validatedData,
    id,
    authorId,
  };

  const thumbnailDataURL = formData.get('thumbnail') as string;

  if (thumbnailDataURL) {
    const file = dataURLtoBuffer(thumbnailDataURL);
    const blob = await put(`posts/${id}/thumbnail.png`, file, {
      access: 'public',
    });
    newData.thumbnailURL = blob.url;
  }

  await db.post.create({
    data: newData,
  });

  revalidatePath('/');
  redirect('/');
};

export const updatePost = async (id: string, formData: FormData) => {
  const authorId = authGuard();
  const validatedData = PostSchema.parse({
    body: formData.get('body'),
  });
  const newData: Prisma.PostUncheckedUpdateInput = {
    body: validatedData.body,
  };

  const thumbnailDataURL = formData.get('thumbnail') as string;

  if (thumbnailDataURL) {
    const file = dataURLtoBuffer(thumbnailDataURL);
    const blob = await put(`posts/${id}/thumbnail.png`, file, {
      access: 'public',
    });
    newData.thumbnailURL = blob.url;
  }

  await db.post.update({
    where: {
      id,
      authorId,
    },
    data: newData,
  });

  revalidatePath('/');
};

export const deletePost = async (id: string) => {
  const uid = authGuard();

  await db.post.delete({
    where: {
      id,
      authorId: uid,
    },
  });

  revalidatePath('/');
  redirect('/');
};

export const getPost = async (id: string) => {
  return db.post.findFirst({
    where: {
      id,
    },
  });
};

export const getOwnPost = async (id: string) => {
  const authorId = authGuard();

  return db.post.findFirst({
    where: {
      id,
      authorId,
    },
  });
};

export const getPosts = cache(async () => {
  return db.post.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: true,
    },
  });
});

export const getPostCount = cache(async () => {
  return db.post.count();
});

export const hasLike = cache(async (id: string) => {
  const uid = authGuard();
  const post = await db.post.findFirst({
    where: {
      id,
      likes: {
        some: {
          id: uid,
        },
      },
    },
  });

  return !!post;
});

export const toggleLike = async (id: string) => {
  const uid = authGuard();
  const hasLike = await db.post.findFirst({
    where: {
      id,
      likes: {
        some: {
          id: uid,
        },
      },
    },
  });

  if (hasLike) {
    await db.post.update({
      where: {
        id,
      },
      data: {
        likes: {
          disconnect: {
            id: uid,
          },
        },
      },
    });
  } else {
    await db.post.update({
      where: {
        id,
      },
      data: {
        likes: {
          connect: {
            id: uid,
          },
        },
      },
    });
  }

  revalidatePath('/');
};

const getUserPosts = cache(async (id: string) => {
  return db.post.findMany({
    where: {
      authorId: id,
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: true,
    },
  });
});

export const getMyPosts = cache(async () => {
  const uid = authGuard();
  const posts = await getUserPosts(uid);

  return posts;
});

export const getMyLikes = cache(async () => {
  const id = authGuard();
  const user = await db.user.findFirst({
    where: {
      id,
    },
    include: {
      likes: {
        include: {
          author: true,
        },
      },
    },
  });

  return user?.likes;
});

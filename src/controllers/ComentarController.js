import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllComentars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;

    const limit = parseInt(req.query.limit) || 9;

    const search = req.query.search_query || "";

    const offset = limit * page;

    const totalRows = await prisma.comentar.count({
      where: {
        OR: [
          {
            comment_content: {
              contains: search,
            },
          },
        ],
      },
    });

    const totalPage = Math.ceil(totalRows / limit);

    const results = await prisma.comentar.findMany({
      where: {
        OR: [
          {
            comment_content: {
              contains: search,
            },
          },
        ],
      },
      include: {
        author: {
          select: {
            fullname: true,
          },
        },
        news: {
          select: {
            news_id: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({
      results,
      page,
      limit,
      totalRows,
      totalPage,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createComentar = async (req, res) => {
  const { comment_content, news_id } = req.body;

  try {
    const user = req.user;

    const newComent = await prisma.comentar.create({
      data: {
        comment_content,
        newsId: news_id,
        authorId: user.userId,
      },
    });
    res.status(201).json({ msg: "Komentar berhasil dibuat", newComent });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TechnologiesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.technology.findMany({
      include: { levels: true },
    });
  }

  findOne(id: string) {
    return this.prisma.technology.findUnique({
      where: { id },
      include: {
        levels: {
          include: {
            topics: { include: { topic: true } },
          },
        },
      },
    });
  }
}

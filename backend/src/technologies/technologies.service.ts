import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { localize } from '../common/utils/i18n';

@Injectable()
export class TechnologiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(locale: string) {
    const technologies = await this.prisma.technology.findMany({
      include: { levels: true },
    });
    return technologies.map((t) => ({
      ...t,
      description: localize(t.description, locale),
    }));
  }

  async findOne(id: string, locale: string) {
    const technology = await this.prisma.technology.findUnique({
      where: { id },
      include: {
        levels: {
          include: {
            topics: { include: { topic: true } },
          },
        },
      },
    });
    if (!technology) return null;

    return {
      ...technology,
      description: localize(technology.description, locale),
      levels: technology.levels.map((level) => ({
        ...level,
        topics: level.topics.map((lt) => ({
          ...lt,
          topic: {
            ...lt.topic,
            name: localize(lt.topic.name, locale),
            description: localize(lt.topic.description, locale),
          },
        })),
      })),
    };
  }
}

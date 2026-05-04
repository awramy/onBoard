import {
  Bell,
  Inbox,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress, ProgressValue } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { EmptyState } from '@/components/common/EmptyState';
import { LeagueBadge } from '@/components/common/LeagueBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { SkeletonList } from '@/components/common/SkeletonList';
import { StatCard } from '@/components/common/StatCard';
import { UserAvatar } from '@/components/common/UserAvatar';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="glass rounded-xl p-4">{children}</div>
    </section>
  );
}

export function UiKitShowcase() {
  return (
    <TooltipProvider>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8">
        <PageHeader
          title="UI Kit"
          description="Витрина дизайн-системы onBoard — салатовый акцент, матовое стекло, без рамок на карточках."
          actions={
            <Button onClick={() => toast.success('Привет, onBoard!')}>
              <Sparkles /> Тост
            </Button>
          }
        />

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <Plus />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ui-email">Email</Label>
              <Input id="ui-email" type="email" placeholder="you@onboard.dev" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ui-search">Поиск</Label>
              <Input id="ui-search" placeholder="Введите запрос…" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ui-bio">Био</Label>
              <Textarea id="ui-bio" placeholder="Несколько слов о себе…" />
            </div>
            <div className="space-y-1.5">
              <Label>Технология</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите технологию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Frontend</SelectLabel>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue</SelectItem>
                    <SelectItem value="svelte">Svelte</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Backend</SelectLabel>
                    <SelectItem value="nest">NestJS</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ui-disabled">Отключено</Label>
              <Input id="ui-disabled" placeholder="readonly" disabled />
            </div>
          </div>
        </Section>

        <Section title="Cards & Stats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Карточка с действием</CardTitle>
                <CardDescription>Стекло + лёгкая тень, без рамок.</CardDescription>
                <CardAction>
                  <Button variant="ghost" size="icon-sm" aria-label="Меню">
                    <Bell />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Контент. Рамок нет — отделение через фон и блюр.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="ghost">
                  Подробнее
                </Button>
              </CardFooter>
            </Card>
            <StatCard
              label="Сессий"
              value={24}
              hint="за последние 30 дней"
              icon={TrendingUp}
            />
            <StatCard
              label="Средний скор"
              value="78"
              hint="по 124 ответам"
              icon={Sparkles}
            />
          </div>
        </Section>

        <Section title="Feedback">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <ScoreBadge score={92} />
              <ScoreBadge score={55} />
              <ScoreBadge score={22} />
              <LeagueBadge league="bronze" />
              <LeagueBadge league="silver" />
              <LeagueBadge league="gold" />
              <LeagueBadge league="platinum" />
              <LeagueBadge league="diamond" />
            </div>

            <Alert>
              <Sparkles />
              <AlertTitle>Совет</AlertTitle>
              <AlertDescription>
                Поверхности используют утилиту <code>.glass</code>; акцент через{' '}
                <code>bg-accent/N</code>.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>Не удалось загрузить данные.</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Прогресс</p>
              <Progress value={62}>
                <span className="text-sm font-medium">Подготовка</span>
                <ProgressValue />
              </Progress>
            </div>
          </div>
        </Section>

        <Section title="Overlays">
          <div className="flex flex-wrap items-center gap-2">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>Dialog</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Подтвердите действие</DialogTitle>
                  <DialogDescription>
                    Стеклянная подложка, без жёсткой рамки.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Этот диалог использует <code>.glass</code> для поверхности.
                </p>
                <DialogFooter>
                  <DialogClose render={<Button variant="ghost" />}>Отмена</DialogClose>
                  <DialogClose render={<Button />}>Ок</DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger render={<Button variant="outline" />}>Sheet</SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Боковая панель</SheetTitle>
                  <SheetDescription>Без боковой рамки.</SheetDescription>
                </SheetHeader>
                <div className="px-4 text-sm text-muted-foreground">
                  Контент панели.
                </div>
                <SheetFooter>
                  <SheetClose render={<Button variant="ghost" />}>Закрыть</SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                Dropdown
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuItem>Сохранить</DropdownMenuItem>
                <DropdownMenuItem>Дублировать</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Удалить</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost">Tooltip</Button>} />
              <TooltipContent>Подсказка</TooltipContent>
            </Tooltip>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 lg:grid-cols-2">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="answers">Ответы</TabsTrigger>
                <TabsTrigger value="settings">Настройки</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">
                Активный таб — салатовое стекло.
              </TabsContent>
              <TabsContent value="answers" className="pt-3 text-sm text-muted-foreground">
                Здесь были бы последние ответы.
              </TabsContent>
              <TabsContent value="settings" className="pt-3 text-sm text-muted-foreground">
                Настройки сессии.
              </TabsContent>
            </Tabs>

            <Accordion>
              <AccordionItem value="a">
                <AccordionTrigger>Что такое onBoard?</AccordionTrigger>
                <AccordionContent>
                  Платформа интерактивных ИИ-собеседований.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Как считается скор?</AccordionTrigger>
                <AccordionContent>
                  По ответам на вопросы — от 0 до 100.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 lg:grid-cols-2">
            <Command className="h-72">
              <CommandInput placeholder="Поиск команды…" />
              <CommandList>
                <CommandEmpty>Ничего не найдено.</CommandEmpty>
                <CommandGroup>
                  <CommandItem>
                    <Search /> Открыть поиск
                  </CommandItem>
                  <CommandItem>
                    <Plus /> Создать сессию
                  </CommandItem>
                  <CommandItem>
                    <Bell /> Уведомления
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
            <ScrollArea className="h-72 rounded-xl">
              <div className="glass rounded-xl p-3 text-sm">
                <p className="text-muted-foreground">Длинный список с ScrollArea:</p>
                <ul className="mt-2 space-y-1.5">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/40"
                    >
                      <span>Item {i + 1}</span>
                      <Badge variant="secondary">{((i + 1) * 7) % 100}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          </div>
        </Section>

        <Section title="Lists & Avatars">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <UserAvatar username="Avramy Nesterov" />
              <UserAvatar username="Maria K" size="lg" />
              <UserAvatar username="onboard-user" size="sm" />
              <UserAvatar
                username="John Doe"
                imageUrl="https://i.pravatar.cc/64?u=onboard-john"
              />
            </div>
            <SkeletonList count={3} lineHeight={20} />
            <Skeleton className="h-24 w-full rounded-xl" />
            <EmptyState
              icon={Inbox}
              title="Пока ничего нет"
              description="Создайте первую сессию, чтобы увидеть прогресс."
              action={<Button>Создать</Button>}
            />
          </div>
        </Section>
      </div>
    </TooltipProvider>
  );
}

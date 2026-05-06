import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  useTechnologiesControllerFindAll,
  useAiControllerGetProviders,
} from '@/api/generated/react-query';
import { startSessionSchema, type StartSessionFormValues } from '../schemas';
import { useStartSession } from '../hooks/useStartSession';

type StartSessionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StartSessionDialog({ open, onOpenChange }: StartSessionDialogProps) {
  const { t } = useTranslation();
  const { start, isPending } = useStartSession();

  const { data: technologiesData } = useTechnologiesControllerFindAll({});
  const { data: providersData } = useAiControllerGetProviders();

  const form = useForm<StartSessionFormValues>({
    resolver: zodResolver(startSessionSchema),
    defaultValues: {
      technologyId: '',
      technologyLevelId: '',
      questionsCount: 10,
      model: 'auto',
    },
  });

  const selectedTechId = form.watch('technologyId');
  const selectedTech = technologiesData?.find((t) => t.id === selectedTechId);
  const questionsCount = form.watch('questionsCount');

  async function onSubmit(values: StartSessionFormValues) {
    await start({
      technologyLevelId: values.technologyLevelId,
      questionsCount: values.questionsCount,
      model: values.model,
    });
    onOpenChange(false);
    form.reset();
  }

  const hasProviders = providersData?.hasProviders ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dashboard.dialog.title')}</DialogTitle>
          <DialogDescription>{t('dashboard.dialog.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="technologyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dashboard.dialog.technology')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue('technologyLevelId', '');
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('dashboard.dialog.technologyPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {technologiesData?.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technologyLevelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dashboard.dialog.level')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedTechId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('dashboard.dialog.levelPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedTech?.levels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionsCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('dashboard.dialog.questionsCount')}: {questionsCount}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={5}
                      max={20}
                      step={1}
                      value={[field.value]}
                      onValueChange={([val]) => field.onChange(val)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dashboard.dialog.model')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!hasProviders}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('dashboard.dialog.modelPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hasProviders && (
                        <SelectItem value="auto">{t('dashboard.dialog.modelAuto')}</SelectItem>
                      )}
                      {providersData?.providers.map((provider) => (
                        <SelectItem key={provider.modelId} value={provider.name}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!hasProviders && (
                    <p className="text-sm text-destructive">{t('dashboard.dialog.noProviders')}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !hasProviders}
            >
              {isPending ? t('dashboard.dialog.submitting') : t('dashboard.dialog.submit')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

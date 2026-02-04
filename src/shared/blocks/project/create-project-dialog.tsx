'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Monitor, Palette, Smartphone, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { createProject, Project } from '@/shared/api/project';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Textarea } from '@/shared/components/ui/textarea';
import { getErrorMessage } from '@/shared/lib/error';
import { cn } from '@/shared/lib/utils';
import styles from '@/shared/styles/index.json';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: Project) => void;
}

interface Style {
  id: number;
  name: string;
  name_cn: string;
  url: string;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || selectedStyleId === null) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newProject = await createProject({
        name: name.trim(),
        description: description.trim(),
        aspectRatio,
        styleId: selectedStyleId,
      });

      toast.success('项目创建成功');
      onProjectCreated?.(newProject);
      onOpenChange(false);

      setName('');
      setDescription('');
      setAspectRatio('16:9');
      setSelectedStyleId(null);

      router.push(`/project/${newProject.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, '创建项目失败'));
      if (process.env.NODE_ENV !== 'production') {
        console.log('create project failed:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = name.trim().length > 0 && selectedStyleId !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 max-h-[90vh] w-full max-w-[980px] gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl">
        {/* 头部 */}
        <DialogHeader className="border-border/50 from-muted/50 relative border-b bg-gradient-to-b to-transparent px-8 pt-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl shadow-inner">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight">
                创建新项目
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                填写项目信息，开始你的漫剧创作
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-8 p-8">
            {/* 基本信息区块 */}
            <div className="space-y-6">
              {/* 项目名称 */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">
                  项目名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="给你的漫剧起个名字"
                  maxLength={50}
                  className="border-border/50 bg-muted/30 focus:bg-background h-11 rounded-xl transition-colors"
                />
              </div>

              {/* 画幅比 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">画幅比例</Label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200',
                      aspectRatio === '16:9'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                        aspectRatio === '16:9' ? 'bg-primary/10' : 'bg-muted'
                      )}
                    >
                      <Monitor
                        className={cn(
                          'h-5 w-5 transition-colors',
                          aspectRatio === '16:9'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">16:9</p>
                      <p className="text-muted-foreground text-xs">横版画面</p>
                    </div>
                    {aspectRatio === '16:9' && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                          <Check className="text-primary-foreground h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200',
                      aspectRatio === '9:16'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                        aspectRatio === '9:16' ? 'bg-primary/10' : 'bg-muted'
                      )}
                    >
                      <Smartphone
                        className={cn(
                          'h-5 w-5 transition-colors',
                          aspectRatio === '9:16'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">9:16</p>
                      <p className="text-muted-foreground text-xs">竖版画面</p>
                    </div>
                    {aspectRatio === '9:16' && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                          <Check className="text-primary-foreground h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 故事描述 */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-medium">
                故事描述
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简要描述你的故事背景、主要角色和核心情节..."
                rows={4}
                className="border-border/50 bg-muted/30 focus:bg-background resize-none rounded-xl transition-colors"
              />
            </div>

            {/* 风格选择 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="text-muted-foreground h-4 w-4" />
                <Label className="text-sm font-medium">
                  选择画风 <span className="text-destructive">*</span>
                </Label>
                <span className="text-muted-foreground text-xs">
                  ({(styles as Style[]).length} 种风格)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {(styles as Style[]).map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    className={cn(
                      'group relative overflow-hidden rounded-xl transition-all duration-300',
                      selectedStyleId === style.id
                        ? 'ring-primary ring-offset-background ring-2 ring-offset-2'
                        : 'hover:ring-border hover:ring-1'
                    )}
                  >
                    <div className="bg-muted relative aspect-square w-full overflow-hidden">
                      <Image
                        src={style.url}
                        alt={style.name}
                        fill
                        className={cn(
                          'object-cover transition-all duration-500',
                          selectedStyleId === style.id
                            ? 'scale-110'
                            : 'group-hover:scale-105'
                        )}
                        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                      />
                      {/* 选中遮罩 */}
                      <div
                        className={cn(
                          'bg-primary/30 absolute inset-0 flex items-center justify-center transition-opacity duration-200',
                          selectedStyleId === style.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      >
                        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full shadow-lg">
                          <Check className="text-primary-foreground h-4 w-4" />
                        </div>
                      </div>
                      {/* 底部渐变 */}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    {/* 风格名称 */}
                    <div className="absolute inset-x-0 bottom-0 p-2">
                      <p className="truncate text-center text-xs font-medium text-white drop-shadow-md">
                        {style.name_cn}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* 底部操作栏 */}
        <div className="border-border/50 bg-muted/30 flex items-center justify-between gap-4 border-t px-8 py-5">
          <p className="text-muted-foreground text-xs">
            <span className="text-destructive">*</span> 为必填项
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl px-6"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="min-w-[120px] rounded-xl px-6"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  创建中...
                </span>
              ) : (
                '创建项目'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';

export default function ImageCropper({
  aspectRatio = 1,
  width,
  name,
}: {
  aspectRatio?: number;
  width: number;
  name: string;
}) {
  const editor = useRef<AvatarEditor>(null);
  const [preview, setPreview] = useState<string>();
  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    noKeyboard: true,
    maxSize: 1024 * 1024 * 2,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    onDropAccepted: (dropped) => {
      setImage(dropped[0]);
      setScale(1.0);
      setOpen(true);
    },
  });
  const [image, setImage] = useState<File>();
  const [scale, setScale] = useState(1.0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cropImage = () => {
    const dataUrl = editor.current?.getImage().toDataURL('image/png');
    setOpen(false);
    setPreview(dataUrl);
    inputRef.current!.value = dataUrl!;
  };

  return (
    <div>
      <input type="hidden" ref={inputRef} name={name} />
      <div
        className={cn(
          'border overflow-hidden cursor-pointer rounded-md grid place-content-center relative',
          isDragAccept ? 'bg-primary scale-150' : 'bg-muted'
        )}
        style={{
          aspectRatio,
        }}
        {...getRootProps()}
      >
        {!preview && <ImagePlus className="w-10 h-10 text-gray-300" />}
        {preview && (
          <Image className="object-cover" fill src={preview} alt="" />
        )}
        <input {...getInputProps()} className="hidden" />
      </div>

      {preview && (
        <Button
          type="button"
          className="mt-4"
          variant="ghost"
          onClick={() => setPreview('')}
        >
          削除
        </Button>
      )}

      <Dialog open={open} onOpenChange={(status) => setOpen(status)}>
        <DialogContent className="max-w-md">
          <div
            className="border relative overflow-hidden rounded-lg"
            style={{
              aspectRatio,
            }}
          >
            {image && (
              <AvatarEditor
                className="absolute max-w-full max-h-full inset-0"
                scale={scale}
                ref={editor}
                width={width}
                height={width / aspectRatio}
                image={image}
              />
            )}
          </div>

          <div className="my-4">
            <Slider
              max={2}
              step={0.01}
              min={1}
              defaultValue={[1]}
              onValueChange={([value]) => setScale(value)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">閉じる</Button>
            </DialogClose>
            <Button onClick={cropImage}>切り取る</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

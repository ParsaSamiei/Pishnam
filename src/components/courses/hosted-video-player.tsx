import { AppVideoPlayer } from "@/components/media/app-video-player";

interface HostedVideoPlayerProps {
  src: string;
  poster?: string | null;
  title: string;
}

export function HostedVideoPlayer({ src, poster, title }: HostedVideoPlayerProps) {
  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <AppVideoPlayer
        src={src}
        poster={poster}
        title={title}
        className="aspect-video w-full"
        videoClassName="aspect-video w-full"
      />
    </div>
  );
}

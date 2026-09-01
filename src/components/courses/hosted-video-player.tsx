interface HostedVideoPlayerProps {
  src: string;
  poster?: string | null;
  title: string;
}

export function HostedVideoPlayer({ src, poster, title }: HostedVideoPlayerProps) {
  return (
    <div className="border-border bg-pishnam-navy-900 overflow-hidden rounded-xl border">
      {/* Hosted course videos do not ship with caption tracks yet. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        className="aspect-video w-full"
        aria-label={title}
      />
    </div>
  );
}

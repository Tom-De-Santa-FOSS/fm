import { Video, VideoPlayer, VideoSkin } from "@videojs/react/video";

import "@videojs/react/video/skin.css";

export const PromotionVideo = () => (
  <section className="promotion" aria-label="Fresh Market promotional video">
    <VideoPlayer>
      <VideoSkin className="promotion-player">
        <Video
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </VideoSkin>
    </VideoPlayer>
    <p>Always Fresh &amp; Clean</p>
  </section>
);

import {
  Container,
  FullscreenButton,
  MuteButton,
  PlayButton,
} from "@videojs/react";
import { Video, VideoPlayer } from "@videojs/react/video";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

export const PromotionVideo = () => (
  <section className="promotion" aria-label="Fresh Market promotional video">
    <VideoPlayer>
      <Container className="promotion-player">
        <Video
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="promotion-controls">
          <PlayButton
            render={(props, state) => (
              <button {...props} type="button">
                {state.paused ? (
                  <Play size={20} fill="currentColor" />
                ) : (
                  <Pause size={20} fill="currentColor" />
                )}
              </button>
            )}
          />
          <MuteButton
            render={(props, state) => (
              <button {...props} type="button">
                {state.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}
          />
          <FullscreenButton
            render={(props, state) => (
              <button {...props} type="button">
                {state.fullscreen ? (
                  <Minimize size={20} />
                ) : (
                  <Maximize size={20} />
                )}
              </button>
            )}
          />
        </div>
      </Container>
    </VideoPlayer>
    <p>Always Fresh &amp; Clean</p>
  </section>
);

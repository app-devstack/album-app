'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  caption?: string;
  /** アクセントカラーのTailwindクラス (例: "bg-rose-500") */
  accentBg?: string;
}

// 秒数を mm:ss 形式に変換
function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({
  src,
  caption,
  accentBg = 'bg-rose-500',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLInputElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState(0);

  // コントロールの自動非表示
  const scheduleHide = useCallback(() => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (playing) scheduleHide();
    else {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      setShowControls(true);
    }
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [playing, scheduleHide]);

  // フルスクリーン変更を検知
  useEffect(() => {
    const onFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'm') toggleMute();
      if (e.key === 'f') toggleFullscreen();
      if (e.key === 'ArrowRight') {
        v.currentTime = Math.min(v.duration, v.currentTime + 5);
      }
      if (e.key === 'ArrowLeft') {
        v.currentTime = Math.max(0, v.currentTime - 5);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleRestart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
    v.muted = val === 0;
  };

  const handleRateChange = (rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
    setShowRateMenu(false);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    // バッファー計算
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    setShowControls(true);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden select-none"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      onClick={(e) => {
        // コントロール以外のエリアをクリックで再生/停止
        if ((e.target as HTMLElement).closest('[data-controls]')) return;
        togglePlay();
      }}
    >
      {/* 動画本体 */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        playsInline
        aria-label="動画プレイヤー"
      />

      {/* 大きな再生ボタン（停止中のみ表示） */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-16 w-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Play
              size={28}
              className="text-white translate-x-0.5"
              fill="white"
            />
          </div>
        </div>
      )}

      {/* コントロールバー */}
      <div
        data-controls
        className={cn(
          'absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-10 px-3 pb-3 flex flex-col gap-2 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* シークバー */}
        <div className="relative flex items-center h-5 group/seek">
          {/* バッファーバー */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-white/20 overflow-hidden pointer-events-none">
            <div
              className="h-full bg-white/35 transition-all duration-300"
              style={{ width: `${buffered}%` }}
            />
          </div>
          {/* 進捗バー */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-1 rounded-full pointer-events-none',
              accentBg
            )}
            style={{ width: `${progress}%`, left: 0 }}
          />
          {/* スライダー入力 */}
          <input
            ref={seekRef}
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="シークバー"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
            className="w-full h-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 group-hover/seek:[&::-webkit-slider-thumb]:opacity-100 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
          />
        </div>

        {/* ボタン列 */}
        <div className="flex items-center justify-between gap-2">
          {/* 左: 再生・巻き戻し・音量 */}
          <div className="flex items-center gap-2">
            {/* 再生/停止 */}
            <button
              onClick={togglePlay}
              aria-label={playing ? '一時停止' : '再生'}
              className="h-7 w-7 flex items-center justify-center text-white hover:text-white/80 transition-colors"
            >
              {playing ? (
                <Pause size={16} fill="white" />
              ) : (
                <Play size={16} fill="white" className="translate-x-px" />
              )}
            </button>

            {/* 最初から再生 */}
            <button
              onClick={handleRestart}
              aria-label="最初から再生"
              className="h-7 w-7 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <RotateCcw size={13} />
            </button>

            {/* 音量 */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                aria-label={muted ? 'ミュート解除' : 'ミュート'}
                className="h-7 w-7 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                {muted || volume === 0 ? (
                  <VolumeX size={14} />
                ) : (
                  <Volume2 size={14} />
                )}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-16 transition-all duration-200">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="音量"
                  className="w-16 h-1 appearance-none bg-white/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                />
              </div>
            </div>

            {/* 経過時間 */}
            <span className="text-[11px] text-white/75 tabular-nums leading-none ml-1">
              {formatTime(currentTime)}
              <span className="text-white/40 mx-0.5">/</span>
              {formatTime(duration)}
            </span>
          </div>

          {/* 右: 速度・フルスクリーン */}
          <div className="flex items-center gap-1.5">
            {/* 再生速度 */}
            <div className="relative">
              <button
                onClick={() => setShowRateMenu((v) => !v)}
                aria-label="再生速度"
                aria-expanded={showRateMenu}
                className="flex items-center gap-0.5 text-[11px] text-white/70 hover:text-white transition-colors h-7 px-1.5"
              >
                {playbackRate === 1 ? '等速' : `${playbackRate}x`}
                <ChevronDown
                  size={10}
                  className={cn(
                    'transition-transform',
                    showRateMenu && 'rotate-180'
                  )}
                />
              </button>
              {showRateMenu && (
                <div className="absolute bottom-full right-0 mb-1 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 min-w-[72px]">
                  {PLAYBACK_RATES.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRateChange(r)}
                      className={cn(
                        'w-full text-right px-3 py-1.5 text-[11px] hover:bg-white/10 transition-colors',
                        playbackRate === r
                          ? 'text-white font-medium'
                          : 'text-white/60'
                      )}
                    >
                      {r === 1 ? '等速' : `${r}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* フルスクリーン */}
            <button
              onClick={toggleFullscreen}
              aria-label={fullscreen ? '通常画面に戻る' : '全画面表示'}
              className="h-7 w-7 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              {fullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

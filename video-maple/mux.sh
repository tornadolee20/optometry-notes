#!/usr/bin/env bash
# 合成最終 MP4：bash mux.sh <影格資料夾> <配樂.wav> <輸出.mp4>
# 配樂先降 3.5 dB（約 -16 LUFS，溫柔背景樂的適中音量），再編成 AAC 192k
set -euo pipefail
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i "$1/f%04d.jpg" -i "$2" \
  -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 30 \
  -af "volume=-3.5dB" -c:a aac -b:a 192k -ar 48000 \
  -t 15 -movflags +faststart "$3"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration -of compact "$3"

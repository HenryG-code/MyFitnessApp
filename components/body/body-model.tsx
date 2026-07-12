import type { MuscleGroupId } from "@/src/lib/performance/muscles";

export type BodyView = "front" | "rear";

export const BODY_VIEWBOX = "0 0 460 500";

export type MuscleShape = {
  id: MuscleGroupId;
  el: "ellipse" | "path" | "circle";
  attrs: Record<string, string | number>;
};

/** Interactive muscle plates aligned to the sculpted T-pose anatomy. */
export const frontShapes: MuscleShape[] = [
  { id: "shoulders", el: "circle", attrs: { cx: 182, cy: 114, r: 19 } },
  { id: "shoulders", el: "circle", attrs: { cx: 278, cy: 114, r: 19 } },
  { id: "chest", el: "path", attrs: { d: "M192 116 C208 109 225 111 228 120 L228 150 C214 161 194 156 187 141 C184 130 186 121 192 116 Z" } },
  { id: "chest", el: "path", attrs: { d: "M268 116 C252 109 235 111 232 120 L232 150 C246 161 266 156 273 141 C276 130 274 121 268 116 Z" } },
  { id: "biceps", el: "ellipse", attrs: { cx: 147, cy: 116, rx: 31, ry: 13 } },
  { id: "biceps", el: "ellipse", attrs: { cx: 313, cy: 116, rx: 31, ry: 13 } },
  { id: "forearms", el: "ellipse", attrs: { cx: 74, cy: 118, rx: 34, ry: 10 } },
  { id: "forearms", el: "ellipse", attrs: { cx: 386, cy: 118, rx: 34, ry: 10 } },
  { id: "core", el: "path", attrs: { d: "M206 162 C216 156 244 156 254 162 C258 186 258 214 252 234 C244 244 216 244 208 234 C202 214 202 186 206 162 Z" } },
  { id: "quads", el: "ellipse", attrs: { cx: 210, cy: 322, rx: 16, ry: 46 } },
  { id: "quads", el: "ellipse", attrs: { cx: 250, cy: 322, rx: 16, ry: 46 } },
  { id: "calves", el: "ellipse", attrs: { cx: 209, cy: 405, rx: 11, ry: 30 } },
  { id: "calves", el: "ellipse", attrs: { cx: 251, cy: 405, rx: 11, ry: 30 } },
];

export const rearShapes: MuscleShape[] = [
  { id: "traps", el: "path", attrs: { d: "M230 70 C240 86 252 96 266 102 C252 116 240 130 234 146 L226 146 C220 130 208 116 194 102 C208 96 220 86 230 70 Z" } },
  { id: "shoulders", el: "circle", attrs: { cx: 182, cy: 114, r: 19 } },
  { id: "shoulders", el: "circle", attrs: { cx: 278, cy: 114, r: 19 } },
  { id: "back", el: "path", attrs: { d: "M191 120 C205 142 220 152 230 154 C240 152 255 142 269 120 C274 146 269 180 258 198 C244 210 216 210 202 198 C191 180 186 146 191 120 Z" } },
  { id: "triceps", el: "ellipse", attrs: { cx: 147, cy: 116, rx: 31, ry: 13 } },
  { id: "triceps", el: "ellipse", attrs: { cx: 313, cy: 116, rx: 31, ry: 13 } },
  { id: "forearms", el: "ellipse", attrs: { cx: 74, cy: 118, rx: 34, ry: 10 } },
  { id: "forearms", el: "ellipse", attrs: { cx: 386, cy: 118, rx: 34, ry: 10 } },
  { id: "glutes", el: "ellipse", attrs: { cx: 212, cy: 272, rx: 18, ry: 20 } },
  { id: "glutes", el: "ellipse", attrs: { cx: 248, cy: 272, rx: 18, ry: 20 } },
  { id: "hamstrings", el: "ellipse", attrs: { cx: 210, cy: 330, rx: 15, ry: 42 } },
  { id: "hamstrings", el: "ellipse", attrs: { cx: 250, cy: 330, rx: 15, ry: 42 } },
  { id: "calves", el: "ellipse", attrs: { cx: 209, cy: 400, rx: 12, ry: 29 } },
  { id: "calves", el: "ellipse", attrs: { cx: 251, cy: 400, rx: 12, ry: 29 } },
];

/**
 * Shared body outline for both views, built from overlapping shapes — the
 * lighting filter reads the union of their alpha, so seams disappear.
 */
function Silhouette() {
  return (
    <>
      <ellipse cx="230" cy="52" rx="21" ry="25" />
      <path d="M215 64 L245 64 L250 104 L210 104 Z" />
      <path d="M212 76 C202 90 186 98 170 106 C162 116 160 128 164 138 C178 160 190 186 196 212 C199 230 202 244 204 254 C197 264 193 276 196 290 C202 300 212 305 222 302 L226 292 L234 292 L238 302 C248 305 258 300 264 290 C267 276 263 264 256 254 C258 244 261 230 264 212 C270 186 282 160 296 138 C300 128 298 116 290 108 C274 98 258 90 248 76 C240 82 220 82 212 76 Z" />
      <circle cx="182" cy="114" r="21" />
      <circle cx="278" cy="114" r="21" />
      <path d="M192 97 C160 96 128 102 104 107 C102 115 102 122 104 130 C130 134 162 137 194 135 Z" />
      <path d="M108 107 C82 108 56 110 40 112 C38 116 38 121 40 126 C58 128 84 129 108 130 Z" />
      <path d="M42 111 C28 111 15 113 8 116 C5 118 5 120 8 122 C16 124 30 125 42 125 Z" />
      <path d="M268 97 C300 96 332 102 356 107 C358 115 358 122 356 130 C330 134 298 137 266 135 Z" />
      <path d="M352 107 C378 108 404 110 420 112 C422 116 422 121 420 126 C402 128 376 129 352 130 Z" />
      <path d="M418 111 C432 111 445 113 452 116 C455 118 455 120 452 122 C444 124 430 125 418 125 Z" />
      <path d="M197 266 C188 300 189 342 196 374 C193 398 194 422 199 446 C200 454 201 460 202 464 L221 464 C225 450 226 430 224 410 C229 380 231 346 229 318 C231 298 229 282 226 268 Z" />
      <path d="M197 378 C193 400 194 421 199 435 C207 439 216 438 221 431 C225 413 225 395 221 379 C213 371 203 371 197 378 Z" />
      <path d="M199 458 C191 464 184 471 186 477 C195 482 214 482 221 477 L222 458 Z" />
      <path d="M263 266 C272 300 271 342 264 374 C267 398 266 422 261 446 C260 454 259 460 258 464 L239 464 C235 450 234 430 236 410 C231 380 229 346 231 318 C229 298 231 282 234 268 Z" />
      <path d="M263 378 C267 400 266 421 261 435 C253 439 244 438 239 431 C235 413 235 395 239 379 C247 371 257 371 263 378 Z" />
      <path d="M261 458 C269 464 276 471 274 477 C265 482 246 482 239 477 L238 458 Z" />
    </>
  );
}

function FrontBumps() {
  return (
    <>
      <ellipse cx="230" cy="44" rx="12" ry="5" />
      <ellipse cx="211" cy="55" rx="3" ry="6" />
      <ellipse cx="249" cy="55" rx="3" ry="6" />
      <path d="M192 116 C208 109 225 111 228 120 L228 150 C214 161 194 156 187 141 C184 130 186 121 192 116 Z" />
      <path d="M268 116 C252 109 235 111 232 120 L232 150 C246 161 266 156 273 141 C276 130 274 121 268 116 Z" />
      <circle cx="181" cy="112" r="15" />
      <circle cx="279" cy="112" r="15" />
      <path d="M184 108 C160 104 138 106 122 112 C120 116 120 120 122 124 C140 130 162 130 184 126 Z" />
      <path d="M276 108 C300 104 322 106 338 112 C340 116 340 120 338 124 C320 130 298 130 276 126 Z" />
      <ellipse cx="76" cy="117" rx="27" ry="5.5" />
      <ellipse cx="384" cy="117" rx="27" ry="5.5" />
      <ellipse cx="222" cy="176" rx="7.5" ry="6.5" />
      <ellipse cx="238" cy="176" rx="7.5" ry="6.5" />
      <ellipse cx="222" cy="191" rx="7.5" ry="6.5" />
      <ellipse cx="238" cy="191" rx="7.5" ry="6.5" />
      <ellipse cx="222" cy="207" rx="7" ry="7.5" />
      <ellipse cx="238" cy="207" rx="7" ry="7.5" />
      <ellipse cx="203" cy="196" rx="6" ry="24" />
      <ellipse cx="257" cy="196" rx="6" ry="24" />
      <ellipse cx="200" cy="160" rx="7" ry="12" />
      <ellipse cx="260" cy="160" rx="7" ry="12" />
      <path d="M198 284 C192 312 193 348 199 368 C206 374 216 372 221 362 C224 336 224 308 220 288 C213 278 203 277 198 284 Z" />
      <path d="M262 284 C268 312 267 348 261 368 C254 374 244 372 239 362 C236 336 236 308 240 288 C247 278 257 277 262 284 Z" />
      <ellipse cx="224" cy="336" rx="6" ry="22" />
      <ellipse cx="236" cy="336" rx="6" ry="22" />
      <ellipse cx="210" cy="380" rx="7" ry="9" />
      <ellipse cx="250" cy="380" rx="7" ry="9" />
      <ellipse cx="204" cy="406" rx="7" ry="23" />
      <ellipse cx="256" cy="406" rx="7" ry="23" />
    </>
  );
}

function RearBumps() {
  return (
    <>
      <ellipse cx="230" cy="42" rx="15" ry="13" />
      <path d="M230 72 C238 86 250 96 264 102 C250 114 240 128 234 144 L226 144 C220 128 210 114 196 102 C210 96 222 86 230 72 Z" />
      <circle cx="183" cy="112" r="16" />
      <circle cx="277" cy="112" r="16" />
      <path d="M190 122 C202 138 214 148 226 152 L222 208 C208 202 196 188 190 170 C186 154 186 136 190 122 Z" />
      <path d="M270 122 C258 138 246 148 234 152 L238 208 C252 202 264 188 270 170 C274 154 274 136 270 122 Z" />
      <ellipse cx="223" cy="216" rx="6.5" ry="30" />
      <ellipse cx="237" cy="216" rx="6.5" ry="30" />
      <path d="M186 108 C160 103 134 105 118 112 C116 117 116 121 118 125 C136 132 162 132 186 127 Z" />
      <path d="M274 108 C300 103 326 105 342 112 C344 117 344 121 342 125 C324 132 298 132 274 127 Z" />
      <ellipse cx="76" cy="117" rx="28" ry="6.5" />
      <ellipse cx="384" cy="117" rx="28" ry="6.5" />
      <ellipse cx="212" cy="272" rx="17" ry="19" />
      <ellipse cx="248" cy="272" rx="17" ry="19" />
      <path d="M198 296 C193 322 194 352 200 370 C207 376 216 374 221 364 C224 340 224 314 220 298 C213 289 203 289 198 296 Z" />
      <path d="M262 296 C267 322 266 352 260 370 C253 376 244 374 239 364 C236 340 236 314 240 298 C247 289 257 289 262 296 Z" />
      <ellipse cx="204" cy="398" rx="8" ry="25" />
      <ellipse cx="215" cy="400" rx="7" ry="21" />
      <ellipse cx="256" cy="398" rx="8" ry="25" />
      <ellipse cx="245" cy="400" rx="7" ry="21" />
    </>
  );
}

function FrontLines() {
  return (
    <>
      <path d="M230 120 L230 160" />
      <path d="M192 118 C210 128 250 128 268 118" />
      <path d="M230 162 L230 228" />
      <path d="M213 185 L247 185 M213 203 L247 203" />
      <path d="M195 288 C210 300 250 300 265 288" />
      <path d="M230 264 L230 298" />
      <path d="M176 100 C196 94 264 94 284 100" />
      <path d="M204 254 C196 270 194 282 195 288 M256 254 C264 270 266 282 265 288" />
    </>
  );
}

function RearLines() {
  return (
    <>
      <path d="M230 80 L230 246" />
      <path d="M198 104 C214 124 246 124 262 104" />
      <path d="M195 252 C212 246 248 246 265 252" />
      <path d="M195 290 C212 298 248 298 265 290" />
      <path d="M210 362 L214 370 M250 362 L246 370" />
    </>
  );
}

/**
 * Sculpted "clay render" T-pose figure. Two lighting passes fake the 3D look:
 * a blurred-alpha diffuse+specular pass rounds the whole silhouette, and a
 * tighter pass raises the muscle forms, blended back with soft-light.
 */
export function BodySculpture({ view }: { view: BodyView }) {
  const sfx = view;
  const Bumps = view === "front" ? FrontBumps : RearBumps;
  const Lines = view === "front" ? FrontLines : RearLines;

  return (
    <>
      <defs>
        <filter id={`sculpt-body-${sfx}`} x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5.5" result="blur" />
          <feDiffuseLighting in="blur" surfaceScale="8" diffuseConstant="1.02" lightingColor="#b6bac3" result="diff">
            <feDistantLight azimuth="245" elevation="52" />
          </feDiffuseLighting>
          <feSpecularLighting in="blur" surfaceScale="8" specularConstant="0.7" specularExponent="15" lightingColor="#ffffff" result="spec">
            <feDistantLight azimuth="245" elevation="55" />
          </feSpecularLighting>
          <feComposite in="diff" in2="spec" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id={`sculpt-muscle-${sfx}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4.8" result="blur" />
          <feDiffuseLighting in="blur" surfaceScale="4.5" diffuseConstant="0.92" lightingColor="#c0c4cc" result="diff">
            <feDistantLight azimuth="245" elevation="50" />
          </feDiffuseLighting>
          <feSpecularLighting in="blur" surfaceScale="4.5" specularConstant="0.6" specularExponent="12" lightingColor="#ffffff" result="spec">
            <feDistantLight azimuth="245" elevation="55" />
          </feSpecularLighting>
          <feComposite in="diff" in2="spec" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id={`occl-${sfx}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <filter id={`muscle-glow-${sfx}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="currentColor" floodOpacity="0.42" />
        </filter>
        <radialGradient id={`studio-${sfx}`} cx="50%" cy="22%" r="85%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.2" />
        </radialGradient>
        <clipPath id={`body-clip-${sfx}`}>
          <Silhouette />
        </clipPath>
      </defs>

      <ellipse cx="230" cy="482" rx="82" ry="9" fill="#000" opacity="0.5" />
      <g filter={`url(#sculpt-body-${sfx})`} fill="#fff">
        <Silhouette />
      </g>
      <g clipPath={`url(#body-clip-${sfx})`}>
        <g
          filter={`url(#sculpt-muscle-${sfx})`}
          fill="#fff"
          opacity="0.85"
          style={{ mixBlendMode: "soft-light" }}
        >
          <Bumps />
        </g>
        <g filter={`url(#sculpt-muscle-${sfx})`} fill="#fff" opacity="0.15">
          <Bumps />
        </g>
        <g
          fill="none"
          stroke="#0b0c0f"
          strokeOpacity="0.35"
          strokeWidth="1.7"
          filter={`url(#occl-${sfx})`}
        >
          <Lines />
        </g>
        <rect x="0" y="0" width="460" height="500" fill={`url(#studio-${sfx})`} />
      </g>
    </>
  );
}

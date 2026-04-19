'use client';

export function AnimatedGenie() {
  return (
    <div className="genie-container">
      <svg viewBox="0 0 400 500" className="genie-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Green gradient for the genie body */}
          <linearGradient id="genieBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          {/* Dark green for deeper parts */}
          <linearGradient id="genieDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          {/* Gold gradient for the lamp */}
          <linearGradient id="lampGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Soft shadow */}
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Magical particles */}
        <g className="genie-particles">
          <circle cx="80" cy="140" r="3" fill="#10b981" opacity="0.7">
            <animate attributeName="cy" values="140;100;140" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="320" cy="120" r="2.5" fill="#f59e0b" opacity="0.6">
            <animate attributeName="cy" values="120;80;120" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="80" r="2" fill="#34d399" opacity="0.5">
            <animate attributeName="cy" values="80;50;80" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="280" cy="190" r="3.5" fill="#10b981" opacity="0.4">
            <animate attributeName="cy" values="190;150;190" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="350" cy="250" r="2" fill="#6ee7b7" opacity="0.5">
            <animate attributeName="cy" values="250;210;250" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="280" r="2.5" fill="#f59e0b" opacity="0.4">
            <animate attributeName="cy" values="280;240;280" dur="3.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Smoke wisps from lamp */}
        <g className="genie-smoke" opacity="0.15">
          <path d="M200 380 Q180 340 200 300 Q220 260 190 220" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round">
            <animate attributeName="d" values="M200 380 Q180 340 200 300 Q220 260 190 220;M200 380 Q220 340 200 300 Q180 260 210 220;M200 380 Q180 340 200 300 Q220 260 190 220" dur="4s" repeatCount="indefinite" />
          </path>
          <path d="M185 380 Q165 330 195 290 Q225 250 175 200" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round">
            <animate attributeName="d" values="M185 380 Q165 330 195 290 Q225 250 175 200;M185 380 Q205 330 185 290 Q165 250 205 200;M185 380 Q165 330 195 290 Q225 250 175 200" dur="5s" repeatCount="indefinite" />
          </path>
          <path d="M215 380 Q235 330 205 280 Q175 240 225 190" fill="none" stroke="#6ee7b7" strokeWidth="5" strokeLinecap="round">
            <animate attributeName="d" values="M215 380 Q235 330 205 280 Q175 240 225 190;M215 380 Q195 330 215 280 Q245 240 195 190;M215 380 Q235 330 205 280 Q175 240 225 190" dur="4.5s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Magic Lamp */}
        <g className="genie-lamp">
          {/* Lamp base */}
          <ellipse cx="200" cy="462" rx="60" ry="10" fill="#064e3b" opacity="0.3" />
          {/* Lamp body */}
          <path d="M150 430 Q145 410 165 400 L235 400 Q255 410 250 430 Z" fill="url(#lampGold)" filter="url(#shadow)" />
          {/* Lamp spout */}
          <path d="M240 420 Q260 415 275 405 Q280 400 275 395 L255 402" fill="url(#lampGold)" />
          {/* Lamp lid */}
          <ellipse cx="200" cy="400" rx="38" ry="8" fill="#eab308" />
          {/* Lamp handle */}
          <path d="M155 415 Q130 410 125 395 Q120 380 135 375" fill="none" stroke="url(#lampGold)" strokeWidth="5" strokeLinecap="round" />
          {/* Lamp gem */}
          <circle cx="200" cy="415" r="5" fill="#dc2626">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Lamp glow */}
          <ellipse cx="200" cy="398" rx="20" ry="4" fill="#fbbf24" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Genie Body — floating above lamp */}
        <g className="genie-body" filter="url(#shadow)">
          {/* Wispy tail connecting to lamp */}
          <path d="M200 395 Q195 370 200 350 Q210 320 195 300 Q185 280 200 260" fill="none" stroke="url(#genieBody)" strokeWidth="30" strokeLinecap="round" opacity="0.6">
            <animate attributeName="d" values="M200 395 Q195 370 200 350 Q210 320 195 300 Q185 280 200 260;M200 395 Q205 370 200 350 Q190 320 205 300 Q215 280 200 260;M200 395 Q195 370 200 350 Q210 320 195 300 Q185 280 200 260" dur="3s" repeatCount="indefinite" />
          </path>

          {/* Torso */}
          <path d="M160 250 Q155 210 170 190 L230 190 Q245 210 240 250 Z" fill="url(#genieBody)" rx="10" />
          {/* Hoodie details */}
          <path d="M180 195 L200 215 L220 195" fill="none" stroke="#065f46" strokeWidth="2" opacity="0.5" />
          <path d="M192 205 L192 235 Q195 250 208 250 L208 235 L208 205" fill="#065f46" opacity="0.15" />
        </g>

        {/* Head */}
        <g className="genie-head">
          {/* Neck */}
          <rect x="188" y="175" width="24" height="20" rx="8" fill="url(#genieBody)" />
          {/* Head shape */}
          <ellipse cx="200" cy="155" rx="40" ry="38" fill="url(#genieBody)" />
          {/* Hair */}
          <path d="M165 145 Q160 120 175 110 Q190 100 200 105 Q210 100 225 110 Q240 120 235 145" fill="#065f46" />
          {/* Beard */}
          <path d="M178 170 Q185 195 200 198 Q215 195 222 170" fill="#065f46" opacity="0.7" />

          {/* Eyes */}
          <g className="genie-eyes">
            {/* Glasses frame */}
            <rect x="175" y="145" width="22" height="18" rx="4" fill="none" stroke="#1f2937" strokeWidth="2.5" />
            <rect x="203" y="145" width="22" height="18" rx="4" fill="none" stroke="#1f2937" strokeWidth="2.5" />
            <line x1="197" y1="154" x2="203" y2="154" stroke="#1f2937" strokeWidth="2" />
            <line x1="175" y1="154" x2="168" y2="152" stroke="#1f2937" strokeWidth="2" />
            <line x1="225" y1="154" x2="232" y2="152" stroke="#1f2937" strokeWidth="2" />
            {/* Eye whites */}
            <ellipse cx="186" cy="154" rx="7" ry="6" fill="white" />
            <ellipse cx="214" cy="154" rx="7" ry="6" fill="white" />
            {/* Pupils */}
            <circle cx="188" cy="154" r="3.5" fill="#1f2937">
              <animate attributeName="cx" values="188;186;188;190;188" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="216" cy="154" r="3.5" fill="#1f2937">
              <animate attributeName="cx" values="216;214;216;218;216" dur="4s" repeatCount="indefinite" />
            </circle>
            {/* Eye shine */}
            <circle cx="189" cy="152" r="1.5" fill="white" opacity="0.8" />
            <circle cx="217" cy="152" r="1.5" fill="white" opacity="0.8" />
          </g>

          {/* Friendly smile */}
          <path d="M188 172 Q200 180 212 172" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round" />

          {/* Graduation cap */}
          <g className="genie-cap">
            <polygon points="200,95 160,115 200,125 240,115" fill="#1f2937" />
            <rect x="180" y="110" width="40" height="6" rx="2" fill="#374151" />
            <line x1="230" y1="115" x2="245" y2="130" stroke="#1f2937" strokeWidth="2" />
            <circle cx="245" cy="132" r="4" fill="#f59e0b">
              <animate attributeName="cy" values="132;136;132" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>

        {/* Left arm — holding a book */}
        <g className="genie-arm-left">
          <path d="M160 210 Q130 220 115 250" fill="none" stroke="url(#genieBody)" strokeWidth="14" strokeLinecap="round" />
          {/* Hand */}
          <circle cx="115" cy="252" r="10" fill="#10b981" />
          {/* Book */}
          <g transform="translate(90, 248) rotate(-15)">
            <rect x="0" y="0" width="30" height="22" rx="2" fill="#1e40af" />
            <rect x="1" y="0" width="14" height="22" rx="1" fill="#2563eb" />
            <line x1="15" y1="2" x2="15" y2="20" stroke="#1e3a8a" strokeWidth="1.5" />
            <line x1="4" y1="6" x2="12" y2="6" stroke="#93c5fd" strokeWidth="1" opacity="0.6" />
            <line x1="4" y1="10" x2="10" y2="10" stroke="#93c5fd" strokeWidth="1" opacity="0.6" />
            <line x1="4" y1="14" x2="11" y2="14" stroke="#93c5fd" strokeWidth="1" opacity="0.6" />
            <animateTransform attributeName="transform" type="rotate" values="-15;-10;-15" dur="3s" repeatCount="indefinite" additive="sum" />
          </g>
        </g>

        {/* Right arm — waving/pointing up */}
        <g className="genie-arm-right">
          <path d="M240 210 Q270 200 285 175" fill="none" stroke="url(#genieBody)" strokeWidth="14" strokeLinecap="round">
            <animate attributeName="d" values="M240 210 Q270 200 285 175;M240 210 Q275 195 290 170;M240 210 Q270 200 285 175" dur="2s" repeatCount="indefinite" />
          </path>
          {/* Hand pointing */}
          <circle cx="285" cy="173" r="10" fill="#10b981">
            <animate attributeName="cy" values="173;168;173" dur="2s" repeatCount="indefinite" />
            <animate attributeName="cx" values="285;290;285" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Sparkle at fingertip */}
          <g>
            <line x1="295" y1="160" x2="305" y2="150" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </line>
            <line x1="300" y1="170" x2="315" y2="168" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </line>
            <line x1="292" y1="175" x2="302" y2="185" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
            </line>
            <circle cx="305" cy="155" r="3" fill="#fbbf24" opacity="0.6">
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>

        {/* Floating formula (math symbols) */}
        <g className="genie-formulas" opacity="0.4">
          <text x="310" y="130" fill="#10b981" fontSize="16" fontWeight="700" fontFamily="monospace">
            E=mc²
            <animate attributeName="y" values="130;120;130" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
          </text>
          <text x="70" y="200" fill="#34d399" fontSize="14" fontWeight="700" fontFamily="monospace">
            Σ∫π
            <animate attributeName="y" values="200;190;200" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.5s" repeatCount="indefinite" />
          </text>
          <text x="300" y="280" fill="#6ee7b7" fontSize="12" fontWeight="700" fontFamily="monospace">
            A+
            <animate attributeName="y" values="280;270;280" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
          </text>
        </g>
      </svg>
    </div>
  );
}

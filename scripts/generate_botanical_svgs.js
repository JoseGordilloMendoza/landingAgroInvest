const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'assets', 'images');

// Palette:
// Aged champagne gold: #C5A059
// Soft champagne highlight: #E2D2A4
// Deep antique bronze: #8A6D3B
// Midnight blue under-shadow: #142C4E
// Ivory accent: #F5EFE6

const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <!-- Classical Botanical Sapling & Spreading Roots (Taille-douce Engraving) -->
  <!-- Spreading Roots Network -->
  <g class="engraving-roots" stroke="#C5A059" opacity="0.8">
    <path d="M140 225 Q135 245 105 260 Q90 268 65 272" stroke-width="1.6"/>
    <path d="M140 225 Q145 248 175 262 Q195 270 220 274" stroke-width="1.6"/>
    <path d="M140 230 Q138 252 135 275" stroke-width="1.4"/>
    <path d="M105 260 Q85 265 60 268 M175 262 Q200 266 225 266" stroke-width="1.0" opacity="0.7"/>
    <path d="M125 240 Q105 252 85 258 M155 240 Q175 252 195 258" stroke-width="1.0" opacity="0.7"/>
    <path d="M135 255 Q120 268 105 274 M145 255 Q160 268 175 274" stroke-width="0.8" opacity="0.5"/>
    <!-- Root Hair Hatching -->
    <path d="M95 258 L90 266 M115 252 L112 262 M165 252 L168 262 M185 258 L190 266" stroke-width="0.7" stroke="#E2D2A4" opacity="0.6"/>
  </g>

  <!-- Trunk with Intaglio Hatching & Bark Contour -->
  <g class="engraving-trunk">
    <!-- Main stem contours -->
    <path d="M140 225 Q137 175 140 130 Q142 95 140 60" stroke="#C5A059" stroke-width="2.6"/>
    <path d="M136 220 Q133 175 136 135 Q138 100 137 70" stroke="#E2D2A4" stroke-width="1.0" opacity="0.85"/>
    <path d="M144 220 Q141 175 144 135 Q146 100 143 70" stroke="#8A6D3B" stroke-width="1.0" opacity="0.7"/>
    <!-- Bark Hatch Lines -->
    <g stroke="#142C4E" stroke-width="0.8" opacity="0.75">
      <line x1="135" y1="210" x2="145" y2="213"/>
      <line x1="135" y1="195" x2="145" y2="198"/>
      <line x1="135" y1="180" x2="145" y2="183"/>
      <line x1="136" y1="165" x2="144" y2="168"/>
      <line x1="136" y1="150" x2="144" y2="153"/>
      <line x1="137" y1="135" x2="143" y2="138"/>
      <line x1="138" y1="120" x2="142" y2="122"/>
      <line x1="138" y1="105" x2="142" y2="107"/>
      <line x1="138" y1="90" x2="142" y2="92"/>
    </g>
  </g>

  <!-- Curving Botanical Boughs & Vines -->
  <g class="engraving-branches" stroke="#C5A059">
    <!-- Lower Left Branch -->
    <path d="M138 175 Q105 160 85 140 Q68 120 60 95" stroke-width="1.6"/>
    <path d="M85 140 Q65 148 45 162 Q30 172 20 190" stroke-width="1.1"/>
    <!-- Tendril Spiral Left -->
    <path d="M60 95 Q52 82 58 72 Q68 66 74 76 Q78 88 68 94 Q62 96 58 90" stroke-width="0.9" stroke="#E2D2A4"/>
    
    <!-- Lower Right Branch -->
    <path d="M142 165 Q175 150 195 130 Q212 110 220 85" stroke-width="1.6"/>
    <path d="M195 130 Q215 138 235 152 Q250 162 260 180" stroke-width="1.1"/>
    <!-- Tendril Spiral Right -->
    <path d="M220 85 Q228 72 222 62 Q212 56 206 66 Q202 78 212 84 Q218 86 222 80" stroke-width="0.9" stroke="#E2D2A4"/>

    <!-- Mid-level Branches -->
    <path d="M139 125 Q115 105 100 80 Q90 60 85 35" stroke-width="1.4"/>
    <path d="M141 115 Q165 95 180 70 Q190 50 195 25" stroke-width="1.4"/>
    <!-- Upper crown shoots -->
    <path d="M140 75 Q130 50 135 25" stroke-width="1.3"/>
    <path d="M140 75 Q150 50 145 25" stroke-width="1.1"/>
  </g>

  <!-- Detailed Botanical Leaves with Internal Rib Hatching -->
  <g class="engraving-foliage">
    <!-- Leaf 1 (Left Lower) -->
    <path d="M60 95 C40 88 35 68 48 55 C65 58 72 78 60 95 Z" stroke="#C5A059" stroke-width="1.3" fill="#081426" fill-opacity="0.7"/>
    <path d="M60 95 Q54 77 48 55" stroke="#E2D2A4" stroke-width="0.9"/>
    <path d="M56 87 L48 82 M57 78 L50 73 M58 69 L52 65" stroke="#E2D2A4" stroke-width="0.6"/>

    <!-- Leaf 2 (Right Lower) -->
    <path d="M195 130 C215 122 225 105 218 90 C202 92 195 110 195 130 Z" stroke="#C5A059" stroke-width="1.3" fill="#081426" fill-opacity="0.7"/>
    <path d="M195 130 Q206 112 218 90" stroke="#E2D2A4" stroke-width="0.9"/>
    <path d="M201 120 L210 117 M204 110 L213 107 M207 100 L215 97" stroke="#E2D2A4" stroke-width="0.6"/>

    <!-- Leaf 3 (Outer Far Left) -->
    <path d="M45 162 C25 155 18 138 30 125 C44 130 48 148 45 162 Z" stroke="#C5A059" stroke-width="1.2" fill="#081426" fill-opacity="0.7"/>
    <path d="M45 162 Q37 145 30 125 M40 152 L32 147 M42 142 L35 138" stroke="#E2D2A4" stroke-width="0.7"/>

    <!-- Leaf 4 (Outer Far Right) -->
    <path d="M235 152 C255 145 262 128 250 115 C236 120 232 138 235 152 Z" stroke="#C5A059" stroke-width="1.2" fill="#081426" fill-opacity="0.7"/>
    <path d="M235 152 Q243 135 250 115 M240 143 L248 139 M238 133 L245 130" stroke="#E2D2A4" stroke-width="0.7"/>

    <!-- Leaf 5 (Mid Left) -->
    <path d="M100 80 C88 65 85 45 98 32 C110 40 110 60 100 80 Z" stroke="#C5A059" stroke-width="1.3" fill="#081426" fill-opacity="0.7"/>
    <path d="M100 80 Q98 58 98 32 M99 68 L92 60 M100 56 L94 49 M100 45 L95 40" stroke="#E2D2A4" stroke-width="0.7"/>

    <!-- Leaf 6 (Mid Right) -->
    <path d="M180 70 C192 55 195 35 182 22 C170 30 170 50 180 70 Z" stroke="#C5A059" stroke-width="1.3" fill="#081426" fill-opacity="0.7"/>
    <path d="M180 70 Q182 48 182 22 M181 58 L188 50 M180 46 L186 39 M180 35 L185 30" stroke="#E2D2A4" stroke-width="0.7"/>

    <!-- Apex Tender Sprout -->
    <path d="M140 45 C130 30 132 15 140 6 C148 15 150 30 140 45 Z" stroke="#C5A059" stroke-width="1.4" fill="#081426" fill-opacity="0.8"/>
    <line x1="140" y1="45" x2="140" y2="6" stroke="#E2D2A4" stroke-width="0.9"/>
    <path d="M140 35 L134 28 M140 35 L146 28 M140 24 L135 18 M140 24 L145 18" stroke="#E2D2A4" stroke-width="0.7"/>
  </g>
  <!-- Micro Botanical Pearls -->
  <g fill="#E2D2A4">
    <circle cx="85" cy="35" r="1.8"/>
    <circle cx="195" cy="25" r="1.8"/>
    <circle cx="20" cy="190" r="1.8"/>
    <circle cx="260" cy="180" r="1.8"/>
    <circle cx="140" cy="6" r="2.2"/>
  </g>
</svg>`;

const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <!-- Classical Astrolabe & Laurel Wreath (Wisdom & Decisions) -->
  <!-- Classical Laurel Wreath Boughs -->
  <g class="engraving-laurel-wreath" stroke="#C5A059">
    <!-- Left Laurel Stem -->
    <path d="M130 235 C75 235 35 190 35 130 C35 70 75 25 125 20" stroke-width="1.4"/>
    <!-- Left Leaves -->
    <path d="M48 195 C34 186 32 172 42 162 C48 172 54 184 48 195 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <path d="M35 155 C22 146 22 132 32 122 C38 132 44 144 35 155 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <path d="M38 115 C26 104 28 90 40 82 C46 92 50 106 38 115 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <path d="M55 78 C45 66 50 52 64 46 C68 58 68 70 55 78 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <path d="M85 48 C76 36 86 24 100 22 C102 34 100 44 85 48 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <!-- Leaf veins left -->
    <path d="M48 195 L40 178 M35 155 L30 138 M38 115 L35 98 M55 78 L56 62 M85 48 L92 34" stroke="#E2D2A4" stroke-width="0.7"/>

    <!-- Right Laurel Stem -->
    <path d="M130 235 C185 235 225 190 225 130 C225 70 185 25 135 20" stroke-width="1.4"/>
    <!-- Right Leaves -->
    <path d="M212 195 C226 186 228 172 218 162 C212 172 206 184 212 195 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <path d="M225 155 C238 146 238 132 228 122 C222 132 216 144 225 155 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <path d="M222 115 C234 104 232 90 220 82 C214 92 210 106 222 115 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <path d="M205 78 C215 66 210 52 196 46 C192 58 192 70 205 78 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <path d="M175 48 C184 36 174 24 160 22 C158 34 160 44 175 48 Z" fill="#081426" fill-opacity="0.7" stroke-width="1.1"/>
    <!-- Leaf veins right -->
    <path d="M212 195 L220 178 M225 155 L230 138 M222 115 L225 98 M205 78 L204 62 M175 48 L168 34" stroke="#E2D2A4" stroke-width="0.7"/>

    <!-- Antique Ribbon Knot at Base -->
    <path d="M120 232 C124 240 130 244 138 244 C146 244 150 238 144 232 C135 226 128 226 120 232 Z" stroke="#E2D2A4" stroke-width="1.3"/>
    <path d="M124 242 Q110 252 100 258 M136 242 Q150 252 160 258" stroke="#C5A059" stroke-width="1.3"/>
  </g>

  <!-- Celestial Astrolabe / Armillary Compass Sphere -->
  <g class="engraving-astrolabe" stroke="#C5A059">
    <!-- Outer Meridian Ring with Ticks -->
    <circle cx="130" cy="130" r="62" stroke-width="1.6"/>
    <circle cx="130" cy="130" r="58" stroke-width="0.8" stroke-dasharray="2 3" stroke="#E2D2A4"/>
    <circle cx="130" cy="130" r="46" stroke-width="1.1"/>
    <circle cx="130" cy="130" r="32" stroke-width="0.8" stroke="#142C4E"/>

    <!-- Orbital Coordinate Ellipses -->
    <ellipse cx="130" cy="130" rx="46" ry="18" stroke-width="1.1" transform="rotate(-30 130 130)"/>
    <ellipse cx="130" cy="130" rx="46" ry="18" stroke-width="1.1" transform="rotate(30 130 130)"/>
    <!-- Cardinal Cross Hairlines -->
    <line x1="130" y1="66" x2="130" y2="194" stroke-width="1.1" stroke="#E2D2A4"/>
    <line x1="66" y1="130" x2="194" y2="130" stroke-width="1.1" stroke="#E2D2A4"/>

    <!-- 8-Point Compass Rose Core -->
    <path d="M130 102 L135 125 L158 130 L135 135 L130 158 L125 135 L102 130 L125 125 Z" fill="#C5A059" fill-opacity="0.35" stroke="#C5A059" stroke-width="1.3"/>
    <circle cx="130" cy="130" r="4" fill="#E2D2A4" stroke="#C5A059" stroke-width="1.2"/>
    <!-- North Fleur-de-lis Pointer -->
    <path d="M130 92 L132 100 L128 100 Z" fill="#E2D2A4" stroke="#C5A059" stroke-width="0.8"/>
  </g>
</svg>`;

const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <!-- Classical Heraldic Oak & Acorn Crest (For Luxury Ivory Card - Deep Midnight & Antique Bronze) -->
  <!-- Outer Guilloche Oval -->
  <g class="engraving-crest-frame" stroke="#8A6D3B">
    <ellipse cx="130" cy="130" rx="72" ry="96" stroke-width="1.6"/>
    <ellipse cx="130" cy="130" rx="66" ry="90" stroke-width="0.9" stroke-dasharray="2 3" stroke="#050D1A"/>
    <ellipse cx="130" cy="130" rx="60" ry="84" stroke-width="0.7"/>
  </g>

  <!-- Symmetrical Oak Branches with Acorns -->
  <g class="engraving-oak-left" stroke="#050D1A">
    <!-- Main stem left -->
    <path d="M130 226 C90 226 62 185 62 130 C62 80 85 45 124 35" stroke-width="1.4"/>
    <!-- Oak Leaf 1 -->
    <path d="M62 175 C48 170 45 155 55 150 C46 142 48 128 60 128 C52 118 62 108 72 115 C74 135 70 162 62 175 Z" fill="#E8DEC8" fill-opacity="0.6" stroke-width="1.2"/>
    <!-- Acorn 1 -->
    <path d="M52 188 C48 192 48 200 54 204 C62 200 62 192 57 188 Z" fill="#8A6D3B" fill-opacity="0.45" stroke="#8A6D3B" stroke-width="1.2"/>
    <path d="M50 188 Q54 184 59 188" stroke="#8A6D3B" stroke-width="1.6"/>
    <!-- Oak Leaf 2 -->
    <path d="M72 105 C60 98 58 84 68 80 C62 70 70 60 82 64 C80 50 94 45 100 55 C100 72 90 92 72 105 Z" fill="#E8DEC8" fill-opacity="0.6" stroke-width="1.2"/>
    <!-- Acorn 2 -->
    <path d="M82 54 C78 50 82 40 88 40 C95 40 98 50 94 54 Z" fill="#8A6D3B" fill-opacity="0.45" stroke="#8A6D3B" stroke-width="1.2"/>
  </g>

  <g class="engraving-oak-right" stroke="#050D1A">
    <!-- Main stem right -->
    <path d="M130 226 C170 226 198 185 198 130 C198 80 175 45 136 35" stroke-width="1.4"/>
    <!-- Oak Leaf 1 -->
    <path d="M198 175 C212 170 215 155 205 150 C214 142 212 128 200 128 C208 118 198 108 188 115 C186 135 190 162 198 175 Z" fill="#E8DEC8" fill-opacity="0.6" stroke-width="1.2"/>
    <!-- Acorn 1 -->
    <path d="M208 188 C212 192 212 200 206 204 C198 200 198 192 203 188 Z" fill="#8A6D3B" fill-opacity="0.45" stroke="#8A6D3B" stroke-width="1.2"/>
    <path d="M210 188 Q206 184 201 188" stroke="#8A6D3B" stroke-width="1.6"/>
    <!-- Oak Leaf 2 -->
    <path d="M188 105 C200 98 202 84 192 80 C198 70 190 60 178 64 C180 50 166 45 160 55 C160 72 170 92 188 105 Z" fill="#E8DEC8" fill-opacity="0.6" stroke-width="1.2"/>
    <!-- Acorn 2 -->
    <path d="M178 54 C182 50 178 40 172 40 C165 40 162 50 166 54 Z" fill="#8A6D3B" fill-opacity="0.45" stroke="#8A6D3B" stroke-width="1.2"/>
  </g>

  <!-- Central Intaglio Cartouche & Banknote Shading -->
  <g class="engraving-cartouche" stroke="#8A6D3B">
    <path d="M130 75 C150 75 162 86 162 115 C162 155 130 178 130 178 C130 178 98 155 98 115 C98 86 110 75 130 75 Z" stroke-width="1.6" fill="#F0E8DA" fill-opacity="0.5"/>
    <path d="M130 82 C145 82 155 92 155 115 C155 146 130 166 130 166 C130 166 105 146 105 115 C105 92 115 82 130 82 Z" stroke-width="0.9" stroke="#050D1A"/>
    <!-- Horizontal Banknote Hatching -->
    <g stroke="#8A6D3B" stroke-width="0.8">
      <line x1="114" y1="108" x2="146" y2="108"/>
      <line x1="111" y1="115" x2="149" y2="115"/>
      <line x1="112" y1="122" x2="148" y2="122"/>
      <line x1="116" y1="129" x2="144" y2="129"/>
      <line x1="120" y1="136" x2="140" y2="136"/>
      <line x1="125" y1="143" x2="135" y2="143"/>
    </g>
    <!-- Top Coronet / Heraldic Trefoil -->
    <path d="M118 70 L122 58 L130 66 L138 58 L142 70 Z" fill="#8A6D3B" stroke="#050D1A" stroke-width="1.1"/>
  </g>
</svg>`;

const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <!-- Ascending Botanical Vine & Antique Measuring Quadrant (Real Opportunities) -->
  <!-- Classical Surveyor's Quadrant Arc & Degree Calibrations -->
  <g class="engraving-quadrant" stroke="#C5A059">
    <path d="M40 240 L240 240 L240 40" stroke-width="1.4"/>
    <path d="M40 240 Q180 240 240 40" stroke-width="1.8"/>
    <path d="M52 240 Q175 240 228 55" stroke-width="0.8" stroke-dasharray="3 3" stroke="#E2D2A4"/>
    <!-- Radial Degree Ticks from origin -->
    <line x1="40" y1="240" x2="240" y2="40" stroke-width="0.9" stroke="#142C4E"/>
    <line x1="40" y1="240" x2="205" y2="95" stroke-width="0.8" stroke="#142C4E"/>
    <line x1="40" y1="240" x2="160" y2="160" stroke-width="0.8" stroke="#142C4E"/>
    <line x1="40" y1="240" x2="100" y2="215" stroke-width="0.8" stroke="#142C4E"/>
  </g>

  <!-- Ascending Climbing Vine with Burgeoning Tendrils -->
  <g class="engraving-vine" stroke="#C5A059">
    <!-- Main ascending spiraling vine -->
    <path d="M40 250 Q70 225 85 195 Q100 165 125 145 Q150 125 170 95 Q190 65 225 35 Q238 26 250 15" stroke-width="1.6"/>
    <path d="M85 195 Q110 205 130 212" stroke-width="1.1"/>
    <path d="M125 145 Q145 158 165 162" stroke-width="1.1"/>
    <path d="M170 95 Q200 108 215 118" stroke-width="1.1"/>
    <!-- Tendril Flourishes -->
    <path d="M225 35 Q242 38 240 50 Q232 58 222 52 Q218 46 225 40" stroke-width="0.9" stroke="#E2D2A4"/>
    <path d="M170 95 Q182 82 176 74 Q168 70 164 78" stroke-width="0.8" stroke="#E2D2A4"/>
    <path d="M125 145 Q135 135 130 128 Q122 125 120 132" stroke-width="0.8" stroke="#E2D2A4"/>
  </g>

  <!-- Detailed Climbing Leaves with Vein Hatching -->
  <g class="engraving-vine-leaves" stroke="#C5A059" fill="#081426" fill-opacity="0.7">
    <path d="M85 195 C70 182 66 164 78 154 C92 160 95 178 85 195 Z" stroke-width="1.3"/>
    <path d="M130 212 C148 215 160 202 154 190 C140 194 132 202 130 212 Z" stroke-width="1.2"/>
    <path d="M125 145 C110 130 112 112 126 105 C138 115 137 132 125 145 Z" stroke-width="1.3"/>
    <path d="M165 162 C182 165 194 150 185 138 C170 142 164 152 165 162 Z" stroke-width="1.2"/>
    <path d="M170 95 C155 80 158 62 172 55 C184 65 182 82 170 95 Z" stroke-width="1.3"/>
    <path d="M215 118 C232 122 242 108 235 96 C220 100 215 110 215 118 Z" stroke-width="1.2"/>
    <path d="M225 35 C212 20 216 4 230 0 C242 10 240 25 225 35 Z" stroke-width="1.4"/>
  </g>

  <!-- Fine leaf ribs -->
  <g stroke="#E2D2A4" stroke-width="0.7">
    <path d="M85 195 L76 166 M130 212 L148 198 M125 145 L121 118 M165 162 L180 148 M170 95 L168 68 M215 118 L228 104 M225 35 L227 10"/>
  </g>
  <!-- Calibration Markers -->
  <g fill="#E2D2A4">
    <circle cx="240" cy="40" r="2.2"/>
    <circle cx="178" cy="85" r="1.8"/>
    <circle cx="120" cy="155" r="1.8"/>
    <circle cx="40" cy="240" r="2.2"/>
  </g>
</svg>`;

const svg5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <!-- Neoclassical Arch & Blooming Acanthus Fronds (Breaking Limits) -->
  <!-- Classical Architectural Arch (Engraved stone profile) -->
  <g class="engraving-arch" stroke="#C5A059">
    <path d="M50 260 L50 150 C50 85 90 45 140 45 C190 45 230 85 230 150 L230 260" stroke-width="1.6"/>
    <path d="M62 260 L62 152 C62 95 98 58 140 58 C182 58 218 95 218 152 L218 260" stroke-width="0.9" stroke-dasharray="3 3" stroke="#E2D2A4"/>
    <!-- Keystone -->
    <path d="M130 40 L150 40 L145 60 L135 60 Z" stroke-width="1.3" fill="#081426" stroke="#C5A059"/>
    <!-- Radiating Sunbeam Hatches behind foliage -->
    <g stroke="#142C4E" stroke-width="0.8" opacity="0.8">
      <line x1="140" y1="140" x2="75" y2="85"/>
      <line x1="140" y1="140" x2="100" y2="62"/>
      <line x1="140" y1="140" x2="130" y2="52"/>
      <line x1="140" y1="140" x2="150" y2="52"/>
      <line x1="140" y1="140" x2="180" y2="62"/>
      <line x1="140" y1="140" x2="205" y2="85"/>
    </g>
  </g>

  <!-- Unfurling Acanthus Botanical Blossom Breaking Outward -->
  <g class="engraving-acanthus" stroke="#C5A059">
    <!-- Center stem rising through arch -->
    <path d="M140 260 Q140 185 140 120 Q140 90 140 65" stroke-width="1.8"/>
    <!-- Left Acanthus Scroll (Breaking through left pillar) -->
    <path d="M140 185 Q105 168 75 180 Q45 192 28 174 Q20 155 35 142 Q52 136 70 154" stroke-width="1.4"/>
    <path d="M75 180 Q52 165 58 150" stroke-width="0.9" stroke="#E2D2A4"/>
    <!-- Right Acanthus Scroll (Breaking through right pillar) -->
    <path d="M140 185 Q175 168 205 180 Q235 192 252 174 Q260 155 245 142 Q228 136 210 154" stroke-width="1.4"/>
    <path d="M205 180 Q228 165 222 150" stroke-width="0.9" stroke="#E2D2A4"/>

    <!-- Mid-level Acanthus Fronds -->
    <path d="M140 135 Q110 112 92 88 Q82 70 98 60 Q112 64 122 82" stroke-width="1.3"/>
    <path d="M140 135 Q170 112 188 88 Q198 70 182 60 Q168 64 158 82" stroke-width="1.3"/>

    <!-- Apex Palmette / Lotus Blossom -->
    <path d="M140 75 C128 58 128 35 140 20 C152 35 152 58 140 75 Z" fill="#081426" fill-opacity="0.85" stroke="#E2D2A4" stroke-width="1.5"/>
  </g>
  <!-- Acanthus Leaf Veining & Shading -->
  <g stroke="#E2D2A4" stroke-width="0.8">
    <path d="M35 142 Q48 154 65 160 M52 136 Q60 148 76 158"/>
    <path d="M245 142 Q232 154 215 160 M228 136 Q220 148 204 158"/>
    <path d="M98 60 Q106 75 118 88 M182 60 Q174 75 162 88"/>
    <line x1="140" y1="65" x2="140" y2="24"/>
  </g>
</svg>`;

const svg6 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <!-- Symmetrical Interconnected Antique Canopy & Root Pergola (Connection & Vision) -->
  <!-- Left Grand Ancient Bough -->
  <g class="engraving-canopy-left" stroke="#C5A059">
    <!-- Left Trunk & Roots -->
    <path d="M35 195 Q48 165 52 130 Q58 90 98 65 Q138 42 178 38" stroke-width="1.6"/>
    <!-- Root filaments left -->
    <path d="M35 195 Q22 198 10 200 M35 195 Q42 198 52 200 M32 185 Q20 190 12 192" stroke-width="1.0" opacity="0.7"/>
    <!-- Secondary Branching -->
    <path d="M52 130 Q75 118 102 112 Q130 110 160 112" stroke-width="1.1"/>
    <path d="M98 65 Q120 82 150 88" stroke-width="1.0"/>
    <!-- Tendril flourishes -->
    <path d="M178 38 Q190 28 184 18 Q172 15 166 26" stroke-width="0.9" stroke="#E2D2A4"/>
  </g>

  <!-- Right Grand Ancient Bough -->
  <g class="engraving-canopy-right" stroke="#C5A059">
    <!-- Right Trunk & Roots -->
    <path d="M325 195 Q312 165 308 130 Q302 90 262 65 Q222 42 182 38" stroke-width="1.6"/>
    <!-- Root filaments right -->
    <path d="M325 195 Q338 198 350 200 M325 195 Q318 198 308 200 M328 185 Q340 190 348 192" stroke-width="1.0" opacity="0.7"/>
    <!-- Secondary Branching -->
    <path d="M308 130 Q285 118 258 112 Q230 110 200 112" stroke-width="1.1"/>
    <path d="M262 65 Q240 82 210 88" stroke-width="1.0"/>
    <!-- Tendril flourishes -->
    <path d="M182 38 Q170 28 176 18 Q188 15 194 26" stroke-width="0.9" stroke="#E2D2A4"/>
  </g>

  <!-- Central Intertwined Knot & Rosette -->
  <g class="engraving-center-knot" stroke="#E2D2A4">
    <path d="M178 38 Q180 46 182 38 M160 112 Q180 122 200 112" stroke-width="1.3"/>
    <circle cx="180" cy="38" r="4.5" fill="#081426" stroke="#C5A059" stroke-width="1.3"/>
    <circle cx="180" cy="38" r="1.8" fill="#E2D2A4"/>
  </g>

  <!-- Botanical Foliage along the Canopy Arch -->
  <g class="engraving-canopy-leaves" stroke="#C5A059" fill="#081426" fill-opacity="0.7">
    <path d="M98 65 C86 52 90 38 104 32 C116 42 112 55 98 65 Z" stroke-width="1.2"/>
    <path d="M138 42 C128 28 134 15 148 10 C158 20 152 34 138 42 Z" stroke-width="1.2"/>
    <path d="M262 65 C274 52 270 38 256 32 C244 42 248 55 262 65 Z" stroke-width="1.2"/>
    <path d="M222 42 C232 28 226 15 212 10 C202 20 208 34 222 42 Z" stroke-width="1.2"/>
    <!-- Mid Canopy Foliage -->
    <path d="M102 112 C90 100 92 86 106 84 C116 94 114 104 102 112 Z" stroke-width="1.1"/>
    <path d="M258 112 C270 100 268 86 254 84 C244 94 246 104 258 112 Z" stroke-width="1.1"/>
  </g>
  <!-- Delicate leaf veining -->
  <g stroke="#E2D2A4" stroke-width="0.7">
    <path d="M98 65 L100 40 M138 42 L142 18 M262 65 L260 40 M222 42 L218 18"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(outDir, 'bento_editorial_1.svg'), svg1);
fs.writeFileSync(path.join(outDir, 'bento_editorial_2.svg'), svg2);
fs.writeFileSync(path.join(outDir, 'bento_editorial_3.svg'), svg3);
fs.writeFileSync(path.join(outDir, 'bento_editorial_4.svg'), svg4);
fs.writeFileSync(path.join(outDir, 'bento_editorial_5.svg'), svg5);
fs.writeFileSync(path.join(outDir, 'bento_editorial_6.svg'), svg6);

console.log('Successfully re-generated all 6 master-level botanical engraving SVGs!');

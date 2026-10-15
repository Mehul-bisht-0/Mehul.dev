const farDunes = "M0 100H20V96H40V92H64V88H88V84H108V88H128V92H148V96H172V100H192V96H216V92H236V96H256V100V176H0Z";
const nearDunes = "M0 118H24V114H48V110H76V106H100V110H124V114H148V118H172V122H196V126H220V122H240V118H256V176H0Z";
const skyline = "M0 144V98H10V80H26V102H40V72H58V90H72V60H88V108H102V84H118V104H132V66H148V92H162V78H178V104H192V70H208V96H228V84H242V110H256V144Z";

export default function NightDrive() {
  return (
    <div className="night-scene desert-scene cyber-drive" aria-hidden="true">
      <div className="drive-status"><span>AFTER HOURS</span><span className="scene-label-city">NEON DISTRICT / 01</span><span className="scene-label-desert">DESERT / 02</span></div>
      <svg className="desert-drive" viewBox="0 0 256 176" fill="none" shapeRendering="crispEdges" focusable="false">
        <rect width="256" height="176" fill="var(--scene-sky)" />
        <g fill="var(--dim)"><path d="M24 24h2v2h-2zM56 12h2v2h-2zM92 38h2v2h-2zM130 18h2v2h-2zM222 74h2v2h-2zM150 58h2v2h-2zM12 66h2v2h-2zM72 66h2v2h-2zM242 28h2v2h-2z" /><path d="M112 48h2v-2h2v2h2v2h-2v2h-2v-2h-2zM40 46h2v-2h2v2h2v2h-2v2h-2v-2h-2z" opacity=".7" /></g>
        <path d="M188 12h16v4h-12v4h-8v8h-4v16h4v8h8v4h12v4h-16v-4h-8v-4h-4v-8h-4V28h4v-8h4v-4h8z" fill="var(--amber)" />
        <path d="M176 32h4v4h-4zM180 46h4v4h-4z" fill="var(--scene-detail)" />

        <g className="scene-city">
          <g className="city-distant">{[0, 256].map((offset) => <g key={offset} transform={`translate(${offset} 0)`}><path d={skyline} fill="var(--scene-far)" /><path d="M14 86h2v5h-2zM44 78h2v4h-2zM50 90h2v4h-2zM76 68h2v4h-2zM82 80h2v4h-2zM136 74h2v4h-2zM168 86h2v4h-2zM198 78h2v4h-2zM232 92h2v4h-2z" fill="var(--green)" opacity=".45" /></g>)}</g>
          <g className="city-street">{[0, 256].map((offset) => <g key={offset} transform={`translate(${offset} 0)`}>
            <path d="M8 144v-40h6v-8h32v8h6v40zM80 144V72h8v-8h28v8h12v72zM176 144V94h8v-8h44v8h12v50z" fill="var(--scene-near)" />
            <path d="M112 52v12M28 88v8M196 78v8" stroke="var(--scene-detail)" strokeWidth="2" />
            {Array.from({ length: 4 }, (_, row) => [88, 100, 112].map((x, column) => <rect key={`${row}-${column}`} x={x} y={82 + row * 13} width="4" height="5" fill={(row + column) % 3 === 0 ? "var(--amber)" : "var(--green)"} opacity={(row + column) % 2 === 0 ? .7 : .25} />))}
            <path d="M16 108h28v15H16zM188 102h40v17h-40z" fill="var(--scene-sky)" stroke="var(--green)" />
            <text x="20" y="120" fill="var(--amber)" style={{ font: "13px var(--pixel)" }}>24H</text><text x="193" y="114" fill="var(--green)" style={{ font: "12px var(--pixel)" }}>BYTE</text>
            <path d="M68 96v48M164 94v50" stroke="var(--scene-detail)" strokeWidth="2" /><path d="M62 94h12v3H62zM158 92h12v3h-12z" fill="var(--amber)" />
            <path d="M60 98h16v46H60zM156 96h16v48h-16z" fill="var(--amber)" opacity=".035" />
          </g>)}</g>
        </g>

        <g className="scene-desert">
          <g className="desert-far-dunes" fill="var(--scene-far)">{[0, 256].map((offset) => <path key={offset} d={farDunes} transform={`translate(${offset} 0)`} />)}</g>
          <g className="desert-near-dunes" fill="var(--scene-near)">{[0, 256].map((offset) => <g key={offset} transform={`translate(${offset} 0)`}><path d={nearDunes} /><path d="M50 116h14M84 112h6M180 128h12M224 124h8" stroke="var(--strong-border)" strokeWidth="2" /></g>)}</g>
          <g className="desert-cacti" fill="var(--scene-detail)">{[0, 256].map((offset) => <g key={offset} transform={`translate(${offset} 0)`}><path d="M30 102h4v18h6v-10h4v14H34v14h-4v-18h-8v-12h4v8h4z" /><path d="M208 108h4v14h6v-8h4v12h-10v12h-4v-10h-6v-10h4v6h2z" fill="var(--scene-structure)" /><path d="M28 138h10M204 138h12" stroke="var(--dim)" strokeWidth="2" /></g>)}</g>
        </g>

        <path d="M0 144h256v32H0z" fill="var(--scene-road)" /><path d="M0 143h256M0 173h256" stroke="var(--strong-border)" strokeWidth="2" />
        <g className="scene-city" opacity=".2"><path d="M18 147h24v2H18zM28 152h14v2H28zM98 148h14v2H98zM192 147h32v2h-32zM196 151h24v2h-24z" fill="var(--green)" /><path d="M66 148h4v9h-4zM162 148h4v9h-4z" fill="var(--amber)" /></g>
        <g className="desert-road-markings">{Array.from({ length: 6 }, (_, index) => <g key={index} transform={`translate(${index * 64} 0)`}><path d="M0 160h20v2H0z" fill="var(--dim)" /><path d="M38 169h4v2h-4zM16 149h3v1h-3z" fill="var(--border)" /></g>)}</g>
        <g className="scene-city"><g className="city-rain" stroke="var(--green)">{Array.from({ length: 18 }, (_, index) => <path key={index} d={`M${(index * 37) % 280} ${(index * 19) % 150 - 12}v5h-1v3`} />)}</g></g>

        <g transform="translate(86 111)">
          <path d="M-4 32h82v2H-4z" fill="var(--shadow)" /><path d="M8 32h56v2H8z" fill="var(--green)" opacity=".35" />
          <g className="desert-car">
            <path d="M72 14h14v-2h16v-2h18v16h-18v-2H86v-2H72z" fill="var(--amber)" opacity=".12" />
            <g className="desert-dust" fill="var(--dim)"><path d="M-6 25h4v2h-4zM-14 27h4v2h-4zM-22 24h3v2h-3z" /></g>
            <path d="M14 10V6h6V2h26v4h6v4h14v4h6v10H0V12h4v-2z" fill="var(--green)" />
            <path d="M20 6h12v8H16v-4h4zM36 6h8v4h6v4H36z" fill="var(--scene-sky)" /><path d="M22 6h4v8h-4zM38 6h4v8h-4z" fill="var(--strong-border)" />
            <path d="M0 20h72v6H0z" fill="var(--scene-detail)" /><path d="M2 20h64v2H2z" fill="var(--amber)" />
            <path d="M3 16h64M34 15v8M25 17h5" stroke="var(--scene-ink)" /><path d="M68 14h6v4h-6z" fill="var(--text)" /><path d="M0 14h3v5H0z" fill="var(--amber)" />
            <path d="M-2 23h7v3h-7zM66 23h8v3h-8z" fill="var(--muted)" />
            {[10, 50].map((offset) => <g key={offset} transform={`translate(${offset} 20)`}><path d="M2 0h8v2h2v8h-2v2H2v-2H0V2h2z" fill="var(--shadow)" /><path d="M3 3h6v6H3z" fill="var(--scene-detail)" /><g className="desert-wheel-spokes" fill="var(--green)"><path d="M3 3h3v3H3zM7 7h2v2H7z" /></g></g>)}
          </g>
        </g>
      </svg>
      <div className="night-caption">one more commit. one more mile.<br /><span>// taking the scenic route</span></div>
      <span className="scene-coordinate">[ NIGHT DRIVE · LOOP ∞ ]</span>
    </div>
  );
}

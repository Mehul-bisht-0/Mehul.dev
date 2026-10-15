const farDunes = "M0 100H20V96H40V92H64V88H88V84H108V88H128V92H148V96H172V100H192V96H216V92H236V96H256V100V176H0Z";
const nearDunes = "M0 118H24V114H48V110H76V106H100V110H124V114H148V118H172V122H196V126H220V122H240V118H256V176H0Z";

export default function DesertDrive() {
  return (
    <div className="night-scene desert-scene" aria-hidden="true">
      <div className="drive-status"><span>AFTER HOURS</span><span>DESERT / 01</span></div>
      <svg className="desert-drive" viewBox="0 0 256 176" fill="none" shapeRendering="crispEdges" focusable="false">
        <rect width="256" height="176" fill="#07120b" />
        <g fill="#82966b">
          <path d="M24 24h2v2h-2zM56 12h2v2h-2zM92 38h2v2h-2zM130 18h2v2h-2zM222 74h2v2h-2zM150 58h2v2h-2zM12 66h2v2h-2zM72 66h2v2h-2zM242 28h2v2h-2z" />
          <path d="M112 48h2v-2h2v2h2v2h-2v2h-2v-2h-2zM40 46h2v-2h2v2h2v2h-2v2h-2v-2h-2z" opacity=".7" />
        </g>
        <path d="M188 12h16v4h-12v4h-8v8h-4v16h4v8h8v4h12v4h-16v-4h-8v-4h-4v-8h-4V28h4v-8h4v-4h8z" fill="#d4d991" />
        <path d="M176 32h4v4h-4zM180 46h4v4h-4z" fill="#8e9a61" />
        <path d="M0 80h8M248 80h8" stroke="#34462a" />
        <g className="desert-far-dunes" fill="#192c1d">
          {[0, 256].map((offset) => <path key={offset} d={farDunes} transform={`translate(${offset} 0)`} />)}
        </g>
        <g className="desert-near-dunes" fill="#2b4028">
          {[0, 256].map((offset) => <g key={offset} transform={`translate(${offset} 0)`}><path d={nearDunes} /><path d="M50 116h14M84 112h6M180 128h12M224 124h8" stroke="#435438" strokeWidth="2" /></g>)}
        </g>
        <g className="desert-cacti" fill="#4b603a">
          {[0, 256].map((offset) => <g key={offset} transform={`translate(${offset} 0)`}><path d="M30 102h4v18h6v-10h4v14H34v14h-4v-18h-8v-12h4v8h4z" /><path d="M208 108h4v14h6v-8h4v12h-10v12h-4v-10h-6v-10h4v6h2z" fill="#3c5130" /><path d="M28 138h10M204 138h12" stroke="#667249" strokeWidth="2" /></g>)}
        </g>
        <path d="M0 144h256v32H0z" fill="#0c180e" />
        <path d="M0 143h256M0 173h256" stroke="#4a5d37" strokeWidth="2" />
        <g className="desert-road-markings">
          {Array.from({ length: 6 }, (_, index) => <g key={index} transform={`translate(${index * 64} 0)`}><path d="M0 160h20v2H0z" fill="#829165" /><path d="M38 169h4v2h-4zM16 149h3v1h-3z" fill="#34472c" /></g>)}
        </g>
        <g transform="translate(86 111)">
          <path d="M-4 32h82v2H-4z" fill="#050c07" />
          <g className="desert-car">
            <path d="M72 14h14v-2h16v-2h18v16h-18v-2H86v-2H72z" fill="#c8d38e" opacity=".12" />
            <g className="desert-dust" fill="#77895a"><path d="M-6 25h4v2h-4zM-14 27h4v2h-4zM-22 24h3v2h-3z" /></g>
            <path d="M14 10V6h6V2h26v4h6v4h14v4h6v10H0V12h4v-2z" fill="#b9cc96" />
            <path d="M20 6h12v8H16v-4h4zM36 6h8v4h6v4H36z" fill="#173225" />
            <path d="M22 6h4v8h-4zM38 6h4v8h-4z" fill="#3c5b40" />
            <path d="M0 20h72v6H0z" fill="#78905b" />
            <path d="M3 16h64M34 15v8M25 17h5" stroke="#647e4b" />
            <path d="M68 14h6v4h-6z" fill="#edf0b4" /><path d="M0 14h3v5H0z" fill="#c5a363" />
            <path d="M-2 23h7v3h-7zM66 23h8v3h-8z" fill="#9daa7b" />
            {[10, 50].map((offset) => <g key={offset} transform={`translate(${offset} 20)`}><path d="M2 0h8v2h2v8h-2v2H2v-2H0V2h2z" fill="#050c07" /><path d="M3 3h6v6H3z" fill="#53684b" /><g className="desert-wheel-spokes" fill="#b7c995"><path d="M3 3h3v3H3zM7 7h2v2H7z" /></g></g>)}
          </g>
        </g>
      </svg>
      <div className="night-caption">one more commit. one more mile.<br /><span>// taking the scenic route</span></div>
      <span className="scene-coordinate">[ NIGHT DRIVE · LOOP ∞ ]</span>
    </div>
  );
}

import { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Commercial Roofing Scope of Work: 40-Item Checklist for Estimators",
  description: "A complete commercial roofing scope of work checklist covering existing conditions, removal, substrate, membrane systems, accessories, flashing, warranty, and cleanup. Avoid costly change orders.",
  openGraph: {
    title: "Commercial Roofing Scope of Work: 40-Item Checklist for Estimators",
    description: "A complete commercial roofing scope of work checklist covering existing conditions, removal, substrate, membrane systems, accessories, flashing, warranty, and cleanup. Avoid costly change orders.",
    type: "article",
    publishedTime: "2026-01-20",
    authors: ["MC2 Estimating"],
    images: [
      {
        url: "/api/og?title=Commercial Roofing Scope of Work: 40-Item Checklist for Estimators&type=article",
        width: 1200,
        height: 630,
        alt: "Commercial Roofing Scope of Work: 40-Item Checklist for Estimators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Roofing Scope of Work: 40-Item Checklist for Estimators",
    description: "A complete commercial roofing scope of work checklist covering existing conditions, removal, substrate, membrane systems, accessories, flashing, warranty, and cleanup. Avoid costly change orders.",
    images: ["/api/og?title=Commercial Roofing Scope of Work: 40-Item Checklist for Estimators&type=article"],
  },
};


const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Commercial Roofing Scope of Work: 40-Item Checklist for Estimators",
  "description": "A complete commercial roofing scope of work checklist covering existing conditions, removal, substrate, membrane systems, accessories, flashing, warranty, and cleanup. Avoid costly change orders.",
  "author": {
    "@type": "Organization",
    "name": "MC2 Estimating",
    "url": "https://www.bidshield.co"
  },
  "publisher": {
    "@type": "Organization",
    "name": "MC2 Estimating",
    "url": "https://www.bidshield.co"
  },
  "datePublished": "2026-01-20",
  "dateModified": "2026-01-20",
  "image": "https://www.bidshield.co/api/og?title=Commercial Roofing Scope of Work: 40-Item Checklist for Estimators&type=article",
  "url": "https://www.bidshield.co/blog/commercial-roofing-scope-of-work-checklist",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.bidshield.co/blog/commercial-roofing-scope-of-work-checklist"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.bidshield.co" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.bidshield.co/blog" },
    { "@type": "ListItem", "position": 3, "name": "Commercial Roofing Scope of Work: 40-Item Checklist for Estimators", "item": "https://www.bidshield.co/blog/commercial-roofing-scope-of-work-checklist" }
  ]
};

export default function CommercialRoofingScopeOfWorkArticle() {
  return (
    <main className="min-h-screen bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/blog" className="text-blue-300 hover:text-white transition-colors">
              ← Back to Blog
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm mb-4">
            <span className="px-3 py-1 bg-blue-700 rounded-full">Estimation</span>
            <span>March 5, 2026</span>
            <span>11 min read</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Commercial Roofing Scope of Work: 40-Item Checklist for Estimators
          </h1>
          <p className="text-xl text-blue-100">
            A poorly written scope of work is the number-one cause of commercial roofing change orders. Use this 40-item checklist to define exactly what is — and isn&apos;t — in your bid before you submit it.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
              MC
            </div>
            <div>
              <div className="font-semibold">MC2 Estimating</div>
              <div className="text-sm text-blue-200">Professional Estimating Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Table of Contents */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12 border-l-4 border-blue-600">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700">
            <li><a href="#what-belongs" className="hover:text-blue-600 transition-colors">What Belongs in a Commercial Roofing Scope of Work</a></li>
            <li><a href="#checklist" className="hover:text-blue-600 transition-colors">The 40-Item Scope of Work Checklist</a></li>
            <li><a href="#what-to-exclude" className="hover:text-blue-600 transition-colors">What to Explicitly Exclude</a></li>
            <li><a href="#scope-gaps" className="hover:text-blue-600 transition-colors">Common Scope Gaps That Cause Change Orders</a></li>
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
            <p className="text-gray-800 font-semibold mb-2">Why This Matters:</p>
            <p className="text-gray-700">
              A study of commercial roofing disputes finds that over 60% of change orders trace back to a scope of work that was vague, assumed, or simply missing items that both parties thought the other was covering. A written, itemized scope protects your margin and your relationship with the GC.
            </p>
          </div>

          <h2 id="what-belongs" className="text-3xl font-bold text-gray-900 mb-4 mt-12">What Belongs in a Commercial Roofing Scope of Work</h2>
          <p className="text-gray-700 mb-6">
            The scope of work in a commercial roofing bid is not just a description of what you&apos;re installing — it is a legal and contractual definition of the boundaries of your work. A strong scope answers six questions for every element of the project:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
            <li><strong>What</strong> system or material is being installed?</li>
            <li><strong>Where</strong> on the roof does this apply (all areas, specific zones, or exclusions)?</li>
            <li><strong>Who</strong> is responsible — your crew, a subcontractor, or the owner?</li>
            <li><strong>To what standard</strong> — manufacturer specs, project specifications, or local code?</li>
            <li><strong>What is the condition</strong> you are starting from (existing substrate, as-found, or remediated)?</li>
            <li><strong>What is explicitly NOT included</strong> — even if adjacent or related?</li>
          </ul>
          <p className="text-gray-700 mb-6">
            GCs review dozens of roofing bids. When yours is specific and the competing bid is vague, you either win because the GC trusts you, or you lose because your competitor submitted an apple when you submitted an orange. Either way, specificity protects you.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">The Cost of Scope Ambiguity</h3>
          <p className="text-gray-700 mb-6">
            Consider a 40,000 SF TPO re-roofing project on a grocery distribution center. The spec called for &ldquo;complete removal of existing roofing system.&rdquo; The winning sub-contractor assumed a single-ply over recovered insulation. During tear-off they found three layers: the top single-ply, a BUR beneath it, and deteriorated wood fiber board below that. The contract price was $380,000. The extra disposal and labor for two unexpected layers cost $47,000 — a 12.4% margin hit. A proper scope of work that defined &ldquo;removal of all roofing layers down to structural deck&rdquo; would have surfaced that risk during bid review.
          </p>

          <h2 id="checklist" className="text-3xl font-bold text-gray-900 mb-4 mt-12">The 40-Item Scope of Work Checklist</h2>
          <p className="text-gray-700 mb-6">
            Use this checklist as the backbone of every commercial roofing scope of work you write. Adapt the language to match the project specifications, but make sure you can check every applicable item before you submit.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Category 1: Existing Conditions (Items 1–8)</h3>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
                <span><strong>Pre-bid site walk completed.</strong> Confirm that at least one estimator or project manager physically walked the roof before the bid was submitted. Document the date and who attended.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
                <span><strong>Number of existing roofing layers identified.</strong> State how many layers are present and what systems they are (e.g., &ldquo;One (1) existing layer of 60-mil TPO with polyiso insulation&rdquo;).</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
                <span><strong>Deck type confirmed.</strong> Specify the structural deck type — steel, concrete, gypsum, wood — as this governs fastener type, penetration treatment, and labor rates.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
                <span><strong>Core cuts or destructive testing results referenced.</strong> If core cuts were taken (by owner, architect, or you), reference the findings and confirm they informed your estimate.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">5.</span>
                <span><strong>Known wet insulation areas quantified.</strong> State the approximate square footage of wet or damaged insulation identified during site walk. Note whether replacement is included or is an allowance.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">6.</span>
                <span><strong>HVAC unit count and type noted.</strong> Log every RTU, exhaust fan, and mechanical penetration. Your scope must define curb work — is it wrap, raise, or exclude?</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">7.</span>
                <span><strong>Roof drain count and condition documented.</strong> How many drains? Are bowls, clamping rings, and leaders included in your scope or by the plumber?</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">8.</span>
                <span><strong>Roof access method confirmed.</strong> Ladders, exterior stairs, interior hatch, or crane? Who provides and pays for the lift equipment if required?</span>
              </li>
            </ul>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Category 2: Removal & Demolition (Items 9–14)</h3>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">9.</span>
                <span><strong>Removal scope defined by layer.</strong> Specify exactly which layers are being removed (&ldquo;All roofing to bare steel deck&rdquo; or &ldquo;Top membrane only, existing insulation to remain&rdquo;).</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">10.</span>
                <span><strong>Disposal included or excluded.</strong> Who pays for dumpsters and tipping fees? If included, state the estimated haul weight or number of dumpsters budgeted.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">11.</span>
                <span><strong>Phasing plan for occupied buildings.</strong> If the building must stay open during construction, define daily re-sealing requirements and temporary weatherproofing protocol.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">12.</span>
                <span><strong>Hazardous material (HAZ-MAT) status confirmed.</strong> Asbestos-containing materials in older BUR systems must be tested before removal. State whether testing is your scope, the owner&apos;s, or an abatement sub&apos;s.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">13.</span>
                <span><strong>Existing flashings — remove or retain.</strong> Are all perimeter metal, curb flashings, and counterflashings being removed? Or are any existing metal components to be retained and worked around?</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">14.</span>
                <span><strong>Deck repair allowance stated.</strong> Include a dollar or square-foot allowance for deck repairs (e.g., &ldquo;Includes $3,500 allowance for steel deck repair; additional repairs billed at $18/SF&rdquo;).</span>
              </li>
            </ul>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Category 3: Substrate & Insulation (Items 15–20)</h3>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">15.</span>
                <span><strong>Insulation type and thickness specified.</strong> State the exact product (e.g., &ldquo;2.5-inch polyiso, 2-inch polyiso&rdquo;) and the total R-value the system achieves.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">16.</span>
                <span><strong>Insulation attachment method defined.</strong> Mechanically fastened, adhesive-set, or hot-mopped? Fastener pattern must match FM/UL wind uplift requirements for the project location.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">17.</span>
                <span><strong>Cover board included or excluded.</strong> 1/2-inch or 5/8-inch gypsum or HD polyiso cover board is now standard under mechanically fastened TPO/PVC — confirm whether it is in your number.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">18.</span>
                <span><strong>Tapered insulation / crickets designed.</strong> If tapered insulation is required to improve drainage, confirm whether the taper design is provided by the architect or by your company, and whether it is included in the price.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">19.</span>
                <span><strong>Air/vapor barrier requirements addressed.</strong> Some specifications require a vapor retarder above the deck or between insulation layers in cold-climate applications. Confirm it is priced.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">20.</span>
                <span><strong>Code-compliant R-value confirmed.</strong> IECC 2021 requires minimum R-30 in most climate zones for commercial roofs. Verify your insulation assembly meets or exceeds the requirement for this project location.</span>
              </li>
            </ul>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Category 4: Membrane / Roofing System (Items 21–25)</h3>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">21.</span>
                <span><strong>Membrane type, thickness, and color specified.</strong> &ldquo;60-mil TPO, heat-welded, white&rdquo; is a scope item. &ldquo;Single-ply roofing&rdquo; is not.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">22.</span>
                <span><strong>Manufacturer and product name listed.</strong> Firestone, GAF, Carlisle, Sika — the named manufacturer matters for warranty and substitution purposes.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">23.</span>
                <span><strong>Attachment method matches wind zone requirements.</strong> Mechanically fastened, fully adhered, or ballasted — and does the pattern satisfy the project&apos;s required FM or UL wind uplift rating?</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">24.</span>
                <span><strong>Field seam width and welding method specified.</strong> For TPO/PVC, minimum 1.5-inch seam width, hot-air welded. For EPDM, tape-seamed or heat-welded? These details affect labor hours significantly.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">25.</span>
                <span><strong>All penetration pockets and flashings included in membrane scope.</strong> Confirm that pipe penetrations, duct penetrations, and equipment supports are detailed with pourable sealer or prefabricated boots as appropriate.</span>
              </li>
            </ul>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Category 5: Accessories (Items 26–29)</h3>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">26.</span>
                <span><strong>Walkway pads included or excluded.</strong> If the spec or owner requires walkway protection at RTU access paths, confirm the linear footage is in your count and the pad type is specified (membrane or rubber).</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">27.</span>
                <span><strong>Pipe boots and penetration accessories counted.</strong> Walk the roof and count every penetration. A 100-square commercial roof often has 40–80 individual pipe penetrations — at $45–$90 each, this is a meaningful line item.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">28.</span>
                <span><strong>Expansion joint covers specified.</strong> Are existing joint covers being replaced or reclaimed? Pre-formed PVC or custom-fabricated sheet metal? Manufacturer and product should be named.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">29.</span>
                <span><strong>Roof drains — scope of replacement defined.</strong> New drain bowls, clamping rings, and strainers — or just the membrane collar? Confirm who handles interior drain piping if needed.</span>
              </li>
            </ul>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Category 6: Flashing & Terminations (Items 30–33)</h3>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">30.</span>
                <span><strong>Perimeter edge metal type and gauge specified.</strong> Drip edge, gravel stop, or fascia system? Minimum 24-gauge galvanized or G90? Paint finish? Linear footage counted?</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">31.</span>
                <span><strong>Curb flashing height meets code.</strong> NRCA and most specs require a minimum 8-inch flashing height above finished roof surface. Confirm your curb flashings achieve this before you price them.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">32.</span>
                <span><strong>Counterflashing — your scope or owner&apos;s.</strong> Reglet-set counterflashing into masonry walls is frequently a separate trade. Explicitly state whether it is in your scope or excluded.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">33.</span>
                <span><strong>Coping cap and parapet work defined.</strong> Is the coping replaced, resealed, or left as-is? Who provides the cap — sheet metal sub or roofing contractor? This is a common gap item.</span>
              </li>
            </ul>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Category 7: Warranty (Items 34–36)</h3>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">34.</span>
                <span><strong>Manufacturer warranty type and term specified.</strong> NDL (No-Dollar-Limit) 20-year, material-only 15-year, or labor-and-material? The warranty tier drives manufacturer requirements on insulation attachment density, cover board, and inspection.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">35.</span>
                <span><strong>Contractor workmanship warranty term stated.</strong> Two years is standard for commercial roofing. If you are offering more, confirm your insurance covers it.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">36.</span>
                <span><strong>Pre-warranty inspection included.</strong> Most manufacturer NDL warranties require a final inspection by a manufacturer&apos;s technical representative. Confirm who schedules and pays for it.</span>
              </li>
            </ul>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Category 8: Cleanup & Closeout (Items 37–40)</h3>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">37.</span>
                <span><strong>Daily debris removal protocol defined.</strong> Who sweeps the roof, the ground, and the parking areas daily? For occupied buildings, debris on loading docks and drive lanes is a safety and liability issue.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">38.</span>
                <span><strong>Final roof cleaning included.</strong> New TPO and PVC roofs often need cleaning before manufacturer inspection. Include in scope or note as excluded.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">39.</span>
                <span><strong>As-built documentation and close-out package.</strong> Some GC contracts require marked-up drawings showing actual drain locations, curb locations, and splice/seam locations. Confirm whether this is required and whether you are providing it.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">40.</span>
                <span><strong>Lien waiver and final inspection sign-off procedure confirmed.</strong> Know the GC&apos;s process for final payment before you mobilize. Some GCs require an owner walk before releasing retainage.</span>
              </li>
            </ul>
          </div>

          <h2 id="what-to-exclude" className="text-3xl font-bold text-gray-900 mb-4 mt-12">What to Explicitly Exclude</h2>
          <p className="text-gray-700 mb-6">
            Writing exclusions is not about being difficult — it&apos;s about being precise. Every exclusion you write protects you from being held responsible for work you did not price. Here are the exclusions that appear most often in commercial roofing disputes:
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-5">
              <p className="font-semibold text-gray-900 mb-1">Structural repairs to the building deck</p>
              <p className="text-gray-700 text-sm">State clearly: &ldquo;Structural repair of steel deck, joists, or concrete substrate is excluded. Scope of work is limited to roofing assembly only.&rdquo;</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-5">
              <p className="font-semibold text-gray-900 mb-1">HVAC mechanical work</p>
              <p className="text-gray-700 text-sm">Curb extensions, equipment reconnections, refrigerant line repairs, and electrical connections to RTUs are mechanical trade work, not roofing. Exclude explicitly.</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-5">
              <p className="font-semibold text-gray-900 mb-1">Plumbing and interior drain work</p>
              <p className="text-gray-700 text-sm">Your drain scope ends at the bowl and clamping ring. Interior piping, trap primers, and leader connections are plumbing.</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-5">
              <p className="font-semibold text-gray-900 mb-1">Asbestos or hazardous material abatement</p>
              <p className="text-gray-700 text-sm">If any HAZ-MAT is discovered or suspected, work stops and abatement is by others. Include this language even if testing shows clean results.</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-5">
              <p className="font-semibold text-gray-900 mb-1">Wet or deteriorated insulation beyond the allowance</p>
              <p className="text-gray-700 text-sm">If your allowance is $5,000 for wet insulation replacement, state that work beyond the allowance will be a change order at $X per square foot.</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-5">
              <p className="font-semibold text-gray-900 mb-1">Permits and inspections</p>
              <p className="text-gray-700 text-sm">In many markets, the GC pulls the building permit. Confirm who is responsible and state your position clearly. Inspection costs can run $500–$3,000 depending on the jurisdiction and project size.</p>
            </div>
          </div>

          <h2 id="scope-gaps" className="text-3xl font-bold text-gray-900 mb-4 mt-12">Common Scope Gaps That Cause Change Orders</h2>
          <p className="text-gray-700 mb-6">
            These are the gray-area items that experienced estimators learn about the hard way. Read each one carefully — every item on this list has cost a roofing contractor real money.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Curb Height vs. Flashing Height</h3>
          <p className="text-gray-700 mb-6">
            If existing RTU curbs are only 4 inches above the existing roof surface and you are adding 2 inches of new insulation, the curb will be substandard after re-roofing. Who pays to raise the curbs? The gap between &ldquo;flash the curbs&rdquo; and &ldquo;raise and flash the curbs&rdquo; can be $600–$1,200 per unit on a building with 20 RTUs.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Tapered Insulation at Drains</h3>
          <p className="text-gray-700 mb-6">
            When you add insulation thickness to a roof, the new surface sits higher than the existing drain bowls. Someone has to provide tapered insulation or sump pans at each drain to maintain positive drainage. This item is often priced by neither the roofing sub nor the plumbing sub — it falls through the gap entirely and becomes a field change order.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Interior Damage from Roof Leaks</h3>
          <p className="text-gray-700 mb-6">
            Pre-existing interior water damage — stained ceilings, wet insulation above finished ceilings, mold — is not a roofing contractor&apos;s repair obligation unless your contract says so. Include a blanket exclusion: &ldquo;Interior repairs, remediation, or restoration resulting from pre-existing or pre-construction moisture conditions are excluded from this scope.&rdquo;
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Overtime and Accelerated Schedule</h3>
          <p className="text-gray-700 mb-6">
            If a GC compresses the roofing window — say, from six weeks to three weeks — that requires additional crew, overtime, and potentially premium material delivery. Your scope should state your schedule assumptions (e.g., &ldquo;Scope priced for 5-day work week, single shift&rdquo;) so that acceleration costs can be identified and charged separately.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Parapet Wall Waterproofing</h3>
          <p className="text-gray-700 mb-6">
            The face of a parapet wall is not a roofing surface — but water that enters through a failing parapet cap will show up as a roof leak. Many GCs assume the roofing contractor is handling all exterior water intrusion. Your scope should specifically address how far up the parapet face your membrane terminates and whether the parapet cap and face are in scope or excluded.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 my-8">
            <p className="text-gray-800 font-semibold mb-2">Pro Tip: The Scope Review Rule</p>
            <p className="text-gray-700">
              Before every bid submission, have someone who did NOT write the estimate read the scope of work cold. Ask them: &ldquo;What would you assume is included that we haven&apos;t explicitly addressed?&rdquo; Their answer is your list of clarifications to add before you send the bid.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-8 mt-12 mb-12">
          <h3 className="text-2xl font-bold mb-3">Stop Losing Money to Scope Gaps</h3>
          <p className="text-green-100 mb-6 text-lg">
            BidShield&apos;s 18-phase pre-submission checklist walks you through scope of work, takeoff, pricing, and exclusions before every bid — so you catch the gaps before the GC does.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Start Your Free BidShield Trial →
          </Link>
          <p className="text-sm text-green-200 mt-3">No credit card required. Set up in under 5 minutes.</p>
        </div>

        {/* Related Posts */}
        <div className="border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/blog/roofing-takeoff-mistakes" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                7 Roofing Takeoff Mistakes That Cost Estimators Money
              </h4>
              <p className="text-gray-600 text-sm">The most expensive takeoff errors in commercial roofing — and how to avoid them.</p>
            </Link>
            <Link href="/blog/commercial-roofing-estimate-template" className="group block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Commercial Roofing Estimate Template: What Every Bid Must Include
              </h4>
              <p className="text-gray-600 text-sm">Structure your estimates professionally with this complete template guide.</p>
            </Link>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-semibold">Share this article:</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Twitter
            </button>
            <button className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
              LinkedIn
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Email
            </button>
          </div>
        </div>

        {/* Comments Placeholder */}
        <div className="border-t border-gray-200 pt-12 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Comments are coming soon! For now, share your questions in our community.</p>
            <Link href="/membership" className="inline-block mt-4 text-blue-600 font-semibold hover:text-blue-700">
              Join MC2 Pro Community →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

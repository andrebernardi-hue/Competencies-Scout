/**
 * Competency descriptions for the insights drawer.
 * Keys must match the Skill column in competencies.csv exactly.
 * Update this file to change or add descriptions.
 *
 * @type {Record<string, string>}
 */
export const competencyDescriptions = {
  'Business Acumen and Strategic Alignment':
    'A design leader prioritizes and champions the needs of the business alongside client outcomes. They actively pursue strategic understanding of both TELUS Digital and client objectives, translating that understanding into informed design decisions. They make tradeoffs explicit, articulate value propositions clearly, and connect design execution to revenue, growth, and long term account health. They implement company policy with empathy while holding accountability for performance and delivery. Leadership in this competency means consistently aligning design direction to business priorities and guiding others to understand how their work contributes to strategic goals.',

  'Consultative Excellence and Client Partnership':
    'A design leader operates as a trusted advisor, not a vendor. They combine craft mastery with business insight to make clients more successful. They build relationships grounded in expertise, credibility, and outcomes, and they influence both directly and indirectly across engagements. Leadership here means shaping consultative behaviors across the practice, modeling advisory excellence, and elevating how design partners with clients. The leader ensures design is positioned as a strategic capability that informs decisions, not just executes them.',

  'Business Development and Account Growth':
    'A design leader identifies and activates growth opportunities within and beyond existing scopes of work. They push beyond delivery of contracted outputs to articulate future state visions that unlock new business. They develop clear execution plans, socialize them internally, and deploy teams effectively to capture opportunity. They communicate tradeoffs, risks, and impact in business terms and craft compelling narratives that resonate with executive stakeholders. Leadership in this competency means expanding accounts through strategic design thinking and ensuring growth efforts are intentional, structured, and outcome oriented.',

  'Practice Evolution and Discipline Advancement':
    'A design leader owns the evolution of the discipline. They question institutional assumptions, improve ways of working, and advance craft and technology standards. They influence role definitions and responsibilities as the market matures. They articulate the value of design leadership within client engagements and within the organization. Leadership in this area requires challenging the status quo, introducing new paradigms, and ensuring the practice continuously adapts to market shifts while maintaining clarity of purpose and excellence.',

  'Design Craft Mastery and Delivery Excellence':
    'A design leader owns the quality bar end to end. They execute or direct best in class UX and UI, lead concept development, and drive compelling storytelling that connects user needs to business outcomes. They ensure design work holds up against industry best practices and delivers measurable impact. They provide guidance across the entire design lifecycle and create the conditions for teams to consistently ship high quality work. Leadership here means setting the standard for excellence and ensuring every engagement reflects it.',

  'Client Influence and Strategic Leadership':
    'A design leader leverages business acumen and narrative clarity to influence decision making at all levels. They take ownership of design direction within accounts, drive product vision, and align cross functional partners around shared outcomes. They build confidence with executive stakeholders and translate complex design decisions into clear business implications. Leadership in this competency means shaping client strategy, not reacting to it, and ensuring design is central to transformative value.',

  'Design Project Management and Team Coordination':
    'A design leader creates structure that enables teams to deliver. They establish clear frameworks for collaboration, define roles and expectations, and ensure alignment across design, product, and engineering. They own delivery conditions, not just output, and remove ambiguity that slows teams down. Leadership here means ensuring operational clarity so design teams can focus on high impact work while maintaining accountability for timelines and outcomes.',

  'Client Relationship Building and Trust Development':
    'A design leader builds durable trust through reliability, consultative expertise, and consistent excellence. They expand influence across stakeholder groups and grow accounts through advisory relationships. Trust is built through clarity, delivery, and strategic foresight. Leadership in this area means sustaining long term partnerships that translate into repeat business and expanded scope, grounded in demonstrated value.',

  'Excellence Cultivation and Team Development':
    'A design leader defines, demonstrates, and defends a high standard of craft, collaboration, and communication. They engage in and facilitate critical discourse to raise the quality of thinking and output. They set clear expectations, provide direct feedback, and position individuals and teams for success. Leadership in this competency means multiplying excellence through mentorship, guidance, and deliberate capability building, not relying solely on personal performance.',

  'Cross-Functional Leadership and Team Management':
    'A design leader bridges disciplines and aligns teams around shared outcomes. They evangelize the essential role of design in product success and create systems that enable effective collaboration. Where responsible for people management, they proactively manage performance, coach growth, and address underperformance. Even without formal authority, they influence cross functional systems and behaviors. Leadership here means ensuring alignment, clarity, and accountability across roles and disciplines.',

  'Psychological Safety and Innovation Culture':
    'A design leader fosters environments of candor and calculated risk. They encourage open dialogue, constructive critique, and healthy idea conflict in service of better outcomes. They treat failure as a learning mechanism and model comfort with uncertainty. Leadership in this competency means creating conditions where teams can challenge assumptions, push boundaries, and innovate responsibly without losing focus on business results.',

  'Practice Leadership and Continuous Improvement':
    'A design leader champions continuous improvement. They lead critiques, workshops, and upskilling initiatives. They promote adoption of best practices, new processes, and emerging paradigms. They demand excellence while equipping teams to reach it. Leadership here means acting as a change agent who ensures the discipline evolves deliberately and sustainably.',

  'Craft Excellence and Innovation Leadership':
    'A design leader pioneers advancements in core craft and technology. They evaluate and implement emerging tools and methodologies to keep the practice competitive. They balance usability, innovation, and execution quality while embracing uncertainty with curiosity. Leadership in this competency means not only advancing personal expertise but elevating the broader organization through education and implementation of forward looking capabilities.',

  'Thought Leadership and Industry Influence':
    'A design leader actively synthesizes trends, research, and emerging technologies into actionable insight. They communicate the measurable impact of design decisions through compelling narratives that resonate with clients and the market. They establish credibility externally and internally by demonstrating strategic thinking and outcome driven design. Leadership in this area means shaping perception of the practice as an authority and ensuring relevance in a rapidly evolving landscape.',
};

/**
 * Get the description for a competency (skill name). Keys match the Skill column in competencies.csv.
 * @param {string} skillName - Exact skill name as in the data
 * @returns {string | undefined}
 */
export function getCompetencyDescription(skillName) {
  return competencyDescriptions[skillName?.trim() ?? ''];
}

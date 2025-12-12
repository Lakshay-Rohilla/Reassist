/**
 * Mock research data and simulation functions
 * Provides realistic sample data for demonstration purposes
 */

import { ResearchReport, ProgressUpdate, Source } from './types';

/** Progress messages for research simulation */
export const progressMessages: Array<{ message: string; type: ProgressUpdate['type'] }> = [
    { message: 'Analyzing research question and formulating strategy...', type: 'info' },
    { message: 'Searching academic databases and industry reports...', type: 'search' },
    { message: 'Querying news sources and market research platforms...', type: 'search' },
    { message: 'Analyzing article from MIT Technology Review...', type: 'analyze' },
    { message: 'Processing data from Bloomberg Intelligence...', type: 'analyze' },
    { message: 'Extracting insights from industry white papers...', type: 'analyze' },
    { message: 'Cross-referencing findings across multiple sources...', type: 'analyze' },
    { message: 'Identifying key trends and patterns...', type: 'synthesize' },
    { message: 'Validating information accuracy and recency...', type: 'synthesize' },
    { message: 'Synthesizing insights into comprehensive report...', type: 'synthesize' },
    { message: 'Generating executive summary and recommendations...', type: 'synthesize' },
];

/** Sample research report: EV Battery Technology */
const evBatteryReport: ResearchReport = {
    id: 'report-ev-battery-2024',
    question: 'What are the emerging trends in electric vehicle battery technology?',
    executiveSummary: `The electric vehicle battery landscape is undergoing rapid transformation, with solid-state batteries emerging as the most promising next-generation technology. Major manufacturers including Toyota, Samsung SDI, and QuantumScape are racing to commercialize solid-state solutions by 2026-2028, promising 2-3x energy density improvements and significantly faster charging times.

Current lithium-ion technology continues to evolve, with CATL and BYD leading innovations in lithium iron phosphate (LFP) chemistry that offers improved safety and lower costs at the expense of some energy density. The industry is witnessing a strategic bifurcation: premium vehicles favor high-nickel NMC chemistries for maximum range, while mass-market EVs increasingly adopt LFP for cost optimization.

Battery recycling infrastructure is scaling rapidly, with companies like Redwood Materials and Li-Cycle achieving 95%+ recovery rates for critical minerals. This closed-loop approach is becoming essential as regulations tighten and raw material costs remain volatile. Industry analysts project the global EV battery market will exceed $400 billion by 2030, with Asian manufacturers maintaining dominant market share.`,
    sections: [
        {
            id: 'section-1',
            title: 'Solid-State Battery Development',
            content: `Solid-state batteries represent the most significant technological leap in EV battery development. Unlike conventional lithium-ion batteries that use liquid electrolytes, solid-state designs employ solid electrolytes that enable higher energy density, improved safety, and faster charging capabilities.[1]

Toyota has announced plans to introduce solid-state batteries in their EVs by 2027, claiming range improvements of up to 1,200 kilometers on a single charge.[2] The company has invested over $13.5 billion in battery technology development. QuantumScape, backed by Volkswagen, has demonstrated solid-state cells achieving 800+ charge cycles with less than 20% capacity degradation.[3]

Samsung SDI is pursuing a differentiated approach with sulfide-based solid electrolytes, targeting commercial production by 2027. Their prototypes have shown energy densities exceeding 900 Wh/L, compared to approximately 600-700 Wh/L for current lithium-ion cells.[4]

Key challenges remain in manufacturing scalability and cost reduction. Current solid-state production costs are estimated at 3-5x conventional lithium-ion, though industry projections suggest cost parity could be achieved by 2030 with sufficient production scale.[5]`,
            citations: [1, 2, 3, 4, 5]
        },
        {
            id: 'section-2',
            title: 'Lithium-Ion Chemistry Evolution',
            content: `The established lithium-ion market is experiencing significant chemistry diversification. High-nickel NMC (Nickel-Manganese-Cobalt) cathodes, particularly NMC 811 and NCMA formulations, are becoming standard in premium EV segments, offering energy densities of 250-300 Wh/kg.[6]

CATL's Qilin battery platform represents the current state-of-the-art in cell-to-pack integration, achieving 255 Wh/kg pack-level energy density and enabling 1,000km range in vehicles like the Zeekr 001.[7] The company's Shenxing LFP battery claims 400km of range from a 10-minute charge.

BYD's Blade Battery has popularized LFP chemistry for its superior thermal stability and cycle life. Despite 10-15% lower energy density compared to NMC alternatives, LFP batteries now represent over 40% of the Chinese EV battery market.[8] Tesla has adopted LFP for standard-range Model 3 and Model Y vehicles produced at Gigafactory Shanghai.

Silicon-dominant anodes are emerging as a near-term enhancement, with companies like Sila Nanotechnologies and Group14 Technologies achieving commercial partnerships with Mercedes-Benz and Porsche respectively.[9]`,
            citations: [6, 7, 8, 9]
        },
        {
            id: 'section-3',
            title: 'Charging Infrastructure and Fast-Charging Advances',
            content: `Ultra-fast charging technology has advanced significantly, with 800V architecture becoming standard in new EV platforms. This higher voltage enables charging rates exceeding 350 kW, allowing 10-80% charge in under 20 minutes for compatible vehicles.[10]

Hyundai's E-GMP platform, Porsche's PPE, and GM's Ultium demonstrate the industry's broad adoption of 800V systems. Tesla is transitioning its Supercharger network to support higher power outputs, with V4 Superchargers delivering up to 350 kW.[11]

Battery thermal management innovations are critical enablers for sustained fast charging. Immersive cooling systems and advanced battery management software (BMS) allow cells to accept higher charge rates without degradation. CATL claims their latest cells can maintain optimal temperature across 4C charging rates (0-80% in 15 minutes).[7]

Wireless charging and battery swapping represent alternative approaches gaining traction in specific markets. NIO has deployed over 2,000 battery swap stations across China, completing swaps in under 5 minutes.[12]`,
            citations: [7, 10, 11, 12]
        },
        {
            id: 'section-4',
            title: 'Recycling and Sustainability',
            content: `Battery recycling has evolved from an environmental consideration to a strategic imperative. With critical mineral prices remaining volatile and new regulations mandating recycled content, closed-loop battery production is gaining momentum.[13]

Redwood Materials, founded by former Tesla CTO JB Straubel, has established the largest battery recycling operation in North America. The company processes end-of-life batteries and manufacturing scrap, achieving 95%+ recovery rates for lithium, cobalt, nickel, and copper.[14] Their cathode active material facility in Nevada aims to supply materials for 1 million EVs annually by 2025.

The European Union's Battery Regulation mandates minimum recycled content thresholds starting in 2031: 16% cobalt, 6% lithium, and 6% nickel. These requirements are driving significant investment in European recycling infrastructure.[15]

Li-Cycle and Ascend Elements are scaling hydrometallurgical recycling processes that offer higher purity outputs compared to traditional pyrometallurgical methods. These approaches are particularly effective for LFP batteries, which have historically been challenging to recycle economically.[16]`,
            citations: [13, 14, 15, 16]
        }
    ],
    knowledgeGaps: [
        'Limited public data on actual solid-state battery production costs and manufacturing yields from major manufacturers',
        'Insufficient long-term degradation data for new high-silicon anode formulations under real-world conditions',
        'Unclear timeline for sodium-ion battery adoption in Western markets despite significant Chinese development',
        'Limited transparency on rare earth sourcing and environmental impact across the full supply chain'
    ],
    sources: [
        { id: 1, title: 'Solid-State Batteries: From Lab to Commercial Reality', url: 'https://www.nature.com/articles/s41578-024-00689-2', publishedDate: '2024-03-15', author: 'Chen et al.', type: 'paper' },
        { id: 2, title: 'Toyota Accelerates Solid-State Battery Timeline', url: 'https://www.reuters.com/business/autos-transportation/toyota-solid-state-ev-batteries-2024', publishedDate: '2024-06-12', type: 'news' },
        { id: 3, title: 'QuantumScape Reports Strong Cycle Life Performance', url: 'https://www.quantumscape.com/resources/blog/2024-cell-testing-results', publishedDate: '2024-04-22', type: 'company' },
        { id: 4, title: 'Samsung SDI Next-Generation Battery Roadmap', url: 'https://www.samsungsdi.com/technology/battery-roadmap-2024', publishedDate: '2024-02-08', type: 'company' },
        { id: 5, title: 'Solid-State Battery Cost Analysis and Projections', url: 'https://www.mckinsey.com/industries/automotive/solid-state-batteries-costs', publishedDate: '2024-01-30', author: 'McKinsey & Company', type: 'report' },
        { id: 6, title: 'High-Nickel Cathode Materials for Next-Gen EVs', url: 'https://www.sciencedirect.com/science/article/pii/S2542435124001X', publishedDate: '2024-02-20', author: 'Kim et al.', type: 'paper' },
        { id: 7, title: 'CATL Qilin Battery Technical Specifications', url: 'https://www.catl.com/en/products/qilin-battery', publishedDate: '2024-05-10', type: 'company' },
        { id: 8, title: 'LFP Battery Market Share Trends in China', url: 'https://www.bloomberg.com/news/articles/2024-04-15/lfp-batteries-china-market-dominance', publishedDate: '2024-04-15', type: 'news' },
        { id: 9, title: 'Silicon Anode Commercialization Update', url: 'https://www.technologyreview.com/2024/03/28/silicon-anode-batteries-ev', publishedDate: '2024-03-28', type: 'article' },
        { id: 10, title: '800V EV Architecture Analysis', url: 'https://www.mckinsey.com/industries/automotive/800v-ev-platforms', publishedDate: '2024-01-15', author: 'McKinsey & Company', type: 'report' },
        { id: 11, title: 'Tesla Supercharger V4 Deployment Update', url: 'https://electrek.co/2024/05/20/tesla-supercharger-v4-expansion', publishedDate: '2024-05-20', type: 'news' },
        { id: 12, title: 'NIO Battery Swap Network Expansion', url: 'https://www.nio.com/news/battery-swap-2000-stations', publishedDate: '2024-04-01', type: 'company' },
        { id: 13, title: 'EV Battery Recycling: Market Dynamics and Regulations', url: 'https://www.iea.org/reports/battery-recycling-2024', publishedDate: '2024-03-01', author: 'International Energy Agency', type: 'report' },
        { id: 14, title: 'Redwood Materials Cathode Facility Announcement', url: 'https://www.redwoodmaterials.com/news/nevada-cathode-expansion', publishedDate: '2024-02-28', type: 'company' },
        { id: 15, title: 'EU Battery Regulation Implementation Guide', url: 'https://environment.ec.europa.eu/topics/waste-recycling/batteries_en', publishedDate: '2024-01-01', type: 'report' },
        { id: 16, title: 'Hydrometallurgical Battery Recycling Advances', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.3c07892', publishedDate: '2024-02-14', author: 'Wang et al.', type: 'paper' }
    ],
    generatedAt: new Date(),
    researchDuration: 47
};

/** Sample research report: AI in Drug Discovery */
const aiDrugDiscoveryReport: ResearchReport = {
    id: 'report-ai-drug-discovery-2024',
    question: 'How is artificial intelligence being applied in drug discovery?',
    executiveSummary: `Artificial intelligence is fundamentally reshaping pharmaceutical research and development, with the technology now integral to every stage of the drug discovery pipeline. The most significant breakthroughs have occurred in molecular screening and protein structure prediction, where AI enables analysis of billions of compounds in timeframes that were previously impossible.

DeepMind's AlphaFold has revolutionized structural biology by accurately predicting protein structures for nearly all catalogued proteins. This capability has accelerated target identification and enabled rational drug design approaches that previously required years of experimental work. Pharmaceutical giants including Pfizer, Novartis, and Roche have established dedicated AI divisions and partnerships with technology companies.

The clinical trial optimization segment is emerging as a high-impact application area. AI systems are improving patient recruitment, predicting trial outcomes, and enabling adaptive trial designs that reduce development timelines by 25-40%. Insilico Medicine achieved a notable milestone with their AI-discovered drug INS018_055, which completed Phase 1 trials in under 18 months from initial target identification.

Despite impressive progress, significant challenges persist in data quality, model interpretability, and regulatory acceptance. The FDA has approved only a handful of AI-developed drugs, and industry experts emphasize that AI augments rather than replaces traditional pharmaceutical expertise.`,
    sections: [
        {
            id: 'section-1',
            title: 'Molecular Screening and Lead Optimization',
            content: `AI-powered virtual screening has transformed early-stage drug discovery by enabling rapid evaluation of vast chemical libraries. Traditional high-throughput screening examines millions of compounds over months; AI systems can evaluate billions of virtual molecules in days.[1]

Atomwise's AtomNet platform uses deep learning to predict protein-ligand binding affinity, having screened over 100 billion compounds across 750+ projects since inception. The company reports a 10,000-fold improvement in hit rates compared to traditional screening methods.[2]

Recursion Pharmaceuticals has built one of the world's largest proprietary datasets of cellular images, using computer vision to identify drug candidates. Their platform generates petabytes of biological data weekly, enabling phenotypic screening at unprecedented scale.[3]

Generative AI models are increasingly used for de novo molecular design. Companies like Exscientia and Insilico Medicine employ reinforcement learning and generative adversarial networks to design novel compounds with desired properties, reducing lead optimization cycles from years to months.[4]`,
            citations: [1, 2, 3, 4]
        },
        {
            id: 'section-2',
            title: 'Protein Structure Prediction Revolution',
            content: `AlphaFold 2's release in 2020 marked a watershed moment for structural biology and drug discovery. The system predicts protein structures with accuracy comparable to experimental methods, providing structural data for proteins that had resisted crystallographic analysis for decades.[5]

The AlphaFold Protein Structure Database now contains predicted structures for over 200 million proteins—essentially all known protein sequences. This resource has been accessed by over 1 million researchers worldwide and has enabled new approaches to target identification and drug design.[6]

RoseTTAFold, developed at the University of Washington, offers complementary capabilities with the added ability to predict protein-protein interactions. This functionality is crucial for understanding disease mechanisms and designing drugs that modulate protein complexes.[7]

Structure-based drug design has accelerated dramatically with these tools. Researchers can now rapidly model binding sites, predict the effects of mutations, and design molecules optimized for specific targets without waiting months for experimental structural data.[8]`,
            citations: [5, 6, 7, 8]
        },
        {
            id: 'section-3',
            title: 'Clinical Trial Optimization',
            content: `AI is addressing critical inefficiencies in clinical development, where 90% of drug candidates fail and trials cost an average of $2.6 billion per approved drug. Machine learning applications span patient recruitment, trial design, and outcome prediction.[9]

Unlearn.AI has pioneered the use of "digital twins"—synthetic patient data generated from historical clinical records—to reduce control group sizes in trials. This approach has received FDA acceptance for use in multiple therapeutic areas, potentially reducing trial costs by 20-30%.[10]

Natural language processing systems are accelerating patient recruitment by mining electronic health records to identify eligible participants. Tempus reports their platform can reduce recruitment timelines by 30-50% for oncology trials by matching patients to studies based on comprehensive genomic and clinical profiles.[11]

Predictive models are increasingly used for adaptive trial designs, allowing real-time protocol modifications based on emerging data. This flexibility can recover failing trials or accelerate successful ones, with some studies showing 25-40% reductions in development timelines.[12]`,
            citations: [9, 10, 11, 12]
        },
        {
            id: 'section-4',
            title: 'Notable AI-Discovered Drugs in Development',
            content: `Several AI-discovered drugs have advanced to human clinical trials, providing early validation for the technology. Insilico Medicine's INS018_055, a treatment for idiopathic pulmonary fibrosis, progressed from target identification to Phase 1 trials in under 18 months—approximately one-quarter of the typical timeline.[13]

Exscientia's EXS21546, an A2A receptor antagonist for oncology, became one of the first AI-designed molecules to enter human trials. The company claims 80% reduction in discovery timelines for their candidates.[14]

Schrödinger and Bristol Myers Squibb's collaboration produced a target identification for a novel cancer therapy in 5 weeks versus an estimated 2.5 years using traditional methods. The resulting drug candidate has entered Phase 1 trials.[15]

AbCellera's AI antibody discovery platform contributed to the rapid development of bamlanivimab, one of the first monoclonal antibody treatments for COVID-19, which received FDA Emergency Use Authorization in November 2020.[16]`,
            citations: [13, 14, 15, 16]
        }
    ],
    knowledgeGaps: [
        'Limited long-term data on clinical success rates for AI-discovered drugs versus traditional approaches',
        'Uncertainty around regulatory frameworks for AI-driven drug development across different jurisdictions',
        'Insufficient transparency in AI model validation and reproducibility across industry publications',
        'Limited understanding of how AI predictions perform for novel protein families outside training data'
    ],
    sources: [
        { id: 1, title: 'Machine Learning for Drug Discovery: State of the Art', url: 'https://www.nature.com/articles/s41573-024-00925-y', publishedDate: '2024-02-28', author: 'Vamathevan et al.', type: 'paper' },
        { id: 2, title: 'Atomwise AtomNet Platform Performance Analysis', url: 'https://www.atomwise.com/2024/platform-performance', publishedDate: '2024-03-15', type: 'company' },
        { id: 3, title: 'Recursion Pharmaceuticals Technology Overview', url: 'https://www.recursion.com/technology', publishedDate: '2024-01-20', type: 'company' },
        { id: 4, title: 'Generative AI for Molecular Design: A Review', url: 'https://pubs.acs.org/doi/10.1021/acs.jmedchem.3c02265', publishedDate: '2024-01-10', author: 'Schneider et al.', type: 'paper' },
        { id: 5, title: 'AlphaFold 2: Highly Accurate Protein Structure Prediction', url: 'https://www.nature.com/articles/s41586-021-03819-2', publishedDate: '2021-07-15', author: 'Jumper et al.', type: 'paper' },
        { id: 6, title: 'AlphaFold Protein Structure Database Reaches 200 Million Structures', url: 'https://deepmind.google/discover/blog/alphafold-reveals-the-structure-of-the-protein-universe', publishedDate: '2024-01-05', type: 'article' },
        { id: 7, title: 'RoseTTAFold: Accurate Protein Structure and Interaction Prediction', url: 'https://www.science.org/doi/10.1126/science.abj8754', publishedDate: '2021-08-20', author: 'Baek et al.', type: 'paper' },
        { id: 8, title: 'AI-Enabled Structure-Based Drug Design', url: 'https://www.sciencedirect.com/science/article/pii/S1359644624000771', publishedDate: '2024-03-01', author: 'Chen & Liu', type: 'paper' },
        { id: 9, title: 'Clinical Trial Costs and Success Rates 2024', url: 'https://www.bio.org/sites/default/files/2024-02/ClinicalTrials2024.pdf', publishedDate: '2024-02-15', author: 'Biotechnology Innovation Organization', type: 'report' },
        { id: 10, title: 'Unlearn.AI Digital Twin Technology for Clinical Trials', url: 'https://www.unlearn.ai/technology', publishedDate: '2024-04-01', type: 'company' },
        { id: 11, title: 'Tempus AI Platform Clinical Trial Matching', url: 'https://www.tempus.com/clinical-trials', publishedDate: '2024-03-10', type: 'company' },
        { id: 12, title: 'Adaptive Clinical Trial Designs: A Review', url: 'https://jamanetwork.com/journals/jama/article-abstract/2802156', publishedDate: '2024-02-01', type: 'paper' },
        { id: 13, title: 'Insilico Medicine INS018_055 Phase 1 Results', url: 'https://insilico.com/blog/ins018_055_phase1', publishedDate: '2024-04-20', type: 'company' },
        { id: 14, title: 'Exscientia EXS21546 Clinical Development Update', url: 'https://www.exscientia.ai/pipeline', publishedDate: '2024-05-01', type: 'company' },
        { id: 15, title: 'Schrödinger-BMS AI Drug Discovery Collaboration Results', url: 'https://www.schrodinger.com/news/bms-collaboration-milestone', publishedDate: '2024-03-28', type: 'company' },
        { id: 16, title: 'AbCellera COVID-19 Therapeutic Development Timeline', url: 'https://www.abcellera.com/covid-19', publishedDate: '2024-01-15', type: 'company' }
    ],
    generatedAt: new Date(),
    researchDuration: 52
};

/** Sample research report: Cloud Infrastructure Competitive Landscape */
const cloudInfrastructureReport: ResearchReport = {
    id: 'report-cloud-infrastructure-2024',
    question: 'What is the competitive landscape in cloud infrastructure services?',
    executiveSummary: `The cloud infrastructure market continues to be dominated by three hyperscalers—Amazon Web Services, Microsoft Azure, and Google Cloud—which collectively command approximately 65% of the $280 billion global market. AWS maintains leadership with 31% market share, though Microsoft Azure has closed the gap significantly, growing to 24% with particular strength in enterprise accounts leveraging existing Microsoft relationships.

The competitive dynamics are shifting from pure infrastructure provision toward value-added services, particularly in AI and machine learning. All major providers have launched or enhanced GPU-optimized instances for AI workloads, with NVIDIA's dominance in accelerator hardware creating both opportunities and dependencies across the industry.

Multi-cloud and hybrid strategies are becoming standard enterprise practice, driving demand for abstraction layers and container orchestration. Kubernetes has emerged as the de facto standard for workload portability, with all major providers offering managed Kubernetes services. Specialized cloud providers like Snowflake, Databricks, and MongoDB are carving significant niches by offering best-in-class solutions for specific use cases.

Pricing pressures are intensifying as commoditization of basic compute and storage accelerates. Providers are responding by pushing customers toward proprietary managed services with higher margins and switching costs. The industry is also preparing for significant regulatory scrutiny, with the EU Cloud Rulebook and increasing data sovereignty requirements reshaping competitive approaches in international markets.`,
    sections: [
        {
            id: 'section-1',
            title: 'Market Share and Financial Performance',
            content: `Amazon Web Services remains the market leader with approximately $100 billion in trailing twelve-month revenue and 31% market share. Growth has moderated to 12-15% annually as the business matures, though AWS continues to generate the majority of Amazon's operating profit.[1]

Microsoft Azure has emerged as AWS's primary challenger, reaching approximately $75 billion in annual run rate with 24% market share. Azure's growth rate exceeds AWS at 25-30% annually, driven by enterprise customers expanding cloud consumption alongside Microsoft 365 and Dynamics deployments.[2]

Google Cloud has achieved profitability for the first time, reaching approximately $35 billion in annual revenue with 11% market share. The company has focused on differentiated AI capabilities and sustainability, powering its data centers with 90%+ renewable energy.[3]

Alibaba Cloud dominates the Chinese market with over 35% share domestically, though its international expansion has slowed amid geopolitical tensions. Oracle and IBM maintain significant presence in regulated industries, while specialized providers like DigitalOcean and Vultr serve developer and SMB segments.[4]`,
            citations: [1, 2, 3, 4]
        },
        {
            id: 'section-2',
            title: 'AI and GPU Infrastructure Competition',
            content: `AI workloads have become the primary battleground for hyperscaler differentiation. NVIDIA H100 and A100 GPUs are in severe supply constraint, creating allocation challenges across all providers. AWS, Azure, and Google Cloud have all signed multi-year, multi-billion dollar commitments with NVIDIA to secure supply.[5]

AWS has responded to GPU constraints by developing custom silicon: Trainium chips for AI training and Inferentia for inference workloads. Early benchmarks suggest 50% cost savings compared to NVIDIA alternatives for compatible workloads, though ecosystem support remains limited.[6]

Google's TPU v5e chips offer competitive performance for specific AI frameworks, particularly TensorFlow. The company claims 3x cost-performance advantage over GPUs for large language model inference.[7]

Microsoft has taken a different approach, partnering with OpenAI and offering Azure OpenAI Service as a managed solution. This strategy provides access to frontier AI models without requiring customers to manage GPU infrastructure directly.[8]`,
            citations: [5, 6, 7, 8]
        },
        {
            id: 'section-3',
            title: 'Enterprise Adoption Patterns',
            content: `Multi-cloud strategies have become the norm for enterprise customers, with 87% of large organizations reporting use of multiple cloud providers. Primary motivations include avoiding vendor lock-in, leveraging best-of-breed services, and meeting regulatory requirements for data residency.[9]

Hybrid cloud deployments continue to grow, particularly in regulated industries. VMware Cloud, available on all three hyperscalers, enables consistent operations across on-premises and public cloud environments. AWS Outposts and Azure Stack extend native cloud services to customer data centers.[10]

Kubernetes has emerged as the standard abstraction layer for workload portability. All major providers offer managed Kubernetes services (EKS, AKS, GKE), though subtle differences in implementation can still create migration friction. Container adoption has reached 85% among enterprises surveyed by CNCF.[11]

Data gravity is increasingly determining cloud placement decisions. As organizations accumulate petabytes of data in specific clouds, the cost and latency of moving that data creates strong retention forces. Providers have responded with extensive egress fee policies that critics characterize as anti-competitive.[12]`,
            citations: [9, 10, 11, 12]
        },
        {
            id: 'section-4',
            title: 'Specialized Cloud Providers and Emerging Segments',
            content: `Beyond hyperscalers, a tier of specialized cloud platforms has achieved significant scale in focused domains. Snowflake, valued at over $50 billion, dominates cloud data warehousing with a consumption-based model that separates storage and compute.[13]

Databricks has built a comprehensive data lakehouse platform, combining data warehouse and data lake capabilities. The company reached $1.6 billion in annual recurring revenue with particular strength in AI/ML workloads. Their acquisition of MosaicML signals ambitions in the generative AI space.[14]

MongoDB's Atlas cloud database service represents over 65% of company revenue, growing 25%+ annually. The document database model appeals to modern application architectures, particularly microservices and mobile backends.[15]

Edge computing is emerging as a new competitive frontier. Providers including Cloudflare, Fastly, and hyperscaler edge offerings enable computation at points of presence closer to end users. This capability is particularly valuable for low-latency applications, content delivery, and IoT workloads.[16]`,
            citations: [13, 14, 15, 16]
        }
    ],
    knowledgeGaps: [
        'Limited visibility into actual enterprise cloud spending by provider due to confidential contract terms',
        'Incomplete data on true cost comparisons including egress fees and managed service pricing',
        'Uncertainty around impacts of AI supply constraints on cloud provider competitive positioning',
        'Limited transparency from Chinese cloud providers on international operations and growth'
    ],
    sources: [
        { id: 1, title: 'AWS Q2 2024 Earnings Analysis', url: 'https://www.amazon.com/ir/quarterly-results', publishedDate: '2024-07-30', type: 'company' },
        { id: 2, title: 'Microsoft Azure Growth Trends 2024', url: 'https://www.microsoft.com/investor/reports', publishedDate: '2024-07-25', type: 'company' },
        { id: 3, title: 'Google Cloud Profitability Achievement', url: 'https://abc.xyz/investor/quarterly-earnings', publishedDate: '2024-07-23', type: 'company' },
        { id: 4, title: 'Worldwide Cloud Infrastructure Market Share Q2 2024', url: 'https://www.srgresearch.com/articles/cloud-market-q2-2024', publishedDate: '2024-08-05', author: 'Synergy Research Group', type: 'report' },
        { id: 5, title: 'NVIDIA Data Center GPU Demand Analysis', url: 'https://www.bloomberg.com/news/articles/2024-06-12/nvidia-cloud-provider-commitments', publishedDate: '2024-06-12', type: 'news' },
        { id: 6, title: 'AWS Trainium Performance Benchmarks', url: 'https://aws.amazon.com/blogs/machine-learning/trainium-benchmark-results', publishedDate: '2024-05-20', type: 'company' },
        { id: 7, title: 'Google TPU v5e Performance Analysis', url: 'https://cloud.google.com/blog/products/ai-machine-learning/tpu-v5e-inference-performance', publishedDate: '2024-04-15', type: 'company' },
        { id: 8, title: 'Azure OpenAI Service Enterprise Adoption', url: 'https://azure.microsoft.com/blog/openai-service-adoption-trends', publishedDate: '2024-06-01', type: 'company' },
        { id: 9, title: 'State of Multi-Cloud 2024', url: 'https://www.flexera.com/blog/cloud/cloud-computing-trends-2024-state-of-the-cloud-report', publishedDate: '2024-03-15', author: 'Flexera', type: 'report' },
        { id: 10, title: 'Hybrid Cloud Adoption in Regulated Industries', url: 'https://www.gartner.com/en/documents/hybrid-cloud-regulated-industries-2024', publishedDate: '2024-04-10', author: 'Gartner', type: 'report' },
        { id: 11, title: 'CNCF Annual Survey 2024: Kubernetes Adoption', url: 'https://www.cncf.io/reports/cncf-annual-survey-2024', publishedDate: '2024-02-28', author: 'CNCF', type: 'report' },
        { id: 12, title: 'Cloud Egress Fee Analysis and Competition Concerns', url: 'https://www.cloudflare.com/bandwidth-alliance-egress-pricing', publishedDate: '2024-05-01', type: 'article' },
        { id: 13, title: 'Snowflake Investor Day Presentation 2024', url: 'https://investors.snowflake.com/investor-day-2024', publishedDate: '2024-06-20', type: 'company' },
        { id: 14, title: 'Databricks Valuation and AI Strategy', url: 'https://www.cnbc.com/2024/04/25/databricks-valuation-ai-strategy', publishedDate: '2024-04-25', type: 'news' },
        { id: 15, title: 'MongoDB Q2 2024 Financial Results', url: 'https://investors.mongodb.com/quarterly-results', publishedDate: '2024-08-29', type: 'company' },
        { id: 16, title: 'Edge Computing Market Growth Analysis', url: 'https://www.grandviewresearch.com/industry-analysis/edge-computing-market', publishedDate: '2024-03-01', author: 'Grand View Research', type: 'report' }
    ],
    generatedAt: new Date(),
    researchDuration: 43
};

/** All available sample reports indexed by question keywords */
export const sampleReports: Map<string, ResearchReport> = new Map([
    ['electric vehicle battery', evBatteryReport],
    ['ev battery', evBatteryReport],
    ['battery technology', evBatteryReport],
    ['artificial intelligence drug', aiDrugDiscoveryReport],
    ['ai drug discovery', aiDrugDiscoveryReport],
    ['drug discovery', aiDrugDiscoveryReport],
    ['pharmaceutical ai', aiDrugDiscoveryReport],
    ['cloud infrastructure', cloudInfrastructureReport],
    ['cloud computing', cloudInfrastructureReport],
    ['aws azure google cloud', cloudInfrastructureReport],
    ['competitive landscape cloud', cloudInfrastructureReport],
]);

/** Example questions to display in the UI */
export const exampleQuestions: string[] = [
    'What are the emerging trends in electric vehicle battery technology?',
    'How is artificial intelligence being applied in drug discovery?',
    'What is the competitive landscape in cloud infrastructure services?',
];

/**
 * Generate a dynamic report based on the question topic
 */
function generateDynamicReport(question: string): ResearchReport {
    // Generate a topic-aware executive summary
    const topicSummary = `This research explores the key aspects of "${question}". The analysis draws from multiple credible sources including academic papers, industry reports, and expert analyses to provide a comprehensive overview of the current state and emerging trends in this area.

Based on the available data, several important patterns and insights have emerged that are directly relevant to understanding this topic. The findings are organized into thematic sections covering the primary areas of interest, supported by citations from authoritative sources.

The research methodology involved systematic analysis of recent publications, cross-referencing of multiple data sources, and synthesis of expert perspectives. While this provides a solid foundation for understanding the topic, some knowledge gaps remain that may warrant further investigation.`;

    return {
        id: `report-dynamic-${Date.now()}`,
        question: question,
        executiveSummary: topicSummary,
        sections: [
            {
                id: 'section-1',
                title: 'Overview and Current State',
                content: `This section provides an overview of "${question}" based on the latest available research and analysis. The topic has garnered significant attention in recent studies, with researchers exploring various dimensions and implications.

Current understanding suggests that this area is evolving rapidly, with new developments and insights emerging regularly. Key stakeholders are actively engaged in advancing knowledge and practice in this domain.[1]

The analysis of existing literature and reports indicates several areas of consensus among experts, as well as some points of ongoing debate that merit further investigation.[2]`,
                citations: [1, 2]
            },
            {
                id: 'section-2',
                title: 'Key Trends and Developments',
                content: `Recent developments related to "${question}" reflect broader shifts in the field. Several notable trends have been identified through analysis of current research and industry reports.

Emerging patterns suggest growing interest and investment in this area, with stakeholders from various sectors contributing to the discourse. The pace of change appears to be accelerating, driven by technological, economic, and social factors.[3]

Experts anticipate continued evolution in the coming years, with potential implications for policy, practice, and research priorities.[4]`,
                citations: [3, 4]
            },
            {
                id: 'section-3',
                title: 'Challenges and Opportunities',
                content: `The research has identified several challenges associated with "${question}" that warrant attention. These include complex technical considerations, resource constraints, and the need for coordinated approaches among stakeholders.

At the same time, significant opportunities exist for advancement and innovation. Organizations and individuals actively engaged in this space have demonstrated various approaches to addressing challenges while capitalizing on emerging possibilities.[5]

Future progress will likely depend on continued research, collaboration, and adaptive strategies that respond to evolving conditions.[6]`,
                citations: [5, 6]
            },
            {
                id: 'section-4',
                title: 'Conclusions and Recommendations',
                content: `Based on the comprehensive analysis conducted for "${question}", several conclusions can be drawn. The evidence suggests that this is an area of active development with significant potential for impact.

Key recommendations for stakeholders include staying informed about emerging trends, engaging with relevant research and practice communities, and considering how developments in this area may affect their specific contexts.[7]

Continued monitoring of this topic is advisable, as the landscape is likely to evolve in response to new discoveries, technologies, and societal needs.[8]`,
                citations: [7, 8]
            }
        ],
        knowledgeGaps: [
            'Further research may be needed to fully understand all dimensions of this topic',
            'Some data sources may not reflect the most recent developments',
            'Regional variations and context-specific factors may not be fully captured',
            'Emerging trends may shift the landscape in ways not yet documented'
        ],
        sources: [
            { id: 1, title: 'Research Overview and Analysis', url: 'https://example.com/research-1', publishedDate: new Date().toISOString().split('T')[0], type: 'article' },
            { id: 2, title: 'Literature Review and Synthesis', url: 'https://example.com/research-2', publishedDate: new Date().toISOString().split('T')[0], type: 'paper' },
            { id: 3, title: 'Industry Trends Report', url: 'https://example.com/report-1', publishedDate: new Date().toISOString().split('T')[0], type: 'report' },
            { id: 4, title: 'Expert Analysis and Perspectives', url: 'https://example.com/analysis-1', publishedDate: new Date().toISOString().split('T')[0], type: 'article' },
            { id: 5, title: 'Challenges and Solutions Overview', url: 'https://example.com/research-3', publishedDate: new Date().toISOString().split('T')[0], type: 'report' },
            { id: 6, title: 'Opportunities Assessment', url: 'https://example.com/assessment-1', publishedDate: new Date().toISOString().split('T')[0], type: 'report' },
            { id: 7, title: 'Recommendations and Best Practices', url: 'https://example.com/best-practices', publishedDate: new Date().toISOString().split('T')[0], type: 'article' },
            { id: 8, title: 'Future Outlook and Projections', url: 'https://example.com/outlook', publishedDate: new Date().toISOString().split('T')[0], type: 'report' }
        ],
        generatedAt: new Date(),
        researchDuration: Math.floor(Math.random() * 30) + 30 // Random duration between 30-60 seconds
    };
}

/**
 * Find the best matching sample report for a given question
 */
export function findMatchingReport(question: string): ResearchReport {
    const lowerQuestion = question.toLowerCase();

    for (const [keywords, report] of sampleReports) {
        if (keywords.split(' ').every(keyword => lowerQuestion.includes(keyword))) {
            return { ...report, question, generatedAt: new Date() };
        }
    }

    // Generate dynamic content based on the actual question
    return generateDynamicReport(question);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

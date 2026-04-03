import Layout from "@/components/Layout";

const About = () => (
  <Layout>
    <div className="max-w-xl mx-auto px-6 py-16 animate-fade-in">
      <h1 className="font-mono text-2xl font-bold mb-8">about</h1>
      <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
        <p>
          When you've been staring at code, spreadsheets, or essays for hours, your prefrontal cortex — the part of your brain responsible for focus, decision-making, and complex thought — gets fatigued. The instinct is to grab your phone and scroll. But passive consumption doesn't restore cognitive function. It just burns time.
        </p>
        <p>
          Lucid takes a different approach. Each micro-activity is designed to engage completely different cognitive resources than typical screen work: spatial reasoning, rhythm processing, motor coordination, visual tracking. By briefly activating these alternate pathways, you give your analytical brain a genuine rest — and come back sharper.
        </p>
        <p>
          Built for the moments when your brain needs a reset, not a distraction.
        </p>
      </div>
      <p className="font-mono text-xs text-muted-foreground mt-12">2 minutes. that's all it takes.</p>
    </div>
  </Layout>
);

export default About;

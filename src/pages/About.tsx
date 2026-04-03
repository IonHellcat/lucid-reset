import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

const About = () => (
  <Layout>
    <div className="max-w-xl mx-auto px-6 py-16 animate-fade-in">
      <h1 className="font-display text-2xl font-bold mb-8">about defog</h1>

      <div className="space-y-6 font-body text-muted-foreground leading-relaxed mb-12">
        <p>
          When you've been staring at code, spreadsheets, or essays for hours, your prefrontal cortex — the part of your brain responsible for focus, decision-making, and complex thought — gets fatigued. The instinct is to grab your phone and scroll. But passive consumption doesn't restore cognitive function. It just burns time.
        </p>
        <p>
          Defog takes a different approach. Each micro-activity is designed to engage completely different cognitive resources than typical screen work: spatial reasoning, rhythm processing, motor coordination, visual tracking. By briefly activating these alternate pathways, you give your analytical brain a genuine rest — and come back sharper.
        </p>
        <p>
          Built for the moments when your brain needs a reset, not a distraction.
        </p>
      </div>

      <h2 className="font-display text-lg font-bold mb-6">how it works</h2>
      <div className="space-y-6 mb-12">
        {[
          { step: "1", title: "Hit a wall", desc: "When brain fog strikes and you reach for your phone" },
          { step: "2", title: "Pick an activity", desc: "2 minutes of spatial, rhythmic, or visual engagement" },
          { step: "3", title: "Return sharper", desc: "Your analytical brain gets a genuine micro-rest" },
        ].map((s) => (
          <div key={s.step} className="flex gap-4 items-start">
            <span className="font-mono text-2xl font-bold text-primary">{s.step}</span>
            <div>
              <p className="font-display text-sm font-semibold">{s.title}</p>
              <p className="font-body text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg font-bold mb-4">the science</h2>
      <p className="font-body text-sm text-muted-foreground leading-relaxed mb-12">
        Research published in <em>PLOS ONE</em> found that micro-breaks significantly boost vigor and reduce fatigue. The key insight: switching to a qualitatively different cognitive task restores attention more effectively than passive rest or scrolling.
      </p>

      <Link
        to="/"
        className="font-display text-sm text-primary transition-opacity duration-300 hover:opacity-70"
      >
        Ready to try it? →
      </Link>

      <p className="font-display text-xs text-muted-foreground mt-12">2 minutes. that's all it takes.</p>
    </div>
  </Layout>
);

export default About;

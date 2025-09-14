import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight">
                  Track and Improve Your Skills with{" "}
                  <span className="text-primary">RankStage</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Join domain-specific communities, take quizzes, and get
                  evaluated by experts to track your progress and improve your
                  skills.
                </p>
                <div className="flex gap-4">
                  <Link href="/auth/signup">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/domains">
                    <Button variant="outline" size="lg">
                      Explore Domains
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-[500px]">
                <Image
                  src="/illustration.svg"
                  alt="RankStage Platform"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 bg-background rounded-lg shadow-sm"
                >
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © {new Date().getFullYear()} RankStage. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Domain Expertise",
    description:
      "Join specialized domains and get evaluated by expert moderators in your field of interest.",
    icon: GlobeIcon,
  },
  {
    title: "Interactive Quizzes",
    description:
      "Test your knowledge with various quiz formats including MCQs, coding challenges, and more.",
    icon: QuizIcon,
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your improvement over time with detailed analytics and performance metrics.",
    icon: ChartIcon,
  },
];

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function QuizIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11h4" />
      <path d="M9 15h4" />
      <path d="M9 7h4" />
      <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

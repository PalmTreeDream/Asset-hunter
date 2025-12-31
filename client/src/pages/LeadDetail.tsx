import { useEffect } from "react";
import { useRoute } from "wouter";
import { useLead, useUpdateLead, useAnalyzeLead } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Globe, 
  Calendar, 
  Sparkles, 
  Bot, 
  Building2,
  Mail,
  Phone,
  Linkedin,
  Clock
} from "lucide-react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { motion } from "framer-motion";

export default function LeadDetail() {
  const [, params] = useRoute("/leads/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: lead, isLoading } = useLead(id);
  const { mutate: updateLead } = useUpdateLead();
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeLead();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lead) return <div>Lead not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Back Link */}
      <Link href="/">
        <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </a>
      </Link>

      {/* Header Card */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-6 lg:p-8 relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="flex flex-col lg:flex-row justify-between gap-6 relative">
          <div className="flex gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-gray-100 border border-border shadow-sm flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-primary font-display">
                {lead.company.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">{lead.company}</h1>
              <div className="flex flex-wrap items-center gap-3">
                {lead.website && (
                  <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors bg-secondary/50 px-2 py-1 rounded-md">
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    {lead.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="flex items-center text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Added {lead.createdAt && format(new Date(lead.createdAt), "MMM d, yyyy")}
                </span>
                <span className="flex items-center text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md capitalize">
                  <Building2 className="w-3.5 h-3.5 mr-1.5" />
                  Source: {lead.source}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[200px]">
            <Select 
              defaultValue={lead.status} 
              onValueChange={(val) => updateLead({ id, status: val })}
            >
              <SelectTrigger className="w-full bg-background border-border/60 rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Lead</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="disqualified">Disqualified</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="lg"
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-accent/20 border-0"
              onClick={() => analyze(id)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full"/>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 fill-white/20" />
                  Deep Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info & Contact */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-6">
            <h3 className="font-display font-bold text-lg mb-4">About</h3>
            <p className="text-muted-foreground leading-relaxed">
              {lead.description || "No description provided yet."}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-6">
            <h3 className="font-display font-bold text-lg mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm p-2 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground">contact@{lead.company.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-2 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground">+1 (555) 000-0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-2 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground">/company/{lead.company.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Algorithm Insights */}
        <div className="lg:col-span-2">
          <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent" />
            AssetHunter Intelligence
          </h3>
          
          <div className="space-y-4">
            {lead.insights && lead.insights.length > 0 ? (
              lead.insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border/60 shadow-sm p-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
                  
                  <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20">
                        Algorithm Generated
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(insight.createdAt || new Date()), "MMM d, h:mm a")}
                      </span>
                    </div>
                    {insight.score !== null && (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Lead Score</span>
                        <span className="text-2xl font-bold font-display text-primary">{insight.score}/100</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-muted-foreground prose-li:text-muted-foreground">
                    <ReactMarkdown>{insight.content}</ReactMarkdown>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-secondary/30 rounded-2xl border-2 border-dashed border-border p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-secondary mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="font-display font-bold text-lg text-foreground">No insights yet</h4>
                <p className="text-muted-foreground max-w-xs mt-2 mb-6">
                  Click "Deep Analysis" to generate insights, lead scoring, and talking points.
                </p>
                <Button variant="outline" onClick={() => analyze(id)} disabled={isAnalyzing}>
                  Generate First Insight
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

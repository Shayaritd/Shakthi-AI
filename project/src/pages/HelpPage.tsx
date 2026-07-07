import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  BookOpen,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createSafetyReport } from '@/services/api';

const faqs = [
  {
    question: 'How do I find a mentor?',
    answer: 'Go to the Find Mentors section, browse verified mentors by sport or location, and click Request Mentorship. For athletes under 18, guardian approval is required.',
  },
  {
    question: 'Is SHAKTHI free?',
    answer: 'Yes! SHAKTHI is completely free for athletes. Mentors can also join for free. We believe every talented athlete deserves access to guidance.',
  },
  {
    question: 'How are mentors verified?',
    answer: 'Every mentor undergoes ID verification, qualification checks, experience validation, and signs a strict code of conduct before being approved.',
  },
  {
    question: 'Can my parent see my messages?',
    answer: 'Yes, for athletes under 18, guardians can view chat conversations with mentors. This ensures transparency and safety.',
  },
  {
    question: 'How do scholarships work?',
    answer: 'Browse scholarships, check eligibility, and apply directly through the scholarship portal or our provided links. Many are women-focused.',
  },
  {
    question: 'What if I face any issues?',
    answer: 'You can report any concern through the Safety Center. Reports are handled within 24 hours, and you can report anonymously.',
  },
];

export default function HelpPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [supportTicketId, setSupportTicketId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const ticket = await createSafetyReport({
        reporterId: user?.id || '00000000-0000-0000-0000-000000000000',
        category: 'OTHER',
        severity: 'NORMAL',
        description: `[SUPPORT TICKET] Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
        anonymous: !user,
      });
      
      setSupportTicketId(ticket.ticket_id);
      toast.success('Your support message has been sent successfully!');
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit support ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-500">Find answers or reach out to us</p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Shield className="w-10 h-10 text-teal-600 mb-3" />
            <h3 className="font-medium">Safety Center</h3>
            <p className="text-sm text-gray-500 mt-1">Report issues & stay safe</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/safety">Visit</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <BookOpen className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="font-medium">Training</h3>
            <p className="text-sm text-gray-500 mt-1">Learn from resources</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/training">Visit</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <MessageSquare className="w-10 h-10 text-rose-600 mb-3" />
            <h3 className="font-medium">Contact Us</h3>
            <p className="text-sm text-gray-500 mt-1">Get direct support</p>
            <Button variant="outline" className="mt-4">Contact</Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>We typically respond within 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Message Sent!</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Thank you for contacting us. Our support team will get back to you at <strong>{email}</strong> within 24 hours.
              </p>
              {supportTicketId && (
                <div className="p-3 bg-gray-50 rounded border text-sm max-w-xs mx-auto">
                  <span className="text-gray-500 block">Ticket ID:</span>
                  <Link to={`/safety/report/${supportTicketId}`} className="font-bold text-teal-700 hover:text-teal-900 underline text-base block mt-0.5">
                    {supportTicketId}
                  </Link>
                  <span className="text-[10px] text-gray-400 block mt-1">Click to track investigation</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What can we help with?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-gray-900 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Need immediate help?</h3>
              <p className="text-gray-400">Our safety team is available 24/7</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Mail className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm">safety@shakthi.org</p>
              </div>
              <div className="text-center">
                <Phone className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm">1800-XXX-XXXX</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
